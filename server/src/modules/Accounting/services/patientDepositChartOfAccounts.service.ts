import { ChartOfAccount } from '../../../database/models/chartOfAccount';
import { AccountType } from '../enums';
import { BadException } from '../../../common/util/api-error';

export interface RequiredAccount {
  code: string;
  name: string;
  type: AccountType;
  description: string;
  parent_code?: string;
}

export class ComprehensiveChartOfAccountsService {
  // Required accounts for patient deposits AND comprehensive payment processing
  private static readonly REQUIRED_ACCOUNTS: RequiredAccount[] = [
    // === EXISTING PATIENT DEPOSIT ACCOUNTS ===
    {
      code: '2001',
      name: 'Patient Deposits Payable',
      type: AccountType.LIABILITY,
      description: 'Liability account for patient deposits held by the hospital'
    },
    {
      code: '1001',
      name: 'Cash on Hand',
      type: AccountType.ASSET,
      description: 'Cash available for immediate use in hospital operations'
    },
    {
      code: '1002',
      name: 'Bank Accounts',
      type: AccountType.ASSET,
      description: 'Hospital bank account balances'
    },
    {
      code: '1003',
      name: 'POS Terminal Receivables',
      type: AccountType.ASSET,
      description: 'Amounts received via POS terminals before settlement to bank accounts'
    },
    {
      code: '4001',
      name: 'Service Revenue',
      type: AccountType.REVENUE,
      description: 'Revenue from medical services provided to patients'
    },
    {
      code: '4002',
      name: 'Deposit Administration Fee',
      type: AccountType.REVENUE,
      description: 'Fees charged for managing patient deposits'
    },
    
    // === NEW PAYMENT PROCESSING ACCOUNTS ===
    {
      code: '1004',
      name: 'Cash Register',
      type: AccountType.ASSET,
      description: 'Cash register for daily cash collections and disbursements'
    },
    {
      code: '1101',
      name: 'Insurance Receivables',
      type: AccountType.ASSET,
      description: 'Amounts receivable from insurance providers for medical services'
    },
    {
      code: '1102',
      name: 'Bank Transfer Receivables',
      type: AccountType.ASSET,
      description: 'Amounts receivable from bank transfers before clearing to bank accounts'
    }
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
        'Failed to ensure required Chart of Accounts exist',
        500,
        error.message
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
        where: { code: requiredAccount.code }
      });

      if (!account) {
        // Create the account if it doesn't exist
        account = await ChartOfAccount.create({
          code: requiredAccount.code,
          name: requiredAccount.name,
          type: requiredAccount.type,
          description: requiredAccount.description,
          is_active: true,
          balance: 0,
          allow_manual_entries: true
        });

        console.log(`Created Chart of Account: ${requiredAccount.name} (${requiredAccount.code})`);
      } else {
        // Update existing account if needed
        const needsUpdate = 
          account.name !== requiredAccount.name ||
          account.type !== requiredAccount.type ||
          account.description !== requiredAccount.description ||
          !account.is_active;

        if (needsUpdate) {
          await account.update({
            name: requiredAccount.name,
            type: requiredAccount.type,
            description: requiredAccount.description,
            is_active: true
          });

          console.log(`Updated Chart of Account: ${requiredAccount.name} (${requiredAccount.code})`);
        }
      }
    } catch (error) {
      throw new BadException(
        `Failed to ensure account ${requiredAccount.code} exists`,
        500,
        error.message
      );
    }
  }

  /**
   * Get required account by code
   */
  static async getRequiredAccount(code: string): Promise<ChartOfAccount | null> {
    try {
      return await ChartOfAccount.findOne({
        where: { code, is_active: true }
      });
    } catch (error) {
      throw new BadException(
        `Failed to get required account ${code}`,
        500,
        error.message
      );
    }
  }

  /**
   * Get all required accounts for patient deposits
   */
  static async getAllRequiredAccounts(): Promise<ChartOfAccount[]> {
    try {
      const codes = this.REQUIRED_ACCOUNTS.map(account => account.code);
      return await ChartOfAccount.findAll({
        where: { 
          code: codes,
          is_active: true 
        }
      });
    } catch (error) {
      throw new BadException(
        'Failed to get all required accounts',
        500,
        error.message
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
          is_active: true 
        },
        attributes: ['code']
      });

      const existingCodes = existingAccounts.map(account => account.code);
      const missingCodes = codes.filter(code => !existingCodes.includes(code));

      return {
        valid: missingCodes.length === 0,
        missing: missingCodes
      };
    } catch (error) {
      throw new BadException(
        'Failed to validate required accounts',
        500,
        error.message
      );
    }
  }

  /**
   * Get account balance for a specific account type
   */
  static async getAccountBalance(accountCode: string): Promise<number> {
    try {
      const account = await this.getRequiredAccount(accountCode);
      if (!account) {
        throw new BadException(`Required account ${accountCode} not found`, 404);
      }
      return account.balance || 0;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException(
        `Failed to get account balance for ${accountCode}`,
        500,
        error.message
      );
    }
  }
}
