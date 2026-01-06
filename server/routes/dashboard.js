const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard overview statistics
 * @access  Private
 */
router.get('/stats', auth, async (req, res) => {
  try {
    // Get total stocks (sum of available quantities)
    const stocksResult = await db.query(`
      SELECT COALESCE(SUM(available_quantity), 0) as total_stocks
      FROM item 
      WHERE status = 'active'
    `);

    // Get active projects count
    const projectsResult = await db.query(`
      SELECT COUNT(*) as total_projects
      FROM project 
      WHERE status IN ('ongoing', 'upcoming')
    `);

    // Get total locations count (project sites + warehouses)
    const locationsResult = await db.query(`
      SELECT COUNT(*) as total_locations
      FROM location 
      WHERE is_active = TRUE
    `);

    // Get total personnel count
    const personnelResult = await db.query(`
      SELECT COUNT(*) as total_personnel
      FROM personnel 
      WHERE is_active = TRUE
    `);

    // Get low stock items (available_quantity < 10)
    const lowStockResult = await db.query(`
      SELECT COUNT(*) as low_stock_items
      FROM item 
      WHERE available_quantity < 10 AND status = 'active'
    `);

    // Get items allocated today
    const todayAllocationsResult = await db.query(`
      SELECT COALESCE(SUM(pi.allocated_quantity), 0) as today_allocations
      FROM project_item pi
      JOIN project_day pd ON pi.project_day_id = pd.id
      WHERE DATE(pd.project_date) = CURDATE()
      AND pi.status = 'allocated'
    `);

    const stats = {
      totalStocks: stocksResult[0].total_stocks,
      activeProjects: projectsResult[0].total_projects,
      totalLocations: locationsResult[0].total_locations,
      totalPersonnel: personnelResult[0].total_personnel,
      lowStockItems: lowStockResult[0].low_stock_items,
      todayAllocations: todayAllocationsResult[0].today_allocations
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

/**
 * @route   GET /api/dashboard/recent-projects
 * @desc    Get recent projects with their details
 * @access  Private
 */
router.get('/recent-projects', auth, async (req, res) => {
  try {
    const projects = await db.query(`
      SELECT 
        p.id,
        p.jo_number,
        p.name,
        p.description,
        p.status,
        p.created_at,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        COUNT(DISTINCT pd.id) as total_days,
        COUNT(DISTINCT pi.id) as total_items_allocated
      FROM project p
      LEFT JOIN user u ON p.created_by = u.id
      LEFT JOIN project_day pd ON p.id = pd.project_id
      LEFT JOIN project_item pi ON pd.id = pi.project_day_id
      WHERE p.status IN ('ongoing', 'upcoming')
      GROUP BY p.id, p.jo_number, p.name, p.description, p.status, p.created_at, u.first_name, u.last_name
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    res.json(projects);
  } catch (error) {
    console.error('Error fetching recent projects:', error);
    res.status(500).json({ error: 'Failed to fetch recent projects' });
  }
});

/**
 * @route   GET /api/dashboard/inventory-logs
 * @desc    Get recent inventory logs
 * @access  Private
 */
router.get('/inventory-logs', auth, async (req, res) => {
  try {
    const logs = await db.query(`
      SELECT 
        il.id,
        il.log_type,
        il.reference_no,
        il.quantity,
        il.remarks,
        il.created_at,
        i.name as item_name,
        i.type as item_type,
        from_loc.name as from_location_name,
        to_loc.name as to_location_name,
        u.first_name as handler_first_name,
        u.last_name as handler_last_name
      FROM inventory_log il
      JOIN item i ON il.item_id = i.id
      LEFT JOIN location from_loc ON il.from_location_id = from_loc.id
      LEFT JOIN location to_loc ON il.to_location_id = to_loc.id
      LEFT JOIN user u ON il.handled_by = u.id
      ORDER BY il.created_at DESC
      LIMIT 10
    `);

    res.json(logs);
  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    res.status(500).json({ error: 'Failed to fetch inventory logs' });
  }
});

/**
 * @route   GET /api/dashboard/activity-logs
 * @desc    Get recent activity logs
 * @access  Private
 */
router.get('/activity-logs', auth, async (req, res) => {
  try {
    const logs = await db.query(`
      SELECT 
        al.id,
        al.action,
        al.entity,
        al.entity_id,
        al.description,
        al.created_at,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM activity_log al
      LEFT JOIN user u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

/**
 * @route   GET /api/dashboard/activity-logs/all
 * @desc    Get all activity logs with pagination
 * @access  Private
 */
router.get('/activity-logs/all', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM activity_log al LEFT JOIN user u ON al.user_id = u.id`;
    let countParams = [];

    if (search) {
      countQuery += ` WHERE al.description LIKE ? OR al.action LIKE ? OR al.entity LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?`;
      const searchPattern = `%${search}%`;
      countParams = [searchPattern, searchPattern, searchPattern, searchPattern];
    }

    const countResult = await db.query(countQuery, countParams);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated logs
    let logsQuery = `
      SELECT
        al.id,
        al.action,
        al.entity,
        al.entity_id,
        al.description,
        al.created_at,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM activity_log al
      LEFT JOIN user u ON al.user_id = u.id
    `;
    let logsParams = [];

    if (search) {
      logsQuery += ` WHERE al.description LIKE ? OR al.action LIKE ? OR al.entity LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?`;
      const searchPattern = `%${search}%`;
      logsParams = [searchPattern, searchPattern, searchPattern, searchPattern];
    }

    logsQuery += ` ORDER BY al.created_at DESC LIMIT ? OFFSET ?`;
    logsParams.push(limit, offset);

    const logs = await db.query(logsQuery, logsParams);

    res.json({
      data: logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching all activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

/**
 * @route   GET /api/dashboard/inventory-logs/all
 * @desc    Get all inventory logs with pagination
 * @access  Private
 */
router.get('/inventory-logs/all', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const logType = req.query.type || '';

    // Build WHERE clauses
    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push(`(i.name LIKE ? OR il.reference_no LIKE ? OR il.remarks LIKE ?)`);
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (logType && ['in', 'out', 'transfer'].includes(logType)) {
      whereConditions.push(`il.log_type = ?`);
      params.push(logType);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM inventory_log il
      JOIN item i ON il.item_id = i.id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated logs
    const logsQuery = `
      SELECT
        il.id,
        il.log_type,
        il.reference_no,
        il.quantity,
        il.remarks,
        il.created_at,
        i.name as item_name,
        i.type as item_type,
        from_loc.name as from_location_name,
        to_loc.name as to_location_name,
        u.first_name as handler_first_name,
        u.last_name as handler_last_name
      FROM inventory_log il
      JOIN item i ON il.item_id = i.id
      LEFT JOIN location from_loc ON il.from_location_id = from_loc.id
      LEFT JOIN location to_loc ON il.to_location_id = to_loc.id
      LEFT JOIN user u ON il.handled_by = u.id
      ${whereClause}
      ORDER BY il.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const logs = await db.query(logsQuery, [...params, limit, offset]);

    res.json({
      data: logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching all inventory logs:', error);
    res.status(500).json({ error: 'Failed to fetch inventory logs' });
  }
});

/**
 * @route   GET /api/dashboard/low-stock-items
 * @desc    Get items with low stock levels
 * @access  Private
 */
router.get('/low-stock-items', auth, async (req, res) => {
  try {
    const items = await db.query(`
      SELECT 
        i.id,
        i.name,
        i.type,
        i.available_quantity,
        i.delivered_quantity,
        b.name as brand_name,
        l.name as warehouse_name
      FROM item i
      LEFT JOIN brand b ON i.brand_id = b.id
      LEFT JOIN location l ON i.warehouse_location_id = l.id
      WHERE i.available_quantity < 20 AND i.status = 'active'
      ORDER BY i.available_quantity ASC
      LIMIT 10
    `);

    res.json(items);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

/**
 * @route   GET /api/dashboard/inventory-summary
 * @desc    Get inventory summary by category
 * @access  Private
 */
router.get('/inventory-summary', auth, async (req, res) => {
  try {
    const summary = await db.query(`
      SELECT 
        i.type,
        COUNT(*) as item_count,
        SUM(i.available_quantity) as total_quantity,
        SUM(i.delivered_quantity) as total_delivered,
        SUM(i.damaged_quantity) as total_damaged,
        SUM(i.lost_quantity) as total_lost
      FROM item i
      WHERE i.status = 'active'
      GROUP BY i.type
    `);

    res.json(summary);
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    res.status(500).json({ error: 'Failed to fetch inventory summary' });
  }
});

module.exports = router;
