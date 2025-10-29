const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/calendar/events
 * @desc    Get all calendar events for projects
 * @access  Private
 */
router.get('/events', auth, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Base query to get project events with location details
    let query = `
      SELECT 
        p.id as project_id,
        p.jo_number,
        p.name as project_name,
        p.description,
        p.status as project_status,
        pd.id as project_day_id,
        pd.project_date,
        l.id as location_id,
        l.name as location_name,
        l.type as location_type,
        CONCAT(
          COALESCE(l.street, ''), 
          CASE WHEN l.street IS NOT NULL THEN ', ' ELSE '' END,
          COALESCE(l.barangay, ''),
          CASE WHEN l.barangay IS NOT NULL THEN ', ' ELSE '' END,
          l.city, ', ', l.province
        ) as full_address,
        p.created_at,
        p.updated_at
      FROM project p
      LEFT JOIN project_day pd ON p.id = pd.project_id
      LEFT JOIN location l ON pd.location_id = l.id
      WHERE p.status IN ('upcoming', 'ongoing', 'completed')
    `;

    const queryParams = [];

    // Add date range filter if provided
    if (start_date && end_date) {
      query += ' AND pd.project_date BETWEEN ? AND ?';
      queryParams.push(start_date, end_date);
    } else if (start_date) {
      query += ' AND pd.project_date >= ?';
      queryParams.push(start_date);
    } else if (end_date) {
      query += ' AND pd.project_date <= ?';
      queryParams.push(end_date);
    }

    query += ' ORDER BY pd.project_date ASC, p.jo_number ASC';

    const events = await db.query(query, queryParams);

    // Transform the data to group by project and format for calendar
    const projectsMap = new Map();

    events.forEach(event => {
      const projectId = event.project_id;
      
      if (!projectsMap.has(projectId)) {
        projectsMap.set(projectId, {
          id: projectId,
          jo_number: event.jo_number,
          name: event.project_name,
          description: event.description,
          status: event.project_status,
          project_days: []
        });
      }

      // Add project day if it exists (some projects might not have days scheduled yet)
      if (event.project_day_id && event.project_date) {
        projectsMap.get(projectId).project_days.push({
          id: event.project_day_id,
          date: event.project_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
          location: event.location_name || 'Location TBD',
          location_id: event.location_id,
          full_address: event.full_address,
          location_type: event.location_type
        });
      }
    });

    const projectEvents = Array.from(projectsMap.values());

    res.status(200).json({
      success: true,
      data: projectEvents,
      total: projectEvents.length,
      message: 'Calendar events retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching calendar events',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/calendar/events/:month/:year
 * @desc    Get calendar events for specific month and year
 * @access  Private
 */
router.get('/events/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Validate year and month
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year or month parameter'
      });
    }

    // Calculate start and end date for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const query = `
      SELECT 
        p.id as project_id,
        p.jo_number,
        p.name as project_name,
        p.description,
        p.status as project_status,
        pd.id as project_day_id,
        pd.project_date,
        l.id as location_id,
        l.name as location_name,
        l.type as location_type,
        CONCAT(
          COALESCE(l.street, ''), 
          CASE WHEN l.street IS NOT NULL THEN ', ' ELSE '' END,
          COALESCE(l.barangay, ''),
          CASE WHEN l.barangay IS NOT NULL THEN ', ' ELSE '' END,
          l.city, ', ', l.province
        ) as full_address
      FROM project p
      LEFT JOIN project_day pd ON p.id = pd.project_id
      LEFT JOIN location l ON pd.location_id = l.id
      WHERE p.status IN ('upcoming', 'ongoing', 'completed')
        AND pd.project_date BETWEEN ? AND ?
      ORDER BY pd.project_date ASC, p.jo_number ASC
    `;

    const events = await db.query(query, [startDateStr, endDateStr]);

    // Transform the data similar to the general events endpoint
    const projectsMap = new Map();

    events.forEach(event => {
      const projectId = event.project_id;
      
      if (!projectsMap.has(projectId)) {
        projectsMap.set(projectId, {
          id: projectId,
          jo_number: event.jo_number,
          name: event.project_name,
          description: event.description,
          status: event.project_status,
          project_days: []
        });
      }

      if (event.project_day_id && event.project_date) {
        projectsMap.get(projectId).project_days.push({
          id: event.project_day_id,
          date: event.project_date.toISOString().split('T')[0],
          location: event.location_name || 'Location TBD',
          location_id: event.location_id,
          full_address: event.full_address,
          location_type: event.location_type
        });
      }
    });

    const projectEvents = Array.from(projectsMap.values());

    res.status(200).json({
      success: true,
      data: projectEvents,
      total: projectEvents.length,
      month: parseInt(month),
      year: parseInt(year),
      message: `Calendar events for ${year}-${month.toString().padStart(2, '0')} retrieved successfully`
    });

  } catch (error) {
    console.error('Error fetching monthly calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly calendar events',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;