-- ===========================================================
-- Add Inventory Items to MMIS Database
-- ===========================================================
-- This script adds inventory items to the inventory table
-- Run this on your server: sudo -u postgres psql -d mmis -f add_inventory_items.sql
-- ===========================================================

-- Example: Add single inventory item
INSERT INTO inventory (
    item_name,
    item_description,
    item_part_number,
    item_current_quantity,
    item_min_count,
    item_unit,
    item_unit_price,
    item_manufacturer,
    item_type,
    test_area,
    project_name,
    item_life_cycle,
    item_image_url
) VALUES (
    'Item Name Here',
    'Item description (optional)',
    'Part Number (optional)',
    100,  -- Current quantity
    10,   -- Minimum count
    'pcs', -- Unit (pcs, kg, m, etc.)
    '25.50', -- Unit price (as string)
    'Manufacturer Name',
    'part', -- Type: 'part' or 'tool'
    'BSI_Mobo', -- Test area
    'Bondi Beach', -- Project name
    0, -- Life cycle
    NULL -- Image URL (optional)
);

-- Example: Add multiple inventory items at once
INSERT INTO inventory (
    item_name,
    item_description,
    item_part_number,
    item_current_quantity,
    item_min_count,
    item_unit,
    item_unit_price,
    item_manufacturer,
    item_type,
    test_area,
    project_name,
    item_life_cycle,
    item_image_url
) VALUES
('Screw M3x10', 'Hex-head screw for fixtures', 'SC-310', 500, 50, 'pcs', '0.50', 'Foxconn', 'part', 'ICT_Mobo', 'Bondi Beach', 0, NULL),
('Cooling Fan', 'Cooling fan for test racks', 'CF-200', 30, 10, 'pcs', '25.00', 'Delta', 'part', 'BSI_Mobo', 'Astoria', 0, NULL),
('Multimeter', 'Digital multimeter', 'MM-100', 8, 3, 'pcs', '150.00', 'Fluke', 'tool', 'ICT_Mobo', 'Bondi Beach', 0, NULL);

-- ===========================================================
-- Template for adding your own items:
-- ===========================================================
-- INSERT INTO inventory (
--     item_name,
--     item_description,
--     item_part_number,
--     item_current_quantity,
--     item_min_count,
--     item_unit,
--     item_unit_price,
--     item_manufacturer,
--     item_type,
--     test_area,
--     project_name,
--     item_life_cycle,
--     item_image_url
-- ) VALUES
-- ('Your Item Name', 'Description', 'Part Number', 100, 10, 'pcs', '25.50', 'Manufacturer', 'part', 'BSI_Mobo', 'Bondi Beach', 0, NULL);

