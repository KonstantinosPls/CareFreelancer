/**
 * Centralized Error Handling Middleware
 * Catches all errors and renders appropriate responses
 */

const multer = require('multer');
const { AppError } = require('../utils/errors');

/**
 * Handle Multer file upload errors
 */
const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return { statusCode: 400, message: 'File size must be under 5MB' };
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return { statusCode: 400, message: 'Too many files. Maximum 5 allowed.' };
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return { statusCode: 400, message: 'Unexpected file field' };
  }
  return { statusCode: 400, message: err.message || 'File upload error' };
};

/**
 * Handle Mongoose validation errors
 */
const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map(e => ({
    field: e.path,
    message: e.message
  }));
  return {
    statusCode: 422,
    message: 'Validation failed',
    errors
  };
};

/**
 * Handle MongoDB duplicate key errors
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return {
    statusCode: 409,
    message: `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' is already taken`
  };
};

/**
 * Handle MongoDB CastError (invalid ObjectId)
 */
const handleCastError = (err) => {
  return {
    statusCode: 400,
    message: `Invalid ${err.path}: ${err.value}`
  };
};

/**
 * Main error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.errors || null;

  // Log error (with stack trace in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('─── ERROR ───────────────────────────────');
    console.error(`${err.name}: ${err.message}`);
    console.error(`Route: ${req.method} ${req.originalUrl}`);
    console.error('Stack:', err.stack);
    console.error('─────────────────────────────────────────');
  } else {
    // In production, just log essential info
    console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message} - ${req.method} ${req.originalUrl}`);
  }

  // Handle specific error types
  if (err instanceof multer.MulterError) {
    const handled = handleMulterError(err);
    statusCode = handled.statusCode;
    message = handled.message;
  } else if (err.name === 'ValidationError' && err.errors && !err.isOperational) {
    // Mongoose validation error
    const handled = handleMongooseValidationError(err);
    statusCode = handled.statusCode;
    message = handled.message;
    errors = handled.errors;
  } else if (err.code === 11000) {
    // MongoDB duplicate key
    const handled = handleDuplicateKeyError(err);
    statusCode = handled.statusCode;
    message = handled.message;
  } else if (err.name === 'CastError') {
    // Invalid MongoDB ObjectId
    const handled = handleCastError(err);
    statusCode = handled.statusCode;
    message = handled.message;
  }

  // For non-operational errors in production, hide details
  if (!err.isOperational && process.env.NODE_ENV === 'production') {
    message = 'Something went wrong. Please try again later.';
  }

  // Determine template based on status code
  let template = 'error';
  if (statusCode === 400) template = '400';
  else if (statusCode === 403) template = '403';
  else if (statusCode === 404) template = '404';
  else if (statusCode === 429) template = '429';
  else if (statusCode >= 500) template = '500';

  // Check if the template exists, otherwise use generic error
  const templatePath = `${statusCode >= 500 ? '500' : template}`;

  // Render error page
  res.status(statusCode).render(templatePath, {
    title: `Error ${statusCode} - CareFreelancer`,
    statusCode,
    message,
    errors,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).render('404', {
    title: 'Page Not Found - CareFreelancer',
    message: `The page '${req.originalUrl}' could not be found`
  });
};

/**
 * Async handler wrapper - catches errors in async route handlers
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
