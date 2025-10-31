-- ================================================
-- MOCK DATA FOR AAI INVENTORY MANAGEMENT SYSTEM
-- FILE: 02_items_inventory.sql
-- PURPOSE: Insert mock data for items, projects, and inventory operations
-- REGION: Mindanao (Davao City Focused)
-- ================================================

USE AAI_inventory_db;

-- ====================
-- 1. ITEMS (CONSUMER PRODUCTS & MATERIALS)
-- ====================

-- Grocery & Consumer Products
INSERT INTO item (type, brand_id, name, description, delivered_quantity, damaged_quantity, lost_quantity, available_quantity, warehouse_location_id, status) VALUES
('product', 1, 'Milo 24g Sachet', 'Chocolate malt drink sachet for single serving', 500, 5, 2, 493, 1, 'active'),
('product', 1, 'Milo 1kg Pack', 'Family pack of chocolate malt energy drink', 200, 2, 1, 197, 1, 'active'),
('product', 2, 'Nescafé Classic 50g', 'Instant coffee in 50g jar', 300, 3, 2, 295, 1, 'active'),
('product', 2, 'Nescafé 3-in-1 Original Sachet', 'Instant coffee mix sachet for single use', 800, 8, 5, 787, 1, 'active'),
('product', 3, 'Bear Brand Powdered Milk 320g', 'Fortified milk drink powder pack', 250, 3, 1, 246, 1, 'active'),
('product', 3, 'Bear Brand Sterilized Milk 200ml', 'Ready-to-drink sterilized milk bottle', 300, 2, 3, 295, 1, 'active'),
('product', 4, 'Quaker Oats 800g', 'Instant oats for healthy breakfast meals', 150, 1, 0, 149, 1, 'active'),
('product', 4, 'Quaker Oats Choco 28g Cup', 'Single-serve cup oatmeal with chocolate flavor', 400, 3, 2, 395, 1, 'active'),
('product', 5, 'Oishi Prawn Crackers 60g', 'Crunchy shrimp-flavored snack pack', 500, 10, 5, 485, 1, 'active'),
('product', 5, 'Oishi Pillows Choco 150g', 'Chocolate-filled snack pillows', 400, 5, 3, 392, 1, 'active'),
('product', 6, 'Jack n Jill Chippy BBQ 110g', 'Barbecue-flavored corn chips', 350, 5, 2, 343, 1, 'active'),
('product', 6, 'Jack n Jill Piattos Cheese 85g', 'Cheese-flavored potato crisps', 450, 6, 4, 440, 1, 'active'),
('product', 7, 'Coca-Cola 1.5L Bottle', 'Soft drink PET bottle', 250, 5, 3, 242, 1, 'active'),
('product', 7, 'Coca-Cola 330ml Can', 'Carbonated beverage in can', 600, 6, 3, 591, 1, 'active'),
('product', 8, 'Del Monte Pineapple Juice 1L', 'Pure pineapple juice in tetra pack', 200, 2, 1, 197, 1, 'active'),
('product', 8, 'Del Monte Tomato Sauce 250g', 'Tomato sauce for pasta and dishes', 300, 5, 3, 292, 1, 'active'),
('product', 9, 'Lucky Me! Pancit Canton Original', 'Instant noodles, original flavor', 800, 10, 5, 785, 1, 'active'),
('product', 9, 'Lucky Me! Instant Mami Chicken', 'Instant noodle soup, chicken flavor', 600, 5, 3, 592, 1, 'active'),
('product', 10, 'Century Tuna Flakes in Oil 180g', 'Tuna flakes in vegetable oil', 250, 2, 1, 247, 1, 'active'),
('product', 10, 'Century Tuna Hot & Spicy 180g', 'Hot and spicy tuna flakes', 250, 3, 2, 245, 1, 'active'),
('product', 11, 'Surf Powder 1kg', 'Laundry detergent powder with long-lasting fragrance', 300, 4, 2, 294, 1, 'active'),
('product', 11, 'Surf Powder 500g', 'Economy pack detergent powder', 500, 5, 3, 492, 1, 'active'),
('product', 12, 'Downy Fabric Conditioner 800ml', 'Liquid fabric conditioner refill pack', 200, 2, 1, 197, 1, 'active'),
('product', 12, 'Downy Fabric Conditioner 1.5L', 'Large refill pack for families', 150, 1, 0, 149, 1, 'active'),
('product', 13, 'Safeguard White Soap 90g', 'Antibacterial soap for everyday use', 600, 5, 3, 592, 1, 'active'),
('product', 13, 'Safeguard Lemon Soap 135g', 'Antibacterial soap with lemon scent', 400, 3, 2, 395, 1, 'active'),
('product', 14, 'Colgate Toothpaste 190g', 'Toothpaste for cavity protection', 300, 3, 1, 296, 1, 'active'),
('product', 14, 'Colgate Toothbrush Medium', 'Medium-bristle toothbrush', 500, 5, 3, 492, 1, 'active'),
('product', 15, 'Palmolive Shampoo 180ml', 'Shampoo with natural ingredients', 300, 2, 1, 297, 1, 'active'),
('product', 15, 'Palmolive Conditioner 180ml', 'Hair conditioner for smooth finish', 200, 2, 0, 198, 1, 'active'),
('product', 16, 'Epson L3210 Printer', 'All-in-one printer for documents and photos', 10, 0, 0, 10, 1, 'active'),
('product', 16, 'Epson Ink Bottle T664 (Black)', 'Black ink bottle for Epson printers', 100, 2, 0, 98, 1, 'active');

-- Materials & Equipment for Office / Booth / Events
INSERT INTO item (type, brand_id, name, description, delivered_quantity, damaged_quantity, lost_quantity, available_quantity, warehouse_location_id, status) VALUES
('material', NULL, 'Plastic Table 4ft', 'Folding plastic table for events', 50, 1, 0, 49, 2, 'active'),
('material', NULL, 'Monoblock Chair', 'White plastic chair for booths or exhibits', 200, 3, 2, 195, 2, 'active'),
('material', NULL, 'Electric Kettle 1.5L', 'Electric kettle for staff or clients', 20, 0, 0, 20, 2, 'active'),
('material', NULL, 'Serving Spoon (Stainless)', 'Large stainless steel serving spoon', 60, 1, 0, 59, 2, 'active'),
('material', NULL, 'Cooking Pot Medium', 'Stainless cooking pot used for demos', 15, 0, 0, 15, 2, 'active'),
('material', NULL, 'Table Cloth White', 'White table cloth for presentation tables', 40, 2, 0, 38, 2, 'active'),
('material', NULL, 'Extension Cord 5m', 'Power extension cord with 4 outlets', 30, 1, 0, 29, 2, 'active'),
('material', NULL, 'Standing Fan 16 inch', 'Electric fan for booth ventilation', 25, 0, 1, 24, 2, 'active'),
('material', NULL, 'LED Light Bulb 10W', 'Energy-saving light bulb for booth lighting', 100, 2, 1, 97, 2, 'active'),
('material', NULL, 'Plastic Food Container Set', 'Reusable container set for giveaways', 80, 1, 0, 79, 2, 'active');

-- ====================
-- 2. PROJECTS
-- ====================
INSERT INTO project (jo_number, name, description, status, created_by) VALUES
('MKT-2025-001', 'SM Lanang Grocery Fair', 'Product sampling and demo for consumer brands at SM Lanang Premiere', 'ongoing', 1),
('MKT-2025-002', 'Abreeza Mall Product Launch', 'Brand activation event for new grocery items at Abreeza Mall', 'upcoming', 1),
('MKT-2025-003', 'Tagum City Trade Expo', 'Provincial trade fair featuring major household brands', 'ongoing', 2),
('MKT-2025-004', 'General Santos Food Festival', 'Food sampling and promotional booth setup in GenSan', 'upcoming', 1),
('MKT-2025-005', 'Cagayan de Oro Consumer Roadshow', 'Roadshow for daily essentials and home products', 'completed', 2);

-- ====================
-- 3. PROJECT DAYS
-- ====================
INSERT INTO project_day (project_id, project_date, location_id) VALUES
(1, '2025-11-10', 3),
(1, '2025-11-11', 3),
(1, '2025-11-12', 3),
(2, '2025-11-15', 4),
(2, '2025-11-16', 4),
(3, '2025-11-18', 6),
(3, '2025-11-19', 6),
(4, '2025-11-21', 7),
(4, '2025-11-22', 7),
(5, '2025-11-25', 8),
(5, '2025-11-26', 8);

-- ====================
-- 4. PROJECT ITEMS (ALLOCATIONS)
-- ====================
INSERT INTO project_item (project_day_id, item_id, allocated_quantity, damaged_quantity, lost_quantity, returned_quantity, status) VALUES
-- SM Lanang Grocery Fair
(1, 1, 50, 0, 0, 45, 'returned'), -- Milo Sachets
(1, 11, 30, 1, 0, 29, 'returned'), -- Surf Powder
(1, 25, 10, 0, 0, 10, 'returned'), -- Downy Conditioner
(1, 41, 10, 0, 0, 10, 'returned'), -- Plastic Table
(1, 42, 30, 0, 1, 29, 'returned'), -- Monoblock Chairs

-- Abreeza Product Launch
(4, 2, 40, 0, 0, 40, 'returned'), -- Milo 1kg
(4, 18, 60, 0, 0, 60, 'returned'), -- Lucky Me Pancit Canton
(4, 31, 20, 0, 0, 20, 'returned'), -- Colgate Toothpaste
(4, 43, 10, 0, 0, 10, 'returned'), -- Electric Kettle
(4, 44, 15, 0, 0, 15, 'returned'), -- Serving Spoon

-- Tagum City Expo (current allocations)
(6, 7, 25, 0, 0, 0, 'allocated'), -- Quaker Oats
(6, 15, 10, 0, 0, 0, 'allocated'), -- Del Monte Tomato Sauce
(6, 20, 15, 0, 0, 0, 'allocated'), -- Century Tuna
(6, 45, 8, 0, 0, 0, 'allocated'), -- Cooking Pot
(6, 46, 10, 0, 0, 0, 'allocated'), -- Table Cloth

-- General Santos Food Festival (current allocations)
(8, 12, 25, 1, 0, 0, 'allocated'), -- Surf Powder 500g
(8, 27, 20, 0, 0, 0, 'allocated'), -- Colgate Toothbrush
(8, 47, 5, 0, 0, 0, 'allocated'), -- Extension Cord
(8, 48, 6, 0, 0, 0, 'allocated'), -- Standing Fan
(8, 49, 20, 0, 0, 0, 'allocated'); -- LED Light Bulb

-- ====================
-- 5. PROJECT PERSONNEL ASSIGNMENTS
-- ====================
INSERT INTO project_personnel (project_day_id, personnel_id, role_id) VALUES
(1, 1, 1), -- Roberto Del Rosario as Event Coordinator
(1, 2, 5), -- Carmen Tan as Brand Ambassador
(1, 3, 9), -- Eduardo Lim as Inventory Supervisor
(4, 4, 7), -- Patricia Abella as Marketing Coordinator
(4, 5, 2), -- Ferdinand Uy as Booth Designer
(6, 6, 1), -- Rosario Go as Event Coordinator
(6, 7, 8), -- Benjamin Ong as Logistics Coordinator
(8, 8, 3), -- Gloria Sarenas as Display Specialist
(8, 9, 4), -- Antonio Dizon as Audio-Visual Technician
(10, 10, 5); -- Maricel Villanueva as Brand Ambassador

-- ====================
-- SUCCESS MESSAGE
-- ====================
SELECT 'Items and inventory data inserted successfully for consumer products and materials!' AS Status;
