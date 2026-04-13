/**
 * Visit Types
 * 
 * Based on actual server model: /server/src/database/models/visit.ts
 * 
 * IMPORTANT: Field names match server database columns (snake_case)
 */

import type { BaseEntity } from './common'
import type { Patient } from './patient'
import type { Staff } from './employee'
import type { Appointment } from './appointment'

/**
 * Visit category enum from server
 */
export enum VisitCategory {
  IPD = 'Inpatient',
  OPD = 'Outpatient',
  EMERGENCY = 'Emergency',
  ANC = 'Antenatal',
  IMMUNIZATION = 'Immunization',
  MATERNITY = 'Maternity',
  DIALYSIS = 'Dialysis',
}

/**
 * Visit status enum from server
 */
export enum VisitStatus {
  ONGOING = 'Ongoing',
  ENDED = 'Ended',
}

/**
 * Visit interface
 * 
 * Note: All field names match server database columns exactly
 */
export interface Visit extends BaseEntity {
  // Foreign Keys
  patient_id: number
  staff_id?: number  // Attending staff
  ante_natal_id?: number
  admission_id?: number
  immunization_id?: number
  consultation_id?: number
  
  // Visit Details
  category: VisitCategory
  type: string  // Visit type (custom string)
  status: VisitStatus
  department: string
  professional?: string
  priority?: string
  
  // Timing
  date_visit_start: Date
  date_visit_ended?: Date
  visit_date?: string  // DATEONLY format
  
  // Flags
  has_done_vitals: boolean
  is_taken: boolean
  is_from_appointment: boolean
  
  // Relations (populated via includes)
  patient?: Patient
  staff?: Staff
  appointments?: Appointment[]
}

/**
 * Create visit request
 */
export interface CreateVisitRequest {
  patient_id: number
  category: VisitCategory
  type: string
  department: string
  professional?: string
  priority?: string
  staff_id?: number
  is_from_appointment?: boolean
  appointment_id?: number
}

/**
 * Update visit request
 */
export interface UpdateVisitRequest {
  id: number
  category?: VisitCategory
  type?: string
  status?: VisitStatus
  department?: string
  professional?: string
  priority?: string
  staff_id?: number
  has_done_vitals?: boolean
  is_taken?: boolean
  date_visit_ended?: Date
}

/**
 * Visit filters
 * Based on client Vuex store expectations
 */
export interface VisitFilters {
  search?: string
  category?: VisitCategory
  status?: VisitStatus
  department?: string
  patient_id?: number
  staff_id?: number
  start?: string  // ISO date
  end?: string    // ISO date
  filter?: string  // Custom filter
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Visit summary for lists
 */
export interface VisitSummary {
  id: number
  patient_name: string
  category: VisitCategory
  type: string
  status: VisitStatus
  department: string
  date_visit_start: string
  date_visit_ended?: string
}

/**
 * End visit request
 */
export interface EndVisitRequest {
  id: number
  notes?: string
}

/**
 * Active visit (simplified for quick access)
 */
export interface ActiveVisit {
  id: number
  patient_id: number
  patient_name: string
  category: VisitCategory
  department: string
  date_visit_start: string
  status: VisitStatus
}

/**
 * Visit statistics
 */
export interface VisitStatistics {
  total: number
  ongoing: number
  ended: number
  byCategory: Array<{ category: VisitCategory; count: number }>
  byDepartment: Array<{ department: string; count: number }>
}
