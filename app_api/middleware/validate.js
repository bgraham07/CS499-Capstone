/**
 * Validation middleware using Joi
 */
const Joi = require('joi');

/**
 * Create validation middleware for a specific schema
 * @param {Object} schema - Joi schema
 * @param {String} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });
    
    if (!error) {
      next();
    } else {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      res.status(400).json({
        message: 'Validation error',
        errors
      });
    }
  };
};

/**
 * Common validation schemas
 */
const schemas = {
  // User schemas
  userRegister: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(100).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .message('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    phoneNumber: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
    address: Joi.string().max(200).optional()
  }),
  
  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  // Trip schemas
  tripCreate: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    location: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    price: Joi.number().min(0).required(),
    date: Joi.date().iso().min('now').required(),
    duration: Joi.number().integer().min(1).required(),
    maxGroupSize: Joi.number().integer().min(1).required(),
    difficulty: Joi.string().valid('easy', 'medium', 'difficult').required(),
    images: Joi.array().items(Joi.string().uri()).optional()
  }),
  
  tripUpdate: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    location: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(1000).optional(),
    price: Joi.number().min(0).optional(),
    date: Joi.date().iso().min('now').optional(),
    duration: Joi.number().integer().min(1).optional(),
    maxGroupSize: Joi.number().integer().min(1).optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'difficult').optional(),
    images: Joi.array().items(Joi.string().uri()).optional()
  }),
  
  // ID parameter schema
  idParam: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  })
};

module.exports = {
  validate,
  schemas
};