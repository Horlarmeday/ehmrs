-- ========================================
-- DYNAMIC COMBO TESTS SEED SCRIPT
-- ========================================
-- This script dynamically creates combo tests by looking up test IDs by name
-- This approach is more flexible and doesn't require manual ID replacement
--
-- PREREQUISITES:
-- 1. Tests table must be populated with individual tests
-- 2. Replace @staff_id with a valid staff ID
-- 3. Adjust test names to match your Tests table naming convention
-- ========================================

-- Set staff ID (REPLACE WITH ACTUAL STAFF ID)
SET @staff_id = 1;

-- ========================================
-- 1. FULL BLOOD COUNT (FBC) COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Full Blood Count (FBC)', true, @staff_id, NOW(), NOW());

SET @fbc_combo_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @fbc_combo_id, id, NOW(), NOW()
FROM Tests
WHERE name IN (
  'Hemoglobin',
  'White Blood Cell Count',
  'WBC Count',
  'Platelet Count',
  'Red Blood Cell Count',
  'RBC Count',
  'Hematocrit',
  'Mean Corpuscular Volume',
  'MCV'
)
AND id IS NOT NULL;

-- ========================================
-- 2. LIPID PROFILE COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Lipid Profile', true, @staff_id, NOW(), NOW());

SET @lipid_combo_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @lipid_combo_id, id, NOW(), NOW()
FROM Tests
WHERE name IN (
  'Total Cholesterol',
  'Cholesterol',
  'HDL Cholesterol',
  'HDL',
  'LDL Cholesterol',
  'LDL',
  'Triglycerides'
)
AND id IS NOT NULL;

-- ========================================
-- 3. LIVER FUNCTION TESTS (LFT) COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Liver Function Tests (LFT)', true, @staff_id, NOW(), NOW());

SET @lft_combo_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @lft_combo_id, id, NOW(), NOW()
FROM Tests
WHERE name IN (
  'ALT',
  'Alanine Aminotransferase',
  'AST',
  'Aspartate Aminotransferase',
  'ALP',
  'Alkaline Phosphatase',
  'Total Bilirubin',
  'Bilirubin',
  'Direct Bilirubin',
  'Albumin',
  'Total Protein'
)
AND id IS NOT NULL;

-- ========================================
-- 4. RENAL FUNCTION TESTS (RFT) COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Renal Function Tests (RFT)', true, @staff_id, NOW(), NOW());

SET @rft_combo_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @rft_combo_id, id, NOW(), NOW()
FROM Tests
WHERE name IN (
  'Creatinine',
  'Serum Creatinine',
  'Urea',
  'Blood Urea',
  'BUN',
  'Sodium',
  'Serum Sodium',
  'Potassium',
  'Serum Potassium',
  'Chloride',
  'Serum Chloride'
)
AND id IS NOT NULL;

-- ========================================
-- 5. THYROID FUNCTION TESTS (TFT) COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Thyroid Function Tests (TFT)', true, @staff_id, NOW(), NOW());

SET @tft_combo_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @tft_combo_id, id, NOW(), NOW()
FROM Tests
WHERE name IN (
  'TSH',
  'Thyroid Stimulating Hormone',
  'T3',
  'Triiodothyronine',
  'Free T3',
  'T4',
  'Thyroxine',
  'Free T4'
)
AND id IS NOT NULL;

-- ========================================
-- 6. BASIC METABOLIC PANEL (BMP) COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Basic Metabolic Panel (BMP)', true, @staff_id, NOW(), NOW());

SET @bmp_combo_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @bmp_combo_id, id, NOW(), NOW()
FROM Tests
WHERE name IN (
  'Glucose',
  'Blood Glucose',
  'Fasting Blood Sugar',
  'FBS',
  'Creatinine',
  'Urea',
  'Sodium',
  'Potassium',
  'Chloride',
  'Bicarbonate',
  'HCO3',
  'Calcium',
  'Serum Calcium'
)
AND id IS NOT NULL;

-- ========================================
-- 7. DIABETES SCREENING COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Diabetes Screening', true, @staff_id, NOW(), NOW());

SET @diabetes_combo_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @diabetes_combo_id, id, NOW(), NOW()
FROM Tests
WHERE name IN (
  'Glucose',
  'Blood Glucose',
  'Fasting Blood Sugar',
  'FBS',
  'HbA1c',
  'Glycated Hemoglobin',
  'Random Blood Sugar',
  'RBS'
)
AND id IS NOT NULL;

-- ========================================
-- 8. ANTENATAL BOOKING COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Antenatal Booking Tests', true, @staff_id, NOW(), NOW());

SET @antenatal_combo_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @antenatal_combo_id, id, NOW(), NOW()
FROM Tests
WHERE name IN (
  'Hemoglobin',
  'Blood Group',
  'ABO Blood Group',
  'Rhesus Factor',
  'Rh Factor',
  'VDRL',
  'Syphilis Test',
  'Hepatitis B Surface Antigen',
  'HBsAg',
  'HIV Test',
  'HIV Screening',
  'Urine Routine',
  'Urine R/E',
  'Urinalysis'
)
AND id IS NOT NULL;

-- ========================================
-- 9. PRE-OPERATIVE SCREENING COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Pre-Operative Screening', true, @staff_id, NOW(), NOW());

SET @preop_combo_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @preop_combo_id, id, NOW(), NOW()
FROM Tests
WHERE name IN (
  'Hemoglobin',
  'White Blood Cell Count',
  'WBC Count',
  'Platelet Count',
  'Blood Group',
  'Rhesus Factor',
  'PT',
  'Prothrombin Time',
  'INR',
  'PTT',
  'Partial Thromboplastin Time',
  'APTT',
  'Creatinine',
  'Glucose',
  'Chest X-Ray'
)
AND id IS NOT NULL;

-- ========================================
-- 10. ELECTROLYTES COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Electrolytes', true, @staff_id, NOW(), NOW());

SET @electrolytes_combo_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @electrolytes_combo_id, id, NOW(), NOW()
FROM Tests
WHERE name IN (
  'Sodium',
  'Serum Sodium',
  'Potassium',
  'Serum Potassium',
  'Chloride',
  'Serum Chloride',
  'Bicarbonate',
  'HCO3'
)
AND id IS NOT NULL;

-- ========================================
-- 11. CARDIAC MARKERS COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Cardiac Markers', true, @staff_id, NOW(), NOW());

SET @cardiac_combo_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @cardiac_combo_id, id, NOW(), NOW()
FROM Tests
WHERE name IN (
  'Troponin I',
  'Troponin T',
  'CK-MB',
  'Creatine Kinase MB',
  'BNP',
  'Brain Natriuretic Peptide',
  'CK',
  'Creatine Kinase'
)
AND id IS NOT NULL;

-- ========================================
-- 12. COMPLETE METABOLIC PANEL (CMP) COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Complete Metabolic Panel (CMP)', true, @staff_id, NOW(), NOW());

SET @cmp_combo_id = LAST_INSERT_ID();

INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @cmp_combo_id, id, NOW(), NOW()
FROM Tests
WHERE name IN (
  'Glucose',
  'Creatinine',
  'Urea',
  'Sodium',
  'Potassium',
  'Chloride',
  'Bicarbonate',
  'Calcium',
  'Total Protein',
  'Albumin',
  'Total Bilirubin',
  'ALP',
  'ALT',
  'AST'
)
AND id IS NOT NULL;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check all created combo tests
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

-- Check combo tests with no items (these need attention)
SELECT
  ct.id,
  ct.name,
  COUNT(cti.id) as test_count
FROM Combo_Tests ct
LEFT JOIN Combo_Test_Items cti ON ct.id = cti.combo_test_id
GROUP BY ct.id
HAVING COUNT(cti.id) = 0;

-- View detailed combo test breakdown
SELECT
  ct.id as combo_id,
  ct.name as combo_name,
  t.id as test_id,
  t.name as test_name,
  t.price
FROM Combo_Tests ct
INNER JOIN Combo_Test_Items cti ON ct.id = cti.combo_test_id
INNER JOIN Tests t ON cti.test_id = t.id
ORDER BY ct.name, t.name;

-- Calculate total price for each combo test
SELECT
  ct.id,
  ct.name as combo_name,
  COUNT(cti.id) as test_count,
  SUM(t.price) as total_price
FROM Combo_Tests ct
INNER JOIN Combo_Test_Items cti ON ct.id = cti.combo_test_id
INNER JOIN Tests t ON cti.test_id = t.id
GROUP BY ct.id
ORDER BY total_price DESC;

-- ========================================
-- CLEANUP (if needed)
-- ========================================
-- Uncomment to remove all combo tests created by this script
-- DELETE FROM Combo_Test_Items WHERE combo_test_id IN (
--   SELECT id FROM Combo_Tests WHERE staff_id = @staff_id
-- );
-- DELETE FROM Combo_Tests WHERE staff_id = @staff_id;
