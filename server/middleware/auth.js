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
      SELECT u.*, p.name as position_name, p.can_manage_projects, p.can_edit_project, 
             p.can_add_project, p.can_delete_project, p.can_manage_inventory, 
             p.can_add_inventory, p.can_edit_inventory, p.can_delete_inventory,
             p.can_manage_users, p.can_edit_user, p.can_add_user, p.can_delete_user
      FROM user u 
      LEFT JOIN position p ON u.position_id = p.id 
      WHERE u.id = ? AND u.is_active = TRUE
    `, [decoded.id]);
    
    // console.log('Auth Debug - User query result:', users[0]);
    
    if (!users.length) {
      return res.status(401).json({
        success: false,
        error: 'Token is not valid - user not found or inactive.'
      });
    }

    const user = users[0];
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: `${user.first_name} ${user.last_name}`,
      firstName: user.first_name,
      lastName: user.last_name,
      positionId: user.position_id,
      positionName: user.position_name,
      permissions: {
        canManageProjects: user.can_manage_projects,
        canEditProject: user.can_edit_project,
        canAddProject: user.can_add_project,
        canDeleteProject: user.can_delete_project,
        canManageInventory: user.can_manage_inventory,
        canAddInventory: user.can_add_inventory,
        canEditInventory: user.can_edit_inventory,
        canDeleteInventory: user.can_delete_inventory,
        canManageUsers: user.can_manage_users,
        canEditUser: user.can_edit_user,
        canAddUser: user.can_add_user,
        canDeleteUser: user.can_delete_user
      }
    };
    
    // Debug logging (remove in production)
    console.log('Auth Debug - Final req.user permissions:', req.user.permissions);
    
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

// Permission-based access control
const requirePermission = (permissionName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Please authenticate first.'
      });
    }

    if (!req.user.permissions[permissionName]) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.',
        requiredPermission: permissionName
      });
    }

    next();
  };
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

module.exports = { auth, authorize, requirePermission };