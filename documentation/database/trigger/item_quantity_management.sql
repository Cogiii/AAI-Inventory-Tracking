USE aai_inventory;

-- ====================
-- ITEMS QUANTITY MANAGEMENT
-- ====================
--
-- RESERVATION SYSTEM LOGIC:
-- - When items are allocated to a SCHEDULED project day → add to reserved_quantity
-- - When project day is COMPLETED → move from reserved_quantity to actual inventory changes
-- - reserved_quantity tracks items that are spoken for but not yet deducted from available
--

DELIMITER $$

-- ============================================
-- TRIGGER: When project_item is INSERTED
-- If project_day is 'scheduled' → reserve items (add to reserved_quantity)
-- If project_day is 'completed' → deduct from available (edge case, shouldn't happen normally)
-- ============================================
DROP TRIGGER IF EXISTS trg_project_item_allocation$$
CREATE TRIGGER trg_project_item_allocation
AFTER INSERT ON project_item
FOR EACH ROW
BEGIN
    DECLARE day_status VARCHAR(20);

    -- Get the status of the project day
    SELECT COALESCE(status, 'scheduled') INTO day_status
    FROM project_day
    WHERE id = NEW.project_day_id;

    IF day_status = 'scheduled' THEN
        -- Day is scheduled: Reserve the items (don't deduct from available yet)
        UPDATE item
        SET reserved_quantity = reserved_quantity + NEW.allocated_quantity
        WHERE id = NEW.item_id;
    ELSE
        -- Day is already completed (edge case): Deduct directly from available
        UPDATE item
        SET available_quantity = available_quantity - NEW.allocated_quantity
        WHERE id = NEW.item_id;
    END IF;
END$$

-- ============================================
-- TRIGGER: When project_item is UPDATED
-- Handle reservation changes based on project_day status
-- ============================================
DROP TRIGGER IF EXISTS trg_project_item_update_adjustments$$
CREATE TRIGGER trg_project_item_update_adjustments
AFTER UPDATE ON project_item
FOR EACH ROW
BEGIN
    DECLARE day_status VARCHAR(20);
    DECLARE alloc_diff INT DEFAULT 0;
    DECLARE damage_diff INT DEFAULT 0;
    DECLARE loss_diff INT DEFAULT 0;
    DECLARE return_diff INT DEFAULT 0;

    -- Get the status of the project day
    SELECT COALESCE(status, 'scheduled') INTO day_status
    FROM project_day
    WHERE id = NEW.project_day_id;

    -- Compute differences
    SET alloc_diff = NEW.allocated_quantity - OLD.allocated_quantity;
    SET damage_diff = NEW.damaged_quantity - OLD.damaged_quantity;
    SET loss_diff = NEW.lost_quantity - OLD.lost_quantity;
    SET return_diff = NEW.returned_quantity - OLD.returned_quantity;

    IF day_status = 'scheduled' THEN
        -- Day is still scheduled: Only update reserved_quantity for allocation changes
        -- Damage/loss/return changes shouldn't happen on scheduled days
        UPDATE item
        SET reserved_quantity = reserved_quantity + alloc_diff
        WHERE id = NEW.item_id;
    ELSE
        -- Day is completed: Update actual inventory quantities
        UPDATE item
        SET available_quantity = available_quantity
                                 - alloc_diff
                                 + return_diff,
            damaged_quantity = damaged_quantity + damage_diff,
            lost_quantity = lost_quantity + loss_diff
        WHERE id = NEW.item_id;
    END IF;
END$$

-- ============================================
-- TRIGGER: When project_item is DELETED
-- Restore reserved or available based on project_day status
-- ============================================
DROP TRIGGER IF EXISTS trg_project_item_delete_restore$$
CREATE TRIGGER trg_project_item_delete_restore
AFTER DELETE ON project_item
FOR EACH ROW
BEGIN
    DECLARE day_status VARCHAR(20);

    -- Get the status of the project day
    SELECT COALESCE(status, 'scheduled') INTO day_status
    FROM project_day
    WHERE id = OLD.project_day_id;

    IF day_status = 'scheduled' THEN
        -- Day was scheduled: Remove from reserved_quantity
        UPDATE item
        SET reserved_quantity = reserved_quantity - OLD.allocated_quantity
        WHERE id = OLD.item_id;
    ELSE
        -- Day was completed: Restore to available (minus what was already consumed)
        UPDATE item
        SET available_quantity = available_quantity
                                 + OLD.allocated_quantity
                                 - OLD.returned_quantity,
            damaged_quantity = damaged_quantity - OLD.damaged_quantity,
            lost_quantity = lost_quantity - OLD.lost_quantity
        WHERE id = OLD.item_id;
    END IF;
END$$

-- Prevent negative quantities on INSERT and auto-set status based on available_quantity
DROP TRIGGER IF EXISTS trg_item_block_negative_insert$$
CREATE TRIGGER trg_item_block_negative_insert
BEFORE INSERT ON item
FOR EACH ROW
BEGIN
    -- Validate non-negative quantities
    IF NEW.available_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'available_quantity cannot be negative';
    END IF;

    IF NEW.reserved_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'reserved_quantity cannot be negative';
    END IF;

    IF NEW.damaged_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'damaged_quantity cannot be negative';
    END IF;

    IF NEW.lost_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'lost_quantity cannot be negative';
    END IF;

    -- Auto-set status based on available_quantity (unless explicitly set to 'inactive')
    IF NEW.status IS NULL OR NEW.status != 'inactive' THEN
        IF NEW.available_quantity = 0 THEN
            SET NEW.status = 'out of stock';
        ELSEIF NEW.available_quantity <= 10 THEN
            SET NEW.status = 'low stock';
        ELSE
            SET NEW.status = 'in stock';
        END IF;
    END IF;
END$$

-- Prevent negative quantities on UPDATE and auto-update status based on available_quantity
DROP TRIGGER IF EXISTS trg_item_block_negative_update$$
CREATE TRIGGER trg_item_block_negative_update
BEFORE UPDATE ON item
FOR EACH ROW
BEGIN
    -- Validate non-negative quantities
    IF NEW.available_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'available_quantity cannot be negative';
    END IF;

    IF NEW.reserved_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'reserved_quantity cannot be negative';
    END IF;

    IF NEW.damaged_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'damaged_quantity cannot be negative';
    END IF;

    IF NEW.lost_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'lost_quantity cannot be negative';
    END IF;

    -- Auto-update status based on available_quantity
    -- Only auto-update if NOT currently 'inactive' and NOT being explicitly set to 'inactive'
    IF OLD.status != 'inactive' AND NEW.status != 'inactive' THEN
        IF NEW.available_quantity = 0 THEN
            SET NEW.status = 'out of stock';
        ELSEIF NEW.available_quantity <= 10 THEN
            SET NEW.status = 'low stock';
        ELSE
            SET NEW.status = 'in stock';
        END IF;
    END IF;
END$$

-- Auto-adjust item quantities when a damage/loss log is added
DROP TRIGGER IF EXISTS trg_damage_loss_log_update$$
CREATE TRIGGER trg_damage_loss_log_update
AFTER INSERT ON damage_loss_log
FOR EACH ROW
BEGIN
    IF NEW.issue_type = 'damage' THEN
        UPDATE item
        SET damaged_quantity = damaged_quantity + NEW.quantity
        WHERE id = NEW.entity_id;
    ELSEIF NEW.issue_type = 'loss' THEN
        UPDATE item
        SET lost_quantity = lost_quantity + NEW.quantity
        WHERE id = NEW.entity_id;
    END IF;
END$$

DELIMITER ;