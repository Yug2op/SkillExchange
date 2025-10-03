import express from 'express';
import {
  createExchangeRequest,
  getMyExchanges,
  getExchangeById,
  acceptExchange,
  rejectExchange,
  cancelExchange,
  scheduleSession,
  completeExchange
} from '../controllers/exchangeController.js';
import {
  createExchangeValidation,
  scheduleSessionValidation
} from '../validators/exchangeValidator.js';
import validate from '../middlewares/validation.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/request', protect, createExchangeValidation, validate, createExchangeRequest);
router.get('/my', protect, getMyExchanges);
router.get('/:id', protect, getExchangeById);
router.put('/:id/accept', protect, acceptExchange);
router.put('/:id/reject', protect, rejectExchange);
router.put('/:id/cancel', protect, cancelExchange);
router.post('/:id/schedule', protect, scheduleSessionValidation, validate, scheduleSession);
router.put('/:id/complete', protect, completeExchange);

export default router;