import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../../core/helpers/helper';
import { successResponse, SuccessResponse } from '../../common/responses/success-responses';
import { errorResponse } from '../../common/responses/error-responses';
import { SUCCESS } from '../../core/constants';
import { validateCreateDoctorReport, validateUpdateDoctorReport } from './validations';
import DoctorReportService from './doctorReport.service';

class DoctorReportController {
  /**
   * Create a new doctor report
   * @param req - express request
   * @param res - express response
   * @param next - next middleware
   * @returns {Promise<SuccessResponse | void>}
   */
  static async createDoctorReport(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateCreateDoctorReport(req.body);
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }

    try {
      const report = await DoctorReportService.createDoctorReportService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        message: 'Doctor report created successfully',
        data: report,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get a doctor report by ID
   * @param req - express request
   * @param res - express response
   * @param next - next middleware
   * @returns {Promise<SuccessResponse | void>}
   */
  static async getDoctorReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const report = await DoctorReportService.getDoctorReportService(parseInt(req.params.id, 10));

      return successResponse({
        res,
        message: SUCCESS,
        data: report,
        httpCode: StatusCodes.OK,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get all doctor reports for a visit
   * @param req - express request
   * @param res - express response
   * @param next - next middleware
   * @returns {Promise<SuccessResponse | void>}
   */
  static async getVisitDoctorReports(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const reports = await DoctorReportService.getVisitDoctorReportsService(
        parseInt(req.params.visitId, 10)
      );

      return successResponse({
        res,
        message: SUCCESS,
        data: reports,
        httpCode: StatusCodes.OK,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Update a doctor report
   * @param req - express request
   * @param res - express response
   * @param next - next middleware
   * @returns {Promise<SuccessResponse | void>}
   */
  static async updateDoctorReport(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateUpdateDoctorReport(req.body);
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }

    try {
      const report = await DoctorReportService.updateDoctorReportService(
        parseInt(req.params.id, 10),
        req.body,
        req.user.sub
      );

      return successResponse({
        res,
        message: 'Doctor report updated successfully',
        data: report,
        httpCode: StatusCodes.OK,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Delete a doctor report
   * @param req - express request
   * @param res - express response
   * @param next - next middleware
   * @returns {Promise<SuccessResponse | void>}
   */
  static async deleteDoctorReport(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      await DoctorReportService.deleteDoctorReportService(
        parseInt(req.params.id, 10),
        req.user.sub
      );

      return successResponse({
        res,
        message: 'Doctor report deleted successfully',
        data: null,
        httpCode: StatusCodes.OK,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get a doctor report by Patients
   * @param req - express request
   * @param res - express response
   * @param next - next middleware
   * @returns {Promise<SuccessResponse | void>}
   */
  static async getDoctorReports(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const reports = await DoctorReportService.getDoctorReportsByPatient(req.query);

      return successResponse({
        res,
        message: SUCCESS,
        data: reports,
        httpCode: StatusCodes.OK,
      });
    } catch (e) {
      return next(e);
    }
  }
}

export default DoctorReportController;
