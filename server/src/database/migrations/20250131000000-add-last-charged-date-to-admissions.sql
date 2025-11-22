-- =====================================================
-- Add last_charged_date to Admissions Table
-- =====================================================
-- This migration adds the last_charged_date field to track
-- the last date a daily hospitalization fee was charged
-- for each admission.
-- 
-- Created: 2025-01-31
-- Purpose: Support daily hospitalization fee charging system
--          by tracking which dates have been charged
-- =====================================================

-- Start transaction
START TRANSACTION;

-- =====================================================
-- 1. ADD last_charged_date FIELD TO ADMISSIONS TABLE
-- =====================================================

-- Add last_charged_date field
ALTER TABLE `Admissions` 
ADD COLUMN `last_charged_date` DATE NULL 
COMMENT 'Last date a daily hospitalization fee was charged for this admission';

-- =====================================================
-- 2. VERIFICATION QUERIES
-- =====================================================

-- Verify the column was added successfully
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'Admissions' 
  AND COLUMN_NAME = 'last_charged_date';

-- =====================================================
-- 3. COMMIT TRANSACTION
-- =====================================================

COMMIT;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- 
-- This migration has successfully:
-- 1. Added last_charged_date field to Admissions table
-- 2. Field is nullable to support existing records
-- 3. Field type is DATE (DATEONLY) to store date without time
-- 
-- The daily hospitalization fee charging system can now track
-- which dates have been charged for each admission.
-- =====================================================

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================

/*
-- To rollback, run these commands:

START TRANSACTION;

ALTER TABLE `Admissions` 
DROP COLUMN `last_charged_date`;

COMMIT;
*/

