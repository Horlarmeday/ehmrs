import { Request, Response, NextFunction } from 'express';
import { InventoryAlertRepository } from './inventoryAlert.repository';
import { InventoryAlertLog } from '../../database/models/inventoryAlertLog';
import { InventoryAlertConfiguration } from '../../database/models/inventoryAlertConfiguration';
import InventoryAlertService from '../../core/services/inventoryAlert.service';
import AlertNotificationService from '../../core/services/alertNotification.service';
import AlertEscalationService from '../../core/services/alertEscalation.service';
import AlertSchedulerService from '../../core/services/alertScheduler.service';
import { logger } from '../../core/helpers/logger';
import { validateRequest } from '../../core/helpers/requestValidation';
import { alertValidation } from './inventoryAlert.validations';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: number;
        role?: string;
        permissions?: string[];
      };
    }
  }
}

export class InventoryAlertController {
  // Get all active alerts with filtering and pagination
  public static async getActiveAlerts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      InventoryAlertController.validateRequest(req, alertValidation.getActiveAlerts);

      const {
        page = 1,
        limit = 20,
        severity,
        store_type,
        status = 'ACTIVE',
        alert_type,
      } = req.query;

      const filters = {
        page: Number(page),
        limit: Number(limit),
        severity: severity as any,
        store_type: store_type as any,
        status: status as any,
        alert_type: alert_type as any,
      };

      const alerts = await InventoryAlertRepository.getAlerts(filters);

      res.status(200).json({
        success: true,
        data: alerts.rows,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(alerts.count / Number(limit)),
          totalItems: alerts.count,
          itemsPerPage: Number(limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single alert by ID with full details
  public static async getAlertById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      InventoryAlertController.validateRequest(req, alertValidation.getAlertById);

      const { id } = req.params;

      const alert = await InventoryAlertRepository.getAlert(Number(id));
      const history = await InventoryAlertRepository.getAlertAuditTrail(Number(id));

      res.status(200).json({
        success: true,
        data: {
          alert,
          history,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Acknowledge alert
  public static async acknowledgeAlert(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      InventoryAlertController.validateRequest(req, alertValidation.acknowledgeAlert);

      const { id } = req.params;
      const { notes } = req.body;
      const staffId = req.user?.sub; // Using sub from JWT token

      if (!staffId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const alert = await InventoryAlertRepository.acknowledgeAlert(Number(id), staffId, notes);

      // Create log entry
      await InventoryAlertRepository.createAlertLog(
        InventoryAlertLog.logAlertAcknowledged(
          Number(id),
          staffId,
          notes,
          req.ip,
          req.get('User-Agent')
        )
      );

      res.status(200).json({
        success: true,
        message: 'Alert acknowledged successfully',
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }

  // Resolve alert
  public static async resolveAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      InventoryAlertController.validateRequest(req, alertValidation.resolveAlert);

      const { id } = req.params;
      const { notes } = req.body;
      const staffId = req.user?.sub;

      if (!staffId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const alert = await InventoryAlertRepository.resolveAlert(Number(id), staffId, notes);

      // Create log entry
      await InventoryAlertRepository.createAlertLog(
        InventoryAlertLog.logAlertResolved(
          Number(id),
          staffId,
          notes,
          req.ip,
          req.get('User-Agent')
        )
      );

      res.status(200).json({
        success: true,
        message: 'Alert resolved successfully',
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }

  // Dismiss alert
  public static async dismissAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      InventoryAlertController.validateRequest(req, alertValidation.dismissAlert);

      const { id } = req.params;
      const { notes } = req.body;
      const staffId = req.user?.sub;

      if (!staffId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const alert = await InventoryAlertRepository.dismissAlert(Number(id), staffId, notes);

      // Create log entry
      await InventoryAlertRepository.createAlertLog(
        InventoryAlertLog.logAlertDismissed(
          Number(id),
          staffId,
          notes,
          req.ip,
          req.get('User-Agent')
        )
      );

      res.status(200).json({
        success: true,
        message: 'Alert dismissed successfully',
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }

  // Manually escalate alert
  public static async escalateAlert(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      InventoryAlertController.validateRequest(req, alertValidation.escalateAlert);

      const { id } = req.params;
      const { roles } = req.body;
      const staffId = req.user?.sub;

      if (!staffId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const alert = await InventoryAlertRepository.escalateAlert(Number(id), roles);

      // Create log entry
      await InventoryAlertRepository.createAlertLog(
        InventoryAlertLog.logAlertEscalated(Number(id), roles, { escalated_by: staffId })
      );

      res.status(200).json({
        success: true,
        message: 'Alert escalated successfully',
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get alert dashboard summary
  public static async getDashboardSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const summary = await InventoryAlertService.generateDashboardSummary();

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get pending notifications for current user
  public static async getPendingNotifications(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const staffId = req.user?.sub;

      if (!staffId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const notificationService = AlertNotificationService.getInstance();
      const notifications = await notificationService.getPendingNotifications(staffId);

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark notification as seen
  public static async markNotificationSeen(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      InventoryAlertController.validateRequest(req, alertValidation.markNotificationSeen);

      const { id } = req.params;
      const staffId = req.user?.sub;

      if (!staffId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const notificationService = AlertNotificationService.getInstance();
      await notificationService.markNotificationSeen(Number(id), staffId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as seen',
      });
    } catch (error) {
      next(error);
    }
  }

  // Trigger manual alert checks
  public static async triggerAlertChecks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      InventoryAlertController.validateRequest(req, alertValidation.triggerAlertChecks);

      const { checkType } = req.body;
      const schedulerService = AlertSchedulerService.getInstance();

      let result;

      switch (checkType) {
        case 'stock_level':
          await schedulerService.triggerStockLevelCheck();
          result = 'Stock level check triggered';
          break;
        case 'expiry':
          await schedulerService.triggerExpiryCheck();
          result = 'Expiry check triggered';
          break;
        case 'escalation':
          await schedulerService.triggerEscalationCheck();
          result = 'Escalation check triggered';
          break;
        case 'auto_resolve':
          await schedulerService.triggerAutoResolveCheck();
          result = 'Auto-resolve check triggered';
          break;
        case 'full':
          await schedulerService.triggerFullCheck();
          result = 'Full system check triggered';
          break;
        default:
          res.status(400).json({
            success: false,
            message: 'Invalid check type',
          });
          return;
      }

      res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get alert system health status
  public static async getSystemHealth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const schedulerService = AlertSchedulerService.getInstance();
      const health = await schedulerService.getHealthStatus();

      res.status(200).json({
        success: true,
        data: health,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get alert statistics
  public static async getAlertStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { timeRange = '7d' } = req.query;

      const [dashboardSummary, notificationStats, escalationStats] = await Promise.all([
        InventoryAlertService.generateDashboardSummary(),
        AlertNotificationService.getInstance().getNotificationStats(),
        AlertEscalationService.getInstance().getEscalationStats(),
      ]);

      res.status(200).json({
        success: true,
        data: {
          summary: dashboardSummary,
          notifications: notificationStats,
          escalations: escalationStats,
          timeRange,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get alert configurations
  public static async getAlertConfigurations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const configurations = await InventoryAlertConfiguration.findAll({
        where: { is_active: true },
        order: [
          ['severity', 'DESC'],
          ['priority', 'ASC'],
        ],
      });

      res.status(200).json({
        success: true,
        data: configurations,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create alert configuration
  public static async createAlertConfiguration(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      InventoryAlertController.validateRequest(req, alertValidation.createAlertConfiguration);

      const configuration = await InventoryAlertConfiguration.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Alert configuration created successfully',
        data: configuration,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update alert configuration
  public static async updateAlertConfiguration(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      InventoryAlertController.validateRequest(req, alertValidation.updateAlertConfiguration);

      const { id } = req.params;
      const configuration = await InventoryAlertConfiguration.findByPk(id);

      if (!configuration) {
        res.status(404).json({
          success: false,
          message: 'Alert configuration not found',
        });
        return;
      }

      await configuration.update(req.body);

      res.status(200).json({
        success: true,
        message: 'Alert configuration updated successfully',
        data: configuration,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get escalation configuration
  public static async getEscalationConfiguration(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const escalationService = AlertEscalationService.getInstance();
      const config = escalationService.getEscalationConfiguration();

      res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  // Test notification system
  public static async testNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      InventoryAlertController.validateRequest(req, alertValidation.testNotifications);

      const { alertId } = req.body;

      const notificationService = AlertNotificationService.getInstance();
      const results = await notificationService.testNotifications(alertId);

      res.status(200).json({
        success: true,
        message: 'Notification test completed',
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  // Private validation helper
  private static validateRequest(req: Request, schema: any): void {
    const { error } = validateRequest(req, schema);
    if (error) {
      throw error;
    }
  }
}

export default InventoryAlertController;
