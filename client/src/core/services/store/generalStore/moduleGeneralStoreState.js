export default {
  // Categories
  categories: [],
  categoriesTotal: 0,
  categoriesPages: 0,
  currentCategory: null,

  // Subcategories
  subcategories: [],
  subcategoriesTotal: 0,
  subcategoriesPages: 0,
  currentSubcategory: null,

  // Items
  items: [],
  itemsTotal: 0,
  itemsPages: 0,
  currentItem: null,
  lowStockItems: [],
  expiringItems: [],

  // Stock Movements
  movements: [],
  movementsTotal: 0,
  movementsPages: 0,
  itemMovements: [],

  // Requests
  requests: [],
  requestsTotal: 0,
  requestsPages: 0,
  currentRequest: null,
  myRequests: [],
  pendingApprovalRequests: [],

  // Dispensaries
  dispensaries: [],
  dispensariesTotal: 0,
  dispensariesPages: 0,
  currentDispensary: null,
  dispensaryStock: [],
  dispensaryMetrics: null,

  // Reports
  stockReport: null,
  movementReport: null,
  usageReport: null,
  costReport: null,
  recentReports: [],

  // Dashboard
  dashboardStats: null,

  // Settings
  settings: null,

  // UI State
  loading: false,
  error: null,
  errorDetails: null,

  // Standardized pagination state for all entities
  pagination: {
    currentPage: 1,
    pageLimit: 20,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },

  // Standardized filters
  filters: {
    search: '',
    category_id: null,
    subcategory_id: null,
    status: null,
    dateRange: null,
    start_date: null,
    end_date: null,
  },

  // Loading states for different operations
  loadingStates: {
    categories: false,
    subcategories: false,
    items: false,
    movements: false,
    requests: false,
    dispensaries: false,
    reports: false,
    dashboard: false,
  },

  // Cache management
  cache: {
    timestamps: {},
    ttl: {
      categories: 5 * 60 * 1000, // 5 minutes
      subcategories: 5 * 60 * 1000, // 5 minutes
      items: 2 * 60 * 1000, // 2 minutes
      movements: 1 * 60 * 1000, // 1 minute
      requests: 30 * 1000, // 30 seconds
      dispensaries: 5 * 60 * 1000, // 5 minutes
      dashboard: 1 * 60 * 1000, // 1 minute
    },
  },

  // In-flight requests tracking
  inFlightRequests: {},
};
