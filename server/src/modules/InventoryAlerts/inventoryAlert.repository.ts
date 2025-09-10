import { Op, WhereOptions, Includeable, Order, FindAttributeOptions } from 'sequelize';
import {
  InventoryAlert,
  AlertType,
  AlertSeverity,
  AlertStatus,
  StoreType,
} from '../../database/models/inventoryAlert';
import {
  InventoryAlertConfiguration,
  ThresholdType,
} from '../../database/models/inventoryAlertConfiguration';
import {
  InventoryAlertLog,
  AlertAction,
  NotificationChannel,
} from '../../database/models/inventoryAlertLog';
import { Staff } from '../../database/models/staff';
import { GeneralStoreItem } from '../../database/models/generalStore';
import { PharmacyStore } from '../../database/models/pharmacyStore';
import { GeneralStoreDispensary } from '../../database/models/generalStore/generalStoreDispensary';
import { BadException } from '../../common/util/api-error';

export class InventoryAlertRepository {
  // Alert Configuration Management
  static async createAlertConfiguration(
    configData: any,
    staffId: number
  ): Promise<InventoryAlertConfiguration> {
    try {
      return await InventoryAlertConfiguration.create({
        ...configData,
        created_by: staffId,
        updated_by: staffId,
      });
    } catch (error) {
      throw new BadException(
        'Error',
        500,
        `Failed to create alert configuration: ${error.message}`
      );
    }
  }

  static async updateAlertConfiguration(
    id: number,
    configData: any,
    staffId: number
  ): Promise<InventoryAlertConfiguration> {
    try {
      const config = await InventoryAlertConfiguration.findByPk(id);
      if (!config) {
        throw new BadException('Error', 404, 'Alert configuration not found');
      }

      await config.update({
        ...configData,
        updated_by: staffId,
      });

      return config;
    } catch (error) {
      throw new BadException(
        'Error',
        500,
        `Failed to update alert configuration: ${error.message}`
      );
    }
  }

  static async deleteAlertConfiguration(id: number): Promise<void> {
    try {
      const config = await InventoryAlertConfiguration.findByPk(id);
      if (!config) {
        throw new BadException('Error', 404, 'Alert configuration not found');
      }

      await config.destroy();
    } catch (error) {
      throw new BadException(
        'Error',
        500,
        `Failed to delete alert configuration: ${error.message}`
      );
    }
  }

  static async getAlertConfiguration(id: number): Promise<InventoryAlertConfiguration> {
    try {
      const config = await InventoryAlertConfiguration.findByPk(id, {
        include: [
          { model: Staff, as: 'createdByStaff' },
          { model: Staff, as: 'updatedByStaff' },
        ],
      });

      if (!config) {
        throw new BadException('Error', 404, 'Alert configuration not found');
      }

      return config;
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get alert configuration: ${error.message}`);
    }
  }

  static async getAlertConfigurations(filters?: {
    alert_type?: AlertType;
    severity?: AlertSeverity;
    store_type?: StoreType;
    is_active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ rows: InventoryAlertConfiguration[]; count: number }> {
    try {
      const whereClause: WhereOptions = {};

      if (filters?.alert_type) {
        whereClause.alert_type = filters.alert_type;
      }
      if (filters?.severity) {
        whereClause.severity = filters.severity;
      }
      if (filters?.store_type) {
        whereClause.store_type = filters.store_type;
      }
      if (filters?.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
      }

      const limit = filters?.limit || 50;
      const offset = filters?.page ? (filters.page - 1) * limit : 0;

      return await InventoryAlertConfiguration.findAndCountAll({
        where: whereClause,
        include: [
          { model: Staff, as: 'createdByStaff', attributes: ['id', 'firstname', 'lastname'] },
          { model: Staff, as: 'updatedByStaff', attributes: ['id', 'firstname', 'lastname'] },
        ],
        order: [
          ['priority', 'ASC'],
          ['createdAt', 'DESC'],
        ],
        limit,
        offset,
      });
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get alert configurations: ${error.message}`);
    }
  }

  // Alert Management
  static async createAlert(alertData: any): Promise<InventoryAlert> {
    try {
      return await InventoryAlert.create(alertData);
    } catch (error) {
      throw new BadException('Error', 500, `Failed to create alert: ${error.message}`);
    }
  }

  static async updateAlert(id: number, alertData: any): Promise<InventoryAlert> {
    try {
      const alert = await InventoryAlert.findByPk(id);
      if (!alert) {
        throw new BadException('Error', 404, 'Alert not found');
      }

      await alert.update(alertData);
      return alert;
    } catch (error) {
      throw new BadException('Error', 500, `Failed to update alert: ${error.message}`);
    }
  }

  static async getAlert(id: number): Promise<InventoryAlert> {
    try {
      const alert = await InventoryAlert.findByPk(id, {
        include: [
          { model: InventoryAlertConfiguration, as: 'configuration' },
          { model: GeneralStoreItem, as: 'item' },
          { model: PharmacyStore, as: 'pharmacyItem' },
          { model: GeneralStoreDispensary, as: 'dispensary' },
          { model: Staff, as: 'acknowledgedByStaff' },
          { model: Staff, as: 'resolvedByStaff' },
          { model: InventoryAlertLog, as: 'logs' },
        ],
      });

      if (!alert) {
        throw new BadException('Error', 404, 'Alert not found');
      }

      return alert;
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get alert: ${error.message}`);
    }
  }

  static async getAlerts(filters?: {
    status?: AlertStatus;
    severity?: AlertSeverity;
    store_type?: StoreType;
    alert_type?: AlertType;
    item_id?: number;
    pharmacy_item_id?: number;
    dispensary_id?: number;
    escalation_level?: number;
    page?: number;
    limit?: number;
  }): Promise<{ rows: InventoryAlert[]; count: number }> {
    try {
      const whereClause: WhereOptions = {};

      if (filters?.status) {
        whereClause.status = filters.status;
      }
      if (filters?.severity) {
        whereClause.severity = filters.severity;
      }
      if (filters?.store_type) {
        whereClause.store_type = filters.store_type;
      }
      if (filters?.alert_type) {
        whereClause.alert_type = filters.alert_type;
      }
      if (filters?.item_id) {
        whereClause.item_id = filters.item_id;
      }
      if (filters?.pharmacy_item_id) {
        whereClause.pharmacy_item_id = filters.pharmacy_item_id;
      }
      if (filters?.dispensary_id) {
        whereClause.dispensary_id = filters.dispensary_id;
      }
      if (filters?.escalation_level !== undefined) {
        whereClause.escalation_level = filters.escalation_level;
      }

      const limit = filters?.limit || 50;
      const offset = filters?.page ? (filters.page - 1) * limit : 0;

      return await InventoryAlert.findAndCountAll({
        where: whereClause,
        include: [
          { model: InventoryAlertConfiguration, as: 'configuration' },
          { model: GeneralStoreItem, as: 'item' },
          { model: PharmacyStore, as: 'pharmacyItem' },
          { model: GeneralStoreDispensary, as: 'dispensary' },
          { model: Staff, as: 'acknowledgedByStaff' },
          { model: Staff, as: 'resolvedByStaff' },
        ],
        order: [
          ['priority', 'ASC'],
          ['triggered_at', 'DESC'],
        ],
        limit,
        offset,
      });
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get alerts: ${error.message}`);
    }
  }

  static async acknowledgeAlert(
    id: number,
    staffId: number,
    notes?: string
  ): Promise<InventoryAlert> {
    try {
      const alert = await InventoryAlert.findByPk(id);
      if (!alert) {
        throw new BadException('Error', 404, 'Alert not found');
      }

      alert.acknowledge(staffId, notes);
      await alert.save();

      return alert;
    } catch (error) {
      throw new BadException('Error', 500, `Failed to acknowledge alert: ${error.message}`);
    }
  }

  static async resolveAlert(id: number, staffId: number, notes?: string): Promise<InventoryAlert> {
    try {
      const alert = await InventoryAlert.findByPk(id);
      if (!alert) {
        throw new BadException('Error', 404, 'Alert not found');
      }

      alert.resolve(staffId, notes);
      await alert.save();

      return alert;
    } catch (error) {
      throw new BadException('Error', 500, `Failed to resolve alert: ${error.message}`);
    }
  }

  static async dismissAlert(id: number, staffId: number, notes?: string): Promise<InventoryAlert> {
    try {
      const alert = await InventoryAlert.findByPk(id);
      if (!alert) {
        throw new BadException('Error', 404, 'Alert not found');
      }

      alert.dismiss(staffId, notes);
      await alert.save();

      return alert;
    } catch (error) {
      throw new BadException('Error', 500, `Failed to dismiss alert: ${error.message}`);
    }
  }

  static async escalateAlert(id: number, roles: string[]): Promise<InventoryAlert> {
    try {
      const alert = await InventoryAlert.findByPk(id);
      if (!alert) {
        throw new BadException('Error', 404, 'Alert not found');
      }

      alert.escalate(roles);
      await alert.save();

      return alert;
    } catch (error) {
      throw new BadException('Error', 500, `Failed to escalate alert: ${error.message}`);
    }
  }

  static async getActiveAlerts(filters?: {
    severity?: AlertSeverity;
    storeType?: StoreType;
    limit?: number;
  }): Promise<InventoryAlert[]> {
    try {
      return await InventoryAlert.getActiveAlerts(filters);
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get active alerts: ${error.message}`);
    }
  }

  static async getDashboardCounts(): Promise<any> {
    try {
      return await InventoryAlert.getDashboardCounts();
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get dashboard counts: ${error.message}`);
    }
  }

  // Alert Log Management
  static async createAlertLog(logData: any): Promise<InventoryAlertLog> {
    try {
      return await InventoryAlertLog.create(logData);
    } catch (error) {
      throw new BadException('Error', 500, `Failed to create alert log: ${error.message}`);
    }
  }

  static async getAlertLogs(
    alertId: number,
    filters?: {
      action?: AlertAction;
      page?: number;
      limit?: number;
    }
  ): Promise<{ rows: InventoryAlertLog[]; count: number }> {
    try {
      const whereClause: WhereOptions = { alert_id: alertId };

      if (filters?.action) {
        whereClause.action = filters.action;
      }

      const limit = filters?.limit || 50;
      const offset = filters?.page ? (filters.page - 1) * limit : 0;

      return await InventoryAlertLog.findAndCountAll({
        where: whereClause,
        include: [{ model: Staff, as: 'staff' }],
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get alert logs: ${error.message}`);
    }
  }

  static async getAlertAuditTrail(alertId: number): Promise<any[]> {
    try {
      const logs = await InventoryAlertLog.findAll({
        where: { alert_id: alertId },
        include: [{ model: Staff, as: 'staff' }],
        order: [['created_at', 'ASC']],
      });

      return logs.map(log => log.toAuditTrail());
    } catch (error) {
      throw new BadException('Error', 500, `Failed to get alert audit trail: ${error.message}`);
    }
  }
}
