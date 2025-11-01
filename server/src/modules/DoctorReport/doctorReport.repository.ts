import { DoctorReport, Staff } from '../../database/models';
import { WhereOptions } from 'sequelize';
import { patientAttributes, staffAttributes } from '../../core/helpers/helper';

/**
 * Create a doctor report
 * @param data - report data
 * @returns {Promise<DoctorReport>} created report
 */
export async function createDoctorReport(data: {
  visit_id: number;
  patient_id: number;
  staff_id: number;
  report_content: string;
}): Promise<DoctorReport> {
  return DoctorReport.create(data);
}

/**
 * Get doctor report by ID
 * @param id - report ID
 * @returns {Promise<DoctorReport | null>} report data
 */
export async function getDoctorReportById(id: number): Promise<DoctorReport | null> {
  return DoctorReport.findOne({
    where: { id },
    include: [
      {
        model: Staff,
        as: 'staff',
        attributes: ['id', 'firstname', 'lastname', 'fullname', 'role', 'department'],
      },
    ],
  });
}

/**
 * Get all doctor reports for a visit
 * @param visitId - visit ID
 * @returns {Promise<DoctorReport[]>} array of reports
 */
export async function getDoctorReportsByVisit(visitId: number): Promise<DoctorReport[]> {
  return DoctorReport.findAll({
    where: { visit_id: visitId },
    include: [
      {
        model: Staff,
        as: 'staff',
        attributes: ['id', 'firstname', 'lastname', 'fullname', 'role', 'department'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
}

/**
 * Update doctor report
 * @param id - report ID
 * @param data - update data
 * @returns {Promise<[number, DoctorReport[]]>} update result
 */
export async function updateDoctorReport(
  id: number,
  data: { report_content: string }
): Promise<[number, DoctorReport[]]> {
  return DoctorReport.update(data, {
    where: { id },
    returning: true,
  });
}

/**
 * Delete doctor report
 * @param id - report ID
 * @returns {Promise<number>} number of deleted rows
 */
export async function deleteDoctorReport(id: number): Promise<number> {
  return DoctorReport.destroy({
    where: { id },
  });
}

/**
 * Get all doctor reports for a patient
 * @returns {Promise<DoctorReport[]>} array of reports
 * @param filter
 * @param page
 * @param pageLimit
 */
export async function getDoctorReportsByPatient(page = 1, pageLimit = 20, filter = null) {
  return DoctorReport.paginate({
    page,
    paginate: pageLimit,
    where: { ...(filter && JSON.parse(filter)) },
    include: [
      {
        model: Staff,
        as: 'staff',
        attributes: staffAttributes,
      },
    ],
    order: [['createdAt', 'DESC']],
  });
}
