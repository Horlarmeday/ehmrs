import Joi from 'joi';
import { AppointmentStatus, AppointmentType } from '../../database/models/appointment';
import {
  CreateAppointment,
  UpdateAppointment,
  AppointmentFilters as CoreAppointmentFilters,
  CancelAppointment,
  RescheduleAppointment,
  ConfirmAppointment,
} from './interfaces/appointment.interface';

// Extend core interfaces to accept backward-compatible field names and flexible date inputs
type CreateAppointmentInput = Omit<CreateAppointment, 'appointment_date' | 'type'> & {
  appointment_date: Date | string;
  type?: AppointmentType;
  appointment_type?: AppointmentType;
};

type UpdateAppointmentInput = Omit<UpdateAppointment, 'appointment_date'> & {
  appointment_date?: Date | string;
};

type AppointmentFiltersInput = CoreAppointmentFilters & {
  start?: Date | string;
  end?: Date | string;
  start_date?: Date | string;
  end_date?: Date | string;
  date_from?: Date | string;
  date_to?: Date | string;
  appointment_type?: AppointmentType;
};

export function validateCreateAppointment(appointment: CreateAppointmentInput) {
  const schema = Joi.object({
    patient_id: Joi.number().required(),
    doctor_id: Joi.number().required(),
    appointment_date: Joi.date().required(),
    appointment_time: Joi.string().required(),
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

export function validateUpdateAppointment(appointment: UpdateAppointmentInput) {
  const schema = Joi.object({
    doctor_id: Joi.number().optional(),
    appointment_date: Joi.date().optional(),
    appointment_time: Joi.string().optional(),
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

export function validateAppointmentFilters(filters: AppointmentFiltersInput) {
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
    // Accept either a single date or a range
    appointment_date: Joi.date().optional(),
    // Accept both new (start/end) and legacy (start_date/end_date, date_from/date_to)
    start: Joi.date().optional(),
    end: Joi.date().optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().optional(),
    date_from: Joi.date().optional(),
    date_to: Joi.date().optional(),
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
    // Accept both field names for backward compatibility
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
    department: Joi.string().optional(),
  }).custom((value, helpers) => {
    // Normalize type
    if (!value.type && value.appointment_type) {
      value.type = value.appointment_type;
    }

    // Normalize date range fields to start/end
    const normalizedStart = value.start || value.start_date || value.date_from;
    const normalizedEnd = value.end || value.end_date || value.date_to;

    if (normalizedStart) {
      value.start = normalizedStart;
    }
    if (normalizedEnd) {
      value.end = normalizedEnd;
    }

    if (value.start && value.end) {
      const startDate = new Date(value.start);
      const endDate = new Date(value.end);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return helpers.error('date.base');
      }
      if (endDate < startDate) {
        return helpers.error('date.min');
      }
    }

    return value;
  });

  return schema.validate(filters);
}

export function validateCancelAppointment(data: CancelAppointment) {
  const schema = Joi.object({
    cancelled_by: Joi.number().required(),
    cancellation_reason: Joi.string()
      .allow('')
      .optional(),
  });

  return schema.validate(data);
}

export function validateRescheduleAppointment(data: RescheduleAppointment) {
  const schema = Joi.object({
    appointment_date: Joi.date().required(),
    appointment_time: Joi.string().required(),
    rescheduled_by: Joi.number().required(),
    rescheduling_reason: Joi.string()
      .allow('')
      .optional(),
  });

  return schema.validate(data);
}

export function validateConfirmAppointment(data: ConfirmAppointment) {
  const schema = Joi.object({
    confirmed_by: Joi.number().required(),
  });

  return schema.validate(data);
}

export function validateAvailabilityQuery(query: {
  doctor_id: number;
  date: Date | string;
  duration_minutes?: number;
}) {
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

// Minimal validator for check-in endpoint body
// Accept only optional check_in_time in HH:mm or HH:mm:ss format.
// Disallow any other fields including scheduled_time.
export function validateCheckInBody(body: any) {
  const schema = Joi.object({
    check_in_time: Joi.string().optional(),
  }).unknown(false);

  return schema.validate(body);
}
