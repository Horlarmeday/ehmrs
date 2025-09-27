import axios from '@/axios';

export default {
  // Fetch alerts with filtering and pagination
  async fetchAlerts({ commit, state }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/inventory-alerts', {
        params: {
          page: params.page || state.currentPage,
          limit: params.limit || state.itemsPerPage,
          severity: state.filters.severity,
          category: state.filters.category,
          status: state.filters.status,
          store_type: state.filters.store_type,
          date_from: state.filters.date_range?.from,
          date_to: state.filters.date_range?.to,
          ...params,
        },
      });

      const { alerts, pagination } = response.data.data;

      commit('SET_ALERTS', alerts);
      commit('SET_TOTAL_COUNT', pagination.total);
      commit('SET_TOTAL_PAGES', pagination.pages);
      commit('SET_CURRENT_PAGE', pagination.currentPage);

      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch alerts');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Fetch active alerts (for real-time updates)
  async fetchActiveAlerts({ commit }) {
    try {
      const response = await axios.get('/inventory-alerts/active');
      const alerts = response.data.data;

      commit('SET_ACTIVE_ALERTS', alerts);

      const criticalAlerts = alerts.filter((alert) => alert.severity === 'critical');
      commit('SET_CRITICAL_ALERTS', criticalAlerts);

      return alerts;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch active alerts');
      throw error;
    }
  },

  // Get alert details
  async fetchAlertById({ commit }, alertId) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get(`/inventory-alerts/${alertId}`);
      commit('SET_CURRENT_ALERT', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch alert details');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Acknowledge single alert
  async acknowledgeAlert({ commit }, { alertId, notes = null }) {
    try {
      const response = await axios.patch(`/inventory-alerts/${alertId}/acknowledge`, {
        notes,
      });

      commit('UPDATE_ALERT', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to acknowledge alert');
      throw error;
    }
  },

  // Acknowledge multiple alerts
  async acknowledgeMultipleAlerts({ commit }, { alertIds, notes = null }) {
    try {
      const response = await axios.patch('/inventory-alerts/acknowledge-multiple', {
        alert_ids: alertIds,
        notes,
      });

      commit('ACKNOWLEDGE_MULTIPLE_ALERTS', alertIds);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to acknowledge alerts');
      throw error;
    }
  },

  // Resolve single alert
  async resolveAlert({ commit }, { alertId, resolution_notes, action_taken = null }) {
    try {
      const response = await axios.patch(`/inventory-alerts/${alertId}/resolve`, {
        resolution_notes,
        action_taken,
      });

      commit('UPDATE_ALERT', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to resolve alert');
      throw error;
    }
  },

  // Resolve multiple alerts
  async resolveMultipleAlerts({ commit }, { alertIds, resolution_notes, action_taken = null }) {
    try {
      const response = await axios.patch('/inventory-alerts/resolve-multiple', {
        alert_ids: alertIds,
        resolution_notes,
        action_taken,
      });

      commit('RESOLVE_MULTIPLE_ALERTS', alertIds);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to resolve alerts');
      throw error;
    }
  },

  // Escalate alert
  async escalateAlert({ commit }, { alertId, escalation_level, notes = null }) {
    try {
      const response = await axios.patch(`/inventory-alerts/${alertId}/escalate`, {
        escalation_level,
        notes,
      });

      commit('UPDATE_ALERT', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to escalate alert');
      throw error;
    }
  },

  // Snooze alert
  async snoozeAlert({ commit }, { alertId, snooze_until, reason = null }) {
    try {
      const response = await axios.patch(`/inventory-alerts/${alertId}/snooze`, {
        snooze_until,
        reason,
      });

      commit('UPDATE_ALERT', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to snooze alert');
      throw error;
    }
  },

  // Get alert configuration
  async fetchConfiguration({ commit }) {
    try {
      const response = await axios.get('/inventory-alerts/configuration');
      commit('SET_CONFIGURATION', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch configuration');
      throw error;
    }
  },

  // Update alert configuration
  async updateConfiguration({ commit }, configUpdates) {
    try {
      const response = await axios.patch('/inventory-alerts/configuration', configUpdates);
      commit('UPDATE_CONFIGURATION', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to update configuration');
      throw error;
    }
  },

  // Get alert statistics/summary
  async fetchAlertSummary({ commit }, dateRange = null) {
    try {
      const params = dateRange
        ? {
            date_from: dateRange.from,
            date_to: dateRange.to,
          }
        : {};

      const response = await axios.get('/inventory-alerts/summary', { params });
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch alert summary');
      throw error;
    }
  },

  // Generate manual alert (for testing)
  async createManualAlert({ commit }, alertData) {
    try {
      const response = await axios.post('/inventory-alerts/manual', alertData);
      commit('ADD_ALERT', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to create manual alert');
      throw error;
    }
  },

  // Filter actions
  setFilters({ commit }, filters) {
    commit('SET_FILTERS', filters);
  },

  clearFilters({ commit }) {
    commit('CLEAR_FILTERS');
  },

  setPagination({ commit }, { page, limit }) {
    if (page) commit('SET_CURRENT_PAGE', page);
    if (limit) commit('SET_ITEMS_PER_PAGE', limit);
  },

  // UI actions
  showSidebar({ commit }) {
    commit('SET_SHOW_SIDEBAR', true);
  },

  hideSidebar({ commit }) {
    commit('SET_SHOW_SIDEBAR', false);
  },

  toggleSidebar({ commit, state }) {
    commit('SET_SHOW_SIDEBAR', !state.showSidebar);
  },

  showPopup({ commit }, alert = null) {
    if (alert) {
      commit('ADD_TO_POPUP_QUEUE', alert);
    }
    commit('SET_SHOW_POPUP', true);
  },

  hidePopup({ commit }) {
    commit('SET_SHOW_POPUP', false);
  },

  removeFromPopupQueue({ commit }, alertId) {
    commit('REMOVE_FROM_POPUP_QUEUE', alertId);
  },

  clearPopupQueue({ commit }) {
    commit('CLEAR_POPUP_QUEUE');
  },

  // WebSocket actions (to be implemented with WebSocket integration)
  initializeWebSocket({ commit }) {
    // WebSocket initialization logic will be added in integration phase
    commit('SET_WEBSOCKET_CONNECTED', false);
  },

  // Audio notification actions
  initializeAudio({ commit }) {
    try {
      if (typeof window !== 'undefined' && window.AudioContext) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        commit('SET_AUDIO_CONTEXT', audioContext);
        commit('SET_AUDIO_ENABLED', true);
      }
    } catch (error) {
      commit('SET_AUDIO_ENABLED', false);
    }
  },

  playAlertSound({ state }, { severity = 'info', duration = 200 }) {
    if (!state.audioEnabled || !state.audioContext || !state.configuration.sound_enabled) {
      return;
    }

    try {
      const context = state.audioContext;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      // Different frequencies for different severities
      const frequencies = {
        critical: 800, // High pitched for critical
        warning: 600, // Medium for warnings
        info: 400, // Lower for info
      };

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(frequencies[severity] || 400, context.currentTime);
      oscillator.type = severity === 'critical' ? 'square' : 'sine';

      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration / 1000);
    } catch (error) {
      // console.error('Failed to play alert sound:', error);
    }
  },

  // Bulk operations
  async performBulkAction({ dispatch }, { action, alertIds, params = {} }) {
    switch (action) {
      case 'acknowledge':
        return dispatch('acknowledgeMultipleAlerts', { alertIds, ...params });
      case 'resolve':
        return dispatch('resolveMultipleAlerts', { alertIds, ...params });
      default:
        throw new Error(`Unknown bulk action: ${action}`);
    }
  },

  // Real-time alert handler (called by WebSocket or polling)
  handleNewAlert({ commit, dispatch, state }, alert) {
    commit('ADD_ALERT', alert);

    // Play sound notification
    if (state.configuration.sound_enabled) {
      dispatch('playAlertSound', { severity: alert.severity });
    }

    // Show popup for critical alerts
    if (alert.severity === 'critical' && state.configuration.popup_enabled) {
      dispatch('showPopup', alert);
    }

    commit('SET_LAST_UPDATE', new Date());
  },

  // Cleanup action
  clearAll({ commit }) {
    commit('SET_ALERTS', []);
    commit('SET_ACTIVE_ALERTS', []);
    commit('SET_CRITICAL_ALERTS', []);
    commit('SET_CURRENT_ALERT', null);
    commit('CLEAR_POPUP_QUEUE');
    commit('CLEAR_ERROR');
    commit('SET_UNREAD_COUNT', 0);
    commit('SET_TOTAL_COUNT', 0);
  },
};
