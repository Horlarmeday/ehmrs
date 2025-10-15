/**
 * X-Ray Report Template
 * Provides structured format for X-ray radiology reports
 */

export const xrayTemplate = {
  id: 'xray',
  name: 'X-Ray',
  description: 'Plain radiograph report template',
  sections: [
    {
      id: 'clinical-indication',
      title: 'CLINICAL INDICATION',
      placeholder: 'Enter clinical history and reason for examination...',
      required: true,
      hints: ['Trauma', 'Pain', 'Infection', 'Follow-up', 'Screening'],
    },
    {
      id: 'technique',
      title: 'TECHNIQUE',
      placeholder: 'Enter views obtained...',
      required: false,
      defaultContent: '[Region] X-ray, [views] views.',
      hints: [
        'Chest: PA and lateral',
        'Abdomen: Supine and erect',
        'Spine: AP and lateral',
        'Extremities: AP and lateral',
        'Special views as indicated',
      ],
    },
    {
      id: 'comparison',
      title: 'COMPARISON',
      placeholder: 'Previous studies for comparison...',
      required: false,
      hints: ['No prior studies available for comparison', 'Compared with X-ray dated [date]'],
    },
    {
      id: 'findings',
      title: 'FINDINGS',
      placeholder: 'Describe findings systematically...',
      required: true,
      subsections: [
        {
          id: 'chest',
          title: 'Chest (if applicable)',
          hints: [
            'Heart: size, contour',
            'Lungs: airspace disease, nodules, masses, hyperinflation',
            'Pleura: effusion, pneumothorax, thickening',
            'Mediastinum: widening, masses',
            'Hila: enlargement',
            'Bones: fractures, lesions',
            'Soft tissues',
          ],
        },
        {
          id: 'abdomen',
          title: 'Abdomen (if applicable)',
          hints: [
            'Bowel gas pattern: normal, dilated, air-fluid levels',
            'Free air',
            'Organomegaly',
            'Masses',
            'Calcifications',
            'Bones: fractures, lesions',
            'Soft tissues',
          ],
        },
        {
          id: 'spine',
          title: 'Spine (if applicable)',
          hints: [
            'Alignment',
            'Vertebral body height and integrity',
            'Disc spaces',
            'Facet joints',
            'Pedicles',
            'Spinal canal',
            'Paraspinal soft tissues',
            'Degenerative changes',
            'Fractures',
            'Spondylolisthesis',
          ],
        },
        {
          id: 'extremities',
          title: 'Extremities (if applicable)',
          hints: [
            'Bones: fractures, alignment, lesions',
            'Joints: effusion, arthritis, dislocation',
            'Soft tissues: swelling, calcifications, foreign bodies',
            'Growth plates (in pediatrics)',
          ],
        },
        {
          id: 'skull',
          title: 'Skull (if applicable)',
          hints: [
            'Calvarium: fractures, lesions',
            'Paranasal sinuses: opacification, air-fluid levels',
            'Mastoid air cells',
            'Soft tissues',
          ],
        },
      ],
    },
    {
      id: 'impression',
      title: 'IMPRESSION',
      placeholder: 'Summarize key findings...',
      required: true,
      hints: [
        'List numbered impressions',
        'Normal study or describe abnormalities',
        'Recommend further imaging if indicated',
      ],
    },
  ],
  commonFindings: {
    normal: ['Normal study.', 'No acute findings.', 'Within normal limits.'],
    chest: [
      'Normal cardiomediastinal silhouette',
      'Clear lungs',
      'Cardiomegaly',
      'Pulmonary edema',
      'Pneumonia',
      'Pleural effusion',
      'Pneumothorax',
      'Rib fracture(s)',
      'Atelectasis',
      'Hyperinflation',
      'Mass/nodule',
    ],
    abdomen: [
      'Normal bowel gas pattern',
      'Ileus',
      'Bowel obstruction',
      'Free air',
      'Constipation',
      'Hepatomegaly',
      'Splenomegaly',
      'Calcifications',
    ],
    spine: [
      'Normal alignment',
      'Degenerative changes',
      'Compression fracture',
      'Spondylolisthesis',
      'Scoliosis',
      'Disc space narrowing',
      'Osteophytes',
    ],
    extremities: [
      'Fracture',
      'Dislocation',
      'Soft tissue swelling',
      'Joint effusion',
      'Osteoarthritis',
      'Foreign body',
      'Normal bone mineralization',
    ],
  },
};

export default xrayTemplate;
