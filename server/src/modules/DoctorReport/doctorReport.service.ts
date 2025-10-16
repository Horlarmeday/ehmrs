import { StatusCodes } from '../../core/helpers/helper';
import { BadException } from '../../common/util/api-error';
import {
  createDoctorReport,
  getDoctorReportById,
  getDoctorReportsByVisit,
  updateDoctorReport,
  deleteDoctorReport,
} from './doctorReport.repository';
import { DoctorReport } from '../../database/models';

class DoctorReportService {
  /**
   * Create a new doctor report
   * @param body - report data
   * @returns {Promise<DoctorReport>} created report
   */
  static async createDoctorReportService(body: {
    visit_id: number;
    patient_id: number;
    staff_id: number;
    report_content: string;
  }): Promise<DoctorReport> {
    const { visit_id, patient_id, staff_id, report_content } = body;

    // Validate required fields
    if (!visit_id) {
      throw new BadException('VALIDATION_ERROR', StatusCodes.BAD_REQUEST, 'Visit ID is required');
    }

    if (!patient_id) {
      throw new BadException('VALIDATION_ERROR', StatusCodes.BAD_REQUEST, 'Patient ID is required');
    }

    if (!staff_id) {
      throw new BadException('VALIDATION_ERROR', StatusCodes.BAD_REQUEST, 'Staff ID is required');
    }

    if (!report_content || report_content.trim().length < 10) {
      throw new BadException(
        'VALIDATION_ERROR',
        StatusCodes.BAD_REQUEST,
        'Report content must be at least 10 characters long'
      );
    }

    return await createDoctorReport({
      visit_id,
      patient_id,
      staff_id,
      report_content: report_content.trim(),
    });
  }

  /**
   * Get a doctor report by ID
   * @param id - report ID
   * @returns {Promise<DoctorReport>} report data
   */
  static async getDoctorReportService(id: number): Promise<DoctorReport> {
    const report = await getDoctorReportById(id);

    if (!report) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Doctor report not found');
    }

    return report;
  }

  /**
   * Get all doctor reports for a visit
   * @param visitId - visit ID
   * @returns {Promise<DoctorReport[]>} array of reports
   */
  static async getVisitDoctorReportsService(visitId: number): Promise<DoctorReport[]> {
    if (!visitId) {
      throw new BadException('VALIDATION_ERROR', StatusCodes.BAD_REQUEST, 'Visit ID is required');
    }

    return await getDoctorReportsByVisit(visitId);
  }

  /**
   * Update a doctor report
   * @param id - report ID
   * @param body - update data
   * @param staffId - current user staff ID
   * @returns {Promise<DoctorReport>} updated report
   */
  static async updateDoctorReportService(
    id: number,
    body: { report_content: string },
    staffId: number
  ): Promise<DoctorReport> {
    const { report_content } = body;

    // Validate report content
    if (!report_content || report_content.trim().length < 10) {
      throw new BadException(
        'VALIDATION_ERROR',
        StatusCodes.BAD_REQUEST,
        'Report content must be at least 10 characters long'
      );
    }

    // Get existing report
    const existingReport = await getDoctorReportById(id);

    if (!existingReport) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Doctor report not found');
    }

    // Check ownership
    if (existingReport.staff_id !== staffId) {
      throw new BadException(
        'FORBIDDEN',
        StatusCodes.FORBIDDEN,
        'You can only edit your own reports'
      );
    }

    // Update report
    await updateDoctorReport(id, { report_content: report_content.trim() });

    // Return updated report
    return await this.getDoctorReportService(id);
  }

  /**
   * Delete a doctor report
   * @param id - report ID
   * @param staffId - current user staff ID
   * @returns {Promise<boolean>} deletion success
   */
  static async deleteDoctorReportService(id: number, staffId: number): Promise<boolean> {
    // Get existing report
    const existingReport = await getDoctorReportById(id);

    if (!existingReport) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Doctor report not found');
    }

    // Check ownership
    if (existingReport.staff_id !== staffId) {
      throw new BadException(
        'FORBIDDEN',
        StatusCodes.FORBIDDEN,
        'You can only delete your own reports'
      );
    }

    // Delete report
    const deleted = await deleteDoctorReport(id);

    return deleted > 0;
  }
}

export default DoctorReportService;
