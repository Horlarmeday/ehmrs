import { ProcurementOrder, ProcurementOrderItem, ProcurementOrderHistory, Vendor, Staff, Drug, Unit, PharmacyStore, LaboratoryStore } from '../../database/models';
import { BadException } from '../../common/util/api-error';
import { Op } from 'sequelize';
import { Status } from '../../database/models/staff';
import { DrugForm } from '../../database/models/drug';

export interface ProcurementOrderData {
  po_number: string;
  vendor_id: number;
  order_date: Date;
  expected_delivery_date?: Date;
  notes?: string;
  items: ProcurementItemData[];
}

export interface ProcurementItemData {
  drug_id: number;
  unit_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface ProcurementOrderUpdateData {
  vendor_id?: number;
  expected_delivery_date?: Date;
  notes?: string;
  status?: string;
}

export class ProcurementService {
  /**
   * Create a new procurement order
   */
  static async createProcurementOrder(data: ProcurementOrderData, staffId: number): Promise<ProcurementOrder> {
    // Validate vendor exists
    const vendor = await Vendor.findByPk(data.vendor_id);
    if (!vendor) {
      throw new BadException('NOT_FOUND', 404, 'Vendor not found');
    }

    // Validate all drugs exist
    for (const item of data.items) {
      const drug = await Drug.findByPk(item.drug_id);
      if (!drug) {
        throw new BadException('NOT_FOUND', 404, `Drug with ID ${item.drug_id} not found`);
      }

      const unit = await Unit.findByPk(item.unit_id);
      if (!unit) {
        throw new BadException('NOT_FOUND', 404, `Unit with ID ${item.unit_id} not found`);
      }
    }

    // Calculate total amount
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    // Create procurement order
    const procurementOrder = await ProcurementOrder.create({
      po_number: data.po_number,
      vendor_id: data.vendor_id,
      order_date: data.order_date,
      expected_delivery_date: data.expected_delivery_date,
      notes: data.notes,
      total_amount: totalAmount,
      created_by: staffId,
      status: 'DRAFT'
    });

    // Log the creation
    await ProcurementOrderHistory.logCreation(procurementOrder.id, staffId, {
      po_number: data.po_number,
      vendor_id: data.vendor_id,
      total_amount: totalAmount,
      items_count: data.items.length
    });

    // Create procurement order items
    const orderItems = await Promise.all(
      data.items.map(item => 
        ProcurementOrderItem.create({
          procurement_order_id: procurementOrder.id,
          drug_id: item.drug_id,
          unit_id: item.unit_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
          notes: item.notes,
          status: 'PENDING'
        })
      )
    );

    // Update total amount with actual calculated amount
    const actualTotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    await procurementOrder.update({ total_amount: actualTotal });

    return procurementOrder;
  }

  /**
   * Get procurement order by ID
   */
  static async getProcurementOrder(orderId: number): Promise<ProcurementOrder | null> {
    return await ProcurementOrder.findByPk(orderId, {
      include: [
        {
          model: Vendor,
          attributes: ['name', 'email', 'phone', 'address']
        },
        {
          model: Staff,
          as: 'creator',
          attributes: ['first_name', 'last_name', 'email']
        },
        {
          model: Staff,
          as: 'approver',
          attributes: ['first_name', 'last_name', 'email']
        },
        {
          model: ProcurementOrderItem,
          include: [
            {
              model: Drug,
              attributes: ['name', 'generic_name', 'strength']
            },
            {
              model: Unit,
              attributes: ['name', 'abbreviation']
            }
          ]
        }
      ]
    });
  }

  /**
   * Get all procurement orders with pagination
   */
  static async getProcurementOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    vendor_id?: number;
    date_from?: Date;
    date_to?: Date;
    search?: string;
  }): Promise<{
    orders: ProcurementOrder[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      status,
      vendor_id,
      date_from,
      date_to,
      search
    } = params;

    const offset = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (vendor_id) {
      where.vendor_id = vendor_id;
    }

    if (date_from || date_to) {
      where.order_date = {};
      if (date_from) where.order_date[Op.gte] = date_from;
      if (date_to) where.order_date[Op.lte] = date_to;
    }

    if (search) {
      where[Op.or] = [
        { po_number: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await ProcurementOrder.findAndCountAll({
      where,
      include: [
        {
          model: Vendor,
          attributes: ['name', 'email']
        },
        {
          model: Staff,
          as: 'creator',
          attributes: ['first_name', 'last_name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      orders: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Update procurement order
   */
  static async updateProcurementOrder(orderId: number, data: ProcurementOrderUpdateData): Promise<ProcurementOrder> {
    const order = await ProcurementOrder.findByPk(orderId);
    if (!order) {
      throw new BadException('NOT_FOUND', 404, 'Procurement order not found');
    }

    // Only allow updates if order is in DRAFT status
    if (order.status !== 'DRAFT') {
      throw new BadException('INVALID_STATUS', 400, 'Cannot update order that is not in DRAFT status');
    }

    return await order.update(data);
  }

  /**
   * Approve procurement order
   */
  static async approveProcurementOrder(orderId: number, staffId: number): Promise<ProcurementOrder> {
    const order = await ProcurementOrder.findByPk(orderId);
    if (!order) {
      throw new BadException('NOT_FOUND', 404, 'Procurement order not found');
    }

    if (order.status !== 'DRAFT') {
      throw new BadException('INVALID_STATUS', 400, 'Order must be in DRAFT status to be approved');
    }

    const oldStatus = order.status;
    const result = await order.update({
      status: 'APPROVED',
      approved_by: staffId,
      approved_date: new Date()
    });

    // Log the approval
    await ProcurementOrderHistory.logApproval(orderId, staffId, {
      approved_by: staffId,
      approved_date: new Date(),
      previous_status: oldStatus
    });

    return result;
  }

  /**
   * Send procurement order to vendor
   */
  static async sendProcurementOrder(orderId: number): Promise<ProcurementOrder> {
    const order = await ProcurementOrder.findByPk(orderId);
    if (!order) {
      throw new BadException('NOT_FOUND', 404, 'Procurement order not found');
    }

    if (order.status !== 'APPROVED') {
      throw new BadException('INVALID_STATUS', 400, 'Order must be approved before sending to vendor');
    }

    const oldStatus = order.status;
    const result = await order.update({
      status: 'SENT',
      sent_date: new Date()
    });

    // Log the status change
    await ProcurementOrderHistory.logStatusChange(orderId, order.created_by, oldStatus, 'SENT', 'Order sent to vendor');

    return result;
  }

  /**
   * Receive procurement order items and increase store stock
   */
  static async receiveProcurementOrderItems(orderId: number, receivedItems: Array<{
    item_id: number;
    quantity_received: number;
    batch_number?: string;
    expiration_date?: Date;
    notes?: string;
  }>): Promise<ProcurementOrder> {
    const order = await ProcurementOrder.findByPk(orderId, {
      include: [ProcurementOrderItem]
    });

    if (!order) {
      throw new BadException('NOT_FOUND', 404, 'Procurement order not found');
    }

    if (order.status !== 'SENT') {
      throw new BadException('INVALID_STATUS', 400, 'Order must be sent before receiving items');
    }

    // Update received items and increase store stock
    for (const receivedItem of receivedItems) {
      const orderItem = order.items.find(item => item.id === receivedItem.item_id);
      if (!orderItem) {
        throw new BadException('NOT_FOUND', 404, `Order item with ID ${receivedItem.item_id} not found`);
      }

      if (receivedItem.quantity_received > orderItem.quantity_ordered) {
        throw new BadException('INVALID_QUANTITY', 400, `Received quantity cannot exceed ordered quantity`);
      }

      // Update the procurement order item
      const receiptStatus = receivedItem.quantity_received === orderItem.quantity_ordered 
        ? 'COMPLETE' 
        : receivedItem.quantity_received > 0 
          ? 'PARTIAL' 
          : 'PENDING';

      await orderItem.update({
        quantity_received: receivedItem.quantity_received,
        date_received: new Date(),
        notes: receivedItem.notes,
        receipt_status: receiptStatus,
        batch_number: receivedItem.batch_number,
        expiration_date: receivedItem.expiration_date
      });

      // Increase store stock for received items
      if (receivedItem.quantity_received > 0) {
        await this.increaseStoreStock(orderItem, receivedItem);
      }
    }

    // Check if all items are fully received
    const allItemsReceived = order.items.every(item => 
      item.receipt_status === 'COMPLETE' || item.receipt_status === 'PARTIAL'
    );

    if (allItemsReceived) {
      await order.update({
        status: 'RECEIVED',
        received_date: new Date()
      });

      // Log the completion
      await ProcurementOrderHistory.logStatusChange(orderId, order.created_by, 'SENT', 'RECEIVED', 'All items received');
    }

    return order;
  }

  /**
   * Increase store stock when items are received
   */
  private static async increaseStoreStock(orderItem: ProcurementOrderItem, receivedItem: any): Promise<void> {
    try {
      // Determine store type based on drug type (this could be enhanced)
      // For now, we'll add to PharmacyStore as default
      
      // Check if item already exists in store
      const existingStoreItem = await PharmacyStore.findOne({
        where: {
          drug_id: orderItem.drug_id,
          unit_id: orderItem.unit_id,
          status: Status.ACTIVE
        }
      });

      if (existingStoreItem) {
        // Update existing store item
        await existingStoreItem.update({
          quantity_received: existingStoreItem.quantity_received + receivedItem.quantity_received,
          quantity_remaining: existingStoreItem.quantity_remaining + receivedItem.quantity_received,
          total_price: existingStoreItem.total_price + (receivedItem.quantity_received * orderItem.unit_price)
        });
      } else {
        // Create new store item
        await PharmacyStore.create({
          drug_id: orderItem.drug_id,
          unit_id: orderItem.unit_id,
          quantity_received: receivedItem.quantity_received,
          quantity_remaining: receivedItem.quantity_received,
          unit_price: orderItem.unit_price,
          selling_price: orderItem.unit_price * 1.2, // 20% markup for selling price
          total_price: receivedItem.quantity_received * orderItem.unit_price,
          procurement_order_id: orderItem.procurement_order_id,
          status: Status.ACTIVE,
          drug_form: DrugForm.DRUG, // Default, could be enhanced
          batch: receivedItem.batch_number,
          expiration: receivedItem.expiration_date,
          date_received: new Date()
        });
      }

      // Log the stock increase
      await ProcurementOrderHistory.logFieldUpdate(
        orderItem.procurement_order_id,
        orderItem.procurement_order_id, // Using order ID as staff ID for now
        'stock_increased',
        '0',
        receivedItem.quantity_received.toString(),
        `Stock increased by ${receivedItem.quantity_received} units for drug ID ${orderItem.drug_id}`
      );

    } catch (error) {
      console.error('Error increasing store stock:', error);
      throw new BadException('STOCK_UPDATE_ERROR', 500, 'Failed to update store stock');
    }
  }

  /**
   * Cancel procurement order
   */
  static async cancelProcurementOrder(orderId: number, reason: string): Promise<ProcurementOrder> {
    const order = await ProcurementOrder.findByPk(orderId);
    if (!order) {
      throw new BadException('NOT_FOUND', 404, 'Procurement order not found');
    }

    if (order.status === 'RECEIVED') {
      throw new BadException('INVALID_STATUS', 400, 'Cannot cancel order that has been received');
    }

    const oldStatus = order.status;
    const result = await order.update({
      status: 'CANCELLED',
      cancellation_reason: reason,
      cancelled_date: new Date()
    });

    // Log the cancellation
    await ProcurementOrderHistory.logCancellation(orderId, order.created_by, reason);

    return result;
  }

  /**
   * Get procurement order statistics
   */
  static async getProcurementStatistics(): Promise<{
    total_orders: number;
    draft_orders: number;
    approved_orders: number;
    sent_orders: number;
    received_orders: number;
    cancelled_orders: number;
    total_value: number;
    pending_value: number;
  }> {
    const [
      totalOrders,
      draftOrders,
      approvedOrders,
      sentOrders,
      receivedOrders,
      cancelledOrders,
      totalValue,
      pendingValue
    ] = await Promise.all([
      ProcurementOrder.count(),
      ProcurementOrder.count({ where: { status: 'DRAFT' } }),
      ProcurementOrder.count({ where: { status: 'APPROVED' } }),
      ProcurementOrder.count({ where: { status: 'SENT' } }),
      ProcurementOrder.count({ where: { status: 'RECEIVED' } }),
      ProcurementOrder.count({ where: { status: 'CANCELLED' } }),
      ProcurementOrder.sum('total_amount'),
      ProcurementOrder.sum('total_amount', { 
        where: { 
          status: { [Op.in]: ['DRAFT', 'APPROVED', 'SENT'] } 
        } 
      })
    ]);

    return {
      total_orders: totalOrders,
      draft_orders: draftOrders,
      approved_orders: approvedOrders,
      sent_orders: sentOrders,
      received_orders: receivedOrders,
      cancelled_orders: cancelledOrders,
      total_value: totalValue || 0,
      pending_value: pendingValue || 0
    };
  }

  /**
   * Get vendor performance statistics
   */
  static async getVendorPerformance(vendorId: number): Promise<{
    total_orders: number;
    completed_orders: number;
    total_value: number;
    average_delivery_time: number;
    on_time_delivery_rate: number;
  }> {
    const orders = await ProcurementOrder.findAll({
      where: { 
        vendor_id: vendorId,
        status: { [Op.in]: ['RECEIVED', 'CANCELLED'] }
      },
      attributes: ['order_date', 'expected_delivery_date', 'received_date', 'total_amount']
    });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'RECEIVED').length;
    const totalValue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    // Calculate delivery time statistics
    const deliveryTimes = orders
      .filter(order => order.actual_delivery_date && order.expected_delivery_date)
      .map(order => {
        const expected = new Date(order.expected_delivery_date);
        const actual = new Date(order.actual_delivery_date);
        return Math.ceil((actual.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
      });

    const averageDeliveryTime = deliveryTimes.length > 0 
      ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
      : 0;

    const onTimeDeliveries = deliveryTimes.filter(time => time <= 0).length;
    const onTimeDeliveryRate = deliveryTimes.length > 0 
      ? (onTimeDeliveries / deliveryTimes.length) * 100 
      : 0;

    return {
      total_orders: totalOrders,
      completed_orders: completedOrders,
      total_value: totalValue,
      average_delivery_time: averageDeliveryTime,
      on_time_delivery_rate: onTimeDeliveryRate
    };
  }

  /**
   * Generate PO number
   */
  static async generatePONumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const lastOrder = await ProcurementOrder.findOne({
      where: {
        po_number: { [Op.like]: `PO-${currentYear}-%` }
      },
      order: [['po_number', 'DESC']]
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.po_number.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `PO-${currentYear}-${sequence.toString().padStart(3, '0')}`;
  }
}
