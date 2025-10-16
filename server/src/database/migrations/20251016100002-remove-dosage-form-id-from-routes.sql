-- Migration: Remove dosage_form_id column from Route_of_Administrations table
-- Date: 2025-10-16
-- Description: Removes the old dosage_form_id foreign key column after data has been migrated to the junction table
-- IMPORTANT: Only run this migration AFTER verifying the previous migration was successful

-- Verify data has been migrated (check counts match)
-- Run this before executing the migration:
-- SELECT 
--   (SELECT COUNT(*) FROM Route_of_Administrations WHERE dosage_form_id IS NOT NULL) AS routes_with_dosage,
--   (SELECT COUNT(*) FROM Route_Dosage_Forms) AS junction_records;

-- If counts match, proceed with the migration:

-- Step 1: Drop the foreign key constraint (if it exists)
-- The constraint name may vary, so we'll try the common names
SET @constraint_name = (
  SELECT CONSTRAINT_NAME 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Route_of_Administrations' 
    AND COLUMN_NAME = 'dosage_form_id'
    AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1
);

SET @drop_fk_query = IF(@constraint_name IS NOT NULL,
  CONCAT('ALTER TABLE `Route_of_Administrations` DROP FOREIGN KEY `', @constraint_name, '`;'),
  'SELECT "No foreign key constraint found" AS message;'
);

PREPARE stmt FROM @drop_fk_query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Drop the index on dosage_form_id (if it exists)
SET @index_name = (
  SELECT INDEX_NAME 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Route_of_Administrations' 
    AND COLUMN_NAME = 'dosage_form_id'
    AND INDEX_NAME != 'PRIMARY'
  LIMIT 1
);

SET @drop_index_query = IF(@index_name IS NOT NULL,
  CONCAT('ALTER TABLE `Route_of_Administrations` DROP INDEX `', @index_name, '`;'),
  'SELECT "No index found" AS message;'
);

PREPARE stmt FROM @drop_index_query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Drop the dosage_form_id column
ALTER TABLE `Route_of_Administrations` DROP COLUMN `dosage_form_id`;

-- Rollback script (uncomment to rollback)
-- WARNING: This will restore the column but data will need to be manually restored
-- ALTER TABLE `Route_of_Administrations` 
--   ADD COLUMN `dosage_form_id` INT NULL AFTER `name`,
--   ADD INDEX `route_dosage_form_idx` (`dosage_form_id`),
--   ADD CONSTRAINT `route_dosage_form_fk` 
--     FOREIGN KEY (`dosage_form_id`) 
--     REFERENCES `Dosage_Forms` (`id`) 
--     ON DELETE SET NULL 
--     ON UPDATE CASCADE;

-- Restore data from junction table (only first association per route)
-- UPDATE Route_of_Administrations r
-- INNER JOIN (
--   SELECT route_id, MIN(dosage_form_id) as dosage_form_id
--   FROM Route_Dosage_Forms
--   GROUP BY route_id
-- ) rdf ON r.id = rdf.route_id
-- SET r.dosage_form_id = rdf.dosage_form_id;

