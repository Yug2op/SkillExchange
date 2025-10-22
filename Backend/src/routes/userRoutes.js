import express from 'express';
import {
  getUserProfile,
  updateProfile,
  uploadProfilePicture,
  searchUsers,
  getMatches,
  deleteAccount,
  getPopularSkills
} from '../controllers/userController.js';
import {
  updateProfileValidation,
  searchValidation
} from '../validators/userValidator.js';
import validate from '../middlewares/validation.js';
import { protect } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import { uploadLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.get('/search', searchValidation, validate, searchUsers);
router.get('/popular-skills', getPopularSkills);
router.get('/matches', protect, getMatches);
router.get('/:id', getUserProfile);
router.put('/:id', protect, updateProfileValidation, validate, updateProfile);
router.post(
  '/:id/profile-pic',
  protect,
  uploadLimiter,
  upload.single('profilePic'),
  uploadProfilePicture
);
router.delete('/:id', protect, deleteAccount);

export default router;