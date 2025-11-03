const express = require('express');
const { auth, authorize, requirePermission } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { hashPassword } = require('../utils/password');
const { pool } = require('../config/database');

const router = express.Router();

/*  
  @route   GET /api/users
  @desc    Get all users with permissions check
  @access  Private - Requires user management permission
*/
router.get('/', auth, requirePermission('canManageUsers'), async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'created_at', order = 'desc', search = '', position_id } = req.query;
    
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.username, 
             u.position_id, p.name as position_name, u.is_active, 
             u.created_at, u.updated_at,
             p.can_manage_projects, p.can_edit_project, p.can_add_project, p.can_delete_project,
             p.can_manage_inventory, p.can_add_inventory, p.can_edit_inventory, p.can_delete_inventory,
             p.can_manage_users, p.can_edit_user, p.can_add_user, p.can_delete_user
      FROM user u
      LEFT JOIN position p ON u.position_id = p.id
      WHERE 1=1
    `;
    
    const queryParams = [];

    // Filter by position if specified
    if (position_id && position_id !== 'all') {
      query += ' AND u.position_id = ?';
      queryParams.push(position_id);
    }

    // Apply search filter
    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.username LIKE ? OR p.name LIKE ?)';
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    // Hide Administrator users from non-administrators (except themselves)
    if (req.user.positionName !== 'Administrator') {
      query += ' AND (p.name != "Administrator" OR u.id = ?)';
      queryParams.push(req.user.id);
    }

    // Get total count for pagination (use separate params to avoid LIMIT/OFFSET issues)
    let countQuery = `
      SELECT COUNT(*) as total
      FROM user u
      LEFT JOIN position p ON u.position_id = p.id
      WHERE 1=1
    `;
    
    // Apply the same filters for count query
    if (position_id && position_id !== 'all') {
      countQuery += ' AND u.position_id = ?';
    }

    if (search) {
      countQuery += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.username LIKE ? OR p.name LIKE ?)';
    }

    if (req.user.positionName !== 'Administrator') {
      countQuery += ' AND (p.name != "Administrator" OR u.id = ?)';
    }
    
    const [countResult] = await pool.execute(countQuery, [...queryParams]);
    const total = countResult[0].total;

    // Apply sorting
    const validSortFields = {
      'first_name': 'u.first_name',
      'last_name': 'u.last_name', 
      'email': 'u.email',
      'position_name': 'p.name',
      'is_active': 'u.is_active',
      'created_at': 'u.created_at'
    };
    const sortField = validSortFields[sort] || validSortFields['created_at'];
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Apply pagination (using string interpolation for LIMIT/OFFSET due to MySQL prepared statement issues)
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitValue = parseInt(limit);
    const offsetValue = offset;
    query += ` LIMIT ${limitValue} OFFSET ${offsetValue}`;
    const paginatedParams = [...queryParams];

    const [users] = await pool.execute(query, paginatedParams);

    // Format users response with permissions
    const usersResponse = users.map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: user.username,
      position_id: user.position_id,
      position_name: user.position_name,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      permissions: {
        canManageProjects: Boolean(user.can_manage_projects),
        canEditProject: Boolean(user.can_edit_project),
        canAddProject: Boolean(user.can_add_project),
        canDeleteProject: Boolean(user.can_delete_project),
        canManageInventory: Boolean(user.can_manage_inventory),
        canAddInventory: Boolean(user.can_add_inventory),
        canEditInventory: Boolean(user.can_edit_inventory),
        canDeleteInventory: Boolean(user.can_delete_inventory),
        canManageUsers: Boolean(user.can_manage_users),
        canEditUser: Boolean(user.can_edit_user),
        canAddUser: Boolean(user.can_add_user),
        canDeleteUser: Boolean(user.can_delete_user)
      }
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.json({
      success: true,
      data: {
        users: usersResponse,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPreviousPage
        },
        filters: {
          search,
          sort,
          order,
          position_id
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching users'
    });
  }
});

/*
  @route   GET /api/users/:id
  @desc    Get single user (Admin/Manager or own profile)
  @access  Private
*/
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is requesting their own profile or has admin/manager role
    if (req.user.id !== id && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view your own profile.'
      });
    }
    
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove password from response
    const { password, ...userResponse } = user;

    res.json({
      success: true,
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (Admin only or own profile with restrictions)
// @access  Private
router.put('/:id', auth, validate(schemas.updateUser), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check permissions
    const isOwnProfile = req.user.id === id;
    const isAdmin = req.user.role === 'admin';

    // Only admin can update other users or change roles
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only update your own profile.'
      });
    }

    // Only admin can change roles
    if (role && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only admins can change user roles.'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== mockUsers[userIndex].email) {
      const existingUser = mockUsers.find(u => u.email === email && u.id !== id);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }
    }

    // Update user
    const updatedUser = {
      ...mockUsers[userIndex],
      ...(name && { name }),
      ...(email && { email }),
      ...(role && isAdmin && { role }),
      updatedAt: new Date().toISOString()
    };

    mockUsers[userIndex] = updatedUser;

    // Remove password from response
    const { password, ...userResponse } = updatedUser;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating user'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own account'
      });
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove user from mock store
    const deletedUser = mockUsers.splice(userIndex, 1)[0];
    
    // Remove password from response
    const { password, ...userResponse } = deletedUser;

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUser: userResponse
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting user'
    });
  }
});

// @route   PUT /api/users/:id/deactivate
// @desc    Deactivate user (Admin only)
// @access  Private
router.put('/:id/deactivate', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deactivating themselves
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot deactivate your own account'
      });
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Deactivate user
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      is_active: false,
      updatedAt: new Date().toISOString()
    };

    const { password, ...userResponse } = mockUsers[userIndex];

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deactivating user'
    });
  }
});

// @route   PUT /api/users/:id/activate
// @desc    Activate user (Admin only)
// @access  Private
router.put('/:id/activate', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Activate user
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      is_active: true,
      updatedAt: new Date().toISOString()
    };

    const { password, ...userResponse } = mockUsers[userIndex];

    res.json({
      success: true,
      message: 'User activated successfully',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error activating user'
    });
  }
});

/* 
  ======================
  POSITION MANAGEMENT ROUTES
  ======================
*/

/*
  @route   GET /api/users/positions
  @desc    Get all positions with permissions
  @access  Private - Requires user management permission
*/
router.get('/admin/positions', auth, requirePermission('canManageUsers'), async (req, res) => {
  try {
    const [positions] = await pool.execute(`
      SELECT id, name, can_manage_projects, can_edit_project, can_add_project, can_delete_project,
             can_manage_inventory, can_add_inventory, can_edit_inventory, can_delete_inventory,
             can_manage_users, can_edit_user, can_add_user, can_delete_user,
             created_at, updated_at
      FROM position
      ORDER BY name
    `);

    // Filter out Administrator position from non-administrators
    const filteredPositions = req.user.positionName === 'Administrator' 
      ? positions 
      : positions.filter(pos => pos.name !== 'Administrator');

    const formattedPositions = filteredPositions.map(pos => ({
      id: pos.id,
      name: pos.name,
      permissions: {
        canManageProjects: Boolean(pos.can_manage_projects),
        canEditProject: Boolean(pos.can_edit_project),
        canAddProject: Boolean(pos.can_add_project),
        canDeleteProject: Boolean(pos.can_delete_project),
        canManageInventory: Boolean(pos.can_manage_inventory),
        canAddInventory: Boolean(pos.can_add_inventory),
        canEditInventory: Boolean(pos.can_edit_inventory),
        canDeleteInventory: Boolean(pos.can_delete_inventory),
        canManageUsers: Boolean(pos.can_manage_users),
        canEditUser: Boolean(pos.can_edit_user),
        canAddUser: Boolean(pos.can_add_user),
        canDeleteUser: Boolean(pos.can_delete_user)
      },
      created_at: pos.created_at,
      updated_at: pos.updated_at
    }));

    res.json({
      success: true,
      data: {
        positions: formattedPositions
      }
    });

  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching positions'
    });
  }
});

/*
  @route   POST /api/users/positions
  @desc    Create new position
  @access  Private - Requires user management permission
*/
router.post('/admin/positions', auth, requirePermission('canManageUsers'), async (req, res) => {
  try {
    const {
      name,
      permissions = {}
    } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Position name is required'
      });
    }

    // Check if position already exists
    const [existing] = await pool.execute('SELECT id FROM position WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Position name already exists'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO position (
        name, can_manage_projects, can_edit_project, can_add_project, can_delete_project,
        can_manage_inventory, can_add_inventory, can_edit_inventory, can_delete_inventory,
        can_manage_users, can_edit_user, can_add_user, can_delete_user
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      permissions.canManageProjects || false,
      permissions.canEditProject || false,
      permissions.canAddProject || false,
      permissions.canDeleteProject || false,
      permissions.canManageInventory || false,
      permissions.canAddInventory || false,
      permissions.canEditInventory || false,
      permissions.canDeleteInventory || false,
      permissions.canManageUsers || false,
      permissions.canEditUser || false,
      permissions.canAddUser || false,
      permissions.canDeleteUser || false
    ]);

    // Log the activity
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description)
      VALUES (?, 'create', 'position', ?, ?)
    `, [req.user.id, result.insertId, `Created new position: ${name}`]);

    res.json({
      success: true,
      message: 'Position created successfully',
      data: {
        position: {
          id: result.insertId,
          name,
          permissions
        }
      }
    });

  } catch (error) {
    console.error('Create position error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating position'
    });
  }
});

/*
  @route   PUT /api/users/positions/:id
  @desc    Update position permissions (Admin cannot be modified)
  @access  Private - Requires user management permission
*/
router.put('/admin/positions/:id', auth, requirePermission('canManageUsers'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body;

    // Check if position exists
    const [existingPos] = await pool.execute('SELECT name FROM position WHERE id = ?', [id]);
    if (existingPos.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Position not found'
      });
    }

    // Prevent modification of Administrator position
    if (existingPos[0].name === 'Administrator') {
      return res.status(403).json({
        success: false,
        error: 'Administrator position cannot be modified'
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (name && name !== existingPos[0].name) {
      // Check if new name already exists
      const [nameCheck] = await pool.execute('SELECT id FROM position WHERE name = ? AND id != ?', [name, id]);
      if (nameCheck.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Position name already exists'
        });
      }
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (permissions) {
      const permissionFields = [
        'can_manage_projects', 'can_edit_project', 'can_add_project', 'can_delete_project',
        'can_manage_inventory', 'can_add_inventory', 'can_edit_inventory', 'can_delete_inventory',
        'can_manage_users', 'can_edit_user', 'can_add_user', 'can_delete_user'
      ];

      const permissionMapping = {
        canManageProjects: 'can_manage_projects',
        canEditProject: 'can_edit_project',
        canAddProject: 'can_add_project',
        canDeleteProject: 'can_delete_project',
        canManageInventory: 'can_manage_inventory',
        canAddInventory: 'can_add_inventory',
        canEditInventory: 'can_edit_inventory',
        canDeleteInventory: 'can_delete_inventory',
        canManageUsers: 'can_manage_users',
        canEditUser: 'can_edit_user',
        canAddUser: 'can_add_user',
        canDeleteUser: 'can_delete_user'
      };

      for (const [key, dbField] of Object.entries(permissionMapping)) {
        if (permissions.hasOwnProperty(key)) {
          updateFields.push(`${dbField} = ?`);
          updateValues.push(permissions[key] || false);
        }
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    await pool.execute(
      `UPDATE position SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Log the activity
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description)
      VALUES (?, 'update', 'position', ?, ?)
    `, [req.user.id, id, `Updated position: ${name || existingPos[0].name}`]);

    res.json({
      success: true,
      message: 'Position updated successfully'
    });

  } catch (error) {
    console.error('Update position error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating position'
    });
  }
});

/*
  @route   DELETE /api/users/positions/:id
  @desc    Delete position (Admin cannot be deleted)
  @access  Private - Requires user management permission
*/
router.delete('/admin/positions/:id', auth, requirePermission('canManageUsers'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if position exists
    const [position] = await pool.execute('SELECT name FROM position WHERE id = ?', [id]);
    if (position.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Position not found'
      });
    }

    // Prevent deletion of Administrator position
    if (position[0].name === 'Administrator') {
      return res.status(403).json({
        success: false,
        error: 'Administrator position cannot be deleted'
      });
    }

    // Check if position is in use
    const [usersWithPosition] = await pool.execute('SELECT COUNT(*) as count FROM user WHERE position_id = ?', [id]);
    if (usersWithPosition[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete position that is currently assigned to users'
      });
    }

    await pool.execute('DELETE FROM position WHERE id = ?', [id]);

    // Log the activity
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description)
      VALUES (?, 'delete', 'position', ?, ?)
    `, [req.user.id, id, `Deleted position: ${position[0].name}`]);

    res.json({
      success: true,
      message: 'Position deleted successfully'
    });

  } catch (error) {
    console.error('Delete position error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting position'
    });
  }
});

module.exports = router;
