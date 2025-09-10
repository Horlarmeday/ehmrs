// Normalized state structure for better performance and consistency
// Uses entity-based organization with lookup tables

const normalizedState = () => ({
  // Normalized entities with ID-based lookup
  entities: {
    categories: {
      byId: {}, // { 1: { id: 1, name: 'Category 1', ... }, 2: { ... } }
      allIds: [], // [1, 2, 3, ...]
    },
    subcategories: {
      byId: {},
      allIds: [],
      byCategory: {}, // { categoryId: [subcategoryId1, subcategoryId2, ...] }
    },
    items: {
      byId: {},
      allIds: [],
      byCategory: {}, // { categoryId: [itemId1, itemId2, ...] }
      bySubcategory: {}, // { subcategoryId: [itemId1, itemId2, ...] }
      lowStock: [], // [itemId1, itemId2, ...] - IDs of low stock items
      expiring: [], // [itemId1, itemId2, ...] - IDs of expiring items
    },
    movements: {
      byId: {},
      allIds: [],
      byItem: {}, // { itemId: [movementId1, movementId2, ...] }
      byDate: {}, // { 'YYYY-MM-DD': [movementId1, movementId2, ...] }
    },
    requests: {
      byId: {},
      allIds: [],
      byStatus: {}, // { 'pending': [requestId1, ...], 'approved': [...] }
      byUser: {}, // { userId: [requestId1, requestId2, ...] }
      myRequests: [], // Current user's request IDs
      pendingApproval: [], // Request IDs pending approval
    },
    dispensaries: {
      byId: {},
      allIds: [],
      stockByDispensary: {}, // { dispensaryId: { itemId: stockData } }
    },
  },

  // Current selections (single entities)
  currentSelections: {
    categoryId: null,
    subcategoryId: null,
    itemId: null,
    requestId: null,
    dispensaryId: null,
  },

  // Metadata for collections
  metadata: {
    categories: {
      total: 0,
      pages: 0,
      lastFetch: null,
      isStale: false,
    },
    subcategories: {
      total: 0,
      pages: 0,
      lastFetch: null,
      isStale: false,
    },
    items: {
      total: 0,
      pages: 0,
      lastFetch: null,
      isStale: false,
    },
    movements: {
      total: 0,
      pages: 0,
      lastFetch: null,
      isStale: false,
    },
    requests: {
      total: 0,
      pages: 0,
      lastFetch: null,
      isStale: false,
    },
    dispensaries: {
      total: 0,
      pages: 0,
      lastFetch: null,
      isStale: false,
    },
  },

  // Reports (non-normalized as they're typically aggregated data)
  reports: {
    stock: null,
    movement: null,
    usage: null,
    cost: null,
    recent: [], // Array of recent report summaries
  },

  // Dashboard data (aggregated, non-normalized)
  dashboard: {
    stats: null,
    metrics: null,
    lastUpdated: null,
  },

  // Settings (global configuration)
  settings: {
    data: null,
    lastUpdated: null,
  },

  // UI State
  ui: {
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
  },

  // Cache management
  cache: {
    // Cache invalidation timestamps
    invalidation: {
      categories: null,
      subcategories: null,
      items: null,
      movements: null,
      requests: null,
      dispensaries: null,
    },
    // Cache configuration
    config: {
      ttl: 5 * 60 * 1000, // 5 minutes default TTL
      maxAge: 30 * 60 * 1000, // 30 minutes max age
    },
  },
});

module.exports = normalizedState;
