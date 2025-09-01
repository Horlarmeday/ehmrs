import { Transaction } from 'sequelize';
import { BadException } from '../../../common/util/api-error';
import { 
  Staff,
  InsuranceClaim,
  ClinicalPayment,
  JournalEntry,
  JournalEntryLine
} from '../../../database/models';
import { 
  JournalEntryStatus
} from '../enums';
import { logger } from '../../../core/helpers/logger';

// ===== INSURANCE SETTLEMENT APPROVAL INTERFACES =====

export interface InsuranceSettlementApprovalData {
  settlement_id: string;
  claim_reference: string;
  settlement_date: Date;
  settled_amount: number;
  settlement_method: string;
  approval_notes?: string;
  approved_by: number;
}

export interface InsuranceSettlementApprovalWorkflow {
  settlement_id: string;
  claim_reference: string;
  current_status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'POSTED';
  approval_history: InsuranceApprovalStep[];
  can_approve: boolean;
  can_reject: boolean;
  can_post: boolean;
  claim_details: any;
}

export interface InsuranceApprovalStep {
  step: number;
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'POSTED';
  staff_id: number;
  staff_name: string;
  timestamp: Date;
  notes?: string;
}

// ===== INSURANCE SETTLEMENT APPROVAL SERVICE =====

/**
 * Insurance Settlement Approval Service
 * 
 * This service handles the approval workflow for insurance claim settlements including:
 * - Multi-stage approval process
 * - Claim validation and verification
 * - Settlement amount validation
 * - Audit trail and accountability
 * - Journal entry creation upon approval
 */
export class InsuranceSettlementApprovalService {

  // ===== APPROVAL WORKFLOW MANAGEMENT =====

  /**
   * Submit insurance settlement for approval
   */
  static async submitSettlementForApproval(
    settlementData: InsuranceSettlementApprovalData,
    transaction?: Transaction
  ): Promise<InsuranceSettlementApprovalWorkflow> {
    try {
      // Validate claim exists
      const claim = await InsuranceClaim.findOne({
        where: { claim_reference: settlementData.claim_reference },
        include: [{
          model: ClinicalPayment,
          as: 'payment',
        }],
      });

      if (!claim) {
        throw new BadException('Insurance Claim Not Found', 404, 'The specified insurance claim does not exist');
      }

      // Validate claim status
      if (claim.claim_status !== 'APPROVED') {
        throw new BadException('Invalid Claim Status', 400, 'Only approved claims can be settled');
      }

      // Validate settlement amount
      await this.validateSettlementAmount(claim, settlementData.settled_amount);

      // Validate approver permissions
      await this.validateApproverPermissions(settlementData.approved_by);

      // Create approval workflow
      const workflow: InsuranceSettlementApprovalWorkflow = {
        settlement_id: settlementData.settlement_id,
        claim_reference: settlementData.claim_reference,
        current_status: 'PENDING_APPROVAL',
        approval_history: [{
          step: 1,
          action: 'SUBMITTED',
          staff_id: settlementData.approved_by,
          staff_name: await this.getStaffName(settlementData.approved_by),
          timestamp: new Date(),
          notes: 'Insurance settlement submitted for approval',
        }],
        can_approve: true,
        can_reject: true,
        can_post: false,
        claim_details: claim,
      };

      // Log submission
      await this.logApprovalAction(workflow, 'SUBMITTED', settlementData.approved_by, 'Insurance settlement submitted for approval');

      return workflow;

    } catch (error) {
      logger.error('Insurance settlement submission failed:', error);
      throw new BadException(
        'Insurance Settlement Submission Failed',
        500,
        `Failed to submit insurance settlement for approval: ${error.message}`
      );
    }
  }

  /**
   * Approve insurance settlement
   */
  static async approveInsuranceSettlement(
    settlementId: string,
    staffId: number,
    approvalNotes?: string
  ): Promise<InsuranceSettlementApprovalWorkflow> {
    try {
      // Validate approver permissions
      await this.validateApproverPermissions(staffId);

      // Get current workflow
      const workflow = await this.getSettlementWorkflow(settlementId);
      if (!workflow) {
        throw new BadException('Settlement Not Found', 404, 'Settlement workflow not found');
      }

      if (workflow.current_status !== 'PENDING_APPROVAL') {
        throw new BadException('Invalid Status', 400, 'Settlement is not pending approval');
      }

      // Validate claim is still valid
      await this.validateClaimStatus(workflow.claim_reference);

      // Update workflow status
      workflow.current_status = 'APPROVED';
      workflow.approval_history.push({
        step: workflow.approval_history.length + 1,
        action: 'APPROVED',
        staff_id: staffId,
        staff_name: await this.getStaffName(staffId),
        timestamp: new Date(),
        notes: approvalNotes || 'Insurance settlement approved',
      });

      // Update approval flags
      workflow.can_approve = false;
      workflow.can_reject = false;
      workflow.can_post = true;

      // Log approval
      await this.logApprovalAction(workflow, 'APPROVED', staffId, approvalNotes || 'Insurance settlement approved');

      return workflow;

    } catch (error) {
      logger.error('Insurance settlement approval failed:', error);
      throw new BadException(
        'Insurance Settlement Approval Failed',
        500,
        `Failed to approve insurance settlement: ${error.message}`
      );
    }
  }

  /**
   * Reject insurance settlement
   */
  static async rejectInsuranceSettlement(
    settlementId: string,
    staffId: number,
    rejectionReason: string
  ): Promise<InsuranceSettlementApprovalWorkflow> {
    try {
      // Validate approver permissions
      await this.validateApproverPermissions(staffId);

      // Get current workflow
      const workflow = await this.getSettlementWorkflow(settlementId);
      if (!workflow) {
        throw new BadException('Settlement Not Found', 404, 'Settlement workflow not found');
      }

      if (workflow.current_status !== 'PENDING_APPROVAL') {
        throw new BadException('Invalid Status', 400, 'Settlement is not pending approval');
      }

      // Update workflow status
      workflow.current_status = 'REJECTED';
      workflow.approval_history.push({
        step: workflow.approval_history.length + 1,
        action: 'REJECTED',
        staff_id: staffId,
        staff_name: await this.getStaffName(staffId),
        timestamp: new Date(),
        notes: rejectionReason,
      });

      // Update approval flags
      workflow.can_approve = false;
      workflow.can_reject = false;
      workflow.can_post = false;

      // Log rejection
      await this.logApprovalAction(workflow, 'REJECTED', staffId, rejectionReason);

      return workflow;

    } catch (error) {
      logger.error('Insurance settlement rejection failed:', error);
      throw new BadException(
        'Insurance Settlement Rejection Failed',
        500,
        `Failed to reject insurance settlement: ${error.message}`
      );
    }
  }

  /**
   * Post approved insurance settlement
   */
  static async postInsuranceSettlement(
    settlementId: string,
    staffId: number,
    postingNotes?: string
  ): Promise<InsuranceSettlementApprovalWorkflow> {
    try {
      // Validate poster permissions
      await this.validatePosterPermissions(staffId);

      // Get current workflow
      const workflow = await this.getSettlementWorkflow(settlementId);
      if (!workflow) {
        throw new BadException('Settlement Not Found', 404, 'Settlement workflow not found');
      }

      if (workflow.current_status !== 'APPROVED') {
        throw new BadException('Invalid Status', 400, 'Settlement must be approved before posting');
      }

      // Create journal entries for settlement
      await this.createSettlementJournalEntries(settlementId, workflow.claim_reference, staffId, postingNotes);

      // Update workflow status
      workflow.current_status = 'POSTED';
      workflow.approval_history.push({
        step: workflow.approval_history.length + 1,
        action: 'POSTED',
        staff_id: staffId,
        staff_name: await this.getStaffName(staffId),
        timestamp: new Date(),
        notes: postingNotes || 'Insurance settlement posted to general ledger',
      });

      // Update approval flags
      workflow.can_approve = false;
      workflow.can_reject = false;
      workflow.can_post = false;

      // Log posting
      await this.logApprovalAction(workflow, 'POSTED', staffId, postingNotes || 'Insurance settlement posted');

      return workflow;

    } catch (error) {
      logger.error('Insurance settlement posting failed:', error);
      throw new BadException(
        'Insurance Settlement Posting Failed',
        500,
        `Failed to post insurance settlement: ${error.message}`
      );
    }
  }

  // ===== VALIDATION AND PERMISSIONS =====

  /**
   * Validate settlement amount
   */
  private static async validateSettlementAmount(claim: any, settledAmount: number): Promise<void> {
    const expectedAmount = claim.claim_amount || 0;
    const variance = Math.abs(settledAmount - expectedAmount);
    const variancePercentage = (variance / expectedAmount) * 100;

    if (variancePercentage > 10) {
      throw new BadException(
        'Settlement Amount Variance',
        400,
        `Settlement amount variance (${variancePercentage.toFixed(2)}%) exceeds 10% threshold`
      );
    }

    if (settledAmount <= 0) {
      throw new BadException(
        'Invalid Settlement Amount',
        400,
        'Settlement amount must be greater than zero'
      );
    }
  }

  /**
   * Validate claim status
   */
  private static async validateClaimStatus(claimReference: string): Promise<void> {
    const claim = await InsuranceClaim.findOne({
      where: { claim_reference: claimReference },
    });

    if (!claim) {
      throw new BadException('Claim Not Found', 404, 'Insurance claim not found during validation');
    }

    if (claim.claim_status !== 'APPROVED') {
      throw new BadException('Invalid Claim Status', 400, 'Claim status has changed and is no longer valid for settlement');
    }
  }

  /**
   * Validate approver permissions
   */
  private static async validateApproverPermissions(staffId: number): Promise<void> {
    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      throw new BadException('Staff Not Found', 404, 'Approver staff member not found');
    }

    // Check if staff has approval permissions
    const allowedRoles = ['ACCOUNTANT', 'FINANCE_MANAGER', 'AUDITOR', 'INSURANCE_MANAGER'];
    if (!allowedRoles.includes(staff.role)) {
      throw new BadException(
        'Insufficient Permissions',
        403,
        'Staff member does not have insurance settlement approval permissions'
      );
    }
  }

  /**
   * Validate poster permissions
   */
  private static async validatePosterPermissions(staffId: number): Promise<void> {
    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      throw new BadException('Staff Not Found', 404, 'Poster staff member not found');
    }

    // Check if staff has posting permissions
    const allowedRoles = ['ACCOUNTANT', 'FINANCE_MANAGER'];
    if (!allowedRoles.includes(staff.role)) {
      throw new BadException(
        'Insufficient Permissions',
        403,
        'Staff member does not have posting permissions'
      );
    }
  }

  // ===== WORKFLOW MANAGEMENT =====

  /**
   * Get settlement workflow
   */
  private static async getSettlementWorkflow(settlementId: string): Promise<InsuranceSettlementApprovalWorkflow | null> {
    // In a production system, you would query a workflow table
    // For now, return null to simulate workflow not found
    return null;
  }

  /**
   * Get staff name
   */
  private static async getStaffName(staffId: number): Promise<string> {
    const staff = await Staff.findByPk(staffId);
    if (!staff) return 'Unknown Staff';
    return `${staff.firstname} ${staff.lastname}`;
  }

  // ===== JOURNAL ENTRY CREATION =====

  /**
   * Create journal entries for settlement
   */
  private static async createSettlementJournalEntries(
    settlementId: string,
    claimReference: string,
    staffId: number,
    postingNotes?: string
  ): Promise<void> {
    try {
      // Create settlement journal entry
      const journalEntry = await JournalEntry.create({
        reference: `INS-SETTLEMENT-${settlementId}`,
        description: `Insurance settlement posting for claim ${claimReference}: ${postingNotes || 'Settlement posted'}`,
        transaction_date: new Date(),
        entry_type: 'INSURANCE_SETTLEMENT_POSTING',
        status: JournalEntryStatus.POSTED,
        created_by: staffId,
        posted_by: staffId,
        posted_at: new Date(),
      });

      // Create journal entry lines for settlement
      await JournalEntryLine.bulkCreate([
        {
          journal_entry_id: journalEntry.id,
          account_id: 1, // Insurance Receivable Account
          debit: 0,
          credit: 0,
          description: `Insurance settlement posting for claim ${claimReference}`,
          line_type: 'SETTLEMENT',
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: 2, // Bank Account
          debit: 0,
          credit: 0,
          description: `Bank settlement posting for claim ${claimReference}`,
          line_type: 'SETTLEMENT',
        },
      ]);

      logger.info(`Journal entries created for insurance settlement posting: ${settlementId}`);

    } catch (error) {
      logger.error('Failed to create journal entries for insurance settlement posting:', error);
      throw new BadException(
        'Journal Entry Creation Failed',
        500,
        'Failed to create accounting entries for insurance settlement posting'
      );
    }
  }

  // ===== AUDIT AND LOGGING =====

  /**
   * Log approval action
   */
  private static async logApprovalAction(
    workflow: InsuranceSettlementApprovalWorkflow,
    action: string,
    staffId: number,
    notes?: string
  ): Promise<void> {
    logger.info(`Insurance settlement ${action}`, {
      settlement_id: workflow.settlement_id,
      claim_reference: workflow.claim_reference,
      action,
      staff_id: staffId,
      timestamp: new Date(),
      notes,
      current_status: workflow.current_status,
    });
  }

  // ===== REPORTING AND ANALYTICS =====

  /**
   * Get insurance settlement approval summary
   */
  static async getInsuranceSettlementApprovalSummary(): Promise<any> {
    try {
      // In a production system, you would query approval records
      // For now, return a mock summary
      return {
        total_settlements: 0,
        pending_approval: 0,
        approved: 0,
        rejected: 0,
        posted: 0,
        approval_rate: 0,
        average_approval_time: 0,
        total_settled_amount: 0,
        average_settlement_amount: 0,
      };
    } catch (error) {
      logger.error('Failed to get insurance settlement approval summary:', error);
      throw new BadException(
        'Approval Summary Failed',
        500,
        `Failed to get insurance settlement approval summary: ${error.message}`
      );
    }
  }

  /**
   * Get pending insurance settlements for staff member
   */
  static async getPendingInsuranceSettlementsForStaff(staffId: number): Promise<any[]> {
    try {
      // In a production system, you would query pending settlements
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error('Failed to get pending insurance settlements:', error);
      throw new BadException(
        'Pending Settlements Failed',
        500,
        `Failed to get pending insurance settlements: ${error.message}`
      );
    }
  }

  /**
   * Get approval history for insurance settlement
   */
  static async getInsuranceSettlementApprovalHistory(settlementId: string): Promise<InsuranceApprovalStep[]> {
    try {
      // In a production system, you would query approval history
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error('Failed to get insurance settlement approval history:', error);
      throw new BadException(
        'Approval History Failed',
        500,
        `Failed to get insurance settlement approval history: ${error.message}`
      );
    }
  }

  /**
   * Get insurance settlement analytics
   */
  static async getInsuranceSettlementAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    try {
      // In a production system, you would query settlement analytics
      // For now, return mock data
      return {
        total_settlements: 0,
        total_amount: 0,
        average_settlement_time: 0,
        settlement_methods: [],
        claim_types: [],
        approval_performance: {
          average_approval_time: 0,
          approval_rate: 0,
          rejection_rate: 0,
        },
      };
    } catch (error) {
      logger.error('Failed to get insurance settlement analytics:', error);
      throw new BadException(
        'Analytics Failed',
        500,
        `Failed to get insurance settlement analytics: ${error.message}`
      );
    }
  }
}

export default InsuranceSettlementApprovalService;
