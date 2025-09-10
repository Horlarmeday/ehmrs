import AppointmentService from '../appointment.service';
import VisitService from '../../Visit/visit.service';
import { CreateVisit } from '../../Visit/interface/visit.interface';
import { AppointmentStatus } from '../../../database/models/appointment';
import { BadException } from '../../../common/util/api-error';
import { StatusCodes } from '../../../core/helpers/helper';
import { Appointment, Visit } from '../../../database/models';
import { Status } from '../../../database/models/patient';
import { getLastActiveVisit } from '../../Visit/visit.repository';

export class AppointmentCheckInService {
  /**
   * Check-in appointment and create or use existing visit
   * Note: If patient has an active visit (lasting up to 5+ days), that visit will be used instead of creating a new one.
   * Only one active visit is allowed per patient at a time.
   * @param appointmentId - appointment ID to check-in
   * @param checkInData - additional check-in data
   * @param staffId - staff member performing check-in
   * @returns {Promise<{appointment: Appointment, visit: Visit}>} checked-in appointment and visit (new or existing)
   */
  static async checkInAppointment(
    appointmentId: number,
    checkInData: {
      service_id?: number;
      chief_complaint?: string;
      initial_assessment?: string;
      emergency_priority?: string;
      dialysis_type?: string;
      dialysis_notes?: string;
      dialysis_priority?: string;
      scheduled_time?: string;
    } = {},
    staffId: number
  ): Promise<{ appointment: Appointment; visit: Visit }> {
    // Get the appointment
    const appointment = await AppointmentService.getAppointmentByIdService(appointmentId);

    // Validate appointment status
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        'Appointment has already been checked-in'
      );
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        'Cannot check-in cancelled appointment'
      );
    }

    if (appointment.status === AppointmentStatus.NO_SHOW) {
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        'Cannot check-in no-show appointment'
      );
    }

    // Check for existing active visit first
    const existingVisit = await getLastActiveVisit(appointment.patient_id);

    let visit: Visit;

    if (existingVisit) {
      // Use existing active visit
      visit = existingVisit;
      console.log(
        `Using existing active visit ID: ${visit.id} for patient ${appointment.patient_id}`
      );
    } else {
      // Create new visit only if no active visit exists
      const visitCategory = AppointmentService.mapAppointmentTypeToVisitCategory(appointment.type);

      const visitData: CreateVisit = {
        patient_id: appointment.patient_id,
        category: visitCategory,
        service_id: checkInData.service_id || undefined,
        staff_id: staffId,
        professional: appointment.professional,
        doctor_id: appointment.doctor_id,
        ante_natal_id: undefined, // Will be set by visit service if needed
        immunization_id: undefined, // Will be set by visit service if needed

        // Additional fields for specialized visit types
        chief_complaint: checkInData.chief_complaint || appointment.reason_for_visit,
        initial_assessment: checkInData.initial_assessment || appointment.notes,

        // Emergency-specific fields
        emergency_priority: checkInData.emergency_priority,

        // Dialysis-specific fields
        dialysis_type: checkInData.dialysis_type,
        dialysis_notes: checkInData.dialysis_notes,
        dialysis_priority: checkInData.dialysis_priority,
        scheduled_time: checkInData.scheduled_time,
      };

      // Create the visit
      visit = await VisitService.createVisitService(visitData);
      console.log(`Created new visit ID: ${visit.id} for patient ${appointment.patient_id}`);
    }

    // Complete the appointment by linking it to the visit
    const completedAppointment = await AppointmentService.completeAppointmentService(
      appointmentId,
      visit.id
    );

    return {
      appointment: completedAppointment,
      visit: visit,
    };
  }

  /**
   * Bulk check-in multiple appointments
   * @param appointmentIds - array of appointment IDs
   * @param staffId - staff member performing check-ins
   * @returns {Promise<{successful: Array<{appointment: Appointment, visit: Visit}>, failed: Array<{appointmentId: number, error: string}>}>}
   */
  static async bulkCheckIn(
    appointmentIds: number[],
    staffId: number
  ): Promise<{
    successful: Array<{ appointment: Appointment; visit: Visit }>;
    failed: Array<{ appointmentId: number; error: string }>;
  }> {
    const successful: Array<{ appointment: Appointment; visit: Visit }> = [];
    const failed: Array<{ appointmentId: number; error: string }> = [];

    for (const appointmentId of appointmentIds) {
      try {
        const result = await this.checkInAppointment(appointmentId, {}, staffId);
        successful.push(result);
      } catch (error) {
        failed.push({
          appointmentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Get appointments ready for check-in (today's confirmed appointments)
   * @param doctorId - filter by doctor (optional)
   * @returns {Promise<Appointment[]>} appointments ready for check-in
   */
  static async getAppointmentsReadyForCheckIn(doctorId?: number): Promise<Appointment[]> {
    const filters: any = {
      status: AppointmentStatus.CONFIRMED,
    };

    if (doctorId) {
      filters.doctor_id = doctorId;
    }

    return await AppointmentService.getTodaysAppointmentsService(filters);
  }

  /**
   * Pre-validate check-in requirements
   * Note: Validation accounts for the fact that existing active visits will be reused rather than creating new ones.
   * @param appointmentId - appointment ID
   * @returns {Promise<{canCheckIn: boolean, issues: string[], hasActiveVisit?: boolean}>} validation result
   */
  static async validateCheckInRequirements(
    appointmentId: number
  ): Promise<{ canCheckIn: boolean; issues: string[]; hasActiveVisit?: boolean }> {
    const issues: string[] = [];
    let hasActiveVisit = false;

    try {
      const appointment = await AppointmentService.getAppointmentByIdService(appointmentId);

      // Check appointment status
      if (appointment.status === AppointmentStatus.COMPLETED) {
        issues.push('Appointment has already been checked-in');
      }

      if (appointment.status === AppointmentStatus.CANCELLED) {
        issues.push('Appointment is cancelled');
      }

      if (appointment.status === AppointmentStatus.NO_SHOW) {
        issues.push('Appointment is marked as no-show');
      }

      // Check if appointment is for today
      const today = new Date().toISOString().split('T')[0];
      const appointmentDate = appointment.appointment_date.toISOString().split('T')[0];

      if (appointmentDate !== today) {
        issues.push('Appointment is not scheduled for today');
      }

      // Check if patient exists and is not banned
      if (appointment.patient?.status === Status.BANNED) {
        issues.push('Patient is banned');
      }

      // Check if doctor exists
      if (!appointment.doctor) {
        issues.push('Assigned doctor not found');
      }

      // Check if patient has an active visit
      const activeVisit = await getLastActiveVisit(appointment.patient_id);
      hasActiveVisit = !!activeVisit;
    } catch (error) {
      issues.push('Appointment not found');
    }

    return {
      canCheckIn: issues.length === 0,
      issues,
      hasActiveVisit,
    };
  }
}

export default AppointmentCheckInService;
