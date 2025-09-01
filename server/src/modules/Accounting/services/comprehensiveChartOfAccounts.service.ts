import { ChartOfAccount } from '../../../database/models/chartOfAccount';
import { AccountType } from '../enums';
import { BadException } from '../../../common/util/api-error';
import { AccountCodeConflictResolutionService } from './accountCodeConflictResolution.service';

export interface RequiredAccount {
  code: string;
  name: string;
  type: AccountType;
  description: string;
  parent_code?: string;
}

export class ComprehensiveChartOfAccountsService {
  // Required accounts for comprehensive payment processing
  static readonly REQUIRED_ACCOUNTS: RequiredAccount[] = [
    // === PATIENT DEPOSIT ACCOUNTS ===
    {
      code: '2001',
      name: 'Patient Deposits Payable',
      type: AccountType.LIABILITY,
      description: 'Liability account for patient deposits held by the hospital',
    },
    {
      code: '1001',
      name: 'Cash on Hand',
      type: AccountType.ASSET,
      description: 'Cash available for immediate use in hospital operations',
    },
    {
      code: '1002',
      name: 'Bank Accounts',
      type: AccountType.ASSET,
      description: 'Hospital bank account balances',
    },
    {
      code: '1003',
      name: 'POS Terminal Receivables',
      type: AccountType.ASSET,
      description: 'Amounts received via POS terminals before settlement to bank accounts',
    },
    {
      code: '4001',
      name: 'Service Revenue',
      type: AccountType.REVENUE,
      description: 'Revenue from medical services provided to patients',
    },
    {
      code: '4002',
      name: 'Deposit Administration Fee',
      type: AccountType.REVENUE,
      description: 'Fees charged for managing patient deposits',
    },

    // === PAYMENT PROCESSING ACCOUNTS ===
    {
      code: '1004',
      name: 'Cash Register',
      type: AccountType.ASSET,
      description: 'Cash register for daily cash collections and disbursements',
    },
    {
      code: '1101',
      name: 'Insurance Receivables',
      type: AccountType.ASSET,
      description: 'Amounts receivable from insurance providers for medical services',
    },
    {
      code: '1102',
      name: 'Bank Transfer Receivables',
      type: AccountType.ASSET,
      description: 'Amounts receivable from bank transfers before clearing to bank accounts',
    },
    {
      code: '1100',
      name: 'Accounts Receivable',
      type: AccountType.ASSET,
      description: 'General accounts receivable for outstanding payments and claims',
    },
    {
      code: '4000',
      name: 'General Revenue',
      type: AccountType.REVENUE,
      description: 'General revenue account for medical services and other income',
    },
    {
      code: '5000',
      name: 'Operating Expenses',
      type: AccountType.EXPENSE,
      description: 'All banking-related fees and charges',
    },
  ];

  /**
   * Ensure all required Chart of Accounts exist for comprehensive payment processing
   */
  static async ensureRequiredAccountsExist(): Promise<void> {
    try {
      for (const requiredAccount of this.REQUIRED_ACCOUNTS) {
        await this.ensureAccountExists(requiredAccount);
      }
    } catch (error) {
      throw new BadException(
        'Required Accounts Creation Failed',
        500,
        `Failed to ensure required Chart of Accounts exist: ${error.message}`
      );
    }
  }

  /**
   * Check if a specific account exists, create if it doesn't
   */
  private static async ensureAccountExists(requiredAccount: RequiredAccount): Promise<void> {
    try {
      // Check if account exists by code
      let account = await ChartOfAccount.findOne({
        where: { code: requiredAccount.code },
      });

      if (!account) {
        // Use conflict resolution service to validate before creation
        const accountData = {
          code: requiredAccount.code,
          name: requiredAccount.name,
          type: requiredAccount.type,
          description: requiredAccount.description,
          is_active: true,
          balance: 0,
          allow_manual_entries: true,
        };

        // Validate using conflict resolution service
        const validation = await AccountCodeConflictResolutionService.validateAccountCode(
          accountData.code,
          accountData.name,
          accountData.type
        );

        if (!validation.isValid) {
          console.warn(
            `⚠️  Validation warnings for account ${
              requiredAccount.code
            }: ${validation.warnings.join(', ')}`
          );
        }

        // Create the account if it doesn't exist
        account = await ChartOfAccount.create(accountData);

        console.log(
          `✅ Created Chart of Account: ${requiredAccount.name} (${requiredAccount.code})`
        );
      } else {
        // Update existing account if needed
        const needsUpdate =
          account.name !== requiredAccount.name ||
          account.type !== requiredAccount.type ||
          account.description !== requiredAccount.description ||
          !account.is_active;

        if (needsUpdate) {
          // Validate updates using conflict resolution service
          const validation = await AccountCodeConflictResolutionService.validateAccountCode(
            requiredAccount.code,
            requiredAccount.name,
            requiredAccount.type,
            account.parent_id || undefined,
            account.id
          );

          if (!validation.isValid) {
            console.warn(
              `⚠️  Validation warnings for account update ${
                requiredAccount.code
              }: ${validation.warnings.join(', ')}`
            );
          }

          await account.update({
            name: requiredAccount.name,
            type: requiredAccount.type,
            description: requiredAccount.description,
            is_active: true,
          });

          console.log(
            `✅ Updated Chart of Account: ${requiredAccount.name} (${requiredAccount.code})`
          );
        }
      }
    } catch (error) {
      throw new BadException(
        'Account Creation Failed',
        500,
        `Failed to ensure account ${requiredAccount.code} exists: ${error.message}`
      );
    }
  }

  /**
   * Get required account by code
   */
  static async getRequiredAccount(code: string): Promise<ChartOfAccount | null> {
    try {
      return await ChartOfAccount.findOne({
        where: { code, is_active: true },
      });
    } catch (error) {
      throw new BadException(
        'Account Retrieval Failed',
        500,
        `Failed to get required account ${code}: ${error.message}`
      );
    }
  }

  /**
   * Get all required accounts
   */
  static async getAllRequiredAccounts(): Promise<ChartOfAccount[]> {
    try {
      const codes = this.REQUIRED_ACCOUNTS.map(account => account.code);
      return await ChartOfAccount.findAll({
        where: {
          code: codes,
          is_active: true,
        },
        order: [['code', 'ASC']],
      });
    } catch (error) {
      throw new BadException(
        'Accounts Retrieval Failed',
        500,
        `Failed to get all required accounts: ${error.message}`
      );
    }
  }

  /**
   * Validate that all required accounts exist and are active
   */
  static async validateRequiredAccounts(): Promise<{ valid: boolean; missing: string[] }> {
    try {
      const codes = this.REQUIRED_ACCOUNTS.map(account => account.code);
      const existingAccounts = await ChartOfAccount.findAll({
        where: {
          code: codes,
          is_active: true,
        },
        attributes: ['code'],
      });

      const existingCodes = existingAccounts.map(account => account.code);
      const missingCodes = codes.filter(code => !existingCodes.includes(code));

      return {
        valid: missingCodes.length === 0,
        missing: missingCodes,
      };
    } catch (error) {
      throw new BadException(
        'Account Validation Failed',
        500,
        `Failed to validate required accounts: ${error.message}`
      );
    }
  }

  /**
   * Get account balance for a specific account type
   */
  static async getAccountBalance(accountCode: string): Promise<number> {
    try {
      const account = await this.getRequiredAccount(accountCode);
      return account ? account.balance || 0 : 0;
    } catch (error) {
      throw new BadException(
        'Account Balance Retrieval Failed',
        500,
        `Failed to get account balance for ${accountCode}: ${error.message}`
      );
    }
  }

  /**
   * Get accounts by type for payment processing
   */
  static async getAccountsByType(accountType: AccountType): Promise<ChartOfAccount[]> {
    try {
      return await ChartOfAccount.findAll({
        where: {
          type: accountType,
          is_active: true,
        },
        order: [['code', 'ASC']],
      });
    } catch (error) {
      throw new BadException(
        'Accounts by Type Retrieval Failed',
        500,
        `Failed to get accounts by type ${accountType}: ${error.message}`
      );
    }
  }

  /**
   * Get payment method specific accounts
   */
  static async getPaymentMethodAccounts(paymentMethod: string): Promise<ChartOfAccount[]> {
    try {
      const methodAccountMap: { [key: string]: string[] } = {
        CASH: ['1001', '1004'], // Cash on Hand, Cash Register
        CARD: ['1003'], // POS Terminal Receivables
        BANK_TRANSFER: ['1102'], // Bank Transfer Receivables
        INSURANCE: ['1101'], // Insurance Receivables
        DEPOSIT: ['2001'], // Patient Deposits Payable
        MOBILE_MONEY: ['1100'], // Accounts Receivable
        WAIVER: ['4000'], // General Revenue
      };

      const accountCodes = methodAccountMap[paymentMethod] || [];
      if (accountCodes.length === 0) {
        return [];
      }

      return await ChartOfAccount.findAll({
        where: {
          code: accountCodes,
          is_active: true,
        },
        order: [['code', 'ASC']],
      });
    } catch (error) {
      throw new BadException(
        'Payment Method Accounts Retrieval Failed',
        500,
        `Failed to get payment method accounts for ${paymentMethod}: ${error.message}`
      );
    }
  }
}
