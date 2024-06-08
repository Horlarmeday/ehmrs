import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import {
  DosageForm,
  Drug,
  DrugPrescription,
  InventoryItem,
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

export const dispenseToInventory = async () => {
  const message = taggedMessaged('dispenseToInventory');

  const items = await PharmacyStore.findAll({ where: { drug_type: DrugType.RETAINERSHIP } });
  try {
    if (items?.length) {
      for (const drug of items) {
        await InventoryItem.create({
          inventory_id: 4,
          drug_id: drug.drug_id,
          quantity_received: drug.quantity_remaining * 0.5 || 10,
          unit_id: drug.unit_id,
          selling_price: drug.selling_price,
          acquired_price: drug.total_price,
          expiration:
            drug?.expiration ||
            dayjs()
              .add(2, 'years')
              .toDate(),
          quantity_consumed: drug.quantity_remaining * 0.25 || 0,
          dosage_form_id: drug.dosage_form_id,
          measurement_id: drug.measurement_id,
          strength_input: drug.strength_input,
          quantity_remaining: +(drug.quantity_remaining - drug.quantity_remaining * 0.25) || 0,
          drug_form: drug.drug_form,
          drug_type: DrugType.RETAINERSHIP,
          date_received: drug.date_received,
          staff_id: drug?.staff_id,
        });
      }
    }
    logger.notice(message('Successfully migrated all inventory items data'));
  } catch (e) {
    throw new Error(e);
  }
};
