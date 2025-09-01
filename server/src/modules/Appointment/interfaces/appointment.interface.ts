import { AppointmentStatus, AppointmentType } from '../../../database/models/appointment';

export interface CreateAppointment {
  patient_id: number;
  doctor_id: number;
  appointment_date: Date;
  appointment_time: string;
  duration_minutes: number;
  type: AppointmentType;
  department: string;
  professional: string;
  priority?: string;
  notes?: string;
  reason_for_visit?: string;
  scheduled_by: number;
}

export interface UpdateAppointment {
  doctor_id?: number;
  appointment_date?: Date;
  appointment_time?: string;
  duration_minutes?: number;
  type?: AppointmentType;
  department?: string;
  professional?: string;
  priority?: string;
  notes?: string;
  reason_for_visit?: string;
}

export interface AppointmentFilters {
  patient_id?: number;
  doctor_id?: number;
  status?: AppointmentStatus;
  appointment_date?: Date;
  start_date?: Date;
  end_date?: Date;
  type?: AppointmentType;
  department?: string;
}

export interface AppointmentSearchParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filters?: AppointmentFilters;
}

export interface CancelAppointment {
  cancelled_by: number;
  cancellation_reason?: string;
}

export interface RescheduleAppointment {
  appointment_date: Date;
  appointment_time: string;
  rescheduled_by: number;
  rescheduling_reason?: string;
}

export interface ConfirmAppointment {
  confirmed_by: number;
}

export interface AppointmentSlot {
  date: string;
  time: string;
  available: boolean;
  appointment_id?: number;
}

export interface DoctorAvailability {
  doctor_id: number;
  date: string;
  slots: AppointmentSlot[];
  working_hours: {
    start: string;
    end: string;
    lunch_start?: string;
    lunch_end?: string;
  };
}

export interface AppointmentConflict {
  has_conflict: boolean;
  conflicting_appointments: {
    id: number;
    appointment_time: string;
    duration_minutes: number;
    patient_name: string;
  }[];
  suggested_slots?: AppointmentSlot[];
}