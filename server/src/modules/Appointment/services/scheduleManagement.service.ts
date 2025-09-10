import { Op, WhereOptions } from 'sequelize';
import { Appointment, Staff } from '../../../database/models';
import { AppointmentStatus, AppointmentType } from '../../../database/models/appointment';
import { BadException } from '../../../common/util/api-error';
import { StatusCodes } from '../../../core/helpers/helper';
import AppointmentService from '../appointment.service';
import {
  createAppointment,
  getAppointmentsByDoctor,
  getDoctorAvailability,
} from '../appointment.repository';
import { CreateAppointment } from '../interfaces/appointment.interface';

export interface RecurringAppointmentData {
  base_appointment: CreateAppointment;
  recurrence_pattern: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number; // Every X days/weeks/months
    days_of_week?: number[]; // For weekly: [0=Sunday, 1=Monday, etc.]
    day_of_month?: number; // For monthly: specific day
    end_date?: Date;
    max_occurrences?: number;
  };
}

export interface TimeBlock {
  doctor_id: number;
  start_datetime: Date;
  end_datetime: Date;
  block_type: 'meeting' | 'break' | 'training' | 'emergency' | 'personal';
  title: string;
  description?: string;
  created_by: number;
}

export interface WaitlistEntry {
  patient_id: number;
  doctor_id: number;
  preferred_date_start: Date;
  preferred_date_end: Date;
  appointment_type: AppointmentType;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  created_by: number;
  created_at?: Date;
  notified_at?: Date;
}

export interface DoctorScheduleTemplate {
  doctor_id: number;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string;
  end_time: string;
  lunch_start?: string;
  lunch_end?: string;
  appointment_duration: number; // Default duration in minutes
  buffer_time: number; // Buffer between appointments
  max_appointments?: number; // Max appointments per day
  is_active: boolean;
}

export class ScheduleManagementService {
  /**
   * Create recurring appointments based on pattern
   * @param data - recurring appointment configuration
   * @returns {Promise<Appointment[]>} created appointments
   */
  static async createRecurringAppointments(data: RecurringAppointmentData): Promise<Appointment[]> {
    const { base_appointment, recurrence_pattern } = data;
    const appointments: Appointment[] = [];
    const dates = this.generateRecurrenceDates(
      base_appointment.appointment_date,
      recurrence_pattern
    );

    for (const date of dates) {
      try {
        // Check for conflicts before creating each appointment
        const conflicts = await AppointmentService.checkAppointmentConflicts(
          base_appointment.doctor_id,
          date,
          base_appointment.appointment_time,
          base_appointment.duration_minutes
        );

        if (!conflicts.has_conflict) {
          const appointmentData = {
            ...base_appointment,
            appointment_date: date,
          };

          const appointment = await createAppointment(appointmentData);
          appointments.push(appointment);
        } else {
          console.warn(`Skipping appointment on ${date.toISOString()} due to conflict`);
        }
      } catch (error) {
        console.error(`Failed to create appointment for ${date.toISOString()}:`, error);
      }
    }

    return appointments;
  }

  /**
   * Generate dates based on recurrence pattern
   * @param startDate - starting date
   * @param pattern - recurrence pattern
   * @returns {Date[]} array of dates
   */
  private static generateRecurrenceDates(
    startDate: Date,
    pattern: RecurringAppointmentData['recurrence_pattern']
  ): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    let occurrences = 0;
    const maxOccurrences = pattern.max_occurrences || 52; // Default to 1 year
    const endDate = pattern.end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

    while (currentDate <= endDate && occurrences < maxOccurrences) {
      if (this.isValidRecurrenceDate(currentDate, pattern)) {
        dates.push(new Date(currentDate));
        occurrences++;
      }

      // Advance to next date based on frequency
      switch (pattern.frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + pattern.interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + pattern.interval * 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + pattern.interval);
          break;
      }
    }

    return dates;
  }

  /**
   * Check if date matches recurrence pattern
   * @param date - date to check
   * @param pattern - recurrence pattern
   * @returns {boolean} whether date is valid
   */
  private static isValidRecurrenceDate(
    date: Date,
    pattern: RecurringAppointmentData['recurrence_pattern']
  ): boolean {
    if (pattern.frequency === 'weekly' && pattern.days_of_week) {
      return pattern.days_of_week.includes(date.getDay());
    }

    if (pattern.frequency === 'monthly' && pattern.day_of_month) {
      return date.getDate() === pattern.day_of_month;
    }

    return true;
  }

  /**
   * Create time block to reserve doctor's time
   * @param timeBlock - time block data
   * @returns {Promise<any>} created time block (simplified for now)
   */
  static async createTimeBlock(timeBlock: TimeBlock): Promise<any> {
    // For now, we'll create a special appointment to block the time
    // In a full implementation, you'd have a separate TimeBlocks table
    const blockAppointment = {
      patient_id: null, // No patient for time blocks
      doctor_id: timeBlock.doctor_id,
      appointment_date: timeBlock.start_datetime,
      appointment_time: timeBlock.start_datetime.toTimeString().substring(0, 5),
      duration_minutes: Math.round(
        (timeBlock.end_datetime.getTime() - timeBlock.start_datetime.getTime()) / (1000 * 60)
      ),
      type: AppointmentType.PROCEDURE, // Using as placeholder
      department: 'Administration',
      professional: 'Doctor',
      reason_for_visit: `Time Block: ${timeBlock.title}`,
      notes: timeBlock.description || '',
      scheduled_by: timeBlock.created_by,
    };

    // Create appointment to block the time
    const appointment = await createAppointment(blockAppointment as any);

    // Mark as a special "blocked" status (using cancelled for now)
    await appointment.update({
      status: AppointmentStatus.CANCELLED,
      cancellation_reason: `TIME_BLOCK: ${timeBlock.block_type.toUpperCase()}`,
    });

    return {
      id: appointment.id,
      ...timeBlock,
      appointment_id: appointment.id,
    };
  }

  /**
   * Add patient to waitlist for preferred appointment time
   * @param entry - waitlist entry data
   * @returns {Promise<any>} waitlist entry (simplified for now)
   */
  static async addToWaitlist(entry: WaitlistEntry): Promise<any> {
    // In a full implementation, you'd store this in a Waitlist table
    // For now, we'll simulate the functionality
    const waitlistItem = {
      id: Date.now(), // Simple ID generation
      ...entry,
      created_at: new Date(),
      status: 'active',
    };

    // Check for existing appointments in the preferred time range
    const existingAppointments = await this.getAppointmentsInDateRange(
      entry.doctor_id,
      entry.preferred_date_start,
      entry.preferred_date_end
    );

    // Calculate potential slots
    const potentialSlots = await this.findPotentialSlotsForWaitlist(entry);

    return {
      ...waitlistItem,
      potential_slots: potentialSlots,
      estimated_wait_time: this.estimateWaitTime(entry, existingAppointments),
    };
  }

  /**
   * Check waitlist and notify patients when slots become available
   * @param doctorId - doctor ID
   * @param date - date to check
   * @returns {Promise<WaitlistEntry[]>} notifiable waitlist entries
   */
  static async checkWaitlistForAvailableSlots(
    doctorId: number,
    date: Date
  ): Promise<WaitlistEntry[]> {
    // Get available slots for the date
    const availableSlots = await AppointmentService.getAvailableSlotsService(doctorId, date);
    const freeSlots = availableSlots.filter(slot => slot.available);

    if (freeSlots.length === 0) {
      return [];
    }

    // In a real implementation, you'd query the waitlist table
    // For now, we'll return a simulation of waitlist entries that could be notified
    return []; // Placeholder
  }

  /**
   * Create and apply doctor's schedule template
   * @param template - schedule template
   * @returns {Promise<any>} created template
   */
  static async createDoctorScheduleTemplate(template: DoctorScheduleTemplate): Promise<any> {
    // In a full implementation, this would be stored in a DoctorScheduleTemplates table
    // For now, we'll return the template with validation

    const doctor = await Staff.findByPk(template.doctor_id);
    if (!doctor) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Doctor not found');
    }

    // Validate time format
    if (
      !this.isValidTimeFormat(template.start_time) ||
      !this.isValidTimeFormat(template.end_time)
    ) {
      throw new BadException('INVALID', StatusCodes.BAD_REQUEST, 'Invalid time format');
    }

    return {
      id: Date.now(),
      ...template,
      created_at: new Date(),
    };
  }

  /**
   * Apply schedule template to generate available slots for a period
   * @param doctorId - doctor ID
   * @param startDate - start date
   * @param endDate - end date
   * @returns {Promise<any[]>} generated schedule slots
   */
  static async applyScheduleTemplate(
    doctorId: number,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    // In a real implementation, you'd:
    // 1. Get doctor's schedule template
    // 2. Generate slots based on template for the date range
    // 3. Exclude existing appointments and time blocks
    // 4. Return available slots

    const schedule = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      // Simulate getting template for this day
      const template = {
        doctor_id: doctorId,
        day_of_week: dayOfWeek,
        start_time: '08:00',
        end_time: '17:00',
        lunch_start: '12:00',
        lunch_end: '13:00',
        appointment_duration: 30,
        buffer_time: 5,
      };

      // Generate slots for this day
      const daySlots = await AppointmentService.getAvailableSlotsService(
        doctorId,
        new Date(currentDate),
        template.appointment_duration
      );

      schedule.push({
        date: new Date(currentDate),
        day_of_week: dayOfWeek,
        slots: daySlots,
        template_applied: template,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedule;
  }

  // Helper methods
  private static async getAppointmentsInDateRange(
    doctorId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    return Appointment.findAll({
      where: {
        doctor_id: doctorId,
        appointment_date: {
          [Op.between]: [startDate, endDate],
        },
        status: {
          [Op.notIn]: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
      },
      order: [
        ['appointment_date', 'ASC'],
        ['appointment_time', 'ASC'],
      ],
    });
  }

  private static async findPotentialSlotsForWaitlist(entry: WaitlistEntry): Promise<any[]> {
    // Find potential slots in the preferred date range
    const slots = [];
    const currentDate = new Date(entry.preferred_date_start);

    while (currentDate <= entry.preferred_date_end) {
      const dailySlots = await AppointmentService.getAvailableSlotsService(
        entry.doctor_id,
        new Date(currentDate)
      );

      const availableSlots = dailySlots.filter(slot => slot.available);
      if (availableSlots.length > 0) {
        slots.push({
          date: new Date(currentDate),
          available_times: availableSlots.map(s => s.time),
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  private static estimateWaitTime(
    entry: WaitlistEntry,
    existingAppointments: Appointment[]
  ): string {
    // Simple estimation based on priority and existing appointments
    const priorityMultiplier = {
      low: 1.5,
      normal: 1.0,
      high: 0.7,
      urgent: 0.3,
    };

    const baseDays = Math.max(1, Math.floor(existingAppointments.length / 5)); // Rough estimate
    const adjustedDays = Math.ceil(baseDays * priorityMultiplier[entry.priority]);

    return `${adjustedDays} day${adjustedDays !== 1 ? 's' : ''}`;
  }

  private static isValidTimeFormat(time: string): boolean {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  /**
   * Get comprehensive schedule overview for a doctor
   * @param doctorId - doctor ID
   * @param date - date to check
   * @returns {Promise<any>} comprehensive schedule data
   */
  static async getDoctorScheduleOverview(doctorId: number, date: Date): Promise<any> {
    const [appointments, availableSlots] = await Promise.all([
      getAppointmentsByDoctor(doctorId, date),
      AppointmentService.getAvailableSlotsService(doctorId, date),
    ]);

    const bookedSlots = availableSlots.filter(slot => !slot.available);
    const freeSlots = availableSlots.filter(slot => slot.available);

    return {
      doctor_id: doctorId,
      date: date.toISOString().split('T')[0],
      summary: {
        total_appointments: appointments.length,
        confirmed_appointments: appointments.filter(a => a.status === AppointmentStatus.CONFIRMED)
          .length,
        pending_appointments: appointments.filter(a => a.status === AppointmentStatus.SCHEDULED)
          .length,
        available_slots: freeSlots.length,
        booked_slots: bookedSlots.length,
        utilization_rate: Math.round((bookedSlots.length / availableSlots.length) * 100),
      },
      appointments: appointments,
      available_slots: freeSlots,
      time_blocks: [], // Would be populated from time blocks table
      waitlist_notifications: [], // Would be populated from waitlist checks
    };
  }
}

export default ScheduleManagementService;
