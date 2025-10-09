-- ============================================================================
-- Laboratory Form Templates - Remaining Forms SQL Seed Migration
-- ============================================================================
-- This script seeds the remaining 13 laboratory form templates
-- Complements the initial 3 forms (Default, FBC, Glucose)
-- Run this after lab-form-templates.sql or as a standalone INSERT
-- ============================================================================

INSERT INTO `Lab_Form_Templates` (
  `name`, `code`, `description`, `category`, `version`, `is_active`, `is_system_template`,
  `schema_json`, `pdf_config`, `createdAt`, `updatedAt`
) VALUES

-- ============================================================================
-- LIVER FUNCTION TESTS (LFT) FORM
-- ============================================================================
(
  'Liver Function Tests (LFT)',
  'LFTForm',
  'Comprehensive liver function panel including enzymes, proteins, and bilirubin',
  'Chemistry',
  '1.0',
  1,
  1,
  '{
    "formId": "LFT_v1",
    "formName": "Liver Function Tests",
    "formType": "table",
    "version": "1.0",
    "sections": [
      {
        "id": "lft_parameters",
        "title": "Liver Function Tests",
        "type": "table",
        "fields": [
          {
            "id": "ast",
            "label": "AST",
            "type": "number",
            "unit": "IU/L",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 5.0, "max": 50, "display": "5.0 - 50 IU/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "alt",
            "label": "ALT",
            "type": "number",
            "unit": "IU/L",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 5.0, "max": 46, "display": "5.0 - 46 IU/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "alp",
            "label": "ALP",
            "type": "number",
            "unit": "IU/L",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "normal": { "min": 20, "max": 147, "display": "20 - 147 IU/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "tp",
            "label": "TP",
            "type": "number",
            "unit": "g/dl",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 6.2, "max": 8.0, "display": "6.2 - 8.0 g/dl" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "alb",
            "label": "ALB",
            "type": "number",
            "unit": "g/dl",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 3.5, "max": 5.5, "display": "3.5 - 5.5 g/dl" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "tb",
            "label": "TB",
            "type": "number",
            "unit": "mg/dl",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 0.2, "max": 1.2, "display": "0.2 - 1.2 mg/dl" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "db",
            "label": "DB",
            "type": "number",
            "unit": "mg/dl",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 0.0, "max": 0.4, "display": "0.0 - 0.4 mg/dl" }
            },
            "abnormalDetection": { "enabled": true }
          }
        ]
      },
      {
        "id": "comments",
        "type": "list",
        "fields": [{ "id": "comments", "label": "Comments", "type": "textarea" }]
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
),

-- ============================================================================
-- LIPID PROFILE FORM
-- ============================================================================
(
  'Lipid Profile',
  'LipidProfileForm',
  'Complete lipid panel including cholesterol, triglycerides, and lipoproteins',
  'Chemistry',
  '1.0',
  1,
  1,
  '{
    "formId": "LIPID_v1",
    "formName": "Lipid Profile",
    "formType": "table",
    "version": "1.0",
    "sections": [
      {
        "id": "lipid_parameters",
        "title": "Lipid Profile",
        "type": "table",
        "fields": [
          {
            "id": "chol",
            "label": "Chol",
            "type": "number",
            "unit": "mg/dl",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "normal": { "min": 140, "max": 220, "display": "140 - 220 mg/dl" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "vldl",
            "label": "VLDL",
            "type": "number",
            "unit": "mg/dl",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "normal": { "min": 15, "max": 50, "display": "15 - 50 mg/dl" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "hdl",
            "label": "HDL",
            "type": "number",
            "unit": "mg/dl",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "normal": { "min": 35, "max": 65, "display": "35 - 65 mg/dl" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "tg",
            "label": "TG",
            "type": "number",
            "unit": "mg/dl",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "normal": { "min": 60, "max": 165, "display": "60 - 165 mg/dl" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "ldl",
            "label": "LDL",
            "type": "number",
            "unit": "mg/dl",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "normal": { "display": "less than 130 mg/dl" }
            },
            "abnormalDetection": { "enabled": true }
          }
        ]
      },
      {
        "id": "comments",
        "type": "list",
        "fields": [{ "id": "comments", "label": "Comments", "type": "textarea" }]
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
),

-- ============================================================================
-- SERUM ELECTROLYTES, UREA & CREATININE (SEUCr) FORM
-- ============================================================================
(
  'Serum Electrolytes, Urea & Creatinine',
  'SEUCrForm',
  'Renal function panel including electrolytes, urea, and creatinine',
  'Chemistry',
  '1.0',
  1,
  1,
  '{
    "formId": "SEUCR_v1",
    "formName": "Serum Electrolytes, Urea & Creatinine",
    "formType": "table",
    "version": "1.0",
    "sections": [
      {
        "id": "serum_parameters",
        "title": "Serum Electrolytes & Renal Function",
        "type": "table",
        "fields": [
          {
            "id": "sodium",
            "label": "Na+",
            "type": "number",
            "unit": "Mmol/L",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 128, "max": 160, "display": "128 - 160 Mmol/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "potassium",
            "label": "K",
            "type": "number",
            "unit": "Mmol/L",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 3.5, "max": 5.5, "display": "3.5 - 5.5 Mmol/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "chlorine",
            "label": "CL",
            "type": "number",
            "unit": "Mmol/L",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "normal": { "min": 97, "max": 108, "display": "97 - 108 Mmol/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "hco3",
            "label": "HCO3",
            "type": "number",
            "unit": "Mmol/L",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "normal": { "min": 24, "max": 32, "display": "24 - 32 Mmol/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "urea",
            "label": "Urea",
            "type": "number",
            "unit": "Mmol/L",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "normal": { "min": 10, "max": 55, "display": "10 - 55 Mmol/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "chromium",
            "label": "Cr",
            "type": "number",
            "unit": "Mmol/L",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 0.7, "max": 1.4, "display": "0.7 - 1.4 Mmol/L" }
            },
            "abnormalDetection": { "enabled": true }
          }
        ]
      },
      {
        "id": "comments",
        "type": "list",
        "fields": [{ "id": "comments", "label": "Comments", "type": "textarea" }]
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
),

-- ============================================================================
-- SERUM MINERALS & MARKERS FORM
-- ============================================================================
(
  'Serum Minerals & Markers',
  'SerumForm',
  'Serum minerals, iron studies, and other markers',
  'Chemistry',
  '1.0',
  1,
  1,
  '{
    "formId": "SERUM_v1",
    "formName": "Serum Minerals & Markers",
    "formType": "table",
    "version": "1.0",
    "sections": [
      {
        "id": "serum_minerals",
        "title": "Serum Minerals & Markers",
        "type": "table",
        "fields": [
          {
            "id": "total_ca",
            "label": "Total Ca+",
            "type": "number",
            "unit": "Mmol/L",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 2.2, "max": 2.7, "display": "2.2 - 2.7 Mmol/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "uric_acid",
            "label": "Uric Acid",
            "type": "number",
            "unit": "mg/dL",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 2.4, "max": 7.0, "display": "2.4 - 7.0 mg/dL" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "po42",
            "label": "PO42+",
            "type": "number",
            "unit": "mg/dL",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 2.5, "max": 4.5, "display": "2.5 - 4.5 mg/dL" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "mg",
            "label": "Mg2+",
            "type": "number",
            "unit": "Mmol/dL",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 1.5, "max": 2.5, "display": "1.5 - 2.5 Mmol/dL" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "iron",
            "label": "Iron",
            "type": "number",
            "unit": "mcg/dl",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "normal": { "min": 60, "max": 170, "display": "60 - 170 mcg/dl" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "tibc",
            "label": "TIBC",
            "type": "number",
            "unit": "mcg/dl",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "normal": { "min": 240, "max": 450, "display": "240 - 450 mcg/dl" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "hb_ac",
            "label": "HB a/c",
            "type": "number",
            "unit": "%",
            "validation": { "min": 0, "max": 100, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 4.0, "max": 5.6, "display": "4.0 - 5.6 %" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "ionized_ca",
            "label": "Ionized Ca2+",
            "type": "number",
            "unit": "Mmol/L",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 1.2, "max": 1.4, "display": "1.2 - 1.4 Mmol/L" }
            },
            "abnormalDetection": { "enabled": true }
          }
        ]
      },
      {
        "id": "comments",
        "type": "list",
        "fields": [{ "id": "comments", "label": "Comments", "type": "textarea" }]
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
),

-- ============================================================================
-- BODY FLUID ANALYTES FORM
-- ============================================================================
(
  'Body Fluid Analytes',
  'AnalyteForm',
  'Various body fluid chemistry tests (CSF, Urine, Ascitic Fluid)',
  'Chemistry',
  '1.0',
  1,
  1,
  '{
    "formId": "ANALYTE_v1",
    "formName": "Body Fluid Analytes",
    "formType": "table",
    "version": "1.0",
    "sections": [
      {
        "id": "analyte_tests",
        "title": "Body Fluid Chemistry",
        "type": "table",
        "fields": [
          {
            "id": "urine_protein",
            "label": "Urine Protein",
            "type": "number",
            "unit": "mg/dL",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "normal": { "min": 0, "max": 20, "display": "0 - 20 mg/dL" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "csf_glucose",
            "label": "CSF Glucose",
            "type": "number",
            "unit": "Mmol/L",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 2.5, "max": 4.4, "display": "2.5 - 4.4 Mmol/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "csf_protein",
            "label": "CSF Protein+",
            "type": "number",
            "unit": "g/dL",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 1.5, "max": 6.0, "display": "1.5 - 6.0 g/dL" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "ascitic_fluid_glucose",
            "label": "Ascitic Fluid Glucose",
            "type": "number",
            "unit": "Mmol/L",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 2.2, "max": 3.3, "display": "2.2 - 3.3 Mmol/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "ascitic_fluid_total_protein",
            "label": "Ascitic Fluid Total Protein",
            "type": "number",
            "unit": "g/dL",
            "validation": { "min": 0, "decimalPlaces": 1 },
            "referenceRanges": {
              "normal": { "min": 2.5, "max": 3.0, "display": "2.5 - 3.0 g/dL" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "csf_chloride",
            "label": "CSF Chloride",
            "type": "number",
            "unit": "Mmol/L",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "normal": { "min": 110, "max": 125, "display": "110 - 125 Mmol/L" }
            },
            "abnormalDetection": { "enabled": true }
          },
          {
            "id": "twenty_four_hour_urine",
            "label": "24 hour Urine",
            "type": "number",
            "unit": "mg/24hrs",
            "validation": { "min": 0, "decimalPlaces": 0 },
            "referenceRanges": {
              "normal": { "min": 20, "max": 150, "display": "20 - 150 mg/24hrs" }
            },
            "abnormalDetection": { "enabled": true }
          }
        ]
      },
      {
        "id": "comments",
        "type": "list",
        "fields": [{ "id": "comments", "label": "Comments", "type": "textarea" }]
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
),

-- ============================================================================
-- URINALYSIS FORM
-- ============================================================================
(
  'Urinalysis',
  'UrinalysisForm',
  'Urine chemical analysis using dipstick method',
  'Microbiology',
  '1.0',
  1,
  1,
  '{
    "formId": "URINALYSIS_v1",
    "formName": "Urinalysis",
    "formType": "list",
    "version": "1.0",
    "sections": [
      {
        "id": "urinalysis_tests",
        "title": "Urine Chemical Analysis",
        "type": "list",
        "fields": [
          { "id": "culture", "label": "Culture", "type": "text" },
          { "id": "appearance", "label": "Appearance", "type": "text" },
          { "id": "leukocytes", "label": "Leukocytes", "type": "text" },
          { "id": "protein", "label": "Protein", "type": "text" },
          { "id": "glucose", "label": "Glucose", "type": "text" },
          { "id": "blood", "label": "Blood", "type": "text" },
          { "id": "ph", "label": "PH", "type": "text" },
          { "id": "ascorbic_acid", "label": "Ascorbic Acid", "type": "text" },
          { "id": "urobilinogen", "label": "Urobilinogen", "type": "text" },
          { "id": "ketones", "label": "Ketones", "type": "text" },
          { "id": "gravity", "label": "S.gravity", "type": "text" },
          { "id": "bilirubin", "label": "Bilirubin", "type": "text" },
          { "id": "nitrite", "label": "Nitrite", "type": "text" },
          { "id": "others", "label": "Others", "type": "text" },
          { "id": "comments", "label": "Comments", "type": "textarea" }
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
-- STOOL ANALYSIS FORM
-- ============================================================================
(
  'Stool Analysis',
  'StoolAnalysisForm',
  'Stool microscopy, culture, and antibiotic sensitivity',
  'Microbiology',
  '1.0',
  1,
  1,
  '{
    "formId": "STOOL_v1",
    "formName": "Stool Analysis",
    "formType": "list",
    "version": "1.0",
    "sections": [
      {
        "id": "stool_microscopy",
        "title": "Stool Microscopy & Culture",
        "type": "list",
        "fields": [
          { "id": "culture", "label": "Culture", "type": "text" },
          { "id": "appearance", "label": "Appearance", "type": "text" },
          { "id": "pus_cells", "label": "PUS Cells", "type": "text" },
          { "id": "rbc", "label": "RBC", "type": "text" },
          { "id": "ova_cyst", "label": "OVA/Cyst", "type": "text" },
          { "id": "undigested_food_particles", "label": "Undigested Food Particles", "type": "text" },
          { "id": "schistoma_ova", "label": "Schistoma Ova", "type": "text" },
          { "id": "fob", "label": "FOB", "type": "text" },
          { "id": "others", "label": "Others", "type": "text" }
        ]
      },
      {
        "id": "antibiotic_sensitivity",
        "title": "Antibiotic Sensitivity",
        "type": "conditional",
        "fields": [
          { "id": "ciprofloxacin", "label": "Ciprofloxacin", "type": "text" },
          { "id": "rifampicin", "label": "Rifampicin", "type": "text" },
          { "id": "streptomycin", "label": "Streptomycin", "type": "text" },
          { "id": "azithromycin", "label": "Azithromycin", "type": "text" },
          { "id": "amoxicillin", "label": "Amoxicillin", "type": "text" },
          { "id": "erythromycin", "label": "Erythromycin", "type": "text" },
          { "id": "levofloxacin", "label": "Levofloxacin", "type": "text" },
          { "id": "gentamycin", "label": "Gentamycin", "type": "text" },
          { "id": "cefuroxime", "label": "Cefuroxime", "type": "text" },
          { "id": "ofloxacin", "label": "Ofloxacin", "type": "text" },
          { "id": "augmentin", "label": "Augmentin", "type": "text" },
          { "id": "peflacine", "label": "Peflacine", "type": "text" },
          { "id": "ceftazidime", "label": "Ceftazidime", "type": "text" },
          { "id": "ceporex", "label": "Ceporex", "type": "text" },
          { "id": "ceftriaxone", "label": "Ceftriaxone", "type": "text" }
        ]
      },
      {
        "id": "comments",
        "type": "list",
        "fields": [{ "id": "comments", "label": "Comments", "type": "textarea" }]
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
-- SPUTUM ANALYSIS FORM
-- ============================================================================
(
  'Sputum Analysis',
  'SputumForm',
  'Sputum culture, microscopy, and antibiotic sensitivity',
  'Microbiology',
  '1.0',
  1,
  1,
  '{
    "formId": "SPUTUM_v1",
    "formName": "Sputum Analysis",
    "formType": "list",
    "version": "1.0",
    "sections": [
      {
        "id": "sputum_examination",
        "title": "Sputum Examination",
        "type": "list",
        "fields": [
          { "id": "culture", "label": "Culture", "type": "text" },
          { "id": "appearance", "label": "Appearance", "type": "text" },
          { "id": "sputum", "label": "Sputum", "type": "text" }
        ]
      },
      {
        "id": "antibiotic_sensitivity",
        "title": "Antibiotic Sensitivity",
        "type": "conditional",
        "fields": [
          { "id": "ciprofloxacin", "label": "Ciprofloxacin", "type": "text" },
          { "id": "rifampicin", "label": "Rifampicin", "type": "text" },
          { "id": "streptomycin", "label": "Streptomycin", "type": "text" },
          { "id": "azithromycin", "label": "Azithromycin", "type": "text" },
          { "id": "amoxicillin", "label": "Amoxicillin", "type": "text" },
          { "id": "erythromycin", "label": "Erythromycin", "type": "text" },
          { "id": "levofloxacin", "label": "Levofloxacin", "type": "text" },
          { "id": "gentamycin", "label": "Gentamycin", "type": "text" },
          { "id": "cefuroxime", "label": "Cefuroxime", "type": "text" },
          { "id": "ofloxacin", "label": "Ofloxacin", "type": "text" },
          { "id": "augmentin", "label": "Augmentin", "type": "text" },
          { "id": "peflacine", "label": "Peflacine", "type": "text" },
          { "id": "ceftazidime", "label": "Ceftazidime", "type": "text" },
          { "id": "ceporex", "label": "Ceporex", "type": "text" },
          { "id": "ceftriaxone", "label": "Ceftriaxone", "type": "text" }
        ]
      },
      {
        "id": "comments",
        "type": "list",
        "fields": [{ "id": "comments", "label": "Comments", "type": "textarea" }]
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
-- URINE SWAB FORM
-- ============================================================================
(
  'Urine Swab',
  'UrineSwabForm',
  'Urine microscopy, culture, and antibiotic sensitivity',
  'Microbiology',
  '1.0',
  1,
  1,
  '{
    "formId": "URINESWAB_v1",
    "formName": "Urine Swab",
    "formType": "list",
    "version": "1.0",
    "sections": [
      {
        "id": "urine_microscopy",
        "title": "Urine Microscopy & Culture",
        "type": "list",
        "fields": [
          { "id": "culture", "label": "Culture", "type": "text" },
          { "id": "epithelial_cells", "label": "Epithelial Cells", "type": "text" },
          { "id": "pus_cells", "label": "PUS Cells", "type": "text" },
          { "id": "vaginalis_cells", "label": "T. Vaginalis", "type": "text" },
          { "id": "rbc", "label": "RBC", "type": "text" },
          { "id": "cast", "label": "Cast", "type": "text" },
          { "id": "crystals", "label": "Crystals", "type": "text" },
          { "id": "parasites", "label": "Parasites", "type": "text" },
          { "id": "others", "label": "Others", "type": "text" }
        ]
      },
      {
        "id": "antibiotic_sensitivity",
        "title": "Antibiotic Sensitivity",
        "type": "conditional",
        "fields": [
          { "id": "ciprofloxacin", "label": "Ciprofloxacin", "type": "text" },
          { "id": "rifampicin", "label": "Rifampicin", "type": "text" },
          { "id": "streptomycin", "label": "Streptomycin", "type": "text" },
          { "id": "azithromycin", "label": "Azithromycin", "type": "text" },
          { "id": "amoxicillin", "label": "Amoxicillin", "type": "text" },
          { "id": "erythromycin", "label": "Erythromycin", "type": "text" },
          { "id": "levofloxacin", "label": "Levofloxacin", "type": "text" },
          { "id": "gentamycin", "label": "Gentamycin", "type": "text" },
          { "id": "cefuroxime", "label": "Cefuroxime", "type": "text" },
          { "id": "ofloxacin", "label": "Ofloxacin", "type": "text" },
          { "id": "augmentin", "label": "Augmentin", "type": "text" },
          { "id": "peflacine", "label": "Peflacine", "type": "text" },
          { "id": "ceftazidime", "label": "Ceftazidime", "type": "text" },
          { "id": "ceporex", "label": "Ceporex", "type": "text" },
          { "id": "ceftriaxone", "label": "Ceftriaxone", "type": "text" }
        ]
      },
      {
        "id": "comments",
        "type": "list",
        "fields": [{ "id": "comments", "label": "Comments", "type": "textarea" }]
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
-- SEMEN ANALYSIS FORM
-- ============================================================================
(
  'Semen Analysis',
  'SemenAnalysisForm',
  'Comprehensive semen analysis including motility, morphology, and culture',
  'Other',
  '1.0',
  1,
  1,
  '{
    "formId": "SEMEN_v1",
    "formName": "Semen Analysis",
    "formType": "list",
    "version": "1.0",
    "sections": [
      {
        "id": "collection_details",
        "title": "Collection Details",
        "type": "list",
        "fields": [
          { "id": "time_produced", "label": "Time Produced", "type": "text" },
          { "id": "time_received", "label": "Time Received", "type": "text" },
          { "id": "time_of_analysis", "label": "Time of Analysis", "type": "text" },
          { "id": "method_of_production", "label": "Method of Production", "type": "text" },
          { "id": "period_of_abstinence", "label": "Period of Abstinence", "type": "text" }
        ]
      },
      {
        "id": "physical_examination",
        "title": "Physical Examination",
        "type": "list",
        "fields": [
          { "id": "appearance", "label": "Appearance", "type": "text" },
          { "id": "colour", "label": "Colour", "type": "text" },
          { "id": "viscosity", "label": "Viscosity", "type": "text" },
          { "id": "liquefaction", "label": "Liquefaction", "type": "text" },
          { "id": "volume", "label": "Volume", "type": "text" },
          { "id": "odour", "label": "Odour", "type": "text" },
          { "id": "ph", "label": "PH", "type": "text" }
        ]
      },
      {
        "id": "microscopy",
        "title": "Microscopy",
        "type": "list",
        "fields": [
          { "id": "culture", "label": "Culture", "type": "text" },
          { "id": "pus_cells", "label": "PUS Cells", "type": "text" },
          { "id": "rbc", "label": "RBC", "type": "text" },
          { "id": "cellula_debris", "label": "Cellula Debris", "type": "text" },
          { "id": "epithelial_cells", "label": "Epithelial Cells", "type": "text" },
          { "id": "others", "label": "Others", "type": "text" }
        ]
      },
      {
        "id": "spermatozoa",
        "title": "Spermatozoa Analysis",
        "type": "list",
        "fields": [
          { "id": "spermatozoan", "label": "Spermatozoan", "type": "text" },
          { "id": "sperm_count", "label": "Sperm Count", "type": "text" },
          { "id": "percentage_motility", "label": "Percentage Motility", "type": "text" },
          { "id": "active", "label": "Active", "type": "text" },
          { "id": "sluggish", "label": "Sluggish", "type": "text" },
          { "id": "non_progressive", "label": "Non-Progressive", "type": "text" },
          { "id": "dead_cells", "label": "Dead Cells", "type": "text" }
        ]
      },
      {
        "id": "morphology",
        "title": "Morphology",
        "type": "list",
        "fields": [
          { "id": "morphology", "label": "Morphology", "type": "text" },
          { "id": "normal_cells", "label": "% Normal Cells", "type": "text" },
          { "id": "abnormal_cells", "label": "% Abnormal Cells", "type": "text" }
        ]
      },
      {
        "id": "antibiotic_sensitivity",
        "title": "Antibiotic Sensitivity",
        "type": "conditional",
        "fields": [
          { "id": "ciprofloxacin", "label": "Ciprofloxacin", "type": "text" },
          { "id": "rifampicin", "label": "Rifampicin", "type": "text" },
          { "id": "streptomycin", "label": "Streptomycin", "type": "text" },
          { "id": "azithromycin", "label": "Azithromycin", "type": "text" },
          { "id": "amoxicillin", "label": "Amoxicillin", "type": "text" },
          { "id": "erythromycin", "label": "Erythromycin", "type": "text" },
          { "id": "levofloxacin", "label": "Levofloxacin", "type": "text" },
          { "id": "gentamycin", "label": "Gentamycin", "type": "text" },
          { "id": "cefuroxime", "label": "Cefuroxime", "type": "text" },
          { "id": "ofloxacin", "label": "Ofloxacin", "type": "text" },
          { "id": "augmentin", "label": "Augmentin", "type": "text" },
          { "id": "peflacine", "label": "Peflacine", "type": "text" },
          { "id": "ceftazidime", "label": "Ceftazidime", "type": "text" },
          { "id": "ceporex", "label": "Ceporex", "type": "text" },
          { "id": "ceftriaxone", "label": "Ceftriaxone", "type": "text" }
        ]
      },
      {
        "id": "comments",
        "type": "list",
        "fields": [{ "id": "comments", "label": "Comments", "type": "textarea" }]
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
-- HORMONAL ASSAY FORM
-- ============================================================================
(
  'Hormonal Assay',
  'HormonalAssayForm',
  'Comprehensive hormonal panel including reproductive and thyroid hormones',
  'Hormones',
  '1.0',
  1,
  1,
  '{
    "formId": "HORMONAL_v1",
    "formName": "Hormonal Assay",
    "formType": "list",
    "version": "1.0",
    "sections": [
      {
        "id": "hormonal_tests",
        "title": "Hormonal Tests",
        "type": "list",
        "fields": [
          {
            "id": "fsh",
            "label": "FSH",
            "type": "text",
            "placeholder": "Male: 2.0-14.0 mIU/ML | Female: Follicular 2.0-10.0, Ovulatorial 6.0-24.0, Luteal 1.5-8.0, Post Menopausal 17.0-95.0"
          },
          {
            "id": "lh",
            "label": "LH",
            "type": "text",
            "placeholder": "Male: 0.7-7.4 mIU/ML | Female: Follicular 0.5-10.5, Mid Cycle 18.4-61.2, Luteal 0.5-10.5, Post Menopause 8.2-40.8"
          },
          {
            "id": "progesterone",
            "label": "Progesterone",
            "type": "text",
            "placeholder": "Child 0.07-0.52 ng/ml | Male 0.13-1.22 ng/ml | Female: Follicular 0.15-1.40, Luteal 2.0-25.0, Trimesters vary"
          },
          {
            "id": "estradiol",
            "label": "Estradiol",
            "type": "text",
            "placeholder": "Male: 9.0-94.0 pg/ml | Female: Follicular 9.0-175, Periovulatory 107-281, Luteal 44.0-196"
          },
          {
            "id": "testosterone",
            "label": "Testosterone",
            "type": "text",
            "placeholder": "Boys Before Puberty: 0.1-3.7 ng/ML | Male: 2.5-10.0 ng/ML | Female: 0.2-0.95 ng/ML"
          },
          {
            "id": "prolactin",
            "label": "Prolactin",
            "type": "text",
            "placeholder": "Post Menopausal: 1.5-18.5 ng/ML | Adult Male: 1.8-17.0 ng/ML | Adult Female: 1.2-19.5 ng/ML"
          },
          {
            "id": "psa",
            "label": "PSA",
            "type": "text",
            "placeholder": "Healthy Males: Less than 4.0"
          },
          {
            "id": "tsh",
            "label": "TSH",
            "type": "text",
            "placeholder": "Low Normal: 0.28-0.53 uIu/ML | High Normal: 5.6-6.82 uIu/ML"
          },
          {
            "id": "tT3",
            "label": "tT3",
            "type": "text",
            "placeholder": "Expected Range: 0.52-1.85 ng/ML"
          },
          {
            "id": "tT4",
            "label": "tT4",
            "type": "text",
            "placeholder": "Male: 4.4-10.0 ug/ML | Female: 4.8-11.6 ug/ML"
          }
        ]
      },
      {
        "id": "comments",
        "type": "list",
        "fields": [{ "id": "comments", "label": "Comments", "type": "textarea" }]
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
-- WIDAL REACTION FORM
-- ============================================================================
(
  'Widal Reaction',
  'WidalReactionForm',
  'Salmonella antibody titers for typhoid fever diagnosis',
  'Hematology',
  '1.0',
  1,
  1,
  '{
    "formId": "WIDAL_v1",
    "formName": "Widal Reaction",
    "formType": "list",
    "version": "1.0",
    "sections": [
      {
        "id": "widal_titers",
        "title": "Salmonella Antibody Titers",
        "type": "list",
        "fields": [
          { "id": "salmonella_typhi_O", "label": "Salmonella Typhi (O)", "type": "text" },
          { "id": "salmonella_typhi_H", "label": "Salmonella Typhi (H)", "type": "text" },
          { "id": "salmonella_paratyphia_AO", "label": "S. Paratyphi A (O)", "type": "text" },
          { "id": "salmonella_paratyphi_AH", "label": "S. Paratyphi A (H)", "type": "text" },
          { "id": "salmonella_paratyphia_BO", "label": "S. Paratyphi B (O)", "type": "text" },
          { "id": "salmonella_paratyphi_BH", "label": "S. Paratyphi B (H)", "type": "text" },
          { "id": "salmonella_paratyphia_CO", "label": "S. Paratyphi C (O)", "type": "text" },
          { "id": "salmonella_paratyphi_CH", "label": "S. Paratyphi C (H)", "type": "text" }
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
-- BILIRUBIN FORM (NEONATAL)
-- ============================================================================
(
  'Bilirubin (Neonatal)',
  'BilirubinForm',
  'Neonatal bilirubin measurements by age groups',
  'Chemistry',
  '1.0',
  1,
  1,
  '{
    "formId": "BILIRUBIN_v1",
    "formName": "Bilirubin (Neonatal)",
    "formType": "list",
    "version": "1.0",
    "sections": [
      {
        "id": "bilirubin_age_groups",
        "title": "Bilirubin by Age",
        "type": "list",
        "fields": [
          {
            "id": "total_zero_to_one_day",
            "label": "0-1 day (Total)",
            "type": "text",
            "placeholder": "Range: 3.5 - 10.4 mg/dl"
          },
          {
            "id": "direct_zero_to_one_day",
            "label": "0-1 day (Direct)",
            "type": "text",
            "placeholder": "Range: 0.0 - 0.4 mg/dl"
          },
          {
            "id": "total_two_to_three_days",
            "label": "2-3 days (Total)",
            "type": "text",
            "placeholder": "Range: 3.4 - 11.5 mg/dl"
          },
          {
            "id": "direct_two_to_three_days",
            "label": "2-3 days (Direct)",
            "type": "text",
            "placeholder": "Range: 0.0 - 0.4 mg/dl"
          },
          {
            "id": "total_three_to_five_days",
            "label": "3-5 days (Total)",
            "type": "text",
            "placeholder": "Range: 1.5 - 12.0 mg/dl"
          },
          {
            "id": "direct_three_to_five_days",
            "label": "3-5 days (Direct)",
            "type": "text",
            "placeholder": "Range: 0.0 - 0.4 mg/dl"
          },
          {
            "id": "total_above_five_days",
            "label": "Above 5 days (Total)",
            "type": "text",
            "placeholder": "Range: 0.2 - 1.2 mg/dl"
          },
          {
            "id": "direct_above_five_days",
            "label": "Above 5 days (Direct)",
            "type": "text",
            "placeholder": "Range: 0.0 - 0.4 mg/dl"
          }
        ]
      },
      {
        "id": "comments",
        "type": "list",
        "fields": [{ "id": "comments", "label": "Comments", "type": "textarea" }]
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
-- ORAL GLUCOSE TOLERANCE TEST (OGTT) FORM
-- ============================================================================
(
  'Oral Glucose Tolerance Test (OGTT)',
  'OGTTForm',
  'Glucose tolerance test with timed blood and urine measurements',
  'Chemistry',
  '1.0',
  1,
  1,
  '{
    "formId": "OGTT_v1",
    "formName": "Oral Glucose Tolerance Test",
    "formType": "list",
    "version": "1.0",
    "sections": [
      {
        "id": "blood_glucose",
        "title": "Blood Glucose Measurements",
        "type": "list",
        "fields": [
          {
            "id": "ogtt_zero_min",
            "label": "0 min",
            "type": "text",
            "placeholder": "Range: 3.9 - 5.9 Mmol/L"
          },
          {
            "id": "ogtt_sixty_mins",
            "label": "60 mins",
            "type": "text",
            "placeholder": "Range: 3.9 - 7.0 Mmol/L"
          },
          {
            "id": "ogtt_one_twenty_mins",
            "label": "120 mins",
            "type": "text",
            "placeholder": "Range: 3.9 - 6.7 Mmol/L"
          }
        ]
      },
      {
        "id": "urine_analysis",
        "title": "Urine Analysis",
        "type": "list",
        "fields": [
          { "id": "urine_glucose_fasting", "label": "Fasting - Glucose", "type": "text" },
          { "id": "urine_protein_fasting", "label": "Fasting - Protein", "type": "text" },
          { "id": "urine_glucose_sixty_mins", "label": "60 mins - Glucose", "type": "text" },
          { "id": "urine_protein_sixty_mins", "label": "60 mins - Protein", "type": "text" },
          { "id": "urine_glucose_one_twenty_mins", "label": "120 mins - Glucose", "type": "text" },
          { "id": "urine_protein_one_twenty_mins", "label": "120 mins - Protein", "type": "text" },
          { "id": "urine_glucose_others_mins", "label": "Others - Glucose", "type": "text" },
          { "id": "urine_protein_others_mins", "label": "Others - Protein", "type": "text" }
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
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the seed was successful

-- Count all form templates (should be 16 total: 3 initial + 13 new)
SELECT COUNT(*) as total_templates FROM Lab_Form_Templates;

-- List all templates by category
SELECT
  category,
  COUNT(*) as template_count,
  GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') as templates
FROM Lab_Form_Templates
GROUP BY category
ORDER BY category;

-- Verify all 16 system templates
SELECT
  id,
  code,
  name,
  category,
  version,
  is_active,
  is_system_template
FROM Lab_Form_Templates
WHERE is_system_template = 1
ORDER BY category, name;

-- ============================================================================
-- NOTES
-- ============================================================================
/*
FORMS SEEDED (13 New):
1. LFTForm - Liver Function Tests (Chemistry)
2. LipidProfileForm - Lipid Profile (Chemistry)
3. SEUCrForm - Serum Electrolytes, Urea & Creatinine (Chemistry)
4. SerumForm - Serum Minerals & Markers (Chemistry)
5. AnalyteForm - Body Fluid Analytes (Chemistry)
6. UrinalysisForm - Urinalysis (Microbiology)
7. StoolAnalysisForm - Stool Analysis (Microbiology)
8. SputumForm - Sputum Analysis (Microbiology)
9. UrineSwabForm - Urine Swab (Microbiology)
10. SemenAnalysisForm - Semen Analysis (Other)
11. HormonalAssayForm - Hormonal Assay (Hormones)
12. WidalReactionForm - Widal Reaction (Hematology)
13. BilirubinForm - Bilirubin Neonatal (Chemistry)
14. OGTTForm - Oral Glucose Tolerance Test (Chemistry)

TOTAL: 16 System Templates (3 initial + 13 new)

CATEGORIES:
- Chemistry: 10 forms
- Microbiology: 4 forms
- Hematology: 2 forms (FBC, Widal)
- Hormones: 1 form
- Other: 2 forms (Default, Semen Analysis)

SPECIAL NOTES:
- Forms with antibiotic sensitivity use conditional sections
- HormonalAssayForm uses text fields with placeholder ranges due to complex multi-line reference ranges
- WidalReactionForm, BilirubinForm, OGTTForm use list layout due to special multi-column structures
- All forms marked as system templates (is_system_template = 1) to prevent deletion
*/
