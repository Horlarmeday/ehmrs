import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import {
  Bed,
  DosageForm,
  Imaging,
  RoutesOfAdministration,
  Ward,
} from '../../../../database/models';

const mapWardData = wards =>
  wards.map(ward => ({
    id: ward.ward_id,
    name: ward.name,
    service_id: ward?.service_id,
    staff_id: ward?.staff_id,
    createdAt: ward.createdAt,
    updatedAt: ward.updatedAt,
    occupant_type: ward.occupantType,
  }));

const insertWardData = async wards => {
  const mappedWards = mapWardData(wards);
  return await Ward.bulkCreate(mappedWards);
};
export const migrateWards = async () => {
  const message = taggedMessaged('migrateWards');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/wards.json');

  try {
    logger.info(message('Reading wards data into memory...'));
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    if (readFile) {
      const data = JSON.parse(readFile);
      logger.info(message('Inserting wards into the database...'));
      const wards = await insertWardData(data);
      if (wards?.length) {
        logger.notice(message('Successfully migrated all wards data'));
      }
    }
  } catch (e) {
    throw new Error(e);
  }
};

const mapBedsData = beds =>
  beds.map(bed => ({
    id: bed.bed_id,
    code: bed.name,
    ward_id: bed?.ward_id,
    staff_id: bed?.staff_id || 1,
    createdAt: bed.createdAt,
    updatedAt: bed.updatedAt,
    bed_type: bed.bed_type,
    status: bed.status,
  }));

const insertBedsData = async beds => {
  const mappedBeds = mapBedsData(beds);
  return await Bed.bulkCreate(mappedBeds);
};

export const migrateBeds = async () => {
  const message = taggedMessaged('migrateBeds');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/beds.json');

  try {
    logger.info(message('Reading beds data into memory...'));
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    if (readFile) {
      const data = JSON.parse(readFile);
      logger.info(message('Inserting beds into the database...'));
      const beds = await insertBedsData(data);
      if (beds?.length) {
        logger.notice(message('Successfully migrated all beds data'));
      }
    }
  } catch (e) {
    throw new Error(e);
  }
};

const insertImagings = async imagings => {
  const mapImaging = imagings.map(imaging => ({
    id: imaging.imaging_id,
    name: imaging.name,
    description: imaging.description,
    staff_id: imaging?.staff_id || 1,
    createdAt: imaging.createdAt,
    updatedAt: imaging.updatedAt,
  }));
  try {
    await Imaging.bulkCreate(mapImaging);
  } catch (e) {
    console.error(e);
  }
};

const insertDosageForms = async dosageForms => {
  const mapDosageForms = dosageForms.map(form => ({
    id: form.dosage_id,
    name: form.name,
    staff_id: form?.staff_id || 1,
    createdAt: form.createdAt,
    updatedAt: form.updatedAt,
  }));
  try {
    await DosageForm.bulkCreate(mapDosageForms);
  } catch (e) {
    console.error(e);
  }
};

const insertRoutes = async routes => {
  const mapDosageForms = routes.map(route => ({
    name: route.name,
    dosage_form_id: route.dosage_id,
    staff_id: route?.staff_id || 1,
    createdAt: route.createdAt,
    updatedAt: route.updatedAt,
  }));
  try {
    await RoutesOfAdministration.bulkCreate(mapDosageForms);
  } catch (e) {
    console.error(e);
  }
};

export const migrateAdminUtils = async () => {
  const message = taggedMessaged('migrateAdminUtils');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/routes.json');

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    const data = JSON.parse(readFile);

    // await insertDosageForms(data);
    // await insertImagings(data);
    // await insertRoutes(data);

    logger.notice(message('Successfully migrated all dosage forms data'));
  } catch (e) {
    throw new Error(e);
  }
};
