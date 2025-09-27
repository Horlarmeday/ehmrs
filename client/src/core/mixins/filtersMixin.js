/**
 * Filters Mixin
 * Provides standardized filter management for Vue components
 */
export default {
  data() {
    return {
      // Component-specific filters
      componentFilters: {},
    };
  },

  computed: {
    // Global filters from store
    globalFilters() {
      return this.$store.state.generalStore.filters;
    },

    // Combined filters (global + component)
    allFilters() {
      return {
        ...this.globalFilters,
        ...this.componentFilters,
      };
    },

    // Specific filter getters
    searchFilter() {
      return this.allFilters.search || '';
    },

    categoryFilter() {
      return this.allFilters.category_id || null;
    },

    subcategoryFilter() {
      return this.allFilters.subcategory_id || null;
    },

    statusFilter() {
      return this.allFilters.status || null;
    },

    dateRangeFilter() {
      return this.allFilters.dateRange || null;
    },

    startDateFilter() {
      return this.allFilters.start_date || null;
    },

    endDateFilter() {
      return this.allFilters.end_date || null;
    },

    // Check if any filters are active
    hasActiveFilters() {
      const filters = this.allFilters;
      return Object.keys(filters).some((key) => {
        const value = filters[key];
        return value !== null && value !== undefined && value !== '';
      });
    },

    // Get count of active filters
    activeFiltersCount() {
      const filters = this.allFilters;
      return Object.keys(filters).filter((key) => {
        const value = filters[key];
        return value !== null && value !== undefined && value !== '';
      }).length;
    },
  },

  methods: {
    // Set global filter
    setGlobalFilter(key, value) {
      this.$store.commit('generalStore/SET_FILTER', { key, value });
    },

    // Set multiple global filters
    setGlobalFilters(filters) {
      this.$store.commit('generalStore/SET_FILTERS', filters);
    },

    // Clear specific global filter
    clearGlobalFilter(key) {
      this.$store.commit('generalStore/CLEAR_FILTER', key);
    },

    // Clear all global filters
    clearAllGlobalFilters() {
      this.$store.commit('generalStore/CLEAR_FILTERS');
    },

    // Set component filter
    setComponentFilter(key, value) {
      this.$set(this.componentFilters, key, value);
    },

    // Set multiple component filters
    setComponentFilters(filters) {
      Object.keys(filters).forEach((key) => {
        this.$set(this.componentFilters, key, filters[key]);
      });
    },

    // Clear specific component filter
    clearComponentFilter(key) {
      this.$delete(this.componentFilters, key);
    },

    // Clear all component filters
    clearAllComponentFilters() {
      Object.keys(this.componentFilters).forEach((key) => {
        this.$delete(this.componentFilters, key);
      });
    },

    // Clear all filters (global + component)
    clearAllFilters() {
      this.clearAllGlobalFilters();
      this.clearAllComponentFilters();
    },

    // Get filter value
    getFilter(key) {
      return this.allFilters[key] || null;
    },

    // Check if filter is active
    isFilterActive(key) {
      const value = this.getFilter(key);
      return value !== null && value !== undefined && value !== '';
    },

    // Get active filters for display
    getActiveFilters() {
      const active = {};
      Object.keys(this.allFilters).forEach((key) => {
        const value = this.allFilters[key];
        if (value !== null && value !== undefined && value !== '') {
          active[key] = value;
        }
      });
      return active;
    },

    // Get request parameters with filters
    getFilteredParams(additionalParams = {}) {
      const activeFilters = this.getActiveFilters();
      return {
        ...activeFilters,
        ...additionalParams,
      };
    },

    // Debounced filter change handler
    onFilterChange() {
      // Override in component to handle filter changes
      // This should trigger data reload
    },

    // Debounced search handler
    onSearchChange() {
      // Override in component to handle search changes
      // This should trigger data reload
    },

    // Initialize filters from URL params
    initializeFiltersFromUrl() {
      const query = this.$route.query;
      const filters = {};

      if (query.search) filters.search = query.search;
      if (query.category_id) filters.category_id = parseInt(query.category_id);
      if (query.subcategory_id) filters.subcategory_id = parseInt(query.subcategory_id);
      if (query.status) filters.status = query.status;
      if (query.start_date) filters.start_date = query.start_date;
      if (query.end_date) filters.end_date = query.end_date;

      if (Object.keys(filters).length > 0) {
        this.setGlobalFilters(filters);
      }
    },

    // Update URL with current filters
    updateUrlWithFilters() {
      const activeFilters = this.getActiveFilters();
      const query = { ...this.$route.query };

      // Update query with active filters
      Object.keys(activeFilters).forEach((key) => {
        query[key] = activeFilters[key];
      });

      // Remove empty filters from query
      Object.keys(query).forEach((key) => {
        if (!activeFilters[key]) {
          delete query[key];
        }
      });

      // Update URL without triggering navigation
      this.$router.replace({ query });
    },
  },

  // Initialize filters from URL on component mount
  mounted() {
    this.initializeFiltersFromUrl();
  },

  // Watch for filter changes and update URL
  watch: {
    allFilters: {
      handler() {
        this.updateUrlWithFilters();
      },
      deep: true,
    },
  },
};
