-- Migrate existing measurement-dosage relationships to junction table
-- This migration copies all existing one-to-many relationships from Measurements table
-- to the new Measurement_Dosage_Forms junction table

-- Step 1: Verify data before migration
-- Count measurements with dosage forms
SELECT COUNT(*) as total_measurements_with_dosage_forms
FROM Measurements
WHERE dosage_form_id IS NOT NULL;

-- Step 2: Migrate data
INSERT INTO Measurement_Dosage_Forms (measurement_id, dosage_form_id, createdAt, updatedAt)
SELECT id, dosage_form_id, createdAt, updatedAt 
FROM Measurements 
WHERE dosage_form_id IS NOT NULL;

-- Step 3: Verify migration
-- Count records in junction table
SELECT COUNT(*) as total_junction_records
FROM Measurement_Dosage_Forms;

-- Verify all measurements are properly linked
SELECT 
  m.id,
  m.name,
  m.dosage_form_id as old_dosage_form_id,
  GROUP_CONCAT(mdf.dosage_form_id) as new_dosage_form_ids
FROM Measurements m
LEFT JOIN Measurement_Dosage_Forms mdf ON m.id = mdf.measurement_id
WHERE m.dosage_form_id IS NOT NULL
GROUP BY m.id, m.name, m.dosage_form_id;

