-- SQL script to create the database schema for AAI Inventory Management System
-- This script defines tables, their columns, data types, primary keys, and foreign key relationships.
-- Database: AAI_inventory_management


-- ==============================================================
-- INVENTORY SYSTEM FOR PROJECT-BASED MARKETING
-- ==============================================================

-- DROP DATABASE IF EXISTS AAI_inventory_db;
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
  name VARCHAR(100) NOT NULL,
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
    warehouse_location VARCHAR(255),
    status VARCHAR(50),
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
    status VARCHAR(50) CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_by INT REFERENCES user(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE NOW()
);

CREATE TABLE project_day (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES project(id) ON DELETE CASCADE,
    project_date DATE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE NOW()
);

CREATE TABLE project_item (
    id SERIAL PRIMARY KEY,
    project_day_id INT REFERENCES project_day(id) ON DELETE CASCADE,
    item_id INT REFERENCES item(id) ON DELETE CASCADE,
    allocated_quantity INT DEFAULT 0,
    damaged_quantity INT DEFAULT 0,
    lost_quantity INT DEFAULT 0,
    returned_quantity INT DEFAULT 0,
    status VARCHAR(50),
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
    from_location VARCHAR(255),
    to_location VARCHAR(255),
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

-- ==============================================================
-- END OF SCHEMA
-- ==============================================================

