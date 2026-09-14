import User from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function register(req, res) {
    try {
        const { firstName, lastName, email, password, role, ...rest } = req.body
        const existing = await User.findOne({ email })
        if (existing) return res.status(400).json({ message: 'Email already exists' })

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            firstName, lastName, email,
            password: hashedPassword, role, ...rest
        })
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET)
        res.status(201).json({ token, role: user.role })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(404).json({ message: 'User not found' })
        if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' })

        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.status(401).json({ message: 'Invalid credentials' })

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET)
        res.status(200).json({ token, role: user.role })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}