USE AAI_inventory_db;

-- ====================
-- PROJECT STATUS
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

    -- If project_day is today, mark project as ongoing
    IF NEW.project_date = today THEN
        UPDATE project
        SET status = 'ongoing'
        WHERE id = NEW.project_id AND status != 'completed';
    END IF;
END$$

-- Project Status SET TO Completed when all project_days are past
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

    -- Count all project_days already done (date < today)
    SELECT COUNT(*) INTO completed_days
    FROM project_day
    WHERE project_id = NEW.project_id
      AND project_date < CURDATE();

    -- If all project_days are finished, mark project as completed
    IF total_days > 0 AND total_days = completed_days THEN
        UPDATE project
        SET status = 'completed'
        WHERE id = NEW.project_id;
    END IF;
END$$

DELIMITER ;