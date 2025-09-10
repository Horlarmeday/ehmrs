import { Transaction } from 'sequelize';
import { BadException } from '../../../common/util/api-error';
import {
  Insurance,
  ClinicalPayment,
  Staff,
  ChartOfAccount,
  JournalEntry,
  JournalEntryLine,
  FinancialPeriod,
  PatientInsurance,
  InsuranceClaim,
} from '../../../database/models';
import { PaymentType, PaymentStatus, JournalEntryStatus, FinancialPeriodStatus } from '../enums';
import { logger } from '../../../core/helpers/logger';

// ===== INSURANCE PAYMENT INTERFACES =====

export interface InsurancePaymentData {
  bill_id: number;
  patient_id: number;
  amount: number;
  insurance_provider: string;
  policy_number: string;
  copay_amount: number;
  claim_reference?: string;
  claim_date?: Date;
  expected_settlement_date?: Date;
  notes?: string;
  payment_reference?: string; // Payment reference for tracking
  period_id?: number; // Financial period ID for accounting
  visit_id?: number;
}

export interface InsuranceClaimData {
  payment_id: number;
  claim_reference: string;
  claim_date: Date;
  claim_amount: number;
  copay_amount: number;
  insurance_coverage: number;
  claim_status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'PARTIALLY_APPROVED';
  rejection_reason?: string;
  approval_date?: Date;
  approved_by?: number;
  settlement_date?: Date;
  notes?: string;
  submitted_by: number;
}

export interface InsuranceClaimApprovalData {
  claim_reference: string;
  approval_status: 'APPROVED' | 'REJECTED' | 'PARTIALLY_APPROVED';
  approved_amount?: number;
  rejection_reason?: string;
  approval_notes?: string;
  approved_by: number;
  approval_date: Date;
}

export interface InsuranceSettlementData {
  claim_reference: string;
  settlement_reference: string;
  settled_amount: number;
  settlement_date: Date;
  settlement_method: 'BANK_TRANSFER' | 'CHECK' | 'CASH' | 'ELECTRONIC';
  bank_reference?: string;
  check_number?: string;
  notes?: string;
  settled_by: number;
}

export interface InsuranceProviderData {
  name: string;
  code: string;
  description?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  website?: string;
  is_active: boolean;
  created_by: number;
}

export interface InsuranceSummary {
  id: number;
  payment_reference: string;
  amount: number;
  insurance_provider: string;
  policy_number: string;
  copay_amount: number;
  claim_reference: string;
  claim_status: string;
  claim_date: Date;
  expected_settlement_date: Date;
  days_to_settlement: number;
  is_overdue: boolean;
  insurance_coverage: number;
  patient_responsibility: number;
}

// ===== INSURANCE PAYMENT SERVICE =====

/**
 * Insurance Payment Service
 *
 * This service handles all insurance payment operations including:
 * - Insurance payment processing
 * - Claims management and workflow
 * - Co-payment collection and tracking
 * - Claims approval/rejection workflow
 * - Insurance settlement management
 * - Journal entry creation for double-entry accounting
 */
export class InsurancePaymentService {
  // ===== INSURANCE PAYMENT PROCESSING =====

  /**
   * Process insurance payment
   */
  static async processInsurancePayment(
    paymentData: InsurancePaymentData,
    staffId: number,
    transaction?: Transaction
  ): Promise<{
    payment: ClinicalPayment;
    claim: InsuranceClaim;
  }> {
    // Validate staff permissions
    const staff = await Staff.findByPk(staffId, { transaction });
    if (!staff) {
      throw new BadException('Staff Not Found', 404, 'The staff member could not be found');
    }

    // Validate payment amounts
    if (paymentData.amount <= 0) {
      throw new BadException(
        'Invalid Payment Amount',
        400,
        'Payment amount must be greater than zero'
      );
    }

    if (paymentData.copay_amount < 0) {
      throw new BadException(
        'Invalid Co-payment Amount',
        400,
        'Co-payment amount cannot be negative'
      );
    }

    if (paymentData.copay_amount > paymentData.amount) {
      throw new BadException(
        'Invalid Co-payment Amount',
        400,
        'Co-payment amount cannot exceed total payment amount'
      );
    }

    // Validate insurance provider
    if (!paymentData.insurance_provider) {
      throw new BadException(
        'Insurance Provider Required',
        400,
        'Insurance provider is required for insurance payments'
      );
    }

    // Validate policy number
    if (!paymentData.policy_number) {
      throw new BadException(
        'Policy Number Required',
        400,
        'Policy number is required for insurance payments'
      );
    }

    // Calculate insurance coverage and patient responsibility
    const insuranceCoverage = paymentData.amount - paymentData.copay_amount;
    const patientResponsibility = paymentData.copay_amount;

    // Generate claim reference if not provided
    const claimReference =
      paymentData.claim_reference ||
      `CLM-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)
        .toUpperCase()}`;

    const patientInsurance = await PatientInsurance.findOne<PatientInsurance>({
      where: {
        patient_id: paymentData.patient_id,
        is_default: true,
      },
    });
    if (!patientInsurance) {
      throw new BadException(
        'Patient Insurance Not Found',
        404,
        'The patient insurance could not be found'
      );
    }

    // Create clinical payment record
    const payment = await ClinicalPayment.create(
      {
        payment_reference: paymentData.payment_reference, // Use the generated payment reference
        bill_id: paymentData.bill_id,
        patient_id: paymentData.patient_id,
        amount: paymentData.amount,
        payment_method: 'INSURANCE',
        payment_type: PaymentType.FULL,
        notes: paymentData.notes,
        insurance_provider: paymentData.insurance_provider,
        insurance_claim_number: claimReference,
        status: PaymentStatus.PENDING, // Start as pending until claim is processed
        processed_by: staffId,
        processed_at: new Date(),
        period_id: paymentData.period_id, // Use the financial period ID
        patient_insurance_id: patientInsurance.id,
        visit_id: paymentData.visit_id,
      },
      { transaction }
    );

    // Create insurance claim record
    const claim = await InsuranceClaim.create(
      {
        payment_id: payment.id,
        claim_reference: claimReference,
        claim_date: paymentData.claim_date || new Date(),
        claim_amount: paymentData.amount,
        copay_amount: paymentData.copay_amount,
        insurance_coverage: insuranceCoverage,
        claim_status: 'PENDING',
        notes: paymentData.notes,
        submitted_by: staffId,
        submitted_at: new Date(),
      },
      { transaction }
    );

    // Create journal entries for double-entry accounting
    await this.createInsurancePaymentJournalEntries(
      payment,
      paymentData.amount,
      insuranceCoverage,
      patientResponsibility,
      staffId,
      transaction
    );

    logger.info(`Insurance payment processed: ${payment.payment_reference}`, {
      paymentId: payment.id,
      claimId: claim.id,
      claimReference: claimReference,
      amount: paymentData.amount,
      insuranceCoverage: insuranceCoverage,
      copayAmount: paymentData.copay_amount,
      staffId,
    });

    return {
      payment,
      claim,
    };
  }

  // ===== INSURANCE CLAIMS MANAGEMENT =====

  /**
   * Submit insurance claim
   */
  static async submitInsuranceClaim(
    claimId: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<{
    claim: InsuranceClaim;
    payment: ClinicalPayment;
  }> {
    // Get the payment and claim
    const payment = await ClinicalPayment.findByPk(claimId, { transaction });
    if (!payment) {
      throw new BadException('Payment Not Found', 404, 'The specified payment could not be found');
    }

    const claim = await InsuranceClaim.findOne({
      where: { payment_id: claimId },
      transaction,
    });

    if (!claim) {
      throw new BadException(
        'Insurance Claim Not Found',
        404,
        'The specified insurance claim could not be found'
      );
    }

    // Validate payment method
    if (payment.payment_method !== 'INSURANCE') {
      throw new BadException('Invalid Payment Method', 400, 'Payment is not an insurance payment');
    }

    // Validate payment status
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadException(
        'Invalid Payment Status',
        400,
        `Payment status is ${payment.status}, cannot submit claim`
      );
    }

    // Validate staff permissions
    const staff = await Staff.findByPk(staffId, { transaction });
    if (!staff) {
      throw new BadException('Staff Not Found', 404, 'The staff member could not be found');
    }

    // Update claim status to submitted
    await claim.update(
      {
        claim_status: 'SUBMITTED',
        submitted_at: new Date(),
      },
      { transaction }
    );

    // Update payment notes
    await payment.update(
      {
        notes: payment.notes
          ? `${payment.notes}\n\nClaim submitted: ${new Date().toISOString()}`
          : `Claim submitted: ${new Date().toISOString()}`,
      },
      { transaction }
    );

    logger.info(`Insurance claim submitted: ${claim.claim_reference}`, {
      paymentId: payment.id,
      claimId: claim.id,
      claimReference: claim.claim_reference,
      staffId,
    });

    return {
      claim,
      payment,
    };
  }

  /**
   * Approve/reject insurance claim
   */
  static async processInsuranceClaimApproval(
    approvalData: InsuranceClaimApprovalData,
    staffId: number,
    transaction?: Transaction
  ): Promise<{
    claim: InsuranceClaim;
    payment: ClinicalPayment;
  }> {
    // Get the claim
    const claim = await InsuranceClaim.findOne({
      where: { claim_reference: approvalData.claim_reference },
      transaction,
    });

    if (!claim) {
      throw new BadException(
        'Insurance Claim Not Found',
        404,
        'The specified insurance claim could not be found'
      );
    }

    // Get the payment
    const payment = await ClinicalPayment.findByPk(claim.payment_id, { transaction });
    if (!payment) {
      throw new BadException('Payment Not Found', 404, 'The specified payment could not be found');
    }

    // Validate payment method
    if (payment.payment_method !== 'INSURANCE') {
      throw new BadException('Invalid Payment Method', 400, 'Payment is not an insurance payment');
    }

    // Validate staff permissions
    const staff = await Staff.findByPk(staffId, { transaction });
    if (!staff) {
      throw new BadException('Staff Not Found', 404, 'The staff member could not be found');
    }

    // Update claim status based on approval
    let newPaymentStatus: PaymentStatus;
    let approvalNotes: string;

    switch (approvalData.approval_status) {
      case 'APPROVED':
        newPaymentStatus = PaymentStatus.PAID;
        approvalNotes = `Claim approved for amount: ${approvalData.approved_amount ||
          claim.claim_amount}`;
        break;
      case 'REJECTED':
        newPaymentStatus = PaymentStatus.FAILED;
        approvalNotes = `Claim rejected: ${approvalData.rejection_reason || 'No reason provided'}`;
        break;
      case 'PARTIALLY_APPROVED':
        newPaymentStatus = PaymentStatus.PARTIAL;
        approvalNotes = `Claim partially approved for amount: ${approvalData.approved_amount}`;
        break;
      default:
        throw new BadException('Invalid Approval Status', 400, 'Invalid approval status provided');
    }

    // Update claim status
    await claim.update(
      {
        claim_status: approvalData.approval_status,
        approval_date: approvalData.approval_date,
        approved_by: staffId,
        rejection_reason: approvalData.rejection_reason,
        notes: claim.notes
          ? `${claim.notes}\n\n${approvalData.approval_notes || ''}`
          : approvalData.approval_notes,
      },
      { transaction }
    );

    // Update payment status
    await payment.update(
      {
        status: newPaymentStatus,
        notes: payment.notes ? `${payment.notes}\n\n${approvalNotes}` : approvalNotes,
      },
      { transaction }
    );

    // Update journal entries based on approval status
    if (approvalData.approval_status === 'APPROVED') {
      await this.updateInsuranceApprovalJournalEntries(
        payment,
        approvalData.approved_amount || claim.claim_amount,
        staffId,
        transaction
      );
    }

    logger.info(
      `Insurance claim ${approvalData.approval_status.toLowerCase()}: ${claim.claim_reference}`,
      {
        paymentId: payment.id,
        claimId: claim.id,
        approvalStatus: approvalData.approval_status,
        staffId,
      }
    );

    return {
      claim,
      payment,
    };
  }

  // ===== INSURANCE SETTLEMENT =====

  /**
   * Settle insurance claim
   */
  static async settleInsuranceClaim(
    settlementData: InsuranceSettlementData,
    staffId: number,
    transaction?: Transaction
  ): Promise<{
    claim: InsuranceClaim;
    payment: ClinicalPayment;
    settlement: any;
  }> {
    // Get the claim
    const claim = await InsuranceClaim.findOne({
      where: { claim_reference: settlementData.claim_reference },
      transaction,
    });

    if (!claim) {
      throw new BadException(
        'Insurance Claim Not Found',
        404,
        'The specified insurance claim could not be found'
      );
    }

    // Get the payment
    const payment = await ClinicalPayment.findByPk(claim.payment_id, { transaction });
    if (!payment) {
      throw new BadException('Payment Not Found', 404, 'The specified payment could not be found');
    }

    // Validate payment method
    if (payment.payment_method !== 'INSURANCE') {
      throw new BadException('Invalid Payment Method', 400, 'Payment is not an insurance payment');
    }

    // Validate payment status
    if (![PaymentStatus.PAID, PaymentStatus.PARTIAL].includes(payment.status)) {
      throw new BadException(
        'Invalid Payment Status',
        400,
        `Payment status is ${payment.status}, cannot settle`
      );
    }

    // Validate settlement amount
    const expectedAmount =
      payment.status === PaymentStatus.PARTIAL ? claim.claim_amount : claim.claim_amount;

    if (Math.abs(settlementData.settled_amount - expectedAmount) > 0.01) {
      throw new BadException(
        'Amount Mismatch',
        400,
        `Settled amount (${settlementData.settled_amount}) does not match expected amount (${expectedAmount})`
      );
    }

    // Validate staff permissions
    const staff = await Staff.findByPk(staffId, { transaction });
    if (!staff) {
      throw new BadException('Staff Not Found', 404, 'The staff member could not be found');
    }

    // Update claim status
    await claim.update(
      {
        claim_status: 'PAID',
        settlement_date: settlementData.settlement_date,
        settlement_reference: settlementData.settlement_reference,
        bank_reference: settlementData.bank_reference,
        check_number: settlementData.check_number,
        notes: claim.notes
          ? `${claim.notes}\n\nSettled: ${settlementData.notes || ''}`
          : `Settled: ${settlementData.notes || ''}`,
      },
      { transaction }
    );

    // Update payment status to settled
    await payment.update(
      {
        status: PaymentStatus.PAID,
        notes: payment.notes
          ? `${payment.notes}\n\nSettled: ${settlementData.notes || ''}`
          : `Settled: ${settlementData.notes || ''}`,
      },
      { transaction }
    );

    // Create settlement record
    const settlement = {
      id: Date.now(), // Temporary ID
      ...settlementData,
      payment_id: payment.id,
      claim_id: claim.id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Update journal entries to reflect settlement
    await this.updateInsuranceSettlementJournalEntries(
      payment,
      settlementData.settled_amount,
      staffId,
      transaction
    );

    logger.info(`Insurance claim settled: ${claim.claim_reference}`, {
      paymentId: payment.id,
      claimId: claim.id,
      settledAmount: settlementData.settled_amount,
      staffId,
    });

    return {
      claim,
      payment,
      settlement,
    };
  }

  // ===== JOURNAL ENTRIES =====

  /**
   * Create journal entries for insurance payment
   */
  private static async createInsurancePaymentJournalEntries(
    payment: ClinicalPayment,
    totalAmount: number,
    insuranceCoverage: number,
    patientResponsibility: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      // Get chart of accounts
      const insuranceReceivablesAccount = await ChartOfAccount.findOne({
        where: { code: '1101' }, // Insurance Receivables account
        transaction,
      });

      const serviceRevenueAccount = await ChartOfAccount.findOne({
        where: { code: '4001' }, // Service Revenue account
        transaction,
      });

      const patientReceivablesAccount = await ChartOfAccount.findOne({
        where: { code: '1300' }, // Patient Receivables account
        transaction,
      });

      if (!insuranceReceivablesAccount || !serviceRevenueAccount || !patientReceivablesAccount) {
        throw new BadException(
          'Required Chart of Accounts Missing',
          500,
          'Insurance Receivables, Service Revenue, or Patient Receivables accounts not found'
        );
      }

      // Create journal entry
      const journalEntry = await JournalEntry.create(
        {
          entry_date: new Date(),
          reference: payment.payment_reference,
          description: `Insurance payment received: ${payment.notes || 'Patient insurance claim'}`,
          entry_type: 'INSURANCE_PAYMENT',
          status: JournalEntryStatus.POSTED,
          created_by: staffId,
          period_id: payment.period_id,
          visit_id: payment.visit_id,
          patient_id: payment.patient_id,
          transaction_date: new Date(),
        },
        { transaction }
      );

      // Create journal entry lines
      const journalEntryLines = [
        {
          journal_entry_id: journalEntry.id,
          account_id: insuranceReceivablesAccount.id,
          debit: insuranceCoverage,
          credit: 0,
          description: `Insurance receivable for claim ${payment.insurance_claim_number}`,
          cost_center_id: null,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: patientReceivablesAccount.id,
          debit: patientResponsibility,
          credit: 0,
          description: `Patient responsibility for claim ${payment.insurance_claim_number}`,
          cost_center_id: null,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: serviceRevenueAccount.id,
          debit: 0,
          credit: totalAmount,
          description: `Revenue from insurance claim ${payment.insurance_claim_number}`,
          cost_center_id: null,
        },
      ];

      await JournalEntryLine.bulkCreate(journalEntryLines, { transaction });

      logger.info(`Journal entries created for insurance payment: ${payment.payment_reference}`, {
        paymentId: payment.id,
        journalEntryId: journalEntry.id,
        totalAmount,
        insuranceCoverage,
        patientResponsibility,
      });
    } catch (error) {
      logger.error('Failed to create journal entries for insurance payment:', error);
      throw new BadException(
        'Journal Entry Creation Failed',
        500,
        'Failed to create accounting entries for insurance payment'
      );
    }
  }

  /**
   * Update journal entries for insurance claim approval
   */
  private static async updateInsuranceApprovalJournalEntries(
    payment: ClinicalPayment,
    approvedAmount: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      // Get the journal entry for this payment
      const journalEntry = await JournalEntry.findOne({
        where: { reference: payment.payment_reference },
        transaction,
      });

      if (journalEntry) {
        // Update journal entry description to reflect approval
        await journalEntry.update(
          {
            description: `Insurance claim approved: ${payment.notes || 'Patient insurance claim'}`,
          },
          { transaction }
        );

        logger.info(
          `Journal entry updated for insurance claim approval: ${payment.payment_reference}`,
          {
            paymentId: payment.id,
            journalEntryId: journalEntry.id,
          }
        );
      }
    } catch (error) {
      logger.error('Failed to update journal entries for insurance claim approval:', error);
      throw new BadException(
        'Journal Entry Update Failed',
        500,
        'Failed to update accounting entries for insurance claim approval'
      );
    }
  }

  /**
   * Update journal entries for insurance claim settlement
   */
  private static async updateInsuranceSettlementJournalEntries(
    payment: ClinicalPayment,
    settledAmount: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      // Get chart of accounts
      const bankAccountGL = await ChartOfAccount.findOne({
        where: { account_code: '1002' }, // Bank Account account
        transaction,
      });

      const insuranceReceivablesAccount = await ChartOfAccount.findOne({
        where: { account_code: '1200' }, // Insurance Receivables account
        transaction,
      });

      if (!bankAccountGL || !insuranceReceivablesAccount) {
        throw new BadException(
          'Required Chart of Accounts Missing',
          500,
          'Bank Account or Insurance Receivables accounts not found'
        );
      }

      // Create settlement journal entry
      const journalEntry = await JournalEntry.create(
        {
          entry_date: new Date(),
          reference: `SETTLE-${payment.payment_reference}`,
          description: `Insurance claim settlement for claim ${payment.insurance_claim_number}`,
          entry_type: 'INSURANCE_SETTLEMENT',
          status: JournalEntryStatus.POSTED,
          created_by: staffId,
          period_id: null, // Will be set by financial period middleware
        },
        { transaction }
      );

      // Create settlement journal entry lines
      const journalEntryLines = [
        {
          journal_entry_id: journalEntry.id,
          account_id: bankAccountGL.id,
          debit: settledAmount,
          credit: 0,
          description: `Insurance settlement for claim ${payment.insurance_claim_number}`,
          cost_center_id: null,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: insuranceReceivablesAccount.id,
          debit: 0,
          credit: settledAmount,
          description: `Settlement of insurance receivable for claim ${payment.insurance_claim_number}`,
          cost_center_id: null,
        },
      ];

      await JournalEntryLine.bulkCreate(journalEntryLines, { transaction });

      logger.info(
        `Journal entries created for insurance claim settlement: ${payment.payment_reference}`,
        {
          paymentId: payment.id,
          journalEntryId: journalEntry.id,
          amount: settledAmount,
        }
      );
    } catch (error) {
      logger.error('Failed to create journal entries for insurance claim settlement:', error);
      throw new BadException(
        'Journal Entry Creation Failed',
        500,
        'Failed to create accounting entries for insurance claim settlement'
      );
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Calculate expected settlement date (30 days from claim date)
   */
  private static calculateExpectedSettlementDate(claimDate: Date): Date {
    const settlementDate = new Date(claimDate);
    settlementDate.setDate(settlementDate.getDate() + 30);
    return settlementDate;
  }

  /**
   * Get insurance payment summary
   */
  static async getInsurancePaymentSummary(paymentId: number): Promise<InsuranceSummary> {
    const payment = await ClinicalPayment.findByPk(paymentId, {
      include: [{ model: InsuranceClaim, as: 'insuranceClaim' }],
    });

    if (!payment) {
      throw new BadException(
        'Insurance Payment Not Found',
        404,
        'The specified insurance payment could not be found'
      );
    }

    if (payment.payment_method !== 'INSURANCE') {
      throw new BadException('Invalid Payment Method', 400, 'Payment is not an insurance payment');
    }

    const claim = (payment as any).insuranceClaim;
    if (!claim) {
      throw new BadException(
        'Insurance Claim Not Found',
        404,
        'Insurance claim details could not be found'
      );
    }

    // Calculate days to settlement (default to 30 days)
    const today = new Date();
    const expectedSettlement = new Date(claim.claim_date);
    expectedSettlement.setDate(expectedSettlement.getDate() + 30);
    const daysToSettlement = Math.ceil(
      (expectedSettlement.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isOverdue = daysToSettlement < 0;

    // Calculate insurance coverage and patient responsibility
    const insuranceCoverage = claim.insurance_coverage;
    const patientResponsibility = claim.copay_amount;

    return {
      id: payment.id,
      payment_reference: payment.payment_reference,
      amount: payment.amount,
      insurance_provider: payment.insurance_provider || 'N/A',
      policy_number: 'N/A', // Not stored in current model
      copay_amount: claim.copay_amount,
      claim_reference: claim.claim_reference,
      claim_status: claim.claim_status,
      claim_date: claim.claim_date,
      expected_settlement_date: expectedSettlement,
      days_to_settlement: daysToSettlement,
      is_overdue: isOverdue,
      insurance_coverage: insuranceCoverage,
      patient_responsibility: patientResponsibility,
    };
  }

  /**
   * Get insurance payment transaction history
   */
  static async getInsurancePaymentTransactionHistory(
    filters: any = {}
  ): Promise<{
    payments: ClinicalPayment[];
    claims: InsuranceClaim[];
    total: number;
    summary: any;
  }> {
    const {
      insurance_provider,
      claim_status,
      status,
      start_date,
      end_date,
      page = 1,
      limit = 50,
    } = filters;

    const where: any = {
      payment_method: 'INSURANCE',
    };

    if (insurance_provider) where.insurance_provider = insurance_provider;
    if (status) where.status = status;
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt[require('sequelize').Op.gte] = new Date(start_date);
      if (end_date) where.createdAt[require('sequelize').Op.lte] = new Date(end_date);
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ClinicalPayment.findAndCountAll({
      where,
      include: [
        { model: require('../../../database/models').Patient, as: 'patient' },
        { model: require('../../../database/models').Staff, as: 'processedByStaff' },
        {
          model: InsuranceClaim,
          as: 'insuranceClaim',
          where: claim_status ? { claim_status } : {},
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Filter by claim status if specified
    let filteredRows = rows;
    if (claim_status) {
      filteredRows = rows.filter(
        row => row.insuranceClaim && row.insuranceClaim.claim_status === claim_status
      );
    }

    // Calculate summary
    const summary = {
      total_payments: count,
      total_amount: filteredRows.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
      total_copay: filteredRows.reduce((sum, t) => sum + (t.insuranceClaim?.copay_amount || 0), 0),
      total_insurance_coverage: filteredRows.reduce(
        (sum, t) => sum + (t.insuranceClaim?.insurance_coverage || 0),
        0
      ),
      pending_payments: filteredRows.filter(t => t.insuranceClaim?.claim_status === 'PENDING')
        .length,
      submitted_payments: filteredRows.filter(t => t.insuranceClaim?.claim_status === 'SUBMITTED')
        .length,
      approved_payments: filteredRows.filter(t => t.insuranceClaim?.claim_status === 'APPROVED')
        .length,
      rejected_payments: filteredRows.filter(t => t.insuranceClaim?.claim_status === 'REJECTED')
        .length,
      paid_payments: filteredRows.filter(t => t.insuranceClaim?.claim_status === 'PAID').length,
      partially_approved_payments: filteredRows.filter(
        t => t.insuranceClaim?.claim_status === 'APPROVED'
      ).length,
    };

    return {
      payments: filteredRows,
      claims: filteredRows.map(row => row.insuranceClaim).filter(Boolean),
      total: count,
      summary,
    };
  }
}

export default InsurancePaymentService;
