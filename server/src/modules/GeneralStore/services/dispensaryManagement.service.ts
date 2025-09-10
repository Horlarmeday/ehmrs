import { Transaction } from 'sequelize';
import { BadException } from '../../../common/util/api-error';
import {
  GeneralStoreDispensary,
  GeneralStoreDispensaryItem,
  GeneralStoreItem,
  GeneralStoreCategory,
  GeneralStoreRequest,
  GeneralStoreRequestItem,
  GeneralStoreMovement,
} from '../../../database/models/generalStore';
import { Department } from '../../../database/models/department';
import { Staff } from '../../../database/models/staff';
import {
  AcceptedItemTypes,
  FundingSource,
  DispensaryStatus,
} from '../../../database/models/generalStore/generalStoreDispensary';
import {
  MovementType,
  RequestStatus,
  ItemRequestStatus,
} from '../../../database/models/generalStore/types';
import { Op } from 'sequelize';
import sequelizeConnection from '../../../database/config/config';

export interface CreateDispensaryDto {
  name: string;
  department_id?: number;
  location?: string;
  accepted_item_types: AcceptedItemTypes;
  funding_source: FundingSource;
  manager_staff_id?: number;
  minimum_stock_level?: number;
  maximum_stock_level?: number;
  auto_replenish?: boolean;
  notes?: string;
}

export interface UpdateDispensaryDto {
  name?: string;
  department_id?: number;
  location?: string;
  accepted_item_types?: AcceptedItemTypes;
  funding_source?: FundingSource;
  manager_staff_id?: number;
  minimum_stock_level?: number;
  maximum_stock_level?: number;
  auto_replenish?: boolean;
  status?: DispensaryStatus;
  notes?: string;
}

export interface DispensaryRequestDto {
  dispensary_id: number;
  requesting_staff_id: number;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  reason?: string;
  items: Array<{
    item_id: number;
    quantity_requested: number;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    notes?: string;
  }>;
}

export interface DispensaryStockSummary {
  dispensary: {
    id: number;
    name: string;
    location: string;
    status: string;
    accepted_item_types: string;
    manager_name?: string;
    department_name?: string;
  };
  summary: {
    total_items: number;
    total_value: number;
    low_stock_items: number;
    expired_items: number;
    expiring_soon_items: number;
    stock_status: string;
  };
  categories: Array<{
    category_name: string;
    total_items: number;
    total_value: number;
  }>;
}

export class DispensaryManagementService {
  /**
   * Create a new dispensary
   */
  static async createDispensary(
    data: CreateDispensaryDto,
    staffId: number
  ): Promise<GeneralStoreDispensary> {
    const transaction = await sequelizeConnection.transaction();

    try {
      // Validate department exists if provided
      if (data.department_id) {
        const department = await Department.findByPk(data.department_id);
        if (!department) {
          throw new BadException('DEPARTMENT_NOT_FOUND', 404, 'Department not found');
        }
      }

      // Validate manager staff exists if provided
      if (data.manager_staff_id) {
        const manager = await Staff.findByPk(data.manager_staff_id);
        if (!manager) {
          throw new BadException('MANAGER_NOT_FOUND', 404, 'Manager staff not found');
        }
      }

      // Create dispensary
      const dispensary = await GeneralStoreDispensary.create(
        {
          name: data.name,
          department_id: data.department_id,
          location: data.location,
          accepted_item_types: data.accepted_item_types,
          funding_source: data.funding_source,
          manager_staff_id: data.manager_staff_id,
          minimum_stock_level: data.minimum_stock_level || 10,
          maximum_stock_level: data.maximum_stock_level || 1000,
          auto_replenish: data.auto_replenish || false,
          status: DispensaryStatus.ACTIVE,
          notes: data.notes,
        },
        { transaction }
      );

      // Auto-stock with commonly used items for the department/type if applicable
      await this.autoStockDispensary(
        dispensary.id,
        data.department_id,
        data.accepted_item_types,
        transaction
      );

      await transaction.commit();
      return dispensary;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof BadException) throw error;
      throw new BadException(
        'CREATE_DISPENSARY_FAILED',
        500,
        `Failed to create dispensary: ${error.message}`
      );
    }
  }

  /**
   * Update dispensary
   */
  static async updateDispensary(
    dispensaryId: number,
    data: UpdateDispensaryDto,
    staffId: number
  ): Promise<GeneralStoreDispensary> {
    try {
      const dispensary = await GeneralStoreDispensary.findByPk(dispensaryId);
      if (!dispensary) {
        throw new BadException('DISPENSARY_NOT_FOUND', 404, 'Dispensary not found');
      }

      // Validate department if being updated
      if (data.department_id) {
        const department = await Department.findByPk(data.department_id);
        if (!department) {
          throw new BadException('DEPARTMENT_NOT_FOUND', 404, 'Department not found');
        }
      }

      // Validate manager if being updated
      if (data.manager_staff_id) {
        const manager = await Staff.findByPk(data.manager_staff_id);
        if (!manager) {
          throw new BadException('MANAGER_NOT_FOUND', 404, 'Manager staff not found');
        }
      }

      await dispensary.update(data);
      return dispensary;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException(
        'UPDATE_DISPENSARY_FAILED',
        500,
        `Failed to update dispensary: ${error.message}`
      );
    }
  }

  /**
   * Get dispensary by ID with full details
   */
  static async getDispensaryById(dispensaryId: number): Promise<GeneralStoreDispensary> {
    const dispensary = await GeneralStoreDispensary.findByPk(dispensaryId, {
      include: [
        {
          model: Department,
          attributes: ['id', 'name'],
        },
        {
          model: Staff,
          as: 'manager',
          attributes: ['id', 'firstname', 'lastname', 'email'],
        },
        {
          model: GeneralStoreDispensaryItem,
          where: { status: 'active' },
          required: false,
          include: [
            {
              model: GeneralStoreItem,
              attributes: ['id', 'name', 'item_code', 'unit_id'],
              include: [
                'unit',
                {
                  model: GeneralStoreCategory,
                  attributes: ['id', 'name'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!dispensary) {
      throw new BadException('DISPENSARY_NOT_FOUND', 404, 'Dispensary not found');
    }

    return dispensary;
  }

  /**
   * Get all dispensaries with filters
   */
  static async getAllDispensaries(
    filters: {
      department_id?: number;
      accepted_item_types?: string;
      status?: string;
      manager_staff_id?: number;
      include_inactive?: boolean;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const whereClause: any = {};

    if (filters.department_id) {
      whereClause.department_id = filters.department_id;
    }

    if (filters.accepted_item_types) {
      whereClause.accepted_item_types = filters.accepted_item_types;
    }

    if (filters.manager_staff_id) {
      whereClause.manager_staff_id = filters.manager_staff_id;
    }

    if (!filters.include_inactive) {
      whereClause.status = DispensaryStatus.ACTIVE;
    } else if (filters.status) {
      whereClause.status = filters.status;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const result = await GeneralStoreDispensary.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Department,
          attributes: ['id', 'name'],
        },
        {
          model: Staff,
          as: 'manager',
          attributes: ['id', 'firstname', 'lastname'],
        },
      ],
      order: [['name', 'ASC']],
      limit,
      offset,
    });

    return {
      dispensaries: result.rows,
      pagination: {
        total: result.count,
        page,
        limit,
        totalPages: Math.ceil(result.count / limit),
      },
    };
  }

  /**
   * Create item request for dispensary
   */
  static async createDispensaryRequest(
    requestData: DispensaryRequestDto
  ): Promise<GeneralStoreRequest> {
    const transaction = await sequelizeConnection.transaction();

    try {
      // Validate dispensary exists
      const dispensary = await GeneralStoreDispensary.findOne({
        where: { id: requestData.dispensary_id, status: DispensaryStatus.ACTIVE },
      });

      if (!dispensary) {
        throw new BadException('DISPENSARY_NOT_FOUND', 404, 'Dispensary not found or inactive');
      }

      // Validate requesting staff
      const staff = await Staff.findByPk(requestData.requesting_staff_id);
      if (!staff) {
        throw new BadException('STAFF_NOT_FOUND', 404, 'Requesting staff not found');
      }

      // Validate all items exist and can be accepted by dispensary
      for (const requestItem of requestData.items) {
        const item = await GeneralStoreItem.findByPk(requestItem.item_id, {
          include: ['category'],
        });

        if (!item) {
          throw new BadException(
            'ITEM_NOT_FOUND',
            404,
            `Item with ID ${requestItem.item_id} not found`
          );
        }

        // Check if dispensary can accept this item type
        const itemType = this.determineItemType(item);
        if (!dispensary.canReceiveItemType(itemType)) {
          throw new BadException(
            'ITEM_TYPE_NOT_ACCEPTED',
            400,
            `Dispensary does not accept ${itemType} items (${item.name})`
          );
        }
      }

      // Generate request number
      const requestNumber = `REQ-${Date.now()}-${dispensary.id}`;

      // Create main request
      const request = await GeneralStoreRequest.create(
        {
          request_number: requestNumber,
          requesting_department: dispensary.name,
          requested_by: requestData.requesting_staff_id,
          priority: this.mapUrgencyToPriority(requestData.priority),
          status: RequestStatus.PENDING,
          required_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          notes: requestData.reason || 'Dispensary stock request',
        },
        { transaction }
      );

      // Create request items
      for (const requestItem of requestData.items) {
        await GeneralStoreRequestItem.create(
          {
            request_id: request.id,
            item_id: requestItem.item_id,
            quantity_requested: requestItem.quantity_requested,
            urgency_level: requestItem.urgency,
            status: ItemRequestStatus.PENDING,
            notes: requestItem.notes,
          },
          { transaction }
        );
      }

      await transaction.commit();
      return request;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof BadException) throw error;
      throw new BadException(
        'CREATE_REQUEST_FAILED',
        500,
        `Failed to create dispensary request: ${error.message}`
      );
    }
  }

  /**
   * Get dispensary stock summary
   */
  static async getDispensaryStockSummary(dispensaryId: number): Promise<DispensaryStockSummary> {
    const dispensary = await this.getDispensaryById(dispensaryId);

    // Calculate summary statistics
    const totalItems = dispensary.getTotalItems();
    const totalValue = dispensary.getTotalValue();
    const lowStockItems = dispensary.getLowStockItems();
    const expiredItems = dispensary.getExpiredItems();
    const expiringSoonItems = dispensary.getExpiringSoonItems();
    const stockStatus = dispensary.getStockStatus();

    // Group items by category
    const categoryMap = new Map<string, { total_items: number; total_value: number }>();

    if (dispensary.dispensaryItems) {
      for (const item of dispensary.dispensaryItems) {
        const categoryName = item.item?.category?.name || 'Uncategorized';
        const existing = categoryMap.get(categoryName) || { total_items: 0, total_value: 0 };

        existing.total_items += item.quantity_remaining;
        existing.total_value += parseFloat(item.total_value.toString());

        categoryMap.set(categoryName, existing);
      }
    }

    return {
      dispensary: {
        id: dispensary.id,
        name: dispensary.name,
        location: dispensary.location || '',
        status: dispensary.status,
        accepted_item_types: dispensary.accepted_item_types,
        manager_name: dispensary.manager
          ? `${dispensary.manager.firstname} ${dispensary.manager.lastname}`
          : undefined,
        department_name: dispensary.department?.name,
      },
      summary: {
        total_items: totalItems,
        total_value: totalValue,
        low_stock_items: lowStockItems.length,
        expired_items: expiredItems.length,
        expiring_soon_items: expiringSoonItems.length,
        stock_status: stockStatus,
      },
      categories: Array.from(categoryMap.entries()).map(([name, stats]) => ({
        category_name: name,
        total_items: stats.total_items,
        total_value: stats.total_value,
      })),
    };
  }

  /**
   * Auto-replenish dispensaries with low stock
   */
  static async autoReplenishDispensaries(): Promise<void> {
    try {
      // Find dispensaries that need replenishment
      const dispensariesNeedingReplenishment = await GeneralStoreDispensary.findAll({
        where: {
          auto_replenish: true,
          status: DispensaryStatus.ACTIVE,
        },
        include: [
          {
            model: GeneralStoreDispensaryItem,
            where: {
              status: 'active',
              quantity_remaining: {
                [Op.lte]: sequelizeConnection.col('GeneralStoreDispensary.minimum_stock_level'),
              },
            },
            required: true,
            include: [
              {
                model: GeneralStoreItem,
                attributes: ['id', 'name', 'current_stock'],
              },
            ],
          },
        ],
      });

      for (const dispensary of dispensariesNeedingReplenishment) {
        for (const dispensaryItem of dispensary.dispensaryItems) {
          // Calculate replenishment quantity (up to maximum stock level)
          const currentStock = dispensaryItem.quantity_remaining;
          const maxStock = dispensary.maximum_stock_level;
          const replenishQty = Math.min(
            maxStock - currentStock,
            dispensaryItem.item.current_stock // Don't exceed available stock
          );

          if (replenishQty > 0) {
            await this.createReplenishmentRequest(dispensary, dispensaryItem, replenishQty);
          }
        }
      }
    } catch (error) {
      console.error('Auto-replenishment failed:', error);
      // Don't throw error for background job
    }
  }

  /**
   * Create replenishment request
   */
  private static async createReplenishmentRequest(
    dispensary: GeneralStoreDispensary,
    dispensaryItem: GeneralStoreDispensaryItem,
    quantity: number
  ): Promise<void> {
    try {
      const systemUserId = 1; // System user for automated requests

      await this.createDispensaryRequest({
        dispensary_id: dispensary.id,
        requesting_staff_id: dispensary.manager_staff_id || systemUserId,
        priority: 'medium',
        reason: 'Automated replenishment for low stock item',
        items: [
          {
            item_id: dispensaryItem.item_id,
            quantity_requested: quantity,
            urgency: 'medium',
            notes: `Auto-replenishment: Current stock ${dispensaryItem.quantity_remaining}, Requesting ${quantity}`,
          },
        ],
      });
    } catch (error) {
      console.error(
        `Failed to create replenishment request for item ${dispensaryItem.item_id}:`,
        error
      );
    }
  }

  /**
   * Auto-stock new dispensary with commonly used items
   */
  private static async autoStockDispensary(
    dispensaryId: number,
    departmentId?: number,
    acceptedItemTypes?: AcceptedItemTypes,
    transaction?: Transaction
  ): Promise<void> {
    try {
      // Find commonly used items based on accepted types and department
      const whereClause: any = {
        status: 'ACTIVE',
        current_stock: { [Op.gt]: 0 },
      };

      // Filter by item type if specific type accepted
      if (acceptedItemTypes && acceptedItemTypes !== AcceptedItemTypes.ALL) {
        // This would need category filtering logic based on accepted types
        // For now, we'll keep it simple and stock general items
      }

      const commonItems = await GeneralStoreItem.findAll({
        where: whereClause,
        include: [
          {
            model: GeneralStoreCategory,
            attributes: ['name'],
          },
        ],
        order: [['current_stock', 'DESC']], // Prioritize high-stock items
        limit: 5, // Start with 5 common items
      });

      // For each common item, create a small initial stock in the dispensary
      for (const item of commonItems) {
        const initialStock = Math.min(10, Math.floor(item.current_stock * 0.1)); // 10% of current stock, max 10

        if (initialStock > 0) {
          await GeneralStoreDispensaryItem.create(
            {
              dispensary_id: dispensaryId,
              item_id: item.id,
              quantity_received: initialStock,
              quantity_remaining: initialStock,
              unit_cost: item.unit_cost,
              total_value: initialStock * parseFloat(item.unit_cost.toString()),
              received_from_type: 'main_store',
              status: 'active',
              last_movement_date: new Date(),
              notes: 'Initial auto-stocking',
            },
            { transaction }
          );

          // Update main store stock
          await item.update(
            {
              current_stock: item.current_stock - initialStock,
            },
            { transaction }
          );
        }
      }
    } catch (error) {
      console.error('Auto-stocking failed:', error);
      // Don't throw error as this is optional
    }
  }

  /**
   * Map urgency level to priority
   */
  private static mapUrgencyToPriority(urgency: string): string {
    const urgencyMap: { [key: string]: string } = {
      low: 'LOW',
      medium: 'MEDIUM',
      high: 'HIGH',
      emergency: 'URGENT',
    };
    return urgencyMap[urgency] || 'MEDIUM';
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
   * Get dispensary performance metrics
   */
  static async getDispensaryMetrics(dispensaryId: number, dateRange?: { start: Date; end: Date }) {
    const endDate = dateRange?.end || new Date();
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    // Get movements in date range
    const movements = await GeneralStoreMovement.findAll({
      where: {
        createdAt: { [Op.between]: [startDate, endDate] },
      },
      include: [
        {
          model: GeneralStoreItem,
          attributes: ['name'],
        },
      ],
    });

    // Calculate metrics
    const totalDispensed = movements
      .filter(m => m.movement_type === MovementType.OUT)
      .reduce((sum, m) => sum + m.quantity, 0);

    const totalReceived = movements
      .filter(m => m.movement_type === MovementType.IN)
      .reduce((sum, m) => sum + m.quantity, 0);

    const totalValue = movements.reduce(
      (sum, m) => sum + parseFloat(m.total_cost?.toString() || '0'),
      0
    );

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      metrics: {
        total_dispensed: totalDispensed,
        total_received: totalReceived,
        total_movements: movements.length,
        total_value: totalValue,
        average_daily_dispensing: totalDispensed / 30,
        turnover_rate: totalReceived > 0 ? totalDispensed / totalReceived : 0,
      },
      top_dispensed_items: this.getTopDispensedItems(movements),
    };
  }

  /**
   * Get top dispensed items from movements
   */
  private static getTopDispensedItems(movements: GeneralStoreMovement[]) {
    const itemMap = new Map();

    movements
      .filter(m => m.movement_type === MovementType.OUT)
      .forEach(movement => {
        const itemName = movement.item?.name || 'Unknown';
        const existing = itemMap.get(itemName) || { quantity: 0, value: 0 };
        existing.quantity += movement.quantity;
        existing.value += parseFloat(movement.total_cost?.toString() || '0');
        itemMap.set(itemName, existing);
      });

    return Array.from(itemMap.entries())
      .map(([name, stats]) => ({ item_name: name, ...stats }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Top 10
  }
}
