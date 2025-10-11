-- ========================================
-- CREATE COMBO TESTS TABLES
-- ========================================
-- This script creates the Combo_Tests and Combo_Test_Items tables
-- for managing laboratory test combinations
--
-- Database: MySQL/MariaDB
-- ========================================

-- ========================================
-- 1. CREATE COMBO_TESTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `Combo_Tests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `staff_id` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_combo_tests_name` (`name`),
  INDEX `idx_combo_tests_is_active` (`is_active`),
  INDEX `idx_combo_tests_staff_id` (`staff_id`),
  CONSTRAINT `fk_combo_tests_staff`
    FOREIGN KEY (`staff_id`)
    REFERENCES `Staff` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 2. CREATE COMBO_TEST_ITEMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `Combo_Test_Items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `combo_test_id` INT NOT NULL,
  `test_id` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_combo_test_items_combo_test_id` (`combo_test_id`),
  INDEX `idx_combo_test_items_test_id` (`test_id`),
  UNIQUE KEY `unique_combo_test_item` (`combo_test_id`, `test_id`),
  CONSTRAINT `fk_combo_test_items_combo_test`
    FOREIGN KEY (`combo_test_id`)
    REFERENCES `Combo_Tests` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_combo_test_items_test`
    FOREIGN KEY (`test_id`)
    REFERENCES `Tests` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if tables were created successfully
SHOW TABLES LIKE 'Combo_%';

-- Describe Combo_Tests table structure
DESCRIBE Combo_Tests;

-- Describe Combo_Test_Items table structure
DESCRIBE Combo_Test_Items;

-- Show indexes on Combo_Tests
SHOW INDEX FROM Combo_Tests;

-- Show indexes on Combo_Test_Items
SHOW INDEX FROM Combo_Test_Items;

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
  AND TABLE_NAME IN ('Combo_Tests', 'Combo_Test_Items')
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- ========================================
-- NOTES
-- ========================================
-- 1. This script creates tables with the following features:
--    - Auto-incrementing primary keys
--    - Timestamps (createdAt, updatedAt)
--    - Foreign key constraints
--    - Unique constraint on combo_test_id + test_id
--    - Indexes for performance
--
-- 2. Foreign Keys:
--    - Combo_Tests.staff_id -> Staff.id (RESTRICT on delete)
--    - Combo_Test_Items.combo_test_id -> Combo_Tests.id (CASCADE on delete)
--    - Combo_Test_Items.test_id -> Tests.id (CASCADE on delete)
--
-- 3. The unique constraint on Combo_Test_Items prevents duplicate
--    test_id entries within the same combo_test_id
--
-- 4. CASCADE delete ensures that when a combo test is deleted,
--    all its items are automatically deleted
--
-- ========================================
-- DROP TABLES (if needed)
-- ========================================
-- Uncomment the lines below to drop the tables
-- WARNING: This will delete all data!

-- DROP TABLE IF EXISTS `Combo_Test_Items`;
-- DROP TABLE IF EXISTS `Combo_Tests`;
