USE aai_inventory;

-- ====================
-- MULTI-WAREHOUSE TRIGGERS
-- ====================
--
-- These triggers support the multi-warehouse inventory model where:
-- - Items can exist in multiple locations with different quantities
-- - item_location table tracks per-location quantities
-- - item table maintains aggregate totals for performance
--
-- IMPORTANT: Run this AFTER item_quantity_management.sql
-- These triggers extend/replace some of the base triggers
--

DELIMITER $$

-- ============================================
-- TRIGGER: Sync item aggregates when item_location is INSERTED
-- ============================================
DROP TRIGGER IF EXISTS trg_item_location_insert_sync$$
CREATE TRIGGER trg_item_location_insert_sync
AFTER INSERT ON item_location
FOR EACH ROW
BEGIN
    -- Recalculate item aggregates from all item_location records
    UPDATE item
    SET
        available_quantity = (
            SELECT COALESCE(SUM(il.quantity - il.reserved_quantity - il.damaged_quantity - il.lost_quantity), 0)
            FROM item_location il
            WHERE il.item_id = NEW.item_id
        ),
        reserved_quantity = (
            SELECT COALESCE(SUM(il.reserved_quantity), 0)
            FROM item_location il
            WHERE il.item_id = NEW.item_id
        ),
        damaged_quantity = (
            SELECT COALESCE(SUM(il.damaged_quantity), 0)
            FROM item_location il
            WHERE il.item_id = NEW.item_id
        ),
        lost_quantity = (
            SELECT COALESCE(SUM(il.lost_quantity), 0)
            FROM item_location il
            WHERE il.item_id = NEW.item_id
        ),
        delivered_quantity = (
            SELECT COALESCE(SUM(il.quantity), 0)
            FROM item_location il
            WHERE il.item_id = NEW.item_id
        )
    WHERE id = NEW.item_id;
END$$

-- ============================================
-- TRIGGER: Sync item aggregates when item_location is UPDATED
-- ============================================
DROP TRIGGER IF EXISTS trg_item_location_update_sync$$
CREATE TRIGGER trg_item_location_update_sync
AFTER UPDATE ON item_location
FOR EACH ROW
BEGIN
    -- Recalculate item aggregates from all item_location records
    UPDATE item
    SET
        available_quantity = (
            SELECT COALESCE(SUM(il.quantity - il.reserved_quantity - il.damaged_quantity - il.lost_quantity), 0)
            FROM item_location il
            WHERE il.item_id = NEW.item_id
        ),
        reserved_quantity = (
            SELECT COALESCE(SUM(il.reserved_quantity), 0)
            FROM item_location il
            WHERE il.item_id = NEW.item_id
        ),
        damaged_quantity = (
            SELECT COALESCE(SUM(il.damaged_quantity), 0)
            FROM item_location il
            WHERE il.item_id = NEW.item_id
        ),
        lost_quantity = (
            SELECT COALESCE(SUM(il.lost_quantity), 0)
            FROM item_location il
            WHERE il.item_id = NEW.item_id
        ),
        delivered_quantity = (
            SELECT COALESCE(SUM(il.quantity), 0)
            FROM item_location il
            WHERE il.item_id = NEW.item_id
        )
    WHERE id = NEW.item_id;
END$$

-- ============================================
-- TRIGGER: Sync item aggregates when item_location is DELETED
-- ============================================
DROP TRIGGER IF EXISTS trg_item_location_delete_sync$$
CREATE TRIGGER trg_item_location_delete_sync
AFTER DELETE ON item_location
FOR EACH ROW
BEGIN
    -- Recalculate item aggregates from remaining item_location records
    UPDATE item
    SET
        available_quantity = (
            SELECT COALESCE(SUM(il.quantity - il.reserved_quantity - il.damaged_quantity - il.lost_quantity), 0)
            FROM item_location il
            WHERE il.item_id = OLD.item_id
        ),
        reserved_quantity = (
            SELECT COALESCE(SUM(il.reserved_quantity), 0)
            FROM item_location il
            WHERE il.item_id = OLD.item_id
        ),
        damaged_quantity = (
            SELECT COALESCE(SUM(il.damaged_quantity), 0)
            FROM item_location il
            WHERE il.item_id = OLD.item_id
        ),
        lost_quantity = (
            SELECT COALESCE(SUM(il.lost_quantity), 0)
            FROM item_location il
            WHERE il.item_id = OLD.item_id
        ),
        delivered_quantity = (
            SELECT COALESCE(SUM(il.quantity), 0)
            FROM item_location il
            WHERE il.item_id = OLD.item_id
        )
    WHERE id = OLD.item_id;
END$$

-- ============================================
-- TRIGGER: Validate item_location quantities before INSERT
-- ============================================
DROP TRIGGER IF EXISTS trg_item_location_validate_insert$$
CREATE TRIGGER trg_item_location_validate_insert
BEFORE INSERT ON item_location
FOR EACH ROW
BEGIN
    -- Validate non-negative quantities
    IF NEW.quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'item_location.quantity cannot be negative';
    END IF;

    IF NEW.reserved_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'item_location.reserved_quantity cannot be negative';
    END IF;

    IF NEW.damaged_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'item_location.damaged_quantity cannot be negative';
    END IF;

    IF NEW.lost_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'item_location.lost_quantity cannot be negative';
    END IF;

    -- Validate available doesn't go negative
    IF (NEW.quantity - NEW.reserved_quantity - NEW.damaged_quantity - NEW.lost_quantity) < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Available quantity at location cannot be negative';
    END IF;
END$$

-- ============================================
-- TRIGGER: Validate item_location quantities before UPDATE
-- ============================================
DROP TRIGGER IF EXISTS trg_item_location_validate_update$$
CREATE TRIGGER trg_item_location_validate_update
BEFORE UPDATE ON item_location
FOR EACH ROW
BEGIN
    -- Validate non-negative quantities
    IF NEW.quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'item_location.quantity cannot be negative';
    END IF;

    IF NEW.reserved_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'item_location.reserved_quantity cannot be negative';
    END IF;

    IF NEW.damaged_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'item_location.damaged_quantity cannot be negative';
    END IF;

    IF NEW.lost_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'item_location.lost_quantity cannot be negative';
    END IF;

    -- Validate available doesn't go negative
    IF (NEW.quantity - NEW.reserved_quantity - NEW.damaged_quantity - NEW.lost_quantity) < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Available quantity at location cannot be negative';
    END IF;
END$$

DELIMITER ;