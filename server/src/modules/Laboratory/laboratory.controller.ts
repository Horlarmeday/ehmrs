/* eslint-disable camelcase */
import { validateNhisTest, validateTest, validateTestSample } from './validations';
import LaboratoryService from './laboratory.service';

class LaboratoryController {
  /** ***********************
   * TEST SAMPLE
   ********************** */

  /**
   * create a test sample
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test sample data
   */
  static async createTestSample(req, res, next) {
    const { error } = validateTestSample(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const sample = await LaboratoryService.createSampleService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: sample,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a test sample
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test sample data
   */
  static async updateTestSample(req, res, next) {
    const { sample_id } = req.body;
    if (!sample_id) return res.status(400).json({ message: 'Sample id is required' });

    try {
      const sample = await LaboratoryService.updateSampleService(req.body);

      return res.status(200).json({
        message: 'Successful! Data updated',
        data: sample,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get test samples
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with test samples data
   */
  static async getTestSamples(req, res, next) {
    try {
      const samples = await LaboratoryService.getTestSamples(req.query);

      return res.status(200).json({
        message: 'Data retrieved!',
        data: samples,
      });
    } catch (e) {
      return next(e);
    }
  }

  /** ***********************
   * TESTS
   ********************** */

  /**
   * create a test
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test data
   */
  static async createTest(req, res, next) {
    const { error } = validateTest(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const test = await LaboratoryService.createTestService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: test,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a test
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test data
   */
  static async updateTest(req, res, next) {
    const { test_id } = req.body;
    if (!test_id) return res.status(400).json({ message: 'Test id is required' });

    try {
      const test = await LaboratoryService.updateTestService(req.body);

      return res.status(200).json({
        message: 'Successful! Data updated',
        data: test,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get tests
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with tests data
   */
  static async getTests(req, res, next) {
    try {
      const tests = await LaboratoryService.getTests(req.query);

      return res.status(200).json({
        message: 'Data retrieved!',
        data: tests,
      });
    } catch (e) {
      return next(e);
    }
  }

  /** ***********************
   * NHIS TESTS
   ********************** */

  /**
   * create a test
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test data
   */
  static async createNhisTest(req, res, next) {
    const { error } = validateNhisTest(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const test = await LaboratoryService.createNhisTestService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: test,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a NHIS test
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, NHIS test data
   */
  static async updateNhisTest(req, res, next) {
    const { test_id } = req.body;
    if (!test_id) return res.status(400).json({ message: 'Test id is required' });

    try {
      const test = await LaboratoryService.updateNhisTestService(req.body);

      return res.status(200).json({
        message: 'Successful! Data updated',
        data: test,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get NHIS tests
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with NHIS tests data
   */
  static async getNhisTests(req, res, next) {
    try {
      const tests = await LaboratoryService.getNhisTests(req.query);

      return res.status(200).json({
        message: 'Data retrieved!',
        data: tests,
      });
    } catch (e) {
      return next(e);
    }
  }
}
export default LaboratoryController;
