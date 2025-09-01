import { ChartOfAccount } from '../../../database/models/chartOfAccount';
import { AccountType } from '../enums';
import { BadException } from '../../../common/util/api-error';
import { Transaction, Op } from 'sequelize';

export interface ConflictResolutionResult {
  hasConflict: boolean;
  conflictType: ConflictType;
  conflictDetails: string;
  suggestedResolution: ResolutionStrategy;
  alternativeCode?: string;
  conflictingAccount?: ChartOfAccount;
}

export interface AccountValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestedChanges: string[];
}

export enum ConflictType {
  DUPLICATE_CODE = 'DUPLICATE_CODE',
  DUPLICATE_NAME = 'DUPLICATE_NAME',
  INVALID_HIERARCHY = 'INVALID_HIERARCHY',
  TYPE_MISMATCH = 'TYPE_MISMATCH',
  CIRCULAR_REFERENCE = 'CIRCULAR_REFERENCE',
  RESERVED_CODE = 'RESERVED_CODE',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
}

export enum ResolutionStrategy {
  GENERATE_NEW_CODE = 'GENERATE_NEW_CODE',
  UPDATE_EXISTING = 'UPDATE_EXISTING',
  MERGE_ACCOUNTS = 'MERGE_ACCOUNTS',
  REJECT_OPERATION = 'REJECT_OPERATION',
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION',
}

export class AccountCodeConflictResolutionService {
  // Reserved account codes that cannot be used for manual creation
  private static readonly RESERVED_CODES = [
    '1001',
    '1002',
    '1003',
    '1004', // Asset accounts
    '1101',
    '1102', // Receivable accounts
    '2001', // Liability accounts
    '4001',
    '4002', // Revenue accounts
  ];

  // Business rules for account hierarchies
  private static readonly HIERARCHY_RULES = {
    [AccountType.ASSET]: ['1000', '1999'],
    [AccountType.LIABILITY]: ['2000', '2999'],
    [AccountType.EQUITY]: ['3000', '3999'],
    [AccountType.REVENUE]: ['4000', '4999'],
    [AccountType.EXPENSE]: ['5000', '5999'],
  };

  /**
   * Comprehensive validation before creating or updating an account
   */
  static async validateAccountCode(
    code: string,
    name: string,
    type: AccountType,
    parentId?: number,
    existingAccountId?: number,
    transaction?: Transaction
  ): Promise<AccountValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestedChanges: string[] = [];

    try {
      // 1. Check for duplicate code
      const duplicateCode = await this.checkDuplicateCode(code, existingAccountId, transaction);
      if (duplicateCode.hasConflict) {
        errors.push(`Account code '${code}' already exists`);
        suggestedChanges.push(`Try code: ${duplicateCode.alternativeCode}`);
      }

      // 2. Check for duplicate name
      const duplicateName = await this.checkDuplicateName(name, existingAccountId, transaction);
      if (duplicateName.hasConflict) {
        warnings.push(`Account name '${name}' is similar to existing account`);
      }

      // 3. Check reserved codes
      if (this.isReservedCode(code)) {
        errors.push(`Code '${code}' is reserved for system use`);
        const alternative = await this.generateAlternativeCode(code, type, transaction);
        suggestedChanges.push(`Use alternative code: ${alternative}`);
      }

      // 4. Check business rules
      const businessRules = this.validateBusinessRules(code, type);
      if (!businessRules.isValid) {
        errors.push(...businessRules.errors);
        suggestedChanges.push(...businessRules.suggestedChanges);
      }

      // 5. Check hierarchy rules
      if (parentId) {
        const hierarchyValidation = await this.validateHierarchy(code, type, parentId, transaction);
        if (!hierarchyValidation.isValid) {
          errors.push(...hierarchyValidation.errors);
          warnings.push(...hierarchyValidation.warnings);
        }
      }

      // 6. Check for circular references
      if (parentId && existingAccountId) {
        const circularCheck = await this.checkCircularReference(
          existingAccountId,
          parentId,
          transaction
        );
        if (circularCheck.hasConflict) {
          errors.push('Circular reference detected in account hierarchy');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestedChanges,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error.message}`],
        warnings: [],
        suggestedChanges: [],
      };
    }
  }

  /**
   * Check for duplicate account codes
   */
  static async checkDuplicateCode(
    code: string,
    existingAccountId?: number,
    transaction?: Transaction
  ): Promise<ConflictResolutionResult> {
    try {
      const whereClause: any = { code };
      if (existingAccountId) {
        whereClause.id = { [Op.ne]: existingAccountId };
      }

      const existingAccount = await ChartOfAccount.findOne({
        where: whereClause,
        transaction,
      });

      if (existingAccount) {
        const alternativeCode = await this.generateAlternativeCode(
          code,
          existingAccount.type as AccountType,
          transaction
        );

        return {
          hasConflict: true,
          conflictType: ConflictType.DUPLICATE_CODE,
          conflictDetails: `Account code '${code}' already exists for account '${existingAccount.name}'`,
          suggestedResolution: ResolutionStrategy.GENERATE_NEW_CODE,
          alternativeCode,
          conflictingAccount: existingAccount,
        };
      }

      return {
        hasConflict: false,
        conflictType: ConflictType.DUPLICATE_CODE,
        conflictDetails: '',
        suggestedResolution: ResolutionStrategy.GENERATE_NEW_CODE,
      };
    } catch (error) {
      throw new BadException('Duplicate Code Check Failed', 500, `Failed to check duplicate code: ${error.message}`);
    }
  }

  /**
   * Check for duplicate account names
   */
  static async checkDuplicateName(
    name: string,
    existingAccountId?: number,
    transaction?: Transaction
  ): Promise<ConflictResolutionResult> {
    try {
      const whereClause: any = {
        name: { [Op.like]: `%${name}%` }, // Case-insensitive partial match
      };
      if (existingAccountId) {
        whereClause.id = { [Op.ne]: existingAccountId };
      }

      const similarAccounts = await ChartOfAccount.findAll({
        where: whereClause,
        limit: 5,
        transaction,
      });

      if (similarAccounts.length > 0) {
        return {
          hasConflict: true,
          conflictType: ConflictType.DUPLICATE_NAME,
          conflictDetails: `Similar account names found: ${similarAccounts
            .map(acc => acc.name)
            .join(', ')}`,
          suggestedResolution: ResolutionStrategy.MANUAL_INTERVENTION,
          conflictingAccount: similarAccounts[0],
        };
      }

      return {
        hasConflict: false,
        conflictType: ConflictType.DUPLICATE_NAME,
        conflictDetails: '',
        suggestedResolution: ResolutionStrategy.GENERATE_NEW_CODE,
      };
    } catch (error) {
      throw new BadException('Duplicate Name Check Failed', 500, `Failed to check duplicate name: ${error.message}`);
    }
  }

  /**
   * Check if code is reserved
   */
  static isReservedCode(code: string): boolean {
    return this.RESERVED_CODES.includes(code);
  }

  /**
   * Validate business rules for account codes
   */
  static validateBusinessRules(code: string, type: AccountType): AccountValidationResult {
    const errors: string[] = [];
    const suggestedChanges: string[] = [];

    // Check if code follows the numbering convention for the account type
    const rules = this.HIERARCHY_RULES[type];
    if (rules) {
      const codeNum = parseInt(code);
      const [minRange, maxRange] = rules.map(r => parseInt(r));

      if (isNaN(codeNum) || codeNum < minRange || codeNum > maxRange) {
        errors.push(`${type} accounts should have codes between ${minRange} and ${maxRange}`);
        suggestedChanges.push(`Consider using a code in the ${minRange}-${maxRange} range`);
      }
    }

    // Validate code format
    if (!/^\d{4}$/.test(code)) {
      errors.push('Account codes should be 4-digit numbers');
      suggestedChanges.push('Use a 4-digit numeric code (e.g., 1001, 2001)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      suggestedChanges,
    };
  }

  /**
   * Validate account hierarchy
   */
  static async validateHierarchy(
    code: string,
    type: AccountType,
    parentId: number,
    transaction?: Transaction
  ): Promise<AccountValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const parent = await ChartOfAccount.findByPk(parentId, { transaction });

      if (!parent) {
        errors.push('Parent account not found');
        return { isValid: false, errors, warnings, suggestedChanges: [] };
      }

      // Check if parent and child have compatible types
      if (parent.type !== type) {
        warnings.push(
          `Parent account type (${parent.type}) differs from child account type (${type})`
        );
      }

      // Check if child code is logically under parent
      const parentCode = parseInt(parent.code);
      const childCode = parseInt(code);

      if (!isNaN(parentCode) && !isNaN(childCode)) {
        const parentRange = Math.floor(parentCode / 100) * 100;
        const childRange = Math.floor(childCode / 100) * 100;

        if (parentRange !== childRange) {
          warnings.push('Child account code should be in the same range as parent account');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestedChanges: [],
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Hierarchy validation failed: ${error.message}`],
        warnings: [],
        suggestedChanges: [],
      };
    }
  }

  /**
   * Check for circular references in hierarchy
   */
  static async checkCircularReference(
    accountId: number,
    newParentId: number,
    transaction?: Transaction
  ): Promise<ConflictResolutionResult> {
    try {
      // Check if the new parent is a descendant of the current account
      const isDescendant = await this.isDescendantOf(newParentId, accountId, transaction);

      if (isDescendant) {
        return {
          hasConflict: true,
          conflictType: ConflictType.CIRCULAR_REFERENCE,
          conflictDetails: 'Setting this parent would create a circular reference',
          suggestedResolution: ResolutionStrategy.REJECT_OPERATION,
        };
      }

      return {
        hasConflict: false,
        conflictType: ConflictType.CIRCULAR_REFERENCE,
        conflictDetails: '',
        suggestedResolution: ResolutionStrategy.GENERATE_NEW_CODE,
      };
    } catch (error) {
      throw new BadException('Circular Reference Check Failed', 500, `Failed to check circular reference: ${error.message}`);
    }
  }

  /**
   * Check if an account is a descendant of another
   */
  private static async isDescendantOf(
    potentialDescendant: number,
    ancestor: number,
    transaction?: Transaction
  ): Promise<boolean> {
    const account = await ChartOfAccount.findByPk(potentialDescendant, { transaction });

    if (!account || !account.parent_id) {
      return false;
    }

    if (account.parent_id === ancestor) {
      return true;
    }

    return this.isDescendantOf(account.parent_id, ancestor, transaction);
  }

  /**
   * Generate alternative account code
   */
  static async generateAlternativeCode(
    originalCode: string,
    accountType: AccountType,
    transaction?: Transaction
  ): Promise<string> {
    try {
      const baseCode = parseInt(originalCode);
      if (isNaN(baseCode)) {
        // If original code is not numeric, generate based on type
        const rules = this.HIERARCHY_RULES[accountType];
        if (rules) {
          const minRange = parseInt(rules[0]);
          return await this.findAvailableCodeInRange(minRange, minRange + 999, transaction);
        }
        return '9999'; // Fallback
      }

      // Try incrementing the code
      let newCode = baseCode + 1;
      const maxAttempts = 100;
      let attempts = 0;

      while (attempts < maxAttempts) {
        const codeStr = newCode.toString().padStart(4, '0');
        const existing = await ChartOfAccount.findOne({
          where: { code: codeStr },
          transaction,
        });

        if (!existing) {
          return codeStr;
        }

        newCode++;
        attempts++;
      }

      // If all attempts failed, find available code in the appropriate range
      const rules = this.HIERARCHY_RULES[accountType];
      if (rules) {
        const [minRange, maxRange] = rules.map(r => parseInt(r));
        return await this.findAvailableCodeInRange(minRange, maxRange, transaction);
      }

      throw new Error('Unable to generate alternative code');
    } catch (error) {
      throw new BadException('Alternative Code Generation Failed', 500, `Failed to generate alternative code: ${error.message}`);
    }
  }

  /**
   * Find available code in a specific range
   */
  private static async findAvailableCodeInRange(
    min: number,
    max: number,
    transaction?: Transaction
  ): Promise<string> {
    for (let code = min; code <= max; code++) {
      const codeStr = code.toString().padStart(4, '0');
      const existing = await ChartOfAccount.findOne({
        where: { code: codeStr },
        transaction,
      });

      if (!existing) {
        return codeStr;
      }
    }

    throw new Error(`No available codes in range ${min}-${max}`);
  }

  /**
   * Resolve conflicts automatically where possible
   */
  static async resolveConflicts(
    accountData: any,
    existingAccountId?: number,
    transaction?: Transaction
  ): Promise<{ resolved: boolean; resolvedData: any; message: string }> {
    try {
      const validation = await this.validateAccountCode(
        accountData.code,
        accountData.name,
        accountData.type,
        accountData.parent_id,
        existingAccountId,
        transaction
      );

      if (validation.isValid) {
        return {
          resolved: true,
          resolvedData: accountData,
          message: 'No conflicts detected',
        };
      }

      // Try to auto-resolve code conflicts
      if (validation.errors.some(error => error.includes('already exists'))) {
        const alternativeCode = await this.generateAlternativeCode(
          accountData.code,
          accountData.type,
          transaction
        );

        return {
          resolved: true,
          resolvedData: {
            ...accountData,
            code: alternativeCode,
          },
          message: `Code conflict resolved. Changed code from '${accountData.code}' to '${alternativeCode}'`,
        };
      }

      // For other conflicts, require manual intervention
      return {
        resolved: false,
        resolvedData: accountData,
        message: `Manual intervention required: ${validation.errors.join(', ')}`,
      };
    } catch (error) {
      throw new BadException('Conflict Resolution Failed', 500, `Failed to resolve conflicts: ${error.message}`);
    }
  }

  /**
   * Get conflict resolution suggestions
   */
  static async getConflictResolutionSuggestions(
    accountData: any,
    existingAccountId?: number,
    transaction?: Transaction
  ): Promise<{
    suggestions: string[];
    alternativeCodes: string[];
    warnings: string[];
  }> {
    try {
      const validation = await this.validateAccountCode(
        accountData.code,
        accountData.name,
        accountData.type,
        accountData.parent_id,
        existingAccountId,
        transaction
      );

      const alternativeCodes: string[] = [];

      // Generate multiple alternative codes
      for (let i = 0; i < 3; i++) {
        try {
          const alt = await this.generateAlternativeCode(
            accountData.code,
            accountData.type,
            transaction
          );
          if (!alternativeCodes.includes(alt)) {
            alternativeCodes.push(alt);
          }
        } catch (error) {
          // Ignore errors in alternative generation
        }
      }

      return {
        suggestions: validation.suggestedChanges,
        alternativeCodes,
        warnings: validation.warnings,
      };
    } catch (error) {
      throw new BadException('Conflict Suggestions Failed', 500, `Failed to get conflict resolution suggestions: ${error.message}`);
    }
  }
}
