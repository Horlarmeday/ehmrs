/* eslint-disable camelcase */
import {
  validateCreatePatientAccount,
  validateDependant,
  validatePatientHealthInsurance,
  validateCreateEmergencyPatient,
  validateFindPatient,
  validateUpdatePatientInsurance,
  validateTogglePatientInsurance,
  validatePatientAccountsMerge,
  validateMarkPatientAsDeceased,
  validateRevivePatient,
  validateTransferDependants,
} from './validations';
import PatientService from './patient.service';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import { DATA_SAVED, DATA_UPDATED } from '../AdminSettings/messages/response-messages';
import { NextFunction, Request, Response } from 'express';
import { SUCCESS } from '../../core/constants';
import { PATIENT_ACCOUNTS_MERGED, PATIENT_ID_REQUIRED } from './messages/response-messages';
import { generateHospitalCard } from '../../core/helpers/generateHospitalCard';

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
  static async createPatientAccount(req, res, next): Promise<SuccessResponse> {
    const { error } = validateCreatePatientAccount(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const patient = await PatientService.createPatientAccount({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: patient,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * add patient health insurance info
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async addPatientHealthInsurance(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { error } = validatePatientHealthInsurance(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const patient = await PatientService.addPatientInsurance({
        ...req.body,
        patient_id: req.params.id,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * create an emergency patient record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async createEmergencyPatientAccount(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { error } = validateCreateEmergencyPatient(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const patient = await PatientService.createEmergencyPatient({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: patient,
      });
    } catch (e) {
      next(e);
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
  static async createDependant(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateDependant(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const dependant = await PatientService.createDependantService({
        ...req.body,
        staff_id: req.user.sub,
        patient_id: req.params.id,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
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
  static async getPatients(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    try {
      const patients = await PatientService.getPatients(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: patients,
      });
    } catch (e) {
      next(e);
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
  static async updatePatient(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    try {
      const patient = await PatientService.updatePatientService({
        ...req.body,
        patient_id: req.params.id,
        updated_by: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * update a patient insurance
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async updatePatientInsurance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { error } = validateUpdatePatientInsurance(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const patient = await PatientService.updatePatientInsurance({
        ...req.body,
        patient_id: req.params.id,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * toggle on/off a patient insurance
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async togglePatientInsurance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { error } = validateTogglePatientInsurance(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const patient = await PatientService.togglePatientInsurance({
        ...req.body,
        patient_id: req.params.id,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: patient,
      });
    } catch (e) {
      next(e);
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
  static async getPatientProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { id } = req.params;
    try {
      const patient = await PatientService.getPatientProfile(id);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * get a patient
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async getOnePatient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { id } = req.params;
    try {
      const patient = await PatientService.getPatientById(id);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * get a patient by name and phone
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async getPatientByNameAndPhone(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { error } = validateFindPatient(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const patient = await PatientService.getPatientByNameAndPhone(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * convert dependant account to a patient account
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async convertDependantToPatient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { id } = req.params;
    try {
      const patient = await PatientService.convertDependantToPatient(+id);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * merge patients accounts
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async mergePatientAccounts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { error } = validatePatientAccountsMerge(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const patient = await PatientService.mergePatientAccounts(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: PATIENT_ACCOUNTS_MERGED,
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * Get hospital card
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async getHospitalCard(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const patient = await PatientService.getPatientById(+id);
      const pdfBytes = await generateHospitalCard(patient);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename=${patient.firstname}-hospital-card.pdf`
      );
      res.send(Buffer.from(pdfBytes));
    } catch (e) {
      next(e);
    }
  }

  /**
   * Mark patient as deceased
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async markPatientAsDeceased(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { id } = req.params;
    const { error } = validateMarkPatientAsDeceased(req.body);

    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }

    try {
      const patient = await PatientService.markPatientAsDeceased(+id, req.body, req.user.sub);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Patient marked as deceased successfully',
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * Revive patient (admin only)
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async revivePatient(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { id } = req.params;
    const { error } = validateRevivePatient(req.body);

    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }

    try {
      const patient = await PatientService.revivePatient(+id, req.body, req.user.sub);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Patient revived successfully',
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * Generate missing death certificate numbers for existing deceased patients
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, update results
   */
  static async generateMissingDeathCertificateNumbers(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    try {
      const result = await PatientService.generateMissingDeathCertificateNumbers(req.user.sub);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: `Generated ${result.updated} missing death certificate numbers`,
        data: result,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * Get deceased patients
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patients data
   */
  static async getDeceasedPatients(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    try {
      const patients = await PatientService.getDeceasedPatients(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: patients,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * Generate death certificate
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, certificate data
   */
  static async generateDeathCertificate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { id } = req.params;
    try {
      const certificate = await PatientService.generateDeathCertificate(+id);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: certificate,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * Transfer dependants to another principal
   *
   * @static
   * @param {Request & { user: { sub: number } }} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with transfer result
   */
  static async transferDependants(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const { error } = validateTransferDependants(req.body);
      if (error) {
        return errorResponse({
          res,
          message: error.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const { deceased_principal_id, new_principal_id } = req.body;
      const result = await PatientService.transferDependantsToNewPrincipal(
        deceased_principal_id,
        new_principal_id,
        req.user.sub
      );

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: `Successfully transferred ${result.transferred} dependants`,
        data: result,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Generate PDF death certificate for patient
   *
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<void>}
   */
  static async generateDeathCertificatePDF(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const patientId = parseInt(req.params.id);
      const includeDigitalSignature = req.query.digital_signature === 'true';
      return PatientService.generateDeathCertificatePDF(patientId, res, includeDigitalSignature);
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get death statistics dashboard
   *
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with death statistics
   */
  static async getDeathStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const statistics = await PatientService.getDeathStatistics(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: statistics,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get mortality reports by department and condition
   *
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with mortality reports
   */
  static async getMortalityReports(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const reports = await PatientService.getMortalityReports(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: reports,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get death certificate tracking data
   *
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with certificate tracking data
   */
  static async getDeathCertificateTracking(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const tracking = await PatientService.getDeathCertificateTracking(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: tracking,
      });
    } catch (e) {
      return next(e);
    }
  }
}
export default PatientController;
