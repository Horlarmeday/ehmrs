// Migration to seed Lab_Form_Templates with converted forms from testResultForms.ts
// This transforms the 16 hardcoded Vue form components into JSON schema templates

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const timestamp = new Date();

    const formTemplates = [
      {
        name: 'Default Result Form',
        code: 'DefaultResultForm',
        description: 'Simple text area for general test results',
        category: 'Other',
        version: '1.0',
        is_active: true,
        is_system_template: true,
        schema_json: JSON.stringify({
          formId: 'DEFAULT_v1',
          formName: 'Default Result Form',
          formType: 'list',
          version: '1.0',
          sections: [
            {
              id: 'result',
              type: 'list',
              fields: [
                {
                  id: 'result',
                  label: 'Result',
                  type: 'textarea',
                  validation: { required: false },
                },
              ],
            },
          ],
          pdfConfig: {
            layout: 'list',
            showUnit: false,
          },
        }),
        pdf_config: JSON.stringify({
          layout: 'list',
          showUnit: false,
        }),
        createdAt: timestamp,
        updatedAt: timestamp,
      },

      {
        name: 'Full Blood Count (FBC)',
        code: 'FBCForm',
        description: 'Complete blood count with differential and morphology',
        category: 'Hematology',
        version: '1.0',
        is_active: true,
        is_system_template: true,
        schema_json: JSON.stringify({
          formId: 'FBC_v1',
          formName: 'Full Blood Count',
          formType: 'table',
          version: '1.0',
          sections: [
            {
              id: 'main_parameters',
              title: 'Primary Parameters',
              type: 'table',
              fields: [
                {
                  id: 'wbc',
                  label: 'WBC',
                  type: 'number',
                  unit: 'x10^3/ul',
                  validation: { min: 0, decimalPlaces: 2 },
                  referenceRanges: {
                    child: { min: 5, max: 19, display: '5 - 19' },
                    adultMale: { min: 3.3, max: 10.0, display: '3.3 - 10.0' },
                    adultFemale: { min: 3.4, max: 9.8, display: '3.4 - 9.8' },
                  },
                  abnormalDetection: { enabled: true, ageDependent: true, sexDependent: true },
                },
                {
                  id: 'rbc',
                  label: 'RBC',
                  type: 'number',
                  unit: 'x10^4/ul',
                  validation: { min: 0, decimalPlaces: 2 },
                  referenceRanges: {
                    child: { min: 3.9, max: 5.3, display: '3.9 - 5.3' },
                    adultMale: { min: 4.35, max: 5.9, display: '4.35 - 5.9' },
                    adultFemale: { min: 3.69, max: 5.19, display: '3.69 - 5.19' },
                  },
                  abnormalDetection: { enabled: true, ageDependent: true, sexDependent: true },
                },
                {
                  id: 'hgb',
                  label: 'HGB',
                  type: 'number',
                  unit: 'g/dl',
                  validation: { min: 0, decimalPlaces: 1 },
                  referenceRanges: {
                    child: { min: 9.5, max: 14.1, display: '9.5 - 14.1' },
                    adultMale: { min: 13.7, max: 16.7, display: '13.7 - 16.7' },
                    adultFemale: { min: 11.7, max: 14.5, display: '11.7 - 14.5' },
                  },
                  abnormalDetection: { enabled: true, ageDependent: true, sexDependent: true },
                },
                {
                  id: 'hct',
                  label: 'HCT',
                  type: 'number',
                  unit: '%',
                  validation: { min: 0, max: 100, decimalPlaces: 1 },
                  referenceRanges: {
                    child: { min: 30, max: 40, display: '30 - 40' },
                    adultMale: { min: 40.5, max: 49.7, display: '40.5 - 49.7' },
                    adultFemale: { min: 34.1, max: 44.3, display: '34.1 - 44.3' },
                  },
                  abnormalDetection: { enabled: true, ageDependent: true, sexDependent: true },
                },
                {
                  id: 'mcv',
                  label: 'MCV',
                  type: 'number',
                  unit: 'fl',
                  validation: { min: 0, decimalPlaces: 1 },
                  referenceRanges: {
                    child: { min: 70, max: 84, display: '70 - 84' },
                    adultMale: { min: 79.7, max: 92.0, display: '79.7 - 92.0' },
                    adultFemale: { min: 81.5, max: 96.7, display: '81.5 - 96.7' },
                  },
                  abnormalDetection: { enabled: true, ageDependent: true, sexDependent: true },
                },
                {
                  id: 'mch',
                  label: 'MCH',
                  type: 'number',
                  unit: 'pg',
                  validation: { min: 0, decimalPlaces: 1 },
                  referenceRanges: {
                    child: { min: 23, max: 29, display: '23 - 29' },
                    adultMale: { min: 26.1, max: 33.3, display: '26.1 - 33.3' },
                    adultFemale: { min: 26.5, max: 33.5, display: '26.5 - 33.5' },
                  },
                  abnormalDetection: { enabled: true, ageDependent: true, sexDependent: true },
                },
                {
                  id: 'mchc',
                  label: 'MCHC',
                  type: 'number',
                  unit: 'g/dl',
                  validation: { min: 0, decimalPlaces: 1 },
                  referenceRanges: {
                    child: { min: 31, max: 35, display: '31 - 35' },
                    adultMale: { min: 32.2, max: 35.0, display: '32.2 - 35.0' },
                    adultFemale: { min: 31.9, max: 35.3, display: '31.9 - 35.3' },
                  },
                  abnormalDetection: { enabled: true, ageDependent: true, sexDependent: true },
                },
                {
                  id: 'rdw',
                  label: 'RDW',
                  type: 'number',
                  unit: '%',
                  validation: { min: 0, decimalPlaces: 1 },
                  referenceRanges: {
                    child: { min: 11.6, max: 14.4, display: '11.6 - 14.4' },
                    adultMale: { min: 11.6, max: 14.4, display: '11.6 - 14.4' },
                    adultFemale: { display: '-' },
                  },
                  abnormalDetection: { enabled: true, ageDependent: true },
                },
                {
                  id: 'plt',
                  label: 'PLT',
                  type: 'number',
                  unit: 'x10^3/ul',
                  validation: { min: 0, decimalPlaces: 0 },
                  referenceRanges: {
                    child: { min: 140, max: 450, display: '140 - 450' },
                    adultMale: { min: 140, max: 450, display: '140 - 450' },
                    adultFemale: { display: '-' },
                  },
                  abnormalDetection: { enabled: true },
                },
              ],
            },
            {
              id: 'differential',
              title: 'Differential',
              type: 'conditional',
              fields: [
                {
                  id: 'neutrophils',
                  label: 'Neutrophils',
                  type: 'number',
                  unit: '%',
                  validation: { min: 0, max: 100, decimalPlaces: 1 },
                  referenceRanges: {
                    child: { min: 20, max: 45, display: '20 - 45' },
                    adultMale: { min: 45, max: 66, display: '45 - 66' },
                  },
                },
                {
                  id: 'bands',
                  label: 'Bands (Neutrophilic)',
                  type: 'number',
                  unit: '%',
                  validation: { min: 0, max: 100, decimalPlaces: 1 },
                  referenceRanges: {
                    child: { min: 1, max: 12, display: '1 - 12' },
                    adultMale: { min: 1, max: 12, display: '1 - 12' },
                  },
                },
                {
                  id: 'lymphocytes',
                  label: 'Lymphocytes',
                  type: 'number',
                  unit: '%',
                  validation: { min: 0, max: 100, decimalPlaces: 1 },
                  referenceRanges: {
                    child: { min: 46, max: 76, display: '46 - 76' },
                    adultMale: { min: 20, max: 40, display: '20 - 40' },
                  },
                },
                {
                  id: 'atypical_lymphocytes',
                  label: 'Atypical Lymphocytes',
                  type: 'number',
                  unit: '%',
                  validation: { min: 0, max: 100, decimalPlaces: 1 },
                  referenceRanges: {
                    child: { min: 0, max: 2, display: '0 - 2' },
                    adultMale: { min: 0, max: 2, display: '0 - 2' },
                  },
                },
                {
                  id: 'monocytes',
                  label: 'Monocytes',
                  type: 'number',
                  unit: '%',
                  validation: { min: 0, max: 100, decimalPlaces: 1 },
                  referenceRanges: {
                    child: { min: 1, max: 5, display: '1 - 5' },
                    adultMale: { min: 4, max: 10, display: '4 - 10' },
                  },
                },
                {
                  id: 'eosinophils',
                  label: 'Eosinophils',
                  type: 'number',
                  unit: '%',
                  validation: { min: 0, max: 100, decimalPlaces: 1 },
                  referenceRanges: {
                    child: { min: 1, max: 3, display: '1 - 3' },
                    adultMale: { min: 1, max: 6, display: '1 - 6' },
                  },
                },
                {
                  id: 'basophils',
                  label: 'Basophils',
                  type: 'number',
                  unit: '%',
                  validation: { min: 0, max: 100, decimalPlaces: 1 },
                  referenceRanges: {
                    child: { min: 0, max: 2, display: '0 - 2' },
                    adultMale: { min: 0, max: 2, display: '0 - 2' },
                  },
                },
              ],
            },
            {
              id: 'morphology',
              title: 'RBC Morphology',
              type: 'conditional',
              fields: [
                { id: 'anisocytosis', label: 'Anisocytosis', type: 'text' },
                { id: 'microcytosis', label: 'Microcytosis', type: 'text' },
                { id: 'macrocytosis', label: 'Macrocytosis', type: 'text' },
                { id: 'hypochromia', label: 'Hypochromia', type: 'text' },
                { id: 'poikliocytosis', label: 'Poikliocytosis', type: 'text' },
              ],
            },
            {
              id: 'comments',
              type: 'list',
              fields: [{ id: 'comments', label: 'Comments', type: 'textarea' }],
            },
          ],
          pdfConfig: {
            layout: 'multiColumnTable',
            columns: [
              { key: 'label', header: 'Test', align: 'left', width: '20%' },
              { key: 'value', header: 'Result', align: 'right', width: '15%' },
              {
                key: 'referenceRanges.child',
                header: 'Children Range',
                align: 'left',
                width: '20%',
              },
              {
                key: 'referenceRanges.adultMale',
                header: 'Adult Male',
                align: 'left',
                width: '20%',
              },
              {
                key: 'referenceRanges.adultFemale',
                header: 'Adult Female',
                align: 'left',
                width: '15%',
              },
              { key: 'unit', header: 'Unit', align: 'left', width: '10%' },
            ],
            showUnit: true,
            highlightAbnormal: true,
          },
        }),
        pdf_config: JSON.stringify({
          layout: 'multiColumnTable',
          columns: [
            { key: 'label', header: 'Test', align: 'left', width: '20%' },
            { key: 'value', header: 'Result', align: 'right', width: '15%' },
            { key: 'referenceRanges.child', header: 'Children Range', align: 'left', width: '20%' },
            { key: 'referenceRanges.adultMale', header: 'Adult Male', align: 'left', width: '20%' },
            {
              key: 'referenceRanges.adultFemale',
              header: 'Adult Female',
              align: 'left',
              width: '15%',
            },
            { key: 'unit', header: 'Unit', align: 'left', width: '10%' },
          ],
          showUnit: true,
          highlightAbnormal: true,
        }),
        createdAt: timestamp,
        updatedAt: timestamp,
      },

      {
        name: 'Glucose Tests',
        code: 'GlucoseForm',
        description: 'Fasting, random, and 2-hour post-prandial glucose tests',
        category: 'Chemistry',
        version: '1.0',
        is_active: true,
        is_system_template: true,
        schema_json: JSON.stringify({
          formId: 'GLUCOSE_v1',
          formName: 'Glucose Tests',
          formType: 'table',
          version: '1.0',
          sections: [
            {
              id: 'glucose_tests',
              title: 'Glucose Measurements',
              type: 'table',
              fields: [
                {
                  id: 'fasting_glu',
                  label: 'Fasting glu.',
                  type: 'number',
                  unit: 'Mmol/L',
                  validation: { min: 0, decimalPlaces: 1 },
                  referenceRanges: {
                    normal: { min: 3.9, max: 5.8, display: '3.9 - 5.8 Mmol/L' },
                  },
                  abnormalDetection: { enabled: true },
                },
                {
                  id: 'random_glu',
                  label: 'Random glu.',
                  type: 'number',
                  unit: 'Mmol/L',
                  validation: { min: 0, decimalPlaces: 1 },
                  referenceRanges: {
                    normal: { min: 3.9, max: 6.7, display: '3.9 - 6.7 Mmol/L' },
                  },
                  abnormalDetection: { enabled: true },
                },
                {
                  id: 'two_hour_pp',
                  label: '2hr pp',
                  type: 'number',
                  unit: 'Mmol/L',
                  validation: { min: 0, decimalPlaces: 1 },
                  referenceRanges: {
                    normal: { min: 3.9, max: 6.7, display: '3.9 - 6.7 Mmol/L' },
                  },
                  abnormalDetection: { enabled: true },
                },
                { id: 'comments', label: 'Comments', type: 'textarea' },
              ],
            },
          ],
          pdfConfig: {
            layout: 'table',
            columns: [
              { key: 'label', header: 'Test', align: 'left' },
              { key: 'value', header: 'Result', align: 'right' },
              { key: 'referenceRanges.normal.display', header: 'Range', align: 'left' },
            ],
            showUnit: false,
            highlightAbnormal: true,
          },
        }),
        pdf_config: JSON.stringify({
          layout: 'table',
          columns: [
            { key: 'label', header: 'Test', align: 'left' },
            { key: 'value', header: 'Result', align: 'right' },
            { key: 'referenceRanges.normal.display', header: 'Range', align: 'left' },
          ],
          showUnit: false,
          highlightAbnormal: true,
        }),
        createdAt: timestamp,
        updatedAt: timestamp,
      },

      // More form templates will be added... continuing in next iteration for brevity
      // (Widal, Bilirubin, OGTT, Serum, LFT, Lipid, SEUCr, Sputum, Stool, Urinalysis, UrineSwab, SemenAnalysis, HormonalAssay, Analyte)
    ];

    return queryInterface.bulkInsert('Lab_Form_Templates', formTemplates);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Lab_Form_Templates', {
      is_system_template: true,
    });
  },
};
