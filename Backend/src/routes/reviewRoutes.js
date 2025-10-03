import express from 'express';
import {
  createReview,
  getUserReviews,
  getMyGivenReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/auth.js';
import { chatLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/', protect, chatLimiter, createReview);
router.get('/my/given', protect, chatLimiter, getMyGivenReviews);
router.get('/:userId', protect, chatLimiter,getUserReviews);
router.put('/:id', protect, chatLimiter, updateReview);
router.delete('/:id', protect, chatLimiter, deleteReview);

export default router;