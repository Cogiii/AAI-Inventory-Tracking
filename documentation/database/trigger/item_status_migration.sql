-- =====================================================
-- MIGRATION: Add 'low stock' status and auto-update triggers
-- Run this script on existing database to add status automation
-- =====================================================

USE aai_inventory;

-- Step 1: Modify the ENUM to add 'low stock' status
ALTER TABLE item
MODIFY COLUMN status ENUM('in stock', 'out of stock', 'low stock', 'inactive') DEFAULT 'in stock';

-- Step 2: Update existing items to have correct status based on current quantities
-- (Preserve 'inactive' status for manually marked items)
UPDATE item SET status = 'out of stock' WHERE available_quantity = 0 AND (status IS NULL OR status != 'inactive');
UPDATE item SET status = 'low stock' WHERE available_quantity > 0 AND available_quantity <= 10 AND (status IS NULL OR status != 'inactive');
UPDATE item SET status = 'in stock' WHERE available_quantity > 10 AND (status IS NULL OR status != 'inactive');

-- Step 3: The triggers in item_quantity_management.sql will need to be re-run
-- to apply the updated trigger logic with status auto-update

-- Verification query: Check status distribution after migration
SELECT
    status,
    COUNT(*) as item_count,
    MIN(available_quantity) as min_qty,
    MAX(available_quantity) as max_qty
FROM item
GROUP BY status
ORDER BY status;
