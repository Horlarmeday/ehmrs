/**
 * Generic Investigation Report Template
 * Provides structured format for general radiology reports
 */

export const genericTemplate = {
  id: 'generic',
  name: 'Generic Investigation',
  description: 'General radiology investigation report template',
  sections: [
    {
      id: 'clinical-indication',
      title: 'CLINICAL INDICATION',
      placeholder: 'Enter clinical history and reason for examination...',
      required: true,
      hints: ['Clinical symptoms', 'Suspected diagnosis', 'Follow-up', 'Screening'],
    },
    {
      id: 'technique',
      title: 'TECHNIQUE',
      placeholder: 'Enter examination technique and parameters...',
      required: false,
      hints: [
        'Imaging modality used',
        'Technical parameters',
        'Contrast administration (if applicable)',
        'Patient positioning',
      ],
    },
    {
      id: 'comparison',
      title: 'COMPARISON',
      placeholder: 'Previous studies for comparison...',
      required: false,
      hints: ['No prior studies available for comparison', 'Compared with previous study dated [date]'],
    },
    {
      id: 'findings',
      title: 'FINDINGS',
      placeholder: 'Describe findings systematically...',
      required: true,
      hints: [
        'Describe findings in a systematic manner',
        'Include measurements where appropriate',
        'Note normal and abnormal findings',
        'Use standardized terminology',
      ],
    },
    {
      id: 'impression',
      title: 'IMPRESSION',
      placeholder: 'Summarize key findings and clinical significance...',
      required: true,
      hints: [
        'Provide a concise summary',
        'List key findings',
        'Suggest differential diagnoses if applicable',
        'Recommend follow-up or additional studies if needed',
      ],
    },
  ],
  commonFindings: {
    normal: ['Normal study.', 'No significant abnormality detected.', 'Within normal limits for age and gender.'],
    abnormal: [
      'Abnormal finding requiring clinical correlation',
      'Findings consistent with [diagnosis]',
      'Further evaluation recommended',
    ],
  },
};

export default genericTemplate;
