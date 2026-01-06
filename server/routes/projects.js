const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth, requirePermission } = require('../middleware/auth');

// Real-time event emitters
const {
  emitProjectCreated,
  emitProjectUpdated,
  emitProjectDeleted,
} = require('../socket/events');

/**
 * @route   GET /api/projects
 * @desc    Get all projects with filters and pagination
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      dateFrom,
      dateTo,
      location,
      createdBy,
      hasItems
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = '1=1';
    const queryParams = [];

    // Add status filter
    if (status && status !== 'all') {
      whereClause += ' AND p.status = ?';
      queryParams.push(status);
    }

    // Add search filter
    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.jo_number LIKE ? OR p.description LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Add date range filter (created date)
    if (dateFrom) {
      whereClause += ' AND DATE(p.created_at) >= ?';
      queryParams.push(dateFrom);
    }

    if (dateTo) {
      whereClause += ' AND DATE(p.created_at) <= ?';
      queryParams.push(dateTo);
    }

    // Add location filter
    if (location) {
      whereClause += ' AND EXISTS (SELECT 1 FROM project_day pd2 WHERE pd2.project_id = p.id AND pd2.location_id = ?)';
      queryParams.push(location);
    }

    // Add created by filter
    if (createdBy) {
      whereClause += ' AND p.created_by = ?';
      queryParams.push(createdBy);
    }

    // Add has items filter
    if (hasItems !== undefined) {
      if (hasItems === 'true' || hasItems === true) {
        whereClause += ' AND EXISTS (SELECT 1 FROM project_day pd3 INNER JOIN project_item pi3 ON pd3.id = pi3.project_day_id WHERE pd3.project_id = p.id)';
      } else {
        whereClause += ' AND NOT EXISTS (SELECT 1 FROM project_day pd3 INNER JOIN project_item pi3 ON pd3.id = pi3.project_day_id WHERE pd3.project_id = p.id)';
      }
    }

    // Auto-update project statuses based on project_day dates
    const today = new Date().toISOString().split('T')[0];

    // Update 'upcoming' projects to 'ongoing' if they have started
    await db.query(`
      UPDATE project p
      SET p.status = 'ongoing'
      WHERE p.status = 'upcoming'
        AND EXISTS (
          SELECT 1 FROM project_day pd
          WHERE pd.project_id = p.id AND pd.project_date <= ?
        )
    `, [today]);

    // Update 'ongoing' projects to 'completed' if all days are past
    await db.query(`
      UPDATE project p
      SET p.status = 'completed'
      WHERE p.status = 'ongoing'
        AND EXISTS (SELECT 1 FROM project_day pd WHERE pd.project_id = p.id)
        AND NOT EXISTS (
          SELECT 1 FROM project_day pd
          WHERE pd.project_id = p.id AND pd.project_date > ?
        )
    `, [today]);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM project p
      WHERE ${whereClause}
    `;
    const countResult = await db.query(countQuery, queryParams);
    const totalProjects = countResult[0].total;

    // Get projects with details
    const projectsQuery = `
      SELECT 
        p.id as project_id,
        p.jo_number,
        p.name as project_name,
        p.description,
        p.status,
        p.created_at,
        p.updated_at,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        COUNT(DISTINCT pd.id) as total_project_days,
        COUNT(DISTINCT pi.id) as total_allocated_items,
        COALESCE(SUM(pi.allocated_quantity), 0) as total_allocated_quantity,
        GROUP_CONCAT(DISTINCT l.name ORDER BY l.name SEPARATOR ', ') as project_locations
      FROM project p
      LEFT JOIN user u ON p.created_by = u.id
      LEFT JOIN project_day pd ON p.id = pd.project_id
      LEFT JOIN project_item pi ON pd.id = pi.project_day_id
      LEFT JOIN location l ON pd.location_id = l.id
      WHERE ${whereClause}
      GROUP BY p.id, p.jo_number, p.name, p.description, p.status, p.created_at, p.updated_at, u.first_name, u.last_name
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const projects = await db.query(projectsQuery, queryParams);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProjects / limit),
          totalProjects,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/projects/next-jo-number
 * @desc    Generate next JO number based on current year and latest project
 * @access  Private
 */
router.get('/next-jo-number', auth, async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const joPrefix = `JO-${currentYear}-`;

    // Find the latest JO number for the current year
    const latestQuery = `
      SELECT jo_number
      FROM project
      WHERE jo_number LIKE ?
      ORDER BY jo_number DESC
      LIMIT 1
    `;

    const result = await db.query(latestQuery, [`${joPrefix}%`]);

    let nextNumber = 1;

    if (result.length > 0) {
      // Extract the number part from the latest JO number (e.g., "JO-2026-005" -> 5)
      const latestJoNumber = result[0].jo_number;
      const numberPart = latestJoNumber.replace(joPrefix, '');
      const currentNumber = parseInt(numberPart, 10);

      if (!isNaN(currentNumber)) {
        nextNumber = currentNumber + 1;
      }
    }

    // Format with leading zeros (e.g., 001, 012, 123)
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    const nextJoNumber = `${joPrefix}${formattedNumber}`;

    res.json({
      success: true,
      data: {
        jo_number: nextJoNumber,
        year: currentYear,
        sequence: nextNumber
      }
    });
  } catch (error) {
    console.error('Error generating next JO number:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating JO number',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/projects/stats
 * @desc    Get projects statistics
 * @access  Private
 */
router.get('/stats', auth, async (req, res) => {
  try {
    // Get project counts by status
    const statsQuery = `
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming_projects,
        COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_projects
      FROM project
    `;

    const statsResult = await db.query(statsQuery);
    const stats = statsResult[0];

    // Get recent project activity (last 7 days)
    const recentActivityQuery = `
      SELECT COUNT(*) as recent_activity
      FROM project 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `;

    const recentActivityResult = await db.query(recentActivityQuery);
    const recentActivity = recentActivityResult[0].recent_activity;

    // Get total allocated items across all projects
    const allocatedItemsQuery = `
      SELECT 
        COUNT(DISTINCT pi.item_id) as total_items_allocated,
        COALESCE(SUM(pi.allocated_quantity), 0) as total_quantity_allocated
      FROM project_item pi
      JOIN project_day pd ON pi.project_day_id = pd.id
      JOIN project p ON pd.project_id = p.id
      WHERE p.status IN ('upcoming', 'ongoing')
    `;

    const allocatedItemsResult = await db.query(allocatedItemsQuery);
    const allocatedItems = allocatedItemsResult[0];

    res.json({
      success: true,
      data: {
        ...stats,
        recent_activity: recentActivity,
        total_items_allocated: allocatedItems.total_items_allocated,
        total_quantity_allocated: allocatedItems.total_quantity_allocated
      }
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project with full details
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get project basic info
    const projectQuery = `
      SELECT 
        p.id as project_id,
        p.jo_number,
        p.name as project_name,
        p.description,
        p.status,
        p.created_at,
        p.updated_at,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM project p
      LEFT JOIN user u ON p.created_by = u.id
      WHERE p.id = ?
    `;

    const projectResult = await db.query(projectQuery, [id]);
    
    if (projectResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = projectResult[0];

    // Get project days with locations
    const projectDaysQuery = `
      SELECT 
        pd.id as project_day_id,
        pd.project_date,
        l.id as location_id,
        l.name as location_name,
        l.type as location_type,
        l.city,
        l.province,
        COUNT(pi.id) as total_items,
        COALESCE(SUM(pi.allocated_quantity), 0) as total_allocated_quantity
      FROM project_day pd
      LEFT JOIN location l ON pd.location_id = l.id
      LEFT JOIN project_item pi ON pd.id = pi.project_day_id
      WHERE pd.project_id = ?
      GROUP BY pd.id, pd.project_date, l.id, l.name, l.type, l.city, l.province
      ORDER BY pd.project_date ASC
    `;

    const projectDays = await db.query(projectDaysQuery, [id]);

    // Get project items summary
    const projectItemsQuery = `
      SELECT 
        i.id as item_id,
        i.name as item_name,
        i.type as item_type,
        b.name as brand_name,
        SUM(pi.allocated_quantity) as total_allocated,
        SUM(pi.damaged_quantity) as total_damaged,
        SUM(pi.lost_quantity) as total_lost,
        SUM(pi.returned_quantity) as total_returned
      FROM project_item pi
      JOIN project_day pd ON pi.project_day_id = pd.id
      JOIN item i ON pi.item_id = i.id
      LEFT JOIN brand b ON i.brand_id = b.id
      WHERE pd.project_id = ?
      GROUP BY i.id, i.name, i.type, b.name
      ORDER BY i.name ASC
    `;

    const projectItems = await db.query(projectItemsQuery, [id]);

    res.json({
      success: true,
      data: {
        project,
        project_days: projectDays,
        project_items: projectItems
      }
    });
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project details',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Private (requires canAddProject permission)
 */
router.post('/', auth, requirePermission('projects', 'add'), async (req, res) => {
  try {
    const { jo_number, name, description, status = 'upcoming' } = req.body;
    const created_by = req.user.id;

    // Validate required fields
    if (!jo_number || !name) {
      return res.status(400).json({
        success: false,
        message: 'JO Number and Project Name are required'
      });
    }

    // Check if JO number already exists
    const existingProject = await db.query(
      'SELECT id FROM project WHERE jo_number = ?',
      [jo_number]
    );

    if (existingProject.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'JO Number already exists'
      });
    }

    // Insert new project
    const insertQuery = `
      INSERT INTO project (jo_number, name, description, status, created_by)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await db.query(insertQuery, [jo_number, name, description, status, created_by]);
    const projectId = result.insertId;

    // Get the created project details
    const newProjectQuery = `
      SELECT 
        p.id as project_id,
        p.jo_number,
        p.name as project_name,
        p.description,
        p.status,
        p.created_at,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM project p
      LEFT JOIN user u ON p.created_by = u.id
      WHERE p.id = ?
    `;

    const newProject = await db.query(newProjectQuery, [projectId]);

    // Log activity for project creation
    await db.query(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at)
      VALUES (?, 'created', 'project', ?, ?, NOW())
    `, [req.user?.id, projectId, `Created project "${name}" (${jo_number})`]);

    // Emit real-time event for new project
    emitProjectCreated(projectId, newProject[0], req.user);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: newProject[0]
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private (requires canEditProject permission)
 */
router.put('/:id', auth, requirePermission('projects', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { jo_number, name, description, status, cancellation_reason } = req.body;

    // Check if project exists
    const existingProject = await db.query('SELECT id, status FROM project WHERE id = ?', [id]);

    if (existingProject.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Validate: if status is being set to 'cancelled', cancellation_reason is required
    if (status === 'cancelled' && (!cancellation_reason || cancellation_reason.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required when cancelling a project'
      });
    }

    // Check if JO number is being changed and if it already exists
    if (jo_number) {
      const duplicateJO = await db.query(
        'SELECT id FROM project WHERE jo_number = ? AND id != ?',
        [jo_number, id]
      );

      if (duplicateJO.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'JO Number already exists'
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (jo_number) {
      updateFields.push('jo_number = ?');
      updateValues.push(jo_number);
    }
    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);

      // Handle cancellation_reason based on status
      if (status === 'cancelled') {
        updateFields.push('cancellation_reason = ?');
        updateValues.push(cancellation_reason.trim());
      } else {
        // Clear cancellation_reason when reactivating from cancelled
        updateFields.push('cancellation_reason = ?');
        updateValues.push(null);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    const updateQuery = `UPDATE project SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.query(updateQuery, updateValues);

    // Get updated project details
    const updatedProjectQuery = `
      SELECT
        p.id as project_id,
        p.jo_number,
        p.name as project_name,
        p.description,
        p.status,
        p.cancellation_reason,
        p.created_at,
        p.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM project p
      LEFT JOIN user u ON p.created_by = u.id
      WHERE p.id = ?
    `;

    const updatedProject = await db.query(updatedProjectQuery, [id]);

    // Log activity for project update
    const projectName = updatedProject[0]?.project_name || 'Unknown';
    let logDescription = `Updated project "${projectName}"`;
    if (status === 'cancelled') {
      logDescription = `Cancelled project "${projectName}". Reason: ${cancellation_reason.trim()}`;
    } else if (existingProject[0].status === 'cancelled' && status && status !== 'cancelled') {
      logDescription = `Reactivated project "${projectName}" (status changed to ${status})`;
    }

    await db.query(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at)
      VALUES (?, 'updated', 'project', ?, ?, NOW())
    `, [req.user?.id, id, logDescription]);

    // Emit real-time event for updated project
    emitProjectUpdated(id, updatedProject[0], req.user, updatedProject[0].jo_number);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject[0]
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project (soft delete by changing status)
 * @access  Private (requires canDeleteProject permission)
 */
router.delete('/:id', auth, requirePermission('projects', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project exists and get name for logging
    const existingProject = await db.query('SELECT id, name, jo_number, status FROM project WHERE id = ?', [id]);

    if (existingProject.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const projectName = existingProject[0]?.name || 'Unknown';
    const joNumber = existingProject[0]?.jo_number || '';

    // Update project status to cancelled (soft delete)
    await db.query(
      'UPDATE project SET status = ?, updated_at = NOW() WHERE id = ?',
      ['cancelled', id]
    );

    // Log activity for project deletion
    await db.query(`
      INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at)
      VALUES (?, 'deleted', 'project', ?, ?, NOW())
    `, [req.user?.id, id, `Cancelled project "${projectName}" (${joNumber})`]);

    // Emit real-time event for deleted project
    emitProjectDeleted(id, req.user, joNumber);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
});

module.exports = router;