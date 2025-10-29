require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import database connection
const { testConnection } = require('./config/database');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import routes
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const userRoutes = require('./routes/users');
const positionRoutes = require('./routes/positions');
const dashboardRoutes = require('./routes/dashboard');
const projectRoutes = require('./routes/projects');
const projectDetailRoutes = require('./routes/project-detail');
const calendarRoutes = require('./routes/calendar');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200, 
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Apply rate limiting to all requests
app.use(limiter);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AAI Inventory Tracking Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/project-detail', projectDetailRoutes);
app.use('/api/calendar', calendarRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AAI Inventory Tracking System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      inventory: '/api/inventory',
      users: '/api/users',
      positions: '/api/positions'
    }
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize database connection
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`\tInventory Tracking System Server`);
      console.log(`==================================================`);
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Server: http://localhost:${PORT}`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
      console.log(`==================================================`);
      console.log(`READING LOGS...`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;