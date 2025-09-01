import { Transaction } from 'sequelize';
import { JournalEntry } from '../../../database/models/journalEntry';
import { JournalEntryLine } from '../../../database/models/journalEntryLine';
import { PatientDeposit } from '../../../database/models/patientDeposit';
import { ComprehensiveChartOfAccountsService } from './comprehensiveChartOfAccounts.service';
import { JournalEntryStatus, DepositTransactionType } from '../enums';
import { BadException } from '../../../common/util/api-error';
import dayjs from 'dayjs';
import { ClinicalBill } from '../../../database/models';

export interface JournalEntryData {
  reference: string;
  description: string;
  date: Date;
  patient_id?: number;
  visit_id?: number;
  lines: JournalEntryLineData[];
}

export interface JournalEntryLineData {
  account_id: number;
  debit: number;
  credit: number;
  description: string;
  cost_center_id?: number;
}

export class PatientDepositJournalEntryService {
  /**
   * Create journal entry for deposit creation
   */
  static async createDepositCreationEntry(
    deposit: PatientDeposit,
    transaction?: Transaction
  ): Promise<JournalEntry> {
    try {
      // Get required accounts based on payment method
      let debitAccount;
      let debitDescription;

      if (deposit.deposit_type === 'CARD' && deposit.pos_terminal_id) {
        // For card deposits via POS terminal
        debitAccount = await ComprehensiveChartOfAccountsService.getRequiredAccount('1003'); // POS Terminal Receivables
        debitDescription = 'Deposit received via POS terminal';
      } else if (deposit.deposit_type === 'BANK_TRANSFER' && deposit.bank_account_id) {
        // For bank transfer deposits
        debitAccount = await ComprehensiveChartOfAccountsService.getRequiredAccount('1002'); // Bank Accounts
        debitDescription = 'Deposit received into bank account';
      } else {
        // For cash and other deposits
        debitAccount = await ComprehensiveChartOfAccountsService.getRequiredAccount('1001'); // Cash on Hand
        debitDescription = 'Deposit received as cash';
      }

      const patientDepositsPayable = await ComprehensiveChartOfAccountsService.getRequiredAccount(
        '2001'
      ); // Patient Deposits Payable

      if (!debitAccount || !patientDepositsPayable) {
        throw new BadException(
          'Required Chart of Accounts Missing',
          500,
          'Required Chart of Accounts not found for deposit creation'
        );
      }

      // Create journal entry
      const journalEntry = await JournalEntry.create(
        {
          reference: `DEP-${deposit.reference_number}`,
          description: `Patient deposit received via ${deposit.deposit_type} - ${deposit.patient?.firstname} ${deposit.patient?.lastname}`,
          transaction_date: deposit.deposit_date,
          patient_id: deposit.patient_id,
          status: JournalEntryStatus.POSTED,
        },
        { transaction }
      );

      // Create journal entry lines
      const lines = [
        // Debit: Appropriate Asset Account (POS Terminal, Bank Account, or Cash)
        {
          journal_entry_id: journalEntry.id,
          account_id: debitAccount.id,
          debit: deposit.amount,
          credit: 0,
          description: debitDescription,
        },
        // Credit: Patient Deposits Payable
        {
          journal_entry_id: journalEntry.id,
          account_id: patientDepositsPayable.id,
          debit: 0,
          credit: deposit.amount,
          description: 'Patient deposit liability created',
        },
      ];

      await JournalEntryLine.bulkCreate(lines, { transaction });

      return journalEntry;
    } catch (error) {
      throw new BadException('Failed to create deposit creation journal entry', 500, error.message);
    }
  }

  /**
   * Create journal entry for deposit usage
   */
  static async createDepositUsageEntry(
    deposit: PatientDeposit,
    amount: number,
    billId: number,
    transaction?: Transaction
  ): Promise<JournalEntry> {
    try {
      // Get required accounts
      const patientDepositsPayable = await ComprehensiveChartOfAccountsService.getRequiredAccount(
        '2001'
      ); // Patient Deposits Payable
      const bankAccount = await ComprehensiveChartOfAccountsService.getRequiredAccount('1002'); // Bank Accounts
      const serviceRevenue = await ComprehensiveChartOfAccountsService.getRequiredAccount('4001'); // Service Revenue

      if (!patientDepositsPayable || !bankAccount || !serviceRevenue) {
        throw new BadException(
          'Required Chart of Accounts Missing',
          500,
          'Required Chart of Accounts not found for deposit usage'
        );
      }

      const bill = await ClinicalBill.findOne({ where: { id: billId } });
      if (!bill) {
        throw new BadException('Bill not found', 404, 'Bill not found');
      }

      // Create journal entry
      const journalEntry = await JournalEntry.create(
        {
          reference: `DEP-USE-${deposit.reference_number}`,
          description: `Deposit used for bill ${billId}`,
          transaction_date: new Date(),
          patient_id: deposit.patient_id,
          status: JournalEntryStatus.POSTED,
          entry_date: dayjs().toDate(),
          entry_type: 'DEPOSIT_USED',
          created_by: deposit.created_by,
          period_id: bill.period_id,
          visit_id: bill.visit_id,
        },
        { transaction }
      );

      // Create journal entry lines
      const lines = [
        // Debit: Patient Deposits Payable
        {
          journal_entry_id: journalEntry.id,
          account_id: patientDepositsPayable.id,
          debit: amount,
          credit: 0,
          description: 'Deposit liability reduced',
        },
        // Credit: Bank Account
        {
          journal_entry_id: journalEntry.id,
          account_id: bankAccount.id,
          debit: 0,
          credit: amount,
          description: 'Deposit withdrawn from bank account',
        },
        // Credit: Service Revenue
        {
          journal_entry_id: journalEntry.id,
          account_id: serviceRevenue.id,
          debit: 0,
          credit: amount,
          description: 'Revenue from services',
        },
      ];

      await JournalEntryLine.bulkCreate(lines, { transaction });

      return journalEntry;
    } catch (error) {
      throw new BadException('Failed to create deposit usage journal entry', 500, error.message);
    }
  }

  /**
   * Create journal entry for deposit refund
   */
  static async createDepositRefundEntry(
    deposit: PatientDeposit,
    amount: number,
    refundReason: string,
    transaction?: Transaction
  ): Promise<JournalEntry> {
    try {
      // Get required accounts
      const patientDepositsPayable = await ComprehensiveChartOfAccountsService.getRequiredAccount(
        '2001'
      ); // Patient Deposits Payable
      const bankAccount = await ComprehensiveChartOfAccountsService.getRequiredAccount('1002'); // Bank Accounts

      if (!patientDepositsPayable || !bankAccount) {
        throw new BadException(
          'Required Chart of Accounts Missing',
          500,
          'Required Chart of Accounts not found for deposit refund'
        );
      }

      // Create journal entry
      const journalEntry = await JournalEntry.create(
        {
          reference: `DEP-REF-${deposit.reference_number}`,
          description: `Deposit refund - ${refundReason}`,
          transaction_date: new Date(),
          patient_id: deposit.patient_id,
          status: JournalEntryStatus.POSTED,
        },
        { transaction }
      );

      // Create journal entry lines
      const lines = [
        // Debit: Patient Deposits Payable
        {
          journal_entry_id: journalEntry.id,
          account_id: patientDepositsPayable.id,
          debit: amount,
          credit: 0,
          description: 'Deposit liability reduced for refund',
        },
        // Credit: Bank Account
        {
          journal_entry_id: journalEntry.id,
          account_id: bankAccount.id,
          debit: 0,
          credit: amount,
          description: 'Refund paid from bank account',
        },
      ];

      await JournalEntryLine.bulkCreate(lines, { transaction });

      return journalEntry;
    } catch (error) {
      throw new BadException('Failed to create deposit refund journal entry', 500, error.message);
    }
  }

  /**
   * Create journal entry for deposit adjustment
   */
  static async createDepositAdjustmentEntry(
    deposit: PatientDeposit,
    adjustmentAmount: number,
    adjustmentReason: string,
    transaction?: Transaction
  ): Promise<JournalEntry> {
    try {
      // Get required accounts
      const patientDepositsPayable = await ComprehensiveChartOfAccountsService.getRequiredAccount(
        '2001'
      ); // Patient Deposits Payable
      const bankAccount = await ComprehensiveChartOfAccountsService.getRequiredAccount('1002'); // Bank Accounts

      if (!patientDepositsPayable || !bankAccount) {
        throw new BadException(
          'Required Chart of Accounts Missing',
          500,
          'Required Chart of Accounts not found for deposit adjustment'
        );
      }

      // Create journal entry
      const journalEntry = await JournalEntry.create(
        {
          reference: `DEP-ADJ-${deposit.reference_number}`,
          description: `Deposit adjustment - ${adjustmentReason}`,
          transaction_date: new Date(),
          patient_id: deposit.patient_id,
          status: JournalEntryStatus.POSTED,
        },
        { transaction }
      );

      // Create journal entry lines based on adjustment type
      let lines: any[] = [];

      if (adjustmentAmount > 0) {
        // Positive adjustment (increase deposit)
        lines = [
          // Debit: Bank Account
          {
            journal_entry_id: journalEntry.id,
            account_id: bankAccount.id,
            debit: adjustmentAmount,
            credit: 0,
            description: 'Deposit adjustment - increase',
          },
          // Credit: Patient Deposits Payable
          {
            journal_entry_id: journalEntry.id,
            account_id: patientDepositsPayable.id,
            debit: 0,
            credit: adjustmentAmount,
            description: 'Deposit liability increased',
          },
        ];
      } else {
        // Negative adjustment (decrease deposit)
        const absAmount = Math.abs(adjustmentAmount);
        lines = [
          // Debit: Patient Deposits Payable
          {
            journal_entry_id: journalEntry.id,
            account_id: patientDepositsPayable.id,
            debit: absAmount,
            credit: 0,
            description: 'Deposit adjustment - decrease',
          },
          // Credit: Bank Account
          {
            journal_entry_id: journalEntry.id,
            account_id: bankAccount.id,
            debit: 0,
            credit: absAmount,
            description: 'Deposit adjustment processed',
          },
        ];
      }

      await JournalEntryLine.bulkCreate(lines, { transaction });

      return journalEntry;
    } catch (error) {
      throw new BadException(
        'Failed to create deposit adjustment journal entry',
        500,
        error.message
      );
    }
  }

  /**
   * Create journal entry for POS terminal settlement
   */
  static async createPOSTerminalSettlementEntry(
    posTerminal: any,
    totalAmount: number,
    settlement_reference: string,
    transaction?: Transaction
  ): Promise<JournalEntry> {
    try {
      // Get required accounts
      const posTerminalReceivables = await ComprehensiveChartOfAccountsService.getRequiredAccount(
        '1003'
      ); // POS Terminal Receivables
      const bankAccount = await ComprehensiveChartOfAccountsService.getRequiredAccount('1002'); // Bank Accounts

      if (!posTerminalReceivables || !bankAccount) {
        throw new BadException(
          'Required Chart of Accounts Missing',
          500,
          'Required Chart of Accounts not found for POS terminal settlement'
        );
      }

      // Create settlement journal entry
      const journalEntry = await JournalEntry.create(
        {
          reference: `SETTLE-${settlement_reference}`,
          description: `POS Terminal ${posTerminal.terminal_id} settlement to ${posTerminal.bankAccount.account_name}`,
          transaction_date: new Date(),
          status: JournalEntryStatus.POSTED,
        },
        { transaction }
      );

      // Create journal entry lines
      const lines = [
        // Debit: Bank Account (money moves from POS receivables to bank)
        {
          journal_entry_id: journalEntry.id,
          account_id: bankAccount.id,
          debit: totalAmount,
          credit: 0,
          description: `POS terminal settlement - ${posTerminal.terminal_id}`,
        },
        // Credit: POS Terminal Receivables (reduce the receivable)
        {
          journal_entry_id: journalEntry.id,
          account_id: posTerminalReceivables.id,
          debit: 0,
          credit: totalAmount,
          description: `Settlement of POS terminal ${posTerminal.terminal_id} receivables`,
        },
      ];

      await JournalEntryLine.bulkCreate(lines, { transaction });

      return journalEntry;
    } catch (error) {
      throw new BadException(
        'Failed to create POS terminal settlement journal entry',
        500,
        error.message
      );
    }
  }

  /**
   * Validate journal entry balance (debits must equal credits)
   */
  static async validateJournalEntryBalance(journalEntryId: number): Promise<boolean> {
    try {
      const lines = await JournalEntryLine.findAll({
        where: { journal_entry_id: journalEntryId },
      });

      const totalDebits = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
      const totalCredits = lines.reduce((sum, line) => sum + (line.credit || 0), 0);

      return Math.abs(totalDebits - totalCredits) < 0.01; // Allow for small rounding differences
    } catch (error) {
      throw new BadException('Failed to validate journal entry balance', 500, error.message);
    }
  }

  /**
   * Get journal entry with lines for a specific deposit
   */
  static async getJournalEntriesForDeposit(depositId: number): Promise<JournalEntry[]> {
    try {
      return await JournalEntry.findAll({
        where: { patient_id: depositId },
        include: [
          {
            model: JournalEntryLine,
            as: 'lines',
            include: ['account'],
          },
        ],
        order: [['transaction_date', 'DESC']],
      });
    } catch (error) {
      throw new BadException('Failed to get journal entries for deposit', 500, error.message);
    }
  }
}
