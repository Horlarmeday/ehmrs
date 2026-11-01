export interface FbcRow {
  label: string;
  model: string;
  childRange?: string;
  adultRangeMale?: string;
  adultRangeFemale?: string;
  unit: string;
}

export const rows: FbcRow[] = [
  {
    label: 'WBC',
    model: 'wbc',
    childRange: '5 - 19',
    adultRangeMale: '3.3 - 10.0',
    adultRangeFemale: '3.4 - 9.8',
    unit: 'x10^3/ul',
  },
  {
    label: 'RBC',
    model: 'rbc',
    childRange: '3.9 - 5.3',
    adultRangeMale: '4.35 - 5.9',
    adultRangeFemale: '3.69 - 5.19',
    unit: 'x10^4/ul',
  },
  {
    label: 'HGB',
    model: 'hgb',
    childRange: '9.5 - 14.1',
    adultRangeMale: '13.7 - 16.7',
    adultRangeFemale: '11.7 - 14.5',
    unit: 'g/dl',
  },
  {
    label: 'HCT',
    model: 'hct',
    childRange: '30 - 40',
    adultRangeMale: '40.5 - 49.7',
    adultRangeFemale: '34.1 - 44.3',
    unit: '%',
  },
  {
    label: 'MCV',
    model: 'mcv',
    childRange: '70 - 84',
    adultRangeMale: '79.7 - 92.0',
    adultRangeFemale: '81.5 - 96.7',
    unit: 'fl',
  },
  {
    label: 'MCH',
    model: 'mch',
    childRange: '23 - 29',
    adultRangeMale: '26.1 - 33.3',
    adultRangeFemale: '26.5 - 33.5',
    unit: 'pg',
  },
  {
    label: 'MCHC',
    model: 'mchc',
    childRange: '31 - 35',
    adultRangeMale: '32.2 - 35.0',
    adultRangeFemale: '31.9 - 35.3',
    unit: 'g/dl',
  },
  {
    label: 'RDW',
    model: 'rdw',
    childRange: '11.6 - 14.4',
    adultRangeMale: '11.6 - 14.4',
    adultRangeFemale: '-',
    unit: '%',
  },
  {
    label: 'PLT',
    model: 'plt',
    childRange: '140 - 450',
    adultRangeMale: '140 - 450',
    adultRangeFemale: '-',
    unit: 'x10^3/ul',
  },
];

export const differentialRows: FbcRow[] = [
  {
    label: 'Neutrophils',
    model: 'neutrophils',
    childRange: '20 - 45',
    adultRangeMale: '45 - 66',
    unit: '%',
  },
  {
    label: 'Bands (Neutrophilic)',
    model: 'bands',
    childRange: '1 - 12',
    adultRangeMale: '1 - 12',
    unit: '%',
  },
  {
    label: 'Lymphocytes',
    model: 'lymphocytes',
    childRange: '46 - 76',
    adultRangeMale: '20 - 40',
    unit: '%',
  },
  {
    label: 'Atypical Lymphocytes',
    model: 'atypical_lymphocytes',
    childRange: '0 - 2',
    adultRangeMale: '0 - 2',
    unit: '%',
  },
  {
    label: 'Monocytes',
    model: 'monocytes',
    childRange: '1 - 5',
    adultRangeMale: '4 - 10',
    unit: '%',
  },
  {
    label: 'Eosinophils',
    model: 'eosinophils',
    childRange: '1 - 3',
    adultRangeMale: '1 - 6',
    unit: '%',
  },
  {
    label: 'Basophils',
    model: 'basophils',
    childRange: '0 - 2',
    adultRangeMale: '0 - 2',
    unit: '%',
  },
];

export const morphologyRows: FbcRow[] = [
  {
    label: 'Anisocytosis',
    model: 'anisocytosis',
    unit: '',
  },
  {
    label: 'Microcytosis',
    model: 'microcytosis',
    unit: '',
  },
  {
    label: 'Macrocytosis',
    model: 'macrocytosis',
    unit: '',
  },
  {
    label: 'Hypochromia',
    model: 'hypochromia',
    unit: '',
  },
  {
    label: 'Poikliocytosis',
    model: 'poikliocytosis',
    unit: '',
  },
];
