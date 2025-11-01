import AppointmentService from './appointment.service';
import AppointmentCheckInService from './services/appointmentCheckIn.service';
import ScheduleManagementService from './services/scheduleManagement.service';
import { AppointmentStatisticsService } from './services/appointmentStatistics.service';
import {
  validateCreateAppointment,
  validateUpdateAppointment,
  validateAppointmentFilters,
  validateCancelAppointment,
  validateRescheduleAppointment,
  validateConfirmAppointment,
  validateAvailabilityQuery,
  // add minimal check-in body validation
  validateCheckInBody,
} from './validations';
import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { SUCCESS } from '../../core/constants';
import { errorResponse } from '../../common/responses/error-responses';
import { DATA_SAVED, DATA_UPDATED } from '../AdminSettings/messages/response-messages';
import { NextFunction, Request, Response } from 'express';
import { isEmpty } from 'lodash';
import { Appointment } from '../../database/models';
import { PaginatedResult } from './interfaces/appointment.interface';
import dayjs from 'dayjs';

class AppointmentController {
  /**
   * Create a new appointment
   * @static
   * @param {Request & { user: { sub: number } }} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with status and appointment data
   */
  static async createAppointment(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateCreateAppointment(req.body);
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }

    try {
      const appointment = await AppointmentService.createAppointmentService({
        ...req.body,
        scheduled_by: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: appointment,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get all appointments with filters and pagination
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with appointments data
   */
  static async getAppointments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      // Map frontend parameters to backend parameters
      const queryParams = {
        // Handle pagination parameter mapping
        page: Number(req.query.currentPage || req.query.page) || 1,
        pageSize: Number(req.query.pageLimit || req.query.pageSize || req.query.itemsPerPage) || 10,
        // Handle search parameter
        search: req.query.search as string,
        // Handle filters
        filters: {
          // Handle date parameter mapping
          start_date: req.query.start ? new Date(req.query.start as string) : undefined,
          end_date: req.query.end ? new Date(req.query.end as string) : undefined,
          // Handle other filter parameters
          patient_id: req.query.patient_id ? Number(req.query.patient_id) : undefined,
          doctor_id: req.query.doctor_id ? Number(req.query.doctor_id) : undefined,
          status:
            req.query.status === 'all' ? undefined : ((req.query.status as unknown) as string),
          type: req.query.type === 'all' ? undefined : ((req.query.type as unknown) as string),
        },
      };

      const appointments = await AppointmentService.getAppointmentsService(queryParams);

      // Repository/service returns paginated results; map to standard response shape
      const { docs, total, pages } = (appointments as unknown) as PaginatedResult<Appointment>;

      return successResponse({
        res,
        data: {
          rows: docs,
          count: total,
          pages,
          currentPage: queryParams.page,
          pageLimit: queryParams.pageSize,
        },
        message: SUCCESS,
        httpCode: StatusCodes.OK,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get appointment by ID
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with appointment data
   */
  static async getAppointmentById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const appointment = await AppointmentService.getAppointmentByIdService(+req.params.id);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: appointment,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Update appointment
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with updated appointment data
   */
  static async updateAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const error = isEmpty(req.body);
    if (error) {
      return errorResponse({
        res,
        message: 'Request body cannot be empty',
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }

    const { error: validationError } = validateUpdateAppointment(req.body);
    if (validationError) {
      return errorResponse({
        res,
        message: validationError.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }

    try {
      const appointment = await AppointmentService.updateAppointmentService(
        +req.params.id,
        req.body
      );

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_UPDATED,
        data: appointment,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Cancel appointment
   * @static
   * @param {Request & { user: { sub: number } }} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with cancelled appointment data
   */
  static async cancelAppointment(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateCancelAppointment({
      ...req.body,
      cancelled_by: req.user.sub,
    });
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }

    try {
      const appointment = await AppointmentService.cancelAppointmentService(+req.params.id, {
        ...req.body,
        cancelled_by: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Appointment cancelled successfully',
        data: appointment,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Reschedule appointment
   * @static
   * @param {Request & { user: { sub: number } }} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with rescheduled appointment data
   */
  static async rescheduleAppointment(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateRescheduleAppointment({
      ...req.body,
      rescheduled_by: req.user.sub,
    });
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }

    try {
      const appointment = await AppointmentService.rescheduleAppointmentService(+req.params.id, {
        ...req.body,
        rescheduled_by: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Appointment rescheduled successfully',
        data: appointment,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Confirm appointment
   * @static
   * @param {Request & { user: { sub: number } }} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with confirmed appointment data
   */
  static async confirmAppointment(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const appointment = await AppointmentService.confirmAppointmentService(+req.params.id, {
        confirmed_by: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Appointment confirmed successfully',
        data: appointment,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Mark appointment as no-show
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with no-show appointment data
   */
  static async markNoShow(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const appointment = await AppointmentService.markNoShowService(+req.params.id);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Appointment marked as no-show',
        data: appointment,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get today's appointments
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with today's appointments
   */
  static async getTodaysAppointments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const appointments = await AppointmentService.getTodaysAppointmentsService(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: appointments,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get available time slots for a doctor
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with available slots
   */
  static async getAvailableSlots(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const availabilityQuery = {
      doctor_id: Number(req.query.doctor_id),
      date: req.query.date as string,
      duration_minutes: req.query.duration_minutes ? Number(req.query.duration_minutes) : undefined,
    };
    const { error } = validateAvailabilityQuery(availabilityQuery);
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }

    try {
      const { doctor_id, date, duration_minutes = 30 } = req.query;
      const slots = await AppointmentService.getAvailableSlotsService(
        Number(doctor_id),
        new Date(date as string),
        Number(duration_minutes)
      );

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: slots,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get doctor's schedule
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with doctor's schedule
   */
  static async getDoctorSchedule(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const { start, end } = req.query;
      const startDate = dayjs(start as string).toDate();
      const endDate = dayjs(end as string).toDate();
      const doctorId = Number(req.params.doctorId);

      const schedule = await AppointmentService.getDoctorScheduleService(
        doctorId,
        dayjs(startDate).toDate(),
        dayjs(endDate).toDate()
      );

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: schedule,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Check for appointment conflicts
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with conflict information
   */
  static async checkConflicts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const { doctor_id, date, time, duration_minutes = 30, exclude_id } = req.query;

      const conflicts = await AppointmentService.checkAppointmentConflicts(
        Number(doctor_id),
        new Date(date as string),
        time as string,
        Number(duration_minutes),
        exclude_id ? Number(exclude_id) : undefined
      );

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: conflicts,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get appointments for check-in queue
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with check-in queue appointments
   */
  static async getCheckInQueue(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const { doctor_id } = req.query;
      const appointments = await AppointmentCheckInService.getAppointmentsReadyForCheckIn(
        doctor_id ? Number(doctor_id) : undefined
      );

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: appointments,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Check-in appointment and create visit
   * @static
   * @param {Request & { user: { sub: number } }} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with checked-in appointment and visit
   */
  static async checkInAppointment(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const appointmentId = Number(req.params.id);
      const staffId = req.user.sub;
      const incoming = req.body || {};

      // Validate body: only allow check_in_time (optional); disallow scheduled_time and others
      const { error } = validateCheckInBody(incoming);
      if (error) {
        return errorResponse({
          res,
          message: error.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      // Normalize: map check_in_time -> scheduled_time for internal service usage
      const checkInData =
        typeof incoming.check_in_time === 'string' && incoming.check_in_time.trim()
          ? { scheduled_time: incoming.check_in_time }
          : {};

      const result = await AppointmentCheckInService.checkInAppointment(
        appointmentId,
        checkInData,
        staffId
      );

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Appointment checked-in successfully',
        data: result,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Bulk check-in multiple appointments
   * @static
   * @param {Request & { user: { sub: number } }} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with bulk check-in results
   */
  static async bulkCheckIn(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const { appointment_ids } = req.body;
      const staffId = req.user.sub;

      if (!Array.isArray(appointment_ids) || appointment_ids.length === 0) {
        return errorResponse({
          res,
          message: 'appointment_ids must be a non-empty array',
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const result = await AppointmentCheckInService.bulkCheckIn(appointment_ids, staffId);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: `Processed ${appointment_ids.length} appointments`,
        data: result,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Validate check-in requirements for an appointment
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with validation result
   */
  static async validateCheckIn(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const appointmentId = Number(req.params.id);
      const validation = await AppointmentCheckInService.validateCheckInRequirements(appointmentId);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: validation.canCheckIn
          ? 'Appointment can be checked-in'
          : 'Check-in validation failed',
        data: validation,
      });
    } catch (e) {
      return next(e);
    }
  }

  // Schedule Management Features

  /**
   * Create recurring appointments
   * @static
   * @param {Request & { user: { sub: number } }} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with created recurring appointments
   */
  static async createRecurringAppointments(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const recurringData = {
        ...req.body,
        base_appointment: {
          ...req.body.base_appointment,
          scheduled_by: req.user.sub,
        },
      };

      const appointments = await ScheduleManagementService.createRecurringAppointments(
        recurringData
      );

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: `Created ${appointments.length} recurring appointments`,
        data: appointments,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Create time block to reserve doctor's time
   * @static
   * @param {Request & { user: { sub: number } }} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with created time block
   */
  static async createTimeBlock(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const timeBlock = {
        ...req.body,
        created_by: req.user.sub,
      };

      const block = await ScheduleManagementService.createTimeBlock(timeBlock);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: 'Time block created successfully',
        data: block,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Add patient to waitlist
   * @static
   * @param {Request & { user: { sub: number } }} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with waitlist entry
   */
  static async addToWaitlist(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const waitlistEntry = {
        ...req.body,
        created_by: req.user.sub,
      };

      const entry = await ScheduleManagementService.addToWaitlist(waitlistEntry);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: 'Added to waitlist successfully',
        data: entry,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Create doctor schedule template
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with created template
   */
  static async createScheduleTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const template = await ScheduleManagementService.createDoctorScheduleTemplate(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: 'Schedule template created successfully',
        data: template,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Apply schedule template to generate slots
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with generated schedule
   */
  static async applyScheduleTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const { doctor_id, start_date, end_date } = req.body;

      if (!doctor_id || !start_date || !end_date) {
        return errorResponse({
          res,
          message: 'doctor_id, start_date, and end_date are required',
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const schedule = await ScheduleManagementService.applyScheduleTemplate(
        Number(doctor_id),
        new Date(start_date),
        new Date(end_date)
      );

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Schedule template applied successfully',
        data: schedule,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get comprehensive schedule overview for a doctor
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with schedule overview
   */
  static async getScheduleOverview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const doctorId = Number(req.params.doctorId);
      const { date } = req.query;

      if (!date) {
        return errorResponse({
          res,
          message: 'date query parameter is required',
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const overview = await ScheduleManagementService.getDoctorScheduleOverview(
        doctorId,
        new Date(date as string)
      );

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: overview,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Check waitlist for available slots
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with waitlist notifications
   */
  static async checkWaitlistSlots(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const { doctor_id, date } = req.query;

      if (!doctor_id || !date) {
        return errorResponse({
          res,
          message: 'doctor_id and date query parameters are required',
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const notifications = await ScheduleManagementService.checkWaitlistForAvailableSlots(
        Number(doctor_id),
        new Date(date as string)
      );

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: `Found ${notifications.length} waitlist entries to notify`,
        data: notifications,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get dashboard statistics
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with dashboard statistics
   */
  static async getDashboardStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const statistics = await AppointmentStatisticsService.getDashboardStatistics();

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: statistics,
      });
    } catch (e) {
      return next(e);
    }
  }
}

export default AppointmentController;
