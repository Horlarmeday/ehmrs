-- =====================================================
-- Rollback: Restore RVS Column in Triage Table
-- =====================================================
-- This rollback script reverses the changes made in:
-- 20251201000001-update-triage-rvs-to-fbc-rbs.sql
-- 
-- Created: 2025-12-01
-- Purpose: Rollback migration to restore RVS column
--          and remove FBC and RBS columns from Triages table
-- =====================================================

-- Start transaction
START TRANSACTION;

-- =====================================================
-- 1. REMOVE FBC COLUMN FROM TRIAGES TABLE
-- =====================================================

ALTER TABLE `Triages` 
DROP COLUMN `fbc`;

-- =====================================================
-- 2. REMOVE RBS COLUMN FROM TRIAGES TABLE
-- =====================================================

ALTER TABLE `Triages` 
DROP COLUMN `rbs`;

-- =====================================================
-- 3. RESTORE RVS COLUMN TO TRIAGES TABLE
-- =====================================================

ALTER TABLE `Triages` 
ADD COLUMN `rvs` VARCHAR(255) NULL 
COMMENT 'Rapid Viral Screening result';

-- Commit transaction
COMMIT;

-- =====================================================
-- Rollback completed successfully
-- =====================================================

