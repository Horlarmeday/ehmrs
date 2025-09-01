import { Transaction } from 'sequelize';
import { FinancialPeriod } from '../../../database/models/financialPeriod';
import { BadException } from '../../../common/util/api-error';
import { FinancialPeriodStatus } from '../enums';

export interface PeriodValidationResult {
  valid: boolean;
  message: string;
  period?: any;
  errors?: string[];
}

export interface PeriodOverlapCheck {
  hasOverlap: boolean;
  overlappingPeriods: any[];
  message?: string;
}

export interface PeriodReconciliationData {
  periodId: number;
  totalDebits: number;
  totalCredits: number;
  balance: number;
  expectedBalance: number;
  variance: number;
  isBalanced: boolean;
  reconciliationDate: Date;
}

export class FinancialPeriodValidationService {
  /**
   * 1.2.1: Financial Period Controls
   * Validate that a financial period exists and is in the correct state for operations
   */
  static async validatePeriodForOperation(
    periodId: number,
    operation: 'create' | 'read' | 'update' | 'delete' | 'transaction',
    transaction?: Transaction
  ): Promise<PeriodValidationResult> {
    try {
      const period = await FinancialPeriod.findByPk(periodId, { transaction });
      
      if (!period) {
        return {
          valid: false,
          message: 'Financial period not found',
          errors: ['Period does not exist']
        };
      }

          // Check if period is suspended (no operations allowed)
    if (period.status === FinancialPeriodStatus.SUSPENDED) {
      return {
        valid: false,
        message: 'Financial period is suspended and cannot be modified',
        errors: ['Period is suspended']
      };
    }

      // Check if period is closed for transactions
      if (operation === 'transaction' && period.status === FinancialPeriodStatus.CLOSED) {
        return {
          valid: false,
          message: 'Financial period is closed and cannot accept new transactions',
          errors: ['Period is closed for transactions']
        };
      }

      // Check if period is closed for modifications
      if ((operation === 'update' || operation === 'delete') && 
          period.status === FinancialPeriodStatus.CLOSED) {
        return {
          valid: false,
          message: 'Financial period is closed and cannot be modified',
          errors: ['Period is closed for modifications']
        };
      }

      return {
        valid: true,
        message: 'Period validation successful',
        period
      };
    } catch (error) {
      throw new BadException(
        'Period Validation Failed',
        500,
        `Failed to validate period for operation: ${error.message}`
      );
    }
  }

  /**
   * 1.2.2: Period Opening/Closing Validation
   * Validate that a period can be opened or closed based on business rules
   */
  static async validatePeriodStateChange(
    periodId: number,
    newStatus: FinancialPeriodStatus,
    transaction?: Transaction
  ): Promise<PeriodValidationResult> {
    try {
      const period = await FinancialPeriod.findByPk(periodId, { transaction });
      
      if (!period) {
        return {
          valid: false,
          message: 'Financial period not found',
          errors: ['Period does not exist']
        };
      }

      const currentStatus = period.status;
      const errors: string[] = [];

      // Validate state transitions
      switch (currentStatus) {
        case FinancialPeriodStatus.OPEN:
          if (newStatus === FinancialPeriodStatus.CLOSED) {
            // Check if period can be closed
            const canClose = await this.canPeriodBeClosed(periodId, transaction);
            if (!canClose.valid) {
              errors.push(...canClose.errors || []);
            }
                        } else if (newStatus === FinancialPeriodStatus.SUSPENDED) {
          // Check if period can be suspended
          const canSuspend = await this.canPeriodBeSuspended(periodId, transaction);
          if (!canSuspend.valid) {
            errors.push(...canSuspend.errors || []);
          }
          }
          break;

        case FinancialPeriodStatus.CLOSED:
          if (newStatus === FinancialPeriodStatus.OPEN) {
            // Check if period can be reopened
            const canReopen = await this.canPeriodBeReopened(periodId, transaction);
            if (!canReopen.valid) {
              errors.push(...canReopen.errors || []);
            }
          }
          break;

        case FinancialPeriodStatus.SUSPENDED:
          if (newStatus === FinancialPeriodStatus.OPEN) {
            // Check if period can be unsuspended
            const canUnsuspend = await this.canPeriodBeUnsuspended(periodId, transaction);
            if (!canUnsuspend.valid) {
              errors.push(...canUnsuspend.errors || []);
            }
          }
          break;

        default:
          errors.push(`Invalid status transition from ${currentStatus} to ${newStatus}`);
      }

      if (errors.length > 0) {
        return {
          valid: false,
          message: 'Period state change validation failed',
          errors
        };
      }

      return {
        valid: true,
        message: 'Period state change validation successful',
        period
      };
    } catch (error) {
      throw new BadException(
        'Period State Change Validation Failed',
        500,
        `Failed to validate period state change: ${error.message}`
      );
    }
  }

  /**
   * 1.2.3: Period-Based Transaction Restrictions
   * Check if a transaction can be processed in the current period
   */
  static async validateTransactionPeriod(
    transactionDate: Date,
    periodId?: number,
    transaction?: Transaction
  ): Promise<PeriodValidationResult> {
    try {
      let targetPeriod: any;

      if (periodId) {
        // Validate specific period
        targetPeriod = await FinancialPeriod.findByPk(periodId, { transaction });
        if (!targetPeriod) {
          return {
            valid: false,
            message: 'Specified financial period not found',
            errors: ['Period does not exist']
          };
        }
      } else {
        // Find the period that contains the transaction date
        targetPeriod = await FinancialPeriod.findOne({
          where: {
            start_date: { [require('sequelize').Op.lte]: transactionDate },
            end_date: { [require('sequelize').Op.gte]: transactionDate },
            status: FinancialPeriodStatus.OPEN
          },
          transaction
        });

        if (!targetPeriod) {
          return {
            valid: false,
            message: 'No open financial period found for transaction date',
            errors: ['Transaction date falls outside any open period']
          };
        }
      }

      // Check if period is open for transactions
      if (targetPeriod.status !== FinancialPeriodStatus.OPEN) {
        return {
          valid: false,
          message: 'Financial period is not open for transactions',
          errors: [`Period status is ${targetPeriod.status}`]
        };
      }

      // Check if transaction date is within period bounds
      if (transactionDate < targetPeriod.start_date || transactionDate > targetPeriod.end_date) {
        return {
          valid: false,
          message: 'Transaction date is outside period bounds',
          errors: [
            `Transaction date ${transactionDate.toISOString().split('T')[0]} is outside period ${targetPeriod.start_date.toISOString().split('T')[0]} to ${targetPeriod.end_date.toISOString().split('T')[0]}`
          ]
        };
      }

      return {
        valid: true,
        message: 'Transaction period validation successful',
        period: targetPeriod
      };
    } catch (error) {
      throw new BadException(
        'Transaction Period Validation Failed',
        500,
        `Failed to validate transaction period: ${error.message}`
      );
    }
  }

  /**
   * 1.2.4: Period Reconciliation Controls
   * Validate that a period can be reconciled and closed
   */
  static async validatePeriodReconciliation(
    periodId: number,
    transaction?: Transaction
  ): Promise<PeriodValidationResult> {
    try {
      const period = await FinancialPeriod.findByPk(periodId, { transaction });
      
      if (!period) {
        return {
          valid: false,
          message: 'Financial period not found',
          errors: ['Period does not exist']
        };
      }

      if (period.status !== FinancialPeriodStatus.OPEN) {
        return {
          valid: false,
          message: 'Only open periods can be reconciled',
          errors: [`Period status is ${period.status}`]
        };
      }

      // Check if period has any pending transactions
      const hasPendingTransactions = await this.hasPendingTransactions(periodId, transaction);
      if (hasPendingTransactions) {
        return {
          valid: false,
          message: 'Period has pending transactions that must be processed before reconciliation',
          errors: ['Pending transactions exist']
        };
      }

      // Check if period has any unposted journal entries
      const hasUnpostedEntries = await this.hasUnpostedJournalEntries(periodId, transaction);
      if (hasUnpostedEntries) {
        return {
          valid: false,
          message: 'Period has unposted journal entries that must be posted before reconciliation',
          errors: ['Unposted journal entries exist']
        };
      }

      return {
        valid: true,
        message: 'Period reconciliation validation successful',
        period
      };
    } catch (error) {
      throw new BadException(
        'Period Reconciliation Validation Failed',
        500,
        `Failed to validate period reconciliation: ${error.message}`
      );
    }
  }

  /**
   * Get current active financial period
   */
  static async getCurrentActivePeriod(transaction?: Transaction): Promise<any> {
    try {
      const currentDate = new Date();
      
      const activePeriod = await FinancialPeriod.findOne({
        where: {
          start_date: { [require('sequelize').Op.lte]: currentDate },
          end_date: { [require('sequelize').Op.gte]: currentDate },
          status: FinancialPeriodStatus.OPEN
        },
        transaction
      });

      return activePeriod;
    } catch (error) {
      throw new BadException(
        'Get Current Active Period Failed',
        500,
        `Failed to get current active period: ${error.message}`
      );
    }
  }

  /**
   * Check for period overlaps when creating/updating periods
   */
  static async checkPeriodOverlaps(
    startDate: Date,
    endDate: Date,
    excludePeriodId?: number,
    transaction?: Transaction
  ): Promise<PeriodOverlapCheck> {
    try {
      const whereClause: any = {
        [require('sequelize').Op.or]: [
          // New period starts within existing period
          {
            start_date: { [require('sequelize').Op.lte]: startDate },
            end_date: { [require('sequelize').Op.gte]: startDate }
          },
          // New period ends within existing period
          {
            start_date: { [require('sequelize').Op.lte]: endDate },
            end_date: { [require('sequelize').Op.gte]: endDate }
          },
          // New period completely contains existing period
          {
            start_date: { [require('sequelize').Op.gte]: startDate },
            end_date: { [require('sequelize').Op.lte]: endDate }
          }
        ]
      };

      if (excludePeriodId) {
        whereClause.id = { [require('sequelize').Op.ne]: excludePeriodId };
      }

      const overlappingPeriods = await FinancialPeriod.findAll({
        where: whereClause,
        transaction
      });

      return {
        hasOverlap: overlappingPeriods.length > 0,
        overlappingPeriods,
        message: overlappingPeriods.length > 0 
          ? `Found ${overlappingPeriods.length} overlapping period(s)` 
          : 'No overlaps found'
      };
    } catch (error) {
      throw new BadException(
        'Period Overlap Check Failed',
        500,
        `Failed to check period overlaps: ${error.message}`
      );
    }
  }

  /**
   * Private helper methods for validation logic
   */
  private static async canPeriodBeClosed(
    periodId: number,
    transaction?: Transaction
  ): Promise<PeriodValidationResult> {
    // Implementation would check if all transactions are posted
    // and balances are reconciled
    return { valid: true, message: 'Period can be closed' };
  }

  private static async canPeriodBeSuspended(
    periodId: number,
    transaction?: Transaction
  ): Promise<PeriodValidationResult> {
    // Implementation would check if period is closed and reconciled
    return { valid: true, message: 'Period can be suspended' };
  }

  private static async canPeriodBeReopened(
    periodId: number,
    transaction?: Transaction
  ): Promise<PeriodValidationResult> {
    // Implementation would check if no subsequent periods exist
    // or if reopening is allowed by business rules
    return { valid: true, message: 'Period can be reopened' };
  }

  private static async canPeriodBeUnsuspended(
    periodId: number,
    transaction?: Transaction
  ): Promise<PeriodValidationResult> {
    // Implementation would check if unsuspending is allowed by business rules
    return { valid: true, message: 'Period can be unsuspended' };
  }

  private static async hasPendingTransactions(
    periodId: number,
    transaction?: Transaction
  ): Promise<boolean> {
    // Implementation would check for pending transactions in the period
    // This is a placeholder - actual implementation would query transaction tables
    return false;
  }

  private static async hasUnpostedJournalEntries(
    periodId: number,
    transaction?: Transaction
  ): Promise<boolean> {
    // Implementation would check for unposted journal entries in the period
    // This is a placeholder - actual implementation would query journal entry tables
    return false;
  }
}
