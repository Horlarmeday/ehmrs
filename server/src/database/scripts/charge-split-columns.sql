-- #90: Accounting's resolved charge split on every prescribed line (ADR-0096/0097).
-- Eight nullable columns on each of the five billable line tables, written only by
-- the reverse inbox applier on `charge.split.updated`. No backfill.

-- Up Migration
ALTER TABLE `Prescribed_Drugs`
    ADD COLUMN `coverage_outcome` ENUM('capitated','ffs_claimable','co_pay','patient_liable','retainership') NULL AFTER `billing_status`,
    ADD COLUMN `split_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `patient_share` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `patient_net` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `insurer_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `insurer_net` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `corporate_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `corporate_net` DECIMAL(12,2) NULL AFTER `billing_status`;

ALTER TABLE `Additional_item_prescriptions`
    ADD COLUMN `coverage_outcome` ENUM('capitated','ffs_claimable','co_pay','patient_liable','retainership') NULL AFTER `billing_status`,
    ADD COLUMN `split_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `patient_share` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `patient_net` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `insurer_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `insurer_net` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `corporate_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `corporate_net` DECIMAL(12,2) NULL AFTER `billing_status`;

ALTER TABLE `Prescribed_Tests`
    ADD COLUMN `coverage_outcome` ENUM('capitated','ffs_claimable','co_pay','patient_liable','retainership') NULL AFTER `billing_status`,
    ADD COLUMN `split_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `patient_share` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `patient_net` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `insurer_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `insurer_net` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `corporate_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `corporate_net` DECIMAL(12,2) NULL AFTER `billing_status`;

ALTER TABLE `Prescribed_Investigations`
    ADD COLUMN `coverage_outcome` ENUM('capitated','ffs_claimable','co_pay','patient_liable','retainership') NULL AFTER `billing_status`,
    ADD COLUMN `split_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `patient_share` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `patient_net` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `insurer_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `insurer_net` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `corporate_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `corporate_net` DECIMAL(12,2) NULL AFTER `billing_status`;

ALTER TABLE `Prescribed_Services`
    ADD COLUMN `coverage_outcome` ENUM('capitated','ffs_claimable','co_pay','patient_liable','retainership') NULL AFTER `billing_status`,
    ADD COLUMN `split_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `patient_share` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `patient_net` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `insurer_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `insurer_net` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `corporate_amount` DECIMAL(12,2) NULL AFTER `billing_status`,
    ADD COLUMN `corporate_net` DECIMAL(12,2) NULL AFTER `billing_status`;

-- Down Migration (rollback)
ALTER TABLE `Prescribed_Drugs`
    DROP COLUMN `corporate_net`, DROP COLUMN `corporate_amount`, DROP COLUMN `insurer_net`, DROP COLUMN `insurer_amount`,
    DROP COLUMN `patient_net`, DROP COLUMN `patient_share`, DROP COLUMN `split_amount`, DROP COLUMN `coverage_outcome`;
ALTER TABLE `Additional_item_prescriptions`
    DROP COLUMN `corporate_net`, DROP COLUMN `corporate_amount`, DROP COLUMN `insurer_net`, DROP COLUMN `insurer_amount`,
    DROP COLUMN `patient_net`, DROP COLUMN `patient_share`, DROP COLUMN `split_amount`, DROP COLUMN `coverage_outcome`;
ALTER TABLE `Prescribed_Tests`
    DROP COLUMN `corporate_net`, DROP COLUMN `corporate_amount`, DROP COLUMN `insurer_net`, DROP COLUMN `insurer_amount`,
    DROP COLUMN `patient_net`, DROP COLUMN `patient_share`, DROP COLUMN `split_amount`, DROP COLUMN `coverage_outcome`;
ALTER TABLE `Prescribed_Investigations`
    DROP COLUMN `corporate_net`, DROP COLUMN `corporate_amount`, DROP COLUMN `insurer_net`, DROP COLUMN `insurer_amount`,
    DROP COLUMN `patient_net`, DROP COLUMN `patient_share`, DROP COLUMN `split_amount`, DROP COLUMN `coverage_outcome`;
ALTER TABLE `Prescribed_Services`
    DROP COLUMN `corporate_net`, DROP COLUMN `corporate_amount`, DROP COLUMN `insurer_net`, DROP COLUMN `insurer_amount`,
    DROP COLUMN `patient_net`, DROP COLUMN `patient_share`, DROP COLUMN `split_amount`, DROP COLUMN `coverage_outcome`;
