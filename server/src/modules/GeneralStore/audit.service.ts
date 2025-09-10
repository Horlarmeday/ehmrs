import { Request } from 'express';
import {
  GeneralStoreAuditLog,
  AuditAction,
  AuditModule,
} from '../../database/models/generalStoreAudit';

export interface AuditLogData {
  staffId: number;
  module: AuditModule;
  action: AuditAction;
  entityType: string;
  entityId?: number;
  description: string;
  oldValues?: any;
  newValues?: any;
  request?: Request;
  isSuccessful?: boolean;
  errorMessage?: string;
  metadata?: any;
}

export class GeneralStoreAuditService {
  /**
   * Log an audit event
   */
  static async logAuditEvent(auditData: AuditLogData): Promise<void> {
    try {
      const {
        staffId,
        module,
        action,
        entityType,
        entityId,
        description,
        oldValues,
        newValues,
        request,
        isSuccessful = true,
        errorMessage,
        metadata,
      } = auditData;

      // Extract request information
      const ipAddress = request?.ip || request?.connection?.remoteAddress || 'unknown';
      const userAgent = request?.headers['user-agent'] || 'unknown';
      const sessionId = 'unknown'; // Session ID not available in standard Express Request

      await GeneralStoreAuditLog.create({
        staff_id: staffId,
        module,
        action,
        entity_type: entityType,
        entity_id: entityId,
        description,
        old_values: oldValues,
        new_values: newValues,
        ip_address: ipAddress,
        user_agent: userAgent,
        session_id: sessionId,
        is_successful: isSuccessful,
        error_message: errorMessage,
        metadata,
      });
    } catch (error) {
      // Don't throw error from audit logging to avoid breaking main functionality
      console.error('Failed to log audit event:', error);
    }
  }

  /**
   * Log category creation
   */
  static async logCategoryCreation(
    staffId: number,
    categoryData: any,
    request: Request
  ): Promise<void> {
    await this.logAuditEvent({
      staffId,
      module: AuditModule.CATEGORY,
      action: AuditAction.CREATE,
      entityType: 'GeneralStoreCategory',
      description: `Category "${categoryData.name}" created`,
      newValues: categoryData,
      request,
    });
  }

  /**
   * Log category update
   */
  static async logCategoryUpdate(
    staffId: number,
    categoryId: number,
    oldData: any,
    newData: any,
    request: Request
  ): Promise<void> {
    await this.logAuditEvent({
      staffId,
      module: AuditModule.CATEGORY,
      action: AuditAction.UPDATE,
      entityType: 'GeneralStoreCategory',
      entityId: categoryId,
      description: `Category "${newData.name}" updated`,
      oldValues: oldData,
      newValues: newData,
      request,
    });
  }

  /**
   * Log category deletion
   */
  static async logCategoryDeletion(
    staffId: number,
    categoryId: number,
    categoryData: any,
    request: Request
  ): Promise<void> {
    await this.logAuditEvent({
      staffId,
      module: AuditModule.CATEGORY,
      action: AuditAction.DELETE,
      entityType: 'GeneralStoreCategory',
      entityId: categoryId,
      description: `Category "${categoryData.name}" deleted`,
      oldValues: categoryData,
      request,
    });
  }

  /**
   * Log item creation
   */
  static async logItemCreation(staffId: number, itemData: any, request: Request): Promise<void> {
    await this.logAuditEvent({
      staffId,
      module: AuditModule.ITEM,
      action: AuditAction.CREATE,
      entityType: 'GeneralStoreItem',
      description: `Item "${itemData.name}" (${itemData.item_code}) created`,
      newValues: itemData,
      request,
    });
  }

  /**
   * Log item update
   */
  static async logItemUpdate(
    staffId: number,
    itemId: number,
    oldData: any,
    newData: any,
    request: Request
  ): Promise<void> {
    await this.logAuditEvent({
      staffId,
      module: AuditModule.ITEM,
      action: AuditAction.UPDATE,
      entityType: 'GeneralStoreItem',
      entityId: itemId,
      description: `Item "${newData.name}" (${newData.item_code}) updated`,
      oldValues: oldData,
      newValues: newData,
      request,
    });
  }

  /**
   * Log stock movement
   */
  static async logStockMovement(
    staffId: number,
    movementData: any,
    request: Request
  ): Promise<void> {
    const action = this.getMovementAction(movementData.movement_type);
    await this.logAuditEvent({
      staffId,
      module: AuditModule.MOVEMENT,
      action,
      entityType: 'GeneralStoreMovement',
      description: `${movementData.movement_type} movement: ${movementData.quantity} units of item ${movementData.item_id}`,
      newValues: movementData,
      request,
    });
  }

  /**
   * Log request creation
   */
  static async logRequestCreation(
    staffId: number,
    requestData: any,
    request: Request
  ): Promise<void> {
    await this.logAuditEvent({
      staffId,
      module: AuditModule.REQUEST,
      action: AuditAction.CREATE,
      entityType: 'GeneralStoreRequest',
      description: `Request ${requestData.request_number} created for ${requestData.requesting_department}`,
      newValues: requestData,
      request,
    });
  }

  /**
   * Log request approval
   */
  static async logRequestApproval(
    staffId: number,
    requestId: number,
    requestData: any,
    request: Request
  ): Promise<void> {
    await this.logAuditEvent({
      staffId,
      module: AuditModule.REQUEST,
      action: AuditAction.APPROVE,
      entityType: 'GeneralStoreRequest',
      entityId: requestId,
      description: `Request ${requestData.request_number} approved`,
      newValues: { status: 'APPROVED', approved_by: staffId },
      request,
    });
  }

  /**
   * Log request rejection
   */
  static async logRequestRejection(
    staffId: number,
    requestId: number,
    requestData: any,
    rejectionReason: string,
    request: Request
  ): Promise<void> {
    await this.logAuditEvent({
      staffId,
      module: AuditModule.REQUEST,
      action: AuditAction.REJECT,
      entityType: 'GeneralStoreRequest',
      entityId: requestId,
      description: `Request ${requestData.request_number} rejected: ${rejectionReason}`,
      newValues: { status: 'REJECTED', rejection_reason: rejectionReason },
      request,
    });
  }

  /**
   * Log request fulfillment
   */
  static async logRequestFulfillment(
    staffId: number,
    requestId: number,
    requestData: any,
    request: Request
  ): Promise<void> {
    await this.logAuditEvent({
      staffId,
      module: AuditModule.REQUEST,
      action: AuditAction.FULFILL,
      entityType: 'GeneralStoreRequest',
      entityId: requestId,
      description: `Request ${requestData.request_number} fulfilled`,
      newValues: { status: 'FULFILLED' },
      request,
    });
  }

  /**
   * Log report generation
   */
  static async logReportGeneration(
    staffId: number,
    reportType: string,
    filters: any,
    request: Request
  ): Promise<void> {
    await this.logAuditEvent({
      staffId,
      module: AuditModule.REPORT,
      action: AuditAction.VIEW,
      entityType: 'Report',
      description: `${reportType} report generated`,
      metadata: { reportType, filters },
      request,
    });
  }

  /**
   * Log report export
   */
  static async logReportExport(
    staffId: number,
    reportType: string,
    filters: any,
    request: Request
  ): Promise<void> {
    await this.logAuditEvent({
      staffId,
      module: AuditModule.REPORT,
      action: AuditAction.EXPORT,
      entityType: 'Report',
      description: `${reportType} report exported`,
      metadata: { reportType, filters },
      request,
    });
  }

  /**
   * Log system error
   */
  static async logSystemError(
    staffId: number,
    error: Error,
    context: string,
    request: Request
  ): Promise<void> {
    await this.logAuditEvent({
      staffId,
      module: AuditModule.SYSTEM,
      action: AuditAction.VIEW,
      entityType: 'System',
      description: `System error in ${context}: ${error.message}`,
      isSuccessful: false,
      errorMessage: error.message,
      metadata: { context, stack: error.stack },
      request,
    });
  }

  /**
   * Get the appropriate audit action for movement type
   */
  private static getMovementAction(movementType: string): AuditAction {
    switch (movementType) {
      case 'IN':
        return AuditAction.STOCK_IN;
      case 'OUT':
        return AuditAction.STOCK_OUT;
      case 'ADJUSTMENT':
        return AuditAction.STOCK_ADJUSTMENT;
      case 'TRANSFER':
        return AuditAction.STOCK_TRANSFER;
      default:
        return AuditAction.UPDATE;
    }
  }

  /**
   * Get audit logs with filtering and pagination
   */
  static async getAuditLogs(filters: any = {}, pagination: any = {}): Promise<any> {
    const where: any = {};

    if (filters.staffId) {
      where.staff_id = filters.staffId;
    }

    if (filters.module) {
      where.module = filters.module;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.entityType) {
      where.entity_type = filters.entityType;
    }

    if (filters.entityId) {
      where.entity_id = filters.entityId;
    }

    if (filters.isSuccessful !== undefined) {
      where.is_successful = filters.isSuccessful;
    }

    if (filters.startDate && filters.endDate) {
      where.created_at = {
        [require('sequelize').Op.between]: [filters.startDate, filters.endDate],
      };
    }

    const options = {
      where,
      include: [
        {
          model: require('../../database/models/staff').Staff,
          as: 'staff',
          attributes: ['id', 'firstname', 'lastname', 'username'],
        },
      ],
      order: [['created_at', 'DESC']],
      ...pagination,
    };

    return await GeneralStoreAuditLog.findAndCountAll(options);
  }
}
