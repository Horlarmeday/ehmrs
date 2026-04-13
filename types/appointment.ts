/**
 * Appointment Types
 * 
 * Based on actual server model: /server/src/database/models/appointment.ts
 * 
 * IMPORTANT: Field names match server database columns (snake_case)
 */

import type { BaseEntity, Gender } from './common'
import type { Patient } from './patient'
import type { Staff } from './employee'
import type { Visit } from './visit'

/**
 * Appointment status enum from server
 */
export enum AppointmentStatus {
  SCHEDULED = 'Scheduled',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed',
  NO_SHOW = 'No Show',
  RESCHEDULED = 'Rescheduled',
}

/**
 * Appointment type enum from server
 */
export enum AppointmentType {
  CONSULTATION = 'Consultation',
  FOLLOW_UP = 'Follow Up',
  PROCEDURE = 'Procedure',
  VACCINATION = 'Vaccination',
  DIALYSIS = 'Dialysis',
  ANTENATAL = 'Antenatal',
}

/**
 * Appointment interface
 * 
 * Note: All field names match server database columns exactly
 */
export interface Appointment extends BaseEntity {
  // Foreign Keys
  patient_id: number
  doctor_id: number
  scheduled_by: number
  
  // Appointment Details
  appointment_date: string  // DATEONLY format: "YYYY-MM-DD"
  appointment_time: string  // TIME format: "HH:MM:SS"
  duration_minutes: number  // Range: 15-240, default: 30
  type: AppointmentType
  status: AppointmentStatus
  
  // Department Information
  department: string
  professional: string  // Professional name
  
  // Additional Information
  priority?: string
  notes?: string
  reason_for_visit?: string
  
  // Visit Link (after check-in)
  visit_id?: number
  
  // Cancellation
  cancelled_at?: Date
  cancelled_by?: number
  cancellation_reason?: string
  
  // Rescheduling
  rescheduled_at?: Date
  rescheduled_by?: number
  rescheduling_reason?: string
  
  // Confirmation
  confirmed_at?: Date
  confirmed_by?: number
  
  // Relations (populated via includes)
  patient?: Patient
  doctor?: Staff
  scheduler?: Staff
  visit?: Visit
}

/**
 * Create appointment request
 */
export interface CreateAppointmentRequest {
  patient_id: number
  doctor_id: number
  appointment_date: string  // "YYYY-MM-DD"
  appointment_time: string  // "HH:MM"
  duration_minutes?: number
  type: AppointmentType
  department: string
  professional: string
  priority?: string
  notes?: string
  reason_for_visit?: string
}

/**
 * Update appointment request
 */
export interface UpdateAppointmentRequest {
  id: number
  patient_id?: number
  doctor_id?: number
  appointment_date?: string
  appointment_time?: string
  duration_minutes?: number
  type?: AppointmentType
  status?: AppointmentStatus
  department?: string
  professional?: string
  priority?: string
  notes?: string
  reason_for_visit?: string
}

/**
 * Appointment filters
 * Based on client Vuex store expectations
 */
export interface AppointmentFilters {
  search?: string
  status?: AppointmentStatus
  type?: AppointmentType
  doctor_id?: number
  patient_id?: number
  department?: string
  start?: string  // ISO date
  end?: string    // ISO date
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Appointment summary for lists
 */
export interface AppointmentSummary {
  id: number
  patient_name: string
  doctor_name: string
  appointment_date: string
  appointment_time: string
  type: AppointmentType
  status: AppointmentStatus
  department: string
}

/**
 * Check-in request
 */
export interface CheckInRequest {
  appointmentId: number
  notes?: string
}

/**
 * Check-in response
 */
export interface CheckInResponse {
  appointment: Appointment
  visit: Visit
}

/**
 * Cancel appointment request
 */
export interface CancelAppointmentRequest {
  id: number
  cancellation_reason: string
}

/**
 * Reschedule appointment request
 */
export interface RescheduleAppointmentRequest {
  id: number
  appointment_date: string
  appointment_time: string
  rescheduling_reason: string
}

/**
 * Confirm appointment request
 */
export interface ConfirmAppointmentRequest {
  id: number
}

/**
 * Appointment statistics for dashboard
 */
export interface AppointmentDashboardStats {
  total: number
  today: number
  scheduled: number
  completed: number
  cancelled: number
  noShow: number
}

/**
 * Time slot for availability
 */
export interface TimeSlot {
  time: string  // "HH:MM"
  available: boolean
  appointmentId?: number
}

/**
 * Doctor schedule for a day
 */
export interface DoctorSchedule {
  date: string  // "YYYY-MM-DD"
  doctor_id: number
  doctor_name: string
  slots: TimeSlot[]
  appointments: Appointment[]
}
