/**
 * Appointment Store
 *
 * Pinia store for managing appointment state.
 * Handles CRUD operations, filters, and pagination.
 *
 * NOTE: Appointment uses ALTERNATIVE pagination format (PaginatedResultAlt)
 * with { rows, count, pages, currentPage, pageLimit } instead of
 * { docs, total, pages, perPage, currentPage }
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as appointmentService from '@/services/appointment.service'
import type {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentFilters,
  CheckInResponse,
} from '@/types/appointment'
import type { AppointmentQueryParams } from '@/types/api'
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

export const useAppointmentStore = defineStore('appointment', () => {
  // State
  const appointments = ref<Appointment[]>([])
  const currentAppointment = ref<Appointment | null>(null)
  const filters = ref<AppointmentQueryParams>({})
  const appointmentFilters = ref<AppointmentFilters>({})
  const pagination = ref(createPaginationState())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasAppointments = computed(() => appointments.value.length > 0)
  const totalPages = computed(() => pagination.value.pages)
  const currentPage = computed(() => pagination.value.page)
  const totalAppointments = computed(() => pagination.value.total)

  const appointmentsByStatus = computed(() => {
    const grouped: Record<string, Appointment[]> = {}
    appointments.value.forEach((apt) => {
      if (!grouped[apt.status]) {
        grouped[apt.status] = []
      }
      grouped[apt.status].push(apt)
    })
    return grouped
  })

  // Actions
  /**
   * Fetch appointments with pagination and filters
   */
  async function fetchAppointments(params?: AppointmentQueryParams) {
    isLoading.value = true
    error.value = null

    try {
      const queryParams: AppointmentQueryParams = {
        currentPage: params?.currentPage ?? pagination.value.page,
        pageLimit: params?.pageLimit ?? pagination.value.pageSize,
        ...params,
      }

      // Merge with stored filters
      const mergedParams = { ...filters.value, ...queryParams }

      const result = await appointmentService.getAppointments(mergedParams)

      // Appointment uses ALTERNATIVE pagination: rows/count/pageLimit
      appointments.value = result.rows
      pagination.value = {
        page: result.currentPage,
        pageSize: result.pageLimit,
        total: result.count,
        pages: result.pages,
      }

      return result
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch appointments')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single appointment by ID
   */
  async function fetchAppointmentById(id: number) {
    isLoading.value = true
    error.value = null

    try {
      const appointment = await appointmentService.getAppointmentById(id)
      currentAppointment.value = appointment
      return appointment
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch appointment')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new appointment
   */
  async function createAppointment(data: CreateAppointmentRequest) {
    isLoading.value = true
    error.value = null

    try {
      const appointment = await appointmentService.createAppointment(data)
      currentAppointment.value = appointment
      return appointment
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to create appointment')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an appointment
   */
  async function updateAppointment(id: number, data: UpdateAppointmentRequest) {
    isLoading.value = true
    error.value = null

    try {
      const appointment = await appointmentService.updateAppointment(id, data)
      currentAppointment.value = appointment

      // Update in the list if present
      const index = appointments.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        appointments.value[index] = appointment
      }

      return appointment
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to update appointment')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cancel an appointment
   */
  async function cancelAppointment(id: number, reason: string) {
    isLoading.value = true
    error.value = null

    try {
      const appointment = await appointmentService.cancelAppointment(id, reason)

      // Update in the list if present
      const index = appointments.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        appointments.value[index] = appointment
      }

      // Update current appointment if it's the same
      if (currentAppointment.value?.id === id) {
        currentAppointment.value = appointment
      }

      return appointment
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to cancel appointment')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reschedule an appointment
   */
  async function rescheduleAppointment(
    id: number,
    date: string,
    time: string,
    reason: string
  ) {
    isLoading.value = true
    error.value = null

    try {
      const appointment = await appointmentService.rescheduleAppointment(
        id,
        date,
        time,
        reason
      )

      // Update in the list if present
      const index = appointments.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        appointments.value[index] = appointment
      }

      // Update current appointment if it's the same
      if (currentAppointment.value?.id === id) {
        currentAppointment.value = appointment
      }

      return appointment
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to reschedule appointment')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Confirm an appointment
   */
  async function confirmAppointmentAction(id: number) {
    isLoading.value = true
    error.value = null

    try {
      const appointment = await appointmentService.confirmAppointment(id)

      // Update in the list if present
      const index = appointments.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        appointments.value[index] = appointment
      }

      // Update current appointment if it's the same
      if (currentAppointment.value?.id === id) {
        currentAppointment.value = appointment
      }

      return appointment
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to confirm appointment')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Check-in an appointment (creates a visit)
   */
  async function checkInAppointment(id: number): Promise<CheckInResponse> {
    isLoading.value = true
    error.value = null

    try {
      const result = await appointmentService.checkInAppointment(id)

      // Update appointment in the list if present
      const index = appointments.value.findIndex(
        (a) => a.id === result.appointment.id
      )
      if (index !== -1) {
        appointments.value[index] = result.appointment
      }

      // Update current appointment if it's the same
      if (currentAppointment.value?.id === result.appointment.id) {
        currentAppointment.value = result.appointment
      }

      return result
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to check-in appointment')
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
  function setFilters(newFilters: AppointmentFilters) {
    appointmentFilters.value = { ...appointmentFilters.value, ...newFilters }

    // Map fields to AppointmentQueryParams
    if (newFilters.status !== undefined) {
      filters.value.status = newFilters.status
    }
    if (newFilters.type !== undefined) {
      filters.value.type = newFilters.type
    }
    if (newFilters.doctor_id !== undefined) {
      filters.value.doctor_id = newFilters.doctor_id
    }
    if (newFilters.patient_id !== undefined) {
      filters.value.patient_id = newFilters.patient_id
    }
    if (newFilters.department !== undefined) {
      filters.value.department = newFilters.department
    }
    if (newFilters.start !== undefined) {
      filters.value.start = newFilters.start
    }
    if (newFilters.end !== undefined) {
      filters.value.end = newFilters.end
    }
  }

  /**
   * Reset store state
   */
  function resetState() {
    appointments.value = []
    currentAppointment.value = null
    filters.value = {}
    appointmentFilters.value = {}
    pagination.value = createPaginationState()
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    appointments,
    currentAppointment,
    filters,
    appointmentFilters,
    pagination,
    isLoading,
    error,
    // Getters
    hasAppointments,
    totalPages,
    currentPage,
    totalAppointments,
    appointmentsByStatus,
    // Actions
    fetchAppointments,
    fetchAppointmentById,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    rescheduleAppointment,
    confirmAppointment: confirmAppointmentAction,
    checkInAppointment,
    setSearch,
    setFilters,
    resetState,
  }
})
