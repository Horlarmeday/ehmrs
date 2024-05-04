/* eslint-disable camelcase */
import {
  validateAddTestResult,
  validateApproveTestResults,
  validateNhisTest,
  validateTest,
  validateTestResults,
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
import { validateUpdateTestPrescription } from './validations';
import { downloadTestResult } from '../../core/helpers/downloadTestResult';
import { stat } from 'fs';

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

  /*************************
   * LABORATORY RESULTS
   *************************/

  /**
   * samples to collect
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test samples data
   */
  static async samplesToCollect(req: Request, res: Response, next: NextFunction) {
    try {
      const samples = await LaboratoryService.samplesToCollect(req.query);

      return res.status(200).json({
        message: 'Success',
        data: samples,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get one sample to collect
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test prescription data
   */
  static async getOneSampleToCollect(req: Request, res: Response, next: NextFunction) {
    try {
      const prescription = await LaboratoryService.getOneSampleToCollect(req.params.id);

      return res.status(200).json({
        message: 'Success',
        data: prescription,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Generate Lab accession number
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, Lab accession number data
   */
  static async generateLabAccessionNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const accessionNumber = await LaboratoryService.generateLabAccessionNumber();

      return res.status(200).json({
        message: 'Success',
        data: accessionNumber,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Update test prescription
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test prescription data
   */
  static async collectTestSample(req, res: Response, next: NextFunction) {
    const { error } = validateUpdateTestPrescription(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const testPrescription = await LaboratoryService.collectTestSample(req.body);

      return res.status(StatusCodes.CREATED).json({
        message: DATA_UPDATED,
        data: testPrescription,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get all samples collected
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with tests data
   */
  static async samplesCollected(req: Request, res: Response, next: NextFunction) {
    try {
      const tests = await LaboratoryService.samplesCollected(req.query);

      return successResponse({ res, message: SUCCESS, httpCode: StatusCodes.OK, data: tests });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get one sample to collect
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test prescription data
   */
  static async getOneCollectedSample(req: Request, res: Response, next: NextFunction) {
    try {
      const prescription = await LaboratoryService.getOneCollectedSample(req.params.id);
      return res.status(200).json({
        message: 'Success',
        data: prescription,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Add test result
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test result data
   */
  static async addTestResults(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateAddTestResult(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const testPrescription = await LaboratoryService.appendTestResults({
        ...req.body,
        staff_id: req.user.sub,
      });

      return res.status(StatusCodes.CREATED).json({
        message: DATA_UPDATED,
        data: testPrescription,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Validate test results
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test result data
   */
  static async validateTestResults(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateTestResults(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const testPrescription = await LaboratoryService.validateTestResults({
        ...req.body,
        staff_id: req.user.sub,
      });

      return res.status(StatusCodes.CREATED).json({
        message: DATA_UPDATED,
        data: testPrescription,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Approve test results
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, prescribed test data
   */
  static async approveTestResults(req, res: Response, next: NextFunction) {
    const { error } = validateApproveTestResults(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const testPrescription = await LaboratoryService.approveTestResults({
        ...req.body,
        staff_id: req.user.sub,
      });

      return res.status(StatusCodes.CREATED).json({
        message: DATA_UPDATED,
        data: testPrescription,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get all samples collected
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with tests data
   */
  static async getTestResults(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await LaboratoryService.getTestResults(req.query);

      return successResponse({ res, message: SUCCESS, httpCode: StatusCodes.OK, data: results });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get one sample to collect
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test prescription data
   */
  static async getTestResult(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await LaboratoryService.getTestResult(+req.params.id);

      return res.status(200).json({
        message: 'Success',
        data: result,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Download test result
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test result pdf data
   */
  static async downloadTestResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientInfo, testResults } = await LaboratoryService.downloadTestResult(
        +req.params.id
      );
      return downloadTestResult(patientInfo, testResults, res);
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get all samples collected
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with tests data
   */
  static async getVerifiedTestResults(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await LaboratoryService.getVerifiedResults(req.query);

      return successResponse({ res, message: SUCCESS, httpCode: StatusCodes.OK, data: results });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get all samples collected
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with tests data
   */
  static async getTestTodayStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await LaboratoryService.getTodayTestStats();

      return successResponse({ res, message: SUCCESS, httpCode: StatusCodes.OK, data: stats });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get one test prescription
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, test prescription data
   */
  static async getOneTestPrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const testPrescription = await LaboratoryService.getTestPrescription(+req.params.id);

      return res.status(200).json({
        message: 'Success',
        data: testPrescription,
      });
    } catch (e) {
      return next(e);
    }
  }

  /** ***********************
   * NHIS TESTS - DEPRECATED
   ********************** */

  // /**
  //  * create a test
  //  *
  //  * @static
  //  * @param {object} req express request object
  //  * @param {object} res express response object
  //  * @param {object} next next middleware
  //  * @returns {json} json object with status, test data
  //  */
  // static async createNhisTest(req, res, next) {
  //   const { error } = validateNhisTest(req.body);
  //   if (error)
  //     return errorResponse({
  //       res,
  //       message: error.details[0].message,
  //       httpCode: StatusCodes.BAD_REQUEST,
  //     });
  //
  //   try {
  //     const test = await LaboratoryService.createNhisTestService({
  //       ...req.body,
  //       staff_id: req.user.sub,
  //     });
  //
  //     return successResponse({
  //       res,
  //       data: test,
  //       httpCode: StatusCodes.CREATED,
  //       message: DATA_SAVED,
  //     });
  //   } catch (e) {
  //     return next(e);
  //   }
  // }
  //
  // /**
  //  * update a NHIS test
  //  *
  //  * @static
  //  * @param {object} req express request object
  //  * @param {object} res express response object
  //  * @param {object} next next middleware
  //  * @returns {json} json object with status, NHIS test data
  //  */
  // static async updateNhisTest(req: Request, res: Response, next: NextFunction) {
  //   const { test_id } = req.body;
  //   if (!test_id)
  //     return errorResponse({ res, message: TEST_REQUIRED, httpCode: StatusCodes.BAD_REQUEST });
  //
  //   try {
  //     const test = await LaboratoryService.updateNhisTestService(req.body);
  //
  //     return successResponse({ res, httpCode: StatusCodes.OK, message: DATA_UPDATED, data: test });
  //   } catch (e) {
  //     return next(e);
  //   }
  // }
  //
  // /**
  //  * get NHIS tests
  //  *
  //  * @static
  //  * @param {object} req express request object
  //  * @param {object} res express response object
  //  * @param {object} next next middleware
  //  * @returns {json} json object with NHIS tests data
  //  */
  // static async getNhisTests(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const tests = await LaboratoryService.getNhisTests(req.query);
  //
  //     return successResponse({ res, httpCode: StatusCodes.OK, message: SUCCESS, data: tests });
  //   } catch (e) {
  //     return next(e);
  //   }
  // }
}
export default LaboratoryController;
