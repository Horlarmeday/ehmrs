-- Migration: Create DoctorReports table
-- Date: 2025-10-16
-- Description: Create table for storing doctor reports for patient visits

-- Create DoctorReports table
CREATE TABLE IF NOT EXISTS `DoctorReports` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `visit_id` INT NOT NULL,
  `patient_id` INT NOT NULL,
  `staff_id` INT NOT NULL,
  `report_content` TEXT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_visit_id` (`visit_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_staff_id` (`staff_id`),
  CONSTRAINT `fk_doctor_reports_visit`
    FOREIGN KEY (`visit_id`)
    REFERENCES `Visits` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_doctor_reports_patient`
    FOREIGN KEY (`patient_id`)
    REFERENCES `Patients` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_doctor_reports_staff`
    FOREIGN KEY (`staff_id`)
    REFERENCES `Staff` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to table
ALTER TABLE `DoctorReports` COMMENT = 'Stores comprehensive doctor reports for patient visits';

-- Rollback script (run this to undo the migration)
-- DROP TABLE IF EXISTS `DoctorReports`;

