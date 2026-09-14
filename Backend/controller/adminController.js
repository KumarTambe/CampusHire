import User from '../models/User.js'
import Job from '../models/Job.js'
import Application from '../models/Application.js'
import AuditLog from '../models/AuditLog.js'
import Notification from '../models/Notification.js'

export async function getStats(req, res) {
    try {
        const [students, recruiters, pendingRecruiters, jobs, publishedJobs, applications, selected] =
            await Promise.all([
                User.countDocuments({ role: 'student' }),
                User.countDocuments({ role: 'recruiter' }),
                User.countDocuments({ role: 'recruiter', verificationStatus: 'pending' }),
                Job.countDocuments(),
                Job.countDocuments({ status: 'published' }),
                Application.countDocuments(),
                Application.countDocuments({ status: 'selected' }),
            ])

        const byStatus = await Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ])

        res.status(200).json({
            students, recruiters, pendingRecruiters,
            jobs, publishedJobs, applications, selected,
            applicationsByStatus: byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function getUsers(req, res) {
    try {
        const { role, isActive, verificationStatus, search } = req.query
        const filter = {}
        if (role) filter.role = role
        if (isActive !== undefined) filter.isActive = isActive === 'true'
        if (verificationStatus) filter.verificationStatus = verificationStatus
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
            ]
        }
        const users = await User.find(filter).sort({ createdAt: -1 })
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

async function setActive(req, res, isActive) {
    try {
        // guard against an admin locking themselves out
        if (!isActive && req.params.id === req.user._id.toString()) {
            return res.status(409).json({ message: 'You cannot deactivate your own account' })
        }
        const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true })
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.status(200).json(user)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

export const deactivateUser = (req, res) => setActive(req, res, false)
export const activateUser = (req, res) => setActive(req, res, true)

export async function getPendingRecruiters(req, res) {
    try {
        const recruiters = await User.find({ role: 'recruiter', verificationStatus: 'pending' })
            .sort({ createdAt: -1 })
        res.status(200).json(recruiters)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

async function setVerification(req, res, verificationStatus) {
    try {
        const recruiter = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'recruiter' },
            { verificationStatus },
            { new: true }
        )
        if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' })

        await Notification.create({
            user: recruiter._id,
            message: verificationStatus === 'verified'
                ? 'Your recruiter account has been verified. You can now post jobs.'
                : 'Your recruiter account verification was rejected.',
        })
        res.status(200).json(recruiter)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

export const verifyRecruiter = (req, res) => setVerification(req, res, 'verified')
export const rejectRecruiter = (req, res) => setVerification(req, res, 'rejected')

export async function getAllJobs(req, res) {
    try {
        const filter = {}
        if (req.query.status) filter.status = req.query.status
        const jobs = await Job.find(filter)
            .populate('postedBy', 'firstName lastName companyName email')
            .sort({ createdAt: -1 })
            .lean()

        const counts = await Application.aggregate([{ $group: { _id: '$job', total: { $sum: 1 } } }])
        const countMap = new Map(counts.map(c => [c._id.toString(), c.total]))
        res.status(200).json(jobs.map(j => ({ ...j, applicantCount: countMap.get(j._id.toString()) || 0 })))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function getAllApplications(req, res) {
    try {
        const filter = {}
        if (req.query.status) filter.status = req.query.status

        const applications = await Application.find(filter)
            .populate('student', 'firstName lastName email branch cgpa graduationYear')
            .populate({
                path: 'job',
                select: 'title postedBy',
                populate: { path: 'postedBy', select: 'companyName' }
            })
            .sort({ createdAt: -1 })
            .lean()

        const logs = await AuditLog.find({ application: { $in: applications.map(a => a._id) } })
            .populate('changedBy', 'firstName lastName')
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
