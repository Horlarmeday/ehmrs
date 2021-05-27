import { validateTriage } from './validations';
import TriageService from './triage.service';

class TriageController {
  /**
   * create a patient vital signs
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, vital signs data
   */
  static async createTriage(req, res, next) {
    const { error } = validateTriage(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const triage = await TriageService.createTriageService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: triage,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get all triage done in a visit
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with triage data
   */
  static async getTriageVisit(req, res, next) {
    try {
      const triage = await TriageService.getVisitTriage(req.params.id);

      return res.status(200).json({
        message: 'Data retrieved!',
        data: triage,
      });
    } catch (e) {
      return next(e);
    }
  }
}
export default TriageController;
