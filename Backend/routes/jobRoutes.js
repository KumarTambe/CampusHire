import express from 'express'
import {
    createJob, getJobs, getJobById, getMyJobs,
    updateJob, publishJob, closeJob, deleteJob
} from '../controller/jobController.js'
import { authenticate, optionalAuth, authorize, ownershipCheck } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', optionalAuth, getJobs)
// declared before '/:id' so "my-jobs" is not swallowed by the id param
router.get('/my-jobs', authenticate, authorize('recruiter', 'admin'), getMyJobs)
router.get('/:id', optionalAuth, getJobById)

router.post('/', authenticate, authorize('recruiter'), createJob)
router.put('/:id', authenticate, authorize('recruiter', 'admin'), ownershipCheck, updateJob)
router.put('/:id/publish', authenticate, authorize('recruiter', 'admin'), ownershipCheck, publishJob)
router.put('/:id/close', authenticate, authorize('recruiter', 'admin'), ownershipCheck, closeJob)
router.delete('/:id', authenticate, authorize('recruiter', 'admin'), ownershipCheck, deleteJob)

export default router
