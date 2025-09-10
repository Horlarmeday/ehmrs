export default {
  // Alert data
  alerts: [],
  activeAlerts: [],
  criticalAlerts: [],
  unreadCount: 0,
  totalCount: 0,

  // Current alert details
  currentAlert: null,

  // Pagination and filters
  currentPage: 1,
  itemsPerPage: 20,
  totalPages: 0,
  filters: {
    severity: null, // critical, warning, info
    category: null, // expiry, stock_level, procurement, financial
    status: null, // active, acknowledged, resolved
    store_type: null, // pharmacy, general_store
    date_range: null,
  },

  // Configuration
  configuration: {
    sound_enabled: true,
    popup_enabled: true,
    banner_enabled: true,
    auto_acknowledge: false,
    escalation_minutes: 30,
    thresholds: {
      critical_stock_level: 5,
      warning_stock_level: 20,
      expiry_days_critical: 7,
      expiry_days_warning: 30,
    },
  },

  // UI state
  showSidebar: false,
  showPopup: false,
  popupQueue: [],
  loading: false,
  error: null,

  // Real-time connection
  websocketConnected: false,
  lastUpdate: null,

  // Audio context for notifications
  audioContext: null,
  audioEnabled: true,
};
