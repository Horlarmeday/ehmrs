import VisitService from './visit.service';
import { validateVisit } from './validations';

class VisitController {
  /**
   * create a patient visit
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, visit data
   */
  static async createVisit(req, res, next) {
    const { error } = validateVisit(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const visit = await VisitService.createVisitService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: visit,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get all visits
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with visits data
   */
  static async getVisits(req, res, next) {
    try {
      const visits = await VisitService.getAllVisits(req.query);

      return res.status(200).json({
        message: 'Data retrieved!',
        data: visits,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get active visits
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with visits data
   */
  static async getActiveVisits(req, res, next) {
    try {
      const visits = await VisitService.getActiveVisits(req.query);

      return res.status(200).json({
        message: 'Data retrieved!',
        data: visits,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get type visits
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with visits data
   */
  static async getTypeVisits(req, res, next) {
    try {
      const visits = await VisitService.getTypeVisits(req.query);

      return res.status(200).json({
        message: 'Data retrieved!',
        data: visits,
      });
    } catch (e) {
      return next(e);
    }
  }
}

export default VisitController;
