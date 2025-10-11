-- ========================================
-- COMBO TESTS SEED SCRIPT
-- ========================================
-- This script creates common laboratory test combinations
--
-- IMPORTANT: Before running this script:
-- 1. Replace {STAFF_ID} with a valid staff ID from your Staff table
-- 2. Replace test IDs in the Combo_Test_Items section with actual test IDs from your Tests table
-- 3. Verify that the test names match your Tests table
-- 4. Run this script after the migrations have been executed
-- ========================================

-- Set variables (MySQL syntax - adjust for your database if needed)
SET @staff_id = 1; -- REPLACE WITH ACTUAL STAFF ID

-- ========================================
-- 1. FULL BLOOD COUNT (FBC) COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Full Blood Count (FBC)', true, @staff_id, NOW(), NOW());

SET @fbc_combo_id = LAST_INSERT_ID();

-- Insert FBC test items
-- IMPORTANT: Replace these test IDs with actual IDs from your Tests table
INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
VALUES
  (@fbc_combo_id, 1, NOW(), NOW()),  -- Replace 1 with actual Hemoglobin test ID
  (@fbc_combo_id, 2, NOW(), NOW()),  -- Replace 2 with actual White Blood Cell Count test ID
  (@fbc_combo_id, 3, NOW(), NOW()),  -- Replace 3 with actual Platelet Count test ID
  (@fbc_combo_id, 4, NOW(), NOW()),  -- Replace 4 with actual Red Blood Cell Count test ID
  (@fbc_combo_id, 5, NOW(), NOW());  -- Replace 5 with actual Hematocrit test ID

-- ========================================
-- 2. LIPID PROFILE COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Lipid Profile', true, @staff_id, NOW(), NOW());

SET @lipid_combo_id = LAST_INSERT_ID();

-- Insert Lipid Profile test items
INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
VALUES
  (@lipid_combo_id, 6, NOW(), NOW()),  -- Replace 6 with actual Total Cholesterol test ID
  (@lipid_combo_id, 7, NOW(), NOW()),  -- Replace 7 with actual HDL Cholesterol test ID
  (@lipid_combo_id, 8, NOW(), NOW()),  -- Replace 8 with actual LDL Cholesterol test ID
  (@lipid_combo_id, 9, NOW(), NOW());  -- Replace 9 with actual Triglycerides test ID

-- ========================================
-- 3. LIVER FUNCTION TESTS (LFT) COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Liver Function Tests (LFT)', true, @staff_id, NOW(), NOW());

SET @lft_combo_id = LAST_INSERT_ID();

-- Insert LFT test items
INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
VALUES
  (@lft_combo_id, 10, NOW(), NOW()),  -- Replace 10 with actual ALT test ID
  (@lft_combo_id, 11, NOW(), NOW()),  -- Replace 11 with actual AST test ID
  (@lft_combo_id, 12, NOW(), NOW()),  -- Replace 12 with actual ALP test ID
  (@lft_combo_id, 13, NOW(), NOW()),  -- Replace 13 with actual Total Bilirubin test ID
  (@lft_combo_id, 14, NOW(), NOW()),  -- Replace 14 with actual Albumin test ID
  (@lft_combo_id, 15, NOW(), NOW());  -- Replace 15 with actual Total Protein test ID

-- ========================================
-- 4. RENAL FUNCTION TESTS (RFT) COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Renal Function Tests (RFT)', true, @staff_id, NOW(), NOW());

SET @rft_combo_id = LAST_INSERT_ID();

-- Insert RFT test items
INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
VALUES
  (@rft_combo_id, 16, NOW(), NOW()),  -- Replace 16 with actual Creatinine test ID
  (@rft_combo_id, 17, NOW(), NOW()),  -- Replace 17 with actual Urea test ID
  (@rft_combo_id, 18, NOW(), NOW()),  -- Replace 18 with actual Sodium test ID
  (@rft_combo_id, 19, NOW(), NOW()),  -- Replace 19 with actual Potassium test ID
  (@rft_combo_id, 20, NOW(), NOW());  -- Replace 20 with actual Chloride test ID

-- ========================================
-- 5. THYROID FUNCTION TESTS (TFT) COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Thyroid Function Tests (TFT)', true, @staff_id, NOW(), NOW());

SET @tft_combo_id = LAST_INSERT_ID();

-- Insert TFT test items
INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
VALUES
  (@tft_combo_id, 21, NOW(), NOW()),  -- Replace 21 with actual TSH test ID
  (@tft_combo_id, 22, NOW(), NOW()),  -- Replace 22 with actual T3 test ID
  (@tft_combo_id, 23, NOW(), NOW());  -- Replace 23 with actual T4 test ID

-- ========================================
-- 6. BASIC METABOLIC PANEL (BMP) COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Basic Metabolic Panel (BMP)', true, @staff_id, NOW(), NOW());

SET @bmp_combo_id = LAST_INSERT_ID();

-- Insert BMP test items
INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
VALUES
  (@bmp_combo_id, 24, NOW(), NOW()),  -- Replace 24 with actual Glucose test ID
  (@bmp_combo_id, 16, NOW(), NOW()),  -- Creatinine (reuse from RFT)
  (@bmp_combo_id, 17, NOW(), NOW()),  -- Urea (reuse from RFT)
  (@bmp_combo_id, 18, NOW(), NOW()),  -- Sodium (reuse from RFT)
  (@bmp_combo_id, 19, NOW(), NOW()),  -- Potassium (reuse from RFT)
  (@bmp_combo_id, 20, NOW(), NOW()),  -- Chloride (reuse from RFT)
  (@bmp_combo_id, 25, NOW(), NOW()),  -- Replace 25 with actual Bicarbonate test ID
  (@bmp_combo_id, 26, NOW(), NOW());  -- Replace 26 with actual Calcium test ID

-- ========================================
-- 7. DIABETES SCREENING COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Diabetes Screening', true, @staff_id, NOW(), NOW());

SET @diabetes_combo_id = LAST_INSERT_ID();

-- Insert Diabetes Screening test items
INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
VALUES
  (@diabetes_combo_id, 24, NOW(), NOW()),  -- Glucose (reuse)
  (@diabetes_combo_id, 27, NOW(), NOW()),  -- Replace 27 with actual HbA1c test ID
  (@diabetes_combo_id, 28, NOW(), NOW());  -- Replace 28 with actual Fasting Blood Sugar test ID

-- ========================================
-- 8. ANTENATAL BOOKING COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Antenatal Booking Tests', true, @staff_id, NOW(), NOW());

SET @antenatal_combo_id = LAST_INSERT_ID();

-- Insert Antenatal Booking test items
INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
VALUES
  (@antenatal_combo_id, 1, NOW(), NOW()),   -- Hemoglobin (reuse from FBC)
  (@antenatal_combo_id, 29, NOW(), NOW()),  -- Replace 29 with actual Blood Group test ID
  (@antenatal_combo_id, 30, NOW(), NOW()),  -- Replace 30 with actual Rhesus Factor test ID
  (@antenatal_combo_id, 31, NOW(), NOW()),  -- Replace 31 with actual VDRL test ID
  (@antenatal_combo_id, 32, NOW(), NOW()),  -- Replace 32 with actual Hepatitis B test ID
  (@antenatal_combo_id, 33, NOW(), NOW()),  -- Replace 33 with actual HIV test ID
  (@antenatal_combo_id, 34, NOW(), NOW());  -- Replace 34 with actual Urine R/E test ID

-- ========================================
-- 9. PRE-OPERATIVE SCREENING COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Pre-Operative Screening', true, @staff_id, NOW(), NOW());

SET @preop_combo_id = LAST_INSERT_ID();

-- Insert Pre-Operative Screening test items
INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
VALUES
  (@preop_combo_id, 1, NOW(), NOW()),   -- Hemoglobin (reuse from FBC)
  (@preop_combo_id, 2, NOW(), NOW()),   -- WBC Count (reuse from FBC)
  (@preop_combo_id, 3, NOW(), NOW()),   -- Platelet Count (reuse from FBC)
  (@preop_combo_id, 29, NOW(), NOW()),  -- Blood Group (reuse)
  (@preop_combo_id, 30, NOW(), NOW()),  -- Rhesus Factor (reuse)
  (@preop_combo_id, 35, NOW(), NOW()),  -- Replace 35 with actual PT/INR test ID
  (@preop_combo_id, 36, NOW(), NOW()),  -- Replace 36 with actual PTT test ID
  (@preop_combo_id, 16, NOW(), NOW()),  -- Creatinine (reuse from RFT)
  (@preop_combo_id, 24, NOW(), NOW());  -- Glucose (reuse)

-- ========================================
-- 10. ELECTROLYTES COMBO
-- ========================================
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('Electrolytes', true, @staff_id, NOW(), NOW());

SET @electrolytes_combo_id = LAST_INSERT_ID();

-- Insert Electrolytes test items
INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
VALUES
  (@electrolytes_combo_id, 18, NOW(), NOW()),  -- Sodium (reuse from RFT)
  (@electrolytes_combo_id, 19, NOW(), NOW()),  -- Potassium (reuse from RFT)
  (@electrolytes_combo_id, 20, NOW(), NOW()),  -- Chloride (reuse from RFT)
  (@electrolytes_combo_id, 25, NOW(), NOW());  -- Bicarbonate (reuse)

-- ========================================
-- VERIFICATION QUERY
-- ========================================
-- Run this query to verify the combo tests were created successfully
-- SELECT
--   ct.id,
--   ct.name,
--   COUNT(cti.id) as test_count,
--   ct.is_active,
--   ct.createdAt
-- FROM Combo_Tests ct
-- LEFT JOIN Combo_Test_Items cti ON ct.id = cti.combo_test_id
-- GROUP BY ct.id
-- ORDER BY ct.createdAt DESC;

-- ========================================
-- HELPER QUERY: Find Test IDs by Name
-- ========================================
-- Use this query to find the actual test IDs from your Tests table
-- before running the main script
--
-- SELECT id, name, price, sample_id
-- FROM Tests
-- WHERE name LIKE '%hemoglobin%'
--    OR name LIKE '%glucose%'
--    OR name LIKE '%cholesterol%'
--    OR name LIKE '%creatinine%'
-- ORDER BY name;

-- ========================================
-- NOTES
-- ========================================
-- 1. This script uses MySQL syntax (NOW(), LAST_INSERT_ID())
-- 2. Adjust for PostgreSQL if needed:
--    - Replace NOW() with CURRENT_TIMESTAMP
--    - Replace LAST_INSERT_ID() with RETURNING id or use SERIAL
-- 3. Some test IDs are reused across multiple combos (e.g., Hemoglobin in FBC and Antenatal)
-- 4. Customize combo names and test combinations based on your facility's needs
-- 5. All combos are created as active (is_active = true) by default
