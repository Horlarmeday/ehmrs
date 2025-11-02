/* eslint-disable camelcase */
import { Report, Staff } from '../../../database/models';
import { calcLimitAndOffset, paginate } from '../../../core/helpers/helper';
import { WhereOptions } from 'sequelize';
import { ReportDomain } from '../reports.service';

export interface SaveReportData {
  title: string;
  domain: ReportDomain | string;
  report_type: string;
  date_range_start?: Date;
  date_range_end?: Date;
  filters?: Record<string, unknown>;
  created_by: number;
}

export interface ReportFilters {
  domain?: ReportDomain | string;
  report_type?: string;
  created_by?: number;
  currentPage?: number;
  pageLimit?: number;
}

/**
 * Report Storage Service
 * Handles saving and retrieving saved reports
 */
export class ReportStorageService {
  /**
   * Save a report
   */
  static async saveReport(data: SaveReportData): Promise<Report> {
    return Report.create({
      title: data.title,
      domain: data.domain,
      report_type: data.report_type,
      date_range_start: data.date_range_start,
      date_range_end: data.date_range_end,
      filters: data.filters || {},
      created_by: data.created_by,
    });
  }

  /**
   * Get saved reports with filters
   */
  static async getSavedReports(filters: ReportFilters) {
    const where: WhereOptions<Report> = {};

    if (filters.domain) {
      where.domain = filters.domain;
    }

    if (filters.report_type) {
      where.report_type = filters.report_type;
    }

    if (filters.created_by) {
      where.created_by = filters.created_by;
    }

    const result = await Report.paginate({
      page: +filters.currentPage || 1,
      paginate: +filters.pageLimit || 10,
      where,
      include: [
        {
          model: Staff,
          as: 'creator',
          attributes: ['id', 'firstname', 'lastname', 'middlename'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return result;
  }

  /**
   * Get a report by ID
   */
  static async getReportById(id: number): Promise<Report | null> {
    return Report.findByPk(id, {
      include: [
        {
          model: Staff,
          as: 'creator',
          attributes: ['id', 'firstname', 'lastname', 'middlename'],
        },
      ],
    });
  }

  /**
   * Delete a report
   */
  static async deleteReport(id: number, userId: number): Promise<boolean> {
    const report = await Report.findByPk(id);

    if (!report) {
      throw new Error('Report not found');
    }

    // Optional: Add permission check here
    // For now, allow deletion by creator or admin
    if (report.created_by !== userId) {
      throw new Error('You do not have permission to delete this report');
    }

    await report.destroy();
    return true;
  }
}
