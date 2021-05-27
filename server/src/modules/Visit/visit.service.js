import {
  createVisit,
  endVisit,
  getActiveVisits,
  getLastVisitStatus,
  getTypeVisits,
  getVisits,
  searchActiveVisits,
  searchTypeVisits,
  searchVisits,
} from './visit.repository';

class VisitService {
  /**
   * create patient visit
   *
   * @static
   * @returns {json} json object with item data
   * @param body
   * @memberOf VisitService
   */
  static async createVisitService(body) {
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
  static async getActiveVisits(body) {
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
    const { currentPage, pageLimit, search, } = body;
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
}

export default VisitService;
