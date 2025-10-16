-- ============================================================================
-- MEASUREMENT-DOSAGE FORM MANY-TO-MANY MIGRATION
-- Complete SQL Script for Manual Execution
-- ============================================================================
-- This script converts the Measurement-DosageForm relationship from 
-- one-to-many to many-to-many by creating a junction table.
--
-- IMPORTANT: 
-- - Backup your database before running this script
-- - Review each section before execution
-- - Verify data after each major step
-- ============================================================================

-- ============================================================================
-- STEP 1: PRE-MIGRATION VERIFICATION
-- ============================================================================

-- Check current measurements with dosage forms
SELECT 
  COUNT(*) as total_measurements,
  COUNT(dosage_form_id) as measurements_with_dosage_form
FROM Measurements;

-- View sample of current data structure
SELECT 
  m.id,
  m.name,
  m.dosage_form_id,
  df.name as dosage_form_name
FROM Measurements m
LEFT JOIN Dosage_Forms df ON m.dosage_form_id = df.id
LIMIT 10;

-- ============================================================================
-- STEP 2: CREATE JUNCTION TABLE
-- ============================================================================

-- Create Measurement_Dosage_Forms junction table
CREATE TABLE IF NOT EXISTS `Measurement_Dosage_Forms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `measurement_id` int(11) NOT NULL,
  `dosage_form_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_measurement_dosage_form` (`measurement_id`, `dosage_form_id`),
  KEY `measurement_dosage_forms_measurement_id_index` (`measurement_id`),
  KEY `measurement_dosage_forms_dosage_form_id_index` (`dosage_form_id`),
  CONSTRAINT `measurement_dosage_forms_measurement_fk` 
    FOREIGN KEY (`measurement_id`) 
    REFERENCES `Measurements` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `measurement_dosage_forms_dosage_form_fk` 
    FOREIGN KEY (`dosage_form_id`) 
    REFERENCES `Dosage_Forms` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Verify table creation
SHOW CREATE TABLE Measurement_Dosage_Forms;

-- ============================================================================
-- STEP 3: MIGRATE EXISTING DATA
-- ============================================================================

-- Copy all existing measurement-dosage relationships to junction table
INSERT INTO Measurement_Dosage_Forms (measurement_id, dosage_form_id, createdAt, updatedAt)
SELECT id, dosage_form_id, createdAt, updatedAt 
FROM Measurements 
WHERE dosage_form_id IS NOT NULL;

-- Verify migration success
SELECT 
  (SELECT COUNT(*) FROM Measurements WHERE dosage_form_id IS NOT NULL) as original_count,
  (SELECT COUNT(*) FROM Measurement_Dosage_Forms) as migrated_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM Measurements WHERE dosage_form_id IS NOT NULL) = 
         (SELECT COUNT(*) FROM Measurement_Dosage_Forms)
    THEN 'SUCCESS: Counts match'
    ELSE 'ERROR: Count mismatch!'
  END as verification_status;

-- ============================================================================
-- STEP 4: VERIFY DATA INTEGRITY
-- ============================================================================

-- Check for any measurements that didn't migrate properly
SELECT 
  m.id,
  m.name,
  m.dosage_form_id as old_dosage_form_id,
  GROUP_CONCAT(mdf.dosage_form_id) as new_dosage_form_ids
FROM Measurements m
LEFT JOIN Measurement_Dosage_Forms mdf ON m.id = mdf.measurement_id
WHERE m.dosage_form_id IS NOT NULL
GROUP BY m.id, m.name, m.dosage_form_id
HAVING COUNT(mdf.id) = 0;
-- This should return 0 rows

-- View migrated data with names
SELECT 
  m.id,
  m.name as measurement_name,
  GROUP_CONCAT(df.name ORDER BY df.name SEPARATOR ', ') as dosage_forms
FROM Measurements m
INNER JOIN Measurement_Dosage_Forms mdf ON m.id = mdf.measurement_id
INNER JOIN Dosage_Forms df ON mdf.dosage_form_id = df.id
GROUP BY m.id, m.name
ORDER BY m.name;

-- ============================================================================
-- STEP 5: REMOVE OLD FOREIGN KEY COLUMN
-- ============================================================================
-- ONLY RUN THIS AFTER VERIFYING STEP 4 IS SUCCESSFUL!
-- ============================================================================

-- Drop foreign key constraint
ALTER TABLE Measurements 
DROP FOREIGN KEY IF EXISTS Measurements_ibfk_1;

-- Drop index
ALTER TABLE Measurements 
DROP INDEX IF EXISTS dosage_form_id;

-- Remove the column
ALTER TABLE Measurements 
DROP COLUMN dosage_form_id;

-- Verify column removal
DESCRIBE Measurements;

-- ============================================================================
-- STEP 6: POST-MIGRATION VERIFICATION
-- ============================================================================

-- Verify new structure works correctly
SELECT 
  m.id,
  m.name,
  m.staff_id,
  GROUP_CONCAT(df.name ORDER BY df.name SEPARATOR ', ') as dosage_forms,
  COUNT(mdf.id) as dosage_form_count
FROM Measurements m
LEFT JOIN Measurement_Dosage_Forms mdf ON m.id = mdf.measurement_id
LEFT JOIN Dosage_Forms df ON mdf.dosage_form_id = df.id
GROUP BY m.id, m.name, m.staff_id
ORDER BY m.name;

-- Count statistics
SELECT 
  COUNT(DISTINCT m.id) as total_measurements,
  COUNT(DISTINCT mdf.id) as total_associations,
  AVG(dosage_count) as avg_dosage_forms_per_measurement
FROM Measurements m
LEFT JOIN (
  SELECT measurement_id, COUNT(*) as dosage_count
  FROM Measurement_Dosage_Forms
  GROUP BY measurement_id
) mdf ON m.id = mdf.measurement_id;

-- ============================================================================
-- ROLLBACK PROCEDURES (IF NEEDED)
-- ============================================================================
-- ONLY USE THESE IF YOU NEED TO UNDO THE MIGRATION!
-- ============================================================================

/*
-- Rollback Step 1: Add back the dosage_form_id column
ALTER TABLE Measurements 
ADD COLUMN dosage_form_id int(11) DEFAULT NULL AFTER name,
ADD CONSTRAINT Measurements_ibfk_1 
  FOREIGN KEY (dosage_form_id) 
  REFERENCES Dosage_Forms(id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- Rollback Step 2: Restore data from junction table (first association only)
UPDATE Measurements m
INNER JOIN (
  SELECT measurement_id, MIN(dosage_form_id) as dosage_form_id
  FROM Measurement_Dosage_Forms
  GROUP BY measurement_id
) mdf ON m.id = mdf.measurement_id
SET m.dosage_form_id = mdf.dosage_form_id;

-- Rollback Step 3: Verify restoration
SELECT 
  m.id,
  m.name,
  m.dosage_form_id,
  df.name as dosage_form_name
FROM Measurements m
LEFT JOIN Dosage_Forms df ON m.dosage_form_id = df.id
ORDER BY m.name;

-- Rollback Step 4: Drop junction table
DROP TABLE IF EXISTS Measurement_Dosage_Forms;
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

SELECT 'Migration completed successfully!' as status;
SELECT NOW() as completion_time;

