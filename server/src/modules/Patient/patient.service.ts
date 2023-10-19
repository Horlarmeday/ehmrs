/* eslint-disable camelcase */
import { BadException } from '../../common/util/api-error';
import {
  createPatientAccount,
  createDependant,
  createEmergencyPatient,
  findDependantByEnrolleeCode,
  findPatientByPhone,
  getPatientProfile,
  getPatientById,
  getPatients,
  getPatientsByDate,
  searchPatients,
  updatePatient,
  addPatientInsurance,
  getPatientByNameAndPhone,
} from './patient.repository';
import { processSnappedPhoto, StatusCodes } from '../../core/helpers/helper';
import { JobSchedule } from '../../core/command/worker/schedule';
import { DEPENDANT_EXIST, INTERNAL_ERROR, PATIENT_EXIST } from './messages/response-messages';
import {
  AddPatientInsuranceBody,
  CreatePatientBody,
  EmergencyPatientBody,
  PatientType,
} from './types/patient.types';
import { prescribeService } from '../Orders/Service/service-order.repository';
import { ParsedQs } from 'qs';
import { Patient } from '../../database/models';

class PatientService {
  /**
   * create cash patient account
   *
   * @static
   * @returns {json} json object with patient data
   * @memberOf PatientService
   * @param createPatientBody
   */
  static async createPatientAccount(createPatientBody: CreatePatientBody) {
    const patient = await findPatientByPhone(createPatientBody.phone);
    if (patient) throw new BadException('INVALID', StatusCodes.BAD_REQUEST, PATIENT_EXIST);

    try {
      // Save photo to disk
      const fileName = await processSnappedPhoto(
        createPatientBody.photo,
        createPatientBody.firstname
      );

      const createdPatient = await createPatientAccount({ ...createPatientBody, fileName });
      await JobSchedule.assignHospitalNumber(createdPatient.id);

      if (createPatientBody.service_id)
        await prescribeService({
          service_id: createPatientBody.service_id,
          patient_id: createdPatient.id,
          price: createPatientBody.registration_fee,
          service_type: 'Cash',
        });
      // await uploadImage(body.photo, createdPatient.id);
      return createdPatient;
    } catch (e) {
      throw new BadException('Error', StatusCodes.SERVER_ERROR, e.message);
    }
  }

  /**
   * set patient health insurance and dependants
   *
   * @static
   * @returns {json} json object with patient data
   * @memberOf PatientService
   * @param patientInsuranceBody
   */
  static async addPatientInsurance(patientInsuranceBody: AddPatientInsuranceBody) {
    const { patient_id, dependants, staff_id } = patientInsuranceBody;
    let updatedDependants = [];

    try {
      if (dependants?.length) {
        updatedDependants = await Promise.all(
          dependants.map(async dependant => ({
            ...dependant,
            firstname: dependant.firstname.replace(/ +(?= )/g, '').trim(),
            lastname: dependant.lastname.replace(/ +(?= )/g, '').trim(),
            principal_id: patient_id,
            patient_type: PatientType.DEPENDANT,
            photo: await processSnappedPhoto(dependant.photo, dependant.firstname),
            staff_id,
            has_insurance: true,
          }))
        );
      }
      return addPatientInsurance({ ...patientInsuranceBody, dependants: updatedDependants });
    } catch (e) {
      throw new BadException('Error', StatusCodes.SERVER_ERROR, INTERNAL_ERROR);
    }
  }

  /**
   * create ordinary patient account
   *
   * @static
   * @returns {json} json object with patient data
   * @memberOf PatientService
   * @param emergencyPatientBody
   */
  static async createEmergencyPatient(emergencyPatientBody: EmergencyPatientBody) {
    const patient = await findPatientByPhone(emergencyPatientBody.phone);
    if (patient) throw new BadException('INVALID', StatusCodes.BAD_REQUEST, PATIENT_EXIST);

    const createdPatient = await createEmergencyPatient(emergencyPatientBody);
    await JobSchedule.assignHospitalNumber(createdPatient.id);

    return createdPatient;
  }

  /**
   * create a dependant account
   *
   * @static
   * @returns {json} json object with dependant data
   * @param body
   * @memberOf PatientService
   */
  static async createDependantService(body): Promise<Patient> {
    const dependant = await findDependantByEnrolleeCode(body.enrollee_code);
    if (dependant) throw new BadException('INVALID', StatusCodes.BAD_REQUEST, DEPENDANT_EXIST);

    // Save photo to disk
    const fileName = await processSnappedPhoto(body.photo, body.firstname);

    const patient = await createDependant({ ...body, photo: fileName });
    await JobSchedule.assignHospitalNumber(patient.id);

    return patient;
  }

  /**
   * get patients
   *
   * @static
   * @returns {json} json object with patients data
   * @param body
   * @memberOf PatientService
   */
  static async getPatients(body: { [s: string]: string | string[] | ParsedQs | ParsedQs[] }) {
    const { search, start, end, pageLimit, currentPage, filter } = body;
    if (filter) {
      return searchPatients({ currentPage: +currentPage, pageLimit: +pageLimit, search, filter });
    }

    if (search) {
      return searchPatients({ currentPage: +currentPage, pageLimit: +pageLimit, search });
    }

    if (start && end) {
      return getPatientsByDate(+currentPage, +pageLimit, start, end);
    }

    if (Object.values(body).length) {
      return getPatients(+currentPage, +pageLimit);
    }

    return getPatients();
  }

  /**
   * update a patient record
   *
   * @static
   * @returns {json} json object with patient data
   * @param body
   * @memberOf PatientService
   */
  static async updatePatientService(body) {
    let photo;
    if (body.picture) {
      photo = await processSnappedPhoto(body.picture, body.patient.firstname);
    }
    return updatePatient({
      ...body.patient,
      patient_id: body.patient_id,
      ...(body.picture && { photo }),
    });
  }

  /**
   * get a patient by Id
   *
   * @static
   * @returns {json} json object with patient data
   * @memberOf PatientService
   * @param id
   */
  static async getPatientById(id) {
    return getPatientById(id);
  }

  /**
   * get a patient profile by id
   *
   * @static
   * @returns {json} json object with patient data
   * @memberOf PatientService
   * @param id
   */
  static async getPatientProfile(id) {
    return getPatientProfile(id);
  }

  /**
   * get a patient profile by name and phone
   *
   * @static
   * @returns {json} json object with patient data
   * @memberOf PatientService
   * @param body
   */
  static async getPatientByNameAndPhone(body) {
    return getPatientByNameAndPhone(body);
  }
}
export default PatientService;
