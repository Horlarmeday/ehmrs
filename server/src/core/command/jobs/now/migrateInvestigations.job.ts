import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import { Investigation } from '../../../../database/models';

// const pickRandomType = () => {
//   const array = ['Secondary'];
//   const index = Math.floor(Math.random() * array.length);
//   return array[index];
// };

const insertInvestigations = async investigations => {
  const mappedInvestigations = investigations.map(investigation => ({
    name: investigation.name,
    staff_id: investigation?.staff_id || 1,
    type: 'Secondary',
    price: investigation.price,
    imaging_id: investigation.imaging_id,
    nhis_price: investigation?.nhis_price,
    phis_price: investigation?.phis_price,
    retainership_price: investigation?.price,
    old_id: investigation?.old_id,
    nhis_old_id: investigation?.nhis_old_id,
    is_available_for_nhis: !!investigation?.nhis_price,
    is_available_for_phis: !!investigation?.phis_price,
  }));
  try {
    await Investigation.bulkCreate(mappedInvestigations);
  } catch (e) {
    console.error(e);
  }
};

export const migrateInvestigations = async () => {
  const message = taggedMessaged('migrateInvestigations');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/investigations.json');

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    const data = JSON.parse(readFile);

    await insertInvestigations(data);

    logger.notice(message('Successfully migrated all investigations data'));
  } catch (e) {
    throw new Error(e);
  }
};
