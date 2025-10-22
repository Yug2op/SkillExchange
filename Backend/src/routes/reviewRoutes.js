import express from 'express';
import {
  createReview,
  getUserReviews,
  getMyGivenReviews,
  updateReview,
  deleteReview,
  checkReviewExists
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/my/given', protect, getMyGivenReviews);
router.get('/:userId', protect,getUserReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.get('/check/:exchangeId', protect, checkReviewExists);

export default router;