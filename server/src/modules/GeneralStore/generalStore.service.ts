import { GeneralStoreRepository } from './generalStore.repository';
import { BadException } from '../../common/util/api-error';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
  CreateItemDto,
  UpdateItemDto,
  CreateMovementDto,
  CreateRequestDto,
  ApprovedItem,
  IssuedItem,
  ValidationResult,
  DateRange,
  StockReportFilters,
  MovementReportFilters,
  CostReportFilters,
  UsageReport,
  StockReport,
  MovementReport,
  CostReport,
} from '../../database/models/generalStore/types';
import {
  ItemStatus,
  MovementType,
  RequestStatus,
  Priority,
  ItemRequestStatus,
} from '../../database/models/generalStore/types';

export class GeneralStoreService {
  // Category Management
  static async createCategory(categoryData: CreateCategoryDto, staffId: number) {
    try {
      // Check for duplicate category name
      const existingCategory = await GeneralStoreRepository.getCategoryByName(categoryData.name);
      if (existingCategory) {
        throw new BadException('Error', 400, 'Category name already exists');
      }

      // Validate parent category exists if provided
      if (categoryData.parent_id) {
        const parentCategory = await GeneralStoreRepository.getCategoryById(categoryData.parent_id);
        if (!parentCategory) {
          throw new BadException('Error', 400, 'Parent category not found');
        }
      }

      return await GeneralStoreRepository.createCategory(categoryData, staffId);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to create category: ${error.message}`);
    }
  }

  static async updateCategory(id: number, categoryData: UpdateCategoryDto, staffId: number) {
    try {
      // Validate parent category exists if being changed
      if (categoryData.parent_id) {
        const parentCategory = await GeneralStoreRepository.getCategoryById(categoryData.parent_id);
        if (!parentCategory) {
          throw new BadException('Error', 400, 'Parent category not found');
        }

        // Prevent circular references
        if (categoryData.parent_id === id) {
          throw new BadException('Error', 400, 'Category cannot be its own parent');
        }
      }

      return await GeneralStoreRepository.updateCategory(id, categoryData, staffId);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to update category: ${error.message}`);
    }
  }

  static async deleteCategory(id: number) {
    try {
      await GeneralStoreRepository.deleteCategory(id);
      return { message: 'Category deleted successfully' };
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to delete category: ${error.message}`);
    }
  }

  static async getCategories(filters: any = {}, pagination: any = {}) {
    try {
      return await GeneralStoreRepository.getCategories(filters, pagination);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch categories: ${error.message}`);
    }
  }

  static async getCategoryById(id: number) {
    try {
      return await GeneralStoreRepository.getCategoryById(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch category: ${error.message}`);
    }
  }

  // Subcategory Management
  static async createSubcategory(subcategoryData: CreateSubcategoryDto, staffId: number) {
    try {
      // Validate category exists
      const category = await GeneralStoreRepository.getCategoryById(subcategoryData.category_id);
      if (!category) {
        throw new BadException('Error', 400, 'Category not found');
      }

      return await GeneralStoreRepository.createSubcategory(subcategoryData, staffId);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to create subcategory: ${error.message}`);
    }
  }

  static async updateSubcategory(
    id: number,
    subcategoryData: UpdateSubcategoryDto,
    staffId: number
  ) {
    try {
      // Validate category exists if being changed
      if (subcategoryData.category_id) {
        const category = await GeneralStoreRepository.getCategoryById(subcategoryData.category_id);
        if (!category) {
          throw new BadException('Error', 400, 'Category not found');
        }
      }

      return await GeneralStoreRepository.updateSubcategory(id, subcategoryData, staffId);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to update subcategory: ${error.message}`);
    }
  }

  static async deleteSubcategory(id: number) {
    try {
      await GeneralStoreRepository.deleteSubcategory(id);
      return { message: 'Subcategory deleted successfully' };
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to delete subcategory: ${error.message}`);
    }
  }

  static async getSubcategories(filters: any = {}, pagination: any = {}) {
    try {
      return await GeneralStoreRepository.getSubcategories(filters, pagination);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch subcategories: ${error.message}`);
    }
  }

  static async getSubcategoryById(id: number) {
    try {
      return await GeneralStoreRepository.getSubcategoryById(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch subcategory: ${error.message}`);
    }
  }

  // Item Management
  static async createItem(itemData: CreateItemDto, staffId: number) {
    try {
      // Validate category exists
      const category = await GeneralStoreRepository.getCategoryById(itemData.category_id);
      if (!category) {
        throw new BadException('Error', 400, 'Category not found');
      }

      // Validate subcategory exists and belongs to category if provided
      if (itemData.subcategory_id) {
        const subcategory = await GeneralStoreRepository.getSubcategoryById(itemData.subcategory_id);
        if (!subcategory) {
          throw new BadException('Error', 400, 'Subcategory not found');
        }

        // Validate subcategory belongs to category
        if (subcategory.category_id !== itemData.category_id) {
          throw new BadException(
            'Error',
            400,
            'Subcategory does not belong to the specified category'
          );
        }
      }

      // Validate minimum stock is less than maximum stock if both provided
      if (itemData.maximum_stock && itemData.minimum_stock >= itemData.maximum_stock) {
        throw new BadException('Error', 400, 'Minimum stock must be less than maximum stock');
      }

      return await GeneralStoreRepository.createItem(itemData, staffId);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to create item: ${error.message}`);
    }
  }

  static async updateItem(id: number, itemData: UpdateItemDto, staffId: number) {
    try {
      // Validate category and subcategory exist if being changed
      if (itemData.category_id) {
        const category = await GeneralStoreRepository.getCategoryById(itemData.category_id);
        if (!category) {
          throw new BadException('Error', 400, 'Category not found');
        }
      }

      if (itemData.subcategory_id) {
        const subcategory = await GeneralStoreRepository.getSubcategoryById(
          itemData.subcategory_id
        );
        if (!subcategory) {
          throw new BadException('Error', 400, 'Subcategory not found');
        }

        // Validate subcategory belongs to category if both are being changed
        if (itemData.category_id && subcategory.category_id !== itemData.category_id) {
          throw new BadException(
            'Error',
            400,
            'Subcategory does not belong to the specified category'
          );
        }
      }

      // Validate stock levels if being changed
      if (itemData.minimum_stock !== undefined && itemData.maximum_stock !== undefined) {
        if (itemData.minimum_stock >= itemData.maximum_stock) {
          throw new BadException('Error', 400, 'Minimum stock must be less than maximum stock');
        }
      }

      return await GeneralStoreRepository.updateItem(id, itemData, staffId);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to update item: ${error.message}`);
    }
  }

  static async deleteItem(id: number) {
    try {
      await GeneralStoreRepository.deleteItem(id);
      return { message: 'Item deleted successfully' };
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to delete item: ${error.message}`);
    }
  }

  static async getItems(filters: any = {}, pagination: any = {}) {
    try {
      return await GeneralStoreRepository.getItems(filters, pagination);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch items: ${error.message}`);
    }
  }

  static async getItemById(id: number) {
    try {
      return await GeneralStoreRepository.getItemById(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch item: ${error.message}`);
    }
  }

  static async searchItems(searchTerm: string, filters: any = {}, pagination: any = {}) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new BadException('Error', 400, 'Search term must be at least 2 characters long');
      }

      return await GeneralStoreRepository.searchItems(searchTerm.trim(), filters, pagination);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to search items: ${error.message}`);
    }
  }

  static async getLowStockItems() {
    try {
      return await GeneralStoreRepository.getLowStockItems();
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch low stock items: ${error.message}`);
    }
  }

  static async getExpiringItems(days = 30) {
    try {
      if (days < 1 || days > 365) {
        throw new BadException('Error', 400, 'Days must be between 1 and 365');
      }

      return await GeneralStoreRepository.getExpiringItems(days);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch expiring items: ${error.message}`);
    }
  }

  // Movement Management
  static async getMovements(filters: any = {}, pagination: any = {}) {
    try {
      return await GeneralStoreRepository.getMovements(filters, pagination);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch movements: ${error.message}`);
    }
  }

  static async getItemMovements(itemId: number, filters: any = {}) {
    try {
      return await GeneralStoreRepository.getItemMovements(itemId, filters);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch item movements: ${error.message}`);
    }
  }

  static async createMovement(movementData: CreateMovementDto, staffId: number) {
    try {
      return await GeneralStoreRepository.createMovement(movementData, staffId);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to create movement: ${error.message}`);
    }
  }

  // Stock Management
  static async receiveStock(movementData: CreateMovementDto, staffId: number) {
    try {
      // Validate item exists and is active
      const item = await GeneralStoreRepository.getItemById(movementData.item_id);
      if (item.status !== ItemStatus.ACTIVE) {
        throw new BadException('Error', 400, 'Cannot receive stock for inactive item');
      }

      // Validate quantity is positive
      if (movementData.quantity <= 0) {
        throw new BadException('Error', 400, 'Quantity must be positive');
      }

      // Create movement record
      const movement = await GeneralStoreRepository.createMovement(movementData, staffId);

      return {
        message: 'Stock received successfully',
        movement,
        newStockLevel: item.current_stock + movementData.quantity,
      };
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to receive stock: ${error.message}`);
    }
  }

  static async issueStock(movementData: CreateMovementDto, staffId: number) {
    try {
      // Validate item exists and is active
      const item = await GeneralStoreRepository.getItemById(movementData.item_id);
      if (item.status !== ItemStatus.ACTIVE) {
        throw new BadException('Error', 400, 'Cannot issue stock for inactive item');
      }

      // Validate sufficient stock
      if (item.current_stock < movementData.quantity) {
        throw new BadException(
          'Error',
          400,
          `Insufficient stock. Available: ${item.current_stock}, Requested: ${movementData.quantity}`
        );
      }

      // Validate quantity is positive
      if (movementData.quantity <= 0) {
        throw new BadException('Error', 400, 'Quantity must be positive');
      }

      // Create movement record
      const movement = await GeneralStoreRepository.createMovement(movementData, staffId);

      return {
        message: 'Stock issued successfully',
        movement,
        remainingStock: item.current_stock - movementData.quantity,
      };
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to issue stock: ${error.message}`);
    }
  }

  static async adjustStock(itemId: number, quantity: number, reason: string, staffId: number) {
    try {
      // Validate item exists
      const item = await GeneralStoreRepository.getItemById(itemId);

      // Validate quantity is not zero
      if (quantity === 0) {
        throw new BadException('Error', 400, 'Adjustment quantity cannot be zero');
      }

      // Create adjustment movement
      const movementData: CreateMovementDto = {
        item_id: itemId,
        movement_type: MovementType.ADJUSTMENT,
        quantity: Math.abs(quantity),
        unit_cost: item.unit_cost,
        reference_type: 'ADJUSTMENT',
        reference_id: 0, // No specific reference for adjustments
        notes: reason,
      };

      const movement = await GeneralStoreRepository.createMovement(movementData, staffId);

      return {
        message: 'Stock adjusted successfully',
        movement,
        newStockLevel: item.current_stock,
      };
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to adjust stock: ${error.message}`);
    }
  }

  static async checkStockAvailability(itemId: number, quantity: number): Promise<boolean> {
    try {
      const item = await GeneralStoreRepository.getItemById(itemId);
      return item.current_stock >= quantity;
    } catch (error) {
      return false;
    }
  }

  // Request Management
  static async getRequests(filters: any = {}, pagination: any = {}) {
    try {
      return await GeneralStoreRepository.getRequests(filters, pagination);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch requests: ${error.message}`);
    }
  }

  static async getRequestById(id: number) {
    try {
      return await GeneralStoreRepository.getRequestById(id);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch request: ${error.message}`);
    }
  }

  static async getMyRequests(staffId: number, pagination: any = {}) {
    try {
      return await GeneralStoreRepository.getMyRequests(staffId, pagination);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fetch my requests: ${error.message}`);
    }
  }

  static async getPendingApprovalRequests(pagination: any = {}) {
    try {
      return await GeneralStoreRepository.getPendingApprovalRequests(pagination);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException(
        'Error',
        500,
        `Failed to fetch pending approval requests: ${error.message}`
      );
    }
  }

  static async createRequest(requestData: CreateRequestDto, staffId: number) {
    try {
      // Validate request data
      const validationResult = await this.validateRequest(requestData);
      if (!validationResult.isValid) {
        throw new BadException(
          'Error',
          400,
          `Request validation failed: ${validationResult.errors.join(', ')}`
        );
      }

      return await GeneralStoreRepository.createRequest(requestData, staffId);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to create request: ${error.message}`);
    }
  }

  static async approveRequest(
    requestId: number,
    approvedItems: ApprovedItem[],
    approverId: number
  ) {
    try {
      // Get request with items
      const request = await GeneralStoreRepository.getRequestById(requestId);

      if (!request.canBeApproved()) {
        throw new BadException('Error', 400, 'Request cannot be approved in its current status');
      }

      // Validate approved items
      for (const approvedItem of approvedItems) {
        const requestItem = request.requestItems.find(
          item => item.item_id === approvedItem.item_id
        );
        if (!requestItem) {
          throw new BadException('Error', 400, `Item ${approvedItem.item_id} not found in request`);
        }

        if (approvedItem.quantity_approved > requestItem.quantity_requested) {
          throw new BadException(
            'Error',
            400,
            `Approved quantity cannot exceed requested quantity for item ${approvedItem.item_id}`
          );
        }

        if (approvedItem.quantity_approved <= 0) {
          throw new BadException(
            'Error',
            400,
            `Approved quantity must be positive for item ${approvedItem.item_id}`
          );
        }
      }

      // Update request items
      for (const approvedItem of approvedItems) {
        const requestItem = request.requestItems.find(
          item => item.item_id === approvedItem.item_id
        );
        if (requestItem) {
          requestItem.quantity_approved = approvedItem.quantity_approved;
          requestItem.status = ItemRequestStatus.APPROVED;
          requestItem.updateTotalCost();
          await requestItem.save();
        }
      }

      // Update request status
      request.status = RequestStatus.APPROVED;
      request.approved_by = approverId;
      await request.save();

      // Recalculate total cost
      await GeneralStoreRepository.calculateRequestCost(requestId);

      return {
        message: 'Request approved successfully',
        request: await GeneralStoreRepository.getRequestById(requestId),
      };
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to approve request: ${error.message}`);
    }
  }

  static async rejectRequest(requestId: number, reason: string, approverId: number) {
    try {
      const request = await GeneralStoreRepository.getRequestById(requestId);

      if (!request.canBeRejected()) {
        throw new BadException('Error', 400, 'Request cannot be rejected in its current status');
      }

      // Update request status
      request.status = RequestStatus.REJECTED;
      request.approved_by = approverId;
      request.rejection_reason = reason;
      await request.save();

      return {
        message: 'Request rejected successfully',
        request,
      };
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to reject request: ${error.message}`);
    }
  }

  static async fulfillRequest(requestId: number, issuedItems: IssuedItem[], staffId: number) {
    try {
      const request = await GeneralStoreRepository.getRequestById(requestId);

      if (!request.canBeFulfilled()) {
        throw new BadException('Error', 400, 'Request cannot be fulfilled in its current status');
      }

      // Validate issued items
      for (const issuedItem of issuedItems) {
        const requestItem = request.requestItems.find(item => item.item_id === issuedItem.item_id);
        if (!requestItem) {
          throw new BadException('Error', 400, `Item ${issuedItem.item_id} not found in request`);
        }

        if (issuedItem.quantity_issued > requestItem.quantity_approved) {
          throw new BadException(
            'Error',
            400,
            `Issued quantity cannot exceed approved quantity for item ${issuedItem.item_id}`
          );
        }

        if (issuedItem.quantity_issued <= 0) {
          throw new BadException(
            'Error',
            400,
            `Issued quantity must be positive for item ${issuedItem.item_id}`
          );
        }

        // Check stock availability
        const hasStock = await this.checkStockAvailability(
          issuedItem.item_id,
          issuedItem.quantity_issued
        );
        if (!hasStock) {
          throw new BadException('Error', 400, `Insufficient stock for item ${issuedItem.item_id}`);
        }
      }

      // Issue stock and update request items
      for (const issuedItem of issuedItems) {
        const requestItem = request.requestItems.find(item => item.item_id === issuedItem.item_id);
        if (requestItem) {
          // Create movement record
          const movementData: CreateMovementDto = {
            item_id: issuedItem.item_id,
            movement_type: MovementType.OUT,
            quantity: issuedItem.quantity_issued,
            unit_cost: requestItem.unit_cost,
            reference_type: 'REQUEST',
            reference_id: requestId,
            notes: `Fulfilling request ${request.request_number}`,
          };

          await GeneralStoreRepository.createMovement(movementData, staffId);

          // Update request item
          requestItem.quantity_issued = issuedItem.quantity_issued;
          if (requestItem.quantity_issued === requestItem.quantity_approved) {
            requestItem.status = ItemRequestStatus.ISSUED;
          } else {
            requestItem.status = ItemRequestStatus.PARTIALLY_ISSUED;
          }
          await requestItem.save();
        }
      }

      // Update request status
      const allItemsIssued = request.requestItems.every(
        item => item.status === ItemRequestStatus.ISSUED
      );
      request.status = allItemsIssued ? RequestStatus.FULFILLED : RequestStatus.PARTIALLY_FULFILLED;
      await request.save();

      return {
        message: 'Request fulfilled successfully',
        request: await GeneralStoreRepository.getRequestById(requestId),
      };
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to fulfill request: ${error.message}`);
    }
  }

  // Validation Methods
  static async validateRequest(requestData: CreateRequestDto): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      // Validate items exist and are active
      for (const itemData of requestData.items) {
        const item = await GeneralStoreRepository.getItemById(itemData.item_id);
        if (!item) {
          errors.push(`Item with ID ${itemData.item_id} not found`);
        } else if (item.status !== ItemStatus.ACTIVE) {
          errors.push(`Item ${item.name} is not active`);
        }
      }

      // Validate required date is in the future
      if (new Date(requestData.required_date) <= new Date()) {
        errors.push('Required date must be in the future');
      }

      // Validate priority is valid
      if (!Object.values(Priority).includes(requestData.priority)) {
        errors.push('Invalid priority level');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
      return {
        isValid: false,
        errors,
      };
    }
  }

  // Report Methods
  static async getStockReport(filters: StockReportFilters): Promise<StockReport> {
    try {
      const items = await GeneralStoreRepository.getItems(filters, { limit: 1000 });

      const summary = {
        total_items: items.count,
        total_value: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
      };

      for (const item of items.rows) {
        summary.total_value += item.total_value;
        if (item.isLowStock()) summary.low_stock_count++;
        if (item.isOutOfStock()) summary.out_of_stock_count++;
      }

      return {
        items: items.rows.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category?.name || 'Unknown',
          subcategory: item.subcategory?.name || 'Unknown',
          current_stock: item.current_stock,
          minimum_stock: item.minimum_stock,
          unit_cost: item.unit_cost,
          total_value: item.total_value,
          status: item.status,
        })),
        summary,
      };
    } catch (error) {
      throw new BadException('Error', 500, `Failed to generate stock report: ${error.message}`);
    }
  }

  static async getMovementReport(filters: MovementReportFilters): Promise<MovementReport> {
    try {
      const movements = await GeneralStoreRepository.getMovements(filters, { limit: 1000 });

      const summary = {
        total_movements: movements.count,
        total_in: 0,
        total_out: 0,
        total_transfers: 0,
        total_adjustments: 0,
      };

      for (const movement of movements.rows) {
        switch (movement.movement_type) {
          case MovementType.IN:
            summary.total_in += movement.quantity;
            break;
          case MovementType.OUT:
            summary.total_out += movement.quantity;
            break;
          case MovementType.TRANSFER:
            summary.total_transfers += movement.quantity;
            break;
          case MovementType.ADJUSTMENT:
            summary.total_adjustments += movement.quantity;
            break;
        }
      }

      return {
        movements: movements.rows.map(movement => ({
          id: movement.id,
          item_name: movement.item?.name || 'Unknown',
          movement_type: movement.movement_type,
          quantity: movement.quantity,
          unit_cost: movement.unit_cost,
          total_cost: movement.total_cost,
          reference_type: movement.reference_type,
          reference_id: movement.reference_id,
          staff_name: movement.staff?.name || 'Unknown',
          movement_date: movement.movement_date,
        })),
        summary,
      };
    } catch (error) {
      throw new BadException('Error', 500, `Failed to generate movement report: ${error.message}`);
    }
  }

  static async getUsageReport(departmentId: number, dateRange: DateRange): Promise<UsageReport> {
    try {
      // This would need to be implemented based on your specific requirements
      // For now, returning a placeholder
      return {
        department: 'General',
        total_requests: 0,
        total_items: 0,
        total_cost: 0,
        period: dateRange,
      };
    } catch (error) {
      throw new BadException('Error', 500, `Failed to generate usage report: ${error.message}`);
    }
  }

  static async getCostReport(filters: CostReportFilters): Promise<CostReport> {
    try {
      const items = await GeneralStoreRepository.getItems(filters, { limit: 1000 });

      if (items.rows.length === 0) {
        return {
          items: [],
          summary: {
            total_items: 0,
            total_value: 0,
            average_unit_cost: 0,
            highest_cost_item: 'N/A',
            lowest_cost_item: 'N/A',
          },
        };
      }

      const totalValue = items.rows.reduce((sum, item) => sum + item.total_value, 0);
      const averageUnitCost =
        items.rows.reduce((sum, item) => sum + item.unit_cost, 0) / items.rows.length;

      const sortedByCost = items.rows.sort((a, b) => a.unit_cost - b.unit_cost);
      const highestCostItem = sortedByCost[sortedByCost.length - 1]?.name || 'N/A';
      const lowestCostItem = sortedByCost[0]?.name || 'N/A';

      return {
        items: items.rows.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category?.name || 'Unknown',
          subcategory: item.subcategory?.name || 'Unknown',
          unit_cost: item.unit_cost,
          current_stock: item.current_stock,
          total_value: item.total_value,
          supplier_name: item.supplier?.name,
        })),
        summary: {
          total_items: items.count,
          total_value: totalValue,
          average_unit_cost: averageUnitCost,
          highest_cost_item: highestCostItem,
          lowest_cost_item: lowestCostItem,
        },
      };
    } catch (error) {
      throw new BadException('Error', 500, `Failed to generate cost report: ${error.message}`);
    }
  }

  // Dashboard Management
  static async getDashboardStats() {
    try {
      const [
        totalItems,
        activeItems,
        lowStockItems,
        totalValue,
        totalCategories,
        totalSubcategories,
        totalRequests,
        pendingRequests,
        totalMovements,
        todayMovements,
      ] = await Promise.all([
        GeneralStoreRepository.getItemsCount(),
        GeneralStoreRepository.getActiveItemsCount(),
        GeneralStoreRepository.getLowStockItemsCount(),
        GeneralStoreRepository.getTotalValue(),
        GeneralStoreRepository.getCategoriesCount(),
        GeneralStoreRepository.getSubcategoriesCount(),
        GeneralStoreRepository.getRequestsCount(),
        GeneralStoreRepository.getPendingRequestsCount(),
        GeneralStoreRepository.getMovementsCount(),
        GeneralStoreRepository.getTodayMovementsCount(),
      ]);

      return {
        totalItems,
        activeItems,
        lowStockItems,
        totalValue,
        totalCategories,
        totalSubcategories,
        totalRequests,
        pendingRequests,
        totalMovements,
        todayMovements,
        itemsGrowth: 0, // This would need to be calculated based on historical data
        activeGrowth: 0,
        lowStockGrowth: 0,
        valueGrowth: 0,
      };
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get dashboard stats: ${error.message}`);
    }
  }

  static async getRecentReports(staffId: number, limit = 10) {
    try {
      // This would typically query a reports table
      // For now, return mock data
      return {
        reports: [
          {
            id: 1,
            type: 'stock',
            title: 'Monthly Stock Report',
            generated_at: new Date(),
            generated_by: staffId,
          },
          {
            id: 2,
            type: 'movement',
            title: 'Weekly Movement Report',
            generated_at: new Date(),
            generated_by: staffId,
          },
        ],
        total: 2,
      };
    } catch (error) {
      throw new BadException('Error', 500, `Failed to fetch recent reports: ${error.message}`);
    }
  }

  // Export functionality
  static async exportReport(reportData: any, format: string, reportType: string) {
    try {
      // This would typically generate and return export data
      // For now, return a placeholder response
      const contentType = format === 'csv' ? 'text/csv' : 'application/json';
      return {
        success: true,
        message: `${reportType} report exported successfully`,
        format: format,
        contentType: contentType,
        filename: `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`,
        data: reportData,
      };
    } catch (error) {
      throw new BadException(
        'Error',
        500,
        `Failed to export ${reportType} report: ${error.message}`
      );
    }
  }

  // Request update method
  static async updateRequest(requestId: number, requestData: any, staffId: number) {
    try {
      return await GeneralStoreRepository.updateRequest(requestId, requestData, staffId);
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to update request: ${error.message}`);
    }
  }

  // Settings Management
  static async getSettings() {
    try {
      return await GeneralStoreRepository.getSettings();
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get settings: ${error.message}`);
    }
  }

  static async updateSettings(settingsData: any) {
    try {
      return await GeneralStoreRepository.updateSettings(settingsData);
    } catch (error) {
      throw new BadException('Error', 500, `Failed to update settings: ${error.message}`);
    }
  }

  // Request Workflow Methods - Consolidated implementations
  // Note: The main implementations are above (lines 501-680)

  static async cancelRequest(requestId: number, cancellationData: any) {
    try {
      const request = await GeneralStoreRepository.getRequestById(requestId);
      if (!request) {
        throw new BadException('NOT_FOUND', 404, 'Request not found');
      }

      if (request.status !== 'PENDING') {
        throw new BadException('INVALID_STATUS', 400, 'Request is not in pending status');
      }

      const updatedRequest = await GeneralStoreRepository.updateRequest(
        requestId,
        {
          status: 'CANCELLED',
          cancelled_at: new Date(),
          cancelled_by: cancellationData.cancelled_by,
          cancellation_reason: cancellationData.reason,
          cancellation_notes: cancellationData.notes,
        },
        cancellationData.cancelled_by
      );

      return updatedRequest;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to cancel request: ${error.message}`);
    }
  }

  // Movement Workflow Methods
  static async approveMovement(movementId: number, approvalData: any) {
    try {
      // Note: Movement approval functionality needs to be implemented in repository
      // For now, return a placeholder response
      throw new BadException('NOT_IMPLEMENTED', 501, 'Movement approval not yet implemented');
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to approve movement: ${error.message}`);
    }
  }

  static async rejectMovement(movementId: number, rejectionData: any) {
    try {
      // Note: Movement rejection functionality needs to be implemented in repository
      // For now, return a placeholder response
      throw new BadException('NOT_IMPLEMENTED', 501, 'Movement rejection not yet implemented');
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Error', 500, `Failed to reject movement: ${error.message}`);
    }
  }
}
