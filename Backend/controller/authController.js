import User from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const signToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

export async function register(req, res) {
    try {
        const { firstName, lastName, email, password, role, ...rest } = req.body

        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({ message: 'All required fields must be filled' })
        }
        if (!['student', 'recruiter'].includes(role)) {
            return res.status(403).json({ message: 'Admin accounts cannot be self-registered' })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' })
        }

        const existing = await User.findOne({ email: email.toLowerCase() })
        if (existing) return res.status(409).json({ message: 'An account with this email already exists' })

        // only keep the profile fields that belong to the chosen role
        const roleFields = role === 'student'
            ? (({ cgpa, branch, graduationYear, skills, college, resumeUrl }) =>
                ({ cgpa, branch, graduationYear, skills, college, resumeUrl }))(rest)
            : (({ companyName, companyWebsite, companyDescription }) =>
                ({ companyName, companyWebsite, companyDescription }))(rest)

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            firstName, lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            ...roleFields
        })

        res.status(201).json({ token: signToken(user), role: user.role, user })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        const user = await User.findOne({ email: email.toLowerCase() })
        // same generic message for unknown email and wrong password
        if (!user) return res.status(401).json({ message: 'Invalid email or password' })
        if (!user.isActive) return res.status(403).json({ message: 'This account has been deactivated' })

        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.status(401).json({ message: 'Invalid email or password' })

        res.status(200).json({ token: signToken(user), role: user.role, user })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function me(req, res) {
    res.status(200).json({ user: req.user })
}
