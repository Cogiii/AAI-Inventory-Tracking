const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Mock inventory store (replace with database later)
const mockInventory = [
  {
    id: uuidv4(),
    name: 'Laptop',
    description: 'High-performance business laptop',
    category: 'Electronics',
    quantity: 50,
    price: 999.99,
    sku: 'LAP001',
    location: 'Warehouse A',
    minStockLevel: 10,
    supplier: 'Tech Corp',
    status: 'active',
    createdAt: '2025-09-01T10:00:00.000Z',
    updatedAt: '2025-09-01T10:00:00.000Z',
    createdBy: 'admin'
  },
  {
    id: uuidv4(),
    name: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support',
    category: 'Furniture',
    quantity: 25,
    price: 299.99,
    sku: 'CHR001',
    location: 'Warehouse B',
    minStockLevel: 5,
    supplier: 'Furniture Plus',
    status: 'active',
    createdAt: '2025-09-02T14:30:00.000Z',
    updatedAt: '2025-09-02T14:30:00.000Z',
    createdBy: 'admin'
  }
];

// @route   GET /api/inventory
// @desc    Get all inventory items with pagination and filtering
// @access  Private
router.get('/', auth, validate(schemas.paginationQuery, 'query'), async (req, res) => {
  try {
    const { page, limit, sort, order, search, category } = req.query;
    
    let filteredInventory = [...mockInventory];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredInventory = filteredInventory.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.sku.toLowerCase().includes(searchLower) ||
        item.supplier.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (category) {
      filteredInventory = filteredInventory.filter(item =>
        item.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply sorting
    filteredInventory.sort((a, b) => {
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
    const paginatedItems = filteredInventory.slice(startIndex, endIndex);

    // Calculate pagination info
    const totalItems = filteredInventory.length;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = endIndex < totalItems;
    const hasPreviousPage = startIndex > 0;

    res.json({
      success: true,
      data: {
        items: paginatedItems,
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
          category,
          sort,
          order
        }
      }
    });

  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching inventory'
    });
  }
});

// @route   GET /api/inventory/:id
// @desc    Get single inventory item
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = mockInventory.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: {
        item
      }
    });

  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching inventory item'
    });
  }
});

// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Private (Manager/Admin)
router.post('/', auth, authorize('manager', 'admin'), validate(schemas.createInventoryItem), async (req, res) => {
  try {
    const { name, description, category, quantity, price, sku, location, minStockLevel, supplier } = req.body;

    // Check if SKU already exists
    const existingItem = mockInventory.find(item => item.sku === sku);
    if (existingItem) {
      return res.status(400).json({
        success: false,
        error: 'SKU already exists'
      });
    }

    // Create new inventory item
    const newItem = {
      id: uuidv4(),
      name,
      description: description || '',
      category,
      quantity,
      price,
      sku,
      location: location || '',
      minStockLevel: minStockLevel || 0,
      supplier: supplier || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.id
    };

    // Add to mock store
    mockInventory.push(newItem);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: {
        item: newItem
      }
    });

  } catch (error) {
    console.error('Create inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating inventory item'
    });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private (Manager/Admin)
router.put('/:id', auth, authorize('manager', 'admin'), validate(schemas.updateInventoryItem), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const itemIndex = mockInventory.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Check if SKU is being changed and if it already exists
    if (updates.sku && updates.sku !== mockInventory[itemIndex].sku) {
      const existingItem = mockInventory.find(item => item.sku === updates.sku && item.id !== id);
      if (existingItem) {
        return res.status(400).json({
          success: false,
          error: 'SKU already exists'
        });
      }
    }

    // Update item
    const updatedItem = {
      ...mockInventory[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    mockInventory[itemIndex] = updatedItem;

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: {
        item: updatedItem
      }
    });

  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating inventory item'
    });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemIndex = mockInventory.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Remove item from mock store
    const deletedItem = mockInventory.splice(itemIndex, 1)[0];

    res.json({
      success: true,
      message: 'Inventory item deleted successfully',
      data: {
        deletedItem
      }
    });

  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting inventory item'
    });
  }
});

// @route   GET /api/inventory/low-stock
// @desc    Get items with low stock
// @access  Private
router.get('/alerts/low-stock', auth, async (req, res) => {
  try {
    const lowStockItems = mockInventory.filter(item => 
      item.quantity <= item.minStockLevel && item.status === 'active'
    );

    res.json({
      success: true,
      data: {
        items: lowStockItems,
        count: lowStockItems.length
      }
    });

  } catch (error) {
    console.error('Low stock check error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error checking low stock'
    });
  }
});

// @route   GET /api/inventory/categories
// @desc    Get all unique categories
// @access  Private
router.get('/meta/categories', auth, async (req, res) => {
  try {
    const categories = [...new Set(mockInventory.map(item => item.category))];

    res.json({
      success: true,
      data: {
        categories: categories.sort()
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching categories'
    });
  }
});

// @route   GET /api/inventory/stats
// @desc    Get inventory statistics
// @access  Private
router.get('/meta/stats', auth, async (req, res) => {
  try {
    const totalItems = mockInventory.length;
    const totalValue = mockInventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const lowStockItems = mockInventory.filter(item => item.quantity <= item.minStockLevel).length;
    const categoryCounts = mockInventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalItems,
        totalValue: parseFloat(totalValue.toFixed(2)),
        lowStockItems,
        categoryCounts
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching statistics'
    });
  }
});

module.exports = router;