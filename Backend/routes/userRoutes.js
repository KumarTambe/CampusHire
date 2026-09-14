import express from 'express'
import {
    getProfile, updateProfile, getNotifications,
    markNotificationRead, markAllNotificationsRead
} from '../controller/userController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()
router.use(authenticate)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.get('/notifications', getNotifications)
router.put('/notifications/read-all', markAllNotificationsRead)
router.put('/notifications/:id/read', markNotificationRead)

export default router
