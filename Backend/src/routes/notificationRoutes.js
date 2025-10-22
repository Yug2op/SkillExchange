import express from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    cleanupOldNotifications
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's notifications
router.get('/', getNotifications);

// Mark specific notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Admin route for manual cleanup
router.delete('/cleanup', cleanupOldNotifications);

export default router;

