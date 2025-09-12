import {
  getEncounterDetailsByStaff,
  getEncounterActions,
  getEncounters,
  getOneEncounter,
} from './admin.repository';

/**
 * Service class for handling encounter-related operations
 * @class EncounterService
 */
export default class EncounterService {
  /**
   * Get encounter details for a specific staff member
   * @static
   * @param params - Parameters for filtering encounter details
   * @returns Promise<any> - Encounter details
   * @memberOf EncounterService
   */
  static async getEncounterDetailsByStaffService(params: any): Promise<any> {
    return await getEncounterDetailsByStaff(params);
  }

  /**
   * Get encounter actions for a specific encounter
   * @static
   * @param encounter_id - The encounter ID
   * @returns Promise<any> - Encounter actions
   * @memberOf EncounterService
   */
  static async getEncounterActionsByIdService(encounter_id: any): Promise<any> {
    return await getEncounterActions(encounter_id);
  }

  /**
   * Get encounters with filtering and pagination
   * @static
   * @param body - Request body containing search parameters
   * @returns Promise<any> - Encounters data
   * @memberOf EncounterService
   */
  static async getEncountersService(body: {
    search?: string;
    start?: Date;
    end?: Date;
    currentPage?: number;
    pageLimit?: number;
  }): Promise<any> {
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
   * @param encounterId - The encounter ID
   * @returns Promise<any> - Encounter data
   * @memberOf EncounterService
   */
  static async getOneEncounterService(encounterId: any): Promise<any> {
    return getOneEncounter({ id: encounterId });
  }
}