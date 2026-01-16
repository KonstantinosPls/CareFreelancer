/**
 * Custom Error Class for CareFreelancer
 * Extends the built-in Error class to provide operational errors
 * that can be handled differently by the error middleware.
 */

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };
