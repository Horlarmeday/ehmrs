import { Transaction } from 'sequelize';
import { BadException } from '../../../common/util/api-error';
import {
  GeneralStoreDispensary,
  GeneralStoreDispensaryItem,
  GeneralStoreItem,
  GeneralStoreRequest,
  GeneralStoreRequestItem,
  GeneralStoreMovement,
} from '../../../database/models/generalStore';
import { Staff } from '../../../database/models/staff';
import { UniversalInventoryService } from '../../../core/services/universalInventory.service';
import {
  RequestStatus,
  ItemRequestStatus,
  MovementType,
} from '../../../database/models/generalStore/types';
import { Op } from 'sequelize';
import sequelizeConnection from '../../../database/config/data-source';
import { staffAttributes } from '../../../core/helpers/helper';

export interface ApprovalDto {
  request_id: number;
  approver_id: number;
  approval_status: 'approved' | 'rejected' | 'partial';
  approval_notes?: string;
  approved_items: Array<{
    item_id: number;
    quantity_approved: number;
    source_dispensary_id?: number; // For cross-dispensary transfers
    alternative_item_id?: number; // For substitutions
    notes?: string;
  }>;
}

export interface TransferExecutionDto {
  from_store_type: 'main_store' | 'dispensary';
  from_store_id: number;
  to_dispensary_id: number;
  item_id: number;
  quantity: number;
  unit_cost?: number;
  batch_number?: string;
  expiration_date?: Date;
  reason: string;
  staff_id: number;
}

export interface RequestFilters {
  status?: RequestStatus;
  dispensary_id?: number;
  requesting_staff_id?: number;
  priority?: string;
  date_from?: Date;
  date_to?: Date;
  page?: number;
  limit?: number;
}

export interface WorkflowMetrics {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  average_approval_time: number; // in hours
  approval_rate: number; // percentage
  top_requesting_departments: Array<{
    department_name: string;
    request_count: number;
  }>;
  top_requested_items: Array<{
    item_name: string;
    quantity_requested: number;
    approval_rate: number;
  }>;
}

export class WorkflowManagementService {
  /**
   * Approve dispensary request
   */
  static async approveDispensaryRequest(approvalData: ApprovalDto): Promise<GeneralStoreRequest> {
    const transaction = await sequelizeConnection.transaction();

    try {
      // Find and validate request
      const request = await GeneralStoreRequest.findByPk(approvalData.request_id, {
        include: [
          {
            model: GeneralStoreRequestItem,
            include: [
              {
                model: GeneralStoreItem,
                attributes: ['id', 'name', 'item_code', 'current_stock'],
              },
            ],
          },
          {
            model: GeneralStoreDispensary,
            attributes: ['id', 'name', 'status'],
          },
        ],
      });

      if (!request) {
        throw new BadException('REQUEST_NOT_FOUND', 404, 'Request not found');
      }

      if (request.status !== RequestStatus.PENDING) {
        throw new BadException(
          'INVALID_STATUS',
          400,
          `Request cannot be ${approvalData.approval_status}. Current status: ${request.status}`
        );
      }

      // Validate approver
      const approver = await Staff.findByPk(approvalData.approver_id);
      if (!approver) {
        throw new BadException('APPROVER_NOT_FOUND', 404, 'Approver not found');
      }

      // Note: Dispensary validation would require additional logic here if needed

      // Process approval based on status
      let finalStatus: RequestStatus;
      let processedItems = 0;

      switch (approvalData.approval_status) {
        case 'approved':
          finalStatus = RequestStatus.APPROVED;
          processedItems = await this.processApprovedItems(
            request,
            approvalData.approved_items,
            approvalData.approver_id,
            transaction
          );
          break;

        case 'partial':
          finalStatus = RequestStatus.PARTIALLY_FULFILLED;
          processedItems = await this.processApprovedItems(
            request,
            approvalData.approved_items,
            approvalData.approver_id,
            transaction
          );
          break;

        case 'rejected':
          finalStatus = RequestStatus.REJECTED;
          await this.processRejectedItems(
            request,
            approvalData.approver_id,
            approvalData.approval_notes,
            transaction
          );
          break;

        default:
          throw new BadException('INVALID_APPROVAL_STATUS', 400, 'Invalid approval status');
      }

      // Update main request
      await request.update(
        {
          status: finalStatus,
          approved_by: approvalData.approver_id,
          notes: approvalData.approval_notes,
        },
        { transaction }
      );

      await transaction.commit();

      // Return updated request with includes
      return await GeneralStoreRequest.findByPk(request.id, {
        include: [
          { model: GeneralStoreRequestItem, include: [GeneralStoreItem] },
          { model: GeneralStoreDispensary },
          { model: Staff, as: 'requesting_staff', attributes: staffAttributes },
          { model: Staff, as: 'approving_staff', attributes: staffAttributes },
        ],
      });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof BadException) throw error;
      throw new BadException(
        'APPROVAL_FAILED',
        500,
        `Failed to process approval: ${error.message}`
      );
    }
  }

  /**
   * Reject dispensary request
   */
  static async rejectDispensaryRequest(
    requestId: number,
    approverId: number,
    rejectionReason: string
  ): Promise<GeneralStoreRequest> {
    return this.approveDispensaryRequest({
      request_id: requestId,
      approver_id: approverId,
      approval_status: 'rejected',
      approval_notes: rejectionReason,
      approved_items: [],
    });
  }

  /**
   * Get pending requests for approval
   */
  static async getPendingRequests(filters: RequestFilters = {}) {
    const whereClause: any = {
      status: RequestStatus.PENDING,
    };

    // Note: dispensary_id filtering removed as field doesn't exist in model

    if (filters.requesting_staff_id) {
      whereClause.requesting_staff_id = filters.requesting_staff_id;
    }

    if (filters.priority) {
      whereClause.priority = filters.priority;
    }

    if (filters.date_from && filters.date_to) {
      whereClause.requested_date = {
        [Op.between]: [filters.date_from, filters.date_to],
      };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const result = await GeneralStoreRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: GeneralStoreRequestItem,
          where: {
            status: { [Op.in]: [ItemRequestStatus.PENDING, ItemRequestStatus.PARTIALLY_ISSUED] },
          },
          required: false,
          include: [
            {
              model: GeneralStoreItem,
              attributes: ['id', 'name', 'item_code', 'current_stock', 'unit_cost'],
            },
          ],
        },
        {
          model: GeneralStoreDispensary,
          attributes: ['id', 'name', 'location'],
        },
        {
          model: Staff,
          as: 'requesting_staff',
          attributes: ['id', 'firstname', 'lastname', 'email'],
        },
      ],
      order: [
        ['priority', 'DESC'], // Urgent first
        ['requested_date', 'ASC'], // Oldest first
      ],
      limit,
      offset,
    });

    return {
      requests: result.rows,
      pagination: {
        total: result.count,
        page,
        limit,
        totalPages: Math.ceil(result.count / limit),
      },
    };
  }

  /**
   * Get request history with filters
   */
  static async getRequestHistory(filters: RequestFilters = {}) {
    const whereClause: any = {};

    if (filters.status) {
      whereClause.status = filters.status;
    } else {
      whereClause.status = { [Op.ne]: RequestStatus.PENDING };
    }

    // Note: dispensary_id filtering removed as field doesn't exist in model

    if (filters.requesting_staff_id) {
      whereClause.requesting_staff_id = filters.requesting_staff_id;
    }

    if (filters.date_from && filters.date_to) {
      whereClause.createdAt = {
        [Op.between]: [filters.date_from, filters.date_to],
      };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const result = await GeneralStoreRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: GeneralStoreRequestItem,
          include: [
            {
              model: GeneralStoreItem,
              attributes: ['id', 'name', 'item_code'],
            },
          ],
        },
        {
          model: GeneralStoreDispensary,
          attributes: ['id', 'name'],
        },
        {
          model: Staff,
          as: 'requesting_staff',
          attributes: ['id', 'firstname', 'lastname'],
        },
        {
          model: Staff,
          as: 'approving_staff',
          attributes: ['id', 'firstname', 'lastname'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      requests: result.rows,
      pagination: {
        total: result.count,
        page,
        limit,
        totalPages: Math.ceil(result.count / limit),
      },
    };
  }

  /**
   * Process approved items
   */
  private static async processApprovedItems(
    request: GeneralStoreRequest,
    approvedItems: ApprovalDto['approved_items'],
    approverId: number,
    transaction: Transaction
  ): Promise<number> {
    let processedCount = 0;

    for (const approvedItem of approvedItems) {
      const requestItem = request.requestItems.find(ri => ri.item_id === approvedItem.item_id);

      if (!requestItem) {
        throw new BadException(
          'REQUEST_ITEM_NOT_FOUND',
          404,
          `Request item with ID ${approvedItem.item_id} not found in request`
        );
      }

      // Validate approved quantity
      if (approvedItem.quantity_approved <= 0) {
        throw new BadException(
          'INVALID_QUANTITY',
          400,
          'Approved quantity must be greater than zero'
        );
      }

      if (approvedItem.quantity_approved > requestItem.quantity_requested) {
        throw new BadException(
          'EXCESSIVE_QUANTITY',
          400,
          `Approved quantity (${approvedItem.quantity_approved}) exceeds requested quantity (${requestItem.quantity_requested})`
        );
      }

      // Update request item
      const itemStatus =
        approvedItem.quantity_approved === requestItem.quantity_requested
          ? ItemRequestStatus.APPROVED
          : ItemRequestStatus.PARTIALLY_ISSUED;

      await requestItem.update(
        {
          quantity_approved: approvedItem.quantity_approved,
          status: itemStatus,
          notes: approvedItem.notes,
        },
        { transaction }
      );

      // For now, skip the transfer logic since we need to determine target dispensary from the request context
      // This would need to be implemented based on how dispensary requests are linked to specific dispensaries
      console.log(
        `Transfer needed: ${approvedItem.quantity_approved} units of item ${approvedItem.item_id} for request ${request.id}`
      );

      processedCount++;
    }

    // Update any remaining items as rejected if partial approval
    const remainingItems = request.requestItems.filter(
      ri => !approvedItems.find(ai => ai.item_id === ri.item_id)
    );

    for (const remainingItem of remainingItems) {
      await remainingItem.update(
        {
          status: ItemRequestStatus.PENDING,
          notes: 'Not included in partial approval',
        },
        { transaction }
      );
    }

    return processedCount;
  }

  /**
   * Process rejected items
   */
  private static async processRejectedItems(
    request: GeneralStoreRequest,
    approverId: number,
    rejectionReason?: string,
    transaction?: Transaction
  ): Promise<void> {
    for (const requestItem of request.requestItems) {
      await requestItem.update(
        {
          status: ItemRequestStatus.PENDING,
          notes: rejectionReason || 'Request rejected',
        },
        { transaction }
      );
    }
  }

  /**
   * Execute transfer from approved request
   */
  private static async executeTransfer(
    transfer: TransferExecutionDto,
    transaction?: Transaction
  ): Promise<void> {
    if (transfer.from_store_type === 'main_store') {
      // Transfer from main GeneralStore
      await UniversalInventoryService.transferToDispensary({
        from_store_type: 'general',
        from_store_id: transfer.from_store_id,
        to_dispensary_id: transfer.to_dispensary_id,
        item_id: transfer.item_id,
        quantity: transfer.quantity,
        reason: transfer.reason,
        staff_id: transfer.staff_id,
        unit_cost: transfer.unit_cost,
        batch_number: transfer.batch_number,
        expiration_date: transfer.expiration_date,
      });
    } else {
      // Transfer between dispensaries
      await this.transferBetweenDispensaries(
        transfer.from_store_id, // source dispensary ID
        transfer.to_dispensary_id,
        transfer.item_id,
        transfer.quantity,
        transfer.staff_id,
        transfer.reason,
        transaction
      );
    }
  }

  /**
   * Transfer items between dispensaries
   */
  private static async transferBetweenDispensaries(
    fromDispensaryId: number,
    toDispensaryId: number,
    itemId: number,
    quantity: number,
    staffId: number,
    reason: string,
    transaction?: Transaction
  ): Promise<void> {
    // Find source dispensary item
    const sourceItem = await GeneralStoreDispensaryItem.findOne({
      where: {
        dispensary_id: fromDispensaryId,
        item_id: itemId,
        status: 'active',
      },
    });

    if (!sourceItem) {
      throw new BadException('SOURCE_ITEM_NOT_FOUND', 404, 'Item not found in source dispensary');
    }

    if (!sourceItem.canDispense(quantity)) {
      throw new BadException(
        'INSUFFICIENT_STOCK',
        400,
        `Insufficient stock in source dispensary. Available: ${sourceItem.getAvailableQuantity()}`
      );
    }

    // Dispense from source
    sourceItem.dispense(quantity);
    await sourceItem.save({ transaction });

    // Find or create target dispensary item
    let targetItem = await GeneralStoreDispensaryItem.findOne({
      where: {
        dispensary_id: toDispensaryId,
        item_id: itemId,
        batch_number: sourceItem.batch_number || null,
      },
    });

    if (targetItem) {
      targetItem.receive(quantity, sourceItem.unit_cost);
      await targetItem.save({ transaction });
    } else {
      targetItem = await GeneralStoreDispensaryItem.create(
        {
          dispensary_id: toDispensaryId,
          item_id: itemId,
          quantity_received: quantity,
          quantity_remaining: quantity,
          unit_cost: sourceItem.unit_cost,
          total_value: quantity * parseFloat(sourceItem.unit_cost.toString()),
          batch_number: sourceItem.batch_number,
          expiration_date: sourceItem.expiration_date,
          received_from_type: 'other_dispensary',
          received_from_id: fromDispensaryId,
          status: 'active',
          last_movement_date: new Date(),
        },
        { transaction }
      );
    }

    // Record movements
    await GeneralStoreMovement.create(
      {
        item_id: itemId,
        movement_type: MovementType.TRANSFER,
        quantity: quantity,
        unit_cost: sourceItem.unit_cost,
        total_cost: quantity * parseFloat(sourceItem.unit_cost.toString()),
        reason: reason,
        staff_id: staffId,
        reference_type: 'INTER_DISPENSARY_TRANSFER',
        reference_id: fromDispensaryId,
        batch_number: sourceItem.batch_number,
        notes: `Transfer from dispensary ${fromDispensaryId} to ${toDispensaryId}`,
      },
      { transaction }
    );
  }

  /**
   * Get workflow metrics
   */
  static async getWorkflowMetrics(dateRange?: {
    start: Date;
    end: Date;
  }): Promise<WorkflowMetrics> {
    const endDate = dateRange?.end || new Date();
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const whereClause = {
      createdAt: { [Op.between]: [startDate, endDate] },
    };

    // Get all requests in date range
    const requests = await GeneralStoreRequest.findAll({
      where: whereClause,
      include: [
        {
          model: GeneralStoreRequestItem,
          include: [GeneralStoreItem],
        },
        {
          model: GeneralStoreDispensary,
          include: ['department'],
        },
        { model: Staff, as: 'requesting_staff' },
      ],
    });

    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING).length;
    const approvedRequests = requests.filter(r =>
      [RequestStatus.APPROVED, RequestStatus.PARTIALLY_FULFILLED].includes(r.status)
    ).length;
    const rejectedRequests = requests.filter(r => r.status === RequestStatus.REJECTED).length;

    // Calculate average approval time (simplified since we don't have approved_date field)
    const processedRequests = requests.filter(r => r.status !== RequestStatus.PENDING);
    const averageApprovalTime =
      processedRequests.length > 0
        ? processedRequests.reduce((sum, r) => {
            const requestTime = new Date(r.request_date || r.createdAt).getTime();
            const approvalTime = new Date(r.updatedAt).getTime();
            return sum + (approvalTime - requestTime);
          }, 0) /
          processedRequests.length /
          (1000 * 60 * 60) // Convert to hours
        : 0;

    const approvalRate = totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0;

    // Top requesting departments
    const departmentMap = new Map<string, number>();
    requests.forEach(request => {
      const deptName = request.requesting_department || 'Unknown';
      departmentMap.set(deptName, (departmentMap.get(deptName) || 0) + 1);
    });

    const topRequestingDepartments = Array.from(departmentMap.entries())
      .map(([name, count]) => ({ department_name: name, request_count: count }))
      .sort((a, b) => b.request_count - a.request_count)
      .slice(0, 5);

    // Top requested items
    const itemMap = new Map<string, { quantity: number; approved: number }>();
    requests.forEach(request => {
      request.requestItems.forEach(requestItem => {
        const itemName = requestItem.item?.name || 'Unknown';
        const existing = itemMap.get(itemName) || { quantity: 0, approved: 0 };
        existing.quantity += requestItem.quantity_requested;
        if (requestItem.status === ItemRequestStatus.APPROVED) {
          existing.approved += requestItem.quantity_approved || 0;
        }
        itemMap.set(itemName, existing);
      });
    });

    const topRequestedItems = Array.from(itemMap.entries())
      .map(([name, stats]) => ({
        item_name: name,
        quantity_requested: stats.quantity,
        approval_rate: stats.quantity > 0 ? (stats.approved / stats.quantity) * 100 : 0,
      }))
      .sort((a, b) => b.quantity_requested - a.quantity_requested)
      .slice(0, 10);

    return {
      total_requests: totalRequests,
      pending_requests: pendingRequests,
      approved_requests: approvedRequests,
      rejected_requests: rejectedRequests,
      average_approval_time: Math.round(averageApprovalTime * 100) / 100,
      approval_rate: Math.round(approvalRate * 100) / 100,
      top_requesting_departments: topRequestingDepartments,
      top_requested_items: topRequestedItems,
    };
  }

  /**
   * Auto-approve simple requests based on rules
   */
  static async autoApproveEligibleRequests(): Promise<number> {
    try {
      let approvedCount = 0;

      // Find eligible requests (simple criteria for auto-approval)
      const eligibleRequests = await GeneralStoreRequest.findAll({
        where: {
          status: RequestStatus.PENDING,
          priority: { [Op.in]: ['LOW', 'MEDIUM'] },
          createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Within last 7 days
        },
        include: [
          {
            model: GeneralStoreRequestItem,
            where: {
              status: ItemRequestStatus.PENDING,
              quantity_requested: { [Op.lte]: 10 }, // Small quantities only
            },
            include: [
              {
                model: GeneralStoreItem,
                where: {
                  current_stock: { [Op.gte]: 50 }, // Items with sufficient stock
                },
              },
            ],
          },
          GeneralStoreDispensary,
        ],
      });

      const systemUserId = 1; // System user for auto-approvals

      for (const request of eligibleRequests) {
        try {
          // Auto-approve if all items meet criteria
          const approvedItems = request.requestItems.map(item => ({
            item_id: item.item_id,
            quantity_approved: item.quantity_requested,
            notes: 'Auto-approved by system',
          }));

          await this.approveDispensaryRequest({
            request_id: request.id,
            approver_id: systemUserId,
            approval_status: 'approved',
            approval_notes: 'Auto-approved based on system criteria',
            approved_items: approvedItems,
          });

          approvedCount++;
        } catch (error) {
          console.error(`Failed to auto-approve request ${request.id}:`, error);
        }
      }

      return approvedCount;
    } catch (error) {
      console.error('Auto-approval process failed:', error);
      return 0;
    }
  }

  /**
   * Escalate overdue requests
   */
  static async escalateOverdueRequests(): Promise<void> {
    try {
      const overdueThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

      const overdueRequests = await GeneralStoreRequest.findAll({
        where: {
          status: RequestStatus.PENDING,
          createdAt: { [Op.lte]: overdueThreshold },
        },
        include: [GeneralStoreDispensary, { model: Staff, as: 'requesting_staff' }],
      });

      for (const request of overdueRequests) {
        // Here you would implement escalation logic:
        // - Send notifications to supervisors
        // - Update priority to URGENT
        // - Log escalation event

        await request.update({
          priority: 'URGENT',
          notes:
            (request.notes || '') +
            `\n[ESCALATED: Request overdue as of ${new Date().toISOString()}]`,
        });

        console.log(
          `Escalated overdue request ${request.id} for department ${request.requesting_department}`
        );
      }
    } catch (error) {
      console.error('Request escalation failed:', error);
    }
  }
}
