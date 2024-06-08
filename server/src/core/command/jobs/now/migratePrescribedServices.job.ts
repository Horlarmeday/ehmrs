import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import {
  Patient,
  PatientInsurance,
  PrescribedService,
  PrescribedTest,
  Service,
  Staff,
  Visit,
} from '../../../../database/models';
import { VisitCategory, VisitStatus } from '../../../../database/models/visit';
import dayjs from 'dayjs';
import { BillingStatus } from '../../../../database/models/prescribedDrug';
import { NHISApprovalStatus } from '../../../helpers/general';
import { staffs } from './staffs';
import { Source } from '../../../../database/models/prescribedService';

const isInLast3Days = date => {
  const now = dayjs();
  const dateToCompare = dayjs(date);
  return dateToCompare.isAfter(now.subtract(1, 'day')) && dateToCompare.isBefore(now.add(1, 'day'));
};

const createVisit = async (
  service: { createdAt: any; updatedAt: string | number | Date | dayjs.Dayjs; staff_id: any },
  patient: Patient,
  column = null,
  columnId = null
) => {
  return await Visit.create({
    patient_id: patient.id,
    category: column
      ? column === 'consultation_id'
        ? VisitCategory.OPD
        : VisitCategory.ANC
      : VisitCategory.OPD,
    date_visit_start: service?.createdAt,
    date_visit_ended: dayjs(service?.updatedAt)
      .add(6, 'hours')
      .toDate(),
    department: column
      ? column === 'consultation_id'
        ? 'Medical Practitioner'
        : 'Nursing'
      : 'Medical Practitioner',
    professional: column
      ? column === 'consultation_id'
        ? 'General Practitioner'
        : 'Nurse'
      : 'General Practitioner',
    type: 'New Visit',
    has_done_vitals: false,
    is_taken: false,
    status: isInLast3Days(service?.createdAt) ? VisitStatus.ONGOING : VisitStatus.ENDED,
    staff_id: service?.staff_id || 1,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    ante_natal_id: column ? (column === 'ante_natal_id' ? columnId : null) : null,
    consultation_id: column ? (column === 'consultation_id' ? columnId : null) : null,
  });
};

const insertIntoJSON = invalidServices => {
  const jsonContent = JSON.stringify(invalidServices, null, 2);
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/invalidServices.json');
  // Write JSON content to a file
  fs.writeFileSync(filePath, jsonContent);
  logger.info('File has been saved.');
};

const invalidServices = [];

const insertServices = async service => {
  const patientId = service?.patient_id || service?.dependant_id;
  const patientType = service?.patient_id ? 'Patient' : 'Dependant';

  try {
    // check if the patient exists
    const patient = await Patient.findOne({
      where: { old_patient_id: patientId, patient_type: patientType },
    });
    // if not - write the prescribedService into a file
    if (!patient) {
      invalidServices.push({ ...service, reason: 'Patient does not exist' });
      return;
    }
    // service id not exists
    if (!service?.service_id) {
      invalidServices.push({ ...service, reason: 'service id does not exist' });
      return;
    }

    const alreadyExists = await PrescribedService.findOne({
      where: { patient_id: patient.id, old_id: service?.ps_id },
    });
    if (alreadyExists) return;

    // if service_id exists, check it in the db services with old_id
    // else check nservice_id with nhis_old_id
    const foundService = await Service.findOne({
      where: { id: service?.service_id },
    });
    // if none exists -  write the prescribedService into a file
    if (!foundService) {
      invalidServices.push({ ...service, reason: 'service does not exist' });
      return;
    }

    let visit;
    if (!service?.consultation_id && !service?.ante_natal_id) {
      visit = await createVisit(service, patient, null, null);
    } else {
      const columnId = service?.consultation_id || service?.ante_natal_id;
      const column = service?.consultation_id ? 'consultation_id' : 'ante_natal_id';
      visit = await Visit.findOne({ where: { [column]: columnId } });
      if (!visit) {
        visit = await createVisit(service, patient, column, columnId);
      }
    }
    // if hmo_id exists, check patient insurances and pick id
    let patientInsurance;
    if (patient?.has_insurance) {
      patientInsurance = await PatientInsurance.findOne({ where: { patient_id: patient.id } });
    }

    const staff = staffs?.find(({ fullname }) => service?.examiner === fullname);
    const foundStaff = await Staff.findOne({ where: { id: staff?.id || 1 } });

    await PrescribedService.create({
      service_id: foundService.id,
      patient_id: patient.id,
      service_type: service?.service_id ? 'Cash' : 'NHIS',
      price: service?.price,
      requester: foundStaff?.id || 1,
      visit_id: visit?.id,
      quantity: service.quantity,
      date_requested: service?.createdAt,
      payment_status: service?.payment_status,
      billing_status:
        service?.payment_status === 'Paid' || service?.payment_status === 'Cleared'
          ? BillingStatus.BILLED
          : BillingStatus.UNBILLED,
      nhis_status: service?.is_nhis_service_approved
        ? NHISApprovalStatus.APPROVED
        : NHISApprovalStatus.PENDING,
      ante_natal_id: visit?.ante_natal_id,
      source: Source.CONSULTATION,
      patient_insurance_id: patientInsurance?.id,
      old_id: service?.ps_id,
      createdAt: service?.createdAt,
      updatedAt: service?.updatedAt,
    });
  } catch (e) {
    invalidServices.push({ ...service, reason: `Error, ${e?.message}` });
    logger.error(e);
  }
};

export const migratePrescribedServices = async () => {
  const message = taggedMessaged('migratePrescribedServices');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_today/prescribedServices.json');

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    if (readFile) {
      const prescribedServices = JSON.parse(readFile);

      for (const service of prescribedServices) {
        await insertServices(service);
      }

      logger.info(message('Successfully migrated all prescribedServices data'));
    }
    insertIntoJSON(invalidServices);
    logger.notice(message('Successfully migrated all prescribedServices data'));
  } catch (e) {
    throw new Error(e);
  }
};
