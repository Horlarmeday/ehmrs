import { getEncounters, getOneEncounter } from './admin.repository';

class EncounterService {
  /**
   * Get encounter details for a specific staff member
   * @static
   * @param params
   * @returns encounter details
   * @memberOf EncounterService
   */
  static async getEncounterDetailsByStaffService(params: {
    staff_id: number;
    start: Date;
    end: Date;
  }) {
    // return await getEncounterDetailsByStaff(params);
  }

  /**
   * Get encounter actions for a specific encounter
   * @static
   * @param encounter_id
   * @returns encounter actions
   * @memberOf EncounterService
   */
  static async getEncounterActionsByIdService(encounter_id: number) {
    // return await getEncounterActions(encounter_id);
  }

  /**
   * Get encounters with filtering and pagination
   * @static
   * @param body
   * @returns encounters data
   * @memberOf EncounterService
   */
  static async getEncountersService(body: {
    search?: string;
    start?: Date;
    end?: Date;
    currentPage?: number;
    pageLimit?: number;
  }) {
    const { search, start, end, currentPage, pageLimit } = body;

    if (Object.values(body).length) {
      return getEncounters({
        currentPage,
        pageLimit,
        search,
        start,
        end,
      });
    }

    return getEncounters({ start, end });
  }

  /**
   * Get one encounter by ID
   * @static
   * @param encounterId
   * @returns encounter data
   * @memberOf EncounterService
   */
  static async getOneEncounterService(encounterId: number) {
    return getOneEncounter({ id: encounterId });
  }
}

export default EncounterService;
