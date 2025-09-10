import { Op, WhereOptions, Includeable, Order, FindAttributeOptions } from 'sequelize';
import {
  GeneralStoreCategory,
  GeneralStoreSubcategory,
  GeneralStoreItem,
  GeneralStoreMovement,
  GeneralStoreRequest,
  GeneralStoreRequestItem,
  ItemStatus,
  MovementType,
  RequestStatus,
  Priority,
  ItemRequestStatus,
} from '../../database/models/generalStore';
import { Staff } from '../../database/models/staff';
import { Vendor } from '../../database/models/vendor';
import { Unit } from '../../database/models/unit';
import { BadException } from '../../common/util/api-error';
import sequelizeConnection from '../../database/config/config';

export class GeneralStoreRepository {
  // Category Management
  static async createCategory(categoryData: any, staffId: number): Promise<GeneralStoreCategory> {
    try {
      return await GeneralStoreCategory.create({
        ...categoryData,
        created_by: staffId,
        updated_by: staffId,
      });
    } catch (error) {
      throw new BadException('Error', 500, `Failed to create category: ${error.message}`);
    }
  }

  static async updateCategory(
    id: number,
    categoryData: any,
    staffId: number
  ): Promise<GeneralStoreCategory> {
    try {
      const category = await GeneralStoreCategory.findByPk(id);
      if (!category) {
        throw new BadException('Error', 404, 'Category not found');
      }

      await category.update({
        ...categoryData,
        updated_by: staffId,
      });

      return category;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to update category: ${error.message}`);
    }
  }

  static async deleteCategory(id: number): Promise<void> {
    try {
      const category = await GeneralStoreCategory.findByPk(id, {
        include: [
          { model: GeneralStoreCategory, as: 'children' },
          { model: GeneralStoreSubcategory, as: 'subcategories' },
        ],
      });

      if (!category) {
        throw new BadException('Error', 404, 'Category not found');
      }

      if (category.hasChildren() || category.hasSubcategories()) {
        throw new BadException(
          'Error',
          400,
          'Cannot delete category with children or subcategories'
        );
      }

      await category.destroy();
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to delete category: ${error.message}`);
    }
  }

  static async getCategories(filters: any = {}, pagination: any = {}): Promise<any> {
    try {
      const where: WhereOptions = {};

      if (filters.parent_id !== undefined) {
        where.parent_id = filters.parent_id;
      }

      if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
      }

      const options = {
        where,
        include: [
          { model: GeneralStoreCategory, as: 'parent' },
          { model: GeneralStoreCategory, as: 'children' },
          { model: GeneralStoreSubcategory, as: 'subcategories' },
        ],
        order: [['name', 'ASC']],
        ...pagination,
      };

      return await GeneralStoreCategory.findAndCountAll(options);
    } catch (error) {
      throw new BadException('Error', 500, `Failed to fetch categories: ${error.message}`);
    }
  }

  static async getCategoryById(id: number): Promise<GeneralStoreCategory> {
    try {
      const category = await GeneralStoreCategory.findByPk(id, {
        include: [
          { model: GeneralStoreCategory, as: 'parent' },
          { model: GeneralStoreCategory, as: 'children' },
          { model: GeneralStoreSubcategory, as: 'subcategories' },
        ],
      });

      if (!category) {
        throw new BadException('Error', 404, 'Category not found');
      }

      return category;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch category: ${error.message}`);
    }
  }

  // Subcategory Management
  static async createSubcategory(
    subcategoryData: any,
    staffId: number
  ): Promise<GeneralStoreSubcategory> {
    try {
      return await GeneralStoreSubcategory.create({
        ...subcategoryData,
        created_by: staffId,
        updated_by: staffId,
      });
    } catch (error) {
      throw new BadException('Error', 500, `Failed to create subcategory: ${error.message}`);
    }
  }

  static async updateSubcategory(
    id: number,
    subcategoryData: any,
    staffId: number
  ): Promise<GeneralStoreSubcategory> {
    try {
      const subcategory = await GeneralStoreSubcategory.findByPk(id);
      if (!subcategory) {
        throw new BadException('Error', 404, 'Subcategory not found');
      }

      await subcategory.update({
        ...subcategoryData,
        updated_by: staffId,
      });

      return subcategory;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to update subcategory: ${error.message}`);
    }
  }

  static async deleteSubcategory(id: number): Promise<void> {
    try {
      const subcategory = await GeneralStoreSubcategory.findByPk(id, {
        include: [{ model: GeneralStoreItem, as: 'items' }],
      });

      if (!subcategory) {
        throw new BadException('Error', 404, 'Subcategory not found');
      }

      if (subcategory.hasItems()) {
        throw new BadException('Error', 400, 'Cannot delete subcategory with items');
      }

      await subcategory.destroy();
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to delete subcategory: ${error.message}`);
    }
  }

  static async getSubcategories(filters: any = {}, pagination: any = {}): Promise<any> {
    try {
      const where: WhereOptions = {};

      if (filters.category_id) {
        where.category_id = filters.category_id;
      }

      if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
      }

      const options = {
        where,
        include: [{ model: GeneralStoreCategory, as: 'category' }],
        order: [['name', 'ASC']],
        ...pagination,
      };

      return await GeneralStoreSubcategory.findAndCountAll(options);
    } catch (error) {
      throw new BadException('Error', 500, `Failed to fetch subcategories: ${error.message}`);
    }
  }

  static async getSubcategoryById(id: number): Promise<GeneralStoreSubcategory> {
    try {
      const subcategory = await GeneralStoreSubcategory.findByPk(id, {
        include: [
          { model: GeneralStoreCategory, as: 'category' },
          { model: GeneralStoreItem, as: 'items' },
        ],
      });

      if (!subcategory) {
        throw new BadException('Error', 404, 'Subcategory not found');
      }

      return subcategory;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch subcategory: ${error.message}`);
    }
  }

  // Item Management
  static async createItem(itemData: any, staffId: number): Promise<GeneralStoreItem> {
    try {
      // Check if item code already exists
      const existingItem = await GeneralStoreItem.findOne({
        where: { item_code: itemData.item_code },
      });

      if (existingItem) {
        throw new BadException('Error', 400, 'Item code already exists');
      }

      // Generate item code if not provided
      if (!itemData.item_code) {
        itemData.item_code = await this.generateItemCode(itemData.category_id);
      }

      const item = await GeneralStoreItem.create({
        ...itemData,
        created_by: staffId,
        updated_by: staffId,
      });

      // Update total value
      item.updateTotalValue();
      await item.save();

      return item;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to create item: ${error.message}`);
    }
  }

  static async updateItem(id: number, itemData: any, staffId: number): Promise<GeneralStoreItem> {
    try {
      const item = await GeneralStoreItem.findByPk(id);
      if (!item) {
        throw new BadException('Error', 404, 'Item not found');
      }

      // Check if item code is being changed and if it already exists
      if (itemData.item_code && itemData.item_code !== item.item_code) {
        const existingItem = await GeneralStoreItem.findOne({
          where: { item_code: itemData.item_code },
        });

        if (existingItem) {
          throw new BadException('Error', 400, 'Item code already exists');
        }
      }

      await item.update({
        ...itemData,
        updated_by: staffId,
      });

      // Update total value if stock or cost changed
      if (itemData.current_stock !== undefined || itemData.unit_cost !== undefined) {
        item.updateTotalValue();
        await item.save();
      }

      return item;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to update item: ${error.message}`);
    }
  }

  static async deleteItem(id: number): Promise<void> {
    try {
      const item = await GeneralStoreItem.findByPk(id, {
        include: [
          { model: GeneralStoreMovement, as: 'movements' },
          { model: GeneralStoreRequestItem, as: 'requestItems' },
        ],
      });

      if (!item) {
        throw new BadException('Error', 404, 'Item not found');
      }

      if (item.movements && item.movements.length > 0) {
        throw new BadException('Error', 400, 'Cannot delete item with movement history');
      }

      if (item.requestItems && item.requestItems.length > 0) {
        throw new BadException('Error', 400, 'Cannot delete item with request history');
      }

      await item.destroy();
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to delete item: ${error.message}`);
    }
  }

  static async getItems(filters: any = {}, pagination: any = {}): Promise<any> {
    try {
      const where: WhereOptions = {};

      if (filters.category_id) {
        where.category_id = filters.category_id;
      }

      if (filters.subcategory_id) {
        where.subcategory_id = filters.subcategory_id;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.supplier_id) {
        where.supplier_id = filters.supplier_id;
      }

      const options = {
        where,
        include: [
          { model: GeneralStoreCategory, as: 'category' },
          { model: GeneralStoreSubcategory, as: 'subcategory' },
          { model: Unit, as: 'unit' },
          { model: Vendor, as: 'supplier' },
        ],
        order: [['name', 'ASC']],
        ...pagination,
      };

      return await GeneralStoreItem.findAndCountAll(options);
    } catch (error) {
      throw new BadException('Error', 500, `Failed to fetch items: ${error.message}`);
    }
  }

  static async getItemById(id: number): Promise<GeneralStoreItem> {
    try {
      const item = await GeneralStoreItem.findByPk(id, {
        include: [
          { model: GeneralStoreCategory, as: 'category' },
          { model: GeneralStoreSubcategory, as: 'subcategory' },
          { model: Unit, as: 'unit' },
          { model: Vendor, as: 'supplier' },
          { model: GeneralStoreMovement, as: 'movements' },
          { model: GeneralStoreRequestItem, as: 'requestItems' },
        ],
      });

      if (!item) {
        throw new BadException('Error', 404, 'Item not found');
      }

      return item;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch item: ${error.message}`);
    }
  }

  static async searchItems(
    searchTerm: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<any> {
    try {
      const where: any = {
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { item_code: { [Op.like]: `%${searchTerm}%` } },
          { description: { [Op.like]: `%${searchTerm}%` } },
          { manufacturer: { [Op.like]: `%${searchTerm}%` } },
          { model_number: { [Op.like]: `%${searchTerm}%` } },
        ],
      };

      // Apply additional filters
      if (filters.category_id) {
        where.category_id = filters.category_id;
      }

      if (filters.subcategory_id) {
        where.subcategory_id = filters.subcategory_id;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      const options = {
        where,
        include: [
          { model: GeneralStoreCategory, as: 'category' },
          { model: GeneralStoreSubcategory, as: 'subcategory' },
          { model: Unit, as: 'unit' },
        ],
        order: [['name', 'ASC']],
        ...pagination,
      };

      return await GeneralStoreItem.findAndCountAll(options);
    } catch (error) {
      throw new BadException('Error', 500, `Failed to search items: ${error.message}`);
    }
  }

  static async getLowStockItems(): Promise<GeneralStoreItem[]> {
    try {
      // For MySQL, we'll use a raw query approach or fetch all and filter
      const items = await GeneralStoreItem.findAll({
        where: {
          status: ItemStatus.ACTIVE,
        },
        include: [
          { model: GeneralStoreCategory, as: 'category' },
          { model: GeneralStoreSubcategory, as: 'subcategory' },
          { model: Unit, as: 'unit' },
        ],
        order: [
          ['current_stock', 'ASC'],
          ['name', 'ASC'],
        ],
      });

      // Filter items where current_stock <= minimum_stock
      return items.filter(item => item.current_stock <= item.minimum_stock);
    } catch (error) {
      throw new BadException('Error', 500, `Failed to fetch low stock items: ${error.message}`);
    }
  }

  static async getExpiringItems(days = 30): Promise<GeneralStoreItem[]> {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      return await GeneralStoreItem.findAll({
        where: {
          status: ItemStatus.ACTIVE,
          is_expirable: true,
          expiry_date: {
            [Op.between]: [new Date(), expiryDate],
          },
        },
        include: [
          { model: GeneralStoreCategory, as: 'category' },
          { model: GeneralStoreSubcategory, as: 'subcategory' },
          { model: Unit, as: 'unit' },
        ],
        order: [
          ['expiry_date', 'ASC'],
          ['name', 'ASC'],
        ],
      });
    } catch (error) {
      throw new BadException('Error', 500, `Failed to fetch expiring items: ${error.message}`);
    }
  }

  // Movement Management
  static async createMovement(movementData: any, staffId: number): Promise<GeneralStoreMovement> {
    try {
      const movement = await GeneralStoreMovement.create({
        ...movementData,
        staff_id: staffId,
        movement_date: new Date(),
      });

      // Update item stock levels
      await this.updateItemStockLevels(
        movementData.item_id,
        movementData.movement_type,
        movementData.quantity
      );

      return movement;
    } catch (error) {
      throw new BadException('Error', 500, `Failed to create movement: ${error.message}`);
    }
  }

  static async getMovements(filters: any = {}, pagination: any = {}): Promise<any> {
    try {
      const where: WhereOptions = {};

      if (filters.item_id) {
        where.item_id = filters.item_id;
      }

      if (filters.movement_type) {
        where.movement_type = filters.movement_type;
      }

      if (filters.staff_id) {
        where.staff_id = filters.staff_id;
      }

      if (filters.start_date && filters.end_date) {
        where.movement_date = {
          [Op.between]: [filters.start_date, filters.end_date],
        };
      }

      const options = {
        where,
        include: [
          { model: GeneralStoreItem, as: 'item' },
          { model: Staff, as: 'staff' },
        ],
        order: [['movement_date', 'DESC']],
        ...pagination,
      };

      return await GeneralStoreMovement.findAndCountAll(options);
    } catch (error) {
      throw new BadException('Error', 500, `Failed to fetch movements: ${error.message}`);
    }
  }

  static async getItemMovements(
    itemId: number,
    filters: any = {}
  ): Promise<GeneralStoreMovement[]> {
    try {
      const where: WhereOptions = { item_id: itemId };

      if (filters.start_date && filters.end_date) {
        where.movement_date = {
          [Op.between]: [filters.start_date, filters.end_date],
        };
      }

      return await GeneralStoreMovement.findAll({
        where,
        include: [{ model: Staff, as: 'staff' }],
        order: [['movement_date', 'DESC']],
      });
    } catch (error) {
      throw new BadException('Error', 500, `Failed to fetch item movements: ${error.message}`);
    }
  }

  // Request Management
  static async createRequest(requestData: any, staffId: number): Promise<GeneralStoreRequest> {
    try {
      // Generate request number
      const requestNumber = await this.generateRequestNumber();

      const request = await GeneralStoreRequest.create({
        ...requestData,
        request_number: requestNumber,
        requested_by: staffId,
        request_date: new Date(),
      });

      // Create request items
      for (const itemData of requestData.items) {
        const item = await GeneralStoreItem.findByPk(itemData.item_id);
        if (!item) {
          throw new BadException('Error', 400, `Item with ID ${itemData.item_id} not found`);
        }

        await GeneralStoreRequestItem.create({
          request_id: request.id,
          item_id: itemData.item_id,
          quantity_requested: itemData.quantity_requested,
          unit_cost: item.unit_cost,
          total_cost: itemData.quantity_requested * item.unit_cost,
          notes: itemData.notes,
          status: ItemRequestStatus.PENDING,
        });
      }

      // Calculate total cost
      await this.calculateRequestCost(request.id);

      return request;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to create request: ${error.message}`);
    }
  }

  static async updateRequest(
    id: number,
    requestData: any,
    staffId: number
  ): Promise<GeneralStoreRequest> {
    try {
      const request = await GeneralStoreRequest.findByPk(id);
      if (!request) {
        throw new BadException('Error', 404, 'Request not found');
      }

      await sequelizeConnection.transaction(async t => {
        // Update request metadata if provided
        const updateFields: any = {};
        if (requestData.requesting_department !== undefined) {
          updateFields.requesting_department = requestData.requesting_department;
        }
        if (requestData.priority !== undefined) {
          updateFields.priority = requestData.priority;
        }
        if (requestData.required_date !== undefined) {
          updateFields.required_date = new Date(requestData.required_date);
        }
        if (requestData.notes !== undefined) {
          updateFields.notes = requestData.notes;
        }
        if (Object.keys(updateFields).length > 0) {
          await GeneralStoreRequest.update(updateFields, { where: { id }, transaction: t });
        }

        // Replace items if provided
        if (Array.isArray(requestData.items)) {
          // Remove existing items
          await GeneralStoreRequestItem.destroy({ where: { request_id: id }, transaction: t });

          // Create new items
          for (const itemData of requestData.items) {
            const item = await GeneralStoreItem.findByPk(itemData.item_id);
            if (!item) {
              throw new BadException('Error', 400, `Item with ID ${itemData.item_id} not found`);
            }

            const quantity = Number(itemData.quantity_requested);
            if (!Number.isFinite(quantity) || quantity <= 0) {
              throw new BadException('Error', 400, `Invalid quantity for item ${itemData.item_id}`);
            }

            await GeneralStoreRequestItem.create(
              {
                request_id: id,
                item_id: itemData.item_id,
                quantity_requested: quantity,
                unit_cost: item.unit_cost,
                total_cost: quantity * item.unit_cost,
                notes: itemData.notes,
                status: ItemRequestStatus.PENDING,
              },
              { transaction: t }
            );
          }
        }
      });

      // Recalculate total cost after transaction
      await this.calculateRequestCost(id);

      // Return updated request with relations
      return await this.getRequestById(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to update request: ${error.message}`);
    }
  }

  static async getRequests(filters: any = {}, pagination: any = {}): Promise<any> {
    try {
      const where: WhereOptions = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }

      if (filters.requesting_department) {
        where.requesting_department = filters.requesting_department;
      }

      if (filters.start_date && filters.end_date) {
        where.request_date = {
          [Op.between]: [filters.start_date, filters.end_date],
        };
      }

      const options = {
        where,
        include: [
          { model: Staff, as: 'requester' },
          { model: Staff, as: 'approver' },
          { model: GeneralStoreRequestItem, as: 'requestItems' },
        ],
        order: [['request_date', 'DESC']],
        ...pagination,
      };

      return await GeneralStoreRequest.findAndCountAll(options);
    } catch (error) {
      throw new BadException('Error', 500, `Failed to fetch requests: ${error.message}`);
    }
  }

  static async getRequestById(id: number): Promise<GeneralStoreRequest> {
    try {
      const request = await GeneralStoreRequest.findByPk(id, {
        include: [
          { model: Staff, as: 'requester' },
          { model: Staff, as: 'approver' },
          {
            model: GeneralStoreRequestItem,
            as: 'requestItems',
            include: [{ model: GeneralStoreItem, as: 'item' }],
          },
        ],
      });

      if (!request) {
        throw new BadException('Error', 404, 'Request not found');
      }

      return request;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch request: ${error.message}`);
    }
  }

  static async getMyRequests(staffId: number, pagination: any = {}): Promise<any> {
    try {
      const options = {
        where: { requested_by: staffId },
        include: [
          { model: Staff, as: 'requester' },
          { model: Staff, as: 'approver' },
          { model: GeneralStoreRequestItem, as: 'requestItems' },
        ],
        order: [['request_date', 'DESC']],
        ...pagination,
      };

      return await GeneralStoreRequest.findAndCountAll(options);
    } catch (error) {
      throw new BadException('Error', 500, `Failed to fetch my requests: ${error.message}`);
    }
  }

  static async getPendingApprovalRequests(pagination: any = {}): Promise<any> {
    try {
      const options = {
        where: { status: RequestStatus.PENDING },
        include: [
          { model: Staff, as: 'requester' },
          { model: GeneralStoreRequestItem, as: 'requestItems' },
        ],
        order: [
          ['priority', 'DESC'],
          ['request_date', 'ASC'],
        ],
        ...pagination,
      };

      return await GeneralStoreRequest.findAndCountAll(options);
    } catch (error) {
      throw new BadException(
        'Error',
        500,
        `Failed to fetch pending approval requests: ${error.message}`
      );
    }
  }

  // Utility Methods
  private static async generateItemCode(categoryId: number): Promise<string> {
    try {
      const category = await GeneralStoreCategory.findByPk(categoryId);
      if (!category) {
        throw new BadException('Error', 400, 'Category not found');
      }

      const prefix = category.name.substring(0, 2).toUpperCase();
      const count = await GeneralStoreItem.count({
        where: { category_id: categoryId },
      });

      return `${prefix}-${(count + 1).toString().padStart(4, '0')}`;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to generate item code: ${error.message}`);
    }
  }

  private static async generateRequestNumber(): Promise<string> {
    try {
      const year = new Date().getFullYear();
      const count = await GeneralStoreRequest.count({
        where: {
          request_date: {
            [Op.gte]: new Date(year, 0, 1),
            [Op.lt]: new Date(year + 1, 0, 1),
          },
        },
      });

      return `GSR-${year}-${(count + 1).toString().padStart(3, '0')}`;
    } catch (error) {
      throw new BadException('Error', 500, `Failed to generate request number: ${error.message}`);
    }
  }

  private static async updateItemStockLevels(
    itemId: number,
    movementType: MovementType,
    quantity: number
  ): Promise<void> {
    try {
      const item = await GeneralStoreItem.findByPk(itemId);
      if (!item) {
        throw new BadException('Error', 404, 'Item not found');
      }

      switch (movementType) {
        case MovementType.IN:
          item.current_stock += quantity;
          break;
        case MovementType.OUT:
          if (item.current_stock < quantity) {
            throw new BadException('Error', 400, 'Insufficient stock');
          }
          item.current_stock -= quantity;
          break;
        case MovementType.TRANSFER:
          // For transfers, we assume stock is moved between locations
          // No stock level change, just tracking the movement
          break;
        case MovementType.ADJUSTMENT:
          // For adjustments, we directly set the stock level
          item.current_stock = quantity;
          break;
      }

      item.updateTotalValue();
      await item.save();
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to update item stock levels: ${error.message}`);
    }
  }

  static async calculateRequestCost(requestId: number): Promise<void> {
    try {
      const requestItems = await GeneralStoreRequestItem.findAll({
        where: { request_id: requestId },
      });

      let totalCost = 0;
      for (const item of requestItems) {
        totalCost += item.total_cost;
      }

      await GeneralStoreRequest.update({ total_cost: totalCost }, { where: { id: requestId } });
    } catch (error) {
      throw new BadException('Error', 500, `Failed to calculate request cost: ${error.message}`);
    }
  }

  // Dashboard Statistics
  static async getItemsCount(): Promise<number> {
    try {
      return await GeneralStoreItem.count();
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get items count: ${error.message}`);
    }
  }

  static async getActiveItemsCount(): Promise<number> {
    try {
      return await GeneralStoreItem.count({
        where: { status: ItemStatus.ACTIVE },
      });
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get active items count: ${error.message}`);
    }
  }

  static async getLowStockItemsCount(): Promise<number> {
    try {
      const items = await GeneralStoreItem.findAll({
        where: { status: ItemStatus.ACTIVE },
      });
      return items.filter(item => item.current_stock <= item.minimum_stock).length;
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get low stock items count: ${error.message}`);
    }
  }

  static async getTotalValue(): Promise<number> {
    try {
      const result = await GeneralStoreItem.findAll({
        attributes: [
          [
            sequelizeConnection.fn('SUM', sequelizeConnection.col('current_stock * unit_cost')),
            'totalValue',
          ],
        ],
        where: { status: ItemStatus.ACTIVE },
      });
      return result[0]?.getDataValue('totalValue') || 0;
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get total value: ${error.message}`);
    }
  }

  static async getCategoriesCount(): Promise<number> {
    try {
      return await GeneralStoreCategory.count();
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get categories count: ${error.message}`);
    }
  }

  static async getSubcategoriesCount(): Promise<number> {
    try {
      return await GeneralStoreSubcategory.count();
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get subcategories count: ${error.message}`);
    }
  }

  static async getRequestsCount(): Promise<number> {
    try {
      return await GeneralStoreRequest.count();
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get requests count: ${error.message}`);
    }
  }

  static async getPendingRequestsCount(): Promise<number> {
    try {
      return await GeneralStoreRequest.count({
        where: { status: RequestStatus.PENDING },
      });
    } catch (error) {
      throw new BadException(
        'Error',
        500,
        `Failed to get pending requests count: ${error.message}`
      );
    }
  }

  static async getMovementsCount(): Promise<number> {
    try {
      return await GeneralStoreMovement.count();
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get movements count: ${error.message}`);
    }
  }

  static async getTodayMovementsCount(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return await GeneralStoreMovement.count({
        where: {
          movement_date: {
            [Op.between]: [today, tomorrow],
          },
        },
      });
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get today movements count: ${error.message}`);
    }
  }

  // Settings Management
  static async getSettings(): Promise<any> {
    try {
      // For now, return default settings since we don't have a settings table
      // In a real implementation, you would query a settings table
      return {
        low_stock_threshold: 10,
        expiry_warning_days: 30,
        auto_approve_requests: false,
        require_approval_above_amount: 1000,
        default_currency: 'NGN',
        enable_barcode_scanning: true,
        enable_notifications: true,
        backup_frequency: 'daily',
      };
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get settings: ${error.message}`);
    }
  }

  static async updateSettings(settingsData: any): Promise<any> {
    try {
      // For now, just return the updated settings
      // In a real implementation, you would update a settings table
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settingsData };

      // Here you would typically save to database
      // await SettingsModel.update(updatedSettings, { where: { id: 1 } });

      return updatedSettings;
    } catch (error) {
      throw new BadException('Error', 500, `Failed to update settings: ${error.message}`);
    }
  }
}
