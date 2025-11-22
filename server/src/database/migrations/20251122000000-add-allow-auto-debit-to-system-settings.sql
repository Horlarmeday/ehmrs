-- =====================================================
-- Add allow_auto_debit to System_Settings Table
-- =====================================================
-- This migration adds the allow_auto_debit field to control
-- whether automatic deposit payment attempts are enabled system-wide.
-- 
-- Created: 2025-11-22
-- Purpose: Allow administrators to enable/disable automatic
--          deposit payment attempts for all prescriptions
-- =====================================================

-- Start transaction
START TRANSACTION;

-- =====================================================
-- 1. ADD allow_auto_debit FIELD TO System_Settings TABLE
-- =====================================================

-- Add allow_auto_debit field
ALTER TABLE `System_Settings` 
ADD COLUMN `allow_auto_debit` TINYINT(1) NOT NULL DEFAULT 1 
COMMENT 'Enable/disable automatic deposit payment attempts';

-- =====================================================
-- 2. VERIFICATION QUERIES
-- =====================================================

-- Verify the column was added successfully
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'System_Settings' 
  AND COLUMN_NAME = 'allow_auto_debit';

-- =====================================================
-- 3. COMMIT TRANSACTION
-- =====================================================

COMMIT;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- 
-- This migration has successfully:
-- 1. Added allow_auto_debit field to System_Settings table
-- 2. Field defaults to true (1) to maintain current behavior
-- 3. Field is NOT NULL to ensure a value is always set
-- 
-- The auto-deposit payment system will now check this setting
-- before attempting automatic payments.
-- =====================================================

