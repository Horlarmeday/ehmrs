-- =====================================================
-- Radiology Imaging Modernization - Complete Database Schema
-- =====================================================
--
-- This script creates all database tables for the
-- Radiology Imaging Modernization project.
--
-- Tables Created:
-- 1. Investigation_Result_Images - Medical image storage with metadata
-- 2. audit_logs - Comprehensive audit trail for HIPAA compliance
--
-- Author: EHMRS Development Team
-- Date: October 14, 2025
-- Version: 1.0
-- Phase: 3-7 Complete Implementation
-- =====================================================

-- Use the appropriate database
-- Uncomment and modify the line below if needed
-- USE ehmrs_database;

-- =====================================================
-- TABLE 1: Investigation_Result_Images
-- =====================================================

CREATE TABLE IF NOT EXISTS `Investigation_Result_Images` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `investigation_result_id` INT(11) NOT NULL COMMENT 'Foreign key to Investigation_Results table',
  `file_path` VARCHAR(255) NOT NULL COMMENT 'Server file system path to the image file',
  `file_type` ENUM('DICOM', 'JPEG', 'PNG', 'GIF', 'TIFF') NOT NULL DEFAULT 'JPEG' COMMENT 'Type of image file',
  `file_size` BIGINT NOT NULL COMMENT 'File size in bytes',
  `dicom_metadata` TEXT DEFAULT NULL COMMENT 'DICOM metadata stored as JSON string',
  `upload_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date and time when the image was uploaded',
  `uploaded_by` INT(11) NOT NULL COMMENT 'Foreign key to Staffs table',
  `is_primary` TINYINT(1) DEFAULT 0 COMMENT 'Primary/featured image flag',
  `display_order` INT(11) DEFAULT 0 COMMENT 'Display order for sorting images',
  `original_filename` VARCHAR(255) DEFAULT NULL COMMENT 'Original filename',
  `thumbnail_path` VARCHAR(255) DEFAULT NULL COMMENT 'Thumbnail path for quick preview',
  `description` TEXT DEFAULT NULL COMMENT 'Optional description or notes',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_investigation_result_images_result`
    FOREIGN KEY (`investigation_result_id`)
    REFERENCES `Investigation_Results` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_investigation_result_images_uploader`
    FOREIGN KEY (`uploaded_by`)
    REFERENCES `Staffs` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX `idx_investigation_result_images_result_id` (`investigation_result_id`),
  INDEX `idx_investigation_result_images_uploaded_by` (`uploaded_by`),
  INDEX `idx_investigation_result_images_primary` (`investigation_result_id`, `is_primary`),
  INDEX `idx_investigation_result_images_order` (`investigation_result_id`, `display_order`),
  INDEX `idx_investigation_result_images_file_type` (`file_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Medical images for radiology investigation results';

-- =====================================================
-- TABLE 2: audit_logs
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
  `resource_type` VARCHAR(100) NOT NULL COMMENT 'Type of resource (e.g., investigation_image)',
  `resource_id` INT(11) DEFAULT NULL COMMENT 'ID of the affected resource',
  `user_id` INT(11) DEFAULT NULL COMMENT 'ID of the user who performed the action',
  `user_type` VARCHAR(50) DEFAULT NULL COMMENT 'Type of user (staff, admin, system, anonymous)',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP address of the requester',
  `user_agent` TEXT DEFAULT NULL COMMENT 'Browser/client user agent string',
  `metadata` JSON DEFAULT NULL COMMENT 'Additional metadata (JSON format)',
  `status` ENUM('success', 'failure', 'warning') NOT NULL DEFAULT 'success' COMMENT 'Status of the operation',
  `error_message` TEXT DEFAULT NULL COMMENT 'Error message if operation failed',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_logs_user_id` (`user_id`),
  INDEX `idx_audit_logs_resource` (`resource_type`, `resource_id`),
  INDEX `idx_audit_logs_operation` (`operation`),
  INDEX `idx_audit_logs_created_at` (`created_at`),
  INDEX `idx_audit_logs_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit log for HIPAA compliance';

-- =====================================================
-- Verification Queries
-- =====================================================

-- Count records in both tables
SELECT
  'Investigation_Result_Images' as table_name,
  COUNT(*) as record_count,
  ROUND(SUM(file_size) / 1024 / 1024, 2) as total_storage_mb
FROM Investigation_Result_Images
UNION ALL
SELECT
  'audit_logs' as table_name,
  COUNT(*) as record_count,
  NULL as total_storage_mb
FROM audit_logs;

-- Show table structures
-- DESC Investigation_Result_Images;
-- DESC audit_logs;

-- Show all indexes
-- SHOW INDEX FROM Investigation_Result_Images;
-- SHOW INDEX FROM audit_logs;

-- =====================================================
-- Combined Statistics Query
-- =====================================================

-- Get comprehensive system statistics
SELECT
  -- Image statistics
  (SELECT COUNT(*) FROM Investigation_Result_Images) as total_images,
  (SELECT COUNT(DISTINCT investigation_result_id) FROM Investigation_Result_Images) as results_with_images,
  (SELECT COUNT(*) FROM Investigation_Result_Images WHERE file_type = 'DICOM') as dicom_images,
  (SELECT COUNT(*) FROM Investigation_Result_Images WHERE is_primary = 1) as primary_images,
  (SELECT ROUND(SUM(file_size) / 1024 / 1024 / 1024, 2) FROM Investigation_Result_Images) as total_storage_gb,
  -- Audit statistics
  (SELECT COUNT(*) FROM audit_logs) as total_audit_logs,
  (SELECT COUNT(*) FROM audit_logs WHERE operation = 'upload') as uploads_logged,
  (SELECT COUNT(*) FROM audit_logs WHERE operation = 'download') as downloads_logged,
  (SELECT COUNT(*) FROM audit_logs WHERE status = 'failure') as failed_operations,
  (SELECT COUNT(DISTINCT user_id) FROM audit_logs WHERE user_id IS NOT NULL) as unique_users_audited;

-- =====================================================
-- Combined Image and Audit Query
-- =====================================================

-- Get recent image uploads with audit trail
SELECT
  iri.id as image_id,
  iri.investigation_result_id,
  iri.original_filename,
  iri.file_type,
  ROUND(iri.file_size / 1024 / 1024, 2) as size_mb,
  iri.upload_date,
  s.fullname as uploaded_by_name,
  (SELECT COUNT(*)
   FROM audit_logs
   WHERE resource_type = 'investigation_image'
   AND resource_id = iri.id) as audit_log_count,
  (SELECT MAX(created_at)
   FROM audit_logs
   WHERE resource_type = 'investigation_image'
   AND resource_id = iri.id
   AND operation = 'view') as last_viewed
FROM Investigation_Result_Images iri
LEFT JOIN Staffs s ON iri.uploaded_by = s.id
ORDER BY iri.upload_date DESC
LIMIT 20;

-- =====================================================
-- Security and Compliance Report
-- =====================================================

-- HIPAA Compliance Report: File access audit summary
SELECT
  DATE(al.created_at) as audit_date,
  al.operation,
  COUNT(*) as operation_count,
  COUNT(DISTINCT al.user_id) as unique_users,
  COUNT(DISTINCT al.resource_id) as unique_images,
  SUM(CASE WHEN al.status = 'success' THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN al.status = 'failure' THEN 1 ELSE 0 END) as failed
FROM audit_logs al
WHERE al.resource_type = 'investigation_image'
  AND al.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(al.created_at), al.operation
ORDER BY audit_date DESC, operation_count DESC;

-- =====================================================
-- Storage and Performance Report
-- =====================================================

-- Monthly storage and upload trends
SELECT
  DATE_FORMAT(upload_date, '%Y-%m') as month,
  COUNT(*) as images_uploaded,
  COUNT(DISTINCT investigation_result_id) as unique_results,
  ROUND(SUM(file_size) / 1024 / 1024, 2) as storage_mb_added,
  ROUND(AVG(file_size) / 1024 / 1024, 2) as avg_image_size_mb,
  SUM(CASE WHEN file_type = 'DICOM' THEN 1 ELSE 0 END) as dicom_count,
  SUM(CASE WHEN file_type IN ('JPEG', 'PNG', 'GIF', 'TIFF') THEN 1 ELSE 0 END) as standard_image_count
FROM Investigation_Result_Images
GROUP BY DATE_FORMAT(upload_date, '%Y-%m')
ORDER BY month DESC;

-- =====================================================
-- Data Integrity Checks
-- =====================================================

-- Check for investigation results with duplicate primary images
SELECT
  investigation_result_id,
  COUNT(*) as primary_image_count
FROM Investigation_Result_Images
WHERE is_primary = 1
GROUP BY investigation_result_id
HAVING COUNT(*) > 1;

-- Check for gaps in display_order sequences
SELECT
  iri1.investigation_result_id,
  iri1.display_order as current_order,
  iri1.display_order + 1 as expected_next,
  MIN(iri2.display_order) as actual_next,
  (MIN(iri2.display_order) - iri1.display_order - 1) as gap_size
FROM Investigation_Result_Images iri1
LEFT JOIN Investigation_Result_Images iri2
  ON iri1.investigation_result_id = iri2.investigation_result_id
  AND iri2.display_order > iri1.display_order
GROUP BY iri1.investigation_result_id, iri1.display_order
HAVING gap_size > 0;

-- Check for audit logs without corresponding images (orphaned logs)
SELECT
  al.id as audit_log_id,
  al.operation,
  al.resource_id as image_id,
  al.created_at
FROM audit_logs al
WHERE al.resource_type = 'investigation_image'
  AND al.resource_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM Investigation_Result_Images iri
    WHERE iri.id = al.resource_id
  )
LIMIT 100;

-- =====================================================
-- Maintenance and Optimization
-- =====================================================

-- Optimize both tables
OPTIMIZE TABLE Investigation_Result_Images;
OPTIMIZE TABLE audit_logs;

-- Analyze both tables for query optimization
ANALYZE TABLE Investigation_Result_Images;
ANALYZE TABLE audit_logs;

-- =====================================================
-- Backup and Restore Commands
-- =====================================================

-- Export image metadata only (no binary file data)
-- mysqldump -u username -p database_name Investigation_Result_Images --no-data > schema_backup.sql
-- mysqldump -u username -p database_name Investigation_Result_Images > data_backup.sql

-- Export audit logs
-- mysqldump -u username -p database_name audit_logs > audit_backup.sql

-- Import
-- mysql -u username -p database_name < backup.sql

-- =====================================================
-- Rollback Script (DANGEROUS - Use with caution)
-- =====================================================
-- Uncomment to drop all radiology imaging tables
-- WARNING: This will permanently delete all data!

-- SET FOREIGN_KEY_CHECKS = 0;
-- DROP TABLE IF EXISTS `audit_logs`;
-- DROP TABLE IF EXISTS `Investigation_Result_Images`;
-- SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- End of Script
-- =====================================================

-- =====================================================
-- Quick Reference
-- =====================================================
--
-- Table Relationships:
-- Investigation_Result_Images → Investigation_Results (CASCADE delete)
-- Investigation_Result_Images → Staffs (RESTRICT delete)
-- audit_logs → (no foreign keys, references multiple tables)
--
-- Key Features:
-- ✓ Medical image storage (DICOM + standard formats)
-- ✓ HIPAA-compliant audit logging
-- ✓ Comprehensive indexing for performance
-- ✓ Foreign key constraints for data integrity
-- ✓ JSON metadata storage for flexibility
-- ✓ UTF-8MB4 for full Unicode support
--
-- Security Features:
-- ✓ All file operations logged
-- ✓ User tracking (who uploaded/accessed)
-- ✓ Operation status tracking (success/failure)
-- ✓ IP address and user agent logging
-- ✓ Cascade delete protection
--
-- Performance Features:
-- ✓ 10 indexes across both tables
-- ✓ Optimized for common query patterns
-- ✓ Efficient JOIN operations
-- ✓ Fast lookups by user, resource, date
--
-- =====================================================
