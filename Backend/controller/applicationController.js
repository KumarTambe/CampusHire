import Application from '../models/Application.js'
import Job from '../models/Job.js'
import Notification from '../models/Notification.js'
import AuditLog from '../models/AuditLog.js'
import { checkEligibility, isDeadlinePassed } from '../utils/eligibility.js'
import { canTransition } from '../utils/statusTransitions.js'

const fullName = (u) => `${u.firstName} ${u.lastName}`

/** POST /api/applications/:jobId — student applies to a job */
export async function applyToJob(req, res) {
    try {
        const job = await Job.findById(req.params.jobId).populate('postedBy', '_id companyName')
        if (!job) return res.status(404).json({ message: 'Job not found' })

        if (job.status !== 'published') {
            return res.status(409).json({ message: 'This job is not accepting applications' })
        }
        if (isDeadlinePassed(job)) {
            return res.status(409).json({ message: 'The application deadline for this job has passed' })
        }

        const { isEligible, reasons } = checkEligibility(req.user, job)
        if (!isEligible) {
            return res.status(403).json({ message: 'You are not eligible for this job', reasons })
        }

        const existing = await Application.findOne({ student: req.user._id, job: job._id })
        if (existing) return res.status(409).json({ message: 'You have already applied to this job' })

        // freeze the student's numbers at the moment of applying, so later
        // profile edits never rewrite the record the recruiter reviewed
        const application = await Application.create({
            student: req.user._id,
            job: job._id,
            status: 'applied',
            eligibilitySnapshot: {
                cgpa: req.user.cgpa,
                branch: req.user.branch,
                graduationYear: req.user.graduationYear,
            }
        })

        await Notification.create({
            user: job.postedBy._id,
            message: `${fullName(req.user)} applied to your job "${job.title}".`,
            application: application._id,
        })

        res.status(201).json(application)
    } catch (err) {
        // the compound unique index is the real guard against double-apply races
        if (err.code === 11000) {
            return res.status(409).json({ message: 'You have already applied to this job' })
        }
        res.status(400).json({ message: err.message })
    }
}

/** GET /api/applications/my-applications */
export async function getMyApplications(req, res) {
    try {
        const applications = await Application.find({ student: req.user._id })
            .populate({
                path: 'job',
                select: 'title description status applicationDeadline location jobType postedBy',
                populate: { path: 'postedBy', select: 'companyName firstName lastName' }
            })
            .sort({ createdAt: -1 })
            .lean()

        // attach the audit trail so the student sees their own status history
        const logs = await AuditLog.find({ application: { $in: applications.map(a => a._id) } })
            .sort({ createdAt: 1 })
            .lean()
        const logMap = new Map()
        for (const log of logs) {
            const key = log.application.toString()
            if (!logMap.has(key)) logMap.set(key, [])
            logMap.get(key).push(log)
        }

        res.status(200).json(applications.map(a => ({ ...a, history: logMap.get(a._id.toString()) || [] })))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

/** GET /api/applications/job/:jobId — recruiter views applicants for their job */
export async function getApplicationsForJob(req, res) {
    try {
        const filter = { job: req.job._id }
        if (req.query.status) filter.status = req.query.status

        const applications = await Application.find(filter)
            .populate('student', 'firstName lastName email cgpa branch graduationYear skills college resumeUrl')
            .sort({ createdAt: -1 })
            .lean()

        res.status(200).json({ job: req.job, applications })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

/**
 * Shared status-change path for PUT /:id/status and PUT /:id/withdraw.
 * Validates the transition, writes an audit log and notifies the other party.
 */
async function changeStatus({ application, newStatus, actor, reason, res }) {
    const oldStatus = application.status

    const check = canTransition(oldStatus, newStatus, actor.role)
    if (!check.ok) return res.status(409).json({ message: check.message })

    application.status = newStatus
    await application.save()

    await AuditLog.create({
        application: application._id,
        changedBy: actor._id,
        changedByRole: actor.role,
        oldStatus,
        newStatus,
        reason,
    })

    const job = application.job
    const jobTitle = job?.title || 'a job'

    if (actor.role === 'student') {
        // student withdrew — tell the recruiter who owns the job
        if (job?.postedBy) {
            await Notification.create({
                user: job.postedBy._id || job.postedBy,
                message: `${fullName(actor)} withdrew their application for "${jobTitle}".`,
                application: application._id,
            })
        }
    } else {
        await Notification.create({
            user: application.student._id || application.student,
            message: `Your application for "${jobTitle}" moved from ${oldStatus} to ${newStatus}.`
                + (reason ? ` Note: ${reason}` : ''),
            application: application._id,
        })
    }

    return res.status(200).json(application)
}

/** PUT /api/applications/:id/status — recruiter moves an application along the pipeline */
export async function updateApplicationStatus(req, res) {
    try {
        const { status, reason } = req.body
        if (!status) return res.status(400).json({ message: 'A target status is required' })

        const application = await Application.findById(req.params.id)
            .populate({ path: 'job', select: 'title postedBy' })
        if (!application) return res.status(404).json({ message: 'Application not found' })

        // a recruiter may only act on applications to their own jobs
        if (req.user.role === 'recruiter'
            && application.job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'This application is not for one of your jobs' })
        }

        return await changeStatus({ application, newStatus: status, actor: req.user, reason, res })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

/** PUT /api/applications/:id/withdraw — student withdraws their own application */
export async function withdrawApplication(req, res) {
    try {
        const application = await Application.findById(req.params.id)
            .populate({ path: 'job', select: 'title postedBy' })
        if (!application) return res.status(404).json({ message: 'Application not found' })

        if (application.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only withdraw your own application' })
        }

        return await changeStatus({
            application,
            newStatus: 'withdrawn',
            actor: req.user,
            reason: req.body?.reason,
            res,
        })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

/** GET /api/applications/:id — detail view with full audit trail */
export async function getApplicationById(req, res) {
    try {
        const application = await Application.findById(req.params.id)
            .populate('student', 'firstName lastName email cgpa branch graduationYear skills resumeUrl')
            .populate({ path: 'job', select: 'title postedBy', populate: { path: 'postedBy', select: 'companyName' } })
            .lean()
        if (!application) return res.status(404).json({ message: 'Application not found' })

        const isOwnerStudent = application.student._id.toString() === req.user._id.toString()
        const isOwnerRecruiter = application.job?.postedBy?._id?.toString() === req.user._id.toString()
        if (!isOwnerStudent && !isOwnerRecruiter && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' })
        }

        const history = await AuditLog.find({ application: application._id })
            .populate('changedBy', 'firstName lastName')
            .sort({ createdAt: 1 })
            .lean()

        res.status(200).json({ ...application, history })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}
