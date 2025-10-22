import express from 'express';
import {
  getAllUsers,
  getDashboardStats,
  deactivateUser,
  activateUser,
  deleteUser,
  getDactivatedAccount
} from '../controllers/adminController.js';
import {
  getSkillsForAdmin,      // Admin: Full management
  createSkill,           // Admin: Create skills
  updateSkill,           // Admin: Update skills
  deleteSkill,           // Admin: Delete skills
  approveSkillSuggestion, // Admin: Approve suggestions
  rejectSkillSuggestion,   // Admin: Reject suggestions
  getSkillStats
} from '../controllers/skillController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get('/users', getAllUsers);
router.get('/stats', getDashboardStats);
router.put('/users/:id/deactivate', deactivateUser);
router.put('/users/:id/activate', activateUser);
router.delete('/users/:id', deleteUser);
router.get('/get-deactivated', getDactivatedAccount);

// Skill management routes (moved from skillsRoutes.js)
router.get('/skills', getSkillsForAdmin);
router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);
router.delete('/skills/:id', deleteSkill);
router.post('/skills/:id/approve', approveSkillSuggestion);
router.post('/skills/:id/reject', rejectSkillSuggestion);
router.get('/skills/stats', getSkillStats)

export default router;