import express from 'express'
import {
    getStats, getUsers, deactivateUser, activateUser,
    getPendingRecruiters, verifyRecruiter, rejectRecruiter,
    getAllJobs, getAllApplications
} from '../controller/adminController.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()
router.use(authenticate, authorize('admin'))

router.get('/stats', getStats)
router.get('/users', getUsers)
router.put('/users/:id/deactivate', deactivateUser)
router.put('/users/:id/activate', activateUser)
router.get('/recruiters/pending', getPendingRecruiters)
router.put('/recruiters/:id/verify', verifyRecruiter)
router.put('/recruiters/:id/reject', rejectRecruiter)
router.get('/jobs', getAllJobs)
router.get('/applications', getAllApplications)

export default router
