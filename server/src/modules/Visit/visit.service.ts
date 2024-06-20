import {
  createVisit,
  endVisit,
  getActiveVisits,
  getLastActiveVisit,
  getVisit,
  getVisitById,
  getVisits,
  getCategoryVisits,
  searchActiveVisits,
  searchVisits,
  searchCategoryVisits,
  getProfessionalAssignedVisits,
  getVisitPrescriptions,
  updateVisit,
} from './visit.repository';
import { Visit } from '../../database/models';
import { CreateVisit } from './interface/visit.interface';
import { VisitCategory } from '../../database/models/visit';
import { getOneAntenatalAccount } from '../Antenatal/antenatal.repository';
import { AccountStatus } from '../../database/models/antenatal';
import { BadException } from '../../common/util/api-error';
import { StatusCodes } from '../../core/helpers/helper';
import { Op } from 'sequelize';
import {
  ANTENATAL_ACCOUNT_REQUIRED,
  IMMUNIZATION_ACCOUNT_REQUIRED,
} from './messages/response.messages';
import { getOneService } from '../AdminSettings/admin.repository';
import { prescribeService } from '../Orders/Service/service-order.repository';
import { getPatientById } from '../Patient/patient.repository';
import { Gender } from '../../database/models/staff';
import { FEMALE_REQUIRED } from '../Antenatal/messages/antenatal.messages';
import { getOneImmunization } from '../Immunization/immunization.repository';

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
    const { patient_id, ante_natal_id, category, service_id, staff_id, immunization_id } = body;
    const [patient, visit] = await Promise.all([
      getPatientById(patient_id),
      getLastActiveVisit(patient_id),
    ]);
    if (category === VisitCategory.ANC && patient.gender !== Gender.FEMALE) {
      throw new BadException('INVALID', StatusCodes.BAD_REQUEST, FEMALE_REQUIRED);
    }

    if (visit) await endVisit(visit); // end existing visit - since 2 visits cannot be active

    // This check happens if the visit category is ANC and a visit wants to be created when an antenatal account already exists
    // `ante_natal_id` field in the body only happens when a visit wants to be created
    // immediately a patient was enrolled for antenatal
    if (category === VisitCategory.ANC && !ante_natal_id) {
      const antenatal = await getOneAntenatalAccount({
        patient_id,
        [Op.or]: [
          { account_status: AccountStatus.ACTIVE },
          { account_status: AccountStatus.INACTIVE },
        ],
      });
      if (!antenatal)
        throw new BadException('INVALID', StatusCodes.BAD_REQUEST, ANTENATAL_ACCOUNT_REQUIRED);
      body.ante_natal_id = antenatal.id;
    }

    if (category === VisitCategory.Immunization && !immunization_id) {
      const immunization = await getOneImmunization({
        patient_id,
      });
      if (!immunization)
        throw new BadException('INVALID', StatusCodes.BAD_REQUEST, IMMUNIZATION_ACCOUNT_REQUIRED);
      body.immunization_id = immunization.id;
    }

    const createdVisit = await createVisit(body);

    if (service_id) {
      const service = await getOneService({ id: service_id });
      await prescribeService({
        service_id,
        service_type: 'Cash',
        price: service.price,
        patient_id,
        requester: staff_id,
        ante_natal_id: body?.ante_natal_id,
        visit_id: createdVisit.id,
      });
    }
    return createdVisit;
  }

  /**
   * get active visits
   *
   * @static
   * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with visits data
   * @param body
   * @memberOf VisitService
   */
  static async getActiveVisits(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: Visit[]; currentPage: number }> {
    const { currentPage, pageLimit, search, start, end, filter } = body;

    if (search) {
      return searchActiveVisits({ currentPage, pageLimit, search, filter });
    }

    if (Object.values(body).length) {
      return getActiveVisits({ currentPage, pageLimit, start, end, filter });
    }

    return getActiveVisits({ filter });
  }

  /**
   * get all visits
   *
   * @static
   * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with visits data
   * @param body
   * @memberOf VisitService
   */
  static async getAllVisits(
    body
  ): Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }> {
    const { currentPage, pageLimit, search, start, end } = body;
    if (search) {
      return searchVisits({ currentPage, pageLimit, search });
    }

    if (Object.values(body).length) {
      return getVisits({ currentPage, pageLimit, start, end });
    }

    return getVisits({});
  }

  /**
   * get typed visits
   *
   * @static
   * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with visits data
   * @param body
   * @memberOf VisitService
   */
  static async getCategoryVisits(
    body
  ): Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }> {
    const { currentPage, pageLimit, search, category, filter } = body;

    if (search) {
      return searchCategoryVisits({ currentPage, pageLimit, search, category, filter });
    }

    if (Object.values(body).length) {
      return getCategoryVisits({ currentPage, pageLimit, category, filter });
    }

    return getCategoryVisits({ filter, category });
  }

  /**
   * get professional assigned visits
   *
   * @static
   * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with visits data
   * @param body
   * @memberOf VisitService
   */
  static async getProfessionalAssignedVisits(
    body
  ): Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }> {
    const { currentPage, pageLimit, search, role, start, end, filter } = body || {};

    if (start && end) {
      return getProfessionalAssignedVisits({
        currentPage,
        start,
        end,
        pageLimit,
        search,
        role,
        filter,
      });
    }

    if (Object.values(body).length) {
      return getProfessionalAssignedVisits({
        currentPage,
        pageLimit,
        search,
        role,
        filter,
      });
    }

    return getProfessionalAssignedVisits({ search, role, filter });
  }

  /**
   * get patient last active visit or create new one
   *
   * @static
   * @returns {Promise<Visit>} json object with item data
   * @memberOf VisitService
   * @param body
   */
  static async getLastActiveVisitOrCreate(body: CreateVisit) {
    const visit = await getLastActiveVisit(body.patient_id);
    if (!visit) {
      const newVisit = await createVisit(body);
      return { isExist: false, visit: newVisit };
    }
    return { isExist: true, visit };
  }

  /**
   * get patient visit by id
   *
   * @static
   * @returns {Promise<Visit>} json object with item data
   * @memberOf VisitService
   * @param id
   */
  static async getVisitById(id: number): Promise<Visit> {
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

  /**
   * get all prescriptions in a visit
   *
   * @static
   * @memberOf VisitService
   * @param id
   */
  static async getVisitPrescriptions(id: number) {
    return getVisitPrescriptions(id);
  }

  /**
   * update a visit
   *
   * @static
   * @returns {json} json object with visit data
   * @memberOf VisitService
   * @param visitId
   * @param body
   */
  static async updateVisit(visitId: number, body: Partial<Visit>) {
    return updateVisit({ id: visitId }, body);
  }
}

export default VisitService;
