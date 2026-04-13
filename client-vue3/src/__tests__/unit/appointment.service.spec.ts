/**
 * Appointment Service Unit Tests
 *
 * Tests all appointment service API methods by mocking the apiClient.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as appointmentService from '@/services/appointment.service'
import { apiClient } from '@/services/api'
import type {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  CheckInResponse,
} from '@/types/appointment'
import type { Visit } from '@/types/visit'
import type { PaginatedResultAlt, SuccessResponse, AppointmentQueryParams } from '@/types/api'
import { Gender, PatientStatus, PatientAccountStatus, PatientType } from '@/types'
import { AppointmentStatus, AppointmentType } from '@/types/appointment'
import { StaffStatus } from '@/types/employee'
import { VisitCategory, VisitStatus } from '@/types/visit'

// Mock the apiClient
vi.mock('@/services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
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
  reason_for_visit: 'Chest pain',
  patient: mockPatient,
  doctor: mockDoctor,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const mockPaginatedResult: PaginatedResultAlt<Appointment> = {
  rows: [mockAppointment],
  count: 1,
  pages: 1,
  currentPage: 1,
  pageLimit: 10,
}

const mockSuccessResponse = <T>(data: T): SuccessResponse<T> => ({
  status: 'success',
  message: 'Operation successful',
  data,
})

describe('Appointment Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAppointments', () => {
    it('should fetch appointments with pagination', async () => {
      const params: AppointmentQueryParams = {
        currentPage: 1,
        pageLimit: 10,
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockSuccessResponse(mockPaginatedResult),
      })

      const result = await appointmentService.getAppointments(params)

      expect(apiClient.get).toHaveBeenCalledWith('/api/appointments/get', { params })
      expect(result).toEqual(mockPaginatedResult)
      expect(result.rows).toHaveLength(1)
      expect(result.count).toBe(1)
    })

    it('should fetch appointments with status filter', async () => {
      const params: AppointmentQueryParams = {
        currentPage: 1,
        pageLimit: 10,
        status: AppointmentStatus.SCHEDULED,
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockSuccessResponse(mockPaginatedResult),
      })

      const result = await appointmentService.getAppointments(params)

      expect(apiClient.get).toHaveBeenCalledWith('/api/appointments/get', { params })
      expect(result.rows[0].status).toBe(AppointmentStatus.SCHEDULED)
    })

    it('should fetch appointments with type filter', async () => {
      const params: AppointmentQueryParams = {
        currentPage: 1,
        pageLimit: 10,
        type: AppointmentType.CONSULTATION,
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockSuccessResponse(mockPaginatedResult),
      })

      const result = await appointmentService.getAppointments(params)

      expect(apiClient.get).toHaveBeenCalledWith('/api/appointments/get', { params })
      expect(result.rows[0].type).toBe(AppointmentType.CONSULTATION)
    })

    it('should fetch appointments with doctor_id filter', async () => {
      const params: AppointmentQueryParams = {
        currentPage: 1,
        pageLimit: 10,
        doctor_id: 1,
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockSuccessResponse(mockPaginatedResult),
      })

      const result = await appointmentService.getAppointments(params)

      expect(apiClient.get).toHaveBeenCalledWith('/api/appointments/get', { params })
    })

    it('should fetch appointments with date range', async () => {
      const params: AppointmentQueryParams = {
        currentPage: 1,
        pageLimit: 10,
        start: '2026-04-01',
        end: '2026-04-30',
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockSuccessResponse(mockPaginatedResult),
      })

      const result = await appointmentService.getAppointments(params)

      expect(apiClient.get).toHaveBeenCalledWith('/api/appointments/get', { params })
    })

    it('should return empty rows when no appointments found', async () => {
      const emptyResult: PaginatedResultAlt<Appointment> = {
        rows: [],
        count: 0,
        pages: 0,
        currentPage: 1,
        pageLimit: 10,
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockSuccessResponse(emptyResult),
      })

      const result = await appointmentService.getAppointments({})

      expect(result.rows).toEqual([])
      expect(result.count).toBe(0)
    })

    it('should handle fetch errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce({
        response: { data: { message: 'Failed to fetch' } },
      })

      await expect(appointmentService.getAppointments({})).rejects.toThrow()
    })
  })

  describe('getAppointmentById', () => {
    it('should fetch a single appointment by ID', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockSuccessResponse(mockAppointment),
      })

      const result = await appointmentService.getAppointmentById(1)

      expect(apiClient.get).toHaveBeenCalledWith('/api/appointments/1')
      expect(result).toEqual(mockAppointment)
      expect(result.id).toBe(1)
    })

    it('should handle not found errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce({
        response: { data: { message: 'Appointment not found' }, httpCode: 404 },
      })

      await expect(appointmentService.getAppointmentById(999)).rejects.toThrow()
    })
  })

  describe('createAppointment', () => {
    it('should create an appointment successfully', async () => {
      const createData: CreateAppointmentRequest = {
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2026-04-15',
        appointment_time: '10:00',
        type: AppointmentType.CONSULTATION,
        department: 'Cardiology',
        professional: 'Dr. Smith Johnson',
        duration_minutes: 30,
        reason_for_visit: 'Chest pain',
        notes: 'Initial consultation',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockSuccessResponse(mockAppointment),
      })

      const result = await appointmentService.createAppointment(createData)

      expect(apiClient.post).toHaveBeenCalledWith('/api/appointments/create', createData)
      expect(result).toEqual(mockAppointment)
    })

    it('should handle creation errors', async () => {
      const createData: CreateAppointmentRequest = {
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2026-04-15',
        appointment_time: '10:00',
        type: AppointmentType.CONSULTATION,
        department: 'Cardiology',
        professional: 'Dr. Smith Johnson',
      }

      vi.mocked(apiClient.post).mockRejectedValueOnce({
        response: { data: { message: 'Validation failed' } },
      })

      await expect(appointmentService.createAppointment(createData)).rejects.toThrow()
    })
  })

  describe('updateAppointment', () => {
    it('should update an appointment successfully', async () => {
      const updateData: UpdateAppointmentRequest = {
        id: 1,
        notes: 'Updated notes',
      }

      const updatedAppointment = { ...mockAppointment, notes: 'Updated notes' }

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: mockSuccessResponse(updatedAppointment),
      })

      const result = await appointmentService.updateAppointment(1, updateData)

      expect(apiClient.put).toHaveBeenCalledWith('/api/appointments/1', updateData)
      expect(result.notes).toBe('Updated notes')
    })
  })

  describe('cancelAppointment', () => {
    it('should cancel an appointment successfully', async () => {
      const cancelledAppointment = {
        ...mockAppointment,
        status: AppointmentStatus.CANCELLED,
        cancelled_at: new Date(),
        cancelled_by: 1,
        cancellation_reason: 'Patient request',
      }

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: mockSuccessResponse(cancelledAppointment),
      })

      const result = await appointmentService.cancelAppointment(1, 'Patient request')

      expect(apiClient.put).toHaveBeenCalledWith('/api/appointments/1/cancel', {
        cancellation_reason: 'Patient request',
      })
      expect(result.status).toBe(AppointmentStatus.CANCELLED)
      expect(result.cancellation_reason).toBe('Patient request')
    })

    it('should handle cancellation errors', async () => {
      vi.mocked(apiClient.put).mockRejectedValueOnce({
        response: { data: { message: 'Cannot cancel completed appointment' } },
      })

      await expect(
        appointmentService.cancelAppointment(1, 'Reason')
      ).rejects.toThrow()
    })
  })

  describe('rescheduleAppointment', () => {
    it('should reschedule an appointment successfully', async () => {
      const rescheduledAppointment = {
        ...mockAppointment,
        status: AppointmentStatus.RESCHEDULED,
        appointment_date: '2026-04-20',
        appointment_time: '14:00:00',
        rescheduled_at: new Date(),
        rescheduled_by: 1,
        rescheduling_reason: 'Doctor unavailable',
      }

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: mockSuccessResponse(rescheduledAppointment),
      })

      const result = await appointmentService.rescheduleAppointment(
        1,
        '2026-04-20',
        '14:00',
        'Doctor unavailable'
      )

      expect(apiClient.put).toHaveBeenCalledWith('/api/appointments/1/reschedule', {
        appointment_date: '2026-04-20',
        appointment_time: '14:00',
        rescheduling_reason: 'Doctor unavailable',
      })
      expect(result.status).toBe(AppointmentStatus.RESCHEDULED)
      expect(result.rescheduling_reason).toBe('Doctor unavailable')
    })
  })

  describe('confirmAppointment', () => {
    it('should confirm an appointment successfully', async () => {
      const confirmedAppointment = {
        ...mockAppointment,
        status: AppointmentStatus.CONFIRMED,
        confirmed_at: new Date(),
        confirmed_by: 1,
      }

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: mockSuccessResponse(confirmedAppointment),
      })

      const result = await appointmentService.confirmAppointment(1)

      expect(apiClient.put).toHaveBeenCalledWith('/api/appointments/1/confirm', {})
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

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockSuccessResponse(checkInResponse),
      })

      const result = await appointmentService.checkInAppointment(1)

      expect(apiClient.post).toHaveBeenCalledWith('/api/appointments/1/check-in', {})
      expect(result.appointment.status).toBe(AppointmentStatus.COMPLETED)
      expect(result.visit.id).toBe(1)
      expect(result.visit.is_from_appointment).toBe(true)
    })

    it('should handle check-in errors', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce({
        response: { data: { message: 'Appointment already checked in' } },
      })

      await expect(appointmentService.checkInAppointment(1)).rejects.toThrow()
    })
  })
})
