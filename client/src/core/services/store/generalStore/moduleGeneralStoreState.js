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

  // Reports
  stockReport: null,
  movementReport: null,
  usageReport: null,
  costReport: null,

  // UI State
  loading: false,
  error: null,
  filters: {
    category_id: null,
    subcategory_id: null,
    status: null,
    search: '',
    dateRange: null,
  },
  pagination: {
    page: 1,
    limit: 20,
  },
};
