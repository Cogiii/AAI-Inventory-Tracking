const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { pool } = require('../config/database');

const router = express.Router();

// @route   GET /api/inventory/test-data
// @desc    Test endpoint to check database connectivity and data
// @access  Public (for testing purposes)
router.get('/test-data', async (req, res) => {
  try {
    console.log('Test data endpoint called');

    // Test brands
    const [brands] = await pool.execute(`
      SELECT COUNT(*) as brand_count FROM brand
    `);

    const [brandsSample] = await pool.execute(`
      SELECT id, name FROM brand LIMIT 5
    `);

    // Test locations
    const [locations] = await pool.execute(`
      SELECT COUNT(*) as location_count FROM location
    `);

    const [locationsSample] = await pool.execute(`
      SELECT id, name, type FROM location LIMIT 5
    `);

    // Test warehouse and office locations specifically
    const [warehouses] = await pool.execute(`
      SELECT COUNT(*) as warehouse_count FROM location WHERE type = 'warehouse'
    `);

    const [offices] = await pool.execute(`
      SELECT COUNT(*) as office_count FROM location WHERE type = 'office'
    `);

    const [warehousesAndOfficesSample] = await pool.execute(`
      SELECT id, name, type, city FROM location WHERE type IN ('warehouse', 'office') ORDER BY type ASC, name ASC
    `);

    res.json({
      success: true,
      message: 'Test data retrieved successfully',
      data: {
        brands: {
          total: brands[0].brand_count,
          sample: brandsSample
        },
        locations: {
          total: locations[0].location_count,
          sample: locationsSample
        },
        warehouses: {
          total: warehouses[0].warehouse_count,
          sample: warehousesAndOfficesSample.filter(loc => loc.type === 'warehouse')
        },
        offices: {
          total: offices[0].office_count,
          sample: warehousesAndOfficesSample.filter(loc => loc.type === 'office')
        },
        warehousesAndOffices: {
          total: warehouses[0].warehouse_count + offices[0].office_count,
          sample: warehousesAndOfficesSample
        }
      }
    });

  } catch (error) {
    console.error('Test data error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving test data',
      details: error.message
    });
  }
});

// @route   GET /api/inventory
// @desc    Get all inventory items with pagination and filtering
// @access  Private
router.get('/', auth, validate(schemas.paginationQuery, 'query'), async (req, res) => {
  try {
    const { page: pageStr, limit: limitStr, sort, order, search, type, brand, location, status } = req.query;

    // Convert string parameters to integers
    const page = parseInt(pageStr) || 1;
    const limit = parseInt(limitStr) || 10;

    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    // Apply search filter
    if (search) {
      whereClause += ' AND (i.name LIKE ? OR i.description LIKE ? OR b.name LIKE ? OR l.name LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Apply type filter
    if (type && type !== 'all') {
      whereClause += ' AND i.type = ?';
      queryParams.push(type);
    }

    // Apply brand filter
    if (brand && brand !== 'all') {
      if (brand === 'no_brand') {
        whereClause += ' AND i.brand_id IS NULL';
      } else {
        whereClause += ' AND b.name = ?';
        queryParams.push(brand);
      }
    }

    // Apply location filter
    if (location && location !== 'all') {
      whereClause += ' AND l.name = ?';
      queryParams.push(location);
    }

    // Apply status filter
    if (status && status !== 'all') {
      switch (status) {
        case 'low_stock':
          whereClause += ' AND i.available_quantity > 0 AND i.available_quantity <= 10';
          break;
        case 'out_of_stock':
          whereClause += ' AND i.available_quantity = 0';
          break;
        case 'active':
          whereClause += ' AND i.available_quantity > 10';
          break;
        case 'inactive':
          whereClause += ' AND i.status = ?';
          queryParams.push('inactive');
          break;
      }
    }

    // Build ORDER BY clause
    const validSortColumns = {
      'name': 'i.name',
      'type': 'i.type',
      'available_quantity': 'i.available_quantity',
      'delivered_quantity': 'i.delivered_quantity',
      'created_at': 'i.created_at',
      'updated_at': 'i.updated_at'
    };

    const sortColumn = validSortColumns[sort] || 'i.created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    // Count total items for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM item i
      LEFT JOIN brand b ON i.brand_id = b.id
      LEFT JOIN location l ON i.warehouse_location_id = l.id
      ${whereClause}
    `;

    const [countResult] = await pool.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Main query with pagination - simplified approach
    const offset = (page - 1) * limit;

    // Let's build the query step by step without parameterized LIMIT/OFFSET
    let baseQuery = `
      SELECT 
        i.*,
        b.name as brand_name,
        l.name as warehouse_location_name
      FROM item i
      LEFT JOIN brand b ON i.brand_id = b.id
      LEFT JOIN location l ON i.warehouse_location_id = l.id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
    `;

    // Add LIMIT and OFFSET directly to avoid parameter issues
    const finalQuery = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;

    // console.log('Final Query:', finalQuery);
    // console.log('Query Params for WHERE clause:', queryParams);

    const [items] = await pool.execute(finalQuery, queryParams);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        filters: {
          search,
          type,
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

// @route   GET /api/inventory/stats
// @desc    Get inventory statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const [totalItemsResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM item'
    );

    const [typeCountsResult] = await pool.execute(
      `SELECT type, COUNT(*) as count 
       FROM item 
       GROUP BY type`
    );

    const [quantitiesResult] = await pool.execute(
      `SELECT 
        SUM(delivered_quantity) as total_delivered,
        SUM(available_quantity) as total_available,
        SUM(damaged_quantity) as total_damaged,
        SUM(lost_quantity) as total_lost
       FROM item`
    );

    const typeCounts = {};
    typeCountsResult.forEach(row => {
      typeCounts[row.type] = row.count;
    });

    res.json({
      success: true,
      data: {
        totalItems: totalItemsResult[0].total,
        typeCounts,
        quantities: quantitiesResult[0]
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

// @route   GET /api/inventory/brands
// @desc    Get all brands for dropdown
// @access  Private
router.get('/brands', auth, async (req, res) => {
  try {
    const [brands] = await pool.execute(
      'SELECT id, name FROM brand ORDER BY name'
    );

    res.json({
      success: true,
      data: {
        brands
      }
    });

  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching brands'
    });
  }
});

// @route   GET /api/inventory/locations
// @desc    Get all warehouse locations for dropdown
// @access  Private
router.get('/locations', auth, async (req, res) => {
  try {
    const [locations] = await pool.execute(
      `SELECT id, name, city, province 
        FROM location 
        WHERE type IN ('warehouse', 'office') 
          AND is_active = 1 
        ORDER BY name`
    );

    res.json({
      success: true,
      data: {
        locations
      }
    });

  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching locations'
    });
  }
});

// @route   GET /api/inventory/export/excel
// @desc    Export inventory items to Excel based on filters
// @access  Private
router.get('/export/excel', auth, validate(schemas.paginationQuery, 'query'), async (req, res) => {
  try {
    const { sort, order, search, type, brand, location, status } = req.query;

    // Convert string parameters to proper types
    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    // Apply search filter
    if (search) {
      whereClause += ' AND (i.name LIKE ? OR i.description LIKE ? OR b.name LIKE ? OR l.name LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Apply type filter
    if (type && type !== 'all') {
      whereClause += ' AND i.type = ?';
      queryParams.push(type);
    }

    // Apply brand filter
    if (brand && brand !== 'all') {
      if (brand === 'no_brand') {
        whereClause += ' AND i.brand_id IS NULL';
      } else {
        whereClause += ' AND b.name = ?';
        queryParams.push(brand);
      }
    }

    // Apply location filter
    if (location && location !== 'all') {
      whereClause += ' AND l.name = ?';
      queryParams.push(location);
    }

    // Apply status filter
    if (status && status !== 'all') {
      switch (status) {
        case 'low_stock':
          whereClause += ' AND i.available_quantity > 0 AND i.available_quantity <= 10';
          break;
        case 'out_of_stock':
          whereClause += ' AND i.available_quantity = 0';
          break;
        case 'active':
          whereClause += ' AND i.available_quantity > 10';
          break;
        case 'inactive':
          whereClause += ' AND i.status = ?';
          queryParams.push('inactive');
          break;
      }
    }

    // Build ORDER BY clause
    const validSortColumns = {
      'name': 'i.name',
      'type': 'i.type',
      'available_quantity': 'i.available_quantity',
      'delivered_quantity': 'i.delivered_quantity',
      'created_at': 'i.created_at',
      'updated_at': 'i.updated_at'
    };

    const sortColumn = validSortColumns[sort] || 'i.created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    // Export query - get all items (no pagination for export)
    const exportQuery = `
      SELECT 
        i.id,
        i.type,
        b.name as brand_name,
        i.name,
        i.description,
        i.delivered_quantity,
        i.damaged_quantity,
        i.lost_quantity,
        i.available_quantity,
        l.name as warehouse_location_name,
        i.status,
        DATE_FORMAT(i.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        DATE_FORMAT(i.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
      FROM item i
      LEFT JOIN brand b ON i.brand_id = b.id
      LEFT JOIN location l ON i.warehouse_location_id = l.id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
    `;

    const [items] = await pool.execute(exportQuery, queryParams);

    // Import xlsx dynamically
    const XLSX = require('xlsx');

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();

    // Prepare data for Excel
    const excelData = items.map(item => ({
      'ID': item.id,
      'Type': item.type,
      'Brand': item.brand_name || 'No Brand',
      'Name': item.name,
      'Description': item.description || '',
      'Delivered Quantity': item.delivered_quantity,
      'Damaged Quantity': item.damaged_quantity,
      'Lost Quantity': item.lost_quantity,
      'Available Quantity': item.available_quantity,
      'Warehouse Location': item.warehouse_location_name || '',
      'Status': item.status || 'active',
      'Created At': item.created_at,
      'Updated At': item.updated_at
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Items');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    const filename = `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    // Send the file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Export Excel error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error exporting inventory'
    });
  }
});

// @route   GET /api/inventory/:id
// @desc    Get single inventory item
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        i.*,
        b.name as brand_name,
        l.name as warehouse_location_name
      FROM item i
      LEFT JOIN brand b ON i.brand_id = b.id
      LEFT JOIN location l ON i.warehouse_location_id = l.id
      WHERE i.id = ?
    `;

    const [rows] = await pool.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: {
        item: rows[0]
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
// @access  Private
router.post('/', auth, validate(schemas.createInventoryItem), async (req, res) => {
  try {
    const {
      type,
      brand_id,
      name,
      description,
      delivered_quantity,
      damaged_quantity,
      lost_quantity,
      available_quantity,
      warehouse_location_id,
      status
    } = req.body;

    // Insert new inventory item
    const insertQuery = `
      INSERT INTO item (
        type, 
        brand_id, 
        name, 
        description, 
        delivered_quantity, 
        damaged_quantity, 
        lost_quantity, 
        available_quantity, 
        warehouse_location_id, 
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await pool.execute(insertQuery, [
      type,
      brand_id || null,
      name,
      description || null,
      delivered_quantity || 0,
      damaged_quantity || 0,
      lost_quantity || 0,
      available_quantity || 0,
      warehouse_location_id || null,
      status || null
    ]);

    // Fetch the created item with related data
    const fetchQuery = `
      SELECT 
        i.*,
        b.name as brand_name,
        l.name as warehouse_location_name
      FROM item i
      LEFT JOIN brand b ON i.brand_id = b.id
      LEFT JOIN location l ON i.warehouse_location_id = l.id
      WHERE i.id = ?
    `;

    const [rows] = await pool.execute(fetchQuery, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: {
        item: rows[0]
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
// @access  Private
router.put('/:id', auth, validate(schemas.updateInventoryItem), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if item exists
    const [existingRows] = await pool.execute('SELECT id FROM item WHERE id = ?', [id]);

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      'type', 'brand_id', 'name', 'description', 'delivered_quantity',
      'damaged_quantity', 'lost_quantity', 'available_quantity',
      'warehouse_location_id', 'status'
    ];

    allowedFields.forEach(field => {
      if (updates.hasOwnProperty(field)) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    const updateQuery = `
      UPDATE item 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;

    await pool.execute(updateQuery, updateValues);

    // Fetch the updated item with related data
    const fetchQuery = `
      SELECT 
        i.*,
        b.name as brand_name,
        l.name as warehouse_location_name
      FROM item i
      LEFT JOIN brand b ON i.brand_id = b.id
      LEFT JOIN location l ON i.warehouse_location_id = l.id
      WHERE i.id = ?
    `;

    const [rows] = await pool.execute(fetchQuery, [id]);

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: {
        item: rows[0]
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
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists and get its data before deleting
    const [existingRows] = await pool.execute(`
      SELECT 
        i.*,
        b.name as brand_name,
        l.name as warehouse_location_name
      FROM item i
      LEFT JOIN brand b ON i.brand_id = b.id
      LEFT JOIN location l ON i.warehouse_location_id = l.id
      WHERE i.id = ?
    `, [id]);

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Delete the item
    await pool.execute('DELETE FROM item WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Inventory item deleted successfully',
      data: {
        deletedItem: existingRows[0]
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

// @route   GET /api/inventory/brands
// @desc    Get all brands for dropdown
// @access  Private
router.get('/brands', auth, async (req, res) => {
  try {
    console.log('Brands endpoint called');
    const [rows] = await pool.execute(`
      SELECT 
        b.id, 
        b.name,
        b.description
      FROM brand b
      WHERE b.name IS NOT NULL
      ORDER BY b.name ASC
    `);

    console.log('Brands query result:', rows);

    res.json({
      success: true,
      message: 'Brands retrieved successfully',
      data: {
        brands: rows
      }
    });

  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving brands',
      details: error.message
    });
  }
});

// @route   GET /api/inventory/locations
// @desc    Get all warehouse and office locations for dropdown
// @access  Private
router.get('/locations', auth, async (req, res) => {
  try {
    console.log('Locations endpoint called');
    const [rows] = await pool.execute(`
      SELECT 
        l.id, 
        l.name,
        l.type,
        l.city,
        l.province
      FROM location l
      WHERE l.type IN ('warehouse', 'office')
        AND l.name IS NOT NULL 
        AND l.is_active = TRUE
      ORDER BY l.type ASC, l.name ASC
    `);

    console.log('Locations query result:', rows);

    res.json({
      success: true,
      message: 'Warehouse and office locations retrieved successfully',
      data: {
        locations: rows
      }
    });

  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving locations',
      details: error.message
    });
  }
});

module.exports = router;