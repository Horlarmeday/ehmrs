import InventoryService from './inventory.service';
import { successResponse } from '../../common/responses/success-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { SUCCESS } from '../../core/constants';
import { validateCreateInventory } from './validations';
import { errorResponse } from '../../common/responses/error-responses';

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
    console.log(req.body);
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
}

export default InventoryController;
