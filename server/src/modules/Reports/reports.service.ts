/* eslint-disable camelcase */
import {
  MedicalRecordsService,
  MedicalRecordsReportType,
  ReportStatsResponse as MedicalRecordsReportStatsResponse,
  ReportDetailsResponse as MedicalRecordsReportDetailsResponse,
} from './domains/medicalRecords/medicalRecords.service';
import { ReportFilters } from './domains/medicalRecords/types';

export type ReportDomain = 'medical-records';

export type ReportStatsResponse = MedicalRecordsReportStatsResponse;
export type ReportDetailsResponse = MedicalRecordsReportDetailsResponse;

/**
 * Main Reports Service
 * Coordinates between different domain services
 */
export class ReportsService {
  /**
   * Get statistics for a specific domain and report type
   */
  static async getStats(
    domain: ReportDomain,
    reportType: string,
    filters: ReportFilters
  ): Promise<ReportStatsResponse> {
    switch (domain) {
      case 'medical-records':
        return MedicalRecordsService.getStats(reportType as MedicalRecordsReportType, filters);
      default:
        throw new Error(`Unknown domain: ${domain}`);
    }
  }

  /**
   * Get details for a specific domain and report type
   */
  static async getDetails(
    domain: ReportDomain,
    reportType: string,
    filters: ReportFilters
  ): Promise<ReportDetailsResponse> {
    switch (domain) {
      case 'medical-records':
        return MedicalRecordsService.getDetails(reportType as MedicalRecordsReportType, filters);
      default:
        throw new Error(`Unknown domain: ${domain}`);
    }
  }
}
