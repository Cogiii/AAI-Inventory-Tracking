-- ============================================================================
-- AAI INVENTORY TRACKING SYSTEM - SEED DATA
-- Location: Davao Region, Mindanao, Philippines
-- Data Coverage: January 12, 2026 (System Launch) - Present & Future
-- ============================================================================
--
-- IMPORTANT: This seed data is designed for a database that already has:
--   - Users (IDs 1-3): Admin, Laurence, Angela
--   - Positions (IDs 1-5): Administrator, Marketing Manager, Staff, etc.
--   - Roles (IDs 1-4): PA, BA, Sampler, Driver
--   - Project ID 1: "test" (JO-2026-001)
--
-- This file will ADD data for:
--   - Brands, Locations, Personnel, Items
--   - Projects (starting from ID 2), Project Days, Project Items
--   - All Logs (inventory, activity, project, damage/loss, delivery, transfer)
--
-- HOW TO USE:
-- 1. Ensure your database has the existing users/positions/roles
-- 2. Run this script to populate with sample data
-- 3. Modify values as needed (names, dates, quantities)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- SECTION 1: BRANDS
-- ============================================================================

INSERT INTO brand (id, name, description, created_at) VALUES
(1, 'AAI Custom', 'In-house produced marketing materials', '2026-01-12 08:00:00'),
(2, 'Samsung', 'Samsung electronics and displays', '2026-01-12 08:00:00'),
(3, 'Sony', 'Sony audio and visual equipment', '2026-01-12 08:00:00'),
(4, 'Canon', 'Canon printing and imaging equipment', '2026-01-12 08:00:00'),
(5, 'HP', 'HP computers and printers', '2026-01-12 08:00:00'),
(6, 'Epson', 'Epson printers and projectors', '2026-01-12 08:00:00'),
(7, 'JBL', 'JBL audio equipment', '2026-01-12 08:00:00'),
(8, 'Logitech', 'Logitech peripherals', '2026-01-12 08:00:00'),
(9, 'Brother', 'Brother printers and labelers', '2026-01-12 08:00:00'),
(10, 'Generic', 'Unbranded or generic items', '2026-01-12 08:00:00');

-- ============================================================================
-- SECTION 2: LOCATIONS (Davao Region)
-- ============================================================================

INSERT INTO location (id, name, type, street, barangay, city, province, region, postal_code, country, is_active, created_at) VALUES
-- Warehouses
(1, 'Main Warehouse Davao', 'warehouse', 'Km. 7, Diversion Road', 'Lanang', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', 1, '2026-01-12 08:00:00'),
(2, 'Tagum Storage Facility', 'warehouse', 'National Highway', 'Visayan Village', 'Tagum City', 'Davao del Norte', 'Region XI', '8100', 'Philippines', 1, '2026-01-20 08:00:00'),
(3, 'Digos Warehouse', 'warehouse', 'Rizal Avenue', 'Zone 3', 'Digos City', 'Davao del Sur', 'Region XI', '8002', 'Philippines', 1, '2026-02-01 08:00:00'),

-- Offices
(4, 'AAI Head Office', 'office', 'Door 5, Felcris Centrale', 'Bajada', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', 1, '2026-01-12 08:00:00'),
(5, 'GenSan Branch Office', 'office', 'Santiago Blvd', 'Dadiangas Heights', 'General Santos City', 'South Cotabato', 'Region XII', '9500', 'Philippines', 1, '2026-02-15 08:00:00'),

-- Project Sites (Various venues in Davao region)
(6, 'SMX Convention Center Davao', 'project_site', 'Quimpo Boulevard', 'Ecoland', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', 1, '2026-01-12 08:00:00'),
(7, 'Abreeza Mall Activity Area', 'project_site', 'J.P. Laurel Avenue', 'Bajada', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', 1, '2026-01-12 08:00:00'),
(8, 'SM Lanang Premier Event Hall', 'project_site', 'J.P. Laurel Avenue', 'Lanang', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', 1, '2026-01-12 08:00:00'),
(9, 'Gaisano Mall Tagum', 'project_site', 'National Highway', 'Magugpo South', 'Tagum City', 'Davao del Norte', 'Region XI', '8100', 'Philippines', 1, '2026-01-20 08:00:00'),
(10, 'Robinsons Cybergate Davao', 'project_site', 'J.P. Laurel Avenue', 'Buhangin', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', 1, '2026-01-12 08:00:00'),
(11, 'NCCC Mall Davao', 'project_site', 'McArthur Highway', 'Matina', 'Davao City', 'Davao del Sur', 'Region XI', '8000', 'Philippines', 1, '2026-01-12 08:00:00'),
(12, 'Gaisano Grand Digos', 'project_site', 'Rizal Avenue', 'Zone 2', 'Digos City', 'Davao del Sur', 'Region XI', '8002', 'Philippines', 1, '2026-02-01 08:00:00'),
(13, 'KCC Mall GenSan', 'project_site', 'Jose Catolico Sr. Avenue', 'Lagao', 'General Santos City', 'South Cotabato', 'Region XII', '9500', 'Philippines', 1, '2026-02-15 08:00:00'),
(14, 'Panabo City Plaza', 'project_site', 'Quezon Street', 'Poblacion', 'Panabo City', 'Davao del Norte', 'Region XI', '8105', 'Philippines', 1, '2026-01-25 08:00:00'),
(15, 'Island Garden City Samal Resort', 'project_site', 'Penal Road', 'Penal', 'Island Garden City of Samal', 'Davao del Norte', 'Region XI', '8119', 'Philippines', 1, '2026-02-10 08:00:00');

-- ============================================================================
-- SECTION 3: PERSONNEL (Field Workers)
-- ============================================================================

INSERT INTO personnel (id, name, contact_number, is_active, created_at) VALUES
(1, 'Roberto Dela Cruz', '09171234567', 1, '2026-01-12 08:00:00'),
(2, 'Maria Santos', '09182345678', 1, '2026-01-12 08:00:00'),
(3, 'Juan Reyes', '09193456789', 1, '2026-01-12 08:00:00'),
(4, 'Rosa Bautista', '09204567890', 1, '2026-01-12 08:00:00'),
(5, 'Pedro Gonzales', '09215678901', 1, '2026-01-12 08:00:00'),
(6, 'Carmen Villanueva', '09226789012', 1, '2026-01-14 08:00:00'),
(7, 'Antonio Ramos', '09237890123', 1, '2026-01-14 08:00:00'),
(8, 'Lucia Fernandez', '09248901234', 1, '2026-01-18 08:00:00'),
(9, 'Miguel Torres', '09259012345', 1, '2026-01-18 08:00:00'),
(10, 'Ana Garcia', '09260123456', 1, '2026-01-22 08:00:00'),
(11, 'Carlos Mendoza', '09271234567', 1, '2026-01-22 08:00:00'),
(12, 'Patricia Lopez', '09282345678', 1, '2026-01-28 08:00:00'),
(13, 'Mark Navarro', '09293456789', 1, '2026-01-28 08:00:00'),
(14, 'Jennifer Cruz', '09304567890', 1, '2026-02-05 08:00:00'),
(15, 'Raymond Aquino', '09315678901', 1, '2026-02-05 08:00:00'),
(16, 'Michelle Castro', '09326789012', 1, '2026-02-12 08:00:00'),
(17, 'Joseph Dizon', '09337890123', 1, '2026-02-12 08:00:00'),
(18, 'Grace Manalo', '09348901234', 1, '2026-02-20 08:00:00'),
(19, 'Bryan Salazar', '09359012345', 1, '2026-02-20 08:00:00'),
(20, 'Christine Tan', '09360123456', 1, '2026-02-28 08:00:00');

-- ============================================================================
-- SECTION 4: ITEMS (Products and Materials)
-- ============================================================================

INSERT INTO item (id, type, brand_id, name, description, delivered_quantity, damaged_quantity, lost_quantity, available_quantity, reserved_quantity, warehouse_location_id, expired_date, status, created_at) VALUES
-- PRODUCTS (Equipment)
(1, 'product', 2, 'Samsung 55" LED TV', '55-inch Full HD LED Television for displays', 10, 1, 0, 8, 1, 1, NULL, 'in stock', '2026-01-12 08:00:00'),
(2, 'product', 2, 'Samsung 32" LED TV', '32-inch HD LED Television', 15, 0, 1, 12, 2, 1, NULL, 'in stock', '2026-01-12 08:00:00'),
(3, 'product', 3, 'Sony Portable Speaker SRS-XB43', 'Wireless Bluetooth speaker with extra bass', 20, 2, 1, 14, 3, 1, NULL, 'in stock', '2026-01-12 08:00:00'),
(4, 'product', 7, 'JBL PartyBox 310', 'Portable party speaker with lights', 8, 0, 0, 6, 2, 1, NULL, 'in stock', '2026-01-14 08:00:00'),
(5, 'product', 6, 'Epson EB-X51 Projector', '3LCD XGA projector 3800 lumens', 5, 0, 0, 4, 1, 1, NULL, 'in stock', '2026-01-15 08:00:00'),
(6, 'product', 8, 'Logitech Wireless Presenter R500', 'Wireless presentation remote', 25, 1, 2, 20, 2, 1, NULL, 'in stock', '2026-01-15 08:00:00'),
(7, 'product', 5, 'HP Laptop 15s', '15.6" Intel Core i5 laptop', 8, 0, 0, 7, 1, 1, NULL, 'in stock', '2026-01-18 08:00:00'),
(8, 'product', 10, 'Portable Booth Frame 3x3m', 'Aluminum frame for booth setup', 12, 1, 0, 9, 2, 1, NULL, 'in stock', '2026-01-18 08:00:00'),
(9, 'product', 10, 'LED Backdrop Stand', '2.4m adjustable backdrop stand with LED', 10, 0, 1, 8, 1, 1, NULL, 'in stock', '2026-01-22 08:00:00'),
(10, 'product', 10, 'Folding Table 6ft', '6-foot folding utility table', 30, 2, 0, 24, 4, 1, NULL, 'in stock', '2026-01-22 08:00:00'),
(11, 'product', 10, 'Plastic Chair (White)', 'Stackable plastic chair', 100, 5, 3, 82, 10, 1, NULL, 'in stock', '2026-01-25 08:00:00'),
(12, 'product', 10, 'Popup Tent 3x3m', 'Instant popup canopy tent', 8, 0, 0, 6, 2, 1, NULL, 'in stock', '2026-01-25 08:00:00'),
(13, 'product', 10, 'Extension Cord 10m', 'Heavy duty extension cord', 40, 3, 2, 30, 5, 1, NULL, 'in stock', '2026-01-28 08:00:00'),
(14, 'product', 10, 'Power Strip 6-outlet', '6-outlet power strip with surge protector', 50, 2, 1, 42, 5, 1, NULL, 'in stock', '2026-01-28 08:00:00'),
(15, 'product', 4, 'Canon DSLR EOS 90D', 'Professional DSLR camera', 3, 0, 0, 2, 1, 1, NULL, 'low stock', '2026-02-01 08:00:00'),

-- MATERIALS (Consumables and Print Materials)
(16, 'material', 1, 'Tarpaulin Banner 4x8ft', 'Full color printed tarpaulin', 100, 5, 0, 65, 30, 1, NULL, 'in stock', '2026-01-12 08:00:00'),
(17, 'material', 1, 'X-Stand Banner', '60x160cm X-stand with print', 50, 2, 1, 35, 12, 1, NULL, 'in stock', '2026-01-12 08:00:00'),
(18, 'material', 1, 'Roll-up Banner Stand', '85x200cm retractable banner', 30, 1, 0, 22, 7, 1, NULL, 'in stock', '2026-01-14 08:00:00'),
(19, 'material', 1, 'Flyers A5', 'Glossy A5 promotional flyers (per 1000)', 50, 0, 0, 35, 15, 1, '2026-12-31', 'in stock', '2026-01-14 08:00:00'),
(20, 'material', 1, 'Brochure Tri-fold', 'Tri-fold brochures (per 500)', 40, 0, 0, 28, 12, 1, '2026-12-31', 'in stock', '2026-01-18 08:00:00'),
(21, 'material', 1, 'Promotional T-Shirt (M)', 'Cotton t-shirt with print - Medium', 200, 5, 0, 140, 55, 1, NULL, 'in stock', '2026-01-18 08:00:00'),
(22, 'material', 1, 'Promotional T-Shirt (L)', 'Cotton t-shirt with print - Large', 200, 3, 0, 150, 47, 1, NULL, 'in stock', '2026-01-18 08:00:00'),
(23, 'material', 1, 'Promotional T-Shirt (XL)', 'Cotton t-shirt with print - XL', 150, 2, 0, 118, 30, 1, NULL, 'in stock', '2026-01-18 08:00:00'),
(24, 'material', 1, 'Branded Ballpen', 'Promotional ballpen with logo (per 100)', 100, 0, 0, 60, 40, 1, NULL, 'in stock', '2026-01-22 08:00:00'),
(25, 'material', 1, 'Eco Bag', 'Reusable eco bag with print', 300, 10, 5, 200, 85, 1, NULL, 'in stock', '2026-01-22 08:00:00'),
(26, 'material', 1, 'Keychain', 'Acrylic keychain with brand logo', 500, 15, 10, 375, 100, 1, NULL, 'in stock', '2026-01-25 08:00:00'),
(27, 'material', 1, 'Lanyard with ID Holder', 'Printed lanyard with clear ID holder', 200, 5, 0, 150, 45, 1, NULL, 'in stock', '2026-01-25 08:00:00'),
(28, 'material', 1, 'Sticker Sheet A4', 'Die-cut sticker sheet (per 100)', 80, 0, 0, 55, 25, 1, NULL, 'in stock', '2026-01-28 08:00:00'),
(29, 'material', 10, 'Cable Tie (Pack of 100)', 'Nylon cable ties', 30, 0, 0, 20, 10, 1, NULL, 'in stock', '2026-01-28 08:00:00'),
(30, 'material', 10, 'Duct Tape', 'Heavy duty duct tape roll', 50, 0, 0, 35, 15, 1, NULL, 'in stock', '2026-01-28 08:00:00'),

-- Low stock items
(31, 'material', 1, 'Premium Gift Box', 'Magnetic closure gift box', 20, 0, 0, 3, 2, 1, NULL, 'low stock', '2026-02-01 08:00:00'),
(32, 'product', 3, 'Sony Wireless Microphone', 'UHF wireless mic system', 4, 1, 0, 1, 1, 1, NULL, 'low stock', '2026-02-01 08:00:00'),

-- Out of stock items
(33, 'material', 1, 'Foam Board Display', '3mm foam board A1 size', 30, 5, 0, 0, 0, 1, NULL, 'out of stock', '2026-02-15 08:00:00'),
(34, 'material', 1, 'Photo Booth Props Set', 'Set of 20 photo booth props', 15, 2, 0, 0, 0, 1, NULL, 'out of stock', '2026-02-15 08:00:00'),

-- Inactive item (discontinued)
(35, 'material', 1, 'Old Promo Cap', 'Baseball cap - old design', 50, 5, 0, 0, 0, 1, NULL, 'inactive', '2026-01-12 08:00:00');

-- ============================================================================
-- SECTION 5: ITEM LOCATIONS (Multi-warehouse inventory)
-- ============================================================================

INSERT INTO item_location (item_id, location_id, quantity, reserved_quantity, damaged_quantity, lost_quantity, created_at) VALUES
-- Main Warehouse Davao (location_id = 1)
(1, 1, 8, 1, 1, 0, '2026-01-12 08:00:00'),
(2, 1, 12, 2, 0, 1, '2026-01-12 08:00:00'),
(3, 1, 14, 2, 2, 1, '2026-01-12 08:00:00'),
(4, 1, 6, 1, 0, 0, '2026-01-14 08:00:00'),
(5, 1, 4, 1, 0, 0, '2026-01-15 08:00:00'),
(6, 1, 20, 1, 1, 2, '2026-01-15 08:00:00'),
(7, 1, 7, 1, 0, 0, '2026-01-18 08:00:00'),
(8, 1, 9, 1, 1, 0, '2026-01-18 08:00:00'),
(9, 1, 8, 1, 0, 1, '2026-01-22 08:00:00'),
(10, 1, 24, 2, 2, 0, '2026-01-22 08:00:00'),
(11, 1, 82, 6, 3, 2, '2026-01-25 08:00:00'),
(12, 1, 6, 1, 0, 0, '2026-01-25 08:00:00'),
(13, 1, 30, 3, 2, 1, '2026-01-28 08:00:00'),
(14, 1, 42, 3, 1, 1, '2026-01-28 08:00:00'),
(15, 1, 2, 1, 0, 0, '2026-02-01 08:00:00'),
(16, 1, 65, 20, 3, 0, '2026-01-12 08:00:00'),
(17, 1, 35, 8, 1, 1, '2026-01-12 08:00:00'),
(18, 1, 22, 5, 1, 0, '2026-01-14 08:00:00'),
(19, 1, 35, 10, 0, 0, '2026-01-14 08:00:00'),
(20, 1, 28, 8, 0, 0, '2026-01-18 08:00:00'),
(21, 1, 140, 35, 3, 0, '2026-01-18 08:00:00'),
(22, 1, 150, 30, 2, 0, '2026-01-18 08:00:00'),
(23, 1, 118, 20, 1, 0, '2026-01-18 08:00:00'),
(24, 1, 60, 25, 0, 0, '2026-01-22 08:00:00'),
(25, 1, 200, 55, 6, 3, '2026-01-22 08:00:00'),
(26, 1, 375, 65, 10, 6, '2026-01-25 08:00:00'),
(27, 1, 150, 30, 3, 0, '2026-01-25 08:00:00'),
(28, 1, 55, 15, 0, 0, '2026-01-28 08:00:00'),
(29, 1, 20, 6, 0, 0, '2026-01-28 08:00:00'),
(30, 1, 35, 10, 0, 0, '2026-01-28 08:00:00'),
(31, 1, 3, 2, 0, 0, '2026-02-01 08:00:00'),
(32, 1, 1, 1, 1, 0, '2026-02-01 08:00:00');

-- ============================================================================
-- SECTION 6: PROJECTS (Starting from ID 2 - ID 1 "test" already exists)
-- ============================================================================

INSERT INTO project (id, jo_number, name, description, status, cancellation_reason, created_by, created_at, updated_at) VALUES
-- COMPLETED Projects (January 12 - March 3, 2026)
(2, 'JO-2026-002', 'SM Lanang Sinulog Promo', 'Sinulog Festival product activation at SM Lanang Premier', 'completed', NULL, 1, '2026-01-13 09:00:00', '2026-01-19 17:00:00'),
(3, 'JO-2026-003', 'Abreeza New Year Blowout', 'Post-New Year clearance promotion event', 'completed', NULL, 2, '2026-01-14 10:00:00', '2026-01-16 18:00:00'),
(4, 'JO-2026-004', 'NCCC Chinese New Year', 'Chinese New Year celebration booth', 'completed', NULL, 2, '2026-01-25 08:00:00', '2026-01-29 17:00:00'),
(5, 'JO-2026-005', 'Robinsons Valentines Preview', 'Early Valentines Day promotional campaign', 'completed', NULL, 3, '2026-02-01 09:00:00', '2026-02-07 18:00:00'),
(6, 'JO-2026-006', 'Gaisano Tagum Anniversary', 'Mall anniversary celebration booth', 'completed', NULL, 2, '2026-02-08 08:00:00', '2026-02-10 17:00:00'),
(7, 'JO-2026-007', 'SMX Business Summit', 'Corporate product exposition', 'completed', NULL, 1, '2026-02-12 08:00:00', '2026-02-14 18:00:00'),
(8, 'JO-2026-008', 'NCCC Valentines Main', 'Valentines Day main promotional event', 'completed', NULL, 3, '2026-02-12 09:00:00', '2026-02-15 21:00:00'),
(9, 'JO-2026-009', 'Abreeza Womens Month Kickoff', 'Womens Month celebration launch', 'completed', NULL, 2, '2026-02-25 08:00:00', '2026-03-01 18:00:00'),

-- ONGOING Projects (Current - as of March 4, 2026)
(10, 'JO-2026-010', 'SM Lanang Summer Kickoff', 'Summer 2026 product activation launch', 'ongoing', NULL, 1, '2026-03-01 09:00:00', NULL),
(11, 'JO-2026-011', 'Gaisano Grand Digos Summer', 'Summer promo activation at Digos', 'ongoing', NULL, 3, '2026-03-02 09:00:00', NULL),

-- UPCOMING Projects (Future - After March 4, 2026)
(12, 'JO-2026-012', 'SMX Davao IT Expo 2026', 'Information technology exposition', 'upcoming', NULL, 1, '2026-03-01 10:00:00', NULL),
(13, 'JO-2026-013', 'Panabo City Fiesta', 'City fiesta brand activation', 'upcoming', NULL, 2, '2026-03-02 11:00:00', NULL),
(14, 'JO-2026-014', 'GenSan Tuna Festival Preview', 'Early tuna festival brand presence', 'upcoming', NULL, 3, '2026-03-03 14:00:00', NULL),
(15, 'JO-2026-015', 'Island Samal Beach Summer', 'Beach resort summer activation', 'upcoming', NULL, 2, '2026-03-03 15:00:00', NULL),
(16, 'JO-2026-016', 'Abreeza Holy Week Sale', 'Pre-Holy Week clearance sale', 'upcoming', NULL, 1, '2026-03-04 08:00:00', NULL),

-- CANCELLED Projects
(17, 'JO-2026-C01', 'Outdoor Concert Activation', 'Music concert brand activation', 'cancelled', 'Event was postponed - artist scheduling conflict', 2, '2026-01-20 08:00:00', '2026-01-25 10:00:00'),
(18, 'JO-2026-C02', 'Multi-Mall Collaboration', 'Multi-mall collaborative promotion', 'cancelled', 'Client budget constraints - scope reduced', 1, '2026-02-05 08:00:00', '2026-02-10 14:00:00');

-- ============================================================================
-- SECTION 7: PROJECT DAYS
-- ============================================================================

INSERT INTO project_day (id, project_id, project_date, location_id, status, completed_at, completed_by, created_at) VALUES
-- Project 2: SM Lanang Sinulog Promo (3 days, completed)
(1, 2, '2026-01-17', 8, 'completed', '2026-01-17 18:00:00', 1, '2026-01-13 09:00:00'),
(2, 2, '2026-01-18', 8, 'completed', '2026-01-18 18:00:00', 1, '2026-01-13 09:00:00'),
(3, 2, '2026-01-19', 8, 'completed', '2026-01-19 17:00:00', 1, '2026-01-13 09:00:00'),

-- Project 3: Abreeza New Year Blowout (2 days, completed)
(4, 3, '2026-01-15', 7, 'completed', '2026-01-15 20:00:00', 2, '2026-01-14 10:00:00'),
(5, 3, '2026-01-16', 7, 'completed', '2026-01-16 18:00:00', 2, '2026-01-14 10:00:00'),

-- Project 4: NCCC Chinese New Year (3 days, completed)
(6, 4, '2026-01-27', 11, 'completed', '2026-01-27 21:00:00', 2, '2026-01-25 08:00:00'),
(7, 4, '2026-01-28', 11, 'completed', '2026-01-28 21:00:00', 2, '2026-01-25 08:00:00'),
(8, 4, '2026-01-29', 11, 'completed', '2026-01-29 17:00:00', 2, '2026-01-25 08:00:00'),

-- Project 5: Robinsons Valentines Preview (4 days, completed)
(9, 5, '2026-02-04', 10, 'completed', '2026-02-04 18:00:00', 3, '2026-02-01 09:00:00'),
(10, 5, '2026-02-05', 10, 'completed', '2026-02-05 18:00:00', 3, '2026-02-01 09:00:00'),
(11, 5, '2026-02-06', 10, 'completed', '2026-02-06 18:00:00', 3, '2026-02-01 09:00:00'),
(12, 5, '2026-02-07', 10, 'completed', '2026-02-07 18:00:00', 3, '2026-02-01 09:00:00'),

-- Project 6: Gaisano Tagum Anniversary (2 days, completed)
(13, 6, '2026-02-09', 9, 'completed', '2026-02-09 20:00:00', 2, '2026-02-08 08:00:00'),
(14, 6, '2026-02-10', 9, 'completed', '2026-02-10 17:00:00', 2, '2026-02-08 08:00:00'),

-- Project 7: SMX Business Summit (3 days, completed)
(15, 7, '2026-02-12', 6, 'completed', '2026-02-12 18:00:00', 1, '2026-02-12 08:00:00'),
(16, 7, '2026-02-13', 6, 'completed', '2026-02-13 18:00:00', 1, '2026-02-12 08:00:00'),
(17, 7, '2026-02-14', 6, 'completed', '2026-02-14 18:00:00', 1, '2026-02-12 08:00:00'),

-- Project 8: NCCC Valentines Main (4 days, completed)
(18, 8, '2026-02-12', 11, 'completed', '2026-02-12 21:00:00', 3, '2026-02-12 09:00:00'),
(19, 8, '2026-02-13', 11, 'completed', '2026-02-13 21:00:00', 3, '2026-02-12 09:00:00'),
(20, 8, '2026-02-14', 11, 'completed', '2026-02-14 22:00:00', 3, '2026-02-12 09:00:00'),
(21, 8, '2026-02-15', 11, 'completed', '2026-02-15 21:00:00', 3, '2026-02-12 09:00:00'),

-- Project 9: Abreeza Womens Month Kickoff (4 days, completed)
(22, 9, '2026-02-26', 7, 'completed', '2026-02-26 18:00:00', 2, '2026-02-25 08:00:00'),
(23, 9, '2026-02-27', 7, 'completed', '2026-02-27 18:00:00', 2, '2026-02-25 08:00:00'),
(24, 9, '2026-02-28', 7, 'completed', '2026-02-28 18:00:00', 2, '2026-02-25 08:00:00'),
(25, 9, '2026-03-01', 7, 'completed', '2026-03-01 18:00:00', 2, '2026-02-25 08:00:00'),

-- Project 10: SM Lanang Summer Kickoff (ONGOING - 2 completed, 2 scheduled)
(26, 10, '2026-03-01', 8, 'completed', '2026-03-01 18:00:00', 1, '2026-03-01 09:00:00'),
(27, 10, '2026-03-02', 8, 'completed', '2026-03-02 18:00:00', 1, '2026-03-01 09:00:00'),
(28, 10, '2026-03-07', 8, 'scheduled', NULL, NULL, '2026-03-01 09:00:00'),
(29, 10, '2026-03-08', 8, 'scheduled', NULL, NULL, '2026-03-01 09:00:00'),

-- Project 11: Gaisano Grand Digos Summer (ONGOING - 1 completed, 2 scheduled)
(30, 11, '2026-03-03', 12, 'completed', '2026-03-03 18:00:00', 3, '2026-03-02 09:00:00'),
(31, 11, '2026-03-07', 12, 'scheduled', NULL, NULL, '2026-03-02 09:00:00'),
(32, 11, '2026-03-08', 12, 'scheduled', NULL, NULL, '2026-03-02 09:00:00'),

-- Project 12: SMX Davao IT Expo (UPCOMING - March 15-17)
(33, 12, '2026-03-15', 6, 'scheduled', NULL, NULL, '2026-03-01 10:00:00'),
(34, 12, '2026-03-16', 6, 'scheduled', NULL, NULL, '2026-03-01 10:00:00'),
(35, 12, '2026-03-17', 6, 'scheduled', NULL, NULL, '2026-03-01 10:00:00'),

-- Project 13: Panabo City Fiesta (UPCOMING - March 20-22)
(36, 13, '2026-03-20', 14, 'scheduled', NULL, NULL, '2026-03-02 11:00:00'),
(37, 13, '2026-03-21', 14, 'scheduled', NULL, NULL, '2026-03-02 11:00:00'),
(38, 13, '2026-03-22', 14, 'scheduled', NULL, NULL, '2026-03-02 11:00:00'),

-- Project 14: GenSan Tuna Festival Preview (UPCOMING - April 5-7)
(39, 14, '2026-04-05', 13, 'scheduled', NULL, NULL, '2026-03-03 14:00:00'),
(40, 14, '2026-04-06', 13, 'scheduled', NULL, NULL, '2026-03-03 14:00:00'),
(41, 14, '2026-04-07', 13, 'scheduled', NULL, NULL, '2026-03-03 14:00:00'),

-- Project 15: Island Samal Beach Summer (UPCOMING - April 11-13)
(42, 15, '2026-04-11', 15, 'scheduled', NULL, NULL, '2026-03-03 15:00:00'),
(43, 15, '2026-04-12', 15, 'scheduled', NULL, NULL, '2026-03-03 15:00:00'),
(44, 15, '2026-04-13', 15, 'scheduled', NULL, NULL, '2026-03-03 15:00:00'),

-- Project 16: Abreeza Holy Week Sale (UPCOMING - March 28-30)
(45, 16, '2026-03-28', 7, 'scheduled', NULL, NULL, '2026-03-04 08:00:00'),
(46, 16, '2026-03-29', 7, 'scheduled', NULL, NULL, '2026-03-04 08:00:00'),
(47, 16, '2026-03-30', 7, 'scheduled', NULL, NULL, '2026-03-04 08:00:00');

-- ============================================================================
-- SECTION 8: PROJECT ITEMS
-- ============================================================================

INSERT INTO project_item (id, project_day_id, item_id, source_location_id, allocated_quantity, damaged_quantity, lost_quantity, returned_quantity, status, created_at) VALUES
-- Project 2: SM Lanang Sinulog Promo
(1, 1, 1, 1, 2, 0, 0, 2, 'returned', '2026-01-17 06:00:00'),
(2, 1, 3, 1, 3, 0, 0, 3, 'returned', '2026-01-17 06:00:00'),
(3, 1, 10, 1, 4, 0, 0, 4, 'returned', '2026-01-17 06:00:00'),
(4, 1, 11, 1, 20, 1, 0, 19, 'returned', '2026-01-17 06:00:00'),
(5, 1, 16, 1, 5, 0, 0, 0, 'returned', '2026-01-17 06:00:00'),
(6, 1, 21, 1, 30, 0, 0, 0, 'returned', '2026-01-17 06:00:00'),
(7, 1, 25, 1, 50, 2, 0, 0, 'returned', '2026-01-17 06:00:00'),
(8, 2, 1, 1, 2, 0, 0, 2, 'returned', '2026-01-18 06:00:00'),
(9, 2, 3, 1, 3, 0, 0, 3, 'returned', '2026-01-18 06:00:00'),
(10, 2, 10, 1, 4, 0, 0, 4, 'returned', '2026-01-18 06:00:00'),
(11, 2, 11, 1, 20, 0, 0, 20, 'returned', '2026-01-18 06:00:00'),
(12, 3, 1, 1, 2, 0, 0, 2, 'returned', '2026-01-19 06:00:00'),
(13, 3, 3, 1, 3, 1, 0, 2, 'returned', '2026-01-19 06:00:00'),

-- Project 7: SMX Business Summit (Large event)
(14, 15, 1, 1, 3, 0, 0, 3, 'returned', '2026-02-12 05:00:00'),
(15, 15, 2, 1, 4, 0, 0, 4, 'returned', '2026-02-12 05:00:00'),
(16, 15, 4, 1, 2, 0, 0, 2, 'returned', '2026-02-12 05:00:00'),
(17, 15, 5, 1, 2, 0, 0, 2, 'returned', '2026-02-12 05:00:00'),
(18, 15, 8, 1, 4, 0, 0, 4, 'returned', '2026-02-12 05:00:00'),
(19, 15, 10, 1, 8, 1, 0, 7, 'returned', '2026-02-12 05:00:00'),
(20, 15, 11, 1, 40, 2, 1, 37, 'returned', '2026-02-12 05:00:00'),

-- Project 10: SM Summer Kickoff 2026 (ongoing - some returned, some allocated)
(21, 26, 1, 1, 2, 0, 0, 2, 'returned', '2026-03-01 06:00:00'),
(22, 26, 3, 1, 2, 0, 0, 2, 'returned', '2026-03-01 06:00:00'),
(23, 26, 10, 1, 4, 0, 0, 4, 'returned', '2026-03-01 06:00:00'),
(24, 26, 16, 1, 8, 0, 0, 0, 'returned', '2026-03-01 06:00:00'),
(25, 27, 1, 1, 2, 0, 0, 2, 'returned', '2026-03-02 06:00:00'),
(26, 27, 3, 1, 2, 0, 0, 2, 'returned', '2026-03-02 06:00:00'),
(27, 28, 1, 1, 2, 0, 0, 0, 'allocated', '2026-03-03 10:00:00'),
(28, 28, 3, 1, 2, 0, 0, 0, 'allocated', '2026-03-03 10:00:00'),
(29, 28, 10, 1, 4, 0, 0, 0, 'allocated', '2026-03-03 10:00:00'),

-- Project 12: SMX IT Expo (upcoming - allocated)
(30, 33, 1, 1, 3, 0, 0, 0, 'allocated', '2026-03-03 16:00:00'),
(31, 33, 2, 1, 5, 0, 0, 0, 'allocated', '2026-03-03 16:00:00'),
(32, 33, 5, 1, 2, 0, 0, 0, 'allocated', '2026-03-03 16:00:00'),
(33, 33, 7, 1, 3, 0, 0, 0, 'allocated', '2026-03-03 16:00:00'),
(34, 33, 10, 1, 6, 0, 0, 0, 'allocated', '2026-03-03 16:00:00');

-- ============================================================================
-- SECTION 9: PROJECT PERSONNEL (Using existing role IDs 1-4)
-- Role IDs: 1=PA, 2=BA, 3=Sampler, 4=Driver
-- ============================================================================

INSERT INTO project_personnel (project_day_id, personnel_id, role_id) VALUES
-- Project 2: SM Lanang Sinulog
(1, 1, 1), (1, 2, 2), (1, 3, 2), (1, 4, 3), (1, 5, 4),
(2, 1, 1), (2, 2, 2), (2, 3, 2), (2, 4, 3), (2, 5, 4),
(3, 1, 1), (3, 2, 2), (3, 6, 2), (3, 4, 3), (3, 5, 4),

-- Project 3: Abreeza New Year
(4, 1, 1), (4, 6, 2), (4, 7, 2), (4, 8, 3), (4, 9, 4),
(5, 1, 1), (5, 6, 2), (5, 7, 2), (5, 8, 3), (5, 9, 4),

-- Project 7: SMX Business Summit (Large event)
(15, 1, 1), (15, 2, 2), (15, 3, 2), (15, 4, 3), (15, 5, 4),
(15, 6, 2), (15, 7, 2), (15, 8, 3), (15, 9, 3), (15, 10, 4),
(16, 1, 1), (16, 2, 2), (16, 3, 2), (16, 4, 3), (16, 5, 4),

-- Project 8: NCCC Valentines
(18, 1, 1), (18, 10, 2), (18, 11, 2), (18, 12, 3), (18, 13, 4),
(20, 1, 1), (20, 10, 2), (20, 11, 2), (20, 14, 3), (20, 15, 4),

-- Project 10: SM Summer Kickoff (ongoing)
(26, 1, 1), (26, 14, 2), (26, 15, 2), (26, 16, 3), (26, 5, 4),
(27, 1, 1), (27, 14, 2), (27, 15, 2), (27, 16, 3), (27, 5, 4),
(28, 1, 1), (28, 14, 2), (28, 17, 2), (28, 18, 3), (28, 5, 4),

-- Project 12: SMX IT Expo (upcoming)
(33, 1, 1), (33, 2, 2), (33, 3, 2), (33, 4, 3), (33, 5, 4);

-- ============================================================================
-- SECTION 10: INVENTORY LOGS
-- ============================================================================

INSERT INTO inventory_log (item_id, log_type, reference_no, quantity, from_location_id, to_location_id, handled_by, photo, remarks, created_at) VALUES
-- Initial stock IN logs (System launch January 12, 2026)
(1, 'in', 'DR-2026-001', 10, NULL, 1, 1, NULL, 'Initial delivery from supplier', '2026-01-12 10:00:00'),
(2, 'in', 'DR-2026-001', 15, NULL, 1, 1, NULL, 'Initial delivery from supplier', '2026-01-12 10:00:00'),
(3, 'in', 'DR-2026-002', 20, NULL, 1, 1, NULL, 'Initial delivery', '2026-01-12 11:00:00'),
(16, 'in', 'DR-2026-008', 100, NULL, 1, 2, NULL, 'Tarpaulin banners first batch', '2026-01-12 09:00:00'),
(21, 'in', 'DR-2026-010', 200, NULL, 1, 2, NULL, 'T-shirts delivery', '2026-01-18 08:00:00'),

-- Project allocations (OUT)
(1, 'out', 'JO-2026-002-D1', 2, 1, NULL, 2, NULL, 'Allocated to SM Lanang Sinulog Day 1', '2026-01-17 06:00:00'),
(3, 'out', 'JO-2026-002-D1', 3, 1, NULL, 2, NULL, 'Allocated to SM Lanang Sinulog Day 1', '2026-01-17 06:00:00'),
(11, 'out', 'JO-2026-002-D1', 20, 1, NULL, 2, NULL, 'Chairs allocated', '2026-01-17 06:00:00'),

-- Returns (IN)
(1, 'in', 'JO-2026-002-D1-RET', 2, NULL, 1, 2, NULL, 'Returned from SM Lanang Day 1', '2026-01-17 19:00:00'),
(3, 'in', 'JO-2026-002-D1-RET', 3, NULL, 1, 2, NULL, 'Returned from SM Lanang Day 1', '2026-01-17 19:00:00'),
(11, 'in', 'JO-2026-002-D1-RET', 19, NULL, 1, 2, NULL, '1 chair damaged', '2026-01-17 19:00:00'),

-- February logs
(1, 'out', 'JO-2026-007-D1', 3, 1, NULL, 1, NULL, 'SMX Business Summit Day 1', '2026-02-12 05:00:00'),
(1, 'in', 'JO-2026-007-D1-RET', 3, NULL, 1, 1, NULL, 'Returned from SMX Summit', '2026-02-12 19:00:00'),

-- Recent logs (March 2026)
(1, 'out', 'JO-2026-010-D1', 2, 1, NULL, 3, NULL, 'SM Summer Kickoff 2026', '2026-03-01 06:00:00'),
(1, 'in', 'JO-2026-010-D1-RET', 2, NULL, 1, 3, NULL, 'Returned from SM Summer Kickoff Day 1', '2026-03-01 19:00:00'),
(16, 'out', 'JO-2026-010-D1', 8, 1, NULL, 3, NULL, 'Tarpaulins for activation', '2026-03-01 06:00:00'),
(1, 'out', 'JO-2026-010-D2', 2, 1, NULL, 3, NULL, 'SM Summer Kickoff Day 2', '2026-03-02 06:00:00'),
(1, 'in', 'JO-2026-010-D2-RET', 2, NULL, 1, 3, NULL, 'Returned from SM Summer Kickoff Day 2', '2026-03-02 19:00:00');

-- ============================================================================
-- SECTION 11: ACTIVITY LOGS (Using user IDs 1-3)
-- ============================================================================

INSERT INTO activity_log (user_id, action, entity, entity_id, description, created_at) VALUES
-- System setup activities (January 12, 2026)
(1, 'create', 'location', 1, 'Created Main Warehouse Davao', '2026-01-12 08:15:00'),
(1, 'create', 'brand', 1, 'Created AAI Custom brand', '2026-01-12 08:20:00'),
(1, 'create', 'item', 1, 'Added Samsung 55" LED TV to inventory', '2026-01-12 10:15:00'),
(1, 'create', 'item', 2, 'Added Samsung 32" LED TV to inventory', '2026-01-12 10:20:00'),

-- Project activities (January)
(1, 'create', 'project', 2, 'Created project: SM Lanang Sinulog Promo', '2026-01-13 09:00:00'),
(2, 'create', 'project', 3, 'Created project: Abreeza New Year Blowout', '2026-01-14 10:00:00'),
(2, 'update', 'project', 2, 'Updated project status to ongoing', '2026-01-17 06:00:00'),
(1, 'allocate', 'project_item', 1, 'Allocated items to SM Lanang Sinulog Day 1', '2026-01-17 06:00:00'),
(1, 'update', 'project', 2, 'Marked project as completed', '2026-01-19 17:00:00'),

-- Regular inventory activities
(2, 'create', 'delivery_log', 1, 'Received delivery DR-2026-001', '2026-01-12 10:00:00'),
(2, 'update', 'item', 1, 'Updated stock quantity after delivery', '2026-01-12 10:05:00'),

-- February activities
(3, 'create', 'project', 5, 'Created project: Robinsons Valentines Preview', '2026-02-01 09:00:00'),
(3, 'allocate', 'project_item', 15, 'Allocated items for project day', '2026-02-04 06:00:00'),

-- Cancellation activities
(2, 'update', 'project', 17, 'Cancelled project: Outdoor Concert Activation', '2026-01-25 10:00:00'),
(1, 'update', 'project', 18, 'Cancelled project: Multi-Mall Collaboration', '2026-02-10 14:00:00'),

-- March activities (Current)
(1, 'create', 'project', 10, 'Created project: SM Lanang Summer Kickoff', '2026-03-01 09:00:00'),
(3, 'create', 'project', 11, 'Created project: Gaisano Grand Digos Summer', '2026-03-02 09:00:00'),
(1, 'update', 'project', 10, 'Updated project status to ongoing', '2026-03-01 06:00:00'),
(1, 'create', 'project', 12, 'Created project: SMX Davao IT Expo 2026', '2026-03-01 10:00:00'),
(2, 'create', 'project', 13, 'Created project: Panabo City Fiesta', '2026-03-02 11:00:00'),
(3, 'create', 'project', 14, 'Created project: GenSan Tuna Festival Preview', '2026-03-03 14:00:00'),
(2, 'create', 'project', 15, 'Created project: Island Samal Beach Summer', '2026-03-03 15:00:00'),
(1, 'create', 'project', 16, 'Created project: Abreeza Holy Week Sale', '2026-03-04 08:00:00');

-- ============================================================================
-- SECTION 12: PROJECT LOGS
-- ============================================================================

INSERT INTO project_log (project_id, project_day_id, log_type, description, recorded_by, created_at) VALUES
-- Project 2 logs (January)
(2, NULL, 'status_change', 'Project created with status: upcoming', 1, '2026-01-13 09:00:00'),
(2, NULL, 'status_change', 'Project status changed to ongoing', 2, '2026-01-17 06:00:00'),
(2, 1, 'activity', 'Day 1 setup completed. All equipment installed.', 1, '2026-01-17 09:00:00'),
(2, 3, 'incident', 'Minor chair damage reported. 1 chair broken during event.', 1, '2026-01-19 14:00:00'),
(2, NULL, 'status_change', 'Project completed successfully', 1, '2026-01-19 17:00:00'),

-- Project 7 logs (February - Large event)
(7, NULL, 'status_change', 'Project created - Corporate summit', 1, '2026-02-12 08:00:00'),
(7, 15, 'activity', 'Day 1: Convention hall setup started. 10 personnel deployed.', 1, '2026-02-12 05:30:00'),
(7, 15, 'incident', 'One folding table damaged during setup. Replaced from spare.', 1, '2026-02-12 07:00:00'),
(7, NULL, 'status_change', 'Project completed - All deliverables met', 1, '2026-02-14 18:30:00'),

-- Cancelled project logs
(17, NULL, 'status_change', 'Project created', 2, '2026-01-20 08:00:00'),
(17, NULL, 'status_change', 'Project CANCELLED - Artist scheduling conflict', 2, '2026-01-25 10:00:00'),
(18, NULL, 'status_change', 'Project created', 1, '2026-02-05 08:00:00'),
(18, NULL, 'status_change', 'Project CANCELLED - Client budget constraints', 1, '2026-02-10 14:00:00'),

-- Ongoing project logs (March 2026)
(10, NULL, 'status_change', 'Project created', 1, '2026-03-01 09:00:00'),
(10, NULL, 'status_change', 'Project status changed to ongoing', 1, '2026-03-01 06:00:00'),
(10, 26, 'activity', 'Day 1 kickoff successful. Strong summer crowd turnout.', 1, '2026-03-01 18:00:00'),
(10, 27, 'activity', 'Day 2 completed. Good foot traffic despite weekday.', 1, '2026-03-02 18:00:00'),
(11, NULL, 'status_change', 'Project created - Digos Summer promo', 3, '2026-03-02 09:00:00'),
(11, 30, 'activity', 'Day 1 at Digos completed successfully.', 3, '2026-03-03 18:00:00'),

-- Upcoming projects
(12, NULL, 'status_change', 'Project created - IT Expo planning started', 1, '2026-03-01 10:00:00'),
(13, NULL, 'status_change', 'Project created', 2, '2026-03-02 11:00:00'),
(14, NULL, 'status_change', 'Project created', 3, '2026-03-03 14:00:00'),
(15, NULL, 'status_change', 'Project created', 2, '2026-03-03 15:00:00'),
(16, NULL, 'status_change', 'Project created - Holy Week preparation', 1, '2026-03-04 08:00:00');

-- ============================================================================
-- SECTION 13: DAMAGE/LOSS LOGS
-- ============================================================================

INSERT INTO damage_loss_log (entity_type, entity_id, quantity, issue_type, project_day_id, reported_by, verified_by, proof_photo, remarks, created_at) VALUES
-- Damages from projects (January)
('product', 3, 1, 'damage', 3, 2, 1, NULL, 'Speaker cone damaged during transport.', '2026-01-19 17:00:00'),
('product', 11, 1, 'damage', 3, 2, 1, NULL, 'Plastic chair leg broken during event', '2026-01-19 15:00:00'),

-- February damages
('product', 10, 1, 'damage', 15, 2, 1, NULL, 'Folding table surface scratched during setup', '2026-02-12 07:30:00'),
('material', 25, 2, 'damage', 1, 2, 1, NULL, 'Eco bags torn during distribution', '2026-01-17 16:00:00'),

-- Losses
('product', 11, 1, 'loss', 20, 2, 1, NULL, 'Chair missing after event - cannot locate', '2026-02-14 22:00:00'),
('product', 6, 2, 'loss', NULL, 3, 1, NULL, 'Presenter remotes lost during inventory check', '2026-02-28 10:00:00'),
('material', 26, 10, 'loss', 17, 3, 1, NULL, 'Keychains unaccounted for after SMX summit', '2026-02-14 19:00:00');

-- ============================================================================
-- SECTION 14: DELIVERY LOGS
-- ============================================================================

INSERT INTO delivery_log (item_id, location_id, quantity, type, adjustment_reason, notes, reference_number, performed_by, created_at) VALUES
-- Initial deliveries (January 12, 2026 - System Launch)
(1, 1, 10, 'delivery', NULL, 'Initial stock delivery', 'DR-2026-001', 1, '2026-01-12 10:00:00'),
(2, 1, 15, 'delivery', NULL, 'Initial stock delivery', 'DR-2026-001', 1, '2026-01-12 10:00:00'),
(3, 1, 20, 'delivery', NULL, 'Initial stock delivery', 'DR-2026-002', 1, '2026-01-12 11:00:00'),
(4, 1, 8, 'delivery', NULL, 'Speaker delivery', 'DR-2026-003', 1, '2026-01-14 09:00:00'),
(5, 1, 5, 'delivery', NULL, 'Projector delivery', 'DR-2026-004', 1, '2026-01-15 10:00:00'),
(16, 1, 100, 'delivery', NULL, 'Tarpaulin banners - first batch', 'DR-2026-008', 2, '2026-01-12 09:00:00'),
(21, 1, 200, 'delivery', NULL, 'T-shirts Medium size', 'DR-2026-010', 2, '2026-01-18 08:00:00'),
(22, 1, 200, 'delivery', NULL, 'T-shirts Large size', 'DR-2026-010', 2, '2026-01-18 08:00:00'),
(23, 1, 150, 'delivery', NULL, 'T-shirts XL size', 'DR-2026-010', 2, '2026-01-18 08:00:00'),
(25, 1, 300, 'delivery', NULL, 'Eco bags delivery', 'DR-2026-011', 2, '2026-01-22 10:00:00'),

-- Adjustments (damages)
(3, 1, -2, 'adjustment', 'Damaged during transit - Project 2', 'Written off as damaged', NULL, 1, '2026-01-25 10:00:00'),
(11, 1, -5, 'adjustment', 'Damaged chairs from multiple events', 'Accumulated damage writeoff', NULL, 1, '2026-02-28 10:00:00'),

-- February & March deliveries
(16, 1, 50, 'delivery', NULL, 'Replenishment - tarpaulins', 'DR-2026-015', 2, '2026-02-15 09:00:00'),
(21, 1, 50, 'delivery', NULL, 'T-shirt replenishment - M', 'DR-2026-016', 2, '2026-02-20 09:00:00'),
(25, 1, 100, 'delivery', NULL, 'Eco bag replenishment', 'DR-2026-017', 2, '2026-03-01 09:00:00');

-- ============================================================================
-- SECTION 15: STOCK TRANSFERS
-- ============================================================================

INSERT INTO stock_transfer (item_id, from_location_id, to_location_id, quantity, notes, performed_by, created_at) VALUES
(1, 1, 2, 2, 'Stock allocation for Tagum area events', 1, '2026-01-25 09:00:00'),
(2, 1, 2, 2, 'Stock allocation for Tagum area events', 1, '2026-01-25 09:00:00'),
(3, 1, 2, 2, 'Stock allocation for Tagum area events', 1, '2026-01-25 09:00:00'),
(10, 1, 2, 6, 'Tables for Tagum storage', 2, '2026-01-28 10:00:00'),
(11, 1, 2, 22, 'Chairs for Tagum events', 2, '2026-01-28 10:30:00'),
(4, 1, 3, 1, 'Speaker for Digos events', 1, '2026-02-05 08:00:00'),
(5, 1, 3, 1, 'Projector for Digos office', 1, '2026-02-05 08:00:00'),
(13, 1, 3, 8, 'Extension cords for Digos', 2, '2026-02-10 09:00:00');

-- ============================================================================
-- UPDATE AUTO_INCREMENT VALUES
-- ============================================================================

ALTER TABLE brand AUTO_INCREMENT = 20;
ALTER TABLE location AUTO_INCREMENT = 20;
ALTER TABLE personnel AUTO_INCREMENT = 30;
ALTER TABLE item AUTO_INCREMENT = 50;
ALTER TABLE project AUTO_INCREMENT = 30;
ALTER TABLE project_day AUTO_INCREMENT = 100;
ALTER TABLE project_item AUTO_INCREMENT = 50;
ALTER TABLE inventory_log AUTO_INCREMENT = 50;
ALTER TABLE project_log AUTO_INCREMENT = 50;
ALTER TABLE damage_loss_log AUTO_INCREMENT = 20;
ALTER TABLE delivery_log AUTO_INCREMENT = 30;
ALTER TABLE stock_transfer AUTO_INCREMENT = 20;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - uncomment to verify)
-- ============================================================================

-- SELECT 'Brands' as entity, COUNT(*) as count FROM brand
-- UNION SELECT 'Locations', COUNT(*) FROM location
-- UNION SELECT 'Personnel', COUNT(*) FROM personnel
-- UNION SELECT 'Items', COUNT(*) FROM item
-- UNION SELECT 'Projects', COUNT(*) FROM project
-- UNION SELECT 'Project Days', COUNT(*) FROM project_day;

-- Project status summary:
-- SELECT status, COUNT(*) as count FROM project GROUP BY status;

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
