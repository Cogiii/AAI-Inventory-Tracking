const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { auth, mockUsers } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(schemas.registerUser), async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    // Add user to mock store
    mockUsers.push(newUser);

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
    const { email, password } = req.body;

    // Find user by email
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

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
    const user = mockUsers.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      data: {
        user: userResponse
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
router.put('/me', auth, validate(schemas.updateUser), async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const userIndex = mockUsers.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== mockUsers[userIndex].email) {
      const existingUser = mockUsers.find(u => u.email === email && u.id !== req.user.id);
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
      updatedAt: new Date().toISOString()
    };

    mockUsers[userIndex] = updatedUser;

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
const { authorize } = require('../middleware/auth');

router.get('/stats', auth, authorize('admin'), (req, res) => {
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(u => u.isActive).length;
  const adminUsers = mockUsers.filter(u => u.role === 'admin').length;
  const managerUsers = mockUsers.filter(u => u.role === 'manager').length;
  const regularUsers = mockUsers.filter(u => u.role === 'user').length;

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      usersByRole: {
        admin: adminUsers,
        manager: managerUsers,
        user: regularUsers
      },
      registeredToday: mockUsers.filter(u => {
        const today = new Date().toDateString();
        const userDate = new Date(u.createdAt).toDateString();
        return today === userDate;
      }).length
    }
  });
});

module.exports = router;