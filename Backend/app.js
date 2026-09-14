import express from 'express'
import cors from 'cors'
import { connectDB } from './db/db.js'
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'
import jobRouter from './routes/jobRoutes.js'
import applicationRouter from './routes/applicationRoutes.js'
import adminRouter from './routes/adminRoutes.js'

const app = express()

// CLIENT_URL may hold a comma separated list of allowed origins;
// with none configured we fall back to an open CORS policy for local dev.
const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',').map(o => o.trim()).filter(Boolean)

app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
}))
app.use(express.json())

app.get('/', (req, res) => res.json({ name: 'CampusHire API', status: 'ok' }))
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }))

app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/jobs', jobRouter)
app.use('/api/applications', applicationRouter)
app.use('/api/admin', adminRouter)

app.use((req, res) => res.status(404).json({ message: 'Route not found' }))

// central error handler — last resort so no request ever hangs
app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

connectDB()

export default app;
