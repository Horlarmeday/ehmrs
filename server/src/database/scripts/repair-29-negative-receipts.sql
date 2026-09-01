-- ============================================================================
-- EMR #29 defect B — negative receipt quantities on Pharmacy_Store_Items.
--
-- This file is the DBA-led twin of the Sequelize pair:
--   20260831000001-repair-29-negative-receipt-quantities.js  (the repair, §4/§6)
--   20260831000002-add-non-negative-receipt-check-29.js      (the CHECK, §4.3)
--
-- RUN THE REPORT (§1-§3) AGAINST PRODUCTION BEFORE ANYTHING IS WRITTEN.
-- Per the plan (tasks/29-pharmacy-store-negative-quantities.md, Open question 1), the figures
-- in the issue (1,664 rows, 586 negatives, -₦44,301,228) describe ehmrs_prod, but the local
-- ehmrs_prod is a dev copy — the real counts may differ, and T8 is written from what THIS
-- report shows, not from the issue's numbers.
--
-- §4/§6 are applied on a REHEARSAL COPY first (mysqldump restore), never blind. §7 proves the
-- CHECK constraint bites before it is relied upon.
-- ============================================================================


-- ============================================================================
-- §1 REPORT — read-only. Negative rows, per drug and drug_type (plan T7).
-- ============================================================================

-- 1a. Every negative row, with the valuation the repair would restate.
SELECT
    psi.id                                   AS store_item_id,
    d.id                                     AS drug_id,
    d.name                                   AS drug_name,
    psi.drug_type,
    psi.quantity_received,                   -- negative today; the repair floors to 0
    psi.quantity_remaining,                  -- authoritative (plan D3) — the repair does not touch it
    psi.unit_price,
    psi.total_price                          AS current_total_price,   -- quantity_received × unit_price
    psi.quantity_remaining * psi.unit_price  AS recomputed_total_price -- post-repair value
FROM Pharmacy_Store_Items psi
JOIN Drugs d ON d.id = psi.drug_id
WHERE psi.quantity_received < 0
ORDER BY d.name, psi.drug_type;

-- 1b. Cohorts per drug (plan D5): all-negative = every bin of the drug is corrupt and there is
--     no good anchor anywhere; partially-negative = at least one clean bin remains. BOTH cohorts
--     go to the physical stock take — the counts here are what the issue's 170/5 must be
--     re-measured against on the real production database.
SELECT
    d.id   AS drug_id,
    d.name AS drug_name,
    COUNT(*)                                        AS total_bins,
    SUM(psi.quantity_received < 0)                  AS negative_bins,
    SUM(psi.quantity_received < 0) = COUNT(*)       AS all_negative
FROM Pharmacy_Store_Items psi
JOIN Drugs d ON d.id = psi.drug_id
GROUP BY d.id, d.name
HAVING negative_bins > 0
ORDER BY all_negative DESC, d.name;

-- 1c. Headline the issue must be re-verified against.
SELECT
    COUNT(*)                                              AS negative_rows,
    COUNT(DISTINCT psi.drug_id)                           AS drugs_affected,
    SUM(psi.quantity_received < 0)                        AS rows_to_floor,
    SUM(psi.total_price)                                  AS current_negative_valuation,
    SUM(psi.quantity_remaining * psi.unit_price)          AS valuation_after_repair
FROM Pharmacy_Store_Items psi
WHERE psi.quantity_received < 0;


-- ============================================================================
-- §2 QUARANTINE WORKLIST (plan T10) — the stock-take CSV for pharmacy ops.
--
-- Every drug in EITHER cohort: no correct value is recoverable for the all-negative drugs (D5),
-- and the partially-negative five need their clean bins recounted to confirm the anchor.
--
-- Export (INTO OUTFILE is blocked by secure_file_priv on most installs):
--   mysql --batch --raw -h <prod-host> -e "<§2 query>" ehmrs_prod \
--     | perl -pe 's/\t/,/g; s/"/""/g; s/^/"/; s/$/"/; s/""//g' > quarantine-29-worklist.csv
--   (or simply: ... | tr '\t' ',' — the columns below contain no commas by construction)
-- ============================================================================

SELECT
    d.id                              AS drug_id,
    REPLACE(d.name, ',', ' /')        AS drug_name,   -- comma-free for CSV
    psi.id                            AS store_item_id,
    psi.drug_type                     AS shelf_class,
    psi.quantity_received             AS recorded_receipt,
    0                                 AS receipt_after_repair,
    psi.quantity_remaining            AS system_remaining,
    ''                                AS counted_remaining,  -- filled in at the stock take
    psi.unit_price,
    IF(psi.quantity_received < 0, 'NEGATIVE RECEIPT', 'CLEAN BIN') AS bin_condition,
    IF(c.negative_bins = c.total_bins, 'ALL-NEGATIVE (no anchor)', 'PARTIALLY-NEGATIVE (has clean bins)') AS cohort
FROM Pharmacy_Store_Items psi
JOIN Drugs d ON d.id = psi.drug_id
JOIN (
    SELECT drug_id, COUNT(*) AS total_bins, SUM(quantity_received < 0) AS negative_bins
    FROM Pharmacy_Store_Items
    GROUP BY drug_id
    HAVING negative_bins > 0
) c ON c.drug_id = psi.drug_id
ORDER BY cohort, d.name, psi.drug_type;


-- ============================================================================
-- §3 PRE-REPAIR RECONCILIATION BASELINE (plan T9) — capture before applying §4.
--     The repair must not move stock (D3/D4): the per-class SUM(quantity_remaining) lines must
--     be IDENTICAL after the repair; only the valuation lines may change.
-- ============================================================================

SELECT drug_type,
       COUNT(*)                   AS bins,
       SUM(quantity_remaining)    AS total_remaining,
       SUM(total_price)           AS total_valuation
FROM Pharmacy_Store_Items
GROUP BY drug_type WITH ROLLUP;


-- ============================================================================
-- §4 UP MIGRATION — the repair (§4.1-4.2) then the CHECK (§4.3).
--     Mirrors the two Sequelize migrations exactly; run on a rehearsal copy first.
-- ============================================================================

-- 4.0 Re-entrancy: a stale snapshot from an aborted run cannot describe the current rows.
DROP TABLE IF EXISTS `Pharmacy_Store_Items_repair_29_backup`;

-- 4.1 D6: snapshot every row about to be touched. This table is what `down` restores from.
CREATE TABLE `Pharmacy_Store_Items_repair_29_backup` AS
SELECT * FROM `Pharmacy_Store_Items` WHERE `quantity_received` < 0;

-- 4.2 D3/D4: floor the receipt to visibly-unknown, restate the valuation from the authoritative
--     remaining stock, do NOT touch quantity_remaining. One statement so the pair cannot
--     interleave with a concurrent restock; neither assignment feeds the other.
UPDATE `Pharmacy_Store_Items`
   SET `quantity_received` = 0,
       `total_price` = `quantity_remaining` * `unit_price`
 WHERE `quantity_received` < 0;

-- 4.3 The floor that outlives every writer (plan D1). Runs AFTER the repair by construction;
--     it cannot apply while negative rows remain.
ALTER TABLE `Pharmacy_Store_Items`
  ADD CONSTRAINT `chk_psi_quantity_received_nonnegative` CHECK (`quantity_received` >= 0);


-- ============================================================================
-- §5 POST-REPAIR RECONCILIATION (plan T9) — compare against §3.
--     Required outcome: every total_remaining line IDENTICAL to §3;
--     no total_valuation line negative; §5b must report 0 rows twice.
-- ============================================================================

-- 5a. Same shape as §3.
SELECT drug_type,
       COUNT(*)                   AS bins,
       SUM(quantity_remaining)    AS total_remaining,
       SUM(total_price)           AS total_valuation
FROM Pharmacy_Store_Items
GROUP BY drug_type WITH ROLLUP;

-- 5b. Nothing left to repair, nothing repaired wrongly.
SELECT COUNT(*) AS still_negative FROM `Pharmacy_Store_Items` WHERE `quantity_received` < 0;

SELECT COUNT(*) AS mispriced
FROM `Pharmacy_Store_Items` psi
JOIN `Pharmacy_Store_Items_repair_29_backup` b ON b.`id` = psi.`id`
WHERE psi.`quantity_received` <> 0
   OR psi.`total_price` <> psi.`quantity_remaining` * psi.`unit_price`
   OR psi.`quantity_remaining` <> b.`quantity_remaining`;

-- 5c. What the repair changed, in one line.
SELECT
    (SELECT COUNT(*) FROM `Pharmacy_Store_Items_repair_29_backup`) AS rows_repaired,
    (SELECT SUM(`quantity_received` * `unit_price`) FROM `Pharmacy_Store_Items_repair_29_backup`) AS valuation_before,
    (SELECT SUM(b.`quantity_remaining` * b.`unit_price`) FROM `Pharmacy_Store_Items_repair_29_backup` b
       JOIN `Pharmacy_Store_Items` psi ON psi.`id` = b.`id`) AS valuation_after;


-- ============================================================================
-- §6 DOWN MIGRATION (rollback, plan D6) — restore from the snapshot.
-- ============================================================================

ALTER TABLE `Pharmacy_Store_Items`
  DROP CHECK `chk_psi_quantity_received_nonnegative`;

-- Rows deleted since the repair are resurrected whole, not silently lost.
INSERT INTO `Pharmacy_Store_Items`
SELECT b.*
FROM `Pharmacy_Store_Items_repair_29_backup` b
WHERE b.`id` NOT IN (SELECT `id` FROM (SELECT `id` FROM `Pharmacy_Store_Items`) x);

-- Restore ONLY what the repair touched. quantity_remaining is excluded: dispensing since the
-- repair is real, and reverting it would claim stock back onto shelves.
UPDATE `Pharmacy_Store_Items` psi
JOIN `Pharmacy_Store_Items_repair_29_backup` b ON b.`id` = psi.`id`
   SET psi.`quantity_received` = b.`quantity_received`,
       psi.`total_price` = b.`total_price`;

DROP TABLE `Pharmacy_Store_Items_repair_29_backup`;


-- ============================================================================
-- §7 REHEARSAL CHECKS — run on the rehearsal copy after §4.
-- ============================================================================

-- 7a. The CHECK must BITE. Expected: ERROR 3819 'Check constraint
--     chk_psi_quantity_received_nonnegative is violated'. On MySQL < 8.0.16 the statement
--     SUCCEEDS instead — the constraint was parsed and ignored, and neither this script nor
--     the Sequelize twin is protecting anything: stop and report the server version.
-- UPDATE `Pharmacy_Store_Items`
--    SET `quantity_received` = -1
--  WHERE `id` = (SELECT `id` FROM (SELECT `id` FROM `Pharmacy_Store_Items` LIMIT 1) probe);

-- 7b. Post-revert identity: run BETWEEN §6's UPDATE and its final DROP TABLE, so the snapshot
--     is still present to compare against. Expected: 0 unrestored rows.
-- SELECT COUNT(*) AS unrestored
-- FROM `Pharmacy_Store_Items` psi
-- RIGHT JOIN `Pharmacy_Store_Items_repair_29_backup` b ON b.`id` = psi.`id`
-- WHERE psi.`id` IS NULL OR psi.`quantity_received` <> b.`quantity_received`;

-- 7c. History is untouched by design (plan Open question 3): the negative SUPPLIED rows remain
--     as the audit trail of what actually happened. This counts them for the record.
-- SELECT COUNT(*) AS negative_supplied_history_rows
-- FROM `Pharmacy_Store_Histories`
-- WHERE `history_type` = 'Supplied' AND `quantity_supplied` < 0;
