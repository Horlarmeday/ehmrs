/* eslint-disable camelcase */
import { NextFunction, Request, Response } from 'express';
import { ReportsService } from './reports.service';
import { successResponse, SuccessResponse } from '../../common/responses/success-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { validateReportFilters } from './validations';
import { errorResponse } from '../../common/responses/error-responses';

export class ReportsController {
  /**
   * Get dashboard overview with key metrics
   */
  static async getDashboardOverview(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await ReportsService.getDashboardOverview();
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        data,
        message: 'Dashboard overview retrieved successfully',
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get inventory movements with filtering and pagination
   */
  static async getInventoryMovements(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        startDate,
        endDate,
        drugId,
        movementType,
        currentPage,
        pageLimit,
        sort_by,
        order,
      } = req.query;

      // Validate filters
      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        drugId: drugId as unknown as number,
        movementType: movementType as string,
        currentPage: currentPage as string,
        pageLimit: pageLimit as string,
        sort_by: sort_by as string,
        order: order as string,
      };

      const data = await ReportsService.getInventoryMovements(filters);
      return successResponse({
        res,
        data,
        message: 'Inventory movements retrieved successfully',
        httpCode: StatusCodes.OK
    });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get sales performance data
   */
  static async getSalesPerformance(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        period,
        startDate,
        endDate,
        groupBy,
        vendorId,
      } = req.query;

      const filters = {
        period: period as string,
        startDate: startDate as string,
        endDate: endDate as string,
        groupBy: groupBy as string,
        vendorId: vendorId as unknown as number,
      };

      const data = await ReportsService.getSalesPerformance(filters);
      return successResponse({
        res,
        data,
        message: 'Sales performance data retrieved successfully',
        httpCode: StatusCodes.OK
    });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get expiry tracking data
   */
  static async getExpiryTracking(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        daysToExpiry,
        includeExpired,
        categoryId,
        currentPage,
        pageLimit,
      } = req.query;

      const filters = {
        daysToExpiry: daysToExpiry ? parseInt(daysToExpiry as string) : undefined,
        includeExpired: includeExpired === 'true',
        categoryId: categoryId as unknown as number,
        currentPage: currentPage as string,
        pageLimit: pageLimit as string,
      };

      const data = await ReportsService.getExpiryTracking(filters);
      return successResponse({
        res,
        data,
        message: 'Expiry tracking data retrieved successfully',
        httpCode: StatusCodes.OK
    });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get stock levels analysis
   */
  static async getStockLevels(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        threshold,
        sortBy,
        order,
        currentPage,
        pageLimit,
      } = req.query;

      const filters = {
        threshold: threshold as string,
        sortBy: sortBy as string,
        order: order as string,
        currentPage: currentPage as string,
        pageLimit: pageLimit as string,
      };

      const data = await ReportsService.getStockLevels(filters);
      return successResponse({
        res,
        data,
        message: 'Stock levels analysis retrieved successfully',
        httpCode: StatusCodes.OK
    });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get trends analysis data
   */
  static async getTrendsAnalysis(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        period,
        startDate,
        endDate,
        drugId,
        categoryId,
      } = req.query;

      const filters = {
        period: period as string,
        startDate: startDate as string,
        endDate: endDate as string,
        drugId: drugId as unknown as number,
        categoryId: categoryId as unknown as number,
      };

      const data = await ReportsService.getTrendsAnalysis(filters);
      return successResponse({
        res,
        data,
        message: 'Trends analysis data retrieved successfully',
        httpCode: StatusCodes.OK
    });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get movement history with filtering and pagination
   */
  static async getMovementHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        drugId,
        movementType,
        vendorId,
      } = req.query;

      const filters = {
        page: Number(page),
        limit: Number(limit),
        startDate: startDate as string,
        endDate: endDate as string,
        drugId: drugId as unknown as number,
        movementType: movementType as string,
        vendorId: vendorId as unknown as number,
      };

      const data = await ReportsService.getMovementHistory(filters);
      return successResponse({
        res,
        data,
        message: 'Movement history retrieved successfully',
        httpCode: StatusCodes.OK
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get pharmacy analytics with revenue and performance data
   */
  static async getPharmacyAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const {
        period = 'monthly',
        startDate,
        endDate,
        vendorId,
        categoryId,
      } = req.query;

      const filters = {
        period: period as string,
        startDate: startDate as string,
        endDate: endDate as string,
        vendorId: vendorId as unknown as number,
        categoryId: categoryId as unknown as number,
      };

      const data = await ReportsService.getPharmacyAnalytics(filters);
      return successResponse({
        res,
        data,
        message: 'Pharmacy analytics retrieved successfully',
        httpCode: StatusCodes.OK
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get revenue analysis with detailed financial metrics
   */
  static async getRevenueAnalysis(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const {
        period = 'monthly',
        startDate,
        endDate,
        vendorId,
        categoryId,
        includeComparison = true,
      } = req.query;

      const filters = {
        period: period as string,
        startDate: startDate as string,
        endDate: endDate as string,
        vendorId: vendorId as unknown as number,
        categoryId: categoryId as unknown as number,
        includeComparison: includeComparison === 'true',
      };

      const data = await ReportsService.getRevenueAnalysis(filters);
      return successResponse({
        res,
        data,
        message: 'Revenue analysis retrieved successfully',
        httpCode: StatusCodes.OK
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Export report data to CSV
   */
  static async exportToCSV(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { reportType, ...filters } = req.query;

      if (!reportType) {
        return errorResponse({
          res,
          httpCode: 400,
          message: 'Report type is required'
        })
      }

      const csvData = await ReportsService.exportToCSV(
        reportType as string,
        filters
      );

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${reportType}_report_${new Date().toISOString().split('T')[0]}.csv"`
      );

      return res.send(csvData);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Export report data to PDF
   */
  static async exportToPDF(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { reportType, ...filters } = req.query;

      if (!reportType) {
        return errorResponse({
          res,
          httpCode: 400,
          message: 'Report type is required'
        })      
      }

      const pdfBuffer = await ReportsService.exportToPDF(
        reportType as string,
        filters
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf"`
      );

      return res.send(pdfBuffer);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get report configuration and metadata
   */
  static async getReportConfig(
    req: Request,
    res: Response,
    next: NextFunction
  ){
    try {
      const config = {
        availableReports: [
          {
            id: 'dashboard',
            name: 'Dashboard Overview',
            description: 'Key metrics and recent activity overview',
            filters: [],
          },
          {
            id: 'inventory-movements',
            name: 'Inventory Movements',
            description: 'Track all inventory movements with detailed filtering',
            filters: ['dateRange', 'drugId', 'movementType'],
          },
          {
            id: 'sales-performance',
            name: 'Sales Performance',
            description: 'Analyze sales trends and performance metrics',
            filters: ['period', 'dateRange', 'vendorId'],
          },
          {
            id: 'expiry-tracking',
            name: 'Expiry Tracking',
            description: 'Monitor expiring and expired inventory',
            filters: ['daysToExpiry', 'includeExpired', 'categoryId'],
          },
          {
            id: 'stock-levels',
            name: 'Stock Levels Analysis',
            description: 'Analyze current stock levels and identify issues',
            filters: ['threshold', 'sortBy'],
          },
          {
            id: 'trends-analysis',
            name: 'Trends Analysis',
            description: 'Identify patterns and trends in pharmacy operations',
            filters: ['period', 'dateRange', 'drugId'],
          },
        ],
        filterOptions: {
          periods: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
          movementTypes: ['received', 'dispensed', 'adjusted', 'expired', 'returned'],
          thresholds: ['low', 'adequate', 'overstocked'],
          sortOptions: [
            'quantity_remaining',
            'expiration',
            'unit_price',
            'createdAt',
            'drug_name',
          ],
        },
        exportFormats: ['csv', 'pdf'],
      };

      return successResponse({
        res,
        data: config,
        message: 'Report configuration retrieved successfully',
        httpCode: StatusCodes.OK
    });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get cached report data
   */
  static async getCachedReport(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { reportType, cacheKey } = req.params;

      const data = await ReportsService.getCachedReport(reportType, cacheKey);
      
      if (!data) {
        return errorResponse({
          res,
          httpCode: 400,
          message: 'Cached report not found'
        })
      }

      return successResponse({
        res,
        data,
        message: 'Cached report retrieved successfully',
        httpCode: StatusCodes.OK
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Schedule a report for automatic generation
   */
  static async scheduleReport(
    req: Request & { user: { sub: number }},
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        reportType,
        schedule,
        filters,
        recipients,
        format,
      } = req.body;

      const scheduleData = {
        reportType,
        schedule,
        filters,
        recipients,
        format,
        createdBy: req.user?.sub,
      };

      const result = await ReportsService.scheduleReport(scheduleData);
      
      return successResponse({
        res,
        data: result,
        message: 'Report scheduled successfully',
        httpCode: StatusCodes.CREATED
    });
    } catch (error) {
      return next(error);
    }
  }
}