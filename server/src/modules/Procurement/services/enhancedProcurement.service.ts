import { Transaction, Op } from 'sequelize';
import sequelizeConnection from '../../../database/config/data-source';
import { ProcurementOrder, ProcurementOrderItem } from '../../../database/models';
import { BadException } from '../../../common/util/api-error';
import { ProcurementRoutingService, ReceivedItemData } from './procurementRouting.service';
import { ItemTypeDetectionService } from './itemTypeDetection.service';
import { DrugForm } from '../../../database/models/drug';

export interface EnhancedReceivedItem {
  item_id: number;
  quantity_received: number;
  unit_cost?: number;
  batch_number?: string;
  expiration_date?: Date;
  notes?: string;
  destination_override?: {
    store_type: 'pharmacy' | 'general' | 'laboratory';
    dispensary_id?: number;
  };
  auto_distribute?: boolean;
}

export interface ReceivingOptions {
  auto_detect_item_types?: boolean;
  auto_distribute_to_dispensaries?: boolean;
  staff_id: number;
  receive_all_as_ordered?: boolean; // Option to receive all items as ordered quantities
}

export class EnhancedProcurementService {
  /**
   * Enhanced receive procurement order items with smart routing
   */
  static async receiveProcurementOrderItemsEnhanced(
    orderId: number,
    receivedItems: EnhancedReceivedItem[],
    options: ReceivingOptions
  ): Promise<ProcurementOrder> {
    const transaction = await sequelizeConnection.transaction();

    try {
      // Get procurement order with items
      const order = await ProcurementOrder.findByPk(orderId, {
        include: [ProcurementOrderItem],
        transaction,
      });

      if (!order) {
        throw new BadException('NOT_FOUND', 404, 'Procurement order not found');
      }

      if (order.status !== 'SENT') {
        throw new BadException('INVALID_STATUS', 400, 'Order must be sent before receiving items');
      }

      // Process each received item
      const routingData: ReceivedItemData[] = [];

      for (const receivedItem of receivedItems) {
        const orderItem = order.items.find(item => item.id === receivedItem.item_id);
        if (!orderItem) {
          throw new BadException(
            'NOT_FOUND',
            404,
            `Order item with ID ${receivedItem.item_id} not found`
          );
        }

        // Validate received quantity
        if (receivedItem.quantity_received > orderItem.quantity_ordered) {
          throw new BadException(
            'INVALID_QUANTITY',
            400,
            'Received quantity cannot exceed ordered quantity'
          );
        }

        // Update procurement order item
        const receiptStatus =
          receivedItem.quantity_received === orderItem.quantity_ordered
            ? 'COMPLETE'
            : receivedItem.quantity_received > 0
            ? 'PARTIAL'
            : 'PENDING';

        await orderItem.update(
          {
            quantity_received: receivedItem.quantity_received,
            date_received: new Date(),
            notes: receivedItem.notes,
            receipt_status: receiptStatus,
            batch_number: receivedItem.batch_number,
            expiration_date: receivedItem.expiration_date,
          },
          { transaction }
        );

        // Prepare routing data if items were received
        if (receivedItem.quantity_received > 0) {
          let itemType = 'drug'; // Default assumption for backward compatibility

          // Auto-detect item type if enabled
          if (options.auto_detect_item_types) {
            try {
              const detection = await ItemTypeDetectionService.detectItemType(
                orderItem.drug_id,
                orderItem.drug?.name
              );
              itemType = detection.item_type;
            } catch (error) {
              console.warn(`Failed to detect item type for item ${orderItem.drug_id}:`, error);
              // Continue with default type
            }
          }

          routingData.push({
            item_id: orderItem.drug_id,
            item_type: itemType as any,
            quantity_received: receivedItem.quantity_received,
            unit_cost: receivedItem.unit_cost || orderItem.unit_price,
            batch_number: receivedItem.batch_number,
            expiration_date: receivedItem.expiration_date,
            destination_override: receivedItem.destination_override,
          });
        }
      }

      // Route all received items to appropriate stores
      if (routingData.length > 0) {
        await ProcurementRoutingService.routeReceivedItems(orderId, routingData, options.staff_id);
      }

      // Update order status if all items are received
      const allItemsReceived = order.items.every(
        item => item.receipt_status === 'COMPLETE' || item.receipt_status === 'PARTIAL'
      );

      if (allItemsReceived) {
        await order.update(
          {
            status: 'RECEIVED',
            received_date: new Date(),
          },
          { transaction }
        );

        // Log the completion
        const { ProcurementOrderHistory } = require('../../../database/models');
        await ProcurementOrderHistory.logStatusChange(
          orderId,
          options.staff_id,
          'SENT',
          'RECEIVED',
          'All items received and routed to appropriate stores'
        );
      }

      await transaction.commit();

      // Return updated order with items
      return await ProcurementOrder.findByPk(orderId, {
        include: [ProcurementOrderItem],
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Receive all items as ordered (convenience method)
   */
  static async receiveAllAsOrdered(
    orderId: number,
    options: Omit<ReceivingOptions, 'receive_all_as_ordered'>
  ): Promise<ProcurementOrder> {
    // Get order items first
    const order = await ProcurementOrder.findByPk(orderId, {
      include: [ProcurementOrderItem],
    });

    if (!order) {
      throw new BadException('NOT_FOUND', 404, 'Procurement order not found');
    }

    // Create received items array with full quantities
    const receivedItems: EnhancedReceivedItem[] = order.items.map(item => ({
      item_id: item.id,
      quantity_received: item.quantity_ordered,
      unit_cost: item.unit_price,
      auto_distribute: true,
    }));

    return this.receiveProcurementOrderItemsEnhanced(orderId, receivedItems, {
      ...options,
      auto_detect_item_types: true,
      auto_distribute_to_dispensaries: true,
    });
  }

  /**
   * Receive items with partial quantities
   */
  static async receivePartialItems(
    orderId: number,
    partialItems: Array<{
      item_id: number;
      quantity_received: number;
      reason?: string;
    }>,
    staffId: number
  ): Promise<ProcurementOrder> {
    const receivedItems: EnhancedReceivedItem[] = partialItems.map(item => ({
      item_id: item.item_id,
      quantity_received: item.quantity_received,
      notes: item.reason,
      auto_distribute: true,
    }));

    return this.receiveProcurementOrderItemsEnhanced(orderId, receivedItems, {
      staff_id: staffId,
      auto_detect_item_types: true,
      auto_distribute_to_dispensaries: true,
    });
  }

  /**
   * Preview routing decisions before receiving
   */
  static async previewReceivingPlan(
    orderId: number,
    receivedItems: EnhancedReceivedItem[]
  ): Promise<{
    order_summary: any;
    routing_plan: Array<{
      item_id: number;
      item_name: string;
      quantity: number;
      detection_result: any;
      routing_decision: any;
      distribution_plan: any[];
    }>;
    warnings: string[];
    total_value: number;
  }> {
    const order = await ProcurementOrder.findByPk(orderId, {
      include: [ProcurementOrderItem],
    });

    if (!order) {
      throw new BadException('NOT_FOUND', 404, 'Procurement order not found');
    }

    const routingPlan = [];
    const warnings = [];
    let totalValue = 0;

    for (const receivedItem of receivedItems) {
      const orderItem = order.items.find(item => item.id === receivedItem.item_id);
      if (!orderItem) {
        warnings.push(`Order item with ID ${receivedItem.item_id} not found`);
        continue;
      }

      if (receivedItem.quantity_received > orderItem.quantity_ordered) {
        warnings.push(
          `Received quantity (${receivedItem.quantity_received}) exceeds ordered quantity (${orderItem.quantity_ordered}) for item ${receivedItem.item_id}`
        );
      }

      // Detect item type
      const detection = await ItemTypeDetectionService.detectItemType(
        orderItem.drug_id,
        orderItem.drug?.name
      );

      // Preview routing
      const routing = await ProcurementRoutingService.previewDistribution(
        orderItem.drug_id,
        detection.item_type,
        receivedItem.quantity_received
      );

      const itemValue =
        receivedItem.quantity_received * (receivedItem.unit_cost || orderItem.unit_price);
      totalValue += itemValue;

      routingPlan.push({
        item_id: receivedItem.item_id,
        item_name: orderItem.drug?.name || `Item ${receivedItem.item_id}`,
        quantity: receivedItem.quantity_received,
        detection_result: detection,
        routing_decision: routing.routing_decision,
        distribution_plan: routing.distribution_plan,
      });
    }

    return {
      order_summary: {
        po_number: order.po_number,
        vendor: order.vendor?.name,
        total_items: receivedItems.length,
        order_status: order.status,
      },
      routing_plan: routingPlan,
      warnings,
      total_value: totalValue,
    };
  }

  /**
   * Get enhanced procurement statistics including routing data
   */
  static async getEnhancedProcurementStatistics(dateRange?: { start: Date; end: Date }) {
    const endDate = dateRange?.end || new Date();
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get basic procurement stats
    const { Op } = require('sequelize');

    const orders = await ProcurementOrder.findAll({
      where: {
        received_date: { [Op.between]: [startDate, endDate] },
      },
      include: [ProcurementOrderItem],
    });

    // Calculate routing distribution
    const routingStats = {
      pharmacy: { orders: 0, items: 0, value: 0 },
      general: { orders: 0, items: 0, value: 0 },
      laboratory: { orders: 0, items: 0, value: 0 },
    };

    const totalAutoDistributed = 0;
    let totalItems = 0;

    for (const order of orders) {
      for (const item of order.items) {
        totalItems++;
        const itemValue = (item.quantity_received || 0) * (item.unit_price || 0);

        // This is a simplified classification - in practice would use detection service
        if (item.drug?.type === DrugForm.CONSUMABLE) {
          routingStats.general.items++;
          routingStats.general.value += itemValue;
        } else {
          routingStats.pharmacy.items++;
          routingStats.pharmacy.value += itemValue;
        }
      }
    }

    return {
      period: { start: startDate, end: endDate },
      total_orders: orders.length,
      total_items: totalItems,
      total_value: Object.values(routingStats).reduce((sum, stat) => sum + stat.value, 0),
      routing_distribution: routingStats,
      auto_distribution_rate: totalItems > 0 ? (totalAutoDistributed / totalItems) * 100 : 0,
      average_items_per_order: orders.length > 0 ? totalItems / orders.length : 0,
    };
  }

  /**
   * Get items pending receipt
   */
  static async getPendingReceiptItems(filters?: {
    vendor_id?: number;
    overdue_only?: boolean;
    days_overdue?: number;
  }) {
    const whereClause: any = {
      status: 'SENT',
    };

    if (filters?.vendor_id) {
      whereClause.vendor_id = filters.vendor_id;
    }

    if (filters?.overdue_only) {
      const daysOverdue = filters.days_overdue || 7;
      const overdueDate = new Date(Date.now() - daysOverdue * 24 * 60 * 60 * 1000);
      whereClause.expected_delivery_date = { [Op.lt]: overdueDate };
    }

    const orders = await ProcurementOrder.findAll({
      where: whereClause,
      include: [
        {
          model: ProcurementOrderItem,
          where: {
            receipt_status: { [Op.in]: ['PENDING', 'PARTIAL'] },
          },
        },
        {
          model: require('../../../database/models').Vendor,
          attributes: ['name', 'email', 'phone'],
        },
      ],
      order: [['expected_delivery_date', 'ASC']],
    });

    return orders.map(order => ({
      id: order.id,
      po_number: order.po_number,
      vendor: order.vendor,
      expected_delivery_date: order.expected_delivery_date,
      days_overdue: order.expected_delivery_date
        ? Math.max(
            0,
            Math.floor(
              (Date.now() - order.expected_delivery_date.getTime()) / (24 * 60 * 60 * 1000)
            )
          )
        : 0,
      pending_items: order.items.length,
      total_value: order.total_amount,
    }));
  }

  /**
   * Bulk receive multiple orders
   */
  static async bulkReceiveOrders(
    orderIds: number[],
    staffId: number,
    options: {
      auto_detect_types?: boolean;
      auto_distribute?: boolean;
      mark_as_complete?: boolean;
    } = {}
  ): Promise<{ successful: number[]; failed: Array<{ orderId: number; error: string }> }> {
    const successful: number[] = [];
    const failed: Array<{ orderId: number; error: string }> = [];

    for (const orderId of orderIds) {
      try {
        await this.receiveAllAsOrdered(orderId, {
          staff_id: staffId,
          auto_detect_item_types: options.auto_detect_types !== false,
          auto_distribute_to_dispensaries: options.auto_distribute !== false,
        });
        successful.push(orderId);
      } catch (error) {
        failed.push({
          orderId,
          error: error.message || 'Unknown error occurred',
        });
      }
    }

    return { successful, failed };
  }
}
