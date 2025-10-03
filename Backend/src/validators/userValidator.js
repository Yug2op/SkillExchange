import { body, query } from 'express-validator';

export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  
  body('skillsToTeach')
    .optional()
    .isArray().withMessage('Skills to teach must be an array'),
  
  body('skillsToLearn')
    .optional()
    .isArray().withMessage('Skills to learn must be an array'),
  
  body('location.city')
    .optional()
    .trim(),
  
  body('location.country')
    .optional()
    .trim()
];

export const searchValidation = [
  query('teach')
    .optional()
    .trim(),
  
  query('learn')
    .optional()
    .trim(),
  
  query('location')
    .optional()
    .trim(),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
];