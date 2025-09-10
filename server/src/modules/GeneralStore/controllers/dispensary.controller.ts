import { Request, Response, NextFunction } from 'express';
import { DispensaryManagementService } from '../services/dispensaryManagement.service';
import { WorkflowManagementService } from '../services/workflowManagement.service';
import { UniversalInventoryService } from '../../../core/services/universalInventory.service';
import { BadException } from '../../../common/util/api-error';
import { successResponse } from '../../../common/responses/success-responses';
import { calcLimitAndOffset } from '../../../core/helpers/helper';
import { AuditAction, AuditModule } from '../../../database/models/generalStoreAudit';
import { GeneralStoreAuditService } from '../audit.service';
import Joi from 'joi';

export class DispensaryController {
  // Validation schemas
  private static createDispensarySchema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(255)
      .required(),
    department_id: Joi.number()
      .integer()
      .optional(),
    location: Joi.string()
      .max(255)
      .optional(),
    accepted_item_types: Joi.string()
      .valid('medical_supplies', 'consumables', 'equipment', 'laboratory', 'all')
      .required(),
    funding_source: Joi.string()
      .valid('hospital', 'donor', 'research', 'department_budget')
      .required(),
    manager_staff_id: Joi.number()
      .integer()
      .optional(),
    minimum_stock_level: Joi.number()
      .integer()
      .min(0)
      .optional(),
    maximum_stock_level: Joi.number()
      .integer()
      .min(1)
      .optional(),
    auto_replenish: Joi.boolean().optional(),
    notes: Joi.string().optional(),
  });

  private static updateDispensarySchema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(255)
      .optional(),
    department_id: Joi.number()
      .integer()
      .optional(),
    location: Joi.string()
      .max(255)
      .optional(),
    accepted_item_types: Joi.string()
      .valid('medical_supplies', 'consumables', 'equipment', 'laboratory', 'all')
      .optional(),
    funding_source: Joi.string()
      .valid('hospital', 'donor', 'research', 'department_budget')
      .optional(),
    manager_staff_id: Joi.number()
      .integer()
      .optional(),
    minimum_stock_level: Joi.number()
      .integer()
      .min(0)
      .optional(),
    maximum_stock_level: Joi.number()
      .integer()
      .min(1)
      .optional(),
    auto_replenish: Joi.boolean().optional(),
    status: Joi.string()
      .valid('active', 'inactive')
      .optional(),
    notes: Joi.string().optional(),
  });

  private static createRequestSchema = Joi.object({
    dispensary_id: Joi.number()
      .integer()
      .required(),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'emergency')
      .required(),
    reason: Joi.string().optional(),
    items: Joi.array()
      .items(
        Joi.object({
          item_id: Joi.number()
            .integer()
            .required(),
          quantity_requested: Joi.number()
            .integer()
            .min(1)
            .required(),
          urgency: Joi.string()
            .valid('low', 'medium', 'high', 'emergency')
            .required(),
          notes: Joi.string().optional(),
        })
      )
      .min(1)
      .required(),
  });

  private static approveRequestSchema = Joi.object({
    approval_status: Joi.string()
      .valid('approved', 'rejected', 'partial')
      .required(),
    approval_notes: Joi.string().optional(),
    approved_items: Joi.array()
      .items(
        Joi.object({
          item_id: Joi.number()
            .integer()
            .required(),
          quantity_approved: Joi.number()
            .integer()
            .min(0)
            .required(),
          source_dispensary_id: Joi.number()
            .integer()
            .optional(),
          alternative_item_id: Joi.number()
            .integer()
            .optional(),
          notes: Joi.string().optional(),
        })
      )
      .when('approval_status', {
        is: Joi.valid('approved', 'partial'),
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .min(0),
  });

  private static transferSchema = Joi.object({
    from_store_type: Joi.string()
      .valid('pharmacy', 'general', 'laboratory')
      .required(),
    from_store_id: Joi.number()
      .integer()
      .required(),
    to_dispensary_id: Joi.number()
      .integer()
      .required(),
    item_id: Joi.number()
      .integer()
      .required(),
    quantity: Joi.number()
      .integer()
      .min(1)
      .required(),
    reason: Joi.string().required(),
    batch_number: Joi.string().optional(),
    expiration_date: Joi.date().optional(),
    unit_cost: Joi.number()
      .min(0)
      .optional(),
  });

  private static dispenseSchema = Joi.object({
    dispensary_id: Joi.number()
      .integer()
      .required(),
    item_id: Joi.number()
      .integer()
      .required(),
    quantity: Joi.number()
      .integer()
      .min(1)
      .required(),
    reason: Joi.string().required(),
    patient_id: Joi.number()
      .integer()
      .optional(),
    visit_id: Joi.number()
      .integer()
      .optional(),
    batch_number: Joi.string().optional(),
  });

  // Validation helper
  private static validateRequest(data: any, schema: Joi.Schema): any {
    const { error, value } = schema.validate(data);
    if (error) {
      throw new BadException('Validation Error', 400, error.details[0].message);
    }
    return value;
  }

  /**
   * Create new dispensary
   */
  static async createDispensary(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = DispensaryController.validateRequest(
        req.body,
        DispensaryController.createDispensarySchema
      );
      const staffId = (req as any).user.id;

      const dispensary = await DispensaryManagementService.createDispensary(validatedData, staffId);

      // Log audit
      await GeneralStoreAuditService.logAuditEvent({
        staffId: staffId,
        module: AuditModule.SYSTEM,
        action: AuditAction.CREATE,
        entityType: 'dispensary',
        entityId: dispensary.id,
        description: `Created dispensary: ${dispensary.name}`,
        request: req,
      });

      return successResponse({
        res,
        httpCode: 201,
        message: 'Dispensary created successfully',
        data: dispensary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all dispensaries
   */
  static async getAllDispensaries(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        department_id: req.query.department_id ? Number(req.query.department_id) : undefined,
        accepted_item_types: req.query.accepted_item_types as string,
        status: req.query.status as string,
        manager_staff_id: req.query.manager_staff_id
          ? Number(req.query.manager_staff_id)
          : undefined,
        include_inactive: req.query.include_inactive === 'true',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await DispensaryManagementService.getAllDispensaries(filters);

      return successResponse({
        res,
        httpCode: 200,
        message: 'Dispensaries retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dispensary by ID
   */
  static async getDispensaryById(req: Request, res: Response, next: NextFunction) {
    try {
      const dispensaryId = Number(req.params.id);
      if (!dispensaryId) {
        throw new BadException('Invalid ID', 400, 'Dispensary ID is required');
      }

      const dispensary = await DispensaryManagementService.getDispensaryById(dispensaryId);

      return successResponse({
        res,
        httpCode: 200,
        message: 'Dispensary retrieved successfully',
        data: dispensary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update dispensary
   */
  static async updateDispensary(req: Request, res: Response, next: NextFunction) {
    try {
      const dispensaryId = Number(req.params.id);
      if (!dispensaryId) {
        throw new BadException('Invalid ID', 400, 'Dispensary ID is required');
      }

      const validatedData = DispensaryController.validateRequest(
        req.body,
        DispensaryController.updateDispensarySchema
      );
      const staffId = (req as any).user.id;

      const dispensary = await DispensaryManagementService.updateDispensary(
        dispensaryId,
        validatedData,
        staffId
      );

      // Log audit
      await GeneralStoreAuditService.logAuditEvent({
        staffId: staffId,
        module: AuditModule.SYSTEM,
        action: AuditAction.UPDATE,
        entityType: 'dispensary',
        entityId: dispensaryId,
        description: `Updated dispensary: ${dispensary.name}`,
        request: req,
      });

      return successResponse({
        res,
        httpCode: 200,
        message: 'Dispensary updated successfully',
        data: dispensary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dispensary stock summary
   */
  static async getDispensaryStock(req: Request, res: Response, next: NextFunction) {
    try {
      const dispensaryId = Number(req.params.id);
      if (!dispensaryId) {
        throw new BadException('Invalid ID', 400, 'Dispensary ID is required');
      }

      const summary = await DispensaryManagementService.getDispensaryStockSummary(dispensaryId);

      return successResponse({
        res,
        httpCode: 200,
        message: 'Dispensary stock retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Transfer items to dispensary
   */
  static async transferToDispensary(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = DispensaryController.validateRequest(
        req.body,
        DispensaryController.transferSchema
      );
      const staffId = (req as any).user.id;

      const result = await UniversalInventoryService.transferToDispensary({
        ...validatedData,
        staff_id: staffId,
      });

      // Log audit
      await GeneralStoreAuditService.logAuditEvent({
        staffId: staffId,
        module: AuditModule.MOVEMENT,
        action: AuditAction.STOCK_TRANSFER,
        entityType: 'dispensary_item',
        entityId: result.id,
        description: `Transferred ${validatedData.quantity} units of item ${validatedData.item_id} to dispensary ${validatedData.to_dispensary_id}`,
        request: req,
      });

      return successResponse({
        res,
        httpCode: 200,
        message: 'Items transferred successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dispense items from dispensary
   */
  static async dispenseFromDispensary(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = DispensaryController.validateRequest(
        req.body,
        DispensaryController.dispenseSchema
      );
      const staffId = (req as any).user.id;

      const result = await UniversalInventoryService.dispenseFromDispensary({
        ...validatedData,
        staff_id: staffId,
      });

      // Log audit
      await GeneralStoreAuditService.logAuditEvent({
        staffId: staffId,
        module: AuditModule.MOVEMENT,
        action: AuditAction.STOCK_OUT,
        entityType: 'dispensary_item',
        entityId: result.id,
        description: `Dispensed ${validatedData.quantity} units of item ${validatedData.item_id} from dispensary ${validatedData.dispensary_id}`,
        request: req,
      });

      return successResponse({
        res,
        httpCode: 200,
        message: 'Items dispensed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create dispensary request
   */
  static async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = DispensaryController.validateRequest(
        req.body,
        DispensaryController.createRequestSchema
      );
      const staffId = (req as any).user.id;

      const request = await DispensaryManagementService.createDispensaryRequest({
        ...validatedData,
        requesting_staff_id: staffId,
      });

      // Log audit
      await GeneralStoreAuditService.logAuditEvent({
        staffId: staffId,
        module: AuditModule.REQUEST,
        action: AuditAction.CREATE,
        entityType: 'dispensary_request',
        entityId: request.id,
        description: `Created dispensary request with ${validatedData.items.length} items`,
        request: req,
      });

      return successResponse({
        res,
        httpCode: 201,
        message: 'Dispensary request created successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending requests
   */
  static async getPendingRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        dispensary_id: req.query.dispensary_id ? Number(req.query.dispensary_id) : undefined,
        requesting_staff_id: req.query.requesting_staff_id
          ? Number(req.query.requesting_staff_id)
          : undefined,
        priority: req.query.priority as string,
        date_from: req.query.date_from ? new Date(req.query.date_from as string) : undefined,
        date_to: req.query.date_to ? new Date(req.query.date_to as string) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await WorkflowManagementService.getPendingRequests(filters);

      return successResponse({
        res,
        httpCode: 200,
        message: 'Pending requests retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve dispensary request
   */
  static async approveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = Number(req.params.id);
      if (!requestId) {
        throw new BadException('Invalid ID', 400, 'Request ID is required');
      }

      const validatedData = DispensaryController.validateRequest(
        req.body,
        DispensaryController.approveRequestSchema
      );
      const staffId = (req as any).user.id;

      const request = await WorkflowManagementService.approveDispensaryRequest({
        request_id: requestId,
        approver_id: staffId,
        ...validatedData,
      });

      // Log audit
      await GeneralStoreAuditService.logAuditEvent({
        staffId: staffId,
        module: AuditModule.REQUEST,
        action: AuditAction.APPROVE,
        entityType: 'dispensary_request',
        entityId: requestId,
        description: `${validatedData.approval_status} dispensary request`,
        request: req,
      });

      return successResponse({
        res,
        httpCode: 200,
        message: 'Request processed successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get request history
   */
  static async getRequestHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as any,
        dispensary_id: req.query.dispensary_id ? Number(req.query.dispensary_id) : undefined,
        requesting_staff_id: req.query.requesting_staff_id
          ? Number(req.query.requesting_staff_id)
          : undefined,
        date_from: req.query.date_from ? new Date(req.query.date_from as string) : undefined,
        date_to: req.query.date_to ? new Date(req.query.date_to as string) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await WorkflowManagementService.getRequestHistory(filters);

      return successResponse({
        res,
        httpCode: 200,
        message: 'Request history retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dispensary metrics
   */
  static async getDispensaryMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const dispensaryId = Number(req.params.id);
      if (!dispensaryId) {
        throw new BadException('Invalid ID', 400, 'Dispensary ID is required');
      }

      const dateRange =
        req.query.start_date && req.query.end_date
          ? {
              start: new Date(req.query.start_date as string),
              end: new Date(req.query.end_date as string),
            }
          : undefined;

      const metrics = await DispensaryManagementService.getDispensaryMetrics(
        dispensaryId,
        dateRange
      );

      return successResponse({
        res,
        httpCode: 200,
        message: 'Dispensary metrics retrieved successfully',
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get workflow metrics
   */
  static async getWorkflowMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const dateRange =
        req.query.start_date && req.query.end_date
          ? {
              start: new Date(req.query.start_date as string),
              end: new Date(req.query.end_date as string),
            }
          : undefined;

      const metrics = await WorkflowManagementService.getWorkflowMetrics(dateRange);

      return successResponse({
        res,
        httpCode: 200,
        message: 'Workflow metrics retrieved successfully',
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Auto-replenish dispensaries
   */
  static async autoReplenish(req: Request, res: Response, next: NextFunction) {
    try {
      const staffId = (req as any).user.id;

      await DispensaryManagementService.autoReplenishDispensaries();

      // Log audit
      await GeneralStoreAuditService.logAuditEvent({
        staffId: staffId,
        module: AuditModule.SYSTEM,
        action: AuditAction.VIEW,
        entityType: 'auto_replenishment',
        description: 'Triggered auto-replenishment process',
        request: req,
      });

      return successResponse({
        res,
        httpCode: 200,
        message: 'Auto-replenishment process completed successfully',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cross-store report
   */
  static async getCrossStoreReport(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        start_date: new Date(req.query.start_date as string),
        end_date: new Date(req.query.end_date as string),
        store_types: req.query.store_types
          ? (req.query.store_types as string).split(',')
          : undefined,
        dispensary_ids: req.query.dispensary_ids
          ? (req.query.dispensary_ids as string).split(',').map(Number)
          : undefined,
        item_ids: req.query.item_ids
          ? (req.query.item_ids as string).split(',').map(Number)
          : undefined,
        include_movements: req.query.include_movements === 'true',
      };

      const report = await UniversalInventoryService.generateCrossStoreReport(filters);

      return successResponse({
        res,
        httpCode: 200,
        message: 'Cross-store report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dispensary stock summary (alias for backward compatibility)
   */
  static async getStockSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const dispensaryId = Number(req.params.id);
      const summary = await UniversalInventoryService.getDispensaryStockSummary(dispensaryId);

      return successResponse({
        res,
        httpCode: 200,
        message: 'Stock summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}
