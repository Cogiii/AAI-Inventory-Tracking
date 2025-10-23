-- ================================================
-- MOCK DATA FOR AAI INVENTORY MANAGEMENT SYSTEM
-- FILE: 02_items_inventory.sql
-- PURPOSE: Insert mock data for items, projects, and inventory operations
-- ================================================

USE AAI_inventory_db;

-- ====================
-- 1. ITEMS (PRODUCTS & MATERIALS)
-- ====================

-- Power Tools (Products)
INSERT INTO item (type, brand_id, name, description, delivered_quantity, damaged_quantity, lost_quantity, available_quantity, warehouse_location, status) VALUES
('product', 1, 'INGCO Angle Grinder 4.5"', 'Heavy-duty angle grinder with 850W motor', 50, 2, 0, 48, 'Main Warehouse - A1', 'active'),
('product', 2, 'Makita Cordless Drill 18V', 'Lithium-ion cordless drill with 2 batteries', 30, 1, 0, 29, 'Main Warehouse - A2', 'active'),
('product', 3, 'Stanley Measuring Tape 8m', 'Professional measuring tape with magnetic tip', 100, 0, 2, 98, 'Main Warehouse - B1', 'active'),
('product', 4, 'Black+Decker Circular Saw', '7.25" circular saw with laser guide', 25, 1, 0, 24, 'Main Warehouse - A3', 'active'),
('product', 5, 'Bosch Hammer Drill', 'SDS-Plus rotary hammer drill', 20, 0, 1, 19, 'Main Warehouse - A4', 'active'),
('product', 6, 'DeWalt Impact Driver', '20V MAX cordless impact driver', 35, 1, 0, 34, 'Main Warehouse - A5', 'active'),
('product', 7, 'Milwaukee Multi-Tool', 'Oscillating multi-tool kit', 15, 0, 0, 15, 'Main Warehouse - A6', 'active'),
('product', 8, 'Ryobi Jigsaw', 'Orbital jigsaw with laser guide', 40, 2, 0, 38, 'Main Warehouse - A7', 'active'),
('product', 9, 'Craftsman Socket Set', '230-piece mechanics tool set', 20, 0, 0, 20, 'Main Warehouse - B2', 'active'),
('product', 10, 'Hilti Concrete Drill', 'Heavy-duty concrete drilling system', 10, 0, 0, 10, 'Main Warehouse - A8', 'active');

-- Construction Materials
INSERT INTO item (type, brand_id, name, description, delivered_quantity, damaged_quantity, lost_quantity, available_quantity, warehouse_location, status) VALUES
('material', NULL, 'Cement Portland 40kg', 'High-grade portland cement bags', 500, 15, 5, 480, 'Main Warehouse - C1', 'active'),
('material', NULL, 'Steel Rebar 12mm', '6-meter steel reinforcement bars', 200, 8, 2, 190, 'Main Warehouse - D1', 'active'),
('material', NULL, 'Plywood 4x8 Marine Grade', '18mm marine grade plywood sheets', 150, 3, 1, 146, 'Main Warehouse - E1', 'active'),
('material', NULL, 'PVC Pipe 4 inches', '6-meter PVC drainage pipes', 100, 2, 0, 98, 'Main Warehouse - F1', 'active'),
('material', NULL, 'Electrical Wire 14AWG', '100-meter copper electrical wire rolls', 80, 1, 0, 79, 'Main Warehouse - G1', 'active'),
('material', NULL, 'Paint Primer White 4L', 'High-quality primer for walls', 60, 0, 1, 59, 'Main Warehouse - H1', 'active'),
('material', NULL, 'Ceramic Tiles 60x60cm', 'Premium ceramic floor tiles per box', 300, 12, 3, 285, 'Main Warehouse - I1', 'active'),
('material', NULL, 'Roofing Sheets Galvanized', '3-meter corrugated roofing sheets', 120, 4, 0, 116, 'Main Warehouse - J1', 'active'),
('material', NULL, 'Sand Fine Grade', 'Construction sand per cubic meter', 50, 0, 0, 50, 'Main Warehouse - Yard', 'active'),
('material', NULL, 'Gravel 3/4 inch', 'Aggregate gravel per cubic meter', 40, 0, 0, 40, 'Main Warehouse - Yard', 'active');

-- Safety Equipment (Products)
INSERT INTO item (type, brand_id, name, description, delivered_quantity, damaged_quantity, lost_quantity, available_quantity, warehouse_location, status) VALUES
('product', NULL, 'Safety Helmet White', 'ANSI approved safety helmets', 200, 5, 3, 192, 'Main Warehouse - S1', 'active'),
('product', NULL, 'Safety Vest High-Vis', 'Reflective safety vests Class 2', 150, 2, 1, 147, 'Main Warehouse - S2', 'active'),
('product', NULL, 'Work Boots Steel Toe', 'Size 8-12 steel toe safety boots', 100, 1, 0, 99, 'Main Warehouse - S3', 'active'),
('product', NULL, 'Safety Gloves', 'Cut-resistant work gloves', 300, 8, 2, 290, 'Main Warehouse - S4', 'active'),
('product', NULL, 'Safety Goggles', 'Anti-fog safety glasses', 180, 3, 1, 176, 'Main Warehouse - S5', 'active');

-- ====================
-- 2. PROJECTS
-- ====================
INSERT INTO project (jo_number, name, description, status, created_by) VALUES
('JO-2025-001', 'BGC Office Building Construction', 'Multi-story office building in Bonifacio Global City', 'ongoing', 1),
('JO-2025-002', 'Eastwood Mall Renovation', 'Major renovation of Eastwood Mall shopping center', 'ongoing', 1),
('JO-2025-003', 'Alabang Town Center Expansion', 'Addition of new wing to existing mall', 'upcoming', 2),
('JO-2025-004', 'Cebu IT Park Development', 'New IT park construction in Cebu', 'ongoing', 2),
('JO-2025-005', 'Davao Convention Center', 'Large convention and exhibition center', 'upcoming', 1),
('JO-2025-006', 'Iloilo Business District', 'Mixed-use development project', 'completed', 2),
('JO-2025-007', 'Baguio Mountain Resort', 'Eco-friendly resort development', 'upcoming', 1);

-- ====================
-- 3. PROJECT DAYS
-- ====================
INSERT INTO project_day (project_id, project_date, location) VALUES
-- BGC Office Building (Project 1) - Recent days
(1, '2025-10-15', 'BGC Office Building Project'),
(1, '2025-10-16', 'BGC Office Building Project'),
(1, '2025-10-17', 'BGC Office Building Project'),
(1, '2025-10-18', 'BGC Office Building Project'),
(1, '2025-10-19', 'BGC Office Building Project'),
(1, '2025-10-20', 'BGC Office Building Project'),
(1, '2025-10-21', 'BGC Office Building Project'),
(1, '2025-10-22', 'BGC Office Building Project'),

-- Eastwood Mall (Project 2) - Recent days
(2, '2025-10-15', 'Eastwood Mall Construction'),
(2, '2025-10-16', 'Eastwood Mall Construction'),
(2, '2025-10-17', 'Eastwood Mall Construction'),
(2, '2025-10-18', 'Eastwood Mall Construction'),
(2, '2025-10-19', 'Eastwood Mall Construction'),
(2, '2025-10-20', 'Eastwood Mall Construction'),
(2, '2025-10-21', 'Eastwood Mall Construction'),

-- Cebu IT Park (Project 4) - Recent days
(4, '2025-10-16', 'Cebu IT Park Development'),
(4, '2025-10-17', 'Cebu IT Park Development'),
(4, '2025-10-18', 'Cebu IT Park Development'),
(4, '2025-10-19', 'Cebu IT Park Development'),
(4, '2025-10-20', 'Cebu IT Park Development');

-- ====================
-- 4. PROJECT ITEMS (ALLOCATIONS)
-- ====================
INSERT INTO project_item (project_day_id, item_id, allocated_quantity, damaged_quantity, lost_quantity, returned_quantity, status) VALUES
-- BGC Office Building allocations
(1, 1, 5, 0, 0, 4, 'returned'), -- Angle Grinders
(1, 2, 3, 0, 0, 3, 'returned'), -- Cordless Drills
(1, 11, 20, 1, 0, 19, 'returned'), -- Cement bags
(1, 12, 10, 0, 0, 10, 'returned'), -- Steel Rebar

(2, 1, 4, 0, 0, 4, 'returned'), -- Angle Grinders
(2, 3, 10, 0, 1, 9, 'returned'), -- Measuring Tapes
(2, 13, 8, 0, 0, 8, 'returned'), -- Plywood sheets
(2, 21, 15, 0, 0, 15, 'returned'), -- Safety Helmets

(3, 4, 2, 0, 0, 2, 'returned'), -- Circular Saws
(3, 5, 2, 0, 0, 2, 'returned'), -- Hammer Drills
(3, 14, 5, 0, 0, 5, 'returned'), -- PVC Pipes
(3, 15, 3, 0, 0, 3, 'returned'), -- Electrical Wire

-- Current day allocations (not yet returned)
(8, 1, 6, 0, 0, 0, 'allocated'), -- Angle Grinders - current
(8, 2, 4, 0, 0, 0, 'allocated'), -- Cordless Drills - current
(8, 6, 3, 0, 0, 0, 'allocated'), -- Impact Drivers - current
(8, 21, 20, 0, 0, 0, 'allocated'), -- Safety Helmets - current
(8, 22, 20, 0, 0, 0, 'allocated'), -- Safety Vests - current

-- Eastwood Mall allocations
(9, 7, 2, 0, 0, 2, 'returned'), -- Multi-Tools
(9, 8, 3, 1, 0, 2, 'returned'), -- Jigsaws
(9, 16, 5, 0, 0, 5, 'returned'), -- Paint Primer
(9, 17, 15, 2, 0, 13, 'returned'), -- Ceramic Tiles

(13, 9, 2, 0, 0, 2, 'returned'), -- Socket Sets
(13, 10, 1, 0, 0, 1, 'returned'), -- Concrete Drills
(13, 18, 8, 1, 0, 7, 'returned'), -- Roofing Sheets

-- Current Eastwood allocations
(15, 1, 3, 0, 0, 0, 'allocated'), -- Angle Grinders - current
(15, 4, 2, 0, 0, 0, 'allocated'), -- Circular Saws - current
(15, 23, 10, 0, 0, 0, 'allocated'), -- Work Boots - current

-- Cebu IT Park allocations
(16, 5, 1, 0, 0, 1, 'returned'), -- Hammer Drills
(16, 11, 25, 2, 0, 23, 'returned'), -- Cement bags
(16, 19, 5, 0, 0, 5, 'returned'), -- Sand

(20, 6, 4, 0, 0, 0, 'allocated'), -- Impact Drivers - current
(20, 12, 15, 0, 0, 0, 'allocated'), -- Steel Rebar - current
(20, 20, 3, 0, 0, 0, 'allocated'); -- Gravel - current

-- ====================
-- 5. PROJECT PERSONNEL ASSIGNMENTS
-- ====================
INSERT INTO project_personnel (project_day_id, personnel_id, role_id) VALUES
-- BGC Office Building team
(8, 1, 1), -- Roberto Silva as Project Manager
(8, 2, 2), -- Carmen Dela Cruz as Site Supervisor
(8, 3, 4), -- Eduardo Ramos as Equipment Operator
(8, 4, 5), -- Patricia Morales as Safety Officer
(8, 5, 9), -- Ferdinand Aquino as Site Worker
(8, 6, 9), -- Rosario Valdez as Site Worker

-- Eastwood Mall team
(15, 7, 1), -- Benjamin Castro as Project Manager
(15, 8, 2), -- Gloria Herrera as Site Supervisor
(15, 9, 6), -- Antonio Jimenez as Quality Controller
(15, 10, 9), -- Maricel Rodriguez as Site Worker
(15, 11, 9), -- Diego Fernandez as Site Worker

-- Cebu IT Park team
(20, 12, 1), -- Cristina Ortega as Project Manager
(20, 13, 2), -- Rafael Vargas as Site Supervisor
(20, 14, 7), -- Elena Castillo as Logistics Coordinator
(20, 15, 9); -- Oscar Medina as Site Worker

-- ====================
-- SUCCESS MESSAGE
-- ====================
SELECT 'Items and inventory data inserted successfully!' AS Status;