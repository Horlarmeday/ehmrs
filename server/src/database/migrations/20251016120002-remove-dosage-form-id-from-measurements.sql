-- Remove dosage_form_id column from Measurements table
-- This should only be run AFTER verifying successful data migration

-- Step 1: Verify data migration was successful
-- Check that junction table has same number of records as measurements with dosage_form_id
SET @constraint_name = (
    SELECT CONSTRAINT_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Measurements'
      AND COLUMN_NAME = 'dosage_form_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

SET @drop_fk_query = IF(@constraint_name IS NOT NULL,
                        CONCAT('ALTER TABLE `Measurements` DROP FOREIGN KEY `', @constraint_name, '`;'),
                        'SELECT "No foreign key constraint found" AS message;'
                     );

PREPARE stmt FROM @drop_fk_query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Verify no orphaned data
SET @index_name = (
    SELECT INDEX_NAME
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Measurements'
      AND COLUMN_NAME = 'dosage_form_id'
      AND INDEX_NAME != 'PRIMARY'
    LIMIT 1
);

SET @drop_index_query = IF(@index_name IS NOT NULL,
                           CONCAT('ALTER TABLE `Measurements` DROP INDEX `', @index_name, '`;'),
                           'SELECT "No index found" AS message;'
                        );

PREPARE stmt FROM @drop_index_query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Remove column
ALTER TABLE Measurements
    DROP COLUMN dosage_form_id;

-- Step 6: Verify column removed
DESCRIBE Measurements;

-- Rollback procedure (if needed)
-- Add back the column
-- ALTER TABLE Measurements
-- ADD COLUMN dosage_form_id int(11) DEFAULT NULL,
-- ADD CONSTRAINT Measurements_ibfk_1 FOREIGN KEY (dosage_form_id) REFERENCES Dosage_Forms(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Restore first association from junction table
-- UPDATE Measurements m
-- INNER JOIN (
--   SELECT measurement_id, MIN(dosage_form_id) as dosage_form_id
--   FROM Measurement_Dosage_Forms
--   GROUP BY measurement_id
-- ) mdf ON m.id = mdf.measurement_id
-- SET m.dosage_form_id = mdf.dosage_form_id;

