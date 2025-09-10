// Migration utilities for transitioning from array-based to normalized state
// Provides backward compatibility and smooth migration path

/**
 * Migrates array-based state to normalized entity structure
 * @param {Object} oldState - Current array-based state
 * @returns {Object} - Normalized state structure
 */
const migrateToNormalizedState = (oldState) => {
  const normalizedState = {
    entities: {
      categories: {
        byId: {},
        allIds: [],
      },
      subcategories: {
        byId: {},
        allIds: [],
        byCategory: {},
      },
      items: {
        byId: {},
        allIds: [],
        byCategory: {},
        bySubcategory: {},
        lowStock: [],
        expiring: [],
      },
      movements: {
        byId: {},
        allIds: [],
        byItem: {},
        byDate: {},
      },
      requests: {
        byId: {},
        allIds: [],
        byStatus: {},
        byUser: {},
        myRequests: [],
        pendingApproval: [],
      },
      dispensaries: {
        byId: {},
        allIds: [],
        stockByDispensary: {},
      },
    },
    currentSelections: {
      category: null,
      subcategory: null,
      item: null,
      movement: null,
      request: null,
      dispensary: null,
    },
    metadata: {
      categories: {
        total: 0,
        pages: 0,
        currentPage: 1,
        lastFetch: null,
        isStale: false,
      },
      subcategories: {
        total: 0,
        pages: 0,
        currentPage: 1,
        lastFetch: null,
        isStale: false,
      },
      items: {
        total: 0,
        pages: 0,
        currentPage: 1,
        lastFetch: null,
        isStale: false,
      },
      movements: {
        total: 0,
        pages: 0,
        currentPage: 1,
        lastFetch: null,
        isStale: false,
      },
      requests: {
        total: 0,
        pages: 0,
        currentPage: 1,
        lastFetch: null,
        isStale: false,
      },
      dispensaries: {
        total: 0,
        pages: 0,
        currentPage: 1,
        lastFetch: null,
        isStale: false,
      },
    },
    ui: {
      loading: {
        categories: false,
        subcategories: false,
        items: false,
        movements: false,
        requests: false,
        dispensaries: false,
        dashboard: false,
        reports: false,
        settings: false,
      },
      filters: {
        categories: {},
        subcategories: {},
        items: {},
        movements: {},
        requests: {},
        dispensaries: {},
      },
      pagination: {
        categories: { page: 1, limit: 10 },
        subcategories: { page: 1, limit: 10 },
        items: { page: 1, limit: 10 },
        movements: { page: 1, limit: 10 },
        requests: { page: 1, limit: 10 },
        dispensaries: { page: 1, limit: 10 },
      },
      error: null,
    },
    cache: {
      config: {
        enabled: true,
        ttl: 5 * 60 * 1000, // 5 minutes
      },
      invalidated: [],
    },
    dashboard: {
      stats: {},
      charts: {},
    },
    reports: {
      stock: null,
      movement: null,
      recent: [],
    },
    settings: {},
  };

  // Migrate categories
  if (oldState.categories && Array.isArray(oldState.categories)) {
    oldState.categories.forEach((category) => {
      normalizedState.entities.categories.byId[category.id] = category;
      normalizedState.entities.categories.allIds.push(category.id);
    });
    normalizedState.metadata.categories.total =
      oldState.categoriesTotal || oldState.categories.length;
    normalizedState.metadata.categories.pages = oldState.categoriesPages || 1;
  }

  // Migrate subcategories
  if (oldState.subcategories && Array.isArray(oldState.subcategories)) {
    oldState.subcategories.forEach((subcategory) => {
      normalizedState.entities.subcategories.byId[subcategory.id] = subcategory;
      normalizedState.entities.subcategories.allIds.push(subcategory.id);

      // Create category lookup
      if (subcategory.category_id) {
        if (!normalizedState.entities.subcategories.byCategory[subcategory.category_id]) {
          normalizedState.entities.subcategories.byCategory[subcategory.category_id] = [];
        }
        normalizedState.entities.subcategories.byCategory[subcategory.category_id].push(
          subcategory.id
        );
      }
    });
    normalizedState.metadata.subcategories.total =
      oldState.subcategoriesTotal || oldState.subcategories.length;
    normalizedState.metadata.subcategories.pages = oldState.subcategoriesPages || 1;
  }

  // Migrate items
  if (oldState.items && Array.isArray(oldState.items)) {
    oldState.items.forEach((item) => {
      normalizedState.entities.items.byId[item.id] = item;
      normalizedState.entities.items.allIds.push(item.id);

      // Create category lookup
      if (item.category_id) {
        if (!normalizedState.entities.items.byCategory[item.category_id]) {
          normalizedState.entities.items.byCategory[item.category_id] = [];
        }
        normalizedState.entities.items.byCategory[item.category_id].push(item.id);
      }

      // Create subcategory lookup
      if (item.subcategory_id) {
        if (!normalizedState.entities.items.bySubcategory[item.subcategory_id]) {
          normalizedState.entities.items.bySubcategory[item.subcategory_id] = [];
        }
        normalizedState.entities.items.bySubcategory[item.subcategory_id].push(item.id);
      }

      // Track special item states
      if (item.is_low_stock) {
        normalizedState.entities.items.lowStock.push(item.id);
      }
      if (item.is_expiring) {
        normalizedState.entities.items.expiring.push(item.id);
      }
    });
    normalizedState.metadata.items.total = oldState.itemsTotal || oldState.items.length;
    normalizedState.metadata.items.pages = oldState.itemsPages || 1;
  }

  // Migrate movements
  if (oldState.movements && Array.isArray(oldState.movements)) {
    oldState.movements.forEach((movement) => {
      normalizedState.entities.movements.byId[movement.id] = movement;
      normalizedState.entities.movements.allIds.push(movement.id);

      // Create item lookup
      if (movement.item_id) {
        if (!normalizedState.entities.movements.byItem[movement.item_id]) {
          normalizedState.entities.movements.byItem[movement.item_id] = [];
        }
        normalizedState.entities.movements.byItem[movement.item_id].push(movement.id);
      }

      // Create date lookup
      if (movement.movement_date) {
        const dateKey = movement.movement_date.split('T')[0]; // Extract date part
        if (!normalizedState.entities.movements.byDate[dateKey]) {
          normalizedState.entities.movements.byDate[dateKey] = [];
        }
        normalizedState.entities.movements.byDate[dateKey].push(movement.id);
      }
    });
    normalizedState.metadata.movements.total = oldState.movementsTotal || oldState.movements.length;
    normalizedState.metadata.movements.pages = oldState.movementsPages || 1;
  }

  // Migrate requests
  if (oldState.requests && Array.isArray(oldState.requests)) {
    oldState.requests.forEach((request) => {
      normalizedState.entities.requests.byId[request.id] = request;
      normalizedState.entities.requests.allIds.push(request.id);

      // Create status lookup
      if (request.status) {
        if (!normalizedState.entities.requests.byStatus[request.status]) {
          normalizedState.entities.requests.byStatus[request.status] = [];
        }
        normalizedState.entities.requests.byStatus[request.status].push(request.id);
      }

      // Create user lookup
      if (request.user_id) {
        if (!normalizedState.entities.requests.byUser[request.user_id]) {
          normalizedState.entities.requests.byUser[request.user_id] = [];
        }
        normalizedState.entities.requests.byUser[request.user_id].push(request.id);
      }

      // Track special request collections
      if (request.is_my_request) {
        normalizedState.entities.requests.myRequests.push(request.id);
      }
      if (request.status === 'pending_approval') {
        normalizedState.entities.requests.pendingApproval.push(request.id);
      }
    });
    normalizedState.metadata.requests.total = oldState.requestsTotal || oldState.requests.length;
    normalizedState.metadata.requests.pages = oldState.requestsPages || 1;
  }

  // Migrate dispensaries
  if (oldState.dispensaries && Array.isArray(oldState.dispensaries)) {
    oldState.dispensaries.forEach((dispensary) => {
      normalizedState.entities.dispensaries.byId[dispensary.id] = dispensary;
      normalizedState.entities.dispensaries.allIds.push(dispensary.id);
    });
    normalizedState.metadata.dispensaries.total =
      oldState.dispensariesTotal || oldState.dispensaries.length;
    normalizedState.metadata.dispensaries.pages = oldState.dispensariesPages || 1;
  }

  // Migrate current selections
  if (oldState.currentCategory) {
    normalizedState.currentSelections.category =
      oldState.currentCategory.id || oldState.currentCategory;
  }
  if (oldState.currentSubcategory) {
    normalizedState.currentSelections.subcategory =
      oldState.currentSubcategory.id || oldState.currentSubcategory;
  }
  if (oldState.currentItem) {
    normalizedState.currentSelections.item = oldState.currentItem.id || oldState.currentItem;
  }
  if (oldState.currentRequest) {
    normalizedState.currentSelections.request =
      oldState.currentRequest.id || oldState.currentRequest;
  }

  // Migrate UI state
  if (oldState.loading !== undefined) {
    // If old state has a single loading flag, apply it to all entities
    Object.keys(normalizedState.ui.loading).forEach((key) => {
      normalizedState.ui.loading[key] = oldState.loading;
    });
  }

  // Migrate filters and pagination if they exist
  if (oldState.filters) {
    normalizedState.ui.filters = { ...normalizedState.ui.filters, ...oldState.filters };
  }
  if (oldState.pagination) {
    normalizedState.ui.pagination = { ...normalizedState.ui.pagination, ...oldState.pagination };
  }

  // Migrate dashboard data
  if (oldState.dashboardStats) {
    normalizedState.dashboard.stats = oldState.dashboardStats;
  }

  // Migrate reports
  if (oldState.stockReport) {
    normalizedState.reports.stock = oldState.stockReport;
  }
  if (oldState.movementReport) {
    normalizedState.reports.movement = oldState.movementReport;
  }
  if (oldState.recentReports) {
    normalizedState.reports.recent = oldState.recentReports;
  }

  // Migrate settings
  if (oldState.settings) {
    normalizedState.settings = oldState.settings;
  }

  return normalizedState;
};

/**
 * Creates backward compatibility getters for components still using array-based access
 * @param {Object} normalizedState - Normalized state structure
 * @returns {Object} - Backward compatible state object
 */
const createBackwardCompatibleState = (normalizedState) => {
  return {
    // Array-based access for backward compatibility
    categories: normalizedState.entities.categories.allIds.map(
      (id) => normalizedState.entities.categories.byId[id]
    ),
    subcategories: normalizedState.entities.subcategories.allIds.map(
      (id) => normalizedState.entities.subcategories.byId[id]
    ),
    items: normalizedState.entities.items.allIds.map(
      (id) => normalizedState.entities.items.byId[id]
    ),
    movements: normalizedState.entities.movements.allIds.map(
      (id) => normalizedState.entities.movements.byId[id]
    ),
    requests: normalizedState.entities.requests.allIds.map(
      (id) => normalizedState.entities.requests.byId[id]
    ),
    dispensaries: normalizedState.entities.dispensaries.allIds.map(
      (id) => normalizedState.entities.dispensaries.byId[id]
    ),

    // Current selections
    currentCategory: normalizedState.currentSelections.category
      ? normalizedState.entities.categories.byId[normalizedState.currentSelections.category]
      : null,
    currentSubcategory: normalizedState.currentSelections.subcategory
      ? normalizedState.entities.subcategories.byId[normalizedState.currentSelections.subcategory]
      : null,
    currentItem: normalizedState.currentSelections.item
      ? normalizedState.entities.items.byId[normalizedState.currentSelections.item]
      : null,
    currentRequest: normalizedState.currentSelections.request
      ? normalizedState.entities.requests.byId[normalizedState.currentSelections.request]
      : null,

    // Totals and pagination
    categoriesTotal: normalizedState.metadata.categories.total,
    categoriesPages: normalizedState.metadata.categories.pages,
    subcategoriesTotal: normalizedState.metadata.subcategories.total,
    subcategoriesPages: normalizedState.metadata.subcategories.pages,
    itemsTotal: normalizedState.metadata.items.total,
    itemsPages: normalizedState.metadata.items.pages,
    movementsTotal: normalizedState.metadata.movements.total,
    movementsPages: normalizedState.metadata.movements.pages,
    requestsTotal: normalizedState.metadata.requests.total,
    requestsPages: normalizedState.metadata.requests.pages,
    dispensariesTotal: normalizedState.metadata.dispensaries.total,
    dispensariesPages: normalizedState.metadata.dispensaries.pages,

    // UI state
    loading: normalizedState.ui.loading.items || false, // Default to items loading for backward compatibility
    filters: normalizedState.ui.filters,
    pagination: normalizedState.ui.pagination,
    error: normalizedState.ui.error,

    // Dashboard and reports
    dashboardStats: normalizedState.dashboard.stats,
    stockReport: normalizedState.reports.stock,
    movementReport: normalizedState.reports.movement,
    recentReports: normalizedState.reports.recent,

    // Settings
    settings: normalizedState.settings,
  };
};

/**
 * Validates the normalized state structure
 * @param {Object} state - State to validate
 * @returns {Object} - Validation result with isValid flag and errors array
 */
const validateNormalizedState = (state) => {
  const errors = [];

  // Check required top-level properties
  const requiredProps = ['entities', 'currentSelections', 'metadata', 'ui', 'cache'];
  requiredProps.forEach((prop) => {
    if (!state[prop]) {
      errors.push(`Missing required property: ${prop}`);
    }
  });

  // Check entities structure
  if (state.entities) {
    const requiredEntities = [
      'categories',
      'subcategories',
      'items',
      'movements',
      'requests',
      'dispensaries',
    ];
    requiredEntities.forEach((entity) => {
      if (!state.entities[entity]) {
        errors.push(`Missing entity: ${entity}`);
      } else {
        if (!state.entities[entity].byId || !state.entities[entity].allIds) {
          errors.push(`Entity ${entity} missing byId or allIds`);
        }

        // Validate ID consistency
        const byIdKeys = Object.keys(state.entities[entity].byId);
        const allIds = state.entities[entity].allIds;

        if (byIdKeys.length !== allIds.length) {
          errors.push(`Entity ${entity} has inconsistent byId and allIds lengths`);
        }

        allIds.forEach((id) => {
          if (!state.entities[entity].byId[id]) {
            errors.push(`Entity ${entity} missing byId entry for ID: ${id}`);
          }
        });
      }
    });
  }

  // Check metadata structure
  if (state.metadata) {
    const requiredEntities = [
      'categories',
      'subcategories',
      'items',
      'movements',
      'requests',
      'dispensaries',
    ];
    requiredEntities.forEach((entity) => {
      if (!state.metadata[entity]) {
        errors.push(`Missing metadata for entity: ${entity}`);
      } else {
        const requiredMetaProps = ['total', 'pages', 'currentPage', 'lastFetch', 'isStale'];
        requiredMetaProps.forEach((prop) => {
          if (state.metadata[entity][prop] === undefined) {
            errors.push(`Missing metadata property ${prop} for entity: ${entity}`);
          }
        });
      }
    });
  }

  // Check UI structure
  if (state.ui) {
    const requiredUIProps = ['loading', 'filters', 'pagination', 'error'];
    requiredUIProps.forEach((prop) => {
      if (state.ui[prop] === undefined) {
        errors.push(`Missing UI property: ${prop}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Performance monitoring utilities
 */
const performanceMonitor = {
  /**
   * Measures the time taken for state operations
   * @param {string} operation - Operation name
   * @param {Function} fn - Function to measure
   * @returns {*} - Function result
   */
  measure(operation, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    console.debug(`[GeneralStore] ${operation} took ${(end - start).toFixed(2)}ms`);

    return result;
  },

  /**
   * Logs state size information
   * @param {Object} state - State to analyze
   */
  logStateSize(state) {
    const entityCounts = {};

    if (state.entities) {
      Object.keys(state.entities).forEach((entity) => {
        entityCounts[entity] = state.entities[entity].allIds
          ? state.entities[entity].allIds.length
          : 0;
      });
    }

    console.debug('[GeneralStore] State size:', entityCounts);
  },

  /**
   * Checks for potential memory leaks
   * @param {Object} state - State to check
   * @returns {Array} - Array of potential issues
   */
  checkMemoryLeaks(state) {
    const issues = [];

    if (state.entities) {
      Object.keys(state.entities).forEach((entity) => {
        const entityData = state.entities[entity];

        // Check for orphaned IDs
        if (entityData.allIds && entityData.byId) {
          entityData.allIds.forEach((id) => {
            if (!entityData.byId[id]) {
              issues.push(`Orphaned ID ${id} in ${entity}.allIds`);
            }
          });

          Object.keys(entityData.byId).forEach((id) => {
            if (!entityData.allIds.includes(parseInt(id))) {
              issues.push(`Orphaned entity ${id} in ${entity}.byId`);
            }
          });
        }

        // Check for excessive cache size
        if (entityData.allIds && entityData.allIds.length > 10000) {
          issues.push(`Large entity cache for ${entity}: ${entityData.allIds.length} items`);
        }
      });
    }

    return issues;
  },
};

/**
 * Development utilities for debugging
 */
const devUtils = {
  /**
   * Exports current state for debugging
   * @param {Object} state - State to export
   * @returns {string} - JSON string of state
   */
  exportState(state) {
    return JSON.stringify(state, null, 2);
  },

  /**
   * Imports state from JSON string
   * @param {string} stateJson - JSON string of state
   * @returns {Object} - Parsed state object
   */
  importState(stateJson) {
    try {
      return JSON.parse(stateJson);
    } catch (error) {
      console.error('Failed to import state:', error);
      return null;
    }
  },

  /**
   * Compares two states and reports differences
   * @param {Object} oldState - Previous state
   * @param {Object} newState - New state
   * @returns {Array} - Array of differences
   */
  compareStates(oldState, newState) {
    const differences = [];

    // Compare entity counts
    if (oldState.entities && newState.entities) {
      Object.keys(oldState.entities).forEach((entity) => {
        const oldCount = oldState.entities[entity].allIds
          ? oldState.entities[entity].allIds.length
          : 0;
        const newCount = newState.entities[entity].allIds
          ? newState.entities[entity].allIds.length
          : 0;

        if (oldCount !== newCount) {
          differences.push(`${entity} count changed from ${oldCount} to ${newCount}`);
        }
      });
    }

    return differences;
  },
};

/**
 * Create migration plan with analysis and recommendations
 * @param {Object} currentState - Current state to analyze
 * @returns {Object} Migration plan with recommendations
 */
const createMigrationPlan = (currentState) => {
  const validation = validateNormalizedState(currentState);
  const memoryIssues = performanceMonitor.checkMemoryLeaks(currentState);

  const plan = {
    needsMigration: !validation.isValid || memoryIssues.length > 0,
    validationErrors: validation.errors,
    memoryIssues: memoryIssues,
    recommendedActions: [],
    estimatedBenefits: {
      performanceImprovement: '20-40%',
      memoryReduction: '15-30%',
      codeComplexity: 'Reduced',
    },
  };

  if (!validation.isValid) {
    plan.recommendedActions.push('Fix state structure validation errors');
  }

  if (memoryIssues.length > 0) {
    plan.recommendedActions.push('Address memory leak issues');
  }

  if (plan.needsMigration) {
    plan.recommendedActions.push('Migrate to normalized state structure');
    plan.recommendedActions.push('Implement backward compatibility layer');
    plan.recommendedActions.push('Update components to use new getters');
  }

  return plan;
};

module.exports = {
  migrateToNormalizedState,
  createBackwardCompatibleState,
  validateNormalizedState,
  performanceMonitor,
  devUtils,
  createMigrationPlan,
};
