import Joi from 'joi';
import { AppointmentStatus, AppointmentType } from '../../database/models/appointment';

export function validateCreateAppointment(appointment: any) {
  const schema = Joi.object({
    patient_id: Joi.number().required(),
    doctor_id: Joi.number().required(),
    appointment_date: Joi.date().required(),
    appointment_time: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    duration_minutes: Joi.number()
      .min(15)
      .max(240)
      .default(30),
    // Accept both field names for backward compatibility
    type: Joi.string()
      .valid(
        AppointmentType.CONSULTATION,
        AppointmentType.FOLLOW_UP,
        AppointmentType.PROCEDURE,
        AppointmentType.VACCINATION,
        AppointmentType.DIALYSIS,
        AppointmentType.ANTENATAL
      )
      .optional(),
    appointment_type: Joi.string()
      .valid(
        AppointmentType.CONSULTATION,
        AppointmentType.FOLLOW_UP,
        AppointmentType.PROCEDURE,
        AppointmentType.VACCINATION,
        AppointmentType.DIALYSIS,
        AppointmentType.ANTENATAL
      )
      .optional(),
    department: Joi.string().required(),
    professional: Joi.string().optional(), // Make optional, will be auto-populated
    priority: Joi.string()
      .allow('')
      .optional(),
    notes: Joi.string()
      .allow('')
      .optional(),
    reason_for_visit: Joi.string()
      .allow('')
      .optional(),
    scheduled_by: Joi.number().required(),
  }).custom((value, helpers) => {
    // Ensure at least one of type or appointment_type is provided
    if (!value.type && !value.appointment_type) {
      return helpers.error('any.required');
    }
    // Use appointment_type if provided, otherwise use type
    if (value.appointment_type) {
      value.type = value.appointment_type;
    }
    return value;
  });

  return schema.validate(appointment);
}

export function validateUpdateAppointment(appointment: any) {
  const schema = Joi.object({
    doctor_id: Joi.number().optional(),
    appointment_date: Joi.date().optional(),
    appointment_time: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    duration_minutes: Joi.number()
      .min(15)
      .max(240)
      .optional(),
    type: Joi.string()
      .valid(
        AppointmentType.CONSULTATION,
        AppointmentType.FOLLOW_UP,
        AppointmentType.PROCEDURE,
        AppointmentType.VACCINATION,
        AppointmentType.DIALYSIS,
        AppointmentType.ANTENATAL
      )
      .optional(),
    department: Joi.string().optional(),
    professional: Joi.string().optional(),
    priority: Joi.string()
      .allow('')
      .optional(),
    notes: Joi.string()
      .allow('')
      .optional(),
    reason_for_visit: Joi.string()
      .allow('')
      .optional(),
  });

  return schema.validate(appointment);
}

export function validateAppointmentFilters(filters: any) {
  const schema = Joi.object({
    patient_id: Joi.number().optional(),
    doctor_id: Joi.number().optional(),
    status: Joi.string()
      .valid(
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.NO_SHOW,
        AppointmentStatus.RESCHEDULED
      )
      .optional(),
    appointment_date: Joi.date().optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().when('start_date', {
      is: Joi.exist(),
      then: Joi.date()
        .min(Joi.ref('start_date'))
        .required(),
      otherwise: Joi.date().optional(),
    }),
    type: Joi.string()
      .valid(
        AppointmentType.CONSULTATION,
        AppointmentType.FOLLOW_UP,
        AppointmentType.PROCEDURE,
        AppointmentType.VACCINATION,
        AppointmentType.DIALYSIS,
        AppointmentType.ANTENATAL
      )
      .optional(),
    department: Joi.string().optional(),
  });

  return schema.validate(filters);
}

export function validateCancelAppointment(data: any) {
  const schema = Joi.object({
    cancelled_by: Joi.number().required(),
    cancellation_reason: Joi.string()
      .allow('')
      .optional(),
  });

  return schema.validate(data);
}

export function validateRescheduleAppointment(data: any) {
  const schema = Joi.object({
    appointment_date: Joi.date().required(),
    appointment_time: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    rescheduled_by: Joi.number().required(),
    rescheduling_reason: Joi.string()
      .allow('')
      .optional(),
  });

  return schema.validate(data);
}

export function validateConfirmAppointment(data: any) {
  const schema = Joi.object({
    confirmed_by: Joi.number().required(),
  });

  return schema.validate(data);
}

export function validateAvailabilityQuery(query: any) {
  const schema = Joi.object({
    doctor_id: Joi.number().required(),
    date: Joi.date().required(),
    duration_minutes: Joi.number()
      .min(15)
      .max(240)
      .default(30),
  });

  return schema.validate(query);
}
