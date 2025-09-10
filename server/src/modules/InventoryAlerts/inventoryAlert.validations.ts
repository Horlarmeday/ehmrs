import Joi from 'joi';

export const alertValidation = {
  getActiveAlerts: {
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .optional(),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional(),
      severity: Joi.string()
        .valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
        .optional(),
      storeType: Joi.string()
        .valid('PHARMACY', 'GENERAL', 'LABORATORY', 'ALL')
        .optional(),
      status: Joi.string()
        .valid('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED')
        .optional(),
      sortBy: Joi.string()
        .valid('priority', 'severity', 'triggered_at', 'title')
        .optional(),
      sortOrder: Joi.string()
        .valid('ASC', 'DESC')
        .optional(),
    }),
  },

  getAlertById: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .required(),
    }),
  },

  acknowledgeAlert: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .required(),
    }),
    body: Joi.object({
      notes: Joi.string()
        .max(500)
        .optional(),
    }),
  },

  resolveAlert: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .required(),
    }),
    body: Joi.object({
      notes: Joi.string()
        .max(500)
        .optional(),
    }),
  },

  dismissAlert: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .required(),
    }),
    body: Joi.object({
      notes: Joi.string()
        .max(500)
        .optional(),
    }),
  },

  escalateAlert: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .required(),
    }),
    body: Joi.object({
      targetLevel: Joi.number()
        .integer()
        .min(1)
        .max(3)
        .required(),
      reason: Joi.string()
        .max(500)
        .optional(),
    }),
  },

  markNotificationSeen: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .required(),
    }),
  },

  triggerAlertChecks: {
    body: Joi.object({
      checkType: Joi.string()
        .valid('stock_level', 'expiry', 'escalation', 'auto_resolve', 'full')
        .required(),
    }),
  },

  createAlertConfiguration: {
    body: Joi.object({
      name: Joi.string()
        .min(3)
        .max(100)
        .required(),
      description: Joi.string()
        .max(500)
        .optional(),
      alert_type: Joi.string()
        .valid('STOCK_LEVEL', 'EXPIRY', 'PROCUREMENT', 'CRITICAL', 'FINANCIAL')
        .required(),
      severity: Joi.string()
        .valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
        .required(),
      store_type: Joi.string()
        .valid('PHARMACY', 'GENERAL', 'LABORATORY', 'ALL')
        .required(),
      department_id: Joi.number()
        .integer()
        .optional()
        .allow(null),
      category_id: Joi.number()
        .integer()
        .optional()
        .allow(null),
      item_id: Joi.number()
        .integer()
        .optional()
        .allow(null),

      // Threshold configuration
      stock_threshold_type: Joi.string()
        .valid('ABSOLUTE', 'PERCENTAGE')
        .optional(),
      stock_threshold_value: Joi.number()
        .min(0)
        .optional()
        .allow(null),
      expiry_days_warning: Joi.number()
        .integer()
        .min(1)
        .max(365)
        .optional()
        .allow(null),

      // Message templates
      title_template: Joi.string()
        .max(200)
        .optional(),
      message_template: Joi.string()
        .max(1000)
        .optional(),

      // Escalation settings
      escalation_enabled: Joi.boolean().default(false),
      escalation_delay_minutes: Joi.number()
        .integer()
        .min(1)
        .max(1440)
        .optional()
        .allow(null),
      escalation_roles: Joi.array()
        .items(Joi.string())
        .optional()
        .allow(null),

      // Notification preferences
      notification_channels: Joi.array()
        .items(Joi.string().valid('WEBSOCKET', 'EMAIL', 'SMS', 'PUSH', 'POPUP'))
        .default(['WEBSOCKET', 'POPUP']),

      // Priority and scheduling
      priority: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .default(5),
      is_active: Joi.boolean().default(true),

      // Additional settings
      auto_resolve_enabled: Joi.boolean().default(false),
      sound_notification: Joi.boolean().default(false),
      requires_acknowledgment: Joi.boolean().default(false),
    }),
  },

  updateAlertConfiguration: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .required(),
    }),
    body: Joi.object({
      name: Joi.string()
        .min(3)
        .max(100)
        .optional(),
      description: Joi.string()
        .max(500)
        .optional(),
      alert_type: Joi.string()
        .valid('STOCK_LEVEL', 'EXPIRY', 'PROCUREMENT', 'CRITICAL', 'FINANCIAL')
        .optional(),
      severity: Joi.string()
        .valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
        .optional(),
      store_type: Joi.string()
        .valid('PHARMACY', 'GENERAL', 'LABORATORY', 'ALL')
        .optional(),
      department_id: Joi.number()
        .integer()
        .optional()
        .allow(null),
      category_id: Joi.number()
        .integer()
        .optional()
        .allow(null),
      item_id: Joi.number()
        .integer()
        .optional()
        .allow(null),

      // Threshold configuration
      stock_threshold_type: Joi.string()
        .valid('ABSOLUTE', 'PERCENTAGE')
        .optional(),
      stock_threshold_value: Joi.number()
        .min(0)
        .optional()
        .allow(null),
      expiry_days_warning: Joi.number()
        .integer()
        .min(1)
        .max(365)
        .optional()
        .allow(null),

      // Message templates
      title_template: Joi.string()
        .max(200)
        .optional(),
      message_template: Joi.string()
        .max(1000)
        .optional(),

      // Escalation settings
      escalation_enabled: Joi.boolean().optional(),
      escalation_delay_minutes: Joi.number()
        .integer()
        .min(1)
        .max(1440)
        .optional()
        .allow(null),
      escalation_roles: Joi.array()
        .items(Joi.string())
        .optional()
        .allow(null),

      // Notification preferences
      notification_channels: Joi.array()
        .items(Joi.string().valid('WEBSOCKET', 'EMAIL', 'SMS', 'PUSH', 'POPUP'))
        .optional(),

      // Priority and scheduling
      priority: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .optional(),
      is_active: Joi.boolean().optional(),

      // Additional settings
      auto_resolve_enabled: Joi.boolean().optional(),
      sound_notification: Joi.boolean().optional(),
      requires_acknowledgment: Joi.boolean().optional(),
    }),
  },

  testNotifications: {
    body: Joi.object({
      alertId: Joi.number()
        .integer()
        .required(),
    }),
  },

  getAlertStatistics: {
    query: Joi.object({
      timeRange: Joi.string()
        .valid('1d', '7d', '30d', '90d')
        .optional(),
    }),
  },
};

export default alertValidation;
