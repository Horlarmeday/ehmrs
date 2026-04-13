/**
 * Patient Service Unit Tests
 *
 * Tests all patient service API methods by mocking the apiClient.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as patientService from '@/services/patient.service'
import { apiClient } from '@/services/api'
import type { Patient, CreatePatientRequest, UpdatePatientRequest } from '@/types/patient'
import type { PaginatedResult, SuccessResponse, PatientQueryParams } from '@/types/api'
import { Gender, PatientStatus, PatientAccountStatus, PatientType } from '@/types'

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
const mockPatient: Patient = {
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

const mockPaginatedResult: PaginatedResult<Patient> = {
  docs: [mockPatient],
  total: 1,
  pages: 1,
  perPage: 10,
  currentPage: 1,
}

const mockSuccessResponse = <T>(data: T): SuccessResponse<T> => ({
  status: 'success',
  message: 'Operation successful',
  data,
})

describe('Patient Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPatient', () => {
    it('should create a patient successfully', async () => {
      const createData: CreatePatientRequest = {
        firstname: 'John',
        lastname: 'Doe',
        gender: Gender.MALE,
        date_of_birth: '1990-01-15',
        phone: '08012345678',
        address: '123 Test Street',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockSuccessResponse(mockPatient),
      })

      const result = await patientService.createPatient(createData)

      expect(apiClient.post).toHaveBeenCalledWith('/api/patients/create', createData)
      expect(result).toEqual(mockPatient)
    })

    it('should handle creation errors', async () => {
      const createData: CreatePatientRequest = {
        firstname: 'John',
        lastname: 'Doe',
        gender: Gender.MALE,
        date_of_birth: '1990-01-15',
        phone: '08012345678',
        address: '123 Test Street',
      }

      vi.mocked(apiClient.post).mockRejectedValueOnce({
        response: { data: { message: 'Validation failed' } },
      })

      await expect(patientService.createPatient(createData)).rejects.toThrow()
    })
  })

  describe('createEmergencyPatient', () => {
    it('should create an emergency patient successfully', async () => {
      const emergencyData = {
        firstname: 'Jane',
        lastname: 'Doe',
        gender: Gender.FEMALE,
        phone: '08012345678',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockSuccessResponse(mockPatient),
      })

      const result = await patientService.createEmergencyPatient(emergencyData)

      expect(apiClient.post).toHaveBeenCalledWith('/api/patients/create/emergency', emergencyData)
      expect(result).toEqual(mockPatient)
    })
  })

  describe('createDependantPatient', () => {
    it('should create a dependant patient successfully', async () => {
      const createData: CreatePatientRequest = {
        firstname: 'Jane',
        lastname: 'Doe',
        gender: Gender.FEMALE,
        date_of_birth: '1995-05-20',
        phone: '08012345678',
        address: '123 Test Street',
        patient_type: PatientType.DEPENDANT,
        principal_id: 1,
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockSuccessResponse(mockPatient),
      })

      const result = await patientService.createDependantPatient(1, createData)

      expect(apiClient.post).toHaveBeenCalledWith('/api/patients/create/dependant/1', createData)
      expect(result).toEqual(mockPatient)
    })
  })

  describe('getPatients', () => {
    it('should fetch patients with pagination', async () => {
      const params: PatientQueryParams = {
        currentPage: 1,
        pageLimit: 10,
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockSuccessResponse(mockPaginatedResult),
      })

      const result = await patientService.getPatients(params)

      expect(apiClient.get).toHaveBeenCalledWith('/api/patients/get', { params })
      expect(result).toEqual(mockPaginatedResult)
    })

    it('should fetch patients with search params', async () => {
      const params: PatientQueryParams = {
        currentPage: 1,
        pageLimit: 10,
        search: 'John',
        patient_status: PatientStatus.OUTPATIENT,
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockSuccessResponse(mockPaginatedResult),
      })

      const result = await patientService.getPatients(params)

      expect(apiClient.get).toHaveBeenCalledWith('/api/patients/get', { params })
      expect(result).toEqual(mockPaginatedResult)
    })

    it('should return empty array when no patients found', async () => {
      const emptyResult: PaginatedResult<Patient> = {
        docs: [],
        total: 0,
        pages: 0,
        perPage: 10,
        currentPage: 1,
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockSuccessResponse(emptyResult),
      })

      const result = await patientService.getPatients({})

      expect(result.docs).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('getPatientById', () => {
    it('should fetch a single patient by ID', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockSuccessResponse(mockPatient),
      })

      const result = await patientService.getPatientById(1)

      expect(apiClient.get).toHaveBeenCalledWith('/api/patients/get/1')
      expect(result).toEqual(mockPatient)
    })
  })

  describe('getPatientProfile', () => {
    it('should fetch patient profile with insurance', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockSuccessResponse(mockPatient),
      })

      const result = await patientService.getPatientProfile(1)

      expect(apiClient.get).toHaveBeenCalledWith('/api/patients/profile/get/1')
      expect(result).toEqual(mockPatient)
    })
  })

  describe('updatePatient', () => {
    it('should update a patient successfully', async () => {
      const updateData: UpdatePatientRequest = {
        id: 1,
        firstname: 'John Updated',
      }

      const updatedPatient = { ...mockPatient, firstname: 'John Updated' }

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: mockSuccessResponse(updatedPatient),
      })

      const result = await patientService.updatePatient(1, updateData)

      expect(apiClient.put).toHaveBeenCalledWith('/api/patients/update/1', { patient: updateData })
      expect(result.firstname).toBe('John Updated')
    })
  })

  describe('markPatientAsDeceased', () => {
    it('should mark a patient as deceased', async () => {
      const deceasedData = {
        date_of_death: '2024-01-15',
        cause_of_death: 'Natural causes',
      }

      const deceasedPatient = {
        ...mockPatient,
        patient_status: PatientStatus.DECEASED,
        date_of_death: new Date('2024-01-15'),
        cause_of_death: 'Natural causes',
      }

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: mockSuccessResponse(deceasedPatient),
      })

      const result = await patientService.markPatientAsDeceased(1, deceasedData)

      expect(apiClient.put).toHaveBeenCalledWith('/api/patients/mark-deceased/1', deceasedData)
      expect(result.patient_status).toBe(PatientStatus.DECEASED)
    })
  })

  describe('revivePatient', () => {
    it('should revive a deceased patient', async () => {
      const revivalData = {
        revival_reason: 'Administrative error',
      }

      const revivedPatient = {
        ...mockPatient,
        patient_status: PatientStatus.OUTPATIENT,
        revival_reason: 'Administrative error',
      }

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: mockSuccessResponse(revivedPatient),
      })

      const result = await patientService.revivePatient(1, revivalData)

      expect(apiClient.put).toHaveBeenCalledWith('/api/patients/revive/1', revivalData)
      expect(result.revival_reason).toBe('Administrative error')
    })
  })

  describe('getDeceasedPatients', () => {
    it('should fetch deceased patients with pagination', async () => {
      const deceasedPatient = {
        ...mockPatient,
        patient_status: PatientStatus.DECEASED,
      }

      const deceasedResult: PaginatedResult<Patient> = {
        docs: [deceasedPatient],
        total: 1,
        pages: 1,
        perPage: 10,
        currentPage: 1,
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockSuccessResponse(deceasedResult),
      })

      const result = await patientService.getDeceasedPatients({ currentPage: 1, pageLimit: 10 })

      expect(apiClient.get).toHaveBeenCalledWith('/api/patients/deceased', {
        params: { currentPage: 1, pageLimit: 10 },
      })
      expect(result.docs[0].patient_status).toBe(PatientStatus.DECEASED)
    })
  })
})
