import {
  createVisit,
  endVisit,
  getActiveVisits,
  getLastVisitStatus,
  getTypeVisits,
  getVisit,
  getVisitById,
  getVisits,
  searchActiveVisits,
  searchTypeVisits,
  searchVisits,
} from './visit.repository';
import { Visit } from '../../database/models';

class VisitService {
  /**
   * page patient visit
   *
   * @static
   * @returns {json} json object with item data
   * @param body
   * @memberOf VisitService
   */
  static async createVisitService(body): Promise<Visit> {
    const visit = await getLastVisitStatus(body.patient_id);
    if (visit) await endVisit(visit);
    return createVisit(body);
  }

  /**
   * get active visits
   *
   * @static
   * @returns {json} json object with visits data
   * @param body
   * @memberOf VisitService
   */
  static async getActiveVisits(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
    const { currentPage, pageLimit, search } = body;
    if (search) {
      return searchActiveVisits(+currentPage, +pageLimit, search);
    }

    if (Object.values(body).length) {
      return getActiveVisits(+currentPage, +pageLimit);
    }

    return getActiveVisits();
  }

  /**
   * get all visits
   *
   * @static
   * @returns {json} json object with visits data
   * @param body
   * @memberOf VisitService
   */
  static async getAllVisits(body) {
    const { currentPage, pageLimit, search } = body;
    if (search) {
      return searchVisits(+currentPage, +pageLimit, search);
    }

    if (Object.values(body).length) {
      return getVisits(+currentPage, +pageLimit);
    }

    return getVisits();
  }

  /**
   * get typed visits
   *
   * @static
   * @returns {json} json object with visits data
   * @param body
   * @memberOf VisitService
   */
  static async getTypeVisits(body) {
    const { currentPage, pageLimit, search, type } = body;
    if (search) {
      return searchTypeVisits(+currentPage, +pageLimit, search, type);
    }

    if (Object.values(body).length) {
      return getTypeVisits(+currentPage, +pageLimit, type);
    }

    return getTypeVisits();
  }

  /**
   * get patient visit by id
   *
   * @static
   * @returns {json} json object with item data
   * @memberOf VisitService
   * @param id
   */
  static async getVisitById(id) {
    return getVisitById(id);
  }

  /**
   * get a visit including patient details
   *
   * @static
   * @returns {json} json object with item data
   * @memberOf VisitService
   * @param id
   */
  static async getOneVisit(id: number) {
    return getVisit(id);
  }
}

export default VisitService;
