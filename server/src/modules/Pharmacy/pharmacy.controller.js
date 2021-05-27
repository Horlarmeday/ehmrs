/* eslint-disable camelcase */
import {
  validateDosageForm,
  validateGenericDrug,
  validateMeasurement,
  validateRouteOfAdministration,
} from './validations';
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
   * @returns {json} json object with status, generic drug data
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

  /**
   * create a dosage form
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, dosage form data
   */
  static async createDosageForm(req, res, next) {
    const { error } = validateDosageForm(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const dosageForm = await PharmacyService.createDosageFormService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: dosageForm,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a dosage form
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, dosage form data
   */
  static async updateDosageForm(req, res, next) {
    const { dosage_form_id } = req.body;
    if (!dosage_form_id) return res.status(400).json({ message: 'dosage form id is required' });

    try {
      const dosageForm = await PharmacyService.updateDosageFormService(req.body);

      return res.status(200).json({
        message: 'Successful! Data updated',
        data: dosageForm,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get dosage forms
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with dosage forms data
   */
  static async getDosageForms(req, res, next) {
    try {
      const dosageForms = await PharmacyService.getDosageForms();

      return res.status(200).json({
        message: 'Data retrieved!',
        data: dosageForms,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a measurement
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, measurement data
   */
  static async createMeasurement(req, res, next) {
    const { error } = validateMeasurement(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const measurement = await PharmacyService.createMeasurementService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: measurement,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a measurement
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, measurement data
   */
  static async updateMeasurement(req, res, next) {
    const { measurement_id } = req.body;
    if (!measurement_id) return res.status(400).json({ message: 'measurement id is required' });

    try {
      const measurement = await PharmacyService.updateMeasurementService(req.body);

      return res.status(200).json({
        message: 'Successful! Data updated',
        data: measurement,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get measurements
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with measurements data
   */
  static async getMeasurements(req, res, next) {
    try {
      const measurements = await PharmacyService.getMeasurements();

      return res.status(200).json({
        message: 'Data retrieved!',
        data: measurements,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a route of administration
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, route of administration data
   */
  static async createRouteOfAdministration(req, res, next) {
    const { error } = validateRouteOfAdministration(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const route = await PharmacyService.createRouteService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: route,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a route of administration
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, route of administration data
   */
  static async updateRouteOfAdministration(req, res, next) {
    const { route_id } = req.body;
    if (!route_id) return res.status(400).json({ message: 'route id is required' });

    try {
      const route = await PharmacyService.updateRouteService(req.body);

      return res.status(200).json({
        message: 'Successful! Data updated',
        data: route,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get routes of administration
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with routes of administration data
   */
  static async getRoutesOfAdministration(req, res, next) {
    try {
      const routes = await PharmacyService.getRoutesOfAdministration();

      return res.status(200).json({
        message: 'Data retrieved!',
        data: routes,
      });
    } catch (e) {
      return next(e);
    }
  }
}
export default PharmacyController;
