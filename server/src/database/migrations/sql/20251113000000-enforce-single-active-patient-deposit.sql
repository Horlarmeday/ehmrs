/*
 * Migration: Enforce single active deposit per patient
 * Database:  MySQL (InnoDB)
 *
 * Run the duplicate check first. If any rows are returned, consolidate
 * those deposits before proceeding with the ALTER statements.
 */

-- ------------------------------------------------------------------
-- Step 0: Inspect patients with more than one ACTIVE deposit
-- ------------------------------------------------------------------
SELECT
  patient_id,
  GROUP_CONCAT(id ORDER BY last_activity_date DESC) AS deposit_ids,
  COUNT(*) AS active_deposit_count,
  SUM(current_balance) AS total_active_balance
FROM patient_deposits
WHERE status = 'ACTIVE'
GROUP BY patient_id
HAVING COUNT(*) > 1;

-- If the above query returns no rows, proceed with the migration below.

-- ------------------------------------------------------------------
-- Step 1: Add generated column that is populated only for ACTIVE rows
--         (This allows the unique index to ignore non-ACTIVE deposits.)
-- ------------------------------------------------------------------
ALTER TABLE patient_deposits
  ADD COLUMN active_patient_id INT GENERATED ALWAYS AS (
    CASE
      WHEN status = 'ACTIVE' THEN patient_id
      ELSE NULL
    END
  ) STORED;

-- ------------------------------------------------------------------
-- Step 2: Create a unique index on the generated column
--         (MySQL unique indexes allow multiple NULL values, so only
--          ACTIVE rows participate in the uniqueness constraint.)
-- ------------------------------------------------------------------
CREATE UNIQUE INDEX uq_patient_deposits_active_patient
  ON patient_deposits (active_patient_id);

-- ------------------------------------------------------------------
-- Verification: Confirm that no duplicate active deposits remain
-- ------------------------------------------------------------------
SELECT
  patient_id,
  COUNT(*) AS active_deposit_count
FROM patient_deposits
WHERE status = 'ACTIVE'
GROUP BY patient_id
HAVING COUNT(*) > 1;

-- ------------------------------------------------------------------
-- Rollback (if needed)
-- ------------------------------------------------------------------
-- DROP INDEX uq_patient_deposits_active_patient ON patient_deposits;
-- ALTER TABLE patient_deposits DROP COLUMN active_patient_id;

