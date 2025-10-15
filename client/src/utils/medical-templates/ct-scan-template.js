/**
 * CT Scan Report Template
 * Provides structured format for CT scan radiology reports
 */

export const ctScanTemplate = {
  id: 'ct-scan',
  name: 'CT Scan',
  description: 'Computed Tomography scan report template',
  sections: [
    {
      id: 'clinical-indication',
      title: 'CLINICAL INDICATION',
      placeholder: 'Enter clinical history and reason for examination...',
      required: true,
      hints: [
        'Suspected pathology',
        'Follow-up of known condition',
        'Trauma evaluation',
        'Pre-operative assessment',
      ],
    },
    {
      id: 'technique',
      title: 'TECHNIQUE',
      placeholder: 'Enter technical parameters...',
      required: false,
      defaultContent: `Non-contrast CT scan of [region] was performed.
Images were acquired in [axial/coronal/sagittal] planes with [thickness] mm slice thickness.
[Contrast protocol if applicable]`,
      hints: [
        'Contrast: Enhanced/Non-enhanced',
        'Scan parameters (kVp, mAs)',
        'Slice thickness',
        'Reconstruction algorithm',
      ],
    },
    {
      id: 'comparison',
      title: 'COMPARISON',
      placeholder: 'Previous studies for comparison...',
      required: false,
      hints: ['No prior studies available for comparison', 'Compared with CT dated [date]'],
    },
    {
      id: 'findings',
      title: 'FINDINGS',
      placeholder: 'Describe findings systematically...',
      required: true,
      subsections: [
        {
          id: 'brain',
          title: 'Brain (if applicable)',
          hints: [
            'Gray-white matter differentiation',
            'Ventricles and sulci',
            'Mass lesions',
            'Hemorrhage',
            'Edema',
            'Midline shift',
          ],
        },
        {
          id: 'chest',
          title: 'Chest (if applicable)',
          hints: [
            'Lungs: parenchyma, masses, nodules, consolidation',
            'Pleura: effusion, thickening',
            'Mediastinum: lymphadenopathy, masses',
            'Heart: size, pericardial effusion',
            'Great vessels',
            'Chest wall',
          ],
        },
        {
          id: 'abdomen',
          title: 'Abdomen (if applicable)',
          hints: [
            'Liver: size, contour, lesions, vasculature',
            'Gallbladder: stones, wall thickening',
            'Pancreas: size, masses, ductal dilation',
            'Spleen: size, lesions',
            'Kidneys: size, stones, hydronephrosis, masses',
            'Adrenals: masses',
            'Bowel: wall thickening, obstruction, masses',
            'Peritoneum: free fluid, masses',
            'Lymph nodes',
            'Vasculature: aorta, IVC',
          ],
        },
        {
          id: 'pelvis',
          title: 'Pelvis (if applicable)',
          hints: [
            'Bladder: masses, wall thickening',
            'Prostate: size, calcifications',
            'Uterus/adnexa: masses, cysts',
            'Rectum: masses, wall thickening',
            'Pelvic lymph nodes',
            'Bones: fractures, lesions',
          ],
        },
        {
          id: 'bones',
          title: 'Bones',
          hints: ['Fractures', 'Lytic/blastic lesions', 'Degenerative changes', 'Alignment'],
        },
      ],
    },
    {
      id: 'impression',
      title: 'IMPRESSION',
      placeholder: 'Summarize key findings and clinical significance...',
      required: true,
      hints: [
        'List numbered impressions',
        'Start with most significant findings',
        'Include measurements of key findings',
        'Suggest follow-up or additional studies if needed',
      ],
    },
  ],
  commonFindings: {
    normal: [
      'Normal study. No acute findings.',
      'No significant abnormality detected.',
      'Study within normal limits for age.',
    ],
    abdomen: [
      'Hepatomegaly',
      'Fatty liver',
      'Hepatic cyst(s)',
      'Hepatic lesion(s)',
      'Cholelithiasis',
      'Cholecystitis',
      'Pancreatitis',
      'Pancreatic mass',
      'Splenomegaly',
      'Renal calculi',
      'Hydronephrosis',
      'Renal mass',
      'Bowel obstruction',
      'Appendicitis',
      'Diverticulitis',
      'Abdominal aortic aneurysm',
      'Lymphadenopathy',
      'Free fluid',
    ],
    chest: [
      'Pneumonia',
      'Pleural effusion',
      'Pneumothorax',
      'Pulmonary nodule(s)',
      'Pulmonary mass',
      'Consolidation',
      'Atelectasis',
      'Mediastinal lymphadenopathy',
      'Pericardial effusion',
      'Aortic aneurysm',
      'Aortic dissection',
    ],
    brain: [
      'Acute infarct',
      'Chronic infarct',
      'Intracranial hemorrhage',
      'Subdural hematoma',
      'Epidural hematoma',
      'Subarachnoid hemorrhage',
      'Brain mass',
      'Hydrocephalus',
      'Cerebral atrophy',
      'Midline shift',
    ],
  },
};

export default ctScanTemplate;
