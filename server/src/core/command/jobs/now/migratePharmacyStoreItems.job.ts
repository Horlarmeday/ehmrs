import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import {
  DosageForm,
  Drug,
  DrugPrescription,
  Measurement,
  Patient,
  PatientInsurance,
  PharmacyStore,
  PrescribedDrug,
  RoutesOfAdministration,
  Unit,
  Visit,
} from '../../../../database/models';
import { Op } from 'sequelize';
import { DrugType } from '../../../../database/models/pharmacyStore';
import { Status } from '../../../../database/models/staff';
import dayjs from 'dayjs';

const insertIntoJSON = invalidDrugs => {
  const jsonContent = JSON.stringify(invalidDrugs, null, 2);
  const filePath = path.join(
    __dirname,
    '../../../../public/ehmrs_dumps/invalidPharmacyStoreItems.json'
  );
  // Write JSON content to a file
  fs.writeFileSync(filePath, jsonContent);
  logger.info('File has been saved.');
};

const getRoute = async dosageForm => {
  const dosage = await getDosageForms(dosageForm);
  const route = await RoutesOfAdministration.findOne({
    where: {
      dosage_form_id: dosage,
    },
  });
  return route?.id || 3;
};

const getDosageForms = async dose => {
  const dosage = await DosageForm.findOne({
    where: {
      name: {
        [Op.like]: `%${dose}%`,
      },
    },
  });
  return dosage?.id || 3;
};

const getStrength = async strength => {
  const measurement = await Measurement.findOne({
    where: {
      name: {
        [Op.like]: `%${strength}%`,
      },
    },
  });
  return measurement?.id || 3;
};

const getUnit = async unit => {
  if (/syringe/i.test(unit)) return 1;
  if (/cannula/i.test(unit)) return 1;
  if (/gloves/i.test(unit)) return 7;
  if (/dripset/i.test(unit)) return 1;
  const measurement = await Unit.findOne({
    where: {
      name: {
        [Op.like]: `%${unit}%`,
      },
    },
  });
  return measurement?.id || 1;
};

const invalidDrugs = [];
const insertDrugs = async drug => {
  try {
    // neither ids exists
    if (!drug?.drug_id && !drug?.ndrug_id) {
      invalidDrugs.push({ ...drug, reason: 'Neither exists' });
      return;
    }
    // if yes - check if drug_id exists else check ndrug_id
    const drugId = drug?.drug_id || drug?.ndrug_id;
    const drugColumn = drug?.drug_id ? 'old_id' : 'nhis_old_id';

    // if drug_id exists, check it in the db drugs with old_id
    // else check ndrug_id with nhis_old_id
    const foundDrug = await Drug.findOne({
      where: { [drugColumn]: drugId },
    });
    // if none exists -  write the prescribedDrug into a file
    if (!foundDrug) {
      invalidDrugs.push({ ...drug, reason: 'Drug does not exist' });
      return;
    }

    const dosageId = await getDosageForms(drug?.dosage_form);
    const strengthId = await getStrength(drug?.strength || drug?.volume);
    const route = await getRoute(drug?.dosage_form);
    const unit = await getUnit(drug?.unit);

    await PharmacyStore.create({
      drug_id: foundDrug.id,
      product_code: drug.product_code,
      shelf: drug.shelf,
      voucher: drug.voucher,
      batch: drug.batch,
      dosage_form_id: dosageId,
      quantity_received: drug?.quantity || 0,
      quantity_remaining: drug?.remain_quantity || 0,
      quantity_dispensed: drug?.quantity_dispensed || 1,
      route_id: route,
      unit_price: drug?.price,
      selling_price: drug?.selling_price || 0,
      total_price: drug?.purchase_cost || 0,
      expiration: drug?.expiration?.includes('0000')
        ? dayjs()
            .add(2, 'years')
            .toDate()
        : drug?.expiration,
      unit_id: unit,
      staff_id: drug?.staff_id || 1,
      measurement_id: strengthId,
      drug_form: foundDrug.type,
      strength_input: drug?.dosage_input,
      drug_type: drug?.drug_id ? DrugType.CASH : DrugType.NHIS,
      date_received: drug?.createdAt,
      createdAt: drug?.createdAt,
      updatedAt: drug?.updatedAt,
      status: Status.ACTIVE,
      old_id: drug?.pitem_id,
    });
  } catch (e) {
    invalidDrugs.push({ ...drug, reason: `Error, ${e?.message}` });
    logger.error(e);
  }
};

export const migratePharmacyStoreItems = async () => {
  const message = taggedMessaged('migratePharmacyStoreItems');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/pharmacyItems.json');

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    if (readFile) {
      const drugs = JSON.parse(readFile);

      for (const drug of drugs) {
        await insertDrugs(drug);
      }
      logger.info(message('Successfully migrated all PharmacyStore data'));
      insertIntoJSON(invalidDrugs);
    }
    logger.notice(message('Successfully migrated all PharmacyStore data'));
  } catch (e) {
    throw new Error(e);
  }
};
