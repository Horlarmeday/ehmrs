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
  PrescribedDrug,
  PrescribedTest,
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

const isInLast3Days = date => {
  const now = dayjs();
  const dateToCompare = dayjs(date);
  return dateToCompare.isAfter(now.subtract(1, 'day')) && dateToCompare.isBefore(now.add(1, 'day'));
};

const pickRandomType = () => {
  const array = ['Primary', 'Secondary'];
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

const getInventoryId = drug => {
  if (drug?.drug_id) return 1;
  if (drug?.ndrug_id) return 2;
};

const insertIntoJSON = invalidDrugs => {
  const jsonContent = JSON.stringify(invalidDrugs, null, 2);
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/invalidDrugs.json');
  // Write JSON content to a file
  fs.writeFileSync(filePath, jsonContent);
  logger.info('File has been saved.');
};

const convertToISO = (dateString: string) => {
  const date = dayjs(dateString, 'DD/MM/YYYY HH:mm');
  return date.toISOString();
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

const invalidDrugs = [];
const insertDrugs = async drug => {
  const patientId = drug?.patient_id || drug?.dependant_id;
  const patientType = drug?.patient_id ? 'Patient' : 'Dependant';

  try {
    // check if the patient exists
    const patient = await Patient.findOne({
      where: { old_patient_id: patientId, patient_type: patientType },
    });
    // if not - write the prescribedDrug into a file
    if (!patient) {
      invalidDrugs.push({ ...drug, reason: 'Patient does not exist' });
      return;
    }
    const alreadyExists = await PrescribedDrug.findOne({
      where: { patient_id: patient.id, old_id: drug?.pd_id },
    });
    if (alreadyExists) return;
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
        status: isInLast3Days(drug?.createdAt) ? VisitStatus.ONGOING : VisitStatus.ENDED,
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
    const dosageId = await getDosageForms(drug?.dosage_form);
    const strengthId = await getStrength(drug?.strength);
    const route = await getRoute(drug?.dosage_form);

    await PrescribedDrug.create({
      drug_id: foundDrug.id,
      patient_id: patient.id,
      dosage_form_id: dosageId,
      drug_type: drug?.drug_id ? 'Cash' : 'NHIS',
      quantity_prescribed: drug?.quantity || 1,
      quantity_to_dispense: drug?.quantity_to_dispense || 1,
      quantity_dispensed: drug?.quantity_dispensed || 1,
      route_id: route,
      frequency: drug?.frequency,
      duration: drug?.duration,
      notes: drug?.notes,
      total_price: drug?.drug_id ? drug?.total_price : drug?.capitated_price,
      strength_id: strengthId,
      dispense_status: drug?.dispense_status,
      examiner: foundStaff?.id || 1,
      prescribed_strength: drug?.prescribed_strength || '0.5',
      duration_unit: drug?.duration_count,
      start_date: drug?.starting_date,
      visit_id: visit.id,
      drug_group: drug?.drug_id ? null : pickRandomType(),
      drug_prescription_id: drugPrescription.id,
      date_prescribed: drug?.createdAt,
      createdAt: drug?.createdAt,
      updatedAt: drug?.updatedAt,
      payment_status: drug?.payment_status,
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
      old_id: drug?.pd_id,
      inventory_id: getInventoryId(drug),
    });
  } catch (e) {
    invalidDrugs.push({ ...drug, reason: `Error, ${e?.message}` });
    logger.error(e);
  }
};

export const migratePrescribedDrugs = async () => {
  const message = taggedMessaged('migratePrescribedDrugs');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_today/prescribedDrugs.json');

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    if (readFile) {
      const prescribedDrugs = JSON.parse(readFile);

      for (const drug of prescribedDrugs) {
        await insertDrugs(drug);
      }
      logger.info(message('Successfully migrated all PrescribedDrugs data'));
      insertIntoJSON(invalidDrugs);
    }
    logger.notice(message('Successfully migrated all PrescribedDrugs data'));
  } catch (e) {
    throw new Error(e);
  }
};
