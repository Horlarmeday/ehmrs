-- =====================================================
-- Update Observation Table: Replace RVS with FBC and RBS
-- =====================================================
-- This migration updates the Observations table to:
-- 1. Add FBC (Full Blood Count) column
-- 2. Add RBS (Random Blood Sugar) column
-- 3. Remove RVS (Rapid Viral Screening) column
-- 
-- Created: 2025-12-01
-- Purpose: Update observation vital signs to use FBC and RBS
--          instead of RVS for better medical documentation
-- =====================================================

-- Start transaction
START TRANSACTION;

-- =====================================================
-- 1. ADD FBC COLUMN TO OBSERVATIONS TABLE
-- =====================================================

ALTER TABLE `Observations` 
ADD COLUMN `fbc` VARCHAR(255) NULL 
COMMENT 'Full Blood Count result';

-- =====================================================
-- 2. ADD RBS COLUMN TO OBSERVATIONS TABLE
-- =====================================================

ALTER TABLE `Observations` 
ADD COLUMN `rbs` VARCHAR(255) NULL 
COMMENT 'Random Blood Sugar result';

-- =====================================================
-- 3. REMOVE RVS COLUMN FROM OBSERVATIONS TABLE
-- =====================================================

ALTER TABLE `Observations` 
DROP COLUMN `rvs`;

-- Commit transaction
COMMIT;

-- =====================================================
-- Migration completed successfully
-- =====================================================

