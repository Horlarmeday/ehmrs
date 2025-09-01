import { Transaction, Op } from 'sequelize';
import { BadException } from '../../../common/util/api-error';
import {
  PatientDeposit,
  DepositTransaction,
  DepositJournalEntry,
  DepositAuditLog,
  Staff,
  Patient,
  BankAccount,
} from '../../../database/models';
import { PatientDepositJournalEntryService } from './patientDepositJournalEntry.service';
import { ComprehensiveChartOfAccountsService } from './comprehensiveChartOfAccounts.service';
import {
  DepositTransactionType,
  DepositStatus,
  DepositType,
  DepositJournalEntryType,
} from '../enums';
import { AccountingService } from '../accounting.service';
import { DepositAuditService } from './depositAudit.service';
import { JournalEntry } from '../../../database/models/journalEntry';
import { POSTerminal } from '../../../database/models/posTerminal';
import { FinancialPeriodValidationService } from './financialPeriodValidation.service';
import sequelizeConnection from '../../../database/config/config';
import { logger } from '../../../core/helpers/logger';

export interface CreateDepositData {
  patient_id: number;
  amount: number;
  deposit_type: DepositType;
  description?: string;
  bank_account_id?: number;
  pos_terminal_id?: number;
  payment_method?: string;
  payment_reference?: string;
  created_by: number;
}

export interface UseDepositData {
  deposit_id: number;
  amount: number;
  bill_id: number;
  description?: string;
  used_by: number;
}

export interface RefundDepositData {
  deposit_id: number;
  amount: number;
  refund_reason: string;
  refunded_by: number;
}

export class PatientDepositService {
  /**
   * Create a new patient deposit with full accounting workflow
   */
  static async createDeposit(data: CreateDepositData): Promise<PatientDeposit> {
    let deposit: PatientDeposit | null = null;
    let transaction: Transaction | undefined;

    try {
      // Always create a transaction for this operation
      transaction = await sequelizeConnection.transaction();

      // Validate financial period for transaction
      const currentPeriod = await FinancialPeriodValidationService.getCurrentActivePeriod();
      if (!currentPeriod) {
        throw new BadException(
          'Financial Period Not Available',
          503,
          'No active financial period found. Please configure financial periods before processing transactions.'
        );
      }

      // Generate reference number
      const referenceNumber = await this.generateDepositReference();

      // Create deposit record
      deposit = await PatientDeposit.create(
        {
          ...data,
          reference_number: referenceNumber,
          status: DepositStatus.ACTIVE,
          initial_amount: data.amount,
          current_balance: data.amount,
          refundable_amount: data.amount,
          deposit_date: new Date(),
          last_activity_date: new Date(),
          period_id: currentPeriod.id, // Link to current financial period
        },
        { transaction }
      );

      // Create journal entry for deposit creation
      const journalEntry = await PatientDepositJournalEntryService.createDepositCreationEntry(
        deposit,
        transaction
      );

      // Create deposit transaction record
      await DepositTransaction.create(
        {
          deposit_id: deposit.id,
          transaction_type: DepositTransactionType.CREATED,
          amount: data.amount,
          previous_balance: 0,
          new_balance: data.amount,
          reference_number: referenceNumber,
          description: 'Deposit created',
          journal_entry_id: journalEntry.id,
          created_by: data.created_by,
          period_id: currentPeriod.id, // Link to current financial period
        },
        { transaction }
      );

      // Create deposit journal entry mapping
      await DepositJournalEntry.create(
        {
          deposit_id: deposit.id,
          journal_entry_id: journalEntry.id,
          entry_type: DepositJournalEntryType.DEPOSIT,
          amount: data.amount,
          period_id: currentPeriod.id, // Link to current financial period
        },
        { transaction }
      );

      // Update bank account balance if specified
      if (data.bank_account_id) {
        await PatientDepositService.updateBankAccountBalance(
          data.bank_account_id,
          data.amount,
          'add',
          transaction
        );
      }

      // Handle POS terminal logic for card deposits
      if (data.deposit_type === 'CARD' && data.pos_terminal_id) {
        // Note: POS terminal amounts are typically settled to bank accounts at end of day
        // The POS Terminal Receivables account tracks this until settlement
        // This creates a proper audit trail for reconciliation
      }

      // Log the deposit creation
      await DepositAuditService.logDepositCreation(
        deposit,
        data.created_by,
        {
          bank_account_id: data.bank_account_id,
          pos_terminal_id: data.pos_terminal_id,
          payment_method: data.payment_method,
          payment_reference: data.payment_reference,
        },
        transaction
      );

      // Commit the transaction
      await transaction.commit();

      return deposit;
    } catch (error) {
      // Rollback the transaction on error
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          logger.error(
            'Failed to rollback transaction during deposit creation error:',
            rollbackError
          );
        }
      }

      // Log the error
      if (deposit?.id) {
        try {
          await DepositAuditService.logError(deposit.id, error, 'createDeposit', data.created_by, {
            bank_account_id: data.bank_account_id,
            pos_terminal_id: data.pos_terminal_id,
            payment_method: data.payment_method,
            payment_reference: data.payment_reference,
          });
        } catch (logError) {
          logger.error('Failed to log deposit creation error:', logError);
        }
      }

      throw new BadException('Failed to create patient deposit', 500, error.message);
    }
  }

  /**
   * Use patient deposit for bill payment with enhanced validation and business logic
   */
  static async useDeposit(
    data: UseDepositData,
    transaction?: Transaction
  ): Promise<PatientDeposit> {
    let deposit: PatientDeposit | null = null;

    try {
      // Validate financial period for transaction
      const currentPeriod = await FinancialPeriodValidationService.getCurrentActivePeriod();
      if (!currentPeriod) {
        throw new BadException(
          'Financial Period Not Available',
          503,
          'No active financial period found. Please configure financial periods before processing transactions.'
        );
      }

      // Get deposit with patient information
      deposit = await PatientDeposit.findByPk(data.deposit_id, {
        include: ['patient'],
      });
      if (!deposit) {
        throw new BadException(
          'Deposit Not Found',
          404,
          'The requested patient deposit could not be found'
        );
      }

      // Enhanced validation: Check deposit status and balance
      if (deposit.status !== DepositStatus.ACTIVE) {
        throw new BadException(
          'Deposit Status Invalid',
          400,
          `Deposit is not active. Current status: ${deposit.status}`
        );
      }

      if (deposit.current_balance < data.amount) {
        throw new BadException(
          `Insufficient deposit balance. Available: ${deposit.current_balance}, Requested: ${data.amount}`,
          400
        );
      }

      // Enhanced validation: Check if amount is reasonable
      if (data.amount <= 0) {
        throw new BadException(
          'Invalid Usage Amount',
          400,
          'Usage amount must be greater than zero'
        );
      }

      // Enhanced validation: Check if amount exceeds refundable amount
      if (data.amount > deposit.refundable_amount) {
        throw new BadException(
          `Usage amount exceeds refundable amount. Refundable: ${deposit.refundable_amount}, Requested: ${data.amount}`,
          400
        );
      }

      // Calculate new balance and refundable amount
      const newBalance = deposit.current_balance - data.amount;
      const previousBalance = deposit.current_balance;
      const newRefundableAmount = Math.min(deposit.refundable_amount, newBalance);

      // Determine new status based on balance
      let newStatus = DepositStatus.ACTIVE;
      if (newBalance === 0) {
        newStatus = DepositStatus.USED;
      } else if (newBalance < deposit.initial_amount * 0.1) {
        // Less than 10% of initial amount
        newStatus = DepositStatus.ACTIVE; // Keep active for small remaining amounts
      }

      // Update deposit with enhanced tracking
      await deposit.update(
        {
          current_balance: newBalance,
          refundable_amount: newRefundableAmount,
          last_activity_date: new Date(),
          status: newStatus,
        },
        { transaction }
      );

      // Create journal entry for deposit usage
      const journalEntry = await PatientDepositJournalEntryService.createDepositUsageEntry(
        deposit,
        data.amount,
        data.bill_id,
        transaction
      );

      // Create comprehensive deposit transaction record
      await DepositTransaction.create(
        {
          deposit_id: deposit.id,
          transaction_type: DepositTransactionType.USED,
          amount: data.amount,
          previous_balance: previousBalance,
          new_balance: newBalance,
          reference_number: `USE-${deposit.reference_number}-${Date.now()}`,
          description: data.description || `Deposit used for bill ${data.bill_id}`,
          bill_id: data.bill_id,
          journal_entry_id: journalEntry.id,
          created_by: data.used_by,
          period_id: currentPeriod.id, // Link to current financial period
        },
        { transaction }
      );

      // Create deposit journal entry mapping
      await DepositJournalEntry.create(
        {
          deposit_id: deposit.id,
          journal_entry_id: journalEntry.id,
          entry_type: DepositJournalEntryType.USAGE,
          amount: data.amount,
          period_id: currentPeriod.id, // Link to current financial period
        },
        { transaction }
      );

      // Update bank account balance if specified
      if (deposit.bank_account_id) {
        await PatientDepositService.updateBankAccountBalance(
          deposit.bank_account_id,
          data.amount,
          'subtract',
          transaction
        );
      }

      // Log the deposit usage
      await DepositAuditService.logUsageProcessed(
        deposit.id,
        data.amount,
        data.bill_id,
        data.used_by,
        { previous_balance: previousBalance, new_balance: newBalance },
        transaction
      );

      // Return enhanced deposit information
      return await PatientDeposit.findByPk(deposit.id, {
        include: ['patient', 'bankAccount', 'createdByStaff'],
      });
    } catch (error) {
      // Log the error
      if (deposit?.id) {
        await DepositAuditService.logError(
          deposit.id,
          error,
          'useDeposit',
          data.used_by,
          {
            bill_id: data.bill_id,
            amount: data.amount,
          },
          transaction
        );
      }
      throw new BadException('Failed to use patient deposit', 500, error.message);
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
      const {
        includeTransactions = true,
        includeJournalEntries = true,
        startDate,
        endDate,
      } = options;

      // Get deposit with basic information
      const deposit = await PatientDeposit.findByPk(depositId, {
        include: ['patient', 'bankAccount', 'createdByStaff'],
      });

      if (!deposit) {
        throw new BadException(
          'Deposit Not Found',
          404,
          'The requested patient deposit could not be found'
        );
      }

      const result: any = { deposit };

      // Get usage transactions if requested
      if (includeTransactions) {
        const whereClause: any = { deposit_id: depositId };

        if (startDate || endDate) {
          whereClause.createdAt = {};
          if (startDate) whereClause.createdAt[Op.gte] = startDate;
          if (endDate) whereClause.createdAt[Op.lte] = endDate;
        }

        const transactions = await DepositTransaction.findAll({
          where: whereClause,
          include: ['createdByStaff'],
          order: [['createdAt', 'DESC']],
        });

        result.transactions = transactions;
        result.totalTransactions = transactions.length;
        result.totalAmountUsed = transactions
          .filter(t => t.transaction_type === DepositTransactionType.USED)
          .reduce((sum, t) => sum + (t.amount || 0), 0);
      }

      // Get journal entries if requested
      if (includeJournalEntries) {
        const journalEntries = await PatientDepositJournalEntryService.getJournalEntriesForDeposit(
          depositId
        );
        result.journalEntries = journalEntries;
        result.totalJournalEntries = journalEntries.length;
      }

      // Calculate usage analytics
      result.usageAnalytics = {
        initialAmount: deposit.initial_amount,
        currentBalance: deposit.current_balance,
        totalUsed: deposit.initial_amount - deposit.current_balance,
        usagePercentage:
          ((deposit.initial_amount - deposit.current_balance) / deposit.initial_amount) * 100,
        remainingRefundable: deposit.refundable_amount,
        lastActivity: deposit.last_activity_date,
      };

      return result;
    } catch (error) {
      throw new BadException('Failed to get deposit usage history', 500, error.message);
    }
  }

  /**
   * Get deposit usage summary for a patient
   */
  static async getPatientDepositUsageSummary(patientId: number): Promise<any> {
    try {
      // Get all deposits for the patient
      const deposits = await PatientDeposit.findAll({
        where: { patient_id: patientId },
        include: ['bankAccount'],
      });

      if (deposits.length === 0) {
        return {
          patientId,
          totalDeposits: 0,
          activeDeposits: 0,
          totalAmount: 0,
          totalUsed: 0,
          totalRefunded: 0,
          currentBalance: 0,
        };
      }

      // Calculate summary statistics
      const totalDeposits = deposits.length;
      const activeDeposits = deposits.filter(d => d.status === DepositStatus.ACTIVE).length;
      const totalAmount = deposits.reduce((sum, d) => sum + (d.initial_amount || 0), 0);
      const totalUsed = deposits.reduce(
        (sum, d) => sum + (d.initial_amount - (d.current_balance || 0)),
        0
      );
      const totalRefunded = deposits.reduce(
        (sum, d) => sum + (d.initial_amount - (d.refundable_amount || 0)),
        0
      );
      const currentBalance = deposits.reduce((sum, d) => sum + (d.current_balance || 0), 0);

      return {
        patientId,
        totalDeposits,
        activeDeposits,
        totalAmount,
        totalUsed,
        totalRefunded,
        currentBalance,
        deposits: deposits.map(d => ({
          id: d.id,
          reference_number: d.reference_number,
          status: d.status,
          initial_amount: d.initial_amount,
          current_balance: d.current_balance,
          refundable_amount: d.refundable_amount,
          last_activity_date: d.last_activity_date,
        })),
      };
    } catch (error) {
      throw new BadException('Failed to get patient deposit usage summary', 500, error.message);
    }
  }

  /**
   * Refund patient deposit with enhanced validation and business logic
   */
  static async refundDeposit(
    data: RefundDepositData,
    transaction?: Transaction
  ): Promise<PatientDeposit> {
    let deposit: PatientDeposit | null = null;

    try {
      // Validate financial period for transaction
      const currentPeriod = await FinancialPeriodValidationService.getCurrentActivePeriod();
      if (!currentPeriod) {
        throw new BadException(
          'Financial Period Not Available',
          503,
          'No active financial period found. Please configure financial periods before processing transactions.'
        );
      }

      // Get deposit with patient information
      deposit = await PatientDeposit.findByPk(data.deposit_id, {
        include: ['patient'],
      });
      if (!deposit) {
        throw new BadException(
          'Deposit Not Found',
          404,
          'The requested patient deposit could not be found'
        );
      }

      // Enhanced validation: Check deposit status
      if (deposit.status === DepositStatus.REFUNDED) {
        throw new BadException(
          'Deposit Already Refunded',
          400,
          'Deposit has already been fully refunded'
        );
      }

      if (deposit.status === DepositStatus.USED) {
        throw new BadException(
          'Deposit Fully Used',
          400,
          'Cannot refund from a fully used deposit'
        );
      }

      // Enhanced validation: Check refund amount
      if (data.amount <= 0) {
        throw new BadException(
          'Invalid Refund Amount',
          400,
          'Refund amount must be greater than zero'
        );
      }

      if (data.amount > deposit.refundable_amount) {
        throw new BadException(
          `Refund amount exceeds refundable amount. Available: ${deposit.refundable_amount}, Requested: ${data.amount}`,
          400
        );
      }

      // Enhanced validation: Check if amount exceeds current balance
      if (data.amount > deposit.current_balance) {
        throw new BadException(
          `Refund amount exceeds current balance. Current: ${deposit.current_balance}, Requested: ${data.amount}`,
          400
        );
      }

      // Enhanced validation: Check refund reason
      if (!data.refund_reason || data.refund_reason.trim().length === 0) {
        throw new BadException('Refund Reason Required', 400, 'Refund reason is required');
      }

      // Calculate new balances
      const newBalance = deposit.current_balance - data.amount;
      const previousBalance = deposit.current_balance;
      const newRefundableAmount = deposit.refundable_amount - data.amount;

      // Determine new status based on remaining balance
      let newStatus = DepositStatus.ACTIVE;
      if (newBalance === 0) {
        newStatus = DepositStatus.REFUNDED;
      } else if (newBalance < deposit.initial_amount * 0.1) {
        // Less than 10% of initial amount
        newStatus = DepositStatus.ACTIVE; // Keep active for small remaining amounts
      }

      // Update deposit with enhanced tracking
      await deposit.update(
        {
          current_balance: newBalance,
          refundable_amount: newRefundableAmount,
          last_activity_date: new Date(),
          status: newStatus,
        },
        { transaction }
      );

      // Create journal entry for deposit refund
      const journalEntry = await PatientDepositJournalEntryService.createDepositRefundEntry(
        deposit,
        data.amount,
        data.refund_reason,
        transaction
      );

      // Create comprehensive deposit transaction record
      await DepositTransaction.create(
        {
          deposit_id: deposit.id,
          transaction_type: DepositTransactionType.REFUNDED,
          amount: data.amount,
          previous_balance: previousBalance,
          new_balance: newBalance,
          reference_number: `REF-${deposit.reference_number}-${Date.now()}`,
          description: `Deposit refund: ${data.refund_reason}`,
          journal_entry_id: journalEntry.id,
          created_by: data.refunded_by,
          period_id: currentPeriod.id, // Link to current financial period
        },
        { transaction }
      );

      // Create deposit journal entry mapping
      await DepositJournalEntry.create(
        {
          deposit_id: deposit.id,
          journal_entry_id: journalEntry.id,
          entry_type: DepositJournalEntryType.REFUND,
          amount: data.amount,
          period_id: currentPeriod.id, // Link to current financial period
        },
        { transaction }
      );

      // Update bank account balance if specified
      if (deposit.bank_account_id) {
        await PatientDepositService.updateBankAccountBalance(
          deposit.bank_account_id,
          data.amount,
          'subtract',
          transaction
        );
      }

      // Return enhanced deposit information
      // Log the deposit refund
      await DepositAuditService.logRefundProcessed(
        deposit.id,
        data.amount,
        data.refunded_by,
        data.refund_reason,
        { previous_balance: previousBalance, new_balance: newBalance },
        transaction
      );

      return await PatientDeposit.findByPk(deposit.id, {
        include: ['patient', 'bankAccount', 'createdByStaff'],
      });
    } catch (error) {
      // Log the error
      if (deposit?.id) {
        await DepositAuditService.logError(
          deposit.id,
          error,
          'refundDeposit',
          data.refunded_by,
          {
            amount: data.amount,
            reason: data.refund_reason,
          },
          transaction
        );
      }
      throw new BadException('Failed to refund patient deposit', 500, error.message);
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
      const {
        includeTransactions = true,
        includeJournalEntries = true,
        startDate,
        endDate,
      } = options;

      // Get deposit with basic information
      const deposit = await PatientDeposit.findByPk(depositId, {
        include: ['patient', 'bankAccount', 'createdByStaff'],
      });

      if (!deposit) {
        throw new BadException(
          'Deposit Not Found',
          404,
          'The requested patient deposit could not be found'
        );
      }

      const result: any = { deposit };

      // Get refund transactions if requested
      if (includeTransactions) {
        const whereClause: any = {
          deposit_id: depositId,
          transaction_type: DepositTransactionType.REFUNDED,
        };

        if (startDate || endDate) {
          whereClause.createdAt = {};
          if (startDate) whereClause.createdAt[Op.gte] = startDate;
          if (endDate) whereClause.createdAt[Op.lte] = endDate;
        }

        const refundTransactions = await DepositTransaction.findAll({
          where: whereClause,
          include: ['createdByStaff'],
          order: [['createdAt', 'DESC']],
        });

        result.refundTransactions = refundTransactions;
        result.totalRefunds = refundTransactions.length;
        result.totalAmountRefunded = refundTransactions.reduce(
          (sum, t) => sum + (t.amount || 0),
          0
        );
      }

      // Get journal entries if requested
      if (includeJournalEntries) {
        const journalEntries = await PatientDepositJournalEntryService.getJournalEntriesForDeposit(
          depositId
        );
        const refundEntries = journalEntries.filter(
          entry => entry.reference && entry.reference.includes('DEP-REF-')
        );

        result.refundJournalEntries = refundEntries;
        result.totalRefundJournalEntries = refundEntries.length;
      }

      // Calculate refund analytics
      result.refundAnalytics = {
        initialAmount: deposit.initial_amount,
        currentBalance: deposit.current_balance,
        totalRefunded: deposit.initial_amount - deposit.refundable_amount,
        refundPercentage:
          ((deposit.initial_amount - deposit.refundable_amount) / deposit.initial_amount) * 100,
        remainingRefundable: deposit.refundable_amount,
        lastRefundDate: result.refundTransactions?.[0]?.createdAt || null,
      };

      return result;
    } catch (error) {
      throw new BadException('Failed to get deposit refund history', 500, error.message);
    }
  }

  /**
   * Get refund summary for a patient
   */
  static async getPatientRefundSummary(patientId: number): Promise<any> {
    try {
      // Get all deposits for the patient
      const deposits = await PatientDeposit.findAll({
        where: { patient_id: patientId },
        include: ['bankAccount'],
      });

      if (deposits.length === 0) {
        return {
          patientId,
          totalDeposits: 0,
          totalRefunded: 0,
          totalRefundable: 0,
          refundPercentage: 0,
        };
      }

      // Calculate refund statistics
      const totalDeposits = deposits.length;
      const totalInitialAmount = deposits.reduce((sum, d) => sum + (d.initial_amount || 0), 0);
      const totalRefunded = deposits.reduce(
        (sum, d) => sum + (d.initial_amount - (d.refundable_amount || 0)),
        0
      );
      const totalRefundable = deposits.reduce((sum, d) => sum + (d.refundable_amount || 0), 0);
      const refundPercentage =
        totalInitialAmount > 0 ? (totalRefunded / totalInitialAmount) * 100 : 0;

      return {
        patientId,
        totalDeposits,
        totalInitialAmount,
        totalRefunded,
        totalRefundable,
        refundPercentage,
        deposits: deposits.map(d => ({
          id: d.id,
          reference_number: d.reference_number,
          status: d.status,
          initial_amount: d.initial_amount,
          current_balance: d.current_balance,
          refundable_amount: d.refundable_amount,
          refunded_amount: d.initial_amount - (d.refundable_amount || 0),
          last_activity_date: d.last_activity_date,
        })),
      };
    } catch (error) {
      throw new BadException('Failed to get patient refund summary', 500, error.message);
    }
  }

  /**
   * Get comprehensive deposit status and lifecycle information
   */
  static async getDepositStatus(depositId: number): Promise<any> {
    try {
      // Get deposit with all related information
      const deposit = await PatientDeposit.findByPk(depositId, {
        include: ['patient', 'bankAccount', 'createdByStaff', 'updatedByStaff'],
      });

      if (!deposit) {
        throw new BadException(
          'Deposit Not Found',
          404,
          'The requested patient deposit could not be found'
        );
      }

      // Get transaction count by type
      const transactionSummary = await DepositTransaction.findAll({
        where: { deposit_id: depositId },
        attributes: ['transaction_type', ['COUNT(*)', 'count'], ['SUM(amount)', 'total_amount']],
        group: ['transaction_type'],
        raw: true,
      });

      // Calculate lifecycle metrics
      const lifecycleMetrics = {
        daysSinceCreation: Math.floor(
          (new Date().getTime() - deposit.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
        daysSinceLastActivity: deposit.last_activity_date
          ? Math.floor(
              (new Date().getTime() - deposit.last_activity_date.getTime()) / (1000 * 60 * 60 * 24)
            )
          : 0,
        utilizationRate:
          ((deposit.initial_amount - deposit.current_balance) / deposit.initial_amount) * 100,
        refundabilityRate: (deposit.refundable_amount / deposit.initial_amount) * 100,
        isFullyUtilized: deposit.current_balance === 0,
        isPartiallyUsed:
          deposit.current_balance < deposit.initial_amount && deposit.current_balance > 0,
        hasBeenRefunded: deposit.refundable_amount < deposit.initial_amount,
      };

      // Determine deposit health status
      let healthStatus = 'HEALTHY';
      if (deposit.current_balance === 0) {
        healthStatus = 'FULLY_UTILIZED';
      } else if (lifecycleMetrics.daysSinceLastActivity > 90) {
        healthStatus = 'DORMANT';
      } else if (lifecycleMetrics.daysSinceLastActivity > 30) {
        healthStatus = 'INACTIVE';
      }

      return {
        deposit,
        transactionSummary,
        lifecycleMetrics,
        healthStatus,
        recommendations: PatientDepositService.generateDepositRecommendations(
          deposit,
          lifecycleMetrics
        ),
      };
    } catch (error) {
      throw new BadException('Failed to get deposit status', 500, error.message);
    }
  }

  /**
   * Generate recommendations for deposit management
   */
  private static generateDepositRecommendations(deposit: any, metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.daysSinceLastActivity > 90) {
      recommendations.push('Consider contacting patient about dormant deposit');
    }

    if (metrics.utilizationRate < 10 && metrics.daysSinceCreation > 30) {
      recommendations.push('Deposit has low utilization - consider patient follow-up');
    }

    if (deposit.current_balance > 0 && deposit.current_balance < 50) {
      recommendations.push('Small remaining balance - consider refund processing');
    }

    if (metrics.hasBeenRefunded && deposit.current_balance > 0) {
      recommendations.push('Partial refund completed - monitor remaining balance');
    }

    if (recommendations.length === 0) {
      recommendations.push('Deposit is being managed appropriately');
    }

    return recommendations;
  }

  /**
   * Settle POS terminal deposits to bank account
   * This moves money from POS Terminal Receivables to Bank Account
   */
  static async settlePOSTerminalDeposits(
    pos_terminal_id: number,
    settlement_reference: string,
    settled_by: number,
    transaction?: Transaction
  ): Promise<JournalEntry> {
    try {
      // Get POS terminal with bank account
      const posTerminal = await POSTerminal.findByPk(pos_terminal_id, {
        include: [{ model: BankAccount, as: 'bankAccount' }],
        transaction,
      });

      if (!posTerminal) {
        throw new BadException(
          'POS Terminal Not Found',
          404,
          'The requested POS terminal could not be found'
        );
      }

      // Get all card deposits for this POS terminal
      const cardDeposits = await PatientDeposit.findAll({
        where: {
          pos_terminal_id: pos_terminal_id,
          deposit_type: DepositType.CARD,
          status: DepositStatus.ACTIVE,
        },
        transaction,
      });

      if (cardDeposits.length === 0) {
        throw new BadException(
          'No Card Deposits Found',
          400,
          'No card deposits found for this POS terminal'
        );
      }

      // Calculate total settlement amount (use initial amounts, not current balances)
      const totalAmount = cardDeposits.reduce(
        (sum, deposit) => sum + parseFloat(deposit.amount.toString()),
        0
      );

      // Create settlement journal entry
      const journalEntry = await PatientDepositJournalEntryService.createPOSTerminalSettlementEntry(
        posTerminal,
        totalAmount,
        settlement_reference,
        transaction
      );

      // Update bank account balance
      await this.updateBankAccountBalance(
        posTerminal.bank_account_id,
        totalAmount,
        'add',
        transaction
      );

      // Log the settlement
      await DepositAuditService.logPOSTerminalSettlement(
        pos_terminal_id,
        totalAmount,
        settlement_reference,
        settled_by,
        journalEntry.id,
        transaction
      );

      return journalEntry;
    } catch (error) {
      throw new BadException('Failed to settle POS terminal deposits', 500, error.message);
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
      const whereClause: any = {};

      if (filters.patientId) whereClause.patient_id = filters.patientId;
      if (filters.bankAccountId) whereClause.bank_account_id = filters.bankAccountId;
      if (filters.status) whereClause.status = filters.status;
      if (filters.startDate || filters.endDate) {
        whereClause.createdAt = {};
        if (filters.startDate) whereClause.createdAt.$gte = filters.startDate;
        if (filters.endDate) whereClause.createdAt.$lte = filters.endDate;
      }

      // Get deposit statistics
      const deposits = await PatientDeposit.findAll({
        where: whereClause,
        include: ['patient', 'bankAccount'],
      });

      // Calculate comprehensive analytics
      const analytics = {
        totalDeposits: deposits.length,
        totalInitialAmount: deposits.reduce((sum, d) => sum + (d.initial_amount || 0), 0),
        totalCurrentBalance: deposits.reduce((sum, d) => sum + (d.current_balance || 0), 0),
        totalRefundableAmount: deposits.reduce((sum, d) => sum + (d.refundable_amount || 0), 0),
        totalUsed: deposits.reduce(
          (sum, d) => sum + (d.initial_amount - (d.current_balance || 0)),
          0
        ),
        totalRefunded: deposits.reduce(
          (sum, d) => sum + (d.initial_amount - (d.refundable_amount || 0)),
          0
        ),

        // Status breakdown
        statusBreakdown: {
          active: deposits.filter(d => d.status === DepositStatus.ACTIVE).length,
          used: deposits.filter(d => d.status === DepositStatus.USED).length,
          refunded: deposits.filter(d => d.status === DepositStatus.REFUNDED).length,
        },

        // Type breakdown
        typeBreakdown: deposits.reduce((acc: any, d) => {
          acc[d.deposit_type] = (acc[d.deposit_type] || 0) + 1;
          return acc;
        }, {}),

        // Average metrics
        averageDepositAmount:
          deposits.length > 0
            ? deposits.reduce((sum, d) => sum + (d.initial_amount || 0), 0) / deposits.length
            : 0,
        averageUtilizationRate:
          deposits.length > 0
            ? deposits.reduce(
                (sum, d) =>
                  sum + ((d.initial_amount - (d.current_balance || 0)) / d.initial_amount) * 100,
                0
              ) / deposits.length
            : 0,

        // Health metrics
        healthMetrics: {
          dormantDeposits: deposits.filter(d => {
            const daysSinceActivity = d.last_activity_date
              ? Math.floor(
                  (new Date().getTime() - d.last_activity_date.getTime()) / (1000 * 60 * 60 * 24)
                )
              : 0;
            return daysSinceActivity > 90;
          }).length,
          lowUtilizationDeposits: deposits.filter(d => {
            const utilizationRate =
              ((d.initial_amount - (d.current_balance || 0)) / d.initial_amount) * 100;
            return utilizationRate < 10;
          }).length,
          smallBalanceDeposits: deposits.filter(
            d => d.current_balance > 0 && d.current_balance < 50
          ).length,
        },
      };

      return analytics;
    } catch (error) {
      throw new BadException('Failed to get deposit analytics', 500, error.message);
    }
  }

  /**
   * Comprehensive deposit reconciliation system
   */
  static async reconcileDepositBalances(depositId?: number): Promise<any> {
    try {
      const whereClause = depositId ? { id: depositId } : {};

      const deposits = await PatientDeposit.findAll({
        where: whereClause,
        include: ['patient', 'bankAccount'],
      });

      const reconciliationResults = [];

      for (const deposit of deposits) {
        // Get all transactions for this deposit
        const transactions = await DepositTransaction.findAll({
          where: { deposit_id: deposit.id },
          include: ['journalEntry'],
          order: [['createdAt', 'ASC']],
        });

        // Get all journal entries for this deposit
        const journalEntries = await DepositJournalEntry.findAll({
          where: { deposit_id: deposit.id },
          include: ['journalEntry'],
        });

        // Calculate expected balance from transactions
        let calculatedBalance = 0;
        const transactionSummary = {
          created: 0,
          used: 0,
          refunded: 0,
          adjusted: 0,
          expired: 0,
        };

        for (const transaction of transactions) {
          switch (transaction.transaction_type) {
            case DepositTransactionType.CREATED:
              calculatedBalance += transaction.amount;
              transactionSummary.created += transaction.amount;
              break;
            case DepositTransactionType.USED:
              calculatedBalance -= transaction.amount;
              transactionSummary.used += transaction.amount;
              break;
            case DepositTransactionType.REFUNDED:
              calculatedBalance -= transaction.amount;
              transactionSummary.refunded += transaction.amount;
              break;
            case DepositTransactionType.ADJUSTED:
              calculatedBalance += transaction.amount; // Adjustment can be positive or negative
              transactionSummary.adjusted += transaction.amount;
              break;
            case DepositTransactionType.EXPIRED:
              calculatedBalance -= transaction.amount;
              transactionSummary.expired += transaction.amount;
              break;
          }
        }

        // Calculate expected balance from journal entries
        let journalCalculatedBalance = 0;
        for (const journalEntry of journalEntries) {
          if (journalEntry.entry_type === 'DEPOSIT') {
            journalCalculatedBalance += journalEntry.amount;
          } else if (journalEntry.entry_type === 'USAGE') {
            journalCalculatedBalance -= journalEntry.amount;
          } else if (journalEntry.entry_type === 'REFUND') {
            journalCalculatedBalance -= journalEntry.amount;
          } else if (journalEntry.entry_type === 'ADJUSTMENT') {
            journalCalculatedBalance += journalEntry.amount; // Can be positive or negative
          }
        }

        // Check for discrepancies
        const balanceDiscrepancy = Math.abs(deposit.current_balance - calculatedBalance);
        const journalDiscrepancy = Math.abs(calculatedBalance - journalCalculatedBalance);
        const isReconciled = balanceDiscrepancy < 0.01 && journalDiscrepancy < 0.01;

        // Validate bank account balance if applicable
        let bankAccountReconciliation = null;
        if (deposit.bank_account_id) {
          const bankAccount = await AccountingService.getBankAccountById(deposit.bank_account_id);
          if (bankAccount) {
            const expectedBankBalance = deposit.initial_amount - deposit.current_balance;
            const actualBankBalance = bankAccount.current_balance;
            const bankDiscrepancy = Math.abs(expectedBankBalance - actualBankBalance);

            bankAccountReconciliation = {
              bank_account_id: deposit.bank_account_id,
              bank_name: bankAccount.bank_name,
              expected_balance: expectedBankBalance,
              actual_balance: actualBankBalance,
              discrepancy: bankDiscrepancy,
              is_reconciled: bankDiscrepancy < 0.01,
            };
          }
        }

        // Validate Chart of Accounts balances
        const chartOfAccountsReconciliation = await this.validateChartOfAccountsBalances(
          deposit.id
        );

        reconciliationResults.push({
          depositId: deposit.id,
          referenceNumber: deposit.reference_number,
          patientName: `${deposit.patient?.firstname} ${deposit.patient?.lastname}`,
          recordedBalance: deposit.current_balance,
          calculatedBalance,
          balanceDiscrepancy,
          journalCalculatedBalance,
          journalDiscrepancy,
          isReconciled,
          transactionCount: transactions.length,
          journalEntryCount: journalEntries.length,
          transactionSummary,
          lastTransactionDate: transactions[transactions.length - 1]?.createdAt || null,
          bankAccountReconciliation,
          chartOfAccountsReconciliation,
          reconciliationIssues: this.identifyReconciliationIssues(
            deposit,
            calculatedBalance,
            journalCalculatedBalance,
            bankAccountReconciliation,
            chartOfAccountsReconciliation
          ),
        });
      }

      // Summary statistics
      const summary = {
        totalDepositsChecked: reconciliationResults.length,
        reconciledDeposits: reconciliationResults.filter(r => r.isReconciled).length,
        discrepancyCount: reconciliationResults.filter(r => !r.isReconciled).length,
        totalBalanceDiscrepancy: reconciliationResults.reduce(
          (sum, r) => sum + r.balanceDiscrepancy,
          0
        ),
        totalJournalDiscrepancy: reconciliationResults.reduce(
          (sum, r) => sum + r.journalDiscrepancy,
          0
        ),
        bankAccountIssues: reconciliationResults.filter(
          r => r.bankAccountReconciliation && !r.bankAccountReconciliation.is_reconciled
        ).length,
        chartOfAccountsIssues: reconciliationResults.filter(
          r => r.chartOfAccountsReconciliation && !r.chartOfAccountsReconciliation.is_reconciled
        ).length,
      };

      return {
        summary,
        results: reconciliationResults,
        timestamp: new Date(),
        reconciliationStatus: this.getOverallReconciliationStatus(summary),
      };
    } catch (error) {
      throw new BadException('Failed to reconcile deposit balances', 500, error.message);
    }
  }

  /**
   * Validate Chart of Accounts balances for a deposit
   */
  private static async validateChartOfAccountsBalances(depositId: number): Promise<any> {
    try {
      const deposit = await PatientDeposit.findByPk(depositId);
      if (!deposit) return null;

      // Get the required Chart of Accounts
      const requiredAccounts = await ComprehensiveChartOfAccountsService.getAllRequiredAccounts();

      const accountBalances = {};
      let totalDiscrepancy = 0;
      let isReconciled = true;

      for (const account of requiredAccounts) {
        const balance = await ComprehensiveChartOfAccountsService.getAccountBalance(account.code);
        accountBalances[account.code] = {
          account_name: account.name,
          expected_balance: account.balance || 0,
          actual_balance: balance,
          discrepancy: Math.abs((account.balance || 0) - balance),
          is_reconciled: Math.abs((account.balance || 0) - balance) < 0.01,
        };

        if (!accountBalances[account.code].is_reconciled) {
          isReconciled = false;
          totalDiscrepancy += accountBalances[account.code].discrepancy;
        }
      }

      return {
        accountBalances,
        totalDiscrepancy,
        isReconciled,
      };
    } catch (error) {
      return {
        error: error.message,
        isReconciled: false,
      };
    }
  }

  /**
   * Identify specific reconciliation issues
   */
  private static identifyReconciliationIssues(
    deposit: any,
    calculatedBalance: number,
    journalCalculatedBalance: number,
    bankAccountReconciliation: any,
    chartOfAccountsReconciliation: any
  ): string[] {
    const issues: string[] = [];

    // Check balance discrepancies
    if (Math.abs(deposit.current_balance - calculatedBalance) > 0.01) {
      issues.push(
        `Balance mismatch: Recorded ${deposit.current_balance} vs Calculated ${calculatedBalance}`
      );
    }

    if (Math.abs(calculatedBalance - journalCalculatedBalance) > 0.01) {
      issues.push(
        `Journal entry mismatch: Transaction balance ${calculatedBalance} vs Journal balance ${journalCalculatedBalance}`
      );
    }

    // Check bank account reconciliation
    if (bankAccountReconciliation && !bankAccountReconciliation.is_reconciled) {
      issues.push(
        `Bank account reconciliation issue: ${bankAccountReconciliation.discrepancy} discrepancy`
      );
    }

    // Check Chart of Accounts reconciliation
    if (chartOfAccountsReconciliation && !chartOfAccountsReconciliation.is_reconciled) {
      issues.push(
        `Chart of Accounts reconciliation issue: ${chartOfAccountsReconciliation.totalDiscrepancy} total discrepancy`
      );
    }

    // Check for orphaned transactions
    if (deposit.current_balance === 0 && calculatedBalance > 0) {
      issues.push(
        'Potential orphaned transactions: Balance is 0 but transactions show positive amount'
      );
    }

    // Check for missing journal entries
    if (deposit.current_balance !== 0 && journalCalculatedBalance === 0) {
      issues.push(
        'Missing journal entries: Transactions exist but no corresponding journal entries'
      );
    }

    return issues;
  }

  /**
   * Get overall reconciliation status
   */
  private static getOverallReconciliationStatus(summary: any): string {
    if (
      summary.discrepancyCount === 0 &&
      summary.bankAccountIssues === 0 &&
      summary.chartOfAccountsIssues === 0
    ) {
      return 'FULLY_RECONCILED';
    } else if (summary.discrepancyCount < summary.totalDepositsChecked * 0.1) {
      return 'MOSTLY_RECONCILED';
    } else if (summary.discrepancyCount < summary.totalDepositsChecked * 0.5) {
      return 'PARTIALLY_RECONCILED';
    } else {
      return 'SIGNIFICANT_ISSUES';
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
      const { startDate, endDate, includeDetails = true, format = 'detailed' } = filters;

      // Get reconciliation data
      const reconciliation = await this.reconcileDepositBalances();

      // Filter by date range if specified
      let filteredResults = reconciliation.results;
      if (startDate || endDate) {
        filteredResults = reconciliation.results.filter(result => {
          const lastTransactionDate = result.lastTransactionDate;
          if (!lastTransactionDate) return false;

          if (startDate && lastTransactionDate < startDate) return false;
          if (endDate && lastTransactionDate > endDate) return false;
          return true;
        });
      }

      // Calculate filtered summary
      const filteredSummary = {
        totalDepositsChecked: filteredResults.length,
        reconciledDeposits: filteredResults.filter(r => r.isReconciled).length,
        discrepancyCount: filteredResults.filter(r => !r.isReconciled).length,
        totalBalanceDiscrepancy: filteredResults.reduce((sum, r) => sum + r.balanceDiscrepancy, 0),
        totalJournalDiscrepancy: filteredResults.reduce((sum, r) => sum + r.journalDiscrepancy, 0),
        bankAccountIssues: filteredResults.filter(
          r => r.bankAccountReconciliation && !r.bankAccountReconciliation.is_reconciled
        ).length,
        chartOfAccountsIssues: filteredResults.filter(
          r => r.chartOfAccountsReconciliation && !r.chartOfAccountsReconciliation.is_reconciled
        ).length,
      };

      // Generate report based on format
      let report;
      switch (format) {
        case 'summary':
          report = {
            summary: filteredSummary,
            reconciliationStatus: this.getOverallReconciliationStatus(filteredSummary),
            timestamp: new Date(),
            recommendations: this.generateReconciliationRecommendations(
              filteredSummary,
              filteredResults
            ),
          };
          break;

        case 'detailed':
          report = {
            summary: filteredSummary,
            reconciliationStatus: this.getOverallReconciliationStatus(filteredSummary),
            timestamp: new Date(),
            results: includeDetails ? filteredResults : [],
            recommendations: this.generateReconciliationRecommendations(
              filteredSummary,
              filteredResults
            ),
            metadata: {
              filters,
              generatedAt: new Date(),
              systemVersion: '1.0.0',
            },
          };
          break;

        case 'csv':
          report = this.generateCSVReport(filteredResults, filteredSummary);
          break;

        case 'pdf':
          report = this.generatePDFReport(filteredResults, filteredSummary);
          break;

        default:
          report = {
            summary: filteredSummary,
            reconciliationStatus: this.getOverallReconciliationStatus(filteredSummary),
            timestamp: new Date(),
          };
      }

      return report;
    } catch (error) {
      throw new BadException('Failed to generate reconciliation report', 500, error.message);
    }
  }

  /**
   * Generate reconciliation recommendations
   */
  private static generateReconciliationRecommendations(summary: any, results: any[]): string[] {
    const recommendations: string[] = [];

    if (summary.discrepancyCount > 0) {
      recommendations.push(
        `Investigate ${summary.discrepancyCount} deposits with balance discrepancies`
      );
    }

    if (summary.bankAccountIssues > 0) {
      recommendations.push(
        `Review ${summary.bankAccountIssues} bank account reconciliation issues`
      );
    }

    if (summary.chartOfAccountsIssues > 0) {
      recommendations.push(
        `Address ${summary.chartOfAccountsIssues} Chart of Accounts balance issues`
      );
    }

    if (summary.totalBalanceDiscrepancy > 1000) {
      recommendations.push(
        'Significant balance discrepancies detected - immediate attention required'
      );
    }

    if (summary.reconciledDeposits / summary.totalDepositsChecked < 0.8) {
      recommendations.push('Low reconciliation rate - consider system-wide audit');
    }

    // Add specific recommendations based on results
    const orphanedTransactions = results.filter(r =>
      r.reconciliationIssues.some(issue => issue.includes('orphaned'))
    );
    if (orphanedTransactions.length > 0) {
      recommendations.push(
        `Review ${orphanedTransactions.length} deposits with potential orphaned transactions`
      );
    }

    const missingJournalEntries = results.filter(r =>
      r.reconciliationIssues.some(issue => issue.includes('Missing journal entries'))
    );
    if (missingJournalEntries.length > 0) {
      recommendations.push(
        `Investigate ${missingJournalEntries.length} deposits with missing journal entries`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('All systems are properly reconciled - no immediate action required');
    }

    return recommendations;
  }

  /**
   * Generate CSV format report
   */
  private static generateCSVReport(results: any[], summary: any): any {
    const csvHeaders = [
      'Deposit ID',
      'Reference Number',
      'Patient Name',
      'Recorded Balance',
      'Calculated Balance',
      'Balance Discrepancy',
      'Journal Balance',
      'Journal Discrepancy',
      'Reconciled',
      'Transaction Count',
      'Journal Entry Count',
      'Bank Account Issues',
      'Chart of Accounts Issues',
      'Reconciliation Issues',
    ];

    const csvRows = results.map(result => [
      result.depositId,
      result.referenceNumber,
      result.patientName,
      result.recordedBalance,
      result.calculatedBalance,
      result.balanceDiscrepancy,
      result.journalCalculatedBalance,
      result.journalDiscrepancy,
      result.isReconciled ? 'Yes' : 'No',
      result.transactionCount,
      result.journalEntryCount,
      result.bankAccountReconciliation
        ? result.bankAccountReconciliation.is_reconciled
          ? 'No'
          : 'Yes'
        : 'N/A',
      result.chartOfAccountsReconciliation
        ? result.chartOfAccountsReconciliation.is_reconciled
          ? 'No'
          : 'Yes'
        : 'N/A',
      result.reconciliationIssues.join('; '),
    ]);

    return {
      format: 'csv',
      headers: csvHeaders,
      rows: csvRows,
      summary,
      timestamp: new Date(),
    };
  }

  /**
   * Generate PDF format report
   */
  private static generatePDFReport(results: any[], summary: any): any {
    return {
      format: 'pdf',
      summary,
      results: results.slice(0, 100), // Limit for PDF
      timestamp: new Date(),
      note: 'PDF generation would require additional PDF library integration',
    };
  }

  /**
   * Adjust patient deposit (for corrections, fees, etc.)
   */
  static async adjustDeposit(
    data: {
      deposit_id: number;
      amount: number;
      adjustment_type: 'add' | 'subtract';
      reason: string;
      adjusted_by: number;
    },
    transaction?: Transaction
  ): Promise<PatientDeposit> {
    try {
      // Validate financial period for transaction
      const currentPeriod = await FinancialPeriodValidationService.getCurrentActivePeriod();
      if (!currentPeriod) {
        throw new BadException(
          'Financial Period Not Available',
          503,
          'No active financial period found. Please configure financial periods before processing transactions.'
        );
      }

      // Get deposit
      const deposit = await PatientDeposit.findByPk(data.deposit_id);
      if (!deposit) {
        throw new BadException(
          'Deposit Not Found',
          404,
          'The requested patient deposit could not be found'
        );
      }

      // Validate adjustment
      if (data.adjustment_type === 'subtract' && data.amount > deposit.current_balance) {
        throw new BadException(
          'Adjustment Amount Exceeds Balance',
          400,
          'Adjustment amount exceeds current balance'
        );
      }

      // Calculate new balance
      const previousBalance = deposit.current_balance;
      let newBalance: number;

      if (data.adjustment_type === 'add') {
        newBalance = deposit.current_balance + data.amount;
      } else {
        newBalance = deposit.current_balance - data.amount;
      }

      // Update deposit
      await deposit.update(
        {
          current_balance: newBalance,
          refundable_amount: Math.min(deposit.refundable_amount, newBalance),
          last_activity_date: new Date(),
          status: newBalance === 0 ? DepositStatus.USED : DepositStatus.ACTIVE,
        },
        { transaction }
      );

      // Create journal entry for deposit adjustment
      const journalEntry = await PatientDepositJournalEntryService.createDepositAdjustmentEntry(
        deposit,
        data.adjustment_type === 'add' ? data.amount : -data.amount,
        data.reason,
        transaction
      );

      // Create deposit transaction record
      await DepositTransaction.create(
        {
          deposit_id: deposit.id,
          transaction_type: DepositTransactionType.ADJUSTED,
          amount: data.amount,
          previous_balance: previousBalance,
          new_balance: newBalance,
          reference_number: `ADJ-${deposit.reference_number}`,
          description: `Deposit adjustment: ${data.reason}`,
          journal_entry_id: journalEntry.id,
          created_by: data.adjusted_by,
          period_id: currentPeriod.id, // Link to current financial period
        },
        { transaction }
      );

      // Create deposit journal entry mapping
      await DepositJournalEntry.create(
        {
          deposit_id: deposit.id,
          journal_entry_id: journalEntry.id,
          entry_type: DepositJournalEntryType.ADJUSTMENT,
          amount: data.amount,
          period_id: currentPeriod.id, // Link to current financial period
        },
        { transaction }
      );

      // Update bank account balance if specified
      if (deposit.bank_account_id) {
        await PatientDepositService.updateBankAccountBalance(
          deposit.bank_account_id,
          data.amount,
          data.adjustment_type,
          transaction
        );
      }

      return deposit;
    } catch (error) {
      throw new BadException('Failed to adjust patient deposit', 500, error.message);
    }
  }

  /**
   * Handle deposit expiry (move to expired status and potentially refund)
   */
  static async handleDepositExpiry(
    depositId: number,
    processedBy: number,
    transaction?: Transaction
  ): Promise<PatientDeposit> {
    try {
      // Validate financial period for transaction
      const currentPeriod = await FinancialPeriodValidationService.getCurrentActivePeriod();
      if (!currentPeriod) {
        throw new BadException(
          'Financial Period Not Available',
          503,
          'No active financial period found. Please configure financial periods before processing transactions.'
        );
      }

      // Get deposit
      const deposit = await PatientDeposit.findByPk(depositId);
      if (!deposit) {
        throw new BadException(
          'Deposit Not Found',
          404,
          'The requested patient deposit could not be found'
        );
      }

      // Check if deposit is already used/expired
      if (deposit.status === DepositStatus.USED) {
        throw new BadException('Deposit Already Used', 400, 'Deposit is already used or expired');
      }

      // Check if deposit has remaining balance
      if (deposit.current_balance <= 0) {
        throw new BadException('Deposit No Balance', 400, 'Deposit has no balance to expire');
      }

      const previousBalance = deposit.current_balance;

      // Update deposit status to used (expired)
      await deposit.update(
        {
          status: DepositStatus.USED,
          last_activity_date: new Date(),
          current_balance: 0,
          refundable_amount: 0,
        },
        { transaction }
      );

      // Create journal entry for deposit expiry using usage entry pattern
      const journalEntry = await PatientDepositJournalEntryService.createDepositUsageEntry(
        deposit,
        previousBalance,
        0, // No bill ID for expiry
        transaction
      );

      // Create deposit transaction record
      await DepositTransaction.create(
        {
          deposit_id: deposit.id,
          transaction_type: DepositTransactionType.EXPIRED,
          amount: previousBalance,
          previous_balance: previousBalance,
          new_balance: 0,
          reference_number: `EXP-${deposit.reference_number}`,
          description: 'Deposit expired - balance forfeited',
          journal_entry_id: journalEntry.id,
          created_by: processedBy,
          period_id: currentPeriod.id, // Link to current financial period
        },
        { transaction }
      );

      // Create deposit journal entry mapping
      await DepositJournalEntry.create(
        {
          deposit_id: deposit.id,
          journal_entry_id: journalEntry.id,
          entry_type: DepositJournalEntryType.USAGE, // Use USAGE for expiry since we're using the usage entry pattern
          amount: previousBalance,
          period_id: currentPeriod.id, // Link to current financial period
        },
        { transaction }
      );

      // Update bank account balance if specified (remove expired amount)
      if (deposit.bank_account_id) {
        await PatientDepositService.updateBankAccountBalance(
          deposit.bank_account_id,
          previousBalance,
          'subtract',
          transaction
        );
      }

      return deposit;
    } catch (error) {
      throw new BadException('Failed to handle deposit expiry', 500, error.message);
    }
  }

  /**
   * Get deposit with complete transaction history
   */
  static async getDepositWithHistory(depositId: number): Promise<any> {
    try {
      const deposit = await PatientDeposit.findByPk(depositId, {
        include: ['patient', 'bankAccount', 'createdByStaff', 'updatedByStaff'],
      });

      if (!deposit) {
        throw new BadException(
          'Deposit Not Found',
          404,
          'The requested patient deposit could not be found'
        );
      }

      // Get transaction history
      const transactions = await DepositTransaction.findAll({
        where: { deposit_id: depositId },
        include: ['createdByStaff'],
        order: [['createdAt', 'DESC']],
      });

      // Get journal entries
      const journalEntries = await PatientDepositJournalEntryService.getJournalEntriesForDeposit(
        depositId
      );

      return {
        deposit,
        transactions,
        journalEntries,
      };
    } catch (error) {
      throw new BadException('Failed to get deposit with history', 500, error.message);
    }
  }

  /**
   * Update bank account balance when deposit operations occur
   */
  private static async updateBankAccountBalance(
    bankAccountId: number,
    amount: number,
    operation: 'add' | 'subtract',
    transaction?: Transaction
  ): Promise<void> {
    try {
      await AccountingService.updateBankAccountBalance(
        bankAccountId,
        amount,
        operation,
        transaction
      );
    } catch (error) {
      throw new BadException(
        `Failed to update bank account balance: ${error.message}`,
        500,
        error.message
      );
    }
  }

  /**
   * Generate unique deposit reference number
   */
  private static async generateDepositReference(): Promise<string> {
    let referenceNumber: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const timestamp = Date.now().toString(36);
      const random = Math.random()
        .toString(36)
        .substring(2, 5);
      referenceNumber = `DEP-${timestamp}-${random}`.toUpperCase();

      // Check if reference number already exists
      const existingDeposit = await PatientDeposit.findOne({
        where: { reference_number: referenceNumber },
      });

      if (!existingDeposit) {
        isUnique = true;
      } else {
        attempts++;
        // Wait a bit before trying again to ensure different timestamp
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    if (!isUnique) {
      throw new BadException(
        'Failed to generate unique reference number after multiple attempts',
        500
      );
    }

    return referenceNumber!;
  }
}
