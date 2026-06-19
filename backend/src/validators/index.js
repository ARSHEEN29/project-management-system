import { body } from 'express-validator';

// User Registration Validation rules
export const registerValidator = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full Name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full Name must be between 2 and 100 characters.'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
    .withMessage('Password must contain at least one letter, one number, and one special character.'),
];

// User Login Validation rules
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Must be a valid email address.')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

// Project CRUD Validation rules
export const projectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project Name is required.')
    .isLength({ max: 200 })
    .withMessage('Project Name cannot exceed 200 characters.'),
  
  body('description')
    .optional({ nullable: true })
    .trim(),

  body('status')
    .optional()
    .isIn(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Status must be either NOT_STARTED, IN_PROGRESS, or COMPLETED.'),

  body('startDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Start Date must be a valid date format (YYYY-MM-DD).')
    .toDate(),

  body('endDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('End Date must be a valid date format (YYYY-MM-DD).')
    .toDate()
    .custom((value, { req }) => {
      if (value && req.body.startDate) {
        const start = new Date(req.body.startDate);
        const end = new Date(value);
        if (end < start) {
          throw new Error('End date must be after or equal to the start date.');
        }
      }
      return true;
    }),
];

// Task CRUD Validation rules
export const taskValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Task Name is required.')
    .isLength({ max: 200 })
    .withMessage('Task Name cannot exceed 200 characters.'),
  
  body('description')
    .optional({ nullable: true })
    .trim(),

  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Priority must be either LOW, MEDIUM, or HIGH.'),

  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Status must be either PENDING, IN_PROGRESS, or COMPLETED.'),

  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Due Date must be a valid date format (YYYY-MM-DD).')
    .toDate(),

  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required.')
    .isInt()
    .withMessage('Project ID must be an integer.')
    .toInt(),
];
