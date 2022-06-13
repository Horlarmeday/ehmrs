/* eslint-disable camelcase */
import { BadException } from '../../common/util/api-error';
import {
  createCashPatient,
  createDependant,
  createInsurancePatient,
  createOrdinaryPatient,
  findDependantByEnrolleeCode,
  findPatientByPhone,
  getPatientProfile,
  getPatientById,
  getPatients,
  getPatientsByDate,
  searchPatients,
  updatePatient,
} from './patient.repository';
import { processSnappedPhoto, StatusCodes } from '../../core/helpers/helper';
import { assignHospitalNumber, uploadImageToBox } from '../../core/command/schedule';
import { DEPENDANT_EXIST, INTERNAL_ERROR, PATIENT_EXIST } from './messages/response-messages';

class PatientService {
  /**
   * create cash patient account
   *
   * @static
   * @returns {json} json object with patient data
   * @param body
   * @memberOf PatientService
   */
  static async createCashPatientService(body) {
    const patient = await findPatientByPhone(body.phone);
    if (patient) throw new BadException('INVALID', StatusCodes.BAD_REQUEST, PATIENT_EXIST);

    try {
      // Save photo to disk
      const { filepath, fileName } = await processSnappedPhoto(body.photo, body.firstname);

      const createdPatient = await createCashPatient({ ...body, fileName });
      await assignHospitalNumber(createdPatient.id);
      // upload patient to box in the background
      await uploadImageToBox(filepath, fileName, createdPatient);
      return createdPatient;
    } catch (e) {
      throw new BadException('Error', StatusCodes.SERVER_ERROR, e.message);
    }
  }

  /**
   * create health insurance patient account along with his dependants
   *
   * @static
   * @returns {json} json object with patient data
   * @param body
   * @memberOf PatientService
   */
  static async createInsurancePatientService(body) {
    const user = await findPatientByPhone(body.phone);
    if (user) throw new BadException('INVALID', StatusCodes.BAD_REQUEST, PATIENT_EXIST);

    try {
      // Save photo to disk
      const { fileName } = await processSnappedPhoto(body.photo, body.firstname);

      return createInsurancePatient({ ...body, fileName });
    } catch (e) {
      throw new BadException('Error', StatusCodes.SERVER_ERROR, INTERNAL_ERROR);
    }
  }

  /**
   * create ordinary patient account
   *
   * @static
   * @returns {json} json object with patient data
   * @param body
   * @memberOf PatientService
   */
  static async createOrdinaryPatientService(body) {
    const patient = await findPatientByPhone(body.phone);
    if (patient) throw new BadException('INVALID', StatusCodes.BAD_REQUEST, PATIENT_EXIST);

    const createdPatient = await createOrdinaryPatient(body);
    await assignHospitalNumber(createdPatient.id);
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
  static async createDependantService(body) {
    const dependant = await findDependantByEnrolleeCode(body.enrollee_code);
    if (dependant) throw new BadException('INVALID', StatusCodes.BAD_REQUEST, DEPENDANT_EXIST);

    const patient = await createDependant(body);
    await assignHospitalNumber(patient.id);
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
  static async getPatients(body) {
    const { search, start, end, pageLimit, currentPage } = body;
    if (search) {
      return searchPatients(+currentPage, +pageLimit, search);
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
    return updatePatient(body);
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
   * get a patient profile by Id
   *
   * @static
   * @returns {json} json object with patient data
   * @memberOf PatientService
   * @param id
   */
  static async getPatientProfile(id) {
    return getPatientProfile(id);
  }
}
export default PatientService;
