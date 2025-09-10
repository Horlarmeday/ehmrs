-- =====================================================
-- Rollback Migration for Deceased Patient Management
-- =====================================================
-- This migration removes all deceased patient management
-- fields and related structures
-- 
-- WARNING: This will permanently delete all deceased patient data!
-- Make sure to backup your data before running this migration.
-- =====================================================

-- Start transaction
START TRANSACTION;

-- =====================================================
-- 1. DROP VIEWS
-- =====================================================

DROP VIEW IF EXISTS `death_statistics_view`;
DROP VIEW IF EXISTS `deceased_patients_view`;

-- =====================================================
-- 2. DROP AUDIT TABLE
-- =====================================================

DROP TABLE IF EXISTS `deceased_patient_audit`;

-- =====================================================
-- 3. DROP INDEXES
-- =====================================================

-- Drop composite index
DROP INDEX IF EXISTS `IDX_Patients_status_death_date` ON `Patients`;

-- Drop individual indexes
DROP INDEX IF EXISTS `IDX_Patients_death_certificate_number` ON `Patients`;
DROP INDEX IF EXISTS `IDX_Patients_marked_deceased_by` ON `Patients`;
DROP INDEX IF EXISTS `IDX_Patients_date_of_death` ON `Patients`;
DROP INDEX IF EXISTS `IDX_Patients_patient_status` ON `Patients`;

-- =====================================================
-- 4. DROP FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Drop foreign key for revived_by
ALTER TABLE `Patients` 
DROP FOREIGN KEY IF EXISTS `FK_Patients_revived_by_Staff`;

-- Drop foreign key for marked_deceased_by
ALTER TABLE `Patients` 
DROP FOREIGN KEY IF EXISTS `FK_Patients_marked_deceased_by_Staff`;

-- =====================================================
-- 5. REMOVE COLUMNS FROM PATIENTS TABLE
-- =====================================================

-- Remove all deceased patient related columns
ALTER TABLE `Patients` DROP COLUMN IF EXISTS `revived_at`;
ALTER TABLE `Patients` DROP COLUMN IF EXISTS `revived_by`;
ALTER TABLE `Patients` DROP COLUMN IF EXISTS `revival_reason`;
ALTER TABLE `Patients` DROP COLUMN IF EXISTS `marked_deceased_at`;
ALTER TABLE `Patients` DROP COLUMN IF EXISTS `marked_deceased_by`;
ALTER TABLE `Patients` DROP COLUMN IF EXISTS `death_certificate_number`;
ALTER TABLE `Patients` DROP COLUMN IF EXISTS `cause_of_death`;
ALTER TABLE `Patients` DROP COLUMN IF EXISTS `date_of_death`;

-- =====================================================
-- 6. UPDATE PATIENT STATUS (Optional)
-- =====================================================

-- If you want to remove 'Deceased' from the enum, uncomment the following:
-- ALTER TABLE `Patients` 
-- MODIFY COLUMN `patient_status` ENUM('Inpatient', 'Outpatient') 
-- DEFAULT 'Outpatient';

-- =====================================================
-- 7. CLEAN UP SIGNATURES DIRECTORY (Manual Step)
-- =====================================================

-- Note: The signatures directory and files need to be manually removed
-- from the server filesystem as SQL cannot delete files.
-- 
-- To clean up signatures:
-- 1. Stop the application
-- 2. Delete the 'signatures' directory from the server root
-- 3. Restart the application

-- =====================================================
-- 8. VERIFY ROLLBACK
-- =====================================================

-- Check that all columns were removed
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'Patients' 
  AND COLUMN_NAME IN (
    'date_of_death', 'cause_of_death', 'death_certificate_number',
    'marked_deceased_by', 'marked_deceased_at', 'revival_reason',
    'revived_by', 'revived_at'
  );

-- This query should return no results if the rollback was successful

-- Check that indexes were removed
SHOW INDEX FROM `Patients` WHERE Key_name LIKE 'IDX_Patients_%';

-- Check that foreign keys were removed
SELECT 
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'Patients' 
  AND CONSTRAINT_NAME LIKE 'FK_Patients_%';

-- =====================================================
-- 9. COMMIT TRANSACTION
-- =====================================================

COMMIT;

-- =====================================================
-- ROLLBACK COMPLETE
-- =====================================================
-- 
-- This rollback has successfully:
-- 1. Dropped all deceased patient management views
-- 2. Dropped the audit trail table
-- 3. Removed all performance indexes
-- 4. Dropped all foreign key constraints
-- 5. Removed all deceased patient fields
-- 6. Verified the rollback
-- 
-- The deceased patient management system has been completely removed.
-- 
-- IMPORTANT: Remember to manually delete the 'signatures' directory
-- from your server filesystem if it exists.
-- =====================================================
