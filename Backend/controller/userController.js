import User from '../models/User.js'
import Notification from '../models/Notification.js'

// fields a user is allowed to change on themselves, per role
const EDITABLE = {
    student: ['firstName', 'lastName', 'cgpa', 'branch', 'graduationYear', 'skills', 'college', 'resumeUrl'],
    recruiter: ['firstName', 'lastName', 'companyName', 'companyWebsite', 'companyDescription'],
    admin: ['firstName', 'lastName'],
}

export async function getProfile(req, res) {
    try {
        res.status(200).json(req.user)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function updateProfile(req, res) {
    try {
        const allowed = EDITABLE[req.user.role] || []
        const updates = {}
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key]
        }
        // skills may arrive as a comma separated string from the form
        if (typeof updates.skills === 'string') {
            updates.skills = updates.skills.split(',').map(s => s.trim()).filter(Boolean)
        }

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        })
        res.status(200).json(user)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

export async function getNotifications(req, res) {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(100)
        const unread = notifications.filter(n => !n.read).length
        res.status(200).json({ notifications, unread })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function markNotificationRead(req, res) {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },  // scoped so users cannot touch others' notifications
            { read: true },
            { new: true }
        )
        if (!notification) return res.status(404).json({ message: 'Notification not found' })
        res.status(200).json(notification)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

export async function markAllNotificationsRead(req, res) {
    try {
        await Notification.updateMany({ user: req.user._id, read: false }, { read: true })
        res.status(200).json({ message: 'All notifications marked as read' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
