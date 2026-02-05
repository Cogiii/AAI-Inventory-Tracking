USE aai_inventory;

-- ====================
-- PROJECT STATUS MANAGEMENT
-- ====================

DELIMITER $$

-- Project Status SET TO Ongoing when project_day starts
DROP TRIGGER IF EXISTS trg_project_day_status_update$$
CREATE TRIGGER trg_project_day_status_update
AFTER INSERT ON project_day
FOR EACH ROW
BEGIN
    DECLARE today DATE;
    SET today = CURDATE();

    -- If project_day is today or in the past, mark project as ongoing
    IF NEW.project_date <= today THEN
        UPDATE project
        SET status = 'ongoing'
        WHERE id = NEW.project_id AND status = 'upcoming';
    END IF;
END$$

-- Project Status SET TO Completed when all project_days are completed
DROP TRIGGER IF EXISTS trg_project_day_status_complete$$
CREATE TRIGGER trg_project_day_status_complete
AFTER UPDATE ON project_day
FOR EACH ROW
BEGIN
    DECLARE total_days INT;
    DECLARE completed_days INT;

    -- Count all project_days
    SELECT COUNT(*) INTO total_days
    FROM project_day
    WHERE project_id = NEW.project_id;

    -- Count all project_days that are completed (date <= today)
    SELECT COUNT(*) INTO completed_days
    FROM project_day
    WHERE project_id = NEW.project_id
      AND project_date <= CURDATE();

    -- If all project_days are finished, mark project as completed
    IF total_days > 0 AND total_days = completed_days THEN
        UPDATE project
        SET status = 'completed'
        WHERE id = NEW.project_id AND status != 'completed';
    END IF;
END$$

-- Stored Procedure to update project statuses based on project_day dates
DROP PROCEDURE IF EXISTS update_project_statuses$$
CREATE PROCEDURE update_project_statuses()
BEGIN
    -- Update projects to 'completed' when all days are done (including today)
    UPDATE project p
    SET p.status = 'completed'
    WHERE p.status = 'ongoing'
      AND EXISTS (
          SELECT 1
          FROM project_day pd
          WHERE pd.project_id = p.id
      )
      AND NOT EXISTS (
          SELECT 1
          FROM project_day pd
          WHERE pd.project_id = p.id
            AND pd.project_date > CURDATE()
      );

    -- Update projects to 'ongoing' if they have days that are today or past and status is pending
    UPDATE project p
    SET p.status = 'ongoing'
    WHERE p.status = 'upcoming'
      AND EXISTS (
          SELECT 1
          FROM project_day pd
          WHERE pd.project_id = p.id
            AND pd.project_date <= CURDATE()
      );
END$$

-- Event to automatically update project statuses daily at midnight
DROP EVENT IF EXISTS evt_update_project_statuses$$
CREATE EVENT evt_update_project_statuses
ON SCHEDULE EVERY 1 DAY
STARTS (CURRENT_DATE + INTERVAL 1 DAY)
DO
BEGIN
    CALL update_project_statuses();
END$$

DELIMITER ;

-- Enable event scheduler (if not already enabled)
SET GLOBAL event_scheduler = ON;

-- Run the procedure once to update any existing projects
CALL update_project_statuses();