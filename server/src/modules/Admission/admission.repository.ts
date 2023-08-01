import sequelize from '../../database/config/config';
import { Transaction } from 'sequelize';
import { Admission } from '../../database/models/admission';
import { Bed, Patient, PrescribedService, Staff, Ward } from '../../database/models';
import { BedStatus } from '../../database/models/bed';
import { ServiceType } from '../../database/models/prescribedService';
import { PatientStatus } from '../../database/models/patient';
import { getWardWithService } from '../AdminSettings/admin.repository';
import { getPatientWithInsurance } from '../Patient/patient.repository';
import { AdmissionBodyType } from './types/admission.types';

/**
 * Admit patient into a ward
 * @param data
 */
export const admitPatient = async (data: AdmissionBodyType) => {
  const { bed_id, admitted_by, patient_id, visit_id, ward_id } = data;
  const EXCLUDED_INSURANCE = ['NHIS', 'FHSS'];
  return await sequelize.transaction(async (t: Transaction) => {
    const admission = await Admission.create({ ...data }, { transaction: t });
    await Bed.update({ status: BedStatus.TAKEN }, { where: { id: bed_id }, transaction: t });
    const ward = await getWardWithService(ward_id);
    const patient = await getPatientWithInsurance(patient_id);
    if (!patient.insurance_id || !EXCLUDED_INSURANCE.includes(patient?.insurance?.name))
      await PrescribedService.create(
        {
          service_id: ward.service.id,
          price: ward.service.price,
          service_type: ServiceType.CASH,
          requester: admitted_by,
          visit_id,
          patient_id,
          date_requested: Date.now(),
        },
        { transaction: t }
      );
    await Patient.update(
      { patient_status: PatientStatus.ADMITTED },
      { where: { id: patient_id }, transaction: t }
    );
    //todo: insert default admission items
    return await getAdmissionById(admission.id);
  });
};

/**
 * get admission by its id
 * @param admission_id
 */
export const getAdmissionById = (admission_id: number) => {
  return Admission.findByPk(admission_id, {
    include: [
      { model: Ward, attributes: ['name'] },
      { model: Bed, attributes: ['code'] },
      { model: Staff, as: 'examiner', attributes: ['firstname', 'lastname'] },
    ],
  });
};

/**
 * get admission by patient id
 * @param patient_id
 */
export const getAdmissionByPatientId = (patient_id: number) => {
  return Admission.findOne({
    where: { patient_id },
    include: [
      { model: Ward, attributes: ['name'] },
      { model: Bed, attributes: ['code'] },
      { model: Staff, as: 'examiner', attributes: ['firstname', 'lastname'] },
    ],
  });
};

export const updateAdmission = async (data, admissionId) => {
  return Admission.update({ ...data }, { where: { id: admissionId } });
};
