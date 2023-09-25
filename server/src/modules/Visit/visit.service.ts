import {
  createVisit,
  endVisit,
  getActiveVisits,
  getLastVisitStatus,
  getVisit,
  getVisitById,
  getVisits,
  getVisitsType,
  searchActiveVisits,
  searchVisits,
  searchVisitsType,
} from './visit.repository';
import { Visit } from '../../database/models';
import { CreateVisit } from './interface/visit.interface';
import { VisitType } from '../../database/models/visit';
import { getOneAntenatalAccount } from '../Antenatal/antenatal.repository';
import { AccountStatus, Antenatal } from '../../database/models/antenatal';
import { BadException } from '../../common/util/api-error';
import { StatusCodes } from '../../core/helpers/helper';
import { Op } from 'sequelize';
import { ANTENATAL_ACCOUNT_REQUIRED } from './messages/response.messages';

class VisitService {
  /**
   * create patient visit
   *
   * @static
   * @returns {json} json object with item data
   * @param body
   * @memberOf VisitService
   */
  static async createVisitService(body: CreateVisit): Promise<Visit> {
    let antenatal: Antenatal;
    const { patient_id, ante_natal_id, type } = body;
    const visit = await getLastVisitStatus(patient_id);
    if (visit) await endVisit(visit); // end existing visit - since 2 visits cannot be active

    // This check happens if a visit wants to be created when an antenatal account already exists
    // `ante_natal_id` field in the body only happens when a visit wants to be created
    // immediately a patient was enrolled for antenatal
    if (type === VisitType.ANC && !ante_natal_id) {
      antenatal = await getOneAntenatalAccount({
        patient_id,
        [Op.or]: [
          { account_status: AccountStatus.ACTIVE },
          { account_status: AccountStatus.INACTIVE },
        ],
      });
      if (!antenatal)
        throw new BadException('INVALID', StatusCodes.BAD_REQUEST, ANTENATAL_ACCOUNT_REQUIRED);
    }

    return createVisit({ ...body, ...(antenatal && { ante_natal_id: antenatal.id }) });
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
      return searchVisitsType(+currentPage, +pageLimit, search, type);
    }

    if (Object.values(body).length) {
      return getVisitsType(+currentPage, +pageLimit, type);
    }

    return getVisitsType();
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
