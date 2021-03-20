/* eslint-disable camelcase */
import { validateGenericDrug, validatePharmacyItem } from './validations';
import StoreService from './store.service';

/**
 *
 *
 * @class StoreController
 */
class StoreController {
  /**
   * create a generic drug
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, drug data
   */
  static async createGenericDrug(req, res, next) {
    const { error } = validateGenericDrug(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    try {
      const drug = await StoreService.createGenericDrugService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: drug,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a generic drug
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, generic drug data
   */
  static async updateGenericDrug(req, res, next) {
    const { drug_id } = req.body;
    if (!drug_id) return res.status(400).json('Drug id is required');

    try {
      const drug = await StoreService.updateGenericDrugService(req.body);

      return res.status(204).json({
        message: 'Successful! Data updated',
        data: drug,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get generic drugs
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with generic drugs data
   */
  static async getGenericDrugs(req, res, next) {
    try {
      const drugs = await StoreService.getGenericDrugs(req.query);

      return res.status(200).json({
        message: 'Data retrieved!',
        data: drugs,
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
  static async createPharmacyItem(req, res, next) {
    const { error } = validatePharmacyItem(req.body);
    if (error) return res.status(400).json(error.details[0].message);

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
}
export default StoreController;
