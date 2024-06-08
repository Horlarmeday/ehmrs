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
  PrescribedAdditionalItem,
  PrescribedDrug,
  RoutesOfAdministration,
  Staff,
  Visit,
} from '../../../../database/models';
import { VisitCategory, VisitStatus } from '../../../../database/models/visit';
import { BillingStatus, Source } from '../../../../database/models/prescribedDrug';
import { NHISApprovalStatus } from '../../../helpers/general';
import { staffs } from './staffs';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DrugStatus } from '../../../../database/models/drugPrescription';

dayjs.extend(customParseFormat);

const pickRandomType = () => {
  const array = [1, 7, 10];
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

const getUnit = name => {
  if (/syringe/i.test(name)) return 1;
  if (/cannula/i.test(name)) return 1;
  if (/gloves/i.test(name)) return 7;
  if (/dripset/i.test(name)) return 1;
  return pickRandomType();
};

const getInventoryId = drug => {
  if (drug?.drug_id) return 1;
  if (drug?.ndrug_id) return 2;
};

const insertIntoJSON = invalidItems => {
  const jsonContent = JSON.stringify(invalidItems, null, 2);
  const filePath = path.join(
    __dirname,
    '../../../../public/ehmrs_dumps/invalidAdditionalItems.json'
  );
  // Write JSON content to a file
  fs.writeFileSync(filePath, jsonContent);
  logger.info('File has been saved.');
};

const invalidItems = [];
const insertItems = async drug => {
  const patientId = drug?.patient_id || drug?.dependant_id;
  const patientType = drug?.patient_id ? 'Patient' : 'Dependant';

  try {
    // check if the patient exists
    const patient = await Patient.findOne({
      where: { old_patient_id: patientId, patient_type: patientType },
    });
    // if not - write the prescribedDrug into a file
    if (!patient) {
      invalidItems.push({ ...drug, reason: 'Patient does not exist' });
      return;
    }

    const alreadyExists = await PrescribedAdditionalItem.findOne({
      where: { patient_id: patient.id, old_id: drug.ai_id },
    });
    if (!alreadyExists) return;

    // neither ids exists
    if (!drug?.drug_id && !drug?.ndrug_id) {
      invalidItems.push({ ...drug, reason: 'Neither exists' });
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
      invalidItems.push({ ...drug, reason: 'Drug does not exist' });
      return;
    }
    // check consultation_id exists in the visit - if yes pick the id, if no, create a new one and pick id
    const columnId = drug?.consultation_id || drug?.ante_natal_id;
    const column = drug?.consultation_id ? 'consultation_id' : 'ante_natal_id';

    let visit = await Visit.findOne({ where: { [column]: columnId } });
    if (!visit) {
      visit = await Visit.create({
        patient_id: patient.id,
        category: column === 'consultation_id' ? VisitCategory.OPD : VisitCategory.ANC,
        date_visit_start: drug?.createdAt,
        date_visit_ended: dayjs(drug?.updatedAt)
          .add(6, 'hours')
          .toDate(),
        department: column === 'consultation_id' ? 'Medical Practitioner' : 'Nursing',
        professional: column === 'consultation_id' ? 'General Practitioner' : 'Nurse',
        type: 'New Visit',
        has_done_vitals: false,
        is_taken: false,
        status: VisitStatus.ENDED,
        staff_id: drug?.staff_id || 1,
        createdAt: drug.createdAt,
        updatedAt: drug.updatedAt,
        ante_natal_id: column === 'ante_natal_id' ? columnId : null,
        consultation_id: column === 'consultation_id' ? columnId : null,
      });
    }
    // if hmo_id exists, check patient insurances and pick id
    let patientInsurance;
    if (patient?.has_insurance) {
      patientInsurance = await PatientInsurance.findOne({ where: { patient_id: patient.id } });
    }

    // check visit_id exists in drug_prescriptions - if yes pick id, if no create a new one and pick id
    let drugPrescription = await DrugPrescription.findOne({
      where: { visit_id: visit.id },
    });
    const staff = staffs?.find(({ fullname }) => drug?.examiner === fullname);
    const foundStaff = await Staff.findOne({ where: { id: staff?.id || 1 } });

    if (!drugPrescription) {
      drugPrescription = await DrugPrescription.create({
        patient_id: patient.id,
        source: column === 'consultation_id' ? Source.CONSULTATION : Source.ANC,
        requester: foundStaff?.id || 1,
        visit_id: visit.id,
        date_prescribed: drug?.createdAt,
        is_billed: drug?.payment_status === 'Paid' || drug?.payment_status === 'Cleared',
        has_paid: drug?.payment_status === 'Paid' || drug?.payment_status === 'Cleared',
        status: drug?.is_dispensed ? DrugStatus.COMPLETE_DISPENSE : DrugStatus.PENDING,
        ante_natal_id: column === 'ante_natal_id' ? columnId : null,
      });
    }

    const prescribedDrug = await PrescribedDrug.findOne({
      where: { old_id: drug.prescribed_drug_id },
    });

    await PrescribedAdditionalItem.create({
      drug_id: foundDrug.id,
      patient_id: patient.id,
      drug_type: drug?.drug_id ? 'Cash' : 'NHIS',
      quantity_prescribed: drug?.quantity || 1,
      quantity_to_dispense: drug?.quantity_to_dispense || 1,
      quantity_dispensed: drug?.quantity_dispensed || 1,
      drug_form: foundDrug.type,
      total_price: drug?.price,
      dispense_status: drug?.dispense_status,
      examiner: drug?.staff_id || 1,
      start_date: drug?.createdAt,
      visit_id: visit.id,
      drug_prescription_id: drugPrescription.id,
      prescribed_drug_id: prescribedDrug?.id || null,
      date_prescribed: drug?.createdAt,
      createdAt: drug?.createdAt,
      updatedAt: drug?.updatedAt,
      payment_status: drug?.payment_status,
      unit_id: getUnit(foundDrug.name),
      billing_status:
        drug?.payment_status === 'Paid' || drug?.payment_status === 'Cleared'
          ? BillingStatus.BILLED
          : BillingStatus.UNBILLED,
      nhis_status: drug?.is_nhis_drug_approved
        ? NHISApprovalStatus.APPROVED
        : NHISApprovalStatus.PENDING,
      ante_natal_id: column === 'ante_natal_id' ? columnId : null,
      source: column === 'consultation_id' ? Source.CONSULTATION : Source.ANC,
      patient_insurance_id: patientInsurance?.id,
      old_id: drug?.ai_id,
      inventory_id: getInventoryId(drug),
    });
  } catch (e) {
    invalidItems.push({ ...drug, reason: `Error, ${e?.message}` });
    logger.error(e);
  }
};

export const migrateAdditionalItems = async () => {
  const message = taggedMessaged('migrateAdditionalItems');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_today/additionalItems.json');

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    if (readFile) {
      const items = JSON.parse(readFile);

      for (const item of items) {
        await insertItems(item);
      }
      logger.info(message('Successfully migrated all Items data'));
      insertIntoJSON(invalidItems);
    }
    logger.notice(message('Successfully migrated all Items data'));
  } catch (e) {
    throw new Error(e);
  }
};
