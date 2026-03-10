const express = require('express');
const { auth, authorize, requirePermission } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { hashPassword } = require('../utils/password');
const { pool } = require('../config/database');

// Real-time event emitters
const {
  emitUserCreated,
  emitUserUpdated,
  emitUserDeleted,
} = require('../socket/events');

const router = express.Router();

/*  
  @route   GET /api/users
  @desc    Get all users with permissions check
  @access  Private - Requires user management permission
*/
router.get('/', auth, requirePermission('users', 'view'), async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'created_at', order = 'desc', search = '', position_id } = req.query;

    let query = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.username,
             u.position_id, p.name as position_name, u.is_active,
             u.created_at, u.updated_at,
             p.permissions
      FROM user u
      LEFT JOIN \`position\` p ON u.position_id = p.id
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
      LEFT JOIN \`position\` p ON u.position_id = p.id
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
    const usersResponse = users.map(user => {
      // Parse JSON permissions (handle both string and object)
      let permissions = { projects: [], inventory: [], users: [] };
      if (user.permissions) {
        if (typeof user.permissions === 'string') {
          try {
            permissions = JSON.parse(user.permissions);
          } catch (e) {
            console.error('Failed to parse user permissions JSON:', e);
          }
        } else {
          permissions = user.permissions;
        }
      }

      return {
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
        permissions
      };
    });

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

    // Check if user is requesting their own profile or has user view permission
    const isOwnProfile = req.user.id === parseInt(id);
    const hasUserViewPermission = req.user.permissions?.users?.includes('view');
    const isAdmin = req.user.positionName === 'Administrator';

    if (!isOwnProfile && !hasUserViewPermission && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view your own profile.'
      });
    }

    const [users] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.username,
             u.position_id, p.name as position_name, u.is_active,
             u.created_at, u.updated_at, p.permissions
      FROM user u
      LEFT JOIN \`position\` p ON u.position_id = p.id
      WHERE u.id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    // Parse JSON permissions
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

    res.json({
      success: true,
      data: {
        user: {
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
          permissions
        }
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

// @route   POST /api/users
// @desc    Create new user (requires users add permission)
// @access  Private
router.post('/', auth, requirePermission('users', 'add'), async (req, res) => {
  try {
    const { first_name, last_name, email, username, password, position_id } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !username || !password || !position_id) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: first_name, last_name, email, username, password, position_id'
      });
    }

    // Check if email already exists
    const [existingEmail] = await pool.execute(
      'SELECT id FROM user WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Check if username already exists
    const [existingUsername] = await pool.execute(
      'SELECT id FROM user WHERE username = ?',
      [username]
    );

    if (existingUsername.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Username already exists'
      });
    }

    // Check if position exists
    const [positionRows] = await pool.execute(
      'SELECT id, name FROM `position` WHERE id = ?',
      [position_id]
    );

    if (positionRows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid position'
      });
    }

    // Prevent non-administrators from creating administrator accounts
    if (positionRows[0].name === 'Administrator' && req.user.positionName !== 'Administrator') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can create administrator accounts'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new user
    const [result] = await pool.execute(
      `INSERT INTO user (first_name, last_name, email, username, password_hash, position_id, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
      [first_name, last_name, email, username, hashedPassword, position_id]
    );

    // Fetch the created user
    const [newUserRows] = await pool.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.username, u.position_id,
              p.name as position_name, u.is_active, u.created_at, u.updated_at
       FROM user u
       LEFT JOIN \`position\` p ON u.position_id = p.id
       WHERE u.id = ?`,
      [result.insertId]
    );

    // Log the activity
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description)
      VALUES (?, 'create', 'user', ?, ?)
    `, [req.user.id, result.insertId, `Created user: ${first_name} ${last_name} (${email})`]);

    // Emit real-time event for user created
    emitUserCreated(result.insertId, newUserRows[0], req.user);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: newUserRows[0]
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (Admin only or own profile with restrictions)
// @access  Private
router.put('/:id', auth, validate(schemas.updateUser), async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, username, position_id, is_active } = req.body;

    // Check if user exists
    const [userRows] = await pool.execute(
      'SELECT u.*, p.name as position_name FROM user u LEFT JOIN `position` p ON u.position_id = p.id WHERE u.id = ?',
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const existingUser = userRows[0];

    // Check permissions
    const isOwnProfile = req.user.id === parseInt(id);
    const isAdmin = req.user.positionName === 'Administrator';

    // Only admin can update other users
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only update your own profile.'
      });
    }

    // Only admin can change position or active status
    if ((position_id !== undefined || is_active !== undefined) && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only admins can change user position or status.'
      });
    }

    // Prevent non-administrators from updating Administrator users
    if (existingUser.position_name === 'Administrator' && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can update other administrators'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const [existingEmailRows] = await pool.execute(
        'SELECT id FROM user WHERE email = ? AND id != ?',
        [email, id]
      );
      if (existingEmailRows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }
    }

    // Check if username is being changed and if it already exists
    if (username && username !== existingUser.username) {
      const [existingUsernameRows] = await pool.execute(
        'SELECT id FROM user WHERE username = ? AND id != ?',
        [username, id]
      );
      if (existingUsernameRows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Username already in use'
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (first_name !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    if (last_name !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (username !== undefined) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (position_id !== undefined && isAdmin) {
      updateFields.push('position_id = ?');
      updateValues.push(position_id);
    }
    if (is_active !== undefined && isAdmin) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    await pool.execute(
      `UPDATE user SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Fetch updated user
    const [updatedUserRows] = await pool.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.username, u.position_id,
              p.name as position_name, u.is_active, u.created_at, u.updated_at
       FROM user u
       LEFT JOIN \`position\` p ON u.position_id = p.id
       WHERE u.id = ?`,
      [id]
    );

    // Emit real-time event for user updated
    emitUserUpdated(id, updatedUserRows[0], req.user);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUserRows[0]
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
// @desc    Delete user (requires users delete permission)
// @access  Private
router.delete('/:id', auth, requirePermission('users', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent user from deleting themselves
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own account'
      });
    }

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT u.*, p.name as position_name FROM user u LEFT JOIN `position` p ON u.position_id = p.id WHERE u.id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    // Prevent deletion of Administrator users by non-administrators
    if (user.position_name === 'Administrator' && req.user.positionName !== 'Administrator') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can delete other administrators'
      });
    }

    // Delete the user
    await pool.execute('DELETE FROM user WHERE id = ?', [id]);

    // Log the activity
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description)
      VALUES (?, 'delete', 'user', ?, ?)
    `, [req.user.id, id, `Deleted user: ${user.first_name} ${user.last_name} (${user.email})`]);

    // Emit real-time event for user deleted
    emitUserDeleted(id, req.user);

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUser: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          username: user.username
        }
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
// @desc    Deactivate user (requires users edit permission)
// @access  Private
router.put('/:id/deactivate', auth, requirePermission('users', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent user from deactivating themselves
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'You cannot deactivate your own account'
      });
    }

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT u.*, p.name as position_name FROM user u LEFT JOIN `position` p ON u.position_id = p.id WHERE u.id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    // Prevent deactivation of Administrator users by non-administrators
    if (user.position_name === 'Administrator' && req.user.positionName !== 'Administrator') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can deactivate other administrators'
      });
    }

    // Deactivate user
    await pool.execute('UPDATE user SET is_active = FALSE, updated_at = NOW() WHERE id = ?', [id]);

    // Log the activity
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description)
      VALUES (?, 'deactivate', 'user', ?, ?)
    `, [req.user.id, id, `Deactivated user: ${user.first_name} ${user.last_name}`]);

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          is_active: false
        }
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
// @desc    Activate user (requires users edit permission)
// @access  Private
router.put('/:id/activate', auth, requirePermission('users', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT u.*, p.name as position_name FROM user u LEFT JOIN `position` p ON u.position_id = p.id WHERE u.id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    // Prevent activation of Administrator users by non-administrators
    if (user.position_name === 'Administrator' && req.user.positionName !== 'Administrator') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can activate other administrators'
      });
    }

    // Activate user
    await pool.execute('UPDATE user SET is_active = TRUE, updated_at = NOW() WHERE id = ?', [id]);

    // Log the activity
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description)
      VALUES (?, 'activate', 'user', ?, ?)
    `, [req.user.id, id, `Activated user: ${user.first_name} ${user.last_name}`]);

    res.json({
      success: true,
      message: 'User activated successfully',
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          is_active: true
        }
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
  @access  Private - Requires user view permission
*/
router.get('/admin/positions', auth, requirePermission('users', 'view'), async (req, res) => {
  try {
    const [positions] = await pool.execute(`
      SELECT id, name, description, permissions, created_at, updated_at
      FROM \`position\`
      ORDER BY name
    `);

    // Filter out Administrator position from non-administrators
    const filteredPositions = req.user.positionName === 'Administrator'
      ? positions
      : positions.filter(pos => pos.name !== 'Administrator');

    const formattedPositions = filteredPositions.map(pos => {
      // Parse JSON permissions (handle both string and object)
      let permissions = { projects: [], inventory: [], users: [] };
      if (pos.permissions) {
        if (typeof pos.permissions === 'string') {
          try {
            permissions = JSON.parse(pos.permissions);
          } catch (e) {
            console.error('Failed to parse position permissions JSON:', e);
          }
        } else {
          permissions = pos.permissions;
        }
      }

      return {
        id: pos.id,
        name: pos.name,
        description: pos.description,
        permissions,
        created_at: pos.created_at,
        updated_at: pos.updated_at
      };
    });

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
  @access  Private - Requires user add permission
*/
router.post('/admin/positions', auth, requirePermission('users', 'add'), async (req, res) => {
  try {
    const {
      name,
      description = '',
      permissions = { projects: [], inventory: [], users: [] }
    } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Position name is required'
      });
    }

    // Check if position already exists
    const [existing] = await pool.execute('SELECT id FROM `position` WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Position name already exists'
      });
    }

    // Convert permissions object to JSON string
    const permissionsJson = JSON.stringify(permissions);

    const [result] = await pool.execute(`
      INSERT INTO \`position\` (name, description, permissions)
      VALUES (?, ?, ?)
    `, [name, description, permissionsJson]);

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
          description,
          permissions
        }
      }
    });

  } catch (error) {
    console.error('Create position error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    res.status(500).json({
      success: false,
      error: error.sqlMessage || error.message || 'Server error creating position'
    });
  }
});

/*
  @route   PUT /api/users/positions/:id
  @desc    Update position permissions (Admin cannot be modified)
  @access  Private - Requires user edit permission
*/
router.put('/admin/positions/:id', auth, requirePermission('users', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    // Check if position exists
    const [existingPos] = await pool.execute('SELECT name, description, permissions FROM `position` WHERE id = ?', [id]);
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
      const [nameCheck] = await pool.execute('SELECT id FROM `position` WHERE name = ? AND id != ?', [name, id]);
      if (nameCheck.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Position name already exists'
        });
      }
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    if (permissions) {
      // Store permissions as JSON
      updateFields.push('permissions = ?');
      updateValues.push(JSON.stringify(permissions));
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
      `UPDATE \`position\` SET ${updateFields.join(', ')} WHERE id = ?`,
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
  @access  Private - Requires user delete permission
*/
router.delete('/admin/positions/:id', auth, requirePermission('users', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if position exists
    const [position] = await pool.execute('SELECT name FROM `position` WHERE id = ?', [id]);
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

    await pool.execute('DELETE FROM `position` WHERE id = ?', [id]);

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
