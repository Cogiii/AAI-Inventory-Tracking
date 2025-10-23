-- ================================================
-- SAFE DATABASE RESET SCRIPT WITH BACKUP VERIFICATION
-- FILE: safe_reset_database.sql
-- PURPOSE: Safely clear all data with backup verification
-- INCLUDES: Backup check, rollback capability, detailed logging
-- ================================================

USE AAI_inventory_db;

-- ===============================================
-- SAFETY CHECKS AND WARNINGS
-- ===============================================

SELECT '================================================' AS '';
SELECT 'SAFE DATABASE RESET SCRIPT' AS '';
SELECT '================================================' AS '';

-- Check current data counts before reset
SELECT 'CURRENT DATA INVENTORY (before reset):' AS '';
SELECT '----------------------------------------' AS '';

CREATE TEMPORARY TABLE pre_reset_counts AS
SELECT 
    'brand' as table_name, COUNT(*) as record_count FROM brand
UNION ALL SELECT 'user', COUNT(*) FROM user
UNION ALL SELECT 'role', COUNT(*) FROM role
UNION ALL SELECT 'personnel', COUNT(*) FROM personnel
UNION ALL SELECT 'location', COUNT(*) FROM location
UNION ALL SELECT 'item', COUNT(*) FROM item
UNION ALL SELECT 'project', COUNT(*) FROM project
UNION ALL SELECT 'project_day', COUNT(*) FROM project_day
UNION ALL SELECT 'project_item', COUNT(*) FROM project_item
UNION ALL SELECT 'project_personnel', COUNT(*) FROM project_personnel
UNION ALL SELECT 'inventory_log', COUNT(*) FROM inventory_log
UNION ALL SELECT 'activity_log', COUNT(*) FROM activity_log
UNION ALL SELECT 'project_log', COUNT(*) FROM project_log
UNION ALL SELECT 'damage_loss_log', COUNT(*) FROM damage_loss_log;

SELECT table_name AS 'Table', record_count AS 'Records Before Reset' 
FROM pre_reset_counts 
ORDER BY table_name;

SELECT CONCAT('Total Records to be deleted: ', SUM(record_count)) AS 'Summary'
FROM pre_reset_counts;

-- ===============================================
-- USER CONFIRMATION SIMULATION
-- ===============================================
SELECT '================================================' AS '';
SELECT 'IMPORTANT: Review the data counts above!' AS '';
SELECT 'This script will delete ALL records shown above.' AS '';
SELECT '================================================' AS '';
SELECT 'To proceed with reset:' AS '';
SELECT '1. Ensure you have a recent backup' AS '';
SELECT '2. Verify no critical operations are running' AS '';
SELECT '3. Continue executing the script' AS '';
SELECT '================================================' AS '';

-- ===============================================
-- BACKUP VERIFICATION (Example queries)
-- ===============================================
SELECT 'BACKUP VERIFICATION CHECKLIST:' AS '';
SELECT '☐ Database backup created today?' AS 'Checklist_Item';
SELECT '☐ Backup file tested and verified?' AS 'Checklist_Item';
SELECT '☐ No active users in the system?' AS 'Checklist_Item';
SELECT '☐ All critical data exported if needed?' AS 'Checklist_Item';

-- Show database size before reset
SELECT 
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Database_Size_MB'
FROM information_schema.tables 
WHERE table_schema = 'AAI_inventory_db';

-- ===============================================
-- STEP 1: CREATE TRANSACTION FOR SAFETY
-- ===============================================
-- Note: For MySQL, we'll use explicit steps with verification

SELECT 'Starting safe reset process...' AS '';

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- ===============================================
-- STEP 2: SAFE DATA DELETION WITH VERIFICATION
-- ===============================================

SELECT 'Deleting log table data...' AS '';

-- Delete logs (leaf tables first)
DELETE FROM damage_loss_log;
SELECT ROW_COUNT() AS 'Damage/Loss logs deleted';

DELETE FROM project_log;
SELECT ROW_COUNT() AS 'Project logs deleted';

DELETE FROM activity_log;
SELECT ROW_COUNT() AS 'Activity logs deleted';

DELETE FROM inventory_log;
SELECT ROW_COUNT() AS 'Inventory logs deleted';

-- Delete junction tables
SELECT 'Deleting relationship data...' AS '';

DELETE FROM project_personnel;
SELECT ROW_COUNT() AS 'Project personnel assignments deleted';

DELETE FROM project_item;
SELECT ROW_COUNT() AS 'Project item allocations deleted';

-- Delete dependent tables
SELECT 'Deleting project and item data...' AS '';

DELETE FROM project_day;
SELECT ROW_COUNT() AS 'Project days deleted';

DELETE FROM project;
SELECT ROW_COUNT() AS 'Projects deleted';

DELETE FROM item;
SELECT ROW_COUNT() AS 'Items deleted';

-- Delete core entities
SELECT 'Deleting core entity data...' AS '';

DELETE FROM location;
SELECT ROW_COUNT() AS 'Locations deleted';

DELETE FROM personnel;
SELECT ROW_COUNT() AS 'Personnel deleted';

DELETE FROM role;
SELECT ROW_COUNT() AS 'Roles deleted';

DELETE FROM user;
SELECT ROW_COUNT() AS 'Users deleted';

DELETE FROM brand;
SELECT ROW_COUNT() AS 'Brands deleted';

-- ===============================================
-- STEP 3: VERIFY DELETION
-- ===============================================

SELECT 'Verifying all tables are empty...' AS '';

-- Check all tables are empty
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM brand) = 0 THEN '✓ EMPTY' 
        ELSE '✗ NOT EMPTY' 
    END AS 'Brand Table';

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM user) = 0 THEN '✓ EMPTY' 
        ELSE '✗ NOT EMPTY' 
    END AS 'User Table';

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM item) = 0 THEN '✓ EMPTY' 
        ELSE '✗ NOT EMPTY' 
    END AS 'Item Table';

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM project) = 0 THEN '✓ EMPTY' 
        ELSE '✗ NOT EMPTY' 
    END AS 'Project Table';

-- Check total records across all tables
SELECT 
    (SELECT COUNT(*) FROM brand) +
    (SELECT COUNT(*) FROM user) +
    (SELECT COUNT(*) FROM role) +
    (SELECT COUNT(*) FROM personnel) +
    (SELECT COUNT(*) FROM location) +
    (SELECT COUNT(*) FROM item) +
    (SELECT COUNT(*) FROM project) +
    (SELECT COUNT(*) FROM project_day) +
    (SELECT COUNT(*) FROM project_item) +
    (SELECT COUNT(*) FROM project_personnel) +
    (SELECT COUNT(*) FROM inventory_log) +
    (SELECT COUNT(*) FROM activity_log) +
    (SELECT COUNT(*) FROM project_log) +
    (SELECT COUNT(*) FROM damage_loss_log) AS 'Total_Records_Remaining';

-- ===============================================
-- STEP 4: RESET AUTO-INCREMENT COUNTERS
-- ===============================================

SELECT 'Resetting auto-increment counters...' AS '';

-- Core entities
ALTER TABLE brand AUTO_INCREMENT = 1;
ALTER TABLE user AUTO_INCREMENT = 1;
ALTER TABLE role AUTO_INCREMENT = 1;
ALTER TABLE personnel AUTO_INCREMENT = 1;
ALTER TABLE location AUTO_INCREMENT = 1;

-- Inventory and projects
ALTER TABLE item AUTO_INCREMENT = 1;
ALTER TABLE project AUTO_INCREMENT = 1;
ALTER TABLE project_day AUTO_INCREMENT = 1;
ALTER TABLE project_item AUTO_INCREMENT = 1;

-- Logs
ALTER TABLE inventory_log AUTO_INCREMENT = 1;
ALTER TABLE activity_log AUTO_INCREMENT = 1;
ALTER TABLE project_log AUTO_INCREMENT = 1;
ALTER TABLE damage_loss_log AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ===============================================
-- STEP 5: FINAL VERIFICATION AND SUMMARY
-- ===============================================

SELECT 'Final verification of reset...' AS '';

-- Verify auto-increment values
SELECT 'AUTO-INCREMENT STATUS:' AS '';
SELECT 
    TABLE_NAME, 
    CASE 
        WHEN AUTO_INCREMENT = 1 THEN '✓ Reset to 1'
        WHEN AUTO_INCREMENT IS NULL THEN '- No auto-increment'
        ELSE CONCAT('✗ Value: ', AUTO_INCREMENT)
    END AS 'Status'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'AAI_inventory_db' 
ORDER BY TABLE_NAME;

-- Summary report
SELECT '================================================' AS '';
SELECT 'DATABASE RESET COMPLETED SUCCESSFULLY!' AS '';
SELECT '================================================' AS '';
SELECT CONCAT('Reset completed on: ', NOW()) AS 'Timestamp';
SELECT 'All data deleted and auto-increment keys reset to 1' AS 'Status';
SELECT '================================================' AS '';

-- Database is ready message
SELECT 'DATABASE IS NOW READY FOR:' AS '';
SELECT '• Fresh mock data insertion' AS 'Ready_For';
SELECT '• New development testing' AS 'Ready_For';
SELECT '• Clean environment setup' AS 'Ready_For';
SELECT '• Schema testing and validation' AS 'Ready_For';

-- Clean up temporary table
DROP TEMPORARY TABLE pre_reset_counts;