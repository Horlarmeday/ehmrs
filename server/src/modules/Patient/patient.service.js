/* eslint-disable camelcase */
import APIError from '../../util/apiError';
import {
  createCashPatient,
  createDependant,
  createInsurancePatient,
  createOrdinaryPatient,
  findDependantByEnrolleeCode,
  findPatientByPhone,
  generateHospitalNumber,
  getDependants,
  getDependantsByDate,
  getPatientByHospitalId,
  getPatients,
  getPatientsByDate,
  searchDependants,
  searchPatients,
  updateDependant,
  updatePatient,
} from './patient.repository';
import { processSnappedPhoto } from '../../helpers/helper';
import { uploadImageToBox } from '../../command/schedule';

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
    if (patient) throw new APIError('INVALID', 400, 'Patient already exists');

    let hospital_id = await generateHospitalNumber();

    const existingHospitalId = await getPatientByHospitalId(hospital_id);
    if (existingHospitalId) hospital_id = generateHospitalNumber();

    try {
      // Save photo to disk
      const { filepath, fileName } = await processSnappedPhoto(body.photo, body.firstname);

      const createdPatient = await createCashPatient({ ...body, hospital_id, fileName });
      // upload patient to box in the background
      await uploadImageToBox(filepath, fileName, createdPatient);
      return createdPatient;
    } catch (e) {
      throw new APIError('Error', 500, 'internal server error');
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
    if (user) throw new APIError('INVALID', 400, 'Patient already exists');

    let hospital_id = await generateHospitalNumber();

    try {
      const existingHospitalId = await getPatientByHospitalId(hospital_id);
      if (existingHospitalId) hospital_id = generateHospitalNumber(1);
      // Save photo to disk
      const { fileName } = await processSnappedPhoto(body.photo, body.firstname);

      return createInsurancePatient({ ...body, hospital_id, fileName });
    } catch (e) {
      throw new APIError('Error', 500, 'internal server error');
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
    if (patient) throw new APIError('INVALID', 400, 'Patient already exists');

    return createOrdinaryPatient(body);
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
    if (dependant) throw new APIError('INVALID', 400, 'Dependants already exists');

    return createDependant(body);
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
}
export default PatientService;
