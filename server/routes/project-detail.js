const express = require('express');
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');
const router = express.Router();

/**
 * GET /api/project-detail/jo/:joNumber
 * Fetch complete project details by JO number including:
 * - Project info
 * - Project days with locations
 * - Project items by day
 * - Project personnel by day
 * - Project logs
 */
router.get('/jo/:joNumber', async (req, res) => {
  const { joNumber } = req.params;
  
  try {
    // 1. Get project basic info
    const projectQuery = `
      SELECT 
        p.id,
        p.jo_number,
        p.name,
        p.description,
        p.status,
        p.created_by,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        p.created_at,
        p.updated_at
      FROM project p
      LEFT JOIN user u ON p.created_by = u.id
      WHERE p.jo_number = ?
    `;
    
    const [projectRows] = await pool.execute(projectQuery, [joNumber]);
    
    if (projectRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    
    const project = projectRows[0];
    
    // 2. Get project days with locations
    const projectDaysQuery = `
      SELECT 
        pd.id,
        pd.project_id,
        pd.project_date,
        pd.location_id,
        l.name as location_name,
        l.type as location_type,
        CONCAT(l.street, ', ', l.barangay, ', ', l.city, ', ', l.province) as full_address,
        pd.created_at,
        pd.updated_at
      FROM project_day pd
      LEFT JOIN location l ON pd.location_id = l.id
      WHERE pd.project_id = ?
      ORDER BY pd.project_date ASC
    `;
    
    const [projectDaysRows] = await pool.execute(projectDaysQuery, [project.id]);
    
    // 3. Get project items by day
    const projectItemsQuery = `
      SELECT 
        pi.id,
        pi.project_day_id,
        pi.item_id,
        pi.allocated_quantity,
        pi.damaged_quantity,
        pi.lost_quantity,
        pi.returned_quantity,
        pi.status,
        i.name as item_name,
        i.type as item_type,
        b.name as brand_name,
        wl.name as warehouse_location,
        pi.created_at,
        pi.updated_at
      FROM project_item pi
      JOIN item i ON pi.item_id = i.id
      LEFT JOIN brand b ON i.brand_id = b.id
      LEFT JOIN location wl ON i.warehouse_location_id = wl.id
      WHERE pi.project_day_id IN (${projectDaysRows.map(() => '?').join(',')})
      ORDER BY pi.project_day_id ASC, i.name ASC
    `;
    
    let projectItemsRows = [];
    if (projectDaysRows.length > 0) {
      const dayIds = projectDaysRows.map(day => day.id);
      const [itemsResult] = await pool.execute(projectItemsQuery, dayIds);
      projectItemsRows = itemsResult;
    }
    
    // 4. Get project personnel by day
    const projectPersonnelQuery = `
      SELECT 
        pp.project_day_id,
        pp.personnel_id,
        pp.role_id,
        per.name as personnel_name,
        per.contact_number,
        r.name as role_name
      FROM project_personnel pp
      JOIN personnel per ON pp.personnel_id = per.id
      JOIN role r ON pp.role_id = r.id
      WHERE pp.project_day_id IN (${projectDaysRows.map(() => '?').join(',')})
      ORDER BY pp.project_day_id ASC, r.name ASC, per.name ASC
    `;
    
    let projectPersonnelRows = [];
    if (projectDaysRows.length > 0) {
      const dayIds = projectDaysRows.map(day => day.id);
      const [personnelResult] = await pool.execute(projectPersonnelQuery, dayIds);
      projectPersonnelRows = personnelResult;
    }
    
    // 5. Get project logs
    const projectLogsQuery = `
      SELECT 
        pl.id,
        pl.project_id,
        pl.project_day_id,
        pl.log_type,
        pl.description,
        pl.recorded_by,
        CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name,
        pl.created_at
      FROM project_log pl
      LEFT JOIN user u ON pl.recorded_by = u.id
      WHERE pl.project_id = ?
      ORDER BY pl.created_at DESC
    `;
    
    const [projectLogsRows] = await pool.execute(projectLogsQuery, [project.id]);
    
    // 6. Organize data structure
    const projectDays = projectDaysRows.map(day => {
      // Get items for this day
      const dayItems = projectItemsRows.filter(item => item.project_day_id === day.id);
      
      // Get personnel for this day
      const dayPersonnel = projectPersonnelRows.filter(personnel => personnel.project_day_id === day.id);
      
      return {
        ...day,
        items: dayItems,
        personnel: dayPersonnel
      };
    });
    
    const response = {
      success: true,
      data: {
        project: project,
        project_days: projectDays,
        logs: projectLogsRows
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * GET /api/project-detail/items/:joNumber
 * Get available items for adding to project (items not currently allocated)
 */
router.get('/items/:joNumber', async (req, res) => {
  try {
    const availableItemsQuery = `
      SELECT 
        i.id,
        i.name,
        i.type,
        i.description,
        i.delivered_quantity,
        i.available_quantity,
        i.damaged_quantity,
        i.lost_quantity,
        b.name as brand_name,
        wl.name as warehouse_location
      FROM item i
      LEFT JOIN brand b ON i.brand_id = b.id
      LEFT JOIN location wl ON i.warehouse_location_id = wl.id
      ORDER BY i.type ASC, i.name ASC
    `;
    
    const [itemsRows] = await pool.execute(availableItemsQuery);
    
    res.json({
      success: true,
      data: itemsRows
    });
    
  } catch (error) {
    console.error('Error fetching available items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * GET /api/project-detail/personnel
 * Get available personnel and roles for assignment
 */
router.get('/personnel', async (req, res) => {
  try {
    // Get all active personnel
    const personnelQuery = `
      SELECT 
        id,
        name,
        contact_number,
        is_active
      FROM personnel
      WHERE is_active = true
      ORDER BY name ASC
    `;
    
    const [personnelRows] = await pool.execute(personnelQuery);
    
    // Get all roles
    const rolesQuery = `
      SELECT 
        id,
        name
      FROM role
      ORDER BY name ASC
    `;
    
    const [rolesRows] = await pool.execute(rolesQuery);
    
    res.json({
      success: true,
      data: {
        personnel: personnelRows,
        roles: rolesRows
      }
    });
    
  } catch (error) {
    console.error('Error fetching personnel and roles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * GET /api/project-detail/debug-permissions
 * Debug endpoint to check user permissions (remove in production)
 */
router.get('/debug-permissions', auth, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      hasPermissions: !!req.user?.permissions,
      permissions: req.user?.permissions || null,
      canManageProjects: req.user?.permissions?.canManageProjects,
      canEditProject: req.user?.permissions?.canEditProject
    }
  });
});

/**
 * GET /api/project-detail/locations
 * Get all active locations
 */
router.get('/locations', async (req, res) => {
  try {
    const locationsQuery = `
      SELECT 
        id,
        name,
        type,
        street,
        barangay,
        city,
        province,
        region,
        postal_code,
        country,
        CONCAT(street, ', ', barangay, ', ', city, ', ', province) as full_address
      FROM location
      WHERE is_active = true
      ORDER BY type ASC, name ASC
    `;
    
    const [locationsRows] = await pool.execute(locationsQuery);
    
    res.json({
      success: true,
      data: locationsRows
    });
    
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * POST /api/project-detail/personnel
 * Add personnel to project day(s)
 */
router.post('/personnel', async (req, res) => {
  const { joNumber, project_day_ids, personnel_assignments } = req.body;
  
  try {
    // Validate required fields
    if (!joNumber || !project_day_ids || !personnel_assignments || !Array.isArray(project_day_ids) || !Array.isArray(personnel_assignments)) {
      return res.status(400).json({
        success: false,
        message: 'joNumber, project_day_ids and personnel_assignments arrays are required'
      });
    }

    // Get project ID from JO number
    const projectQuery = 'SELECT id FROM project WHERE jo_number = ?';
    const [projectRows] = await pool.execute(projectQuery, [joNumber]);
    
    if (projectRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const projectId = projectRows[0].id;
    const results = [];
    const addedPersonnel = [];
    
    // Process each personnel assignment
    for (const assignment of personnel_assignments) {
      const { personnel_id, role_id } = assignment;
      
      if (!personnel_id || !role_id) {
        continue; // Skip invalid assignments
      }

      // Get personnel and role names for logging
      const personnelQuery = 'SELECT name FROM personnel WHERE id = ?';
      const roleQuery = 'SELECT name FROM role WHERE id = ?';
      const [personnelResult] = await pool.execute(personnelQuery, [personnel_id]);
      const [roleResult] = await pool.execute(roleQuery, [role_id]);
      
      const personnelName = personnelResult[0]?.name || 'Unknown';
      const roleName = roleResult[0]?.name || 'Unknown';

      // Insert personnel for each specified project day
      for (const dayId of project_day_ids) {
        try {
          // Check if assignment already exists
          const checkQuery = `
            SELECT COUNT(*) as count 
            FROM project_personnel 
            WHERE project_day_id = ? AND personnel_id = ? AND role_id = ?
          `;
          
          const [checkResult] = await pool.execute(checkQuery, [dayId, personnel_id, role_id]);
          
          if (checkResult[0].count === 0) {
            // Insert new assignment
            const insertQuery = `
              INSERT INTO project_personnel (project_day_id, personnel_id, role_id)
              VALUES (?, ?, ?)
            `;
            
            await pool.execute(insertQuery, [dayId, personnel_id, role_id]);
            
            results.push({
              project_day_id: dayId,
              personnel_id,
              role_id,
              status: 'added'
            });
            
            // Track for logging
            if (!addedPersonnel.some(p => p.personnel_id === personnel_id && p.role_id === role_id)) {
              addedPersonnel.push({ personnel_name: personnelName, role_name: roleName });
            }
          } else {
            results.push({
              project_day_id: dayId,
              personnel_id,
              role_id,
              status: 'already_exists'
            });
          }
        } catch (error) {
          console.error('Error adding personnel assignment:', error);
          results.push({
            project_day_id: dayId,
            personnel_id,
            role_id,
            status: 'error',
            error: error.message
          });
        }
      }
    }
    
    // Log the personnel addition activity
    if (addedPersonnel.length > 0) {
      const logDescription = `Added personnel: ${addedPersonnel.map(p => `${p.personnel_name} as ${p.role_name}`).join(', ')} to ${project_day_ids.length} project day(s)`;
      
      const logQuery = `
        INSERT INTO project_log (project_id, log_type, description, recorded_by, created_at)
        VALUES (?, 'activity', ?, ?, NOW())
      `;
      
      // Note: In a real app, you'd get the user ID from authentication middleware
      // For now, we'll use NULL or you can add a recorded_by field to the request
      await pool.execute(logQuery, [projectId, logDescription, req.body.recorded_by || null]);
    }
    
    res.json({
      success: true,
      message: 'Personnel assignments processed',
      data: results
    });
    
  } catch (error) {
    console.error('Error processing personnel assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/project-detail/personnel/:joNumber/:projectDayId/:personnelId/:roleId
 * Remove personnel from project day
 */
router.delete('/personnel/:joNumber/:projectDayId/:personnelId/:roleId', async (req, res) => {
  const { joNumber, projectDayId, personnelId, roleId } = req.params;
  
  try {
    // Get project ID and personnel/role names for logging
    const projectQuery = 'SELECT id FROM project WHERE jo_number = ?';
    const [projectRows] = await pool.execute(projectQuery, [joNumber]);
    
    if (projectRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const projectId = projectRows[0].id;
    
    // Get personnel and role names before deletion
    const personnelQuery = 'SELECT name FROM personnel WHERE id = ?';
    const roleQuery = 'SELECT name FROM role WHERE id = ?';
    const [personnelResult] = await pool.execute(personnelQuery, [personnelId]);
    const [roleResult] = await pool.execute(roleQuery, [roleId]);
    
    const personnelName = personnelResult[0]?.name || 'Unknown';
    const roleName = roleResult[0]?.name || 'Unknown';
    
    const deleteQuery = `
      DELETE FROM project_personnel 
      WHERE project_day_id = ? AND personnel_id = ? AND role_id = ?
    `;
    
    const [result] = await pool.execute(deleteQuery, [projectDayId, personnelId, roleId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Personnel assignment not found'
      });
    }
    
    // Log the personnel removal activity
    const logDescription = `Removed personnel: ${personnelName} (${roleName}) from project day`;
    const logQuery = `
      INSERT INTO project_log (project_id, project_day_id, log_type, description, recorded_by, created_at)
      VALUES (?, ?, 'activity', ?, ?, NOW())
    `;
    
    await pool.execute(logQuery, [projectId, projectDayId, logDescription, req.body?.recorded_by || null]);
    
    res.json({
      success: true,
      message: 'Personnel removed from project day'
    });
    
  } catch (error) {
    console.error('Error removing personnel:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/project-detail/project-days
 * Add new project day
 */
router.post('/project-days', async (req, res) => {
  const { project_id, project_date, location_id } = req.body;
  
  try {
    // Validate required fields
    if (!project_id || !project_date) {
      return res.status(400).json({
        success: false,
        message: 'project_id and project_date are required'
      });
    }

    // Check if project day already exists
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM project_day 
      WHERE project_id = ? AND project_date = ?
    `;
    
    const [checkResult] = await pool.execute(checkQuery, [project_id, project_date]);
    
    if (checkResult[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Project day already exists for this date'
      });
    }

    // Insert new project day
    const insertQuery = `
      INSERT INTO project_day (project_id, project_date, location_id, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    
    const [result] = await pool.execute(insertQuery, [project_id, project_date, location_id]);
    
    // Log the project day creation activity
    let locationName = '';
    if (location_id) {
      const locationQuery = 'SELECT name FROM location WHERE id = ?';
      const [locationResult] = await pool.execute(locationQuery, [location_id]);
      locationName = locationResult[0]?.name || 'Unknown Location';
    }
    
    const logQuery = `
      INSERT INTO project_log (project_id, project_day_id, log_type, description, recorded_by, created_at)
      VALUES (?, ?, 'activity', ?, ?, NOW())
    `;
    
    const formattedDate = new Date(project_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const logDescription = `Project day added for ${formattedDate}${locationName ? ` at ${locationName}` : ''}`;
    await pool.execute(logQuery, [project_id, result.insertId, logDescription, req.user?.id || null]);
    
    // Fetch the created project day with location details
    const fetchQuery = `
      SELECT 
        pd.id,
        pd.project_id,
        pd.project_date,
        pd.location_id,
        l.name as location_name,
        l.type as location_type,
        CONCAT(l.street, ', ', l.barangay, ', ', l.city, ', ', l.province) as full_address,
        pd.created_at,
        pd.updated_at
      FROM project_day pd
      LEFT JOIN location l ON pd.location_id = l.id
      WHERE pd.id = ?
    `;
    
    const [projectDayRows] = await pool.execute(fetchQuery, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Project day created successfully',
      data: projectDayRows[0]
    });
    
  } catch (error) {
    console.error('Error creating project day:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/project-detail/project-days/:id
 * Update project day
 */
router.put('/project-days/:id', async (req, res) => {
  const { id } = req.params;
  const { project_date, location_id } = req.body;
  
  try {
    // Validate required fields
    if (!project_date) {
      return res.status(400).json({
        success: false,
        message: 'project_date is required'
      });
    }

    // Get original project day data for logging
    const originalQuery = `
      SELECT pd.project_id, pd.project_date, pd.location_id, l.name as location_name
      FROM project_day pd
      LEFT JOIN location l ON pd.location_id = l.id
      WHERE pd.id = ?
    `;
    const [originalResult] = await pool.execute(originalQuery, [id]);
    
    if (originalResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project day not found'
      });
    }

    const originalData = originalResult[0];

    // Update project day
    const updateQuery = `
      UPDATE project_day 
      SET project_date = ?, location_id = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const [result] = await pool.execute(updateQuery, [project_date, location_id, id]);
    
    // Log the project day update activity
    const changes = [];
    if (originalData.project_date !== project_date) {
      const originalFormatted = new Date(originalData.project_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const newFormatted = new Date(project_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      changes.push(`date changed from ${originalFormatted} to ${newFormatted}`);
    }
    if (originalData.location_id !== location_id) {
      const newLocationQuery = 'SELECT name FROM location WHERE id = ?';
      let newLocationName = 'No location';
      if (location_id) {
        const [locationResult] = await pool.execute(newLocationQuery, [location_id]);
        newLocationName = locationResult[0]?.name || 'Unknown location';
      }
      changes.push(`location changed from ${originalData.location_name || 'No location'} to ${newLocationName}`);
    }
    
    if (changes.length > 0) {
      const logQuery = `
        INSERT INTO project_log (project_id, project_day_id, log_type, description, recorded_by, created_at)
        VALUES (?, ?, 'activity', ?, ?, NOW())
      `;
      const logDescription = `Project day updated: ${changes.join(', ')}`;
      await pool.execute(logQuery, [originalData.project_id, id, logDescription, req.user?.id || null]);
    }

    // Fetch the updated project day with location details
    const fetchQuery = `
      SELECT 
        pd.id,
        pd.project_id,
        pd.project_date,
        pd.location_id,
        l.name as location_name,
        l.type as location_type,
        CONCAT(l.street, ', ', l.barangay, ', ', l.city, ', ', l.province) as full_address,
        pd.created_at,
        pd.updated_at
      FROM project_day pd
      LEFT JOIN location l ON pd.location_id = l.id
      WHERE pd.id = ?
    `;
    
    const [projectDayRows] = await pool.execute(fetchQuery, [id]);
    
    res.json({
      success: true,
      message: 'Project day updated successfully',
      data: projectDayRows[0]
    });
    
  } catch (error) {
    console.error('Error updating project day:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/project-detail/project-days/:id
 * Delete project day
 */
router.delete('/project-days/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if project day has associated items or personnel
    const checkItemsQuery = 'SELECT COUNT(*) as count FROM project_item WHERE project_day_id = ?';
    const checkPersonnelQuery = 'SELECT COUNT(*) as count FROM project_personnel WHERE project_day_id = ?';
    
    const [itemsResult] = await pool.execute(checkItemsQuery, [id]);
    const [personnelResult] = await pool.execute(checkPersonnelQuery, [id]);
    
    if (itemsResult[0].count > 0 || personnelResult[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete project day with associated items or personnel'
      });
    }

    // Get project day data for logging before deletion
    const projectDayQuery = `
      SELECT pd.project_id, pd.project_date, l.name as location_name
      FROM project_day pd
      LEFT JOIN location l ON pd.location_id = l.id
      WHERE pd.id = ?
    `;
    const [projectDayResult] = await pool.execute(projectDayQuery, [id]);
    
    if (projectDayResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project day not found'
      });
    }

    const projectDayData = projectDayResult[0];

    // Delete project day
    const deleteQuery = 'DELETE FROM project_day WHERE id = ?';
    const [result] = await pool.execute(deleteQuery, [id]);
    
    // Log the project day deletion activity
    const logQuery = `
      INSERT INTO project_log (project_id, project_day_id, log_type, description, recorded_by, created_at)
      VALUES (?, NULL, 'activity', ?, ?, NOW())
    `;
    const formattedDate = new Date(projectDayData.project_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const logDescription = `Project day deleted: ${formattedDate}${projectDayData.location_name ? ` at ${projectDayData.location_name}` : ''}`;
    await pool.execute(logQuery, [projectDayData.project_id, logDescription, req.user?.id || null]);
    
    res.json({
      success: true,
      message: 'Project day deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting project day:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/project-detail/project-items
 * Add items to project day(s)
 */
router.post('/project-items', auth, async (req, res) => {
  // Check permissions - user must be able to manage projects or add to projects
  const userPermissions = req.user?.permissions;
  
  // Allow if user is Administrator or has proper permissions
  const isAdmin = req.user?.positionName === 'Administrator';
  const hasPermissions = userPermissions && (userPermissions.canManageProjects || userPermissions.canAddProject);
  
  if (!isAdmin && !hasPermissions) {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions to add project items'
    });
  }

  const { joNumber, project_day_ids, item_assignments } = req.body;
  
  try {
    // Validate required fields
    if (!joNumber || !project_day_ids || !item_assignments || !Array.isArray(project_day_ids) || !Array.isArray(item_assignments)) {
      return res.status(400).json({
        success: false,
        message: 'joNumber, project_day_ids and item_assignments arrays are required'
      });
    }

    // Get project ID from JO number
    const projectQuery = 'SELECT id FROM project WHERE jo_number = ?';
    const [projectRows] = await pool.execute(projectQuery, [joNumber]);
    
    if (projectRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const projectId = projectRows[0].id;
    const results = [];
    const addedItems = [];
    
    // Process each item assignment
    for (const assignment of item_assignments) {
      const { item_id, allocated_quantity, status = 'pending' } = assignment;
      
      if (!item_id || !allocated_quantity) {
        continue; // Skip invalid assignments
      }

      // Check item availability and get item name
      const itemQuery = 'SELECT available_quantity, name FROM item WHERE id = ?';
      const [itemResult] = await pool.execute(itemQuery, [item_id]);
      
      if (itemResult.length === 0) {
        results.push({
          item_id,
          status: 'error',
          error: 'Item not found'
        });
        continue;
      }

      const availableQuantity = itemResult[0].available_quantity;
      const itemName = itemResult[0].name;
      const totalNeeded = allocated_quantity * project_day_ids.length;

      if (availableQuantity < totalNeeded) {
        results.push({
          item_id,
          status: 'error',
          error: `Insufficient quantity. Available: ${availableQuantity}, Needed: ${totalNeeded}`
        });
        continue;
      }

      // Insert item for each specified project day
      for (const dayId of project_day_ids) {
        try {
          // Check if item assignment already exists
          const checkQuery = `
            SELECT id, allocated_quantity 
            FROM project_item 
            WHERE project_day_id = ? AND item_id = ?
          `;
          
          const [checkResult] = await pool.execute(checkQuery, [dayId, item_id]);
          
          if (checkResult.length === 0) {
            // Insert new assignment
            const insertQuery = `
              INSERT INTO project_item (project_day_id, item_id, allocated_quantity, damaged_quantity, lost_quantity, returned_quantity, status, created_at, updated_at)
              VALUES (?, ?, ?, 0, 0, 0, ?, NOW(), NOW())
            `;
            
            const [insertResult] = await pool.execute(insertQuery, [dayId, item_id, allocated_quantity, status]);
            
            // Update item available quantity
            const updateItemQuery = 'UPDATE item SET available_quantity = available_quantity - ? WHERE id = ?';
            await pool.execute(updateItemQuery, [allocated_quantity, item_id]);
            
            results.push({
              id: insertResult.insertId,
              project_day_id: dayId,
              item_id,
              allocated_quantity,
              status: 'added'
            });
            
            // Track for logging
            if (!addedItems.some(i => i.item_id === item_id)) {
              addedItems.push({ item_name: itemName, allocated_quantity });
            }
          } else {
            // Update existing assignment
            const existingQuantity = checkResult[0].allocated_quantity;
            const newQuantity = existingQuantity + allocated_quantity;
            
            const updateQuery = `
              UPDATE project_item 
              SET allocated_quantity = ?, updated_at = NOW()
              WHERE project_day_id = ? AND item_id = ?
            `;
            
            await pool.execute(updateQuery, [newQuantity, dayId, item_id]);
            
            // Update item available quantity
            const updateItemQuery = 'UPDATE item SET available_quantity = available_quantity - ? WHERE id = ?';
            await pool.execute(updateItemQuery, [allocated_quantity, item_id]);
            
            results.push({
              project_day_id: dayId,
              item_id,
              allocated_quantity: newQuantity,
              status: 'updated'
            });
            
            // Track for logging
            if (!addedItems.some(i => i.item_id === item_id)) {
              addedItems.push({ item_name: itemName, allocated_quantity });
            }
          }
        } catch (error) {
          console.error('Error adding item assignment:', error);
          results.push({
            project_day_id: dayId,
            item_id,
            status: 'error',
            error: error.message
          });
        }
      }
    }
    
    // Log the item addition activity
    if (addedItems.length > 0) {
      const logDescription = `Added items: ${addedItems.map(i => `${i.item_name} (${i.allocated_quantity})`).join(', ')} to ${project_day_ids.length} project day(s)`;
      
      const logQuery = `
        INSERT INTO project_log (project_id, log_type, description, recorded_by, created_at)
        VALUES (?, 'activity', ?, ?, NOW())
      `;
      
      await pool.execute(logQuery, [projectId, logDescription, req.body.recorded_by || null]);
    }
    
    res.json({
      success: true,
      message: 'Item assignments processed',
      data: results
    });
    
  } catch (error) {
    console.error('Error processing item assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/project-detail/project-items/:id
 * Update project item quantities
 */
router.put('/project-items/:id', auth, async (req, res) => {
  // Check permissions - user must be able to manage projects or edit projects
  const userPermissions = req.user?.permissions;
  
  // Debug logging
  console.log('PUT project-items - User permissions:', userPermissions);
  console.log('PUT project-items - User position name:', req.user?.positionName);
  
  // Allow access for Administrator position or if they have the right permissions
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Allow if user is Administrator or has proper permissions
  const isAdmin = req.user.positionName === 'Administrator';
  const hasPermissions = userPermissions && (userPermissions.canManageProjects || userPermissions.canEditProject);
  
  if (!isAdmin && !hasPermissions) {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions to update project items',
      debug: {
        isAdmin,
        hasPermissions,
        positionName: req.user.positionName,
        permissions: userPermissions
      }
    });
  }
  const { id } = req.params;
  const { allocated_quantity, damaged_quantity, lost_quantity, returned_quantity, status } = req.body;
  
  try {
    // Get current item data with related info for logging
    const getCurrentQuery = `
      SELECT pi.*, pd.project_id, i.name as item_name
      FROM project_item pi
      JOIN project_day pd ON pi.project_day_id = pd.id
      JOIN item i ON pi.item_id = i.id
      WHERE pi.id = ?
    `;
    const [currentResult] = await pool.execute(getCurrentQuery, [id]);
    
    if (currentResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project item not found'
      });
    }

    const currentItem = currentResult[0];
    
    // Calculate quantity differences for inventory adjustment
    const allocatedDiff = (allocated_quantity || currentItem.allocated_quantity) - currentItem.allocated_quantity;
    
    // Update project item
    const updateQuery = `
      UPDATE project_item 
      SET 
        allocated_quantity = COALESCE(?, allocated_quantity),
        damaged_quantity = COALESCE(?, damaged_quantity),
        lost_quantity = COALESCE(?, lost_quantity),
        returned_quantity = COALESCE(?, returned_quantity),
        status = COALESCE(?, status),
        updated_at = NOW()
      WHERE id = ?
    `;
    
    const [result] = await pool.execute(updateQuery, [
      allocated_quantity, damaged_quantity, lost_quantity, returned_quantity, status, id
    ]);
    
    // Update item inventory if allocated quantity changed
    if (allocatedDiff !== 0) {
      const updateItemQuery = 'UPDATE item SET available_quantity = available_quantity - ? WHERE id = ?';
      await pool.execute(updateItemQuery, [allocatedDiff, currentItem.item_id]);
    }
    
    // If items are returned, add back to inventory
    const returnedDiff = (returned_quantity || currentItem.returned_quantity) - currentItem.returned_quantity;
    if (returnedDiff > 0) {
      const updateReturnQuery = 'UPDATE item SET available_quantity = available_quantity + ? WHERE id = ?';
      await pool.execute(updateReturnQuery, [returnedDiff, currentItem.item_id]);
    }

    // Log the project item update activity
    const changes = [];
    if (allocated_quantity !== undefined && allocated_quantity !== currentItem.allocated_quantity) {
      changes.push(`allocated quantity changed from ${currentItem.allocated_quantity} to ${allocated_quantity}`);
    }
    if (damaged_quantity !== undefined && damaged_quantity !== currentItem.damaged_quantity) {
      changes.push(`damaged quantity changed from ${currentItem.damaged_quantity} to ${damaged_quantity}`);
    }
    if (lost_quantity !== undefined && lost_quantity !== currentItem.lost_quantity) {
      changes.push(`lost quantity changed from ${currentItem.lost_quantity} to ${lost_quantity}`);
    }
    if (returned_quantity !== undefined && returned_quantity !== currentItem.returned_quantity) {
      changes.push(`returned quantity changed from ${currentItem.returned_quantity} to ${returned_quantity}`);
    }
    if (status !== undefined && status !== currentItem.status) {
      changes.push(`status changed from ${currentItem.status} to ${status}`);
    }
    
    if (changes.length > 0) {
      const logQuery = `
        INSERT INTO project_log (project_id, project_day_id, log_type, description, recorded_by, created_at)
        VALUES (?, ?, 'activity', ?, ?, NOW())
      `;
      const logDescription = `Project item "${currentItem.item_name}" updated: ${changes.join(', ')}`;
      await pool.execute(logQuery, [currentItem.project_id, currentItem.project_day_id, logDescription, req.user?.id || null]);
    }
    
    res.json({
      success: true,
      message: 'Project item updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating project item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/project-detail/project-items/:id
 * Remove item from project
 */
router.delete('/project-items/:id', auth, async (req, res) => {
  // Check permissions - user must be able to manage projects or delete projects
  const userPermissions = req.user?.permissions;
  
  // Allow if user is Administrator or has proper permissions
  const isAdmin = req.user?.positionName === 'Administrator';
  const hasPermissions = userPermissions && (userPermissions.canManageProjects || userPermissions.canDeleteProject);
  
  if (!isAdmin && !hasPermissions) {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions to delete project items'
    });
  }
  const { id } = req.params;
  
  try {
    // Get item details before deletion for inventory adjustment and logging
    const getItemQuery = `
      SELECT pi.item_id, pi.allocated_quantity, pd.project_id, i.name as item_name
      FROM project_item pi
      JOIN project_day pd ON pi.project_day_id = pd.id
      JOIN item i ON pi.item_id = i.id
      WHERE pi.id = ?
    `;
    const [itemResult] = await pool.execute(getItemQuery, [id]);
    
    if (itemResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project item not found'
      });
    }

    const { item_id, allocated_quantity, project_id, item_name } = itemResult[0];
    
    // Delete project item
    const deleteQuery = 'DELETE FROM project_item WHERE id = ?';
    await pool.execute(deleteQuery, [id]);
    
    // Return allocated quantity back to inventory
    const updateItemQuery = 'UPDATE item SET available_quantity = available_quantity + ? WHERE id = ?';
    await pool.execute(updateItemQuery, [allocated_quantity, item_id]);

    // Log the project item deletion activity
    const logQuery = `
      INSERT INTO project_log (project_id, project_day_id, log_type, description, recorded_by, created_at)
      VALUES (?, NULL, 'activity', ?, ?, NOW())
    `;
    const logDescription = `Project item "${item_name}" removed (${allocated_quantity} units returned to inventory)`;
    await pool.execute(logQuery, [project_id, logDescription, req.user?.id || null]);
    
    res.json({
      success: true,
      message: 'Project item removed successfully'
    });
    
  } catch (error) {
    console.error('Error removing project item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/project-detail/create-item-and-assign
 * Create a new inventory item and optionally assign it to project days
 */
router.post('/create-item-and-assign', async (req, res) => {
  const { 
    joNumber, 
    project_day_ids, 
    apply_to_all_schedules,
    // Item data
    type,
    brand_id,
    name,
    description,
    allocated_quantity,
    damaged_quantity,
    lost_quantity,
    returned_quantity,
    warehouse_location_id
  } = req.body;
  
  try {
    // Validate required fields
    if (!joNumber || !name || !type) {
      return res.status(400).json({
        success: false,
        message: 'joNumber, name, and type are required'
      });
    }

    // Get project info
    const projectQuery = 'SELECT id FROM project WHERE jo_number = ?';
    const [projectRows] = await pool.execute(projectQuery, [joNumber]);
    
    if (projectRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const projectId = projectRows[0].id;

    // Create the inventory item first
    const createItemQuery = `
      INSERT INTO item (
        type, brand_id, name, description, 
        allocated_quantity, damaged_quantity, lost_quantity, returned_quantity,
        warehouse_location_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const [itemResult] = await pool.execute(createItemQuery, [
      type,
      brand_id || null,
      name,
      description || null,
      allocated_quantity || 0,
      damaged_quantity || 0,
      lost_quantity || 0,
      returned_quantity || 0,
      warehouse_location_id || null
    ]);
    
    const itemId = itemResult.insertId;
    const results = [];

    // Determine which project days to assign to
    let targetDayIds = [];
    
    if (apply_to_all_schedules) {
      // Get all project day IDs for this project
      const allDaysQuery = 'SELECT id FROM project_day WHERE project_id = ? ORDER BY project_date ASC';
      const [allDaysResult] = await pool.execute(allDaysQuery, [projectId]);
      targetDayIds = allDaysResult.map(day => day.id);
    } else if (project_day_ids && project_day_ids.length > 0) {
      targetDayIds = project_day_ids;
    }

    // Assign item to project days if specified
    if (targetDayIds.length > 0 && allocated_quantity > 0) {
      for (const dayId of targetDayIds) {
        try {
          // Check if project day exists and belongs to the project
          const dayCheckQuery = `
            SELECT id FROM project_day 
            WHERE id = ? AND project_id = ?
          `;
          const [dayCheckResult] = await pool.execute(dayCheckQuery, [dayId, projectId]);
          
          if (dayCheckResult.length === 0) {
            results.push({
              project_day_id: dayId,
              status: 'error',
              error: 'Project day not found or does not belong to this project'
            });
            continue;
          }

          // Check if item assignment already exists for this day
          const checkQuery = `
            SELECT id, allocated_quantity 
            FROM project_item 
            WHERE project_day_id = ? AND item_id = ?
          `;
          
          const [checkResult] = await pool.execute(checkQuery, [dayId, itemId]);
          
          if (checkResult.length === 0) {
            // Insert new assignment
            const insertQuery = `
              INSERT INTO project_item (
                project_day_id, item_id, allocated_quantity, 
                damaged_quantity, lost_quantity, returned_quantity,
                status, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
            `;
            
            const [insertResult] = await pool.execute(insertQuery, [
              dayId, itemId, allocated_quantity || 0,
              damaged_quantity || 0, lost_quantity || 0, returned_quantity || 0
            ]);
            
            results.push({
              id: insertResult.insertId,
              project_day_id: dayId,
              item_id: itemId,
              allocated_quantity: allocated_quantity || 0,
              status: 'assigned'
            });
          } else {
            // Update existing assignment
            const existingQuantity = checkResult[0].allocated_quantity;
            const newQuantity = existingQuantity + (allocated_quantity || 0);
            
            const updateQuery = `
              UPDATE project_item 
              SET allocated_quantity = ?, 
                  damaged_quantity = damaged_quantity + ?,
                  lost_quantity = lost_quantity + ?,
                  returned_quantity = returned_quantity + ?,
                  updated_at = NOW()
              WHERE project_day_id = ? AND item_id = ?
            `;
            
            await pool.execute(updateQuery, [
              newQuantity,
              damaged_quantity || 0,
              lost_quantity || 0,
              returned_quantity || 0,
              dayId, 
              itemId
            ]);
            
            results.push({
              project_day_id: dayId,
              item_id: itemId,
              allocated_quantity: newQuantity,
              status: 'updated'
            });
          }
        } catch (error) {
          console.error('Error assigning item to project day:', error);
          results.push({
            project_day_id: dayId,
            status: 'error',
            error: error.message
          });
        }
      }
    }

    // Fetch the created item with related data for response
    const fetchItemQuery = `
      SELECT 
        i.*,
        b.name as brand_name,
        l.name as warehouse_location_name
      FROM item i
      LEFT JOIN brand b ON i.brand_id = b.id
      LEFT JOIN location l ON i.warehouse_location_id = l.id
      WHERE i.id = ?
    `;
    
    const [itemData] = await pool.execute(fetchItemQuery, [itemId]);

    res.status(201).json({
      success: true,
      message: `Inventory item created successfully${results.length > 0 ? ' and assigned to project days' : ''}`,
      data: {
        item: itemData[0],
        assignments: results,
        assigned_to_days: targetDayIds.length,
        apply_to_all_schedules: apply_to_all_schedules || false
      }
    });
    
  } catch (error) {
    console.error('Error creating item and assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Add multiple existing items to project
 * POST /api/project-detail/add-items
 * @body {string} joNumber - JO number of the project
 * @body {number[]} project_day_ids - Array of project day IDs to assign items to
 * @body {Array} item_assignments - Array of items to assign [{item_id, allocated_quantity, status}]
 */
router.post('/add-items', async (req, res) => {
  try {
    const { joNumber, project_day_ids, item_assignments } = req.body;

    // Validate input
    if (!joNumber || !project_day_ids || !Array.isArray(project_day_ids) || project_day_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'JO number and project_day_ids are required'
      });
    }

    if (!item_assignments || !Array.isArray(item_assignments) || item_assignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'item_assignments array is required and must not be empty'
      });
    }

    // Get project information
    const projectQuery = 'SELECT id FROM project WHERE jo_number = ?';
    const [projectRows] = await pool.execute(projectQuery, [joNumber]);
    
    if (projectRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const projectId = projectRows[0].id;
    const results = [];

    // Validate all project days belong to the project
    const dayValidationQuery = `
      SELECT id FROM project_day 
      WHERE id IN (${project_day_ids.map(() => '?').join(',')}) 
      AND project_id = ?
    `;
    const [validDays] = await pool.execute(dayValidationQuery, [...project_day_ids, projectId]);
    
    if (validDays.length !== project_day_ids.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more project days do not belong to this project'
      });
    }

    // Validate all items exist
    const itemIds = item_assignments.map(assignment => assignment.item_id);
    const itemValidationQuery = `
      SELECT id FROM item 
      WHERE id IN (${itemIds.map(() => '?').join(',')})
    `;
    const [validItems] = await pool.execute(itemValidationQuery, itemIds);
    
    if (validItems.length !== itemIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more items do not exist'
      });
    }

    // Process each item assignment for each project day
    for (const dayId of project_day_ids) {
      for (const assignment of item_assignments) {
        const { item_id, allocated_quantity, status } = assignment;
        
        try {
          // Check if item assignment already exists for this day
          const checkQuery = `
            SELECT id, allocated_quantity 
            FROM project_item 
            WHERE project_day_id = ? AND item_id = ?
          `;
          
          const [checkResult] = await pool.execute(checkQuery, [dayId, item_id]);
          
          if (checkResult.length === 0) {
            // Insert new assignment
            const insertQuery = `
              INSERT INTO project_item (
                project_day_id, item_id, allocated_quantity, 
                status, created_at, updated_at
              ) VALUES (?, ?, ?, ?, NOW(), NOW())
            `;
            
            const [insertResult] = await pool.execute(insertQuery, [
              dayId, item_id, allocated_quantity || 0, status || 'pending'
            ]);
            
            results.push({
              id: insertResult.insertId,
              project_day_id: dayId,
              item_id: item_id,
              allocated_quantity: allocated_quantity || 0,
              status: 'assigned'
            });
          } else {
            // Update existing assignment by adding quantities
            const existingQuantity = checkResult[0].allocated_quantity;
            const newQuantity = existingQuantity + (allocated_quantity || 0);
            
            const updateQuery = `
              UPDATE project_item 
              SET allocated_quantity = ?, 
                  status = ?,
                  updated_at = NOW()
              WHERE project_day_id = ? AND item_id = ?
            `;
            
            await pool.execute(updateQuery, [
              newQuantity,
              status || 'allocated',
              dayId, 
              item_id
            ]);
            
            results.push({
              project_day_id: dayId,
              item_id: item_id,
              allocated_quantity: newQuantity,
              status: 'updated'
            });
          }
        } catch (error) {
          console.error('Error assigning item to project day:', error);
          results.push({
            project_day_id: dayId,
            item_id: item_id,
            status: 'error',
            error: error.message
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully processed ${item_assignments.length} items for ${project_day_ids.length} project day(s)`,
      data: {
        assignments: results,
        items_processed: item_assignments.length,
        days_affected: project_day_ids.length,
        total_assignments: results.length
      }
    });
    
  } catch (error) {
    console.error('Error adding items to project:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;