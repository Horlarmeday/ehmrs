import { Op, Sequelize, WhereOptions, Includeable, Transaction } from 'sequelize';
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

export class AccountingRepository {
  // ===== PHASE 1: CORE FINANCIAL FOUNDATION METHODS =====

  // Chart of Accounts
  static async getChartOfAccounts(filters: ChartOfAccountFilters = {}) {
    const { search, type, status, level, page = 1, limit = 10 } = filters;

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

    const result = await ChartOfAccount.paginate({
      paginate: limit,
      page,
      where,
      include,
      order: [['code', 'ASC']],
    });

    // Calculate summary
    const summary = {
      totalAccounts: result.total,
      activeAccounts: result.docs.filter((acc: any) => acc.is_active).length,
      inactiveAccounts: result.docs.filter((acc: any) => !acc.is_active).length,
      totalBalance: result.docs.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0),
    };

    return { ...result, summary };
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
          'CONFLICT_RESOLUTION_FAILED',
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
        console.log(
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
      throw new BadException('Chart of account not found', 404);
    }

    // Check if account has children
    const children = await ChartOfAccount.count({ where: { parent_id: id } });
    if (children > 0) {
      throw new BadException('Cannot delete account with child accounts', 400);
    }

    // Check if account is used in journal entries
    const journalUsage = await JournalEntryLine.count({ where: { account_id: id } });
    if (journalUsage > 0) {
      throw new BadException('Cannot delete account used in journal entries', 400);
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
    const { search, status, dateRange, type, page = 1, limit = 10 } = filters;

    const where: WhereOptions = {};
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
        attributes: ['id', 'first_name', 'last_name', 'patient_number'],
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

    if (dateRange) {
      // Implement date range logic
    }

    const result = await JournalEntry.paginate({
      paginate: limit,
      page,
      where,
      include,
      order: [['transaction_date', 'DESC']],
    });

    // Calculate summary
    const summary = {
      totalEntries: result.total,
      pendingEntries: result.docs.filter((entry: any) => entry.status === 'PENDING_APPROVAL')
        .length,
      approvedEntries: result.docs.filter((entry: any) => entry.status === 'APPROVED').length,
      totalAmount: result.docs.reduce((sum: number, entry: any) => {
        return (
          sum + entry.lines.reduce((lineSum: number, line: any) => lineSum + (line.debit || 0), 0)
        );
      }, 0),
    };

    return { ...result, summary };
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
          attributes: ['id', 'first_name', 'last_name', 'patient_number'],
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

  // Cost Centers
  static async getCostCenters(filters: CostCenterFilters = {}) {
    const { search, department, status, page = 1, limit = 10 } = filters;

    const where: WhereOptions = {};
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
      ];
    }

    if (department) {
      where.department = department;
    }

    if (status) {
      where.is_active = status === 'ACTIVE';
    }

    const result = await CostCenter.paginate({
      paginate: limit,
      page,
      where,
      include,
      order: [['code', 'ASC']],
    });

    // Calculate summary
    const summary = {
      totalCostCenters: result.total,
      totalBudget: result.docs.reduce(
        (sum: number, center: any) => sum + (parseFloat(center.budget) || 0),
        0
      ),
      totalExpenses: 0, // Calculate from journal entries
      budgetUtilization: 0, // Calculate utilization percentage
    };

    return { ...result, summary };
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

    const where: WhereOptions = {};
    const include: Includeable[] = [
      {
        model: Staff,
        as: 'created_by_staff',
        attributes: ['id', 'first_name', 'last_name'],
      },
    ];

    if (search) {
      (where as any)[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (period_type) {
      where.period_type = period_type;
    }

    if (status) {
      where.status = status;
    }

    const result = await FinancialPeriod.paginate({
      paginate: limit,
      page,
      where,
      include,
      order: [['start_date', 'DESC']],
    });

    // Calculate summary
    const summary = {
      totalPeriods: result.total,
      openPeriods: result.docs.filter((period: any) => period.status === 'OPEN').length,
      closedPeriods: result.docs.filter((period: any) => period.status === 'CLOSED').length,
      currentPeriod: result.docs.find((period: any) => period.is_current),
    };

    return { ...result, summary };
  }

  static async getFinancialPeriodById(id: number) {
    return await FinancialPeriod.findByPk(id, {
      include: [
        {
          model: Staff,
          as: 'created_by_staff',
          attributes: ['id', 'first_name', 'last_name'],
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

    const where: WhereOptions = {};
    const include: Includeable[] = [
      {
        model: ClinicalBill,
        as: 'clinical_bill',
        attributes: ['id', 'bill_number', 'final_amount'],
      },
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'first_name', 'last_name', 'patient_number'],
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

    const result = await HMOClaim.paginate({
      paginate: limit,
      page,
      where,
      include,
      order: [['submitted_date', 'DESC']],
    });

    // Calculate summary
    const summary = {
      totalClaims: result.total,
      pendingClaims: result.docs.filter((claim: any) => claim.status === 'PENDING').length,
      approvedClaims: result.docs.filter((claim: any) => claim.status === 'APPROVED').length,
      totalAmount: result.docs.reduce(
        (sum: number, claim: any) => sum + (parseFloat(claim.claim_amount) || 0),
        0
      ),
    };

    return { ...result, summary };
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
          attributes: ['id', 'first_name', 'last_name', 'patient_number'],
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
    const { period_id, as_of_date, include_zero_balances = false, page = 1, limit = 10 } = filters;

    // Build where clause for accounts
    const accountWhere: WhereOptions = {};
    if (!include_zero_balances) {
      accountWhere.balance = { [Op.ne]: 0 };
    }

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

    // Calculate trial balance
    const trialBalance = accounts.map((account: any) => ({
      id: account.id,
      code: account.code,
      name: account.name,
      type: account.type,
      parent_code: account.parent?.code || null,
      parent_name: account.parent?.name || null,
      debit_balance:
        account.type === 'ASSET' || account.type === 'EXPENSE' ? account.balance || 0 : 0,
      credit_balance:
        account.type === 'LIABILITY' || account.type === 'EQUITY' || account.type === 'INCOME'
          ? account.balance || 0
          : 0,
      balance: account.balance || 0,
    }));

    // Calculate summary
    const totalDebits = trialBalance.reduce((sum, account) => sum + account.debit_balance, 0);
    const totalCredits = trialBalance.reduce((sum, account) => sum + account.credit_balance, 0);
    const difference = Math.abs(totalDebits - totalCredits);

    const summary = {
      totalDebits,
      totalCredits,
      balancedAccounts: difference < 0.01 ? trialBalance.length : 0,
      difference,
    };

    return {
      data: trialBalance,
      summary,
      total: trialBalance.length,
      pages: Math.ceil(trialBalance.length / limit),
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
  ): Promise<{ deposits: PatientDeposit[]; total: number }> {
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

    const { count, rows } = await PatientDeposit.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient', attributes: patientAttributes },
        { model: Staff, as: 'createdByStaff', attributes: staffAttributes },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { deposits: rows, total: count };
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
      ],
    });
  }

  static async getClinicalPayments(
    filters: PaymentSearchFilters
  ): Promise<{ payments: ClinicalPayment[]; total: number }> {
    const where: any = {};
    const { page = 1, limit = 20 } = filters;

    if (filters.bill_id) where.bill_id = filters.bill_id;
    if (filters.patient_id) where.patient_id = filters.patient_id;
    if (filters.payment_method) where.payment_method = filters.payment_method;
    if (filters.payment_type) where.payment_type = filters.payment_type;
    if (filters.status) where.status = filters.status;
    if (filters.min_amount) where.amount = { [Op.gte]: filters.min_amount };
    if (filters.max_amount) where.amount = { ...where.amount, [Op.lte]: filters.max_amount };
    if (filters.start_date) where.createdAt = { [Op.gte]: filters.start_date };
    if (filters.end_date) where.createdAt = { ...where.createdAt, [Op.lte]: filters.end_date };

    const { count, rows } = await ClinicalPayment.findAndCountAll({
      where,
      include: [
        { model: ClinicalBill, as: 'bill', attributes: ['id', 'bill_number', 'final_amount'] },
        { model: Patient, as: 'patient', attributes: patientAttributes },
        { model: Staff, as: 'processedByStaff', attributes: staffAttributes },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { payments: rows, total: count };
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

    return {
      total_payments: totalPayments,
      total_amount: totalAmount || 0,
      cash_payments: cashPayments || 0,
      card_payments: cardPayments || 0,
      bank_transfers: bankTransfers || 0,
      mobile_money_payments: mobileMoneyPayments || 0,
      insurance_payments: insurancePayments || 0,
      deposit_payments: depositPayments || 0,
    };
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
      throw new BadException('Error', 500, `Failed to fetch billing points: ${error.message}`);
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
        throw new BadException('Error', 404, 'Bill not found');
      }

      return bill;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to get bill by number: ${error.message}`);
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
      throw new BadException('Error', 500, `Failed to get patient bills: ${error.message}`);
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
        'Error',
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
      throw new BadException('Error', 500, `Failed to get deposit usage history: ${error.message}`);
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
      throw new BadException('Bank account not found', 404);
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
      throw new BadException('Bank account not found', 404);
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
  static async updateBankAccountBalance(id: number, amount: number, operation: 'add' | 'subtract') {
    const bankAccount = await BankAccount.findByPk(id);
    if (!bankAccount) {
      throw new BadException('Bank account not found', 404);
    }

    const currentBalance = parseFloat(bankAccount.current_balance.toString());
    let newBalance: number;

    if (operation === 'add') {
      newBalance = currentBalance + amount;
    } else {
      newBalance = currentBalance - amount;
      if (newBalance < 0) {
        throw new BadException('Insufficient balance in bank account', 400);
      }
    }

    await bankAccount.update({
      current_balance: newBalance,
    });

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
      throw new BadException('POS terminal not found', 404);
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
      throw new BadException('POS terminal not found', 404);
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
      throw new BadException('POS terminal not found', 404);
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
      throw new BadException('POS terminal not found', 404);
    }

    // Toggle the status
    const newStatus = !posTerminal.is_active;

    await posTerminal.update({
      is_active: newStatus,
      updated_by: staffId,
    });

    return posTerminal;
  }
}

export default AccountingRepository;
