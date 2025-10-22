// Backend/src/routes/skillsRoutes.js
import express from 'express';
import {
  getSkillsForPublic,     // Public: Browse skills (no auth)
  suggestNewSkill,        // Auth required: Suggest skills
  getSkillCategories      // Public: Get categories (no auth)
} from '../controllers/skillController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// === COMPLETELY PUBLIC ROUTES (No auth required) ===
router.get('/public/skills', getSkillsForPublic);
router.get('/public/skills/categories', getSkillCategories);

// === AUTHENTICATED USER ROUTES (Login required, but not admin) ===
router.use('/public/skills/suggest', protect); // Require login for suggestions
router.post('/public/skills/suggest', suggestNewSkill);

export default router;