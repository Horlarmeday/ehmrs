-- Batch identity for the dispensary (Accounting issue #295).
--
-- SQL twin of the Sequelize migration
-- `20260828000000-add-batch-identity-to-inventory-items.js`, for DBA-led deployment and for the
-- production-dump rehearsal: restore a copy of the live database, snapshot the pre/post checks
-- below, run the Up section, and diff — every quantity must be identical and every pre-existing
-- row must land NULL on `pharmacy_store_id`.
--
-- Table names use the spellings of the live schema dump (`inventory_items` is lowercase there;
-- the other two are mixed-case). On a case-insensitive server both spellings resolve the same.
--
-- Nullable is PERMANENT, not a staging step: pre-existing rows are the sum of an unknown number
-- of batches and cannot be split retroactively — a null is visibly unknown, a guessed FK is
-- silently wrong. No code path may create a NULL layer after this migration (enforced in the
-- transfer path and test-guarded).

-- Up Migration
ALTER TABLE `inventory_items`
  ADD COLUMN `pharmacy_store_id` INT NULL DEFAULT NULL AFTER `brand`,
  ADD COLUMN `batch` VARCHAR(255) NULL DEFAULT NULL AFTER `pharmacy_store_id`;

ALTER TABLE `Inventory_Item_Histories`
  ADD COLUMN `pharmacy_store_id` INT NULL DEFAULT NULL AFTER `visit_id`;

-- The FK column joins the transfer key {drug_id, inventory_id, pharmacy_store_id} — index it.
CREATE INDEX `idx_inventory_items_pharmacy_store_id` ON `inventory_items` (`pharmacy_store_id`);
CREATE INDEX `idx_inventory_item_histories_pharmacy_store_id`
  ON `Inventory_Item_Histories` (`pharmacy_store_id`);

-- Local, database-enforceable reference to the EMR's own store row (NOT Accounting's
-- external_batch_id). SET NULL: deleting a store row must not cascade-delete dispensary stock
-- or block the delete — the layer survives with visibly-unknown provenance instead.
ALTER TABLE `inventory_items`
  ADD CONSTRAINT `fk_inventory_items_pharmacy_store`
  FOREIGN KEY (`pharmacy_store_id`) REFERENCES `Pharmacy_Store_Items` (`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Inventory_Item_Histories`
  ADD CONSTRAINT `fk_inventory_item_histories_pharmacy_store`
  FOREIGN KEY (`pharmacy_store_id`) REFERENCES `Pharmacy_Store_Items` (`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Down Migration (rollback) — drops the identity columns only; no quantity is touched.
ALTER TABLE `Inventory_Item_Histories`
  DROP FOREIGN KEY `fk_inventory_item_histories_pharmacy_store`,
  DROP INDEX `idx_inventory_item_histories_pharmacy_store_id`,
  DROP COLUMN `pharmacy_store_id`;

ALTER TABLE `inventory_items`
  DROP FOREIGN KEY `fk_inventory_items_pharmacy_store`,
  DROP INDEX `idx_inventory_items_pharmacy_store_id`,
  DROP COLUMN `batch`,
  DROP COLUMN `pharmacy_store_id`;

--
-- Deploy rehearsal checks (run on a RESTORED COPY, never on live).
--
-- 1. Snapshot before migrating, re-run after, and diff — the two result sets must be identical:
--    SELECT drug_id, inventory_id,
--           SUM(quantity_remaining) AS total_remaining,
--           SUM(quantity_received)  AS total_received,
--           COUNT(*)                AS layer_count
--    FROM inventory_items
--    WHERE status = 'Active'
--    GROUP BY drug_id, inventory_id
--    ORDER BY drug_id, inventory_id;
--
--    (layer_count is expected to RISE afterwards only for transfers that happen between the two
--    snapshots — on a quiesced copy it must be identical too.)
--
-- 2. After migrating, every pre-existing row must be NULL on the new columns:
--    SELECT COUNT(*) AS legacy_rows FROM inventory_items WHERE pharmacy_store_id IS NULL;
--    -- must equal the pre-migration row count
--
--    SELECT COUNT(*) AS bad_batch_backfill FROM inventory_items WHERE `batch` IS NOT NULL;
--    -- must be 0 immediately after migration (backfill does not exist, by design)
--
-- 3. Both FKs present and pointing at the store table:
--    SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
--    FROM information_schema.REFERENTIAL_CONSTRAINTS
--    WHERE CONSTRAINT_NAME LIKE 'fk_inventory%pharmacy_store';
--    -- expect 2 rows, both referencing Pharmacy_Store_Items
