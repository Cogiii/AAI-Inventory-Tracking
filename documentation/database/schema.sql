-- SQL script to create the database schema for AAI Inventory Management System
-- This script defines tables, their columns, data types, primary keys, and foreign key relationships.
-- Database: AAI_inventory_management


-- ==============================================================
-- INVENTORY SYSTEM FOR PROJECT-BASED MARKETING (Normalized)
-- ==============================================================

DROP DATABASE IF EXISTS AAI_inventory_db;
CREATE DATABASE IF NOT EXISTS AAI_inventory_db;

USE AAI_inventory_db;

-- ====================
-- 1. CORE ENTITIES
-- ====================

CREATE TABLE brand (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE NOW()
);

CREATE TABLE `position` (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,

    -- Permissions
    can_manage_projects BOOLEAN DEFAULT FALSE, -- Access to everything
    can_edit_project BOOLEAN DEFAULT FALSE,
    can_add_project BOOLEAN DEFAULT FALSE,
    can_delete_project BOOLEAN DEFAULT FALSE,
    
    can_manage_inventory BOOLEAN DEFAULT FALSE,-- Access to everything
    can_add_inventory BOOLEAN DEFAULT FALSE,
    can_edit_inventory BOOLEAN DEFAULT FALSE,
    can_delete_inventory BOOLEAN DEFAULT FALSE,
    
    can_manage_users BOOLEAN DEFAULT FALSE, -- Access to everything
    can_edit_user BOOLEAN DEFAULT FALSE,
    can_add_user BOOLEAN DEFAULT FALSE,
    can_delete_user BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE NOW()
);

CREATE TABLE user (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    position_id INT REFERENCES `position`(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE NOW()
);

CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE NOW()
);

CREATE TABLE personnel (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE NOW()
);

CREATE TABLE location (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,           -- e.g., "Main Warehouse", "Site A"
    type ENUM('warehouse', 'project_site', 'office') NOT NULL,  -- classify location type
    street VARCHAR(255) NULL,
    barangay VARCHAR(255) NULL,
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    region VARCHAR(255) NULL,
    postal_code VARCHAR(20) NULL,
    country VARCHAR(100) DEFAULT 'Philippines',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE NOW()
);

-- ====================
-- 2. ITEMS & INVENTORY
-- ====================

CREATE TABLE item (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) CHECK (type IN ('product', 'material')),
    brand_id INT REFERENCES brand(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    delivered_quantity INT DEFAULT 0,
    damaged_quantity INT DEFAULT 0,
    lost_quantity INT DEFAULT 0,
    available_quantity INT DEFAULT 0,
    reserved_quantity INT DEFAULT 0,  -- Items reserved for upcoming/scheduled project days
    warehouse_location_id INT REFERENCES location(id) ON DELETE SET NULL,
    expired_date DATE,
    status ENUM('in stock', 'out of stock', 'low stock', 'inactive') DEFAULT 'in stock',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE NOW()
);

-- ====================
-- 3. PROJECT STRUCTURE
-- ====================

CREATE TABLE project (
    id SERIAL PRIMARY KEY,
    jo_number VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
    created_by INT REFERENCES user(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE NOW()
);

CREATE TABLE project_day (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES project(id) ON DELETE CASCADE,
    project_date DATE NOT NULL,
    location_id INT REFERENCES location(id) ON DELETE SET NULL,
    status ENUM('scheduled', 'completed') DEFAULT 'scheduled',  -- Day status for item reservation system
    completed_at TIMESTAMP DEFAULT NULL,  -- When the day was marked as complete
    completed_by INT REFERENCES user(id) ON DELETE SET NULL,  -- User who completed the day
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE NOW()
);

CREATE TABLE project_item (
    id SERIAL PRIMARY KEY,
    project_day_id INT REFERENCES project_day(id) ON DELETE CASCADE,
    item_id INT REFERENCES item(id) ON DELETE CASCADE,
    source_location_id INT REFERENCES location(id) ON DELETE SET NULL,  -- Source warehouse for this allocation
    allocated_quantity INT DEFAULT 0,
    damaged_quantity INT DEFAULT 0,
    lost_quantity INT DEFAULT 0,
    returned_quantity INT DEFAULT 0,
    status ENUM('allocated', 'returned') DEFAULT 'allocated',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE NOW()
);

CREATE TABLE project_personnel (
    project_day_id INT REFERENCES project_day(id) ON DELETE CASCADE,
    personnel_id INT REFERENCES personnel(id) ON DELETE CASCADE,
    role_id INT REFERENCES role(id) ON DELETE CASCADE,
    PRIMARY KEY (project_day_id, personnel_id, role_id)
);

-- ====================
-- 4. LOG TABLES
-- ====================

-- INVENTORY LOG
CREATE TABLE inventory_log (
    id SERIAL PRIMARY KEY,
    item_id INT REFERENCES item(id) ON DELETE CASCADE,
    log_type VARCHAR(50) CHECK (log_type IN ('in', 'out', 'transfer')),
    reference_no VARCHAR(100),
    quantity INT NOT NULL CHECK (quantity >= 0),
    from_location_id INT REFERENCES location(id) ON DELETE SET NULL,
    to_location_id INT REFERENCES location(id) ON DELETE SET NULL,
    handled_by INT REFERENCES user(id) ON DELETE SET NULL,
    photo TEXT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ACTIVITY LOG
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES user(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- create, update, delete, allocate, etc.
    entity VARCHAR(100) NOT NULL,
    entity_id INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PROJECT LOG
CREATE TABLE project_log (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES project(id) ON DELETE CASCADE,
    project_day_id INT REFERENCES project_day(id) ON DELETE SET NULL,
    log_type VARCHAR(50) CHECK (log_type IN ('status_change', 'activity', 'incident')),
    description TEXT NOT NULL,
    recorded_by INT REFERENCES user(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- DAMAGE / LOSS LOG
CREATE TABLE damage_loss_log (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) CHECK (entity_type IN ('product', 'material')),
    entity_id INT REFERENCES item(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    issue_type VARCHAR(50) CHECK (issue_type IN ('damage', 'loss')),
    project_day_id INT REFERENCES project_day(id) ON DELETE SET NULL,
    reported_by INT REFERENCES user(id) ON DELETE SET NULL,
    verified_by INT REFERENCES user(id) ON DELETE SET NULL,
    proof_photo TEXT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ====================
-- 5. MULTI-WAREHOUSE INVENTORY MANAGEMENT
-- ====================

-- ITEM_LOCATION: Tracks item quantities per warehouse/location
-- This enables items to exist in multiple locations with different quantities
CREATE TABLE item_location (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT UNSIGNED NOT NULL,
    location_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,           -- Total quantity at this location
    reserved_quantity INT NOT NULL DEFAULT 0,  -- Reserved for scheduled project days
    damaged_quantity INT NOT NULL DEFAULT 0,   -- Damaged items at this location
    lost_quantity INT NOT NULL DEFAULT 0,      -- Lost items at this location
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE NOW(),
    FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES location(id) ON DELETE CASCADE,
    UNIQUE KEY unique_item_location (item_id, location_id),
    CHECK (quantity >= 0),
    CHECK (reserved_quantity >= 0),
    CHECK (damaged_quantity >= 0),
    CHECK (lost_quantity >= 0)
);

CREATE INDEX idx_item_location_item ON item_location(item_id);
CREATE INDEX idx_item_location_location ON item_location(location_id);

-- DELIVERY_LOG: Tracks all deliveries and admin adjustments
-- type = 'delivery': Regular stock additions (only increases)
-- type = 'adjustment': Admin corrections (can increase or decrease, requires reason)
CREATE TABLE delivery_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT UNSIGNED NOT NULL,
    location_id INT NOT NULL,
    quantity INT NOT NULL,                     -- Positive for additions, can be negative for adjustments
    type ENUM('delivery', 'adjustment') NOT NULL DEFAULT 'delivery',
    adjustment_reason TEXT,                    -- Required when type = 'adjustment'
    notes TEXT,
    reference_number VARCHAR(100),             -- PO number, delivery receipt, etc.
    performed_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES location(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES user(id) ON DELETE SET NULL
);

CREATE INDEX idx_delivery_log_item ON delivery_log(item_id);
CREATE INDEX idx_delivery_log_location ON delivery_log(location_id);
CREATE INDEX idx_delivery_log_type ON delivery_log(type);

-- STOCK_TRANSFER: Tracks transfers between locations
CREATE TABLE stock_transfer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT UNSIGNED NOT NULL,
    from_location_id INT NOT NULL,
    to_location_id INT NOT NULL,
    quantity INT NOT NULL,
    notes TEXT,
    performed_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE,
    FOREIGN KEY (from_location_id) REFERENCES location(id) ON DELETE CASCADE,
    FOREIGN KEY (to_location_id) REFERENCES location(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES user(id) ON DELETE SET NULL,
    CHECK (quantity > 0),
    CHECK (from_location_id != to_location_id)
);

CREATE INDEX idx_stock_transfer_item ON stock_transfer(item_id);
CREATE INDEX idx_stock_transfer_from ON stock_transfer(from_location_id);
CREATE INDEX idx_stock_transfer_to ON stock_transfer(to_location_id);

-- ==============================================================
-- END OF SCHEMA
-- ==============================================================

