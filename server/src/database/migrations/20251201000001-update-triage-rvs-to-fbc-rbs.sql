-- =====================================================
-- Update Triage Table: Replace RVS with FBC and RBS
-- =====================================================
-- This migration updates the Triages table to:
-- 1. Add FBC (Full Blood Count) column
-- 2. Add RBS (Random Blood Sugar) column
-- 3. Remove RVS (Rapid Viral Screening) column
-- 
-- Created: 2025-12-01
-- Purpose: Update triage vital signs to use FBC and RBS
--          instead of RVS for better medical documentation
-- =====================================================

-- Start transaction
START TRANSACTION;

-- =====================================================
-- 1. ADD FBC COLUMN TO TRIAGES TABLE
-- =====================================================

ALTER TABLE `Triages` 
ADD COLUMN `fbc` VARCHAR(255) NULL 
COMMENT 'Full Blood Count result';

-- =====================================================
-- 2. ADD RBS COLUMN TO TRIAGES TABLE
-- =====================================================

ALTER TABLE `Triages` 
ADD COLUMN `rbs` VARCHAR(255) NULL 
COMMENT 'Random Blood Sugar result';

-- =====================================================
-- 3. REMOVE RVS COLUMN FROM TRIAGES TABLE
-- =====================================================

ALTER TABLE `Triages` 
DROP COLUMN `rvs`;

-- Commit transaction
COMMIT;

-- =====================================================
-- Migration completed successfully
-- =====================================================

