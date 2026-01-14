-- Migration script to add employee_email column to employees table
-- Run this script if you have an existing database without the email column

-- Add employee_email column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'employees' 
        AND column_name = 'employee_email'
    ) THEN
        ALTER TABLE employees 
        ADD COLUMN employee_email VARCHAR(255);
        
        RAISE NOTICE 'Column employee_email added successfully';
    ELSE
        RAISE NOTICE 'Column employee_email already exists';
    END IF;
END $$;

-- Optional: Update existing admin users with email addresses
-- Uncomment and modify the following lines to set emails for existing admin users
-- UPDATE employees 
-- SET employee_email = 'admin1@example.com' 
-- WHERE employee_access_level = 'admin' AND employee_id = 1;

-- UPDATE employees 
-- SET employee_email = 'admin2@example.com' 
-- WHERE employee_access_level = 'admin' AND employee_id = 2;

