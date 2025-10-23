-- ================================================
-- COMPLETE DATABASE RESET SCRIPT
-- FILE: reset_database.sql
-- PURPOSE: Clear all data and reset auto-increment keys to start from 1
-- WARNING: This will permanently delete all data in the database
-- ================================================

USE AAI_inventory_db;

-- ===============================================
-- WARNING MESSAGE
-- ===============================================
SELECT '================================================' AS '';
SELECT 'WARNING: This script will PERMANENTLY DELETE' AS '';
SELECT 'ALL DATA in the AAI_inventory_db database!' AS '';
SELECT '================================================' AS '';
SELECT 'Make sure you have a backup before proceeding!' AS '';
SELECT '================================================' AS '';

-- Disable foreign key checks to avoid constraint errors during deletion
SET FOREIGN_KEY_CHECKS = 0;

-- ===============================================
-- STEP 1: DELETE ALL DATA FROM ALL TABLES
-- ===============================================

SELECT 'Step 1: Clearing all table data...' AS '';

-- Delete from log tables first (they reference other tables)
DELETE FROM damage_loss_log;
DELETE FROM project_log;
DELETE FROM activity_log;
DELETE FROM inventory_log;

-- Delete from junction/relationship tables
DELETE FROM project_personnel;
DELETE FROM project_item;

-- Delete from dependent tables
DELETE FROM project_day;
DELETE FROM project;
DELETE FROM item;

-- Delete from core entity tables
DELETE FROM location;
DELETE FROM personnel;
DELETE FROM role;
DELETE FROM user;
DELETE FROM brand;

SELECT 'All table data cleared successfully!' AS '';

-- ===============================================
-- STEP 2: RESET AUTO-INCREMENT COUNTERS
-- ===============================================

SELECT 'Step 2: Resetting auto-increment counters...' AS '';

-- Reset auto-increment for core entity tables
ALTER TABLE brand AUTO_INCREMENT = 1;
ALTER TABLE user AUTO_INCREMENT = 1;
ALTER TABLE role AUTO_INCREMENT = 1;
ALTER TABLE personnel AUTO_INCREMENT = 1;
ALTER TABLE location AUTO_INCREMENT = 1;

-- Reset auto-increment for inventory tables
ALTER TABLE item AUTO_INCREMENT = 1;

-- Reset auto-increment for project tables
ALTER TABLE project AUTO_INCREMENT = 1;
ALTER TABLE project_day AUTO_INCREMENT = 1;
ALTER TABLE project_item AUTO_INCREMENT = 1;

-- Reset auto-increment for log tables
ALTER TABLE inventory_log AUTO_INCREMENT = 1;
ALTER TABLE activity_log AUTO_INCREMENT = 1;
ALTER TABLE project_log AUTO_INCREMENT = 1;
ALTER TABLE damage_loss_log AUTO_INCREMENT = 1;

SELECT 'All auto-increment counters reset to 1!' AS '';

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ===============================================
-- STEP 3: VERIFICATION
-- ===============================================

SELECT 'Step 3: Verifying database reset...' AS '';

-- Check that all tables are empty
SELECT 'TABLE VERIFICATION (should all show 0 records):' AS '';
SELECT 'Core Entities:' AS '';
SELECT COUNT(*) AS 'Brands' FROM brand;
SELECT COUNT(*) AS 'Users' FROM user;
SELECT COUNT(*) AS 'Roles' FROM role;
SELECT COUNT(*) AS 'Personnel' FROM personnel;
SELECT COUNT(*) AS 'Locations' FROM location;

SELECT 'Inventory & Projects:' AS '';
SELECT COUNT(*) AS 'Items' FROM item;
SELECT COUNT(*) AS 'Projects' FROM project;
SELECT COUNT(*) AS 'Project Days' FROM project_day;
SELECT COUNT(*) AS 'Project Items' FROM project_item;
SELECT COUNT(*) AS 'Project Personnel' FROM project_personnel;

SELECT 'Activity Logs:' AS '';
SELECT COUNT(*) AS 'Inventory Logs' FROM inventory_log;
SELECT COUNT(*) AS 'Activity Logs' FROM activity_log;
SELECT COUNT(*) AS 'Project Logs' FROM project_log;
SELECT COUNT(*) AS 'Damage/Loss Logs' FROM damage_loss_log;

-- Check auto-increment status
SELECT 'AUTO-INCREMENT VERIFICATION:' AS '';
SELECT 
    TABLE_NAME, 
    AUTO_INCREMENT 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'AAI_inventory_db' 
    AND AUTO_INCREMENT IS NOT NULL
ORDER BY TABLE_NAME;

-- ===============================================
-- COMPLETION MESSAGE
-- ===============================================
SELECT '================================================' AS '';
SELECT 'DATABASE RESET COMPLETED SUCCESSFULLY!' AS '';
SELECT '================================================' AS '';
SELECT 'All data has been cleared.' AS '';
SELECT 'All auto-increment keys reset to start from 1.' AS '';
SELECT 'Database is ready for fresh data insertion.' AS '';
SELECT '================================================' AS '';

-- ===============================================
-- OPTIONAL: QUICK TEST INSERT
-- ===============================================
-- Uncomment the lines below to test that auto-increment is working correctly

/*
SELECT 'TESTING AUTO-INCREMENT (optional test)...' AS '';

-- Test insert to verify auto-increment starts from 1
INSERT INTO brand (name, description) VALUES ('Test Brand', 'Test Description');
INSERT INTO user (first_name, last_name, email, position, username, password_hash) 
VALUES ('Test', 'User', 'test@test.com', 'admin', 'testuser', 'testhash');

-- Show the IDs assigned (should be 1 for both)
SELECT id, name FROM brand;
SELECT id, first_name, last_name FROM user;

-- Clean up test data
DELETE FROM user WHERE username = 'testuser';
DELETE FROM brand WHERE name = 'Test Brand';

-- Reset counters again after test
ALTER TABLE brand AUTO_INCREMENT = 1;
ALTER TABLE user AUTO_INCREMENT = 1;

SELECT 'Auto-increment test completed and cleaned up!' AS '';
*/