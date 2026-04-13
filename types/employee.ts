/**
 * Employee (Staff) Types
 * 
 * Based on actual server model: /server/src/database/models/staff.ts
 * 
 * IMPORTANT: Field names match server database columns (snake_case)
 * Note: In EHMRS, employees are represented as "Staff"
 */

import type { BaseEntity, Gender } from './common'

/**
 * Staff status enum from server
 */
export enum StaffStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

/**
 * Staff (Employee) interface
 * 
 * Note: All field names match server database columns exactly
 */
export interface Staff extends BaseEntity {
  // Personal Information
  firstname: string
  lastname?: string
  middlename?: string
  fullname?: string  // Virtual field: "firstname middlename lastname"
  gender: Gender
  date_of_birth: Date
  
  // Contact Information
  email: string
  phone: string
  address: string  // Full address as single string
  
  // Employment Information
  department: string
  role: string
  sub_role?: string
  status: StaffStatus
  
  // Authentication
  username: string
  // Note: password is never returned in API responses
  
  // Photo
  photo?: string  // Photo filename
  
  // Career Information
  date_of_first_appointment?: Date
  date_of_commencement?: Date
  dolp?: Date  // Date of last promotion
  qualification?: string
  present_rank?: string
  chs_cms?: string  // CHS/CMS designation
  step?: number
  dd_for_retirement?: Date  // Date due for retirement
  
  // National ID
  nin?: string  // National Identification Number
  
  // Relations (populated via includes)
  // appointments?: Appointment[]  // Appointments as doctor
  // patients?: Patient[]          // Patients created by this staff
}

/**
 * Create staff request
 */
export interface CreateStaffRequest {
  // Required fields
  firstname: string
  email: string
  department: string
  date_of_birth: string  // ISO date
  gender: Gender
  role: string
  phone: string
  username: string
  address: string
  password: string
  
  // Optional fields
  lastname?: string
  middlename?: string
  sub_role?: string
  photo?: string
  date_of_first_appointment?: string
  date_of_commencement?: string
  qualification?: string
  present_rank?: string
  chs_cms?: string
  step?: number
  nin?: string
}

/**
 * Update staff request
 */
export interface UpdateStaffRequest {
  id: number
  firstname?: string
  lastname?: string
  middlename?: string
  email?: string
  department?: string
  role?: string
  sub_role?: string
  status?: StaffStatus
  phone?: string
  address?: string
  qualification?: string
  present_rank?: string
  step?: number
  nin?: string
}

/**
 * Staff filters
 */
export interface StaffFilters {
  search?: string
  department?: string
  status?: StaffStatus
  role?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Staff summary for lists
 */
export interface StaffSummary {
  id: number
  firstname: string
  lastname?: string
  fullname?: string
  email: string
  department: string
  role: string
  status: StaffStatus
  phone: string
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  id: number
  newPassword: string
}

/**
 * Department (derived from Staff.department)
 */
export interface Department {
  id: string  // Department name as identifier
  name: string
  staffCount: number
  headOfDepartment?: Staff
}
