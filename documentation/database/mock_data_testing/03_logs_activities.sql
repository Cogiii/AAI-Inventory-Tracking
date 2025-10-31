-- ================================================
-- MOCK DATA FOR AAI INVENTORY MANAGEMENT SYSTEM
-- FILE: 03_logs_activities.sql
-- PURPOSE: Insert realistic mock data for logs and tracking activities
-- CONTEXT: Focused in Davao City and Mindanao, with FMCG brands (Milo, Surf, Quaker, etc.)
-- ================================================

USE AAI_inventory_db;

-- ====================
-- 1. INVENTORY LOGS
-- ====================
INSERT INTO inventory_log (item_id, log_type, reference_no, quantity, from_location_id, to_location_id, handled_by, photo, remarks) VALUES
-- Incoming inventory from suppliers
(1, 'in', 'PO-2025-001', 200, NULL, 1, 1, NULL, 'Initial delivery of Milo 3-in-1 Sachets from Nestlé Davao distributor'),
(2, 'in', 'PO-2025-002', 150, NULL, 1, 1, NULL, 'Surf Powder Detergent 1kg packs received from Unilever Mindanao'),
(3, 'in', 'PO-2025-003', 120, NULL, 1, 1, NULL, 'Quaker Oats 800g pouches delivered from PepsiCo supplier'),
(4, 'in', 'PO-2025-004', 80, NULL, 1, 2, NULL, 'Epson L3210 printers received for booth printing setup'),
(5, 'in', 'PO-2025-005', 300, NULL, 1, 2, NULL, 'Coca-Cola 500ml bottles for event giveaways received'),

-- Event allocations (out)
(1, 'out', 'ALLOC-DAV-001', 40, 1, 3, 2, NULL, 'Allocated Milo sachets for SM Lanang Promo Booth'),
(2, 'out', 'ALLOC-DAV-002', 25, 1, 3, 2, NULL, 'Allocated Surf Powder Detergent for raffle giveaway at SM Lanang'),
(3, 'out', 'ALLOC-DAV-003', 20, 1, 3, 3, NULL, 'Allocated Quaker Oats pouches for Abreeza Mall fitness event'),
(5, 'out', 'ALLOC-DAV-004', 100, 1, 3, 4, NULL, 'Coca-Cola bottles allocated for Davao Convention Center Expo'),
(4, 'out', 'ALLOC-DAV-005', 2, 1, 3, 3, NULL, 'Epson printers used for booth printing'),

-- Returns from events (in)
(1, 'in', 'RET-DAV-001', 10, 3, 1, 5, NULL, 'Returned unopened Milo sachets after SM Lanang event'),
(2, 'in', 'RET-DAV-002', 5, 3, 1, 5, NULL, 'Remaining Surf Detergent returned in good condition'),
(4, 'in', 'RET-DAV-003', 2, 3, 1, 5, NULL, 'Epson printers returned after Abreeza Mall event'),

-- Transfers between warehouses
(3, 'transfer', 'TRF-001', 15, 1, 2, 2, NULL, 'Transferred Quaker stock from Main Warehouse to Regional Storage'),
(5, 'transfer', 'TRF-002', 30, 1, 2, 3, NULL, 'Transferred Coca-Cola stock to field booth storage for weekend event');

-- ====================
-- 2. ACTIVITY LOGS
-- ====================
INSERT INTO activity_log (user_id, action, entity, entity_id, description) VALUES
-- User activities related to promotions
(1, 'create', 'project', 5, 'Created new project: Davao Convention Center Expo 2025'),
(2, 'create', 'project', 6, 'Created new project: SM Lanang Milo Promo Booth'),
(3, 'update', 'project', 6, 'Updated project schedule and assigned personnel'),
(1, 'allocate', 'item', 1, 'Allocated 40 Milo sachets to SM Lanang booth'),
(1, 'allocate', 'item', 2, 'Allocated 25 Surf 1kg packs to SM Lanang event'),
(2, 'allocate', 'item', 3, 'Allocated Quaker Oats 20 pouches to Abreeza Fitness Booth'),
(3, 'return', 'item', 1, 'Returned leftover Milo sachets from SM Lanang event'),
(4, 'return', 'item', 4, 'Returned Epson printer from Abreeza event'),
(2, 'update', 'item', 2, 'Updated Surf stock after return and inspection'),
(1, 'report', 'inventory', 0, 'Generated monthly inventory report for Mindanao region'),
(3, 'update', 'location', 3, 'Updated event site address: SM Lanang Premier, Davao City'),

-- System activities
(1, 'login', 'system', 0, 'Administrator logged in to check inventory and delivery logs'),
(2, 'login', 'system', 0, 'Marketing Manager logged in to approve allocations'),
(3, 'logout', 'system', 0, 'Staff logged out after updating item returns'),
(1, 'backup', 'system', 0, 'Database backup completed successfully'),
(2, 'report', 'inventory', 0, 'Generated weekly brand inventory summary'),
(1, 'update', 'user', 3, 'Updated user access permissions for John Cruz');

-- ====================
-- 3. PROJECT LOGS
-- ====================
INSERT INTO project_log (project_id, project_day_id, log_type, description, recorded_by) VALUES
-- SM Lanang Promo Booth
(6, 1, 'activity', 'Booth setup completed. Milo samples arranged for giveaway.', 2),
(6, 2, 'activity', 'Day 1 promo successful, 30% of stock distributed.', 3),
(6, 3, 'incident', '1 box of Milo sachets got wet due to sudden rain. Removed from display.', 3),
(6, 4, 'activity', 'Day 2 operations continued smoothly, high foot traffic observed.', 4),
(6, 5, 'status_change', 'SM Lanang event completed. Awaiting return of unused items.', 4),

-- Abreeza Mall Quaker Fitness Booth
(7, 6, 'activity', 'Fitness booth setup started at 9 AM. Smooth coordination with mall admin.', 5),
(7, 7, 'activity', 'First day: distributed 50 Quaker Oats samples to visitors.', 5),
(7, 8, 'incident', 'Minor spill on booth table. Cleaned and replaced promotional materials.', 6),
(7, 9, 'activity', 'Final day: survey results collected. Event success rate 95%.', 6),

-- Davao Convention Center Expo
(5, 10, 'activity', 'Product display setup initiated for Coca-Cola booth.', 7),
(5, 11, 'activity', 'High attendee turnout. 80 bottles distributed in first day.', 7),
(5, 12, 'incident', '2 bottles broken during unloading. Cleaned and logged as waste.', 8),
(5, 13, 'status_change', 'Expo completed. All materials returned and verified.', 8);

-- ====================
-- 4. DAMAGE/LOSS LOGS
-- ====================
INSERT INTO damage_loss_log (entity_type, entity_id, quantity, issue_type, project_day_id, reported_by, verified_by, proof_photo, remarks) VALUES
-- Product damage reports
('product', 1, 1, 'damage', 3, 3, 1, 'damage_milo_box.jpg', 'Milo sachet box wet due to rain at booth, disposed properly.'),
('product', 5, 2, 'damage', 12, 7, 8, 'broken_coke_bottles.jpg', 'Coca-Cola bottles broken during transport at Davao Convention Expo.'),
('product', 2, 1, 'loss', 2, 4, 1, NULL, '1 Surf pack missing after booth dismantle. Investigating.'),

-- Material issues
('material', 8, 1, 'damage', 7, 5, 6, 'table_leg_broken.jpg', 'Booth table leg broken during setup, replaced immediately.'),
('material', 10, 2, 'loss', 10, 6, 7, NULL, '2 folding chairs misplaced after event teardown. Likely stored incorrectly.'),
('material', 12, 1, 'damage', 11, 7, 8, 'kettle_leak.jpg', 'Electric kettle used at booth leaked; replaced for next event.');

-- ====================
-- RECENT ACTIVITY SUMMARY
-- ====================
INSERT INTO activity_log (user_id, action, entity, entity_id, description) VALUES
(1, 'login', 'system', 0, 'Admin logged in to monitor Davao Expo item returns'),
(2, 'allocate', 'item', 3, 'Allocated 15 Quaker Oats pouches to Abreeza weekend booth'),
(3, 'allocate', 'item', 5, 'Allocated 50 Coca-Cola bottles for school event sampling'),
(4, 'update', 'project_status', 5, 'Updated Davao Expo status to completed'),
(5, 'allocate', 'item', 4, 'Allocated 1 Epson printer for upcoming Mindanao Business Fair'),
(6, 'report', 'inventory', 0, 'Generated updated stock levels after event returns'),
(7, 'allocate', 'item', 2, 'Allocated 20 Surf Detergent packs for barangay cleanliness drive'),
(8, 'update', 'item_status', 1, 'Adjusted Milo stock levels after audit');

-- ====================
-- SUCCESS MESSAGE
-- ====================
SELECT 'Logs and activities data inserted successfully!' AS Status;
SELECT COUNT(*) AS 'Total Inventory Logs' FROM inventory_log;
SELECT COUNT(*) AS 'Total Activity Logs' FROM activity_log;
SELECT COUNT(*) AS 'Total Project Logs' FROM project_log;
SELECT COUNT(*) AS 'Total Damage/Loss Logs' FROM damage_loss_log;
