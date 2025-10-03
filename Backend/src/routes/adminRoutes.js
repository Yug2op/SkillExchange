import express from 'express';
import {
  getAllUsers,
  getDashboardStats,
  deactivateUser,
  activateUser,
  deleteUser,
  createSkill,
  getAllSkills,
  getDactivatedAccount
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/stats', getDashboardStats);
router.put('/users/:id/deactivate', deactivateUser);
router.put('/users/:id/activate', activateUser);
router.delete('/users/:id', deleteUser);
router.post('/skills', createSkill);
router.get('/skills', getAllSkills);
router.get('/get-deactivated', getDactivatedAccount);

export default router;