-- Migration: Create Route_Dosage_Forms junction table for many-to-many relationship
-- Date: 2025-10-16
-- Description: Creates the junction table to support many-to-many relationship between routes and dosage forms

-- Create the junction table
CREATE TABLE IF NOT EXISTS `Route_Dosage_Forms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `route_id` INT NOT NULL,
  `dosage_form_id` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_route_dosage_form` (`route_id`, `dosage_form_id`),
  KEY `route_dosage_forms_route_id_index` (`route_id`),
  KEY `route_dosage_forms_dosage_form_id_index` (`dosage_form_id`),
  CONSTRAINT `route_dosage_forms_route_fk` 
    FOREIGN KEY (`route_id`) 
    REFERENCES `Route_of_Administrations` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `route_dosage_forms_dosage_form_fk` 
    FOREIGN KEY (`dosage_form_id`) 
    REFERENCES `Dosage_Forms` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rollback script (uncomment to rollback)
-- DROP TABLE IF EXISTS `Route_Dosage_Forms`;

