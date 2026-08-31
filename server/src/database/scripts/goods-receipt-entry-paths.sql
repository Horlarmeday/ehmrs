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

ALTER TABLE `Pharmacy_Store_Items`
  MODIFY COLUMN `selling_price` DECIMAL(12,2) NOT NULL;

ALTER TABLE `inventory_items`
  DROP INDEX `idx_inventory_items_external_batch_id`,
  DROP COLUMN `external_batch_id`;

ALTER TABLE `Pharmacy_Store_Histories`
  DROP INDEX `idx_pharmacy_store_histories_external_batch_id`,
  DROP COLUMN `external_batch_id`;

