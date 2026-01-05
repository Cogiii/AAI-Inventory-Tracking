-- ================================================
-- INITIAL SEED DATA FOR AAI INVENTORY MANAGEMENT SYSTEM
-- FILE: seed_data.sql
-- PURPOSE: Insert essential initial data (positions, default admin user, roles)
-- ================================================

USE AAI_inventory_db;

-- ====================
-- 1. POSITIONS WITH PERMISSIONS (JSON format)
-- ====================
-- Permission structure: {"projects": [...], "inventory": [...], "users": [...]}
-- Available actions per module: view, add, edit, delete

INSERT INTO `position` (name, description, permissions) VALUES
-- Administrator: Full access to everything
('Administrator', 'Full system access with all permissions',
 '{"projects":["view","add","edit","delete"],"inventory":["view","add","edit","delete"],"users":["view","add","edit","delete"]}'),

-- Marketing Manager: Full access to projects and inventory, can view users
('Marketing Manager', 'Manages projects and inventory operations',
 '{"projects":["view","add","edit","delete"],"inventory":["view","add","edit","delete"],"users":["view"]}'),

-- Staff Member: Can view and edit projects/inventory, no delete or user management
('Staff Member', 'Basic staff access for daily operations',
 '{"projects":["view","add","edit"],"inventory":["view","add","edit"],"users":[]}'),

-- Inventory Specialist: Full inventory access, can view projects
('Inventory Specialist', 'Specialized inventory management role',
 '{"projects":["view"],"inventory":["view","add","edit","delete"],"users":[]}'),

-- Project Coordinator: Full project access, can view inventory
('Project Coordinator', 'Manages project operations and coordination',
 '{"projects":["view","add","edit","delete"],"inventory":["view"],"users":[]}');

-- ====================
-- 2. DEFAULT ADMIN USER
-- ====================
-- Password: Password123 (bcrypt hashed)
INSERT INTO user (first_name, last_name, email, position_id, username, password_hash) VALUES
('Admin', 'User', 'admin@aai.com', 1, 'admin', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS');

-- ====================
-- 3. ROLES (Personnel roles for project assignments)
-- ====================
INSERT INTO role (name) VALUES
('Personal Assistant (PA)'),
('Brand Ambassador (BA)'),
('Sampler'),
('Driver');

-- ====================
-- SUCCESS MESSAGE
-- ====================
SELECT 'Initial seed data inserted successfully!' AS Status;
SELECT 'Default admin credentials: admin / Password123' AS Note;

-- Display position permissions summary
SELECT
    name AS Position,
    description AS Description,
    JSON_LENGTH(permissions->'$.projects') AS Project_Actions,
    JSON_LENGTH(permissions->'$.inventory') AS Inventory_Actions,
    JSON_LENGTH(permissions->'$.users') AS User_Actions
FROM `position`
ORDER BY id;
