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
    username: Joi.string().required().messages({
      'any.required': 'Username is required'
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

  // Inventory validation schemas (based on database schema)
  createInventoryItem: Joi.object({
    type: Joi.string().valid('product', 'material').required().messages({
      'any.only': 'Type must be either "product" or "material"',
      'any.required': 'Item type is required'
    }),
    brand_id: Joi.number().integer().positive().allow(null).messages({
      'number.positive': 'Brand ID must be a positive number'
    }),
    name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Item name must be at least 2 characters long',
      'string.max': 'Item name cannot exceed 255 characters',
      'any.required': 'Item name is required'
    }),
    description: Joi.string().allow('', null).default(null),
    delivered_quantity: Joi.number().integer().min(0).default(0).messages({
      'number.min': 'Delivered quantity cannot be negative',
      'number.integer': 'Delivered quantity must be a whole number'
    }),
    damaged_quantity: Joi.number().integer().min(0).default(0).messages({
      'number.min': 'Damaged quantity cannot be negative',
      'number.integer': 'Damaged quantity must be a whole number'
    }),
    lost_quantity: Joi.number().integer().min(0).default(0).messages({
      'number.min': 'Lost quantity cannot be negative',
      'number.integer': 'Lost quantity must be a whole number'
    }),
    available_quantity: Joi.number().integer().min(0).default(0).messages({
      'number.min': 'Available quantity cannot be negative',
      'number.integer': 'Available quantity must be a whole number'
    }),
    // Location is required when delivered_quantity > 0
    warehouse_location_id: Joi.number().integer().positive().allow(null)
      .when('delivered_quantity', {
        is: Joi.number().greater(0),
        then: Joi.number().integer().positive().required().messages({
          'any.required': 'Location is required when adding initial quantity',
          'number.positive': 'Warehouse location ID must be a positive number'
        }),
        otherwise: Joi.number().integer().positive().allow(null).messages({
          'number.positive': 'Warehouse location ID must be a positive number'
        })
      }),
    status: Joi.string().valid('in stock', 'out of stock', 'low stock', 'inactive').allow('', null).default(null).messages({
      'any.only': 'Status must be one of: in stock, out of stock, low stock, inactive'
    })
  }),

  updateInventoryItem: Joi.object({
    type: Joi.string().valid('product', 'material'),
    brand_id: Joi.number().integer().positive().allow(null),
    name: Joi.string().min(2).max(255),
    description: Joi.string().allow('', null),
    delivered_quantity: Joi.number().integer().min(0),
    damaged_quantity: Joi.number().integer().min(0),
    lost_quantity: Joi.number().integer().min(0),
    available_quantity: Joi.number().integer().min(0),
    warehouse_location_id: Joi.number().integer().positive().allow(null),
    status: Joi.string().valid('in stock', 'out of stock', 'low stock', 'inactive').allow('', null).messages({
      'any.only': 'Status must be one of: in stock, out of stock, low stock, inactive'
    })
  }),

  // Query parameter validation
  paginationQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('name', 'type', 'available_quantity', 'delivered_quantity', 'created_at', 'updated_at').default('created_at'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().max(100).allow(''),
    type: Joi.string().valid('product', 'material').allow(''),
    brand: Joi.string().max(100).allow(''),
    location: Joi.string().max(100).allow(''),
    status: Joi.string().valid('active', 'low_stock', 'out_of_stock', 'inactive').allow('')
  })
};

module.exports = { validate, schemas };