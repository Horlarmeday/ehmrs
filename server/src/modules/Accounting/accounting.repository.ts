import { Op, Sequelize, WhereOptions, Includeable, Transaction } from 'sequelize';
import { PaymentStatus } from './enums';
import {
  PatientDeposit,
  ClinicalBill,
  ClinicalBillItem,
  ClinicalPayment,
  Patient,
  Visit,
  Staff,
  HMO,
  Department,
  BankAccount,
  POSTerminal,
  BankTransfer,
  InsuranceClaim,
  POSTerminalTransaction,
  CashTransaction,
} from '../../database/models';
import {
  PatientDepositData,
  ClinicalBillData,
  ClinicalBillItemData,
  ClinicalPaymentData,
  BillSearchFilters,
  PaymentSearchFilters,
  DepositSearchFilters,
  BillingSummary,
  PaymentSummary,
  DepositSummary,
} from './types';
import { patientAttributes, visitAttributes } from '../../core/helpers/helper';
import { staffAttributes } from '../Antenatal/antenatal.repository';
import { ChartOfAccount } from '../../database/models/chartOfAccount';
import { JournalEntry } from '../../database/models/journalEntry';
import { JournalEntryLine } from '../../database/models/journalEntryLine';
import { CostCenter } from '../../database/models/costCenter';
import { FinancialPeriod } from '../../database/models/financialPeriod';
import { HMOClaim } from '../../database/models/hmoClaim';
import { DepositStatus, FinancialPeriodStatus, HMOClaimStatus } from './enums';
import {
  ChartOfAccountFilters,
  JournalEntryFilters,
  CostCenterFilters,
  FinancialPeriodFilters,
  HMOClaimFilters,
  TrialBalanceFilters,
} from './dto';
import { BadException } from '../../common/util/api-error';
import { AccountCodeConflictResolutionService } from './services/accountCodeConflictResolution.service';
import { logger } from '../../core/helpers/logger';
import { paginate } from '../../core/helpers/helper';
import sequelizeConnection from '../../database/config/data-source';

export class AccountingRepository {
  // ===== PHASE 1: CORE FINANCIAL FOUNDATION METHODS =====

  // Chart of Accounts
  static async getChartOfAccounts(filters: ChartOfAccountFilters = {}) {
    const { search, type, status, level, page = 1, limit = 30 } = filters;
    const where: WhereOptions<any> = {};
    const include: Includeable[] = [
      {
        model: ChartOfAccount,
        as: 'parent',
        attributes: ['id', 'code', 'name'],
      },
      {
        model: ChartOfAccount,
        as: 'children',
        attributes: ['id', 'code', 'name', 'type', 'balance'],
      },
    ];

    if (search) {
      (where as any)[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.is_active = status === 'active';
    }

    if (level) {
      // Level logic can be implemented based on parent_id depth
      if (level === '1') {
        where.parent_id = null;
      }
    }

    const paginatedResult = await ChartOfAccount.paginate({
      where,
      include,
      order: [['code', 'ASC']],
      paginate: limit,
      page,
    });

    // Calculate summary
    const summary = {
      totalAccounts: paginatedResult.total,
      activeAccounts: paginatedResult.docs.filter((acc: any) => acc.is_active).length,
      inactiveAccounts: paginatedResult.docs.filter((acc: any) => !acc.is_active).length,
      totalBalance: paginatedResult.docs.reduce(
        (sum: number, acc: any) => sum + (+acc.balance || 0),
        0
      ),
    };

    return { ...paginatedResult, summary };
  }

  static async getChartOfAccountById(id: number) {
    return await ChartOfAccount.findByPk(id, {
      include: [
        {
          model: ChartOfAccount,
          as: 'parent',
          attributes: ['id', 'code', 'name'],
        },
        {
          model: ChartOfAccount,
          as: 'children',
          attributes: ['id', 'code', 'name', 'type', 'balance'],
        },
      ],
    });
  }

  static async createChartOfAccount(data: any, transaction?: Transaction) {
    try {
      // Validate and resolve conflicts before creation
      const conflictResolution = await AccountCodeConflictResolutionService.resolveConflicts(
        data,
        undefined, // No existing account ID for creation
        transaction
      );

      if (!conflictResolution.resolved) {
        throw new BadException(
          'Account Creation Conflict',
          400,
          `Account creation failed: ${conflictResolution.message}`
        );
      }

      // Create account with resolved data
      const account = await ChartOfAccount.create(conflictResolution.resolvedData, { transaction });

      // Log conflict resolution if code was changed
      if (conflictResolution.resolvedData.code !== data.code) {
        logger.info(
          `📝 Account code conflict resolved: ${data.code} → ${conflictResolution.resolvedData.code}`
        );
      }

      return account;
    } catch (error) {
      if (error instanceof BadException) {
        throw error;
      }
      throw new BadException('Failed to create Chart of Account', 500, error.message);
    }
  }

  static async updateChartOfAccount(id: number, data: any, transaction?: Transaction) {
    try {
      const account = await ChartOfAccount.findByPk(id);
      if (!account) {
        throw new BadException(
          'Chart of Account Not Found',
          404,
          'The requested Chart of Account could not be found'
        );
      }

      // Validate and resolve conflicts before update
      const conflictResolution = await AccountCodeConflictResolutionService.resolveConflicts(
        data,
        id, // Existing account ID for updates
        transaction
      );

      if (!conflictResolution.resolved) {
        throw new BadException(
          'Account Update Conflict',
          400,
          `Account update failed: ${conflictResolution.message}`
        );
      }

      // Update account with resolved data
      const updatedAccount = await account.update(conflictResolution.resolvedData, { transaction });

      // Log conflict resolution if code was changed
      if (
        conflictResolution.resolvedData.code &&
        conflictResolution.resolvedData.code !== account.code
      ) {
        logger.info(
          `📝 Account code conflict resolved during update: ${account.code} → ${conflictResolution.resolvedData.code}`
        );
      }

      return updatedAccount;
    } catch (error) {
      if (error instanceof BadException) {
        throw error;
      }
      throw new BadException('Failed to update Chart of Account', 500, error.message);
    }
  }

  static async deleteChartOfAccount(id: number) {
    const account = await ChartOfAccount.findByPk(id);
    if (!account) {
      throw new BadException(
        'Chart of Account Not Found',
        404,
        'The requested Chart of Account could not be found'
      );
    }

    // Check if account has children
    const children = await ChartOfAccount.count({ where: { parent_id: id } });
    if (children > 0) {
      throw new BadException(
        'Account Deletion Blocked',
        400,
        'Cannot delete account with child accounts'
      );
    }

    // Check if account is used in journal entries
    const journalUsage = await JournalEntryLine.count({ where: { account_id: id } });
    if (journalUsage > 0) {
      throw new BadException(
        'Account Deletion Blocked',
        400,
        'Cannot delete account used in journal entries'
      );
    }

    return await account.destroy();
  }

  /**
   * Get conflict resolution suggestions for account creation/update
   */
  static async getAccountConflictSuggestions(
    accountData: any,
    existingAccountId?: number,
    transaction?: Transaction
  ) {
    try {
      return await AccountCodeConflictResolutionService.getConflictResolutionSuggestions(
        accountData,
        existingAccountId,
        transaction
      );
    } catch (error) {
      throw new BadException('Failed to get conflict resolution suggestions', 500, error.message);
    }
  }

  /**
   * Validate account data without creating/updating
   */
  static async validateAccountData(
    accountData: any,
    existingAccountId?: number,
    transaction?: Transaction
  ) {
    try {
      return await AccountCodeConflictResolutionService.validateAccountCode(
        accountData.code,
        accountData.name,
        accountData.type,
        accountData.parent_id,
        existingAccountId,
        transaction
      );
    } catch (error) {
      throw new BadException('Failed to validate account data', 500, error.message);
    }
  }

  // Journal Entries
  static async getJournalEntries(filters: JournalEntryFilters = {}) {
    const { search, status, startDate, endDate, type, page = 1, limit = 10 } = filters;

    const where: WhereOptions<JournalEntry> = {};
    const include: Includeable[] = [
      {
        model: JournalEntryLine,
        as: 'lines',
        include: [
          {
            model: ChartOfAccount,
            as: 'account',
            attributes: ['id', 'code', 'name', 'type'],
          },
        ],
      },
      {
        model: Patient,
        as: 'patient',
        attributes: patientAttributes,
      },
      {
        model: Visit,
        as: 'visit',
        attributes: ['id', 'visit_number'],
      },
    ];

    if (search) {
      (where as any)[Op.or] = [
        { reference: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.entry_type = type;
    }

    if (startDate && endDate) {
      // Implement date range logic
      where.transaction_date = { [Op.between]: [startDate, endDate] };
    }

    const paginatedResult = await JournalEntry.paginate({
      where,
      include,
      order: [['transaction_date', 'DESC']],
      page,
      paginate: limit,
    });

    // Apply pagination helper

    // Calculate summary
    const summary = {
      totalEntries: paginatedResult.total,
      pendingEntries: paginatedResult.docs.filter(
        (entry: any) => entry.status === 'PENDING_APPROVAL'
      ).length,
      approvedEntries: paginatedResult.docs.filter((entry: any) => entry.status === 'APPROVED')
        .length,
      totalAmount: paginatedResult.docs.reduce((sum: number, entry: any) => {
        return (
          sum + entry.lines.reduce((lineSum: number, line: any) => lineSum + (line.debit || 0), 0)
        );
      }, 0),
    };

    return { ...paginatedResult, summary };
  }

  static async getJournalEntryById(id: number) {
    return await JournalEntry.findByPk(id, {
      include: [
        {
          model: JournalEntryLine,
          as: 'lines',
          include: [
            {
              model: ChartOfAccount,
              as: 'account',
              attributes: ['id', 'code', 'name', 'type'],
            },
          ],
        },
        {
          model: Patient,
          as: 'patient',
          attributes: patientAttributes,
        },
        {
          model: Visit,
          as: 'visit',
          attributes: ['id', 'visit_number'],
        },
      ],
    });
  }

  static async createJournalEntry(data: any) {
    const { lines, ...entryData } = data;

    // Create journal entry
    const entry = await JournalEntry.create(entryData);

    // Create journal entry lines
    if (lines && lines.length > 0) {
      const lineData = lines.map((line: any) => ({
        ...line,
        journal_entry_id: entry.id,
      }));
      await JournalEntryLine.bulkCreate(lineData);
    }

    return entry;
  }

  static async updateJournalEntry(id: number, data: any) {
    const entry = await JournalEntry.findByPk(id);
    if (!entry) {
      throw new Error('Journal entry not found');
    }

    const { lines, ...entryData } = data;

    // Update journal entry
    await entry.update(entryData);

    // Update journal entry lines if provided
    if (lines && lines.length > 0) {
      // Delete existing lines
      await JournalEntryLine.destroy({ where: { journal_entry_id: id } });

      // Create new lines
      const lineData = lines.map((line: any) => ({
        ...line,
        journal_entry_id: id,
      }));
      await JournalEntryLine.bulkCreate(lineData);
    }

    return entry;
  }

  static async deleteJournalEntry(id: number) {
    const entry = await JournalEntry.findByPk(id);
    if (!entry) {
      throw new Error('Journal entry not found');
    }

    if (entry.status === 'POSTED') {
      throw new Error('Cannot delete posted journal entry');
    }

    // Delete associated lines first
    await JournalEntryLine.destroy({ where: { journal_entry_id: id } });

    return await entry.destroy();
  }

  // ===== PHASE 3 COMPLETION: ENHANCED JOURNAL ENTRY FEATURES =====

  /**
   * Reverse a posted journal entry (creates a reversing entry)
   */
  static async reverseJournalEntry(id: number, reversalReason: string, staffId: number) {
    const entry = await JournalEntry.findByPk(id, {
      include: [
        {
          model: JournalEntryLine,
          as: 'lines',
          include: [
            {
              model: ChartOfAccount,
              as: 'account',
              attributes: ['id', 'code', 'name', 'type'],
            },
          ],
        },
      ],
    });

    if (!entry) {
      throw new BadException(
        'Journal Entry Not Found',
        404,
        'The requested journal entry could not be found'
      );
    }

    if (entry.status !== 'POSTED') {
      throw new BadException(
        'Entry Not Posted',
        400,
        'Only posted journal entries can be reversed'
      );
    }

    // Create reversing entry
    const reversalData = {
      reference: `REV-${entry.reference}`,
      description: `Reversal of ${entry.reference}: ${reversalReason}`,
      transaction_date: new Date(),
      entry_type: 'REVERSAL',
      status: 'DRAFT',
      created_by: staffId,
      reversed_entry_id: id,
      reversal_reason: reversalReason,
    };

    const reversalEntry = await JournalEntry.create(reversalData);

    // Create reversing lines (swap debit/credit)
    const reversalLines = entry.lines.map((line: any) => ({
      journal_entry_id: reversalEntry.id,
      account_id: line.account_id,
      cost_center_id: line.cost_center_id,
      debit: line.credit || 0, // Swap debit/credit
      credit: line.debit || 0,
      description: `Reversal: ${line.description}`,
      line_type: 'REVERSAL',
    }));

    await JournalEntryLine.bulkCreate(reversalLines);

    // Update original entry status
    await entry.update({
      status: 'REVERSED',
      reversed_at: new Date(),
      reversed_by: staffId,
    });

    return reversalEntry;
  }

  /**
   * Approve a journal entry
   */
  static async approveJournalEntry(id: number, staffId: number, approvalNotes?: string) {
    const entry = await JournalEntry.findByPk(id);
    if (!entry) {
      throw new BadException(
        'Journal Entry Not Found',
        404,
        'The requested journal entry could not be found'
      );
    }

    if (entry.status !== 'PENDING_APPROVAL') {
      throw new BadException(
        'Entry Not Pending Approval',
        400,
        'Only pending entries can be approved'
      );
    }

    // Check if approver has permission (basic check)
    // In production, implement proper role-based permissions
    const approver = await Staff.findByPk(staffId);
    if (!approver) {
      throw new BadException('Approver Not Found', 404, 'Approver staff member not found');
    }

    return await entry.update({
      status: 'APPROVED',
      approved_at: new Date(),
      approved_by: staffId,
      approval_notes: approvalNotes,
    });
  }

  /**
   * Reject a journal entry
   */
  static async rejectJournalEntry(id: number, staffId: number, rejectionReason: string) {
    const entry = await JournalEntry.findByPk(id);
    if (!entry) {
      throw new BadException(
        'Journal Entry Not Found',
        404,
        'The requested journal entry could not be found'
      );
    }

    if (entry.status !== 'PENDING_APPROVAL') {
      throw new BadException(
        'Entry Not Pending Approval',
        400,
        'Only pending entries can be rejected'
      );
    }

    return await entry.update({
      status: 'REJECTED',
      rejected_at: new Date(),
      rejected_by: staffId,
      rejection_reason: rejectionReason,
    });
  }

  /**
   * Post a journal entry (move from approved to posted)
   */
  static async postJournalEntry(id: number, staffId: number) {
    const entry = await JournalEntry.findByPk(id, {
      include: [
        {
          model: JournalEntryLine,
          as: 'lines',
        },
      ],
    });

    if (!entry) {
      throw new BadException(
        'Journal Entry Not Found',
        404,
        'The requested journal entry could not be found'
      );
    }

    if (entry.status !== 'APPROVED') {
      throw new BadException('Entry Not Approved', 400, 'Only approved entries can be posted');
    }

    // Validate double-entry bookkeeping
    const totalDebits = entry.lines.reduce((sum: number, line: any) => sum + (line.debit || 0), 0);
    const totalCredits = entry.lines.reduce(
      (sum: number, line: any) => sum + (line.credit || 0),
      0
    );

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new BadException('Unbalanced Entry', 400, 'Debits and credits must be equal');
    }

    // Update account balances
    await this.updateAccountBalances(entry.lines, 'POST');

    return await entry.update({
      status: 'POSTED',
      posted_at: new Date(),
      posted_by: staffId,
    });
  }

  /**
   * Unpost a journal entry (reverse the posting)
   */
  static async unpostJournalEntry(id: number, staffId: number, unpostReason: string) {
    const entry = await JournalEntry.findByPk(id, {
      include: [
        {
          model: JournalEntryLine,
          as: 'lines',
        },
      ],
    });

    if (!entry) {
      throw new BadException(
        'Journal Entry Not Found',
        404,
        'The requested journal entry could not be found'
      );
    }

    if (entry.status !== 'POSTED') {
      throw new BadException('Entry Not Posted', 400, 'Only posted entries can be unposted');
    }

    // Reverse account balance updates
    await this.updateAccountBalances(entry.lines, 'UNPOST');

    return await entry.update({
      status: 'APPROVED',
      unposted_at: new Date(),
      unposted_by: staffId,
      unpost_reason: unpostReason,
    });
  }

  /**
   * Get journal entry audit trail
   */
  static async getJournalEntryAuditTrail(id: number) {
    const entry = await JournalEntry.findByPk(id, {
      include: [
        {
          model: Staff,
          as: 'createdByStaff',
          attributes: ['id', 'firstname', 'lastname'],
        },
        {
          model: Staff,
          as: 'approvedByStaff',
          attributes: ['id', 'firstname', 'lastname'],
        },
        {
          model: Staff,
          as: 'postedByStaff',
          attributes: ['id', 'firstname', 'lastname'],
        },
        {
          model: Staff,
          as: 'reversedByStaff',
          attributes: ['id', 'firstname', 'lastname'],
        },
      ],
    });

    if (!entry) {
      throw new BadException(
        'Journal Entry Not Found',
        404,
        'The requested journal entry could not be found'
      );
    }

    // Build audit trail
    const auditTrail = [];

    if (entry.createdAt) {
      auditTrail.push({
        action: 'CREATED',
        timestamp: entry.createdAt,
        staff: entry.createdByStaff
          ? `${entry.createdByStaff.firstname} ${entry.createdByStaff.lastname}`
          : 'Unknown',
        details: 'Journal entry created',
      });
    }

    if (entry.approved_at) {
      auditTrail.push({
        action: 'APPROVED',
        timestamp: entry.approved_at,
        staff: entry.approvedByStaff
          ? `${entry.approvedByStaff.firstname} ${entry.approvedByStaff.lastname}`
          : 'Unknown',
        details: entry.approval_notes || 'Entry approved',
      });
    }

    if (entry.posted_at) {
      auditTrail.push({
        action: 'POSTED',
        timestamp: entry.posted_at,
        staff: entry.postedByStaff
          ? `${entry.postedByStaff.firstname} ${entry.postedByStaff.lastname}`
          : 'Unknown',
        details: 'Entry posted to general ledger',
      });
    }

    if (entry.reversed_at) {
      auditTrail.push({
        action: 'REVERSED',
        timestamp: entry.reversed_at,
        staff: entry.reversedByStaff
          ? `${entry.reversedByStaff.firstname} ${entry.reversedByStaff.lastname}`
          : 'Unknown',
        details: entry.reversal_reason || 'Entry reversed',
      });
    }

    return {
      entry_id: entry.id,
      reference: entry.reference,
      audit_trail: auditTrail.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    };
  }

  /**
   * Update account balances when posting/unposting journal entries
   */
  private static async updateAccountBalances(
    lines: any[],
    operation: 'POST' | 'UNPOST',
    transaction?: Transaction
  ) {
    const multiplier = operation === 'POST' ? 1 : -1;

    for (const line of lines) {
      const account = await ChartOfAccount.findByPk(line.account_id);
      if (!account) continue;

      const currentBalance = parseFloat(account.balance?.toString() || '0');
      let newBalance: number;

      if (account.type === 'ASSET' || account.type === 'EXPENSE') {
        // Assets and expenses increase with debits
        newBalance = currentBalance + line.debit * multiplier - line.credit * multiplier;
      } else {
        // Liabilities, equity, and income increase with credits
        newBalance = currentBalance + line.credit * multiplier - line.debit * multiplier;
      }

      await account.update({ balance: newBalance }, { transaction });
    }
  }

  /**
   * Get journal entries requiring approval
   */
  static async getPendingApprovalEntries(filters: any = {}) {
    const { page = 1, limit = 20, created_by, entry_type } = filters;

    const where: any = { status: 'PENDING_APPROVAL' };
    if (created_by) where.created_by = created_by;
    if (entry_type) where.entry_type = entry_type;

    const { count, rows } = await JournalEntry.findAndCountAll({
      where,
      include: [
        {
          model: Staff,
          as: 'createdByStaff',
          attributes: ['id', 'firstname', 'lastname'],
        },
        {
          model: JournalEntryLine,
          as: 'lines',
          include: [
            {
              model: ChartOfAccount,
              as: 'account',
              attributes: ['id', 'code', 'name', 'type'],
            },
          ],
        },
      ],
      order: [['created_at', 'ASC']],
      limit,
      offset: (page - 1) * limit,
    });

    return {
      entries: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get journal entry statistics for dashboard
   */
  static async getJournalEntryStatistics() {
    const [
      totalEntries,
      pendingApproval,
      approved,
      posted,
      reversed,
      totalAmount,
    ] = await Promise.all([
      JournalEntry.count(),
      JournalEntry.count({ where: { status: 'PENDING_APPROVAL' } }),
      JournalEntry.count({ where: { status: 'APPROVED' } }),
      JournalEntry.count({ where: { status: 'POSTED' } }),
      JournalEntry.count({ where: { status: 'REVERSED' } }),
      JournalEntryLine.sum('debit'),
    ]);

    return {
      total_entries: totalEntries,
      pending_approval: pendingApproval,
      approved: approved,
      posted: posted,
      reversed: reversed,
      total_amount: totalAmount || 0,
      approval_rate: totalEntries > 0 ? Math.round((approved / totalEntries) * 100) : 0,
    };
  }

  // ===== PHASE 3 COMPLETION: TRANSACTION ROLLBACK & RECOVERY =====

  /**
   * Execute database operations with automatic rollback on failure
   */
  static async executeWithTransaction<T>(
    operation: (transaction: Transaction) => Promise<T>,
    rollbackHandler?: (error: Error, transaction: Transaction) => Promise<void>
  ): Promise<T> {
    // Get sequelize instance from models
    const transaction = await sequelizeConnection.transaction();

    try {
      const result = await operation(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();

      if (rollbackHandler) {
        await rollbackHandler(error, transaction);
      }

      throw error;
    }
  }

  /**
   * Rollback a journal entry posting and restore account balances
   */
  static async rollbackJournalEntryPosting(
    entryId: number,
    staffId: number,
    rollbackReason: string
  ) {
    return await this.executeWithTransaction(async transaction => {
      const entry = await JournalEntry.findByPk(entryId, {
        include: [
          {
            model: JournalEntryLine,
            as: 'lines',
          },
        ],
        transaction,
      });

      if (!entry) {
        throw new BadException(
          'Journal Entry Not Found',
          404,
          'The requested journal entry could not be found'
        );
      }

      if (entry.status !== 'POSTED') {
        throw new BadException('Entry Not Posted', 400, 'Only posted entries can be rolled back');
      }

      // Reverse account balance updates
      await this.updateAccountBalances(entry.lines, 'UNPOST');

      // Update entry status
      await entry.update(
        {
          status: 'APPROVED',
          unposted_at: new Date(),
          unposted_by: staffId,
          unpost_reason: rollbackReason,
        },
        { transaction }
      );

      // Create rollback audit entry
      await this.createAuditLog({
        action: 'ROLLBACK_POSTING',
        entity_type: 'JOURNAL_ENTRY',
        entity_id: entryId,
        staff_id: staffId,
        details: rollbackReason,
        transaction,
      });

      return entry;
    });
  }

  /**
   * Create comprehensive audit log entry
   */
  private static async createAuditLog(auditData: {
    action: string;
    entity_type: string;
    entity_id: number;
    staff_id: number;
    details: string;
    transaction?: Transaction;
  }) {
    // In a production system, this would write to an audit log table
    // For now, we'll log to console
    console.log(
      `🔍 AUDIT: ${auditData.action} on ${auditData.entity_type} ${auditData.entity_id} by staff ${auditData.staff_id} - ${auditData.details}`
    );
  }

  /**
   * Get transaction recovery information
   */
  static async getTransactionRecoveryInfo(entryId: number) {
    const entry = await JournalEntry.findByPk(entryId, {
      include: [
        {
          model: JournalEntryLine,
          as: 'lines',
          include: [
            {
              model: ChartOfAccount,
              as: 'account',
              attributes: ['id', 'code', 'name', 'type', 'balance'],
            },
          ],
        },
      ],
    });

    if (!entry) {
      throw new BadException(
        'Journal Entry Not Found',
        404,
        'The requested journal entry could not be found'
      );
    }

    // Calculate impact on account balances
    const balanceImpact = entry.lines.map((line: any) => ({
      account_id: line.account_id,
      account_code: line.account?.code,
      account_name: line.account?.name,
      account_type: line.account?.type,
      current_balance: line.account?.balance || 0,
      debit_impact: line.debit || 0,
      credit_impact: line.credit || 0,
      net_impact: (line.debit || 0) - (line.credit || 0),
    }));

    return {
      entry_id: entry.id,
      reference: entry.reference,
      status: entry.status,
      transaction_date: entry.transaction_date,
      description: entry.description,
      balance_impact: balanceImpact,
      can_be_rolled_back: entry.status === 'POSTED',
      rollback_risks: this.assessRollbackRisks(entry),
    };
  }

  /**
   * Assess risks of rolling back a journal entry
   */
  private static assessRollbackRisks(entry: any) {
    const risks = [];

    // Check if entry is part of a closed financial period
    if (entry.period_id) {
      risks.push('Entry is in a financial period - verify period status before rollback');
    }

    // Check if entry has been reconciled
    if (entry.status === 'RECONCILED') {
      risks.push('Entry has been reconciled - rollback may affect reconciliation');
    }

    // Check if entry is referenced by other entries
    if (entry.reversed_entry_id) {
      risks.push('Entry has been reversed - rollback may create inconsistencies');
    }

    // Check if entry affects critical accounts
    const criticalAccounts = ['CASH', 'BANK', 'ACCOUNTS_RECEIVABLE', 'ACCOUNTS_PAYABLE'];
    const hasCriticalAccounts = entry.lines?.some((line: any) =>
      criticalAccounts.includes(line.account?.code)
    );

    if (hasCriticalAccounts) {
      risks.push('Entry affects critical accounts - verify impact before rollback');
    }

    return risks;
  }

  /**
   * Enhanced error handling with recovery suggestions
   */
  static async handleJournalEntryError(error: any, entryId?: number) {
    const errorInfo = {
      error_type: error.constructor.name,
      message: error.message,
      timestamp: new Date(),
      entry_id: entryId,
      recovery_suggestions: [],
    };

    if (error.message.includes('Unbalanced Entry')) {
      errorInfo.recovery_suggestions.push(
        'Check that total debits equal total credits',
        'Verify all line items have correct debit/credit values',
        'Ensure no negative amounts in debit/credit fields'
      );
    } else if (error.message.includes('Account Not Found')) {
      errorInfo.recovery_suggestions.push(
        'Verify account IDs exist in chart of accounts',
        'Check account status (active/inactive)',
        'Ensure proper account relationships'
      );
    } else if (error.message.includes('Insufficient Balance')) {
      errorInfo.recovery_suggestions.push(
        'Verify account has sufficient balance',
        'Check if account is properly funded',
        'Consider adjusting entry amounts'
      );
    } else {
      errorInfo.recovery_suggestions.push(
        'Review error details and system logs',
        'Check database constraints and relationships',
        'Verify all required fields are provided'
      );
    }

    // Log error for analysis
    console.error('🚨 Journal Entry Error:', errorInfo);

    return errorInfo;
  }

  // Cost Centers
  static async getCostCenters(filters: CostCenterFilters = {}) {
    const { search, department_id, cost_center_type, is_active, page = 1, limit = 10 } = filters;

    const where: WhereOptions<CostCenter> = {};
    const include: Includeable[] = [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'name'],
      },
    ];

    if (search) {
      (where as any)[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { service_line: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
      ];
    }

    if (department_id) {
      where.department_id = department_id;
    }

    if (cost_center_type) {
      where.cost_center_type = cost_center_type;
    }

    if (typeof is_active === 'boolean') {
      where.is_active = is_active;
    }

    const result = await CostCenter.findAndCountAll({
      where,
      include,
      order: [['code', 'ASC']],
      limit,
      offset: (page - 1) * limit,
    });

    // Apply pagination helper
    const paginatedResult = paginate(result, page, limit);

    // Calculate expenses from journal entries for each cost center
    const costCentersWithExpenses = await Promise.all(
      paginatedResult.docs.map(async (center: any) => {
        const expenses = await JournalEntryLine.sum('debit', {
          where: { cost_center_id: center.id },
        });
        return {
          ...center.toJSON(),
          expenses: expenses || 0,
          variance: (center.budget || 0) - (expenses || 0),
        };
      })
    );

    // Calculate summary
    const totalBudget = costCentersWithExpenses.reduce(
      (sum: number, center: any) => sum + (parseFloat(center.budget) || 0),
      0
    );
    const totalExpenses = costCentersWithExpenses.reduce(
      (sum: number, center: any) => sum + (center.expenses || 0),
      0
    );

    const summary = {
      totalCostCenters: paginatedResult.total,
      totalBudget,
      totalExpenses,
      budgetUtilization: totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0,
    };

    return {
      ...paginatedResult,
      docs: costCentersWithExpenses,
      summary,
    };
  }

  static async getCostCenterById(id: number) {
    return await CostCenter.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
      ],
    });
  }

  static async createCostCenter(data: any) {
    return await CostCenter.create(data);
  }

  static async updateCostCenter(id: number, data: any) {
    const center = await CostCenter.findByPk(id);
    if (!center) {
      throw new Error('Cost center not found');
    }
    return await center.update(data);
  }

  static async deleteCostCenter(id: number) {
    const center = await CostCenter.findByPk(id);
    if (!center) {
      throw new Error('Cost center not found');
    }

    // Check if cost center is used in journal entries
    const usage = await JournalEntryLine.count({ where: { cost_center_id: id } });
    if (usage > 0) {
      throw new Error('Cannot delete cost center used in journal entries');
    }

    return await center.destroy();
  }

  // Financial Periods
  static async getFinancialPeriods(filters: FinancialPeriodFilters = {}) {
    const { search, period_type, status, page = 1, limit = 10 } = filters;

    const where: WhereOptions<FinancialPeriod> = {};
    const include: Includeable[] = [
      {
        model: Staff,
        as: 'createdByStaff',
        attributes: staffAttributes,
        required: false,
      },
    ];

    if (search) {
      (where as any)[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } }, // Changed from 'description' to 'notes' to match model
      ];
    }

    if (period_type) {
      where.period_type = period_type;
    }

    if (status) {
      where.status = status;
    }

    const result = await FinancialPeriod.findAndCountAll({
      where,
      include,
      order: [['start_date', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    // Apply pagination helper
    const paginatedResult = paginate(result, page, limit);

    // Calculate summary
    const summary = {
      totalPeriods: paginatedResult.total,
      openPeriods: paginatedResult.docs.filter((period: any) => period.status === 'OPEN').length,
      closedPeriods: paginatedResult.docs.filter((period: any) => period.status === 'CLOSED')
        .length,
      draftPeriods: paginatedResult.docs.filter((period: any) => period.status === 'DRAFT').length,
      suspendedPeriods: paginatedResult.docs.filter((period: any) => period.status === 'SUSPENDED')
        .length,
      currentPeriod: paginatedResult.docs.find((period: any) => period.is_current),
    };

    return { ...paginatedResult, summary };
  }

  static async getFinancialPeriodById(id: number) {
    return await FinancialPeriod.findByPk(id, {
      include: [
        {
          model: Staff,
          as: 'createdByStaff',
          attributes: staffAttributes,
          required: false,
        },
      ],
    });
  }

  static async createFinancialPeriod(data: any) {
    return await FinancialPeriod.create(data);
  }

  static async updateFinancialPeriod(id: number, data: any) {
    const period = await FinancialPeriod.findByPk(id);
    if (!period) {
      throw new Error('Financial period not found');
    }
    return await period.update(data);
  }

  static async deleteFinancialPeriod(id: number) {
    const period = await FinancialPeriod.findByPk(id);
    if (!period) {
      throw new Error('Financial period not found');
    }

    if (period.status === 'OPEN' || period.status === 'CLOSED') {
      throw new Error('Cannot delete open or closed period');
    }

    return await period.destroy();
  }

  static async openFinancialPeriod(id: number, notes?: string) {
    const period = await FinancialPeriod.findByPk(id);
    if (!period) {
      throw new Error('Financial period not found');
    }

    if (period.status !== FinancialPeriodStatus.OPEN) {
      throw new Error('Only draft periods can be opened');
    }

    // Close any currently open period
    await FinancialPeriod.update({ is_current: false }, { where: { is_current: true } });

    return await period.update({
      status: FinancialPeriodStatus.OPEN,
      is_current: true,
      opening_balance: period.balance || 0,
    });
  }

  static async closeFinancialPeriod(id: number, closing_date: string, notes?: string) {
    const period = await FinancialPeriod.findByPk(id);
    if (!period) {
      throw new Error('Financial period not found');
    }

    if (period.status !== 'OPEN') {
      throw new Error('Only open periods can be closed');
    }

    // Calculate closing balance from journal entries
    const closingBalance = await this.calculatePeriodClosingBalance(period.id);

    return await period.update({
      status: 'CLOSED',
      is_current: false,
      closing_balance: closingBalance,
    });
  }

  // HMO Claims
  static async getHMOClaims(filters: HMOClaimFilters = {}) {
    const { hmo, status, dateRange, amountRange, search, page = 1, limit = 10 } = filters;

    const where: WhereOptions<HMOClaim> = {};
    const include: Includeable[] = [
      {
        model: ClinicalBill,
        as: 'clinical_bill',
        attributes: ['id', 'bill_number', 'final_amount'],
      },
      {
        model: Patient,
        as: 'patient',
        attributes: patientAttributes,
      },
      {
        model: HMO,
        as: 'hmo',
        attributes: ['id', 'name', 'code'],
      },
    ];

    if (search) {
      (where as any)[Op.or] = [
        { hmo_number: { [Op.like]: `%${search}%` } },
        { claim_number: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } },
      ];
    }

    if (hmo) {
      where.hmo_id = hmo;
    }

    if (status) {
      where.status = status;
    }

    if (dateRange) {
      // Implement date range logic
    }

    if (amountRange) {
      // Implement amount range logic
    }

    const result = await HMOClaim.findAndCountAll({
      where,
      include,
      order: [['submitted_date', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    // Apply pagination helper
    const paginatedResult = paginate(result, page, limit);

    // Calculate summary
    const summary = {
      totalClaims: paginatedResult.total,
      pendingClaims: paginatedResult.docs.filter((claim: any) => claim.status === 'PENDING').length,
      approvedClaims: paginatedResult.docs.filter((claim: any) => claim.status === 'APPROVED')
        .length,
      totalAmount: paginatedResult.docs.reduce(
        (sum: number, claim: any) => sum + (parseFloat(claim.claim_amount) || 0),
        0
      ),
    };

    return { ...paginatedResult, summary };
  }

  static async getHMOClaimById(id: number) {
    return await HMOClaim.findByPk(id, {
      include: [
        {
          model: ClinicalBill,
          as: 'clinical_bill',
          attributes: ['id', 'bill_number', 'final_amount'],
        },
        {
          model: Patient,
          as: 'patient',
          attributes: patientAttributes,
        },
        {
          model: HMO,
          as: 'hmo',
          attributes: ['id', 'name', 'code'],
        },
      ],
    });
  }

  static async createHMOClaim(data: any) {
    return await HMOClaim.create(data);
  }

  static async updateHMOClaim(id: number, data: any) {
    const claim = await HMOClaim.findByPk(id);
    if (!claim) {
      throw new Error('HMO claim not found');
    }

    if (claim.status !== HMOClaimStatus.PENDING) {
      throw new Error('Only draft claims can be updated');
    }

    return await claim.update(data);
  }

  static async deleteHMOClaim(id: number) {
    const claim = await HMOClaim.findByPk(id);
    if (!claim) {
      throw new Error('HMO claim not found');
    }

    if (claim.status !== HMOClaimStatus.PENDING) {
      throw new Error('Only draft claims can be deleted');
    }

    return await claim.destroy();
  }

  static async approveHMOClaim(id: number, notes?: string) {
    const claim = await HMOClaim.findByPk(id);
    if (!claim) {
      throw new Error('HMO claim not found');
    }

    if (claim.status !== HMOClaimStatus.PENDING) {
      throw new Error('Only pending claims can be approved');
    }

    return await claim.update({
      status: 'APPROVED',
      approved_date: new Date(),
      notes: notes ? `${claim.notes || ''}\nApproved: ${notes}`.trim() : claim.notes,
    });
  }

  static async rejectHMOClaim(id: number, reason: string) {
    const claim = await HMOClaim.findByPk(id);
    if (!claim) {
      throw new Error('HMO claim not found');
    }

    if (claim.status !== 'PENDING') {
      throw new Error('Only pending claims can be rejected');
    }

    return await claim.update({
      status: HMOClaimStatus.REJECTED,
      rejected_date: new Date(),
      rejection_reason: reason,
      notes: `${claim.notes || ''}\nRejected: ${reason}`.trim(),
    });
  }

  static async processHMOClaimPayment(id: number, amount: string, notes?: string) {
    const claim = await HMOClaim.findByPk(id);
    if (!claim) {
      throw new Error('HMO claim not found');
    }

    if (claim.status !== 'APPROVED') {
      throw new Error('Only approved claims can be processed for payment');
    }

    return await claim.update({
      status: 'PAID',
      payment_date: new Date(),
      notes: `${claim.notes || ''}\nPayment processed: ${amount}\n${notes || ''}`.trim(),
    });
  }

  // Trial Balance
  static async getTrialBalance(filters: TrialBalanceFilters = {}) {
    const {
      period_id,
      start_date,
      end_date,
      account_type,
      search,
      as_of_date,
      include_zero_balances = false,
      page = 1,
      limit = 10,
    } = filters;

    // Build where clause for accounts
    const accountWhere: WhereOptions<ChartOfAccount> = {};

    // Add account type filtering
    if (account_type) {
      accountWhere.type = account_type;
    }

    // Add search filtering
    if (search) {
      (accountWhere as any)[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter out zero balances if requested
    if (!include_zero_balances) {
      accountWhere.balance = { [Op.ne]: 0 };
    }

    // Get accounts with filtering
    const accounts = await ChartOfAccount.findAll({
      where: accountWhere,
      include: [
        {
          model: ChartOfAccount,
          as: 'parent',
          attributes: ['id', 'code', 'name'],
        },
      ],
      order: [['code', 'ASC']],
    });

    // Calculate trial balance with proper structure for frontend
    const trialBalance = await Promise.all(
      accounts.map(async (account: any) => {
        const currentBalance = account.balance || 0;

        // Calculate period movements if period_id is provided
        let periodDebits = 0;
        let periodCredits = 0;
        let openingBalance = currentBalance;

        if (period_id) {
          // Get period start and end dates
          const period = await FinancialPeriod.findByPk(period_id);
          if (period) {
            // Calculate opening balance (balance before period start)
            const openingEntries = await JournalEntryLine.findAll({
              where: {
                account_id: account.id,
              },
              include: [
                {
                  model: JournalEntry,
                  as: 'journal_entry',
                  attributes: ['transaction_date', 'status'],
                  where: {
                    transaction_date: { [Op.lt]: period.start_date },
                    status: 'POSTED',
                  },
                },
              ],
              attributes: [[Sequelize.fn('SUM', Sequelize.col('debit')), 'total_debit']],
              raw: true,
            });

            const openingCredits = await JournalEntryLine.findAll({
              where: {
                account_id: account.id,
              },
              include: [
                {
                  model: JournalEntry,
                  as: 'journal_entry',
                  attributes: ['transaction_date', 'status'],
                  where: {
                    transaction_date: { [Op.lt]: period.start_date },
                    status: 'POSTED',
                  },
                },
              ],
              attributes: [[Sequelize.fn('SUM', Sequelize.col('credit')), 'total_credit']],
              raw: true,
            });

            // Calculate period movements
            const periodDebitSum = await JournalEntryLine.findAll({
              where: {
                account_id: account.id,
              },
              include: [
                {
                  model: JournalEntry,
                  as: 'journal_entry',
                  attributes: ['transaction_date', 'status'],
                  where: {
                    transaction_date: { [Op.between]: [period.start_date, period.end_date] },
                    status: 'POSTED',
                  },
                },
              ],
              attributes: [[Sequelize.fn('SUM', Sequelize.col('debit')), 'total_debit']],
              raw: true,
            });

            const periodCreditSum = await JournalEntryLine.findAll({
              where: {
                account_id: account.id,
              },
              include: [
                {
                  model: JournalEntry,
                  as: 'journal_entry',
                  attributes: ['transaction_date', 'status'],
                  where: {
                    transaction_date: { [Op.between]: [period.start_date, period.end_date] },
                    status: 'POSTED',
                  },
                },
              ],
              attributes: [[Sequelize.fn('SUM', Sequelize.col('credit')), 'total_credit']],
              raw: true,
            });

            periodDebits = parseFloat((periodDebitSum[0] as any)?.total_debit || '0');
            periodCredits = parseFloat((periodCreditSum[0] as any)?.total_credit || '0');

            // Calculate opening balance based on account type
            const openingDebitTotal = parseFloat((openingEntries[0] as any)?.total_debit || '0');
            const openingCreditTotal = parseFloat((openingCredits[0] as any)?.total_credit || '0');

            if (account.type === 'ASSET' || account.type === 'EXPENSE') {
              openingBalance = openingDebitTotal - openingCreditTotal;
            } else {
              openingBalance = openingCreditTotal - openingDebitTotal;
            }
          }
        } else if (start_date && end_date) {
          // Use date range if no period_id
          const startDate = new Date(start_date);
          const endDate = new Date(end_date);

          // Calculate opening balance (balance before start_date)
          const openingEntries = await JournalEntryLine.findAll({
            where: {
              account_id: account.id,
            },
            include: [
              {
                model: JournalEntry,
                as: 'journal_entry',
                attributes: ['transaction_date', 'status'],
                where: {
                  transaction_date: { [Op.lt]: startDate },
                  status: 'POSTED',
                },
              },
            ],
            attributes: [[Sequelize.fn('SUM', Sequelize.col('debit')), 'total_debit']],
            raw: true,
          });

          const openingCredits = await JournalEntryLine.findAll({
            where: {
              account_id: account.id,
            },
            include: [
              {
                model: JournalEntry,
                as: 'journal_entry',
                attributes: ['transaction_date', 'status'],
                where: {
                  transaction_date: { [Op.lt]: startDate },
                  status: 'POSTED',
                },
              },
            ],
            attributes: [[Sequelize.fn('SUM', Sequelize.col('credit')), 'total_credit']],
            raw: true,
          });

          // Calculate period movements
          const periodDebitSum = await JournalEntryLine.findAll({
            where: {
              account_id: account.id,
            },
            include: [
              {
                model: JournalEntry,
                as: 'journal_entry',
                attributes: ['transaction_date', 'status'],
                where: {
                  transaction_date: { [Op.between]: [startDate, endDate] },
                  status: 'POSTED',
                },
              },
            ],
            attributes: [[Sequelize.fn('SUM', Sequelize.col('debit')), 'total_debit']],
            raw: true,
          });

          const periodCreditSum = await JournalEntryLine.findAll({
            where: {
              account_id: account.id,
            },
            include: [
              {
                model: JournalEntry,
                as: 'journal_entry',
                attributes: ['transaction_date', 'status'],
                where: {
                  transaction_date: { [Op.between]: [startDate, endDate] },
                  status: 'POSTED',
                },
              },
            ],
            attributes: [[Sequelize.fn('SUM', Sequelize.col('credit')), 'total_credit']],
            raw: true,
          });

          periodDebits = parseFloat((periodDebitSum[0] as any)?.total_debit || '0');
          periodCredits = parseFloat((periodCreditSum[0] as any)?.total_credit || '0');

          // Calculate opening balance based on account type
          const openingDebitTotal = parseFloat((openingEntries[0] as any)?.total_debit || '0');
          const openingCreditTotal = parseFloat((openingCredits[0] as any)?.total_credit || '0');

          if (account.type === 'ASSET' || account.type === 'EXPENSE') {
            openingBalance = openingDebitTotal - openingCreditTotal;
          } else {
            openingBalance = openingCreditTotal - openingDebitTotal;
          }
        } else {
          // No period or date range - use current balance as both opening and closing
          if (account.type === 'ASSET' || account.type === 'EXPENSE') {
            periodDebits = currentBalance > 0 ? currentBalance : 0;
            periodCredits = 0;
          } else {
            periodDebits = 0;
            periodCredits = currentBalance > 0 ? currentBalance : 0;
          }
        }

        // Calculate closing balance
        let closingBalance = openingBalance;
        if (account.type === 'ASSET' || account.type === 'EXPENSE') {
          closingBalance = openingBalance + periodDebits - periodCredits;
        } else {
          closingBalance = openingBalance + periodCredits - periodDebits;
        }

        return {
          id: account.id,
          code: account.code,
          name: account.name,
          type: account.type,
          status: account.is_active ? 'ACTIVE' : 'INACTIVE',
          opening_balance: openingBalance,
          debits: periodDebits,
          credits: periodCredits,
          closing_balance: closingBalance,
          parent_code: account.parent?.code || null,
          parent_name: account.parent?.name || null,
        };
      })
    );

    // Calculate summary using the new field names
    const totalDebits = trialBalance.reduce((sum, account) => sum + (account.debits || 0), 0);
    const totalCredits = trialBalance.reduce((sum, account) => sum + (account.credits || 0), 0);
    const totalOpeningBalance = trialBalance.reduce(
      (sum, account) => sum + (account.opening_balance || 0),
      0
    );
    const totalClosingBalance = trialBalance.reduce(
      (sum, account) => sum + (account.closing_balance || 0),
      0
    );
    const difference = Math.abs(totalDebits - totalCredits);

    const summary = {
      totalDebits,
      totalCredits,
      totalOpeningBalance,
      totalClosingBalance,
      balancedAccounts: difference < 0.01 ? trialBalance.length : 0,
      difference,
      periodInfo: period_id
        ? { period_id }
        : start_date && end_date
        ? { start_date, end_date }
        : null,
    };

    return {
      data: trialBalance,
      summary,
      total: trialBalance.length,
      pages: Math.ceil(trialBalance.length / limit),
    };
  }

  // Trial Balance Chart Data
  static async getTrialBalanceChartData(filters: TrialBalanceFilters = {}) {
    const {
      period_id,
      start_date,
      end_date,
      account_type,
      search,
      include_zero_balances = false,
    } = filters;

    // Get trial balance data first
    const trialBalanceResult = await this.getTrialBalance(filters);
    const trialBalance = trialBalanceResult.data;

    // Prepare chart data
    const chartData = {
      accountTypeDistribution: this.getAccountTypeDistribution(trialBalance),
      balanceTrend: this.getBalanceTrend(trialBalance),
      topAccounts: this.getTopAccounts(trialBalance),
      balanceSheetPreview: this.getBalanceSheetPreviewData(trialBalance),
      periodComparison: await this.getPeriodComparison(filters),
    };

    return chartData;
  }

  // Helper methods for chart data
  private static getAccountTypeDistribution(trialBalance: any[]) {
    const distribution = {};

    trialBalance.forEach(account => {
      if (!distribution[account.type]) {
        distribution[account.type] = {
          count: 0,
          totalOpeningBalance: 0,
          totalClosingBalance: 0,
          totalDebits: 0,
          totalCredits: 0,
        };
      }

      distribution[account.type].count++;
      distribution[account.type].totalOpeningBalance += account.opening_balance || 0;
      distribution[account.type].totalClosingBalance += account.closing_balance || 0;
      distribution[account.type].totalDebits += account.debits || 0;
      distribution[account.type].totalCredits += account.credits || 0;
    });

    return Object.entries(distribution).map(([type, data]: [string, any]) => ({
      type,
      ...data,
    }));
  }

  private static getBalanceTrend(trialBalance: any[]) {
    // Group by account type and calculate trends
    const trends = {};

    trialBalance.forEach(account => {
      if (!trends[account.type]) {
        trends[account.type] = {
          openingTotal: 0,
          closingTotal: 0,
          movement: 0,
        };
      }

      trends[account.type].openingTotal += account.opening_balance || 0;
      trends[account.type].closingTotal += account.closing_balance || 0;
      trends[account.type].movement += (account.debits || 0) - (account.credits || 0);
    });

    return Object.entries(trends).map(([type, data]: [string, any]) => ({
      type,
      ...data,
      change: data.closingTotal - data.openingTotal,
    }));
  }

  private static getTopAccounts(trialBalance: any[]) {
    // Get top accounts by closing balance (absolute value)
    return trialBalance
      .map(account => ({
        ...account,
        absoluteBalance: Math.abs(account.closing_balance || 0),
      }))
      .sort((a, b) => b.absoluteBalance - a.absoluteBalance)
      .slice(0, 10);
  }

  private static getBalanceSheetPreviewData(trialBalance: any[]) {
    const preview = {
      assets: { opening: 0, closing: 0, movement: 0 },
      liabilities: { opening: 0, closing: 0, movement: 0 },
      equity: { opening: 0, closing: 0, movement: 0 },
      income: { opening: 0, closing: 0, movement: 0 },
      expenses: { opening: 0, closing: 0, movement: 0 },
    };

    trialBalance.forEach(account => {
      const category = account.type.toLowerCase();
      if (preview[category]) {
        preview[category].opening += account.opening_balance || 0;
        preview[category].closing += account.closing_balance || 0;
        preview[category].movement += (account.debits || 0) - (account.credits || 0);
      }
    });

    return preview;
  }

  private static async getPeriodComparison(filters: TrialBalanceFilters) {
    // For now, return basic period info
    // This can be enhanced to compare with previous periods
    return {
      currentPeriod: filters.period_id || 'Custom Date Range',
      startDate: filters.start_date,
      endDate: filters.end_date,
      hasComparison: false,
    };
  }

  // Helper methods
  private static async calculatePeriodClosingBalance(periodId: number): Promise<number> {
    // This would calculate the closing balance based on journal entries in the period
    // For now, return 0
    return 0;
  }

  // ===== EXISTING METHODS (keep all existing methods) =====
  // Patient Deposits
  static async createPatientDeposit(depositData: PatientDepositData): Promise<PatientDeposit> {
    return await PatientDeposit.create(depositData as any);
  }

  static async getPatientDepositById(id: number): Promise<PatientDeposit | null> {
    return await PatientDeposit.findByPk(id, {
      include: [
        { model: Patient, as: 'patient', attributes: patientAttributes },
        { model: Staff, as: 'createdByStaff', attributes: staffAttributes },
        { model: Staff, as: 'updatedByStaff', attributes: staffAttributes },
      ],
    });
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
    const where: any = {};
    const { page = 1, limit = 20 } = filters;

    if (filters.patient_id) where.patient_id = filters.patient_id;
    if (filters.deposit_type) where.deposit_type = filters.deposit_type;
    if (filters.status) where.status = filters.status;
    if (filters.min_amount) where.amount = { [Op.gte]: filters.min_amount };
    if (filters.max_amount) where.amount = { ...where.amount, [Op.lte]: filters.max_amount };
    if (filters.start_date) where.createdAt = { [Op.gte]: filters.start_date };
    if (filters.end_date) where.createdAt = { ...where.createdAt, [Op.lte]: filters.end_date };

    // Handle patient search by name or ID
    if (filters.patient_search) {
      // For patient search, we need to use a different approach
      // We'll search for patients first, then filter deposits by patient IDs
      const patientSearchTerm = `%${filters.patient_search}%`;
      const matchingPatients = await Patient.findAll({
        where: {
          [Op.or]: [
            { hospital_id: { [Op.like]: patientSearchTerm } },
            { firstname: { [Op.like]: patientSearchTerm } },
            { lastname: { [Op.like]: patientSearchTerm } },
          ],
        },
        attributes: ['id'],
      });

      if (matchingPatients.length > 0) {
        const patientIds = matchingPatients.map(p => p.id);
        where.patient_id = { [Op.in]: patientIds };
      } else {
        // If no patients found, return empty result
        where.patient_id = -1; // This will ensure no results
      }
    }

    return PatientDeposit.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient', attributes: patientAttributes },
        { model: Staff, as: 'createdByStaff', attributes: staffAttributes },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    }).then(result => paginate(result, page, limit));
  }

  static async updatePatientDeposit(
    id: number,
    updateData: Partial<PatientDepositData>
  ): Promise<PatientDeposit | null> {
    const deposit = await PatientDeposit.findByPk(id);
    if (!deposit) return null;

    return await deposit.update(updateData);
  }

  static async getPatientDepositSummary(patientId?: number): Promise<DepositSummary> {
    const where: any = {};
    if (patientId) where.patient_id = patientId;

    const [totalDeposits, activeDeposits, usedDeposits, expiredDeposits] = await Promise.all([
      PatientDeposit.sum('amount', { where }),
      PatientDeposit.sum('amount', { where: { ...where, status: 'ACTIVE' } }),
      PatientDeposit.sum('amount', { where: { ...where, status: 'USED' } }),
      PatientDeposit.sum('amount', { where: { ...where, status: 'EXPIRED' } }),
    ]);

    const [totalCount, activeCount, usedCount, expiredCount] = await Promise.all([
      PatientDeposit.count({ where }),
      PatientDeposit.count({ where: { ...where, status: 'ACTIVE' } }),
      PatientDeposit.count({ where: { ...where, status: 'USED' } }),
      PatientDeposit.count({ where: { ...where, status: 'EXPIRED' } }),
    ]);

    return {
      total_deposits: totalCount,
      total_amount: totalDeposits || 0,
      active_deposits: activeCount,
      active_amount: activeDeposits || 0,
      used_deposits: usedCount,
      used_amount: usedDeposits || 0,
    };
  }

  /**
   * Get patient deposit by patient ID
   */
  static async getPatientDepositByPatientId(patientId: number): Promise<PatientDeposit | null> {
    return await PatientDeposit.findOne({
      where: {
        patient_id: patientId,
        status: DepositStatus.ACTIVE, // Only get active deposits
      },
      include: [
        { model: Patient, as: 'patient', attributes: patientAttributes },
        { model: Staff, as: 'createdByStaff', attributes: staffAttributes },
      ],
      order: [['createdAt', 'DESC']], // Get most recent deposit first
    });
  }

  /**
   * Get patient deposit balance (total active amount)
   */
  static async getPatientDepositBalance(patientId: number): Promise<number> {
    const result = await PatientDeposit.sum('amount', {
      where: {
        patient_id: patientId,
        status: 'ACTIVE',
      },
    });

    return result || 0;
  }

  /**
   * Get patient deposit history with detailed information
   */
  static async getPatientDepositHistory(patientId: number): Promise<PatientDeposit[]> {
    return await PatientDeposit.findAll({
      where: { patient_id: patientId },
      include: [
        { model: Patient, as: 'patient', attributes: patientAttributes },
        { model: Staff, as: 'createdByStaff', attributes: staffAttributes },
        { model: Staff, as: 'updatedByStaff', attributes: staffAttributes },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get patient deposit summary with balance breakdown
   */
  static async getPatientDepositBalanceSummary(
    patientId: number
  ): Promise<{
    total_deposits: number;
    total_amount: number;
    active_deposits: number;
    active_amount: number;
    used_deposits: number;
    used_amount: number;
    refunded_deposits: number;
    refunded_amount: number;
    current_balance: number;
  }> {
    const where: any = { patient_id: patientId };

    const [totalDeposits, activeDeposits, usedDeposits, refundedDeposits] = await Promise.all([
      PatientDeposit.sum('amount', { where }),
      PatientDeposit.sum('amount', { where: { ...where, status: 'ACTIVE' } }),
      PatientDeposit.sum('amount', { where: { ...where, status: 'USED' } }),
      PatientDeposit.sum('amount', { where: { ...where, status: 'REFUNDED' } }),
    ]);

    const [totalCount, activeCount, usedCount, refundedCount] = await Promise.all([
      PatientDeposit.count({ where }),
      PatientDeposit.count({ where: { ...where, status: 'ACTIVE' } }),
      PatientDeposit.count({ where: { ...where, status: 'USED' } }),
      PatientDeposit.count({ where: { ...where, status: 'REFUNDED' } }),
    ]);

    const currentBalance = (activeDeposits || 0) - (usedDeposits || 0);

    return {
      total_deposits: totalCount,
      total_amount: totalDeposits || 0,
      active_deposits: activeCount,
      active_amount: activeDeposits || 0,
      used_deposits: usedCount,
      used_amount: usedDeposits || 0,
      refunded_deposits: refundedCount,
      refunded_amount: refundedDeposits || 0,
      current_balance: currentBalance,
    };
  }

  // Clinical Bills
  static async createClinicalBill(billData: ClinicalBillData): Promise<ClinicalBill> {
    return await ClinicalBill.create(billData as any);
  }

  static async createClinicalBillItems(items: ClinicalBillItemData[]): Promise<ClinicalBillItem[]> {
    return await ClinicalBillItem.bulkCreate(items as any[]);
  }

  static async getClinicalBillById(id: number): Promise<ClinicalBill | null> {
    return await ClinicalBill.findByPk(id, {
      include: [
        { model: Patient, as: 'patient', attributes: patientAttributes },
        { model: Visit, as: 'visit', attributes: visitAttributes },
        { model: Staff, as: 'createdByStaff', attributes: staffAttributes },
        { model: Staff, as: 'updatedByStaff', attributes: staffAttributes },
      ],
    });
  }

  static async getClinicalBillWithItems(
    id: number
  ): Promise<{ bill: ClinicalBill; items: ClinicalBillItem[] } | null> {
    const bill = await ClinicalBill.findByPk(id, {
      include: [
        { model: Patient, as: 'patient', attributes: patientAttributes },
        { model: Visit, as: 'visit', attributes: visitAttributes },
        { model: Staff, as: 'createdByStaff', attributes: staffAttributes },
      ],
    });

    if (!bill) return null;

    const items = await ClinicalBillItem.findAll({
      where: { bill_id: id },
      order: [['createdAt', 'ASC']],
    });

    return { bill, items };
  }

  /**
   * 🆕 NEW: Get clinical bill items by bill ID
   */
  static async getClinicalBillItems(filters: {
    bill_id: number;
  }): Promise<{ items: ClinicalBillItem[]; total: number }> {
    const where: any = {};

    if (filters.bill_id) where.bill_id = filters.bill_id;

    const { count, rows } = await ClinicalBillItem.findAndCountAll({
      where,
      order: [['createdAt', 'ASC']],
    });

    return { items: rows, total: count };
  }

  static async getClinicalBills(
    filters: BillSearchFilters
  ): Promise<{ bills: ClinicalBill[]; total: number }> {
    const where: any = {};
    const { page = 1, limit = 20 } = filters;

    if (filters.patient_id) where.patient_id = filters.patient_id;
    if (filters.visit_id) where.visit_id = filters.visit_id;
    if (filters.billing_mode) where.billing_mode = filters.billing_mode;
    if (filters.payment_status) where.payment_status = filters.payment_status;
    if (filters.billing_status) where.billing_status = filters.billing_status;
    if (filters.min_amount) where.final_amount = { [Op.gte]: filters.min_amount };
    if (filters.max_amount)
      where.final_amount = { ...where.final_amount, [Op.lte]: filters.max_amount };
    if (filters.start_date) where.createdAt = { [Op.gte]: filters.start_date };
    if (filters.end_date) where.createdAt = { ...where.createdAt, [Op.lte]: filters.end_date };

    const { count, rows } = await ClinicalBill.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient', attributes: patientAttributes },
        { model: Visit, as: 'visit', attributes: visitAttributes },
        { model: Staff, as: 'createdByStaff', attributes: staffAttributes },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { bills: rows, total: count };
  }

  static async updateClinicalBill(
    id: number,
    updateData: Partial<ClinicalBillData>
  ): Promise<ClinicalBill | null> {
    const bill = await ClinicalBill.findByPk(id);
    if (!bill) return null;

    return await bill.update(updateData);
  }

  static async getBillingSummary(patientId?: number): Promise<BillingSummary> {
    const where: any = {};
    if (patientId) where.patient_id = patientId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalBills,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      todayBills,
      todayAmount,
    ] = await Promise.all([
      ClinicalBill.count({ where }),
      ClinicalBill.sum('final_amount', { where }),
      ClinicalBill.sum('final_amount', { where: { ...where, payment_status: 'PAID' } }),
      ClinicalBill.sum('final_amount', { where: { ...where, payment_status: 'PENDING' } }),
      ClinicalBill.sum('final_amount', {
        where: {
          ...where,
          payment_status: 'PENDING',
          due_date: { [Op.lt]: new Date() },
        },
      }),
      ClinicalBill.count({
        where: { ...where, createdAt: { [Op.gte]: today, [Op.lt]: tomorrow } },
      }),
      ClinicalBill.sum('final_amount', {
        where: { ...where, createdAt: { [Op.gte]: today, [Op.lt]: tomorrow } },
      }),
    ]);

    return {
      total_bills: totalBills,
      total_amount: totalAmount || 0,
      paid_amount: paidAmount || 0,
      pending_amount: pendingAmount || 0,
      overdue_amount: overdueAmount || 0,
      today_bills: todayBills,
      today_amount: todayAmount || 0,
    };
  }

  // Clinical Payments
  static async createClinicalPayment(paymentData: ClinicalPaymentData): Promise<ClinicalPayment> {
    return await ClinicalPayment.create(paymentData as any);
  }

  static async getClinicalPaymentById(id: number): Promise<ClinicalPayment | null> {
    return await ClinicalPayment.findByPk(id, {
      include: [
        { model: ClinicalBill, as: 'bill', attributes: ['id', 'bill_number', 'final_amount'] },
        { model: Patient, as: 'patient', attributes: patientAttributes },
        { model: Staff, as: 'processedByStaff', attributes: staffAttributes },
        { model: PatientDeposit, as: 'deposit', required: false },
        // Include specialized payment method data based on payment method
        {
          model: BankTransfer,
          as: 'bankTransfer',
          required: false,
          include: [{ model: BankAccount, as: 'bankAccount' }],
        },
        {
          model: InsuranceClaim,
          as: 'insuranceClaim',
          required: false,
        },
        {
          model: POSTerminalTransaction,
          as: 'posTerminalTransaction',
          required: false,
          include: [{ model: POSTerminal, as: 'terminal' }],
        },
        {
          model: CashTransaction,
          as: 'cashTransaction',
          required: false,
        },
      ],
    });
  }

  static async getClinicalPayments(filters: PaymentSearchFilters) {
    const where: any = {};
    const { page = 1, limit = 20 } = filters;

    if (filters.bill_id) where.bill_id = filters.bill_id;
    if (filters.patient_id) where.patient_id = filters.patient_id;
    if (filters.payment_method) where.payment_method = filters.payment_method;
    if (filters.payment_type) where.payment_type = filters.payment_type;
    if (filters.status) {
      // Validate that the status is a valid PaymentStatus enum value
      if (Object.values(PaymentStatus).includes(filters.status as PaymentStatus)) {
        where.status = filters.status;
      }
    }
    if (filters.min_amount) where.amount = { [Op.gte]: filters.min_amount };
    if (filters.max_amount) where.amount = { ...where.amount, [Op.lte]: filters.max_amount };
    if (filters.start_date) where.createdAt = { [Op.gte]: filters.start_date };
    if (filters.end_date) where.createdAt = { ...where.createdAt, [Op.lte]: filters.end_date };

    // Build includes based on payment method filters
    // Note: For association search to work, we need to include these models
    const includes: Includeable[] = [
      {
        model: ClinicalBill,
        as: 'bill',
        attributes: ['id', 'bill_number', 'final_amount'],
        required: false, // Allow LEFT JOIN for search flexibility
      },
      {
        model: Patient,
        as: 'patient',
        attributes: patientAttributes,
        required: false, // Allow LEFT JOIN for search flexibility
      },
      { model: Staff, as: 'processedByStaff', attributes: staffAttributes },
    ];

    // Handle search across multiple fields
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;

      // Use Sequelize v6+ association syntax for searching across related models
      where[Op.or] = [
        // Search in payment_reference (direct field)
        {
          payment_reference: { [Op.like]: searchTerm },
        },
        // Search in ClinicalBill (bill_number) using association syntax
        {
          '$bill.bill_number$': { [Op.like]: searchTerm },
        },
        // Search in Patient fields using association syntax
        {
          '$patient.firstname$': { [Op.like]: searchTerm },
        },
        {
          '$patient.lastname$': { [Op.like]: searchTerm },
        },
        {
          '$patient.phone$': { [Op.like]: searchTerm },
        },
        {
          '$patient.hospital_id$': { [Op.like]: searchTerm },
        },
      ];

      console.log('Search term:', searchTerm);
      console.log('Search where clause:', where);
    }

    // Add specialized payment method includes
    if (!filters.payment_method || filters.payment_method === 'BANK_TRANSFER') {
      includes.push({
        model: BankTransfer,
        as: 'bankTransfer',
        required: false,
        include: [{ model: BankAccount, as: 'bankAccount' }],
      });
    }

    if (!filters.payment_method || filters.payment_method === 'INSURANCE') {
      includes.push({
        model: InsuranceClaim,
        as: 'insuranceClaim',
        required: false,
      });
    }

    if (!filters.payment_method || filters.payment_method === 'CARD') {
      includes.push({
        model: POSTerminalTransaction,
        as: 'posTerminalTransaction',
        required: false,
        include: [{ model: POSTerminal, as: 'terminal' }],
      });
    }

    if (!filters.payment_method || filters.payment_method === 'CASH') {
      includes.push({
        model: CashTransaction,
        as: 'cashTransaction',
        required: false,
      });
    }

    // Debug: Log the final query structure
    if (filters.search) {
      console.log('=== SEARCH DEBUG INFO ===');
      console.log('Search term:', filters.search);
      console.log('Search where clause:', JSON.stringify(where, null, 2));
      console.log('Search query includes:', JSON.stringify(includes, null, 2));
      console.log('========================');
    }

    return ClinicalPayment.paginate({
      where,
      include: includes,
      order: [['createdAt', 'DESC']],
      page,
      paginate: limit,
    });
  }

  static async updateClinicalPayment(
    id: number,
    updateData: Partial<ClinicalPaymentData>
  ): Promise<ClinicalPayment | null> {
    const payment = await ClinicalPayment.findByPk(id);
    if (!payment) return null;

    return await payment.update(updateData);
  }

  static async getPaymentSummary(patientId?: number): Promise<PaymentSummary> {
    const where: any = {};
    if (patientId) where.patient_id = patientId;

    // Get basic payment summary
    const [
      totalPayments,
      totalAmount,
      cashPayments,
      cardPayments,
      bankTransfers,
      mobileMoneyPayments,
      insurancePayments,
      depositPayments,
    ] = await Promise.all([
      ClinicalPayment.count({ where }),
      ClinicalPayment.sum('amount', { where }),
      ClinicalPayment.sum('amount', { where: { ...where, payment_method: 'CASH' } }),
      ClinicalPayment.sum('amount', { where: { ...where, payment_method: 'CARD' } }),
      ClinicalPayment.sum('amount', { where: { ...where, payment_method: 'BANK_TRANSFER' } }),
      ClinicalPayment.sum('amount', { where: { ...where, payment_method: 'MOBILE_MONEY' } }),
      ClinicalPayment.sum('amount', { where: { ...where, payment_method: 'INSURANCE' } }),
      ClinicalPayment.sum('amount', { where: { ...where, payment_method: 'DEPOSIT' } }),
    ]);

    // Get detailed summaries from specialized tables
    const [bankTransferDetails, insuranceDetails, posDetails, cashDetails] = await Promise.all([
      // Bank Transfer Details
      BankTransfer.findAll({
        include: [
          {
            model: ClinicalPayment,
            as: 'payment',
            where: patientId ? { patient_id: patientId } : {},
            attributes: ['amount'],
          },
        ],
        attributes: [
          'transfer_status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
          [Sequelize.fn('SUM', Sequelize.col('payment.amount')), 'total_amount'],
          [Sequelize.fn('SUM', Sequelize.col('transfer_fee')), 'total_fees'],
        ],
        group: ['transfer_status'],
      }),

      // Insurance Details
      InsuranceClaim.findAll({
        include: [
          {
            model: ClinicalPayment,
            as: 'payment',
            where: patientId ? { patient_id: patientId } : {},
            attributes: ['amount'],
          },
        ],
        attributes: [
          'claim_status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
          [Sequelize.fn('SUM', Sequelize.col('payment.amount')), 'total_amount'],
          [Sequelize.fn('SUM', Sequelize.col('copay_amount')), 'total_copay'],
        ],
        group: ['claim_status'],
      }),

      // POS Terminal Details
      POSTerminalTransaction.findAll({
        include: [
          {
            model: ClinicalPayment,
            as: 'payment',
            where: patientId ? { patient_id: patientId } : {},
            attributes: ['amount'],
          },
        ],
        attributes: [
          'transaction_status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
          [Sequelize.fn('SUM', Sequelize.col('payment.amount')), 'total_amount'],
          [Sequelize.fn('SUM', Sequelize.col('transaction_fee')), 'total_fees'],
        ],
        group: ['transaction_status'],
      }),

      // Cash Transaction Details
      CashTransaction.findAll({
        include: [
          {
            model: ClinicalPayment,
            as: 'payment',
            where: patientId ? { patient_id: patientId } : {},
            attributes: ['amount'],
          },
        ],
        attributes: [
          'movement_type',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
          [Sequelize.fn('SUM', Sequelize.col('payment.amount')), 'total_amount'],
        ],
        group: ['movement_type'],
      }),
    ]);

    return {
      total_payments: totalPayments,
      total_amount: totalAmount || 0,
      cash_payments: cashPayments || 0,
      card_payments: cardPayments || 0,
      bank_transfers: bankTransfers || 0,
      mobile_money_payments: mobileMoneyPayments || 0,
      insurance_payments: insurancePayments || 0,
      deposit_payments: depositPayments || 0,
      // Enhanced details from specialized tables
      bank_transfer_details: bankTransferDetails.map((item: any) => ({
        transfer_status: item.transfer_status,
        count: parseInt(item.getDataValue('count') || '0'),
        total_amount: parseFloat(item.getDataValue('total_amount') || '0'),
        total_fees: parseFloat(item.getDataValue('total_fees') || '0'),
      })),
      deposit_details: {
        total_deposits: depositPayments || 0,
        total_deposit_usage: 0, // Will be calculated from deposit_usage field
      },
      insurance_details: insuranceDetails.map((item: any) => ({
        claim_status: item.claim_status,
        count: parseInt(item.getDataValue('count') || '0'),
        total_amount: parseFloat(item.getDataValue('total_amount') || '0'),
        total_copay: parseFloat(item.getDataValue('total_copay') || '0'),
      })),
      pos_details: posDetails.map((item: any) => ({
        transaction_status: item.transaction_status,
        count: parseInt(item.getDataValue('count') || '0'),
        total_amount: parseFloat(item.getDataValue('total_amount') || '0'),
        total_fees: parseFloat(item.getDataValue('total_fees') || '0'),
      })),
      cash_details: cashDetails.map((item: any) => ({
        movement_type: item.movement_type,
        count: parseInt(item.getDataValue('count') || '0'),
        total_amount: parseFloat(item.getDataValue('total_amount') || '0'),
      })),
    };
  }

  // ===== SPECIALIZED PAYMENT METHOD METHODS =====

  /**
   * Get detailed bank transfer payments
   */
  static async getBankTransferPayments(filters: any = {}) {
    const { patient_id, transfer_status, start_date, end_date, page = 1, limit = 20 } = filters;

    const where: any = {};
    if (patient_id) where.patient_id = patient_id;
    if (transfer_status) where.transfer_status = transfer_status;
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt[Op.gte] = new Date(start_date);
      if (end_date) where.createdAt[Op.lte] = new Date(end_date);
    }

    const { count, rows } = await BankTransfer.findAndCountAll({
      where,
      include: [
        {
          model: ClinicalPayment,
          as: 'payment',
          include: [
            { model: ClinicalBill, as: 'bill', attributes: ['id', 'bill_number', 'final_amount'] },
            { model: Patient, as: 'patient', attributes: patientAttributes },
            { model: Staff, as: 'processedByStaff', attributes: staffAttributes },
          ],
        },
        { model: BankAccount, as: 'bankAccount' },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { bankTransfers: rows, total: count };
  }

  /**
   * Get detailed insurance claim payments
   */
  static async getInsuranceClaimPayments(filters: any = {}) {
    const { patient_id, claim_status, start_date, end_date, page = 1, limit = 20 } = filters;

    const where: any = {};
    if (patient_id) where.patient_id = patient_id;
    if (claim_status) where.claim_status = claim_status;
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt[Op.gte] = new Date(start_date);
      if (end_date) where.createdAt[Op.lte] = new Date(end_date);
    }

    const { count, rows } = await InsuranceClaim.findAndCountAll({
      where,
      include: [
        {
          model: ClinicalPayment,
          as: 'payment',
          include: [
            { model: ClinicalBill, as: 'bill', attributes: ['id', 'bill_number', 'final_amount'] },
            { model: Patient, as: 'patient', attributes: patientAttributes },
            { model: Staff, as: 'processedByStaff', attributes: staffAttributes },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { insuranceClaims: rows, total: count };
  }

  /**
   * Get detailed POS terminal payments
   */
  static async getPOSTerminalPayments(filters: any = {}) {
    const { patient_id, transaction_status, start_date, end_date, page = 1, limit = 20 } = filters;

    const where: any = {};
    if (patient_id) where.patient_id = patient_id;
    if (transaction_status) where.transaction_status = transaction_status;
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt[Op.gte] = new Date(start_date);
      if (end_date) where.createdAt[Op.lte] = new Date(end_date);
    }

    const { count, rows } = await POSTerminalTransaction.findAndCountAll({
      where,
      include: [
        {
          model: ClinicalPayment,
          as: 'payment',
          include: [
            { model: ClinicalBill, as: 'bill', attributes: ['id', 'bill_number', 'final_amount'] },
            { model: Patient, as: 'patient', attributes: patientAttributes },
            { model: Staff, as: 'processedByStaff', attributes: staffAttributes },
          ],
        },
        { model: POSTerminal, as: 'terminal' },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { posTransactions: rows, total: count };
  }

  /**
   * Get detailed cash transaction payments
   */
  static async getCashTransactionPayments(filters: any = {}) {
    const { patient_id, movement_type, start_date, end_date, page = 1, limit = 20 } = filters;

    const where: any = {};
    if (patient_id) where.patient_id = patient_id;
    if (movement_type) where.movement_type = movement_type;
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt[Op.gte] = new Date(start_date);
      if (end_date) where.createdAt[Op.lte] = new Date(end_date);
    }

    const { count, rows } = await CashTransaction.findAndCountAll({
      where,
      include: [
        {
          model: ClinicalPayment,
          as: 'payment',
          include: [
            { model: ClinicalBill, as: 'bill', attributes: ['id', 'bill_number', 'final_amount'] },
            { model: Patient, as: 'patient', attributes: patientAttributes },
            { model: Staff, as: 'processedByStaff', attributes: staffAttributes },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { cashTransactions: rows, total: count };
  }

  // Utility Methods
  static async generateBillNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `BILL-${year}${month}${day}`;

    const lastBill = await ClinicalBill.findOne({
      where: {
        bill_number: { [Op.like]: `${prefix}-%` },
      },
      order: [['bill_number', 'DESC']],
    });

    let sequence = 1;
    if (lastBill) {
      const lastSequence = parseInt(lastBill.bill_number.split('-')[4] || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  static async generatePaymentReference(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `PAY-${year}${month}${day}`;

    const lastPayment = await ClinicalPayment.findOne({
      where: {
        payment_reference: { [Op.like]: `${prefix}-%` },
      },
      order: [['payment_reference', 'DESC']],
    });

    let sequence = 1;
    if (lastPayment) {
      const lastSequence = parseInt(lastPayment.payment_reference.split('-')[4] || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  static async generateDepositReference(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `DEP-${timestamp}-${random}`;
  }

  // ===== BILLING POINTS =====
  static async fetchBillingPoints(): Promise<any[]> {
    try {
      const { getActiveBillingPoints } = await import('./billingPoints');
      return getActiveBillingPoints();
    } catch (error) {
      throw new BadException(
        'Billing Points Fetch Error',
        500,
        `Failed to fetch billing points: ${error.message}`
      );
    }
  }

  // ===== CLINICAL BILL SEARCH =====
  static async getClinicalBillByNumber(billNumber: string): Promise<any> {
    try {
      const bill = await ClinicalBill.findOne({
        where: { bill_number: billNumber },
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id', 'firstname', 'lastname', 'hospital_id'],
          },
          { model: Visit, as: 'visit', attributes: ['id', 'department'] },
          {
            model: ClinicalBillItem,
            as: 'billItems',
            attributes: ['id', 'item_name', 'quantity', 'unit_price', 'total_price'],
          },
        ],
      });

      if (!bill) {
        throw new BadException('Bill Not Found', 404, 'Bill not found');
      }

      return bill;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException(
        'Bill Retrieval Error',
        500,
        `Failed to get bill by number: ${error.message}`
      );
    }
  }

  static async getPatientClinicalBills(patientId: number): Promise<any[]> {
    try {
      const bills = await ClinicalBill.findAll({
        where: { patient_id: patientId },
        include: [
          { model: Visit, as: 'visit', attributes: ['id', 'department'] },
          {
            model: ClinicalBillItem,
            as: 'billItems',
            attributes: ['id', 'item_name', 'quantity', 'unit_price', 'total_price'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return bills;
    } catch (error) {
      throw new BadException(
        'Patient Bills Retrieval Error',
        500,
        `Failed to get patient bills: ${error.message}`
      );
    }
  }

  // ===== FINANCIAL REPORTING METHODS =====

  /**
   * Get comprehensive financial reports data
   */
  static async getFinancialReportsData(params: {
    start_date?: string;
    end_date?: string;
    department?: string;
    chart_type?: string;
  }) {
    try {
      const { start_date, end_date, department, chart_type } = params;

      // Build date filters
      const dateFilter: WhereOptions<any> = {};
      if (start_date && end_date) {
        dateFilter.createdAt = {
          [Op.between]: [new Date(start_date), new Date(end_date)],
        };
      }

      // Get bills data
      const billsData = await ClinicalBill.findAll({
        where: dateFilter,
        include: [
          {
            model: ClinicalBillItem,
            as: 'billItems',
            attributes: ['quantity', 'unit_price', 'total_price'],
          },
          {
            model: Visit,
            as: 'visit',
            attributes: ['department'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Get payments data
      const paymentsData = await ClinicalPayment.findAll({
        where: dateFilter,
        attributes: ['amount', 'payment_method', 'processed_at'],
        order: [['processed_at', 'DESC']],
      });

      // Get deposits data
      const depositsData = await PatientDeposit.findAll({
        where: dateFilter,
        attributes: ['amount', 'deposit_type', 'createdAt'],
        order: [['createdAt', 'DESC']],
      });

      // Calculate revenue trends
      const revenueTrends = await ClinicalBill.findAll({
        where: dateFilter,
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
          [Sequelize.fn('SUM', Sequelize.col('final_amount')), 'revenue'],
        ],
        group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']],
      });

      // Calculate payment method breakdown
      const paymentMethods = await ClinicalPayment.findAll({
        where: dateFilter,
        attributes: [
          'payment_method',
          [Sequelize.fn('SUM', Sequelize.col('amount')), 'total_price'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        ],
        group: ['payment_method'],
      });

      // Calculate department revenue breakdown
      const deptRevenue = new Map<string, number>();
      billsData.forEach(bill => {
        if (bill.visit?.department) {
          const current = deptRevenue.get(bill.visit.department) || 0;
          deptRevenue.set(bill.visit.department, current + (bill.final_amount || 0));
        }
      });

      // Department breakdown is already calculated with department names
      const departmentBreakdown = Array.from(deptRevenue.entries()).map(([deptName, revenue]) => ({
        department: deptName,
        revenue: revenue,
      }));

      return {
        revenue_trends: revenueTrends,
        payment_methods: paymentMethods,
        department_breakdown: departmentBreakdown,
        total_bills: billsData.length,
        total_payments: paymentsData.length,
        total_deposits: depositsData.length,
        total_revenue: billsData.reduce((sum, bill) => sum + (bill.final_amount || 0), 0),
        total_collected: paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0),
      };
    } catch (error) {
      throw new BadException(
        'Financial Reports Error',
        500,
        `Failed to get financial reports data: ${error.message}`
      );
    }
  }

  /**
   * Get revenue trend data
   */
  private static async getRevenueTrend(start_date?: string, end_date?: string) {
    try {
      const dateFilter: WhereOptions<any> = {};
      if (start_date && end_date) {
        dateFilter.createdAt = {
          [Op.between]: [new Date(start_date), new Date(end_date)],
        };
      } else {
        // Default to last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateFilter.createdAt = {
          [Op.gte]: thirtyDaysAgo,
        };
      }

      const bills = await ClinicalBill.findAll({
        where: dateFilter,
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
          [Sequelize.fn('SUM', Sequelize.col('final_amount')), 'revenue'],
        ],
        group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']],
      });

      return bills.map((bill: any) => ({
        date: bill.getDataValue('date'),
        revenue: parseFloat(bill.getDataValue('revenue') || 0),
      }));
    } catch (error) {
      console.error('Failed to get revenue trend:', error);
      return [];
    }
  }

  /**
   * Get payment methods distribution
   */
  private static async getPaymentMethodsDistribution(paymentsData: any[]) {
    try {
      const methodCounts = new Map<string, { count: number; amount: number }>();

      paymentsData.forEach(payment => {
        const method = payment.payment_method;
        if (!methodCounts.has(method)) {
          methodCounts.set(method, { count: 0, amount: 0 });
        }
        const current = methodCounts.get(method)!;
        current.count++;
        current.amount += payment.amount || 0;
      });

      const totalAmount = Array.from(methodCounts.values()).reduce(
        (sum, method) => sum + method.amount,
        0
      );

      return Array.from(methodCounts.entries()).map(([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount,
        percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0,
      }));
    } catch (error) {
      console.error('Failed to get payment methods distribution:', error);
      return [];
    }
  }

  /**
   * Get department revenue breakdown
   */
  private static async getDepartmentRevenue(billsData: any[]) {
    try {
      const deptRevenue = new Map<string, number>();

      billsData.forEach(bill => {
        if (bill.visit?.department_id) {
          const deptId = bill.visit.department_id;
          const current = deptRevenue.get(deptId) || 0;
          deptRevenue.set(deptId, current + (bill.final_amount || 0));
        }
      });

      // Get department names
      const departmentIds = Array.from(deptRevenue.keys());
      const departments = await Department.findAll({
        where: { id: departmentIds },
        attributes: ['id', 'name'],
      });

      return departments.map(dept => ({
        department: dept.name,
        revenue: deptRevenue.get(String(dept.id)) || 0,
      }));
    } catch (error) {
      console.error('Failed to get department revenue:', error);
      return [];
    }
  }

  /**
   * Get payment status distribution
   */
  private static async getPaymentStatusDistribution(billsData: any[]) {
    try {
      const statusCounts = new Map<string, number>();

      billsData.forEach(bill => {
        const status = bill.payment_status;
        const current = statusCounts.get(status) || 0;
        statusCounts.set(status, current + 1);
      });

      return Array.from(statusCounts.entries()).map(([status, count]) => ({
        status,
        count,
      }));
    } catch (error) {
      console.error('Failed to get payment status distribution:', error);
      return [];
    }
  }

  /**
   * Get top revenue items
   */
  private static async getTopRevenueItems(billsData: any[]) {
    try {
      const itemRevenue = new Map<
        string,
        { name: string; type: string; quantity: number; revenue: number }
      >();

      billsData.forEach(bill => {
        bill.billItems?.forEach((item: any) => {
          const key = `${item.item_type}-${item.item_id}`;
          const current = itemRevenue.get(key) || {
            name: item.item_name,
            type: item.item_type,
            quantity: 0,
            revenue: 0,
          };
          current.quantity += item.quantity || 0;
          current.revenue += item.final_price || 0;
          itemRevenue.set(key, current);
        });
      });

      return Array.from(itemRevenue.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    } catch (error) {
      console.error('Failed to get top revenue items:', error);
      return [];
    }
  }

  /**
   * Get payment performance by method
   */
  private static async getPaymentPerformance(paymentsData: any[]) {
    try {
      const methodPerformance = new Map<string, { count: number; amount: number }>();

      paymentsData.forEach(payment => {
        const method = payment.payment_method;
        const current = methodPerformance.get(method) || { count: 0, amount: 0 };
        current.count++;
        current.amount += payment.amount || 0;
        methodPerformance.set(method, current);
      });

      const totalAmount = Array.from(methodPerformance.values()).reduce(
        (sum, method) => sum + method.amount,
        0
      );

      return Array.from(methodPerformance.entries()).map(([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount,
        percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0,
      }));
    } catch (error) {
      console.error('Failed to get payment performance:', error);
      return [];
    }
  }

  /**
   * Get revenue breakdown by date
   */
  private static async getRevenueBreakdown(
    billsData: any[],
    start_date?: string,
    end_date?: string
  ) {
    try {
      const breakdown = new Map<
        string,
        {
          date: string;
          department: string;
          bills: number;
          revenue: number;
          payments: number;
          pending: number;
          collectionRate: number;
        }
      >();

      billsData.forEach(bill => {
        const date = new Date(bill.createdAt).toISOString().split('T')[0];
        const deptName = bill.visit?.department?.name || 'Unknown';
        const key = `${date}-${deptName}`;

        const current = breakdown.get(key) || {
          date,
          department: deptName,
          bills: 0,
          revenue: 0,
          payments: 0,
          pending: 0,
          collectionRate: 0,
        };

        current.bills++;
        current.revenue += bill.final_amount || 0;

        if (bill.payment_status === 'PAID') {
          current.payments += bill.final_amount || 0;
        } else if (bill.payment_status === 'PENDING') {
          current.pending += bill.final_amount || 0;
        }

        breakdown.set(key, current);
      });

      // Calculate collection rates
      breakdown.forEach(item => {
        item.collectionRate =
          item.revenue > 0 ? Math.round((item.payments / item.revenue) * 100) : 0;
      });

      return Array.from(breakdown.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error('Failed to get revenue breakdown:', error);
      return [];
    }
  }

  /**
   * Get deposit usage history
   */
  static async getDepositUsageHistory(depositId: number): Promise<any> {
    try {
      // Get all payments that used this deposit
      const payments = await ClinicalPayment.findAll({
        where: {
          payment_method: 'DEPOSIT',
          payment_reference: { [Op.like]: `DEP-${depositId}%` },
        },
        include: [
          {
            model: ClinicalBill,
            as: 'bill',
            attributes: ['id', 'bill_number', 'final_amount', 'patient_id'],
            include: [
              {
                model: Patient,
                as: 'patient',
                attributes: ['id', 'firstname', 'lastname', 'hospital_id'],
              },
            ],
          },
          {
            model: Staff,
            as: 'processedByStaff',
            attributes: ['id', 'firstname', 'lastname'],
          },
        ],
        order: [['processed_at', 'DESC']],
      });

      // Get the deposit details
      const deposit = await PatientDeposit.findByPk(depositId, {
        attributes: ['id', 'reference_number', 'amount', 'deposit_type', 'createdAt'],
      });

      // Format the history
      const history = payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        payment_date: payment.processed_at,
        bill_number: payment.bill?.bill_number,
        bill_amount: payment.bill?.final_amount,
        patient_name: payment.bill?.patient
          ? `${payment.bill.patient.firstname} ${payment.bill.patient.lastname}`
          : 'Unknown',
        processed_by: payment.processedByStaff
          ? `${payment.processedByStaff.firstname} ${payment.processedByStaff.lastname}`
          : 'Unknown',
        notes: payment.notes,
        payment_reference: payment.payment_reference,
      }));

      return {
        deposit: deposit
          ? {
              id: deposit.id,
              reference_number: deposit.reference_number,
              total_amount: deposit.amount,
              deposit_type: deposit.deposit_type,
              createdAt: deposit.createdAt,
            }
          : null,
        usage_history: history,
        total_used: history.reduce((sum, item) => sum + item.amount, 0),
        remaining_balance: deposit
          ? deposit.amount - history.reduce((sum, item) => sum + item.amount, 0)
          : 0,
      };
    } catch (error) {
      throw new BadException(
        'Deposit Usage History Error',
        500,
        `Failed to get deposit usage history: ${error.message}`
      );
    }
  }

  // ===== BANK ACCOUNT METHODS =====

  /**
   * Get all bank accounts with pagination and filters
   */
  static async getBankAccounts(filters: any = {}) {
    const { search, bank_name, account_type, is_active, page = 1, limit = 20 } = filters;

    const where: WhereOptions<any> = {};
    const include: Includeable[] = [
      {
        model: Staff,
        as: 'createdByStaff',
        attributes: ['id', 'firstname', 'lastname'],
      },
      {
        model: Staff,
        as: 'updatedByStaff',
        attributes: ['id', 'firstname', 'lastname'],
      },
    ];

    if (search) {
      (where as any)[Op.or] = [
        { bank_name: { [Op.like]: `%${search}%` } },
        { account_name: { [Op.like]: `%${search}%` } },
        { account_number: { [Op.like]: `%${search}%` } },
      ];
    }

    if (bank_name) {
      where.bank_name = { [Op.like]: `%${bank_name}%` };
    }

    if (account_type) {
      where.account_type = account_type;
    }

    if (typeof is_active === 'boolean') {
      where.is_active = is_active;
    }

    // Manual pagination implementation
    const offset = (page - 1) * limit;

    const { count, rows } = await BankAccount.findAndCountAll({
      where,
      include,
      order: [
        ['bank_name', 'ASC'],
        ['account_name', 'ASC'],
      ],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      docs: rows,
      total: count,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  /**
   * Get bank account by ID
   */
  static async getBankAccountById(id: number) {
    return await BankAccount.findByPk(id, {
      include: [
        {
          model: Staff,
          as: 'createdByStaff',
          attributes: ['id', 'firstname', 'lastname'],
        },
        {
          model: Staff,
          as: 'updatedByStaff',
          attributes: ['id', 'firstname', 'lastname'],
        },
      ],
    });
  }

  /**
   * Create new bank account
   */
  static async createBankAccount(data: any, staffId: number) {
    const bankAccountData = {
      ...data,
      created_by: staffId,
    };

    return await BankAccount.create(bankAccountData);
  }

  /**
   * Update bank account
   */
  static async updateBankAccount(id: number, data: any, staffId: number) {
    const updateData = {
      ...data,
      updated_by: staffId,
    };

    const bankAccount = await BankAccount.findByPk(id);
    if (!bankAccount) {
      throw new BadException(
        'Bank Account Not Found',
        404,
        'The requested bank account could not be found'
      );
    }

    await bankAccount.update(updateData);
    return bankAccount;
  }

  /**
   * Delete bank account (soft delete by setting is_active to false)
   */
  static async deleteBankAccount(id: number, staffId: number) {
    const bankAccount = await BankAccount.findByPk(id);
    if (!bankAccount) {
      throw new BadException(
        'Bank Account Not Found',
        404,
        'The requested bank account could not be found'
      );
    }

    await bankAccount.update({
      is_active: false,
      updated_by: staffId,
    });

    return bankAccount;
  }

  /**
   * Get active bank accounts for payments
   */
  static async getActiveBankAccounts() {
    return await BankAccount.findAll({
      where: { is_active: true },
      attributes: [
        'id',
        'bank_name',
        'account_number',
        'account_name',
        'account_type',
        'current_balance',
      ],
      order: [
        ['bank_name', 'ASC'],
        ['account_name', 'ASC'],
      ],
    });
  }

  /**
   * Update bank account balance
   */
  static async updateBankAccountBalance(
    id: number,
    amount: number,
    operation: 'add' | 'subtract',
    transaction?: Transaction
  ) {
    const bankAccount = await BankAccount.findByPk(id);
    if (!bankAccount) {
      throw new BadException(
        'Bank Account Not Found',
        404,
        'The requested bank account could not be found'
      );
    }

    const currentBalance = parseFloat(bankAccount.current_balance.toString());
    let newBalance: number;

    if (operation === 'add') {
      newBalance = currentBalance + amount;
    } else {
      newBalance = currentBalance - amount;
      if (newBalance < 0) {
        throw new BadException(
          'Insufficient Bank Balance',
          400,
          'Insufficient balance in bank account'
        );
      }
    }

    if (transaction) {
      await bankAccount.update(
        {
          current_balance: newBalance,
        },
        { transaction }
      );
    } else {
      await bankAccount.update({
        current_balance: newBalance,
      });
    }

    return bankAccount;
  }

  static async toggleBankAccountStatus(id: number, staffId: number) {
    const bankAccount = await BankAccount.findByPk(id);
    if (!bankAccount) {
      return null;
    }

    // Toggle the is_active status
    const newStatus = !bankAccount.is_active;

    await bankAccount.update({
      is_active: newStatus,
      updated_by: staffId,
    });

    return bankAccount;
  }

  // ===== POS TERMINAL METHODS =====

  /**
   * Get all POS terminals with pagination and filters
   */
  static async getPOSTerminals(filters: any = {}) {
    const {
      search,
      terminal_id,
      bank_account_id,
      location,
      terminal_type,
      is_active,
      page = 1,
      limit = 20,
    } = filters;

    const where: WhereOptions<any> = {};
    const include: Includeable[] = [
      {
        model: BankAccount,
        as: 'bankAccount',
        attributes: ['id', 'bank_name', 'account_name', 'account_number'],
      },
      {
        model: Staff,
        as: 'createdByStaff',
        attributes: ['id', 'firstname', 'lastname'],
      },
      {
        model: Staff,
        as: 'updatedByStaff',
        attributes: ['id', 'firstname', 'lastname'],
      },
    ];

    if (search) {
      (where as any)[Op.or] = [
        { terminal_id: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
        { merchant_name: { [Op.like]: `%${search}%` } },
      ];
    }

    if (terminal_id) {
      where.terminal_id = { [Op.like]: `%${terminal_id}%` };
    }

    if (bank_account_id) {
      where.bank_account_id = bank_account_id;
    }

    if (location) {
      where.location = { [Op.like]: `%${location}%` };
    }

    if (terminal_type) {
      where.terminal_type = terminal_type;
    }

    if (typeof is_active === 'boolean') {
      where.is_active = is_active;
    }

    // Manual pagination implementation
    const offset = (page - 1) * limit;

    const { count, rows } = await POSTerminal.findAndCountAll({
      where,
      include,
      order: [
        ['terminal_id', 'ASC'],
        ['location', 'ASC'],
      ],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      docs: rows,
      total: count,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  /**
   * Get POS terminal by ID
   */
  static async getPOSTerminalById(id: number) {
    return await POSTerminal.findByPk(id, {
      include: [
        {
          model: BankAccount,
          as: 'bankAccount',
          attributes: ['id', 'bank_name', 'account_name', 'account_number'],
        },
        {
          model: Staff,
          as: 'createdByStaff',
          attributes: ['id', 'firstname', 'lastname'],
        },
        {
          model: Staff,
          as: 'updatedByStaff',
          attributes: ['id', 'firstname', 'lastname'],
        },
      ],
    });
  }

  /**
   * Create new POS terminal
   */
  static async createPOSTerminal(data: any, staffId: number) {
    const posTerminalData = {
      ...data,
      created_by: staffId,
    };

    return await POSTerminal.create(posTerminalData);
  }

  /**
   * Update POS terminal
   */
  static async updatePOSTerminal(id: number, data: any, staffId: number) {
    const updateData = {
      ...data,
      updated_by: staffId,
    };

    const posTerminal = await POSTerminal.findByPk(id);
    if (!posTerminal) {
      throw new BadException(
        'POS Terminal Not Found',
        404,
        'The requested POS terminal could not be found'
      );
    }

    await posTerminal.update(updateData);
    return posTerminal;
  }

  /**
   * Delete POS terminal (soft delete by setting is_active to false)
   */
  static async deletePOSTerminal(id: number, staffId: number) {
    const posTerminal = await POSTerminal.findByPk(id);
    if (!posTerminal) {
      throw new BadException(
        'POS Terminal Not Found',
        404,
        'The requested POS terminal could not be found'
      );
    }

    await posTerminal.update({
      is_active: false,
      updated_by: staffId,
    });

    return posTerminal;
  }

  /**
   * Get active POS terminals for payments
   */
  static async getActivePOSTerminals() {
    return await POSTerminal.findAll({
      where: { is_active: true },
      include: [
        {
          model: BankAccount,
          as: 'bankAccount',
          attributes: ['id', 'bank_name', 'account_name', 'account_number'],
        },
      ],
      attributes: [
        'id',
        'terminal_id',
        'location',
        'terminal_type',
        'merchant_name',
        'daily_transaction_limit',
        'daily_amount_limit',
      ],
      order: [
        ['terminal_id', 'ASC'],
        ['location', 'ASC'],
      ],
    });
  }

  /**
   * Get POS terminals by bank account
   */
  static async getPOSTerminalsByBankAccount(bankAccountId: number) {
    return await POSTerminal.findAll({
      where: {
        bank_account_id: bankAccountId,
        is_active: true,
      },
      include: [
        {
          model: BankAccount,
          as: 'bankAccount',
          attributes: ['id', 'bank_name', 'account_name', 'account_number'],
        },
      ],
      attributes: ['id', 'terminal_id', 'location', 'terminal_type', 'merchant_name'],
      order: [['terminal_id', 'ASC']],
    });
  }

  /**
   * Update POS terminal last used timestamp
   */
  static async updatePOSTerminalLastUsed(id: number) {
    const posTerminal = await POSTerminal.findByPk(id);
    if (!posTerminal) {
      throw new BadException(
        'POS Terminal Not Found',
        404,
        'The requested POS terminal could not be found'
      );
    }

    await posTerminal.update({
      last_used_at: new Date(),
    });

    return posTerminal;
  }

  /**
   * Toggle POS terminal status (active/inactive)
   */
  static async togglePOSTerminalStatus(id: number, staffId: number) {
    const posTerminal = await POSTerminal.findByPk(id);
    if (!posTerminal) {
      throw new BadException(
        'POS Terminal Not Found',
        404,
        'The requested POS terminal could not be found'
      );
    }

    // Toggle the status
    const newStatus = !posTerminal.is_active;

    await posTerminal.update({
      is_active: newStatus,
      updated_by: staffId,
    });

    return posTerminal;
  }

  // Trial Balance Variance Analysis
  static async getTrialBalanceVarianceAnalysis(filters: TrialBalanceFilters = {}) {
    const trialBalanceResult = await this.getTrialBalance(filters);
    const trialBalance = trialBalanceResult.data;

    // Calculate variances
    const varianceAnalysis = {
      accountVariances: this.calculateAccountVariances(trialBalance),
      typeVariances: this.calculateTypeVariances(trialBalance),
      overallVariance: this.calculateOverallVariance(trialBalance),
      recommendations: this.generateVarianceRecommendations(trialBalance),
    };

    return varianceAnalysis;
  }

  // Balance Sheet Preview
  static async getBalanceSheetPreview(filters: TrialBalanceFilters = {}) {
    const trialBalanceResult = await this.getTrialBalance(filters);
    const trialBalance = trialBalanceResult.data;

    return this.getBalanceSheetPreviewData(trialBalance);
  }

  // Helper methods for variance analysis
  private static calculateAccountVariances(trialBalance: any[]) {
    return trialBalance
      .map(account => {
        const variance = (account.closing_balance || 0) - (account.opening_balance || 0);
        const variancePercentage =
          account.opening_balance !== 0 ? (variance / Math.abs(account.opening_balance)) * 100 : 0;

        return {
          account_id: account.id,
          account_code: account.code,
          account_name: account.name,
          account_type: account.type,
          opening_balance: account.opening_balance || 0,
          closing_balance: account.closing_balance || 0,
          variance: variance,
          variance_percentage: variancePercentage,
          is_significant: Math.abs(variancePercentage) > 10, // Flag significant variances > 10%
        };
      })
      .filter(account => account.is_significant); // Only return significant variances
  }

  private static calculateTypeVariances(trialBalance: any[]) {
    const typeVariances = {};

    trialBalance.forEach(account => {
      if (!typeVariances[account.type]) {
        typeVariances[account.type] = {
          type: account.type,
          total_opening: 0,
          total_closing: 0,
          total_variance: 0,
          account_count: 0,
        };
      }

      typeVariances[account.type].total_opening += account.opening_balance || 0;
      typeVariances[account.type].total_closing += account.closing_balance || 0;
      typeVariances[account.type].total_variance +=
        (account.closing_balance || 0) - (account.opening_balance || 0);
      typeVariances[account.type].account_count++;
    });

    return Object.values(typeVariances).map((type: any) => ({
      ...type,
      average_variance: type.account_count > 0 ? type.total_variance / type.account_count : 0,
    }));
  }

  private static calculateOverallVariance(trialBalance: any[]) {
    const totalOpening = trialBalance.reduce(
      (sum, account) => sum + (account.opening_balance || 0),
      0
    );
    const totalClosing = trialBalance.reduce(
      (sum, account) => sum + (account.closing_balance || 0),
      0
    );
    const totalVariance = totalClosing - totalOpening;

    return {
      total_opening_balance: totalOpening,
      total_closing_balance: totalClosing,
      total_variance: totalVariance,
      variance_percentage: totalOpening !== 0 ? (totalVariance / totalOpening) * 100 : 0,
      is_balanced: Math.abs(totalVariance) < 0.01,
    };
  }

  private static generateVarianceRecommendations(trialBalance: any[]) {
    const recommendations = [];

    // Check for large variances
    const largeVariances = trialBalance.filter(
      account => Math.abs((account.closing_balance || 0) - (account.opening_balance || 0)) > 1000
    );

    if (largeVariances.length > 0) {
      recommendations.push({
        type: 'LARGE_VARIANCE',
        message: `Found ${largeVariances.length} accounts with significant balance changes (>$1,000)`,
        accounts: largeVariances.map(acc => acc.code),
      });
    }

    // Check for zero balance accounts
    const zeroBalanceAccounts = trialBalance.filter(
      account => Math.abs(account.closing_balance || 0) < 0.01
    );

    if (zeroBalanceAccounts.length > 0) {
      recommendations.push({
        type: 'ZERO_BALANCE',
        message: `Found ${zeroBalanceAccounts.length} accounts with zero closing balance`,
        accounts: zeroBalanceAccounts.map(acc => acc.code),
      });
    }

    // Check for negative balances in asset accounts
    const negativeAssetAccounts = trialBalance.filter(
      account => account.type === 'ASSET' && (account.closing_balance || 0) < 0
    );

    if (negativeAssetAccounts.length > 0) {
      recommendations.push({
        type: 'NEGATIVE_ASSET',
        message: `Found ${negativeAssetAccounts.length} asset accounts with negative balances`,
        accounts: negativeAssetAccounts.map(acc => acc.code),
      });
    }

    return recommendations;
  }
}

export default AccountingRepository;
