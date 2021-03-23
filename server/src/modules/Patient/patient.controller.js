/* eslint-disable camelcase */
import {
  validateCashPatient,
  validateDependant,
  validateHealthInsurancePatient,
  validateOrdinaryPatient,
} from './validations';
import PatientService from './patient.service';
import { getOneDependant, getOnePatient } from './patient.repository';
import { APIError } from '../../util/apiError';

class PatientController {
  /**
   * create a cash patient record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async createCashPatient(req, res, next) {
    const { error } = validateCashPatient(req.body);
    if (error) throw new APIError('ERROR', 400, error.details[0].message);

    try {
      const patient = await PatientService.createCashPatientService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful, data saved!',
        data: patient,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a health insurance patient record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async createHealthInsurancePatient(req, res, next) {
    const { error } = validateHealthInsurancePatient(req.body);
    if (error) throw new APIError('ERROR', 400, error.details[0].message);

    try {
      const patient = await PatientService.createInsurancePatientService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful, data saved!',
        data: patient,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a ordinary patient record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async createOrdinaryPatient(req, res, next) {
    const { error } = validateOrdinaryPatient(req.body);
    if (error) throw new APIError('ERROR', 400, error.details[0].message);

    try {
      const patient = await PatientService.createOrdinaryPatientService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful, data saved!',
        data: patient,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a dependant record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, dependant data
   */
  static async createDependant(req, res, next) {
    const { error } = validateDependant(req.body);
    if (error) throw new APIError('ERROR', 400, error.details[0].message);

    try {
      const dependant = await PatientService.createDependantService(
        Object.assign(req.body, { staff_id: req.user.sub, patient_id: req.params.id })
      );

      return res.status(201).json({
        message: 'Successful, data saved!',
        data: dependant,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get patients
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patients data
   */
  static async getPatients(req, res, next) {
    try {
      const patients = await PatientService.getPatients(req.query);

      return res.status(200).json({
        message: 'Success',
        data: patients,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get dependants
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, dependants data
   */
  static async getDependants(req, res, next) {
    try {
      const dependants = await PatientService.getDependants(req.query);

      return res.status(200).json({
        message: 'Success',
        data: dependants,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a patient record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async updatePatient(req, res, next) {
    const { patient_id } = req.body;
    if (!patient_id) throw new APIError('ERROR', 400, 'patient id is required');

    try {
      const patient = await PatientService.updatePatientService(req.body);

      return res.status(200).json({
        message: 'Successful, data updated!',
        data: patient,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a dependant record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, dependant data
   */
  static async updateDependant(req, res, next) {
    const { dependant_id } = req.body;
    if (!dependant_id) throw new APIError('ERROR', 400, 'dependant id is required');

    try {
      const dependant = await PatientService.updateDependantService(req.body);

      return res.status(200).json({
        message: 'Successful, data updated!',
        data: dependant,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get a patient record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async getPatientProfile(req, res, next) {
    const { id } = req.params;
    if (!id) throw new APIError('ERROR', 400, 'invalid patient id');

    try {
      const patient = await getOnePatient(id);

      return res.status(201).json({
        message: 'Success',
        data: patient,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get a dependant record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, dependant data
   */
  static async getDependantProfile(req, res, next) {
    const { id } = req.params;
    if (!id) throw new APIError('ERROR', 400, 'invalid dependant id');

    try {
      const dependant = await getOneDependant(id);

      return res.status(201).json({
        message: 'Success',
        data: dependant,
      });
    } catch (e) {
      return next(e);
    }
  }
}
export default PatientController;
