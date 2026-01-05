const express = require('express');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const UserService = require('../services/UserService');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(schemas.registerUser), async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Split name into first and last name
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Generate username from email (you can modify this logic)
    const username = email.split('@')[0];

    // Check if user already exists
    const existingUserByEmail = await UserService.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    const existingUserByUsername = await UserService.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        error: 'Username already taken'
      });
    }

    // Create new user
    const newUser = await UserService.create({
      firstName,
      lastName,
      email,
      password,
      role,
      username
    });

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(schemas.loginUser), async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username with permissions
    const user = await UserService.findByUsernameWithPermissions(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    // Update last login
    await UserService.update(user.id, { lastLogin: new Date() });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Remove password from response
    const { password_hash: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // The auth middleware already provides the complete user object with permissions
    // No need to query the database again
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting profile'
    });
  }
});

// @route   PUT /api/auth/me
// @desc    Update current user profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    const { first_name, last_name, email, username } = req.body;

    const user = await UserService.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const emailExists = await UserService.emailExists(email, req.user.id);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }
    }

    // Check if username is being changed and if it already exists
    if (username && username !== user.username) {
      const usernameExists = await UserService.usernameExists(username, req.user.id);
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          error: 'Username already in use'
        });
      }
    }

    // Build update data
    const updateData = {};
    if (first_name) updateData.firstName = first_name;
    if (last_name) updateData.lastName = last_name;
    if (email) updateData.email = email;
    if (username) updateData.username = username;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Update user
    const updatedUser = await UserService.update(req.user.id, updateData);

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating profile'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }

    // Get user with password
    const user = await UserService.findByUsername(req.user.username);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    await UserService.updatePassword(req.user.id, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error changing password'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  // In a JWT implementation, logout is typically handled client-side
  // by removing the token from storage. This endpoint is mainly for 
  // logging purposes and potential future token blacklisting.
  
  res.json({
    success: true,
    message: 'Logged out successfully. Please remove the token from client storage.'
  });
});

// @route   GET /api/auth/stats
// @desc    Get authentication statistics (admin only)
// @access  Private (Admin)
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const allUsers = await UserService.findAll();
    
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.is_active).length;
    const adminUsers = allUsers.filter(u => u.role === 'admin').length;
    const managerUsers = allUsers.filter(u => u.role === 'manager').length;
    const staffUsers = allUsers.filter(u => u.role === 'staff').length;

    const today = new Date().toDateString();
    const registeredToday = allUsers.filter(u => {
      const userDate = new Date(u.createdAt).toDateString();
      return today === userDate;
    }).length;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        usersByRole: {
          admin: adminUsers,
          manager: managerUsers,
          staff: staffUsers
        },
        registeredToday
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting statistics'
    });
  }
});

module.exports = router;