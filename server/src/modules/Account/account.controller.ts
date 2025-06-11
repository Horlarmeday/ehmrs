import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { successResponse } from '../../common/responses/success-responses';
import { DATA_SAVED } from '../AdminSettings/messages/response-messages';
import { NextFunction, Request, Response } from 'express';
import { AccountService } from './account.service';
import {
  validatePaymentHistory,
  validateChartOfAccount,
  validateUpdateChartOfAccount,
  validateJournalEntry,
  validateCostCenter,
  validateUpdateCostCenter,
  validateFinancialStatement,
  validateTrendAnalysis,
  validateCustomReport,
  validatePaymentReceipt,
} from './validations';
import { SUCCESS } from '../../core/constants';
import { getContentType } from './helper/account.helper';
import { printReceiptPDF, PrintReceiptType } from './helper/print.helper';

export class AccountController {
  /**
   * create payment history
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, payment history data
   */
  static async createPaymentHistory(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validatePaymentHistory(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const data = await AccountService.createPaymentHistory({
        ...req.body,
        staff_id: req.user.sub,
        visit_id: req.params.id,
      });

      return successResponse({ res, httpCode: 201, data, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get a patient payment history
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with payment history data
   */
  static async getPatientPaymentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const paymentHistory = await AccountService.getPaymentHistory({
        ...req.query,
        patient_id: req.params.id,
      });

      return successResponse({ res, message: SUCCESS, data: paymentHistory, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Create a new chart of account
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, chart of account data
   */
  static async createChartOfAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = validateChartOfAccount(req.body);
      if (error) {
        return errorResponse({
          res,
          message: error.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const data = await AccountService.createChartOfAccount(req.body);
      return successResponse({ res, httpCode: 201, data, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Update an existing chart of account
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, updated chart of account data
   */
  static async updateChartOfAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = validateUpdateChartOfAccount({
        ...req.body,
        id: req.params.id,
      });
      if (error) {
        return errorResponse({
          res,
          message: error.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const data = await AccountService.updateChartOfAccount({
        ...req.body,
        id: req.params.id,
      });
      return successResponse({ res, httpCode: 200, data, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get all chart of accounts
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with chart of accounts data
   */
  static async getChartOfAccounts(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountService.getChartOfAccounts(req.query);
      return successResponse({ res, data, httpCode: 200, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Create a new journal entry
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, journal entry data
   */
  static async createJournalEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = validateJournalEntry(req.body);
      if (error) {
        return errorResponse({
          res,
          message: error.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const data = await AccountService.createJournalEntry(req.body);
      return successResponse({ res, httpCode: 201, data, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get journal entries
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with journal entries data
   */
  static async getJournalEntries(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountService.getJournalEntries(req.query);
      return successResponse({ res, data, httpCode: 200, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get account balance
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with account balance data
   */
  static async getAccountBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountService.getAccountBalance(+req.params.id);
      return successResponse({ res, data, httpCode: 200, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get trial balance
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with trial balance data
   */
  static async getTrialBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountService.getTrialBalance();
      return successResponse({ res, data, httpCode: 200, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Create a new cost center
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, cost center data
   */
  static async createCostCenter(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = validateCostCenter(req.body);
      if (error) {
        return errorResponse({
          res,
          message: error.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const data = await AccountService.createCostCenter(req.body);
      return successResponse({ res, httpCode: 201, data, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Update an existing cost center
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, updated cost center data
   */
  static async updateCostCenter(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = validateUpdateCostCenter({
        ...req.body,
        id: req.params.id,
      });
      if (error) {
        return errorResponse({
          res,
          message: error.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const data = await AccountService.updateCostCenter({
        ...req.body,
        id: req.params.id,
      });
      return successResponse({ res, data, message: DATA_SAVED, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get all cost centers
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with cost centers data
   */
  static async getCostCenters(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountService.getCostCenters(req.query);
      return successResponse({ res, data, httpCode: 200, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Generate financial statement
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with financial statement data
   */
  static async generateFinancialStatement(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = validateFinancialStatement(req.body);
      if (error) {
        return errorResponse({
          res,
          message: error.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const data = await AccountService.generateFinancialStatement(req.body);

      if (req.body.format) {
        res.setHeader('Content-Type', getContentType(req.body.format));
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=financial-statement.${req.body.format.toLowerCase()}`
        );
        return res.send(data);
      }

      return successResponse({ res, data, httpCode: 200, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Generate trend analysis
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with trend analysis data
   */
  static async generateTrendAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = validateTrendAnalysis(req.body);
      if (error) {
        return errorResponse({
          res,
          message: error.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const data = await AccountService.generateTrendAnalysis(req.body);

      if (req.body.format) {
        res.setHeader('Content-Type', getContentType(req.body.format));
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=trend-analysis.${req.body.format.toLowerCase()}`
        );
        return res.send(data);
      }

      return successResponse({ res, data, httpCode: 200, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Generate custom report
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with custom report data
   */
  static async generateCustomReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = validateCustomReport(req.body);
      if (error) {
        return errorResponse({
          res,
          message: error.details[0].message,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const data = await AccountService.generateCustomReport(req.body);

      if (req.body.format) {
        res.setHeader('Content-Type', getContentType(req.body.format));
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=custom-report.${req.body.format.toLowerCase()}`
        );
        return res.send(data);
      }

      return successResponse({ res, data, httpCode: 200, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Generate custom report
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with receipt data
   */
  static async downloadPaymentReceipt(req: Request, res: Response, next: NextFunction) {
    const { error } = validatePaymentReceipt(req.body);
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }

    try {
      const { visitId } = req.params;
      const payments = await AccountService.getPaymentHistoryForPrint(+visitId, req.body);
      const payment = payments[0];
      const patient = payment?.patient;

      if (!payments?.length || !patient) {
        return errorResponse({
          res,
          message: 'Payment receipt not found',
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      return printReceiptPDF(<PrintReceiptType>{
        serviceName: req.body.serviceName,
        patient,
        res,
        payments,
      });
    } catch (e) {
      return next(e);
    }
  }
}
