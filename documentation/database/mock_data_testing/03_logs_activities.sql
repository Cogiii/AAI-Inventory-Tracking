-- ================================================
-- MOCK DATA FOR AAI INVENTORY MANAGEMENT SYSTEM
-- FILE: 03_logs_activities.sql
-- PURPOSE: Insert mock data for logs and tracking activities
-- ================================================

USE AAI_inventory_db;

-- ====================
-- 1. INVENTORY LOGS
-- ====================
INSERT INTO inventory_log (item_id, log_type, reference_no, quantity, from_location_id, to_location_id, handled_by, photo, remarks) VALUES
-- Incoming inventory (using NULL for from_location_id as items come from external suppliers)
(1, 'in', 'PO-2025-001', 100, NULL, 1, 1, NULL, 'Initial stock delivery of Sintra Foam Boards'),
(2, 'in', 'PO-2025-002', 200, NULL, 1, 1, NULL, 'Vinyl Tarpaulin bulk delivery'),
(3, 'in', 'PO-2025-003', 500, NULL, 1, 2, NULL, 'Digital Print Stickers received'),
(11, 'in', 'PO-2025-004', 100, NULL, 1, 3, NULL, 'Marine Plywood delivery - 100 sheets'),
(12, 'in', 'PO-2025-005', 80, NULL, 1, 3, NULL, 'Particle Board delivery'),

-- Event allocations (out)
(1, 'out', 'ALLOC-SM-001', 10, 1, 3, 4, NULL, 'Allocated foam boards to SM Megamall Tech Fair'),
(2, 'out', 'ALLOC-SM-002', 5, 1, 3, 4, NULL, 'Allocated tarpaulin to SM Megamall Tech Fair'),
(11, 'out', 'ALLOC-SM-003', 15, 1, 3, 4, NULL, 'Marine plywood for booth construction'),
(7, 'out', 'ALLOC-AY-001', 2, 1, 4, 5, NULL, 'Wireless mic system for Ayala Centrio event'),
(17, 'out', 'ALLOC-AY-002', 10, 1, 4, 5, NULL, 'Carpet tiles for booth flooring'),

-- Returns from events (in)
(1, 'in', 'RET-SM-001', 9, 3, 1, 6, NULL, 'Returned foam boards after SM Megamall event'),
(2, 'in', 'RET-SM-002', 5, 3, 1, 6, NULL, 'Returned tarpaulin from SM Megamall'),
(7, 'in', 'RET-AY-001', 2, 4, 1, 7, NULL, 'Returned wireless mic system'),

-- Transfers between warehouses
(11, 'transfer', 'TRF-001', 10, 1, 2, 2, NULL, 'Transfer plywood to Materials Storage'),
(21, 'transfer', 'TRF-002', 50, 2, 1, 2, NULL, 'Transfer promotional t-shirts for distribution');

-- ====================
-- 2. ACTIVITY LOGS
-- ====================
INSERT INTO activity_log (user_id, action, entity, entity_id, description) VALUES
-- User activities
(1, 'create', 'project', 1, 'Created new project: BGC Office Building Construction'),
(1, 'create', 'project', 2, 'Created new project: Eastwood Mall Renovation'),
(2, 'update', 'project', 1, 'Updated project status to ongoing'),
(2, 'allocate', 'item', 1, 'Allocated 5 angle grinders to BGC project'),
(3, 'allocate', 'item', 2, 'Allocated 3 cordless drills to BGC project'),
(4, 'return', 'item', 1, 'Returned 4 angle grinders from BGC project'),
(5, 'allocate', 'item', 7, 'Allocated 2 multi-tools to Eastwood Mall project'),
(6, 'update', 'item', 11, 'Updated cement stock quantity after delivery'),
(7, 'create', 'personnel', 1, 'Added new personnel: Roberto Silva'),
(8, 'update', 'location', 3, 'Updated BGC project site address'),

-- System activities
(1, 'login', 'system', 0, 'Administrator logged into the system'),
(2, 'login', 'system', 0, 'Marketing manager logged into the system'),
(3, 'logout', 'system', 0, 'Staff member logged out'),
(1, 'backup', 'system', 0, 'Database backup completed successfully'),
(2, 'report', 'inventory', 0, 'Generated monthly inventory report'),
(1, 'update', 'user', 3, 'Updated user permissions for John Cruz');

-- ====================
-- 3. PROJECT LOGS
-- ====================
INSERT INTO project_log (project_id, project_day_id, log_type, description, recorded_by) VALUES
-- BGC Office Building logs
(1, 1, 'activity', 'Foundation excavation completed. Equipment returned in good condition.', 4),
(1, 2, 'activity', 'Concrete pouring for foundation. Additional cement requested.', 4),
(1, 3, 'incident', 'Minor delay due to weather conditions. No equipment damage.', 4),
(1, 4, 'activity', 'Steel reinforcement installation completed ahead of schedule.', 6),
(1, 5, 'status_change', 'Project phase 1 completed. Moving to structural work.', 4),
(1, 6, 'activity', 'Structural framework installation in progress.', 6),
(1, 7, 'activity', 'Electrical rough-in work started. Safety protocols maintained.', 6),
(1, 8, 'activity', 'Current day operations: flooring preparation work ongoing.', 6),

-- Eastwood Mall logs
(2, 9, 'activity', 'Demolition phase completed. Tools cleaned and inspected.', 7),
(2, 10, 'activity', 'Plumbing installation started. Materials delivered on time.', 7),
(2, 11, 'incident', 'One jigsaw reported damaged during use. Replacement requested.', 7),
(2, 12, 'activity', 'Tile installation phase 1 completed with minor waste.', 8),
(2, 13, 'activity', 'Interior finishing work progressing as planned.', 8),
(2, 14, 'status_change', 'Phase 2 renovation work approved for next week.', 7),
(2, 15, 'activity', 'Current operations: final electrical and safety inspections.', 8),

-- Cebu IT Park logs
(4, 16, 'activity', 'Site preparation and surveying completed.', 12),
(4, 17, 'activity', 'Foundation work started. Equipment performing well.', 13),
(4, 18, 'incident', 'Cement delivery delayed by 2 hours due to traffic.', 12),
(4, 19, 'activity', 'Structural work progressing. Safety standards maintained.', 13),
(4, 20, 'activity', 'Current phase: concrete work and steel installation ongoing.', 13);

-- ====================
-- 4. DAMAGE/LOSS LOGS
-- ====================
INSERT INTO damage_loss_log (entity_type, entity_id, quantity, issue_type, project_day_id, reported_by, verified_by, proof_photo, remarks) VALUES
-- Equipment damage reports
('product', 1, 1, 'damage', 2, 4, 1, 'damage_photo_001.jpg', 'Angle grinder motor burned out during heavy use. Under warranty repair.'),
('product', 8, 1, 'damage', 11, 7, 2, 'damage_photo_002.jpg', 'Jigsaw blade guard broken during renovation work. Replacement ordered.'),
('product', 2, 1, 'damage', 16, 12, 1, 'damage_photo_003.jpg', 'Cordless drill battery damaged. Water exposure suspected.'),

-- Material losses
('material', 3, 2, 'loss', 1, 4, 6, NULL, 'Measuring tapes missing after project completion. Likely left on-site.'),
('material', 11, 2, 'damage', 16, 12, 13, 'damage_photo_004.jpg', 'Cement bags damaged during transport. Packaging torn, content compromised.'),
('material', 17, 2, 'damage', 10, 7, 8, 'damage_photo_005.jpg', 'Ceramic tiles cracked during installation. Manufacturing defect suspected.'),

-- Safety equipment issues
('product', 21, 2, 'loss', 5, 6, 4, NULL, 'Safety helmets not returned by personnel. Follow-up required.'),
('product', 22, 1, 'damage', 13, 8, 7, 'damage_photo_006.jpg', 'Safety vest torn during work. Normal wear and tear.'),

-- Material theft/loss
('material', 15, 1, 'loss', 17, 13, 12, NULL, 'Electrical wire roll missing from storage area. Security investigation ongoing.'),
('material', 16, 1, 'damage', 12, 8, 7, 'damage_photo_007.jpg', 'Paint primer container leaked during storage. Container defect.');

-- ====================
-- RECENT ACTIVITY SUMMARY
-- ====================
-- Insert some recent activities for current date testing
INSERT INTO activity_log (user_id, action, entity, entity_id, description) VALUES
(1, 'login', 'system', 0, 'Daily system check and inventory review'),
(2, 'allocate', 'item', 1, 'Current allocation: 6 angle grinders to BGC project'),
(3, 'allocate', 'item', 21, 'Current allocation: 20 safety helmets to BGC project'),
(4, 'update', 'project_status', 1, 'BGC project daily progress update'),
(5, 'allocate', 'item', 4, 'Current allocation: 2 circular saws to Eastwood project'),
(6, 'report', 'inventory', 0, 'Weekly inventory status report generated'),
(7, 'allocate', 'item', 6, 'Current allocation: 4 impact drivers to Cebu project'),
(8, 'update', 'item_status', 12, 'Updated steel rebar allocation status');

-- ====================
-- SUCCESS MESSAGE
-- ====================
SELECT 'Logs and activities data inserted successfully!' AS Status;
SELECT COUNT(*) AS 'Total Inventory Logs' FROM inventory_log;
SELECT COUNT(*) AS 'Total Activity Logs' FROM activity_log;
SELECT COUNT(*) AS 'Total Project Logs' FROM project_log;
SELECT COUNT(*) AS 'Total Damage/Loss Logs' FROM damage_loss_log;