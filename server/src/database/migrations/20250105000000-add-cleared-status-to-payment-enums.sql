-- Migration Script: Add CLEARED status to payment-related enums
-- Date: 2025-01-05
-- Purpose: Support insurance claim workflow with CLEARED status for service authorization

-- =====================================================
-- Add CLEARED status to clinical_payments status enum
-- =====================================================

ALTER TABLE clinical_payments 
MODIFY COLUMN status ENUM(
  'PENDING',
  'PARTIAL', 
  'PAID',
  'CLEARED',
  'CANCELLED',
  'FAILED',
  'REFUNDED',
  'CONFIRMED',
  'SETTLED'
) NOT NULL DEFAULT 'PENDING';

-- =====================================================
-- Add CLEARED status to clinical_bill_items payment_status enum
-- =====================================================

ALTER TABLE clinical_bill_items 
MODIFY COLUMN payment_status ENUM(
  'PAID',
  'PARTIAL',
  'PENDING',
  'CLEARED'
) DEFAULT 'PENDING';

-- =====================================================
-- Add CLEARED status to clinical_bills payment_status enum (if not already present)
-- =====================================================

ALTER TABLE clinical_bills 
MODIFY COLUMN payment_status ENUM(
  'PENDING',
  'PARTIAL',
  'PAID',
  'CLEARED',
  'CANCELLED',
  'FAILED',
  'REFUNDED',
  'CONFIRMED',
  'SETTLED'
) DEFAULT 'PENDING';

-- =====================================================
-- Add CLEARED status to ClinicalPaymentItems payment_status enum
-- =====================================================

ALTER TABLE ClinicalPaymentItems 
MODIFY COLUMN payment_status ENUM(
  'PENDING',
  'PARTIAL',
  'PAID',
  'CLEARED'
) NOT NULL DEFAULT 'PENDING';

-- =====================================================
-- Verification Queries (Run these to verify changes)
-- =====================================================

-- Verify clinical_payments status enum
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'clinical_payments' 
  AND COLUMN_NAME = 'status';

-- Verify clinical_bill_items payment_status enum  
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'clinical_bill_items' 
  AND COLUMN_NAME = 'payment_status';

-- Verify clinical_bills payment_status enum
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'clinical_bills' 
  AND COLUMN_NAME = 'payment_status';

-- Verify ClinicalPaymentItems payment_status enum
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'ClinicalPaymentItems' 
  AND COLUMN_NAME = 'payment_status';

-- =====================================================
-- Rollback Script (if needed)
-- =====================================================

/*
-- To rollback, run these commands:

ALTER TABLE clinical_payments 
MODIFY COLUMN status ENUM(
  'PENDING',
  'PARTIAL', 
  'PAID',
  'CANCELLED',
  'FAILED',
  'REFUNDED',
  'CONFIRMED',
  'SETTLED'
) NOT NULL DEFAULT 'PENDING';

ALTER TABLE clinical_bill_items 
MODIFY COLUMN payment_status ENUM(
  'PAID',
  'PARTIAL',
  'PENDING'
) DEFAULT 'PENDING';

ALTER TABLE clinical_bills 
MODIFY COLUMN payment_status ENUM(
  'PENDING',
  'PARTIAL',
  'PAID',
  'CANCELLED',
  'FAILED',
  'REFUNDED',
  'CONFIRMED',
  'SETTLED'
) DEFAULT 'PENDING';

ALTER TABLE ClinicalPaymentItems 
MODIFY COLUMN payment_status ENUM(
  'PENDING',
  'PARTIAL',
  'PAID'
) NOT NULL DEFAULT 'PENDING';
*/

-- =====================================================
-- Notes
-- =====================================================

-- CLEARED Status Purpose:
-- - Used for insurance claims that are approved for service delivery
-- - Services can be provided while financial settlement is pending
-- - When insurance pays, status automatically updates from CLEARED to PAID
-- - This matches real-world healthcare insurance processing workflows

-- Workflow:
-- 1. Insurance claim submitted → status = CLEARED
-- 2. Services delivered to patient
-- 3. Insurance company processes claim
-- 4. Insurance pays → status automatically changes CLEARED to PAID (via Sequelize hook)

