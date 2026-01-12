/**
 * Custom Error Classes for CareFreelancer
 * These extend the built-in Error class to provide categorized errors
 * that can be handled differently by the error middleware.
 */

// Base class for application errors
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 - Bad Request (validation errors, missing fields)
class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}

// 401 - Unauthorized (not logged in)
class UnauthorizedError extends AppError {
  constructor(message = 'Please log in to access this resource') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

// 403 - Forbidden (logged in but not allowed)
class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

// 404 - Not Found
class NotFoundError extends AppError {
  constructor(message = 'The requested resource was not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

// 409 - Conflict (duplicate entries)
class ConflictError extends AppError {
  constructor(message = 'This resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

// 422 - Unprocessable Entity (validation failed)
class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 422);
    this.name = 'ValidationError';
    this.errors = errors; // Array of { field, message } objects
  }
}

// 429 - Too Many Requests
class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

// 503 - Service Unavailable (database down, email service down)
class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable. Please try again later.') {
    super(message, 503);
    this.name = 'ServiceUnavailableError';
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  ServiceUnavailableError
};
