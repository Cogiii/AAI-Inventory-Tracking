-- ================================================
-- MOCK DATA FOR AAI INVENTORY MANAGEMENT SYSTEM
-- FILE: 01_basic_entities.sql
-- PURPOSE: Insert mock data for basic entities (users, brands, roles, personnel, locations)
-- REGION: Davao City / Mindanao (Retail & Consumer Brands)
-- ================================================

USE AAI_inventory_db;

-- ====================
-- 1. BRANDS (Common Philippine Consumer Brands)
-- ====================
INSERT INTO brand (name, description) VALUES
-- Beverages & Food
('Milo', 'Chocolate malt energy drink from Nestlé Philippines'),
('Nescafé', 'Coffee brand widely available across the Philippines'),
('Bear Brand', 'Fortified milk drink trusted by Filipino families'),
('Quaker Oats', 'Healthy oatmeal brand for breakfast meals'),
('Oishi', 'Snack food brand known for potato chips and prawn crackers'),
('Jack n Jill', 'Popular snack brand under Universal Robina Corporation'),
('Coca-Cola', 'Carbonated soft drink brand distributed nationwide'),
('Del Monte', 'Brand for canned fruits, juices, and sauces'),
('Lucky Me!', 'Instant noodle brand loved by Filipinos'),
('Century Tuna', 'Leading tuna brand for healthy meals'),

-- Home Care & Personal Products
('Surf', 'Laundry detergent brand known for long-lasting fragrance'),
('Downy', 'Fabric conditioner brand under Procter & Gamble'),
('Safeguard', 'Antibacterial soap for family protection'),
('Colgate', 'Toothpaste and oral care brand'),
('Palmolive', 'Hair and body care brand popular in the Philippines'),

-- Electronics & Appliances
('Epson', 'Printer and imaging technology company'),
('Samsung', 'Electronics brand for mobile phones and appliances'),
('LG', 'Home electronics and appliance manufacturer'),
('Panasonic', 'Electronics brand offering home and office solutions'),
('Sharp', 'Home appliance and television brand');

-- ====================
-- 2. POSITIONS WITH PERMISSIONS
-- ====================
INSERT INTO position (
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
-- 3. USERS
-- ====================

INSERT INTO user (first_name, last_name, email, position_id, username, password_hash) VALUES
-- Administrators (Position ID: 1)
('Admin', 'User', 'admin@aai.com', 1, 'admin', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS'), -- Password: Password123
('System', 'Administrator', 'sysadmin@aai.com', 1, 'sysadmin', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS'),

-- Marketing Managers (Position ID: 2)
('Maria', 'Santos', 'manager@aai.com', 2, 'msantos', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS'),
('Carlos', 'Mendoza', 'carlos.mendoza@aai.com', 2, 'cmendoza', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS'),

-- Staff Members (Position ID: 3)
('John', 'Cruz', 'user@aai.com', 3, 'jcruz', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS'),
('Anna', 'Reyes', 'anna.reyes@aai.com', 3, 'areyes', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS'),
('Miguel', 'Garcia', 'miguel.garcia@aai.com', 3, 'mgarcia', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS'),

-- Inventory Specialists (Position ID: 4)
('Rosa', 'Delgado', 'rosa.delgado@aai.com', 4, 'rdelgado', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS'),
('Pedro', 'Villanueva', 'pedro.villanueva@aai.com', 4, 'pvillanueva', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS'),

-- Project Coordinators (Position ID: 5)
('Isabel', 'Torres', 'isabel.torres@aai.com', 5, 'itorres', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS'),
('Roberto', 'Flores', 'roberto.flores@aai.com', 5, 'rflores', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS');

-- ====================
-- 4. ROLES
-- ====================
INSERT INTO role (name) VALUES
('Event Coordinator'),
('Booth Designer'),
('Display Specialist'),
('Audio-Visual Technician'),
('Brand Ambassador'),
('Creative Director'),
('Marketing Coordinator'),
('Logistics Coordinator'),
('Inventory Supervisor'),
('Documentation Specialist');

-- ====================
-- 5. PERSONNEL (Mindanao-based names)
-- ====================
INSERT INTO personnel (name, contact_number, is_active) VALUES
('Roberto Del Rosario', '+63917-100-1111', TRUE),
('Carmen Tan', '+63918-222-3333', TRUE),
('Eduardo Lim', '+63919-444-5555', TRUE),
('Patricia Abella', '+63920-666-7777', TRUE),
('Ferdinand Uy', '+63921-888-9999', TRUE),
('Rosario Go', '+63922-101-2020', TRUE),
('Benjamin Ong', '+63923-303-4040', TRUE),
('Gloria Sarenas', '+63924-505-6060', TRUE),
('Antonio Dizon', '+63925-707-8080', TRUE),
('Maricel Villanueva', '+63926-909-0000', TRUE),
('Diego Alvarez', '+63927-111-2222', TRUE),
('Cristina Lao', '+63928-333-4444', TRUE),
('Rafael Domingo', '+63929-555-6666', TRUE),
('Elena Caballero', '+63930-777-8888', TRUE),
('Oscar Mendoza', '+63931-999-0000', TRUE);

-- ====================
-- 6. LOCATIONS (Mindanao Focused)
-- ====================
INSERT INTO location (name, type, street, barangay, city, province, region, postal_code, country, is_active) VALUES
('Main Warehouse', 'warehouse', '123 Diversion Road', 'Ma-a', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', TRUE),
('Marketing Storage Hub', 'warehouse', '45 Lanang Blvd', 'Lanang', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', TRUE),
('SM Lanang Premiere Booth', 'project_site', 'J.P. Laurel Ave', 'Lanang', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', TRUE),
('Abreeza Mall Exhibit', 'project_site', 'J.P. Laurel Ave', 'Bajada', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', TRUE),
('Gaisano Mall Product Fair', 'project_site', 'J.P. Laurel Ave', 'Bajada', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', TRUE),
('Tagum City Pavilion', 'project_site', 'Pioneer Ave', 'Magugpo', 'Tagum City', 'Davao del Norte', 'Region XI', '8100', 'Philippines', TRUE),
('General Santos City Trade Hall', 'project_site', 'Santiago Blvd', 'Lagao', 'General Santos City', 'South Cotabato', 'Region XII', '9500', 'Philippines', TRUE),
('Cagayan de Oro Exhibit Center', 'project_site', 'Limketkai Drive', 'Lapasan', 'Cagayan de Oro City', 'Misamis Oriental', 'Region X', '9000', 'Philippines', TRUE),
('SM City Davao Expo Grounds', 'project_site', 'Quimpo Blvd', 'Ecoland', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', TRUE),
('Head Office Davao', 'office', 'Ponciano Reyes St', 'Poblacion', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', TRUE);

-- ====================
-- SUCCESS MESSAGE
-- ====================
SELECT 'Basic entities data inserted successfully!' AS Status;
SELECT 'Positions created with granular permissions' AS Note;
SELECT 'Admin and Marketing Manager have full access to everything' AS Permissions;

-- Display position permissions summary
SELECT 
    name AS Position,
    CASE WHEN can_manage_projects THEN 'Full' WHEN can_add_project OR can_edit_project THEN 'Limited' ELSE 'None' END AS Project_Access,
    CASE WHEN can_manage_inventory THEN 'Full' WHEN can_add_inventory OR can_edit_inventory THEN 'Limited' ELSE 'None' END AS Inventory_Access,
    CASE WHEN can_manage_users THEN 'Full' ELSE 'None' END AS User_Access
FROM position 
ORDER BY id;
