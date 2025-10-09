-- ============================================================================
-- Laboratory Form Templates System - SQL Migration Script
-- ============================================================================
-- This script creates the database structure for the dynamic form builder system
-- Run this script manually if you prefer SQL over Sequelize migrations
-- ============================================================================

-- ============================================================================
-- 1. CREATE LAB_FORM_TEMPLATES TABLE
-- ============================================================================
-- Main table storing form template definitions as JSON schemas

CREATE TABLE IF NOT EXISTS `Lab_Form_Templates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT 'Human-readable template name',
  `code` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique identifier code for the template',
  `description` TEXT NULL COMMENT 'Description of what this form is used for',
  `category` VARCHAR(100) NULL COMMENT 'e.g., Hematology, Chemistry, Microbiology, Hormonal, etc.',
  `schema_json` JSON NOT NULL COMMENT 'JSON schema defining form structure, fields, and validation rules',
  `pdf_config` JSON NULL COMMENT 'Configuration for PDF generation layout and formatting',
  `version` VARCHAR(20) NOT NULL DEFAULT '1.0' COMMENT 'Current version of the template',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether this template is currently active/available',
  `is_system_template` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'System templates cannot be deleted (core forms)',
  `created_by` INT NULL COMMENT 'Staff ID who created this template',
  `updated_by` INT NULL COMMENT 'Staff ID who last updated this template',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  -- Foreign Keys
  CONSTRAINT `fk_lab_form_templates_created_by`
    FOREIGN KEY (`created_by`) REFERENCES `Staffs` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,

  CONSTRAINT `fk_lab_form_templates_updated_by`
    FOREIGN KEY (`updated_by`) REFERENCES `Staffs` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,

  -- Indexes for performance
  INDEX `idx_lab_form_templates_code` (`code`),
  INDEX `idx_lab_form_templates_active` (`is_active`),
  INDEX `idx_lab_form_templates_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores dynamic laboratory test result form templates as JSON schemas';


-- ============================================================================
-- 2. CREATE LAB_FORM_TEMPLATE_VERSIONS TABLE
-- ============================================================================
-- Audit trail table for tracking form template version history

CREATE TABLE IF NOT EXISTS `Lab_Form_Template_Versions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `template_id` INT NOT NULL COMMENT 'Reference to the parent template',
  `version` VARCHAR(20) NOT NULL COMMENT 'Version number (e.g., 1.0, 1.1, 2.0)',
  `schema_json` JSON NOT NULL COMMENT 'Historical JSON schema for this version',
  `pdf_config` JSON NULL COMMENT 'Historical PDF configuration for this version',
  `change_notes` TEXT NULL COMMENT 'Description of changes made in this version',
  `created_by` INT NULL COMMENT 'Staff ID who created this version',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  -- Foreign Keys
  CONSTRAINT `fk_lab_form_template_versions_template`
    FOREIGN KEY (`template_id`) REFERENCES `Lab_Form_Templates` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT `fk_lab_form_template_versions_created_by`
    FOREIGN KEY (`created_by`) REFERENCES `Staffs` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,

  -- Unique constraint: one version number per template
  CONSTRAINT `unique_template_version` UNIQUE (`template_id`, `version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Version history and audit trail for form template changes';


-- ============================================================================
-- 3. ADD FORM_TEMPLATE_ID TO TESTS TABLE
-- ============================================================================
-- Links tests to their form templates (replaces hardcoded result_form string)

ALTER TABLE `Tests`
ADD COLUMN `form_template_id` INT NULL
COMMENT 'Foreign key to Lab_Form_Templates - replaces result_form string'
AFTER `result_form`;

-- Add foreign key constraint
ALTER TABLE `Tests`
ADD CONSTRAINT `fk_tests_form_template`
  FOREIGN KEY (`form_template_id`) REFERENCES `Lab_Form_Templates` (`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for performance
CREATE INDEX `idx_tests_form_template_id` ON `Tests` (`form_template_id`);


-- ============================================================================
-- 4. SEED INITIAL FORM TEMPLATES
-- ============================================================================
-- Insert the 16 core system form templates

-- Note: The result_form column in Tests table is kept for backward compatibility
-- Once all tests are migrated to use form_template_id, result_form can be deprecated

INSERT INTO `Lab_Form_Templates` (
  `name`, `code`, `description`, `category`, `version`, `is_active`, `is_system_template`,
  `schema_json`, `pdf_config`, `createdAt`, `updatedAt`
) VALUES

-- ============================================================================
-- DEFAULT RESULT FORM
-- ============================================================================
(
  'Default Result Form',
  'DefaultResultForm',
  'Simple text area for general test results',
  'Other',
  '1.0',
  1,
  1,
  '{
    "formId": "DEFAULT_v1",
    "formName": "Default Result Form",
    "formType": "list",
    "version": "1.0",
    "sections": [
      {
        "id": "result",
        "type": "list",
        "fields": [
          {
            "id": "result",
            "label": "Result",
            "type": "textarea",
            "validation": { "required": false }
          }
        ]
      }
    ],
    "pdfConfig": {
      "layout": "list",
      "showUnit": false
    }
  }',
  '{
    "layout": "list",
    "showUnit": false
  }',
  NOW(),
  NOW()
),

-- ============================================================================
-- FULL BLOOD COUNT (FBC) FORM
-- ============================================================================
(
  'Full Blood Count (FBC)',
  'FBCForm',
  'Complete blood count with differential and RBC morphology',
  'Hematology',
  '1.0',
  1,
  1,
  '{
    "formId": "FBC_v1",
    "formName": "Full Blood Count",
    "formType": "table",
    "version": "1.0",
    "sections": [
      {
        "id": "main_parameters",
        "title": "Primary Parameters",
        "type": "table",
        "fields": [
          {
            "id": "wbc",
            "label": "WBC",
            "type": "number",
            "unit": "x10^3/ul",
            "validation": { "min": 0, "decimalPlaces": 2 },
            "referenceRanges": {
              "child": { "min": 5, "max": 19, "display": "5 - 19" },
              "adultMale": { "min": 3.3, "max": 10.0, "display": "3.3 - 10.0" },
              "adultFemale": { "min": 3.4, "max": 9.8, "display": "3.4 - 9.8" }
            },
            "abnormalDetection": { "enabled": true, "ageDependent": true, "sexDependent": true }
          },
          {
            "id": "rbc",
            "label": "RBC",
            "type": "number",
            "unit": "x10^4/ul",
            "validation": { "min": 0, "decimalPlaces": 2 },
            "referenceRanges": {
              "child": { "min": 3.9, "max": 5.3, "display": "3.9 - 5.3" },
              "adultMale": { "min": 4.35, "max": 5.9, "display": "4.35 - 5.9" },
              "adultFemale": { "min": 3.69, "max": 5.19, "display": "3.69 - 5.19" }
            },
            "abnormalDetection": { "enabled": true, "ageDependent": true, "sexDependent": true }
          },
          {
            "id": "hgb",
            "label": "HGB",
            "type": "number",
            "unit": "g/dl",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "child": { "min": 9.5, "max": 14.1, "display": "9.5 - 14.1" },
              "adultMale": { "min": 13.7, "max": 16.7, "display": "13.7 - 16.7" },
              "adultFemale": { "min": 11.7, "max": 14.5, "display": "11.7 - 14.5" }
            },
            "abnormalDetection": { "enabled": true, "ageDependent": true, "sexDependent": true }
          },
          {
            "id": "hct",
            "label": "HCT",
            "type": "number",
            "unit": "%",
            "validation": { "min": 0, "max": 100, "decimalPlaces": 1 },
            "referenceRanges": {
              "child": { "min": 30, "max": 40, "display": "30 - 40" },
              "adultMale": { "min": 40.5, "max": 49.7, "display": "40.5 - 49.7" },
              "adultFemale": { "min": 34.1, "max": 44.3, "display": "34.1 - 44.3" }
            },
            "abnormalDetection": { "enabled": true, "ageDependent": true, "sexDependent": true }
          },
          {
            "id": "mcv",
            "label": "MCV",
            "type": "number",
            "unit": "fl",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "child": { "min": 70, "max": 84, "display": "70 - 84" },
              "adultMale": { "min": 79.7, "max": 92.0, "display": "79.7 - 92.0" },
              "adultFemale": { "min": 81.5, "max": 96.7, "display": "81.5 - 96.7" }
            },
            "abnormalDetection": { "enabled": true, "ageDependent": true, "sexDependent": true }
          },
          {
            "id": "mch",
            "label": "MCH",
            "type": "number",
            "unit": "pg",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "child": { "min": 23, "max": 29, "display": "23 - 29" },
              "adultMale": { "min": 26.1, "max": 33.3, "display": "26.1 - 33.3" },
              "adultFemale": { "min": 26.5, "max": 33.5, "display": "26.5 - 33.5" }
            },
            "abnormalDetection": { "enabled": true, "ageDependent": true, "sexDependent": true }
          },
          {
            "id": "mchc",
            "label": "MCHC",
            "type": "number",
            "unit": "g/dl",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "child": { "min": 31, "max": 35, "display": "31 - 35" },
              "adultMale": { "min": 32.2, "max": 35.0, "display": "32.2 - 35.0" },
              "adultFemale": { "min": 31.9, "max": 35.3, "display": "31.9 - 35.3" }
            },
            "abnormalDetection": { "enabled": true, "ageDependent": true, "sexDependent": true }
          },
          {
            "id": "rdw",
            "label": "RDW",
            "type": "number",
            "unit": "%",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "child": { "min": 11.6, "max": 14.4, "display": "11.6 - 14.4" },
              "adultMale": { "min": 11.6, "max": 14.4, "display": "11.6 - 14.4" }
            },
            "abnormalDetection": { "enabled": true, "ageDependent": true }
          },
          {
            "id": "plt",
            "label": "PLT",
            "type": "number",
            "unit": "x10^3/ul",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "child": { "min": 140, "max": 450, "display": "140 - 450" },
              "adultMale": { "min": 140, "max": 450, "display": "140 - 450" }
            },
            "abnormalDetection": { "enabled": true }
          }
        ]
      },
      {
        "id": "differential",
        "title": "Differential",
        "type": "conditional",
        "fields": [
          {
            "id": "neutrophils",
            "label": "Neutrophils",
            "type": "number",
            "unit": "%",
            "validation": { "min": 0, "max": 100, "decimalPlaces": 1 },
            "referenceRanges": {
              "child": { "min": 20, "max": 45, "display": "20 - 45" },
              "adultMale": { "min": 45, "max": 66, "display": "45 - 66" }
            }
          },
          {
            "id": "bands",
            "label": "Bands (Neutrophilic)",
            "type": "number",
            "unit": "%",
            "validation": { "min": 0, "max": 100, "decimalPlaces": 1 },
            "referenceRanges": {
              "child": { "min": 1, "max": 12, "display": "1 - 12" },
              "adultMale": { "min": 1, "max": 12, "display": "1 - 12" }
            }
          },
          {
            "id": "lymphocytes",
            "label": "Lymphocytes",
            "type": "number",
            "unit": "%",
            "validation": { "min": 0, "max": 100, "decimalPlaces": 1 },
            "referenceRanges": {
              "child": { "min": 46, "max": 76, "display": "46 - 76" },
              "adultMale": { "min": 20, "max": 40, "display": "20 - 40" }
            }
          },
          {
            "id": "atypical_lymphocytes",
            "label": "Atypical Lymphocytes",
            "type": "number",
            "unit": "%",
            "validation": { "min": 0, "max": 100, "decimalPlaces": 1 },
            "referenceRanges": {
              "child": { "min": 0, "max": 2, "display": "0 - 2" },
              "adultMale": { "min": 0, "max": 2, "display": "0 - 2" }
            }
          },
          {
            "id": "monocytes",
            "label": "Monocytes",
            "type": "number",
            "unit": "%",
            "validation": { "min": 0, "max": 100, "decimalPlaces": 1 },
            "referenceRanges": {
              "child": { "min": 1, "max": 5, "display": "1 - 5" },
              "adultMale": { "min": 4, "max": 10, "display": "4 - 10" }
            }
          },
          {
            "id": "eosinophils",
            "label": "Eosinophils",
            "type": "number",
            "unit": "%",
            "validation": { "min": 0, "max": 100, "decimalPlaces": 1 },
            "referenceRanges": {
              "child": { "min": 1, "max": 3, "display": "1 - 3" },
              "adultMale": { "min": 1, "max": 6, "display": "1 - 6" }
            }
          },
          {
            "id": "basophils",
            "label": "Basophils",
            "type": "number",
            "unit": "%",
            "validation": { "min": 0, "max": 100, "decimalPlaces": 1 },
            "referenceRanges": {
              "child": { "min": 0, "max": 2, "display": "0 - 2" },
              "adultMale": { "min": 0, "max": 2, "display": "0 - 2" }
            }
          }
        ]
      },
      {
        "id": "morphology",
        "title": "RBC Morphology",
        "type": "conditional",
        "fields": [
          { "id": "anisocytosis", "label": "Anisocytosis", "type": "text" },
          { "id": "microcytosis", "label": "Microcytosis", "type": "text" },
          { "id": "macrocytosis", "label": "Macrocytosis", "type": "text" },
          { "id": "hypochromia", "label": "Hypochromia", "type": "text" },
          { "id": "poikliocytosis", "label": "Poikliocytosis", "type": "text" }
        ]
      },
      {
        "id": "comments",
        "type": "list",
        "fields": [{ "id": "comments", "label": "Comments", "type": "textarea" }]
      }
    ],
    "pdfConfig": {
      "layout": "multiColumnTable",
      "columns": [
        { "key": "label", "header": "Test", "align": "left", "width": "20%" },
        { "key": "value", "header": "Result", "align": "right", "width": "15%" },
        { "key": "referenceRanges.child", "header": "Children Range", "align": "left", "width": "20%" },
        { "key": "referenceRanges.adultMale", "header": "Adult Male", "align": "left", "width": "20%" },
        { "key": "referenceRanges.adultFemale", "header": "Adult Female", "align": "left", "width": "15%" },
        { "key": "unit", "header": "Unit", "align": "left", "width": "10%" }
      ],
      "showUnit": true,
      "highlightAbnormal": true
    }
  }',
  '{
    "layout": "multiColumnTable",
    "columns": [
      { "key": "label", "header": "Test", "align": "left", "width": "20%" },
      { "key": "value", "header": "Result", "align": "right", "width": "15%" },
      { "key": "referenceRanges.child", "header": "Children Range", "align": "left", "width": "20%" },
      { "key": "referenceRanges.adultMale", "header": "Adult Male", "align": "left", "width": "20%" },
      { "key": "referenceRanges.adultFemale", "header": "Adult Female", "align": "left", "width": "15%" },
      { "key": "unit", "header": "Unit", "align": "left", "width": "10%" }
    ],
    "showUnit": true,
    "highlightAbnormal": true
  }',
  NOW(),
  NOW()
),

-- ============================================================================
-- GLUCOSE FORM
-- ============================================================================
(
  'Glucose Tests',
  'GlucoseForm',
  'Fasting, random, and 2-hour post-prandial glucose measurements',
  'Chemistry',
  '1.0',
  1,
  1,
  '{
    "formId": "GLUCOSE_v1",
    "formName": "Glucose Tests",
    "formType": "table",
    "version": "1.0",
    "sections": [
      {
        "id": "glucose_tests",
        "title": "Glucose Measurements",
        "type": "table",
        "fields": [
          {
            "id": "fasting_glu",
            "label": "Fasting glu.",
            "type": "number",
            "unit": "Mmol/L",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 3.9, "max": 5.8, "display": "3.9 - 5.8 Mmol/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "random_glu",
            "label": "Random glu.",
            "type": "number",
            "unit": "Mmol/L",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 3.9, "max": 6.7, "display": "3.9 - 6.7 Mmol/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "two_hour_pp",
            "label": "2hr pp",
            "type": "number",
            "unit": "Mmol/L",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 3.9, "max": 6.7, "display": "3.9 - 6.7 Mmol/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          { "id": "comments", "label": "Comments", "type": "textarea" }
        ]
      }
    ],
    "pdfConfig": {
      "layout": "table",
      "columns": [
        { "key": "label", "header": "Test", "align": "left" },
        { "key": "value", "header": "Result", "align": "right" },
        { "key": "referenceRanges.normal.display", "header": "Range", "align": "left" }
      ],
      "showUnit": false,
      "highlightAbnormal": true
    }
  }',
  '{
    "layout": "table",
    "columns": [
      { "key": "label", "header": "Test", "align": "left" },
      { "key": "value", "header": "Result", "align": "right" },
      { "key": "referenceRanges.normal.display", "header": "Range", "align": "left" }
    ],
    "showUnit": false,
    "highlightAbnormal": true
  }',
  NOW(),
  NOW()
);

-- Note: Remaining 13 form templates (Widal, Bilirubin, OGTT, Serum, LFT, Lipid,
-- SEUCr, Sputum, Stool, Urinalysis, UrineSwab, SemenAnalysis, HormonalAssay, Analyte)
-- will be added in subsequent iterations or via the seed migration JS file


-- ============================================================================
-- 5. VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the setup

-- Check if tables were created successfully
SELECT TABLE_NAME, TABLE_COMMENT
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('Lab_Form_Templates', 'Lab_Form_Template_Versions');

-- Check form templates count
SELECT COUNT(*) as template_count FROM Lab_Form_Templates;

-- List all form templates
SELECT id, name, code, category, version, is_active, is_system_template
FROM Lab_Form_Templates
ORDER BY category, name;

-- Check foreign key relationships
SELECT
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('Lab_Form_Templates', 'Lab_Form_Template_Versions', 'Tests')
  AND REFERENCED_TABLE_NAME IS NOT NULL;


-- ============================================================================
-- 6. ROLLBACK SCRIPT (Use with caution!)
-- ============================================================================
-- Uncomment and run these commands to completely remove the form template system

/*
-- Remove foreign key from Tests table
ALTER TABLE `Tests` DROP FOREIGN KEY `fk_tests_form_template`;
ALTER TABLE `Tests` DROP INDEX `idx_tests_form_template_id`;
ALTER TABLE `Tests` DROP COLUMN `form_template_id`;

-- Drop version history table
DROP TABLE IF EXISTS `Lab_Form_Template_Versions`;

-- Drop main templates table
DROP TABLE IF EXISTS `Lab_Form_Templates`;
*/


-- ============================================================================
-- NOTES AND MIGRATION STRATEGY
-- ============================================================================
/*
BACKWARD COMPATIBILITY:
- The `result_form` column in Tests table is kept for backward compatibility
- New tests should use `form_template_id` instead of `result_form`
- Migration strategy:
  1. Create form templates (this script)
  2. Update application code to use form_template_id
  3. Migrate existing tests: UPDATE Tests SET form_template_id = (SELECT id FROM Lab_Form_Templates WHERE code = result_form)
  4. Once all tests migrated, deprecate result_form column

SECURITY:
- is_system_template = 1 prevents deletion of core forms
- Only lab managers/admins should have access to modify templates
- Regular lab staff can only use existing templates

VERSION CONTROL:
- Lab_Form_Template_Versions maintains audit trail
- When updating a template, create new version record first
- Old test results reference specific versions for historical accuracy

PERFORMANCE:
- Indexes on code, is_active, category for fast lookups
- JSON columns store complex schemas efficiently
- Foreign keys ensure referential integrity
*/
