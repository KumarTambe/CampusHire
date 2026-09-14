import express from 'express'
import {
    applyToJob, getMyApplications, getApplicationsForJob,
    updateApplicationStatus, withdrawApplication, getApplicationById
} from '../controller/applicationController.js'
import { authenticate, authorize, ownershipCheck } from '../middleware/authMiddleware.js'

const router = express.Router()
router.use(authenticate)

router.get('/my-applications', authorize('student'), getMyApplications)
router.get('/job/:jobId', authorize('recruiter', 'admin'), ownershipCheck, getApplicationsForJob)
router.get('/:id', getApplicationById)

router.post('/:jobId', authorize('student'), applyToJob)
router.put('/:id/status', authorize('recruiter', 'admin'), updateApplicationStatus)
router.put('/:id/withdraw', authorize('student'), withdrawApplication)

export default router
