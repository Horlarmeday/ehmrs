/**
 * API Response Types
 * 
 * Actual response formats from EHMRS server
 * Based on /server/src/common/responses/ and client Vuex store analysis
 */

import type { BaseEntity } from './common'

/**
 * Success response format
 * Based on /server/src/common/responses/success-responses.ts
 */
export interface SuccessResponse<T = any> {
  status: 'success'
  message: string
  data: T
}

/**
 * Error response format
 * Based on /server/src/common/responses/error-responses.ts
 */
export interface ErrorResponse {
  status: 'error'
  httpCode: number
  message: string
  errors?: Record<string, string[]>  // Validation errors
}

/**
 * Standard pagination format (used by most endpoints)
 * Based on /server/src/core/helpers/helper.ts (paginate function)
 */
export interface PaginatedResult<T> {
  docs: T[]          // Array of items
  total: number      // Total count of all items
  pages: number      // Total number of pages
  perPage: number    // Items per page
  currentPage: number
}

/**
 * Alternative pagination format (Appointment endpoint specific)
 * Note: This is inconsistent with other endpoints
 */
export interface PaginatedResultAlt<T> {
  rows: T[]          // Array of items (same as docs)
  count: number      // Total count
  pages: number      // Total pages
  currentPage: number
  pageLimit: number  // Items per page
}

/**
 * Unified pagination info
 * Use this for client-side state management
 */
export interface PaginationInfo {
  total: number
  pages: number
  currentPage: number
  perPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Query parameters for patient list
 * Based on client Vuex store expectations
 */
import type { PatientStatus } from './patient'
import type { AppointmentStatus, AppointmentType } from './appointment'
import type { VisitCategory } from './visit'
import type { StaffStatus } from './employee'

export interface PatientQueryParams {
  currentPage?: number
  pageLimit?: number
  search?: string
  start?: string  // ISO date
  end?: string    // ISO date
  filter?: string
  patient_status?: PatientStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Query parameters for appointment list
 */
export interface AppointmentQueryParams {
  currentPage?: number
  pageLimit?: number
  search?: string
  start?: string  // ISO date
  end?: string    // ISO date
  status?: AppointmentStatus
  type?: AppointmentType
  doctor_id?: number
  patient_id?: number
  department?: string
}

/**
 * Query parameters for visit list
 */
export interface VisitQueryParams {
  currentPage?: number
  pageLimit?: number
  search?: string
  start?: string  // ISO date
  end?: string    // ISO date
  category?: VisitCategory
  filter?: string
}

/**
 * Query parameters for staff/employee list
 */
export interface StaffQueryParams {
  currentPage?: number
  pageLimit?: number
  search?: string
  department?: string
  status?: StaffStatus
  role?: string
}

/**
 * Helper to convert PaginatedResult to PaginationInfo
 */
export function extractPaginationInfo<T>(result: PaginatedResult<T> | PaginatedResultAlt<T>): PaginationInfo {
  if ('docs' in result) {
    return {
      total: result.total,
      pages: result.pages,
      currentPage: result.currentPage,
      perPage: result.perPage,
      hasNextPage: result.currentPage < result.pages,
      hasPreviousPage: result.currentPage > 1,
    }
  } else {
    return {
      total: result.count,
      pages: result.pages,
      currentPage: result.currentPage,
      perPage: result.pageLimit,
      hasNextPage: result.currentPage < result.pages,
      hasPreviousPage: result.currentPage > 1,
    }
  }
}

/**
 * Helper to get items from paginated result
 */
export function getItems<T>(result: PaginatedResult<T> | PaginatedResultAlt<T>): T[] {
  return 'docs' in result ? result.docs : result.rows
}
