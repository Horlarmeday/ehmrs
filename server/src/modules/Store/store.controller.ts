/* eslint-disable camelcase */
import {
  validateDispenseItems,
  validateExportedData,
  validateLaboratoryItem,
  validatePharmacyItem,
  validateReorderItems,
} from './validations';
import StoreService from './store.service';
import { errorResponse } from '../../common/responses/error-responses';
import { exportSelectedData, StatusCodes } from '../../core/helpers/helper';
import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import { DATA_SAVED } from '../AdminSettings/messages/response-messages';
import { SUCCESS } from '../../core/constants';
import { NextFunction, Request, Response } from 'express';
import { DISPENSE_SUCCESSFUL, REORDER_SUCCESSFUL } from './messages/response-messages';
import { isEmpty } from 'lodash';
import { EMPTY_BODY } from '../Alert/messages/response.messages';

/**
 *
 *
 * @class StoreController
 */
class StoreController {
  /**
   * add item to pharmacy store
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, item data
   */
  static async createPharmacyItem(req, res, next) {
    const { error } = validatePharmacyItem(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const item = await StoreService.createPharmacyItemService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: item,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update pharmacy store items
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, item data
   */
  static async updatePharmacyItems(req, res, next) {
    const empty = isEmpty(req.body);
    if (empty)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: EMPTY_BODY,
      });

    try {
      const items = await StoreService.updatePharmacyStoreItems(req.body.items);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: items,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get pharmacy items
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with items data
   */
  static async getPharmacyStoreItems(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await StoreService.getPharmacyItems(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: items,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get selected pharmacy items
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with items data
   */
  static async getSelectedPharmacyStoreItems(req: Request, res: Response, next: NextFunction) {
    const { itemIds } = req.query;
    let selectedItems;
    if (typeof itemIds === 'string') {
      selectedItems = itemIds.split(',').map(Number);
    }

    try {
      const items = await StoreService.getPharmacyStoreItems(selectedItems);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: items,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * add item to pharmacy store
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, item data
   */
  static async dispenseStoreItems(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateDispenseItems(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const item = await StoreService.dispenseItemsFromStore(req.body.items, req.user.sub);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DISPENSE_SUCCESSFUL,
        data: item,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get pharmacy item
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with item data
   */
  static async getPharmacyStoreItem(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    try {
      const item = await StoreService.getPharmacyStoreItem(+id);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: item,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get pharmacy item history
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with item history data
   */
  static async getPharmacyStoreItemHistory(req: Request, res: Response, next: NextFunction) {
    const storeId = req.params.id;

    try {
      const history = await StoreService.getPharmacyStoreItemHistory({ ...req.query, storeId });

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: history,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get pharmacy item logs
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with item logs data
   */
  static async getPharmacyStoreItemLogs(req: Request, res: Response, next: NextFunction) {
    const storeId = req.params.id;

    try {
      const logs = await StoreService.getPharmacyStoreItemLogs({ ...req.query, storeId });

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: logs,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * add item to laboratory store
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, item data
   */
  static async createLaboratoryItem(req, res, next) {
    const { error } = validateLaboratoryItem(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const item = await StoreService.createLaboratoryItemService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: item,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * add item to pharmacy store
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, item data
   */
  static async reorderStoreItems(req, res, next) {
    const { error } = validateReorderItems(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const item = await StoreService.reorderPharmacyStoreItems(req.body.items, req.user.sub);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: REORDER_SUCCESSFUL,
        data: item,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * export selected pharmacy store items
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, item data
   */
  static async exportData(req, res, next) {
    const { error } = validateExportedData(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });
    const { selectedItemsId, dataType, selectAll } = req.body;
    try {
      const { headers, mappedData } = await StoreService.exportData(selectedItemsId, selectAll);
      return exportSelectedData({ res, dataType, data: mappedData, headers });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get laboratory items
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with items data
   */
  static async getLaboratoryItems(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await StoreService.getLaboratoryItems(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: items,
      });
    } catch (e) {
      return next(e);
    }
  }
}
export default StoreController;
