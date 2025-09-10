import { Router } from 'express';
import InventoryAlertController from './inventoryAlert.controller';
// import { authMiddleware, permissionMiddleware } from '../../middleware/auth'; // Assuming these exist

const router = Router();

// Alert Management Routes
router.get(
  '/alerts',
  // authMiddleware,
  // permissionMiddleware(['inventory:read', 'alerts:read']),
  InventoryAlertController.getActiveAlerts
);

router.get(
  '/alerts/dashboard',
  // authMiddleware,
  // permissionMiddleware(['inventory:read', 'alerts:read']),
  InventoryAlertController.getDashboardSummary
);

router.get(
  '/alerts/statistics',
  // authMiddleware,
  // permissionMiddleware(['inventory:read', 'alerts:read']),
  InventoryAlertController.getAlertStatistics
);

router.get(
  '/alerts/notifications/pending',
  // authMiddleware,
  InventoryAlertController.getPendingNotifications
);

router.get(
  '/alerts/health',
  // authMiddleware,
  // permissionMiddleware(['system:read']),
  InventoryAlertController.getSystemHealth
);

router.get(
  '/alerts/:id',
  // authMiddleware,
  // permissionMiddleware(['inventory:read', 'alerts:read']),
  InventoryAlertController.getAlertById
);

// Alert Actions
router.post(
  '/alerts/:id/acknowledge',
  // authMiddleware,
  // permissionMiddleware(['alerts:manage']),
  InventoryAlertController.acknowledgeAlert
);

router.post(
  '/alerts/:id/resolve',
  // authMiddleware,
  // permissionMiddleware(['alerts:manage']),
  InventoryAlertController.resolveAlert
);

router.post(
  '/alerts/:id/dismiss',
  // authMiddleware,
  // permissionMiddleware(['alerts:manage']),
  InventoryAlertController.dismissAlert
);

router.post(
  '/alerts/:id/escalate',
  // authMiddleware,
  // permissionMiddleware(['alerts:escalate']),
  InventoryAlertController.escalateAlert
);

router.post(
  '/alerts/:id/notifications/seen',
  // authMiddleware,
  InventoryAlertController.markNotificationSeen
);

// System Management Routes
router.post(
  '/alerts/trigger-checks',
  // authMiddleware,
  // permissionMiddleware(['system:manage', 'alerts:admin']),
  InventoryAlertController.triggerAlertChecks
);

router.post(
  '/alerts/test-notifications',
  // authMiddleware,
  // permissionMiddleware(['system:manage', 'alerts:admin']),
  InventoryAlertController.testNotifications
);

// Configuration Routes
router.get(
  '/configurations',
  // authMiddleware,
  // permissionMiddleware(['alerts:config:read']),
  InventoryAlertController.getAlertConfigurations
);

router.post(
  '/configurations',
  // authMiddleware,
  // permissionMiddleware(['alerts:config:write']),
  InventoryAlertController.createAlertConfiguration
);

router.put(
  '/configurations/:id',
  // authMiddleware,
  // permissionMiddleware(['alerts:config:write']),
  InventoryAlertController.updateAlertConfiguration
);

// Escalation Configuration Routes
router.get(
  '/escalation/configuration',
  // authMiddleware,
  // permissionMiddleware(['alerts:config:read']),
  InventoryAlertController.getEscalationConfiguration
);

export default router;
