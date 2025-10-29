-- ================================================
-- MOCK DATA FOR AAI INVENTORY MANAGEMENT SYSTEM
-- FILE: 02_items_inventory.sql
-- PURPOSE: Insert mock data for items, projects, and inventory operations
-- ================================================

USE AAI_inventory_db;

-- ====================
-- 1. ITEMS (PRODUCTS & MATERIALS)
-- ====================

-- Display & Signage Materials (Products)
INSERT INTO item (type, brand_id, name, description, delivered_quantity, damaged_quantity, lost_quantity, available_quantity, warehouse_location_id, status) VALUES
('product', 1, 'Sintra Foam Board 4x8ft 5mm', 'Premium white foam board for displays', 100, 3, 1, 96, 1, 'active'),
('product', 2, 'Vinyl Tarpaulin 13oz', 'Weather-resistant tarpaulin per sqm', 200, 5, 2, 193, 1, 'active'),
('product', 3, 'Digital Print Stickers A4', 'High-quality adhesive stickers', 500, 10, 5, 485, 1, 'active'),
('product', 4, 'Flex Banner 440gsm', 'Outdoor flex banner material per sqm', 150, 2, 0, 148, 1, 'active'),
('product', 11, 'LED Strip Lights 5m', 'RGB color-changing LED strips', 80, 1, 0, 79, 1, 'active'),
('product', 12, 'Portable LED Spotlights', '50W rechargeable LED spotlights', 40, 0, 1, 39, 1, 'active'),
('product', 10, 'Wireless Microphone System', 'Professional wireless mic system', 25, 1, 0, 24, 1, 'active'),
('product', 12, 'Bluetooth Speaker 100W', 'High-powered Bluetooth speakers', 30, 0, 0, 30, 1, 'active'),
('product', 9, 'Tool Kit Basic', '50-piece booth assembly tool set', 20, 0, 0, 20, 1, 'active'),
('product', 9, 'Electric Drill Set', 'Cordless drill with bits for booth setup', 15, 0, 0, 15, 1, 'active');

-- Booth Construction Materials
INSERT INTO item (type, brand_id, name, description, delivered_quantity, damaged_quantity, lost_quantity, available_quantity, warehouse_location_id, status) VALUES
('material', 7, 'Marine Plywood 4x8ft 12mm', 'High-quality marine plywood sheets', 100, 2, 1, 97, 1, 'active'),
('material', 8, 'Particle Board 4x8ft 18mm', 'Smooth particle board for displays', 80, 1, 0, 79, 1, 'active'),
('material', 9, 'Aluminum Frame Strips 3m', 'Lightweight aluminum framing', 200, 3, 2, 195, 1, 'active'),
('material', NULL, 'PVC Pipe 2 inches 6m', 'White PVC pipes for booth structure', 150, 2, 0, 148, 1, 'active'),
('material', NULL, 'Electrical Wire 12AWG', '50-meter electrical wire rolls', 60, 0, 1, 59, 1, 'active'),
('material', 5, 'Boysen White Paint 4L', 'Premium white paint for booth walls', 40, 0, 0, 40, 1, 'active'),
('material', 6, 'Davies Primer Gray 4L', 'High-quality gray primer', 35, 1, 0, 34, 1, 'active'),
('material', NULL, 'Carpet Tiles Gray 50x50cm', 'Commercial carpet tiles per box', 100, 2, 1, 97, 1, 'active'),
('material', NULL, 'Glass Panels 4x6ft', 'Tempered glass display panels', 30, 0, 0, 30, 1, 'active'),
('material', NULL, 'Steel Brackets L-Shape', 'Heavy-duty steel brackets for support', 200, 5, 2, 193, 1, 'active');

-- Promotional & Giveaway Items (Products)
INSERT INTO item (type, brand_id, name, description, delivered_quantity, damaged_quantity, lost_quantity, available_quantity, warehouse_location_id, status) VALUES
('product', NULL, 'Branded T-Shirts Medium', 'Company logo t-shirts medium size', 200, 3, 2, 195, 2, 'active'),
('product', NULL, 'Promotional Tote Bags', 'Eco-friendly canvas tote bags', 300, 5, 5, 290, 2, 'active'),
('product', NULL, 'Custom Ballpens', 'Branded ballpoint pens with logo', 1000, 20, 10, 970, 2, 'active'),
('product', NULL, 'Branded Keychains', 'Metal keychains with company logo', 500, 8, 2, 490, 2, 'active'),
('product', NULL, 'Event Lanyards', 'Custom printed event lanyards', 400, 5, 3, 392, 2, 'active');

-- ====================
-- 2. PROJECTS
-- ====================
INSERT INTO project (jo_number, name, description, status, created_by) VALUES
('MKT-2025-001', 'SM Megamall Tech Fair', 'Technology exhibition booth at SM Megamall Atrium', 'ongoing', 1),
('MKT-2025-002', 'Ayala Centrio Product Launch', 'New product launch event at Ayala Malls Centrio', 'ongoing', 1),
('MKT-2025-003', 'MOA Summer Festival Booth', 'Summer festival promotional booth at Mall of Asia', 'upcoming', 2),
('MKT-2025-004', 'Cebu IT Park Trade Show', 'Business solutions trade show in Cebu IT Park', 'ongoing', 2),
('MKT-2025-005', 'Davao Convention Expo', 'Regional business expo at Davao Convention Center', 'upcoming', 1),
('MKT-2025-006', 'Robinsons Iloilo Brand Activation', 'Interactive brand experience at Robinsons Place', 'completed', 2),
('MKT-2025-007', 'Baguio Session Road Roadshow', 'Mobile marketing roadshow in Baguio City', 'upcoming', 1);

-- ====================
-- 3. PROJECT DAYS
-- ====================
INSERT INTO project_day (project_id, project_date, location_id) VALUES
-- SM Megamall Tech Fair (Project 1) - Event days
(1, '2025-10-15', 3), -- SM Megamall Atrium Event
(1, '2025-10-16', 3), -- SM Megamall Atrium Event
(1, '2025-10-17', 3), -- SM Megamall Atrium Event
(1, '2025-10-18', 3), -- SM Megamall Atrium Event
(1, '2025-10-19', 3), -- SM Megamall Atrium Event
(1, '2025-10-20', 3), -- SM Megamall Atrium Event
(1, '2025-10-21', 3), -- SM Megamall Atrium Event
(1, '2025-10-22', 3), -- SM Megamall Atrium Event

-- Ayala Centrio Product Launch (Project 2) - Event days
(2, '2025-10-15', 4), -- Ayala Malls Centrio Booth
(2, '2025-10-16', 4), -- Ayala Malls Centrio Booth
(2, '2025-10-17', 4), -- Ayala Malls Centrio Booth
(2, '2025-10-18', 4), -- Ayala Malls Centrio Booth
(2, '2025-10-19', 4), -- Ayala Malls Centrio Booth
(2, '2025-10-20', 4), -- Ayala Malls Centrio Booth
(2, '2025-10-21', 4), -- Ayala Malls Centrio Booth

-- Cebu IT Park Trade Show (Project 4) - Event days
(4, '2025-10-16', 6), -- Cebu IT Park Trade Show
(4, '2025-10-17', 6), -- Cebu IT Park Trade Show
(4, '2025-10-18', 6), -- Cebu IT Park Trade Show
(4, '2025-10-19', 6), -- Cebu IT Park Trade Show
(4, '2025-10-20', 6); -- Cebu IT Park Trade Show

-- ====================
-- 4. PROJECT ITEMS (ALLOCATIONS)
-- ====================
INSERT INTO project_item (project_day_id, item_id, allocated_quantity, damaged_quantity, lost_quantity, returned_quantity, status) VALUES
-- SM Megamall Tech Fair allocations
(1, 1, 10, 0, 0, 9, 'returned'), -- Sintra Foam Boards
(1, 2, 5, 0, 0, 5, 'returned'), -- Vinyl Tarpaulin
(1, 11, 15, 1, 0, 14, 'returned'), -- Marine Plywood
(1, 12, 8, 0, 0, 8, 'returned'), -- Particle Board

(2, 1, 8, 0, 0, 8, 'returned'), -- Sintra Foam Boards
(2, 3, 50, 0, 2, 48, 'returned'), -- Digital Print Stickers
(2, 13, 10, 0, 0, 10, 'returned'), -- Aluminum Frame Strips
(2, 21, 100, 0, 0, 100, 'returned'), -- Branded T-Shirts

(3, 4, 3, 0, 0, 3, 'returned'), -- Flex Banner
(3, 5, 8, 0, 0, 8, 'returned'), -- LED Strip Lights
(3, 14, 5, 0, 0, 5, 'returned'), -- PVC Pipe
(3, 15, 2, 0, 0, 2, 'returned'), -- Electrical Wire

-- Current day allocations (not yet returned)
(8, 1, 12, 0, 0, 0, 'allocated'), -- Sintra Foam Boards - current
(8, 2, 6, 0, 0, 0, 'allocated'), -- Vinyl Tarpaulin - current
(8, 6, 4, 0, 0, 0, 'allocated'), -- Portable LED Spotlights - current
(8, 21, 50, 0, 0, 0, 'allocated'), -- Branded T-Shirts - current
(8, 22, 80, 0, 0, 0, 'allocated'), -- Promotional Tote Bags - current

-- Ayala Centrio Product Launch allocations
(9, 7, 2, 0, 0, 2, 'returned'), -- Wireless Microphone System
(9, 8, 2, 0, 0, 2, 'returned'), -- Bluetooth Speaker
(9, 16, 3, 0, 0, 3, 'returned'), -- Boysen White Paint
(9, 17, 10, 1, 0, 9, 'returned'), -- Carpet Tiles

(13, 9, 1, 0, 0, 1, 'returned'), -- Tool Kit Basic
(13, 10, 1, 0, 0, 1, 'returned'), -- Electric Drill Set
(13, 18, 2, 0, 0, 2, 'returned'), -- Glass Panels

-- Current Ayala Centrio allocations
(15, 1, 6, 0, 0, 0, 'allocated'), -- Sintra Foam Boards - current
(15, 4, 4, 0, 0, 0, 'allocated'), -- Flex Banner - current
(15, 23, 200, 0, 0, 0, 'allocated'), -- Custom Ballpens - current

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
-- SM Megamall Tech Fair team
(8, 1, 1), -- Roberto Silva as Event Coordinator
(8, 2, 2), -- Carmen Dela Cruz as Booth Designer
(8, 3, 3), -- Eduardo Ramos as Display Specialist
(8, 4, 4), -- Patricia Morales as Audio-Visual Technician
(8, 5, 5), -- Ferdinand Aquino as Brand Ambassador
(8, 6, 9), -- Rosario Valdez as Inventory Supervisor

-- Ayala Centrio Product Launch team
(15, 7, 1), -- Benjamin Castro as Event Coordinator
(15, 8, 6), -- Gloria Herrera as Creative Director
(15, 9, 7), -- Antonio Jimenez as Marketing Coordinator
(15, 10, 5), -- Maricel Rodriguez as Brand Ambassador
(15, 11, 9), -- Diego Fernandez as Inventory Supervisor

-- Cebu IT Park Trade Show team
(20, 12, 1), -- Cristina Ortega as Event Coordinator
(20, 13, 2), -- Rafael Vargas as Booth Designer
(20, 14, 8), -- Elena Castillo as Logistics Coordinator
(20, 15, 3); -- Oscar Medina as Display Specialist

-- ====================
-- SUCCESS MESSAGE
-- ====================
SELECT 'Items and inventory data inserted successfully!' AS Status;