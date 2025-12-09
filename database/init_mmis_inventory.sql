-- ===========================================================
--  Machine Maintenance Inventory System (MMIS)
--  Database Schema + Sample Data
--  Author: Sohail Mohammed (Foxconn FII)
-- ===========================================================

-- Drop old tables if they exist (for re-runs)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS fixtures CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- ===========================================================
-- 1️ EMPLOYEES TABLE
-- ===========================================================
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    employee_badge_number VARCHAR(20) UNIQUE NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    employee_designation VARCHAR(50),
    employee_shift VARCHAR(20),
    employee_access_level VARCHAR(20) CHECK (employee_access_level IN ('admin', 'user')),
    employee_username VARCHAR(50) UNIQUE NOT NULL,
    employee_password VARCHAR(255) NOT NULL
);

-- Insert sample employees (passwords are plain for demo, hash them in backend)
INSERT INTO employees 
(employee_badge_number, employee_name, employee_designation, employee_shift, employee_access_level, employee_username, employee_password)
VALUES
('A1001', 'John Smith', 'Test Engineer', '1st', 'admin', 'john.smith', 'admin123'),
('A1002', 'Sarah Johnson', 'Test Manager', '2nd', 'admin', 'sarah.j', 'admin123'),
('T2001', 'David Chen', 'Technician', '1st', 'user', 'david.chen', 'tech123'),
('T2002', 'Emily Wong', 'Technician', '2nd', 'user', 'emily.wong', 'tech123');

-- ===========================================================
-- 2️ FIXTURES TABLE
-- ===========================================================
CREATE TABLE fixtures (
    fixture_id SERIAL PRIMARY KEY,
    fixture_name VARCHAR(100) NOT NULL,
    test_area VARCHAR(20),
    project_name VARCHAR(100)
);

-- Sample fixtures
INSERT INTO fixtures (fixture_name, test_area, project_name)
VALUES
('Bondi_ICT_01', 'ICT', 'Bondi Beach'),
('Astoria_BSI_02', 'BSI', 'Astoria'),
('Turin_FBT_03', 'FBT', 'Turin');

-- ===========================================================
-- 3️ INVENTORY TABLE
-- ===========================================================
CREATE TABLE inventory (
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    item_description TEXT,
    item_part_number VARCHAR(50),
    item_current_quantity INTEGER NOT NULL DEFAULT 0,
    item_min_count INTEGER NOT NULL DEFAULT 0,
    item_unit VARCHAR(20),
    item_manufacturer VARCHAR(100),
    item_type VARCHAR(20) CHECK (item_type IN ('part', 'tool')),
    test_area VARCHAR(20),
    project_name VARCHAR(100),
    item_life_cycle INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample inventory
INSERT INTO inventory 
(item_name, item_description, item_part_number, item_current_quantity, item_min_count, item_unit, item_manufacturer, item_type, test_area, project_name, item_life_cycle)
VALUES
('Screw M3x10', 'Hex-head screw for ICT fixtures', 'SC-310', 500, 50, 'pcs', 'Foxconn', 'part', 'ICT', 'Bondi Beach', 12),
('Cooling Fan', 'Cooling fan for BSI test racks', 'CF-200', 30, 10, 'pcs', 'Delta', 'part', 'BSI', 'Astoria', 18),
('Multimeter', 'Digital multimeter for maintenance', 'MM-100', 8, 3, 'pcs', 'Fluke', 'tool', 'ICT', 'Bondi Beach', 24),
('Soldering Iron', '60W soldering iron station', 'SI-600', 5, 2, 'pcs', 'Hakko', 'tool', 'FBT', 'Turin', 36),
('Relay Module', '5V relay module', 'RM-500', 20, 5, 'pcs', 'Omron', 'part', 'BSI', 'Astoria', 24);

-- ===========================================================
-- 4️ TRANSACTIONS TABLE
-- ===========================================================
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES inventory(item_id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(employee_id) ON DELETE CASCADE,
    fixture_id INTEGER REFERENCES fixtures(fixture_id) ON DELETE CASCADE,
    quantity_used INTEGER NOT NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('request', 'return', 'restock')),
    remarks TEXT,
    test_area VARCHAR(20),
    project_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample transactions
INSERT INTO transactions 
(item_id, employee_id, fixture_id, quantity_used, transaction_type, remarks, test_area, project_name)
VALUES
(1, 3, 1, 20, 'request', 'Used for ICT panel rework', 'ICT', 'Bondi Beach'),
(2, 4, 2, 5, 'request', 'Replacement fan in BSI station', 'BSI', 'Astoria'),
(3, 3, 1, 1, 'return', 'Returned after testing', 'ICT', 'Bondi Beach'),
(4, 2, 3, 2, 'restock', 'Added new soldering tools', 'FBT', 'Turin'),
(5, 1, 2, 10, 'restock', 'Replenished stock after shipment', 'BSI', 'Astoria');

-- ===========================================================
-- 5️ REPORTS TABLE
-- ===========================================================
CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    week_start_date DATE,
    week_end_date DATE,
    item_id INTEGER REFERENCES inventory(item_id) ON DELETE CASCADE,
    item_name VARCHAR(100),
    item_description TEXT,
    quantity_used INTEGER,
    current_quantity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generate some example report data
INSERT INTO reports 
(week_start_date, week_end_date, item_id, item_name, item_description, quantity_used, current_quantity)
VALUES
('2025-10-27', '2025-11-02', 1, 'Screw M3x10', 'Hex-head screw for ICT fixtures', 50, 480),
('2025-10-27', '2025-11-02', 2, 'Cooling Fan', 'Cooling fan for BSI test racks', 3, 27),
('2025-10-27', '2025-11-02', 3, 'Multimeter', 'Digital multimeter for maintenance', 1, 8),
('2025-10-27', '2025-11-02', 4, 'Soldering Iron', '60W soldering iron station', 1, 5);

-- ===========================================================
-- 6️ VERIFY DATA
-- ===========================================================
SELECT ' Employees:', COUNT(*) FROM employees;
SELECT ' Fixtures:', COUNT(*) FROM fixtures;
SELECT ' Inventory:', COUNT(*) FROM inventory;
SELECT ' Transactions:', COUNT(*) FROM transactions;
SELECT ' Reports:', COUNT(*) FROM reports;

SELECT * FROM employees;
SELECT * FROM fixtures;
SELECT * FROM inventory;
SELECT * FROM reports;
SELECT * FROM transactions;
-- ===========================================================
-- End of Schema
-- ===========================================================
