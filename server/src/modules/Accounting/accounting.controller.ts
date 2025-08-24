import { Request, Response, NextFunction } from 'express';
import AccountingService from './accounting.service';
import AccountingRepository from './accounting.repository';
import Joi from 'joi';
import {
  PatientDepositData,
  BillingRequestData,
  PaymentRequestData,
  BillSearchFilters,
  PaymentSearchFilters,
  DepositSearchFilters,
} from './types';
import { BadException } from '../../common/util/api-error';
import { getActiveBillingPoints, getBillingPointById } from './billingPoints';
import {
  createDepositSchema,
  updateDepositSchema,
  createBillSchema,
  updateBillSchema,
  createPaymentSchema,
  depositFilterSchema,
  billFilterSchema,
  paymentFilterSchema,
  paginationSchema,
  financialReportSchema,
  useDepositSchema,
  refundDepositSchema,
  adjustDepositSchema,
} from './validations';
import {
  createChartOfAccountSchema,
  updateChartOfAccountSchema,
  chartOfAccountFiltersSchema,
  createJournalEntrySchema,
  updateJournalEntrySchema,
  journalEntryFiltersSchema,
  createCostCenterSchema,
  updateCostCenterSchema,
  costCenterFiltersSchema,
  createFinancialPeriodSchema,
  updateFinancialPeriodSchema,
  financialPeriodFiltersSchema,
  openPeriodSchema,
  closePeriodSchema,
  createHMOClaimSchema,
  updateHMOClaimSchema,
  hmoClaimFiltersSchema,
  approveClaimSchema,
  rejectClaimSchema,
  processPaymentSchema,
  trialBalanceFiltersSchema,
  createBankAccountSchema,
  updateBankAccountSchema,
  bankAccountFiltersSchema,
  createPOSTerminalSchema,
  updatePOSTerminalSchema,
  posTerminalFiltersSchema,
} from './dto';
import { PaymentCollectionMethod, AccountType } from './enums';
import { AccountValidationService } from './services/accountValidation.service';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    role: string;
    [key: string]: unknown;
  };
}

export class AccountingController {
  // Validation helper method
  private static validateRequest(data: unknown, schema: Joi.Schema) {
    const { error, value } = schema.validate(data);
    if (error) {
      throw new BadException('Validation Error', 400, error.details[0].message);
    }
    return value;
  }

  // Patient Deposits
  static async createPatientDeposit(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate request body
      const validatedBody = AccountingController.validateRequest(req.body, createDepositSchema);

      const depositData: PatientDepositData = {
        ...validatedBody,
        created_by: req.user.sub,
      };

      const deposit = await AccountingService.createPatientDeposit(depositData);

      res.status(201).json({
        success: true,
        message: 'Patient deposit created successfully',
        data: deposit,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPatientDepositById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const deposit = await AccountingService.getPatientDepositById(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Patient deposit retrieved successfully',
        data: deposit,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPatientDeposits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate query parameters
      const validatedQuery = AccountingController.validateRequest(req.query, depositFilterSchema);

      const filters: DepositSearchFilters = {
        patient_id: validatedQuery.patient_id
          ? parseInt(validatedQuery.patient_id as string)
          : undefined,
        patient_search: validatedQuery.patient_search as string, // Add patient search support
        deposit_type: validatedQuery.deposit_type as any,
        status: validatedQuery.status as any,
        start_date: validatedQuery.start_date
          ? new Date(validatedQuery.start_date as string)
          : undefined,
        end_date: validatedQuery.end_date ? new Date(validatedQuery.end_date as string) : undefined,
        min_amount: validatedQuery.min_amount
          ? parseFloat(validatedQuery.min_amount as string)
          : undefined,
        max_amount: validatedQuery.max_amount
          ? parseFloat(validatedQuery.max_amount as string)
          : undefined,
        page: validatedQuery.page ? parseInt(validatedQuery.page as string) : 1,
        limit: validatedQuery.limit ? parseInt(validatedQuery.limit as string) : 20,
      };

      const result = await AccountingService.getPatientDeposits(filters);

      res.status(200).json({
        success: true,
        message: 'Patient deposits retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePatientDeposit(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      // Validate request body
      const validatedBody = AccountingController.validateRequest(req.body, updateDepositSchema);

      const updateData = {
        ...validatedBody,
        updated_by: req.user.sub,
      };

      const deposit = await AccountingService.updatePatientDeposit(parseInt(id), updateData);

      res.status(200).json({
        success: true,
        message: 'Patient deposit updated successfully',
        data: deposit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Use patient deposit for bill payment
   */
  static async usePatientDeposit(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const validatedBody = AccountingController.validateRequest(req.body, useDepositSchema);

      const useData = {
        deposit_id: parseInt(id),
        amount: validatedBody.amount,
        bill_id: validatedBody.bill_id,
        description: validatedBody.description,
        used_by: req.user.sub,
      };

      const deposit = await AccountingService.usePatientDeposit(useData);

      res.status(200).json({
        success: true,
        message: 'Patient deposit used successfully',
        data: deposit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refund patient deposit
   */
  static async refundPatientDeposit(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const validatedBody = AccountingController.validateRequest(req.body, refundDepositSchema);

      const refundData = {
        deposit_id: parseInt(id),
        amount: validatedBody.amount,
        refund_reason: validatedBody.refund_reason,
        refunded_by: req.user.sub,
      };

      const deposit = await AccountingService.refundPatientDeposit(refundData);

      res.status(200).json({
        success: true,
        message: 'Patient deposit refunded successfully',
        data: deposit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adjust patient deposit
   */
  static async adjustPatientDeposit(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const validatedBody = AccountingController.validateRequest(req.body, adjustDepositSchema);

      const adjustmentData = {
        deposit_id: parseInt(id),
        amount: validatedBody.amount,
        adjustment_type: validatedBody.adjustment_type,
        reason: validatedBody.reason,
        adjusted_by: req.user.sub,
      };

      const deposit = await AccountingService.adjustPatientDeposit(adjustmentData);

      res.status(200).json({
        success: true,
        message: 'Patient deposit adjusted successfully',
        data: deposit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle deposit expiry
   */
  static async handlePatientDepositExpiry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const deposit = await AccountingService.handlePatientDepositExpiry(
        parseInt(id),
        req.user.sub
      );

      res.status(200).json({
        success: true,
        message: 'Patient deposit expiry handled successfully',
        data: deposit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get comprehensive deposit usage history and analytics
   */
  static async getDepositUsageHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { includeTransactions, includeJournalEntries, startDate, endDate } = req.query;

      const options = {
        includeTransactions: includeTransactions !== 'false',
        includeJournalEntries: includeJournalEntries !== 'false',
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const history = await AccountingService.getDepositUsageHistory(parseInt(id), options);

      res.status(200).json({
        success: true,
        message: 'Deposit usage history retrieved successfully',
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get deposit usage summary for a patient
   */
  static async getPatientDepositUsageSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { patientId } = req.params;

      const summary = await AccountingService.getPatientDepositUsageSummary(parseInt(patientId));

      res.status(200).json({
        success: true,
        message: 'Patient deposit usage summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get comprehensive deposit refund history and analytics
   */
  static async getDepositRefundHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { includeTransactions, includeJournalEntries, startDate, endDate } = req.query;

      const options = {
        includeTransactions: includeTransactions !== 'false',
        includeJournalEntries: includeJournalEntries !== 'false',
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const history = await AccountingService.getDepositRefundHistory(parseInt(id), options);

      res.status(200).json({
        success: true,
        message: 'Deposit refund history retrieved successfully',
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get refund summary for a patient
   */
  static async getPatientRefundSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { patientId } = req.params;

      const summary = await AccountingService.getPatientRefundSummary(parseInt(patientId));

      res.status(200).json({
        success: true,
        message: 'Patient refund summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get comprehensive deposit status and lifecycle information
   */
  static async getDepositStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const status = await AccountingService.getDepositStatus(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Deposit status retrieved successfully',
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get deposit analytics for management dashboard
   */
  static async getDepositAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { patientId, bankAccountId, status, startDate, endDate } = req.query;

      const filters = {
        patientId: patientId ? parseInt(patientId as string) : undefined,
        bankAccountId: bankAccountId ? parseInt(bankAccountId as string) : undefined,
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const analytics = await AccountingService.getDepositAnalytics(filters);

      res.status(200).json({
        success: true,
        message: 'Deposit analytics retrieved successfully',
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reconcile deposit balances with journal entries
   */
  static async reconcileDepositBalances(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { depositId } = req.query;

      const reconciliation = await AccountingService.reconcileDepositBalances(
        depositId ? parseInt(depositId as string) : undefined
      );

      res.status(200).json({
        success: true,
        message: 'Deposit balance reconciliation completed successfully',
        data: reconciliation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get comprehensive audit trail for a deposit
   */
  static async getDepositAuditTrail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const {
        action_type,
        severity,
        performed_by,
        start_date,
        end_date,
        limit,
        offset,
      } = req.query;

      const filters = {
        action_type,
        severity,
        performed_by: performed_by ? parseInt(performed_by as string) : undefined,
        start_date: start_date ? new Date(start_date as string) : undefined,
        end_date: end_date ? new Date(end_date as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const auditTrail = await AccountingService.getDepositAuditTrail(parseInt(id), filters);

      res.status(200).json({
        success: true,
        message: 'Deposit audit trail retrieved successfully',
        data: auditTrail,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get comprehensive audit summary
   */
  static async getAuditSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { deposit_id, action_type, severity, performed_by, start_date, end_date } = req.query;

      const filters = {
        deposit_id: deposit_id ? parseInt(deposit_id as string) : undefined,
        action_type,
        severity,
        performed_by: performed_by ? parseInt(performed_by as string) : undefined,
        start_date: start_date ? new Date(start_date as string) : undefined,
        end_date: end_date ? new Date(end_date as string) : undefined,
      };

      const auditSummary = await AccountingService.getAuditSummary(filters);

      res.status(200).json({
        success: true,
        message: 'Audit summary retrieved successfully',
        data: auditSummary,
      });
    } catch (error) {
      next(error);
    }
  }

  // Clinical Bills
  static async createClinicalBill(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate request body
      const validatedBody = AccountingController.validateRequest(req.body, createBillSchema);

      const billingRequest: BillingRequestData = {
        ...validatedBody,
        created_by: req.user.sub,
      };

      // Set default collection method and point if not specified
      if (!billingRequest.payment_collection_method) {
        billingRequest.payment_collection_method = PaymentCollectionMethod.POINT_OF_SERVICE;
      }
      if (!billingRequest.payment_collection_point) {
        billingRequest.payment_collection_point = 'main-cashier';
      }

      const bill = await AccountingService.createClinicalBill(billingRequest);

      res.status(201).json({
        success: true,
        message: 'Clinical bill created successfully',
        data: bill,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getClinicalBillById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const bill = await AccountingService.getClinicalBillById(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Clinical bill retrieved successfully',
        data: bill,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getClinicalBillWithItems(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const result = await AccountingService.getClinicalBillWithItems(parseInt(id));

      if (!result) {
        return next(new BadException('Bill not found', 404));
      }

      res.status(200).json({
        success: true,
        message: 'Clinical bill with items retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getClinicalBills(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate query parameters
      const validatedQuery = AccountingController.validateRequest(req.query, billFilterSchema);

      const filters: BillSearchFilters = {
        patient_id: validatedQuery.patient_id
          ? parseInt(validatedQuery.patient_id as string)
          : undefined,
        visit_id: validatedQuery.visit_id ? parseInt(validatedQuery.visit_id as string) : undefined,
        billing_mode: validatedQuery.billing_mode as any,
        payment_status: validatedQuery.payment_status as any,
        billing_status: validatedQuery.billing_status as any,
        start_date: validatedQuery.start_date
          ? new Date(validatedQuery.start_date as string)
          : undefined,
        end_date: validatedQuery.end_date ? new Date(validatedQuery.end_date as string) : undefined,
        min_amount: validatedQuery.min_amount
          ? parseFloat(validatedQuery.min_amount as string)
          : undefined,
        max_amount: validatedQuery.max_amount
          ? parseFloat(validatedQuery.max_amount as string)
          : undefined,
        page: validatedQuery.page ? parseInt(validatedQuery.page as string) : 1,
        limit: validatedQuery.limit ? parseInt(validatedQuery.limit as string) : 20,
      };

      const result = await AccountingService.getClinicalBills(filters);

      res.status(200).json({
        success: true,
        message: 'Clinical bills retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateClinicalBill(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      // Validate request body
      const validatedBody = AccountingController.validateRequest(req.body, updateBillSchema);

      const updateData = {
        ...validatedBody,
        updated_by: req.user.sub,
      };

      const bill = await AccountingService.updateClinicalBill(parseInt(id), updateData);

      res.status(200).json({
        success: true,
        message: 'Clinical bill updated successfully',
        data: bill,
      });
    } catch (error) {
      next(error);
    }
  }

  // Clinical Payments
  static async createClinicalPayment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate request body
      const validatedBody = AccountingController.validateRequest(req.body, createPaymentSchema);

      const paymentRequest: PaymentRequestData = {
        ...validatedBody,
        processed_by: req.user.sub,
      };

      const payment = await AccountingService.createClinicalPayment(paymentRequest);

      res.status(201).json({
        success: true,
        message: 'Clinical payment created successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getClinicalPaymentById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await AccountingService.getClinicalPaymentById(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Clinical payment retrieved successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getClinicalPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate query parameters
      const validatedQuery = AccountingController.validateRequest(req.query, paymentFilterSchema);

      const filters: PaymentSearchFilters = {
        bill_id: validatedQuery.bill_id ? parseInt(validatedQuery.bill_id as string) : undefined,
        patient_id: validatedQuery.patient_id
          ? parseInt(validatedQuery.patient_id as string)
          : undefined,
        payment_method: validatedQuery.payment_method as any,
        payment_type: validatedQuery.payment_type as any,
        status: validatedQuery.status as any,
        start_date: validatedQuery.start_date
          ? new Date(validatedQuery.start_date as string)
          : undefined,
        end_date: validatedQuery.end_date ? new Date(validatedQuery.end_date as string) : undefined,
        min_amount: validatedQuery.min_amount
          ? parseFloat(validatedQuery.min_amount as string)
          : undefined,
        page: validatedQuery.page ? parseInt(validatedQuery.page as string) : 1,
        limit: validatedQuery.limit ? parseInt(validatedQuery.limit as string) : 20,
      };

      const result = await AccountingService.getClinicalPayments(filters);

      res.status(200).json({
        success: true,
        message: 'Clinical payments retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Summary and Analytics
  static async getPatientDepositSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { patient_id } = req.query;
      const summary = await AccountingService.getPatientDepositSummary(
        patient_id ? parseInt(patient_id as string) : undefined
      );

      res.status(200).json({
        success: true,
        message: 'Patient deposit summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient deposit by patient ID
   */
  static async getPatientDepositByPatientId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { patientId } = req.params;
      const deposit = await AccountingService.getPatientDepositByPatientId(parseInt(patientId));

      res.status(200).json({
        success: true,
        message: 'Patient deposit retrieved successfully',
        data: deposit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient deposit balance
   */
  static async getPatientDepositBalance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { patientId } = req.params;
      const balance = await AccountingService.getPatientDepositBalance(parseInt(patientId));

      res.status(200).json({
        success: true,
        message: 'Patient deposit balance retrieved successfully',
        data: { patient_id: parseInt(patientId), balance },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient deposit history
   */
  static async getPatientDepositHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { patientId } = req.params;
      const history = await AccountingService.getPatientDepositHistory(parseInt(patientId));

      res.status(200).json({
        success: true,
        message: 'Patient deposit history retrieved successfully',
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient deposit balance summary
   */
  static async getPatientDepositBalanceSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { patientId } = req.params;
      const summary = await AccountingService.getPatientDepositBalanceSummary(parseInt(patientId));

      res.status(200).json({
        success: true,
        message: 'Patient deposit balance summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ensure required Chart of Accounts exist for comprehensive payment processing
   */
  static async ensurePatientDepositAccounts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await AccountingService.ensurePatientDepositAccountsExist();

      res.status(200).json({
        success: true,
        message:
          'Required Chart of Accounts for comprehensive payment processing ensured successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate that all required Chart of Accounts exist for comprehensive payment processing
   */
  static async validatePatientDepositAccounts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validation = await AccountingService.validatePatientDepositAccounts();

      res.status(200).json({
        success: true,
        message: 'Chart of Accounts validation completed',
        data: validation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get required Chart of Account for patient deposits
   */
  static async getPatientDepositAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { accountCode } = req.params;
      const account = await AccountingService.getPatientDepositAccount(accountCode);

      if (!account) {
        res.status(404).json({
          success: false,
          message: `Account with code ${accountCode} not found`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Patient deposit account retrieved successfully',
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBillingSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { patient_id } = req.query;
      const summary = await AccountingService.getBillingSummary(
        patient_id ? parseInt(patient_id as string) : undefined
      );

      res.status(200).json({
        success: true,
        message: 'Billing summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { patient_id } = req.query;
      const summary = await AccountingService.getPaymentSummary(
        patient_id ? parseInt(patient_id as string) : undefined
      );

      res.status(200).json({
        success: true,
        message: 'Payment summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  // Billing Points
  static async getBillingPoints(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const billingPoints = getActiveBillingPoints();

      res.status(200).json({
        success: true,
        message: 'Billing points retrieved successfully',
        data: billingPoints,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBillingPointById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const billingPoint = getBillingPointById(id);

      if (!billingPoint) {
        res.status(404).json({
          success: false,
          message: 'Billing point not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Billing point retrieved successfully',
        data: billingPoint,
      });
    } catch (error) {
      next(error);
    }
  }

  // Dashboard and Summary
  static async getAccountingSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const summary = await AccountingService.getAccountingSummary();
      res.status(200).json({
        success: true,
        message: 'Accounting summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get financial reports
   */
  static async getFinancialReports(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = AccountingController.validateRequest(req.query, financialReportSchema);
      const reports = await AccountingService.getFinancialReports(validatedQuery);
      res.status(200).json({
        success: true,
        message: 'Financial reports retrieved successfully',
        data: reports,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🆕 NEW: Cancel payment and reset prescribed order statuses
   */
  static async cancelPayment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const billId = parseInt(req.params.id);
      if (isNaN(billId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid bill ID',
        });
        return;
      }

      await AccountingService.cancelPayment(billId);

      res.status(200).json({
        success: true,
        message: 'Payment cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Deposit Usage
  static async useDeposit(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { deposit_id, bill_id, amount, notes } = req.body;
      const result = await AccountingService.useDeposit({
        deposit_id,
        bill_id,
        amount,
        notes,
        used_by: req.user.sub,
      });
      res.status(200).json({
        success: true,
        message: 'Deposit used successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== BILLING POINTS =====
  static async fetchBillingPoints(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AccountingService.fetchBillingPoints();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===== CLINICAL BILL SEARCH =====
  static async getClinicalBillByNumber(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { billNumber } = req.params;
      const result = await AccountingService.getClinicalBillByNumber(billNumber);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getPatientClinicalBills(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { patientId } = req.params;
      const result = await AccountingService.getPatientClinicalBills(parseInt(patientId));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===== PHASE 1: CORE FINANCIAL FOUNDATION METHODS =====

  // Chart of Accounts
  static async getChartOfAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = AccountingController.validateRequest(req.query, chartOfAccountFiltersSchema);
      const result = await AccountingRepository.getChartOfAccounts(filters);

      res.status(200).json({
        success: true,
        message: 'Chart of accounts retrieved successfully',
        data: result.docs,
        total: result.total,
        pages: result.pages,
        summary: result.summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getChartOfAccountById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const account = await AccountingRepository.getChartOfAccountById(parseInt(id));

      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Chart of account not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Chart of account retrieved successfully',
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createChartOfAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedBody = AccountingController.validateRequest(
        req.body,
        createChartOfAccountSchema
      );

      const accountData = {
        ...validatedBody,
        created_by: req.user.sub,
      };

      const account = await AccountingRepository.createChartOfAccount(accountData);

      res.status(201).json({
        success: true,
        message: 'Chart of account created successfully',
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateChartOfAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const validatedBody = AccountingController.validateRequest(
        req.body,
        updateChartOfAccountSchema
      );

      const account = await AccountingRepository.updateChartOfAccount(parseInt(id), validatedBody);

      res.status(200).json({
        success: true,
        message: 'Chart of account updated successfully',
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteChartOfAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await AccountingRepository.deleteChartOfAccount(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Chart of account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate account data and get conflict resolution suggestions
   */
  static async validateChartOfAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedBody = AccountingController.validateRequest(
        req.body,
        createChartOfAccountSchema
      );

      const validation = await AccountingRepository.validateAccountData(validatedBody);

      res.status(200).json({
        success: true,
        message: 'Account validation completed',
        data: validation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get conflict resolution suggestions for account creation/update
   */
  static async getAccountConflictSuggestions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedBody = AccountingController.validateRequest(
        req.body,
        createChartOfAccountSchema
      );

      const { id } = req.params;
      const existingAccountId = id ? parseInt(id) : undefined;

      const suggestions = await AccountingRepository.getAccountConflictSuggestions(
        validatedBody,
        existingAccountId
      );

      res.status(200).json({
        success: true,
        message: 'Conflict resolution suggestions retrieved',
        data: suggestions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate all Chart of Accounts
   */
  static async validateAllChartOfAccounts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const report = await AccountValidationService.validateAllAccounts();

      res.status(200).json({
        success: true,
        message: 'Chart of Accounts validation completed',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Quick validation check
   */
  static async quickValidationCheck(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AccountValidationService.quickValidationCheck();

      res.status(200).json({
        success: true,
        message: 'Quick validation check completed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get validation statistics
   */
  static async getValidationStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statistics = await AccountValidationService.getValidationStatistics();

      res.status(200).json({
        success: true,
        message: 'Validation statistics retrieved',
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate specific account type
   */
  static async validateAccountType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.params;

      if (!Object.values(AccountType).includes(type as AccountType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid account type',
          errors: [
            `Invalid account type: ${type}. Valid types are: ${Object.values(AccountType).join(
              ', '
            )}`,
          ],
        });
        return;
      }

      const results = await AccountValidationService.validateAccountType(type as AccountType);

      res.status(200).json({
        success: true,
        message: `${type} accounts validation completed`,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  // Journal Entries
  static async getJournalEntries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = AccountingController.validateRequest(req.query, journalEntryFiltersSchema);
      const result = await AccountingRepository.getJournalEntries(filters);

      res.status(200).json({
        success: true,
        message: 'Journal entries retrieved successfully',
        data: result.docs,
        total: result.total,
        pages: result.pages,
        summary: result.summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getJournalEntryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const entry = await AccountingRepository.getJournalEntryById(parseInt(id));

      if (!entry) {
        res.status(404).json({
          success: false,
          message: 'Journal entry not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Journal entry retrieved successfully',
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createJournalEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedBody = AccountingController.validateRequest(
        req.body,
        createJournalEntrySchema
      );

      const entryData = {
        ...validatedBody,
        created_by: req.user.sub,
      };

      const entry = await AccountingRepository.createJournalEntry(entryData);

      res.status(201).json({
        success: true,
        message: 'Journal entry created successfully',
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateJournalEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const validatedBody = AccountingController.validateRequest(
        req.body,
        updateJournalEntrySchema
      );

      const entry = await AccountingRepository.updateJournalEntry(parseInt(id), validatedBody);

      res.status(200).json({
        success: true,
        message: 'Journal entry updated successfully',
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteJournalEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await AccountingRepository.deleteJournalEntry(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Journal entry deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Cost Centers
  static async getCostCenters(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = AccountingController.validateRequest(req.query, costCenterFiltersSchema);
      const result = await AccountingRepository.getCostCenters(filters);

      res.status(200).json({
        success: true,
        message: 'Cost centers retrieved successfully',
        data: result.docs,
        total: result.total,
        pages: result.pages,
        summary: result.summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCostCenterById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const center = await AccountingRepository.getCostCenterById(parseInt(id));

      if (!center) {
        res.status(404).json({
          success: false,
          message: 'Cost center not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cost center retrieved successfully',
        data: center,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCostCenter(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedBody = AccountingController.validateRequest(req.body, createCostCenterSchema);

      const centerData = {
        ...validatedBody,
        created_by: req.user.sub,
      };

      const center = await AccountingRepository.createCostCenter(centerData);

      res.status(201).json({
        success: true,
        message: 'Cost center created successfully',
        data: center,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCostCenter(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const validatedBody = AccountingController.validateRequest(req.body, updateCostCenterSchema);

      const center = await AccountingRepository.updateCostCenter(parseInt(id), validatedBody);

      res.status(200).json({
        success: true,
        message: 'Cost center updated successfully',
        data: center,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCostCenter(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await AccountingRepository.deleteCostCenter(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Cost center deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Financial Periods
  static async getFinancialPeriods(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = AccountingController.validateRequest(req.query, financialPeriodFiltersSchema);
      const result = await AccountingRepository.getFinancialPeriods(filters);

      res.status(200).json({
        success: true,
        message: 'Financial periods retrieved successfully',
        data: result.docs,
        total: result.total,
        pages: result.pages,
        summary: result.summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFinancialPeriodById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const period = await AccountingRepository.getFinancialPeriodById(parseInt(id));

      if (!period) {
        res.status(404).json({
          success: false,
          message: 'Financial period not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Financial period retrieved successfully',
        data: period,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createFinancialPeriod(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedBody = AccountingController.validateRequest(
        req.body,
        createFinancialPeriodSchema
      );

      const periodData = {
        ...validatedBody,
        created_by: req.user.sub,
      };

      const period = await AccountingRepository.createFinancialPeriod(periodData);

      res.status(201).json({
        success: true,
        message: 'Financial period created successfully',
        data: period,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateFinancialPeriod(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const validatedBody = AccountingController.validateRequest(
        req.body,
        updateFinancialPeriodSchema
      );

      const period = await AccountingRepository.updateFinancialPeriod(parseInt(id), validatedBody);

      res.status(200).json({
        success: true,
        message: 'Financial period updated successfully',
        data: period,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFinancialPeriod(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await AccountingRepository.deleteFinancialPeriod(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Financial period deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async openFinancialPeriod(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { notes } = AccountingController.validateRequest(req.body, openPeriodSchema);

      const period = await AccountingRepository.openFinancialPeriod(parseInt(id), notes);

      res.status(200).json({
        success: true,
        message: 'Financial period opened successfully',
        data: period,
      });
    } catch (error) {
      next(error);
    }
  }

  static async closeFinancialPeriod(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { closing_date, notes } = AccountingController.validateRequest(
        req.body,
        closePeriodSchema
      );

      const period = await AccountingRepository.closeFinancialPeriod(
        parseInt(id),
        closing_date,
        notes
      );

      res.status(200).json({
        success: true,
        message: 'Financial period closed successfully',
        data: period,
      });
    } catch (error) {
      next(error);
    }
  }

  // HMO Claims
  static async getHMOClaims(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = AccountingController.validateRequest(req.query, hmoClaimFiltersSchema);
      const result = await AccountingRepository.getHMOClaims(filters);

      res.status(200).json({
        success: true,
        message: 'HMO claims retrieved successfully',
        data: result.docs,
        total: result.total,
        pages: result.pages,
        summary: result.summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getHMOClaimById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const claim = await AccountingRepository.getHMOClaimById(parseInt(id));

      if (!claim) {
        res.status(404).json({
          success: false,
          message: 'HMO claim not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'HMO claim retrieved successfully',
        data: claim,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createHMOClaim(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedBody = AccountingController.validateRequest(req.body, createHMOClaimSchema);

      const claimData = {
        ...validatedBody,
        created_by: req.user.sub,
      };

      const claim = await AccountingRepository.createHMOClaim(claimData);

      res.status(201).json({
        success: true,
        message: 'HMO claim created successfully',
        data: claim,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateHMOClaim(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const validatedBody = AccountingController.validateRequest(req.body, updateHMOClaimSchema);

      const claim = await AccountingRepository.updateHMOClaim(parseInt(id), validatedBody);

      res.status(200).json({
        success: true,
        message: 'HMO claim updated successfully',
        data: claim,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteHMOClaim(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await AccountingRepository.deleteHMOClaim(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'HMO claim deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async approveHMOClaim(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { notes } = AccountingController.validateRequest(req.body, approveClaimSchema);

      const claim = await AccountingRepository.approveHMOClaim(parseInt(id), notes);

      res.status(200).json({
        success: true,
        message: 'HMO claim approved successfully',
        data: claim,
      });
    } catch (error) {
      next(error);
    }
  }

  static async rejectHMOClaim(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = AccountingController.validateRequest(req.body, rejectClaimSchema);

      const claim = await AccountingRepository.rejectHMOClaim(parseInt(id), reason);

      res.status(200).json({
        success: true,
        message: 'HMO claim rejected successfully',
        data: claim,
      });
    } catch (error) {
      next(error);
    }
  }

  static async processHMOClaimPayment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { amount, notes } = AccountingController.validateRequest(
        req.body,
        processPaymentSchema
      );

      const claim = await AccountingRepository.processHMOClaimPayment(parseInt(id), amount, notes);

      res.status(200).json({
        success: true,
        message: 'HMO claim payment processed successfully',
        data: claim,
      });
    } catch (error) {
      next(error);
    }
  }

  // Trial Balance
  static async getTrialBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = AccountingController.validateRequest(req.query, trialBalanceFiltersSchema);
      const result = await AccountingRepository.getTrialBalance(filters);

      res.status(200).json({
        success: true,
        message: 'Trial balance retrieved successfully',
        data: result.data,
        total: result.total,
        pages: result.pages,
        summary: result.summary,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== BANK ACCOUNT METHODS =====

  static async getBankAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = AccountingController.validateRequest(req.query, bankAccountFiltersSchema);
      const result = await AccountingService.getBankAccounts(filters);

      res.status(200).json({
        success: true,
        message: 'Bank accounts retrieved successfully',
        data: result.docs,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBankAccountById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const bankAccount = await AccountingService.getBankAccountById(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Bank account retrieved successfully',
        data: bankAccount,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createBankAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedBody = AccountingController.validateRequest(req.body, createBankAccountSchema);
      const bankAccount = await AccountingService.createBankAccount(validatedBody, req.user.sub);

      res.status(201).json({
        success: true,
        message: 'Bank account created successfully',
        data: bankAccount,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateBankAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const validatedBody = AccountingController.validateRequest(req.body, updateBankAccountSchema);
      const bankAccount = await AccountingService.updateBankAccount(
        parseInt(id),
        validatedBody,
        req.user.sub
      );

      res.status(200).json({
        success: true,
        message: 'Bank account updated successfully',
        data: bankAccount,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBankAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const bankAccount = await AccountingService.deleteBankAccount(parseInt(id), req.user.sub);

      res.status(200).json({
        success: true,
        message: 'Bank account deleted successfully',
        data: bankAccount,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getActiveBankAccounts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const bankAccounts = await AccountingService.getActiveBankAccounts();

      res.status(200).json({
        success: true,
        message: 'Active bank accounts retrieved successfully',
        data: bankAccounts,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateBankAccountBalance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { amount, operation } = req.body;

      if (!amount || !operation || !['add', 'subtract'].includes(operation)) {
        throw new BadException(
          'Invalid request: amount and operation (add/subtract) are required',
          400
        );
      }

      const bankAccount = await AccountingService.updateBankAccountBalance(
        parseInt(id),
        amount,
        operation
      );

      res.status(200).json({
        success: true,
        message: 'Bank account balance updated successfully',
        data: bankAccount,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleBankAccountStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const bankAccount = await AccountingService.toggleBankAccountStatus(
        parseInt(id),
        req.user.sub
      );

      res.status(200).json({
        success: true,
        message: 'Bank account status toggled successfully',
        data: bankAccount,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== POS TERMINAL METHODS =====

  /**
   * Get all POS terminals with pagination and filters
   */
  static async getPOSTerminals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = AccountingController.validateRequest(req.query, posTerminalFiltersSchema);
      const result = await AccountingService.getPOSTerminals(filters);

      res.status(200).json({
        success: true,
        message: 'POS terminals retrieved successfully',
        data: result.docs,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get POS terminal by ID
   */
  static async getPOSTerminalById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const posTerminal = await AccountingService.getPOSTerminalById(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'POS terminal retrieved successfully',
        data: posTerminal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new POS terminal
   */
  static async createPOSTerminal(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedBody = AccountingController.validateRequest(req.body, createPOSTerminalSchema);
      const posTerminal = await AccountingService.createPOSTerminal(validatedBody, req.user.sub);

      res.status(201).json({
        success: true,
        message: 'POS terminal created successfully',
        data: posTerminal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update POS terminal
   */
  static async updatePOSTerminal(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const validatedBody = AccountingController.validateRequest(req.body, updatePOSTerminalSchema);
      const posTerminal = await AccountingService.updatePOSTerminal(
        parseInt(id),
        validatedBody,
        req.user.sub
      );

      res.status(200).json({
        success: true,
        message: 'POS terminal updated successfully',
        data: posTerminal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete POS terminal (soft delete)
   */
  static async deletePOSTerminal(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const posTerminal = await AccountingService.deletePOSTerminal(parseInt(id), req.user.sub);

      res.status(200).json({
        success: true,
        message: 'POS terminal deleted successfully',
        data: posTerminal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active POS terminals for payments
   */
  static async getActivePOSTerminals(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const posTerminals = await AccountingService.getActivePOSTerminals();

      res.status(200).json({
        success: true,
        message: 'Active POS terminals retrieved successfully',
        data: posTerminals,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get POS terminals by bank account
   */
  static async getPOSTerminalsByBankAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { bankAccountId } = req.params;
      const posTerminals = await AccountingService.getPOSTerminalsByBankAccount(
        parseInt(bankAccountId)
      );

      res.status(200).json({
        success: true,
        message: 'POS terminals by bank account retrieved successfully',
        data: posTerminals,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update POS terminal last used timestamp
   */
  static async updatePOSTerminalLastUsed(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const posTerminal = await AccountingService.updatePOSTerminalLastUsed(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'POS terminal last used timestamp updated successfully',
        data: posTerminal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle POS terminal status (active/inactive)
   */
  static async togglePOSTerminalStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const posTerminal = await AccountingService.togglePOSTerminalStatus(
        parseInt(id),
        req.user.sub
      );

      res.status(200).json({
        success: true,
        message: 'POS terminal status toggled successfully',
        data: posTerminal,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== DEPOSIT REPORTING ENDPOINTS ====================

  /**
   * Generate deposit summary report
   */
  static async generateDepositSummaryReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        startDate,
        endDate,
        depositType,
        status,
        bankAccountId,
        minAmount,
        maxAmount,
        includeInactive,
        format,
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        depositType: depositType as string,
        status: status as string,
        bankAccountId: bankAccountId ? parseInt(bankAccountId as string) : undefined,
        minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
        includeInactive: includeInactive === 'true',
      };

      const DepositReportingService = require('./services/depositReporting.service')
        .DepositReportingService;
      const report = await DepositReportingService.generateDepositSummaryReport(filters);

      // Handle CSV export
      if (format === 'csv') {
        const csvContent = await DepositReportingService.exportReportToCSV(report, 'summary');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="deposit-summary-report.csv"');
        res.send(csvContent);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Deposit summary report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate deposit activity report
   */
  static async generateDepositActivityReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate, patientId, format } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        patientId: patientId ? parseInt(patientId as string) : undefined,
      };

      const DepositReportingService = require('./services/depositReporting.service')
        .DepositReportingService;
      const report = await DepositReportingService.generateDepositActivityReport(filters);

      // Handle CSV export
      if (format === 'csv') {
        const csvContent = await DepositReportingService.exportReportToCSV(report, 'activity');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="deposit-activity-report.csv"');
        res.send(csvContent);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Deposit activity report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate patient deposit report
   */
  static async generatePatientDepositReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { patientId } = req.params;
      const { startDate, endDate, depositType, status, format } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        depositType: depositType as string,
        status: status as string,
      };

      const DepositReportingService = require('./services/depositReporting.service')
        .DepositReportingService;
      const report = await DepositReportingService.generatePatientDepositReport(
        parseInt(patientId),
        filters
      );

      // Handle CSV export
      if (format === 'csv') {
        const csvContent = await DepositReportingService.exportReportToCSV(report, 'patient');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="patient-deposit-report.csv"');
        res.send(csvContent);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Patient deposit report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate reconciliation report
   */
  static async generateReconciliationReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate, format } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const DepositReportingService = require('./services/depositReporting.service')
        .DepositReportingService;
      const report = await DepositReportingService.generateReconciliationReport(filters);

      // Handle CSV export
      if (format === 'csv') {
        const csvContent = await DepositReportingService.exportReportToCSV(
          report,
          'reconciliation'
        );
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="reconciliation-report.csv"');
        res.send(csvContent);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Reconciliation report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Settle POS terminal deposits to bank account
   */
  static async settlePOSTerminalDeposits(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { pos_terminal_id, settlement_reference } = req.body;
      const settled_by = req.user?.sub || 1;

      if (!pos_terminal_id || !settlement_reference) {
        throw new BadException('POS terminal ID and settlement reference are required', 400);
      }

      const PatientDepositService = require('./services/patientDeposit.service')
        .PatientDepositService;
      const journalEntry = await PatientDepositService.settlePOSTerminalDeposits(
        pos_terminal_id,
        settlement_reference,
        settled_by
      );

      res.status(200).json({
        success: true,
        message: 'POS terminal deposits settled successfully',
        data: {
          journal_entry_id: journalEntry.id,
          reference: journalEntry.reference,
          settlement_reference,
          pos_terminal_id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate expiry report
   */
  static async generateExpiryReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate, format } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const DepositReportingService = require('./services/depositReporting.service')
        .DepositReportingService;
      const report = await DepositReportingService.generateExpiryReport(filters);

      // Handle CSV export
      if (format === 'csv') {
        const csvContent = await DepositReportingService.exportReportToCSV(report, 'expiry');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="expiry-report.csv"');
        res.send(csvContent);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Expiry report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
}
