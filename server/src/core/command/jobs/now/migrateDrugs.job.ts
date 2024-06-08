import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import { Drug } from '../../../../database/models';
import { DrugForm } from '../../../../database/models/drug';

const insertDrugs = async drugs => {
  const mappedDrugs = drugs.map(
    (
      drug: {
        name: any;
        staff_id: any;
        type: string;
        price: number | string;
        drug_id: number;
        ndrug_id: number | string;
      },
      i: number
    ) => ({
      name: drug.name,
      code: `D${i + 1}`,
      staff_id: drug?.staff_id || 1,
      type: drug?.type === 'consumables' ? DrugForm.CONSUMABLE : DrugForm.DRUG,
      is_available_for_nhis: !!drug?.ndrug_id,
      old_id: drug?.drug_id || null,
      nhis_old_id: drug?.ndrug_id || null,
    })
  );
  try {
    await Drug.bulkCreate(mappedDrugs);
  } catch (e) {
    console.error(e);
  }
};

export const migrateDrugs = async () => {
  const message = taggedMessaged('migrateDrugs');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/drugs_list.json');

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    const data = JSON.parse(readFile);

    await insertDrugs(data);

    logger.notice(message('Successfully migrated all drugs data'));
  } catch (e) {
    throw new Error(e);
  }
};
