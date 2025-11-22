-- =====================================================
-- Combined Migration: Update Triage and Observation Tables
-- Replace RVS with FBC and RBS
-- =====================================================
-- This migration updates both Triages and Observations tables:
-- 1. Add FBC (Full Blood Count) column to both tables
-- 2. Add RBS (Random Blood Sugar) column to both tables
-- 3. Remove RVS (Rapid Viral Screening) column from both tables
-- 
-- Created: 2025-12-01
-- Purpose: Update vital signs documentation in both triage
--          and observation tables to use FBC and RBS
--          instead of RVS for better medical documentation
-- =====================================================

-- Start transaction
START TRANSACTION;

-- =====================================================
-- 1. UPDATE TRIAGES TABLE
-- =====================================================

-- Add FBC column to Triages
ALTER TABLE `Triages` 
ADD COLUMN `fbc` VARCHAR(255) NULL 
COMMENT 'Full Blood Count result';

-- Add RBS column to Triages
ALTER TABLE `Triages` 
ADD COLUMN `rbs` VARCHAR(255) NULL 
COMMENT 'Random Blood Sugar result';

-- Remove RVS column from Triages
ALTER TABLE `Triages` 
DROP COLUMN `rvs`;

-- =====================================================
-- 2. UPDATE OBSERVATIONS TABLE
-- =====================================================

-- Add FBC column to Observations
ALTER TABLE `Observations` 
ADD COLUMN `fbc` VARCHAR(255) NULL 
COMMENT 'Full Blood Count result';

-- Add RBS column to Observations
ALTER TABLE `Observations` 
ADD COLUMN `rbs` VARCHAR(255) NULL 
COMMENT 'Random Blood Sugar result';

-- Remove RVS column from Observations
ALTER TABLE `Observations` 
DROP COLUMN `rvs`;

-- Commit transaction
COMMIT;

-- =====================================================
-- Migration completed successfully
-- =====================================================
-- Both Triages and Observations tables have been updated
-- with FBC and RBS columns, and RVS columns have been removed
-- =====================================================

