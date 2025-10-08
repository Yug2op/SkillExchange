import express from 'express';
import {
  getChats,
  getChatById,
  createOrGetChat,
  sendMessage,
  getUnreadCount,
  markMessagesAsRead,
  deleteChat,
  searchChats
} from '../controllers/chatController.js';
import { protect } from '../middlewares/auth.js';
import { chatLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// @route   GET /api/chat
// @desc    Get user's chats with pagination
router.get('/', getChats);

// @route   GET /api/chat/search
// @desc    Search chats by participant name
router.get('/search', searchChats);

// @route   GET /api/chat/unread/count
// @desc    Get unread message count per chat
router.get('/unread/count', getUnreadCount);

// @route   GET /api/chat/:id
// @desc    Get chat by ID
router.get('/:id', getChatById);

// @route   POST /api/chat/create
// @desc    Create or get existing chat between two users
router.post('/create', createOrGetChat);

// @route   POST /api/chat/:id/message
// @desc    Send message (HTTP fallback)
// @note    Rate limited to prevent spam
router.post('/:id/message', chatLimiter, sendMessage);

// @route   PUT /api/chat/:id/read
// @desc    Mark messages as read
router.put('/:id/read', markMessagesAsRead);

// @route   DELETE /api/chat/:id
// @desc    Delete chat (soft delete)
router.delete('/:id', deleteChat);

export default router;