/**
 * Patient Store Unit Tests
 *
 * Tests all patient store actions by mocking the patient service.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePatientStore } from '@/stores/patient.store'
import * as patientService from '@/services/patient.service'
import type { Patient, CreatePatientRequest, UpdatePatientRequest } from '@/types/patient'
import type { PatientQueryParams } from '@/types/api'
import { Gender, PatientStatus, PatientAccountStatus, PatientType } from '@/types'

// Mock the patient service
vi.mock('@/services/patient.service', () => ({
  getPatients: vi.fn(),
  getPatientById: vi.fn(),
  getPatientProfile: vi.fn(),
  createPatient: vi.fn(),
  createEmergencyPatient: vi.fn(),
  createDependantPatient: vi.fn(),
  updatePatient: vi.fn(),
  markPatientAsDeceased: vi.fn(),
  revivePatient: vi.fn(),
  getDeceasedPatients: vi.fn(),
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

const mockPaginatedResult = {
  docs: [mockPatient],
  total: 1,
  pages: 1,
  perPage: 10,
  currentPage: 1,
}

describe('Patient Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = usePatientStore()

      expect(store.patients).toEqual([])
      expect(store.currentPatient).toBeNull()
      expect(store.currentPatientProfile).toBeNull()
      expect(store.filters).toEqual({})
      expect(store.pagination.page).toBe(1)
      expect(store.pagination.pageSize).toBe(10)
      expect(store.pagination.total).toBe(0)
      expect(store.deceasedPagination.page).toBe(1)
      expect(store.deceasedPagination.pageSize).toBe(10)
      expect(store.deceasedPagination.total).toBe(0)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('getters', () => {
    it('hasPatients should return true when patients exist', () => {
      const store = usePatientStore()
      store.patients = [mockPatient]

      expect(store.hasPatients).toBe(true)
    })

    it('hasPatients should return false when no patients', () => {
      const store = usePatientStore()

      expect(store.hasPatients).toBe(false)
    })

    it('totalPages should return correct page count', () => {
      const store = usePatientStore()
      store.pagination.pages = 5

      expect(store.totalPages).toBe(5)
    })
  })

  describe('fetchPatients', () => {
    it('should fetch patients successfully', async () => {
      vi.mocked(patientService.getPatients).mockResolvedValueOnce(mockPaginatedResult)

      const store = usePatientStore()
      await store.fetchPatients({ currentPage: 1, pageLimit: 10 })

      expect(patientService.getPatients).toHaveBeenCalledWith({
        currentPage: 1,
        pageLimit: 10,
      })
      expect(store.patients).toEqual([mockPatient])
      expect(store.pagination.total).toBe(1)
      expect(store.pagination.pages).toBe(1)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      vi.mocked(patientService.getPatients).mockRejectedValueOnce({
        response: { data: { message: 'Failed to fetch' } },
      })

      const store = usePatientStore()

      await expect(store.fetchPatients()).rejects.toThrow()
      expect(store.error).toBe('Failed to fetch')
      expect(store.isLoading).toBe(false)
    })

    it('should set loading state during fetch', async () => {
      vi.mocked(patientService.getPatients).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve(mockPaginatedResult), 10))
      )

      const store = usePatientStore()
      const fetchPromise = store.fetchPatients()

      expect(store.isLoading).toBe(true)

      await fetchPromise
      expect(store.isLoading).toBe(false)
    })
  })

  describe('fetchPatientById', () => {
    it('should fetch a single patient successfully', async () => {
      vi.mocked(patientService.getPatientById).mockResolvedValueOnce(mockPatient)

      const store = usePatientStore()
      const result = await store.fetchPatientById(1)

      expect(patientService.getPatientById).toHaveBeenCalledWith(1)
      expect(store.currentPatient).toEqual(mockPatient)
      expect(result).toEqual(mockPatient)
    })

    it('should handle fetch errors', async () => {
      vi.mocked(patientService.getPatientById).mockRejectedValueOnce({
        response: { data: { message: 'Patient not found' } },
      })

      const store = usePatientStore()

      await expect(store.fetchPatientById(999)).rejects.toThrow()
      expect(store.error).toBe('Patient not found')
    })
  })

  describe('fetchPatientProfile', () => {
    it('should fetch patient profile successfully', async () => {
      vi.mocked(patientService.getPatientProfile).mockResolvedValueOnce(mockPatient)

      const store = usePatientStore()
      const result = await store.fetchPatientProfile(1)

      expect(patientService.getPatientProfile).toHaveBeenCalledWith(1)
      expect(store.currentPatientProfile).toEqual(mockPatient)
      expect(store.currentPatient).toEqual(mockPatient)
      expect(result).toEqual(mockPatient)
    })
  })

  describe('createPatient', () => {
    it('should create a patient successfully', async () => {
      vi.mocked(patientService.createPatient).mockResolvedValueOnce(mockPatient)

      const createData: CreatePatientRequest = {
        firstname: 'John',
        lastname: 'Doe',
        gender: Gender.MALE,
        date_of_birth: '1990-01-15',
        phone: '08012345678',
        address: '123 Test Street',
      }

      const store = usePatientStore()
      const result = await store.createPatient(createData)

      expect(patientService.createPatient).toHaveBeenCalledWith(createData)
      expect(store.currentPatient).toEqual(mockPatient)
      expect(result).toEqual(mockPatient)
    })

    it('should handle creation errors', async () => {
      vi.mocked(patientService.createPatient).mockRejectedValueOnce({
        response: { data: { message: 'Validation failed' } },
      })

      const store = usePatientStore()

      await expect(
        store.createPatient({
          firstname: '',
          lastname: '',
          gender: Gender.MALE,
          date_of_birth: '',
          phone: '',
          address: '',
        })
      ).rejects.toThrow()
      expect(store.error).toBe('Validation failed')
    })
  })

  describe('createEmergencyPatient', () => {
    it('should create an emergency patient successfully', async () => {
      vi.mocked(patientService.createEmergencyPatient).mockResolvedValueOnce(mockPatient)

      const emergencyData = {
        firstname: 'Jane',
        lastname: 'Doe',
        gender: Gender.FEMALE,
        phone: '08012345678',
      }

      const store = usePatientStore()
      const result = await store.createEmergencyPatient(emergencyData)

      expect(patientService.createEmergencyPatient).toHaveBeenCalledWith(emergencyData)
      expect(store.currentPatient).toEqual(mockPatient)
      expect(result).toEqual(mockPatient)
    })
  })

  describe('createDependantPatient', () => {
    it('should create a dependant patient successfully', async () => {
      vi.mocked(patientService.createDependantPatient).mockResolvedValueOnce(mockPatient)

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

      const store = usePatientStore()
      const result = await store.createDependantPatient(1, createData)

      expect(patientService.createDependantPatient).toHaveBeenCalledWith(1, createData)
      expect(store.currentPatient).toEqual(mockPatient)
      expect(result).toEqual(mockPatient)
    })
  })

  describe('updatePatient', () => {
    it('should update a patient successfully', async () => {
      const updatedPatient = { ...mockPatient, firstname: 'John Updated' }
      vi.mocked(patientService.updatePatient).mockResolvedValueOnce(updatedPatient)

      const updateData: UpdatePatientRequest = {
        id: 1,
        firstname: 'John Updated',
      }

      const store = usePatientStore()
      store.patients = [mockPatient]

      const result = await store.updatePatient(1, updateData)

      expect(patientService.updatePatient).toHaveBeenCalledWith(1, updateData)
      expect(store.patients[0].firstname).toBe('John Updated')
      expect(store.currentPatient).toEqual(updatedPatient)
      expect(result).toEqual(updatedPatient)
    })

    it('should handle update errors', async () => {
      vi.mocked(patientService.updatePatient).mockRejectedValueOnce({
        response: { data: { message: 'Update failed' } },
      })

      const store = usePatientStore()

      await expect(
        store.updatePatient(1, { id: 1, firstname: 'Test' })
      ).rejects.toThrow()
      expect(store.error).toBe('Update failed')
    })
  })

  describe('markPatientAsDeceased', () => {
    it('should mark a patient as deceased', async () => {
      const deceasedPatient = {
        ...mockPatient,
        patient_status: PatientStatus.DECEASED,
      }
      vi.mocked(patientService.markPatientAsDeceased).mockResolvedValueOnce(deceasedPatient)

      const store = usePatientStore()
      store.patients = [mockPatient]

      const result = await store.markPatientAsDeceased(1, {
        date_of_death: '2024-01-15',
        cause_of_death: 'Natural causes',
      })

      expect(patientService.markPatientAsDeceased).toHaveBeenCalledWith(1, {
        date_of_death: '2024-01-15',
        cause_of_death: 'Natural causes',
      })
      expect(store.patients[0].patient_status).toBe(PatientStatus.DECEASED)
      expect(result.patient_status).toBe(PatientStatus.DECEASED)
    })
  })

  describe('revivePatient', () => {
    it('should revive a deceased patient', async () => {
      const revivedPatient = {
        ...mockPatient,
        patient_status: PatientStatus.OUTPATIENT,
        revival_reason: 'Administrative error',
      }
      vi.mocked(patientService.revivePatient).mockResolvedValueOnce(revivedPatient)

      const store = usePatientStore()
      store.patients = [{ ...mockPatient, patient_status: PatientStatus.DECEASED }]

      const result = await store.revivePatient(1, {
        revival_reason: 'Administrative error',
      })

      expect(patientService.revivePatient).toHaveBeenCalledWith(1, {
        revival_reason: 'Administrative error',
      })
      expect(store.patients[0].patient_status).toBe(PatientStatus.OUTPATIENT)
      expect(result.revival_reason).toBe('Administrative error')
    })
  })

  describe('fetchDeceasedPatients', () => {
    it('should fetch deceased patients with pagination', async () => {
      const deceasedPatient = {
        ...mockPatient,
        patient_status: PatientStatus.DECEASED,
      }

      const deceasedResult = {
        docs: [deceasedPatient],
        total: 1,
        pages: 1,
        perPage: 10,
        currentPage: 1,
      }

      vi.mocked(patientService.getDeceasedPatients).mockResolvedValueOnce(deceasedResult)

      const store = usePatientStore()
      await store.fetchDeceasedPatients({ currentPage: 1, pageLimit: 10 })

      expect(patientService.getDeceasedPatients).toHaveBeenCalledWith({
        currentPage: 1,
        pageLimit: 10,
      })
      expect(store.patients[0].patient_status).toBe(PatientStatus.DECEASED)
      expect(store.deceasedPagination.total).toBe(1)
    })
  })

  describe('setSearch', () => {
    it('should update the search filter', () => {
      const store = usePatientStore()
      store.setSearch('John')

      expect(store.filters.search).toBe('John')
    })
  })

  describe('setFilters', () => {
    it('should update the patient filters', () => {
      const store = usePatientStore()
      store.setFilters({
        patient_status: PatientStatus.INPATIENT,
        start: '2024-01-01',
        end: '2024-12-31',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(store.patientFilters.patient_status).toBe(PatientStatus.INPATIENT)
      expect(store.filters.patient_status).toBe(PatientStatus.INPATIENT)
      expect(store.filters.start).toBe('2024-01-01')
      expect(store.filters.sortBy).toBe('createdAt')
    })
  })

  describe('resetState', () => {
    it('should reset all state to initial values', () => {
      const store = usePatientStore()
      store.patients = [mockPatient]
      store.currentPatient = mockPatient
      store.currentPatientProfile = mockPatient
      store.filters = { search: 'test' }
      store.pagination = { page: 5, pageSize: 20, total: 100, pages: 10 }
      store.isLoading = true
      store.error = 'Some error'

      store.resetState()

      expect(store.patients).toEqual([])
      expect(store.currentPatient).toBeNull()
      expect(store.currentPatientProfile).toBeNull()
      expect(store.filters).toEqual({})
      expect(store.pagination).toEqual({ page: 1, pageSize: 10, total: 0, pages: 0 })
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should reset deceasedPagination separately', () => {
      const store = usePatientStore()
      store.deceasedPagination = { page: 3, pageSize: 20, total: 50, pages: 3 }

      store.resetState()

      expect(store.deceasedPagination).toEqual({ page: 1, pageSize: 10, total: 0, pages: 0 })
    })

    it('should reset state during active fetch', async () => {
      vi.mocked(patientService.getPatients).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve(mockPaginatedResult), 100))
      )

      const store = usePatientStore()
      const fetchPromise = store.fetchPatients()

      // Reset state while fetch is in progress
      store.resetState()

      expect(store.patients).toEqual([])
      expect(store.isLoading).toBe(false)

      await fetchPromise
      // After fetch completes, isLoading should be false again
      expect(store.isLoading).toBe(false)
    })
  })

  describe('fetchPatientById edge cases', () => {
    it('should handle ID 0', async () => {
      vi.mocked(patientService.getPatientById).mockRejectedValueOnce({
        response: { data: { message: 'Patient not found' } },
      })

      const store = usePatientStore()

      await expect(store.fetchPatientById(0)).rejects.toThrow()
      expect(store.error).toBe('Patient not found')
    })

    it('should handle negative ID', async () => {
      vi.mocked(patientService.getPatientById).mockRejectedValueOnce({
        response: { data: { message: 'Patient not found' } },
      })

      const store = usePatientStore()

      await expect(store.fetchPatientById(-1)).rejects.toThrow()
      expect(store.error).toBe('Patient not found')
    })
  })

  describe('network error scenarios', () => {
    it('should handle network timeout', async () => {
      vi.mocked(patientService.getPatients).mockImplementationOnce(
        () => new Promise((_, reject) => {
          setTimeout(() => reject({ response: { data: { message: 'Network timeout' } } }), 50)
        })
      )

      const store = usePatientStore()

      await expect(store.fetchPatients()).rejects.toThrow()
      expect(store.error).toBe('Network timeout')
      expect(store.isLoading).toBe(false)
    })

    it('should handle network error with no response', async () => {
      vi.mocked(patientService.getPatients).mockRejectedValueOnce(
        new Error('Network Error')
      )

      const store = usePatientStore()

      await expect(store.fetchPatients()).rejects.toThrow()
      expect(store.error).toBe('Network Error')
    })

    it('should handle server error with generic message', async () => {
      vi.mocked(patientService.getPatients).mockRejectedValueOnce({})

      const store = usePatientStore()

      await expect(store.fetchPatients()).rejects.toThrow()
      expect(store.error).toBe('Failed to fetch patients')
    })
  })

  describe('deceasedPatients pagination isolation', () => {
    it('should maintain separate pagination for deceased patients', async () => {
      const deceasedPatient = {
        ...mockPatient,
        patient_status: PatientStatus.DECEASED,
      }

      const deceasedResult = {
        docs: [deceasedPatient],
        total: 5,
        pages: 1,
        perPage: 10,
        currentPage: 1,
      }

      vi.mocked(patientService.getDeceasedPatients).mockResolvedValueOnce(deceasedResult)

      const store = usePatientStore()
      // First set regular pagination
      store.pagination = { page: 3, pageSize: 20, total: 100, pages: 5 }

      await store.fetchDeceasedPatients({ currentPage: 1, pageLimit: 10 })

      // Regular pagination should be unchanged
      expect(store.pagination.page).toBe(3)
      expect(store.pagination.pageSize).toBe(20)

      // Deceased pagination should be updated
      expect(store.deceasedPagination.page).toBe(1)
      expect(store.deceasedPagination.total).toBe(5)
    })
  })
})
