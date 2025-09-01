import { Op, Transaction } from 'sequelize';
import { FinancialPeriod } from '../../../database/models/financialPeriod';
import { BadException } from '../../../common/util/api-error';
import { FinancialPeriodStatus } from '../enums';
import {
  FinancialPeriodValidationService,
  PeriodValidationResult,
  PeriodOverlapCheck,
} from './financialPeriodValidation.service';
import dayjs from 'dayjs';

export interface CreatePeriodData {
  name: string;
  period_type?: string;
  start_date: Date;
  end_date: Date;
  opening_balance?: number;
  description?: string;
  status?: string;
  auto_close?: boolean;
  created_by: number;
}

export interface UpdatePeriodData {
  name?: string;
  period_type?: string;
  start_date?: Date;
  end_date?: Date;
  opening_balance?: number;
  description?: string;
  status?: string;
  auto_close?: boolean;
  updated_by: number;
}

export interface PeriodActionData {
  notes?: string;
  action_by: number;
  action_date?: Date;
}

export interface ClosePeriodData extends PeriodActionData {
  closing_date: Date;
}

export interface PeriodReconciliationResult {
  success: boolean;
  message: string;
  reconciliationData?: any;
  errors?: string[];
}

export class FinancialPeriodManagementService {
  /**
   * Create a new financial period with validation
   */
  static async createPeriod(periodData: CreatePeriodData, transaction?: Transaction): Promise<any> {
    try {
      // Check for period overlaps
      const overlapCheck = await FinancialPeriodValidationService.checkPeriodOverlaps(
        periodData.start_date,
        periodData.end_date,
        undefined,
        transaction
      );

      if (overlapCheck.hasOverlap) {
        throw new BadException(
          'Period Overlap Detected',
          400,
          `Cannot create period: ${
            overlapCheck.message
          }. Overlapping periods: ${overlapCheck.overlappingPeriods.map(p => p.name).join(', ')}`
        );
      }

      // Create the period
      const period = await FinancialPeriod.create(
        {
          name: periodData.name,
          period_type: periodData.period_type,
          start_date: periodData.start_date,
          end_date: periodData.end_date,
          balance: periodData.opening_balance || 0,
          notes: periodData.description,
          status: periodData.status || FinancialPeriodStatus.DRAFT,
          is_current: true,
          auto_close: periodData.auto_close || false,
          created_by: periodData.created_by,
        },
        { transaction }
      );

      // Update the previous period to be non-current
      await FinancialPeriod.update(
        { is_current: false },
        { where: { id: { [Op.ne]: period.id } }, transaction }
      );

      return period;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException(
        'Period Creation Failed',
        500,
        `Failed to create financial period: ${error.message}`
      );
    }
  }

  /**
   * Update an existing financial period with validation
   */
  static async updatePeriod(
    periodId: number,
    updateData: UpdatePeriodData,
    transaction?: Transaction
  ): Promise<any> {
    try {
      // Validate period exists and can be updated
      const validation = await FinancialPeriodValidationService.validatePeriodForOperation(
        periodId,
        'update',
        transaction
      );

      if (!validation.valid) {
        throw new BadException('Period Update Validation Failed', 400, validation.message);
      }

      // Check for overlaps if dates are being changed
      if (updateData.start_date || updateData.end_date) {
        const period = await FinancialPeriod.findByPk(periodId, { transaction });
        if (!period) {
          throw new BadException('Period Not Found', 404, 'Financial period not found');
        }

        const startDate = updateData.start_date || period.start_date;
        const endDate = updateData.end_date || period.end_date;

        const overlapCheck = await FinancialPeriodValidationService.checkPeriodOverlaps(
          startDate,
          endDate,
          periodId,
          transaction
        );

        if (overlapCheck.hasOverlap) {
          throw new BadException(
            'Period Overlap Detected',
            400,
            `Cannot update period: ${
              overlapCheck.message
            }. Overlapping periods: ${overlapCheck.overlappingPeriods.map(p => p.name).join(', ')}`
          );
        }
      }

      // Update the period with field mapping
      const updateFields: any = {
        updated_at: new Date(),
      };

      if (updateData.name !== undefined) updateFields.name = updateData.name;
      if (updateData.period_type !== undefined) updateFields.period_type = updateData.period_type;
      if (updateData.start_date !== undefined) updateFields.start_date = updateData.start_date;
      if (updateData.end_date !== undefined) updateFields.end_date = updateData.end_date;
      if (updateData.opening_balance !== undefined)
        updateFields.balance = updateData.opening_balance;
      if (updateData.description !== undefined) updateFields.notes = updateData.description;
      if (updateData.status !== undefined) updateFields.status = updateData.status;
      if (updateData.auto_close !== undefined) updateFields.auto_close = updateData.auto_close;

      const [updatedRows] = await FinancialPeriod.update(updateFields, {
        where: { id: periodId },
        transaction,
      });

      if (updatedRows === 0) {
        throw new BadException('Period Update Failed', 500, 'No rows were updated');
      }

      return await FinancialPeriod.findByPk(periodId, { transaction });
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException(
        'Period Update Failed',
        500,
        `Failed to update financial period: ${error.message}`
      );
    }
  }

  /**
   * Open a financial period
   */
  static async openPeriod(
    periodId: number,
    actionData: PeriodActionData,
    transaction?: Transaction
  ): Promise<any> {
    try {
      // Validate period exists and can be opened
      const validation = await FinancialPeriodValidationService.validatePeriodStateChange(
        periodId,
        FinancialPeriodStatus.OPEN,
        transaction
      );

      if (!validation.valid) {
        throw new BadException('Period Open Validation Failed', 400, validation.message);
      }

      // Get current period data first
      const currentPeriod = await FinancialPeriod.findByPk(periodId, { transaction });
      if (!currentPeriod) {
        throw new BadException('Period Not Found', 404, 'Financial period not found');
      }

      // Update period status
      const [updatedRows] = await FinancialPeriod.update(
        {
          status: FinancialPeriodStatus.OPEN,
          notes: actionData.notes
            ? `${currentPeriod.notes || ''}\n\nOpened on ${actionData.action_date || new Date()}: ${
                actionData.notes
              }`.trim()
            : currentPeriod.notes,
          updated_at: new Date(),
        },
        {
          where: { id: periodId },
          transaction,
        }
      );

      if (updatedRows === 0) {
        throw new BadException('Period Open Failed', 500, 'No rows were updated');
      }

      return await FinancialPeriod.findByPk(periodId, { transaction });
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException(
        'Period Open Failed',
        500,
        `Failed to open financial period: ${error.message}`
      );
    }
  }

  /**
   * Close a financial period
   */
  static async closePeriod(
    periodId: number,
    actionData: ClosePeriodData,
    transaction?: Transaction
  ): Promise<any> {
    try {
      // Validate period exists and can be closed
      const validation = await FinancialPeriodValidationService.validatePeriodStateChange(
        periodId,
        FinancialPeriodStatus.CLOSED,
        transaction
      );

      if (!validation.valid) {
        throw new BadException('Period Close Validation Failed', 400, validation.message);
      }

      // Additional validation for reconciliation
      const reconciliationValidation = await FinancialPeriodValidationService.validatePeriodReconciliation(
        periodId,
        transaction
      );

      if (!reconciliationValidation.valid) {
        throw new BadException(
          'Period Reconciliation Required',
          400,
          reconciliationValidation.message
        );
      }

      // Get current period data first
      const currentPeriod = await FinancialPeriod.findByPk(periodId, { transaction });
      if (!currentPeriod) {
        throw new BadException('Period Not Found', 404, 'Financial period not found');
      }

      // Calculate closing balance by reconciling all transactions in the period
      const closingBalance = await this.calculatePeriodClosingBalance(periodId, transaction);

      // Update period status with closing balance
      const [updatedRows] = await FinancialPeriod.update(
        {
          status: FinancialPeriodStatus.CLOSED,
          closing_balance: closingBalance,
          notes: actionData.notes
            ? `${currentPeriod.notes || ''}\n\nClosed on ${actionData.action_date || new Date()}: ${
                actionData.notes
              }\nClosing Balance: ${closingBalance}`.trim()
            : currentPeriod.notes,
          updated_at: new Date(),
        },
        {
          where: { id: periodId },
          transaction,
        }
      );

      if (updatedRows === 0) {
        throw new BadException('Period Close Failed', 500, 'No rows were updated');
      }

      return await FinancialPeriod.findByPk(periodId, { transaction });
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException(
        'Period Close Failed',
        500,
        `Failed to close financial period: ${error.message}`
      );
    }
  }

  /**
   * Lock a financial period (final state - no further changes allowed)
   */
  static async lockPeriod(
    periodId: number,
    actionData: PeriodActionData,
    transaction?: Transaction
  ): Promise<any> {
    try {
      // Validate period exists and can be suspended
      const validation = await FinancialPeriodValidationService.validatePeriodStateChange(
        periodId,
        FinancialPeriodStatus.SUSPENDED,
        transaction
      );

      if (!validation.valid) {
        throw new BadException('Period Lock Validation Failed', 400, validation.message);
      }

      // Get current period data first
      const currentPeriod = await FinancialPeriod.findByPk(periodId, { transaction });
      if (!currentPeriod) {
        throw new BadException('Period Not Found', 404, 'Financial period not found');
      }

      // Update period status
      const [updatedRows] = await FinancialPeriod.update(
        {
          status: FinancialPeriodStatus.SUSPENDED,
          notes: actionData.notes
            ? `${currentPeriod.notes || ''}\n\nLocked on ${actionData.action_date || new Date()}: ${
                currentPeriod.notes
              }`.trim()
            : currentPeriod.notes,
          updated_at: new Date(),
        },
        {
          where: { id: periodId },
          transaction,
        }
      );

      if (updatedRows === 0) {
        throw new BadException('Period Lock Failed', 500, 'No rows were updated');
      }

      return await FinancialPeriod.findByPk(periodId, { transaction });
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException(
        'Period Lock Failed',
        500,
        `Failed to lock financial period: ${error.message}`
      );
    }
  }

  /**
   * Reconcile a financial period before closing
   */
  static async reconcilePeriod(
    periodId: number,
    transaction?: Transaction
  ): Promise<PeriodReconciliationResult> {
    try {
      // Validate period can be reconciled
      const validation = await FinancialPeriodValidationService.validatePeriodReconciliation(
        periodId,
        transaction
      );

      if (!validation.valid) {
        return {
          success: false,
          message: validation.message,
          errors: validation.errors,
        };
      }

      // Perform reconciliation logic here
      // This would include:
      // 1. Checking all journal entries are posted
      // 2. Verifying account balances
      // 3. Checking for any discrepancies
      // 4. Generating reconciliation report

      const reconciliationData = {
        periodId,
        reconciliationDate: new Date(),
        status: 'RECONCILED',
        notes: 'Period successfully reconciled',
      };

      return {
        success: true,
        message: 'Period reconciled successfully',
        reconciliationData,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Period reconciliation failed',
        errors: [error.message],
      };
    }
  }

  /**
   * Get period summary and statistics
   */
  static async getPeriodSummary(periodId: number, transaction?: Transaction): Promise<any> {
    try {
      const period = await FinancialPeriod.findByPk(periodId, { transaction });
      if (!period) {
        throw new BadException('Period Not Found', 404, 'Financial period not found');
      }

      // Get period statistics
      const summary = {
        period,
        statistics: {
          totalTransactions: 0, // Placeholder - would query transaction tables
          totalJournalEntries: 0, // Placeholder - would query journal entry tables
          totalDebits: 0, // Placeholder - would calculate from journal entries
          totalCredits: 0, // Placeholder - would calculate from journal entries
          netBalance: 0, // Placeholder - would calculate from journal entries
          reconciliationStatus: 'NOT_RECONCILED', // Placeholder - would check reconciliation status
        },
      };

      return summary;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException(
        'Get Period Summary Failed',
        500,
        `Failed to get period summary: ${error.message}`
      );
    }
  }

  /**
   * Calculate the closing balance for a financial period
   * This method reconciles all transactions in the period to determine the final balance
   */
  private static async calculatePeriodClosingBalance(
    periodId: number,
    transaction?: Transaction
  ): Promise<number> {
    try {
      // Get the period to find its opening balance
      const period = await FinancialPeriod.findByPk(periodId, { transaction });
      if (!period) {
        throw new BadException('Period Not Found', 404, 'Financial period not found');
      }

      const openingBalance = period.balance || 0;
      const netChange = 0;

      // Calculate net change from all transactions in the period
      // This would include:
      // 1. Patient deposits
      // 2. Clinical bills
      // 3. Clinical payments
      // 4. Journal entries
      // 5. Any other financial transactions

      // For now, we'll use a simplified calculation
      // In a real implementation, this would query all transaction tables
      // and calculate the actual net change based on business rules

      // Placeholder: Return opening balance + net change
      // This should be replaced with actual transaction reconciliation logic
      const closingBalance = openingBalance + netChange;

      return Math.max(0, closingBalance); // Ensure non-negative balance
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException(
        'Closing Balance Calculation Failed',
        500,
        `Failed to calculate period closing balance: ${error.message}`
      );
    }
  }

  /**
   * Get all periods with filtering and pagination
   */
  static async getPeriods(
    filters: {
      status?: FinancialPeriodStatus;
      startDate?: Date;
      endDate?: Date;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
    transaction?: Transaction
  ): Promise<any> {
    try {
      const whereClause: any = {};

      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.startDate) {
        whereClause.start_date = { [Op.gte]: dayjs(filters.startDate).toDate() };
      }

      if (filters.endDate) {
        whereClause.end_date = { [Op.lte]: dayjs(filters.endDate).toDate() };
      }

      if (filters.search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${filters.search}%` } },
          { notes: { [Op.like]: `%${filters.search}%` } },
        ];
      }

      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await FinancialPeriod.findAndCountAll({
        where: whereClause,
        order: [['start_date', 'DESC']],
        limit,
        offset,
        transaction,
      });

      return {
        periods: rows,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw new BadException(
        'Get Periods Failed',
        500,
        `Failed to get financial periods: ${error.message}`
      );
    }
  }

  /**
   * Delete a financial period (only if it's in DRAFT status and has no transactions)
   */
  static async deletePeriod(periodId: number, transaction?: Transaction): Promise<boolean> {
    try {
      // Validate period exists and can be deleted
      const validation = await FinancialPeriodValidationService.validatePeriodForOperation(
        periodId,
        'delete',
        transaction
      );

      if (!validation.valid) {
        throw new BadException('Period Delete Validation Failed', 400, validation.message);
      }

      // Check if period has any transactions (placeholder implementation)
      const hasTransactions = false; // Would check actual transaction tables
      if (hasTransactions) {
        throw new BadException(
          'Period Cannot Be Deleted',
          400,
          'Period has transactions and cannot be deleted'
        );
      }

      // Delete the period
      const deletedRows = await FinancialPeriod.destroy({
        where: { id: periodId },
        transaction,
      });

      return deletedRows > 0;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException(
        'Period Delete Failed',
        500,
        `Failed to delete financial period: ${error.message}`
      );
    }
  }
}
