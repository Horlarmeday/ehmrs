import { Transaction } from 'sequelize';
import { BadException } from '../../../common/util/api-error';
import {
  Staff,
  POSTerminal,
  ClinicalPayment,
  JournalEntry,
  JournalEntryLine,
} from '../../../database/models';
import { JournalEntryStatus } from '../enums';
import { logger } from '../../../core/helpers/logger';

// ===== POS SETTLEMENT APPROVAL INTERFACES =====

export interface POSSettlementApprovalData {
  settlement_id: string;
  terminal_id: number;
  settlement_date: Date;
  total_amount: number;
  total_transactions: number;
  approval_notes?: string;
  approved_by: number;
}

export interface POSSettlementApprovalWorkflow {
  settlement_id: string;
  current_status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'POSTED';
  approval_history: ApprovalStep[];
  can_approve: boolean;
  can_reject: boolean;
  can_post: boolean;
}

export interface ApprovalStep {
  step: number;
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'POSTED';
  staff_id: number;
  staff_name: string;
  timestamp: Date;
  notes?: string;
}

// ===== POS SETTLEMENT APPROVAL SERVICE =====

/**
 * POS Terminal Settlement Approval Service
 *
 * This service handles the approval workflow for POS terminal settlements including:
 * - Multi-stage approval process
 * - Approval validation and constraints
 * - Audit trail and accountability
 * - Journal entry creation upon approval
 */
export class POSSettlementApprovalService {
  // ===== APPROVAL WORKFLOW MANAGEMENT =====

  /**
   * Submit settlement for approval
   */
  static async submitSettlementForApproval(
    settlementData: POSSettlementApprovalData,
    transaction?: Transaction
  ): Promise<POSSettlementApprovalWorkflow> {
    try {
      // Validate terminal exists
      const terminal = await POSTerminal.findByPk(settlementData.terminal_id);
      if (!terminal) {
        throw new BadException(
          'POS Terminal Not Found',
          404,
          'The specified POS terminal does not exist'
        );
      }

      // Validate approver permissions
      await this.validateApproverPermissions(settlementData.approved_by);

      // Create approval workflow
      const workflow: POSSettlementApprovalWorkflow = {
        settlement_id: settlementData.settlement_id,
        current_status: 'PENDING_APPROVAL',
        approval_history: [
          {
            step: 1,
            action: 'SUBMITTED',
            staff_id: settlementData.approved_by,
            staff_name: await this.getStaffName(settlementData.approved_by),
            timestamp: new Date(),
            notes: 'Settlement submitted for approval',
          },
        ],
        can_approve: true,
        can_reject: true,
        can_post: false,
      };

      // Log submission
      await this.logApprovalAction(
        workflow,
        'SUBMITTED',
        settlementData.approved_by,
        'Settlement submitted for approval'
      );

      return workflow;
    } catch (error) {
      logger.error('Settlement submission failed:', error);
      throw new BadException(
        'Settlement Submission Failed',
        500,
        `Failed to submit settlement for approval: ${error.message}`
      );
    }
  }

  /**
   * Approve POS settlement
   */
  static async approvePOSSettlement(
    settlementId: string,
    staffId: number,
    approvalNotes?: string
  ): Promise<POSSettlementApprovalWorkflow> {
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
      workflow.current_status = 'APPROVED';
      workflow.approval_history.push({
        step: workflow.approval_history.length + 1,
        action: 'APPROVED',
        staff_id: staffId,
        staff_name: await this.getStaffName(staffId),
        timestamp: new Date(),
        notes: approvalNotes || 'Settlement approved',
      });

      // Update approval flags
      workflow.can_approve = false;
      workflow.can_reject = false;
      workflow.can_post = true;

      // Log approval
      await this.logApprovalAction(
        workflow,
        'APPROVED',
        staffId,
        approvalNotes || 'Settlement approved'
      );

      return workflow;
    } catch (error) {
      logger.error('Settlement approval failed:', error);
      throw new BadException(
        'Settlement Approval Failed',
        500,
        `Failed to approve settlement: ${error.message}`
      );
    }
  }

  /**
   * Reject POS settlement
   */
  static async rejectPOSSettlement(
    settlementId: string,
    staffId: number,
    rejectionReason: string
  ): Promise<POSSettlementApprovalWorkflow> {
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
      logger.error('Settlement rejection failed:', error);
      throw new BadException(
        'Settlement Rejection Failed',
        500,
        `Failed to reject settlement: ${error.message}`
      );
    }
  }

  /**
   * Post approved POS settlement
   */
  static async postPOSSettlement(
    settlementId: string,
    staffId: number,
    postingNotes?: string
  ): Promise<POSSettlementApprovalWorkflow> {
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
      await this.createSettlementJournalEntries(settlementId, staffId, postingNotes);

      // Update workflow status
      workflow.current_status = 'POSTED';
      workflow.approval_history.push({
        step: workflow.approval_history.length + 1,
        action: 'POSTED',
        staff_id: staffId,
        staff_name: await this.getStaffName(staffId),
        timestamp: new Date(),
        notes: postingNotes || 'Settlement posted to general ledger',
      });

      // Update approval flags
      workflow.can_approve = false;
      workflow.can_reject = false;
      workflow.can_post = false;

      // Log posting
      await this.logApprovalAction(
        workflow,
        'POSTED',
        staffId,
        postingNotes || 'Settlement posted'
      );

      return workflow;
    } catch (error) {
      logger.error('Settlement posting failed:', error);
      throw new BadException(
        'Settlement Posting Failed',
        500,
        `Failed to post settlement: ${error.message}`
      );
    }
  }

  // ===== VALIDATION AND PERMISSIONS =====

  /**
   * Validate approver permissions
   */
  private static async validateApproverPermissions(staffId: number): Promise<void> {
    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      throw new BadException('Staff Not Found', 404, 'Approver staff member not found');
    }

    // Check if staff has approval permissions
    // In production, implement proper role-based permissions
    const allowedRoles = ['ACCOUNTANT', 'FINANCE_MANAGER', 'AUDITOR'];
    if (!allowedRoles.includes(staff.role)) {
      throw new BadException(
        'Insufficient Permissions',
        403,
        'Staff member does not have approval permissions'
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
  private static async getSettlementWorkflow(
    settlementId: string
  ): Promise<POSSettlementApprovalWorkflow | null> {
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
    staffId: number,
    postingNotes?: string
  ): Promise<void> {
    try {
      // Create settlement journal entry
      const journalEntry = await JournalEntry.create({
        reference: `POS-SETTLEMENT-${settlementId}`,
        description: `POS terminal settlement posting: ${postingNotes || 'Settlement posted'}`,
        transaction_date: new Date(),
        entry_type: 'POS_SETTLEMENT_POSTING',
        status: JournalEntryStatus.POSTED,
        created_by: staffId,
        posted_by: staffId,
        posted_at: new Date(),
      });

      // Create journal entry lines for settlement
      await JournalEntryLine.bulkCreate([
        {
          journal_entry_id: journalEntry.id,
          account_id: 1, // POS Settlement Account
          debit: 0,
          credit: 0,
          description: `POS settlement posting recorded`,
          line_type: 'SETTLEMENT',
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: 2, // Bank Account
          debit: 0,
          credit: 0,
          description: `Bank settlement posting recorded`,
          line_type: 'SETTLEMENT',
        },
      ]);

      logger.info(`Journal entries created for POS settlement posting: ${settlementId}`);
    } catch (error) {
      logger.error('Failed to create journal entries for settlement posting:', error);
      throw new BadException(
        'Journal Entry Creation Failed',
        500,
        'Failed to create accounting entries for settlement posting'
      );
    }
  }

  // ===== AUDIT AND LOGGING =====

  /**
   * Log approval action
   */
  private static async logApprovalAction(
    workflow: POSSettlementApprovalWorkflow,
    action: string,
    staffId: number,
    notes?: string
  ): Promise<void> {
    logger.info(`POS settlement ${action}`, {
      settlement_id: workflow.settlement_id,
      action,
      staff_id: staffId,
      timestamp: new Date(),
      notes,
      current_status: workflow.current_status,
    });
  }

  // ===== REPORTING AND ANALYTICS =====

  /**
   * Get settlement approval summary
   */
  static async getSettlementApprovalSummary(): Promise<any> {
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
      };
    } catch (error) {
      logger.error('Failed to get settlement approval summary:', error);
      throw new BadException(
        'Approval Summary Failed',
        500,
        `Failed to get settlement approval summary: ${error.message}`
      );
    }
  }

  /**
   * Get pending approvals for staff member
   */
  static async getPendingApprovalsForStaff(staffId: number): Promise<any[]> {
    try {
      // In a production system, you would query pending approvals
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error('Failed to get pending approvals:', error);
      throw new BadException(
        'Pending Approvals Failed',
        500,
        `Failed to get pending approvals: ${error.message}`
      );
    }
  }

  /**
   * Get approval history for settlement
   */
  static async getSettlementApprovalHistory(settlementId: string): Promise<ApprovalStep[]> {
    try {
      // In a production system, you would query approval history
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error('Failed to get approval history:', error);
      throw new BadException(
        'Approval History Failed',
        500,
        `Failed to get approval history: ${error.message}`
      );
    }
  }
}

export default POSSettlementApprovalService;
