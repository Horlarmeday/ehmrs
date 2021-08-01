/* eslint-disable camelcase */
import InsuranceService from './insurance.service';
import { validateHMO, validateInsurance } from './validations';
import { updateHMO, updateInsurance } from './insurance.repository';
import { APIError } from '../../util/apiError';

class InsuranceController {
  /**
   * create a health insurance type
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, insurance data
   */
  static async createInsurance(req, res, next) {
    const { error } = validateInsurance(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const insurance = await InsuranceService.createInsuranceService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful, data saved!',
        data: insurance,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create an HMO
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, HMO data
   */
  static async createHMO(req, res, next) {
    const { error } = validateHMO(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const hmo = await InsuranceService.createHMOService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful, data saved!',
        data: hmo,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get health insurances
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, insurances data
   */
  static async getInsurances(req, res, next) {
    try {
      const insurances = await InsuranceService.getInsurances(req.query);

      return res.status(200).json({
        message: 'Success',
        data: insurances,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get health insurances
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, HMOs data
   */
  static async getHMOs(req, res, next) {
    try {
      const hmos = await InsuranceService.getHMOs(req.query);

      return res.status(200).json({
        message: 'Success',
        data: hmos,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update an health insurances
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, insurance data
   */
  static async updateInsurance(req, res, next) {
    const { insurance_id } = req.body;
    if (!insurance_id) return res.status(400).json({ message: 'insurance id is required' });

    try {
      const insurance = await updateInsurance(req.body);

      return res.status(200).json({
        message: 'Success, data updated',
        data: insurance,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update an HMO
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, HMO data
   */
  static async updateHMO(req, res, next) {
    const { hmo_id } = req.body;
    if (!hmo_id) return res.status(400).json({ message: 'hmo id is required' });

    try {
      const hmo = await updateHMO(req.body);

      return res.status(200).json({
        message: 'Success, data updated',
        data: hmo,
      });
    } catch (e) {
      return next(e);
    }
  }
}
export default InsuranceController;
