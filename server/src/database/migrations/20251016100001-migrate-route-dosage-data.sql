-- Migration: Migrate existing route-dosage form associations to junction table
-- Date: 2025-10-16
-- Description: Copies all existing route-dosage form relationships from the old one-to-many structure to the new many-to-many junction table

-- Insert existing associations into the junction table
INSERT INTO `Route_Dosage_Forms` (`route_id`, `dosage_form_id`, `createdAt`, `updatedAt`)
SELECT 
  `id` AS `route_id`,
  `dosage_form_id`,
  NOW() AS `createdAt`,
  NOW() AS `updatedAt`
FROM `Route_of_Administrations`
WHERE `dosage_form_id` IS NOT NULL
ON DUPLICATE KEY UPDATE `updatedAt` = NOW();

-- Verify migration count
-- Run this query to verify the migration was successful:
-- SELECT 
--   (SELECT COUNT(*) FROM Route_of_Administrations WHERE dosage_form_id IS NOT NULL) AS original_count,
--   (SELECT COUNT(*) FROM Route_Dosage_Forms) AS migrated_count;

-- The counts should match

-- Rollback script (uncomment to rollback)
-- TRUNCATE TABLE `Route_Dosage_Forms`;

