
ALTER TABLE `Alerts`
  ADD COLUMN `severity` ENUM('Critical','Warning','Info') NOT NULL DEFAULT 'Warning' AFTER `status`;


-- ============================================================================
-- Down Migration (rollback)
-- ============================================================================

ALTER TABLE `Alerts`
  DROP COLUMN `severity`;
