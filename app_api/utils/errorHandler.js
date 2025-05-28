/**
 * Centralized error handling utility
 */

/**
 * Handle errors consistently across the API
 * @param {Error} err - The error object
 * @param {Object} res - Express response object
 * @param {String} source - Source of the error (function name)
 */
const handleError = (err, res, source = 'unknown') => {
  // Log error for debugging
  console.error(`Error in ${source}:`, err);
  
  // Determine status code based on error type
  let statusCode = 500;
  let message = 'Internal server error';
  
  // Handle different error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation error';
    
    // Format validation errors
    const errors = Object.keys(err.errors).map(field => ({
      field,
      message: err.errors[field].message
    }));
    
    return res.status(statusCode).json({
      message,
      errors
    });
  } else if (err.name === 'CastError') {
    // Mongoose cast error (invalid ID)
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    message = 'Duplicate key error';
    
    // Extract duplicate field
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    return res.status(statusCode).json({
      message,
      error: `${field} '${value}' already exists`
    });
  } else if (err.message.includes('not found')) {
    // Not found error
    statusCode = 404;
    message = err.message;
  } else if (err.message === 'Unauthorized') {
    // Unauthorized error
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.message === 'Forbidden') {
    // Forbidden error
    statusCode = 403;
    message = 'Forbidden';
  } else if (err.message === 'Database rate limit exceeded') {
    // Rate limit error
    statusCode = 429;
    message = 'Too many requests, please try again later';
  }
  
  // Send error response
  res.status(statusCode).json({
    message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = {
  handleError
};
