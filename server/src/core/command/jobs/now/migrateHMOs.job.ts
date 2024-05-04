import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import { HMO } from '../../../../database/models';

const mapHMOData = hmos =>
  hmos.map(hmo => ({
    id: hmo.hmo_id,
    name: hmo.name,
    hmo_num: hmo.hmo_num,
    insurance_id: hmo?.insurance_id,
    staff_id: hmo?.staff_id,
    createdAt: hmo.createdAt,
    updatedAt: hmo.updatedAt,
  }));

const insertHMOData = async hmos => {
  const mappedHMOs = mapHMOData(hmos);
  return await HMO.bulkCreate(mappedHMOs);
};
export const migrateHMO = async () => {
  const message = taggedMessaged('migrateStaffAccount');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/hmos.json');

  try {
    logger.info(message('Reading hmos data into memory...'));
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    if (readFile) {
      const data = JSON.parse(readFile);
      logger.info(message('Inserting hmos into the database...'));
      const hmos = await insertHMOData(data);
      if (hmos?.length) {
        logger.notice(message('Successfully migrated all hmos data'));
      }
    }
  } catch (e) {
    throw new Error(e);
  }
};
