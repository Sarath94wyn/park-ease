const config = require('../config/env');

/**
 * Global error handler middleware.
 * Catches all errors passed via next(error) and returns
 * a structured JSON response with appropriate status codes.
 */
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error (e.g. required field missing)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(', ');
  }

  // Mongoose duplicate key error (e.g. unique email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value for field: ${field}. Please use a different value.`;
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Build error response
  const response = {
    success: false,
    message,
  };

  // Include stack trace in development mode for debugging
  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
  }

  console.error(`❌ Error: ${message}`);
  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
