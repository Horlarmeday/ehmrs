import { Request, Response } from 'express';
import { GeneralStoreService } from './generalStore.service';
import { GeneralStoreAuditService } from './audit.service';
import { BadException } from '../../common/util/api-error';
import { calcLimitAndOffset } from '../../core/helpers/helper';
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

export class GeneralStoreController {
  // Validation helper method
  private static validateRequest(data: any, schema: Joi.Schema): any {
    const { error, value } = schema.validate(data);
    if (error) {
      throw new BadException('Validation Error', 400, error.details[0].message);
    }
    return value;
  }

  // Category Management
  static async getCategories(req: Request, res: Response) {
    try {
      // Validate query parameters
      const validatedQuery = this.validateRequest(req.query, paginationSchema);
      const { page = 1, limit = 20, parent_id, is_active } = validatedQuery;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      const filters: any = {};
      if (parent_id !== undefined) filters.parent_id = Number(parent_id);
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      const result = await GeneralStoreService.getCategories(filters, { limit: paginate, offset });

      res.json({
        success: true,
        message: 'Categories retrieved successfully',
        data: result.rows,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(result.count / paginate),
          total_items: result.count,
          items_per_page: paginate,
        },
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await GeneralStoreService.getCategoryById(Number(id));

      res.json({
        success: true,
        message: 'Category retrieved successfully',
        data: category,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = this.validateRequest(req.body, createCategorySchema);
      const staffId = (req as any).user.id;
      const category = await GeneralStoreService.createCategory(validatedData, staffId);

      // Log audit event
      await GeneralStoreAuditService.logCategoryCreation(staffId, category, req);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.id;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'createCategory', req);
      }

      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = this.validateRequest(req.body, updateCategorySchema);
      const { id } = req.params;
      const staffId = (req as any).user.id;

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

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.id;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'updateCategory', req);
      }

      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const staffId = (req as any).user?.id;

      // Get category data for audit before deletion
      const category = await GeneralStoreService.getCategoryById(Number(id));
      const result = await GeneralStoreService.deleteCategory(Number(id));

      // Log audit event
      if (staffId && category) {
        await GeneralStoreAuditService.logCategoryDeletion(staffId, Number(id), category, req);
      }

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.id;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'deleteCategory', req);
      }

      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getSubcategoriesByCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      const filters = { category_id: Number(id) };
      const result = await GeneralStoreService.getSubcategories(filters, {
        limit: paginate,
        offset,
      });

      res.json({
        success: true,
        message: 'Subcategories retrieved successfully',
        data: result.rows,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(result.count / paginate),
          total_items: result.count,
          items_per_page: paginate,
        },
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  // Subcategory Management
  static async getSubcategories(req: Request, res: Response) {
    try {
      // Validate query parameters
      const validatedQuery = this.validateRequest(req.query, paginationSchema);
      const { page = 1, limit = 20, category_id, is_active } = validatedQuery;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      const filters: any = {};
      if (category_id) filters.category_id = Number(category_id);
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      const result = await GeneralStoreService.getSubcategories(filters, {
        limit: paginate,
        offset,
      });

      res.json({
        success: true,
        message: 'Subcategories retrieved successfully',
        data: result.rows,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(result.count / paginate),
          total_items: result.count,
          items_per_page: paginate,
        },
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getSubcategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const subcategory = await GeneralStoreService.getSubcategoryById(Number(id));

      res.json({
        success: true,
        message: 'Subcategory retrieved successfully',
        data: subcategory,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async createSubcategory(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = this.validateRequest(req.body, createSubcategorySchema);
      const staffId = (req as any).user.id;
      const subcategory = await GeneralStoreService.createSubcategory(validatedData, staffId);

      res.status(201).json({
        success: true,
        message: 'Subcategory created successfully',
        data: subcategory,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async updateSubcategory(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = this.validateRequest(req.body, updateSubcategorySchema);
      const { id } = req.params;
      const staffId = (req as any).user.id;
      const subcategory = await GeneralStoreService.updateSubcategory(
        Number(id),
        validatedData,
        staffId
      );

      res.json({
        success: true,
        message: 'Subcategory updated successfully',
        data: subcategory,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async deleteSubcategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await GeneralStoreService.deleteSubcategory(Number(id));

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  // Item Management
  static async getItems(req: Request, res: Response) {
    try {
      // Validate query parameters
      const validatedQuery = this.validateRequest(req.query, paginationSchema);
      const validatedFilters = this.validateRequest(req.query, itemFilterSchema);
      const { page = 1, limit = 20 } = validatedQuery;
      const { category_id, subcategory_id, status, supplier_id } = validatedFilters;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      const filters: any = {};
      if (category_id) filters.category_id = Number(category_id);
      if (subcategory_id) filters.subcategory_id = Number(subcategory_id);
      if (status) filters.status = status;
      if (supplier_id) filters.supplier_id = Number(supplier_id);

      const result = await GeneralStoreService.getItems(filters, { limit: paginate, offset });

      res.json({
        success: true,
        message: 'Items retrieved successfully',
        data: result.rows,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(result.count / paginate),
          total_items: result.count,
          items_per_page: paginate,
        },
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getItemById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await GeneralStoreService.getItemById(Number(id));

      res.json({
        success: true,
        message: 'Item retrieved successfully',
        data: item,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async createItem(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = this.validateRequest(req.body, createItemSchema);
      const staffId = (req as any).user.id;
      const item = await GeneralStoreService.createItem(validatedData, staffId);

      res.status(201).json({
        success: true,
        message: 'Item created successfully',
        data: item,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async updateItem(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = this.validateRequest(req.body, updateItemSchema);
      const { id } = req.params;
      const staffId = (req as any).user.id;
      const item = await GeneralStoreService.updateItem(Number(id), validatedData, staffId);

      res.json({
        success: true,
        message: 'Item updated successfully',
        data: item,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async deleteItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await GeneralStoreService.deleteItem(Number(id));

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async searchItems(req: Request, res: Response) {
    try {
      // Validate query parameters
      const validatedQuery = this.validateRequest(req.query, paginationSchema);
      const validatedFilters = this.validateRequest(req.query, itemFilterSchema);
      const { page = 1, limit = 20 } = validatedQuery;
      const { q, category_id, subcategory_id, status } = validatedFilters;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
      }

      const filters: any = {};
      if (category_id) filters.category_id = Number(category_id);
      if (subcategory_id) filters.subcategory_id = Number(subcategory_id);
      if (status) filters.status = status;

      const result = await GeneralStoreService.searchItems(q, filters, { limit: paginate, offset });

      res.json({
        success: true,
        message: 'Search completed successfully',
        data: result.rows,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(result.count / paginate),
          total_items: result.count,
          items_per_page: paginate,
        },
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getLowStockItems(req: Request, res: Response) {
    try {
      const items = await GeneralStoreService.getLowStockItems();

      res.json({
        success: true,
        message: 'Low stock items retrieved successfully',
        data: items,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getExpiringItems(req: Request, res: Response) {
    try {
      const { days = 30 } = req.query;
      const items = await GeneralStoreService.getExpiringItems(Number(days));

      res.json({
        success: true,
        message: 'Expiring items retrieved successfully',
        data: items,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  // Stock Movements
  static async getMovements(req: Request, res: Response) {
    try {
      // Validate query parameters
      const validatedQuery = this.validateRequest(req.query, paginationSchema);
      const validatedFilters = this.validateRequest(req.query, movementFilterSchema);
      const { page = 1, limit = 20 } = validatedQuery;
      const { item_id, movement_type, start_date, end_date, staff_id } = validatedFilters;
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

      res.json({
        success: true,
        message: 'Movements retrieved successfully',
        data: result.rows,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(result.count / paginate),
          total_items: result.count,
          items_per_page: paginate,
        },
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async createMovement(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = this.validateRequest(req.body, createMovementSchema);
      const staffId = (req as any).user.id;
      const { movement_type } = validatedData;

      let result;
      if (movement_type === 'IN') {
        result = await GeneralStoreService.receiveStock(validatedData, staffId);
      } else if (movement_type === 'OUT') {
        result = await GeneralStoreService.issueStock(validatedData, staffId);
      } else {
        result = await GeneralStoreService.createMovement(validatedData, staffId);
      }

      res.status(201).json({
        success: true,
        message: result.message || 'Movement created successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getItemMovements(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { start_date, end_date } = req.query;

      const filters: any = {};
      if (start_date && end_date) {
        filters.start_date = new Date(start_date as string);
        filters.end_date = new Date(end_date as string);
      }

      const movements = await GeneralStoreService.getItemMovements(Number(itemId), filters);

      res.json({
        success: true,
        message: 'Item movements retrieved successfully',
        data: movements,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  // Request Management
  static async getRequests(req: Request, res: Response) {
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

      res.json({
        success: true,
        message: 'Requests retrieved successfully',
        data: result.rows,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(result.count / paginate),
          total_items: result.count,
          items_per_page: paginate,
        },
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getRequestById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const request = await GeneralStoreService.getRequestById(Number(id));

      res.json({
        success: true,
        message: 'Request retrieved successfully',
        data: request,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async createRequest(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = this.validateRequest(req.body, createRequestSchema);
      const staffId = (req as any).user.id;
      const request = await GeneralStoreService.createRequest(validatedData, staffId);

      res.status(201).json({
        success: true,
        message: 'Request created successfully',
        data: request,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async approveRequest(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = this.validateRequest(req.body, approveRequestSchema);
      const { id } = req.params;
      const approverId = (req as any).user.id;
      const result = await GeneralStoreService.approveRequest(
        Number(id),
        validatedData.approved_items,
        approverId
      );

      res.json({
        success: true,
        message: result.message,
        data: result.request,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async rejectRequest(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = this.validateRequest(req.body, rejectRequestSchema);
      const { id } = req.params;
      const approverId = (req as any).user.id;
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
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async fulfillRequest(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = this.validateRequest(req.body, fulfillRequestSchema);
      const { id } = req.params;
      const staffId = (req as any).user.id;
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
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getMyRequests(req: Request, res: Response) {
    try {
      // Validate query parameters
      const validatedQuery = this.validateRequest(req.query, paginationSchema);
      const { page = 1, limit = 20 } = validatedQuery;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      const result = await GeneralStoreService.getMyRequests((req as any).user.id, {
        limit: paginate,
        offset,
      });

      res.json({
        success: true,
        message: 'My requests retrieved successfully',
        data: result.rows,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(result.count / paginate),
          total_items: result.count,
          items_per_page: paginate,
        },
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getPendingApprovalRequests(req: Request, res: Response) {
    try {
      // Validate query parameters
      const validatedQuery = this.validateRequest(req.query, paginationSchema);
      const { page = 1, limit = 20 } = validatedQuery;
      const { limit: paginate, offset } = calcLimitAndOffset(Number(page), Number(limit));

      const result = await GeneralStoreService.getPendingApprovalRequests({
        limit: paginate,
        offset,
      });

      res.json({
        success: true,
        message: 'Pending approval requests retrieved successfully',
        data: result.rows,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(result.count / paginate),
          total_items: result.count,
          items_per_page: paginate,
        },
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  // Reports
  static async getStockReport(req: Request, res: Response) {
    try {
      // Validate query parameters
      const validatedFilters = this.validateRequest(req.query, itemFilterSchema);
      const { category_id, subcategory_id, status, include_zero } = validatedFilters;

      const filters: any = {};
      if (category_id) filters.category_id = Number(category_id);
      if (subcategory_id) filters.subcategory_id = Number(subcategory_id);
      if (status) filters.status = status;
      if (include_zero === 'false') {
        filters.current_stock = { [Op.gt]: 0 };
      }

      const report = await GeneralStoreService.getStockReport(filters);

      res.json({
        success: true,
        message: 'Stock report generated successfully',
        data: report,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getMovementReport(req: Request, res: Response) {
    try {
      // Validate query parameters
      const validatedFilters = this.validateRequest(req.query, movementFilterSchema);
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

      res.json({
        success: true,
        message: 'Movement report generated successfully',
        data: report,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getUsageReport(req: Request, res: Response) {
    try {
      // Validate query parameters
      const validatedFilters = this.validateRequest(req.query, reportFilterSchema);
      const { department_id, start_date, end_date } = validatedFilters;
      const staffId = (req as any).user?.id;

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

      res.json({
        success: true,
        message: 'Usage report generated successfully',
        data: report,
      });
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.id;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'getUsageReport', req);
      }

      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getCostReport(req: Request, res: Response) {
    try {
      // Validate query parameters
      const validatedFilters = this.validateRequest(req.query, reportFilterSchema);
      const { start_date, end_date, group_by, category_id, subcategory_id } = validatedFilters;
      const staffId = (req as any).user?.id;

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

      res.json({
        success: true,
        message: 'Cost report generated successfully',
        data: report,
      });
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.id;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'getCostReport', req);
      }

      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getLowStockReport(req: Request, res: Response) {
    try {
      const items = await GeneralStoreService.getLowStockItems();

      res.json({
        success: true,
        message: 'Low stock report generated successfully',
        data: {
          items,
          summary: {
            total_items: items.length,
            low_stock_count: items.length,
          },
        },
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getExpiringReport(req: Request, res: Response) {
    try {
      const { days = 30 } = req.query;
      const items = await GeneralStoreService.getExpiringItems(Number(days));

      res.json({
        success: true,
        message: 'Expiring items report generated successfully',
        data: {
          items,
          summary: {
            total_items: items.length,
            days_ahead: Number(days),
          },
        },
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  static async getAuditLogs(req: Request, res: Response) {
    try {
      const staffId = (req as any).user?.id;
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
          module: require('../../database/models/generalStoreAudit').AuditModule.REPORT,
          action: require('../../database/models/generalStoreAudit').AuditAction.VIEW,
          entityType: 'AuditLog',
          description: 'Audit logs viewed',
          request: req,
        });
      }

      res.json({
        success: true,
        message: 'Audit logs retrieved successfully',
        data: result.rows,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(result.count / paginate),
          total_items: result.count,
          items_per_page: paginate,
        },
      });
    } catch (error) {
      // Log error for audit
      const staffId = (req as any).user?.id;
      if (staffId) {
        await GeneralStoreAuditService.logSystemError(staffId, error, 'getAuditLogs', req);
      }

      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }
}
