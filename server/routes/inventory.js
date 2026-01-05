const express = require('express');
const { auth, authorize, requirePermission } = require('../middleware/auth');
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

    // Apply status filter - now using the actual status field from database
    // Status is auto-updated by database triggers based on available_quantity
    if (status && status !== 'all') {
      switch (status) {
        case 'low_stock':
          whereClause += " AND i.status = 'low stock'";
          break;
        case 'out_of_stock':
          whereClause += " AND i.status = 'out of stock'";
          break;
        case 'active':
          whereClause += " AND i.status = 'in stock'";
          break;
        case 'inactive':
          whereClause += " AND i.status = 'inactive'";
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
        SUM(reserved_quantity) as total_reserved,
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

    // Apply status filter - now using the actual status field from database
    // Status is auto-updated by database triggers based on available_quantity
    if (status && status !== 'all') {
      switch (status) {
        case 'low_stock':
          whereClause += " AND i.status = 'low stock'";
          break;
        case 'out_of_stock':
          whereClause += " AND i.status = 'out of stock'";
          break;
        case 'active':
          whereClause += " AND i.status = 'in stock'";
          break;
        case 'inactive':
          whereClause += " AND i.status = 'inactive'";
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
// @access  Private (requires canAddInventory permission)
router.post('/', auth, requirePermission('inventory', 'add'), validate(schemas.createInventoryItem), async (req, res) => {
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

    const initialQuantity = delivered_quantity || 0;

    // Validate: if quantity > 0, location is required
    if (initialQuantity > 0 && !warehouse_location_id) {
      return res.status(400).json({
        success: false,
        error: 'Location is required when adding initial quantity'
      });
    }

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
      initialQuantity,
      damaged_quantity || 0,
      lost_quantity || 0,
      available_quantity || 0,
      warehouse_location_id || null,
      status || null
    ]);

    const itemId = result.insertId;

    // If initial quantity > 0 and location provided, create item_location and delivery_log entries
    if (initialQuantity > 0 && warehouse_location_id) {
      // Create item_location record
      await pool.execute(`
        INSERT INTO item_location (item_id, location_id, quantity, reserved_quantity, damaged_quantity, lost_quantity, created_at)
        VALUES (?, ?, ?, 0, 0, 0, NOW())
      `, [itemId, warehouse_location_id, initialQuantity]);

      // Create delivery_log entry for audit trail
      await pool.execute(`
        INSERT INTO delivery_log (item_id, location_id, quantity, type, notes, performed_by, created_at)
        VALUES (?, ?, ?, 'delivery', ?, ?, NOW())
      `, [itemId, warehouse_location_id, initialQuantity, 'Initial stock on item creation', req.user.id]);

      // Create inventory_log entry
      await pool.execute(`
        INSERT INTO inventory_log (item_id, log_type, quantity, to_location_id, handled_by, remarks, created_at)
        VALUES (?, 'in', ?, ?, ?, ?, NOW())
      `, [itemId, initialQuantity, warehouse_location_id, req.user.id, 'Initial stock added on item creation']);
    }

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

    const [rows] = await pool.execute(fetchQuery, [itemId]);

    // Log activity for item creation
    const activityDescription = initialQuantity > 0
      ? `Created item "${name}" with initial quantity of ${initialQuantity}`
      : `Created item "${name}"`;

    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at)
      VALUES (?, 'created', 'item', ?, ?, NOW())
    `, [req.user?.id, itemId, activityDescription]);

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
// @access  Private (requires canEditInventory permission)
router.put('/:id', auth, requirePermission('inventory', 'edit'), validate(schemas.updateInventoryItem), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Fetch current item with related data BEFORE updating (for change tracking)
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

    const oldItem = existingRows[0];

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
    const newItem = rows[0];

    // Build detailed change description
    const changes = [];

    // Field labels for human-readable descriptions
    const fieldLabels = {
      name: 'Name',
      description: 'Description',
      type: 'Type',
      status: 'Status',
      brand_id: 'Brand',
      warehouse_location_id: 'Location'
    };

    // Check each field for changes
    if (updates.hasOwnProperty('name') && oldItem.name !== newItem.name) {
      changes.push(`Name: "${oldItem.name}" → "${newItem.name}"`);
    }
    if (updates.hasOwnProperty('description') && oldItem.description !== newItem.description) {
      const oldDesc = oldItem.description || '(empty)';
      const newDesc = newItem.description || '(empty)';
      // Truncate long descriptions for readability in logs
      const truncate = (str, maxLen = 50) => str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
      changes.push(`Description: "${truncate(oldDesc)}" → "${truncate(newDesc)}"`);
    }
    if (updates.hasOwnProperty('type') && oldItem.type !== newItem.type) {
      changes.push(`Type: "${oldItem.type}" → "${newItem.type}"`);
    }
    if (updates.hasOwnProperty('status')) {
      // Status change - check if it's toggling inactive
      if (oldItem.status !== newItem.status) {
        if (newItem.status === 'inactive') {
          changes.push(`Marked as Inactive`);
        } else if (oldItem.status === 'inactive') {
          changes.push(`Reactivated (status will be auto-calculated)`);
        } else {
          changes.push(`Status: "${oldItem.status || 'none'}" → "${newItem.status}"`);
        }
      }
    }
    if (updates.hasOwnProperty('brand_id') && oldItem.brand_id !== newItem.brand_id) {
      const oldBrand = oldItem.brand_name || '(none)';
      const newBrand = newItem.brand_name || '(none)';
      changes.push(`Brand: "${oldBrand}" → "${newBrand}"`);
    }
    if (updates.hasOwnProperty('warehouse_location_id') && oldItem.warehouse_location_id !== newItem.warehouse_location_id) {
      const oldLoc = oldItem.warehouse_location_name || '(none)';
      const newLoc = newItem.warehouse_location_name || '(none)';
      changes.push(`Location: "${oldLoc}" → "${newLoc}"`);
    }

    // Create the log description
    let logDescription;
    if (changes.length > 0) {
      logDescription = `Updated "${newItem.name}": ${changes.join(', ')}`;
    } else {
      logDescription = `Updated item "${newItem.name}" (no changes detected)`;
    }

    // Log activity for item update with detailed changes
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at)
      VALUES (?, 'updated', 'item', ?, ?, NOW())
    `, [req.user?.id, id, logDescription]);

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: {
        item: newItem
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
// @access  Private (requires canDeleteInventory permission)
router.delete('/:id', auth, requirePermission('inventory', 'delete'), async (req, res) => {
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

    const deletedItem = existingRows[0];
    const itemName = deletedItem?.name || 'Unknown';

    // Delete the item
    await pool.execute('DELETE FROM item WHERE id = ?', [id]);

    // Log activity for item deletion with detailed information
    const deleteDetails = [];
    deleteDetails.push(`Type: ${deletedItem.type}`);
    if (deletedItem.brand_name) deleteDetails.push(`Brand: ${deletedItem.brand_name}`);
    if (deletedItem.warehouse_location_name) deleteDetails.push(`Location: ${deletedItem.warehouse_location_name}`);
    deleteDetails.push(`Quantities - Delivered: ${deletedItem.delivered_quantity}, Available: ${deletedItem.available_quantity}, Damaged: ${deletedItem.damaged_quantity}, Lost: ${deletedItem.lost_quantity}`);

    const deleteLogDescription = `Deleted item "${itemName}". ${deleteDetails.join(', ')}`;

    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at)
      VALUES (?, 'deleted', 'item', ?, ?, NOW())
    `, [req.user?.id, id, deleteLogDescription]);

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
        l.province,
        CONCAT_WS(', ', NULLIF(l.street, ''), NULLIF(l.barangay, ''), l.city, l.province) as full_address
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

// @route   POST /api/inventory/brands
// @desc    Create a new brand
// @access  Private
router.post('/brands', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Brand name is required'
      });
    }

    // Check if brand already exists
    const [existingBrand] = await pool.execute(
      'SELECT id FROM brand WHERE LOWER(name) = LOWER(?)',
      [name.trim()]
    );

    if (existingBrand.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'A brand with this name already exists'
      });
    }

    // Insert new brand
    const [result] = await pool.execute(
      'INSERT INTO brand (name, description) VALUES (?, ?)',
      [name.trim(), description || null]
    );

    // Fetch the created brand
    const [newBrand] = await pool.execute(
      'SELECT id, name, description FROM brand WHERE id = ?',
      [result.insertId]
    );

    // Log activity
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at)
      VALUES (?, 'created', 'brand', ?, ?, NOW())
    `, [req.user?.id, result.insertId, `Created brand "${name.trim()}"`]);

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: {
        brand: newBrand[0]
      }
    });

  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating brand',
      details: error.message
    });
  }
});

// @route   PUT /api/inventory/:id/quantity
// @desc    Update item delivered quantity
// @access  Private
router.put('/:id/quantity', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { delivered_quantity } = req.body;

    if (!delivered_quantity || delivered_quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid delivered quantity is required'
      });
    }

    // Check if item exists
    const [existingRows] = await pool.execute('SELECT * FROM item WHERE id = ?', [id]);

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    const oldQuantity = existingRows[0].delivered_quantity;
    const quantityDifference = delivered_quantity - oldQuantity;

    // Update delivered quantity and adjust available quantity
    const newAvailableQuantity = existingRows[0].available_quantity + quantityDifference;

    await pool.execute(`
      UPDATE item 
      SET delivered_quantity = ?, available_quantity = ?, updated_at = NOW()
      WHERE id = ?
    `, [delivered_quantity, Math.max(0, newAvailableQuantity), id]);

    // Log the activity
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at)
      VALUES (?, 'quantity_updated', 'item', ?, ?, NOW())
    `, [
      req.user.id, 
      id, 
      `Delivered quantity updated from ${oldQuantity} to ${delivered_quantity}. Available quantity adjusted to ${Math.max(0, newAvailableQuantity)}.`
    ]);

    // Create inventory log
    if (quantityDifference !== 0) {
      await pool.execute(`
        INSERT INTO inventory_log (item_id, log_type, quantity, handled_by, remarks, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [
        id,
        quantityDifference > 0 ? 'in' : 'out',
        Math.abs(quantityDifference),
        req.user.id,
        `Quantity adjustment: ${quantityDifference > 0 ? 'increased' : 'decreased'} by ${Math.abs(quantityDifference)}`
      ]);
    }

    res.json({
      success: true,
      message: 'Quantity updated successfully',
      data: { delivered_quantity, available_quantity: Math.max(0, newAvailableQuantity) }
    });

  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating quantity'
    });
  }
});

// @route   PUT /api/inventory/:id/location
// @desc    Move item to different location
// @access  Private
router.put('/:id/location', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { warehouse_location_id } = req.body;

    // Check if item exists
    const [existingRows] = await pool.execute(`
      SELECT i.*, l.name as current_location_name 
      FROM item i 
      LEFT JOIN location l ON i.warehouse_location_id = l.id 
      WHERE i.id = ?
    `, [id]);

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Get new location name
    const [newLocationRows] = await pool.execute('SELECT name FROM location WHERE id = ?', [warehouse_location_id]);
    const newLocationName = newLocationRows.length > 0 ? newLocationRows[0].name : 'Unknown Location';

    const oldLocationId = existingRows[0].warehouse_location_id;
    const oldLocationName = existingRows[0].current_location_name || 'No Location';

    // Update location
    await pool.execute(`
      UPDATE item 
      SET warehouse_location_id = ?, updated_at = NOW()
      WHERE id = ?
    `, [warehouse_location_id, id]);

    // Log the activity
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at)
      VALUES (?, 'location_moved', 'item', ?, ?, NOW())
    `, [
      req.user.id, 
      id, 
      `Item moved from "${oldLocationName}" to "${newLocationName}"`
    ]);

    // Create inventory transfer log
    await pool.execute(`
      INSERT INTO inventory_log (item_id, log_type, quantity, from_location_id, to_location_id, handled_by, remarks, created_at)
      VALUES (?, 'transfer', ?, ?, ?, ?, ?, NOW())
    `, [
      id,
      existingRows[0].available_quantity,
      oldLocationId,
      warehouse_location_id,
      req.user.id,
      `Location transfer from "${oldLocationName}" to "${newLocationName}"`
    ]);

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: { warehouse_location_id, location_name: newLocationName }
    });

  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating location'
    });
  }
});

// @route   POST /api/inventory/:id/issue
// @desc    Report damage or loss issue
// @access  Private
router.post('/:id/issue', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { issue_type, quantity, description } = req.body;

    if (!['damage', 'loss'].includes(issue_type)) {
      return res.status(400).json({
        success: false,
        error: 'Issue type must be either "damage" or "loss"'
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required'
      });
    }

    // Check if item exists and has enough available quantity
    const [existingRows] = await pool.execute('SELECT * FROM item WHERE id = ?', [id]);

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    if (existingRows[0].available_quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Not enough available quantity to report this issue'
      });
    }

    // Update quantities
    const newAvailableQuantity = existingRows[0].available_quantity - quantity;
    const updateField = issue_type === 'damage' ? 'damaged_quantity' : 'lost_quantity';
    const currentIssueQuantity = existingRows[0][updateField];
    const newIssueQuantity = currentIssueQuantity + quantity;

    await pool.execute(`
      UPDATE item 
      SET available_quantity = ?, ${updateField} = ?, updated_at = NOW()
      WHERE id = ?
    `, [newAvailableQuantity, newIssueQuantity, id]);

    // Log the activity with detailed information
    const itemName = existingRows[0].name;
    const issueLabel = issue_type === 'damage' ? 'Damaged' : 'Lost';
    const logDescription = `Reported ${issueLabel} for "${itemName}": ${quantity} item(s). Available quantity: ${existingRows[0].available_quantity} → ${newAvailableQuantity}, ${issueLabel} quantity: ${currentIssueQuantity} → ${newIssueQuantity}${description ? `. Reason: ${description}` : ''}`;

    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at)
      VALUES (?, 'issue_reported', 'item', ?, ?, NOW())
    `, [
      req.user.id,
      id,
      logDescription
    ]);

    // Create damage/loss log
    await pool.execute(`
      INSERT INTO damage_loss_log (entity_type, entity_id, quantity, issue_type, reported_by, remarks, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      existingRows[0].type,
      id,
      quantity,
      issue_type,
      req.user.id,
      description || `${issue_type === 'damage' ? 'Damage' : 'Loss'} reported via inventory management`
    ]);

    // Create inventory log
    await pool.execute(`
      INSERT INTO inventory_log (item_id, log_type, quantity, handled_by, remarks, created_at)
      VALUES (?, 'out', ?, ?, ?, NOW())
    `, [
      id,
      quantity,
      req.user.id,
      `${issue_type === 'damage' ? 'Damaged' : 'Lost'} items: ${description || 'No description provided'}`
    ]);

    res.json({
      success: true,
      message: `${issue_type === 'damage' ? 'Damage' : 'Loss'} reported successfully`,
      data: { 
        available_quantity: newAvailableQuantity,
        [updateField]: newIssueQuantity 
      }
    });

  } catch (error) {
    console.error('Report issue error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error reporting issue'
    });
  }
});

// @route   GET /api/inventory/:id/activity
// @desc    Get activity logs for specific item
// @access  Private
router.get('/:id/activity', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const [existingRows] = await pool.execute('SELECT id FROM item WHERE id = ?', [id]);

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Get activity logs
    const [activityRows] = await pool.execute(`
      SELECT 
        al.id,
        al.action,
        al.description,
        al.created_at,
        CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM activity_log al
      LEFT JOIN user u ON al.user_id = u.id
      WHERE al.entity = 'item' AND al.entity_id = ?
      ORDER BY al.created_at DESC
      LIMIT 50
    `, [id]);

    res.json({
      success: true,
      message: 'Activity logs retrieved successfully',
      data: {
        activities: activityRows
      }
    });

  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving activity logs'
    });
  }
});

// @route   GET /api/inventory/:id/reservations
// @desc    Get all reservations for a specific item (items reserved for scheduled project days)
// @access  Private
router.get('/:id/reservations', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const [existingRows] = await pool.execute('SELECT id, name, reserved_quantity FROM item WHERE id = ?', [id]);

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    const item = existingRows[0];

    // Get all reservations (items allocated to scheduled project days)
    const [reservationsRows] = await pool.execute(`
      SELECT
        pi.id as project_item_id,
        pi.allocated_quantity as reserved_quantity,
        pd.id as project_day_id,
        pd.project_date,
        pd.status as day_status,
        p.id as project_id,
        p.jo_number,
        p.name as project_name,
        p.status as project_status
      FROM project_item pi
      JOIN project_day pd ON pi.project_day_id = pd.id
      JOIN project p ON pd.project_id = p.id
      WHERE pi.item_id = ?
        AND (pd.status = 'scheduled' OR pd.status IS NULL)
      ORDER BY pd.project_date ASC
    `, [id]);

    res.json({
      success: true,
      message: 'Reservations retrieved successfully',
      data: {
        item: {
          id: item.id,
          name: item.name,
          total_reserved: item.reserved_quantity
        },
        reservations: reservationsRows
      }
    });

  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving reservations'
    });
  }
});

// ====================
// MULTI-WAREHOUSE ENDPOINTS
// ====================

// @route   GET /api/inventory/:id/locations
// @desc    Get all locations with quantities for a specific item
// @access  Private
router.get('/:id/locations', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const [itemRows] = await pool.execute('SELECT id, name FROM item WHERE id = ?', [id]);

    if (itemRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Get total delivered from delivery_log (sum of all deliveries)
    const [deliveryRows] = await pool.execute(`
      SELECT COALESCE(SUM(quantity), 0) as total_delivered
      FROM delivery_log
      WHERE item_id = ? AND type = 'delivery'
    `, [id]);

    const totalDelivered = deliveryRows[0]?.total_delivered || 0;

    // Get all item_location records for this item
    const [locationRows] = await pool.execute(`
      SELECT
        il.id,
        il.item_id,
        il.location_id,
        l.name as location_name,
        l.type as location_type,
        l.city,
        l.province,
        il.quantity,
        il.reserved_quantity,
        (il.quantity - il.reserved_quantity - il.damaged_quantity - il.lost_quantity) as available_quantity,
        il.damaged_quantity,
        il.lost_quantity,
        il.created_at,
        il.updated_at
      FROM item_location il
      JOIN location l ON il.location_id = l.id
      WHERE il.item_id = ?
      ORDER BY il.quantity DESC, l.name ASC
    `, [id]);

    res.json({
      success: true,
      message: 'Item locations retrieved successfully',
      data: {
        item: {
          ...itemRows[0],
          total_delivered: totalDelivered
        },
        locations: locationRows
      }
    });

  } catch (error) {
    console.error('Get item locations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving item locations'
    });
  }
});

// @route   POST /api/inventory/:id/delivery
// @desc    Add a new delivery to a specific location (only increases quantity)
// @access  Private
router.post('/:id/delivery', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { location_id, quantity, reference_number, notes } = req.body;

    // Validate required fields
    if (!location_id) {
      return res.status(400).json({
        success: false,
        error: 'Location is required'
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be greater than 0'
      });
    }

    // Check if item exists
    const [itemRows] = await pool.execute('SELECT id, name FROM item WHERE id = ?', [id]);

    if (itemRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Check if location exists
    const [locationRows] = await pool.execute('SELECT id, name FROM location WHERE id = ?', [location_id]);

    if (locationRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    const itemName = itemRows[0].name;
    const locationName = locationRows[0].name;

    // Check if item_location record exists
    const [existingItemLocation] = await pool.execute(
      'SELECT id, quantity FROM item_location WHERE item_id = ? AND location_id = ?',
      [id, location_id]
    );

    if (existingItemLocation.length > 0) {
      // Update existing item_location record
      await pool.execute(`
        UPDATE item_location
        SET quantity = quantity + ?, updated_at = NOW()
        WHERE item_id = ? AND location_id = ?
      `, [quantity, id, location_id]);
    } else {
      // Create new item_location record
      await pool.execute(`
        INSERT INTO item_location (item_id, location_id, quantity, reserved_quantity, damaged_quantity, lost_quantity, created_at)
        VALUES (?, ?, ?, 0, 0, 0, NOW())
      `, [id, location_id, quantity]);

      // Update item's primary warehouse_location_id if not set
      const [itemCheck] = await pool.execute('SELECT warehouse_location_id FROM item WHERE id = ?', [id]);
      if (!itemCheck[0].warehouse_location_id) {
        await pool.execute('UPDATE item SET warehouse_location_id = ? WHERE id = ?', [location_id, id]);
      }
    }

    // Create delivery_log entry
    await pool.execute(`
      INSERT INTO delivery_log (item_id, location_id, quantity, type, notes, reference_number, performed_by, created_at)
      VALUES (?, ?, ?, 'delivery', ?, ?, ?, NOW())
    `, [id, location_id, quantity, notes || null, reference_number || null, req.user.id]);

    // Create activity log
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at)
      VALUES (?, 'delivery_added', 'item', ?, ?, NOW())
    `, [
      req.user.id,
      id,
      `Received delivery of ${quantity} units at "${locationName}"${reference_number ? ` (Ref: ${reference_number})` : ''}`
    ]);

    // Create inventory log
    await pool.execute(`
      INSERT INTO inventory_log (item_id, log_type, quantity, to_location_id, handled_by, reference_no, remarks, created_at)
      VALUES (?, 'in', ?, ?, ?, ?, ?, NOW())
    `, [id, quantity, location_id, req.user.id, reference_number || null, `Delivery received at ${locationName}`]);

    res.status(201).json({
      success: true,
      message: 'Delivery added successfully',
      data: {
        item_id: parseInt(id),
        location_id: location_id,
        quantity_added: quantity,
        reference_number: reference_number || null
      }
    });

  } catch (error) {
    console.error('Add delivery error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding delivery'
    });
  }
});

// @route   POST /api/inventory/:id/adjustment
// @desc    Make an admin adjustment to quantity (can increase or decrease, requires reason)
// @access  Private (Admin only)
router.post('/:id/adjustment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { location_id, quantity, reason } = req.body;

    // Check if user has edit permission for inventory
    const permissions = req.user?.permissions || {};
    const inventoryPerms = permissions.inventory || [];
    const isAdmin = req.user?.positionName === 'Administrator';

    if (!isAdmin && !inventoryPerms.includes('edit')) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to adjust inventory quantities'
      });
    }

    // Validate required fields
    if (!location_id) {
      return res.status(400).json({
        success: false,
        error: 'Location is required'
      });
    }

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        error: 'Quantity adjustment is required'
      });
    }

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Adjustment reason is required (minimum 5 characters)'
      });
    }

    // Check if item exists
    const [itemRows] = await pool.execute('SELECT id, name FROM item WHERE id = ?', [id]);

    if (itemRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Check if location exists
    const [locationRows] = await pool.execute('SELECT id, name FROM location WHERE id = ?', [location_id]);

    if (locationRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    const itemName = itemRows[0].name;
    const locationName = locationRows[0].name;

    // Check if item_location record exists
    const [existingItemLocation] = await pool.execute(
      'SELECT id, quantity, reserved_quantity, damaged_quantity, lost_quantity FROM item_location WHERE item_id = ? AND location_id = ?',
      [id, location_id]
    );

    if (existingItemLocation.length === 0) {
      // If no record exists and quantity is positive, create one
      if (quantity > 0) {
        await pool.execute(`
          INSERT INTO item_location (item_id, location_id, quantity, reserved_quantity, damaged_quantity, lost_quantity, created_at)
          VALUES (?, ?, ?, 0, 0, 0, NOW())
        `, [id, location_id, quantity]);
      } else {
        return res.status(400).json({
          success: false,
          error: 'No stock exists at this location to adjust'
        });
      }
    } else {
      const currentRecord = existingItemLocation[0];
      const newQuantity = currentRecord.quantity + quantity;
      const availableAtLocation = currentRecord.quantity - currentRecord.reserved_quantity - currentRecord.damaged_quantity - currentRecord.lost_quantity;

      // For negative adjustments, check there's enough available
      if (quantity < 0 && Math.abs(quantity) > availableAtLocation) {
        return res.status(400).json({
          success: false,
          error: `Cannot reduce by ${Math.abs(quantity)}. Only ${availableAtLocation} available at this location (${currentRecord.reserved_quantity} reserved)`
        });
      }

      if (newQuantity < 0) {
        return res.status(400).json({
          success: false,
          error: 'Adjustment would result in negative quantity'
        });
      }

      // Update item_location record
      await pool.execute(`
        UPDATE item_location
        SET quantity = ?, updated_at = NOW()
        WHERE item_id = ? AND location_id = ?
      `, [newQuantity, id, location_id]);
    }

    // Create delivery_log entry with type='adjustment'
    await pool.execute(`
      INSERT INTO delivery_log (item_id, location_id, quantity, type, adjustment_reason, notes, performed_by, created_at)
      VALUES (?, ?, ?, 'adjustment', ?, NULL, ?, NOW())
    `, [id, location_id, quantity, reason.trim(), req.user.id]);

    // Create activity log
    const adjustmentType = quantity > 0 ? 'increased' : 'decreased';
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at)
      VALUES (?, 'quantity_adjusted', 'item', ?, ?, NOW())
    `, [
      req.user.id,
      id,
      `Admin adjustment: ${adjustmentType} by ${Math.abs(quantity)} units at "${locationName}". Reason: ${reason.trim()}`
    ]);

    // Create inventory log
    await pool.execute(`
      INSERT INTO inventory_log (item_id, log_type, quantity, to_location_id, handled_by, remarks, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      id,
      quantity > 0 ? 'in' : 'out',
      Math.abs(quantity),
      location_id,
      req.user.id,
      `Admin adjustment: ${reason.trim()}`
    ]);

    res.status(200).json({
      success: true,
      message: 'Quantity adjusted successfully',
      data: {
        item_id: parseInt(id),
        location_id: location_id,
        quantity_adjusted: quantity,
        reason: reason.trim()
      }
    });

  } catch (error) {
    console.error('Quantity adjustment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error making adjustment'
    });
  }
});

// @route   POST /api/inventory/:id/transfer
// @desc    Transfer stock between locations
// @access  Private
router.post('/:id/transfer', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { from_location_id, to_location_id, quantity, notes } = req.body;

    // Validate required fields
    if (!from_location_id || !to_location_id) {
      return res.status(400).json({
        success: false,
        error: 'Both source and destination locations are required'
      });
    }

    if (from_location_id === to_location_id) {
      return res.status(400).json({
        success: false,
        error: 'Source and destination locations must be different'
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be greater than 0'
      });
    }

    // Check if item exists
    const [itemRows] = await pool.execute('SELECT id, name FROM item WHERE id = ?', [id]);

    if (itemRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Check if source location exists and has enough stock
    const [fromLocationRows] = await pool.execute('SELECT id, name FROM location WHERE id = ?', [from_location_id]);
    if (fromLocationRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Source location not found'
      });
    }

    // Check if destination location exists
    const [toLocationRows] = await pool.execute('SELECT id, name FROM location WHERE id = ?', [to_location_id]);
    if (toLocationRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Destination location not found'
      });
    }

    const itemName = itemRows[0].name;
    const fromLocationName = fromLocationRows[0].name;
    const toLocationName = toLocationRows[0].name;

    // Check if source item_location has enough available quantity
    const [sourceItemLocation] = await pool.execute(
      'SELECT id, quantity, reserved_quantity, damaged_quantity, lost_quantity FROM item_location WHERE item_id = ? AND location_id = ?',
      [id, from_location_id]
    );

    if (sourceItemLocation.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No stock exists at the source location'
      });
    }

    const sourceRecord = sourceItemLocation[0];
    const availableAtSource = sourceRecord.quantity - sourceRecord.reserved_quantity - sourceRecord.damaged_quantity - sourceRecord.lost_quantity;

    if (quantity > availableAtSource) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock at source. Available: ${availableAtSource}, Requested: ${quantity}`
      });
    }

    // Decrease quantity at source
    await pool.execute(`
      UPDATE item_location
      SET quantity = quantity - ?, updated_at = NOW()
      WHERE item_id = ? AND location_id = ?
    `, [quantity, id, from_location_id]);

    // Increase quantity at destination (or create record if doesn't exist)
    const [destItemLocation] = await pool.execute(
      'SELECT id FROM item_location WHERE item_id = ? AND location_id = ?',
      [id, to_location_id]
    );

    if (destItemLocation.length > 0) {
      await pool.execute(`
        UPDATE item_location
        SET quantity = quantity + ?, updated_at = NOW()
        WHERE item_id = ? AND location_id = ?
      `, [quantity, id, to_location_id]);
    } else {
      await pool.execute(`
        INSERT INTO item_location (item_id, location_id, quantity, reserved_quantity, damaged_quantity, lost_quantity, created_at)
        VALUES (?, ?, ?, 0, 0, 0, NOW())
      `, [id, to_location_id, quantity]);
    }

    // Create stock_transfer log
    await pool.execute(`
      INSERT INTO stock_transfer (item_id, from_location_id, to_location_id, quantity, notes, performed_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [id, from_location_id, to_location_id, quantity, notes || null, req.user.id]);

    // Create activity log
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at)
      VALUES (?, 'stock_transferred', 'item', ?, ?, NOW())
    `, [
      req.user.id,
      id,
      `Transferred ${quantity} units from "${fromLocationName}" to "${toLocationName}"${notes ? `. Notes: ${notes}` : ''}`
    ]);

    // Create inventory log
    await pool.execute(`
      INSERT INTO inventory_log (item_id, log_type, quantity, from_location_id, to_location_id, handled_by, remarks, created_at)
      VALUES (?, 'transfer', ?, ?, ?, ?, ?, NOW())
    `, [id, quantity, from_location_id, to_location_id, req.user.id, `Stock transfer${notes ? `: ${notes}` : ''}`]);

    res.status(200).json({
      success: true,
      message: 'Stock transferred successfully',
      data: {
        item_id: parseInt(id),
        from_location_id: from_location_id,
        to_location_id: to_location_id,
        quantity_transferred: quantity
      }
    });

  } catch (error) {
    console.error('Stock transfer error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error transferring stock'
    });
  }
});

// @route   POST /api/inventory/:id/outstock
// @desc    Remove stock from location (return excess to client)
// @access  Private (requires inventory edit permission)
router.post('/:id/outstock', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { location_id, quantity, reference_number, notes } = req.body;

    // Check if user has edit permission for inventory
    const permissions = req.user?.permissions || {};
    const inventoryPerms = permissions.inventory || [];
    const isAdmin = req.user?.positionName === 'Administrator';

    if (!isAdmin && !inventoryPerms.includes('edit')) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action'
      });
    }

    // Validate required fields
    if (!location_id) {
      return res.status(400).json({
        success: false,
        error: 'Location is required'
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be greater than 0'
      });
    }

    // Check if item exists
    const [itemRows] = await pool.execute('SELECT id, name FROM item WHERE id = ?', [id]);

    if (itemRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Check if location exists
    const [locationRows] = await pool.execute('SELECT id, name FROM location WHERE id = ?', [location_id]);

    if (locationRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    const itemName = itemRows[0].name;
    const locationName = locationRows[0].name;

    // Check if item_location record exists and has enough stock
    const [existingItemLocation] = await pool.execute(
      'SELECT id, quantity, reserved_quantity, damaged_quantity, lost_quantity FROM item_location WHERE item_id = ? AND location_id = ?',
      [id, location_id]
    );

    if (existingItemLocation.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No stock exists at this location'
      });
    }

    const currentRecord = existingItemLocation[0];
    const availableQuantity = currentRecord.quantity - currentRecord.reserved_quantity - currentRecord.damaged_quantity - currentRecord.lost_quantity;

    if (quantity > availableQuantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient available stock. Available: ${availableQuantity}, Requested: ${quantity}`
      });
    }

    // Decrease quantity in item_location
    await pool.execute(`
      UPDATE item_location
      SET quantity = quantity - ?, updated_at = NOW()
      WHERE item_id = ? AND location_id = ?
    `, [quantity, id, location_id]);

    // Create delivery_log entry with type='out'
    await pool.execute(`
      INSERT INTO delivery_log (item_id, location_id, quantity, type, notes, reference_number, performed_by, created_at)
      VALUES (?, ?, ?, 'out', ?, ?, ?, NOW())
    `, [id, location_id, quantity, notes || null, reference_number || null, req.user.id]);

    // Create activity log
    await pool.execute(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at)
      VALUES (?, 'stock_out', 'item', ?, ?, NOW())
    `, [
      req.user.id,
      id,
      `Removed ${quantity} units from "${locationName}" (returned to client)${reference_number ? ` (Ref: ${reference_number})` : ''}`
    ]);

    // Create inventory log
    await pool.execute(`
      INSERT INTO inventory_log (item_id, log_type, quantity, from_location_id, handled_by, reference_no, remarks, created_at)
      VALUES (?, 'out', ?, ?, ?, ?, ?, NOW())
    `, [id, quantity, location_id, req.user.id, reference_number || null, `Stock out from ${locationName}${notes ? `: ${notes}` : ''}`]);

    res.status(200).json({
      success: true,
      message: 'Stock removed successfully',
      data: {
        item_id: parseInt(id),
        location_id: location_id,
        quantity_removed: quantity,
        reference_number: reference_number || null
      }
    });

  } catch (error) {
    console.error('Out stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error removing stock'
    });
  }
});

// @route   GET /api/inventory/:id/deliveries
// @desc    Get delivery and adjustment history for an item
// @access  Private
router.get('/:id/deliveries', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const [itemRows] = await pool.execute('SELECT id, name FROM item WHERE id = ?', [id]);

    if (itemRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Get delivery log entries
    const [deliveryRows] = await pool.execute(`
      SELECT
        dl.id,
        dl.item_id,
        dl.location_id,
        l.name as location_name,
        dl.quantity,
        dl.type,
        dl.adjustment_reason,
        dl.notes,
        dl.reference_number,
        dl.performed_by,
        CONCAT(u.first_name, ' ', u.last_name) as performed_by_name,
        dl.created_at
      FROM delivery_log dl
      JOIN location l ON dl.location_id = l.id
      LEFT JOIN user u ON dl.performed_by = u.id
      WHERE dl.item_id = ?
      ORDER BY dl.created_at DESC
      LIMIT 100
    `, [id]);

    res.json({
      success: true,
      message: 'Delivery history retrieved successfully',
      data: {
        item: itemRows[0],
        deliveries: deliveryRows
      }
    });

  } catch (error) {
    console.error('Get delivery history error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving delivery history'
    });
  }
});

module.exports = router;