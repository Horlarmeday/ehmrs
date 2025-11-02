/* eslint-disable camelcase */
import { Response } from 'express';
import { exportDataToCSV, exportDataToExcel } from '../../../core/helpers/fileExport';
import { ReportStatsResponse, ReportDetailsResponse } from '../reports.service';
import { MedicalRecordsReportType } from '../domains/medicalRecords/medicalRecords.service';
import { ReportFilters } from '../domains/medicalRecords/types';
import dayjs from 'dayjs';

export type ExportFormat = 'csv' | 'xlsx';

export interface ExportOptions {
  format: ExportFormat;
  reportType: string;
  domain: string;
  filters?: ReportFilters;
  stats?: ReportStatsResponse;
  details?: ReportDetailsResponse;
}

// Row data types for export formatting
interface PatientRegistrationRow {
  firstname?: string;
  lastname?: string;
  middlename?: string;
  date_of_birth?: Date | string;
  gender?: string;
  phone?: string;
  address?: string;
  hospital_id?: string;
  patient_type?: string;
  createdAt?: Date | string;
}

interface VisitCategoryRow {
  patient?: {
    firstname?: string;
    lastname?: string;
    hospital_id?: string;
  };
  category?: string;
  department?: string;
  professional?: string;
  type?: string;
  status?: string;
  priority?: string;
  date_visit_start?: Date | string;
  date_visit_ended?: Date | string;
}

interface DemographicsRow {
  firstname?: string;
  lastname?: string;
  middlename?: string;
  date_of_birth?: Date | string;
  age_group?: string;
  gender?: string;
  phone?: string;
  address?: string;
  hospital_id?: string;
  createdAt?: Date | string;
}

interface AdmissionRow {
  patient?: {
    firstname?: string;
    lastname?: string;
    hospital_id?: string;
  };
  ward?: {
    name?: string;
  };
  bed?: {
    code?: string;
    bed_type?: string;
  };
  date_admitted?: Date | string;
  discharge_status?: string;
  discharge?: {
    date_discharged?: Date | string;
  };
  length_of_stay_days?: number;
}

interface DeceasedPatientRow {
  firstname?: string;
  lastname?: string;
  middlename?: string;
  date_of_birth?: Date | string;
  age_group?: string;
  gender?: string;
  date_of_death?: Date | string;
  cause_of_death?: string;
  death_certificate_number?: string;
  hospital_id?: string;
}

type ExportRow =
  | PatientRegistrationRow
  | VisitCategoryRow
  | DemographicsRow
  | AdmissionRow
  | DeceasedPatientRow;

interface ExportDataRow {
  [key: string]: string | number;
}

/**
 * Export Service
 * Handles export functionality for reports
 */
export class ExportService {
  /**
   * Prepare headers for export based on report type
   */
  private static getHeadersForReportType(reportType: string): string[][] {
    const headers: Record<string, string[][]> = {
      'patient-registrations': [
        [
          'First Name',
          'Last Name',
          'Middle Name',
          'Date of Birth',
          'Gender',
          'Phone',
          'Address',
          'Hospital ID',
          'Patient Type',
          'Date Registered',
        ],
      ],
      'visit-categories': [
        [
          'Patient Name',
          'Hospital ID',
          'Visit Category',
          'Department',
          'Professional',
          'Visit Type',
          'Status',
          'Priority',
          'Visit Start Date',
          'Visit End Date',
        ],
      ],
      demographics: [
        [
          'First Name',
          'Last Name',
          'Middle Name',
          'Date of Birth',
          'Age Group',
          'Gender',
          'Phone',
          'Address',
          'Hospital ID',
          'Date Registered',
        ],
      ],
      admissions: [
        [
          'Patient Name',
          'Hospital ID',
          'Ward',
          'Bed',
          'Admission Date',
          'Discharge Status',
          'Discharge Date',
          'Length of Stay (Days)',
        ],
      ],
      'deceased-patients': [
        [
          'First Name',
          'Last Name',
          'Middle Name',
          'Date of Birth',
          'Age Group',
          'Gender',
          'Date of Death',
          'Cause of Death',
          'Death Certificate Number',
          'Hospital ID',
        ],
      ],
    };

    return headers[reportType] || [['Data']];
  }

  /**
   * Format data rows for export based on report type
   */
  private static formatDataForExport(
    reportType: string,
    details: ReportDetailsResponse
  ): ExportDataRow[] {
    const rows = details.rows.map((row: ExportRow) => {
      switch (reportType) {
        case 'patient-registrations':
          const patientRow = row as PatientRegistrationRow;
          return {
            'First Name': patientRow.firstname || '',
            'Last Name': patientRow.lastname || '',
            'Middle Name': patientRow.middlename || '',
            'Date of Birth': patientRow.date_of_birth
              ? dayjs(patientRow.date_of_birth).format('YYYY-MM-DD')
              : '',
            Gender: patientRow.gender || '',
            Phone: patientRow.phone || '',
            Address: patientRow.address || '',
            'Hospital ID': patientRow.hospital_id || '',
            'Patient Type': patientRow.patient_type || '',
            'Date Registered': patientRow.createdAt
              ? dayjs(patientRow.createdAt).format('YYYY-MM-DD HH:mm:ss')
              : '',
          };

        case 'visit-categories':
          const visitRow = row as VisitCategoryRow;
          return {
            'Patient Name': visitRow.patient
              ? `${visitRow.patient.firstname || ''} ${visitRow.patient.lastname || ''}`.trim()
              : '',
            'Hospital ID': visitRow.patient?.hospital_id || '',
            'Visit Category': visitRow.category || '',
            Department: visitRow.department || '',
            Professional: visitRow.professional || '',
            'Visit Type': visitRow.type || '',
            Status: visitRow.status || '',
            Priority: visitRow.priority || '',
            'Visit Start Date': visitRow.date_visit_start
              ? dayjs(visitRow.date_visit_start).format('YYYY-MM-DD HH:mm:ss')
              : '',
            'Visit End Date': visitRow.date_visit_ended
              ? dayjs(visitRow.date_visit_ended).format('YYYY-MM-DD HH:mm:ss')
              : '',
          };

        case 'demographics':
          const demoRow = row as DemographicsRow;
          return {
            'First Name': demoRow.firstname || '',
            'Last Name': demoRow.lastname || '',
            'Middle Name': demoRow.middlename || '',
            'Date of Birth': demoRow.date_of_birth
              ? dayjs(demoRow.date_of_birth).format('YYYY-MM-DD')
              : '',
            'Age Group': demoRow.age_group || '',
            Gender: demoRow.gender || '',
            Phone: demoRow.phone || '',
            Address: demoRow.address || '',
            'Hospital ID': demoRow.hospital_id || '',
            'Date Registered': demoRow.createdAt
              ? dayjs(demoRow.createdAt).format('YYYY-MM-DD HH:mm:ss')
              : '',
          };

        case 'admissions':
          const admissionRow = row as AdmissionRow;
          return {
            'Patient Name': admissionRow.patient
              ? `${admissionRow.patient.firstname || ''} ${admissionRow.patient.lastname ||
                  ''}`.trim()
              : '',
            'Hospital ID': admissionRow.patient?.hospital_id || '',
            Ward: admissionRow.ward?.name || '',
            Bed: admissionRow.bed?.code || admissionRow.bed?.bed_type || '',
            'Admission Date': admissionRow.date_admitted
              ? dayjs(admissionRow.date_admitted).format('YYYY-MM-DD HH:mm:ss')
              : '',
            'Discharge Status': admissionRow.discharge_status || '',
            'Discharge Date': admissionRow.discharge?.date_discharged
              ? dayjs(admissionRow.discharge.date_discharged).format('YYYY-MM-DD HH:mm:ss')
              : '',
            'Length of Stay (Days)': admissionRow.length_of_stay_days ?? '',
          };

        case 'deceased-patients':
          const deceasedRow = row as DeceasedPatientRow;
          return {
            'First Name': deceasedRow.firstname || '',
            'Last Name': deceasedRow.lastname || '',
            'Middle Name': deceasedRow.middlename || '',
            'Date of Birth': deceasedRow.date_of_birth
              ? dayjs(deceasedRow.date_of_birth).format('YYYY-MM-DD')
              : '',
            'Age Group': deceasedRow.age_group || '',
            Gender: deceasedRow.gender || '',
            'Date of Death': deceasedRow.date_of_death
              ? dayjs(deceasedRow.date_of_death).format('YYYY-MM-DD')
              : '',
            'Cause of Death': deceasedRow.cause_of_death || '',
            'Death Certificate Number': deceasedRow.death_certificate_number || '',
            'Hospital ID': deceasedRow.hospital_id || '',
          };

        default:
          return {} as ExportDataRow;
      }
    });

    return rows;
  }

  /**
   * Generate filename for export
   */
  private static generateFilename(
    reportType: string,
    domain: string,
    format: ExportFormat,
    filters?: ReportFilters
  ): string {
    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    const reportTypeName = reportType.replace(/-/g, '_');
    const domainName = domain.replace(/-/g, '_');

    let filename = `${domainName}_${reportTypeName}_${timestamp}`;

    // Add date range to filename if available
    if (filters?.start && filters?.end) {
      const startDate = dayjs(filters.start).format('YYYY-MM-DD');
      const endDate = dayjs(filters.end).format('YYYY-MM-DD');
      filename = `${filename}_${startDate}_to_${endDate}`;
    }

    return `${filename}.${format}`;
  }

  /**
   * Export report data
   */
  static async exportReport(res: Response, options: ExportOptions): Promise<void> {
    const { format, reportType, domain, filters, details } = options;

    if (!details || !details.rows || details.rows.length === 0) {
      throw new Error('No data available for export');
    }

    const headers = this.getHeadersForReportType(reportType);
    const formattedData = this.formatDataForExport(reportType, details);
    const filename = this.generateFilename(reportType, domain, format, filters);

    // Set appropriate headers
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
    } else {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    }
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Export based on format
    if (format === 'csv') {
      exportDataToCSV(res, formattedData, headers);
    } else {
      exportDataToExcel(res, formattedData, headers);
    }
  }
}
