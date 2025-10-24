-- ================================================
-- MOCK DATA FOR AAI INVENTORY MANAGEMENT SYSTEM
-- FILE: 01_basic_entities.sql
-- PURPOSE: Insert mock data for basic entities (users, brands, roles, personnel, locations)
-- ================================================

USE AAI_inventory_db;

-- ====================
-- 1. BRANDS
-- ====================
INSERT INTO brand (name, description) VALUES
('INGCO', 'Professional power tools and hand tools'),
('Makita', 'High-quality power tools and equipment'),
('Stanley', 'Hand tools and measuring instruments'),
('Black+Decker', 'Power tools and accessories'),
('Bosch', 'Professional power tools and accessories'),
('DeWalt', 'Industrial power tools and equipment'),
('Milwaukee', 'Heavy-duty power tools'),
('Ryobi', 'Cordless power tools and outdoor equipment'),
('Craftsman', 'Hand tools and power tools'),
('Hilti', 'Professional construction tools');

-- ====================
-- 2. USERS
-- ====================
INSERT INTO position (name) VALUES
('Administrator'),
('Marketing Manager'),
('Staff Member');

INSERT INTO user (first_name, last_name, email, position_id, username, password_hash) VALUES
('Admin', 'User', 'admin@aai.com', 1, 'admin', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS'), -- Password: Password123
('Maria', 'Santos', 'manager@aai.com', 2, 'msantos', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS'), -- Password: Password123
('John', 'Cruz', 'user@aai.com', 3, 'jcruz', '$2a$12$QkHW.pBh9lZ/QOKMQInWqePEU0goKaVyavYukGzE8Ib09h4xSiAwS'), -- Password: Password123

-- ====================
-- 3. ROLES
-- ====================
INSERT INTO role (name) VALUES
('Project Manager'),
('Site Supervisor'),
('Marketing Coordinator'),
('Equipment Operator'),
('Safety Officer'),
('Quality Controller'),
('Logistics Coordinator'),
('Technical Support'),
('Site Worker'),
('Documentation Specialist');

-- ====================
-- 4. PERSONNEL
-- ====================
INSERT INTO personnel (name, contact_number, is_active) VALUES
('Roberto Silva', '+63917-123-4567', TRUE),
('Carmen Dela Cruz', '+63918-234-5678', TRUE),
('Eduardo Ramos', '+63919-345-6789', TRUE),
('Patricia Morales', '+63920-456-7890', TRUE),
('Ferdinand Aquino', '+63921-567-8901', TRUE),
('Rosario Valdez', '+63922-678-9012', TRUE),
('Benjamin Castro', '+63923-789-0123', TRUE),
('Gloria Herrera', '+63924-890-1234', TRUE),
('Antonio Jimenez', '+63925-901-2345', TRUE),
('Maricel Rodriguez', '+63926-012-3456', TRUE),
('Diego Fernandez', '+63927-123-4567', TRUE),
('Cristina Ortega', '+63928-234-5678', TRUE),
('Rafael Vargas', '+63929-345-6789', TRUE),
('Elena Castillo', '+63930-456-7890', TRUE),
('Oscar Medina', '+63931-567-8901', TRUE);

-- ====================
-- 5. LOCATIONS
-- ====================
INSERT INTO location (name, type, street, barangay, city, province, region, postal_code, country, is_active) VALUES
('Main Warehouse', 'warehouse', '123 Industrial Ave', 'Bagumbayan', 'Quezon City', 'Metro Manila', 'NCR', '1110', 'Philippines', TRUE),
('Secondary Warehouse', 'warehouse', '456 Commerce St', 'San Antonio', 'Makati City', 'Metro Manila', 'NCR', '1200', 'Philippines', TRUE),
('BGC Office Building Project', 'project_site', '789 High Street', 'Fort Bonifacio', 'Taguig City', 'Metro Manila', 'NCR', '1634', 'Philippines', TRUE),
('Eastwood Mall Construction', 'project_site', '321 Eastwood Ave', 'Bagumbayan', 'Quezon City', 'Metro Manila', 'NCR', '1110', 'Philippines', TRUE),
('Alabang Town Center Renovation', 'project_site', '654 Commerce Ave', 'Alabang', 'Muntinlupa City', 'Metro Manila', 'NCR', '1770', 'Philippines', TRUE),
('Cebu IT Park Development', 'project_site', '987 Business Park Blvd', 'Lahug', 'Cebu City', 'Cebu', 'Region VII', '6000', 'Philippines', TRUE),
('Davao Convention Center', 'project_site', '147 Convention Drive', 'Poblacion', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', TRUE),
('Head Office', 'office', '258 Corporate Center', 'Ortigas', 'Pasig City', 'Metro Manila', 'NCR', '1605', 'Philippines', TRUE),
('Iloilo Business District', 'project_site', '369 Business Ave', 'Mandurriao', 'Iloilo City', 'Iloilo', 'Region VI', '5000', 'Philippines', TRUE),
('Baguio Mountain Resort', 'project_site', '741 Session Road', 'Burnham Park', 'Baguio City', 'Benguet', 'CAR', '2600', 'Philippines', TRUE);

-- ====================
-- SUCCESS MESSAGE
-- ====================
SELECT 'Basic entities data inserted successfully!' AS Status;