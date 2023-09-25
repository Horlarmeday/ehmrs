import { CreateBulkRequestBody, UpdateRequestStatus } from './types/request.types';
import {
  createBulkRequest,
  getCurrentUserRequests,
  getRequests,
  updateRequestStatus,
} from './request.repository';
import { Request } from '../../database/models';
import { ParsedQs } from 'qs';

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
   */
  static async updateRequestStatus(body: UpdateRequestStatus[]) {
    return updateRequestStatus(body);
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
