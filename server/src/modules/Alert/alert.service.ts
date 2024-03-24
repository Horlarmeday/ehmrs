import { createAlert, getAlerts, updateAlert } from './alert.repository';
import VisitService from '../Visit/visit.service';

export class AlertService {
  /** create an alert
   *
   * @static
   * @returns {json} json object with alert data
   * @param body
   * @memberOf AlertService
   */
  static async createAlert(body) {
    const visit = await VisitService.getVisitById(body.visit_id);
    return createAlert({ ...body, patient_id: visit.patient_id });
  }

  /**
   * get alerts
   *
   * @static
   * @returns {json} json object with alerts data
   * @param body
   * @memberOf AdminService
   */
  static async getAlerts(body) {
    const { visit_id, pageLimit, currentPage } = body;
    console.log(body);
    const visit = await VisitService.getVisitById(visit_id);

    if (Object.values(body).length) {
      return getAlerts({
        currentPage,
        pageLimit,
        patient_id: visit.patient_id,
      });
    }

    return getAlerts({
      patient_id: visit.patient_id,
    });
  }

  /** update an alert
   *
   * @static
   * @returns {json} json object with alert data
   * @param alertId
   * @param body
   * @memberOf AlertService
   */
  static async updateAlert(alertId: number, body) {
    return updateAlert(alertId, body);
  }
}
