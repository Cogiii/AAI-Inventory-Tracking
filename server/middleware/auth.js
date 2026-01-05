const jwt = require('jsonwebtoken');
const UserService = require('../services/UserService');
const { pool } = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user with position permissions from database
    const [users] = await pool.execute(`
      SELECT u.*, p.name as position_name, p.permissions
      FROM user u
      LEFT JOIN \`position\` p ON u.position_id = p.id
      WHERE u.id = ? AND u.is_active = TRUE
    `, [decoded.id]);

    if (!users.length) {
      return res.status(401).json({
        success: false,
        error: 'Token is not valid - user not found or inactive.'
      });
    }

    const user = users[0];

    // Parse JSON permissions (handle both string and object)
    let permissions = { projects: [], inventory: [], users: [] };
    if (user.permissions) {
      if (typeof user.permissions === 'string') {
        try {
          permissions = JSON.parse(user.permissions);
        } catch (e) {
          console.error('Failed to parse permissions JSON:', e);
        }
      } else {
        permissions = user.permissions;
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: `${user.first_name} ${user.last_name}`,
      first_name: user.first_name,
      last_name: user.last_name,
      firstName: user.first_name,
      lastName: user.last_name,
      positionId: user.position_id,
      positionName: user.position_name,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      permissions: permissions
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired. Please login again.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format.'
      });
    }

    res.status(401).json({
      success: false,
      error: 'Token is not valid.'
    });
  }
};

/**
 * Permission-based access control middleware
 * @param {string} module - The module to check (projects, inventory, users)
 * @param {string} action - The action to check (view, add, edit, delete)
 * @returns {Function} Express middleware
 *
 * Usage: requirePermission('inventory', 'edit')
 */
const requirePermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Please authenticate first.'
      });
    }

    const permissions = req.user.permissions || {};
    const modulePermissions = permissions[module] || [];

    if (!modulePermissions.includes(action)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.',
        required: { module, action }
      });
    }

    next();
  };
};

/**
 * Check if user has a specific permission
 * Helper function for inline permission checks in routes
 * @param {Object} user - The user object with permissions
 * @param {string} module - The module to check
 * @param {string} action - The action to check
 * @returns {boolean}
 */
const hasPermission = (user, module, action) => {
  if (!user || !user.permissions) return false;
  const modulePermissions = user.permissions[module] || [];
  return modulePermissions.includes(action);
};

// Legacy role-based access for backward compatibility
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Please authenticate first.'
      });
    }

    // Map old roles to new position names for compatibility
    const roleMapping = {
      'admin': 'Administrator',
      'manager': 'Marketing Manager',
      'staff': 'Staff Member'
    };

    const allowedPositions = roles.map(role => roleMapping[role] || role);

    if (!allowedPositions.includes(req.user.positionName)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.',
        requiredRole: roles,
        userPosition: req.user.positionName
      });
    }

    next();
  };
};

module.exports = { auth, authorize, requirePermission, hasPermission };
