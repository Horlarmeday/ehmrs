/* eslint-disable camelcase */
import {
  getPatientRegistrationStats,
  getPatientRegistrationDetails,
  getVisitCategoryStats,
  getVisitCategoryDetails,
  getPatientDemographics,
  getPatientDemographicDetails,
  getAdmissionStats,
  getAdmissionDetails,
  getDeceasedPatientStats,
  getDeceasedPatientDetails,
} from './medicalRecords.repository';
import { ReportFilters } from './types';
import dayjs from 'dayjs';

export type MedicalRecordsReportType =
  | 'patient-registrations'
  | 'visit-categories'
  | 'demographics'
  | 'admissions'
  | 'deceased-patients';

// Paginated result type from helper
interface PaginatedResult {
  total: number;
  docs: unknown[];
  pages: number;
  perPage: number;
  currentPage: number;
}

// Daily stat item type (from raw Sequelize queries)
interface DailyStatItem {
  date: string;
  count: string | number;
}

// Breakdown item type (from raw Sequelize queries)
interface BreakdownItem {
  patient_type?: string | null;
  gender?: string | null;
  category?: string | null;
  department?: string | null;
  discharge_status?: string | null;
  cause_of_death?: string | null;
  count: string | number;
  [key: string]: string | number | null | undefined;
}

// Repository stats return types (actual return from repository)
interface PatientRegistrationStats {
  total: number;
  daily: DailyStatItem[];
  by_patient_type: BreakdownItem[];
  by_gender: BreakdownItem[];
}

interface VisitCategoryStats {
  total: number;
  daily: DailyStatItem[];
  by_category: BreakdownItem[];
  by_department: BreakdownItem[];
}

interface PatientDemographicsStats {
  total: number;
  by_age_group: Record<string, number>;
  by_gender: Record<string, number>;
  by_gender_and_age_group: Record<string, Record<string, number>>;
}

interface AdmissionStats {
  total: number;
  current_admissions: number;
  average_length_of_stay_days: number;
  daily: DailyStatItem[];
  by_ward: Array<{ ward_id: number; ward?: { name: string } | null; count: string | number }>;
  by_discharge_status: BreakdownItem[];
}

interface DeceasedPatientStats {
  total: number;
  daily: DailyStatItem[];
  by_cause: BreakdownItem[];
  by_gender: BreakdownItem[];
  by_age_group: Record<string, number>;
}

export interface ReportStatsResponse {
  summary: {
    total: number;
    date_range?: {
      start?: string;
      end?: string;
    };
    current_admissions?: number;
    average_length_of_stay_days?: number;
    [key: string]: string | number | { start?: string; end?: string } | undefined;
  };
  breakdown: Record<string, Record<string, number> | Record<string, Record<string, number>>>;
  trends?: {
    daily: Array<{ date: string; count: number }>;
  };
}

export interface ReportDetailsResponse {
  rows: unknown[];
  count: number;
  pages: number;
  currentPage: number;
  pageLimit: number;
}

/**
 * Medical Records Service
 * Handles business logic for medical records statistics and reports
 */
export class MedicalRecordsService {
  /**
   * Get patient registration statistics
   */
  static async getPatientRegistrationStats(filters: ReportFilters): Promise<ReportStatsResponse> {
    const stats = await getPatientRegistrationStats(filters);
    const typedStats = (stats as unknown) as PatientRegistrationStats;

    // Format daily stats for trends
    const trends = typedStats.daily.map((day: DailyStatItem) => ({
      date: day.date,
      count: typeof day.count === 'string' ? parseInt(day.count, 10) : day.count,
    }));

    // Format breakdowns
    const byPatientType = typedStats.by_patient_type.reduce(
      (acc: Record<string, number>, item: BreakdownItem) => {
        const type = item.patient_type || 'Unknown';
        const count =
          typeof item.count === 'string' ? parseInt(item.count, 10) : (item.count as number) || 0;
        acc[type] = count;
        return acc;
      },
      {}
    );

    const byGender = typedStats.by_gender.reduce(
      (acc: Record<string, number>, item: BreakdownItem) => {
        const gender = item.gender || 'Unknown';
        const count =
          typeof item.count === 'string' ? parseInt(item.count, 10) : (item.count as number) || 0;
        acc[gender] = count;
        return acc;
      },
      {}
    );

    return {
      summary: {
        total: typedStats.total,
        date_range: {
          start: filters.start?.toString(),
          end: filters.end?.toString(),
        },
      },
      breakdown: {
        by_patient_type: byPatientType,
        by_gender: byGender,
      },
      trends: {
        daily: trends,
      },
    };
  }

  /**
   * Get patient registration details
   */
  static async getPatientRegistrationDetails(
    filters: ReportFilters
  ): Promise<ReportDetailsResponse> {
    const result = await getPatientRegistrationDetails(filters);
    const paginatedResult = (result as unknown) as PaginatedResult;
    return {
      rows: paginatedResult.docs || [],
      count: paginatedResult.total || 0,
      pages: paginatedResult.pages || 1,
      currentPage: paginatedResult.currentPage || filters.currentPage || 1,
      pageLimit: paginatedResult.perPage || filters.pageLimit || 10,
    };
  }

  /**
   * Get visit category statistics
   */
  static async getVisitCategoryStats(filters: ReportFilters): Promise<ReportStatsResponse> {
    const stats = await getVisitCategoryStats(filters);
    const typedStats = (stats as unknown) as VisitCategoryStats;

    // Format daily stats for trends
    const trends = typedStats.daily.map((day: DailyStatItem) => ({
      date: day.date,
      count: typeof day.count === 'string' ? parseInt(day.count, 10) : day.count,
    }));

    // Format breakdowns
    const byCategory = typedStats.by_category.reduce(
      (acc: Record<string, number>, item: BreakdownItem) => {
        const category = item.category || 'Unknown';
        const count =
          typeof item.count === 'string' ? parseInt(item.count, 10) : (item.count as number) || 0;
        acc[category] = count;
        return acc;
      },
      {}
    );

    const byDepartment = typedStats.by_department.reduce(
      (acc: Record<string, number>, item: BreakdownItem) => {
        const department = item.department || 'Unknown';
        const count =
          typeof item.count === 'string' ? parseInt(item.count, 10) : (item.count as number) || 0;
        acc[department] = count;
        return acc;
      },
      {}
    );

    return {
      summary: {
        total: typedStats.total,
        date_range: {
          start: filters.start?.toString(),
          end: filters.end?.toString(),
        },
      },
      breakdown: {
        by_category: byCategory,
        by_department: byDepartment,
      },
      trends: {
        daily: trends,
      },
    };
  }

  /**
   * Get visit category details
   */
  static async getVisitCategoryDetails(filters: ReportFilters): Promise<ReportDetailsResponse> {
    const result = await getVisitCategoryDetails(filters);
    const paginatedResult = (result as unknown) as PaginatedResult;
    return {
      rows: paginatedResult.docs || [],
      count: paginatedResult.total || 0,
      pages: paginatedResult.pages || 1,
      currentPage: paginatedResult.currentPage || filters.currentPage || 1,
      pageLimit: paginatedResult.perPage || filters.pageLimit || 10,
    };
  }

  /**
   * Get patient demographics statistics
   */
  static async getPatientDemographics(filters: ReportFilters): Promise<ReportStatsResponse> {
    const stats = await getPatientDemographics(filters);
    const typedStats = (stats as unknown) as PatientDemographicsStats;

    return {
      summary: {
        total: typedStats.total,
        date_range: {
          start: filters.start?.toString(),
          end: filters.end?.toString(),
        },
      },
      breakdown: {
        by_age_group: typedStats.by_age_group,
        by_gender: typedStats.by_gender,
        by_gender_and_age_group: typedStats.by_gender_and_age_group,
      },
    };
  }

  /**
   * Get patient demographic details
   */
  static async getPatientDemographicDetails(
    filters: ReportFilters
  ): Promise<ReportDetailsResponse> {
    const result = await getPatientDemographicDetails(filters);
    const paginatedResult = (result as unknown) as PaginatedResult;
    return {
      rows: paginatedResult.docs || [],
      count: paginatedResult.total || 0,
      pages: paginatedResult.pages || 1,
      currentPage: paginatedResult.currentPage || filters.currentPage || 1,
      pageLimit: paginatedResult.perPage || filters.pageLimit || 10,
    };
  }

  /**
   * Get admission statistics
   */
  static async getAdmissionStats(filters: ReportFilters): Promise<ReportStatsResponse> {
    const stats = await getAdmissionStats(filters);
    const typedStats = (stats as unknown) as AdmissionStats;

    // Format daily stats for trends
    const trends = typedStats.daily.map((day: DailyStatItem) => ({
      date: day.date,
      count: typeof day.count === 'string' ? parseInt(day.count, 10) : day.count,
    }));

    // Format breakdowns
    const byWard = typedStats.by_ward.reduce((acc: Record<string, number>, item) => {
      const wardName = item.ward?.name || `Ward ${item.ward_id}` || 'Unknown';
      const count =
        typeof item.count === 'string' ? parseInt(item.count, 10) : (item.count as number) || 0;
      acc[wardName] = count;
      return acc;
    }, {});

    const byDischargeStatus = typedStats.by_discharge_status.reduce(
      (acc: Record<string, number>, item: BreakdownItem) => {
        const status = item.discharge_status || 'Unknown';
        const count =
          typeof item.count === 'string' ? parseInt(item.count, 10) : (item.count as number) || 0;
        acc[status] = count;
        return acc;
      },
      {}
    );

    return {
      summary: {
        total: typedStats.total,
        current_admissions: typedStats.current_admissions,
        average_length_of_stay_days: typedStats.average_length_of_stay_days,
        date_range: {
          start: filters.start?.toString(),
          end: filters.end?.toString(),
        },
      },
      breakdown: {
        by_ward: byWard,
        by_discharge_status: byDischargeStatus,
      },
      trends: {
        daily: trends,
      },
    };
  }

  /**
   * Get admission details
   */
  static async getAdmissionDetails(filters: ReportFilters): Promise<ReportDetailsResponse> {
    const result = await getAdmissionDetails(filters);
    const paginatedResult = (result as unknown) as PaginatedResult;
    return {
      rows: paginatedResult.docs || [],
      count: paginatedResult.total || 0,
      pages: paginatedResult.pages || 1,
      currentPage: paginatedResult.currentPage || filters.currentPage || 1,
      pageLimit: paginatedResult.perPage || filters.pageLimit || 10,
    };
  }

  /**
   * Get deceased patient statistics
   */
  static async getDeceasedPatientStats(filters: ReportFilters): Promise<ReportStatsResponse> {
    const stats = await getDeceasedPatientStats(filters);
    const typedStats = (stats as unknown) as DeceasedPatientStats;

    // Format daily stats for trends
    const trends = typedStats.daily.map((day: DailyStatItem) => ({
      date: day.date,
      count: typeof day.count === 'string' ? parseInt(day.count, 10) : day.count,
    }));

    // Format breakdowns
    const byCause = typedStats.by_cause.reduce(
      (acc: Record<string, number>, item: BreakdownItem) => {
        const cause = item.cause_of_death || 'Unknown';
        const count =
          typeof item.count === 'string' ? parseInt(item.count, 10) : (item.count as number) || 0;
        acc[cause] = count;
        return acc;
      },
      {}
    );

    const byGender = typedStats.by_gender.reduce(
      (acc: Record<string, number>, item: BreakdownItem) => {
        const gender = item.gender || 'Unknown';
        const count =
          typeof item.count === 'string' ? parseInt(item.count, 10) : (item.count as number) || 0;
        acc[gender] = count;
        return acc;
      },
      {}
    );

    return {
      summary: {
        total: typedStats.total,
        date_range: {
          start: filters.start?.toString(),
          end: filters.end?.toString(),
        },
      },
      breakdown: {
        by_cause: byCause,
        by_gender: byGender,
        by_age_group: typedStats.by_age_group,
      },
      trends: {
        daily: trends,
      },
    };
  }

  /**
   * Get deceased patient details
   */
  static async getDeceasedPatientDetails(filters: ReportFilters): Promise<ReportDetailsResponse> {
    const result = await getDeceasedPatientDetails(filters);
    const paginatedResult = (result as unknown) as PaginatedResult;
    return {
      rows: paginatedResult.docs || [],
      count: paginatedResult.total || 0,
      pages: paginatedResult.pages || 1,
      currentPage: paginatedResult.currentPage || filters.currentPage || 1,
      pageLimit: paginatedResult.perPage || filters.pageLimit || 10,
    };
  }

  /**
   * Get statistics for a specific report type
   */
  static async getStats(
    reportType: MedicalRecordsReportType,
    filters: ReportFilters
  ): Promise<ReportStatsResponse> {
    switch (reportType) {
      case 'patient-registrations':
        return this.getPatientRegistrationStats(filters);
      case 'visit-categories':
        return this.getVisitCategoryStats(filters);
      case 'demographics':
        return this.getPatientDemographics(filters);
      case 'admissions':
        return this.getAdmissionStats(filters);
      case 'deceased-patients':
        return this.getDeceasedPatientStats(filters);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  /**
   * Get details for a specific report type
   */
  static async getDetails(
    reportType: MedicalRecordsReportType,
    filters: ReportFilters
  ): Promise<ReportDetailsResponse> {
    switch (reportType) {
      case 'patient-registrations':
        return this.getPatientRegistrationDetails(filters);
      case 'visit-categories':
        return this.getVisitCategoryDetails(filters);
      case 'demographics':
        return this.getPatientDemographicDetails(filters);
      case 'admissions':
        return this.getAdmissionDetails(filters);
      case 'deceased-patients':
        return this.getDeceasedPatientDetails(filters);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }
}
