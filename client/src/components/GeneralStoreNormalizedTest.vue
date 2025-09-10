<template>
  <div class="normalized-test-container p-4">
    <h2 class="mb-4">General Store Normalized State Test</h2>
    
    <!-- Cache Status Section -->
    <div class="card mb-4">
      <div class="card-header">
        <h5>Cache Status</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-3" v-for="entityType in entityTypes" :key="entityType">
            <div class="cache-status">
              <strong>{{ entityType }}:</strong>
              <span :class="getCacheStatusClass(entityType)">
                {{ isCacheValid(entityType) ? 'Valid' : 'Invalid' }}
              </span>
              <small class="d-block text-muted">
                Last updated: {{ getCacheTimestamp(entityType) }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Entity Counts Section -->
    <div class="card mb-4">
      <div class="card-header">
        <h5>Entity Counts</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-2" v-for="entityType in entityTypes" :key="entityType">
            <div class="text-center">
              <h4 class="text-primary">{{ getEntityCount(entityType) }}</h4>
              <small>{{ entityType }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading States Section -->
    <div class="card mb-4">
      <div class="card-header">
        <h5>Loading States</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4" v-for="entityType in entityTypes" :key="entityType">
            <h6>{{ entityType }}</h6>
            <ul class="list-unstyled">
              <li v-for="operation in ['fetch', 'create', 'update', 'delete']" :key="operation">
                <span :class="getLoadingClass(entityType, operation)">
                  {{ operation }}: {{ isLoading(entityType, operation) ? 'Loading...' : 'Ready' }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Error States Section -->
    <div class="card mb-4">
      <div class="card-header">
        <h5>Error States</h5>
      </div>
      <div class="card-body">
        <div v-if="hasAnyErrors" class="alert alert-warning">
          <h6>Active Errors:</h6>
          <ul>
            <li v-for="error in getAllErrors" :key="error.key">
              <strong>{{ error.type }}.{{ error.subType }}:</strong> {{ error.message }}
            </li>
          </ul>
          <button @click="clearAllErrors" class="btn btn-sm btn-outline-warning mt-2">
            Clear All Errors
          </button>
        </div>
        <div v-else class="text-success">
          <i class="fas fa-check-circle"></i> No errors detected
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="card mb-4">
      <div class="card-header">
        <h5>Active Filters</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <h6>Global Search</h6>
            <input 
              v-model="globalSearchTerm" 
              @input="updateGlobalSearch"
              class="form-control mb-3" 
              placeholder="Search across all entities..."
            >
          </div>
          <div class="col-md-6">
            <h6>Entity Filters</h6>
            <div v-for="entityType in entityTypes" :key="entityType" class="mb-2">
              <label class="form-label">{{ entityType }} filter:</label>
              <input 
                :value="getActiveFilters(entityType).search || ''"
                @input="updateEntityFilter(entityType, 'search', $event.target.value)"
                class="form-control form-control-sm" 
                :placeholder="`Filter ${entityType}...`"
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Section -->
    <div class="card mb-4">
      <div class="card-header">
        <h5>Pagination Status</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4" v-for="entityType in paginatedEntities" :key="entityType">
            <h6>{{ entityType }}</h6>
            <div class="pagination-info">
              <p class="mb-1">
                <strong>Page:</strong> {{ getPagination(entityType).currentPage }} / {{ getPagination(entityType).totalPages }}
              </p>
              <p class="mb-1">
                <strong>Items:</strong> {{ getPagination(entityType).totalItems }}
              </p>
              <p class="mb-0">
                <strong>Per Page:</strong> {{ getPagination(entityType).itemsPerPage }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Selections Section -->
    <div class="card mb-4">
      <div class="card-header">
        <h5>Current Selections</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <h6>Category</h6>
            <p>{{ getCurrentCategory ? getCurrentCategory.name : 'None selected' }}</p>
          </div>
          <div class="col-md-3">
            <h6>Subcategory</h6>
            <p>{{ getCurrentSubcategory ? getCurrentSubcategory.name : 'None selected' }}</p>
          </div>
          <div class="col-md-3">
            <h6>Item</h6>
            <p>{{ getCurrentItem ? getCurrentItem.name : 'None selected' }}</p>
          </div>
          <div class="col-md-3">
            <h6>Request</h6>
            <p>{{ getCurrentRequest ? getCurrentRequest.id : 'None selected' }}</p>
          </div>
        </div>
        <div class="mt-3">
          <h6>Selected Items ({{ getSelectedItems.length }})</h6>
          <div v-if="getSelectedItems.length > 0">
            <span v-for="itemId in getSelectedItems" :key="itemId" class="badge badge-primary mr-1">
              {{ getItemById(itemId)?.name || itemId }}
            </span>
          </div>
          <p v-else class="text-muted">No items selected</p>
        </div>
      </div>
    </div>

    <!-- Specialized Collections Section -->
    <div class="card mb-4">
      <div class="card-header">
        <h5>Specialized Collections</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <h6>Low Stock Items</h6>
            <p class="text-warning">{{ getLowStockItems.length }} items</p>
            <button @click="fetchLowStockItems" class="btn btn-sm btn-outline-warning">
              Refresh
            </button>
          </div>
          <div class="col-md-3">
            <h6>Expiring Items</h6>
            <p class="text-danger">{{ getExpiringItems.length }} items</p>
            <button @click="fetchExpiringItems" class="btn btn-sm btn-outline-danger">
              Refresh
            </button>
          </div>
          <div class="col-md-3">
            <h6>My Requests</h6>
            <p class="text-info">{{ getMyRequests.length }} requests</p>
            <button @click="fetchMyRequests" class="btn btn-sm btn-outline-info">
              Refresh
            </button>
          </div>
          <div class="col-md-3">
            <h6>Pending Approval</h6>
            <p class="text-secondary">{{ getPendingApprovalRequests.length }} requests</p>
            <button @click="fetchPendingApprovalRequests" class="btn btn-sm btn-outline-secondary">
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Section -->
    <div class="card mb-4">
      <div class="card-header">
        <h5>Test Actions</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <h6>Data Operations</h6>
            <button @click="refreshAllData" class="btn btn-primary btn-sm mb-2 d-block">
              Refresh All Data
            </button>
            <button @click="invalidateAllCaches" class="btn btn-warning btn-sm mb-2 d-block">
              Invalidate Caches
            </button>
            <button @click="clearAllFilters" class="btn btn-secondary btn-sm d-block">
              Clear All Filters
            </button>
          </div>
          <div class="col-md-3">
            <h6>Test Data Fetch</h6>
            <button @click="testFetchCategories" class="btn btn-outline-primary btn-sm mb-2 d-block">
              Fetch Categories
            </button>
            <button @click="testFetchItems" class="btn btn-outline-primary btn-sm mb-2 d-block">
              Fetch Items
            </button>
            <button @click="testFetchRequests" class="btn btn-outline-primary btn-sm d-block">
              Fetch Requests
            </button>
          </div>
          <div class="col-md-3">
            <h6>Selection Tests</h6>
            <button @click="selectRandomItems" class="btn btn-outline-success btn-sm mb-2 d-block">
              Select Random Items
            </button>
            <button @click="clearSelections" class="btn btn-outline-danger btn-sm mb-2 d-block">
              Clear Selections
            </button>
            <button @click="selectFirstCategory" class="btn btn-outline-info btn-sm d-block">
              Select First Category
            </button>
          </div>
          <div class="col-md-3">
            <h6>Dashboard</h6>
            <button @click="fetchDashboardStats" class="btn btn-outline-dark btn-sm mb-2 d-block">
              Fetch Dashboard Stats
            </button>
            <div v-if="getDashboardStats">
              <small class="text-muted">Stats loaded successfully</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Information -->
    <div class="card">
      <div class="card-header">
        <h5>Debug Information</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <h6>State Structure</h6>
            <pre class="bg-light p-2 small">{{ debugStateStructure }}</pre>
          </div>
          <div class="col-md-6">
            <h6>Performance Metrics</h6>
            <ul class="list-unstyled small">
              <li><strong>Total Entities:</strong> {{ totalEntitiesCount }}</li>
              <li><strong>Cache Hit Rate:</strong> {{ cacheHitRate }}%</li>
              <li><strong>Active Filters:</strong> {{ activeFiltersCount }}</li>
              <li><strong>Memory Usage:</strong> {{ estimatedMemoryUsage }}KB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'GeneralStoreNormalizedTest',
  data() {
    return {
      globalSearchTerm: '',
      entityTypes: ['categories', 'subcategories', 'items', 'movements', 'requests', 'dispensaries'],
      paginatedEntities: ['categories', 'subcategories', 'items', 'movements', 'requests']
    };
  },
  computed: {
    ...mapState('generalStore', [
      'entities',
      'relationships',
      'currentSelections',
      'specializedCollections',
      'pagination',
      'filters',
      'loadingStates',
      'errorStates',
      'cacheMetadata',
      'uiState'
    ]),
    ...mapGetters('generalStore', [
      // Cache getters
      'isCacheValid',
      'getCacheTimestamp',
      
      // Entity getters
      'getAllCategories',
      'getAllSubcategories', 
      'getAllItems',
      'getAllMovements',
      'getAllRequests',
      'getAllDispensaries',
      'getCategoryById',
      'getSubcategoryById',
      'getItemById',
      'getRequestById',
      
      // Filtered data getters
      'getFilteredCategories',
      'getFilteredSubcategories',
      'getFilteredItems',
      'getFilteredMovements',
      'getFilteredRequests',
      
      // Specialized collections
      'getLowStockItems',
      'getExpiringItems',
      'getMyRequests',
      'getPendingApprovalRequests',
      
      // Current selections
      'getCurrentCategory',
      'getCurrentSubcategory',
      'getCurrentItem',
      'getCurrentRequest',
      'getSelectedItems',
      
      // Loading states
      'isLoading',
      'isAnyLoading',
      
      // Error states
      'getError',
      'hasError',
      'hasAnyErrors',
      'getAllErrors',
      
      // Pagination
      'getPagination',
      
      // Filters
      'getActiveFilters',
      
      // Dashboard
      'getDashboardStats',
      
      // Stats
      'getEntityStats'
    ]),
    
    debugStateStructure() {
      return {
        entitiesCount: Object.keys(this.entities || {}).length,
        relationshipsCount: Object.keys(this.relationships || {}).length,
        currentSelectionsCount: Object.keys(this.currentSelections || {}).length,
        specializedCollectionsCount: Object.keys(this.specializedCollections || {}).length
      };
    },
    
    totalEntitiesCount() {
      return this.entityTypes.reduce((total, type) => {
        return total + this.getEntityCount(type);
      }, 0);
    },
    
    cacheHitRate() {
      const validCaches = this.entityTypes.filter(type => this.isCacheValid(type)).length;
      return Math.round((validCaches / this.entityTypes.length) * 100);
    },
    
    activeFiltersCount() {
      return this.entityTypes.reduce((total, type) => {
        const filters = this.getActiveFilters(type);
        return total + Object.keys(filters).length;
      }, 0);
    },
    
    estimatedMemoryUsage() {
      // Rough estimation based on entity counts
      return Math.round(this.totalEntitiesCount * 0.5); // 0.5KB per entity estimate
    }
  },
  methods: {
    ...mapActions('generalStore', [
      'fetchCategories',
      'fetchSubcategories',
      'fetchItems',
      'fetchMovements',
      'fetchRequests',
      'fetchDispensaries',
      'fetchLowStockItems',
      'fetchExpiringItems',
      'fetchMyRequests',
      'fetchPendingApprovalRequests',
      'fetchDashboardStats',
      'setFilter',
      'clearFilters',
      'setGlobalSearch',
      'setCurrentEntity',
      'selectItems',
      'refreshData',
      'invalidateCache',
      'clearError',
      'clearAllErrors'
    ]),
    
    getEntityCount(entityType) {
      switch (entityType) {
        case 'categories':
          return this.getAllCategories.length;
        case 'subcategories':
          return this.getAllSubcategories.length;
        case 'items':
          return this.getAllItems.length;
        case 'movements':
          return this.getAllMovements.length;
        case 'requests':
          return this.getAllRequests.length;
        case 'dispensaries':
          return this.getAllDispensaries.length;
        default:
          return 0;
      }
    },
    
    getCacheStatusClass(entityType) {
      return this.isCacheValid(entityType) ? 'text-success' : 'text-warning';
    },
    
    getLoadingClass(entityType, operation) {
      return this.isLoading(entityType, operation) ? 'text-primary' : 'text-muted';
    },
    
    updateGlobalSearch() {
      this.setGlobalSearch(this.globalSearchTerm);
    },
    
    updateEntityFilter(entityType, filterKey, value) {
      this.setFilter({ entityType, filterKey, value });
    },
    
    async refreshAllData() {
      try {
        await this.refreshData({ force: true });
        this.$toast.success('All data refreshed successfully');
      } catch (error) {
        this.$toast.error('Failed to refresh data: ' + error.message);
      }
    },
    
    invalidateAllCaches() {
      this.entityTypes.forEach(type => {
        this.invalidateCache(type);
      });
      this.$toast.info('All caches invalidated');
    },
    
    clearAllFilters() {
      this.entityTypes.forEach(type => {
        this.clearFilters(type);
      });
      this.globalSearchTerm = '';
      this.setGlobalSearch('');
      this.$toast.info('All filters cleared');
    },
    
    async testFetchCategories() {
      try {
        await this.fetchCategories({ force: true });
        this.$toast.success('Categories fetched successfully');
      } catch (error) {
        this.$toast.error('Failed to fetch categories: ' + error.message);
      }
    },
    
    async testFetchItems() {
      try {
        await this.fetchItems({ force: true });
        this.$toast.success('Items fetched successfully');
      } catch (error) {
        this.$toast.error('Failed to fetch items: ' + error.message);
      }
    },
    
    async testFetchRequests() {
      try {
        await this.fetchRequests({ force: true });
        this.$toast.success('Requests fetched successfully');
      } catch (error) {
        this.$toast.error('Failed to fetch requests: ' + error.message);
      }
    },
    
    selectRandomItems() {
      const items = this.getAllItems;
      if (items.length > 0) {
        const randomCount = Math.min(3, items.length);
        const randomItems = [];
        for (let i = 0; i < randomCount; i++) {
          const randomIndex = Math.floor(Math.random() * items.length);
          randomItems.push(items[randomIndex].id);
        }
        this.selectItems([...new Set(randomItems)]); // Remove duplicates
        this.$toast.info(`Selected ${randomItems.length} random items`);
      } else {
        this.$toast.warning('No items available to select');
      }
    },
    
    clearSelections() {
      this.selectItems([]);
      this.$toast.info('Selections cleared');
    },
    
    selectFirstCategory() {
      const categories = this.getAllCategories;
      if (categories.length > 0) {
        this.setCurrentEntity({ entityType: 'category', entityId: categories[0].id });
        this.$toast.info(`Selected category: ${categories[0].name}`);
      } else {
        this.$toast.warning('No categories available');
      }
    }
  },
  
  mounted() {
    // Initialize with some test data
    this.testFetchCategories();
    this.testFetchItems();
  }
};
</script>

<style scoped>
.normalized-test-container {
  max-width: 1200px;
  margin: 0 auto;
}

.cache-status {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.pagination-info {
  font-size: 0.875rem;
}

.badge {
  margin-right: 0.25rem;
  margin-bottom: 0.25rem;
}

pre {
  max-height: 200px;
  overflow-y: auto;
  font-size: 0.75rem;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header h5 {
  margin-bottom: 0;
  color: #495057;
}

.btn-sm {
  font-size: 0.75rem;
}

.text-primary { color: #007bff !important; }
.text-success { color: #28a745 !important; }
.text-warning { color: #ffc107 !important; }
.text-danger { color: #dc3545 !important; }
.text-info { color: #17a2b8 !important; }
.text-secondary { color: #6c757d !important; }
.text-muted { color: #6c757d !important; }
</style>