/* eslint-disable camelcase */
import { validateLaboratoryItem, validatePharmacyItem } from './validations';
import StoreService from './store.service';

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
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const item = await StoreService.createPharmacyItemService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: item,
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
  static async getPharmacyItems(req, res, next) {
    try {
      const items = await StoreService.getPharmacyItems(req.query);

      return res.status(200).json({
        message: 'Data retrieved!',
        data: items,
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
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const item = await StoreService.createLaboratoryItemService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: item,
      });
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
  static async getLaboratoryItems(req, res, next) {
    try {
      const items = await StoreService.getLaboratoryItems(req.query);

      return res.status(200).json({
        message: 'Data retrieved!',
        data: items,
      });
    } catch (e) {
      return next(e);
    }
  }
}
export default StoreController;
