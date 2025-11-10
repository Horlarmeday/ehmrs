import { Request, Response, NextFunction } from 'express';
import AccountingService from './accounting.service';
import AccountingRepository from './accounting.repository';
import { FinancialPeriodManagementService } from './services/financialPeriodManagement.service';
import { FinancialPeriodValidationService } from './services/financialPeriodValidation.service';
import { BankReconciliationService } from './services/bankReconciliation.service';
import { FinancialReportingService } from './services/financialReporting.service';
import { OperationalReportingService } from './services/operationalReporting.service';
import { BusinessIntelligenceService } from './services/businessIntelligence.service';
import { PatientDepositService } from './services/patientDeposit.service';
import { PatientFinancialStatementService } from './services/patientFinancialStatement.service';
import { generateFinancialStatementPDF } from './helper/financialStatement.helper';
import { exportDataToCSV, exportDataToExcel } from '../../core/helpers/fileExport';
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
  bankStatementImportSchema,
  bankReconciliationApprovalSchema,
  operationalReportSchema,
  businessIntelligenceSchema,
  validateFinancialStatementRequest,
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
import { DepositReportingService } from './services/depositReporting.service';

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

  // System Health & Initialization
  static async getSystemHealth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { AccountingStartupService } = await import('./services/startup.service');
      const config = await AccountingStartupService.validateConfiguration();

      res.json({
        success: true,
        accounting: config.valid,
        issues: config.issues,
        timestamp: new Date().toISOString(),
        status: config.valid ? 'HEALTHY' : 'UNHEALTHY',
      });
    } catch (error) {
      next(error);
    }
  }

  static async initializeSystem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { AccountingStartupService } = await import('./services/startup.service');
      await AccountingStartupService.initialize();

      res.json({
        success: true,
        message: 'Accounting system initialized successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
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
        patient_search: validatedQuery.patient_search
          ? (validatedQuery.patient_search as string)
          : undefined,
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

  /**
   * Download payment receipt as PDF
   */
  static async downloadPaymentReceipt(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { paymentId } = req.params;

      if (!paymentId || isNaN(parseInt(paymentId))) {
        res.status(400).json({
          success: false,
          message: 'Valid payment ID is required',
        });
        return;
      }

      // Get receipt data from service
      const receiptData = await AccountingService.getPaymentReceiptData(parseInt(paymentId));

      if (!receiptData) {
        res.status(404).json({
          success: false,
          message: 'Payment receipt not found',
        });
        return;
      }

      // Import receipt helper to avoid circular dependencies
      const { printClinicalReceiptPDF } = await import('./helper/receipt.helper');

      // Generate and stream PDF receipt
      await printClinicalReceiptPDF({
        receiptData,
        res,
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
        search: validatedQuery.search ? (validatedQuery.search as string) : undefined,
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

      // Get current financial period
      const currentPeriod = await FinancialPeriodValidationService.getCurrentActivePeriod();
      if (!currentPeriod) {
        throw new BadException(
          'Financial Period Not Available',
          503,
          'No active financial period found. Please configure financial periods before processing transactions.'
        );
      }

      const entryData = {
        ...validatedBody,
        created_by: req.user.sub,
        period_id: currentPeriod.id, // Link to current financial period
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
        data: result.docs || result, // Ensure consistent structure
        total: result.total || 0,
        pages: result.pages || 0,
        summary: result.summary || {},
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

      const period = await AccountingService.createFinancialPeriod(periodData, req.user.sub);

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

      const period = await AccountingService.updateFinancialPeriod(
        parseInt(id),
        validatedBody,
        req.user.sub
      );

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
      await AccountingService.deleteFinancialPeriod(parseInt(id), req.user.sub);

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

      const period = await AccountingService.openFinancialPeriod(
        parseInt(id),
        { notes },
        req.user.sub
      );

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

      const period = await AccountingService.closeFinancialPeriod(
        parseInt(id),
        { notes, closing_date },
        req.user.sub
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
        data: result.data,
        summary: result.summary,
        total: result.total,
        pages: result.pages,
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportTrialBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = AccountingController.validateRequest(req.query, trialBalanceFiltersSchema);
      const result = await AccountingRepository.getTrialBalance(filters);

      // Generate CSV content
      const csvContent = AccountingController.convertTrialBalanceToCSV(result.data);

      // Set response headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="trial-balance-${new Date().toISOString().split('T')[0]}.csv"`
      );

      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  }

  static async getTrialBalanceChartData(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = AccountingController.validateRequest(req.query, trialBalanceFiltersSchema);
      const chartData = await AccountingRepository.getTrialBalanceChartData(filters);

      res.status(200).json({
        success: true,
        data: chartData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTrialBalanceVarianceAnalysis(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = AccountingController.validateRequest(req.query, trialBalanceFiltersSchema);
      const varianceData = await AccountingRepository.getTrialBalanceVarianceAnalysis(filters);

      res.status(200).json({
        success: true,
        data: varianceData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBalanceSheetPreview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = AccountingController.validateRequest(req.query, trialBalanceFiltersSchema);
      const balanceSheetData = await AccountingRepository.getBalanceSheetPreview(filters);

      res.status(200).json({
        success: true,
        data: balanceSheetData,
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

  // ===== PHASE 4: RECONCILIATION & SETTLEMENT METHODS =====

  /**
   * Import bank statement for reconciliation
   */
  static async importBankStatement(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate request body
      const validatedBody = AccountingController.validateRequest(
        req.body,
        bankStatementImportSchema
      );

      const statementData = {
        ...validatedBody,
        imported_by: req.user.sub,
      };

      const reconciliationResult = await BankReconciliationService.importBankStatement(
        statementData
      );

      res.status(200).json({
        success: true,
        message: 'Bank statement imported and reconciled successfully',
        data: reconciliationResult,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bank reconciliation summary
   */
  static async getBankReconciliationSummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { bank_account_id } = req.query;
      const summary = await BankReconciliationService.getReconciliationSummary(
        bank_account_id ? Number(bank_account_id) : undefined
      );

      res.status(200).json({
        success: true,
        message: 'Bank reconciliation summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bank reconciliation exceptions
   */
  static async getBankReconciliationExceptions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { bank_account_id, severity } = req.query;
      const exceptions = await BankReconciliationService.getReconciliationExceptions(
        bank_account_id ? Number(bank_account_id) : undefined,
        severity as string
      );

      res.status(200).json({
        success: true,
        message: 'Bank reconciliation exceptions retrieved successfully',
        data: exceptions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve bank reconciliation
   */
  static async approveBankReconciliation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate request body
      const validatedBody = AccountingController.validateRequest(
        req.body,
        bankReconciliationApprovalSchema
      );

      const { id } = req.params;
      const { approval_notes } = validatedBody;

      await BankReconciliationService.approveReconciliation(id, req.user.sub, approval_notes);

      res.status(200).json({
        success: true,
        message: 'Bank reconciliation approved successfully',
        data: { reconciliation_id: id, approved_by: req.user.sub },
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== END PHASE 4 METHODS =====

  /**
   * Generate comprehensive financial report
   */
  static async generateFinancialReportingReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = AccountingController.validateRequest(req.query, financialReportSchema);
      const report = await FinancialReportingService.generateComprehensiveReport(validatedQuery);
      res.status(200).json({
        success: true,
        message: 'Financial reporting report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate operational reporting report
   */
  static async generateOperationalReportingReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = AccountingController.validateRequest(
        req.query,
        operationalReportSchema
      );
      const report = await OperationalReportingService.generatePaymentProcessingPerformance(
        validatedQuery
      );
      res.status(200).json({
        success: true,
        message: 'Operational reporting report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate business intelligence report
   */
  static async generateBusinessIntelligenceReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = AccountingController.validateRequest(
        req.query,
        businessIntelligenceSchema
      );
      const report = await BusinessIntelligenceService.generateComprehensiveBIReport(
        validatedQuery
      );
      res.status(200).json({
        success: true,
        message: 'Business intelligence report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== ADDITIONAL PHASE 6 REPORTING METHODS =====

  /**
   * Get Profit & Loss Statement
   */
  static async getProfitLossStatement(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = AccountingController.validateRequest(req.query, financialReportSchema);
      const report = await FinancialReportingService.generateProfitLossStatement(validatedQuery);
      res.status(200).json({
        success: true,
        message: 'Profit & Loss statement generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Balance Sheet
   */
  static async getBalanceSheet(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = AccountingController.validateRequest(req.query, financialReportSchema);
      const report = await FinancialReportingService.generateBalanceSheet(validatedQuery);
      res.status(200).json({
        success: true,
        message: 'Balance sheet generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Cash Flow Statement
   */
  static async getCashFlowStatement(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = AccountingController.validateRequest(req.query, financialReportSchema);
      const report = await FinancialReportingService.generateCashFlowStatement(validatedQuery);
      res.status(200).json({
        success: true,
        message: 'Cash flow statement generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Payment Method Utilization Report
   */
  static async getPaymentMethodUtilization(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = AccountingController.validateRequest(
        req.query,
        operationalReportSchema
      );
      const report = await OperationalReportingService.generatePaymentMethodUtilization(
        validatedQuery
      );
      res.status(200).json({
        success: true,
        message: 'Payment method utilization report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Reconciliation Status Report
   */
  static async getReconciliationStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = AccountingController.validateRequest(
        req.query,
        operationalReportSchema
      );
      const report = await OperationalReportingService.generateReconciliationStatusReport(
        validatedQuery
      );
      res.status(200).json({
        success: true,
        message: 'Reconciliation status report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Settlement Tracking Report
   */
  static async getSettlementTracking(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = AccountingController.validateRequest(
        req.query,
        operationalReportSchema
      );
      const report = await OperationalReportingService.generateSettlementTrackingReport(
        validatedQuery
      );
      res.status(200).json({
        success: true,
        message: 'Settlement tracking report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Payment Trend Analysis
   */
  static async getPaymentTrendAnalysis(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = AccountingController.validateRequest(
        req.query,
        businessIntelligenceSchema
      );
      const report = await BusinessIntelligenceService.generatePaymentTrendAnalysis(validatedQuery);
      res.status(200).json({
        success: true,
        message: 'Payment trend analysis generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Predictive Analytics
   */
  static async getPredictiveAnalytics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = AccountingController.validateRequest(
        req.query,
        businessIntelligenceSchema
      );
      const report = await BusinessIntelligenceService.generatePredictiveAnalytics(validatedQuery);
      res.status(200).json({
        success: true,
        message: 'Predictive analytics generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get KPI Monitoring
   */
  static async getKPIMonitoring(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = AccountingController.validateRequest(
        req.query,
        businessIntelligenceSchema
      );
      const report = await BusinessIntelligenceService.generateDashboardKPIMonitoring(
        validatedQuery
      );
      res.status(200).json({
        success: true,
        message: 'KPI monitoring report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Real-Time Monitoring
   */
  static async getRealTimeMonitoring(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = AccountingController.validateRequest(
        req.query,
        businessIntelligenceSchema
      );
      const report = await BusinessIntelligenceService.generateRealTimePaymentMonitoring(
        validatedQuery
      );
      res.status(200).json({
        success: true,
        message: 'Real-time monitoring report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== DEPOSIT EXPORT =====

  /**
   * Export deposits data
   */
  static async exportDeposits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format = 'CSV', date_range, status, type, include_details } = req.query;

      // Get deposits data based on filters
      const filters: any = {};
      if (date_range) filters.date_range = date_range;
      if (status) filters.status = status;
      if (type) filters.type = date_range;

      // For now, we'll use a simple approach - in production, implement proper filtering
      const depositsResponse = await AccountingRepository.getPatientDeposits({ limit: 1000 });
      const deposits = depositsResponse.docs || [];

      // Format data for export
      let exportData = deposits.map(deposit => ({
        reference_number: deposit.reference_number,
        patient_name: `${deposit.patient?.firstname || ''} ${deposit.patient?.lastname ||
          ''}`.trim(),
        patient_id: deposit.patient?.hospital_id || '',
        amount: deposit.amount,
        deposit_type: deposit.deposit_type,
        status: deposit.status,
        created_date: deposit.createdAt,
        description: deposit.description || '',
      }));

      // Add additional details if requested
      if (include_details === 'true' && deposits.length > 0) {
        exportData = exportData.map((item, index) => ({
          ...item,
          bank_account: deposits[index].bankAccount?.account_name || '',
          pos_terminal: deposits[index].posTerminal?.terminal_id || '',
          payment_reference: deposits[index].payment_reference || '',
          used_amount:
            (deposits[index].initial_amount || 0) - (deposits[index].current_balance || 0),
          remaining_balance: deposits[index].current_balance || 0,
        }));
      }

      // For now, return CSV format (in production, implement proper Excel/PDF generation)
      const csvContent = AccountingController.convertToCSV(exportData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="deposits-export-${new Date().toISOString().split('T')[0]}.csv"`
      );
      res.send(csvContent);
    } catch (error) {
      console.error('Export deposits error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export deposits',
        message: error.message,
      });
    }
  }

  /**
   * Convert data to CSV format
   */
  private static convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Convert trial balance data to CSV format
   */
  private static convertTrialBalanceToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  // =============================================================================
  // CASH REGISTER MANAGEMENT CONTROLLER METHODS
  // =============================================================================

  /**
   * Get all cash registers
   */
  static async getCashRegisters(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page = 1, limit = 10, status, location } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (location) filters.location = location;

      const result = await AccountingService.getCashRegisters({
        page: Number(page),
        limit: Number(limit),
        filters,
      });

      res.json({
        success: true,
        data: result.registers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.count,
          pages: Math.ceil(result.count / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cash register by ID
   */
  static async getCashRegisterById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const register = await AccountingService.getCashRegisterById(Number(id));

      if (!register) {
        res.status(404).json({
          success: false,
          error: 'Cash register not found',
        });
        return;
      }

      res.json({
        success: true,
        data: register,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new cash register
   */
  static async createCashRegister(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const staffId = req.user.sub;
      const registerData = req.body;

      const register = await AccountingService.createCashRegister(registerData, staffId);

      res.status(201).json({
        success: true,
        data: register,
        message: 'Cash register created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update cash register
   */
  static async updateCashRegister(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const staffId = req.user.sub;
      const updateData = req.body;

      const register = await AccountingService.updateCashRegister(Number(id), updateData, staffId);

      res.json({
        success: true,
        data: register,
        message: 'Cash register updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete cash register
   */
  static async deleteCashRegister(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const staffId = req.user.sub;

      await AccountingService.deleteCashRegister(Number(id), staffId);

      res.json({
        success: true,
        message: 'Cash register deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Open cash register
   */
  static async openCashRegister(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const staffId = req.user.sub;
      const { opening_amount } = req.body;

      const register = await AccountingService.openCashRegister(
        Number(id),
        opening_amount,
        staffId
      );

      res.json({
        success: true,
        data: register,
        message: 'Cash register opened successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Close cash register
   */
  static async closeCashRegister(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const staffId = req.user.sub;
      const { closing_amount } = req.body;

      const register = await AccountingService.closeCashRegister(
        Number(id),
        closing_amount,
        staffId
      );

      res.json({
        success: true,
        data: register,
        message: 'Cash register closed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reconcile cash register
   */
  static async reconcileCashRegister(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const staffId = req.user.sub;
      const reconciliationData = req.body;

      const register = await AccountingService.reconcileCashRegister(
        Number(id),
        reconciliationData,
        staffId
      );

      res.json({
        success: true,
        data: register,
        message: 'Cash register reconciled successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cash register summary
   */
  static async getCashRegisterSummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const summary = await AccountingService.getCashRegisterSummary(Number(id));

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate patient financial statement
   * GET /api/accounting/patients/:patientId/financial-statement
   */
  static async generatePatientFinancialStatement(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { patientId } = req.params;
      const { startDate, endDate, format, includeDeposits, includeDetails } = req.query;

      // Validate request parameters
      const { error, value } = validateFinancialStatementRequest({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        format,
        includeDeposits: includeDeposits === 'true',
        includeDetails: includeDetails === 'true',
      });

      if (error) {
        throw new BadException(
          'VALIDATION_ERROR',
          400,
          error.details.map((d) => d.message).join(', ')
        );
      }

      // Fetch patient financial statement data
      const statementData = await PatientFinancialStatementService.getPatientFinancialStatement({
        patientId: Number(patientId),
        startDate: value.startDate,
        endDate: value.endDate,
        includeDeposits: value.includeDeposits,
        includeDetails: value.includeDetails,
      });

      // Generate filename
      const patientHospitalId = `${statementData.patient.hospital_id}_${statementData.patient.fullname}` || patientId;
      const startDateStr = value.startDate
        ? new Date(value.startDate).toISOString().split('T')[0]
        : 'default';
      const endDateStr = value.endDate
        ? new Date(value.endDate).toISOString().split('T')[0]
        : 'today';
      const filename = `patient_statement_${patientHospitalId}_${startDateStr}_${endDateStr}.${value.format}`;

      // Export based on format
      switch (value.format) {
        case 'pdf':
          await generateFinancialStatementPDF({
            data: statementData,
            includeDetails: value.includeDetails,
            res,
            filename,
          });
          break;

        case 'csv': {
          const exportData = PatientFinancialStatementService.formatStatementForExport(
            statementData,
            value.includeDetails
          );

          // Set filename in response header
          res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

          exportDataToCSV(res, exportData, [Object.keys(exportData[0] || {})]);
          break;
        }

        case 'xlsx': {
          const exportData = PatientFinancialStatementService.formatStatementForExport(
            statementData,
            value.includeDetails
          );

          // Set filename in response header
          res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

          exportDataToExcel(res, exportData, [Object.keys(exportData[0] || {})]);
          break;
        }

        default:
          throw new BadException('INVALID_FORMAT', 400, 'Invalid export format');
      }
    } catch (error) {
      next(error);
    }
  }
}
