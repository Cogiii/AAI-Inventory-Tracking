USE AAI_inventory_db;

-- ====================
-- ITEMS QUANTITY MANAGEMENT
-- ====================

DELIMITER $$

-- Update item quantities when project_item is created
DROP TRIGGER IF EXISTS trg_project_item_allocation$$
CREATE TRIGGER trg_project_item_allocation
AFTER INSERT ON project_item
FOR EACH ROW
BEGIN
    UPDATE item
    SET available_quantity = available_quantity - NEW.allocated_quantity
    WHERE id = NEW.item_id;
END$$

-- Reflect damaged/lost updates on project_item
DROP TRIGGER IF EXISTS trg_project_item_update_adjustments$$
CREATE TRIGGER trg_project_item_update_adjustments
AFTER UPDATE ON project_item
FOR EACH ROW
BEGIN
    DECLARE alloc_diff INT DEFAULT 0;
    DECLARE damage_diff INT DEFAULT 0;
    DECLARE loss_diff INT DEFAULT 0;
    DECLARE return_diff INT DEFAULT 0;

    -- Compute differences
    SET alloc_diff = NEW.allocated_quantity - OLD.allocated_quantity;
    SET damage_diff = NEW.damaged_quantity - OLD.damaged_quantity;
    SET loss_diff = NEW.lost_quantity - OLD.lost_quantity;
    SET return_diff = NEW.returned_quantity - OLD.returned_quantity;

    -- Update item quantities accordingly
    UPDATE item
    SET available_quantity = available_quantity 
                             - alloc_diff          
                             + return_diff,        
        damaged_quantity = damaged_quantity + damage_diff,
        lost_quantity = lost_quantity + loss_diff
    WHERE id = NEW.item_id;
END$$

-- Restore item quantities when project_item is deleted
DROP TRIGGER IF EXISTS trg_project_item_delete_restore$$
CREATE TRIGGER trg_project_item_delete_restore
AFTER DELETE ON project_item
FOR EACH ROW
BEGIN
    UPDATE item
    SET available_quantity = available_quantity 
                             + OLD.allocated_quantity  
                             - OLD.returned_quantity,  
        damaged_quantity = damaged_quantity - OLD.damaged_quantity,
        lost_quantity = lost_quantity - OLD.lost_quantity
    WHERE id = OLD.item_id;
END$$

-- Prevent negative quantities on INSERT, THROW AN ERROR
DROP TRIGGER IF EXISTS trg_item_block_negative_insert$$
CREATE TRIGGER trg_item_block_negative_insert
BEFORE INSERT ON item
FOR EACH ROW
BEGIN
    IF NEW.available_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'available_quantity cannot be negative';
    END IF;

    IF NEW.damaged_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'damaged_quantity cannot be negative';
    END IF;

    IF NEW.lost_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'lost_quantity cannot be negative';
    END IF;
END$$

-- Prevent negative quantities on UPDATE, THROW AN ERROR
DROP TRIGGER IF EXISTS trg_item_block_negative_update$$
CREATE TRIGGER trg_item_block_negative_update
BEFORE UPDATE ON item
FOR EACH ROW
BEGIN
    IF NEW.available_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'available_quantity cannot be negative';
    END IF;

    IF NEW.damaged_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'damaged_quantity cannot be negative';
    END IF;

    IF NEW.lost_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'lost_quantity cannot be negative';
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