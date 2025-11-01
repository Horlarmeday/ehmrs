import { Router } from 'express';
import AppointmentController from './appointment.controller';
import verify from '../../core/middleware/verify';

const router = Router();

// Core appointment CRUD operations
router.post('/create', verify, AppointmentController.createAppointment);
router.get('/get', verify, AppointmentController.getAppointments);
router.get('/:id', verify, AppointmentController.getAppointmentById);
router.put('/:id', verify, AppointmentController.updateAppointment);

// Appointment status management
router.put('/:id/cancel', verify, AppointmentController.cancelAppointment);
router.put('/:id/reschedule', verify, AppointmentController.rescheduleAppointment);
router.put('/:id/confirm', verify, AppointmentController.confirmAppointment);
router.put('/:id/no-show', verify, AppointmentController.markNoShow);

// Schedule management and availability
router.get('/available-slots/get', verify, AppointmentController.getAvailableSlots);
router.get('/doctor/:doctorId/schedule', verify, AppointmentController.getDoctorSchedule);
router.get('/conflicts/check', verify, AppointmentController.checkConflicts);

// Daily operations
router.get('/today/get', verify, AppointmentController.getTodaysAppointments);
router.get('/check-in-queue/get', verify, AppointmentController.getCheckInQueue);
router.get('/dashboard/statistics', verify, AppointmentController.getDashboardStatistics);

// Check-in operations
router.post('/:id/check-in', verify, AppointmentController.checkInAppointment);
router.post('/check-in/bulk', verify, AppointmentController.bulkCheckIn);
router.get('/:id/validate-check-in', verify, AppointmentController.validateCheckIn);

// Schedule Management operations
router.post('/recurring/create', verify, AppointmentController.createRecurringAppointments);
router.post('/time-block/create', verify, AppointmentController.createTimeBlock);
router.post('/waitlist/add', verify, AppointmentController.addToWaitlist);
router.post('/schedule-template/create', verify, AppointmentController.createScheduleTemplate);
router.post('/schedule-template/apply', verify, AppointmentController.applyScheduleTemplate);
router.get(
  '/doctor/:doctorId/schedule-overview',
  verify,
  AppointmentController.getScheduleOverview
);
router.get('/waitlist/check-slots', verify, AppointmentController.checkWaitlistSlots);

export default router;
