/* eslint-disable camelcase */
import {
  validateNhisTest,
  validateTest,
  validateTestSample,
  validateTestTariff,
} from './validations';
import LaboratoryService from './laboratory.service';
import { StatusCodes } from '../../core/helpers/helper';
import { errorResponse } from '../../common/responses/error-responses';
import { successResponse } from '../../common/responses/success-responses';
import { DATA_SAVED, DATA_UPDATED } from '../AdminSettings/messages/response-messages';
import { TEST_REQUIRED } from '../Orders/Laboratory/messages/response-messages';
import { NextFunction, Request, Response } from 'express';
import { SUCCESS } from '../../core/constants';

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
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const sample = await LaboratoryService.createSampleService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return res.status(201).json({
        message: DATA_SAVED,
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
        message: DATA_UPDATED,
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
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const test = await LaboratoryService.createTestService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
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
  static async updateTest(req: Request, res: Response, next: NextFunction) {
    const { test_id } = req.body;
    if (!test_id)
      return errorResponse({ res, httpCode: StatusCodes.BAD_REQUEST, message: TEST_REQUIRED });

    try {
      const test = await LaboratoryService.updateTestService(req.body);

      return successResponse({ res, data: test, message: DATA_UPDATED, httpCode: StatusCodes.OK });
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
  static async getTests(req: Request, res: Response, next: NextFunction) {
    try {
      const tests = await LaboratoryService.getTests(req.query);

      return successResponse({ res, message: SUCCESS, httpCode: StatusCodes.OK, data: tests });
    } catch (e) {
      return next(e);
    }
  }

  /** ***********************
   * TEST TARIFFS
   ********************** */

  /**
   * create a test tariff
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test data
   */
  static async createTestTariff(req, res, next) {
    const { error } = validateTestTariff(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const test = await LaboratoryService.createTestTariffService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: test,
      });
    } catch (e) {
      return next(e);
    }
  }

  /** ***********************
   * NHIS TESTS - DEPRECATED
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
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const test = await LaboratoryService.createNhisTestService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        data: test,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
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
  static async updateNhisTest(req: Request, res: Response, next: NextFunction) {
    const { test_id } = req.body;
    if (!test_id)
      return errorResponse({ res, message: TEST_REQUIRED, httpCode: StatusCodes.BAD_REQUEST });

    try {
      const test = await LaboratoryService.updateNhisTestService(req.body);

      return successResponse({ res, httpCode: StatusCodes.OK, message: DATA_UPDATED, data: test });
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
  static async getNhisTests(req: Request, res: Response, next: NextFunction) {
    try {
      const tests = await LaboratoryService.getNhisTests(req.query);

      return successResponse({ res, httpCode: StatusCodes.OK, message: SUCCESS, data: tests });
    } catch (e) {
      return next(e);
    }
  }
}
export default LaboratoryController;
