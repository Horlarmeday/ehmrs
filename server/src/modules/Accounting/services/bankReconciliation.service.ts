import { Transaction } from 'sequelize';
import { BadException } from '../../../common/util/api-error';
import { 
  ClinicalPayment,
  Staff,
  BankAccount,
  BankTransfer,
  JournalEntry,
  JournalEntryLine
} from '../../../database/models';
import { 
  PaymentStatus,
  BankTransferStatus,
  JournalEntryStatus
} from '../enums';
import { logger } from '../../../core/helpers/logger';

// ===== BANK RECONCILIATION INTERFACES =====

export interface BankStatementData {
  bank_account_id: number;
  statement_date: Date;
  statement_reference: string;
  opening_balance: number;
  closing_balance: number;
  transactions: BankStatementTransaction[];
  imported_by: number;
  notes?: string;
}

export interface BankStatementTransaction {
  transaction_date: Date;
  description: string;
  reference: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  bank_reference: string;
  counterparty?: string;
  category?: string;
}

export interface ReconciliationMatch {
  bank_transaction: BankStatementTransaction;
  system_transaction: ClinicalPayment | BankTransfer;
  match_confidence: number;
  match_type: 'EXACT' | 'PARTIAL' | 'FUZZY';
  match_reason: string;
}

export interface ReconciliationResult {
  statement_id: string;
  total_transactions: number;
  matched_transactions: number;
  unmatched_transactions: number;
  exceptions: ReconciliationException[];
  reconciliation_date: Date;
  reconciled_by: number;
  notes?: string;
}

export interface ReconciliationException {
  type: 'AMOUNT_MISMATCH' | 'DATE_MISMATCH' | 'REFERENCE_MISMATCH' | 'DUPLICATE' | 'MISSING_SYSTEM' | 'MISSING_BANK';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  bank_transaction?: BankStatementTransaction;
  system_transaction?: ClinicalPayment | BankTransfer;
  suggested_action: string;
}

// ===== BANK RECONCILIATION SERVICE =====

/**
 * Bank Reconciliation Service
 * 
 * This service handles comprehensive bank reconciliation including:
 * - Bank statement import and processing
 * - Automated transaction matching
 * - Exception handling and resolution
 * - Reconciliation approval workflow
 * - Audit trail and reporting
 */
export class BankReconciliationService {

  // ===== BANK STATEMENT IMPORT =====

  /**
   * Import bank statement from various formats
   */
  static async importBankStatement(
    statementData: BankStatementData,
    transaction?: Transaction
  ): Promise<ReconciliationResult> {
    try {
      // Validate bank account
      const bankAccount = await BankAccount.findByPk(statementData.bank_account_id);
      if (!bankAccount) {
        throw new BadException('Bank Account Not Found', 404, 'The specified bank account does not exist');
      }

      // Validate statement data
      await this.validateBankStatement(statementData);

      // Process and store statement
      const statement = await this.storeBankStatement(statementData, transaction);

      // Perform automated reconciliation
      const reconciliationResult = await this.performAutomatedReconciliation(
        statement,
        statementData.transactions,
        transaction
      );

      // Log import activity
      await this.logBankStatementImport(statement, reconciliationResult, transaction);

      return reconciliationResult;

    } catch (error) {
      logger.error('Bank statement import failed:', error);
      throw new BadException(
        'Bank Statement Import Failed',
        500,
        `Failed to import bank statement: ${error.message}`
      );
    }
  }

  /**
   * Validate bank statement data
   */
  private static async validateBankStatement(statementData: BankStatementData): Promise<void> {
    // Validate opening and closing balance consistency
    const calculatedBalance = statementData.transactions.reduce((balance, transaction) => {
      if (transaction.type === 'CREDIT') {
        return balance + transaction.amount;
      } else {
        return balance - transaction.amount;
      }
    }, statementData.opening_balance);

    if (Math.abs(calculatedBalance - statementData.closing_balance) > 0.01) {
      throw new BadException(
        'Invalid Statement Balance',
        400,
        'Statement balances do not reconcile with transaction totals'
      );
    }

    // Validate transaction dates
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    for (const transaction of statementData.transactions) {
      if (transaction.transaction_date > today) {
        throw new BadException(
          'Invalid Transaction Date',
          400,
          'Transaction date cannot be in the future'
        );
      }
      
      if (transaction.transaction_date < thirtyDaysAgo) {
        throw new BadException(
          'Transaction Too Old',
          400,
          'Transactions older than 30 days are not supported'
        );
      }
    }

    // Validate reference uniqueness
    const references = statementData.transactions.map(t => t.reference);
    const uniqueReferences = new Set(references);
    if (references.length !== uniqueReferences.size) {
      throw new BadException(
        'Duplicate References',
        400,
        'Bank statement contains duplicate transaction references'
      );
    }
  }

  /**
   * Store bank statement in database
   */
  private static async storeBankStatement(
    statementData: BankStatementData,
    transaction?: Transaction
  ): Promise<any> {
    // In a production system, you would create a BankStatement model
    // For now, we'll return a structured object
    return {
      id: `BS-${Date.now()}`,
      bank_account_id: statementData.bank_account_id,
      statement_date: statementData.statement_date,
      statement_reference: statementData.statement_reference,
      opening_balance: statementData.opening_balance,
      closing_balance: statementData.closing_balance,
      total_transactions: statementData.transactions.length,
      imported_by: statementData.imported_by,
      imported_at: new Date(),
      notes: statementData.notes,
    };
  }

  // ===== AUTOMATED RECONCILIATION =====

  /**
   * Perform automated reconciliation of bank transactions
   */
  static async performAutomatedReconciliation(
    statement: any,
    bankTransactions: BankStatementTransaction[],
    transaction?: Transaction
  ): Promise<ReconciliationResult> {
    const matches: ReconciliationMatch[] = [];
    const exceptions: ReconciliationException[] = [];
    let matchedCount = 0;

    // Get system transactions for the period
    const systemTransactions = await this.getSystemTransactionsForReconciliation(
      statement.bank_account_id,
      statement.statement_date,
      transaction
    );

    // Perform matching for each bank transaction
    for (const bankTransaction of bankTransactions) {
      try {
        const match = await this.findBestMatch(bankTransaction, systemTransactions);
        
        if (match && match.match_confidence >= 0.8) {
          matches.push(match);
          matchedCount++;
          
          // Mark system transaction as reconciled
          await this.markTransactionReconciled(match.system_transaction, match, transaction);
        } else {
          // Create exception for unmatched transaction
          exceptions.push(this.createUnmatchedException(bankTransaction));
        }
      } catch (error) {
        logger.error(`Reconciliation error for transaction ${bankTransaction.reference}:`, error);
        exceptions.push(this.createErrorException(bankTransaction, error.message));
      }
    }

    // Create reconciliation result
    const reconciliationResult: ReconciliationResult = {
      statement_id: statement.id,
      total_transactions: bankTransactions.length,
      matched_transactions: matchedCount,
      unmatched_transactions: bankTransactions.length - matchedCount,
      exceptions,
      reconciliation_date: new Date(),
      reconciled_by: statement.imported_by,
      notes: `Automated reconciliation completed with ${matchedCount} matches and ${exceptions.length} exceptions`,
    };

    return reconciliationResult;
  }

  /**
   * Find best matching system transaction for bank transaction
   */
  private static async findBestMatch(
    bankTransaction: BankStatementTransaction,
    systemTransactions: Array<ClinicalPayment | BankTransfer>
  ): Promise<ReconciliationMatch | null> {
    let bestMatch: ReconciliationMatch | null = null;
    let bestConfidence = 0;

    for (const systemTransaction of systemTransactions) {
      const confidence = this.calculateMatchConfidence(bankTransaction, systemTransaction);
      
      if (confidence > bestConfidence && confidence >= 0.6) {
        bestConfidence = confidence;
        bestMatch = {
          bank_transaction: bankTransaction,
          system_transaction: systemTransaction,
          match_confidence: confidence,
          match_type: this.determineMatchType(confidence),
          match_reason: this.generateMatchReason(bankTransaction, systemTransaction, confidence),
        };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate confidence score for transaction matching
   */
  private static calculateMatchConfidence(
    bankTransaction: BankStatementTransaction,
    systemTransaction: ClinicalPayment | BankTransfer
  ): number {
    let confidence = 0;
    let totalFactors = 0;

    // Amount matching (40% weight)
    let systemAmount = 0;
    if ('amount' in systemTransaction) {
      // ClinicalPayment
      systemAmount = systemTransaction.amount || 0;
    } else {
      // BankTransfer - get amount from related ClinicalPayment
      systemAmount = (systemTransaction as any).payment?.amount || 0;
    }
    
    const amountMatch = Math.abs(bankTransaction.amount - systemAmount) < 0.01;
    confidence += amountMatch ? 0.4 : 0;
    totalFactors += 0.4;

    // Date matching (30% weight)
    const bankDate = new Date(bankTransaction.transaction_date);
    let systemDate: Date;
    
    if ('createdAt' in systemTransaction) {
      // ClinicalPayment
      systemDate = new Date(systemTransaction.createdAt);
    } else {
      // BankTransfer
      systemDate = new Date(systemTransaction.createdAt);
    }
    
    const dateDiff = Math.abs(bankDate.getTime() - systemDate.getTime()) / (1000 * 60 * 60 * 24);
    const dateMatch = dateDiff <= 3; // Within 3 days
    confidence += dateMatch ? 0.3 : 0;
    totalFactors += 0.3;

    // Reference matching (20% weight)
    let systemReference = '';
    if ('payment_reference' in systemTransaction) {
      // ClinicalPayment
      systemReference = systemTransaction.payment_reference || '';
    } else {
      // BankTransfer
      systemReference = systemTransaction.bank_statement_reference || 
                      systemTransaction.settlement_reference || 
                      systemTransaction.confirmation_reference || '';
    }
    
    const referenceMatch = this.fuzzyStringMatch(
      bankTransaction.reference,
      systemReference
    );
    confidence += referenceMatch * 0.2;
    totalFactors += 0.2;

    // Description matching (10% weight)
    let systemDescription = '';
    if ('notes' in systemTransaction) {
      // ClinicalPayment
      systemDescription = systemTransaction.notes || '';
    } else {
      // BankTransfer
      systemDescription = systemTransaction.transfer_notes || '';
    }
    
    const descriptionMatch = this.fuzzyStringMatch(
      bankTransaction.description,
      systemDescription
    );
    confidence += descriptionMatch * 0.1;
    totalFactors += 0.1;

    return totalFactors > 0 ? confidence / totalFactors : 0;
  }

  /**
   * Fuzzy string matching for references and descriptions
   */
  private static fuzzyStringMatch(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    // Simple similarity calculation
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance for string similarity
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Determine match type based on confidence
   */
  private static determineMatchType(confidence: number): 'EXACT' | 'PARTIAL' | 'FUZZY' {
    if (confidence >= 0.95) return 'EXACT';
    if (confidence >= 0.8) return 'PARTIAL';
    return 'FUZZY';
  }

  /**
   * Generate human-readable match reason
   */
  private static generateMatchReason(
    bankTransaction: BankStatementTransaction,
    systemTransaction: ClinicalPayment | BankTransfer,
    confidence: number
  ): string {
    const reasons = [];
    
    // Amount matching
    let systemAmount = 0;
    if ('amount' in systemTransaction) {
      // ClinicalPayment
      systemAmount = systemTransaction.amount || 0;
    } else {
      // BankTransfer - get amount from related ClinicalPayment
      systemAmount = (systemTransaction as any).payment?.amount || 0;
    }
    
    if (Math.abs(bankTransaction.amount - systemAmount) < 0.01) {
      reasons.push('Amount matches exactly');
    }
    
    // Date matching
    const bankDate = new Date(bankTransaction.transaction_date);
    let systemDate: Date;
    
    if ('createdAt' in systemTransaction) {
      // ClinicalPayment
      systemDate = new Date(systemTransaction.createdAt);
    } else {
      // BankTransfer
      systemDate = new Date(systemTransaction.createdAt);
    }
    
    const dateDiff = Math.abs(bankDate.getTime() - systemDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dateDiff <= 1) {
      reasons.push('Date matches exactly');
    } else if (dateDiff <= 3) {
      reasons.push('Date within 3 days');
    }
    
    if (confidence >= 0.95) {
      reasons.push('High confidence match');
    } else if (confidence >= 0.8) {
      reasons.push('Good confidence match');
    }
    
    return reasons.join('; ');
  }

  // ===== EXCEPTION HANDLING =====

  /**
   * Create exception for unmatched bank transaction
   */
  private static createUnmatchedException(bankTransaction: BankStatementTransaction): ReconciliationException {
    return {
      type: 'MISSING_SYSTEM',
      severity: 'MEDIUM',
      description: `Bank transaction ${bankTransaction.reference} has no matching system transaction`,
      bank_transaction: bankTransaction,
      suggested_action: 'Review transaction and create manual match or investigate missing system entry',
    };
  }

  /**
   * Create exception for reconciliation error
   */
  private static createErrorException(
    bankTransaction: BankStatementTransaction,
    errorMessage: string
  ): ReconciliationException {
    return {
      type: 'MISSING_SYSTEM',
      severity: 'HIGH',
      description: `Error processing bank transaction ${bankTransaction.reference}: ${errorMessage}`,
      bank_transaction: bankTransaction,
      suggested_action: 'Review error and retry reconciliation or process manually',
    };
  }

  // ===== HELPER METHODS =====

  /**
   * Get system transactions for reconciliation period
   */
  private static async getSystemTransactionsForReconciliation(
    bankAccountId: number,
    statementDate: Date,
    transaction?: Transaction
  ): Promise<Array<ClinicalPayment | BankTransfer>> {
    const startDate = new Date(statementDate);
    startDate.setDate(startDate.getDate() - 7); // Include transactions 7 days before statement
    
    const endDate = new Date(statementDate);
    endDate.setDate(endDate.getDate() + 7); // Include transactions 7 days after statement

    // Get bank transfer payments
    const bankTransfers = await BankTransfer.findAll({
      where: {
        bank_account_id: bankAccountId,
        transfer_date: {
          [require('sequelize').Op.between]: [startDate, endDate],
        },
        transfer_status: {
          [require('sequelize').Op.in]: ['PENDING', 'CONFIRMED'],
        },
      },
      include: [{
        model: ClinicalPayment,
        as: 'payment',
      }],
      transaction,
    });

    // Get clinical payments for bank transfers
    const clinicalPayments = bankTransfers.map(bt => bt.payment).filter(Boolean);

    return [...bankTransfers, ...clinicalPayments];
  }

  /**
   * Mark transaction as reconciled
   */
  private static async markTransactionReconciled(
    transaction: ClinicalPayment | BankTransfer,
    match: ReconciliationMatch,
    transactionContext?: Transaction
  ): Promise<void> {
    if ('payment_reference' in transaction) {
      // ClinicalPayment
      await transaction.update({
        status: 'RECONCILED',
        notes: transaction.notes ? 
          `${transaction.notes}\n\nReconciled: ${match.match_reason}` :
          `Reconciled: ${match.match_reason}`,
      }, { transaction: transactionContext });
    } else {
      // BankTransfer
      await transaction.update({
        transfer_status: 'RECONCILED',
        transfer_notes: transaction.transfer_notes ?
          `${transaction.transfer_notes}\n\nReconciled: ${match.match_reason}` :
          `Reconciled: ${match.match_reason}`,
      }, { transaction: transactionContext });
    }
  }

  /**
   * Log bank statement import activity
   */
  private static async logBankStatementImport(
    statement: any,
    reconciliationResult: ReconciliationResult,
    transaction?: Transaction
  ): Promise<void> {
    logger.info('Bank statement imported and reconciled', {
      statement_id: statement.id,
      bank_account_id: statement.bank_account_id,
      statement_reference: statement.statement_reference,
      total_transactions: reconciliationResult.total_transactions,
      matched_transactions: reconciliationResult.matched_transactions,
      unmatched_transactions: reconciliationResult.unmatched_transactions,
      exceptions_count: reconciliationResult.exceptions.length,
      imported_by: statement.imported_by,
      imported_at: statement.imported_at,
    });
  }

  // ===== RECONCILIATION APPROVAL WORKFLOW =====

  /**
   * Approve reconciliation result
   */
  static async approveReconciliation(
    reconciliationId: string,
    staffId: number,
    approvalNotes?: string
  ): Promise<void> {
    try {
      // In a production system, you would update a reconciliation record
      // For now, we'll log the approval
      logger.info('Reconciliation approved', {
        reconciliation_id: reconciliationId,
        approved_by: staffId,
        approved_at: new Date(),
        approval_notes: approvalNotes,
      });

      // Create approval journal entry
      await this.createReconciliationApprovalEntry(reconciliationId, staffId, approvalNotes);

    } catch (error) {
      logger.error('Reconciliation approval failed:', error);
      throw new BadException(
        'Reconciliation Approval Failed',
        500,
        `Failed to approve reconciliation: ${error.message}`
      );
    }
  }

  /**
   * Create journal entry for reconciliation approval
   */
  private static async createReconciliationApprovalEntry(
    reconciliationId: string,
    staffId: number,
    approvalNotes?: string
  ): Promise<void> {
    // Create a journal entry to record the reconciliation approval
    const journalEntry = await JournalEntry.create({
      reference: `REC-APPROVAL-${reconciliationId}`,
      description: `Bank reconciliation approval: ${approvalNotes || 'Reconciliation approved'}`,
      transaction_date: new Date(),
      entry_type: 'RECONCILIATION_APPROVAL',
      status: JournalEntryStatus.POSTED,
      created_by: staffId,
      posted_by: staffId,
      posted_at: new Date(),
    });

    // Create journal entry line for audit trail
    await JournalEntryLine.create({
      journal_entry_id: journalEntry.id,
      account_id: 1, // Use appropriate account ID for reconciliation
      debit: 0,
      credit: 0,
      description: `Reconciliation approval recorded`,
      line_type: 'AUDIT',
    });
  }

  // ===== REPORTING AND ANALYTICS =====

  /**
   * Get reconciliation summary for dashboard
   */
  static async getReconciliationSummary(bankAccountId?: number): Promise<any> {
    try {
      // In a production system, you would query reconciliation records
      // For now, return a mock summary
      return {
        total_statements: 0,
        reconciled_statements: 0,
        pending_reconciliation: 0,
        total_transactions: 0,
        reconciled_transactions: 0,
        unmatched_transactions: 0,
        exceptions_count: 0,
        last_reconciliation: null,
        reconciliation_rate: 0,
      };
    } catch (error) {
      logger.error('Failed to get reconciliation summary:', error);
      throw new BadException(
        'Reconciliation Summary Failed',
        500,
        `Failed to get reconciliation summary: ${error.message}`
      );
    }
  }

  /**
   * Get reconciliation exceptions report
   */
  static async getReconciliationExceptions(
    bankAccountId?: number,
    severity?: string
  ): Promise<ReconciliationException[]> {
    try {
      // In a production system, you would query exception records
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error('Failed to get reconciliation exceptions:', error);
      throw new BadException(
        'Reconciliation Exceptions Failed',
        500,
        `Failed to get reconciliation exceptions: ${error.message}`
      );
    }
  }
}

export default BankReconciliationService;
