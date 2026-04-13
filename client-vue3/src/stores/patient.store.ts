/**
 * Patient Store
 *
 * Pinia store for managing patient state.
 * Handles CRUD operations, search, filters, and pagination.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as patientService from '@/services/patient.service'
import type {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientFilters,
} from '@/types/patient'
import type { PaginatedResult, PatientQueryParams } from '@/types/api'
import type { AxiosError } from 'axios'

/**
 * Extract error message from an unknown error
 */
function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosError = err as AxiosError<{ message?: string }>
    return axiosError.response?.data?.message ?? fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}

/**
 * Default pagination state factory
 */
function createPaginationState() {
  return {
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  }
}

export const usePatientStore = defineStore('patient', () => {
  // State
  const patients = ref<Patient[]>([])
  const currentPatient = ref<Patient | null>(null)
  const currentPatientProfile = ref<Patient | null>(null)
  const filters = ref<PatientQueryParams>({})
  const patientFilters = ref<PatientFilters>({})
  const pagination = ref(createPaginationState())
  const deceasedPagination = ref(createPaginationState())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasPatients = computed(() => patients.value.length > 0)
  const totalPages = computed(() => pagination.value.pages)
  const currentPage = computed(() => pagination.value.page)
  const totalPatients = computed(() => pagination.value.total)

  // Actions
  /**
   * Fetch patients with pagination and filters
   */
  async function fetchPatients(params?: PatientQueryParams) {
    isLoading.value = true
    error.value = null

    try {
      const queryParams: PatientQueryParams = {
        currentPage: params?.currentPage ?? pagination.value.page,
        pageLimit: params?.pageLimit ?? pagination.value.pageSize,
        ...params,
      }

      // Merge with stored filters
      const mergedParams = { ...filters.value, ...queryParams }

      const result = await patientService.getPatients(mergedParams)

      patients.value = result.docs
      pagination.value = {
        page: result.currentPage,
        pageSize: result.perPage,
        total: result.total,
        pages: result.pages,
      }

      return result
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch patients')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single patient by ID
   */
  async function fetchPatientById(id: number) {
    isLoading.value = true
    error.value = null

    try {
      const patient = await patientService.getPatientById(id)
      currentPatient.value = patient
      return patient
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch patient')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch patient profile with insurance details
   */
  async function fetchPatientProfile(id: number) {
    isLoading.value = true
    error.value = null

    try {
      const patient = await patientService.getPatientProfile(id)
      currentPatientProfile.value = patient
      currentPatient.value = patient
      return patient
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch patient profile')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new patient
   */
  async function createPatient(data: CreatePatientRequest) {
    isLoading.value = true
    error.value = null

    try {
      const patient = await patientService.createPatient(data)
      currentPatient.value = patient
      return patient
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to create patient')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create an emergency patient
   */
  async function createEmergencyPatient(data: Partial<CreatePatientRequest>) {
    isLoading.value = true
    error.value = null

    try {
      const patient = await patientService.createEmergencyPatient(data)
      currentPatient.value = patient
      return patient
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to create emergency patient')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a dependant patient
   */
  async function createDependantPatient(
    principalId: number,
    data: CreatePatientRequest
  ) {
    isLoading.value = true
    error.value = null

    try {
      const patient = await patientService.createDependantPatient(principalId, data)
      currentPatient.value = patient
      return patient
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to create dependant patient')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update a patient
   */
  async function updatePatient(id: number, data: UpdatePatientRequest) {
    isLoading.value = true
    error.value = null

    try {
      const patient = await patientService.updatePatient(id, data)
      currentPatient.value = patient
      // Also update profile if it's the same patient
      if (currentPatientProfile.value?.id === id) {
        currentPatientProfile.value = patient
      }

      // Update in the list if present
      const index = patients.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        patients.value[index] = patient
      }

      return patient
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to update patient')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mark a patient as deceased
   */
  async function markPatientAsDeceased(
    id: number,
    data: { date_of_death: string; cause_of_death?: string; death_certificate_number?: string }
  ) {
    isLoading.value = true
    error.value = null

    try {
      const patient = await patientService.markPatientAsDeceased(id, data)

      // Update in the list if present
      const index = patients.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        patients.value[index] = patient
      }

      // Update current patient
      if (currentPatient.value?.id === id) {
        currentPatient.value = patient
      }
      if (currentPatientProfile.value?.id === id) {
        currentPatientProfile.value = patient
      }

      return patient
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to mark patient as deceased')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Revive a deceased patient
   */
  async function revivePatient(id: number, data: { revival_reason: string }) {
    isLoading.value = true
    error.value = null

    try {
      const patient = await patientService.revivePatient(id, data)

      // Update in the list if present
      const index = patients.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        patients.value[index] = patient
      }

      // Update current patient
      if (currentPatient.value?.id === id) {
        currentPatient.value = patient
      }
      if (currentPatientProfile.value?.id === id) {
        currentPatientProfile.value = patient
      }

      return patient
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to revive patient')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get deceased patients
   */
  async function fetchDeceasedPatients(params?: PatientQueryParams) {
    isLoading.value = true
    error.value = null

    try {
      const queryParams: PatientQueryParams = {
        currentPage: params?.currentPage ?? deceasedPagination.value.page,
        pageLimit: params?.pageLimit ?? deceasedPagination.value.pageSize,
        ...params,
      }

      const result = await patientService.getDeceasedPatients(queryParams)

      patients.value = result.docs
      deceasedPagination.value = {
        page: result.currentPage,
        pageSize: result.perPage,
        total: result.total,
        pages: result.pages,
      }

      return result
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch deceased patients')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set search query
   */
  function setSearch(search: string) {
    filters.value.search = search
  }

  /**
   * Set filters and refetch
   */
  function setFilters(newFilters: PatientFilters) {
    patientFilters.value = { ...patientFilters.value, ...newFilters }
    // Only map fields that are compatible with PatientQueryParams
    if (newFilters.patient_status !== undefined) {
      filters.value.patient_status = newFilters.patient_status
    }
    if (newFilters.start !== undefined) {
      filters.value.start = newFilters.start
    }
    if (newFilters.end !== undefined) {
      filters.value.end = newFilters.end
    }
    if (newFilters.sortBy !== undefined) {
      filters.value.sortBy = newFilters.sortBy
    }
    if (newFilters.sortOrder !== undefined) {
      filters.value.sortOrder = newFilters.sortOrder
    }
  }

  /**
   * Reset store state
   */
  function resetState() {
    patients.value = []
    currentPatient.value = null
    currentPatientProfile.value = null
    filters.value = {}
    patientFilters.value = {}
    pagination.value = createPaginationState()
    deceasedPagination.value = createPaginationState()
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    patients,
    currentPatient,
    currentPatientProfile,
    filters,
    patientFilters,
    pagination,
    deceasedPagination,
    isLoading,
    error,
    // Getters
    hasPatients,
    totalPages,
    currentPage,
    totalPatients,
    // Actions
    fetchPatients,
    fetchPatientById,
    fetchPatientProfile,
    createPatient,
    createEmergencyPatient,
    createDependantPatient,
    updatePatient,
    markPatientAsDeceased,
    revivePatient,
    fetchDeceasedPatients,
    setSearch,
    setFilters,
    resetState,
  }
})
