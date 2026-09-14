import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Job from '../models/Job.js'

/**
 * Verifies the bearer JWT, loads the full user document onto req.user
 * and blocks deactivated accounts.
 */
export async function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'No token provided' })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)
        if (!user) return res.status(401).json({ message: 'Unauthorized' })
        if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' })
        req.user = user
        next()
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' })
    }
}

/**
 * Optional auth — used on public routes that return extra data
 * (eligibility / alreadyApplied) when a student happens to be logged in.
 */
export async function optionalAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return next()
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)
        if (user && user.isActive) req.user = user
    } catch {
        // an invalid token on a public route is simply ignored
    }
    next()
}

export function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' })
        }
        next()
    }
}

/**
 * Ensures the requesting recruiter actually owns the job being mutated.
 * Job id is read from :id or :jobId. Admins bypass the check.
 * The loaded job is cached on req.job so controllers need not refetch.
 */
export async function ownershipCheck(req, res, next) {
    try {
        const jobId = req.params.id || req.params.jobId
        const job = await Job.findById(jobId)
        if (!job) return res.status(404).json({ message: 'Job not found' })

        if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not own this job posting' })
        }
        req.job = job
        next()
    } catch (err) {
        return res.status(400).json({ message: 'Invalid job id' })
    }
}
