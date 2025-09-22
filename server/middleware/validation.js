const Joi = require('joi');

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { 
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        value: detail.context.value
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errorMessages
      });
    }

    next();
  };
};

// Common validation schemas
const schemas = {
  // User validation schemas
  registerUser: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
    role: Joi.string().valid('admin', 'manager', 'user').default('user')
  }),

  loginUser: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  updateUser: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    role: Joi.string().valid('admin', 'manager', 'user')
  }),

  // Inventory validation schemas
  createInventoryItem: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Item name must be at least 2 characters long',
      'string.max': 'Item name cannot exceed 100 characters',
      'any.required': 'Item name is required'
    }),
    description: Joi.string().max(500).allow('').default(''),
    category: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Category must be at least 2 characters long',
      'string.max': 'Category cannot exceed 50 characters',
      'any.required': 'Category is required'
    }),
    quantity: Joi.number().integer().min(0).required().messages({
      'number.min': 'Quantity cannot be negative',
      'number.integer': 'Quantity must be a whole number',
      'any.required': 'Quantity is required'
    }),
    price: Joi.number().min(0).precision(2).required().messages({
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
    sku: Joi.string().alphanum().min(3).max(20).required().messages({
      'string.alphanum': 'SKU must contain only letters and numbers',
      'string.min': 'SKU must be at least 3 characters long',
      'string.max': 'SKU cannot exceed 20 characters',
      'any.required': 'SKU is required'
    }),
    location: Joi.string().max(100).allow('').default(''),
    minStockLevel: Joi.number().integer().min(0).default(0),
    supplier: Joi.string().max(100).allow('').default('')
  }),

  updateInventoryItem: Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string().max(500).allow(''),
    category: Joi.string().min(2).max(50),
    quantity: Joi.number().integer().min(0),
    price: Joi.number().min(0).precision(2),
    sku: Joi.string().alphanum().min(3).max(20),
    location: Joi.string().max(100).allow(''),
    minStockLevel: Joi.number().integer().min(0),
    supplier: Joi.string().max(100).allow('')
  }),

  // Query parameter validation
  paginationQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('name', 'category', 'quantity', 'price', 'createdAt', 'updatedAt').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().max(100).allow(''),
    category: Joi.string().max(50).allow('')
  })
};

module.exports = { validate, schemas };