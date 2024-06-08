import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import { Test } from '../../../../database/models';

const sampleArray = [
  { id: 1, type: 'Blood' },
  { id: 2, type: 'Stool' },
  { id: 3, type: 'Semen' },
  { id: 4, type: 'Sputum' },
  { id: 5, type: 'Urine' },
  { id: 6, type: 'Saliva' },
  { id: 7, type: 'Oral fluid' },
  { id: 8, type: 'Sweat' },
];

const units = ['mmol/L', 'mg/dl', 'ng/ml', 'g/dl', 'IU/L'];

const pickRandomType = array => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

const getSampleId = testName => {
  if (/blood/i.test(testName)) return 1;
  if (/stool/i.test(testName)) return 2;
  if (/semen/i.test(testName)) return 3;
  if (/sputum/i.test(testName)) return 4;
  if (/urine/i.test(testName)) return 5;
  if (/saliva/i.test(testName)) return 6;
  if (/oral/i.test(testName)) return 7;
  if (/sweat/i.test(testName)) return 8;
  return pickRandomType(sampleArray)?.id;
};

const insertLaboratoryTests = async tests => {
  const mappedTests = tests.map((test, index) => ({
    name: test.name,
    staff_id: test?.staff_id || 1,
    sample_id: getSampleId(test.name),
    price: test.CASH || null,
    code: `T${index + 1}`,
    type: 'Primary',
    valid_range: '3.9 - 5.3',
    result_unit: pickRandomType(units),
    nhis_price: test?.NHIA || null,
    phis_price: test?.PHIS || null,
    retainership_price: test?.CASH || null,
    old_id: test?.old_id,
    nhis_old_id: test?.nhis_old_id,
    is_available_for_nhis: !!test?.NHIA,
    is_available_for_phis: !!test?.PHIS,
  }));
  try {
    await Test.bulkCreate(mappedTests);
  } catch (e) {
    console.error(e);
  }
};

export const migrateLaboratoryTests = async () => {
  const message = taggedMessaged('migrateLaboratoryTests');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/lab_tests.json');

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    const data = JSON.parse(readFile);

    await insertLaboratoryTests(data);

    logger.notice(message('Successfully migrated all tests data'));
  } catch (e) {
    throw new Error(e);
  }
};
