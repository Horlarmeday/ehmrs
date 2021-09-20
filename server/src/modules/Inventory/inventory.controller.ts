import InventoryService from './inventory.service';
import { successResponse } from '../../common/responses/success-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { SUCCESS } from '../../core/constants';

class InventoryController {
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
    const { inventoryType } = req.params;
    try {
      const items = await InventoryService.getOutpatientInventoryItems({
        ...req.query,
        inventoryType,
      });

      return successResponse({ res, data: items, httpCode: StatusCodes.OK, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }
}

export default InventoryController;
