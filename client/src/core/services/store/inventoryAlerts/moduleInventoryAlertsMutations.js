export default {
  // Alert data mutations
  SET_ALERTS(state, alerts) {
    state.alerts = alerts;
  },

  SET_ACTIVE_ALERTS(state, alerts) {
    state.activeAlerts = alerts;
    state.unreadCount = alerts.filter(alert => !alert.acknowledged_at).length;
  },

  SET_CRITICAL_ALERTS(state, alerts) {
    state.criticalAlerts = alerts;
  },

  SET_UNREAD_COUNT(state, count) {
    state.unreadCount = count;
  },

  SET_TOTAL_COUNT(state, count) {
    state.totalCount = count;
  },

  SET_CURRENT_ALERT(state, alert) {
    state.currentAlert = alert;
  },

  ADD_ALERT(state, alert) {
    state.alerts.unshift(alert);

    if (alert.status === 'active') {
      state.activeAlerts.unshift(alert);
      if (!alert.acknowledged_at) {
        state.unreadCount++;
      }
    }

    if (alert.severity === 'critical') {
      state.criticalAlerts.unshift(alert);
      // Add to popup queue for critical alerts
      state.popupQueue.push(alert);
    }

    state.totalCount++;
    state.lastUpdate = new Date();
  },

  UPDATE_ALERT(state, updatedAlert) {
    const alertIndex = state.alerts.findIndex(alert => alert.id === updatedAlert.id);
    if (alertIndex !== -1) {
      state.alerts.splice(alertIndex, 1, updatedAlert);
    }

    const activeIndex = state.activeAlerts.findIndex(alert => alert.id === updatedAlert.id);
    if (activeIndex !== -1) {
      if (updatedAlert.status === 'active') {
        state.activeAlerts.splice(activeIndex, 1, updatedAlert);
      } else {
        state.activeAlerts.splice(activeIndex, 1);
      }
    }

    const criticalIndex = state.criticalAlerts.findIndex(alert => alert.id === updatedAlert.id);
    if (criticalIndex !== -1) {
      if (updatedAlert.severity === 'critical' && updatedAlert.status === 'active') {
        state.criticalAlerts.splice(criticalIndex, 1, updatedAlert);
      } else {
        state.criticalAlerts.splice(criticalIndex, 1);
      }
    }

    // Update unread count
    state.unreadCount = state.activeAlerts.filter(alert => !alert.acknowledged_at).length;
    state.lastUpdate = new Date();
  },

  REMOVE_ALERT(state, alertId) {
    state.alerts = state.alerts.filter(alert => alert.id !== alertId);
    state.activeAlerts = state.activeAlerts.filter(alert => alert.id !== alertId);
    state.criticalAlerts = state.criticalAlerts.filter(alert => alert.id !== alertId);
    state.popupQueue = state.popupQueue.filter(alert => alert.id !== alertId);
    state.unreadCount = state.activeAlerts.filter(alert => !alert.acknowledged_at).length;
    state.totalCount = Math.max(0, state.totalCount - 1);
    state.lastUpdate = new Date();
  },

  // Pagination mutations
  SET_CURRENT_PAGE(state, page) {
    state.currentPage = page;
  },

  SET_TOTAL_PAGES(state, pages) {
    state.totalPages = pages;
  },

  SET_ITEMS_PER_PAGE(state, limit) {
    state.itemsPerPage = limit;
  },

  // Filter mutations
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters };
  },

  CLEAR_FILTERS(state) {
    state.filters = {
      severity: null,
      category: null,
      status: null,
      store_type: null,
      date_range: null,
    };
  },

  // Configuration mutations
  SET_CONFIGURATION(state, config) {
    state.configuration = { ...state.configuration, ...config };
  },

  UPDATE_CONFIGURATION(state, updates) {
    state.configuration = { ...state.configuration, ...updates };
  },

  // UI state mutations
  SET_SHOW_SIDEBAR(state, show) {
    state.showSidebar = show;
  },

  SET_SHOW_POPUP(state, show) {
    state.showPopup = show;
  },

  ADD_TO_POPUP_QUEUE(state, alert) {
    state.popupQueue.push(alert);
  },

  REMOVE_FROM_POPUP_QUEUE(state, alertId) {
    state.popupQueue = state.popupQueue.filter(alert => alert.id !== alertId);
  },

  CLEAR_POPUP_QUEUE(state) {
    state.popupQueue = [];
  },

  SET_LOADING(state, loading) {
    state.loading = loading;
  },

  SET_ERROR(state, error) {
    state.error = error;
  },

  CLEAR_ERROR(state) {
    state.error = null;
  },

  // WebSocket mutations
  SET_WEBSOCKET_CONNECTED(state, connected) {
    state.websocketConnected = connected;
  },

  SET_LAST_UPDATE(state, timestamp) {
    state.lastUpdate = timestamp;
  },

  // Audio mutations
  SET_AUDIO_CONTEXT(state, context) {
    state.audioContext = context;
  },

  SET_AUDIO_ENABLED(state, enabled) {
    state.audioEnabled = enabled;
  },

  // Bulk operations
  ACKNOWLEDGE_MULTIPLE_ALERTS(state, alertIds) {
    const acknowledgedAt = new Date();

    state.alerts = state.alerts.map(alert =>
      alertIds.includes(alert.id)
        ? { ...alert, acknowledged_at: acknowledgedAt, acknowledged_by: 'current_user' }
        : alert
    );

    state.activeAlerts = state.activeAlerts.map(alert =>
      alertIds.includes(alert.id)
        ? { ...alert, acknowledged_at: acknowledgedAt, acknowledged_by: 'current_user' }
        : alert
    );

    state.criticalAlerts = state.criticalAlerts.map(alert =>
      alertIds.includes(alert.id)
        ? { ...alert, acknowledged_at: acknowledgedAt, acknowledged_by: 'current_user' }
        : alert
    );

    // Update unread count
    state.unreadCount = state.activeAlerts.filter(alert => !alert.acknowledged_at).length;
    state.lastUpdate = new Date();
  },

  RESOLVE_MULTIPLE_ALERTS(state, alertIds) {
    const resolvedAt = new Date();

    state.alerts = state.alerts.map(alert =>
      alertIds.includes(alert.id)
        ? { ...alert, status: 'resolved', resolved_at: resolvedAt, resolved_by: 'current_user' }
        : alert
    );

    // Remove from active and critical arrays
    state.activeAlerts = state.activeAlerts.filter(alert => !alertIds.includes(alert.id));
    state.criticalAlerts = state.criticalAlerts.filter(alert => !alertIds.includes(alert.id));
    state.popupQueue = state.popupQueue.filter(alert => !alertIds.includes(alert.id));

    // Update unread count
    state.unreadCount = state.activeAlerts.filter(alert => !alert.acknowledged_at).length;
    state.lastUpdate = new Date();
  },
};
