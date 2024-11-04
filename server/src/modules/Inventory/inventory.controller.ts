import InventoryService from './inventory.service';
import { successResponse } from '../../common/responses/success-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { SUCCESS } from '../../core/constants';
import {
  validateCreateInventory,
  validateRequestDrugsToStore,
  validateUpdateReturnRequest,
} from './validations';
import { errorResponse } from '../../common/responses/error-responses';
import { isEmpty } from 'lodash';
import { EMPTY_BODY } from '../Alert/messages/response.messages';
import { NextFunction, Request, Response } from 'express';

class InventoryController {
  /**
   * create inventory
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with inventory data
   */
  static async createInventory(req, res, next) {
    const { error } = validateCreateInventory(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const inventory = await InventoryService.createInventory({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        data: inventory,
        httpCode: StatusCodes.CREATED,
        message: SUCCESS,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update inventory item
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with inventory data
   */
  static async updateInventoryItem(req: Request, res: Response, next: NextFunction) {
    const error = isEmpty(req.body);
    if (error)
      return errorResponse({
        res,
        message: EMPTY_BODY,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const inventoryItem = await InventoryService.updateInventoryItem(req.body);

      return successResponse({
        res,
        data: inventoryItem,
        httpCode: StatusCodes.CREATED,
        message: SUCCESS,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update inventory item
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with inventory data
   */
  static async updateReturnRequests(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateUpdateReturnRequest(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const inventoryItem = await InventoryService.updateReturnRequests(req.body, req.user.sub);

      return successResponse({
        res,
        data: inventoryItem,
        httpCode: StatusCodes.CREATED,
        message: SUCCESS,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * request return inventory item to store
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with return item data
   */
  static async createRequestReturnDrugsToStore(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateRequestDrugsToStore(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const inventoryItem = await InventoryService.requestReturnDrugsToStore(
        req.body,
        req.user.sub
      );

      return successResponse({
        res,
        data: inventoryItem,
        httpCode: StatusCodes.CREATED,
        message: SUCCESS,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get inventories
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with inventories data
   */
  static async getInventories(req, res, next) {
    try {
      const inventories = await InventoryService.getInventories();

      return successResponse({
        res,
        data: inventories,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get inventory items
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with inventory items data
   */
  static async getInventoryItems(req, res, next) {
    try {
      const items = await InventoryService.getInventoryItems({
        ...req.query,
        inventory: req.params.id,
      });

      return successResponse({ res, data: items, httpCode: StatusCodes.OK, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get inventory items
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with inventory items data
   */
  static async getInventoryItem(req, res, next) {
    const { id } = req.params;

    try {
      const items = await InventoryService.getInventoryItem(id);

      return successResponse({ res, data: items, httpCode: StatusCodes.OK, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get inventory items
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with inventory items data
   */
  static async getInventoryItemHistory(req, res, next) {
    const inventoryItemId = req.params.id;

    try {
      const history = await InventoryService.getInventoryItemHistory({
        ...req.query,
        inventoryItemId,
      });

      return successResponse({ res, data: history, httpCode: StatusCodes.OK, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get inventory returns requests
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with inventory returns requests data
   */
  static async getInventoryReturnRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const returnRequests = await InventoryService.getInventoryReturnRequests(req.query);

      return successResponse({
        res,
        data: returnRequests,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
      });
    } catch (e) {
      return next(e);
    }
  }
}

export default InventoryController;
