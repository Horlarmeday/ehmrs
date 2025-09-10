import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../../core/helpers/helper';
import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import { BadException } from '../../common/util/api-error';
import AuditService from './audit.service';
import { DeceasedPatientAction } from '../../database/models/deceasedPatientAudit';

export class AuditController {
  /**
   * Get audit trail for a specific patient
   *
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with audit trail
   */
  static async getPatientAuditTrail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const { patientId } = req.params;
      const { 
        currentPage = 1, 
        pageLimit = 20, 
        action 
      } = req.query;

      if (!patientId) {
        throw new BadException(
          'BAD_REQUEST',
          StatusCodes.BAD_REQUEST,
          'Patient ID is required'
        );
      }

      const offset = (Number(currentPage) - 1) * Number(pageLimit);
      const limit = Number(pageLimit);

      const auditTrail = await AuditService.getPatientAuditTrail(
        Number(patientId),
        {
          limit,
          offset,
          action: action as DeceasedPatientAction,
        }
      );

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Patient audit trail retrieved successfully',
        data: {
          rows: auditTrail.rows,
          count: auditTrail.count,
          pages: Math.ceil(auditTrail.count / limit),
          currentPage: Number(currentPage),
          pageLimit: limit,
        },
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get audit trail for a specific staff member
   *
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with staff audit trail
   */
  static async getStaffAuditTrail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const { staffId } = req.params;
      const { 
        currentPage = 1, 
        pageLimit = 20, 
        action 
      } = req.query;

      if (!staffId) {
        throw new BadException(
          'BAD_REQUEST',
          StatusCodes.BAD_REQUEST,
          'Staff ID is required'
        );
      }

      const offset = (Number(currentPage) - 1) * Number(pageLimit);
      const limit = Number(pageLimit);

      const auditTrail = await AuditService.getStaffAuditTrail(
        Number(staffId),
        {
          limit,
          offset,
          action: action as DeceasedPatientAction,
        }
      );

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Staff audit trail retrieved successfully',
        data: {
          rows: auditTrail.rows,
          count: auditTrail.count,
          pages: Math.ceil(auditTrail.count / limit),
          currentPage: Number(currentPage),
          pageLimit: limit,
        },
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get audit statistics
   *
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with audit statistics
   */
  static async getAuditStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const { 
        startDate, 
        endDate, 
        action 
      } = req.query;

      const options: any = {};
      if (startDate) options.startDate = new Date(startDate as string);
      if (endDate) options.endDate = new Date(endDate as string);
      if (action) options.action = action as DeceasedPatientAction;

      const statistics = await AuditService.getAuditStatistics(options);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Audit statistics retrieved successfully',
        data: statistics,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get dashboard audit data
   *
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with dashboard audit data
   */
  static async getDashboardAuditData(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const { 
        limit = 20, 
        startDate, 
        endDate 
      } = req.query;

      const options: any = {
        limit: Number(limit),
      };
      if (startDate) options.startDate = new Date(startDate as string);
      if (endDate) options.endDate = new Date(endDate as string);

      const dashboardData = await AuditService.getDashboardAuditData(options);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Dashboard audit data retrieved successfully',
        data: dashboardData,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Clean up old audit records (admin only)
   *
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with cleanup results
   */
  static async cleanupOldAuditRecords(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const { daysToKeep = 365 } = req.body;

      if (daysToKeep < 30) {
        throw new BadException(
          'BAD_REQUEST',
          StatusCodes.BAD_REQUEST,
          'Minimum retention period is 30 days'
        );
      }

      const deletedCount = await AuditService.cleanupOldAuditRecords(Number(daysToKeep));

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Old audit records cleaned up successfully',
        data: {
          deleted_records: deletedCount,
          retention_days: Number(daysToKeep),
          cleanup_date: new Date(),
        },
      });
    } catch (e) {
      return next(e);
    }
  }
}

export default AuditController;
