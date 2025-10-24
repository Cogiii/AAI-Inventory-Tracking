const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const UserService = require('../services/UserService');

const router = express.Router();

/*  
  @route   GET /api/positions
  @desc    Get all positions (for dropdowns/selects)
  @access  Private
*/
router.get('/', auth, async (req, res) => {
  try {
    const positions = await UserService.getAllPositions();
    
    res.json({
      success: true,
      data: positions
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
  @route   GET /api/positions/:id
  @desc    Get single position by ID
  @access  Private
*/
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const position = await UserService.getPositionById(id);
    
    if (!position) {
      return res.status(404).json({
        success: false,
        error: 'Position not found'
      });
    }
    
    res.json({
      success: true,
      data: position
    });
  } catch (error) {
    console.error('Get position error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching position'
    });
  }
});

module.exports = router;