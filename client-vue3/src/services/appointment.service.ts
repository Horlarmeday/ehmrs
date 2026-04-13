/**
 * Appointment Service
 *
 * Handles all appointment-related API calls.
 * Uses apiClient for HTTP requests.
 * Response format: { status: 'success', message: string, data: T }
 * Paginated responses: response.data.data has { rows, count, pages, currentPage, pageLimit }
 *
 * NOTE: Appointment uses ALTERNATIVE pagination format (PaginatedResultAlt)
 */

import { apiClient } from '@/services/api'
import type {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  CheckInResponse,
} from '@/types/appointment'
import type { PaginatedResultAlt, SuccessResponse, AppointmentQueryParams } from '@/types/api'

/**
 * Get appointments with pagination and filters
 * GET /api/appointments/get
 */
export async function getAppointments(
  params: AppointmentQueryParams = {}
): Promise<PaginatedResultAlt<Appointment>> {
  const response = await apiClient.get<SuccessResponse<PaginatedResultAlt<Appointment>>>(
    '/api/appointments/get',
    { params }
  )
  return response.data.data
}

/**
 * Get a single appointment by ID
 * GET /api/appointments/:id
 */
export async function getAppointmentById(id: number): Promise<Appointment> {
  const response = await apiClient.get<SuccessResponse<Appointment>>(
    `/api/appointments/${id}`
  )
  return response.data.data
}

/**
 * Create a new appointment
 * POST /api/appointments/create
 */
export async function createAppointment(
  data: CreateAppointmentRequest
): Promise<Appointment> {
  const response = await apiClient.post<SuccessResponse<Appointment>>(
    '/api/appointments/create',
    data
  )
  return response.data.data
}

/**
 * Update an appointment
 * PUT /api/appointments/:id
 */
export async function updateAppointment(
  id: number,
  data: UpdateAppointmentRequest
): Promise<Appointment> {
  const response = await apiClient.put<SuccessResponse<Appointment>>(
    `/api/appointments/${id}`,
    data
  )
  return response.data.data
}

/**
 * Cancel an appointment
 * PUT /api/appointments/:id/cancel
 */
export async function cancelAppointment(
  id: number,
  reason: string
): Promise<Appointment> {
  const response = await apiClient.put<SuccessResponse<Appointment>>(
    `/api/appointments/${id}/cancel`,
    { cancellation_reason: reason }
  )
  return response.data.data
}

/**
 * Reschedule an appointment
 * PUT /api/appointments/:id/reschedule
 */
export async function rescheduleAppointment(
  id: number,
  date: string,
  time: string,
  reason: string
): Promise<Appointment> {
  const response = await apiClient.put<SuccessResponse<Appointment>>(
    `/api/appointments/${id}/reschedule`,
    {
      appointment_date: date,
      appointment_time: time,
      rescheduling_reason: reason,
    }
  )
  return response.data.data
}

/**
 * Confirm an appointment
 * PUT /api/appointments/:id/confirm
 */
export async function confirmAppointment(id: number): Promise<Appointment> {
  const response = await apiClient.put<SuccessResponse<Appointment>>(
    `/api/appointments/${id}/confirm`,
    {}
  )
  return response.data.data
}

/**
 * Check-in an appointment (creates a visit)
 * POST /api/appointments/:id/check-in
 */
export async function checkInAppointment(id: number): Promise<CheckInResponse> {
  const response = await apiClient.post<SuccessResponse<CheckInResponse>>(
    `/api/appointments/${id}/check-in`,
    {}
  )
  return response.data.data
}
