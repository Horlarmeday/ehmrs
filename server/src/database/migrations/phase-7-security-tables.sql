-- =====================================================
-- Phase 7: Security & Compliance - Database Schema
-- =====================================================
--
-- This script creates the audit logging tables for the
-- Radiology Imaging Modernization project Phase 7.
--
-- Tables Created:
-- 1. audit_logs - Comprehensive audit trail for all system operations
--
-- Author: EHMRS Development Team
-- Date: October 14, 2025
-- Version: 1.0
-- =====================================================

-- Use the appropriate database
-- Uncomment and modify the line below if needed
-- USE ehmrs_database;

-- =====================================================
-- Table: audit_logs
-- Purpose: Track all file access and system operations for HIPAA compliance
-- =====================================================

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `operation` ENUM(
    'upload',
    'download',
    'delete',
    'view',
    'approve',
    'update',
    'access'
  ) NOT NULL COMMENT 'Type of operation performed',
  `resource_type` VARCHAR(100) NOT NULL COMMENT 'Type of resource (e.g., investigation_image, patient_record, etc.)',
  `resource_id` INT(11) DEFAULT NULL COMMENT 'ID of the affected resource',
  `user_id` INT(11) DEFAULT NULL COMMENT 'ID of the user who performed the action',
  `user_type` VARCHAR(50) DEFAULT NULL COMMENT 'Type of user (staff, admin, system, anonymous)',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP address of the requester (supports IPv4 and IPv6)',
  `user_agent` TEXT DEFAULT NULL COMMENT 'Browser/client user agent string',
  `metadata` JSON DEFAULT NULL COMMENT 'Additional metadata about the operation (JSON format)',
  `status` ENUM('success', 'failure', 'warning') NOT NULL DEFAULT 'success' COMMENT 'Status of the operation',
  `error_message` TEXT DEFAULT NULL COMMENT 'Error message if operation failed',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the operation was performed',
  PRIMARY KEY (`id`),
  INDEX `idx_audit_logs_user_id` (`user_id`),
  INDEX `idx_audit_logs_resource` (`resource_type`, `resource_id`),
  INDEX `idx_audit_logs_operation` (`operation`),
  INDEX `idx_audit_logs_created_at` (`created_at`),
  INDEX `idx_audit_logs_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit log for tracking all system operations and file access';

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================
-- Uncomment the lines below to insert sample audit log entries

/*
INSERT INTO `audit_logs` (
  `operation`,
  `resource_type`,
  `resource_id`,
  `user_id`,
  `user_type`,
  `ip_address`,
  `user_agent`,
  `metadata`,
  `status`,
  `error_message`
) VALUES
(
  'upload',
  'investigation_image',
  1,
  100,
  'staff',
  '192.168.1.100',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  JSON_OBJECT(
    'fileName', 'chest-xray-12345.dcm',
    'fileSize', 2048576,
    'investigationResultId', 42,
    'originalFilename', 'chest-xray.dcm'
  ),
  'success',
  NULL
),
(
  'view',
  'investigation_image',
  1,
  101,
  'staff',
  '192.168.1.101',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  JSON_OBJECT(
    'imageId', 1,
    'originalFilename', 'chest-xray-12345.dcm',
    'investigationResultId', 42
  ),
  'success',
  NULL
),
(
  'delete',
  'investigation_image',
  2,
  100,
  'staff',
  '192.168.1.100',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  JSON_OBJECT(
    'imageId', 2,
    'originalFilename', 'duplicate-image.jpg',
    'investigationResultId', 43,
    'isPrimary', false
  ),
  'success',
  NULL
);
*/

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these queries to verify the table was created correctly

-- Check table structure
-- DESC audit_logs;

-- Check indexes
-- SHOW INDEX FROM audit_logs;

-- Count audit log entries
-- SELECT COUNT(*) as total_audit_logs FROM audit_logs;

-- Get recent audit logs
-- SELECT
--   id,
--   operation,
--   resource_type,
--   resource_id,
--   user_id,
--   status,
--   created_at
-- FROM audit_logs
-- ORDER BY created_at DESC
-- LIMIT 10;

-- =====================================================
-- Useful Audit Queries
-- =====================================================

-- Get all uploads in the last 24 hours
-- SELECT * FROM audit_logs
-- WHERE operation = 'upload'
--   AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
-- ORDER BY created_at DESC;

-- Get all operations by a specific user
-- SELECT
--   operation,
--   resource_type,
--   resource_id,
--   status,
--   created_at
-- FROM audit_logs
-- WHERE user_id = 100
-- ORDER BY created_at DESC;

-- Get all failed operations
-- SELECT * FROM audit_logs
-- WHERE status = 'failure'
-- ORDER BY created_at DESC;

-- Get operations for a specific resource
-- SELECT * FROM audit_logs
-- WHERE resource_type = 'investigation_image'
--   AND resource_id = 1
-- ORDER BY created_at DESC;

-- Get audit log summary by operation type
-- SELECT
--   operation,
--   COUNT(*) as count,
--   SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
--   SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failed
-- FROM audit_logs
-- GROUP BY operation;

-- Get most active users
-- SELECT
--   user_id,
--   COUNT(*) as operation_count,
--   MAX(created_at) as last_activity
-- FROM audit_logs
-- WHERE user_id IS NOT NULL
-- GROUP BY user_id
-- ORDER BY operation_count DESC
-- LIMIT 10;

-- =====================================================
-- Maintenance Queries
-- =====================================================

-- Archive old audit logs (older than 1 year)
-- Uncomment and run periodically based on retention policy
/*
CREATE TABLE IF NOT EXISTS `audit_logs_archive` LIKE `audit_logs`;

INSERT INTO `audit_logs_archive`
SELECT * FROM `audit_logs`
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

DELETE FROM `audit_logs`
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
*/

-- Get table size
-- SELECT
--   table_name,
--   ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)",
--   table_rows
-- FROM information_schema.TABLES
-- WHERE table_schema = DATABASE()
--   AND table_name = 'audit_logs';

-- =====================================================
-- Rollback Script (Use with caution)
-- =====================================================
-- Uncomment to drop the audit_logs table
-- WARNING: This will permanently delete all audit log data!

-- DROP TABLE IF EXISTS `audit_logs`;

-- =====================================================
-- End of Script
-- =====================================================
