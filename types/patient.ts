/**
 * Patient Types
 * 
 * Based on actual server model: /server/src/database/models/patient.ts
 * 
 * IMPORTANT: Field names match server database columns (snake_case)
 */

import type { BaseEntity, Gender } from './common'
import type { Staff } from './employee'

/**
 * Patient status enum from server
 */
export enum PatientStatus {
  INPATIENT = 'Inpatient',
  OUTPATIENT = 'Outpatient',
  DECEASED = 'Deceased',
}

/**
 * Patient account status enum from server
 */
export enum PatientAccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

/**
 * Patient type enum from server
 */
export enum PatientType {
  PATIENT = 'Patient',
  DEPENDANT = 'Dependant',
}

/**
 * Patient interface
 * 
 * Note: All field names match server database columns exactly
 */
export interface Patient extends BaseEntity {
  // Basic Information
  firstname: string
  lastname: string
  middlename?: string
  fullname?: string  // Virtual field: "firstname middlename lastname"
  complete_name?: string  // Computed full name
  gender: Gender
  date_of_birth: Date
  
  // Contact Information
  phone: string
  alt_phone?: string
  address: string  // Full address as single string
  country?: string
  state?: string
  lga?: string  // Local Government Area
  email?: string
  
  // Identification
  hospital_id?: string  // Hospital identification number
  old_patient_id?: number  // Legacy patient ID
  
  // Additional Information
  occupation?: string
  marital_status?: string
  religion?: string
  photo?: string  // Photo filename
  photo_url?: string  // Full photo URL
  
  // Next of Kin
  next_of_kin_name?: string
  next_of_kin_address?: string
  next_of_kin_phone?: string
  next_of_kin_relationship?: string
  
  // Insurance
  has_insurance: boolean
  
  // Dependant Information
  patient_type: PatientType
  relationship_to_principal?: string
  principal_id?: number  // FK to principal Patient
  
  // Patient Status
  patient_status: PatientStatus
  status: PatientAccountStatus
  is_difficult_patient?: boolean  // Should be boolean, stored as string in DB
  
  // Admission Tracking
  admitted_days_in_year: number
  
  // Deceased Information
  date_of_death?: Date
  cause_of_death?: string
  death_certificate_number?: string
  marked_deceased_by?: number  // FK to Staff
  marked_deceased_at?: Date
  revival_reason?: string
  revived_by?: number  // FK to Staff
  revived_at?: Date
  
  // Audit Fields
  staff_id?: number  // FK to Staff (creator)
  created_date?: Date
  updated_by?: number  // FK to Staff (last updater)
  
  // Relations (populated via includes)
  staff?: Staff
  principal?: Patient
  dependants?: Patient[]
}

/**
 * Patient filters for list/search
 * Based on client Vuex store expectations
 */
export interface PatientFilters {
  search?: string
  gender?: Gender
  status?: PatientAccountStatus
  patient_status?: PatientStatus
  patient_type?: PatientType
  has_insurance?: boolean
  start?: string  // ISO date
  end?: string    // ISO date
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Create patient request
 * Only includes required and common optional fields
 */
export interface CreatePatientRequest {
  // Required fields
  firstname: string
  lastname: string
  gender: Gender
  date_of_birth: string  // ISO date string for form submission
  phone: string
  address: string
  
  // Optional fields
  middlename?: string
  alt_phone?: string
  country?: string
  state?: string
  lga?: string
  email?: string
  hospital_id?: string
  occupation?: string
  marital_status?: string
  religion?: string
  photo?: string
  
  // Next of Kin
  next_of_kin_name?: string
  next_of_kin_address?: string
  next_of_kin_phone?: string
  next_of_kin_relationship?: string
  
  // Insurance
  has_insurance?: boolean
  
  // Dependant
  patient_type?: PatientType
  relationship_to_principal?: string
  principal_id?: number
}

/**
 * Update patient request
 * All fields optional except id
 */
export interface UpdatePatientRequest {
  id: number
  firstname?: string
  lastname?: string
  middlename?: string
  gender?: Gender
  date_of_birth?: string
  phone?: string
  alt_phone?: string
  address?: string
  country?: string
  state?: string
  lga?: string
  email?: string
  hospital_id?: string
  occupation?: string
  marital_status?: string
  religion?: string
  photo?: string
  next_of_kin_name?: string
  next_of_kin_address?: string
  next_of_kin_phone?: string
  next_of_kin_relationship?: string
  has_insurance?: boolean
  patient_status?: PatientStatus
  status?: PatientAccountStatus
}

/**
 * Patient search result (simplified for search dropdowns)
 */
export interface PatientSearchResult {
  id: number
  firstname: string
  lastname: string
  fullname?: string
  gender: Gender
  date_of_birth: string
  hospital_id?: string
  photo_url?: string
  phone: string
}

/**
 * Patient summary for cards/lists
 */
export interface PatientSummary {
  id: number
  firstname: string
  lastname: string
  fullname?: string
  hospital_id?: string
  patient_status: PatientStatus
  status: PatientAccountStatus
}

/**
 * Mark patient as deceased request
 */
export interface MarkDeceasedRequest {
  patientId: number
  cause_of_death: string
  date_of_death: string
  death_certificate_number?: string
}

/**
 * Revive patient request
 */
export interface RevivePatientRequest {
  patientId: number
  revival_reason: string
}

/**
 * Deceased patient statistics
 */
export interface DeathStatistics {
  total: number
  byMonth: Array<{ month: string; count: number }>
  byCause: Array<{ cause: string; count: number }>
  byAge: Array<{ ageRange: string; count: number }>
}

/**
 * Mortality report
 */
export interface MortalityReport {
  id: number
  patient_id: number
  patient_name: string
  date_of_death: string
  cause_of_death: string
  death_certificate_number?: string
  marked_deceased_at: string
}
