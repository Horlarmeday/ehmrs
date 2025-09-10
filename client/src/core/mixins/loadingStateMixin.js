/**
 * Loading State Mixin
 * Provides standardized loading state management for Vue components
 */
export default {
  data() {
    return {
      // Component-specific loading states
      componentLoading: false,
    };
  },
  
  computed: {
    // Global loading state from store
    globalLoading() {
      return this.$store.state.generalStore.loading;
    },
    
    // Specific operation loading states
    categoriesLoading() {
      return this.$store.state.generalStore.loadingStates.categories;
    },
    
    subcategoriesLoading() {
      return this.$store.state.generalStore.loadingStates.subcategories;
    },
    
    itemsLoading() {
      return this.$store.state.generalStore.loadingStates.items;
    },
    
    movementsLoading() {
      return this.$store.state.generalStore.loadingStates.movements;
    },
    
    requestsLoading() {
      return this.$store.state.generalStore.loadingStates.requests;
    },
    
    dispensariesLoading() {
      return this.$store.state.generalStore.loadingStates.dispensaries;
    },
    
    reportsLoading() {
      return this.$store.state.generalStore.loadingStates.reports;
    },
    
    dashboardLoading() {
      return this.$store.state.generalStore.loadingStates.dashboard;
    },
    
    // Combined loading state
    isLoading() {
      return this.globalLoading || this.componentLoading;
    },
    
    // Check if any specific operation is loading
    hasLoadingOperations() {
      const loadingStates = this.$store.state.generalStore.loadingStates;
      return Object.values(loadingStates).some(loading => loading === true);
    },
  },
  
  methods: {
    // Set component loading state
    setComponentLoading(loading) {
      this.componentLoading = loading;
    },
    
    // Set specific operation loading state
    setOperationLoading(operation, loading) {
      this.$store.commit('generalStore/SET_LOADING_STATE', { operation, loading });
    },
    
    // Set multiple loading states at once
    setMultipleLoadingStates(loadingStates) {
      this.$store.commit('generalStore/SET_MULTIPLE_LOADING_STATES', loadingStates);
    },
    
    // Clear all loading states
    clearAllLoadingStates() {
      this.$store.commit('generalStore/CLEAR_ALL_LOADING_STATES');
      this.componentLoading = false;
    },
    
    // Check if specific operation is loading
    isOperationLoading(operation) {
      return this.$store.state.generalStore.loadingStates[operation] || false;
    },
    
    // Wrapper for async operations with loading state
    async withLoading(operation, loadingKey = 'component') {
      try {
        if (loadingKey === 'component') {
          this.setComponentLoading(true);
        } else {
          this.setOperationLoading(loadingKey, true);
        }
        
        const result = await operation();
        return result;
      } finally {
        if (loadingKey === 'component') {
          this.setComponentLoading(false);
        } else {
          this.setOperationLoading(loadingKey, false);
        }
      }
    },
    
    // Wrapper for multiple async operations with loading states
    async withMultipleLoading(operations) {
      try {
        const loadingStates = {};
        Object.keys(operations).forEach(key => {
          loadingStates[key] = true;
        });
        this.setMultipleLoadingStates(loadingStates);
        
        const results = {};
        for (const [key, operation] of Object.entries(operations)) {
          results[key] = await operation();
        }
        
        return results;
      } finally {
        this.clearAllLoadingStates();
      }
    },
  },
  
  // Cleanup on component destruction
  beforeDestroy() {
    this.clearAllLoadingStates();
  },
};



