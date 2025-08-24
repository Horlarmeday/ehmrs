import { ComprehensiveChartOfAccountsService } from './comprehensiveChartOfAccounts.service';
import { AccountValidationService } from './accountValidation.service';
import { logger } from '../../../core/helpers/logger';

export class AccountingStartupService {
  /**
   * Initialize all required accounting components on system startup
   */
  static async initialize(): Promise<void> {
    try {
      logger.info('🚀 Initializing Accounting System...');

      // Ensure required Chart of Accounts exist for comprehensive payment processing
      logger.info('📊 Ensuring required Chart of Accounts for comprehensive payment processing...');
      await ComprehensiveChartOfAccountsService.ensureRequiredAccountsExist();

      // Run comprehensive validation
      logger.info('🔍 Running comprehensive Chart of Accounts validation...');
      const validationReport = await AccountValidationService.quickValidationCheck();
      
      if (validationReport.isValid) {
        logger.info(`✅ ${validationReport.message}`);
      } else {
        logger.warn(`⚠️  ${validationReport.message}`);
        
        // Get detailed validation report for warnings
        const detailedReport = await AccountValidationService.validateAllAccounts();
        if (detailedReport.summary.warningAccounts > 0) {
          logger.warn(`⚠️  ${detailedReport.summary.warningAccounts} account(s) have warnings`);
        }
        if (detailedReport.summary.missingAccounts > 0) {
          logger.warn(`⚠️  ${detailedReport.summary.missingAccounts} required account(s) are missing`);
        }
      }

      logger.info('🎉 Accounting System initialization completed successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Accounting System:', error);
      throw error;
    }
  }

  /**
   * Validate accounting system configuration
   */
  static async validateConfiguration(): Promise<{ valid: boolean; issues: string[] }> {
    try {
      const issues: string[] = [];

      // Validate Chart of Accounts
      const accountValidation = await ComprehensiveChartOfAccountsService.validateRequiredAccounts();
      if (!accountValidation.valid) {
        issues.push(`Missing Chart of Accounts: ${accountValidation.missing.join(', ')}`);
      }

      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      return {
        valid: false,
        issues: [`Configuration validation failed: ${error.message}`]
      };
    }
  }
}
