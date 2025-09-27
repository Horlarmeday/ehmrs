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

  // Requests
  requests: [],
  requestsTotal: 0,
  requestsPages: 0,
  currentRequest: null,

  // Dispensaries
  dispensaries: [],
  dispensariesTotal: 0,
  dispensariesPages: 0,
  currentDispensary: null,

  // UI State
  loading: false,
  error: null,
  errorDetails: null,

  // Dashboard State
  dashboardStats: null,
  recentReports: [],

  // Reports State
  stockReport: null,
  movementReport: null,
  usageReport: null,
  costReport: null,

  // Item Movements
  itemMovements: [],

  // Basic pagination state
  pagination: {
    currentPage: 1,
    pageLimit: 20,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },

  // Basic filters
  filters: {
    search: '',
    category_id: null,
    subcategory_id: null,
    status: null,
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
  },
};
