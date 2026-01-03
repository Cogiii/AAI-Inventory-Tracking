-- ================================================
-- INITIAL SEED DATA FOR AAI INVENTORY MANAGEMENT SYSTEM
-- FILE: seed_data.sql
-- PURPOSE: Insert essential initial data (positions, default admin user, roles)
-- ================================================

USE AAI_inventory_db;

-- ====================
-- 1. POSITIONS WITH PERMISSIONS
-- ====================
INSERT INTO `position` (
    name,
    can_manage_projects, can_edit_project, can_add_project, can_delete_project,
    can_manage_inventory, can_add_inventory, can_edit_inventory, can_delete_inventory,
    can_manage_users, can_edit_user, can_add_user, can_delete_user
) VALUES
-- Administrator: Full access to everything
('Administrator', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),

-- Marketing Manager: Full access to everything
('Marketing Manager', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),

-- Staff Member: Limited access - can add/edit projects and inventory, but no delete or user management
('Staff Member', FALSE, TRUE, TRUE, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE),

-- Inventory Specialist: Full inventory access, limited project access, no user management
('Inventory Specialist', FALSE, FALSE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE),

-- Project Coordinator: Full project access, limited inventory access, no user management
('Project Coordinator', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE);

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
    CASE WHEN can_manage_projects THEN 'Full' WHEN can_add_project OR can_edit_project THEN 'Limited' ELSE 'None' END AS Project_Access,
    CASE WHEN can_manage_inventory THEN 'Full' WHEN can_add_inventory OR can_edit_inventory THEN 'Limited' ELSE 'None' END AS Inventory_Access,
    CASE WHEN can_manage_users THEN 'Full' ELSE 'None' END AS User_Access
FROM `position`
ORDER BY id;
