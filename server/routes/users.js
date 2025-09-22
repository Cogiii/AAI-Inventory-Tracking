const express = require('express');
const { auth, authorize, mockUsers } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { hashPassword } = require('../utils/password');

const router = express.Router();

/*  
  @route   GET /api/users
  @desc    Get all users (Admin/Manager only)
  @access  Private
*/
router.get('/', auth, authorize('admin', 'manager'), validate(schemas.paginationQuery, 'query'), async (req, res) => {
  try {
    const { page, limit, sort, order, search } = req.query;
    
    let filteredUsers = [...mockUsers];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredUsers.sort((a, b) => {
      let aValue = a[sort];
      let bValue = b[sort];

      // Handle date sorting
      if (sort === 'createdAt' || sort === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Remove passwords from response
    const usersResponse = paginatedUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    // Calculate pagination info
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = endIndex < totalItems;
    const hasPreviousPage = startIndex > 0;

    res.json({
      success: true,
      data: {
        users: usersResponse,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage,
          hasPreviousPage
        },
        filters: {
          search,
          sort,
          order
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
      isActive: false,
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
      isActive: true,
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

module.exports = router;