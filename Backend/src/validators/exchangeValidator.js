import { body } from 'express-validator';

export const createExchangeValidation = [
  body('receiverId')
    .notEmpty().withMessage('Receiver ID is required')
    .isMongoId().withMessage('Invalid receiver ID'),
  
  body('skillOffered')
    .trim()
    .notEmpty().withMessage('Skill offered is required'),
  
  body('skillRequested')
    .trim()
    .notEmpty().withMessage('Skill requested is required'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
];

export const scheduleSessionValidation = [
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),
  
  body('startTime')
    .notEmpty().withMessage('Start time is required'),
  
  body('endTime')
    .notEmpty().withMessage('End time is required'),
  
  body('type')
    .notEmpty().withMessage('Session type is required')
    .isIn(['online', 'offline']).withMessage('Type must be online or offline'),
  
  body('location')
    .if(body('type').equals('offline'))
    .notEmpty().withMessage('Location is required for offline sessions'),
  
  body('meetingLink')
    .if(body('type').equals('online'))
    .notEmpty().withMessage('Meeting link is required for online sessions')
    .isURL().withMessage('Invalid meeting link URL')
];