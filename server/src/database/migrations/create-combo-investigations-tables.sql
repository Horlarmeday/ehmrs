-- ========================================
-- CREATE COMBO INVESTIGATIONS TABLES
-- ========================================
-- This script creates the Combo_Investigations and Combo_Investigation_Items tables
-- for managing radiology investigation combinations
--
-- Database: MySQL/MariaDB
-- ========================================

-- ========================================
-- 1. CREATE COMBO_INVESTIGATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `Combo_Investigations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `staff_id` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_combo_investigations_name` (`name`),
  INDEX `idx_combo_investigations_is_active` (`is_active`),
  INDEX `idx_combo_investigations_staff_id` (`staff_id`),
  CONSTRAINT `fk_combo_investigations_staff`
    FOREIGN KEY (`staff_id`)
    REFERENCES `Staff` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 2. CREATE COMBO_INVESTIGATION_ITEMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `Combo_Investigation_Items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `combo_investigation_id` INT NOT NULL,
  `investigation_id` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_combo_investigation_items_combo_investigation_id` (`combo_investigation_id`),
  INDEX `idx_combo_investigation_items_investigation_id` (`investigation_id`),
  UNIQUE KEY `unique_combo_investigation_item` (`combo_investigation_id`, `investigation_id`),
  CONSTRAINT `fk_combo_investigation_items_combo_investigation`
    FOREIGN KEY (`combo_investigation_id`)
    REFERENCES `Combo_Investigations` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_combo_investigation_items_investigation`
    FOREIGN KEY (`investigation_id`)
    REFERENCES `Investigations` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if tables were created successfully
SHOW TABLES LIKE 'Combo_Investigation%';

-- Describe Combo_Investigations table structure
DESCRIBE Combo_Investigations;

-- Describe Combo_Investigation_Items table structure
DESCRIBE Combo_Investigation_Items;

-- Show indexes on Combo_Investigations
SHOW INDEX FROM Combo_Investigations;

-- Show indexes on Combo_Investigation_Items
SHOW INDEX FROM Combo_Investigation_Items;

-- Show foreign key constraints
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM
  INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
  TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('Combo_Investigations', 'Combo_Investigation_Items')
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- ========================================
-- NOTES
-- ========================================
-- 1. This script creates tables with the following features:
--    - Auto-incrementing primary keys
--    - Timestamps (createdAt, updatedAt)
--    - Foreign key constraints
--    - Unique constraint on combo_investigation_id + investigation_id
--    - Indexes for performance
--
-- 2. Foreign Keys:
--    - Combo_Investigations.staff_id -> Staff.id (RESTRICT on delete)
--    - Combo_Investigation_Items.combo_investigation_id -> Combo_Investigations.id (CASCADE on delete)
--    - Combo_Investigation_Items.investigation_id -> Investigations.id (RESTRICT on delete)
--
-- 3. The unique constraint on Combo_Investigation_Items prevents duplicate
--    investigation_id entries within the same combo_investigation_id
--
-- 4. CASCADE delete ensures that when a combo investigation is deleted,
--    all its items are automatically deleted
--
-- 5. RESTRICT on investigation_id prevents deletion of investigations
--    that are part of combo investigations
--
-- ========================================
-- DROP TABLES (if needed)
-- ========================================
-- Uncomment the lines below to drop the tables
-- WARNING: This will delete all data!

-- DROP TABLE IF EXISTS `Combo_Investigation_Items`;
-- DROP TABLE IF EXISTS `Combo_Investigations`;
