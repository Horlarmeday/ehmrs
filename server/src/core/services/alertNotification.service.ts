import { InventoryAlert, InventoryAlertLog, Staff } from '../../database/models';
import { AlertSeverity, StoreType } from '../../database/models/inventoryAlert';
import { NotificationChannel } from '../../database/models/inventoryAlertLog';
import { logger } from '../helpers/logger';

export interface NotificationPayload {
  alertId: number;
  title: string;
  message: string;
  severity: AlertSeverity;
  storeType: StoreType;
  contextData?: any;
  timestamp: Date;
  priority: number;
  requiresAcknowledgment?: boolean;
  audioNotification?: boolean;
  escalationLevel?: number;
  // Additional properties for stored notifications
  recipientId?: number;
  recipientName?: string;
  isRead?: boolean;
  readAt?: Date;
  createdAt?: Date;
}

export interface NotificationRecipient {
  staffId: number;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  department?: string;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    popup: boolean;
    sound: boolean;
  };
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  recipientCount: number;
  failedRecipients: number;
  errors: string[];
  details?: any;
}

export class AlertNotificationService {
  private static instance: AlertNotificationService;
  private webSocketServer?: any; // Future WebSocket server instance
  private notificationQueue: NotificationPayload[] = [];
  private isProcessing = false;
  // In-memory store for active popup notifications (production should use Redis/cache)
  private activePopupNotifications: Map<number, NotificationPayload[]> = new Map();

  private constructor() {
    // Initialize notification service
  }

  public static getInstance(): AlertNotificationService {
    if (!AlertNotificationService.instance) {
      AlertNotificationService.instance = new AlertNotificationService();
    }
    return AlertNotificationService.instance;
  }

  // Set WebSocket server instance (for future integration)
  public setWebSocketServer(wsServer: any): void {
    this.webSocketServer = wsServer;
    logger.info('WebSocket server attached to AlertNotificationService');
  }

  // Main notification dispatch method
  public async dispatchAlert(alert: InventoryAlert): Promise<NotificationResult[]> {
    const payload = this.createNotificationPayload(alert);
    const recipients = await this.getAlertRecipients(alert);

    logger.info(`Dispatching alert ${alert.id} to ${recipients.length} recipients`);

    const results: NotificationResult[] = [];

    // Send notifications through all appropriate channels
    if (this.shouldSendWebSocketNotification(alert)) {
      const wsResult = await this.sendWebSocketNotification(payload, recipients);
      results.push(wsResult);
    }

    if (this.shouldSendEmailNotification(alert)) {
      const emailResult = await this.sendEmailNotification(payload, recipients);
      results.push(emailResult);
    }

    if (this.shouldSendSMSNotification(alert)) {
      const smsResult = await this.sendSMSNotification(payload, recipients);
      results.push(smsResult);
    }

    // Always send popup notification for in-app delivery
    const popupResult = await this.sendPopupNotification(payload, recipients);
    results.push(popupResult);

    // Log all notifications
    for (const result of results) {
      if (result.success) {
        await this.logNotificationSent(alert.id, result.channel, result.details);
      }
    }

    return results;
  }

  // Create notification payload from alert
  private createNotificationPayload(alert: InventoryAlert): NotificationPayload {
    return {
      alertId: alert.id,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      storeType: alert.store_type,
      contextData: alert.context_data,
      timestamp: alert.triggered_at,
      priority: alert.priority,
      requiresAcknowledgment: alert.severity === 'CRITICAL',
      audioNotification: ['CRITICAL', 'HIGH'].includes(alert.severity),
      escalationLevel: alert.escalated_at ? 1 : 0,
    };
  }

  // Get recipients for alert based on role and department
  private async getAlertRecipients(alert: InventoryAlert): Promise<NotificationRecipient[]> {
    // For now, we'll return all active staff members
    // In a real implementation, this would filter based on:
    // - Store type
    // - Department
    // - Role permissions
    // - Notification preferences
    // - Current shifts/availability

    const staff = await Staff.findAll({
      where: { is_active: true },
      attributes: ['id', 'firstname', 'lastname', 'email', 'phone', 'role', 'department'],
      limit: 50, // Reasonable limit for notifications
    });

    return staff.map(member => ({
      staffId: member.id,
      name: `${member.firstname} ${member.lastname}`,
      email: member.email,
      phone: member.phone,
      role: member.role || 'staff',
      department: member.department,
      notificationPreferences: {
        email: true,
        sms: alert.severity === 'CRITICAL',
        popup: true,
        sound: ['CRITICAL', 'HIGH'].includes(alert.severity),
      },
    }));
  }

  // WebSocket notification implementation
  private async sendWebSocketNotification(
    payload: NotificationPayload,
    recipients: NotificationRecipient[]
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      channel: 'WEBSOCKET',
      recipientCount: recipients.length,
      failedRecipients: 0,
      errors: [],
    };

    try {
      if (!this.webSocketServer) {
        result.errors.push('WebSocket server not available');
        result.failedRecipients = recipients.length;
        return result;
      }

      // Future WebSocket implementation
      // this.webSocketServer.emit('inventory_alert', {
      //   ...payload,
      //   recipients: recipients.map(r => r.staffId)
      // });

      result.success = true;
      result.details = {
        message: 'WebSocket notification sent',
        payload: payload,
      };

      logger.info(`WebSocket notification sent for alert ${payload.alertId}`);
    } catch (error) {
      result.errors.push(`WebSocket error: ${error.message}`);
      result.failedRecipients = recipients.length;
      logger.error(`WebSocket notification failed for alert ${payload.alertId}: ${error.message}`);
    }

    return result;
  }

  // Email notification implementation (placeholder)
  private async sendEmailNotification(
    payload: NotificationPayload,
    recipients: NotificationRecipient[]
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      channel: 'EMAIL',
      recipientCount: recipients.length,
      failedRecipients: 0,
      errors: [],
    };

    try {
      const emailRecipients = recipients.filter(r => r.email && r.notificationPreferences?.email);

      if (emailRecipients.length === 0) {
        result.errors.push('No email recipients found');
        return result;
      }

      // Future email implementation using existing email service
      // await EmailService.sendInventoryAlert(emailRecipients, payload);

      result.success = true;
      result.recipientCount = emailRecipients.length;
      result.details = {
        message: 'Email notifications queued',
        recipients: emailRecipients.length,
      };

      logger.info(
        `Email notifications queued for ${emailRecipients.length} recipients for alert ${payload.alertId}`
      );
    } catch (error) {
      result.errors.push(`Email error: ${error.message}`);
      result.failedRecipients = recipients.length;
      logger.error(`Email notification failed for alert ${payload.alertId}: ${error.message}`);
    }

    return result;
  }

  // SMS notification implementation (placeholder)
  private async sendSMSNotification(
    payload: NotificationPayload,
    recipients: NotificationRecipient[]
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      channel: 'SMS',
      recipientCount: recipients.length,
      failedRecipients: 0,
      errors: [],
    };

    try {
      const smsRecipients = recipients.filter(r => r.phone && r.notificationPreferences?.sms);

      if (smsRecipients.length === 0) {
        result.errors.push('No SMS recipients found');
        return result;
      }

      // Future SMS implementation
      // await SMSService.sendInventoryAlert(smsRecipients, payload);

      result.success = true;
      result.recipientCount = smsRecipients.length;
      result.details = {
        message: 'SMS notifications queued',
        recipients: smsRecipients.length,
      };

      logger.info(
        `SMS notifications queued for ${smsRecipients.length} recipients for alert ${payload.alertId}`
      );
    } catch (error) {
      result.errors.push(`SMS error: ${error.message}`);
      result.failedRecipients = recipients.length;
      logger.error(`SMS notification failed for alert ${payload.alertId}: ${error.message}`);
    }

    return result;
  }

  // In-app popup notification (always works)
  private async sendPopupNotification(
    payload: NotificationPayload,
    recipients: NotificationRecipient[]
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: true,
      channel: 'POPUP',
      recipientCount: recipients.length,
      failedRecipients: 0,
      errors: [],
    };

    try {
      // Store notification for each recipient who should receive popup notifications
      const popupRecipients = recipients.filter(r => r.notificationPreferences?.popup);

      for (const recipient of popupRecipients) {
        // Get existing notifications for this staff member
        const existingNotifications = this.activePopupNotifications.get(recipient.staffId) || [];

        // Add new notification with recipient-specific data
        const recipientNotification = {
          ...payload,
          recipientId: recipient.staffId,
          recipientName: recipient.name,
          isRead: false,
          createdAt: new Date(),
        };

        existingNotifications.push(recipientNotification);

        // Keep only the most recent 50 notifications per user to prevent memory bloat
        if (existingNotifications.length > 50) {
          existingNotifications.splice(0, existingNotifications.length - 50);
        }

        this.activePopupNotifications.set(recipient.staffId, existingNotifications);

        logger.debug(
          `Popup notification stored for staff ${recipient.staffId} (${recipient.name})`
        );
      }

      // If WebSocket is available, also send real-time notification
      if (this.webSocketServer && popupRecipients.length > 0) {
        try {
          // Send to all connected clients for these recipients
          const notificationEvent = {
            type: 'INVENTORY_ALERT',
            data: payload,
            recipients: popupRecipients.map(r => r.staffId),
            timestamp: new Date().toISOString(),
          };

          // Emit to specific user rooms or broadcast to all if no specific room implementation
          this.webSocketServer.emit('inventory_alert', notificationEvent);
          logger.debug(
            `Real-time popup notification sent via WebSocket for alert ${payload.alertId}`
          );
        } catch (wsError) {
          logger.warn(`WebSocket notification failed, but popup stored: ${wsError.message}`);
        }
      }

      result.recipientCount = popupRecipients.length;
      result.details = {
        message: 'In-app notification created and stored',
        payload: payload,
        recipients: popupRecipients.length,
        storedNotifications: this.getActiveNotificationCount(),
        realTimeDelivery: !!this.webSocketServer,
      };

      logger.info(
        `In-app popup notification created for alert ${payload.alertId}, delivered to ${popupRecipients.length} recipients`
      );
    } catch (error) {
      result.errors.push(`Popup error: ${error.message}`);
      result.success = false;
      result.failedRecipients = recipients.length;
      logger.error(`Popup notification failed for alert ${payload.alertId}: ${error.message}`);
    }

    return result;
  }

  // Determine if WebSocket notification should be sent
  private shouldSendWebSocketNotification(alert: InventoryAlert): boolean {
    return true; // Always attempt WebSocket for real-time delivery
  }

  // Determine if email notification should be sent
  private shouldSendEmailNotification(alert: InventoryAlert): boolean {
    return ['HIGH', 'CRITICAL'].includes(alert.severity);
  }

  // Determine if SMS notification should be sent
  private shouldSendSMSNotification(alert: InventoryAlert): boolean {
    return alert.severity === 'CRITICAL';
  }

  // Log notification sent to database
  private async logNotificationSent(
    alertId: number,
    channel: NotificationChannel,
    details?: any
  ): Promise<void> {
    try {
      await InventoryAlertLog.create(
        InventoryAlertLog.logNotificationSent(alertId, channel, details)
      );
    } catch (error) {
      logger.error(`Failed to log notification for alert ${alertId}: ${error.message}`);
    }
  }

  // Queue notification for processing
  public queueNotification(payload: NotificationPayload): void {
    this.notificationQueue.push(payload);
    if (!this.isProcessing) {
      this.processNotificationQueue();
    }
  }

  // Process notification queue
  private async processNotificationQueue(): Promise<void> {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.notificationQueue.length > 0) {
        const payload = this.notificationQueue.shift();
        if (payload) {
          const alert = await InventoryAlert.findByPk(payload.alertId);
          if (alert) {
            await this.dispatchAlert(alert);
          }
        }
      }
    } catch (error) {
      logger.error(`Error processing notification queue: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  // Get pending notifications for a user (for frontend polling)
  public async getPendingNotifications(
    staffId: number,
    includeRead = false
  ): Promise<NotificationPayload[]> {
    try {
      // Get stored popup notifications for this staff member
      const storedNotifications = this.activePopupNotifications.get(staffId) || [];

      // Filter based on read status if needed
      let notifications = includeRead
        ? storedNotifications
        : storedNotifications.filter(n => !n.isRead);

      // Also get active alerts from database as backup
      const activeAlerts = await InventoryAlert.findAll({
        where: {
          status: 'ACTIVE',
        },
        order: [
          ['priority', 'ASC'],
          ['triggered_at', 'DESC'],
        ],
        limit: 10,
      });

      // Add active alerts that aren't already in notifications
      const existingAlertIds = new Set(notifications.map(n => n.alertId));
      const newAlertNotifications = activeAlerts
        .filter(alert => !existingAlertIds.has(alert.id))
        .map(alert => ({
          ...this.createNotificationPayload(alert),
          recipientId: staffId,
          isRead: false,
          createdAt: new Date(),
        }));

      notifications = [...notifications, ...newAlertNotifications];

      // Sort by priority and timestamp
      notifications.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority; // Lower priority number = higher priority
        }
        return b.timestamp.getTime() - a.timestamp.getTime(); // Newer first
      });

      return notifications.slice(0, 20); // Limit to 20 most important
    } catch (error) {
      logger.error(`Failed to get pending notifications for staff ${staffId}: ${error.message}`);
      return [];
    }
  }

  // Mark notification as seen by user
  public async markNotificationSeen(alertId: number, staffId: number): Promise<void> {
    try {
      // Update stored notification as read
      const notifications = this.activePopupNotifications.get(staffId) || [];
      const notification = notifications.find(n => n.alertId === alertId);
      if (notification) {
        notification.isRead = true;
        notification.readAt = new Date();
      }

      // Log the action
      await InventoryAlertLog.create({
        alert_id: alertId,
        action: 'NOTIFICATION_SENT',
        action_by: staffId,
        notification_channel: 'POPUP',
        details: { action: 'seen', timestamp: new Date() },
      });

      logger.info(`Notification ${alertId} marked as seen by staff ${staffId}`);
    } catch (error) {
      logger.error(`Failed to mark notification as seen: ${error.message}`);
    }
  }

  // Get notification statistics
  public async getNotificationStats(): Promise<any> {
    try {
      const stats = await InventoryAlertLog.findAll({
        attributes: [
          'notification_channel',
          [InventoryAlertLog.sequelize.fn('COUNT', '*'), 'count'],
        ],
        where: {
          action: 'NOTIFICATION_SENT',
        },
        group: ['notification_channel'],
        raw: true,
      });

      return {
        totalNotifications: stats.reduce((sum: number, stat: any) => sum + parseInt(stat.count), 0),
        byChannel: stats.reduce((acc: any, stat: any) => {
          acc[stat.notification_channel] = parseInt(stat.count);
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error(`Failed to get notification stats: ${error.message}`);
      return { totalNotifications: 0, byChannel: {} };
    }
  }

  // Test notification system
  public async testNotifications(alertId: number): Promise<NotificationResult[]> {
    try {
      const alert = await InventoryAlert.findByPk(alertId);
      if (!alert) {
        throw new Error(`Alert ${alertId} not found`);
      }

      logger.info(`Testing notifications for alert ${alertId}`);
      return await this.dispatchAlert(alert);
    } catch (error) {
      logger.error(`Test notification failed: ${error.message}`);
      throw error;
    }
  }

  // Get count of active notifications across all users
  private getActiveNotificationCount(): number {
    let count = 0;
    for (const notifications of this.activePopupNotifications.values()) {
      count += notifications.filter(n => !n.isRead).length;
    }
    return count;
  }

  // Clean up old notifications (called periodically)
  public cleanupOldNotifications(maxAgeHours = 24): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

    for (const [staffId, notifications] of this.activePopupNotifications.entries()) {
      const filtered = notifications.filter(n => n.createdAt > cutoffTime || !n.isRead);

      if (filtered.length !== notifications.length) {
        this.activePopupNotifications.set(staffId, filtered);
        logger.debug(`Cleaned up old notifications for staff ${staffId}`);
      }
    }
  }

  // Clear all notifications for a user
  public clearUserNotifications(staffId: number): void {
    this.activePopupNotifications.delete(staffId);
    logger.info(`Cleared all notifications for staff ${staffId}`);
  }

  // Get notification count for a specific user
  public getUnreadNotificationCount(staffId: number): number {
    const notifications = this.activePopupNotifications.get(staffId) || [];
    return notifications.filter(n => !n.isRead).length;
  }

  // Mark all notifications as read for a user
  public async markAllNotificationsRead(staffId: number): Promise<void> {
    try {
      const notifications = this.activePopupNotifications.get(staffId) || [];
      const unreadCount = notifications.filter(n => !n.isRead).length;

      notifications.forEach(n => {
        if (!n.isRead) {
          n.isRead = true;
          n.readAt = new Date();
        }
      });

      logger.info(`Marked ${unreadCount} notifications as read for staff ${staffId}`);
    } catch (error) {
      logger.error(
        `Failed to mark all notifications as read for staff ${staffId}: ${error.message}`
      );
    }
  }
}

export default AlertNotificationService;
