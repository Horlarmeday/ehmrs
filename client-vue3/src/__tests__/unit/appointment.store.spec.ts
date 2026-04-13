/**
 * Appointment Store Unit Tests
 *
 * Tests all appointment store actions by mocking the appointment service.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAppointmentStore } from '@/stores/appointment.store'
import * as appointmentService from '@/services/appointment.service'
import type { Appointment, CheckInResponse } from '@/types/appointment'
import type { Visit } from '@/types/visit'
import { AppointmentStatus, AppointmentType } from '@/types/appointment'
import { Gender, PatientStatus, PatientAccountStatus, PatientType } from '@/types'
import { StaffStatus } from '@/types/employee'
import { VisitCategory, VisitStatus } from '@/types/visit'

// Mock the appointment service
vi.mock('@/services/appointment.service', () => ({
  getAppointments: vi.fn(),
  getAppointmentById: vi.fn(),
  createAppointment: vi.fn(),
  updateAppointment: vi.fn(),
  cancelAppointment: vi.fn(),
  rescheduleAppointment: vi.fn(),
  confirmAppointment: vi.fn(),
  checkInAppointment: vi.fn(),
}))

// Mock patient data
const mockPatient = {
  id: 1,
  firstname: 'John',
  lastname: 'Doe',
  middlename: 'Smith',
  fullname: 'John Smith Doe',
  gender: Gender.MALE,
  date_of_birth: new Date('1990-01-15'),
  phone: '08012345678',
  address: '123 Test Street, Lagos',
  has_insurance: false,
  patient_type: PatientType.PATIENT,
  patient_status: PatientStatus.OUTPATIENT,
  status: PatientAccountStatus.ACTIVE,
  admitted_days_in_year: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

// Mock doctor data
const mockDoctor = {
  id: 1,
  firstname: 'Dr. Smith',
  lastname: 'Johnson',
  fullname: 'Dr. Smith Johnson',
  email: 'smith@hospital.com',
  department: 'Cardiology',
  date_of_birth: new Date('1980-05-10'),
  gender: Gender.MALE,
  status: StaffStatus.ACTIVE,
  role: 'Doctor',
  phone: '08012345678',
  username: 'drsmith',
  address: '123 Medical Ave',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

// Mock visit data
const mockVisit: Visit = {
  id: 1,
  patient_id: 1,
  staff_id: 1,
  category: VisitCategory.OPD,
  type: 'Consultation',
  status: VisitStatus.ONGOING,
  department: 'Cardiology',
  date_visit_start: new Date(),
  has_done_vitals: false,
  is_taken: false,
  is_from_appointment: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Mock appointment data
const mockAppointment: Appointment = {
  id: 1,
  patient_id: 1,
  doctor_id: 1,
  scheduled_by: 1,
  appointment_date: '2026-04-15',
  appointment_time: '10:00:00',
  duration_minutes: 30,
  type: AppointmentType.CONSULTATION,
  status: AppointmentStatus.SCHEDULED,
  department: 'Cardiology',
  professional: 'Dr. Smith Johnson',
  notes: 'Initial consultation',
  patient: mockPatient,
  doctor: mockDoctor,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

// Mock paginated result (ALTERNATIVE format)
const mockPaginatedResult = {
  rows: [mockAppointment],
  count: 1,
  pages: 1,
  currentPage: 1,
  pageLimit: 10,
}

describe('Appointment Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useAppointmentStore()

      expect(store.appointments).toEqual([])
      expect(store.currentAppointment).toBeNull()
      expect(store.filters).toEqual({})
      expect(store.pagination.page).toBe(1)
      expect(store.pagination.pageSize).toBe(10)
      expect(store.pagination.total).toBe(0)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('getters', () => {
    it('hasAppointments should return true when appointments exist', () => {
      const store = useAppointmentStore()
      store.appointments = [mockAppointment]

      expect(store.hasAppointments).toBe(true)
    })

    it('hasAppointments should return false when no appointments', () => {
      const store = useAppointmentStore()

      expect(store.hasAppointments).toBe(false)
    })

    it('totalPages should return correct page count', () => {
      const store = useAppointmentStore()
      store.pagination.pages = 5

      expect(store.totalPages).toBe(5)
    })

    it('appointmentsByStatus should group appointments by status', () => {
      const store = useAppointmentStore()
      const scheduledApt = { ...mockAppointment, id: 1, status: AppointmentStatus.SCHEDULED }
      const confirmedApt = { ...mockAppointment, id: 2, status: AppointmentStatus.CONFIRMED }
      store.appointments = [scheduledApt, confirmedApt]

      const grouped = store.appointmentsByStatus

      expect(grouped['Scheduled']).toHaveLength(1)
      expect(grouped['Confirmed']).toHaveLength(1)
    })
  })

  describe('fetchAppointments', () => {
    it('should fetch appointments successfully', async () => {
      vi.mocked(appointmentService.getAppointments).mockResolvedValueOnce(mockPaginatedResult)

      const store = useAppointmentStore()
      await store.fetchAppointments({ currentPage: 1, pageLimit: 10 })

      expect(appointmentService.getAppointments).toHaveBeenCalledWith({
        currentPage: 1,
        pageLimit: 10,
      })
      expect(store.appointments).toEqual([mockAppointment])
      expect(store.pagination.total).toBe(1)
      expect(store.pagination.pages).toBe(1)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should use ALTERNATIVE pagination (rows/count/pageLimit)', async () => {
      vi.mocked(appointmentService.getAppointments).mockResolvedValueOnce({
        rows: [mockAppointment],
        count: 25,
        pages: 3,
        currentPage: 2,
        pageLimit: 10,
      })

      const store = useAppointmentStore()
      await store.fetchAppointments({ currentPage: 2, pageLimit: 10 })

      // Verify alternative pagination mapping
      expect(store.appointments).toHaveLength(1)
      expect(store.pagination.total).toBe(25) // from count
      expect(store.pagination.pages).toBe(3)
      expect(store.pagination.page).toBe(2)
      expect(store.pagination.pageSize).toBe(10) // from pageLimit
    })

    it('should handle fetch errors', async () => {
      vi.mocked(appointmentService.getAppointments).mockRejectedValueOnce({
        response: { data: { message: 'Failed to fetch' } },
      })

      const store = useAppointmentStore()

      await expect(store.fetchAppointments()).rejects.toThrow()
      expect(store.error).toBe('Failed to fetch')
      expect(store.isLoading).toBe(false)
    })

    it('should set loading state during fetch', async () => {
      vi.mocked(appointmentService.getAppointments).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve(mockPaginatedResult), 10))
      )

      const store = useAppointmentStore()
      const fetchPromise = store.fetchAppointments()

      expect(store.isLoading).toBe(true)

      await fetchPromise
      expect(store.isLoading).toBe(false)
    })

    it('should merge with stored filters', async () => {
      vi.mocked(appointmentService.getAppointments).mockResolvedValueOnce(mockPaginatedResult)

      const store = useAppointmentStore()
      store.filters = { status: AppointmentStatus.SCHEDULED }
      await store.fetchAppointments({ currentPage: 1, pageLimit: 10 })

      expect(appointmentService.getAppointments).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AppointmentStatus.SCHEDULED,
          currentPage: 1,
          pageLimit: 10,
        })
      )
    })
  })

  describe('fetchAppointmentById', () => {
    it('should fetch a single appointment successfully', async () => {
      vi.mocked(appointmentService.getAppointmentById).mockResolvedValueOnce(mockAppointment)

      const store = useAppointmentStore()
      const result = await store.fetchAppointmentById(1)

      expect(appointmentService.getAppointmentById).toHaveBeenCalledWith(1)
      expect(store.currentAppointment).toEqual(mockAppointment)
      expect(result).toEqual(mockAppointment)
    })

    it('should handle fetch errors', async () => {
      vi.mocked(appointmentService.getAppointmentById).mockRejectedValueOnce({
        response: { data: { message: 'Appointment not found' } },
      })

      const store = useAppointmentStore()

      await expect(store.fetchAppointmentById(999)).rejects.toThrow()
      expect(store.error).toBe('Appointment not found')
    })
  })

  describe('createAppointment', () => {
    it('should create an appointment successfully', async () => {
      vi.mocked(appointmentService.createAppointment).mockResolvedValueOnce(mockAppointment)

      const createData = {
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2026-04-15',
        appointment_time: '10:00',
        type: AppointmentType.CONSULTATION,
        department: 'Cardiology',
        professional: 'Dr. Smith Johnson',
      }

      const store = useAppointmentStore()
      const result = await store.createAppointment(createData)

      expect(appointmentService.createAppointment).toHaveBeenCalledWith(createData)
      expect(store.currentAppointment).toEqual(mockAppointment)
      expect(result).toEqual(mockAppointment)
    })

    it('should handle creation errors', async () => {
      vi.mocked(appointmentService.createAppointment).mockRejectedValueOnce({
        response: { data: { message: 'Validation failed' } },
      })

      const store = useAppointmentStore()

      await expect(
        store.createAppointment({
          patient_id: 1,
          doctor_id: 1,
          appointment_date: '2026-04-15',
          appointment_time: '10:00',
          type: AppointmentType.CONSULTATION,
          department: 'Cardiology',
          professional: 'Dr. Smith',
        })
      ).rejects.toThrow()
      expect(store.error).toBe('Validation failed')
    })
  })

  describe('updateAppointment', () => {
    it('should update an appointment successfully', async () => {
      const updatedAppointment = { ...mockAppointment, notes: 'Updated notes' }
      vi.mocked(appointmentService.updateAppointment).mockResolvedValueOnce(updatedAppointment)

      const updateData = { id: 1, notes: 'Updated notes' }

      const store = useAppointmentStore()
      store.appointments = [mockAppointment]

      const result = await store.updateAppointment(1, updateData)

      expect(appointmentService.updateAppointment).toHaveBeenCalledWith(1, updateData)
      expect(store.appointments[0].notes).toBe('Updated notes')
      expect(store.currentAppointment).toEqual(updatedAppointment)
      expect(result).toEqual(updatedAppointment)
    })

    it('should handle update errors', async () => {
      vi.mocked(appointmentService.updateAppointment).mockRejectedValueOnce({
        response: { data: { message: 'Update failed' } },
      })

      const store = useAppointmentStore()

      await expect(
        store.updateAppointment(1, { id: 1, notes: 'Test' })
      ).rejects.toThrow()
      expect(store.error).toBe('Update failed')
    })
  })

  describe('cancelAppointment', () => {
    it('should cancel an appointment successfully', async () => {
      const cancelledAppointment = {
        ...mockAppointment,
        status: AppointmentStatus.CANCELLED,
        cancellation_reason: 'Patient request',
      }
      vi.mocked(appointmentService.cancelAppointment).mockResolvedValueOnce(cancelledAppointment)

      const store = useAppointmentStore()
      store.appointments = [mockAppointment]

      const result = await store.cancelAppointment(1, 'Patient request')

      expect(appointmentService.cancelAppointment).toHaveBeenCalledWith(1, 'Patient request')
      expect(store.appointments[0].status).toBe(AppointmentStatus.CANCELLED)
      expect(result.status).toBe(AppointmentStatus.CANCELLED)
    })

    it('should update currentAppointment if it matches', async () => {
      const cancelledAppointment = {
        ...mockAppointment,
        status: AppointmentStatus.CANCELLED,
      }
      vi.mocked(appointmentService.cancelAppointment).mockResolvedValueOnce(cancelledAppointment)

      const store = useAppointmentStore()
      store.currentAppointment = mockAppointment

      await store.cancelAppointment(1, 'Reason')

      expect(store.currentAppointment?.status).toBe(AppointmentStatus.CANCELLED)
    })
  })

  describe('rescheduleAppointment', () => {
    it('should reschedule an appointment successfully', async () => {
      const rescheduledAppointment = {
        ...mockAppointment,
        status: AppointmentStatus.RESCHEDULED,
        appointment_date: '2026-04-20',
        appointment_time: '14:00:00',
        rescheduling_reason: 'Doctor unavailable',
      }
      vi.mocked(appointmentService.rescheduleAppointment).mockResolvedValueOnce(rescheduledAppointment)

      const store = useAppointmentStore()
      store.appointments = [mockAppointment]

      const result = await store.rescheduleAppointment(
        1,
        '2026-04-20',
        '14:00',
        'Doctor unavailable'
      )

      expect(appointmentService.rescheduleAppointment).toHaveBeenCalledWith(
        1,
        '2026-04-20',
        '14:00',
        'Doctor unavailable'
      )
      expect(store.appointments[0].status).toBe(AppointmentStatus.RESCHEDULED)
      expect(result.rescheduling_reason).toBe('Doctor unavailable')
    })
  })

  describe('confirmAppointment', () => {
    it('should confirm an appointment successfully', async () => {
      const confirmedAppointment = {
        ...mockAppointment,
        status: AppointmentStatus.CONFIRMED,
      }
      vi.mocked(appointmentService.confirmAppointment).mockResolvedValueOnce(confirmedAppointment)

      const store = useAppointmentStore()
      store.appointments = [mockAppointment]

      const result = await store.confirmAppointment(1)

      expect(appointmentService.confirmAppointment).toHaveBeenCalledWith(1)
      expect(store.appointments[0].status).toBe(AppointmentStatus.CONFIRMED)
      expect(result.status).toBe(AppointmentStatus.CONFIRMED)
    })
  })

  describe('checkInAppointment', () => {
    it('should check-in an appointment and create a visit', async () => {
      const checkInResponse: CheckInResponse = {
        appointment: {
          ...mockAppointment,
          status: AppointmentStatus.COMPLETED,
          visit_id: 1,
        },
        visit: mockVisit,
      }
      vi.mocked(appointmentService.checkInAppointment).mockResolvedValueOnce(checkInResponse)

      const store = useAppointmentStore()
      store.appointments = [mockAppointment]

      const result = await store.checkInAppointment(1)

      expect(appointmentService.checkInAppointment).toHaveBeenCalledWith(1)
      expect(result.appointment.status).toBe(AppointmentStatus.COMPLETED)
      expect(result.visit.id).toBe(1)
      expect(store.appointments[0].status).toBe(AppointmentStatus.COMPLETED)
    })
  })

  describe('setSearch', () => {
    it('should update the search filter', () => {
      const store = useAppointmentStore()
      store.setSearch('John')

      expect(store.filters.search).toBe('John')
    })
  })

  describe('setFilters', () => {
    it('should update the appointment filters', () => {
      const store = useAppointmentStore()
      store.setFilters({
        status: AppointmentStatus.SCHEDULED,
        type: AppointmentType.CONSULTATION,
        doctor_id: 1,
        start: '2026-04-01',
        end: '2026-04-30',
      })

      expect(store.appointmentFilters.status).toBe(AppointmentStatus.SCHEDULED)
      expect(store.filters.status).toBe(AppointmentStatus.SCHEDULED)
      expect(store.filters.type).toBe(AppointmentType.CONSULTATION)
      expect(store.filters.doctor_id).toBe(1)
      expect(store.filters.start).toBe('2026-04-01')
    })
  })

  describe('resetState', () => {
    it('should reset all state to initial values', () => {
      const store = useAppointmentStore()
      store.appointments = [mockAppointment]
      store.currentAppointment = mockAppointment
      store.filters = { search: 'test' }
      store.pagination = { page: 5, pageSize: 20, total: 100, pages: 10 }
      store.isLoading = true
      store.error = 'Some error'

      store.resetState()

      expect(store.appointments).toEqual([])
      expect(store.currentAppointment).toBeNull()
      expect(store.filters).toEqual({})
      expect(store.pagination).toEqual({ page: 1, pageSize: 10, total: 0, pages: 0 })
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('network error scenarios', () => {
    it('should handle network timeout', async () => {
      vi.mocked(appointmentService.getAppointments).mockImplementationOnce(
        () => new Promise((_, reject) => {
          setTimeout(() => reject({ response: { data: { message: 'Network timeout' } } }), 50)
        })
      )

      const store = useAppointmentStore()

      await expect(store.fetchAppointments()).rejects.toThrow()
      expect(store.error).toBe('Network timeout')
      expect(store.isLoading).toBe(false)
    })

    it('should handle network error with no response', async () => {
      vi.mocked(appointmentService.getAppointments).mockRejectedValueOnce(
        new Error('Network Error')
      )

      const store = useAppointmentStore()

      await expect(store.fetchAppointments()).rejects.toThrow()
      expect(store.error).toBe('Network Error')
    })

    it('should handle server error with generic message', async () => {
      vi.mocked(appointmentService.getAppointments).mockRejectedValueOnce({})

      const store = useAppointmentStore()

      await expect(store.fetchAppointments()).rejects.toThrow()
      expect(store.error).toBe('Failed to fetch appointments')
    })
  })
})
