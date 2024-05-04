import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import { Drug } from '../../../../database/models';
import { DrugForm } from '../../../../database/models/drug';

const insertDrugs = async drugs => {
  const mappedDrugs = drugs.map((drug: { name: any; staff_id: any; type: string }, i: number) => ({
    name: drug.name,
    code: `D${i + 1}`,
    staff_id: drug?.staff_id || 1,
    type: drug?.type === 'consumables' ? DrugForm.CONSUMABLE : DrugForm.DRUG,
  }));
  try {
    await Drug.bulkCreate(mappedDrugs);
  } catch (e) {
    console.error(e);
  }
};

export const migrateDrugs = async () => {
  const message = taggedMessaged('migrateDrugs');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/drugs.json');

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    const data = JSON.parse(readFile);

    await insertDrugs(data);

    logger.notice(message('Successfully migrated all drugs data'));
  } catch (e) {
    throw new Error(e);
  }
};
