import { Transaction, Op } from 'sequelize';
import { DepositAuditLog } from '../../../database/models/depositAuditLog';
import { PatientDeposit } from '../../../database/models/patientDeposit';
import { BadException } from '../../../common/util/api-error';

export enum AuditActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  BALANCE_CHANGE = 'BALANCE_CHANGE',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  USAGE_PROCESSED = 'USAGE_PROCESSED',
  ADJUSTMENT_MADE = 'ADJUSTMENT_MADE',
  RECONCILIATION = 'RECONCILIATION',
  SETTLEMENT = 'SETTLEMENT',
  EXPIRY_PROCESSED = 'EXPIRY_PROCESSED',
  MANUAL_OVERRIDE = 'MANUAL_OVERRIDE',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE'
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface AuditLogData {
  deposit_id: number;
  action_type: AuditActionType;
  severity?: AuditSeverity;
  action_description: string;
  details?: string;
  old_values?: any;
  new_values?: any;
  metadata?: any;
  performed_by: number;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  request_id?: string;
  endpoint?: string;
  http_method?: string;
  response_status?: number;
  response_time_ms?: number;
  is_system_action?: boolean;
  error_message?: string;
  stack_trace?: string;
}

export interface AuditQueryFilters {
  deposit_id?: number;
  action_type?: AuditActionType;
  severity?: AuditSeverity;
  performed_by?: number;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}

export class DepositAuditService {
  /**
   * Create a comprehensive audit log entry
   */
  static async createAuditLog(
    data: AuditLogData,
    transaction?: Transaction
  ): Promise<any> {
    try {
      // Create audit log entry using the dedicated DepositAuditLog model
      const auditEntry = await DepositAuditLog.create({
        deposit_id: data.deposit_id,
        action_type: data.action_type,
        severity: data.severity || AuditSeverity.INFO,
        action_description: data.action_description,
        details: data.details,
        old_values: data.old_values,
        new_values: data.new_values,
        metadata: data.metadata,
        performed_by: data.performed_by,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        session_id: data.session_id,
        request_id: data.request_id,
        endpoint: data.endpoint,
        http_method: data.http_method,
        response_status: data.response_status,
        response_time_ms: data.response_time_ms,
        is_system_action: data.is_system_action || false,
        error_message: data.error_message,
        stack_trace: data.stack_trace
      }, { transaction });

      return auditEntry;
    } catch (error) {
      throw new BadException('Audit Log Creation Failed', 500, `Failed to create audit log: ${error.message}`);
    }
  }

  /**
   * Log deposit creation
   */
  static async logDepositCreation(
    deposit: PatientDeposit,
    performedBy: number,
    metadata?: any,
    transaction?: Transaction
  ): Promise<void> {
    await this.createAuditLog({
      deposit_id: deposit.id,
      action_type: AuditActionType.CREATE,
      severity: AuditSeverity.INFO,
      action_description: 'Patient deposit created',
      details: `Deposit of ${deposit.amount} created for patient ${deposit.patient_id}`,
      new_values: {
        amount: deposit.amount,
        deposit_type: deposit.deposit_type,
        status: deposit.status,
        reference_number: deposit.reference_number
      },
      metadata,
      performed_by: performedBy,
      is_system_action: false
    }, transaction);
  }

  /**
   * Log deposit status change
   */
  static async logStatusChange(
    depositId: number,
    oldStatus: string,
    newStatus: string,
    performedBy: number,
    reason?: string,
    metadata?: any,
    transaction?: Transaction
  ): Promise<void> {
    await this.createAuditLog({
      deposit_id: depositId,
      action_type: AuditActionType.STATUS_CHANGE,
      severity: AuditSeverity.INFO,
      action_description: 'Deposit status changed',
      details: `Status changed from ${oldStatus} to ${newStatus}${reason ? `: ${reason}` : ''}`,
      old_values: { status: oldStatus },
      new_values: { status: newStatus, reason },
      metadata,
      performed_by: performedBy,
      is_system_action: false
    }, transaction);
  }

  /**
   * Log balance change
   */
  static async logBalanceChange(
    depositId: number,
    oldBalance: number,
    newBalance: number,
    changeAmount: number,
    changeType: string,
    performedBy: number,
    reason?: string,
    metadata?: any,
    transaction?: Transaction
  ): Promise<void> {
    await this.createAuditLog({
      deposit_id: depositId,
      action_type: AuditActionType.BALANCE_CHANGE,
      severity: AuditSeverity.INFO,
      action_description: 'Deposit balance changed',
      details: `${changeType} of ${changeAmount} applied. Balance changed from ${oldBalance} to ${newBalance}${reason ? `: ${reason}` : ''}`,
      old_values: { balance: oldBalance },
      new_values: { balance: newBalance, change_amount: changeAmount, change_type: changeType, reason },
      metadata,
      performed_by: performedBy,
      is_system_action: false
    }, transaction);
  }

  /**
   * Log refund processing
   */
  static async logRefundProcessed(
    depositId: number,
    refundAmount: number,
    performedBy: number,
    reason: string,
    metadata?: any,
    transaction?: Transaction
  ): Promise<void> {
    await this.createAuditLog({
      deposit_id: depositId,
      action_type: AuditActionType.REFUND_PROCESSED,
      severity: AuditSeverity.INFO,
      action_description: 'Deposit refund processed',
      details: `Refund of ${refundAmount} processed: ${reason}`,
      new_values: { refund_amount: refundAmount, reason },
      metadata,
      performed_by: performedBy,
      is_system_action: false
    }, transaction);
  }

  /**
   * Log usage processing
   */
  static async logUsageProcessed(
    depositId: number,
    usageAmount: number,
    billId: number,
    performedBy: number,
    metadata?: any,
    transaction?: Transaction
  ): Promise<void> {
    await this.createAuditLog({
      deposit_id: depositId,
      action_type: AuditActionType.USAGE_PROCESSED,
      severity: AuditSeverity.INFO,
      action_description: 'Deposit usage processed',
      details: `Usage of ${usageAmount} applied to bill ${billId}`,
      new_values: { usage_amount: usageAmount, bill_id: billId },
      metadata,
      performed_by: performedBy,
      is_system_action: false
    }, transaction);
  }

  /**
   * Log adjustment made
   */
  static async logAdjustmentMade(
    depositId: number,
    adjustmentAmount: number,
    adjustmentType: string,
    performedBy: number,
    reason: string,
    metadata?: any,
    transaction?: Transaction
  ): Promise<void> {
    await this.createAuditLog({
      deposit_id: depositId,
      action_type: AuditActionType.ADJUSTMENT_MADE,
      severity: AuditSeverity.WARNING,
      action_description: 'Deposit adjustment made',
      details: `${adjustmentType} adjustment of ${adjustmentAmount} applied: ${reason}`,
      new_values: { adjustment_amount: adjustmentAmount, adjustment_type: adjustmentType, reason },
      metadata,
      performed_by: performedBy,
      is_system_action: false
    }, transaction);
  }

  /**
   * Log reconciliation activity
   */
  static async logReconciliation(
    depositId: number,
    reconciliationType: string,
    performedBy: number,
    details: string,
    metadata?: any,
    transaction?: Transaction
  ): Promise<void> {
    await this.createAuditLog({
      deposit_id: depositId,
      action_type: AuditActionType.RECONCILIATION,
      severity: AuditSeverity.INFO,
      action_description: 'Deposit reconciliation performed',
      details,
      new_values: { reconciliation_type: reconciliationType },
      metadata,
      performed_by: performedBy,
      is_system_action: false
    }, transaction);
  }

  /**
   * Log POS terminal settlement
   */
  static async logPOSTerminalSettlement(
    pos_terminal_id: number,
    totalAmount: number,
    settlement_reference: string,
    settled_by: number,
    journal_entry_id: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      await DepositAuditLog.create({
        deposit_id: null, // Not tied to a specific deposit
        action_type: AuditActionType.SETTLEMENT,
        severity: AuditSeverity.INFO,
        details: `POS Terminal ${pos_terminal_id} settlement processed`,
        old_values: {
          pos_terminal_id,
          settlement_reference,
          total_amount: totalAmount
        },
        new_values: {
          settlement_status: 'SETTLED',
          settled_at: new Date(),
          journal_entry_id
        },
        performed_by: settled_by,
        ip_address: '127.0.0.1', // Will be updated with actual IP
        user_agent: 'System Settlement',
        session_id: `settlement-${Date.now()}`,
        metadata: {
          settlement_reference,
          total_amount: totalAmount,
          journal_entry_id
        }
      }, { transaction });
    } catch (error) {
      console.error('Failed to log POS terminal settlement:', error);
    }
  }

  /**
   * Log system maintenance actions
   */
  static async logSystemMaintenance(
    depositId: number,
    action: string,
    details: string,
    metadata?: any,
    transaction?: Transaction
  ): Promise<void> {
    await this.createAuditLog({
      deposit_id: depositId,
      action_type: AuditActionType.SYSTEM_MAINTENANCE,
      severity: AuditSeverity.INFO,
      action_description: 'System maintenance performed',
      details,
      new_values: { maintenance_action: action },
      metadata,
      performed_by: 1, // System user ID
      is_system_action: true
    }, transaction);
  }

  /**
   * Log errors and exceptions
   */
  static async logError(
    depositId: number,
    error: Error,
    context: string,
    performedBy: number,
    metadata?: any,
    transaction?: Transaction
  ): Promise<void> {
    await this.createAuditLog({
      deposit_id: depositId,
      action_type: AuditActionType.UPDATE, // Using UPDATE for errors
      severity: AuditSeverity.ERROR,
      action_description: 'Error occurred during deposit operation',
      details: `Error in ${context}: ${error.message}`,
      error_message: error.message,
      stack_trace: error.stack,
      metadata,
      performed_by: performedBy,
      is_system_action: false
    }, transaction);
  }

  /**
   * Get audit trail for a specific deposit
   */
  static async getDepositAuditTrail(
    depositId: number,
    filters?: AuditQueryFilters
  ): Promise<any[]> {
    try {
      const whereClause: any = {
        deposit_id: depositId
      };

      // Query the dedicated DepositAuditLog table
      const auditLogs = await DepositAuditLog.findAll({
        where: whereClause,
        include: ['performedByStaff'],
        order: [['createdAt', 'DESC']],
        limit: filters?.limit || 100,
        offset: filters?.offset || 0
      });

      // Format audit log entries
      return auditLogs.map(log => ({
        id: log.id,
        timestamp: log.createdAt,
        action_type: log.action_type,
        severity: log.severity,
        description: log.action_description,
        details: log.details,
        old_values: log.old_values,
        new_values: log.new_values,
        performed_by: log.performed_by,
        performed_by_staff: log.performedByStaff,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        session_id: log.session_id,
        request_id: log.request_id,
        endpoint: log.endpoint,
        http_method: log.http_method,
        response_status: log.response_status,
        response_time_ms: log.response_time_ms,
        is_system_action: log.is_system_action,
        error_message: log.error_message,
        stack_trace: log.stack_trace,
        metadata: log.metadata
      }));
    } catch (error) {
      throw new BadException('Failed to get deposit audit trail', 500, error.message);
    }
  }

  /**
   * Get comprehensive audit summary
   */
  static async getAuditSummary(
    filters?: AuditQueryFilters
  ): Promise<any> {
    try {
      const whereClause: any = {};

      if (filters?.deposit_id) {
        whereClause.deposit_id = filters.deposit_id;
      }

      if (filters?.performed_by) {
        whereClause.performed_by = filters.performed_by;
      }

      if (filters?.start_date || filters?.end_date) {
        whereClause.createdAt = {};
        if (filters.start_date) whereClause.createdAt[Op.gte] = filters.start_date;
        if (filters.end_date) whereClause.createdAt[Op.lte] = filters.end_date;
      }

      const auditLogs = await DepositAuditLog.findAll({
        where: whereClause,
        attributes: [
          'createdAt',
          'action_type',
          'severity'
        ],
        order: [['createdAt', 'DESC']]
      });

      // Calculate summary statistics
      const summary = {
        total_audit_entries: auditLogs.length,
        action_type_breakdown: {},
        severity_breakdown: {},
        daily_activity: {},
        error_count: 0,
        warning_count: 0,
        info_count: 0
      };

      auditLogs.forEach(log => {
        const auditType = log.action_type;
        const severity = log.severity;
        const date = log.createdAt.toISOString().split('T')[0];

        // Count by action type
        summary.action_type_breakdown[auditType] = (summary.action_type_breakdown[auditType] || 0) + 1;

        // Count by severity
        summary.severity_breakdown[severity] = (summary.severity_breakdown[severity] || 0) + 1;

        // Count by date
        summary.daily_activity[date] = (summary.daily_activity[date] || 0) + 1;

        // Count by severity level
        if (severity === AuditSeverity.ERROR) summary.error_count++;
        else if (severity === AuditSeverity.WARNING) summary.warning_count++;
        else if (severity === AuditSeverity.INFO) summary.info_count++;
      });

      return summary;
    } catch (error) {
      throw new BadException('Failed to get audit summary', 500, error.message);
    }
  }
}
