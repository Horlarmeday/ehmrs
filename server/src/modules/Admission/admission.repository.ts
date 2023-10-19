import sequelize from '../../database/config/config';
import { Op, Transaction } from 'sequelize';
import {
  Bed,
  Patient,
  PrescribedService,
  Staff,
  Ward,
  Admission,
  Visit,
} from '../../database/models';
import { BedStatus } from '../../database/models/bed';
import { ServiceType } from '../../database/models/prescribedService';
import { PatientStatus } from '../../database/models/patient';
import { getWardWithService } from '../AdminSettings/admin.repository';
import { getPatientById } from '../Patient/patient.repository';
import { AdmissionBodyType } from './types/admission.types';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import { patientAttributes } from '../Visit/visit.repository';
import { VisitCategory } from '../../database/models/visit';

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
    const [ward, insurance, patient] = await Promise.all([
      getWardWithService(ward_id),
      getPatientInsuranceQuery({ patient_id }),
      getPatientById(patient_id),
    ]);

    if (!patient.has_insurance || !EXCLUDED_INSURANCE.includes(insurance?.insurance?.name))
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
    await Visit.update(
      { category: VisitCategory.IPD, admission_id: admission.id },
      { where: { id: visit_id }, transaction: t }
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

export const updateAdmission = async (data: { [p: string]: any }, admissionId: number) => {
  return Admission.update({ ...data }, { where: { id: admissionId } });
};

/**
 * get admitted patients
 *
 * @function
 * @returns {Promise<{ total: any; docs: Admission[]; pages: number; perPage: number; currentPage: number }>} json object with all admission data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param discharge_status
 */
export const getAdmittedPatients = async ({
  currentPage = 1,
  pageLimit = 10,
  discharge_status,
  search = null,
}): Promise<{
  total: any;
  docs: Admission[];
  pages: number;
  perPage: number;
  currentPage: number;
}> => {
  return Admission.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      discharge_status,
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
        where: {
          ...(search && {
            [Op.or]: [
              {
                firstname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                lastname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                hospital_id: {
                  [Op.like]: `%${search}%`,
                },
              },
            ],
          }),
        },
      },
    ],
  });
};
