-- Goods receipt entry paths: batch identity on the delivery, nullable selling price
-- (Accounting issue #304, ADR-0041).
--
-- SQL twin of the Sequelize migration
-- `20260829000000-add-external-batch-id-to-pharmacy-store-items.js`, for DBA-led deployment and for
-- the production-dump rehearsal: restore a copy of the live database, snapshot the pre-checks
-- below, run the Up section, and diff — no quantity may change and no price may be invented.
--
-- Table names use the spellings of the live schema dump: `inventory_items` is lowercase there,
-- `Pharmacy_Store_Items` and `Pharmacy_Store_Histories` are mixed-case. On a case-insensitive
-- server both spellings resolve the same.
--
-- ORDER MATTERS relative to #295. `batch-identity.sql` must run FIRST: it creates
-- `inventory_items.pharmacy_store_id` and `.batch`, and the `AFTER` clause below places the new
-- column next to them.
--
-- On `ehmrs_prod` as at 2026-08-31, #295 HAS ALREADY BEEN APPLIED — `inventory_items` carries both
-- `pharmacy_store_id` and `batch`, and `Inventory_Item_Histories` carries `pharmacy_store_id`.
-- `SequelizeMeta` records no 2026 migration, so it was applied via the SQL script rather than
-- through Sequelize; do not infer from `SequelizeMeta` alone. `external_batch_id` is genuinely
-- absent, on all three tables.
--
-- VERIFIED, not assumed: this script was run against a schema-only clone of `ehmrs_prod`
-- (`mysqldump --no-data`) on 2026-08-31. Up applied clean; Down round-tripped clean; and the
-- rollback guard was exercised by inserting an unpriced row, after which restoring NOT NULL failed
-- with `ERROR 1138 (22004): Invalid use of NULL value` — MySQL refuses rather than coercing the
-- null to zero, which is the behaviour the guard note below depends on.
--
--
-- WHY external_batch_id IS NOT ON THE STORE ROW
-- --------------------------------------------
-- An earlier draft of the Sequelize migration put it on `Pharmacy_Store_Items`. That row is not a
-- batch: it is a per-(drug, drug_type) BIN reused for the drug's lifetime, and `reorderPharmacyItems`
-- spreads `...item` over it on every restock, overwriting `quantity_received`, `unit_price`, `batch`
-- and `expiration`. An id held there would name only the MOST RECENT delivery and be silently
-- overwritten by the next, so Accounting's costing would price a dispense at whichever layer
-- happened to arrive last — under FIFO, a direct COGS misstatement.
--
-- It goes in two places instead, each answering a different question:
--
--   Pharmacy_Store_Histories.external_batch_id  WHICH DELIVERY. One `Supplied` row per delivery,
--                                               which is the grain a batch identity needs.
--   inventory_items.external_batch_id           WHICH DELIVERY A LAYER CAME FROM, frozen at
--                                               transfer. A bin holds several deliveries whose
--                                               units are commingled on the shelf, so only the
--                                               layer can say what a return belongs to.
--
-- Both NULLABLE and NON-UNIQUE, permanently.
--   NULLABLE  — deliveries exist that Accounting never saw (pre-cutover, donations, samples) and
--               can never acquire an id retroactively. Per ADR-0041 a NULL is not a failed match:
--               it positively asserts the stock did not come through procurement.
--   NON-UNIQUE — `stock.received` is an ADDITIVE event and the applier branch that writes this
--               column returns BEFORE the inbox's sequence guard. A redelivery must be a harmless
--               no-op re-write of the same value, not a constraint violation that fails the whole
--               instruction. DO NOT add a unique index here later.
--
--
-- WHY selling_price BECOMES NULLABLE
-- ----------------------------------
-- Accounting now originates a purchased goods receipt and creates the EMR's store row from
-- `stock.received`. The event may carry a patient-facing price — the clerk types it once, on the
-- Accounting receipt screen — but is not required to. Where it does not, the row is born UNPRICED
-- rather than priced at a fabricated number: inventing a patient-facing price is the silently-wrong
-- failure ADR-0001 and ADR-0009 exist to prevent.
--
-- An unpriced row is NOT DISPENSABLE — `dispenseValidations` refuses it. That guard is application
-- code, not a constraint, because the row must be creatable-then-priced; a CHECK would block the
-- create. The pairing is deliberate: nullable column, guarded transfer.
--
-- `unit_price` and `total_price` stay NOT NULL. Acquisition cost is Accounting's and is always
-- known at receipt — it is what posts Dr Inventory / Cr AP — so a row created from `stock.received`
-- always has one. Only the patient-facing price can legitimately be pending.
--
-- NO BACKFILL. This script reads no existing row's price, quantity or batch id, and writes none.


-- ============================================================================
-- Up Migration
-- ============================================================================

-- 1. Batch identity on the delivery.
ALTER TABLE `Pharmacy_Store_Histories`
  ADD COLUMN `external_batch_id` VARCHAR(36) NULL DEFAULT NULL AFTER `unit_price`;

CREATE INDEX `idx_pharmacy_store_histories_external_batch_id`
  ON `Pharmacy_Store_Histories` (`external_batch_id`);

-- 2. Batch identity on the dispensary layer, frozen at transfer.
--    Requires #295's `batch-identity.sql` to have run (for `pharmacy_store_id`).
ALTER TABLE `inventory_items`
  ADD COLUMN `external_batch_id` VARCHAR(36) NULL DEFAULT NULL AFTER `batch`;

CREATE INDEX `idx_inventory_items_external_batch_id`
  ON `inventory_items` (`external_batch_id`);

-- 3. The patient-facing price may be pending. Cost may not.
--    Restated in full because MySQL's MODIFY replaces the whole definition — decimal(12,2) is the
--    live type, confirmed against information_schema before writing this.
ALTER TABLE `Pharmacy_Store_Items`
  MODIFY COLUMN `selling_price` DECIMAL(12,2) NULL DEFAULT NULL;


-- ============================================================================
-- Down Migration (rollback)
-- ============================================================================
--
-- STOP: restoring NOT NULL on `selling_price` will FAIL while any unpriced row exists, and that is
-- deliberate — the alternative is inventing a patient-facing price for each. Run the guard first:
--
--   SELECT COUNT(*) AS unpriced FROM `Pharmacy_Store_Items` WHERE `selling_price` IS NULL;
--   -- must be 0. If not: price those rows through the store screen, then roll back.
--
-- No quantity is touched by this rollback, and no batch id is recoverable once dropped —
-- Accounting would have to redeliver the events to repopulate.

ALTER TABLE `Pharmacy_Store_Items`
  MODIFY COLUMN `selling_price` DECIMAL(12,2) NOT NULL;

ALTER TABLE `inventory_items`
  DROP INDEX `idx_inventory_items_external_batch_id`,
  DROP COLUMN `external_batch_id`;

ALTER TABLE `Pharmacy_Store_Histories`
  DROP INDEX `idx_pharmacy_store_histories_external_batch_id`,
  DROP COLUMN `external_batch_id`;


--
-- Deploy rehearsal checks (run on a RESTORED COPY, never on live).
--
-- 1. Snapshot before migrating, re-run after, and diff — the two result sets must be IDENTICAL.
--    This script changes no quantity and no price; anything that moves is a defect in the script.
--
--    SELECT drug_id, drug_type,
--           SUM(quantity_received)  AS total_received,
--           SUM(quantity_remaining) AS total_remaining,
--           SUM(unit_price)         AS total_unit_price,
--           SUM(selling_price)      AS total_selling_price,
--           COUNT(*)                AS row_count
--    FROM `Pharmacy_Store_Items`
--    WHERE status = 'Active'
--    GROUP BY drug_id, drug_type
--    ORDER BY drug_id, drug_type;
--
-- 2. Every pre-existing delivery and layer must land NULL — there is no backfill, by design:
--
--    SELECT COUNT(*) AS claimed_deliveries FROM `Pharmacy_Store_Histories`
--    WHERE `external_batch_id` IS NOT NULL;
--    -- must be 0 immediately after migration
--
--    SELECT COUNT(*) AS claimed_layers FROM `inventory_items`
--    WHERE `external_batch_id` IS NOT NULL;
--    -- must be 0 immediately after migration
--
-- 3. No row may be unpriced as a RESULT of this migration — it only permits the state:
--
--    SELECT COUNT(*) AS unpriced FROM `Pharmacy_Store_Items` WHERE `selling_price` IS NULL;
--    -- must be 0 immediately after migration; rises only as Accounting-originated receipts arrive
--    -- without a price, and each of those is undispensable until a human prices it
--
-- 4. Nullability landed as intended, and cost did NOT become nullable with it:
--
--    SELECT TABLE_NAME, COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE
--    FROM information_schema.COLUMNS
--    WHERE TABLE_SCHEMA = DATABASE()
--      AND (COLUMN_NAME = 'external_batch_id'
--           OR (TABLE_NAME = 'Pharmacy_Store_Items'
--               AND COLUMN_NAME IN ('selling_price','unit_price','total_price')))
--    ORDER BY TABLE_NAME, COLUMN_NAME;
--    -- expect: both external_batch_id = YES, varchar(36)
--    --         selling_price = YES        (this migration's change)
--    --         unit_price    = NO         (unchanged — cost is always known at receipt)
--    --         total_price   = NO         (unchanged)
--
-- 5. NON-unique, deliberately — a redelivery must be a harmless re-write:
--
--    SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE
--    FROM information_schema.STATISTICS
--    WHERE TABLE_SCHEMA = DATABASE() AND INDEX_NAME LIKE '%external_batch_id%';
--    -- expect 2 rows, both NON_UNIQUE = 1
--
--
-- Known data conditions on `ehmrs_prod` as at 2026-08-31, which this script does NOT address and
-- which a deployer should be aware of (each is filed separately):
--
--   * 12 (drug_id, drug_type) pairs hold DUPLICATE Active rows — the one-row-per-drug-per-class
--     rule is application-level with no unique index behind it. A `stock.received` naming such a
--     pair is refused rather than filed into an arbitrary row. Merge the duplicates, then replay.
--
--   * 586 rows carry a NEGATIVE `quantity_received` (worst −56,700), and `total_price` is
--     sign-flipped with them: SUM(total_price) over the table is −₦44,301,228. See EMR issue #26.
--
--   * Stock is overstated ~2.16× by the price-class fan-out (811,810 units recorded against
--     376,650 real). See EMR issue #25 — settle before Accounting #36's three-way match.
