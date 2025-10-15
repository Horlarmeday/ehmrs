# Combo Tests Seed Scripts

This directory contains SQL scripts to populate the database with common laboratory test combinations.

## Files

1. **seed-combo-tests.sql** - Manual version with placeholder IDs
2. **seed-combo-tests-dynamic.sql** - Dynamic version that looks up tests by name (Recommended)

## Prerequisites

Before running these scripts:

1. ✅ Run the combo tests migrations:
   ```bash
   npm run migration
   ```

2. ✅ Ensure your `Tests` table is populated with individual laboratory tests

3. ✅ Have a valid `staff_id` from your `Staff` table

## Usage

### Option 1: Dynamic Script (Recommended)

This script automatically finds test IDs by name, making it easier to use.

**Steps:**

1. **Find a valid staff ID:**
   ```sql
   SELECT id, firstname, lastname FROM Staff LIMIT 5;
   ```

2. **Update the script:**
   - Open `seed-combo-tests-dynamic.sql`
   - Replace `SET @staff_id = 1;` with your actual staff ID

3. **Preview available tests:**
   ```sql
   SELECT id, name, price FROM Tests ORDER BY name;
   ```

4. **Run the script:**
   ```bash
   # If using MySQL
   mysql -u username -p database_name < seed-combo-tests-dynamic.sql

   # Or connect to your database and run:
   source /path/to/seed-combo-tests-dynamic.sql;
   ```

5. **Verify results:**
   The script includes verification queries at the end that will show:
   - All created combo tests with test counts
   - Any combo tests with no items (need attention)
   - Detailed breakdown of tests in each combo
   - Total prices for each combo

### Option 2: Manual Script

Use this if you prefer more control over which specific tests are included.

**Steps:**

1. **Find test IDs:**
   ```sql
   SELECT id, name, price
   FROM Tests
   WHERE name LIKE '%hemoglobin%'
      OR name LIKE '%glucose%'
      OR name LIKE '%cholesterol%'
   ORDER BY name;
   ```

2. **Update the script:**
   - Open `seed-combo-tests.sql`
   - Replace `@staff_id` with your staff ID
   - Replace all test IDs (marked with comments) with actual IDs from your Tests table

3. **Run the script:**
   ```bash
   mysql -u username -p database_name < seed-combo-tests.sql
   ```

## Combo Tests Included

The scripts create the following combo tests:

1. **Full Blood Count (FBC)** - Hemoglobin, WBC, RBC, Platelets, Hematocrit
2. **Lipid Profile** - Total Cholesterol, HDL, LDL, Triglycerides
3. **Liver Function Tests (LFT)** - ALT, AST, ALP, Bilirubin, Albumin, Total Protein
4. **Renal Function Tests (RFT)** - Creatinine, Urea, Sodium, Potassium, Chloride
5. **Thyroid Function Tests (TFT)** - TSH, T3, T4
6. **Basic Metabolic Panel (BMP)** - Glucose, Electrolytes, Creatinine, Urea, Calcium
7. **Diabetes Screening** - Glucose, HbA1c, FBS, RBS
8. **Antenatal Booking Tests** - Hemoglobin, Blood Group, VDRL, Hepatitis B, HIV, Urine R/E
9. **Pre-Operative Screening** - FBC, Blood Group, PT/INR, PTT, Creatinine, Glucose
10. **Electrolytes** - Sodium, Potassium, Chloride, Bicarbonate
11. **Cardiac Markers** - Troponin I/T, CK-MB, BNP
12. **Complete Metabolic Panel (CMP)** - Comprehensive metabolic tests

## Customization

### Adding New Combos

To add a new combo test:

```sql
-- 1. Create the combo test
INSERT INTO Combo_Tests (name, is_active, staff_id, createdAt, updatedAt)
VALUES ('My Custom Combo', true, @staff_id, NOW(), NOW());

SET @custom_combo_id = LAST_INSERT_ID();

-- 2. Add tests to the combo (dynamic method)
INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
SELECT @custom_combo_id, id, NOW(), NOW()
FROM Tests
WHERE name IN ('Test Name 1', 'Test Name 2', 'Test Name 3')
AND id IS NOT NULL;
```

### Adjusting Test Names

If your Tests table uses different naming conventions, update the `WHERE name IN (...)` clauses:

```sql
-- Example: If your system uses abbreviations
WHERE name IN (
  'Hb',           -- Instead of 'Hemoglobin'
  'WBC',          -- Instead of 'White Blood Cell Count'
  'PLT'           -- Instead of 'Platelet Count'
)
```

## Verification Queries

After running the script, use these queries to verify:

### Check all combo tests
```sql
SELECT
  ct.id,
  ct.name,
  COUNT(cti.id) as test_count,
  ct.is_active
FROM Combo_Tests ct
LEFT JOIN Combo_Test_Items cti ON ct.id = cti.combo_test_id
GROUP BY ct.id
ORDER BY ct.name;
```

### View tests in a specific combo
```sql
SELECT
  t.name as test_name,
  t.price
FROM Combo_Test_Items cti
INNER JOIN Tests t ON cti.test_id = t.id
WHERE cti.combo_test_id = 1  -- Replace with combo ID
ORDER BY t.name;
```

### Calculate combo prices
```sql
SELECT
  ct.name as combo_name,
  SUM(t.price) as total_price
FROM Combo_Tests ct
INNER JOIN Combo_Test_Items cti ON ct.id = cti.combo_test_id
INNER JOIN Tests t ON cti.test_id = t.id
GROUP BY ct.id
ORDER BY total_price DESC;
```

## Troubleshooting

### Combo has no tests

If a combo test was created but has no items:

1. Check if the test names exist in your Tests table:
   ```sql
   SELECT name FROM Tests WHERE name LIKE '%hemoglobin%';
   ```

2. Update the script with the exact names from your database

3. Or manually add tests:
   ```sql
   INSERT INTO Combo_Test_Items (combo_test_id, test_id, createdAt, updatedAt)
   VALUES (1, 5, NOW(), NOW());  -- combo_id=1, test_id=5
   ```

### Duplicate combos

If you run the script multiple times:

```sql
-- Remove duplicate combos
DELETE FROM Combo_Test_Items
WHERE combo_test_id IN (
  SELECT id FROM Combo_Tests
  WHERE name = 'Full Blood Count (FBC)'
  AND id > (SELECT MIN(id) FROM Combo_Tests WHERE name = 'Full Blood Count (FBC)')
);

DELETE FROM Combo_Tests
WHERE name = 'Full Blood Count (FBC)'
AND id > (SELECT MIN(id) FROM Combo_Tests WHERE name = 'Full Blood Count (FBC)');
```

## Cleanup

To remove all combo tests created by the script:

```sql
-- First delete the items
DELETE FROM Combo_Test_Items
WHERE combo_test_id IN (
  SELECT id FROM Combo_Tests WHERE staff_id = 1  -- Your staff_id
);

-- Then delete the combos
DELETE FROM Combo_Tests WHERE staff_id = 1;  -- Your staff_id
```

## Notes

- All combos are created as active (`is_active = true`) by default
- Some tests appear in multiple combos (e.g., Hemoglobin in FBC and Antenatal)
- The dynamic script handles missing tests gracefully (uses `WHERE id IS NOT NULL`)
- Adjust combo names and test combinations based on your facility's needs
- Consider your local medical practice standards when customizing

## Support

If you encounter issues:
1. Check that migrations have been run successfully
2. Verify test names match your Tests table exactly
3. Ensure staff_id is valid
4. Check database permissions for INSERT operations
