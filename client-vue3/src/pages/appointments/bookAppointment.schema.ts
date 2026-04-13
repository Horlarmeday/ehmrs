/**
 * Book Appointment Validation Schema
 *
 * Shared Zod schema for BookAppointmentPage form validation.
 * Exported separately so tests can import it without loading the Vue component.
 */
import * as z from 'zod'
import { AppointmentType } from '@/types/appointment'

export const bookAppointmentSchema = z.object({
  patient_id: z.coerce.number().min(1, 'Patient is required'),
  doctor_id: z.coerce.number().min(1, 'Doctor is required'),
  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .refine(
      (val) => val >= new Date().toISOString().split('T')[0],
      'Date must be today or future'
    ),
  appointment_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  type: z.nativeEnum(AppointmentType),
  department: z.string().min(1, 'Department is required'),
  professional: z.string().min(1, 'Professional is required'),
  duration_minutes: z.coerce.number().min(15).max(240).default(30).optional(),
  priority: z.string().optional(),
  reason_for_visit: z.string().optional(),
  notes: z.string().optional(),
})
