/* eslint-disable camelcase */
import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { ReportFilters } from './domains/medicalRecords/types';
import { successResponse } from '../../common/responses/success-responses';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { SUCCESS } from '../../core/constants';
import {
  validateReportFilters,
  validateReportType,
  validateDomain,
  validateExportRequest,
  validateSaveReport,
} from './validations';
import { ExportService } from './services/export.service';
import { ReportStorageService } from './services/reportStorage.service';
import { BadException } from '../../common/util/api-error';
import { PatientType } from '../Patient/types/patient.types';
import { Gender } from '../../database/models/patient';
import { VisitCategory } from '../../database/models/visit';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    role: string;
    [key: string]: unknown;
  };
}

/**
 * Reports Controller
 * Handles HTTP requests for statistics and reports
 */
export class ReportsController {
  /**
   * Get medical records statistics
   * GET /api/reports/medical-records/stats/:reportType
   */
  static async getMedicalRecordsStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { reportType } = req.params;
      const query = req.query as Record<string, string | undefined>;

      // Validate report type
      const { error: typeError } = validateReportType(reportType);
      if (typeError) {
        return errorResponse({
          res,
          message: typeError.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      // Validate filters
      const { error: filterError } = validateReportFilters(query);
      if (filterError) {
        return errorResponse({
          res,
          message: filterError.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      // Build filters object
      const filters: ReportFilters = {
        start: query.start,
        end: query.end,
        patient_type: query.patient_type as PatientType,
        gender: query.gender as Gender,
        category: query.category as VisitCategory,
        department: query.department,
        status: query.status,
        ward_id: query.ward_id ? parseInt(query.ward_id, 10) : undefined,
        cause_of_death: query.cause_of_death,
        age_group: query.age_group,
      };

      const stats = await ReportsService.getStats('medical-records', reportType, filters);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: stats,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get medical records details
   * GET /api/reports/medical-records/details/:reportType
   */
  static async getMedicalRecordsDetails(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { reportType } = req.params;
      const query = req.query as Record<string, string | undefined>;

      // Validate report type
      const { error: typeError } = validateReportType(reportType);
      if (typeError) {
        return errorResponse({
          res,
          message: typeError.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      // Validate filters
      const { error: filterError } = validateReportFilters(query);
      if (filterError) {
        return errorResponse({
          res,
          message: filterError.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      // Build filters object
      const filters: ReportFilters = {
        start: query.start,
        end: query.end,
        patient_type: query.patient_type as PatientType,
        gender: query.gender as Gender,
        category: query.category as VisitCategory,
        department: query.department,
        status: query.status,
        ward_id: query.ward_id ? parseInt(query.ward_id, 10) : undefined,
        cause_of_death: query.cause_of_death,
        age_group: query.age_group,
        currentPage: query.currentPage ? parseInt(query.currentPage, 10) : 1,
        pageLimit: query.pageLimit ? parseInt(query.pageLimit, 10) : 10,
      };

      const details = await ReportsService.getDetails('medical-records', reportType, filters);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: details,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Export report
   * POST /api/reports/export
   */
  static async exportReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { error } = validateExportRequest(req.body);
      if (error) {
        return errorResponse({
          res,
          message: error.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const { domain, reportType, format, filters } = req.body;

      // Get report details for export
      const reportFilters: ReportFilters = {
        ...filters,
        currentPage: 1,
        pageLimit: 10000, // Get all data for export
      };

      const details = await ReportsService.getDetails(domain, reportType, reportFilters);

      // Export the data
      await ExportService.exportReport(res, {
        format,
        reportType,
        domain,
        filters,
        details,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Save a report
   * POST /api/reports/save
   */
  static async saveReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { error } = validateSaveReport(req.body);
      if (error) {
        return errorResponse({
          res,
          message: error.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const savedReport = await ReportStorageService.saveReport({
        ...req.body,
        created_by: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: SUCCESS,
        data: savedReport,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get saved reports
   * GET /api/reports/saved
   */
  static async getSavedReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;

      const filters = {
        domain: query.domain,
        report_type: query.report_type,
        created_by: query.created_by ? parseInt(query.created_by, 10) : undefined,
        currentPage: query.currentPage ? parseInt(query.currentPage, 10) : 1,
        pageLimit: query.pageLimit ? parseInt(query.pageLimit, 10) : 10,
      };

      const reports = await ReportStorageService.getSavedReports(filters);
      const paginatedResult = {
        rows: reports.docs || [],
        count: reports.total || 0,
        pages: reports.pages || 1,
        currentPage: reports.currentPage || filters.currentPage || 1,
        pageLimit: reports.perPage || filters.pageLimit || 10,
      };

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: paginatedResult,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get a specific saved report
   * GET /api/reports/:id
   */
  static async getReportById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const reportId = parseInt(id, 10);

      if (isNaN(reportId)) {
        throw new BadException('INVALID', StatusCodes.BAD_REQUEST, 'Invalid report ID');
      }

      const report = await ReportStorageService.getReportById(reportId);

      if (!report) {
        throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Report not found');
      }

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: report,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete a saved report
   * DELETE /api/reports/:id
   */
  static async deleteReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const reportId = parseInt(id, 10);

      if (isNaN(reportId)) {
        throw new BadException('INVALID', StatusCodes.BAD_REQUEST, 'Invalid report ID');
      }

      await ReportStorageService.deleteReport(reportId, req.user.sub);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: { deleted: true },
      });
    } catch (error) {
      return next(error);
    }
  }
}
