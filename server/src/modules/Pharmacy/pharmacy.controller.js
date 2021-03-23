/* eslint-disable camelcase */
import { validateGenericDrug } from './validations';
import { APIError } from '../../util/apiError';
import PharmacyService from './pharmacy.service';

/**
 *
 *
 * @class PharmacyController
 */
class PharmacyController {
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
    if (error) throw new APIError('ERROR', 400, error.details[0].message);

    try {
      const drug = await PharmacyService.createGenericDrugService(
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
    if (!drug_id) throw new APIError('ERROR', 400, 'drug id is required');

    try {
      const drug = await PharmacyService.updateGenericDrugService(req.body);

      return res.status(200).json({
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
      const drugs = await PharmacyService.getGenericDrugs(req.query);

      return res.status(200).json({
        message: 'Data retrieved!',
        data: drugs,
      });
    } catch (e) {
      return next(e);
    }
  }
}
export default PharmacyController;
