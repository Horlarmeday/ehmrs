import { CreateBulkRequestBody, ProcessRequestBody } from './types/request.types';
import {
  createBulkRequest,
  getCurrentUserRequests,
  getRequestQuery,
  getRequests,
  updateRequestStatus,
} from './request.repository';
import { Request } from '../../database/models';
import { ParsedQs } from 'qs';
import { getInventoryItemQuery } from '../Inventory/inventory.repository';
import { getOnePharmacyStoreItem } from '../Store/store.repository';
import { ItemsToDispensedBody } from '../Inventory/types/inventory-item.types';
import StoreService from '../Store/store.service';
import { RequestStatus } from '../../database/models/request';

export class RequestService {
  /**
   * create bulk requests
   *
   * @static
   * @returns {json} json object with requests data
   * @memberOf RequestService
   * @param createBulkRequestBody[]
   * @param requestedBy
   */
  static async createBulkRequest(
    createBulkRequestBody: CreateBulkRequestBody[],
    requestedBy: number
  ): Promise<Request[]> {
    const data = createBulkRequestBody.map(request => ({
      ...request,
      requested_by: requestedBy,
    }));
    return createBulkRequest(data);
  }

  /**
   * get requests
   *
   * @static
   * @returns {json} json object with requests data
   * @param body
   * @memberOf RequestService
   */
  static async getRequests(body: {
    [s: string]: string | ParsedQs | string[] | ParsedQs[];
  }): Promise<{ currentPage: number; docs: Request[]; perPage: number; total: number }> {
    const { currentPage, pageLimit, search, start, end } = body;
    if (start && end) {
      return getRequests({
        currentPage: +currentPage,
        pageLimit: +pageLimit,
        start,
        end,
      });
    }

    if (search) {
      return getRequests({
        currentPage: +currentPage,
        pageLimit: +pageLimit,
        search,
      });
    }

    if (Object.values(body).length) {
      return getRequests({
        currentPage: +currentPage,
        pageLimit: +pageLimit,
      });
    }

    return getRequests({});
  }

  /**
   * update requests status
   *
   * @static
   * @returns {json} json object with requests data
   * @memberOf RequestService
   * @param body
   * @param staffId
   */
  static async processRequests(body: ProcessRequestBody[], staffId: number) {
    const dispenseItems = await Promise.all(
      body
        .filter(data => data.status === RequestStatus.GRANTED)
        .map(async data => {
          const request = await getRequestQuery({ id: data.id });
          const inventoryItem = await getInventoryItemQuery({ id: request.item_id });
          const storeItem = await getOnePharmacyStoreItem({
            drug_id: inventoryItem.drug_id,
            drug_type: inventoryItem.drug_type,
          });

          const dispenseData: ItemsToDispensedBody = {
            id: storeItem.id,
            drug_type: inventoryItem.drug_type,
            quantity_to_dispense: request.quantity,
            dispensary: request.inventory_id,
            unit_id: inventoryItem.unit_id,
            receiver: request.requested_by,
            drug_name: inventoryItem?.drug?.name,
          };
          return dispenseData;
        })
    );
    await StoreService.dispenseItemsFromStore(dispenseItems, staffId);
    return updateRequestStatus(body, staffId);
  }

  /**
   * get current user requests
   *
   * @static
   * @returns {json} json object with requests data
   * @param body
   * @param currentUserId
   * @memberOf RequestService
   */
  static async getCurrentUserRequests(
    body: {
      [s: string]: string | ParsedQs | string[] | ParsedQs[];
    },
    currentUserId: number
  ): Promise<{ currentPage: number; docs: Request[]; perPage: number; total: number }> {
    const { currentPage, pageLimit, search, start, end } = body;
    if (start && end) {
      return getCurrentUserRequests({
        currentPage: +currentPage,
        pageLimit: +pageLimit,
        start,
        end,
        currentUserId,
      });
    }

    if (search) {
      return getCurrentUserRequests({
        currentPage: +currentPage,
        pageLimit: +pageLimit,
        search,
        currentUserId,
      });
    }

    if (Object.values(body).length) {
      return getCurrentUserRequests({
        currentPage: +currentPage,
        pageLimit: +pageLimit,
        currentUserId,
      });
    }

    return getCurrentUserRequests({ currentUserId });
  }
}
