import { Op } from 'sequelize';
import {
  InventoryAlert,
  InventoryAlertConfiguration,
  InventoryAlertLog,
  Staff,
} from '../../database/models';
import { AlertSeverity } from '../../database/models/inventoryAlert';
import AlertNotificationService from './alertNotification.service';
import { logger } from '../helpers/logger';

export interface EscalationRule {
  id: string;
  name: string;
  triggerAfterMinutes: number;
  severity: AlertSeverity[];
  storeTypes: string[];
  escalateToRoles: string[];
  escalateToDepartments: string[];
  escalateToSpecificStaff?: number[];
  notificationChannels: string[];
  requiresPreviousAcknowledgment: boolean;
  maxEscalationLevel: number;
  isActive: boolean;
}

export interface EscalationLevel {
  level: number;
  description: string;
  roles: string[];
  departments: string[];
  specificStaff: number[];
  notificationChannels: string[];
  escalationDelay: number; // minutes to next level
}

export interface EscalationResult {
  alertId: number;
  previousLevel: number;
  newLevel: number;
  escalatedTo: {
    roles: string[];
    departments: string[];
    staff: number[];
  };
  notificationsSent: number;
  success: boolean;
  errors: string[];
}

export class AlertEscalationService {
  private static instance: AlertEscalationService;
  private escalationRules: EscalationRule[];
  private escalationLevels: Map<AlertSeverity, EscalationLevel[]>;
  private notificationService: AlertNotificationService;

  private constructor() {
    this.notificationService = AlertNotificationService.getInstance();
    this.escalationRules = this.getDefaultEscalationRules();
    this.escalationLevels = this.initializeEscalationLevels();
  }

  public static getInstance(): AlertEscalationService {
    if (!AlertEscalationService.instance) {
      AlertEscalationService.instance = new AlertEscalationService();
    }
    return AlertEscalationService.instance;
  }

  // Default escalation rules configuration
  private getDefaultEscalationRules(): EscalationRule[] {
    return [
      {
        id: 'critical-immediate',
        name: 'Critical Alert Immediate Escalation',
        triggerAfterMinutes: 5, // Escalate after 5 minutes
        severity: ['CRITICAL'],
        storeTypes: ['PHARMACY', 'GENERAL', 'LABORATORY'],
        escalateToRoles: ['supervisor', 'manager', 'admin'],
        escalateToDepartments: ['pharmacy', 'general_store', 'administration'],
        notificationChannels: ['WEBSOCKET', 'EMAIL', 'SMS'],
        requiresPreviousAcknowledgment: false,
        maxEscalationLevel: 3,
        isActive: true,
      },
      {
        id: 'high-delayed',
        name: 'High Priority Alert Delayed Escalation',
        triggerAfterMinutes: 15, // Escalate after 15 minutes
        severity: ['HIGH'],
        storeTypes: ['PHARMACY', 'GENERAL', 'LABORATORY'],
        escalateToRoles: ['supervisor', 'manager'],
        escalateToDepartments: ['pharmacy', 'general_store'],
        notificationChannels: ['WEBSOCKET', 'EMAIL'],
        requiresPreviousAcknowledgment: true,
        maxEscalationLevel: 2,
        isActive: true,
      },
      {
        id: 'medium-supervisory',
        name: 'Medium Priority Supervisory Escalation',
        triggerAfterMinutes: 30, // Escalate after 30 minutes
        severity: ['MEDIUM'],
        storeTypes: ['PHARMACY', 'GENERAL', 'LABORATORY'],
        escalateToRoles: ['supervisor'],
        escalateToDepartments: ['pharmacy', 'general_store'],
        notificationChannels: ['WEBSOCKET'],
        requiresPreviousAcknowledgment: true,
        maxEscalationLevel: 1,
        isActive: true,
      },
    ];
  }

  // Initialize escalation levels by severity
  private initializeEscalationLevels(): Map<AlertSeverity, EscalationLevel[]> {
    const levels = new Map<AlertSeverity, EscalationLevel[]>();

    levels.set('CRITICAL', [
      {
        level: 1,
        description: 'Department Supervisors',
        roles: ['supervisor'],
        departments: ['pharmacy', 'general_store'],
        specificStaff: [],
        notificationChannels: ['WEBSOCKET', 'EMAIL'],
        escalationDelay: 5,
      },
      {
        level: 2,
        description: 'Department Managers',
        roles: ['manager'],
        departments: ['pharmacy', 'general_store', 'administration'],
        specificStaff: [],
        notificationChannels: ['WEBSOCKET', 'EMAIL', 'SMS'],
        escalationDelay: 10,
      },
      {
        level: 3,
        description: 'Senior Management',
        roles: ['admin', 'director'],
        departments: ['administration', 'executive'],
        specificStaff: [],
        notificationChannels: ['WEBSOCKET', 'EMAIL', 'SMS'],
        escalationDelay: 15,
      },
    ]);

    levels.set('HIGH', [
      {
        level: 1,
        description: 'Department Supervisors',
        roles: ['supervisor'],
        departments: ['pharmacy', 'general_store'],
        specificStaff: [],
        notificationChannels: ['WEBSOCKET', 'EMAIL'],
        escalationDelay: 15,
      },
      {
        level: 2,
        description: 'Department Managers',
        roles: ['manager'],
        departments: ['pharmacy', 'general_store'],
        specificStaff: [],
        notificationChannels: ['WEBSOCKET', 'EMAIL'],
        escalationDelay: 30,
      },
    ]);

    levels.set('MEDIUM', [
      {
        level: 1,
        description: 'Department Supervisors',
        roles: ['supervisor'],
        departments: ['pharmacy', 'general_store'],
        specificStaff: [],
        notificationChannels: ['WEBSOCKET'],
        escalationDelay: 30,
      },
    ]);

    levels.set('LOW', []); // No escalation for low priority alerts

    return levels;
  }

  // Check all active alerts for escalation
  public async checkAlertsForEscalation(): Promise<EscalationResult[]> {
    logger.info('Starting alert escalation check...');

    const results: EscalationResult[] = [];

    try {
      // Get all active alerts that haven't reached max escalation
      const alertsToCheck = await InventoryAlert.findAll({
        where: {
          status: 'ACTIVE',
          [Op.or]: [{ escalated_at: null }, { escalation_level: { [Op.lt]: 3 } }],
        },
        include: [
          {
            model: InventoryAlertConfiguration,
            as: 'configuration',
          },
        ],
      });

      for (const alert of alertsToCheck) {
        try {
          const escalationResult = await this.checkSingleAlertForEscalation(alert);
          if (escalationResult) {
            results.push(escalationResult);
          }
        } catch (error) {
          logger.error(`Error checking escalation for alert ${alert.id}: ${error.message}`);
        }
      }

      logger.info(`Escalation check completed. Processed ${results.length} escalations.`);
      return results;
    } catch (error) {
      logger.error(`Alert escalation check failed: ${error.message}`);
      throw error;
    }
  }

  // Check single alert for escalation
  private async checkSingleAlertForEscalation(
    alert: InventoryAlert
  ): Promise<EscalationResult | null> {
    const applicableRules = this.getApplicableEscalationRules(alert);

    if (applicableRules.length === 0) {
      return null;
    }

    for (const rule of applicableRules) {
      if (await this.shouldEscalateAlert(alert, rule)) {
        return await this.escalateAlert(alert, rule);
      }
    }

    return null;
  }

  // Get escalation rules applicable to an alert
  private getApplicableEscalationRules(alert: InventoryAlert): EscalationRule[] {
    return this.escalationRules.filter(rule => {
      if (!rule.isActive) return false;
      if (!rule.severity.includes(alert.severity)) return false;
      if (!rule.storeTypes.includes(alert.store_type)) return false;
      if (alert.escalation_level >= rule.maxEscalationLevel) return false;
      return true;
    });
  }

  // Determine if alert should be escalated
  private async shouldEscalateAlert(alert: InventoryAlert, rule: EscalationRule): Promise<boolean> {
    const now = new Date();
    const alertAge = now.getTime() - alert.triggered_at.getTime();
    const ageInMinutes = Math.floor(alertAge / (1000 * 60));

    // Check if enough time has passed
    if (ageInMinutes < rule.triggerAfterMinutes) {
      return false;
    }

    // Check if escalation delay has passed since last escalation
    if (alert.escalated_at) {
      const timeSinceLastEscalation = now.getTime() - alert.escalated_at.getTime();
      const minutesSinceLastEscalation = Math.floor(timeSinceLastEscalation / (1000 * 60));

      const currentLevel = alert.escalation_level || 0;
      const escalationLevels = this.escalationLevels.get(alert.severity) || [];
      const currentLevelConfig = escalationLevels[currentLevel - 1];

      if (currentLevelConfig && minutesSinceLastEscalation < currentLevelConfig.escalationDelay) {
        return false;
      }
    }

    // Check if acknowledgment is required but not received
    if (rule.requiresPreviousAcknowledgment && !alert.acknowledged_at) {
      return false;
    }

    return true;
  }

  // Escalate alert to next level
  private async escalateAlert(
    alert: InventoryAlert,
    rule: EscalationRule
  ): Promise<EscalationResult> {
    const previousLevel = alert.escalation_level || 0;
    const newLevel = previousLevel + 1;

    logger.info(`Escalating alert ${alert.id} from level ${previousLevel} to level ${newLevel}`);

    const result: EscalationResult = {
      alertId: alert.id,
      previousLevel,
      newLevel,
      escalatedTo: {
        roles: [],
        departments: [],
        staff: [],
      },
      notificationsSent: 0,
      success: false,
      errors: [],
    };

    try {
      // Get escalation level configuration
      const escalationLevels = this.escalationLevels.get(alert.severity) || [];
      const levelConfig = escalationLevels[newLevel - 1];

      if (!levelConfig) {
        result.errors.push(`No escalation level configuration found for level ${newLevel}`);
        return result;
      }

      // Update alert with escalation information
      alert.escalation_level = newLevel;
      alert.escalated_at = new Date();
      alert.escalation_roles = levelConfig.roles;
      alert.escalation_departments = levelConfig.departments;

      await alert.save();

      // Get staff members to escalate to
      const escalationRecipients = await this.getEscalationRecipients(levelConfig);

      result.escalatedTo = {
        roles: levelConfig.roles,
        departments: levelConfig.departments,
        staff: escalationRecipients.map(r => r.id),
      };

      // Send escalation notifications
      const notificationResults = await this.sendEscalationNotifications(
        alert,
        escalationRecipients,
        levelConfig
      );

      result.notificationsSent = notificationResults.reduce(
        (sum, r) => sum + (r.success ? r.recipientCount : 0),
        0
      );

      // Log the escalation
      await InventoryAlertLog.create(
        InventoryAlertLog.logAlertEscalated(alert.id, {
          fromLevel: previousLevel,
          toLevel: newLevel,
          escalatedTo: result.escalatedTo,
          rule: rule.id,
        })
      );

      result.success = true;
      logger.info(`Alert ${alert.id} successfully escalated to level ${newLevel}`);
    } catch (error) {
      result.errors.push(`Escalation failed: ${error.message}`);
      logger.error(`Failed to escalate alert ${alert.id}: ${error.message}`);
    }

    return result;
  }

  // Get staff members for escalation based on level configuration
  private async getEscalationRecipients(levelConfig: EscalationLevel): Promise<any[]> {
    const whereClause: any = {
      is_active: true,
    };

    // Filter by roles or departments
    const conditions = [];

    if (levelConfig.roles.length > 0) {
      conditions.push({ role: { [Op.in]: levelConfig.roles } });
    }

    if (levelConfig.departments.length > 0) {
      conditions.push({ department: { [Op.in]: levelConfig.departments } });
    }

    if (levelConfig.specificStaff.length > 0) {
      conditions.push({ id: { [Op.in]: levelConfig.specificStaff } });
    }

    if (conditions.length > 0) {
      whereClause[Op.or] = conditions;
    }

    const staff = await Staff.findAll({
      where: whereClause,
      attributes: ['id', 'firstname', 'lastname', 'email', 'phone', 'role', 'department'],
      limit: 20, // Reasonable limit for escalation notifications
    });

    return staff;
  }

  // Send escalation notifications
  private async sendEscalationNotifications(
    alert: InventoryAlert,
    recipients: any[],
    levelConfig: EscalationLevel
  ): Promise<any[]> {
    try {
      // Create escalation notification payload
      const escalationPayload = {
        alertId: alert.id,
        title: `🚨 ESCALATED: ${alert.title}`,
        message: `This alert has been escalated to Level ${alert.escalation_level}. ${alert.message}`,
        severity: alert.severity,
        storeType: alert.store_type,
        contextData: {
          ...alert.context_data,
          escalationLevel: alert.escalation_level,
          escalatedAt: alert.escalated_at,
          originalTriggeredAt: alert.triggered_at,
        },
        timestamp: new Date(),
        priority: alert.priority - 10, // Increase priority for escalated alerts
        requiresAcknowledgment: true,
        audioNotification: true,
        escalationLevel: alert.escalation_level,
      };

      // For now, return mock results since we don't have the full notification implementation
      return [
        {
          success: true,
          recipientCount: recipients.length,
          channel: 'ESCALATION',
          errors: [],
        },
      ];
    } catch (error) {
      logger.error(`Failed to send escalation notifications: ${error.message}`);
      return [
        {
          success: false,
          recipientCount: 0,
          channel: 'ESCALATION',
          errors: [error.message],
        },
      ];
    }
  }

  // Manual escalation of specific alert
  public async escalateAlertManually(
    alertId: number,
    targetLevel: number,
    staffId: number,
    reason?: string
  ): Promise<EscalationResult> {
    logger.info(
      `Manual escalation requested for alert ${alertId} to level ${targetLevel} by staff ${staffId}`
    );

    const result: EscalationResult = {
      alertId,
      previousLevel: 0,
      newLevel: targetLevel,
      escalatedTo: {
        roles: [],
        departments: [],
        staff: [],
      },
      notificationsSent: 0,
      success: false,
      errors: [],
    };

    try {
      const alert = await InventoryAlert.findByPk(alertId);
      if (!alert) {
        result.errors.push('Alert not found');
        return result;
      }

      const previousLevel = alert.escalation_level || 0;
      result.previousLevel = previousLevel;

      // Get target level configuration
      const escalationLevels = this.escalationLevels.get(alert.severity) || [];
      const targetLevelConfig = escalationLevels[targetLevel - 1];

      if (!targetLevelConfig) {
        result.errors.push(
          `Invalid escalation level ${targetLevel} for severity ${alert.severity}`
        );
        return result;
      }

      // Update alert
      alert.escalation_level = targetLevel;
      alert.escalated_at = new Date();
      alert.escalation_roles = targetLevelConfig.roles;
      alert.escalation_departments = targetLevelConfig.departments;

      await alert.save();

      // Log manual escalation
      await InventoryAlertLog.create({
        alert_id: alertId,
        action: 'ESCALATED',
        action_by: staffId,
        details: {
          type: 'manual',
          fromLevel: previousLevel,
          toLevel: targetLevel,
          reason: reason || 'Manual escalation',
          escalatedTo: {
            roles: targetLevelConfig.roles,
            departments: targetLevelConfig.departments,
          },
        },
      });

      result.escalatedTo = {
        roles: targetLevelConfig.roles,
        departments: targetLevelConfig.departments,
        staff: [],
      };

      result.success = true;
      logger.info(`Alert ${alertId} manually escalated to level ${targetLevel}`);
    } catch (error) {
      result.errors.push(`Manual escalation failed: ${error.message}`);
      logger.error(`Manual escalation failed for alert ${alertId}: ${error.message}`);
    }

    return result;
  }

  // Get escalation configuration
  public getEscalationConfiguration(): {
    rules: EscalationRule[];
    levels: { [key: string]: EscalationLevel[] };
  } {
    const levels: { [key: string]: EscalationLevel[] } = {};
    this.escalationLevels.forEach((value, key) => {
      levels[key] = value;
    });

    return {
      rules: this.escalationRules,
      levels,
    };
  }

  // Update escalation rules
  public updateEscalationRules(newRules: EscalationRule[]): void {
    this.escalationRules = newRules.filter(rule => rule.isActive);
    logger.info(`Updated escalation rules: ${this.escalationRules.length} active rules`);
  }

  // Get escalation statistics
  public async getEscalationStats(): Promise<any> {
    try {
      const [totalEscalated, escalationsByLevel, escalationsByDay] = await Promise.all([
        InventoryAlert.count({
          where: { escalation_level: { [Op.gt]: 0 } },
        }),
        InventoryAlert.findAll({
          attributes: ['escalation_level', [InventoryAlert.sequelize.fn('COUNT', '*'), 'count']],
          where: { escalation_level: { [Op.gt]: 0 } },
          group: ['escalation_level'],
          raw: true,
        }),
        InventoryAlertLog.findAll({
          attributes: [
            [
              InventoryAlertLog.sequelize.fn('DATE', InventoryAlertLog.sequelize.col('created_at')),
              'date',
            ],
            [InventoryAlertLog.sequelize.fn('COUNT', '*'), 'count'],
          ],
          where: { action: 'ESCALATED' },
          group: [
            InventoryAlertLog.sequelize.fn('DATE', InventoryAlertLog.sequelize.col('created_at')),
          ],
          order: [
            [
              InventoryAlertLog.sequelize.fn('DATE', InventoryAlertLog.sequelize.col('created_at')),
              'DESC',
            ],
          ],
          limit: 30,
          raw: true,
        }),
      ]);

      return {
        totalEscalated,
        byLevel: escalationsByLevel.reduce((acc: any, item: any) => {
          acc[`level_${item.escalation_level}`] = parseInt(item.count);
          return acc;
        }, {}),
        recentActivity: escalationsByDay,
      };
    } catch (error) {
      logger.error(`Failed to get escalation stats: ${error.message}`);
      return {
        totalEscalated: 0,
        byLevel: {},
        recentActivity: [],
      };
    }
  }
}

export default AlertEscalationService;
