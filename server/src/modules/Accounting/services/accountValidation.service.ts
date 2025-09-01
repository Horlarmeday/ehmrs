import { ChartOfAccount } from '../../../database/models/chartOfAccount';
import { AccountType } from '../enums';
import { BadException } from '../../../common/util/api-error';
import { Transaction, Op } from 'sequelize';
import { ComprehensiveChartOfAccountsService } from './comprehensiveChartOfAccounts.service';

export interface AccountValidationReport {
  overallStatus: 'VALID' | 'WARNING' | 'ERROR';
  summary: {
    totalAccounts: number;
    validAccounts: number;
    warningAccounts: number;
    errorAccounts: number;
    missingAccounts: number;
  };
  details: {
    valid: AccountValidationDetail[];
    warnings: AccountValidationDetail[];
    errors: AccountValidationDetail[];
    missing: MissingAccountDetail[];
  };
  recommendations: string[];
  timestamp: Date;
}

export interface AccountValidationDetail {
  accountId: number;
  code: string;
  name: string;
  type: AccountType;
  status: 'VALID' | 'WARNING' | 'ERROR';
  issues: string[];
  suggestions: string[];
}

export interface MissingAccountDetail {
  code: string;
  name: string;
  type: AccountType;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
}

export interface ValidationRule {
  ruleId: string;
  name: string;
  description: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  validate: (
    account: ChartOfAccount
  ) => Promise<{ isValid: boolean; message?: string; suggestion?: string }>;
}

export class AccountValidationService {
  /**
   * Comprehensive validation of all Chart of Accounts
   */
  static async validateAllAccounts(transaction?: Transaction): Promise<AccountValidationReport> {
    try {
      // Get all accounts
      const allAccounts = await ChartOfAccount.findAll({
        where: { is_active: true },
        transaction,
      });

      // Get required accounts
      const requiredAccounts = ComprehensiveChartOfAccountsService.REQUIRED_ACCOUNTS;

      // Validate existing accounts
      const validationResults = await Promise.all(
        allAccounts.map(account => this.validateSingleAccount(account, transaction))
      );

      // Check for missing required accounts
      const missingAccounts = this.identifyMissingAccounts(allAccounts, requiredAccounts);

      // Compile results
      const valid = validationResults.filter(r => r.status === 'VALID');
      const warnings = validationResults.filter(r => r.status === 'WARNING');
      const errors = validationResults.filter(r => r.status === 'ERROR');

      // Determine overall status
      const overallStatus = this.determineOverallStatus(
        valid.length,
        warnings.length,
        errors.length,
        missingAccounts.length
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        valid,
        warnings,
        errors,
        missingAccounts
      );

      const report: AccountValidationReport = {
        overallStatus,
        summary: {
          totalAccounts: allAccounts.length,
          validAccounts: valid.length,
          warningAccounts: warnings.length,
          errorAccounts: errors.length,
          missingAccounts: missingAccounts.length,
        },
        details: {
          valid,
          warnings,
          errors,
          missing: missingAccounts,
        },
        recommendations,
        timestamp: new Date(),
      };

      console.log(`✅ Chart of Accounts validation completed. Status: ${overallStatus}`);
      console.log(
        `📊 Summary: ${valid.length} valid, ${warnings.length} warnings, ${errors.length} errors, ${missingAccounts.length} missing`
      );

      return report;
    } catch (error) {
      throw new BadException('Chart of Accounts Validation Failed', 500, `Failed to validate Chart of Accounts: ${error.message}`);
    }
  }

  /**
   * Validate a single account against all validation rules
   */
  static async validateSingleAccount(
    account: ChartOfAccount,
    transaction?: Transaction
  ): Promise<AccountValidationDetail> {
    try {
      const issues: string[] = [];
      const suggestions: string[] = [];

      // Apply all validation rules
      const rules = this.getValidationRules();

      for (const rule of rules) {
        try {
          const result = await rule.validate(account);
          if (!result.isValid) {
            if (rule.severity === 'ERROR') {
              issues.push(result.message || `Failed validation: ${rule.name}`);
            } else if (rule.severity === 'WARNING') {
              suggestions.push(result.message || `Consider: ${rule.name}`);
            }
            if (result.suggestion) {
              suggestions.push(result.suggestion);
            }
          }
        } catch (error) {
          console.warn(
            `⚠️  Rule ${rule.ruleId} failed for account ${account.code}:`,
            error.message
          );
        }
      }

      // Determine status
      const status = this.determineAccountStatus(issues, suggestions);

      return {
        accountId: account.id,
        code: account.code,
        name: account.name,
        type: account.type as AccountType,
        status,
        issues,
        suggestions,
      };
    } catch (error) {
      return {
        accountId: account.id,
        code: account.code,
        name: account.name,
        type: account.type as AccountType,
        status: 'ERROR',
        issues: [`Validation failed: ${error.message}`],
        suggestions: ['Check account configuration and try again'],
      };
    }
  }

  /**
   * Get all validation rules
   */
  private static getValidationRules(): ValidationRule[] {
    return [
      // Code format validation
      {
        ruleId: 'CODE_FORMAT',
        name: 'Account Code Format',
        description: 'Account codes should be 4-digit numbers',
        severity: 'ERROR',
        validate: async (account: ChartOfAccount) => {
          const isValid = /^\d{4}$/.test(account.code);
          return {
            isValid,
            message: isValid ? undefined : 'Account code must be a 4-digit number',
            suggestion: isValid ? undefined : 'Use format: 1001, 2001, 3001, etc.',
          };
        },
      },

      // Code range validation
      {
        ruleId: 'CODE_RANGE',
        name: 'Account Code Range',
        description: 'Account codes should be in appropriate range for account type',
        severity: 'WARNING',
        validate: async (account: ChartOfAccount) => {
          const codeNum = parseInt(account.code);
          const type = account.type as AccountType;

          const ranges = {
            [AccountType.ASSET]: [1000, 1999],
            [AccountType.LIABILITY]: [2000, 2999],
            [AccountType.EQUITY]: [3000, 3999],
            [AccountType.REVENUE]: [4000, 4999],
            [AccountType.EXPENSE]: [5000, 5999],
          };

          const range = ranges[type];
          if (!range) return { isValid: true };

          const [min, max] = range;
          const isValid = codeNum >= min && codeNum <= max;

          return {
            isValid,
            message: isValid
              ? undefined
              : `${type} accounts should have codes between ${min} and ${max}`,
            suggestion: isValid ? undefined : `Consider moving account to range ${min}-${max}`,
          };
        },
      },

      // Name validation
      {
        ruleId: 'NAME_VALIDATION',
        name: 'Account Name',
        description: 'Account names should be descriptive and unique',
        severity: 'WARNING',
        validate: async (account: ChartOfAccount) => {
          const issues: string[] = [];

          if (account.name.length < 3) {
            issues.push('Account name is too short');
          }

          if (account.name.length > 100) {
            issues.push('Account name is too long');
          }

          // Check for duplicate names (excluding self)
          const duplicates = await ChartOfAccount.findAll({
            where: {
              name: account.name,
              id: { [Op.ne]: account.id },
              is_active: true,
            },
          });

          if (duplicates.length > 0) {
            issues.push('Account name is similar to other accounts');
          }

          return {
            isValid: issues.length === 0,
            message: issues.length > 0 ? issues.join(', ') : undefined,
            suggestion:
              issues.length > 0 ? 'Consider making the name more unique or descriptive' : undefined,
          };
        },
      },

      // Type validation
      {
        ruleId: 'TYPE_VALIDATION',
        name: 'Account Type',
        description: 'Account type should be valid and consistent',
        severity: 'ERROR',
        validate: async (account: ChartOfAccount) => {
          const validTypes = Object.values(AccountType);
          const isValid = validTypes.includes(account.type as AccountType);

          return {
            isValid,
            message: isValid ? undefined : `Invalid account type: ${account.type}`,
            suggestion: isValid ? undefined : `Valid types are: ${validTypes.join(', ')}`,
          };
        },
      },

      // Balance validation
      {
        ruleId: 'BALANCE_VALIDATION',
        name: 'Account Balance',
        description: 'Account balance should be reasonable and consistent',
        severity: 'WARNING',
        validate: async (account: ChartOfAccount) => {
          const issues: string[] = [];

          if (account.balance < 0) {
            if (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) {
              issues.push('Asset/Expense accounts should not have negative balances');
            }
          }

          if (account.balance > 1000000000) {
            // 1 billion
            issues.push('Account balance seems unusually high');
          }

          return {
            isValid: issues.length === 0,
            message: issues.length > 0 ? issues.join(', ') : undefined,
            suggestion:
              issues.length > 0 ? 'Review account balance and recent transactions' : undefined,
          };
        },
      },

      // Parent-child relationship validation
      {
        ruleId: 'HIERARCHY_VALIDATION',
        name: 'Account Hierarchy',
        description: 'Parent-child relationships should be logical',
        severity: 'WARNING',
        validate: async (account: ChartOfAccount) => {
          if (!account.parent_id) return { isValid: true };

          const parent = await ChartOfAccount.findByPk(account.parent_id);
          if (!parent) {
            return {
              isValid: false,
              message: 'Parent account not found',
              suggestion: 'Remove parent reference or create parent account',
            };
          }

          if (parent.type !== account.type) {
            return {
              isValid: false,
              message: 'Parent and child account types do not match',
              suggestion: 'Ensure parent and child have compatible types',
            };
          }

          return { isValid: true };
        },
      },

      // Active status validation
      {
        ruleId: 'STATUS_VALIDATION',
        name: 'Account Status',
        description: 'Active accounts should have proper configuration',
        severity: 'WARNING',
        validate: async (account: ChartOfAccount) => {
          if (!account.is_active) return { isValid: true };

          const issues: string[] = [];

          if (!account.name || account.name.trim() === '') {
            issues.push('Active account has no name');
          }

          if (!account.code || account.code.trim() === '') {
            issues.push('Active account has no code');
          }

          return {
            isValid: issues.length === 0,
            message: issues.length > 0 ? issues.join(', ') : undefined,
            suggestion:
              issues.length > 0
                ? 'Complete account configuration or deactivate account'
                : undefined,
          };
        },
      },
    ];
  }

  /**
   * Identify missing required accounts
   */
  private static identifyMissingAccounts(
    existingAccounts: ChartOfAccount[],
    requiredAccounts: any[]
  ): MissingAccountDetail[] {
    const existingCodes = existingAccounts.map(acc => acc.code);

    return requiredAccounts
      .filter(req => !existingCodes.includes(req.code))
      .map(req => ({
        code: req.code,
        name: req.name,
        type: req.type,
        description: req.description,
        priority: this.determinePriority(req.code, req.type),
        impact: this.determineImpact(req.type),
      }));
  }

  /**
   * Determine account priority
   */
  private static determinePriority(
    code: string,
    type: AccountType
  ): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    // Critical accounts for core operations
    if (['1001', '2001', '4001'].includes(code)) {
      return 'CRITICAL';
    }

    // High priority for major account types
    if (type === AccountType.ASSET || type === AccountType.LIABILITY) {
      return 'HIGH';
    }

    // Medium priority for revenue/expense
    if (type === AccountType.REVENUE || type === AccountType.EXPENSE) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Determine impact of missing account
   */
  private static determineImpact(type: AccountType): string {
    switch (type) {
      case AccountType.ASSET:
        return 'Cannot record asset transactions';
      case AccountType.LIABILITY:
        return 'Cannot record liability transactions';
      case AccountType.REVENUE:
        return 'Cannot record revenue transactions';
      case AccountType.EXPENSE:
        return 'Cannot record expense transactions';
      case AccountType.EQUITY:
        return 'Cannot record equity transactions';
      default:
        return 'May affect transaction recording';
    }
  }

  /**
   * Determine overall validation status
   */
  private static determineOverallStatus(
    validCount: number,
    warningCount: number,
    errorCount: number,
    missingCount: number
  ): 'VALID' | 'WARNING' | 'ERROR' {
    if (errorCount > 0) return 'ERROR';
    if (warningCount > 0 || missingCount > 0) return 'WARNING';
    return 'VALID';
  }

  /**
   * Determine individual account status
   */
  private static determineAccountStatus(
    issues: string[],
    suggestions: string[]
  ): 'VALID' | 'WARNING' | 'ERROR' {
    if (issues.length > 0) return 'ERROR';
    if (suggestions.length > 0) return 'WARNING';
    return 'VALID';
  }

  /**
   * Generate recommendations based on validation results
   */
  private static generateRecommendations(
    valid: AccountValidationDetail[],
    warnings: AccountValidationDetail[],
    errors: AccountValidationDetail[],
    missing: MissingAccountDetail[]
  ): string[] {
    const recommendations: string[] = [];

    if (errors.length > 0) {
      recommendations.push(
        `Fix ${errors.length} account(s) with critical errors to ensure system stability`
      );
    }

    if (missing.length > 0) {
      const critical = missing.filter(m => m.priority === 'CRITICAL').length;
      if (critical > 0) {
        recommendations.push(
          `Create ${critical} critical missing account(s) immediately to enable core operations`
        );
      }

      const high = missing.filter(m => m.priority === 'HIGH').length;
      if (high > 0) {
        recommendations.push(
          `Create ${high} high-priority missing account(s) for proper financial tracking`
        );
      }
    }

    if (warnings.length > 0) {
      recommendations.push(
        `Review ${warnings.length} account(s) with warnings to improve data quality`
      );
    }

    if (valid.length > 0 && errors.length === 0 && missing.length === 0) {
      recommendations.push(
        'All required accounts are properly configured. Consider running regular validation checks.'
      );
    }

    return recommendations;
  }

  /**
   * Quick validation check for system startup
   */
  static async quickValidationCheck(
    transaction?: Transaction
  ): Promise<{ isValid: boolean; message: string }> {
    try {
      const report = await this.validateAllAccounts(transaction);

      if (report.overallStatus === 'VALID') {
        return {
          isValid: true,
          message: 'Chart of Accounts validation passed',
        };
      }

      if (report.overallStatus === 'WARNING') {
        return {
          isValid: true,
          message: `Chart of Accounts validation passed with ${report.summary.warningAccounts} warnings`,
        };
      }

      return {
        isValid: false,
        message: `Chart of Accounts validation failed with ${report.summary.errorAccounts} errors`,
      };
    } catch (error) {
      return {
        isValid: false,
        message: `Validation check failed: ${error.message}`,
      };
    }
  }

  /**
   * Validate specific account types
   */
  static async validateAccountType(
    accountType: AccountType,
    transaction?: Transaction
  ): Promise<AccountValidationDetail[]> {
    try {
      const accounts = await ChartOfAccount.findAll({
        where: {
          type: accountType,
          is_active: true,
        },
        transaction,
      });

      const results = await Promise.all(
        accounts.map(account => this.validateSingleAccount(account, transaction))
      );

      return results;
    } catch (error) {
      throw new BadException('Account Type Validation Failed', 500, `Failed to validate ${accountType} accounts: ${error.message}`);
    }
  }

  /**
   * Get validation statistics
   */
  static async getValidationStatistics(
    transaction?: Transaction
  ): Promise<{
    totalAccounts: number;
    validAccounts: number;
    warningAccounts: number;
    errorAccounts: number;
    missingAccounts: number;
    lastValidation: Date;
  }> {
    try {
      const report = await this.validateAllAccounts(transaction);

      return {
        totalAccounts: report.summary.totalAccounts,
        validAccounts: report.summary.validAccounts,
        warningAccounts: report.summary.warningAccounts,
        errorAccounts: report.summary.errorAccounts,
        missingAccounts: report.summary.missingAccounts,
        lastValidation: report.timestamp,
      };
    } catch (error) {
      throw new BadException('Validation Statistics Failed', 500, `Failed to get validation statistics: ${error.message}`);
    }
  }
}
