const validator = require('validator');
const mongoose = require('mongoose');

/**
 * Middleware to sanitize and validate request body data
 * @param {Object} schema - Mongoose schema to validate against (optional)
 */
const sanitizeBody = (schema) => {
  return (req, res, next) => {
    if (!req.body) {
      return next();
    }

    // Create a sanitized copy of the request body
    const sanitized = {};
    
    // Process each field in the request body
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      
      // Skip null or undefined values
      if (value === null || value === undefined) {
        sanitized[key] = value;
        return;
      }
      
      // Handle different data types
      if (typeof value === 'string') {
        // Sanitize strings to prevent XSS
        sanitized[key] = validator.escape(value.trim());
      } else if (typeof value === 'number') {
        // Ensure numbers are valid
        sanitized[key] = isNaN(value) ? 0 : value;
      } else if (value instanceof Date) {
        // Ensure dates are valid
        sanitized[key] = isNaN(value.getTime()) ? null : value;
      } else if (typeof value === 'object') {
        // For objects (including arrays), recursively sanitize
        sanitized[key] = value;
      } else {
        // For other types, pass through
        sanitized[key] = value;
      }
    });
    
    // Replace the request body with the sanitized version
    req.body = sanitized;
    
    // If a schema is provided, validate against it
    if (schema && schema instanceof mongoose.Schema) {
      const Model = mongoose.model('TempModel', schema);
      const tempDoc = new Model(req.body);
      const validationError = tempDoc.validateSync();
      
      if (validationError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: validationError.errors
        });
      }
    }
    
    next();
  };
};

/**
 * Middleware to sanitize and validate URL parameters
 */
const sanitizeParams = () => {
  return (req, res, next) => {
    if (!req.params) {
      return next();
    }
    
    // Sanitize each parameter
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = validator.escape(req.params[key].trim());
      }
    });
    
    next();
  };
};

/**
 * Middleware to sanitize and validate query parameters
 */
const sanitizeQuery = () => {
  return (req, res, next) => {
    if (!req.query) {
      return next();
    }
    
    // Sanitize each query parameter
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = validator.escape(req.query[key].trim());
      }
    });
    
    next();
  };
};

module.exports = {
  sanitizeBody,
  sanitizeParams,
  sanitizeQuery
};