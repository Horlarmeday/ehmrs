export default {
  // Alert filtering getters
  alertsByStatus: state => status => {
    return state.alerts.filter(alert => alert.status === status);
  },

  alertsBySeverity: state => severity => {
    return state.alerts.filter(alert => alert.severity === severity);
  },

  alertsByCategory: state => category => {
    return state.alerts.filter(alert => alert.category === category);
  },

  alertsByStoreType: state => storeType => {
    return state.alerts.filter(alert => alert.store_type === storeType);
  },

  // Active alerts getters
  unacknowledgedAlerts: state => {
    return state.activeAlerts.filter(alert => !alert.acknowledged_at);
  },

  acknowledgedAlerts: state => {
    return state.activeAlerts.filter(alert => alert.acknowledged_at && !alert.resolved_at);
  },

  overdueAlerts: state => {
    const now = new Date();
    const overdueThreshold = 24 * 60 * 60 * 1000; // 24 hours

    return state.activeAlerts.filter(alert => {
      const createdAt = new Date(alert.created_at);
      return now - createdAt > overdueThreshold && !alert.acknowledged_at;
    });
  },

  escalatedAlerts: state => {
    return state.activeAlerts.filter(alert => alert.escalation_level > 0);
  },

  snoozedAlerts: state => {
    const now = new Date();
    return state.activeAlerts.filter(
      alert => alert.snoozed_until && new Date(alert.snoozed_until) > now
    );
  },

  // Count getters
  criticalAlertsCount: state => {
    return state.criticalAlerts.length;
  },

  warningAlertsCount: state => {
    return state.alerts.filter(alert => alert.severity === 'warning' && alert.status === 'active')
      .length;
  },

  infoAlertsCount: state => {
    return state.alerts.filter(alert => alert.severity === 'info' && alert.status === 'active')
      .length;
  },

  totalActiveAlertsCount: state => {
    return state.activeAlerts.length;
  },

  unreadAlertsCount: state => {
    return state.unreadCount;
  },

  // Category-specific getters
  expiryAlerts: state => {
    return state.activeAlerts.filter(alert => alert.category === 'expiry');
  },

  stockLevelAlerts: state => {
    return state.activeAlerts.filter(alert => alert.category === 'stock_level');
  },

  procurementAlerts: state => {
    return state.activeAlerts.filter(alert => alert.category === 'procurement');
  },

  financialAlerts: state => {
    return state.activeAlerts.filter(alert => alert.category === 'financial');
  },

  // Store-specific getters
  pharmacyAlerts: state => {
    return state.activeAlerts.filter(alert => alert.store_type === 'pharmacy');
  },

  generalStoreAlerts: state => {
    return state.activeAlerts.filter(alert => alert.store_type === 'general_store');
  },

  // Priority getters
  highPriorityAlerts: state => {
    return state.activeAlerts.filter(
      alert =>
        alert.severity === 'critical' ||
        (alert.severity === 'warning' && alert.escalation_level > 0)
    );
  },

  todaysAlerts: state => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return state.alerts.filter(alert => {
      const alertDate = new Date(alert.created_at);
      alertDate.setHours(0, 0, 0, 0);
      return alertDate.getTime() === today.getTime();
    });
  },

  thisWeeksAlerts: state => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);

    return state.alerts.filter(alert => {
      const alertDate = new Date(alert.created_at);
      return alertDate >= weekStart;
    });
  },

  // Configuration getters
  isSoundEnabled: state => {
    return state.configuration.sound_enabled;
  },

  isPopupEnabled: state => {
    return state.configuration.popup_enabled;
  },

  isBannerEnabled: state => {
    return state.configuration.banner_enabled;
  },

  alertThresholds: state => {
    return state.configuration.thresholds;
  },

  // UI state getters
  hasCriticalAlerts: state => {
    return state.criticalAlerts.length > 0;
  },

  hasUnreadAlerts: state => {
    return state.unreadCount > 0;
  },

  hasActivePopupQueue: state => {
    return state.popupQueue.length > 0;
  },

  nextPopupAlert: state => {
    return state.popupQueue.length > 0 ? state.popupQueue[0] : null;
  },

  isLoading: state => {
    return state.loading;
  },

  hasError: state => {
    return state.error !== null;
  },

  currentError: state => {
    return state.error;
  },

  isWebSocketConnected: state => {
    return state.websocketConnected;
  },

  lastUpdateTime: state => {
    return state.lastUpdate;
  },

  // Pagination getters
  currentPageAlerts: state => {
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    return state.alerts.slice(start, end);
  },

  hasNextPage: state => {
    return state.currentPage < state.totalPages;
  },

  hasPrevPage: state => {
    return state.currentPage > 1;
  },

  paginationInfo: state => {
    const start = (state.currentPage - 1) * state.itemsPerPage + 1;
    const end = Math.min(start + state.itemsPerPage - 1, state.totalCount);

    return {
      start,
      end,
      total: state.totalCount,
      currentPage: state.currentPage,
      totalPages: state.totalPages,
    };
  },

  // Filter getters
  activeFilters: state => {
    return (
      Object.entries(state.filters)
        // eslint-disable-next-line no-unused-vars
        .filter(([_, value]) => value !== null && value !== undefined)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    );
  },

  hasActiveFilters: state => {
    return Object.values(state.filters).some(value => value !== null && value !== undefined);
  },

  // Summary statistics getters
  alertsSummary: (state, getters) => {
    return {
      total: state.totalCount,
      active: state.activeAlerts.length,
      critical: getters.criticalAlertsCount,
      warning: getters.warningAlertsCount,
      info: getters.infoAlertsCount,
      unread: state.unreadCount,
      overdue: getters.overdueAlerts.length,
      escalated: getters.escalatedAlerts.length,
      snoozed: getters.snoozedAlerts.length,
    };
  },

  alertsByTimeRange: state => (hours = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return state.alerts.filter(alert => new Date(alert.created_at) >= cutoff);
  },

  // Performance getters
  averageResolutionTime: state => {
    const resolvedAlerts = state.alerts.filter(alert => alert.resolved_at);

    if (resolvedAlerts.length === 0) return 0;

    const totalTime = resolvedAlerts.reduce((sum, alert) => {
      const created = new Date(alert.created_at);
      const resolved = new Date(alert.resolved_at);
      return sum + (resolved - created);
    }, 0);

    return totalTime / resolvedAlerts.length;
  },

  alertTrends: state => (days = 7) => {
    const trends = {};
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];

      trends[dateKey] = state.alerts.filter(alert => {
        const alertDate = new Date(alert.created_at).toISOString().split('T')[0];
        return alertDate === dateKey;
      }).length;
    }

    return trends;
  },
};
