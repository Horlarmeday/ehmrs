import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDate,
  getAppointmentsByDoctor,
  getDoctorAvailability,
  checkAppointmentConflicts,
  getTodaysAppointments,
  cancelAppointment,
  rescheduleAppointment,
  confirmAppointment,
  markAppointmentNoShow,
  completeAppointment,
} from './appointment.repository';
import { Appointment, Patient, Staff } from '../../database/models';
import {
  CreateAppointment,
  UpdateAppointment,
  AppointmentFilters,
  AppointmentSearchParams,
  CancelAppointment,
  RescheduleAppointment,
  ConfirmAppointment,
  AppointmentSlot,
  DoctorAvailability,
  AppointmentConflict,
} from './interfaces/appointment.interface';
import { AppointmentStatus, AppointmentType } from '../../database/models/appointment';
import { VisitCategory } from '../../database/models/visit';
import { BadException } from '../../common/util/api-error';
import { StatusCodes } from '../../core/helpers/helper';
import { getPatientById } from '../Patient/patient.repository';
import { getStaffById } from '../Staff/staff.repository';
import { Status } from '../../database/models/patient';
import { Gender } from '../../database/models/staff';

class AppointmentService {
  /**
   * Create a new appointment
   * @param body - appointment data
   * @returns {Promise<Appointment>} created appointment
   */
  static async createAppointmentService(body: CreateAppointment): Promise<Appointment> {
    const {
      patient_id,
      doctor_id,
      appointment_date,
      appointment_time,
      duration_minutes,
      type, // Handle frontend field name
    } = body;

    // Validate patient exists and is not banned
    const patient = await getPatientById(patient_id);
    if (!patient) {
      throw new BadException('INVALID', StatusCodes.BAD_REQUEST, 'Patient not found');
    }
    if (patient.status === Status.BANNED) {
      throw new BadException('INVALID', StatusCodes.BAD_REQUEST, 'Patient is banned');
    }
    if (patient.patient_status === 'Deceased') {
      throw new BadException(
        'INVALID', 
        StatusCodes.BAD_REQUEST, 
        `Cannot create appointment for deceased patient ${patient.fullname}. Patient died on ${patient.date_of_death ? new Date(patient.date_of_death).toLocaleDateString() : 'unknown date'}.`
      );
    }

    // Validate doctor exists
    const doctor = await getStaffById(doctor_id);
    if (!doctor) {
      throw new BadException('INVALID', StatusCodes.BAD_REQUEST, 'Doctor not found');
    }

    // Gender-specific validations
    if (type === AppointmentType.ANTENATAL && patient.gender !== Gender.FEMALE) {
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        'Antenatal appointments require female patients'
      );
    }

    // Check for appointment conflicts
    const conflicts = await this.checkAppointmentConflicts(
      doctor_id,
      appointment_date,
      appointment_time,
      duration_minutes
    );

    if (conflicts.has_conflict) {
      throw new BadException(
        'CONFLICT',
        StatusCodes.CONFLICT,
        'Appointment time conflicts with existing appointment'
      );
    }

    // Check if appointment is in the past
    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
    if (appointmentDateTime < new Date()) {
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        'Cannot schedule appointments in the past'
      );
    }

    // Auto-populate missing fields
    const appointmentData = {
      ...body,
      type: body.type,
      professional: body.professional || doctor.role || 'Doctor',
      department: body.department || doctor.department || 'General Medicine',
    };

    return await createAppointment(appointmentData);
  }

  /**
   * Get appointments with filters and pagination
   * @param params - search and filter parameters
   * @returns {Promise<{count: number, rows: Appointment[]}>} appointments with pagination
   */
  static async getAppointmentsService(params: AppointmentSearchParams) {
    // Map AppointmentSearchParams to repository expected format
    const repositoryParams = {
      // Pagination
      currentPage: params.page,
      pageLimit: params.pageSize,
      // Search
      search: params.search,
      // Filters
      patient_id: params.filters?.patient_id,
      doctor_id: params.filters?.doctor_id,
      status: params.filters?.status,
      type: params.filters?.type,
      department: params.filters?.department,
      // Date filters
      start: params.filters?.start_date,
      end: params.filters?.end_date,
      // Sort
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    };

    return await getAppointments(repositoryParams);
  }

  /**
   * Get appointment by ID
   * @param id - appointment ID
   * @returns {Promise<Appointment>} appointment details
   */
  static async getAppointmentByIdService(id: number): Promise<Appointment> {
    const appointment = await getAppointmentById(id);
    if (!appointment) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Appointment not found');
    }
    return appointment;
  }

  /**
   * Update appointment
   * @param id - appointment ID
   * @param body - update data
   * @returns {Promise<Appointment>} updated appointment
   */
  static async updateAppointmentService(id: number, body: UpdateAppointment): Promise<Appointment> {
    const appointment = await getAppointmentById(id);
    if (!appointment) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Appointment not found');
    }

    // Cannot update completed, cancelled, or no-show appointments
    if (
      [
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW,
      ].includes(appointment.status)
    ) {
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        'Cannot update completed, cancelled, or no-show appointments'
      );
    }

    // If updating time/date/doctor, check for conflicts
    if (body.appointment_date || body.appointment_time || body.doctor_id) {
      const doctorId = body.doctor_id || appointment.doctor_id;
      const appointmentDate = body.appointment_date || appointment.appointment_date;
      const appointmentTime = body.appointment_time || appointment.appointment_time;
      const duration = body.duration_minutes || appointment.duration_minutes;

      const conflicts = await this.checkAppointmentConflicts(
        doctorId,
        appointmentDate,
        appointmentTime,
        duration,
        id
      );

      if (conflicts.has_conflict) {
        throw new BadException(
          'CONFLICT',
          StatusCodes.CONFLICT,
          'Updated appointment time conflicts with existing appointment'
        );
      }
    }

    const [affectedCount, updatedAppointments] = await updateAppointment(id, body);
    if (affectedCount === 0) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Appointment not found');
    }

    return updatedAppointments[0];
  }

  /**
   * Cancel appointment
   * @param id - appointment ID
   * @param data - cancellation data
   * @returns {Promise<Appointment>} cancelled appointment
   */
  static async cancelAppointmentService(id: number, data: CancelAppointment): Promise<Appointment> {
    const appointment = await getAppointmentById(id);
    if (!appointment) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Appointment not found');
    }

    if (
      [
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW,
      ].includes(appointment.status)
    ) {
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        'Cannot cancel completed, cancelled, or no-show appointments'
      );
    }

    const [affectedCount, cancelledAppointments] = await cancelAppointment(
      id,
      data.cancelled_by,
      data.cancellation_reason
    );

    if (affectedCount === 0) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Appointment not found');
    }

    return cancelledAppointments[0];
  }

  /**
   * Reschedule appointment
   * @param id - appointment ID
   * @param data - reschedule data
   * @returns {Promise<Appointment>} rescheduled appointment
   */
  static async rescheduleAppointmentService(
    id: number,
    data: RescheduleAppointment
  ): Promise<Appointment> {
    const appointment = await getAppointmentById(id);
    if (!appointment) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Appointment not found');
    }

    if (
      [
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW,
      ].includes(appointment.status)
    ) {
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        'Cannot reschedule completed, cancelled, or no-show appointments'
      );
    }

    // Check for conflicts at new time
    const conflicts = await this.checkAppointmentConflicts(
      appointment.doctor_id,
      data.appointment_date,
      data.appointment_time,
      appointment.duration_minutes,
      id
    );

    if (conflicts.has_conflict) {
      throw new BadException(
        'CONFLICT',
        StatusCodes.CONFLICT,
        'New appointment time conflicts with existing appointment'
      );
    }

    const [affectedCount, rescheduledAppointments] = await rescheduleAppointment(
      id,
      data.appointment_date,
      data.appointment_time,
      data.rescheduled_by,
      data.rescheduling_reason
    );

    if (affectedCount === 0) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Appointment not found');
    }

    return rescheduledAppointments[0];
  }

  /**
   * Confirm appointment
   * @param id - appointment ID
   * @param data - confirmation data
   * @returns {Promise<Appointment>} confirmed appointment
   */
  static async confirmAppointmentService(
    id: number,
    data: ConfirmAppointment
  ): Promise<Appointment> {
    const appointment = await getAppointmentById(id);
    if (!appointment) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Appointment not found');
    }

    if (
      appointment.status !== AppointmentStatus.SCHEDULED &&
      appointment.status !== AppointmentStatus.RESCHEDULED
    ) {
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        'Only scheduled appointments can be confirmed'
      );
    }

    const [affectedCount, confirmedAppointments] = await confirmAppointment(id, data.confirmed_by);

    if (affectedCount === 0) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Appointment not found');
    }

    return confirmedAppointments[0];
  }

  /**
   * Mark appointment as no-show
   * @param id - appointment ID
   * @returns {Promise<Appointment>} appointment marked as no-show
   */
  static async markNoShowService(id: number): Promise<Appointment> {
    const appointment = await getAppointmentById(id);
    if (!appointment) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Appointment not found');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        'Cannot mark completed appointments as no-show'
      );
    }

    const [affectedCount, noShowAppointments] = await markAppointmentNoShow(id);

    if (affectedCount === 0) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Appointment not found');
    }

    return noShowAppointments[0];
  }

  /**
   * Get today's appointments
   * @param filters - additional filters
   * @returns {Promise<Appointment[]>} today's appointments
   */
  static async getTodaysAppointmentsService(
    filters: AppointmentFilters = {}
  ): Promise<Appointment[]> {
    return await getTodaysAppointments(filters);
  }

  /**
   * Get available time slots for a doctor on a specific date
   * @param doctorId - doctor ID
   * @param date - appointment date
   * @param durationMinutes - appointment duration
   * @returns {Promise<AppointmentSlot[]>} available time slots
   */
  static async getAvailableSlotsService(
    doctorId: number,
    date: Date,
    durationMinutes = 30
  ): Promise<AppointmentSlot[]> {
    const existingAppointments = await getDoctorAvailability(doctorId, date);
    const slots: AppointmentSlot[] = [];

    // Define working hours (8 AM to 6 PM with 1-hour lunch break from 1-2 PM)
    const workingHours = {
      start: '08:00',
      end: '18:00',
      lunchStart: '13:00',
      lunchEnd: '14:00',
    };

    // Generate time slots
    const startTime = this.parseTime(workingHours.start);
    const endTime = this.parseTime(workingHours.end);
    const lunchStart = this.parseTime(workingHours.lunchStart);
    const lunchEnd = this.parseTime(workingHours.lunchEnd);

    let currentTime = startTime;
    while (currentTime < endTime) {
      const timeString = this.formatTime(currentTime);

      // Skip lunch break
      if (currentTime >= lunchStart && currentTime < lunchEnd) {
        currentTime += 15; // 15-minute increments
        continue;
      }

      const slot: AppointmentSlot = {
        date: date.toISOString().split('T')[0],
        time: timeString,
        available: true,
      };

      // Check if slot conflicts with existing appointments
      for (const appointment of existingAppointments) {
        const appointmentStart = this.parseTime(appointment.appointment_time);
        const appointmentEnd = appointmentStart + appointment.duration_minutes;
        const slotEnd = currentTime + durationMinutes;

        if (currentTime < appointmentEnd && slotEnd > appointmentStart) {
          slot.available = false;
          slot.appointment_id = appointment.id;
          break;
        }
      }

      slots.push(slot);
      currentTime += 15; // 15-minute increments
    }

    return slots;
  }

  /**
   * Get doctor's schedule for a specific date or date range
   * @param doctorId - doctor ID
   * @param date - specific date or start date
   * @param endDate - end date for range (optional)
   * @returns {Promise<DoctorAvailability>} doctor's availability
   */
  static async getDoctorScheduleService(
    doctorId: number,
    date: Date,
    endDate?: Date
  ): Promise<DoctorAvailability> {
    const appointments = await getAppointmentsByDoctor(doctorId, date);
    const availableSlots = await this.getAvailableSlotsService(doctorId, date);

    return {
      doctor_id: doctorId,
      date: date.toISOString().split('T')[0],
      slots: availableSlots,
      working_hours: {
        start: '08:00',
        end: '18:00',
        lunch_start: '13:00',
        lunch_end: '14:00',
      },
    };
  }

  /**
   * Check for appointment conflicts
   * @param doctorId - doctor ID
   * @param date - appointment date
   * @param time - appointment time
   * @param duration - appointment duration
   * @param excludeId - appointment ID to exclude
   * @returns {Promise<AppointmentConflict>} conflict information
   */
  static async checkAppointmentConflicts(
    doctorId: number,
    date: Date,
    time: string,
    duration: number,
    excludeId?: number
  ): Promise<AppointmentConflict> {
    const conflictingAppointments = await checkAppointmentConflicts(
      doctorId,
      date,
      time,
      duration,
      excludeId
    );

    const startTime = this.parseTime(time);
    const endTime = startTime + duration;

    const conflicts = conflictingAppointments.filter(appointment => {
      const appointmentStart = this.parseTime(appointment.appointment_time);
      const appointmentEnd = appointmentStart + appointment.duration_minutes;
      return startTime < appointmentEnd && endTime > appointmentStart;
    });

    const result: AppointmentConflict = {
      has_conflict: conflicts.length > 0,
      conflicting_appointments: conflicts.map(appointment => ({
        id: appointment.id,
        appointment_time: appointment.appointment_time,
        duration_minutes: appointment.duration_minutes,
        patient_name: `${appointment.patient?.firstname} ${appointment.patient?.lastname}`,
      })),
    };

    // If there are conflicts, suggest alternative slots
    if (result.has_conflict) {
      result.suggested_slots = (await this.getAvailableSlotsService(doctorId, date, duration))
        .filter(slot => slot.available)
        .slice(0, 5); // Return top 5 suggestions
    }

    return result;
  }

  /**
   * Complete appointment (when visit is created)
   * @param id - appointment ID
   * @param visitId - created visit ID
   * @returns {Promise<Appointment>} completed appointment
   */
  static async completeAppointmentService(id: number, visitId: number): Promise<Appointment> {
    const [affectedCount, completedAppointments] = await completeAppointment(id, visitId);

    if (affectedCount === 0) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Appointment not found');
    }

    return completedAppointments[0];
  }

  /**
   * Map appointment type to visit category for visit creation
   * @param appointmentType - appointment type
   * @returns {VisitCategory} corresponding visit category
   */
  static mapAppointmentTypeToVisitCategory(appointmentType: AppointmentType): VisitCategory {
    const typeToCategory: Record<AppointmentType, VisitCategory> = {
      [AppointmentType.CONSULTATION]: VisitCategory.OPD,
      [AppointmentType.FOLLOW_UP]: VisitCategory.OPD,
      [AppointmentType.PROCEDURE]: VisitCategory.OPD,
      [AppointmentType.VACCINATION]: VisitCategory.IMMUNIZATION,
      [AppointmentType.DIALYSIS]: VisitCategory.DIALYSIS,
      [AppointmentType.ANTENATAL]: VisitCategory.ANC,
    };

    return typeToCategory[appointmentType] || VisitCategory.OPD;
  }

  // Helper methods
  private static parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}

export default AppointmentService;
