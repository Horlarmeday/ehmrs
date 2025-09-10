import { NextFunction, Request, Response } from 'express';
import { GeneralStoreService } from './generalStore.service';
import { GeneralStoreAuditService } from './audit.service';
import { BadException } from '../../common/util/api-error';
import { calcLimitAndOffset, StatusCodes } from '../../core/helpers/helper';
import { Op } from 'sequelize';
import Joi from 'joi';
import {
  createCategorySchema,
  updateCategorySchema,
  createSubcategorySchema,
  updateSubcategorySchema,
  createItemSchema,
  updateItemSchema,
  createMovementSchema,
  createRequestSchema,
  approveRequestSchema,
  rejectRequestSchema,
  fulfillRequestSchema,
  paginationSchema,
  itemFilterSchema,
  movementFilterSchema,
  requestFilterSchema,
  reportFilterSchema,
} from './validations';
import { AuditAction, AuditModule } from '../../database/models/generalStoreAudit';
import {
  createPaginatedResponse,
  createItemResponse,
  createCreatedResponse,
  createDeletedResponse,
  createValidationErrorResponse,
  createNotFoundResponse,
  createServerErrorResponse,
  createErrorResponse,
} from './utils/response.helper';

export class GeneralStoreController {
  // Validation helper method
  private static validateRequest(data: any, schema: Joi.Schema) {
    const { error, value } = schema.validate(data);
    if (error) {
      throw new BadException('Validation Error', 400, error.details[0].message);
    }
    return value;
  }

  // Category Management
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query parameters
      const validatedQuery = GeneralStoreController.validateRequest(req.query, paginationSchema);
      const { page = 1, limit = 20, parent_id, is_active } = validatedQuery;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      const filters: any = {};
      if (parent_id !== undefined) filters.parent_id = Number(parent_id);
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      const result = await GeneralStoreService.getCategories(filters, { limit: paginate, offset });

      return createPaginatedResponse(
        res,
        result.rows,
        result.count,
        Number(page),
        paginate,
        'Categories retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await GeneralStoreService.getCategoryById(Number(id));

      return createItemResponse(res, category, 'Category retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const validatedData = GeneralStoreController.validateRequest(req.body, createCategorySchema);
      const staffId = (req as any).user.sub;

      const category = await GeneralStoreService.createCategory(validatedData, staffId);

      // Log audit event
      await GeneralStoreAuditService.logCategoryCreation(staffId, category, req);

      return createCreatedResponse(res, category, 'Category created successfully');
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'createCategory', req);
      }

      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const validatedData = GeneralStoreController.validateRequest(req.body, updateCategorySchema);
      const { id } = req.params;
      const staffId = (req as any).user.sub;

      // Get old category data for audit
      const oldCategory = await GeneralStoreService.getCategoryById(Number(id));
      const category = await GeneralStoreService.updateCategory(Number(id), validatedData, staffId);

      // Log audit event
      await GeneralStoreAuditService.logCategoryUpdate(
        staffId,
        Number(id),
        oldCategory,
        category,
        req
      );

      return createItemResponse(res, category, 'Category updated successfully');
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'updateCategory', req);
      }

      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const staffId = (req as any).user?.sub;

      // Get category data for audit before deletion
      const category = await GeneralStoreService.getCategoryById(Number(id));
      const result = await GeneralStoreService.deleteCategory(Number(id));

      // Log audit event
      if (staffId && category) {
        await GeneralStoreAuditService.logCategoryDeletion(staffId, Number(id), category, req);
      }

      return createDeletedResponse(res, result.message);
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'deleteCategory', req);
      }

      next(error);
    }
  }

  static async getSubcategoriesByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      const filters = { category_id: Number(id) };
      const result = await GeneralStoreService.getSubcategories(filters, {
        limit: paginate,
        offset,
      });

      return createPaginatedResponse(
        res,
        result.rows,
        result.count,
        Number(page),
        paginate,
        'Subcategories retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // Subcategory Management
  static async getSubcategories(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query parameters
      const validatedQuery = GeneralStoreController.validateRequest(req.query, paginationSchema);
      const { page = 1, limit = 20, category_id, is_active } = validatedQuery;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      const filters: any = {};
      if (category_id) filters.category_id = Number(category_id);
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      const result = await GeneralStoreService.getSubcategories(filters, {
        limit: paginate,
        offset,
      });

      return createPaginatedResponse(
        res,
        result.rows,
        result.count,
        Number(page),
        paginate,
        'Subcategories retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getSubcategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const subcategory = await GeneralStoreService.getSubcategoryById(Number(id));

      return createItemResponse(res, subcategory, 'Subcategory retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createSubcategory(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const validatedData = GeneralStoreController.validateRequest(
        req.body,
        createSubcategorySchema
      );
      const staffId = (req as any).user.sub;
      const subcategory = await GeneralStoreService.createSubcategory(validatedData, staffId);

      return createCreatedResponse(res, subcategory, 'Subcategory created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateSubcategory(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const validatedData = GeneralStoreController.validateRequest(
        req.body,
        updateSubcategorySchema
      );
      const { id } = req.params;
      const staffId = (req as any).user.sub;
      const subcategory = await GeneralStoreService.updateSubcategory(
        Number(id),
        validatedData,
        staffId
      );

      return createItemResponse(res, subcategory, 'Subcategory updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubcategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await GeneralStoreService.deleteSubcategory(Number(id));

      return createDeletedResponse(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  // Item Management
  static async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query parameters
      const validatedFilters = GeneralStoreController.validateRequest(req.query, itemFilterSchema);
      const {
        page = 1,
        limit = 20,
        category_id,
        subcategory_id,
        status,
        supplier_id,
      } = validatedFilters;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      const filters: any = {};
      if (category_id) filters.category_id = Number(category_id);
      if (subcategory_id) filters.subcategory_id = Number(subcategory_id);
      if (status) filters.status = status;
      if (supplier_id) filters.supplier_id = Number(supplier_id);

      const result = await GeneralStoreService.getItems(filters, { limit: paginate, offset });

      return createPaginatedResponse(
        res,
        result.rows,
        result.count,
        Number(page),
        paginate,
        'Items retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await GeneralStoreService.getItemById(Number(id));

      return createItemResponse(res, item, 'Item retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const validatedData = GeneralStoreController.validateRequest(req.body, createItemSchema);
      const staffId = (req as any).user.sub;
      const item = await GeneralStoreService.createItem(validatedData, staffId);

      return createCreatedResponse(res, item, 'Item created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const validatedData = GeneralStoreController.validateRequest(req.body, updateItemSchema);
      const { id } = req.params;
      const staffId = (req as any).user.sub;
      const item = await GeneralStoreService.updateItem(Number(id), validatedData, staffId);

      return createItemResponse(res, item, 'Item updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await GeneralStoreService.deleteItem(Number(id));

      return createDeletedResponse(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async searchItems(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query parameters
      const validatedQuery = GeneralStoreController.validateRequest(req.query, paginationSchema);
      const validatedFilters = GeneralStoreController.validateRequest(req.query, itemFilterSchema);
      const { page = 1, limit = 20 } = validatedQuery;
      const { q, category_id, subcategory_id, status } = validatedFilters;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      if (!q || typeof q !== 'string') {
        return createErrorResponse(res, 'Search query is required', 400);
      }

      const filters: any = {};
      if (category_id) filters.category_id = Number(category_id);
      if (subcategory_id) filters.subcategory_id = Number(subcategory_id);
      if (status) filters.status = status;

      const result = await GeneralStoreService.searchItems(q, filters, { limit: paginate, offset });

      return createPaginatedResponse(
        res,
        result.rows,
        result.count,
        Number(page),
        paginate,
        'Search completed successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getLowStockItems(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await GeneralStoreService.getLowStockItems();

      return createItemResponse(res, items, 'Low stock items retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getExpiringItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { days = 30 } = req.query;
      const items = await GeneralStoreService.getExpiringItems(Number(days));

      return createItemResponse(res, items, 'Expiring items retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Stock Movements
  static async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query parameters
      const validatedFilters = GeneralStoreController.validateRequest(
        req.query,
        movementFilterSchema
      );
      const {
        page = 1,
        limit = 20,
        item_id,
        movement_type,
        start_date,
        end_date,
        staff_id,
      } = validatedFilters;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      const filters: any = {};
      if (item_id) filters.item_id = Number(item_id);
      if (movement_type) filters.movement_type = movement_type;
      if (staff_id) filters.staff_id = Number(staff_id);
      if (start_date && end_date) {
        filters.start_date = new Date(start_date as string);
        filters.end_date = new Date(end_date as string);
      }

      const result = await GeneralStoreService.getMovements(filters, { limit: paginate, offset });

      return createPaginatedResponse(
        res,
        result.rows,
        result.count,
        Number(page),
        paginate,
        'Movements retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async createMovement(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const validatedData = GeneralStoreController.validateRequest(req.body, createMovementSchema);
      const staffId = (req as any).user.sub;
      const { movement_type } = validatedData;

      let result;
      if (movement_type === 'IN') {
        result = await GeneralStoreService.receiveStock(validatedData, staffId);
      } else if (movement_type === 'OUT') {
        result = await GeneralStoreService.issueStock(validatedData, staffId);
      } else {
        result = await GeneralStoreService.createMovement(validatedData, staffId);
      }

      return createCreatedResponse(res, result, result.message || 'Movement created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getItemMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.params;
      const { start_date, end_date } = req.query;

      const filters: any = {};
      if (start_date && end_date) {
        filters.start_date = new Date(start_date as string);
        filters.end_date = new Date(end_date as string);
      }

      const movements = await GeneralStoreService.getItemMovements(Number(itemId), filters);

      return createItemResponse(res, movements, 'Item movements retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Request Management
  static async getRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        requesting_department,
        start_date,
        end_date,
      } = req.query;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      const filters: any = {};
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (requesting_department) filters.requesting_department = requesting_department;
      if (start_date && end_date) {
        filters.start_date = new Date(start_date as string);
        filters.end_date = new Date(end_date as string);
      }

      const result = await GeneralStoreService.getRequests(filters, { limit: paginate, offset });

      return createPaginatedResponse(
        res,
        result.rows,
        result.count,
        Number(page),
        paginate,
        'Requests retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const request = await GeneralStoreService.getRequestById(Number(id));

      return createItemResponse(res, request, 'Request retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const validatedData = GeneralStoreController.validateRequest(req.body, createRequestSchema);
      const staffId = (req as any).user.sub;
      const request = await GeneralStoreService.createRequest(validatedData, staffId);

      return createCreatedResponse(res, request, 'Request created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateRequest(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const validatedData = GeneralStoreController.validateRequest(req.body, createRequestSchema);
      const { id } = req.params;
      const staffId = (req as any).user.sub;
      const request = await GeneralStoreService.updateRequest(Number(id), validatedData, staffId);

      return createItemResponse(res, request, 'Request updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async approveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const validatedData = GeneralStoreController.validateRequest(req.body, approveRequestSchema);
      const { id } = req.params;
      const approverId = (req as any).user.sub;
      const result = await GeneralStoreService.approveRequest(
        Number(id),
        validatedData.approved_items,
        approverId
      );

      return createItemResponse(res, result.request, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async rejectRequest(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const validatedData = GeneralStoreController.validateRequest(req.body, rejectRequestSchema);
      const { id } = req.params;
      const approverId = (req as any).user.sub;
      const result = await GeneralStoreService.rejectRequest(
        Number(id),
        validatedData.rejection_reason,
        approverId
      );

      res.json({
        success: true,
        message: result.message,
        data: result.request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async fulfillRequest(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const validatedData = GeneralStoreController.validateRequest(req.body, fulfillRequestSchema);
      const { id } = req.params;
      const staffId = (req as any).user.sub;
      const result = await GeneralStoreService.fulfillRequest(
        Number(id),
        validatedData.issued_items,
        staffId
      );

      res.json({
        success: true,
        message: result.message,
        data: result.request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyRequests(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query parameters
      const validatedQuery = GeneralStoreController.validateRequest(req.query, paginationSchema);
      const { page = 1, limit = 20 } = validatedQuery;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      const result = await GeneralStoreService.getMyRequests((req as any).user.sub, {
        limit: paginate,
        offset,
      });

      return createPaginatedResponse(
        res,
        result.rows,
        result.count,
        Number(page),
        paginate,
        'My requests retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getPendingApprovalRequests(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query parameters
      const validatedQuery = GeneralStoreController.validateRequest(req.query, paginationSchema);
      const { page = 1, limit = 20 } = validatedQuery;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      const result = await GeneralStoreService.getPendingApprovalRequests({
        limit: paginate,
        offset,
      });

      return createPaginatedResponse(
        res,
        result.rows,
        result.count,
        Number(page),
        paginate,
        'Pending approval requests retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // Reports
  static async getStockReport(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query parameters
      const validatedFilters = GeneralStoreController.validateRequest(req.query, itemFilterSchema);
      const { category_id, subcategory_id, status, include_zero } = validatedFilters;

      const filters: any = {};
      if (category_id) filters.category_id = Number(category_id);
      if (subcategory_id) filters.subcategory_id = Number(subcategory_id);
      if (status) filters.status = status;
      if (include_zero === 'false') {
        filters.current_stock = { [Op.gt]: 0 };
      }

      const report = await GeneralStoreService.getStockReport(filters);

      return createItemResponse(res, report, 'Stock report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMovementReport(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query parameters
      const validatedFilters = GeneralStoreController.validateRequest(
        req.query,
        movementFilterSchema
      );
      const { item_id, movement_type, start_date, end_date, staff_id } = validatedFilters;

      const filters: any = {};
      if (item_id) filters.item_id = Number(item_id);
      if (movement_type) filters.movement_type = movement_type;
      if (staff_id) filters.staff_id = Number(staff_id);
      if (start_date && end_date) {
        filters.start_date = new Date(start_date as string);
        filters.end_date = new Date(end_date as string);
      }

      const report = await GeneralStoreService.getMovementReport(filters);

      return createItemResponse(res, report, 'Movement report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getUsageReport(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query parameters
      const validatedFilters = GeneralStoreController.validateRequest(
        req.query,
        reportFilterSchema
      );
      const { department_id, start_date, end_date } = validatedFilters;
      const staffId = (req as any).user?.sub;

      const dateRange = {
        start_date: new Date(start_date as string),
        end_date: new Date(end_date as string),
      };

      const report = await GeneralStoreService.getUsageReport(
        Number(department_id) || 0,
        dateRange
      );

      // Log audit event
      if (staffId) {
        await GeneralStoreAuditService.logReportGeneration(
          staffId,
          'Usage Report',
          validatedFilters,
          req
        );
      }

      return createItemResponse(res, report, 'Usage report generated successfully');
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'getUsageReport', req);
      }

      next(error);
    }
  }

  static async getCostReport(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query parameters
      const validatedFilters = GeneralStoreController.validateRequest(
        req.query,
        reportFilterSchema
      );
      const { start_date, end_date, group_by, category_id, subcategory_id } = validatedFilters;
      const staffId = (req as any).user?.sub;

      const filters: any = {
        start_date: new Date(start_date as string),
        end_date: new Date(end_date as string),
      };

      if (group_by) filters.group_by = group_by;
      if (category_id) filters.category_id = Number(category_id);
      if (subcategory_id) filters.subcategory_id = Number(subcategory_id);

      const report = await GeneralStoreService.getCostReport(filters);

      // Log audit event
      if (staffId) {
        await GeneralStoreAuditService.logReportGeneration(
          staffId,
          'Cost Report',
          validatedFilters,
          req
        );
      }

      return createItemResponse(res, report, 'Cost report generated successfully');
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'getCostReport', req);
      }

      next(error);
    }
  }

  static async getLowStockReport(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await GeneralStoreService.getLowStockItems();

      return createItemResponse(
        res,
        {
          items,
          summary: {
            total_items: items.length,
            low_stock_count: items.length,
          },
        },
        'Low stock report generated successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getExpiringReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { days = 30 } = req.query;
      const items = await GeneralStoreService.getExpiringItems(Number(days));

      return createItemResponse(
        res,
        {
          items,
          summary: {
            total_items: items.length,
            days_ahead: Number(days),
          },
        },
        'Expiring items report generated successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const staffId = (req as any).user?.sub;
      const {
        page = 1,
        limit = 20,
        staffId: filterStaffId,
        module,
        action,
        entityType,
        entityId,
        isSuccessful,
        startDate,
        endDate,
      } = req.query;

      const filters: any = {};
      if (filterStaffId) filters.staffId = Number(filterStaffId);
      if (module) filters.module = module;
      if (action) filters.action = action;
      if (entityType) filters.entityType = entityType;
      if (entityId) filters.entityId = Number(entityId);
      if (isSuccessful !== undefined) filters.isSuccessful = isSuccessful === 'true';
      if (startDate && endDate) {
        filters.startDate = new Date(startDate as string);
        filters.endDate = new Date(endDate as string);
      }

      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));
      const result = await GeneralStoreAuditService.getAuditLogs(filters, {
        limit: paginate,
        offset,
      });

      // Log audit event
      if (staffId) {
        await GeneralStoreAuditService.logAuditEvent({
          staffId,
          module: AuditModule.REPORT,
          action: AuditAction.VIEW,
          entityType: 'AuditLog',
          description: 'Audit logs viewed',
          request: req,
        });
      }

      return createPaginatedResponse(
        res,
        result.rows,
        result.count,
        Number(page),
        paginate,
        'Audit logs retrieved successfully'
      );
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'getAuditLogs', req);
      }

      next(error);
    }
  }

  // Dashboard Management
  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await GeneralStoreService.getDashboardStats();

      return createItemResponse(res, stats, 'Dashboard statistics retrieved successfully');
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'getDashboardStats', req);
      }

      next(error);
    }
  }

  static async getRecentReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 10 } = req.query;
      const reports = await GeneralStoreService.getRecentReports(Number(limit));

      return createItemResponse(res, reports, 'Recent reports retrieved successfully');
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'getRecentReports', req);
      }

      next(error);
    }
  }

  // Settings Management
  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await GeneralStoreService.getSettings();

      // Log audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logAuditEvent({
          staffId,
          module: AuditModule.SETTINGS,
          action: AuditAction.VIEW,
          entityType: 'Settings',
          description: 'General store settings viewed',
          request: req,
        });
      }

      return createItemResponse(res, result, 'Settings retrieved successfully');
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'getSettings', req);
      }

      next(error);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await GeneralStoreService.updateSettings(req.body);

      // Log audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logAuditEvent({
          staffId,
          module: AuditModule.SETTINGS,
          action: AuditAction.UPDATE,
          entityType: 'Settings',
          description: 'General store settings updated',
          oldValues: {},
          newValues: req.body,
          request: req,
        });
      }

      return createItemResponse(res, result, 'Settings updated successfully');
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'updateSettings', req);
      }

      next(error);
    }
  }

  // Export Methods
  static async exportStockReport(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedFilters = GeneralStoreController.validateRequest(req.query, itemFilterSchema);
      const {
        category_id,
        subcategory_id,
        status,
        include_zero,
        format = 'csv',
      } = validatedFilters;
      const staffId = (req as any).user?.sub;

      const filters: any = {};
      if (category_id) filters.category_id = Number(category_id);
      if (subcategory_id) filters.subcategory_id = Number(subcategory_id);
      if (status) filters.status = status;
      if (include_zero === 'false') {
        filters.current_stock = { [Op.gt]: 0 };
      }

      const report = await GeneralStoreService.getStockReport(filters);
      const exportResult = await GeneralStoreService.exportReport(report, format, 'stock');

      // Log audit event
      if (staffId) {
        await GeneralStoreAuditService.logReportGeneration(
          staffId,
          `Stock Report Export (${format.toUpperCase()})`,
          validatedFilters,
          req
        );
      }

      res.setHeader('Content-Type', exportResult.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
      res.send(exportResult.data);
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'exportStockReport', req);
      }

      next(error);
    }
  }

  static async exportMovementReport(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedFilters = GeneralStoreController.validateRequest(
        req.query,
        movementFilterSchema
      );
      const {
        item_id,
        movement_type,
        start_date,
        end_date,
        staff_id,
        format = 'csv',
      } = validatedFilters;
      const staffId = (req as any).user?.sub;

      const filters: any = {};
      if (item_id) filters.item_id = Number(item_id);
      if (movement_type) filters.movement_type = movement_type;
      if (staff_id) filters.staff_id = Number(staff_id);
      if (start_date && end_date) {
        filters.start_date = new Date(start_date as string);
        filters.end_date = new Date(end_date as string);
      }

      const report = await GeneralStoreService.getMovementReport(filters);
      const exportResult = await GeneralStoreService.exportReport(report, format, 'movements');

      // Log audit event
      if (staffId) {
        await GeneralStoreAuditService.logReportGeneration(
          staffId,
          `Movement Report Export (${format.toUpperCase()})`,
          validatedFilters,
          req
        );
      }

      res.setHeader('Content-Type', exportResult.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
      res.send(exportResult.data);
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'exportMovementReport', req);
      }

      next(error);
    }
  }

  static async exportUsageReport(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedFilters = GeneralStoreController.validateRequest(
        req.query,
        reportFilterSchema
      );
      const { department_id, start_date, end_date, format = 'csv' } = validatedFilters;
      const staffId = (req as any).user?.sub;

      const dateRange = {
        start_date: new Date(start_date as string),
        end_date: new Date(end_date as string),
      };

      const report = await GeneralStoreService.getUsageReport(
        Number(department_id) || 0,
        dateRange
      );
      const exportResult = await GeneralStoreService.exportReport(report, format, 'usage');

      // Log audit event
      if (staffId) {
        await GeneralStoreAuditService.logReportGeneration(
          staffId,
          `Usage Report Export (${format.toUpperCase()})`,
          validatedFilters,
          req
        );
      }

      res.setHeader('Content-Type', exportResult.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
      res.send(exportResult.data);
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'exportUsageReport', req);
      }

      next(error);
    }
  }
  static async exportCostReport(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedFilters = GeneralStoreController.validateRequest(
        req.query,
        reportFilterSchema
      );
      const {
        start_date,
        end_date,
        group_by,
        category_id,
        subcategory_id,
        format = 'csv',
      } = validatedFilters;
      const staffId = (req as any).user?.sub;

      const filters: any = {
        start_date: new Date(start_date as string),
        end_date: new Date(end_date as string),
      };

      if (group_by) filters.group_by = group_by;
      if (category_id) filters.category_id = Number(category_id);
      if (subcategory_id) filters.subcategory_id = Number(subcategory_id);

      const report = await GeneralStoreService.getCostReport(filters);
      const exportResult = await GeneralStoreService.exportReport(report, format, 'costs');

      // Log audit event
      if (staffId) {
        await GeneralStoreAuditService.logReportGeneration(
          staffId,
          `Cost Report Export (${format.toUpperCase()})`,
          validatedFilters,
          req
        );
      }

      res.setHeader('Content-Type', exportResult.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
      res.send(exportResult.data);
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'exportCostReport', req);
      }

      next(error);
    }
  }

  // Request Workflow Methods (Consolidated)
  static async cancelRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { notes, cancelled_by, reason } = req.body;

      const request = await GeneralStoreService.cancelRequest(Number(id), {
        notes,
        cancelled_by: cancelled_by || (req as any).user.sub,
        reason,
      });

      return createItemResponse(res, request, 'Request cancelled successfully', StatusCodes.OK);
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'cancelRequest', req);
      }

      next(error);
    }
  }

  // Movement Workflow Methods
  static async approveMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { notes, approved_by } = req.body;

      const movement = await GeneralStoreService.approveMovement(Number(id), {
        notes,
        approved_by: approved_by || (req as any).user?.sub,
      });

      return createItemResponse(res, movement, 'Movement approved successfully', StatusCodes.OK);
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'approveMovement', req);
      }

      next(error);
    }
  }

  static async rejectMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { notes, rejected_by, reason } = req.body;

      const movement = await GeneralStoreService.rejectMovement(Number(id), {
        notes,
        rejected_by: rejected_by || (req as any).user?.sub,
        reason,
      });

      return createItemResponse(res, movement, 'Movement rejected successfully', StatusCodes.OK);
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.sub;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'rejectMovement', req);
      }

      next(error);
    }
  }
}
