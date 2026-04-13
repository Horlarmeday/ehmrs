/**
 * Patient Service
 *
 * Handles all patient-related API calls.
 * Uses apiClient for HTTP requests.
 * Response format: { status: 'success', message: string, data: T }
 * Paginated responses: response.data.data has { docs, total, pages, perPage, currentPage }
 */

import { apiClient } from '@/services/api'
import type {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
} from '@/types/patient'
import type { PaginatedResult, SuccessResponse, PatientQueryParams } from '@/types/api'

/**
 * Create a new patient
 * POST /api/patients/create
 */
export async function createPatient(
  data: CreatePatientRequest
): Promise<Patient> {
  const response = await apiClient.post<SuccessResponse<Patient>>(
    '/api/patients/create',
    data
  )
  return response.data.data
}

/**
 * Create an emergency patient
 * POST /api/patients/create/emergency
 */
export async function createEmergencyPatient(
  data: Partial<CreatePatientRequest>
): Promise<Patient> {
  const response = await apiClient.post<SuccessResponse<Patient>>(
    '/api/patients/create/emergency',
    data
  )
  return response.data.data
}

/**
 * Create a dependant patient
 * POST /api/patients/create/dependant/:id
 */
export async function createDependantPatient(
  principalId: number,
  data: CreatePatientRequest
): Promise<Patient> {
  const response = await apiClient.post<SuccessResponse<Patient>>(
    `/api/patients/create/dependant/${principalId}`,
    data
  )
  return response.data.data
}

/**
 * Get patients with pagination
 * GET /api/patients/get
 */
export async function getPatients(
  params: PatientQueryParams = {}
): Promise<PaginatedResult<Patient>> {
  const response = await apiClient.get<SuccessResponse<PaginatedResult<Patient>>>(
    '/api/patients/get',
    { params }
  )
  return response.data.data
}

/**
 * Get a single patient by ID
 * GET /api/patients/get/:id
 */
export async function getPatientById(id: number): Promise<Patient> {
  const response = await apiClient.get<SuccessResponse<Patient>>(
    `/api/patients/get/${id}`
  )
  return response.data.data
}

/**
 * Get patient profile with insurance details
 * GET /api/patients/profile/get/:id
 */
export async function getPatientProfile(id: number): Promise<Patient> {
  const response = await apiClient.get<SuccessResponse<Patient>>(
    `/api/patients/profile/get/${id}`
  )
  return response.data.data
}

/**
 * Update a patient
 * PUT /api/patients/update/:id
 */
export async function updatePatient(
  id: number,
  data: UpdatePatientRequest
): Promise<Patient> {
  const response = await apiClient.put<SuccessResponse<Patient>>(
    `/api/patients/update/${id}`,
    { patient: data }
  )
  return response.data.data
}

/**
 * Mark a patient as deceased
 * PUT /api/patients/mark-deceased/:id
 */
export async function markPatientAsDeceased(
  id: number,
  data: { date_of_death: string; cause_of_death?: string; death_certificate_number?: string }
): Promise<Patient> {
  const response = await apiClient.put<SuccessResponse<Patient>>(
    `/api/patients/mark-deceased/${id}`,
    data
  )
  return response.data.data
}

/**
 * Revive a deceased patient
 * PUT /api/patients/revive/:id
 */
export async function revivePatient(
  id: number,
  data: { revival_reason: string }
): Promise<Patient> {
  const response = await apiClient.put<SuccessResponse<Patient>>(
    `/api/patients/revive/${id}`,
    data
  )
  return response.data.data
}

/**
 * Get deceased patients with pagination
 * GET /api/patients/deceased
 */
export async function getDeceasedPatients(
  params: PatientQueryParams = {}
): Promise<PaginatedResult<Patient>> {
  const response = await apiClient.get<SuccessResponse<PaginatedResult<Patient>>>(
    '/api/patients/deceased',
    { params }
  )
  return response.data.data
}
