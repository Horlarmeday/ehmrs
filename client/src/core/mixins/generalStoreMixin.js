/**
 * General Store Mixin
 * Combines all standardized functionality for General Store components
 */
import loadingStateMixin from './loadingStateMixin';
import paginationMixin from './paginationMixin';
import filtersMixin from './filtersMixin';
import cleanupMixin from './cleanupMixin';

export default {
  mixins: [
    loadingStateMixin,
    paginationMixin,
    filtersMixin,
    cleanupMixin,
  ],
  
  computed: {
    // Store state getters
    storeError() {
      return this.$store.state.generalStore.error;
    },
    
    storeErrorDetails() {
      return this.$store.state.generalStore.errorDetails;
    },
    
    // Entity data getters
    categories() {
      return this.$store.state.generalStore.categories || [];
    },
    
    subcategories() {
      return this.$store.state.generalStore.subcategories || [];
    },
    
    items() {
      return this.$store.state.generalStore.items || [];
    },
    
    movements() {
      return this.$store.state.generalStore.movements || [];
    },
    
    requests() {
      return this.$store.state.generalStore.requests || [];
    },
    
    dispensaries() {
      return this.$store.state.generalStore.dispensaries || [];
    },
    
    // Current entity getters
    currentCategory() {
      return this.$store.state.generalStore.currentCategory;
    },
    
    currentSubcategory() {
      return this.$store.state.generalStore.currentSubcategory;
    },
    
    currentItem() {
      return this.$store.state.generalStore.currentItem;
    },
    
    currentRequest() {
      return this.$store.state.generalStore.currentRequest;
    },
    
    currentDispensary() {
      return this.$store.state.generalStore.currentDispensary;
    },
    
    // Specialized data getters
    lowStockItems() {
      return this.$store.state.generalStore.lowStockItems || [];
    },
    
    expiringItems() {
      return this.$store.state.generalStore.expiringItems || [];
    },
    
    itemMovements() {
      return this.$store.state.generalStore.itemMovements || [];
    },
    
    recentReports() {
      return this.$store.state.generalStore.recentReports || [];
    },
    
    dashboardStats() {
      return this.$store.state.generalStore.dashboardStats;
    },
  },
  
  methods: {
    // Standardized data loading methods
    async loadCategories(params = {}) {
      return this.withLoading(
        () => this.$store.dispatch('generalStore/fetchCategories', params),
        'categories'
      );
    },
    
    async loadSubcategories(params = {}) {
      return this.withLoading(
        () => this.$store.dispatch('generalStore/fetchSubcategories', params),
        'subcategories'
      );
    },
    
    async loadItems(params = {}) {
      return this.withLoading(
        () => this.$store.dispatch('generalStore/fetchItems', params),
        'items'
      );
    },
    
    async loadMovements(params = {}) {
      return this.withLoading(
        () => this.$store.dispatch('generalStore/fetchMovements', params),
        'movements'
      );
    },
    
    async loadRequests(params = {}) {
      return this.withLoading(
        () => this.$store.dispatch('generalStore/fetchRequests', params),
        'requests'
      );
    },
    
    async loadDispensaries(params = {}) {
      return this.withLoading(
        () => this.$store.dispatch('generalStore/fetchDispensaries', params),
        'dispensaries'
      );
    },
    
    // Load multiple entities at once
    async loadMultipleEntities(entities, params = {}) {
      const operations = {};
      entities.forEach(entity => {
        switch (entity) {
          case 'categories':
            operations.categories = () => this.$store.dispatch('generalStore/fetchCategories', params);
            break;
          case 'subcategories':
            operations.subcategories = () => this.$store.dispatch('generalStore/fetchSubcategories', params);
            break;
          case 'items':
            operations.items = () => this.$store.dispatch('generalStore/fetchItems', params);
            break;
          case 'movements':
            operations.movements = () => this.$store.dispatch('generalStore/fetchMovements', params);
            break;
          case 'requests':
            operations.requests = () => this.$store.dispatch('generalStore/fetchRequests', params);
            break;
          case 'dispensaries':
            operations.dispensaries = () => this.$store.dispatch('generalStore/fetchDispensaries', params);
            break;
        }
      });
      
      return this.withMultipleLoading(operations);
    },
    
    // Standardized CRUD operations
    async createCategory(data) {
      return this.withLoading(
        () => this.$store.dispatch('generalStore/createCategory', data),
        'categories'
      );
    },
    
    async updateCategory(id, data) {
      return this.withLoading(
        () => this.$store.dispatch('generalStore/updateCategory', { id, data }),
        'categories'
      );
    },
    
    async deleteCategory(id) {
      return this.withLoading(
        () => this.$store.dispatch('generalStore/deleteCategory', id),
        'categories'
      );
    },
    
    // Error handling
    clearError() {
      this.$store.commit('generalStore/CLEAR_ERROR');
    },
    
    // Refresh data with current filters and pagination
    async refreshData() {
      const params = this.getRequestParams();
      // Override in component to specify which entities to refresh
      return this.loadMultipleEntities(['categories', 'items'], params);
    },
    
    // Reset and reload data
    async resetAndReload() {
      this.resetPagination();
      this.clearAllFilters();
      return this.refreshData();
    },
  },
};


