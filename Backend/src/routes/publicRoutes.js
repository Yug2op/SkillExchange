import express from 'express';
import { getPublicStats } from '../controllers/publicController.js';

const router = express.Router();

// GET /api/public/stats - Get public platform statistics
router.get('/stats', getPublicStats);

export default router;
