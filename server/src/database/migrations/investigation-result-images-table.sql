-- =====================================================
-- Investigation Result Images - Database Schema
-- =====================================================
--
-- This script creates the investigation result images table for
-- storing DICOM and standard medical images associated with
-- radiology investigation results.
--
-- Tables Created:
-- 1. Investigation_Result_Images - Medical image storage with metadata
--
-- Author: EHMRS Development Team
-- Date: October 12, 2025
-- Version: 1.0
-- =====================================================

-- Use the appropriate database
-- Uncomment and modify the line below if needed
-- USE ehmrs_database;

-- =====================================================
-- Table: Investigation_Result_Images
-- Purpose: Store medical images for radiology investigation results
-- =====================================================

CREATE TABLE IF NOT EXISTS `Investigation_Result_Images` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `investigation_result_id` INT(11) NOT NULL COMMENT 'Foreign key to Investigation_Results table',
  `file_path` VARCHAR(255) NOT NULL COMMENT 'Server file system path to the image file',
  `file_type` ENUM('DICOM', 'JPEG', 'PNG', 'GIF', 'TIFF') NOT NULL DEFAULT 'JPEG' COMMENT 'Type of image file',
  `file_size` BIGINT NOT NULL COMMENT 'File size in bytes',
  `dicom_metadata` TEXT DEFAULT NULL COMMENT 'DICOM metadata stored as JSON string (contains patient info, study details, etc.)',
  `upload_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date and time when the image was uploaded',
  `uploaded_by` INT(11) NOT NULL COMMENT 'Foreign key to Staffs table - who uploaded the image',
  `is_primary` TINYINT(1) DEFAULT 0 COMMENT 'Indicates if this is the primary/featured image for the result',
  `display_order` INT(11) DEFAULT 0 COMMENT 'Display order for sorting images (0-based index)',
  `original_filename` VARCHAR(255) DEFAULT NULL COMMENT 'Original filename as uploaded by user',
  `thumbnail_path` VARCHAR(255) DEFAULT NULL COMMENT 'Path to thumbnail image for quick preview',
  `description` TEXT DEFAULT NULL COMMENT 'Optional description or notes about the image',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  -- Foreign key constraints
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
  -- Performance indexes
  INDEX `idx_investigation_result_images_result_id` (`investigation_result_id`),
  INDEX `idx_investigation_result_images_uploaded_by` (`uploaded_by`),
  INDEX `idx_investigation_result_images_primary` (`investigation_result_id`, `is_primary`),
  INDEX `idx_investigation_result_images_order` (`investigation_result_id`, `display_order`),
  INDEX `idx_investigation_result_images_file_type` (`file_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Medical images for radiology investigation results';

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================
-- Uncomment the lines below to insert sample image records
-- NOTE: Ensure Investigation_Results and Staffs records exist first

/*
INSERT INTO `Investigation_Result_Images` (
  `investigation_result_id`,
  `file_path`,
  `file_type`,
  `file_size`,
  `dicom_metadata`,
  `upload_date`,
  `uploaded_by`,
  `is_primary`,
  `display_order`,
  `original_filename`,
  `thumbnail_path`,
  `description`
) VALUES
-- Sample DICOM image
(
  1,
  'src/public/radiology-images/investigations/1/chest-xray-1634567890-a1b2c3d4e5f6.dcm',
  'DICOM',
  2048576,
  JSON_OBJECT(
    'patientName', 'ANONYMIZED',
    'studyDate', '20251012',
    'modality', 'CR',
    'studyDescription', 'Chest X-Ray PA View',
    'rows', 2048,
    'columns', 2048
  ),
  NOW(),
  1,
  1,
  0,
  'chest-xray-frontal.dcm',
  'src/public/radiology-images/investigations/1/thumbnails/chest-xray-1634567890-a1b2c3d4e5f6-thumb.jpg',
  'Primary frontal chest radiograph'
),
-- Sample JPEG image
(
  1,
  'src/public/radiology-images/investigations/1/chest-xray-1634567891-b2c3d4e5f6g7.jpg',
  'JPEG',
  524288,
  NULL,
  NOW(),
  1,
  0,
  1,
  'chest-xray-lateral.jpg',
  'src/public/radiology-images/investigations/1/thumbnails/chest-xray-1634567891-b2c3d4e5f6g7-thumb.jpg',
  'Lateral view chest radiograph'
),
-- Sample PNG ultrasound image
(
  2,
  'src/public/radiology-images/investigations/2/ultrasound-1634567892-c3d4e5f6g7h8.png',
  'PNG',
  1048576,
  NULL,
  NOW(),
  2,
  1,
  0,
  'abdominal-ultrasound.png',
  'src/public/radiology-images/investigations/2/thumbnails/ultrasound-1634567892-c3d4e5f6g7h8-thumb.jpg',
  'Abdominal ultrasound study'
);
*/

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these queries to verify the table was created correctly

-- Check table structure
-- DESC Investigation_Result_Images;

-- Check foreign keys
-- SELECT
--   CONSTRAINT_NAME,
--   TABLE_NAME,
--   COLUMN_NAME,
--   REFERENCED_TABLE_NAME,
--   REFERENCED_COLUMN_NAME
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
-- WHERE TABLE_NAME = 'Investigation_Result_Images'
--   AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Check indexes
-- SHOW INDEX FROM Investigation_Result_Images;

-- Count total images
-- SELECT COUNT(*) as total_images FROM Investigation_Result_Images;

-- Get recent uploads
-- SELECT
--   id,
--   investigation_result_id,
--   file_type,
--   file_size,
--   is_primary,
--   original_filename,
--   upload_date
-- FROM Investigation_Result_Images
-- ORDER BY upload_date DESC
-- LIMIT 10;

-- =====================================================
-- Useful Image Management Queries
-- =====================================================

-- Get all images for a specific investigation result (ordered by display_order)
-- SELECT
--   id,
--   file_path,
--   file_type,
--   file_size,
--   is_primary,
--   display_order,
--   original_filename,
--   thumbnail_path,
--   description,
--   upload_date
-- FROM Investigation_Result_Images
-- WHERE investigation_result_id = 1
-- ORDER BY display_order ASC;

-- Get only DICOM images
-- SELECT
--   id,
--   investigation_result_id,
--   file_path,
--   original_filename,
--   file_size,
--   upload_date
-- FROM Investigation_Result_Images
-- WHERE file_type = 'DICOM'
-- ORDER BY upload_date DESC;

-- Get primary image for each investigation result
-- SELECT
--   iri.investigation_result_id,
--   iri.id as image_id,
--   iri.file_path,
--   iri.file_type,
--   iri.thumbnail_path,
--   iri.original_filename
-- FROM Investigation_Result_Images iri
-- WHERE iri.is_primary = 1;

-- Get images by uploader (staff audit)
-- SELECT
--   s.fullname as uploader_name,
--   iri.id,
--   iri.investigation_result_id,
--   iri.file_type,
--   iri.original_filename,
--   iri.upload_date
-- FROM Investigation_Result_Images iri
-- JOIN Staffs s ON iri.uploaded_by = s.id
-- WHERE iri.uploaded_by = 1
-- ORDER BY iri.upload_date DESC;

-- Get storage statistics by file type
-- SELECT
--   file_type,
--   COUNT(*) as image_count,
--   SUM(file_size) as total_size_bytes,
--   ROUND(SUM(file_size) / 1024 / 1024, 2) as total_size_mb,
--   ROUND(AVG(file_size) / 1024 / 1024, 2) as avg_size_mb,
--   MIN(upload_date) as first_upload,
--   MAX(upload_date) as last_upload
-- FROM Investigation_Result_Images
-- GROUP BY file_type;

-- Get investigation results with image counts
-- SELECT
--   ir.id as result_id,
--   COUNT(iri.id) as image_count,
--   SUM(iri.file_size) as total_storage_bytes,
--   ROUND(SUM(iri.file_size) / 1024 / 1024, 2) as total_storage_mb,
--   SUM(CASE WHEN iri.file_type = 'DICOM' THEN 1 ELSE 0 END) as dicom_count,
--   SUM(CASE WHEN iri.is_primary = 1 THEN 1 ELSE 0 END) as primary_count
-- FROM Investigation_Results ir
-- LEFT JOIN Investigation_Result_Images iri ON ir.id = iri.investigation_result_id
-- GROUP BY ir.id
-- HAVING image_count > 0;

-- Get images uploaded in the last 24 hours
-- SELECT
--   id,
--   investigation_result_id,
--   file_type,
--   original_filename,
--   file_size,
--   upload_date,
--   uploaded_by
-- FROM Investigation_Result_Images
-- WHERE upload_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
-- ORDER BY upload_date DESC;

-- Get large images (over 10MB)
-- SELECT
--   id,
--   investigation_result_id,
--   original_filename,
--   file_type,
--   ROUND(file_size / 1024 / 1024, 2) as size_mb,
--   upload_date
-- FROM Investigation_Result_Images
-- WHERE file_size > 10485760
-- ORDER BY file_size DESC;

-- Find investigation results with missing primary images
-- SELECT DISTINCT
--   ir.id as result_id,
--   COUNT(iri.id) as total_images
-- FROM Investigation_Results ir
-- JOIN Investigation_Result_Images iri ON ir.id = iri.investigation_result_id
-- LEFT JOIN Investigation_Result_Images primary_img
--   ON ir.id = primary_img.investigation_result_id
--   AND primary_img.is_primary = 1
-- WHERE primary_img.id IS NULL
-- GROUP BY ir.id;

-- Get most active uploaders
-- SELECT
--   s.id as staff_id,
--   s.fullname,
--   COUNT(iri.id) as uploads_count,
--   SUM(iri.file_size) as total_uploaded_bytes,
--   ROUND(SUM(iri.file_size) / 1024 / 1024 / 1024, 2) as total_uploaded_gb,
--   MIN(iri.upload_date) as first_upload,
--   MAX(iri.upload_date) as last_upload
-- FROM Staffs s
-- JOIN Investigation_Result_Images iri ON s.id = iri.uploaded_by
-- GROUP BY s.id, s.fullname
-- ORDER BY uploads_count DESC
-- LIMIT 10;

-- =====================================================
-- Administrative Queries
-- =====================================================

-- Update display order for images in an investigation result
-- UPDATE Investigation_Result_Images
-- SET display_order = CASE id
--   WHEN 1 THEN 0
--   WHEN 2 THEN 1
--   WHEN 3 THEN 2
-- END
-- WHERE id IN (1, 2, 3);

-- Set a new primary image (unset old primary first)
-- START TRANSACTION;
-- UPDATE Investigation_Result_Images
-- SET is_primary = 0
-- WHERE investigation_result_id = 1;
--
-- UPDATE Investigation_Result_Images
-- SET is_primary = 1
-- WHERE id = 5 AND investigation_result_id = 1;
-- COMMIT;

-- Delete images for a specific investigation result
-- DELETE FROM Investigation_Result_Images
-- WHERE investigation_result_id = 999;

-- =====================================================
-- Maintenance Queries
-- =====================================================

-- Get total storage used
-- SELECT
--   COUNT(*) as total_images,
--   SUM(file_size) as total_bytes,
--   ROUND(SUM(file_size) / 1024 / 1024, 2) as total_mb,
--   ROUND(SUM(file_size) / 1024 / 1024 / 1024, 2) as total_gb
-- FROM Investigation_Result_Images;

-- Get table size and index size
-- SELECT
--   table_name,
--   ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Total Size (MB)",
--   ROUND((data_length / 1024 / 1024), 2) AS "Data Size (MB)",
--   ROUND((index_length / 1024 / 1024), 2) AS "Index Size (MB)",
--   table_rows AS "Row Count"
-- FROM information_schema.TABLES
-- WHERE table_schema = DATABASE()
--   AND table_name = 'Investigation_Result_Images';

-- Identify orphaned images (investigation result doesn't exist)
-- SELECT iri.*
-- FROM Investigation_Result_Images iri
-- LEFT JOIN Investigation_Results ir ON iri.investigation_result_id = ir.id
-- WHERE ir.id IS NULL;

-- Identify images uploaded by deleted staff (shouldn't happen due to RESTRICT)
-- SELECT iri.*
-- FROM Investigation_Result_Images iri
-- LEFT JOIN Staffs s ON iri.uploaded_by = s.id
-- WHERE s.id IS NULL;

-- Optimize table (defragment and update statistics)
-- OPTIMIZE TABLE Investigation_Result_Images;

-- Analyze table (update index statistics)
-- ANALYZE TABLE Investigation_Result_Images;

-- Check table for corruption
-- CHECK TABLE Investigation_Result_Images;

-- =====================================================
-- Backup Queries
-- =====================================================

-- Export image metadata to CSV (without binary data)
-- SELECT
--   id,
--   investigation_result_id,
--   file_type,
--   file_size,
--   original_filename,
--   is_primary,
--   display_order,
--   upload_date,
--   uploaded_by,
--   description
-- INTO OUTFILE '/tmp/investigation_images_backup.csv'
-- FIELDS TERMINATED BY ','
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\n'
-- FROM Investigation_Result_Images;

-- =====================================================
-- Rollback Script (Use with caution)
-- =====================================================
-- Uncomment to drop the Investigation_Result_Images table
-- WARNING: This will permanently delete all image records!
-- Physical image files will remain on disk and need manual deletion.

-- DROP TABLE IF EXISTS `Investigation_Result_Images`;

-- =====================================================
-- End of Script
-- =====================================================

-- =====================================================
-- Notes for Developers
-- =====================================================
--
-- 1. File Storage:
--    - Physical image files are stored on the server filesystem
--    - This table only stores metadata and file paths
--    - Always ensure file_path matches actual file location
--
-- 2. DICOM Metadata:
--    - Stored as JSON text in dicom_metadata column
--    - Contains patient info, study details, image parameters
--    - May contain PHI - handle according to HIPAA requirements
--
-- 3. Primary Images:
--    - Only ONE image per investigation_result_id should be primary
--    - Use transaction when changing primary images
--    - Primary image used for thumbnails and quick previews
--
-- 4. Display Order:
--    - 0-based index for image ordering
--    - Should be sequential (0, 1, 2, 3...)
--    - Used for consistent image gallery display
--
-- 5. Foreign Key Constraints:
--    - investigation_result_id: CASCADE delete (images deleted with result)
--    - uploaded_by: RESTRICT delete (cannot delete staff with uploads)
--
-- 6. File Size Limits:
--    - Maximum per file: 100MB (configured in multer)
--    - Maximum files per upload: 20
--    - Monitor total storage regularly
--
-- 7. Security:
--    - All file access should be logged (audit_logs table)
--    - Validate file types using magic bytes, not just extension
--    - Implement role-based access control
--    - Rate limit upload endpoints
--
-- =====================================================
