/* eslint-disable camelcase */

import { Op, WhereOptions } from 'sequelize';
import { Appointment, Patient, Staff, Visit } from '../../database/models';
import { AppointmentStatus, AppointmentType } from '../../database/models/appointment';
import {
  calcLimitAndOffset,
  dateIntervalQuery,
  patientAttributes,
  staffAttributes,
} from '../../core/helpers/helper';
import { CreateAppointment, AppointmentFilters } from './interfaces/appointment.interface';
import dayjs from 'dayjs';

/**
 * Create a new appointment
 * @param data - appointment data
 * @returns {Promise<Appointment>} created appointment
 */
export async function createAppointment(data: CreateAppointment): Promise<Appointment> {
  return Appointment.create(data as any);
}

/**
 * Get appointments with filters and pagination
 * @param query - query parameters
 * @returns {Promise<{count: number, rows: Appointment[]}>} appointments with pagination
 */
export async function getAppointments(query: any) {
  const {
    currentPage,
    pageLimit,
    search,
    start,
    end,
    filter,
    patient_id,
    doctor_id,
    status,
    type,
    department,
  } = query;

  const { limit, offset } = calcLimitAndOffset(currentPage, pageLimit);
  const where: WhereOptions = {};

  // Apply filters
  if (patient_id) where.patient_id = patient_id;
  if (doctor_id) where.doctor_id = doctor_id;
  if (status) where.status = status;
  if (type) where.type = type;
  if (department) where.department = { [Op.like]: `%${department}%` };

  // Date range filter
  if (start && end) {
    where.appointment_date = dateIntervalQuery('', start, end);
  } else if (filter === 'today') {
    const today = dayjs()
      .startOf('day')
      .toDate();

    const tomorrow = dayjs(today)
      .add(1, 'day')
      .toDate();
    where.appointment_date = { [Op.between]: [today, tomorrow] };
  }

  // Search functionality
  if (search) {
    const searchConditions = [
      { '$patient.firstname$': { [Op.like]: `%${search}%` } },
      { '$patient.lastname$': { [Op.like]: `%${search}%` } },
      { '$patient.phone$': { [Op.like]: `%${search}%` } },
      { '$doctor.firstname$': { [Op.like]: `%${search}%` } },
      { '$doctor.lastname$': { [Op.like]: `%${search}%` } },
      { reason_for_visit: { [Op.like]: `%${search}%` } },
      { notes: { [Op.like]: `%${search}%` } },
    ];
    (where as any)[Op.or] = searchConditions;
  }

  return Appointment.findAndCountAll({
    where,
    limit,
    offset,
    order: [
      ['appointment_date', 'DESC'],
      ['appointment_time', 'ASC'],
    ],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: patientAttributes,
      },
      {
        model: Staff,
        as: 'doctor',
        attributes: staffAttributes,
      },
      {
        model: Staff,
        as: 'scheduler',
        attributes: staffAttributes,
      },
      {
        model: Visit,
        as: 'visit',
        required: false,
      },
    ],
  });
}

/**
 * Get appointment by ID
 * @param id - appointment ID
 * @returns {Promise<Appointment | null>} appointment or null
 */
export async function getAppointmentById(id: number): Promise<Appointment | null> {
  return Appointment.findByPk(id, {
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: patientAttributes,
      },
      {
        model: Staff,
        as: 'doctor',
        attributes: staffAttributes,
      },
      {
        model: Staff,
        as: 'scheduler',
        attributes: staffAttributes,
      },
      {
        model: Staff,
        as: 'confirmer',
        attributes: staffAttributes,
        required: false,
      },
      {
        model: Staff,
        as: 'canceller',
        attributes: staffAttributes,
        required: false,
      },
      {
        model: Staff,
        as: 'rescheduler',
        attributes: staffAttributes,
        required: false,
      },
      {
        model: Visit,
        as: 'visit',
        required: false,
      },
    ],
  });
}

/**
 * Update appointment
 * @param id - appointment ID
 * @param data - update data
 * @returns {Promise<[number, Appointment[]]>} update result
 */
export async function updateAppointment(id: number, data: any): Promise<[number, Appointment[]]> {
  return Appointment.update(data, {
    where: { id },
    returning: true,
  });
}

/**
 * Delete appointment
 * @param id - appointment ID
 * @returns {Promise<number>} number of deleted rows
 */
export async function deleteAppointment(id: number): Promise<number> {
  return Appointment.destroy({ where: { id } });
}

/**
 * Get appointments by date
 * @param date - appointment date
 * @param filters - additional filters
 * @returns {Promise<Appointment[]>} appointments
 */
export async function getAppointmentsByDate(
  date: Date,
  filters: AppointmentFilters = {}
): Promise<Appointment[]> {
  const where: WhereOptions = {
    appointment_date: date,
    ...filters,
  };

  return Appointment.findAll({
    where,
    order: [['appointment_time', 'ASC']],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: patientAttributes,
      },
      {
        model: Staff,
        as: 'doctor',
        attributes: staffAttributes,
      },
    ],
  });
}

/**
 * Get appointments by doctor
 * @param doctorId - doctor ID
 * @param date - appointment date (optional)
 * @returns {Promise<Appointment[]>} appointments
 */
export async function getAppointmentsByDoctor(
  doctorId: number,
  date?: Date
): Promise<Appointment[]> {
  const where: WhereOptions = { doctor_id: doctorId };
  if (date) where.appointment_date = date;

  return Appointment.findAll({
    where,
    order: [
      ['appointment_date', 'ASC'],
      ['appointment_time', 'ASC'],
    ],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: patientAttributes,
      },
    ],
  });
}

/**
 * Get doctor availability for a specific date
 * @param doctorId - doctor ID
 * @param date - date to check
 * @returns {Promise<Appointment[]>} existing appointments
 */
export async function getDoctorAvailability(doctorId: number, date: Date): Promise<Appointment[]> {
  return Appointment.findAll({
    where: {
      doctor_id: doctorId,
      appointment_date: date,
      status: {
        [Op.in]: [
          AppointmentStatus.SCHEDULED,
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.RESCHEDULED,
        ],
      },
    },
    order: [['appointment_time', 'ASC']],
    attributes: ['id', 'appointment_time', 'duration_minutes'],
  });
}

/**
 * Check for appointment conflicts
 * @param doctorId - doctor ID
 * @param date - appointment date
 * @param startTime - appointment start time
 * @param duration - appointment duration in minutes
 * @param excludeId - appointment ID to exclude from conflict check
 * @returns {Promise<Appointment[]>} conflicting appointments
 */
export async function checkAppointmentConflicts(
  doctorId: number,
  date: Date,
  startTime: string,
  duration: number,
  excludeId?: number
): Promise<Appointment[]> {
  const where: WhereOptions = {
    doctor_id: doctorId,
    appointment_date: date,
    status: {
      [Op.in]: [
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.RESCHEDULED,
      ],
    },
  };

  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  return Appointment.findAll({
    where,
    attributes: ['id', 'appointment_time', 'duration_minutes'],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['firstname', 'lastname'],
      },
    ],
  });
}

/**
 * Get today's appointments
 * @param filters - additional filters
 * @returns {Promise<Appointment[]>} today's appointments
 */
export async function getTodaysAppointments(
  filters: AppointmentFilters = {}
): Promise<Appointment[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const where: WhereOptions = {
    appointment_date: { [Op.between]: [today, tomorrow] },
    ...filters,
  };

  return Appointment.findAll({
    where,
    order: [['appointment_time', 'ASC']],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: patientAttributes,
      },
      {
        model: Staff,
        as: 'doctor',
        attributes: staffAttributes,
      },
      {
        model: Visit,
        as: 'visit',
        required: false,
      },
    ],
  });
}

/**
 * Cancel appointment
 * @param id - appointment ID
 * @param cancelledBy - staff ID who cancelled
 * @param reason - cancellation reason
 * @returns {Promise<[number, Appointment[]]>} update result
 */
export async function cancelAppointment(
  id: number,
  cancelledBy: number,
  reason?: string
): Promise<[number, Appointment[]]> {
  return Appointment.update(
    {
      status: AppointmentStatus.CANCELLED,
      cancelled_at: new Date(),
      cancelled_by: cancelledBy,
      cancellation_reason: reason,
    },
    {
      where: { id },
      returning: true,
    }
  );
}

/**
 * Reschedule appointment
 * @param id - appointment ID
 * @param newDate - new appointment date
 * @param newTime - new appointment time
 * @param rescheduledBy - staff ID who rescheduled
 * @param reason - rescheduling reason
 * @returns {Promise<[number, Appointment[]]>} update result
 */
export async function rescheduleAppointment(
  id: number,
  newDate: Date,
  newTime: string,
  rescheduledBy: number,
  reason?: string
): Promise<[number, Appointment[]]> {
  return Appointment.update(
    {
      appointment_date: newDate,
      appointment_time: newTime,
      status: AppointmentStatus.RESCHEDULED,
      rescheduled_at: new Date(),
      rescheduled_by: rescheduledBy,
      rescheduling_reason: reason,
    },
    {
      where: { id },
      returning: true,
    }
  );
}

/**
 * Confirm appointment
 * @param id - appointment ID
 * @param confirmedBy - staff ID who confirmed
 * @returns {Promise<[number, Appointment[]]>} update result
 */
export async function confirmAppointment(
  id: number,
  confirmedBy: number
): Promise<[number, Appointment[]]> {
  return Appointment.update(
    {
      status: AppointmentStatus.CONFIRMED,
      confirmed_at: new Date(),
      confirmed_by: confirmedBy,
    },
    {
      where: { id },
      returning: true,
    }
  );
}

/**
 * Mark appointment as no-show
 * @param id - appointment ID
 * @returns {Promise<[number, Appointment[]]>} update result
 */
export async function markAppointmentNoShow(id: number): Promise<[number, Appointment[]]> {
  return Appointment.update(
    {
      status: AppointmentStatus.NO_SHOW,
    },
    {
      where: { id },
      returning: true,
    }
  );
}

/**
 * Complete appointment (when visit is created)
 * @param id - appointment ID
 * @param visitId - created visit ID
 * @returns {Promise<[number, Appointment[]]>} update result
 */
export async function completeAppointment(
  id: number,
  visitId: number
): Promise<[number, Appointment[]]> {
  return Appointment.update(
    {
      status: AppointmentStatus.COMPLETED,
      visit_id: visitId,
    },
    {
      where: { id },
      returning: true,
    }
  );
}
