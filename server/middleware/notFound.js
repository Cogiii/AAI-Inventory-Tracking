const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: error.message,
    availableRoutes: {
      health: 'GET /api/health',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout'
      },
      inventory: {
        getAll: 'GET /api/inventory',
        create: 'POST /api/inventory',
        getById: 'GET /api/inventory/:id',
        update: 'PUT /api/inventory/:id',
        delete: 'DELETE /api/inventory/:id'
      },
      users: {
        getAll: 'GET /api/users',
        getById: 'GET /api/users/:id',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id'
      }
    }
  });
};

module.exports = notFound;