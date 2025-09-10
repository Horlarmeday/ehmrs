-- =====================================================
-- Deceased Patient Management System - Complete Migration
-- =====================================================
-- This migration adds all necessary fields and constraints
-- for the comprehensive deceased patient management system
-- 
-- Created: 2025-01-28
-- Purpose: Support for marking patients as deceased, 
--          generating death certificates, and managing
--          deceased patient workflows
-- =====================================================

-- Start transaction
START TRANSACTION;

-- =====================================================
-- 1. ADD DECEASED PATIENT FIELDS TO PATIENTS TABLE
-- =====================================================

-- Add date of death field
ALTER TABLE `Patients` 
ADD COLUMN `date_of_death` DATETIME NULL 
COMMENT 'Date when the patient passed away';

-- Add cause of death field
ALTER TABLE `Patients` 
ADD COLUMN `cause_of_death` VARCHAR(255) NULL 
COMMENT 'Cause of death (optional)';

-- Add death certificate number field
ALTER TABLE `Patients` 
ADD COLUMN `death_certificate_number` VARCHAR(255) NULL 
COMMENT 'Death certificate number (auto-generated)';

-- Add staff member who marked patient as deceased
ALTER TABLE `Patients` 
ADD COLUMN `marked_deceased_by` INT NULL 
COMMENT 'Staff member who marked the patient as deceased';

-- Add timestamp when patient was marked as deceased
ALTER TABLE `Patients` 
ADD COLUMN `marked_deceased_at` DATETIME NULL 
COMMENT 'Timestamp when patient was marked as deceased';

-- Add revival reason field (for admin use)
ALTER TABLE `Patients` 
ADD COLUMN `revival_reason` TEXT NULL 
COMMENT 'Reason for reviving patient (admin only)';

-- Add staff member who revived the patient
ALTER TABLE `Patients` 
ADD COLUMN `revived_by` INT NULL 
COMMENT 'Staff member who revived the patient';

-- Add timestamp when patient was revived
ALTER TABLE `Patients` 
ADD COLUMN `revived_at` DATETIME NULL 
COMMENT 'Timestamp when patient was revived';

-- =====================================================
-- 2. ADD FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key for marked_deceased_by
ALTER TABLE `Patients` 
ADD CONSTRAINT `FK_Patients_marked_deceased_by_Staff` 
FOREIGN KEY (`marked_deceased_by`) 
REFERENCES `Staff` (`id`) 
ON UPDATE CASCADE 
ON DELETE SET NULL;

-- Add foreign key for revived_by
ALTER TABLE `Patients` 
ADD CONSTRAINT `FK_Patients_revived_by_Staff` 
FOREIGN KEY (`revived_by`) 
REFERENCES `Staff` (`id`) 
ON UPDATE CASCADE 
ON DELETE SET NULL;

-- =====================================================
-- 3. ADD INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for patient status queries
CREATE INDEX `IDX_Patients_patient_status` 
ON `Patients` (`patient_status`);

-- Index for date of death queries
CREATE INDEX `IDX_Patients_date_of_death` 
ON `Patients` (`date_of_death`);

-- Index for marked deceased by queries
CREATE INDEX `IDX_Patients_marked_deceased_by` 
ON `Patients` (`marked_deceased_by`);

-- Composite index for deceased patient queries
CREATE INDEX `IDX_Patients_status_death_date` 
ON `Patients` (`patient_status`, `date_of_death`);

-- Index for death certificate number lookups
CREATE INDEX `IDX_Patients_death_certificate_number` 
ON `Patients` (`death_certificate_number`);

-- =====================================================
-- 4. UPDATE PATIENT STATUS ENUM (if needed)
-- =====================================================

-- Note: This assumes the enum already includes 'Deceased'
-- If not, you may need to alter the enum type:
-- ALTER TABLE `Patients` 
-- MODIFY COLUMN `patient_status` ENUM('Inpatient', 'Outpatient', 'Deceased') 
-- DEFAULT 'Outpatient';

-- =====================================================
-- 5. CREATE SIGNATURES DIRECTORY STRUCTURE
-- =====================================================

-- Note: This is handled by the application code
-- The signatures directory will be created automatically
-- when the first digital signature is generated

-- =====================================================
-- 6. ADD TRIGGERS FOR AUDIT TRAIL (Optional)
-- =====================================================

-- Create audit table for deceased patient changes
CREATE TABLE IF NOT EXISTS `deceased_patient_audit` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `action` ENUM('MARKED_DECEASED', 'REVIVED', 'CERTIFICATE_GENERATED') NOT NULL,
  `performed_by` INT NOT NULL,
  `performed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `details` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  INDEX `IDX_deceased_audit_patient_id` (`patient_id`),
  INDEX `IDX_deceased_audit_action` (`action`),
  INDEX `IDX_deceased_audit_performed_by` (`performed_by`),
  INDEX `IDX_deceased_audit_performed_at` (`performed_at`),
  FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`performed_by`) REFERENCES `Staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit trail for deceased patient management actions';

-- =====================================================
-- 7. CREATE VIEWS FOR REPORTING
-- =====================================================

-- View for deceased patients with staff information
CREATE OR REPLACE VIEW `deceased_patients_view` AS
SELECT 
  p.id,
  p.fullname,
  p.hospital_id,
  p.date_of_birth,
  p.gender,
  p.phone,
  p.address,
  p.date_of_death,
  p.cause_of_death,
  p.death_certificate_number,
  p.marked_deceased_at,
  p.marked_deceased_by,
  s.fullname AS marked_by_staff_name,
  s.department AS marked_by_department,
  s.role AS marked_by_role,
  p.revived_at,
  p.revived_by,
  rs.fullname AS revived_by_staff_name,
  p.revival_reason,
  TIMESTAMPDIFF(YEAR, p.date_of_birth, p.date_of_death) AS age_at_death,
  DATEDIFF(p.date_of_death, p.date_of_birth) AS days_lived
FROM `Patients` p
LEFT JOIN `Staff` s ON p.marked_deceased_by = s.id
LEFT JOIN `Staff` rs ON p.revived_by = rs.id
WHERE p.patient_status = 'Deceased';

-- View for death statistics
CREATE OR REPLACE VIEW `death_statistics_view` AS
SELECT 
  DATE_FORMAT(date_of_death, '%Y-%m') AS death_month,
  COUNT(*) AS total_deaths,
  AVG(TIMESTAMPDIFF(YEAR, date_of_birth, date_of_death)) AS average_age,
  COUNT(CASE WHEN gender = 'Male' THEN 1 END) AS male_deaths,
  COUNT(CASE WHEN gender = 'Female' THEN 1 END) AS female_deaths,
  COUNT(CASE WHEN cause_of_death IS NOT NULL THEN 1 END) AS deaths_with_cause,
  COUNT(CASE WHEN death_certificate_number IS NOT NULL THEN 1 END) AS certificates_generated
FROM `Patients`
WHERE patient_status = 'Deceased' 
  AND date_of_death IS NOT NULL
GROUP BY DATE_FORMAT(date_of_death, '%Y-%m')
ORDER BY death_month DESC;

-- =====================================================
-- 8. INSERT SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Note: Uncomment the following section if you want to insert sample data for testing

/*
-- Insert sample deceased patient for testing
INSERT INTO `Patients` (
  firstname, lastname, gender, phone, address, date_of_birth,
  patient_status, date_of_death, cause_of_death, death_certificate_number,
  marked_deceased_by, marked_deceased_at
) VALUES (
  'Test', 'Deceased', 'Male', '+1234567890', 'Test Address', '1980-01-01',
  'Deceased', '2025-01-28 10:00:00', 'Natural causes', 'DC-TEST-001',
  1, '2025-01-28 10:00:00'
);
*/

-- =====================================================
-- 9. VERIFY MIGRATION
-- =====================================================

-- Check that all columns were added successfully
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
  )
ORDER BY ORDINAL_POSITION;

-- Check that indexes were created
SHOW INDEX FROM `Patients` WHERE Key_name LIKE 'IDX_Patients_%';

-- Check that foreign keys were created
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
-- 10. COMMIT TRANSACTION
-- =====================================================

COMMIT;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- 
-- This migration has successfully:
-- 1. Added all deceased patient management fields
-- 2. Created necessary foreign key constraints
-- 3. Added performance indexes
-- 4. Created audit trail table
-- 5. Created reporting views
-- 6. Verified the migration
-- 
-- The deceased patient management system is now ready for use.
-- =====================================================
