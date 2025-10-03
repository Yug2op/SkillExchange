import express from 'express';
import {
  getChats,
  getChatById,
  sendMessage,
  getUnreadCount,
  deleteChat
} from '../controllers/chatController.js';
import { protect } from '../middlewares/auth.js';
import { chatLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();
router.use(protect);

router.get('/', getChats);
router.get('/unread/count',getUnreadCount);
router.get('/:id', getChatById);
router.post('/:id/message',chatLimiter, sendMessage);
router.delete('/:id', deleteChat);

export default router;