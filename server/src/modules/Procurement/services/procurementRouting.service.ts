import { Transaction } from 'sequelize';
import sequelizeConnection from '../../../database/config/config';
import { BadException } from '../../../common/util/api-error';
import {
  PharmacyStore,
  LaboratoryStore,
  Drug,
  GeneralStoreItem,
  GeneralStoreCategory,
  GeneralStoreDispensary,
  GeneralStoreDispensaryItem,
  Unit,
} from '../../../database/models';
import { FundingSource } from '../../../database/models/generalStore/generalStoreDispensary';
import { UniversalInventoryService } from '../../../core/services/universalInventory.service';
import { Op } from 'sequelize';

export interface ReceivedItemData {
  item_id: number;
  item_type: 'drug' | 'general_store_item' | 'laboratory_item';
  quantity_received: number;
  unit_cost: number;
  batch_number?: string;
  expiration_date?: Date;
  destination_override?: {
    store_type: 'pharmacy' | 'general' | 'laboratory';
    dispensary_id?: number;
  };
}

export interface RoutingDecision {
  store_type: 'pharmacy' | 'general' | 'laboratory';
  category?: string;
  auto_distribute_to_dispensaries?: boolean;
  target_dispensaries?: number[];
  distribution_strategy?: 'even' | 'usage_based' | 'priority';
}

export interface DistributionPlan {
  dispensary_id: number;
  quantity: number;
  priority: number;
  reason: string;
}

export class ProcurementRoutingService {
  /**
   * Route received items to appropriate stores and dispensaries
   */
  static async routeReceivedItems(
    procurementOrderId: number,
    receivedItems: ReceivedItemData[],
    staffId: number
  ): Promise<void> {
    const transaction = await sequelizeConnection.transaction();

    try {
      for (const receivedItem of receivedItems) {
        // Determine destination if not overridden
        const routingDecision = receivedItem.destination_override
          ? {
              store_type: receivedItem.destination_override.store_type,
              auto_distribute_to_dispensaries: false,
              category: 'general',
            }
          : await this.determineDestination(receivedItem.item_id, receivedItem.item_type);

        // Route to appropriate store
        await this.routeToStore(receivedItem, routingDecision, staffId, transaction);

        // Auto-distribute to dispensaries if configured
        if (routingDecision.auto_distribute_to_dispensaries) {
          await this.autoDistributeToDispensaries(
            receivedItem,
            routingDecision.category || 'general',
            staffId,
            transaction
          );
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Determine the best destination for an item
   */
  private static async determineDestination(
    itemId: number,
    itemType: string
  ): Promise<RoutingDecision> {
    switch (itemType) {
      case 'drug':
        return {
          store_type: 'pharmacy',
          auto_distribute_to_dispensaries: true,
          distribution_strategy: 'usage_based',
        };

      case 'laboratory_item':
        // DEPRECATED: Laboratory items now route through General Store
        // All laboratory items are treated as general store items with laboratory category
        return {
          store_type: 'general',
          category: 'laboratory',
          auto_distribute_to_dispensaries: true,
          distribution_strategy: 'even',
        };

      case 'general_store_item':
        const itemCategory = await this.getItemCategory(itemId);
        return {
          store_type: 'general',
          category: itemCategory,
          auto_distribute_to_dispensaries: this.shouldAutoDistribute(itemCategory),
          distribution_strategy: 'usage_based',
        };

      default:
        throw new BadException('INVALID_ITEM_TYPE', 400, `Unknown item type: ${itemType}`);
    }
  }

  /**
   * Route item to appropriate store
   */
  private static async routeToStore(
    receivedItem: ReceivedItemData,
    destination: any,
    staffId: number,
    transaction: Transaction
  ): Promise<void> {
    switch (destination.store_type) {
      case 'pharmacy':
        await this.routeToPharmacyStore(receivedItem, staffId, transaction);
        break;

      case 'general':
        await this.routeToGeneralStore(receivedItem, destination, staffId, transaction);
        break;

      case 'laboratory':
        // DEPRECATED: Laboratory routing - now handled through General Store
        await this.routeToGeneralStore(
          receivedItem,
          {
            ...destination,
            category: 'laboratory',
          },
          staffId,
          transaction
        );
        break;

      default:
        throw new BadException(
          'INVALID_STORE_TYPE',
          400,
          `Invalid store type: ${destination.store_type}`
        );
    }
  }

  /**
   * Route item to PharmacyStore
   */
  private static async routeToPharmacyStore(
    receivedItem: ReceivedItemData,
    staffId: number,
    transaction: Transaction
  ): Promise<void> {
    // Get drug information
    const drug = await Drug.findByPk(receivedItem.item_id, { transaction });
    if (!drug) {
      throw new BadException('DRUG_NOT_FOUND', 404, 'Drug not found');
    }

    // Get a default unit_id if not provided
    let unitId = 1; // Default unit ID
    try {
      const defaultUnit = await Unit.findOne({
        order: [['id', 'ASC']],
        transaction,
      });
      if (defaultUnit) {
        unitId = defaultUnit.id;
      }
    } catch (error) {
      console.warn('Could not find default unit, using ID 1');
    }

    // Create pharmacy store entry
    await PharmacyStore.create(
      {
        drug_id: receivedItem.item_id,
        quantity_received: receivedItem.quantity_received,
        quantity_remaining: receivedItem.quantity_received,
        unit_price: receivedItem.unit_cost,
        selling_price: receivedItem.unit_cost * 1.2, // 20% markup
        total_price: receivedItem.quantity_received * receivedItem.unit_cost,
        batch: receivedItem.batch_number,
        expiration: receivedItem.expiration_date,
        staff_id: staffId,
        date_received: new Date(),
        drug_form: drug.type,
        unit_id: unitId,
      },
      { transaction }
    );
  }

  /**
   * Route item to GeneralStore
   */
  private static async routeToGeneralStore(
    receivedItem: ReceivedItemData,
    destination: any,
    staffId: number,
    transaction: Transaction
  ): Promise<void> {
    // Update GeneralStore item stock
    const storeItem = await GeneralStoreItem.findByPk(receivedItem.item_id, { transaction });
    if (!storeItem) {
      throw new BadException('ITEM_NOT_FOUND', 404, 'General store item not found');
    }

    // Calculate new average cost if different
    const currentValue = storeItem.current_stock * parseFloat(storeItem.unit_cost.toString());
    const newValue = receivedItem.quantity_received * receivedItem.unit_cost;
    const newTotalQuantity = storeItem.current_stock + receivedItem.quantity_received;

    const newAverageCost =
      newTotalQuantity > 0 ? (currentValue + newValue) / newTotalQuantity : receivedItem.unit_cost;

    await storeItem.update(
      {
        current_stock: newTotalQuantity,
        unit_cost: newAverageCost,
        total_value: newTotalQuantity * newAverageCost,
        last_received_date: new Date(),
      },
      { transaction }
    );

    // Record movement
    const { GeneralStoreMovement } = require('../../../database/models/generalStore');
    await GeneralStoreMovement.create(
      {
        item_id: receivedItem.item_id,
        movement_type: 'IN',
        quantity: receivedItem.quantity_received,
        unit_cost: receivedItem.unit_cost,
        total_cost: receivedItem.quantity_received * receivedItem.unit_cost,
        reason: 'Received from procurement',
        staff_id: staffId,
        reference_type: 'PROCUREMENT',
        batch_number: receivedItem.batch_number,
        notes: `Received from procurement order`,
      },
      { transaction }
    );
  }

  /**
   * Auto-distribute items to relevant dispensaries
   */
  private static async autoDistributeToDispensaries(
    receivedItem: ReceivedItemData,
    category: string,
    staffId: number,
    transaction: Transaction
  ): Promise<void> {
    // Find relevant dispensaries
    const relevantDispensaries = await GeneralStoreDispensary.findAll({
      where: {
        [Op.or]: [{ accepted_item_types: category }, { accepted_item_types: 'all' }],
        status: 'active',
        auto_replenish: true, // Only auto-distribute to dispensaries that want auto-replenishment
      },
      include: [
        {
          model: GeneralStoreDispensaryItem,
          where: { item_id: receivedItem.item_id },
          required: false, // Left join to get dispensaries even if they don't have the item yet
        },
      ],
      transaction,
    });

    if (relevantDispensaries.length === 0) {
      return; // No relevant dispensaries found
    }

    // Calculate distribution plan
    const distributionPlan = await this.calculateDistributionPlan(
      receivedItem,
      relevantDispensaries,
      category
    );

    // Execute distribution
    for (const distribution of distributionPlan) {
      if (distribution.quantity > 0) {
        await UniversalInventoryService.transferToDispensary({
          from_store_type: 'general',
          from_store_id: 1, // Main GeneralStore ID
          to_dispensary_id: distribution.dispensary_id,
          item_id: receivedItem.item_id,
          quantity: distribution.quantity,
          reason: distribution.reason,
          staff_id: staffId,
          unit_cost: receivedItem.unit_cost,
          batch_number: receivedItem.batch_number,
          expiration_date: receivedItem.expiration_date,
        });
      }
    }
  }

  /**
   * Calculate distribution plan based on usage patterns and priorities
   */
  private static async calculateDistributionPlan(
    receivedItem: ReceivedItemData,
    dispensaries: GeneralStoreDispensary[],
    category: string
  ): Promise<DistributionPlan[]> {
    const totalToDistribute = Math.min(
      Math.floor(receivedItem.quantity_received * 0.3), // Distribute max 30% initially
      50 // Cap at 50 units per distribution
    );

    if (totalToDistribute <= 0) {
      return [];
    }

    const plan: DistributionPlan[] = [];

    // Get usage history for better distribution
    const usageHistory = await this.getUsageHistory(receivedItem.item_id, dispensaries);

    // Calculate distribution based on strategy
    const totalUsage = usageHistory.reduce((sum, usage) => sum + usage.usage, 0);

    if (totalUsage === 0) {
      // No usage history - distribute evenly
      const quantityPerDispensary = Math.floor(totalToDistribute / dispensaries.length);
      const remainder = totalToDistribute % dispensaries.length;

      dispensaries.forEach((dispensary, index) => {
        const quantity = quantityPerDispensary + (index < remainder ? 1 : 0);
        if (quantity > 0) {
          plan.push({
            dispensary_id: dispensary.id,
            quantity,
            priority: 1,
            reason: 'Even distribution (no usage history)',
          });
        }
      });
    } else {
      // Usage-based distribution
      dispensaries.forEach(dispensary => {
        const usage = usageHistory.find(u => u.dispensary_id === dispensary.id);
        const usagePercentage = usage ? usage.usage / totalUsage : 0;
        const quantity = Math.floor(totalToDistribute * usagePercentage);

        if (quantity > 0) {
          plan.push({
            dispensary_id: dispensary.id,
            quantity,
            priority: usage?.priority || 1,
            reason: `Usage-based distribution (${Math.round(usagePercentage * 100)}% of usage)`,
          });
        }
      });
    }

    // Ensure we don't exceed the total
    const distributedTotal = plan.reduce((sum, p) => sum + p.quantity, 0);
    if (distributedTotal > totalToDistribute) {
      // Reduce proportionally
      const scaleFactor = totalToDistribute / distributedTotal;
      plan.forEach(p => {
        p.quantity = Math.floor(p.quantity * scaleFactor);
      });
    }

    return plan.filter(p => p.quantity > 0);
  }

  /**
   * Get usage history for an item across dispensaries
   */
  private static async getUsageHistory(
    itemId: number,
    dispensaries: GeneralStoreDispensary[]
  ): Promise<Array<{ dispensary_id: number; usage: number; priority: number }>> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { GeneralStoreMovement } = require('../../../database/models/generalStore');

    const movements = await GeneralStoreMovement.findAll({
      where: {
        item_id: itemId,
        movement_type: 'OUT',
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
      attributes: ['reference_id', 'quantity'],
      group: ['reference_id'],
      raw: true,
    });

    const usageMap = new Map<number, number>();
    movements.forEach((movement: any) => {
      if (movement.reference_id) {
        usageMap.set(
          movement.reference_id,
          (usageMap.get(movement.reference_id) || 0) + movement.quantity
        );
      }
    });

    return dispensaries.map(dispensary => ({
      dispensary_id: dispensary.id,
      usage: usageMap.get(dispensary.id) || 0,
      priority: this.calculateDispensaryPriority(dispensary),
    }));
  }

  /**
   * Calculate dispensary priority for distribution
   */
  private static calculateDispensaryPriority(dispensary: GeneralStoreDispensary): number {
    let priority = 1;

    // Higher priority for certain funding sources
    if (dispensary.funding_source === FundingSource.HOSPITAL) priority += 1;
    if (dispensary.funding_source === FundingSource.RESEARCH) priority += 2;

    // Higher priority for certain item types
    if (dispensary.accepted_item_types === 'medical_supplies') priority += 1;

    return priority;
  }

  /**
   * Get item category for routing decisions
   */
  private static async getItemCategory(itemId: number): Promise<string> {
    const item = await GeneralStoreItem.findByPk(itemId, {
      include: [
        {
          model: GeneralStoreCategory,
          attributes: ['name'],
        },
      ],
    });

    if (!item || !item.category) {
      return 'general';
    }

    const categoryName = item.category.name.toLowerCase();

    if (categoryName.includes('laboratory')) return 'laboratory';
    if (categoryName.includes('medical')) return 'medical_supplies';
    if (categoryName.includes('surgical')) return 'medical_supplies';
    if (categoryName.includes('consumable')) return 'consumables';
    if (categoryName.includes('equipment')) return 'equipment';

    return 'general';
  }

  /**
   * Determine if items should be auto-distributed based on category
   */
  private static shouldAutoDistribute(category: string): boolean {
    const autoDistributeCategories = ['medical_supplies', 'laboratory', 'consumables'];

    return autoDistributeCategories.includes(category);
  }

  /**
   * Get recommended dispensaries for an item type
   */
  static async getRecommendedDispensaries(
    itemType: string,
    categoryName?: string
  ): Promise<GeneralStoreDispensary[]> {
    const whereClause: any = {
      status: 'active',
    };

    // Match dispensaries that accept this item type
    if (itemType !== 'all') {
      whereClause[Op.or] = [{ accepted_item_types: itemType }, { accepted_item_types: 'all' }];
    }

    return GeneralStoreDispensary.findAll({
      where: whereClause,
      include: [
        {
          model: require('../../../database/models/department').Department,
          attributes: ['name'],
        },
      ],
      order: [['name', 'ASC']],
    });
  }

  /**
   * Preview distribution plan without executing
   */
  static async previewDistribution(
    itemId: number,
    itemType: string,
    quantityReceived: number
  ): Promise<{
    routing_decision: RoutingDecision;
    distribution_plan: DistributionPlan[];
    recommended_dispensaries: any[];
  }> {
    const routingDecision = await this.determineDestination(itemId, itemType);

    if (!routingDecision.auto_distribute_to_dispensaries) {
      return {
        routing_decision: routingDecision,
        distribution_plan: [],
        recommended_dispensaries: [],
      };
    }

    const relevantDispensaries = await GeneralStoreDispensary.findAll({
      where: {
        [Op.or]: [
          { accepted_item_types: routingDecision.category || 'all' },
          { accepted_item_types: 'all' },
        ],
        status: 'active',
      },
    });

    const distributionPlan = await this.calculateDistributionPlan(
      { item_id: itemId, quantity_received: quantityReceived } as ReceivedItemData,
      relevantDispensaries,
      routingDecision.category || 'general'
    );

    return {
      routing_decision: routingDecision,
      distribution_plan: distributionPlan,
      recommended_dispensaries: relevantDispensaries.map(d => ({
        id: d.id,
        name: d.name,
        location: d.location,
        accepted_item_types: d.accepted_item_types,
      })),
    };
  }

  /**
   * Get routing statistics
   */
  static async getRoutingStatistics(dateRange?: { start: Date; end: Date }) {
    const endDate = dateRange?.end || new Date();
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // This would include statistics about routing decisions, distribution success rates, etc.
    // Implementation would depend on having movement tracking in place

    return {
      period: { start: startDate, end: endDate },
      total_items_routed: 0,
      routing_success_rate: 100,
      distribution_efficiency: 85,
      store_distribution: {
        pharmacy: 60,
        general: 35,
        laboratory: 5,
      },
    };
  }
}
