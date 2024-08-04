import { Patient, PatientInsurance } from '../../../../database/models';
import { Op } from 'sequelize';
import { logger, taggedMessaged } from '../../../helpers/logger';
import { processArray } from '../../../helpers/general';

const createPatientInsuranceRecord = async (
  patient: Patient & {
    hmo_id: number;
    insurance_id: number;
    plan: string;
    enrollee_code: string;
    organization: string;
  }
) => {
  const message = taggedMessaged('createPatientInsuranceRecord');

  const insurance = await PatientInsurance.findOne({
    where: { patient_id: patient.id, hmo_id: patient.hmo_id, insurance_id: patient.insurance_id },
  });
  if (insurance) return;
  await PatientInsurance.create({
    patient_id: patient.id,
    insurance_id: patient.insurance_id,
    hmo_id: patient.hmo_id,
    plan: patient.plan,
    organization: patient.organization,
    enrollee_code: patient.enrollee_code,
    staff_id: 1,
    is_default: true,
  });

  await Patient.update({ has_insurance: true }, { where: { id: patient.id } });

  logger.notice(message(`Create health insurance for ${patient.fullname}`));
};

export const updatePatientHealthInsurance = async () => {
  const message = taggedMessaged('UpdatePatientHealthInsurance');
  const patients = await Patient.findAll({ where: { hmo_id: { [Op.ne]: null } } });

  try {
    if (patients?.length) {
      await processArray(patients, createPatientInsuranceRecord);
    }
    logger.warn(message(`No patients with empty hospital number, skipping...`));
  } catch (e) {
    logger.error(message('Error'), e);
  }
};
