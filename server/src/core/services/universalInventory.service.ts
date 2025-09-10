import { Transaction, Op } from 'sequelize';
import sequelizeConnection from '../../database/config/config';
import { BadException } from '../../common/util/api-error';
import {
  GeneralStoreDispensary,
  GeneralStoreDispensaryItem,
  GeneralStoreItem,
  GeneralStoreMovement,
} from '../../database/models/generalStore';
import { PharmacyStore } from '../../database/models/pharmacyStore';
import { InventoryItem } from '../../database/models/inventoryItem';
import { LaboratoryStore } from '../../database/models/laboratoryStore';
import { MovementType } from '../../database/models/generalStore/types';
import { Staff } from '../../database/models/staff';
import { Department } from '../../database/models/department';

export interface TransferParams {
  from_store_type: 'pharmacy' | 'general' | 'laboratory';
  from_store_id: number;
  to_dispensary_id: number;
  item_id: number;
  quantity: number;
  reason: string;
  staff_id: number;
  batch_number?: string;
  expiration_date?: Date;
  unit_cost?: number;
}

export interface DispenseParams {
  dispensary_id: number;
  item_id: number;
  quantity: number;
  reason: string;
  staff_id: number;
  patient_id?: number;
  visit_id?: number;
  batch_number?: string;
}

export interface SourceItemInfo {
  id: number;
  quantity_remaining: number;
  unit_cost: number;
  batch_number?: string;
  expiration_date?: Date;
}

export interface CrossStoreReportFilters {
  start_date: Date;
  end_date: Date;
  store_types?: string[];
  dispensary_ids?: number[];
  item_ids?: number[];
  include_movements?: boolean;
}

export interface CrossStoreReport {
  summary: {
    total_stores: number;
    total_dispensaries: number;
    total_value: number;
    total_movements: number;
  };
  stores: Array<{
    store_type: string;
    store_name: string;
    total_items: number;
    total_value: number;
    dispensaries: Array<{
      id: number;
      name: string;
      total_items: number;
      total_value: number;
      stock_status: string;
    }>;
  }>;
  movements?: Array<{
    date: Date;
    type: string;
    from_store: string;
    to_store: string;
    item_name: string;
    quantity: number;
    staff_name: string;
  }>;
}

export class UniversalInventoryService {
  /**
   * Transfer stock from main store to dispensary
   */
  static async transferToDispensary(transfer: TransferParams): Promise<GeneralStoreDispensaryItem> {
    const transaction = await sequelizeConnection.transaction();

    try {
      // 1. Validate destination dispensary exists and is active
      const dispensary = await GeneralStoreDispensary.findOne({
        where: { id: transfer.to_dispensary_id, status: 'active' },
      });

      if (!dispensary) {
        throw new BadException('DISPENSARY_NOT_FOUND', 404, 'Dispensary not found or inactive');
      }

      // 2. Get source item and validate stock
      const sourceItem = await this.getSourceItem(
        transfer.from_store_type,
        transfer.from_store_id,
        transfer.item_id
      );

      if (sourceItem.quantity_remaining < transfer.quantity) {
        throw new BadException(
          'INSUFFICIENT_STOCK',
          400,
          `Insufficient stock. Available: ${sourceItem.quantity_remaining}, Requested: ${transfer.quantity}`
        );
      }

      // 3. Validate dispensary can accept this item type
      const generalStoreItem = await GeneralStoreItem.findByPk(transfer.item_id, {
        include: ['category'],
      });

      if (!generalStoreItem) {
        throw new BadException('ITEM_NOT_FOUND', 404, 'Item not found');
      }

      // Check if dispensary accepts this item type
      const itemType = this.determineItemType(generalStoreItem);
      if (!dispensary.canReceiveItemType(itemType)) {
        throw new BadException(
          'ITEM_TYPE_NOT_ACCEPTED',
          400,
          `Dispensary does not accept ${itemType} items`
        );
      }

      // 4. Update source inventory
      await this.updateSourceInventory(
        transfer.from_store_type,
        transfer.from_store_id,
        transfer.item_id,
        -transfer.quantity,
        transaction
      );

      // 5. Update/create dispensary item
      const dispensaryItem = await this.updateDispensaryInventory(
        transfer.to_dispensary_id,
        transfer.item_id,
        transfer.quantity,
        transfer.unit_cost || sourceItem.unit_cost,
        transfer.batch_number || sourceItem.batch_number,
        transfer.expiration_date || sourceItem.expiration_date,
        transaction
      );

      // 6. Record movement
      await this.recordStockMovement({
        item_id: transfer.item_id,
        movement_type: MovementType.TRANSFER,
        quantity: transfer.quantity,
        from_store_type: transfer.from_store_type,
        from_store_id: transfer.from_store_id,
        to_dispensary_id: transfer.to_dispensary_id,
        unit_cost: transfer.unit_cost || sourceItem.unit_cost,
        total_cost: transfer.quantity * (transfer.unit_cost || sourceItem.unit_cost),
        reason: transfer.reason,
        staff_id: transfer.staff_id,
        batch_number: transfer.batch_number || sourceItem.batch_number,
        transaction,
      });

      await transaction.commit();
      return dispensaryItem;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Dispense items from dispensary
   */
  static async dispenseFromDispensary(
    dispense: DispenseParams
  ): Promise<GeneralStoreDispensaryItem> {
    const transaction = await sequelizeConnection.transaction();

    try {
      // 1. Find dispensary item
      const dispensaryItem = await GeneralStoreDispensaryItem.findOne({
        where: {
          dispensary_id: dispense.dispensary_id,
          item_id: dispense.item_id,
          ...(dispense.batch_number && { batch_number: dispense.batch_number }),
        },
        include: [
          { model: GeneralStoreItem, attributes: ['name', 'item_code'] },
          { model: GeneralStoreDispensary, attributes: ['name'] },
        ],
      });

      if (!dispensaryItem) {
        throw new BadException('DISPENSARY_ITEM_NOT_FOUND', 404, 'Item not found in dispensary');
      }

      // 2. Validate dispense operation
      const validation = dispensaryItem.validateQuantityOperation('dispense', dispense.quantity);
      if (!validation.valid) {
        throw new BadException('INVALID_DISPENSE', 400, validation.message);
      }

      // 3. Perform dispense
      const success = dispensaryItem.dispense(dispense.quantity);
      if (!success) {
        throw new BadException('DISPENSE_FAILED', 400, 'Failed to dispense item');
      }

      // 4. Save dispensary item changes
      await dispensaryItem.save({ transaction });

      // 5. Record movement
      await this.recordStockMovement({
        item_id: dispense.item_id,
        movement_type: MovementType.OUT,
        quantity: dispense.quantity,
        from_dispensary_id: dispense.dispensary_id,
        unit_cost: dispensaryItem.unit_cost,
        total_cost: dispense.quantity * parseFloat(dispensaryItem.unit_cost.toString()),
        reason: dispense.reason,
        staff_id: dispense.staff_id,
        patient_id: dispense.patient_id,
        visit_id: dispense.visit_id,
        batch_number: dispensaryItem.batch_number,
        transaction,
      });

      await transaction.commit();
      return dispensaryItem;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get source item information based on store type
   */
  private static async getSourceItem(
    storeType: string,
    storeId: number,
    itemId: number
  ): Promise<SourceItemInfo> {
    switch (storeType) {
      case 'pharmacy':
        const pharmacyItem = await PharmacyStore.findOne({
          where: { drug_id: itemId, quantity_remaining: { [Op.gt]: 0 } },
          order: [['expiration', 'ASC']], // FIFO
        });
        if (!pharmacyItem) {
          throw new BadException('ITEM_NOT_FOUND', 404, 'Item not found in pharmacy store');
        }
        return {
          id: pharmacyItem.id,
          quantity_remaining: pharmacyItem.quantity_remaining,
          unit_cost: pharmacyItem.unit_price,
          batch_number: pharmacyItem.batch,
          expiration_date: pharmacyItem.expiration,
        };

      case 'general':
        const generalItem = await GeneralStoreItem.findByPk(itemId);
        if (!generalItem || generalItem.current_stock <= 0) {
          throw new BadException(
            'ITEM_NOT_FOUND',
            404,
            'Item not found or out of stock in general store'
          );
        }
        return {
          id: generalItem.id,
          quantity_remaining: generalItem.current_stock,
          unit_cost: generalItem.unit_cost,
          batch_number: null,
          expiration_date: generalItem.expiry_date,
        };

      case 'laboratory':
        const labItem = await LaboratoryStore.findByPk(itemId);
        if (!labItem || labItem.remain_quantity <= 0) {
          throw new BadException(
            'ITEM_NOT_FOUND',
            404,
            'Item not found or out of stock in laboratory store'
          );
        }
        return {
          id: labItem.id,
          quantity_remaining: labItem.remain_quantity,
          unit_cost: labItem.unit_price,
          batch_number: labItem.batch,
          expiration_date: labItem.expiration,
        };

      default:
        throw new BadException('INVALID_STORE_TYPE', 400, 'Invalid store type');
    }
  }

  /**
   * Update source inventory based on store type
   */
  private static async updateSourceInventory(
    storeType: string,
    storeId: number,
    itemId: number,
    quantityChange: number,
    transaction: Transaction
  ): Promise<void> {
    switch (storeType) {
      case 'pharmacy':
        const pharmacyItem = await PharmacyStore.findOne({
          where: { drug_id: itemId, quantity_remaining: { [Op.gt]: 0 } },
          order: [['expiration', 'ASC']],
        });
        if (pharmacyItem) {
          await pharmacyItem.update(
            {
              quantity_remaining: pharmacyItem.quantity_remaining + quantityChange,
            },
            { transaction }
          );
        }
        break;

      case 'general':
        const generalItem = await GeneralStoreItem.findByPk(itemId);
        if (generalItem) {
          await generalItem.update(
            {
              current_stock: generalItem.current_stock + quantityChange,
            },
            { transaction }
          );
        }
        break;

      case 'laboratory':
        const labItem = await LaboratoryStore.findByPk(itemId);
        if (labItem) {
          await labItem.update(
            {
              remain_quantity: labItem.remain_quantity + quantityChange,
            },
            { transaction }
          );
        }
        break;

      default:
        throw new BadException('INVALID_STORE_TYPE', 400, 'Invalid store type');
    }
  }

  /**
   * Update/create dispensary inventory
   */
  private static async updateDispensaryInventory(
    dispensaryId: number,
    itemId: number,
    quantity: number,
    unitCost: number,
    batchNumber?: string,
    expirationDate?: Date,
    transaction?: Transaction
  ): Promise<GeneralStoreDispensaryItem> {
    // Find existing dispensary item with same batch
    let dispensaryItem = await GeneralStoreDispensaryItem.findOne({
      where: {
        dispensary_id: dispensaryId,
        item_id: itemId,
        batch_number: batchNumber || null,
      },
    });

    if (dispensaryItem) {
      // Update existing item
      dispensaryItem.receive(quantity, unitCost);
      await dispensaryItem.save({ transaction });
    } else {
      // Create new dispensary item
      dispensaryItem = await GeneralStoreDispensaryItem.create(
        {
          dispensary_id: dispensaryId,
          item_id: itemId,
          quantity_received: quantity,
          quantity_remaining: quantity,
          unit_cost: unitCost,
          total_value: quantity * unitCost,
          batch_number: batchNumber,
          expiration_date: expirationDate,
          received_from_type: 'main_store',
          last_movement_date: new Date(),
        },
        { transaction }
      );
    }

    return dispensaryItem;
  }

  /**
   * Record stock movement
   */
  private static async recordStockMovement(params: {
    item_id: number;
    movement_type: MovementType;
    quantity: number;
    from_store_type?: string;
    from_store_id?: number;
    from_dispensary_id?: number;
    to_dispensary_id?: number;
    unit_cost: number;
    total_cost: number;
    reason: string;
    staff_id: number;
    patient_id?: number;
    visit_id?: number;
    batch_number?: string;
    transaction?: Transaction;
  }): Promise<GeneralStoreMovement> {
    return GeneralStoreMovement.create(
      {
        item_id: params.item_id,
        movement_type: params.movement_type,
        quantity: params.quantity,
        unit_cost: params.unit_cost,
        total_cost: params.total_cost,
        reason: params.reason,
        staff_id: params.staff_id,
        patient_id: params.patient_id,
        visit_id: params.visit_id,
        batch_number: params.batch_number,
        reference_type: params.from_store_type ? 'TRANSFER' : 'DISPENSING',
        reference_id: params.from_store_id || params.from_dispensary_id,
        notes: `${params.movement_type} - ${params.reason}`,
      },
      { transaction: params.transaction }
    );
  }

  /**
   * Determine item type for dispensary compatibility
   */
  private static determineItemType(item: GeneralStoreItem): string {
    if (!item.category) return 'general';

    const categoryName = item.category.name.toLowerCase();
    if (categoryName.includes('laboratory')) return 'laboratory';
    if (categoryName.includes('medical')) return 'medical_supplies';
    if (categoryName.includes('consumable')) return 'consumables';
    if (categoryName.includes('equipment')) return 'equipment';

    return 'general';
  }

  /**
   * Generate cross-store inventory report
   */
  static async generateCrossStoreReport(
    filters: CrossStoreReportFilters
  ): Promise<CrossStoreReport> {
    const report: CrossStoreReport = {
      summary: {
        total_stores: 0,
        total_dispensaries: 0,
        total_value: 0,
        total_movements: 0,
      },
      stores: [],
    };

    // Get all active dispensaries with their items
    const dispensaries = await GeneralStoreDispensary.findAll({
      where: {
        status: 'active',
        ...(filters.dispensary_ids && { id: { [Op.in]: filters.dispensary_ids } }),
      },
      include: [
        {
          model: GeneralStoreDispensaryItem,
          where: {
            status: 'active',
            ...(filters.item_ids && { item_id: { [Op.in]: filters.item_ids } }),
          },
          required: false,
          include: [
            {
              model: GeneralStoreItem,
              attributes: ['id', 'name', 'item_code'],
            },
          ],
        },
        {
          model: Department,
          attributes: ['id', 'name'],
        },
      ],
    });

    // Process dispensaries into report format
    const storeMap = new Map<string, any>();

    for (const dispensary of dispensaries) {
      const storeType = 'General Store';
      const totalValue = dispensary.getTotalValue();
      const totalItems = dispensary.getTotalItems();

      if (!storeMap.has(storeType)) {
        storeMap.set(storeType, {
          store_type: 'general',
          store_name: storeType,
          total_items: 0,
          total_value: 0,
          dispensaries: [],
        });
      }

      const store = storeMap.get(storeType);
      store.total_items += totalItems;
      store.total_value += totalValue;

      store.dispensaries.push({
        id: dispensary.id,
        name: dispensary.name,
        total_items: totalItems,
        total_value: totalValue,
        stock_status: dispensary.getStockStatus(),
      });
    }

    report.stores = Array.from(storeMap.values());
    report.summary.total_stores = report.stores.length;
    report.summary.total_dispensaries = dispensaries.length;
    report.summary.total_value = report.stores.reduce((sum, store) => sum + store.total_value, 0);

    // Include movements if requested
    if (filters.include_movements) {
      const movements = await GeneralStoreMovement.findAll({
        where: {
          createdAt: {
            [Op.between]: [filters.start_date, filters.end_date],
          },
          ...(filters.item_ids && { item_id: { [Op.in]: filters.item_ids } }),
        },
        include: [
          {
            model: GeneralStoreItem,
            attributes: ['name'],
          },
          {
            model: Staff,
            attributes: ['firstname', 'lastname'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 1000, // Limit for performance
      });

      report.movements = movements.map(movement => ({
        date: movement.createdAt,
        type: movement.movement_type,
        from_store: movement.reference_type || 'Unknown',
        to_store: 'Dispensary',
        item_name: movement.item?.name || 'Unknown',
        quantity: movement.quantity,
        staff_name: movement.staff
          ? `${movement.staff.firstname} ${movement.staff.lastname}`
          : 'Unknown',
      }));

      report.summary.total_movements = movements.length;
    }

    return report;
  }

  /**
   * Get dispensary stock summary
   */
  static async getDispensaryStockSummary(dispensaryId: number) {
    const dispensary = await GeneralStoreDispensary.findByPk(dispensaryId, {
      include: [
        {
          model: GeneralStoreDispensaryItem,
          where: { status: 'active' },
          required: false,
          include: [
            {
              model: GeneralStoreItem,
              attributes: ['id', 'name', 'item_code'],
            },
          ],
        },
      ],
    });

    if (!dispensary) {
      throw new BadException('DISPENSARY_NOT_FOUND', 404, 'Dispensary not found');
    }

    return {
      dispensary: {
        id: dispensary.id,
        name: dispensary.name,
        location: dispensary.location,
        status: dispensary.status,
      },
      summary: {
        total_items: dispensary.getTotalItems(),
        total_value: dispensary.getTotalValue(),
        low_stock_items: dispensary.getLowStockItems().length,
        expired_items: dispensary.getExpiredItems().length,
        expiring_soon_items: dispensary.getExpiringSoonItems().length,
        stock_status: dispensary.getStockStatus(),
      },
      items: dispensary.dispensaryItems.map(item => ({
        id: item.id,
        item_name: item.item.name,
        item_code: item.item.item_code,
        quantity_remaining: item.quantity_remaining,
        quantity_reserved: item.quantity_reserved,
        available_quantity: item.getAvailableQuantity(),
        unit_cost: item.unit_cost,
        total_value: item.total_value,
        batch_number: item.batch_number,
        expiration_date: item.expiration_date,
        stock_level: item.getStockLevel(),
        expiry_status: item.getExpiryStatus(),
      })),
    };
  }
}

// Import required dependencies at top of file - these should be moved up
