import express from 'express'
import cors from 'express'
import { connectDB } from './db/db.js'

const app = express()
app.use(cors())
app.use(express.json())
connectDB()

export default app