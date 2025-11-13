import { Transaction } from 'sequelize';
import dayjs from 'dayjs';
import AccountingRepository from './accounting.repository';
import { ComprehensiveChartOfAccountsService } from './services/comprehensiveChartOfAccounts.service';
import { PatientDepositService } from './services/patientDeposit.service';
import { DepositAuditService } from './services/depositAudit.service';
import { FinancialPeriodManagementService } from './services/financialPeriodManagement.service';
import { FinancialPeriodValidationService } from './services/financialPeriodValidation.service';
import { PatientDepositConsolidationService, ConsolidationResult } from './services/patientDepositConsolidation.service';
import {
  PatientDepositData,
  ClinicalBillData,
  ClinicalBillItemData,
  ClinicalPaymentData,
  BillingRequestData,
  PaymentRequestData,
  BillSearchFilters,
  PaymentSearchFilters,
  DepositSearchFilters,
  BillingSummary,
  PaymentSummary,
  DepositSummary,
} from './types';
import { BadException } from '../../common/util/api-error';
import {
  PaymentType,
  PaymentMethod,
  DepositStatus,
  PaymentStatus,
  BillingStatus,
  PaymentCollectionMethod,
  PaymentProcessingStatus,
  DepositTransactionType,
} from './enums';
import { PatientDeposit } from '../../database/models/patientDeposit';
import { ClinicalBill, ClinicalBillItem } from '../../database/models';

export class AccountingService {
  // Patient Deposits
  static async createPatientDeposit(
    depositData: PatientDepositData,
    transaction?: Transaction
  ): Promise<any> {
    try {
      // Ensure required Chart of Accounts exist before creating deposit
      await ComprehensiveChartOfAccountsService.ensureRequiredAccountsExist();

      // Use the comprehensive PatientDepositService for full accounting integration
      const deposit = await PatientDepositService.createDeposit(depositData);

      return deposit;
    } catch (error) {
      throw new BadException('Failed to create patient deposit', 500, error.message);
    }
  }

  static async getPatientDepositById(id: number): Promise<any> {
    try {
      // Use the comprehensive PatientDepositService for full history and accounting details
      const depositWithHistory = await PatientDepositService.getDepositWithHistory(id);
      return depositWithHistory;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to retrieve patient deposit', 500, error.message);
    }
  }

  static async getPatientDeposits(
    filters: DepositSearchFilters
  ): Promise<{
    docs: PatientDeposit[];
    total: number;
    pages: number;
    perPage: number;
    currentPage: number;
  }> {
    try {
      return await AccountingRepository.getPatientDeposits(filters);
    } catch (error) {
      throw new BadException('Failed to retrieve patient deposits', 500, error.message);
    }
  }

  static async updatePatientDeposit(
    id: number,
    updateData: Partial<PatientDepositData>
  ): Promise<any> {
    try {
      const deposit = await AccountingRepository.updatePatientDeposit(id, updateData);
      if (!deposit) {
        throw new BadException('Patient deposit not found', 404);
      }
      return await AccountingRepository.getPatientDepositById(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to update patient deposit', 500, error.message);
    }
  }

  static async getPatientDepositSummary(patientId?: number): Promise<DepositSummary> {
    try {
      return await AccountingRepository.getPatientDepositSummary(patientId);
    } catch (error) {
      throw new BadException('Failed to retrieve deposit summary', 500, error.message);
    }
  }

  /**
   * Get patient deposit details required for receipt generation
   */
  static async getPatientDepositReceiptData(depositId: number): Promise<{
    deposit: any;
    patient: any;
    createdBy?: any;
    updatedBy?: any;
    bankAccount?: any;
    posTerminal?: any;
    transactions: any[];
    totals: {
      totalAmount: number;
      currentBalance: number;
      totalUsed: number;
      totalRefunded: number;
      totalAdjusted: number;
    };
  }> {
    try {
      const result = await AccountingRepository.getPatientDepositReceiptData(depositId);

      if (!result) {
        throw new BadException('Patient deposit not found', 404);
      }

      const depositPlain = result.deposit.get({ plain: true }) as any;
      const transactionPlain = result.transactions.map(transaction =>
        transaction.get({ plain: true })
      );

      const toNumber = (value: any) => {
        if (value === null || value === undefined) return 0;
        if (typeof value === 'number') return value;
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? 0 : parsed;
      };

      const totals = transactionPlain.reduce(
        (acc, transaction) => {
          const amount = toNumber(transaction.amount);
          switch (transaction.transaction_type) {
            case DepositTransactionType.USED:
              acc.totalUsed += amount;
              break;
            case DepositTransactionType.REFUNDED:
              acc.totalRefunded += amount;
              break;
            case DepositTransactionType.ADJUSTED:
              acc.totalAdjusted += amount;
              break;
          }
          return acc;
        },
        {
          totalAmount: toNumber(depositPlain.initial_amount || depositPlain.amount),
          currentBalance: toNumber(depositPlain.current_balance || depositPlain.amount),
          totalUsed: 0,
          totalRefunded: 0,
          totalAdjusted: 0,
        }
      );

      return {
        deposit: depositPlain,
        patient: depositPlain.patient,
        createdBy: depositPlain.createdByStaff,
        updatedBy: depositPlain.updatedByStaff,
        bankAccount: depositPlain.bankAccount,
        posTerminal: depositPlain.posTerminal,
        transactions: transactionPlain,
        totals,
      };
    } catch (error) {
      if (error instanceof BadException) {
        throw error;
      }
      throw new BadException('Failed to prepare deposit receipt data', 500, error.message);
    }
  }

  /**
   * Use patient deposit for bill payment with full accounting integration
   */
  static async usePatientDeposit(
    data: {
      deposit_id: number;
      amount: number;
      bill_id: number;
      description?: string;
      used_by: number;
    },
    transaction?: Transaction
  ): Promise<any> {
    try {
      // Ensure required Chart of Accounts exist
      await ComprehensiveChartOfAccountsService.ensureRequiredAccountsExist();

      // Use the comprehensive PatientDepositService
      const updatedDeposit = await PatientDepositService.useDeposit(data, transaction);

      return updatedDeposit;
    } catch (error) {
      throw new BadException('Failed to use patient deposit', 500, error.message);
    }
  }

  /**
   * Refund patient deposit with full accounting integration
   */
  static async refundPatientDeposit(
    data: {
      deposit_id: number;
      amount: number;
      refund_reason: string;
      refunded_by: number;
    },
    transaction?: Transaction
  ): Promise<any> {
    try {
      // Ensure required Chart of Accounts exist
      await ComprehensiveChartOfAccountsService.ensureRequiredAccountsExist();

      // Use the comprehensive PatientDepositService
      const updatedDeposit = await PatientDepositService.refundDeposit(data, transaction);

      return updatedDeposit;
    } catch (error) {
      throw new BadException('Failed to refund patient deposit', 500, error.message);
    }
  }

  /**
   * Adjust patient deposit with full accounting integration
   */
  static async adjustPatientDeposit(
    data: {
      deposit_id: number;
      amount: number;
      adjustment_type: 'add' | 'subtract';
      reason: string;
      adjusted_by: number;
    },
    transaction?: Transaction
  ): Promise<any> {
    try {
      // Ensure required Chart of Accounts exist
      await ComprehensiveChartOfAccountsService.ensureRequiredAccountsExist();

      // Use the comprehensive PatientDepositService
      const updatedDeposit = await PatientDepositService.adjustDeposit(data, transaction);

      return updatedDeposit;
    } catch (error) {
      throw new BadException('Failed to adjust patient deposit', 500, error.message);
    }
  }

  static async consolidatePatientDeposits(
    options: { patientId?: number; consolidatedBy: number; dryRun?: boolean }
  ): Promise<ConsolidationResult[]> {
    try {
      return await PatientDepositConsolidationService.consolidateAllActiveDeposits(options);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to consolidate patient deposits', 500, error.message);
    }
  }

  static async getDepositConsolidationReport(): Promise<{
    duplicatePatients: number[];
    duplicateCount: number;
    activeDepositCount: number;
    uniqueActivePatientCount: number;
    totalCurrentBalance: number;
    totalInitialAmount: number;
    totalAmount: number;
    totalRefundableAmount: number;
    isConstraintSatisfied: boolean;
  }> {
    try {
      return await PatientDepositConsolidationService.generateVerificationReport();
    } catch (error) {
      throw new BadException('Failed to generate consolidation report', 500, error.message);
    }
  }

  /**
   * Handle deposit expiry with full accounting integration
   */
  static async handlePatientDepositExpiry(
    depositId: number,
    processedBy: number,
    transaction?: Transaction
  ): Promise<any> {
    try {
      // Ensure required Chart of Accounts exist
      await ComprehensiveChartOfAccountsService.ensureRequiredAccountsExist();

      // Use the comprehensive PatientDepositService
      const updatedDeposit = await PatientDepositService.handleDepositExpiry(
        depositId,
        processedBy,
        transaction
      );

      return updatedDeposit;
    } catch (error) {
      throw new BadException('Failed to handle deposit expiry', 500, error.message);
    }
  }

  /**
   * Get comprehensive deposit usage history and analytics
   */
  static async getDepositUsageHistory(
    depositId: number,
    options: {
      includeTransactions?: boolean;
      includeJournalEntries?: boolean;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<any> {
    try {
      return await PatientDepositService.getDepositUsageHistory(depositId, options);
    } catch (error) {
      throw new BadException('Failed to get deposit usage history', 500, error.message);
    }
  }

  /**
   * Get deposit usage summary for a patient
   */
  static async getPatientDepositUsageSummary(patientId: number): Promise<any> {
    try {
      return await PatientDepositService.getPatientDepositUsageSummary(patientId);
    } catch (error) {
      throw new BadException('Failed to get deposit usage summary', 500, error.message);
    }
  }

  /**
   * Get comprehensive deposit refund history and analytics
   */
  static async getDepositRefundHistory(
    depositId: number,
    options: {
      includeTransactions?: boolean;
      includeJournalEntries?: boolean;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<any> {
    try {
      return await PatientDepositService.getDepositRefundHistory(depositId, options);
    } catch (error) {
      throw new BadException('Failed to get deposit refund history', 500, error.message);
    }
  }

  /**
   * Get refund summary for a patient
   */
  static async getPatientRefundSummary(patientId: number): Promise<any> {
    try {
      return await PatientDepositService.getPatientRefundSummary(patientId);
    } catch (error) {
      throw new BadException('Failed to get patient refund summary', 500, error.message);
    }
  }

  /**
   * Get comprehensive deposit status and lifecycle information
   */
  static async getDepositStatus(depositId: number): Promise<any> {
    try {
      return await PatientDepositService.getDepositStatus(depositId);
    } catch (error) {
      throw new BadException('Failed to get deposit status', 500, error.message);
    }
  }

  /**
   * Get deposit analytics for management dashboard
   */
  static async getDepositAnalytics(
    filters: {
      patientId?: number;
      bankAccountId?: number;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<any> {
    try {
      return await PatientDepositService.getDepositAnalytics(filters);
    } catch (error) {
      throw new BadException('Failed to get deposit analytics', 500, error.message);
    }
  }

  /**
   * Reconcile deposit balances with journal entries
   */
  static async reconcileDepositBalances(depositId?: number): Promise<any> {
    try {
      return await PatientDepositService.reconcileDepositBalances(depositId);
    } catch (error) {
      throw new BadException('Failed to reconcile deposit balances', 500, error.message);
    }
  }

  /**
   * Generate comprehensive reconciliation report
   */
  static async generateReconciliationReport(
    filters: {
      startDate?: Date;
      endDate?: Date;
      includeDetails?: boolean;
      format?: 'summary' | 'detailed' | 'csv' | 'pdf';
    } = {}
  ): Promise<any> {
    try {
      return await PatientDepositService.generateReconciliationReport(filters);
    } catch (error) {
      throw new BadException('Failed to generate reconciliation report', 500, error.message);
    }
  }

  /**
   * Get comprehensive audit trail for a deposit
   */
  static async getDepositAuditTrail(
    depositId: number,
    filters?: {
      action_type?: any;
      severity?: any;
      performed_by?: number;
      start_date?: Date;
      end_date?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<any> {
    try {
      return await DepositAuditService.getDepositAuditTrail(depositId, filters as any);
    } catch (error) {
      throw new BadException('Failed to get deposit audit trail', 500, error.message);
    }
  }

  /**
   * Get comprehensive audit summary
   */
  static async getAuditSummary(filters?: {
    deposit_id?: number;
    action_type?: any;
    severity?: any;
    performed_by?: number;
    start_date?: Date;
    end_date?: Date;
  }): Promise<any> {
    try {
      return await DepositAuditService.getAuditSummary(filters as any);
    } catch (error) {
      throw new BadException('Failed to get deposit audit trail', 500, error.message);
    }
  }

  /**
   * Ensure required Chart of Accounts exist for comprehensive payment processing
   */
  static async ensurePatientDepositAccountsExist(): Promise<void> {
    try {
      await ComprehensiveChartOfAccountsService.ensureRequiredAccountsExist();
    } catch (error) {
      throw new BadException(
        'Failed to ensure comprehensive Chart of Accounts exist',
        500,
        error.message
      );
    }
  }

  /**
   * Validate that all required Chart of Accounts exist for comprehensive payment processing
   */
  static async validatePatientDepositAccounts(): Promise<{ valid: boolean; missing: string[] }> {
    try {
      return await ComprehensiveChartOfAccountsService.validateRequiredAccounts();
    } catch (error) {
      throw new BadException(
        'Failed to validate comprehensive Chart of Accounts',
        500,
        error.message
      );
    }
  }

  /**
   * Get required Chart of Account for patient deposits
   */
  static async getPatientDepositAccount(accountCode: string): Promise<any> {
    try {
      return await ComprehensiveChartOfAccountsService.getRequiredAccount(accountCode);
    } catch (error) {
      throw new BadException(
        `Failed to get patient deposit account ${accountCode}`,
        500,
        error.message
      );
    }
  }

  /**
   * Get patient deposit by patient ID
   */
  static async getPatientDepositByPatientId(patientId: number): Promise<any> {
    try {
      const deposit = await AccountingRepository.getPatientDepositByPatientId(patientId);
      return deposit;
    } catch (error) {
      throw new BadException('Failed to get patient deposit by patient ID', 500, error.message);
    }
  }

  /**
   * Get patient deposit balance
   */
  static async getPatientDepositBalance(patientId: number): Promise<number> {
    try {
      return await AccountingRepository.getPatientDepositBalance(patientId);
    } catch (error) {
      throw new BadException('Failed to get patient deposit balance', 500, error.message);
    }
  }

  /**
   * Get patient deposit history
   */
  static async getPatientDepositHistory(patientId: number): Promise<any[]> {
    try {
      return await AccountingRepository.getPatientDepositHistory(patientId);
    } catch (error) {
      throw new BadException('Failed to get patient deposit history', 500, error.message);
    }
  }

  /**
   * Get patient deposit balance summary
   */
  static async getPatientDepositBalanceSummary(patientId: number): Promise<any> {
    try {
      return await AccountingRepository.getPatientDepositBalanceSummary(patientId);
    } catch (error) {
      throw new BadException('Failed to get patient deposit balance summary', 500, error.message);
    }
  }

  // Clinical Bills
  static async createClinicalBill(
    billingRequest: BillingRequestData,
  ): Promise<{ bill: ClinicalBill; items: ClinicalBillItem[] }> {
    try {
      // Generate bill number
      const billNumber = await AccountingRepository.generateBillNumber();

      // Calculate amounts
      let totalAmount = 0;
      const billItems: ClinicalBillItemData[] = [];

      if (billingRequest?.items?.length) {
        for (const item of billingRequest.items) {
          // Get item pricing from appropriate source (Drug, Test, Investigation, Service)
          const unitPrice = await AccountingService.getItemUnitPrice(item.item_type, item.item_id);
          const totalPrice = unitPrice * item.quantity;
          const discountAmount = ((item.discount_percentage || 0) * totalPrice) / 100;
          const finalPrice = totalPrice - discountAmount;

          totalAmount += finalPrice;

          billItems.push({
            bill_id: 0, // Will be set after bill creation
            item_type: item.item_type,
            item_id: item.item_id,
            item_name: await AccountingService.getItemName(item.item_type, item.item_id),
            item_code: await AccountingService.getItemCode(item.item_type, item.item_id),
            quantity: item.quantity,
            unit_price: unitPrice,
            total_price: totalPrice,
            discount_percentage: item.discount_percentage || 0,
            discount_amount: discountAmount,
            final_price: finalPrice,
            notes: item.notes,
          });
        }
      }

      // Calculate HMO and patient co-pay amounts
      const hmoBilledAmount = billingRequest.hmo_billed_amount || 0;
      const patientCoPayAmount =
        billingRequest.patient_co_pay_amount || totalAmount - hmoBilledAmount;

      // Ensure billing is centralized to accounting department
      const collectionPoint = billingRequest.payment_collection_point || 'main-cashier';
      const collectionMethod = billingRequest.payment_collection_method || 'POINT_OF_SERVICE';

      // Get current financial period
      const currentPeriod = await FinancialPeriodValidationService.getCurrentActivePeriod();
      if (!currentPeriod) {
        throw new BadException(
          'Financial Period Not Available',
          503,
          'No active financial period found. Please configure financial periods before processing transactions.'
        );
      }

      // Create bill
      const billData: ClinicalBillData = {
        bill_number: billNumber,
        patient_id: billingRequest.patient_id,
        visit_id: billingRequest.visit_id,
        total_amount: totalAmount,
        discount_amount: 0, // Item-level discounts are handled separately
        tax_amount: 0, // Tax calculation can be added later
        final_amount: totalAmount,
        billing_mode: billingRequest.billing_mode,
        patient_co_pay_amount: patientCoPayAmount,
        hmo_billed_amount: hmoBilledAmount,
        payment_status: PaymentStatus.PENDING,
        billing_status: BillingStatus.PENDING,
        payment_collection_method: collectionMethod as PaymentCollectionMethod,
        payment_collection_point: collectionPoint,
        due_date: billingRequest.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        notes: billingRequest.notes,
        created_by: billingRequest.created_by,
        period_id: currentPeriod.id, // Link to current financial period
      };

      const bill = await AccountingRepository.createClinicalBill(billData);

      // Create bill items
      if (billItems?.length) {
        for (const item of billItems) {
          item.bill_id = bill.id;
        }
        await AccountingRepository.createClinicalBillItems(billItems);
      }

      // Return complete bill with items
      return await AccountingRepository.getClinicalBillWithItems(bill.id);
    } catch (error) {
      console.error(error);
      throw new BadException('Failed to create clinical bill', 500, error.message);
    }
  }

  static async getClinicalBillById(id: number): Promise<any> {
    try {
      const bill = await AccountingRepository.getClinicalBillWithItems(id);
      if (!bill) {
        throw new BadException('Clinical bill not found', 404);
      }
      return bill;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to retrieve clinical bill', 500, error.message);
    }
  }

  static async getClinicalBillWithItems(id: number): Promise<any> {
    try {
      const result = await AccountingRepository.getClinicalBillWithItems(id);
      if (!result) {
        throw new BadException('Clinical bill not found', 404);
      }
      return result;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to retrieve clinical bill with items', 500, error.message);
    }
  }

  static async getClinicalBills(
    filters: BillSearchFilters
  ) {
    try {
      return AccountingRepository.getClinicalBills(filters);
    } catch (error) {
      throw new BadException('Failed to retrieve clinical bills', 500, error.message);
    }
  }

  static async updateClinicalBill(id: number, updateData: Partial<ClinicalBillData>): Promise<any> {
    try {
      const bill = await AccountingRepository.updateClinicalBill(id, updateData);
      if (!bill) {
        throw new BadException('Clinical bill not found', 404);
      }
      return await AccountingRepository.getClinicalBillWithItems(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to update clinical bill', 500, error.message);
    }
  }

  static async getBillingSummary(patientId?: number): Promise<BillingSummary> {
    try {
      return await AccountingRepository.getBillingSummary(patientId);
    } catch (error) {
      throw new BadException('Failed to retrieve billing summary', 500, error.message);
    }
  }

  // Clinical Payments
  static async createClinicalPayment(
    paymentRequest: PaymentRequestData,
    transaction?: Transaction
  ): Promise<any> {
    try {
      // Generate payment reference
      const paymentReference = await AccountingRepository.generatePaymentReference();

      // Validate bill exists and get current status
      const bill = await AccountingRepository.getClinicalBillById(paymentRequest.bill_id);
      if (!bill) {
        throw new BadException('Clinical bill not found', 404);
      }

      // Check if payment amount is valid
      if (paymentRequest.amount <= 0) {
        throw new BadException('Payment amount must be greater than zero', 400);
      }

      // Check if payment amount exceeds bill amount
      if (paymentRequest.amount > bill.final_amount) {
        throw new BadException('Payment amount cannot exceed bill amount', 400);
      }

      // Determine payment type based on collection method
      let paymentType = paymentRequest.payment_type;
      if (bill.payment_collection_method === PaymentCollectionMethod.DEPOSIT) {
        paymentType = PaymentType.DEPOSIT;
      } else if (bill.payment_collection_method === PaymentCollectionMethod.POINT_OF_SERVICE) {
        paymentType = PaymentType.POINT_OF_SERVICE;
      }

      // Get current financial period
      const currentPeriod = await FinancialPeriodValidationService.getCurrentActivePeriod();
      if (!currentPeriod) {
        throw new BadException(
          'Financial Period Not Available',
          503,
          'No active financial period found. Please configure financial periods before processing transactions.'
        );
      }

      // Create payment
      const paymentData: ClinicalPaymentData = {
        payment_reference: paymentReference,
        bill_id: paymentRequest.bill_id,
        patient_id: paymentRequest.patient_id,
        amount: paymentRequest.amount,
        payment_method: paymentRequest.payment_method,
        payment_type: paymentType,
        collection_point: paymentRequest.collection_point || bill.payment_collection_point,
        transaction_id: paymentRequest.transaction_id,
        bank_reference: paymentRequest.bank_reference,
        card_type: paymentRequest.card_type,
        mobile_money_provider: paymentRequest.mobile_money_provider,
        deposit_id: paymentRequest.deposit_id,
        insurance_provider: paymentRequest.insurance_provider,
        insurance_claim_number: paymentRequest.insurance_claim_number,
        notes: paymentRequest.notes,
        status: PaymentStatus.PENDING,
        processed_by: paymentRequest.processed_by,
        processed_at: new Date(),
        period_id: currentPeriod.id, // Link to current financial period
      };

      const payment = await AccountingRepository.createClinicalPayment(paymentData);

      // Update bill payment status
      await AccountingService.updateBillPaymentStatus(paymentRequest.bill_id);

      // Process payment based on collection method
      if (bill.payment_collection_method === 'DEPOSIT') {
        await AccountingService.processDepositPayment(
          paymentRequest.bill_id,
          paymentRequest.amount
        );
      } else if (bill.payment_collection_method === 'POINT_OF_SERVICE') {
        await AccountingService.processPointOfServicePayment(
          paymentRequest.bill_id,
          paymentRequest.amount
        );
      } else if (bill.payment_collection_method === 'MIXED') {
        await AccountingService.processMixedPayment(
          paymentRequest.bill_id,
          paymentRequest.amount,
          paymentRequest.deposit_id
        );
      }

      // Return complete payment
      return await AccountingRepository.getClinicalPaymentById(payment.id);
    } catch (error) {
      throw new BadException('Failed to create clinical payment', 500, error.message);
    }
  }

  /**
   * Get payment receipt data for PDF generation
   */
  static async getPaymentReceiptData(paymentId: number): Promise<any> {
    try {
      // Get payment with related data
      const payment = await AccountingRepository.getClinicalPaymentById(paymentId);
      if (!payment) {
        throw new BadException('Payment not found', 404);
      }

      // Get bill with items
      const billWithItems = await AccountingRepository.getClinicalBillWithItems(payment.bill_id);
      if (!billWithItems?.bill) {
        throw new BadException('Bill not found', 404);
      }

      // Get payment items to see what was actually paid for
      const { ClinicalPaymentItem } = await import('../../database/models');
      const paymentItems = await ClinicalPaymentItem.findAll({
        where: { payment_id: paymentId },
        order: [['createdAt', 'ASC']],
      });

      // Get patient information
      const { Patient } = await import('../../database/models');
      const patient = await Patient.findByPk(payment.patient_id);
      if (!patient) {
        throw new BadException('Patient not found', 404);
      }

      return {
        payment,
        bill: billWithItems.bill,
        billItems: billWithItems.items || [],
        paymentItems: paymentItems || [],
        patient,
      };
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to get payment receipt data', 500, error.message);
    }
  }

  static async getClinicalPaymentById(id: number): Promise<any> {
    try {
      const payment = await AccountingRepository.getClinicalPaymentById(id);
      if (!payment) {
        throw new BadException('Clinical payment not found', 404);
      }
      return payment;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to retrieve clinical payment', 500, error.message);
    }
  }

  static async getClinicalPayments(filters: PaymentSearchFilters) {
    try {
      return AccountingRepository.getClinicalPayments(filters);
    } catch (error) {
      throw new BadException('Failed to retrieve clinical payments', 500, error.message);
    }
  }

  static async updateClinicalPayment(
    id: number,
    updateData: Partial<ClinicalPaymentData>
  ): Promise<any> {
    try {
      const payment = await AccountingRepository.updateClinicalPayment(id, updateData);
      if (!payment) {
        throw new BadException('Clinical payment not found', 404);
      }
      return await AccountingRepository.getClinicalPaymentById(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to update clinical payment', 500, error.message);
    }
  }

  static async getPaymentSummary(patientId?: number): Promise<PaymentSummary> {
    try {
      return await AccountingRepository.getPaymentSummary(patientId);
    } catch (error) {
      throw new BadException('Failed to retrieve payment summary', 500, error.message);
    }
  }

  // Payment Processing Methods
  private static async processDepositPayment(
    billId: number,
    amount: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      // Find available deposits for the patient
      const bill = await AccountingRepository.getClinicalBillById(billId);
      if (!bill) return;

      const deposits = await AccountingRepository.getPatientDeposits({
        patient_id: bill.patient_id,
        status: DepositStatus.ACTIVE,
      });

      let remainingAmount = amount;

      for (const deposit of deposits.docs) {
        if (remainingAmount <= 0) break;

        const deductAmount = Math.min(deposit.amount, remainingAmount);
        const newAmount = deposit.amount - deductAmount;

        await AccountingRepository.updatePatientDeposit(deposit.id, {
          amount: newAmount,
          status: newAmount <= 0 ? DepositStatus.USED : DepositStatus.ACTIVE,
        });

        remainingAmount -= deductAmount;
      }

      if (remainingAmount > 0) {
        throw new BadException('Insufficient deposit balance', 400);
      }
    } catch (error) {
      console.error('Failed to process deposit payment:', error);
      throw error;
    }
  }

  private static async processPointOfServicePayment(
    billId: number,
    amount: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      // Point-of-service payments are processed immediately
      // No additional processing needed - payment is already recorded
      console.log(`Point-of-service payment processed for bill ${billId}: ${amount}`);
    } catch (error) {
      console.error('Failed to process point-of-service payment:', error);
      throw error;
    }
  }

  private static async processMixedPayment(
    billId: number,
    amount: number,
    depositId?: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      if (depositId) {
        // Part deposit, part point-of-service
        const deposit = await AccountingRepository.getPatientDepositById(depositId);
        if (deposit && deposit.amount > 0) {
          const depositAmount = Math.min(deposit.amount, amount);
          const remainingAmount = amount - depositAmount;

          // Process deposit portion
          await AccountingService.processDepositPayment(billId, depositAmount);

          // Process remaining amount as point-of-service
          if (remainingAmount > 0) {
            await AccountingService.processPointOfServicePayment(billId, remainingAmount);
          }
        }
      } else {
        // Default to point-of-service payment
        await AccountingService.processPointOfServicePayment(billId, amount);
      }
    } catch (error) {
      console.error('Failed to process mixed payment:', error);
      throw error;
    }
  }

  // Private Helper Methods
  private static async getItemUnitPrice(itemType: string, itemId: number): Promise<number> {
    // This would integrate with existing pricing models
    // For now, return a default price
    switch (itemType) {
      case 'DRUG':
        return 100; // Default drug price
      case 'TEST':
        return 500; // Default test price
      case 'INVESTIGATION':
        return 1000; // Default investigation price
      case 'SERVICE':
        return 200; // Default service price
      case 'ADDITIONAL_ITEM':
        return 150; // Default additional item price
      default:
        return 100;
    }
  }

  private static async getItemName(itemType: string, itemId: number): Promise<string> {
    // This would integrate with existing models to get actual item names
    // For now, return a placeholder
    return `${itemType} Item ${itemId}`;
  }

  private static async getItemCode(itemType: string, itemId: number): Promise<string> {
    // This would integrate with existing models to get actual item codes
    // For now, return a placeholder
    return `${itemType.substring(0, 3).toUpperCase()}-${itemId}`;
  }

  private static async updateBillPaymentStatus(
    billId: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      const bill = await AccountingRepository.getClinicalBillById(billId);
      if (!bill) return;

      // Get total payments for this bill
      const payments = await AccountingRepository.getClinicalPayments({ bill_id: billId });
      const totalPaid = payments.docs.reduce((sum, payment) => sum + +payment.amount, 0);

      let paymentStatus: PaymentStatus;
      if (totalPaid >= bill.final_amount) {
        paymentStatus = PaymentStatus.PAID;
      } else if (totalPaid > 0) {
        paymentStatus = PaymentStatus.PARTIAL;
      } else {
        paymentStatus = PaymentStatus.PENDING;
      }

      await AccountingRepository.updateClinicalBill(billId, { payment_status: paymentStatus });

      // 🆕 NEW: Update individual prescribed order payment statuses
      await AccountingService.updatePrescribedOrderPaymentStatuses(billId, paymentStatus);
    } catch (error) {
      console.error('Failed to update bill payment status:', error);
    }
  }

  /**
   * 🆕 NEW: Update payment status of individual prescribed orders based on bill payment status
   */
  private static async updatePrescribedOrderPaymentStatuses(
    billId: number,
    paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING'
  ): Promise<void> {
    try {
      // Get bill items using the new repository method
      const billItems = await AccountingRepository.getClinicalBillItems({ bill_id: billId });
      if (!billItems || !billItems.items) return;

      if (paymentStatus === 'PARTIAL') {
        // For partial payments, calculate which items are fully paid vs. partially paid
        await AccountingService.updatePrescribedOrderPaymentStatusesForPartialPayment(billId);
      } else {
        // For full payments or pending, update all items with the same status
        for (const billItem of billItems.items) {
          await AccountingService.updatePrescribedOrderPaymentStatus(billItem, paymentStatus);
        }
      }
    } catch (error) {
      console.error('Failed to update prescribed order payment statuses:', error);
    }
  }

  /**
   * 🆕 NEW: Handle partial payments by calculating which items are fully paid
   */
  private static async updatePrescribedOrderPaymentStatusesForPartialPayment(
    billId: number
  ): Promise<void> {
    try {
      // Get bill and payments
      const bill = await AccountingRepository.getClinicalBillById(billId);
      if (!bill) return;

      const payments = await AccountingRepository.getClinicalPayments({ bill_id: billId });
      const totalPaid = payments.docs.reduce((sum, payment) => sum + +payment.amount, 0);

      // Get bill items
      const billItems = await AccountingRepository.getClinicalBillItems({ bill_id: billId });
      if (!billItems || !billItems.items) return;

      // Sort items by priority (usually by creation date or medical priority)
      const sortedItems = billItems.items.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );

      let remainingPayment = totalPaid;

      for (const billItem of sortedItems) {
        const itemTotal = parseFloat(billItem.total_price.toString());

        if (remainingPayment >= itemTotal) {
          // Item is fully paid
          await AccountingService.updatePrescribedOrderPaymentStatus(billItem, 'PAID');
          remainingPayment -= itemTotal;
        } else if (remainingPayment > 0) {
          // Item is partially paid
          await AccountingService.updatePrescribedOrderPaymentStatus(billItem, 'PARTIAL');
          remainingPayment = 0; // No more payment left
        } else {
          // Item is not paid
          await AccountingService.updatePrescribedOrderPaymentStatus(billItem, 'PENDING');
        }
      }
    } catch (error) {
      console.error(
        'Failed to update prescribed order payment statuses for partial payment:',
        error
      );
    }
  }

  /**
   * 🆕 NEW: Reset prescribed order payment statuses when payment is cancelled/refunded
   */
  private static async resetPrescribedOrderPaymentStatuses(billId: number): Promise<void> {
    try {
      // Get bill items
      const billItems = await AccountingRepository.getClinicalBillItems({ bill_id: billId });
      if (!billItems || !billItems.items) return;

      // Reset all items to pending
      for (const billItem of billItems.items) {
        await AccountingService.updatePrescribedOrderPaymentStatus(billItem, 'PENDING');
      }
    } catch (error) {
      console.error('Failed to reset prescribed order payment statuses:', error);
    }
  }

  /**
   * 🆕 NEW: Public method to cancel/refund a payment and reset prescribed order statuses
   */
  static async cancelPayment(billId: number): Promise<void> {
    try {
      // Update bill status to cancelled
      await AccountingRepository.updateClinicalBill(billId, {
        payment_status: PaymentStatus.CANCELLED,
      });

      // Reset all prescribed order payment statuses
      await AccountingService.resetPrescribedOrderPaymentStatuses(billId);
    } catch (error) {
      throw new BadException('Failed to cancel payment', 500, error.message);
    }
  }

  /**
   * 🆕 NEW: Update payment status of a specific prescribed order
   */
  private static async updatePrescribedOrderPaymentStatus(
    billItem: any,
    paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING'
  ): Promise<void> {
    try {
      const {
        PrescribedDrug,
        PrescribedTest,
        PrescribedInvestigation,
        PrescribedService,
        PrescribedAdditionalItem,
      } = await import('../../database/models');

      // Map accounting payment status to prescribed order payment status
      // Accounting: 'PENDING' | 'PARTIAL' | 'PAID' | 'CANCELLED'
      // Prescribed: 'Pending' | 'Paid' | 'Cleared' | 'Permitted'
      let prescribedOrderStatus: string;

      switch (paymentStatus) {
        case 'PAID':
          prescribedOrderStatus = 'Paid';
          break;
        case 'PARTIAL':
          prescribedOrderStatus = 'Permitted'; // Partial payment allows service to proceed
          break;
        case 'PENDING':
        default:
          prescribedOrderStatus = 'Pending';
          break;
      }

      // Update the corresponding prescribed order based on item_type
      switch (billItem.item_type) {
        case 'DRUG':
          await PrescribedDrug.update(
            { payment_status: prescribedOrderStatus },
            { where: { id: billItem.item_id } }
          );
          break;

        case 'TEST':
          await PrescribedTest.update(
            { payment_status: prescribedOrderStatus },
            { where: { id: billItem.item_id } }
          );
          break;

        case 'INVESTIGATION':
          await PrescribedInvestigation.update(
            { payment_status: prescribedOrderStatus },
            { where: { id: billItem.item_id } }
          );
          break;

        case 'SERVICE':
          await PrescribedService.update(
            { payment_status: prescribedOrderStatus },
            { where: { id: billItem.item_id } }
          );
          break;

        case 'ADDITIONAL_ITEM':
          await PrescribedAdditionalItem.update(
            { payment_status: prescribedOrderStatus },
            { where: { id: billItem.item_id } }
          );
          break;

        default:
          console.warn(`Unknown item type: ${billItem.item_type} for bill item ${billItem.id}`);
      }
    } catch (error) {
      console.error(
        `Failed to update prescribed order payment status for item ${billItem.id}:`,
        error
      );
    }
  }

  private static async updateDepositUsage(
    depositId: number,
    amount: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      const deposit = await AccountingRepository.getPatientDepositById(depositId);
      if (!deposit) return;

      const newAmount = deposit.amount - amount;
      let status = deposit.status;

      if (newAmount <= 0) {
        status = DepositStatus.USED;
      }

      await AccountingRepository.updatePatientDeposit(depositId, {
        amount: Math.max(0, newAmount),
        status: status as any,
      });
    } catch (error) {
      console.error('Failed to update deposit usage:', error);
    }
  }

  // Dashboard and Summary Methods
  /**
   * Get comprehensive accounting summary with optimized database-level aggregations
   * @returns Summary statistics including revenue, bills, payments, and deposits
   */
  static async getAccountingSummary(): Promise<any> {
    try {
      // Define date ranges using dayjs for clean date manipulation
      const now = dayjs();
      const thirtyDaysAgo = now.subtract(30, 'day').toDate();
      const sixtyDaysAgo = now.subtract(60, 'day').toDate();

      // Execute all queries in parallel for optimal performance
      const [
        allBillsStats,
        currentPeriodBillsStats,
        previousPeriodBillsStats,
        currentPeriodPaymentsStats,
        allDepositsStats,
        activeDepositsStats,
        paymentStatusBreakdown,
        billingStatusBreakdown,
        recentBills,
        recentPayments,
      ] = await Promise.all([
        // All bills (for totals)
        AccountingRepository.getBillStatistics(),
        // Current period bills (last 30 days)
        AccountingRepository.getBillStatistics(thirtyDaysAgo, now.toDate()),
        // Previous period bills (30-60 days ago)
        AccountingRepository.getBillStatistics(sixtyDaysAgo, thirtyDaysAgo),
        // Current period payments (last 30 days)
        AccountingRepository.getPaymentStatistics(thirtyDaysAgo, now.toDate()),
        // All deposits (for total amount)
        AccountingRepository.getDepositStatistics(),
        // Active deposits only
        AccountingRepository.getDepositStatistics(DepositStatus.ACTIVE),
        // Payment status counts
        AccountingRepository.getPaymentStatusCounts(),
        // Billing status counts
        AccountingRepository.getBillingStatusCounts(),
        // Recent bills (last 5)
        AccountingRepository.getRecentBills(5),
        // Recent payments (last 5)
        AccountingRepository.getRecentPayments(5),
      ]);

      // Calculate changes between periods
      const revenueChange =
        previousPeriodBillsStats.total_amount > 0
          ? ((currentPeriodBillsStats.total_amount - previousPeriodBillsStats.total_amount) /
              previousPeriodBillsStats.total_amount) *
            100
          : 0;

      const billsChange =
        previousPeriodBillsStats.total_count > 0
          ? ((currentPeriodBillsStats.total_count - previousPeriodBillsStats.total_count) /
              previousPeriodBillsStats.total_count) *
            100
          : 0;

      // Calculate collection rate (payments / revenue in current period)
      const collectionRate =
        currentPeriodBillsStats.total_amount > 0
          ? (currentPeriodPaymentsStats.total_amount / currentPeriodBillsStats.total_amount) * 100
          : 0;

      // Calculate average bill amount
      const averageBillAmount =
        allBillsStats.total_count > 0
          ? allBillsStats.total_amount / allBillsStats.total_count
          : 0;

      // Get pending payments count from payment status breakdown
      const pendingPayments = paymentStatusBreakdown.pending || 0;

      return {
        // Current metrics
        totalBills: allBillsStats.total_count,
        totalRevenue: allBillsStats.total_amount,
        pendingPayments,
        totalDeposits: allDepositsStats.total_amount,

        // Change indicators (rounded to 2 decimal places)
        billsChange: Math.round(billsChange * 100) / 100,
        revenueChange: Math.round(revenueChange * 100) / 100,
        pendingCount: pendingPayments,
        activeDeposits: activeDepositsStats.total_count,

        // Current period metrics
        currentPeriodRevenue: currentPeriodBillsStats.total_amount,
        currentPeriodPayments: currentPeriodPaymentsStats.total_amount,

        // Breakdowns
        paymentStatusBreakdown,
        billingStatusBreakdown,

        // Recent activity
        recentBills,
        recentPayments,

        // Additional metrics
        averageBillAmount: Math.round(averageBillAmount * 100) / 100,
        collectionRate: Math.round(collectionRate * 100) / 100,
      };
    } catch (error) {
      throw new BadException(`Failed to get accounting summary: ${error.message}`, 500);
    }
  }

  static async getFinancialReports(params: any): Promise<any> {
    try {
      const { start_date, end_date, department, chart_type } = params;

      // Use the new repository method to get real financial data
      const reports = await AccountingRepository.getFinancialReportsData({
        start_date,
        end_date,
        department,
        chart_type,
      });

      return reports;
    } catch (error) {
      throw new BadException(`Failed to get financial reports: ${error.message}`, 500);
    }
  }

  static async useDeposit(data: any): Promise<any> {
    try {
      const { deposit_id, bill_id, amount, notes, used_by } = data;

      // Get the deposit
      const deposit = await AccountingRepository.getPatientDepositById(deposit_id);
      if (!deposit) {
        throw new BadException('Deposit not found', 404);
      }

      if (deposit.status !== DepositStatus.ACTIVE) {
        throw new BadException('Deposit is not active', 400);
      }

      if (deposit.amount < amount) {
        throw new BadException('Insufficient deposit amount', 400);
      }

      // Get the bill to determine payment type
      const bill = await AccountingRepository.getClinicalBillById(bill_id);
      if (!bill) {
        throw new BadException('Bill not found', 404);
      }

      // Determine payment type based on amount comparison
      let paymentType: PaymentType;
      if (amount >= bill.final_amount) {
        paymentType = PaymentType.FULL;
      } else if (amount < bill.final_amount) {
        paymentType = PaymentType.PARTIAL;
      } else {
        paymentType = PaymentType.DEPOSIT;
      }

      // Create payment record
      const payment = await AccountingRepository.createClinicalPayment({
        bill_id,
        patient_id: deposit.patient_id,
        amount,
        payment_method: PaymentMethod.DEPOSIT,
        payment_type: paymentType,
        payment_reference: `DEP-${deposit_id}`,
        notes: notes || `Used from deposit ${deposit.reference_number}`,
        processed_by: used_by,
      });

      // Update deposit amount
      const newAmount = deposit.amount - amount;
      const newStatus = newAmount === 0 ? DepositStatus.USED : DepositStatus.ACTIVE;

      await AccountingRepository.updatePatientDeposit(deposit_id, {
        amount: newAmount,
        status: newStatus,
      });

      return payment;
    } catch (error) {
      throw new BadException(`Failed to use deposit: ${error.message}`, 500);
    }
  }

  // ===== BILLING POINTS =====
  static async fetchBillingPoints(): Promise<any[]> {
    try {
      return await AccountingRepository.fetchBillingPoints();
    } catch (error) {
      throw new BadException(`Failed to fetch billing points: ${error.message}`, 500);
    }
  }

  // ===== CLINICAL BILL SEARCH =====
  static async getClinicalBillByNumber(billNumber: string): Promise<any> {
    try {
      return await AccountingRepository.getClinicalBillByNumber(billNumber);
    } catch (error) {
      throw new BadException(`Failed to get bill by number: ${error.message}`, 500);
    }
  }

  static async getPatientClinicalBills(patientId: number): Promise<any[]> {
    try {
      return await AccountingRepository.getPatientClinicalBills(patientId);
    } catch (error) {
      throw new BadException(`Failed to get patient bills: ${error.message}`, 500);
    }
  }

  // ===== BANK ACCOUNT METHODS =====

  static async getBankAccounts(filters: any = {}): Promise<any> {
    try {
      return await AccountingRepository.getBankAccounts(filters);
    } catch (error) {
      throw new BadException('Failed to retrieve bank accounts', 500, error.message);
    }
  }

  static async getBankAccountById(id: number): Promise<any> {
    try {
      const bankAccount = await AccountingRepository.getBankAccountById(id);
      if (!bankAccount) {
        throw new BadException('Error', 404, 'Bank account not found');
      }
      return bankAccount;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to retrieve bank account', 500, error.message);
    }
  }

  static async createBankAccount(data: any, staffId: number): Promise<any> {
    try {
      const bankAccount = await AccountingRepository.createBankAccount(data, staffId);
      return await AccountingRepository.getBankAccountById(bankAccount.id);
    } catch (error) {
      throw new BadException('Failed to create bank account', 500, error.message);
    }
  }

  static async updateBankAccount(id: number, data: any, staffId: number): Promise<any> {
    try {
      const bankAccount = await AccountingRepository.updateBankAccount(id, data, staffId);
      if (!bankAccount) {
        throw new BadException('Bank account not found', 404);
      }
      return await AccountingRepository.getBankAccountById(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to update bank account', 500, error.message);
    }
  }

  static async deleteBankAccount(id: number, staffId: number): Promise<any> {
    try {
      const bankAccount = await AccountingRepository.deleteBankAccount(id, staffId);
      if (!bankAccount) {
        throw new BadException('Bank account not found', 404);
      }
      return bankAccount;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to delete bank account', 500, error.message);
    }
  }

  static async getActiveBankAccounts(): Promise<any[]> {
    try {
      return await AccountingRepository.getActiveBankAccounts();
    } catch (error) {
      throw new BadException('Failed to retrieve active bank accounts', 500, error.message);
    }
  }

  static async updateBankAccountBalance(
    id: number,
    amount: number,
    operation: 'add' | 'subtract',
    transaction?: Transaction
  ): Promise<any> {
    try {
      return await AccountingRepository.updateBankAccountBalance(
        id,
        amount,
        operation,
        transaction
      );
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to update bank account balance', 500, error.message);
    }
  }

  static async toggleBankAccountStatus(id: number, staffId: number): Promise<any> {
    try {
      const bankAccount = await AccountingRepository.toggleBankAccountStatus(id, staffId);
      if (!bankAccount) {
        throw new BadException('Bank account not found', 404);
      }
      return await AccountingRepository.getBankAccountById(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to toggle bank account status', 500, error.message);
    }
  }

  // ===== POS TERMINAL METHODS =====

  /**
   * Get all POS terminals with pagination and filters
   */
  static async getPOSTerminals(filters: any = {}) {
    try {
      return await AccountingRepository.getPOSTerminals(filters);
    } catch (error) {
      throw new BadException('Failed to get POS terminals', 500, error.message);
    }
  }

  /**
   * Get POS terminal by ID
   */
  static async getPOSTerminalById(id: number) {
    try {
      const posTerminal = await AccountingRepository.getPOSTerminalById(id);
      if (!posTerminal) {
        throw new BadException('POS terminal not found', 404);
      }
      return posTerminal;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to get POS terminal', 500, error.message);
    }
  }

  /**
   * Create new POS terminal
   */
  static async createPOSTerminal(data: any, staffId: number) {
    try {
      const posTerminal = await AccountingRepository.createPOSTerminal(data, staffId);
      return await AccountingRepository.getPOSTerminalById(posTerminal.id);
    } catch (error) {
      throw new BadException('Failed to create POS terminal', 500, error.message);
    }
  }

  /**
   * Update POS terminal
   */
  static async updatePOSTerminal(id: number, data: any, staffId: number) {
    try {
      const posTerminal = await AccountingRepository.updatePOSTerminal(id, data, staffId);
      return await AccountingRepository.getPOSTerminalById(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to update POS terminal', 500, error.message);
    }
  }

  /**
   * Delete POS terminal (soft delete)
   */
  static async deletePOSTerminal(id: number, staffId: number) {
    try {
      const posTerminal = await AccountingRepository.deletePOSTerminal(id, staffId);
      return posTerminal;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to delete POS terminal', 500, error.message);
    }
  }

  /**
   * Get active POS terminals for payments
   */
  static async getActivePOSTerminals() {
    try {
      return await AccountingRepository.getActivePOSTerminals();
    } catch (error) {
      throw new BadException('Failed to get active POS terminals', 500, error.message);
    }
  }

  /**
   * Get POS terminals by bank account
   */
  static async getPOSTerminalsByBankAccount(bankAccountId: number) {
    try {
      const posTerminal = await AccountingRepository.getPOSTerminalsByBankAccount(bankAccountId);
      return posTerminal;
    } catch (error) {
      throw new BadException('Failed to get POS terminals by bank account', 500, error.message);
    }
  }

  /**
   * Update POS terminal last used timestamp
   */
  static async updatePOSTerminalLastUsed(id: number) {
    try {
      return await AccountingRepository.updatePOSTerminalLastUsed(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to update POS terminal last used', 500, error.message);
    }
  }

  /**
   * Toggle POS terminal status (active/inactive)
   */
  static async togglePOSTerminalStatus(id: number, staffId: number) {
    try {
      const posTerminal = await AccountingRepository.togglePOSTerminalStatus(id, staffId);
      if (!posTerminal) {
        throw new BadException('POS terminal not found', 404);
      }
      return posTerminal;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to toggle POS terminal status', 500, error.message);
    }
  }

  // ===== FINANCIAL PERIOD MANAGEMENT =====

  /**
   * Create a new financial period
   */
  static async createFinancialPeriod(periodData: any, staffId: number): Promise<any> {
    try {
      return await FinancialPeriodManagementService.createPeriod({
        ...periodData,
        created_by: staffId,
      });
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to create financial period', 500, error.message);
    }
  }

  /**
   * Update an existing financial period
   */
  static async updateFinancialPeriod(id: number, periodData: any, staffId: number): Promise<any> {
    try {
      return await FinancialPeriodManagementService.updatePeriod(id, {
        ...periodData,
        updated_by: staffId,
      });
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to update financial period', 500, error.message);
    }
  }

  /**
   * Open a financial period
   */
  static async openFinancialPeriod(id: number, actionData: any, staffId: number): Promise<any> {
    try {
      return await FinancialPeriodManagementService.openPeriod(id, {
        ...actionData,
        action_by: staffId,
      });
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to open financial period', 500, error.message);
    }
  }

  /**
   * Close a financial period
   */
  static async closeFinancialPeriod(id: number, actionData: any, staffId: number): Promise<any> {
    try {
      return await FinancialPeriodManagementService.closePeriod(id, {
        ...actionData,
        action_by: staffId,
      });
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to close financial period', 500, error.message);
    }
  }

  /**
   * Lock a financial period
   */
  static async lockFinancialPeriod(id: number, actionData: any, staffId: number): Promise<any> {
    try {
      return await FinancialPeriodManagementService.lockPeriod(id, {
        ...actionData,
        action_by: staffId,
      });
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to lock financial period', 500, error.message);
    }
  }

  /**
   * Reconcile a financial period
   */
  static async reconcileFinancialPeriod(id: number): Promise<any> {
    try {
      return await FinancialPeriodManagementService.reconcilePeriod(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to reconcile financial period', 500, error.message);
    }
  }

  /**
   * Get financial period summary
   */
  static async getFinancialPeriodSummary(id: number): Promise<any> {
    try {
      return await FinancialPeriodManagementService.getPeriodSummary(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to get financial period summary', 500, error.message);
    }
  }

  /**
   * Get all financial periods with filtering
   */
  static async getFinancialPeriods(filters: any = {}): Promise<any> {
    try {
      return await FinancialPeriodManagementService.getPeriods(filters);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to get financial periods', 500, error.message);
    }
  }

  /**
   * Delete a financial period
   */
  static async deleteFinancialPeriod(id: number, staffId: number): Promise<boolean> {
    try {
      return await FinancialPeriodManagementService.deletePeriod(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to delete financial period', 500, error.message);
    }
  }

  /**
   * Validate transaction period for any financial operation
   */
  static async validateTransactionPeriod(transactionDate: Date, periodId?: number): Promise<any> {
    try {
      return await FinancialPeriodValidationService.validateTransactionPeriod(
        transactionDate,
        periodId
      );
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to validate transaction period', 500, error.message);
    }
  }

  /**
   * Get current active financial period
   */
  static async getCurrentActivePeriod(): Promise<any> {
    try {
      return await FinancialPeriodValidationService.getCurrentActivePeriod();
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to get current active period', 500, error.message);
    }
  }

  // =============================================================================
  // CASH REGISTER MANAGEMENT SERVICE METHODS
  // =============================================================================

  /**
   * Get all cash registers with filtering
   */
  static async getCashRegisters(options: {
    page: number;
    limit: number;
    filters?: any;
  }): Promise<any> {
    try {
      // Import CashPaymentService dynamically to avoid circular dependencies
      const { CashPaymentService } = await import('./services/cashPayment.service');

      const { page, limit, filters } = options;
      const result = await CashPaymentService.getCashRegisters({
        page,
        limit,
        filters: filters || {},
      });

      return result;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to get cash registers', 500, error.message);
    }
  }

  /**
   * Get cash register by ID
   */
  static async getCashRegisterById(id: number): Promise<any> {
    try {
      // Import CashPaymentService dynamically to avoid circular dependencies
      const { CashPaymentService } = await import('./services/cashPayment.service');

      return await CashPaymentService.getCashRegisterById(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to get cash register', 500, error.message);
    }
  }

  /**
   * Create new cash register
   */
  static async createCashRegister(registerData: any, staffId: number): Promise<any> {
    try {
      // Import CashPaymentService dynamically to avoid circular dependencies
      const { CashPaymentService } = await import('./services/cashPayment.service');

      return await CashPaymentService.createCashRegister(registerData, staffId);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to create cash register', 500, error.message);
    }
  }

  /**
   * Update cash register
   */
  static async updateCashRegister(id: number, updateData: any, staffId: number): Promise<any> {
    try {
      // Import CashPaymentService dynamically to avoid circular dependencies
      const { CashPaymentService } = await import('./services/cashPayment.service');

      return await CashPaymentService.updateCashRegister(id, updateData, staffId);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to update cash register', 500, error.message);
    }
  }

  /**
   * Delete cash register
   */
  static async deleteCashRegister(id: number, staffId: number): Promise<boolean> {
    try {
      // Import CashPaymentService dynamically to avoid circular dependencies
      const { CashPaymentService } = await import('./services/cashPayment.service');

      // Note: deleteCashRegister method doesn't exist in CashPaymentService
      // For now, we'll mark it as not implemented
      throw new BadException(
        'Not Implemented',
        501,
        'Cash register deletion is not yet implemented'
      );
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to delete cash register', 500, error.message);
    }
  }

  /**
   * Open cash register
   */
  static async openCashRegister(id: number, openingAmount: number, staffId: number): Promise<any> {
    try {
      // Import CashPaymentService dynamically to avoid circular dependencies
      const { CashPaymentService } = await import('./services/cashPayment.service');

      return await CashPaymentService.openCashRegister(id, openingAmount, staffId);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to open cash register', 500, error.message);
    }
  }

  /**
   * Close cash register
   */
  static async closeCashRegister(id: number, closingAmount: number, staffId: number): Promise<any> {
    try {
      // Import CashPaymentService dynamically to avoid circular dependencies
      const { CashPaymentService } = await import('./services/cashPayment.service');

      return await CashPaymentService.closeCashRegister(id, closingAmount, staffId);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to close cash register', 500, error.message);
    }
  }

  /**
   * Reconcile cash register
   */
  static async reconcileCashRegister(
    id: number,
    reconciliationData: any,
    staffId: number
  ): Promise<any> {
    try {
      // Import CashPaymentService dynamically to avoid circular dependencies
      const { CashPaymentService } = await import('./services/cashPayment.service');

      // The reconcileCashRegister method expects CashReconciliationData with register_id
      const reconciliationDataWithId = {
        ...reconciliationData,
        register_id: id,
      };

      return await CashPaymentService.reconcileCashRegister(reconciliationDataWithId, staffId);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to reconcile cash register', 500, error.message);
    }
  }

  /**
   * Get cash register summary
   */
  static async getCashRegisterSummary(id: number): Promise<any> {
    try {
      // Import CashPaymentService dynamically to avoid circular dependencies
      const { CashPaymentService } = await import('./services/cashPayment.service');

      return await CashPaymentService.getCashRegisterSummary(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to get cash register summary', 500, error.message);
    }
  }
}

export default AccountingService;
