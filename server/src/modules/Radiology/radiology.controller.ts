import {
  validateAddInvestigationResults,
  validateCreateComboInvestigation,
  validateImaging,
  validateInvestigation,
  validateResultApproval,
} from './validations';
import { RadiologyService } from './radiology.service';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { validateChangeTestResultStatus, validateTestTariff } from '../Laboratory/validations';
import { successResponse } from '../../common/responses/success-responses';
import {
  DATA_SAVED,
  DATA_UPDATED,
  DATA_RETRIEVED,
} from '../AdminSettings/messages/response-messages';
import { NextFunction, Response, Request } from 'express';
import LaboratoryService from '../Laboratory/laboratory.service';
import { validateUpdateInvestigationsResultStatus } from '../Orders/Radiology/validations';
import { downloadRadiologyResult } from '../../core/helpers/downloadRadiologyResult';

export class RadiologyController {
  /**
   * create a imaging
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, imaging data
   */
  static async createImaging(req, res, next) {
    const { error } = validateImaging(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const imaging = await RadiologyService.createImagingService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: imaging,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get imaging
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, imaging data
   */
  static async getImaging(req, res, next) {
    try {
      const imaging = await RadiologyService.getImaging(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: imaging,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update an imaging
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, Imaging data
   */
  static async updateImaging(req, res, next) {
    const { imaging_id } = req.body;
    if (!imaging_id)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: 'Imaging id is required',
      });

    try {
      const imaging = await RadiologyService.updateImagingService(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_UPDATED,
        data: imaging,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a investigation
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, investigation data
   */
  static async createInvestigation(req, res, next) {
    const { error } = validateInvestigation(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const investigation = await RadiologyService.createInvestigationService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: investigation,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get investigation
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, investigation data
   */
  static async getInvestigations(req, res, next) {
    try {
      const investigations = await RadiologyService.getInvestigations(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: investigations,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a investigation tariff
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test data
   */
  static async createInvestigationTariff(req, res, next) {
    const { error } = validateTestTariff(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const test = await RadiologyService.createInvestigationTariffService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: test,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update an Investigation
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, Investigation data
   */
  static async updateInvestigation(req, res, next) {
    const { investigation_id } = req.body;
    if (!investigation_id)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: 'Investigation id is required',
      });

    try {
      const investigation = await RadiologyService.updateInvestigationService(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_UPDATED,
        data: investigation,
      });
    } catch (e) {
      return next(e);
    }
  }

  /************************
   * RADIOLOGY RESULTS
   ***********************/
  /**
   * get requested investigations
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, investigations data
   */
  static async getRequestedInvestigations(req, res, next) {
    try {
      const investigations = await RadiologyService.getRequestedInvestigations(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: investigations,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get requested investigation
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, requested investigation data
   */
  static async getOneRequestedInvestigation(req, res, next) {
    try {
      const investigationPrescription = await RadiologyService.getOneRequestedInvestigation({
        prescriptionId: req.params.id,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: investigationPrescription,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * upload result images
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, images data
   */
  static async uploadResultImages(req, res, next) {
    try {
      if (!req.file) {
        return errorResponse({
          res,
          httpCode: StatusCodes.BAD_REQUEST,
          message: 'No image provided',
        });
      }

      const imagePath = `static/images/${req.file.filename}`;
      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: imagePath,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Add investigation result
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, investigation result data
   */
  static async addInvestigationResults(req, res: Response, next: NextFunction) {
    const { error } = validateAddInvestigationResults(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const investigationResult = await RadiologyService.appendInvestigationResults({
        ...req.body,
        staff_id: req.user.sub,
      });

      return res.status(StatusCodes.CREATED).json({
        message: DATA_UPDATED,
        data: investigationResult,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get investigations needing approvals
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, requested investigations data
   */
  static async getInvestigationsApproval(req, res, next) {
    try {
      const investigations = await RadiologyService.getInvestigationsApproval(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: investigations,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Approve investigation result
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, investigation result data
   */
  static async approveInvestigationResults(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateResultApproval(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const investigationResult = await RadiologyService.approveInvestigationResults({
        ...req.body,
        staff_id: req.user.sub,
      });

      return res.status(StatusCodes.CREATED).json({
        message: DATA_UPDATED,
        data: investigationResult,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get investigations results
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, investigations results data
   */
  static async getInvestigationsResults(req, res, next) {
    try {
      const investigations = await RadiologyService.getInvestigationsResults(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: investigations,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get investigation result
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, result data
   */
  static async getInvestigationResult(req, res, next) {
    try {
      const result = await RadiologyService.getInvestigationResult({
        prescriptionId: req.params.id,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: result,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get one investigation prescription
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, investigation prescription data
   */
  static async getOneInvestigationPrescription(req, res, next) {
    try {
      const investigationPrescription = await RadiologyService.getOneInvestigationPrescription(
        +req.params.id
      );

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: investigationPrescription,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Change investigation results status
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, prescribed test data
   */
  static async updateInvestigationResultStatus(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateUpdateInvestigationsResultStatus(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const investigationPrescription = await RadiologyService.updateInvestigationResultStatus(
        req.body.selectedInvestigations,
        +req.params.id
      );

      return successResponse({
        res,
        message: DATA_UPDATED,
        httpCode: StatusCodes.CREATED,
        data: investigationPrescription,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Download radiology result as PDF
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {pdf} PDF file download
   */
  static async downloadRadiologyResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientInfo, radiologyResults } = await RadiologyService.downloadRadiologyResult(
        +req.params.id
      );
      return downloadRadiologyResult(patientInfo, radiologyResults, res);
    } catch (e) {
      return next(e);
    }
  }

  /** ***********************
   * COMBO INVESTIGATIONS
   ********************** */

  /**
   * create a combo investigation
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, combo investigation data
   */
  static async createComboInvestigation(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateCreateComboInvestigation(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    const { name, investigation_ids } = req.body;
    try {
      const comboInvestigation = await RadiologyService.createComboInvestigation({
        name,
        investigation_ids,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: comboInvestigation,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get combo investigations
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with combo investigations data
   */
  static async getComboInvestigations(req: Request, res: Response, next: NextFunction) {
    try {
      const comboInvestigations = await RadiologyService.getComboInvestigations(req.query);

      return successResponse({
        res,
        message: DATA_RETRIEVED,
        httpCode: StatusCodes.OK,
        data: comboInvestigations,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get one combo investigation
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with combo investigation data
   */
  static async getOneComboInvestigation(req: Request, res: Response, next: NextFunction) {
    try {
      const comboInvestigation = await RadiologyService.getOneComboInvestigation(+req.params.id);

      return successResponse({
        res,
        message: DATA_RETRIEVED,
        httpCode: StatusCodes.OK,
        data: comboInvestigation,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a combo investigation
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, combo investigation data
   */
  static async updateComboInvestigation(req: Request, res: Response, next: NextFunction) {
    const { id } = req.body;
    if (!id) {
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: 'Combo investigation ID is required',
      });
    }

    try {
      const comboInvestigation = await RadiologyService.updateComboInvestigation(req.body);

      return successResponse({
        res,
        data: comboInvestigation,
        message: DATA_UPDATED,
        httpCode: StatusCodes.OK,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * delete a combo investigation
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status message
   */
  static async deleteComboInvestigation(req: Request, res: Response, next: NextFunction) {
    try {
      await RadiologyService.deleteComboInvestigation(+req.params.id);

      return successResponse({
        res,
        message: 'Combo investigation deleted successfully',
        httpCode: StatusCodes.OK,
        data: null,
      });
    } catch (e) {
      return next(e);
    }
  }
}
