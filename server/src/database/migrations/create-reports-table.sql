-- Create Reports table for storing saved reports
-- This table stores metadata about saved reports including filters, date ranges, and creator information

CREATE TABLE IF NOT EXISTS `Reports` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `domain` ENUM('medical-records', 'pharmacy', 'laboratory', 'accounting') NOT NULL,
  `report_type` VARCHAR(255) NOT NULL,
  `date_range_start` DATETIME NULL,
  `date_range_end` DATETIME NULL,
  `filters` JSON NULL,
  `created_by` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_domain` (`domain`),
  INDEX `idx_report_type` (`report_type`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_created_at` (`createdAt`),
  CONSTRAINT `fk_reports_created_by`
    FOREIGN KEY (`created_by`)
    REFERENCES `Staffs` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

