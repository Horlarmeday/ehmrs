-- ========================================
-- COMPLETE COMBO TESTS SETUP
-- ========================================
-- This script creates tables AND seeds combo tests in one go
-- Database: MySQL/MariaDB
--
-- PREREQUISITES:
-- 1. Staff table must exist with at least one staff member
-- 2. Tests table must be populated with individual tests
--
-- BEFORE RUNNING:
-- Replace @staff_id with a valid staff ID
-- ========================================

-- Set staff ID (REPLACE WITH ACTUAL STAFF ID)
SET @staff_id = 1;

-- ========================================
-- STEP 1: CREATE TABLES
-- ========================================

-- Create Combo_Tests table
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

-- Create Combo_Test_Items table
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

SELECT 'Tables created successfully!' as Status;

-- ========================================
-- STEP 2: SEED COMBO TESTS
-- ========================================

-- 1. Full Blood Count (FBC)
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Full Blood Count (FBC)', true, @staff_id, NOW(), NOW());
SET @fbc_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @fbc_id, id, NOW(), NOW()
FROM Tests
WHERE name IN ('Hemoglobin', 'White Blood Cell Count', 'WBC Count', 'Platelet Count',
               'Red Blood Cell Count', 'RBC Count', 'Hematocrit', 'MCV')
AND id IS NOT NULL;

-- 2. Lipid Profile
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Lipid Profile', true, @staff_id, NOW(), NOW());
SET @lipid_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @lipid_id, id, NOW(), NOW()
FROM Tests
WHERE name IN ('Total Cholesterol', 'Cholesterol', 'HDL Cholesterol', 'HDL',
               'LDL Cholesterol', 'LDL', 'Triglycerides')
AND id IS NOT NULL;

-- 3. Liver Function Tests (LFT)
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Liver Function Tests (LFT)', true, @staff_id, NOW(), NOW());
SET @lft_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @lft_id, id, NOW(), NOW()
FROM Tests
WHERE name IN ('ALT', 'Alanine Aminotransferase', 'AST', 'Aspartate Aminotransferase',
               'ALP', 'Alkaline Phosphatase', 'Total Bilirubin', 'Bilirubin',
               'Direct Bilirubin', 'Albumin', 'Total Protein')
AND id IS NOT NULL;

-- 4. Renal Function Tests (RFT)
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Renal Function Tests (RFT)', true, @staff_id, NOW(), NOW());
SET @rft_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @rft_id, id, NOW(), NOW()
FROM Tests
WHERE name IN ('Creatinine', 'Serum Creatinine', 'Urea', 'Blood Urea', 'BUN',
               'Sodium', 'Serum Sodium', 'Potassium', 'Serum Potassium',
               'Chloride', 'Serum Chloride')
AND id IS NOT NULL;

-- 5. Thyroid Function Tests (TFT)
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Thyroid Function Tests (TFT)', true, @staff_id, NOW(), NOW());
SET @tft_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @tft_id, id, NOW(), NOW()
FROM Tests
WHERE name IN ('TSH', 'Thyroid Stimulating Hormone', 'T3', 'Triiodothyronine',
               'Free T3', 'T4', 'Thyroxine', 'Free T4')
AND id IS NOT NULL;

-- 6. Basic Metabolic Panel (BMP)
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Basic Metabolic Panel (BMP)', true, @staff_id, NOW(), NOW());
SET @bmp_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @bmp_id, id, NOW(), NOW()
FROM Tests
WHERE name IN ('Glucose', 'Blood Glucose', 'FBS', 'Creatinine', 'Urea',
               'Sodium', 'Potassium', 'Chloride', 'Bicarbonate', 'HCO3',
               'Calcium', 'Serum Calcium')
AND id IS NOT NULL;

-- 7. Diabetes Screening
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Diabetes Screening', true, @staff_id, NOW(), NOW());
SET @diabetes_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @diabetes_id, id, NOW(), NOW()
FROM Tests
WHERE name IN ('Glucose', 'Blood Glucose', 'Fasting Blood Sugar', 'FBS',
               'HbA1c', 'Glycated Hemoglobin', 'Random Blood Sugar', 'RBS')
AND id IS NOT NULL;

-- 8. Antenatal Booking Tests
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Antenatal Booking Tests', true, @staff_id, NOW(), NOW());
SET @antenatal_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @antenatal_id, id, NOW(), NOW()
FROM Tests
WHERE name IN ('Hemoglobin', 'Blood Group', 'ABO Blood Group', 'Rhesus Factor',
               'Rh Factor', 'VDRL', 'Syphilis Test', 'Hepatitis B Surface Antigen',
               'HBsAg', 'HIV Test', 'HIV Screening', 'Urine Routine', 'Urine R/E', 'Urinalysis')
AND id IS NOT NULL;

-- 9. Pre-Operative Screening
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Pre-Operative Screening', true, @staff_id, NOW(), NOW());
SET @preop_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @preop_id, id, NOW(), NOW()
FROM Tests
WHERE name IN ('Hemoglobin', 'WBC Count', 'Platelet Count', 'Blood Group',
               'Rhesus Factor', 'PT', 'Prothrombin Time', 'INR', 'PTT',
               'Partial Thromboplastin Time', 'APTT', 'Creatinine', 'Glucose')
AND id IS NOT NULL;

-- 10. Electrolytes
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Electrolytes', true, @staff_id, NOW(), NOW());
SET @electrolytes_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @electrolytes_id, id, NOW(), NOW()
FROM Tests
WHERE name IN ('Sodium', 'Serum Sodium', 'Potassium', 'Serum Potassium',
               'Chloride', 'Serum Chloride', 'Bicarbonate', 'HCO3')
AND id IS NOT NULL;

SELECT 'Combo tests seeded successfully!' as Status;

-- ========================================
-- STEP 3: VERIFICATION
-- ========================================

-- Check created combo tests with test counts
SELECT
  ct.id,
  ct.name,
  COUNT(cti.id) as test_count,
  ct.is_active,
  ct.createdAt
FROM Combo_Tests ct
LEFT JOIN Combo_Test_Items cti ON ct.id = cti.combo_test_id
GROUP BY ct.id
ORDER BY ct.createdAt DESC;

-- Check combos with no items (need attention)
SELECT
  ct.id,
  ct.name,
  'NO TESTS FOUND - Check test names in your Tests table' as warning
FROM Combo_Tests ct
LEFT JOIN Combo_Test_Items cti ON ct.id = cti.combo_test_id
GROUP BY ct.id
HAVING COUNT(cti.id) = 0;

-- Show detailed breakdown with prices
SELECT
  ct.name as combo_name,
  COUNT(cti.id) as test_count,
  SUM(t.price) as total_price
FROM Combo_Tests ct
LEFT JOIN Combo_Test_Items cti ON ct.id = cti.combo_test_id
LEFT JOIN Tests t ON cti.test_id = t.id
GROUP BY ct.id
ORDER BY combo_name;

-- ========================================
-- USAGE INSTRUCTIONS
-- ========================================
-- 1. Update @staff_id at the top of this script
-- 2. Run the entire script:
--    mysql -u username -p database_name < combo-tests-complete-setup.sql
--
-- 3. Check the output to see:
--    - Tables created successfully
--    - Combo tests seeded successfully
--    - List of created combos with test counts
--    - Any combos with no tests (need attention)
--
-- 4. If some combos have no tests, check your Tests table
--    and adjust test names in the INSERT statements above
-- ========================================
