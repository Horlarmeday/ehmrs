import { Op, col } from 'sequelize';
import {
  InventoryAlert,
  InventoryAlertConfiguration,
  InventoryAlertLog,
  InventoryItem,
  GeneralStoreItem,
  PharmacyStore,
} from '../../database/models';
import { GeneralStoreDispensaryItem } from '../../database/models/generalStore/generalStoreDispensaryItem';
import {
  AlertType,
  AlertSeverity,
  AlertStatus,
  StoreType,
} from '../../database/models/inventoryAlert';

export interface AlertTriggerData {
  itemId?: number;
  pharmacyItemId?: number;
  dispensaryId?: number;
  currentStock: number;
  minimumStock?: number;
  expiryDate?: Date;
  itemName: string;
  storeType: StoreType;
  departmentId?: number;
  categoryId?: number;
}

export interface AlertGenerationResult {
  alertsCreated: number;
  alertsSkipped: number;
  errors: string[];
  alerts: InventoryAlert[];
}

export class InventoryAlertService {
  // Main alert generation method
  public static async generateAlertsForItem(
    triggerData: AlertTriggerData
  ): Promise<AlertGenerationResult> {
    const result: AlertGenerationResult = {
      alertsCreated: 0,
      alertsSkipped: 0,
      errors: [],
      alerts: [],
    };

    try {
      // Get all active configurations that match this item
      const configurations = await this.getMatchingConfigurations(triggerData);

      for (const config of configurations) {
        try {
          // Check if this configuration should trigger an alert
          const shouldTrigger = this.shouldTriggerAlert(config, triggerData);

          if (!shouldTrigger) {
            result.alertsSkipped++;
            continue;
          }

          // Check if similar alert already exists
          const existingAlert = await this.findExistingAlert(config.id, triggerData);
          if (existingAlert) {
            result.alertsSkipped++;
            continue;
          }

          // Create the alert
          const alert = await this.createAlert(config, triggerData);
          result.alerts.push(alert);
          result.alertsCreated++;

          // Log the alert creation
          await InventoryAlertLog.create(InventoryAlertLog.logAlertCreated(alert.id, triggerData));
        } catch (error) {
          result.errors.push(`Failed to process config ${config.id}: ${error.message}`);
        }
      }
    } catch (error) {
      result.errors.push(`Alert generation failed: ${error.message}`);
    }

    return result;
  }

  // Get configurations that match the item criteria
  private static async getMatchingConfigurations(
    triggerData: AlertTriggerData
  ): Promise<InventoryAlertConfiguration[]> {
    const whereClause: any = {
      is_active: true,
      [Op.or]: [{ store_type: triggerData.storeType }, { store_type: 'ALL' }],
    };

    // Add optional filters
    if (triggerData.departmentId) {
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push({
        [Op.or]: [{ department_id: triggerData.departmentId }, { department_id: null }],
      });
    }

    if (triggerData.categoryId) {
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push({
        [Op.or]: [{ category_id: triggerData.categoryId }, { category_id: null }],
      });
    }

    return await InventoryAlertConfiguration.findAll({
      where: whereClause,
      order: [
        ['severity', 'DESC'],
        ['priority', 'ASC'],
      ],
    });
  }

  // Determine if alert should be triggered based on configuration and data
  private static shouldTriggerAlert(
    config: InventoryAlertConfiguration,
    triggerData: AlertTriggerData
  ): boolean {
    // Basic item matching
    if (!config.shouldTriggerForItem(triggerData)) {
      return false;
    }

    switch (config.alert_type) {
      case 'STOCK_LEVEL':
        return config.checkStockLevelTrigger(triggerData.currentStock, triggerData.minimumStock);

      case 'EXPIRY':
        return triggerData.expiryDate ? config.checkExpiryTrigger(triggerData.expiryDate) : false;

      case 'PROCUREMENT':
        // Procurement alerts trigger when stock is at or below threshold
        return config.checkStockLevelTrigger(triggerData.currentStock, triggerData.minimumStock);

      case 'CRITICAL':
        // Critical alerts can be triggered by multiple conditions
        return this.checkCriticalConditions(config, triggerData);

      case 'FINANCIAL':
        // Financial alerts for high-value items with low stock
        return this.checkFinancialConditions(config, triggerData);

      default:
        return false;
    }
  }

  // Check for critical alert conditions
  private static checkCriticalConditions(
    config: InventoryAlertConfiguration,
    triggerData: AlertTriggerData
  ): boolean {
    // Critical if stock is zero
    if (triggerData.currentStock === 0) {
      return true;
    }

    // Critical if expiry is within 24 hours
    if (triggerData.expiryDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (triggerData.expiryDate <= tomorrow) {
        return true;
      }
    }

    return false;
  }

  // Check for financial alert conditions
  private static checkFinancialConditions(
    config: InventoryAlertConfiguration,
    triggerData: AlertTriggerData
  ): boolean {
    // Placeholder for financial condition logic
    // This could check item value, cost implications, etc.
    return config.checkStockLevelTrigger(triggerData.currentStock, triggerData.minimumStock);
  }

  // Check if similar alert already exists
  private static async findExistingAlert(
    configurationId: number,
    triggerData: AlertTriggerData
  ): Promise<InventoryAlert | null> {
    const whereClause: any = {
      configuration_id: configurationId,
      status: 'ACTIVE',
      store_type: triggerData.storeType,
    };

    if (triggerData.itemId) {
      whereClause.item_id = triggerData.itemId;
    }

    if (triggerData.pharmacyItemId) {
      whereClause.pharmacy_item_id = triggerData.pharmacyItemId;
    }

    if (triggerData.dispensaryId) {
      whereClause.dispensary_id = triggerData.dispensaryId;
    }

    return await InventoryAlert.findOne({ where: whereClause });
  }

  // Create alert from configuration and trigger data
  private static async createAlert(
    config: InventoryAlertConfiguration,
    triggerData: AlertTriggerData
  ): Promise<InventoryAlert> {
    const alertData = {
      configuration_id: config.id,
      alert_type: config.alert_type,
      severity: config.severity,
      store_type: triggerData.storeType,
      item_id: triggerData.itemId,
      pharmacy_item_id: triggerData.pharmacyItemId,
      dispensary_id: triggerData.dispensaryId,
      title: config.generateAlertTitle(triggerData),
      message: config.generateAlertMessage(triggerData, {
        currentStock: triggerData.currentStock,
        minimumStock: triggerData.minimumStock,
        expiryDate: triggerData.expiryDate,
      }),
      context_data: {
        ...triggerData,
        configurationName: config.name,
      },
      trigger_value: this.getTriggerValue(config, triggerData),
      threshold_value: this.getThresholdValue(config),
      priority: config.getPriorityScore(),
      status: 'ACTIVE' as AlertStatus,
      auto_resolve_enabled: this.shouldAutoResolve(config),
      expires_at: this.calculateExpiration(config),
      triggered_at: new Date(),
    };

    return await InventoryAlert.create(alertData);
  }

  // Get the value that triggered the alert
  private static getTriggerValue(
    config: InventoryAlertConfiguration,
    triggerData: AlertTriggerData
  ): number | null {
    switch (config.alert_type) {
      case 'STOCK_LEVEL':
      case 'PROCUREMENT':
        return triggerData.currentStock;

      case 'EXPIRY':
        if (triggerData.expiryDate) {
          const daysToExpiry = Math.ceil(
            (triggerData.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysToExpiry;
        }
        return null;

      default:
        return triggerData.currentStock;
    }
  }

  // Get the threshold value from configuration
  private static getThresholdValue(config: InventoryAlertConfiguration): number | null {
    if (config.alert_type === 'STOCK_LEVEL' || config.alert_type === 'PROCUREMENT') {
      return config.stock_threshold_value || null;
    }

    if (config.alert_type === 'EXPIRY') {
      return config.expiry_days_warning || null;
    }

    return null;
  }

  // Determine if alert should auto-resolve
  private static shouldAutoResolve(config: InventoryAlertConfiguration): boolean {
    // Stock level alerts can auto-resolve when restocked
    if (config.alert_type === 'STOCK_LEVEL') {
      return true;
    }

    // Expiry alerts should not auto-resolve (require manual action)
    if (config.alert_type === 'EXPIRY') {
      return false;
    }

    return false;
  }

  // Calculate when alert should expire (if applicable)
  private static calculateExpiration(config: InventoryAlertConfiguration): Date | null {
    // Most alerts don't expire automatically
    if (config.alert_type === 'EXPIRY' && config.severity === 'LOW') {
      // Low priority expiry alerts expire after 7 days
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 7);
      return expiration;
    }

    return null;
  }

  // Public methods for alert management

  public static async acknowledgeAlert(
    alertId: number,
    staffId: number,
    notes?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<InventoryAlert> {
    const alert = await InventoryAlert.findByPk(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.acknowledge(staffId, notes);
    await alert.save();

    // Log the acknowledgment
    await InventoryAlertLog.create(
      InventoryAlertLog.logAlertAcknowledged(alertId, staffId, notes, ipAddress, userAgent)
    );

    return alert;
  }

  public static async resolveAlert(
    alertId: number,
    staffId: number,
    notes?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<InventoryAlert> {
    const alert = await InventoryAlert.findByPk(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.resolve(staffId, notes);
    await alert.save();

    // Log the resolution
    await InventoryAlertLog.create(
      InventoryAlertLog.logAlertResolved(alertId, staffId, notes, ipAddress, userAgent)
    );

    return alert;
  }

  public static async dismissAlert(
    alertId: number,
    staffId: number,
    notes?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<InventoryAlert> {
    const alert = await InventoryAlert.findByPk(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.dismiss(staffId, notes);
    await alert.save();

    // Log the dismissal
    await InventoryAlertLog.create(
      InventoryAlertLog.logAlertDismissed(alertId, staffId, notes, ipAddress, userAgent)
    );

    return alert;
  }

  public static async getActiveAlerts(
    storeType?: StoreType,
    severity?: AlertSeverity,
    limit?: number
  ): Promise<InventoryAlert[]> {
    const whereClause: any = { status: 'ACTIVE' };

    if (storeType) {
      whereClause.store_type = storeType;
    }

    if (severity) {
      whereClause.severity = severity;
    }

    return await InventoryAlert.findAll({
      where: whereClause,
      order: [
        ['priority', 'ASC'],
        ['triggered_at', 'DESC'],
      ],
      limit: limit || 50,
      include: [
        {
          model: InventoryAlertConfiguration,
          as: 'configuration',
        },
      ],
    });
  }

  public static async getAlertHistory(alertId: number): Promise<InventoryAlertLog[]> {
    return await InventoryAlertLog.findAll({
      where: { alert_id: alertId },
      order: [['created_at', 'ASC']],
    });
  }

  public static async checkForEscalation(): Promise<number> {
    const alertsToEscalate = await InventoryAlert.findAll({
      where: {
        status: 'ACTIVE',
        escalated_at: null,
      },
      include: [
        {
          model: InventoryAlertConfiguration,
          as: 'configuration',
          where: { escalation_enabled: true },
        },
      ],
    });

    let escalatedCount = 0;

    for (const alert of alertsToEscalate) {
      const config = alert.configuration;
      if (config && config.isEscalationDue(alert.triggered_at)) {
        alert.escalate(config.escalation_roles || []);
        await alert.save();

        // Log the escalation
        await InventoryAlertLog.create(
          InventoryAlertLog.logAlertEscalated(alert.id, config.escalation_roles)
        );

        escalatedCount++;
      }
    }

    return escalatedCount;
  }

  public static async autoResolveExpiredAlerts(): Promise<number> {
    const expiredAlerts = await InventoryAlert.findAll({
      where: {
        status: 'ACTIVE',
        expires_at: { [Op.lt]: new Date() },
      },
    });

    let resolvedCount = 0;

    for (const alert of expiredAlerts) {
      alert.status = 'RESOLVED';
      alert.resolved_at = new Date();
      await alert.save();

      // Log the auto-resolution
      await InventoryAlertLog.create(InventoryAlertLog.logAutoResolved(alert.id, 'Alert expired'));

      resolvedCount++;
    }

    return resolvedCount;
  }

  public static async generateAlertsForAllItems(): Promise<{
    generalStore: number;
    pharmacy: number;
    dispensary: number;
    totalGenerated: number;
  }> {
    let generalStoreAlerts = 0;
    let pharmacyAlerts = 0;
    let dispensaryAlerts = 0;

    // Check General Store items
    const generalStoreItems = await GeneralStoreItem.findAll({
      where: {
        [Op.or]: [{ current_stock: { [Op.lte]: col('minimum_stock') } }, { current_stock: 0 }],
      },
      include: ['category'],
    });

    for (const item of generalStoreItems) {
      const triggerData: AlertTriggerData = {
        itemId: item.id,
        currentStock: item.current_stock,
        minimumStock: item.minimum_stock,
        itemName: item.name,
        storeType: 'GENERAL' as StoreType,
        categoryId: item.category_id,
      };

      const result = await this.generateAlertsForItem(triggerData);
      generalStoreAlerts += result.alertsCreated;
    }

    // Check Pharmacy Store items
    const pharmacyItems = await PharmacyStore.findAll({
      where: {
        [Op.or]: [{ quantity_remaining: { [Op.lte]: 10 } }, { quantity_remaining: 0 }],
      },
      include: ['drug'],
    });

    for (const item of pharmacyItems) {
      const triggerData: AlertTriggerData = {
        pharmacyItemId: item.id,
        currentStock: item.quantity_remaining,
        minimumStock: 10,
        expiryDate: item.expiration,
        itemName: item.drug?.name || 'Unknown Drug',
        storeType: 'PHARMACY' as StoreType,
      };

      const result = await this.generateAlertsForItem(triggerData);
      pharmacyAlerts += result.alertsCreated;
    }

    // Check Dispensary items
    const dispensaryItems = await GeneralStoreDispensaryItem.findAll({
      where: {
        [Op.or]: [{ current_stock: { [Op.lte]: col('minimum_stock') } }, { current_stock: 0 }],
      },
      include: ['dispensary', 'item'],
    });

    for (const item of dispensaryItems) {
      const triggerData: AlertTriggerData = {
        itemId: item.item_id,
        dispensaryId: item.dispensary_id,
        currentStock: item.quantity_remaining,
        minimumStock: 10,
        expiryDate: item.expiration_date,
        itemName: item.item?.name || 'Unknown Item',
        storeType: 'GENERAL' as StoreType,
      };

      const result = await this.generateAlertsForItem(triggerData);
      dispensaryAlerts += result.alertsCreated;
    }

    return {
      generalStore: generalStoreAlerts,
      pharmacy: pharmacyAlerts,
      dispensary: dispensaryAlerts,
      totalGenerated: generalStoreAlerts + pharmacyAlerts + dispensaryAlerts,
    };
  }

  public static async generateExpiryAlerts(): Promise<{
    pharmacy: number;
    dispensary: number;
    totalGenerated: number;
  }> {
    let pharmacyAlerts = 0;
    let dispensaryAlerts = 0;

    // Check for items expiring within next 30 days
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + 30);

    // Check Pharmacy expiries
    const pharmacyItems = await PharmacyStore.findAll({
      where: {
        expiry_date: { [Op.lte]: expiryThreshold },
        quantity_remaining: { [Op.gt]: 0 },
      },
      include: ['drug'],
    });

    for (const item of pharmacyItems) {
      const triggerData: AlertTriggerData = {
        pharmacyItemId: item.id,
        currentStock: item.quantity_remaining,
        expiryDate: item.expiration,
        itemName: item.drug?.name || 'Unknown Drug',
        storeType: 'PHARMACY' as StoreType,
      };

      const result = await this.generateAlertsForItem(triggerData);
      pharmacyAlerts += result.alertsCreated;
    }

    // Check Dispensary expiries
    const dispensaryItems = await GeneralStoreDispensaryItem.findAll({
      where: {
        expiry_date: { [Op.lte]: expiryThreshold },
        current_stock: { [Op.gt]: 0 },
      },
      include: ['dispensary', 'item'],
    });

    for (const item of dispensaryItems) {
      const triggerData: AlertTriggerData = {
        itemId: item.item_id,
        dispensaryId: item.dispensary_id,
        currentStock: item.quantity_remaining,
        expiryDate: item.expiration_date,
        itemName: item.item?.name || 'Unknown Item',
        storeType: 'GENERAL' as StoreType,
      };

      const result = await this.generateAlertsForItem(triggerData);
      dispensaryAlerts += result.alertsCreated;
    }

    return {
      pharmacy: pharmacyAlerts,
      dispensary: dispensaryAlerts,
      totalGenerated: pharmacyAlerts + dispensaryAlerts,
    };
  }

  public static async generateDashboardSummary(): Promise<any> {
    const [criticalAlerts, highAlerts, mediumAlerts, lowAlerts, totalByStore] = await Promise.all([
      InventoryAlert.count({ where: { status: 'ACTIVE', severity: 'CRITICAL' } }),
      InventoryAlert.count({ where: { status: 'ACTIVE', severity: 'HIGH' } }),
      InventoryAlert.count({ where: { status: 'ACTIVE', severity: 'MEDIUM' } }),
      InventoryAlert.count({ where: { status: 'ACTIVE', severity: 'LOW' } }),
      InventoryAlert.findAll({
        attributes: ['store_type', [InventoryAlert.sequelize.fn('COUNT', '*'), 'count']],
        where: { status: 'ACTIVE' },
        group: ['store_type'],
        raw: true,
      }),
    ]);

    return {
      totalActive: criticalAlerts + highAlerts + mediumAlerts + lowAlerts,
      bySeverity: {
        critical: criticalAlerts,
        high: highAlerts,
        medium: mediumAlerts,
        low: lowAlerts,
      },
      byStore: totalByStore.reduce((acc: any, item: any) => {
        acc[item.store_type] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }
}

export default InventoryAlertService;
