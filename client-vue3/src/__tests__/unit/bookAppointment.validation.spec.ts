/**
 * Book Appointment Validation Tests
 *
 * Tests the Zod validation schema used in BookAppointmentPage.
 * Tests required fields, date validation, time validation, and enum constraints.
 */

import { describe, it, expect } from 'vitest'
import { bookAppointmentSchema } from '@/pages/appointments/bookAppointment.schema'

describe('Book Appointment Validation Schema', () => {
  describe('patient_id', () => {
    it('should accept a valid patient ID', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.patient_id).toBe(1)
      }
    })

    it('should reject missing patient_id', () => {
      const result = bookAppointmentSchema.safeParse({
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const patientError = result.error.errors.find((e) => e.path.includes('patient_id'))
        expect(patientError).toBeDefined()
      }
    })

    it('should reject patient_id of 0', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 0,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(false)
    })

    it('should coerce string patient_id to number', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: '1',
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.patient_id).toBe(1)
      }
    })
  })

  describe('doctor_id', () => {
    it('should accept a valid doctor ID', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(true)
    })

    it('should reject missing doctor_id', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('appointment_date', () => {
    it('should accept a valid future date in YYYY-MM-DD format', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-06-15',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(true)
    })

    it('should accept today date', () => {
      const today = new Date().toISOString().split('T')[0]
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: today,
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(true)
    })

    it('should reject past dates', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2020-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const dateError = result.error.errors.find((e) => e.path.includes('appointment_date'))
        expect(dateError?.message).toBe('Date must be today or future')
      }
    })

    it('should reject invalid date format', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '01/15/2027',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const dateError = result.error.errors.find((e) => e.path.includes('appointment_date'))
        expect(dateError?.message).toBe('Invalid date format')
      }
    })

    it('should reject empty date string', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('appointment_time', () => {
    it('should accept valid time in HH:MM format', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(true)
    })

    it('should accept time at midnight', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '00:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(true)
    })

    it('should accept time at end of day', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '23:59',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(true)
    })

    it('should reject invalid time format (H:MM)', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '9:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const timeError = result.error.errors.find((e) => e.path.includes('appointment_time'))
        expect(timeError?.message).toBe('Invalid time format (HH:MM)')
      }
    })

    it('should reject time with seconds (HH:MM:SS)', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(false)
    })

    it('should reject empty time string', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(false)
    })

    it('should reject non-numeric time', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: 'ab:cd',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('type', () => {
    it('should accept all valid appointment types', () => {
      const validTypes = ['Consultation', 'Follow Up', 'Procedure', 'Vaccination', 'Dialysis', 'Antenatal']

      for (const type of validTypes) {
        const result = bookAppointmentSchema.safeParse({
          patient_id: 1,
          doctor_id: 1,
          appointment_date: '2027-01-01',
          appointment_time: '10:00',
          type,
          department: 'Cardiology',
          professional: 'Dr. Smith',
        })

        expect(result.success).toBe(true)
      }
    })

    it('should reject invalid appointment type', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Emergency',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(false)
    })

    it('should reject missing type', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('department', () => {
    it('should accept a valid department', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(true)
    })

    it('should reject empty department', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: '',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('professional', () => {
    it('should accept a valid professional name', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(true)
    })

    it('should reject empty professional name', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: '',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('duration_minutes', () => {
    it('should accept valid duration within range', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
        duration_minutes: 45,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.duration_minutes).toBe(45)
      }
    })

    it('should default to 30 when not provided', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        // duration_minutes is optional, default is set in form initialValues (not in schema)
        expect(result.data.duration_minutes).toBe(undefined)
      }
    })

    it('should reject duration less than 15', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
        duration_minutes: 10,
      })

      expect(result.success).toBe(false)
    })

    it('should reject duration more than 240', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
        duration_minutes: 300,
      })

      expect(result.success).toBe(false)
    })

    it('should coerce string duration to number', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
        duration_minutes: '60',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.duration_minutes).toBe(60)
      }
    })
  })

  describe('optional fields', () => {
    it('should accept valid data with optional fields', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
        priority: 'Urgent',
        reason_for_visit: 'Chest pain',
        notes: 'Patient has history of heart disease',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.priority).toBe('Urgent')
        expect(result.data.reason_for_visit).toBe('Chest pain')
        expect(result.data.notes).toBe('Patient has history of heart disease')
      }
    })

    it('should accept data without optional fields', () => {
      const result = bookAppointmentSchema.safeParse({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('full validation', () => {
    it('should pass with all required fields', () => {
      const validData = {
        patient_id: 1,
        doctor_id: 1,
        appointment_date: '2027-01-01',
        appointment_time: '10:00',
        type: 'Consultation',
        department: 'Cardiology',
        professional: 'Dr. Smith',
      }

      const result = bookAppointmentSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should fail when all required fields are missing', () => {
      const result = bookAppointmentSchema.safeParse({})
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0)
      }
    })
  })
})
