import { CreateBulkRequestBody, ProcessRequestBody } from './types/request.types';
import {
  createBulkRequest,
  getCurrentUserRequests,
  getRequestQuery,
  getRequests,
  updateRequestStatus,
} from './request.repository';
import { PharmacyStore, Request } from '../../database/models';
import { ParsedQs } from 'qs';
import { getInventoryItemQuery } from '../Inventory/inventory.repository';
import { getOnePharmacyStoreItem } from '../Store/store.repository';
import { ItemsToDispensedBody } from '../Inventory/types/inventory-item.types';
import StoreService from '../Store/store.service';
import { RequestStatus } from '../../database/models/request';
import { BadException } from '../../common/util/api-error';

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
    const { currentPage, pageLimit, search, start, end, filter } = body;
    if (start && end) {
      return getRequests({
        currentPage: +currentPage,
        pageLimit: +pageLimit,
        start,
        end,
        filter,
      });
    }

    if (search) {
      return getRequests({
        currentPage: +currentPage,
        pageLimit: +pageLimit,
        search,
        filter,
      });
    }

    if (Object.values(body).length) {
      return getRequests({
        currentPage: +currentPage,
        pageLimit: +pageLimit,
        filter,
      });
    }

    return getRequests({ filter });
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
    const rejectedRequests = body.filter(data => data.status === RequestStatus.DECLINED);
    const grantedRequests = body.filter(data => data.status === RequestStatus.GRANTED);

    let updatedRejectedRequests = [];
    // update rejected requests status
    if (rejectedRequests?.length) {
      updatedRejectedRequests = await updateRequestStatus(rejectedRequests, staffId);
    }

    if (!grantedRequests?.length) {
      return {
        errors: [],
        requests: updatedRejectedRequests,
      };
    }

    const itemsToDispense = await Promise.all(
      grantedRequests.map(async data => {
        const request = await getRequestQuery({ id: data.id });
        const inventoryItem = await getInventoryItemQuery({
          id: request.item_id,
          inventory_id: request.inventory_id,
        });
        if (!inventoryItem) {
          throw new BadException('Error', 404, `drug not found in the inventory`);
        }
        const storeItem = await getOnePharmacyStoreItem({
          drug_id: inventoryItem.drug_id,
          drug_type: inventoryItem.drug_type,
        });

        const dispenseData: ItemsToDispensedBody & { request_id: number } = {
          id: storeItem.id,
          drug_type: inventoryItem.drug_type,
          quantity_to_dispense: request.quantity,
          dispensary: request.inventory_id,
          unit_id: inventoryItem.unit_id,
          receiver: request.requested_by,
          drug_name: inventoryItem?.drug?.name,
          request_id: request.id,
        };
        return dispenseData;
      })
    );

    const results = await StoreService.dispenseItemsFromStore(itemsToDispense, staffId);
    const errors = results.filter(res => res.status === 'rejected' && res.reason);

    const itemsDispensed = (results
      .filter(item => item.status === 'fulfilled' && item.value)
      .map(res => 'value' in res && res.value) as unknown) as PharmacyStore[];

    const itemsToUpdate = itemsToDispense
      .filter(item => itemsDispensed.some(dispensed => dispensed.id === item.id))
      .map(item => ({
        id: item.request_id,
        status: RequestStatus.GRANTED,
      }));

    const updatedRequests = await updateRequestStatus(itemsToUpdate, staffId);

    console.log(itemsDispensed, 'itemsDispensed');
    console.log(updatedRequests, 'updatedRequests');
    console.log(errors, 'errors');

    return {
      errors: errors.map(error => 'reason' in error && error.reason?.message),
      requests: [...updatedRejectedRequests, ...updatedRequests],
    };
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
