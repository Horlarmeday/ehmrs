/* eslint-disable camelcase */
import * as ReportsRepository from './reports.repository';
import { BadException } from '../../common/util/api-error';
// Removed formatResponse import as it doesn't exist
import * as fs from 'fs';
import * as path from 'path';

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  drugId?: number;
  categoryId?: number;
  vendorId?: number;
  movementType?: string;
  threshold?: string;
  period?: string;
  groupBy?: string;
  includeExpired?: boolean;
  daysToExpiry?: number;
  sortBy?: string;
  order?: string;
  page?: number;
  limit?: number;
}

interface ScheduleData {
  reportType: string;
  schedule: string;
  filters: any;
  recipients: string[];
  format: string;
  createdBy: number;
}

const errorPrefix = 'Error'

export class ReportsService {
  /**
   * Get dashboard overview with key metrics
   */
  static async getDashboardOverview() {
    try {
      const data = await ReportsRepository.getDashboardOverview();
      return data;
    } catch (error: any) {
      throw new BadException(errorPrefix, 500, error.message);
    }
  }

  /**
   * Get inventory movements with filtering and pagination
   */
  static async getInventoryMovements(filters: ReportFilters): Promise<any> {
    try {
      const params = {
        ...filters,
        order: filters.order as 'ASC' | 'DESC'
      };
      const data = await ReportsRepository.getInventoryMovements(params);
      return data;
    } catch (error: any) {
      throw new BadException(error.message, 500);
    }
  }

  /**
   * Get sales performance data
   */
  static async getSalesPerformance(filters: ReportFilters) {
    try {
      // Convert ReportFilters to SalesPerformanceParams
      const params: any = {
        period: filters.period as 'daily' | 'weekly' | 'monthly' || 'monthly',
        ...filters
      };
      const data = await ReportsRepository.getSalesPerformance(params);
      return data;
    } catch (error: any) {
      throw new BadException(error.message, 500);
    }
  }

  /**
   * Get expiry tracking data
   */
  static async getExpiryTracking(filters: ReportFilters) {
    try {
      // Convert ReportFilters to ExpiryTrackingParams
      const params: any = {
        threshold: filters.threshold ? parseInt(filters.threshold) : 30,
        ...filters
      };
      const data = await ReportsRepository.getExpiryTracking(params);
      return data;
    } catch (error: any) {
      throw new BadException(error.message, 500);
    }
  }

  /**
   * Get stock levels analysis
   */
  static async getStockLevels(filters: ReportFilters) {
    try {
      // Convert ReportFilters to StockLevelsParams
      const params: any = {
        threshold: filters.threshold ? parseInt(filters.threshold) : 10,
        ...filters
      };
      const data = await ReportsRepository.getStockLevels(params);
      return data;
    } catch (error: any) {
      throw new BadException(error.message, 500);
    }
  }

  /**
   * Get trends analysis data
   */
  static async getTrendsAnalysis(filters: ReportFilters) {
    try {
      // Convert ReportFilters to TrendsAnalysisParams
      const params: any = {
        period: filters.period as 'daily' | 'weekly' | 'monthly' || 'monthly',
        ...filters
      };
      const data = await ReportsRepository.getTrendsAnalysis(params);
      return data;
    } catch (error: any) {
      throw new BadException(error.message, 500);
    }
  }

  /**
   * Get movement history with filtering and pagination
   */
  static async getMovementHistory(filters: ReportFilters) {
    try {
      const params: any = {
        action: filters.movementType,
        currentPage: filters.page || 1,
        pageLimit: filters.limit || 10,
        sortBy: filters.sortBy || 'createdAt',
        order: filters.order as 'ASC' | 'DESC' || 'DESC',
        ...filters
      };
      const data = await ReportsRepository.getMovementHistory(params);
      return data;
    } catch (error: any) {
      throw new BadException(error.message, 500);
    }
  }

  /**
   * Get pharmacy analytics and reports
   */
  static async getPharmacyAnalytics(filters: ReportFilters) {
    try {
      const params: any = {
        period: filters.period as 'daily' | 'weekly' | 'monthly' || 'monthly',
        groupBy: filters.groupBy as 'drug' | 'vendor' || 'drug',
        ...filters
      };
      const data = await ReportsRepository.getPharmacyAnalytics(params);
      return data;
    } catch (error: any) {
      throw new BadException(error.message, 500);
    }
  }

  /**
   * Get revenue analysis data
   */
  static async getRevenueAnalysis(filters: ReportFilters) {
    try {
      const params: any = {
        period: filters.period as 'daily' | 'weekly' | 'monthly' || 'monthly',
        ...filters
      };
      const data = await ReportsRepository.getRevenueAnalysis(params);
      return data;
    } catch (error: any) {
      throw new BadException(error.message, 500);
    }
  }

  /**
   * Export report data to CSV format
   */
  static async exportToCSV(reportType: string, filters: any): Promise<string> {
    try {
      let data: any;
      
      switch (reportType) {
        case 'dashboard':
          data = await ReportsRepository.getDashboardOverview();
          return ReportsService.convertToCSV(data, 'dashboard');
        case 'inventory-movements':
          data = await ReportsRepository.getInventoryMovements(filters);
          return ReportsService.convertToCSV(data.docs || data, 'inventory-movements');
        case 'sales-performance':
          data = await ReportsRepository.getSalesPerformance(filters);
          return ReportsService.convertToCSV(data, 'sales-performance');
        case 'expiry-tracking':
          data = await ReportsRepository.getExpiryTracking(filters);
          return ReportsService.convertToCSV(data.nearExpiryItems?.docs || data.nearExpiryItems, 'expiry-tracking');
        case 'stock-levels':
          data = await ReportsRepository.getStockLevels(filters);
          return ReportsService.convertToCSV(data.stockLevels?.docs || data.stockLevels, 'stock-levels');
        case 'trends-analysis':
          data = await ReportsRepository.getTrendsAnalysis(filters);
          return ReportsService.convertToCSV(data, 'trends-analysis');
        default:
          throw new BadException('Invalid report type for CSV export', 400);
      }
    } catch (error) {
      throw new BadException('Failed to export report to CSV', 500);
    }
  }

  /**
   * Export report data to PDF format
   */
  static async exportToPDF(reportType: string, filters: any): Promise<Buffer> {
    try {
      // For now, return a simple PDF buffer
      // In a real implementation, you would use a PDF library like puppeteer or jsPDF
      const pdfContent = `PDF Report: ${reportType}\nGenerated on: ${new Date().toISOString()}\nFilters: ${JSON.stringify(filters, null, 2)}`;
      return Buffer.from(pdfContent, 'utf-8');
    } catch (error) {
      throw new BadException('Failed to export report to PDF', 500);
    }
  }

  /**
   * Get cached report data
   */
  static async getCachedReport(reportType: string, cacheKey: string) {
    try {
      // Simple file-based caching implementation
      const cacheDir = path.join(process.cwd(), 'cache', 'reports');
      const cacheFile = path.join(cacheDir, `${reportType}_${cacheKey}.json`);
      
      if (fs.existsSync(cacheFile)) {
        const cachedData = fs.readFileSync(cacheFile, 'utf-8');
        return JSON.parse(cachedData);
      }
      
      return null;
    } catch (error) {
      throw new BadException('Failed to retrieve cached report', 500);
    }
  }

  /**
   * Schedule a report for automatic generation
   */
  static async scheduleReport(scheduleData: ScheduleData) {
    try {
      // In a real implementation, this would integrate with a job scheduler like Bull or Agenda
      const schedule = {
        id: `schedule_${Date.now()}`,
        ...scheduleData,
        status: 'active',
        createdAt: new Date(),
        nextRun: ReportsService.calculateNextRun(scheduleData.schedule),
      };
      
      // For now, just return the schedule object
      // In production, this would be saved to a database
      return schedule;
    } catch (error) {
      throw new BadException('Failed to schedule report', 500);
    }
  }

  /**
   * Convert data to CSV format
   */
  static convertToCSV(data: any, reportType: string): string {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return 'No data available';
    }

    let csvContent = '';
    
    if (Array.isArray(data)) {
      if (data.length > 0) {
        // Get headers from first object
        const headers = Object.keys(data[0]);
        csvContent += headers.join(',') + '\n';
        
        // Add data rows
        data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header];
            // Handle nested objects and arrays
            if (typeof value === 'object' && value !== null) {
              return JSON.stringify(value).replace(/"/g, '""');
            }
            return `"${String(value || '').replace(/"/g, '""')}"`;
          });
          csvContent += values.join(',') + '\n';
        });
      }
    } else {
      // Handle object data (like dashboard overview)
      const headers = Object.keys(data);
      csvContent += headers.join(',') + '\n';
      const values = headers.map(header => {
        const value = data[header];
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value).replace(/"/g, '""');
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      });
      csvContent += values.join(',') + '\n';
    }
    
    return csvContent;
  }

  /**
   * Calculate next run time for scheduled reports
   */
  static calculateNextRun(schedule: string): Date {
    const now = new Date();
    
    switch (schedule) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }
}

export default ReportsService;