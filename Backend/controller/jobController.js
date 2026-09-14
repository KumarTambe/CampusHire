import Job from '../models/Job.js'
import Application from '../models/Application.js'
import { checkEligibility, isDeadlinePassed } from '../utils/eligibility.js'

const JOB_FIELDS = ['title', 'description', 'requiredSkills', 'applicationDeadline', 'eligibility', 'location', 'jobType', 'salary']

function pickJobFields(body) {
    const data = {}
    for (const key of JOB_FIELDS) {
        if (body[key] !== undefined) data[key] = body[key]
    }
    if (typeof data.requiredSkills === 'string') {
        data.requiredSkills = data.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
    }
    if (data.eligibility && typeof data.eligibility.allowedBranches === 'string') {
        data.eligibility.allowedBranches = data.eligibility.allowedBranches
            .split(',').map(s => s.trim()).filter(Boolean)
    }
    return data
}

export async function createJob(req, res) {
    try {
        // a recruiter must be verified by an admin before they can post
        if (req.user.role === 'recruiter' && req.user.verificationStatus !== 'verified') {
            return res.status(403).json({
                message: 'Your recruiter account is awaiting admin verification'
            })
        }

        const data = pickJobFields(req.body)
        if (!data.title || !data.description) {
            return res.status(400).json({ message: 'Title and description are required' })
        }

        const job = await Job.create({ ...data, postedBy: req.user._id, status: 'draft' })
        res.status(201).json(job)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

/**
 * Public job board.
 * For a logged-in student we decorate every job with isEligible / alreadyApplied
 * so the client never has to run the eligibility rules itself.
 */
export async function getJobs(req, res) {
    try {
        const { search, skill } = req.query
        const filter = { status: 'published' }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ]
        }
        if (skill) filter.requiredSkills = { $regex: skill, $options: 'i' }

        const jobs = await Job.find(filter)
            .populate('postedBy', 'firstName lastName companyName companyWebsite')
            .sort({ createdAt: -1 })
            .lean()

        if (!req.user || req.user.role !== 'student') {
            return res.status(200).json(jobs)
        }

        // one query for all of this student's applications instead of one per job
        const applications = await Application.find({ student: req.user._id }).select('job status').lean()
        const appliedMap = new Map(applications.map(a => [a.job.toString(), a.status]))

        const decorated = jobs.map(job => {
            const { isEligible, reasons } = checkEligibility(req.user, job)
            const appliedStatus = appliedMap.get(job._id.toString())
            return {
                ...job,
                isEligible,
                ineligibilityReasons: reasons,
                alreadyApplied: Boolean(appliedStatus),
                applicationStatus: appliedStatus || null,
                deadlinePassed: isDeadlinePassed(job),
            }
        })
        res.status(200).json(decorated)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function getMyJobs(req, res) {
    try {
        const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 }).lean()

        // applicant counts in a single aggregation
        const counts = await Application.aggregate([
            { $match: { job: { $in: jobs.map(j => j._id) } } },
            { $group: { _id: '$job', total: { $sum: 1 } } },
        ])
        const countMap = new Map(counts.map(c => [c._id.toString(), c.total]))

        res.status(200).json(jobs.map(j => ({ ...j, applicantCount: countMap.get(j._id.toString()) || 0 })))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function getJobById(req, res) {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'firstName lastName companyName companyWebsite companyDescription')
            .lean()
        if (!job) return res.status(404).json({ message: 'Job not found' })

        // drafts and closed jobs are only visible to their owner and to admins
        const isOwner = req.user && job.postedBy?._id?.toString() === req.user._id.toString()
        if (job.status !== 'published' && !isOwner && req.user?.role !== 'admin') {
            return res.status(404).json({ message: 'Job not found' })
        }

        let extra = {}
        if (req.user?.role === 'student') {
            const { isEligible, reasons } = checkEligibility(req.user, job)
            const application = await Application.findOne({ student: req.user._id, job: job._id }).lean()
            extra = {
                isEligible,
                ineligibilityReasons: reasons,
                alreadyApplied: Boolean(application),
                applicationStatus: application?.status || null,
                deadlinePassed: isDeadlinePassed(job),
            }
        }
        res.status(200).json({ ...job, ...extra })
    } catch (err) {
        res.status(400).json({ message: 'Invalid job id' })
    }
}

export async function updateJob(req, res) {
    try {
        const data = pickJobFields(req.body)
        const job = await Job.findByIdAndUpdate(req.job._id, data, { new: true, runValidators: true })
        res.status(200).json(job)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

export async function publishJob(req, res) {
    try {
        if (req.job.status === 'closed') {
            return res.status(409).json({ message: 'A closed job cannot be published again' })
        }
        req.job.status = 'published'
        await req.job.save()
        res.status(200).json(req.job)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

export async function closeJob(req, res) {
    try {
        req.job.status = 'closed'
        await req.job.save()
        res.status(200).json(req.job)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

export async function deleteJob(req, res) {
    try {
        await Application.deleteMany({ job: req.job._id })
        await req.job.deleteOne()
        res.status(200).json({ message: 'Job deleted' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}
