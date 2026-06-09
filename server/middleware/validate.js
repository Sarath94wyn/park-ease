const { body, validationResult } = require('express-validator');

/**
 * Validation chain for booking creation.
 * Validates slotNumber, vehicleNumber (Indian format), startTime, and endTime.
 */
const validateBooking = [
  body('slotNumber')
    .notEmpty()
    .withMessage('Slot number is required')
    .trim(),

  body('vehicleNumber')
    .notEmpty()
    .withMessage('Vehicle number is required')
    .matches(/^[A-Z]{2}[\s-]*[0-9]{1,2}[\s-]*[A-Z]{1,2}[\s-]*[0-9]{1,4}$/i)
    .withMessage(
      'Vehicle number must be in Indian format (e.g. KL01AB1234)'
    ),

  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 date'),

  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
];

/**
 * Validation chain for review creation.
 */
const validateReview = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),

  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
];

/**
 * Middleware that checks for express-validator errors and returns
 * a 400 response with a structured errors array if validation failed.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validateBooking,
  validateReview,
  handleValidationErrors,
};
