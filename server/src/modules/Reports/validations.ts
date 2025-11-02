import Joi from 'joi';
import { PatientType } from '../Patient/types/patient.types';
import { Gender } from '../../database/models/patient';
import { VisitCategory, VisitStatus } from '../../database/models/visit';
import { PatientStatus } from '../../database/models/patient';
import { DischargeStatus } from '../../database/models/admission';
import { ReportFilters } from './domains/medicalRecords/types';

const validReportTypes = [
  'patient-registrations',
  'visit-categories',
  'demographics',
  'admissions',
  'deceased-patients',
];

const validDomains = ['medical-records'];

/**
 * Validate report type
 */
export const validateReportType = (reportType: string) => {
  const schema = Joi.string()
    .valid(...validReportTypes)
    .required()
    .messages({
      'any.only': `Report type must be one of: ${validReportTypes.join(', ')}`,
      'any.required': 'Report type is required',
    });

  return schema.validate(reportType);
};

/**
 * Validate domain
 */
export const validateDomain = (domain: string) => {
  const schema = Joi.string()
    .valid(...validDomains)
    .required()
    .messages({
      'any.only': `Domain must be one of: ${validDomains.join(', ')}`,
      'any.required': 'Report domain is required',
    });

  return schema.validate(domain);
};

/**
 * Validate report filters
 */
export const validateReportFilters = (filters: Record<string, unknown>) => {
  const schema = Joi.object({
    start: Joi.date().optional(),
    end: Joi.date().optional(),
    patient_type: Joi.string()
      .valid(PatientType.PATIENT, PatientType.DEPENDANT)
      .optional(),
    gender: Joi.string()
      .valid(Gender.MALE, Gender.FEMALE, Gender.OTHER)
      .optional(),
    category: Joi.string()
      .valid(
        VisitCategory.IPD,
        VisitCategory.OPD,
        VisitCategory.EMERGENCY,
        VisitCategory.ANC,
        VisitCategory.IMMUNIZATION,
        VisitCategory.MATERNITY,
        VisitCategory.DIALYSIS
      )
      .optional(),
    department: Joi.string().optional(),
    status: Joi.alternatives()
      .try(
        Joi.string().valid(VisitStatus.ONGOING, VisitStatus.ENDED),
        Joi.string().valid(
          PatientStatus.INPATIENT,
          PatientStatus.OUTPATIENT,
          PatientStatus.DECEASED
        ),
        Joi.string().valid(DischargeStatus.DISCHARGED, DischargeStatus.ON_ADMISSION)
      )
      .optional(),
    ward_id: Joi.number()
      .integer()
      .optional(),
    cause_of_death: Joi.string().optional(),
    age_group: Joi.string().optional(),
    currentPage: Joi.number()
      .integer()
      .min(1)
      .optional(),
    pageLimit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional(),
  })
    .custom((value, helpers) => {
      // Validate date range if both dates are provided
      if (value.start && value.end) {
        const startDate = new Date(value.start);
        const endDate = new Date(value.end);
        if (startDate > endDate) {
          return helpers.error('date.range');
        }
      }
      return value;
    })
    .messages({
      'date.range': 'Start date must be before or equal to end date',
    });

  return schema.validate(filters, { abortEarly: false });
};

/**
 * Validate export request
 */
export interface ExportRequest {
  domain: string;
  reportType: string;
  format: 'csv' | 'xlsx';
  filters?: ReportFilters;
}

export const validateExportRequest = (data: Record<string, unknown>) => {
  const schema = Joi.object({
    domain: Joi.string()
      .valid(...validDomains)
      .required(),
    reportType: Joi.string()
      .valid(...validReportTypes)
      .required(),
    format: Joi.string()
      .valid('csv', 'xlsx')
      .required(),
    filters: Joi.object().optional(),
  });

  return schema.validate(data);
};

/**
 * Validate save report request
 */
export interface SaveReportRequest {
  title: string;
  domain: string;
  report_type: string;
  date_range_start?: Date;
  date_range_end?: Date;
  filters?: Record<string, unknown>;
}

export const validateSaveReport = (data: Record<string, unknown>) => {
  const schema = Joi.object({
    title: Joi.string()
      .required()
      .min(1)
      .max(255),
    domain: Joi.string()
      .valid(...validDomains)
      .required(),
    report_type: Joi.string()
      .valid(...validReportTypes)
      .required(),
    date_range_start: Joi.date().optional(),
    date_range_end: Joi.date().optional(),
    filters: Joi.object().optional(),
  });

  return schema.validate(data);
};
