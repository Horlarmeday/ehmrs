<template>
  <div class="general-store-home">
    <!-- Header Section -->
    <div class="header-section mb-8">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <h1 class="text-dark font-weight-bold mb-2">
            <i class="flaticon2-box text-primary mr-3"></i>
            General Store Management
          </h1>
          <p class="text-muted font-size-lg mb-0">
            Manage non-medical supplies, equipment, and consumables for hospital operations
          </p>
        </div>
        <div class="col-lg-4 text-right">
          <div class="d-flex justify-content-end">
            <button
              v-if="ALLOWED_ROLES.includes(user.role)"
              @click="showQuickActions = !showQuickActions"
              class="btn btn-primary btn-lg mr-3"
            >
              <i class="flaticon2-plus mr-2"></i>
              Quick Actions
            </button>
            <button @click="refreshData" class="btn btn-light btn-lg" :disabled="loading">
              <i class="flaticon2-refresh mr-2" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Dropdown -->
    <div v-if="showQuickActions" class="quick-actions-dropdown mb-6">
      <div class="card card-custom">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3 mb-4">
              <div
                class="quick-action-item text-center p-4"
                @click="navigateTo('/general-store/items/create')"
              >
                <div class="quick-action-icon bg-light-primary rounded-circle mx-auto mb-3">
                  <i class="flaticon2-box text-primary icon-2x"></i>
                </div>
                <h5 class="font-weight-bold text-dark mb-2">Add New Item</h5>
                <p class="text-muted mb-0">Create new inventory items</p>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div
                class="quick-action-item text-center p-4"
                @click="navigateTo('/general-store/movements/create')"
              >
                <div class="quick-action-icon bg-light-success rounded-circle mx-auto mb-3">
                  <i class="flaticon2-arrow text-success icon-2x"></i>
                </div>
                <h5 class="font-weight-bold text-dark mb-2">Stock Movement</h5>
                <p class="text-muted mb-0">Record stock in/out</p>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div
                class="quick-action-item text-center p-4"
                @click="navigateTo('/general-store/requests/create')"
              >
                <div class="quick-action-icon bg-light-warning rounded-circle mx-auto mb-3">
                  <i class="flaticon2-file text-warning icon-2x"></i>
                </div>
                <h5 class="font-weight-bold text-dark mb-2">New Request</h5>
                <p class="text-muted mb-0">Create supply request</p>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div
                class="quick-action-item text-center p-4"
                @click="navigateTo('/general-store/reports')"
              >
                <div class="quick-action-icon bg-light-info rounded-circle mx-auto mb-3">
                  <i class="flaticon2-graph text-info icon-2x"></i>
                </div>
                <h5 class="font-weight-bold text-dark mb-2">Reports</h5>
                <p class="text-muted mb-0">View analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-8">
      <div class="col-lg-3 col-md-6 mb-6">
        <div class="card card-custom bg-light-primary">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">{{ statistics.totalItems || 0 }}</h3>
                <p class="text-muted mb-0">Total Items</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-box text-primary icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-6">
        <div class="card card-custom bg-light-warning">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">{{ statistics.lowStockItems || 0 }}</h3>
                <p class="text-muted mb-0">Low Stock Items</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-warning text-warning icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-6">
        <div class="card card-custom bg-light-info">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">
                  {{ statistics.pendingRequests || 0 }}
                </h3>
                <p class="text-muted mb-0">Pending Requests</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-file text-info icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-6">
        <div class="card card-custom bg-light-success">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">{{ statistics.totalValue || 0 }}</h3>
                <p class="text-muted mb-0">Total Value</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-dollar text-success icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation Cards -->
    <div class="row mb-8">
      <div class="col-lg-4 col-md-6 mb-6">
        <div class="nav-card card card-custom h-100" @click="navigateTo('/general-store/items')">
          <div class="card-body text-center p-6">
            <div class="nav-card-icon bg-light-primary rounded-circle mx-auto mb-4">
              <i class="flaticon2-box text-primary icon-4x"></i>
            </div>
            <h4 class="font-weight-bold text-dark mb-3">Inventory Management</h4>
            <p class="text-muted mb-4">
              Manage all general store items, track stock levels, and maintain item information
            </p>
            <div class="nav-card-stats">
              <span class="badge badge-primary mr-2">{{ statistics.totalItems || 0 }} Items</span>
              <span class="badge badge-warning">{{ statistics.lowStockItems || 0 }} Low Stock</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4 col-md-6 mb-6">
        <div
          class="nav-card card card-custom h-100"
          @click="navigateTo('/general-store/categories')"
        >
          <div class="card-body text-center p-6">
            <div class="nav-card-icon bg-light-success rounded-circle mx-auto mb-4">
              <i class="flaticon2-folder text-success icon-4x"></i>
            </div>
            <h4 class="font-weight-bold text-dark mb-3">Categories & Organization</h4>
            <p class="text-muted mb-4">
              Organize items into categories and subcategories for better management
            </p>
            <div class="nav-card-stats">
              <span class="badge badge-success mr-2"
                >{{ statistics.totalCategories || 0 }} Categories</span
              >
              <span class="badge badge-info"
                >{{ statistics.totalSubcategories || 0 }} Subcategories</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4 col-md-6 mb-6">
        <div class="nav-card card card-custom h-100" @click="navigateTo('/general-store/requests')">
          <div class="card-body text-center p-6">
            <div class="nav-card-icon bg-light-warning rounded-circle mx-auto mb-4">
              <i class="flaticon2-file text-warning icon-4x"></i>
            </div>
            <h4 class="font-weight-bold text-dark mb-3">Request Management</h4>
            <p class="text-muted mb-4">
              Handle supply requests, approvals, and fulfillment workflows
            </p>
            <div class="nav-card-stats">
              <span class="badge badge-warning mr-2"
                >{{ statistics.pendingRequests || 0 }} Pending</span
              >
              <span class="badge badge-success"
                >{{ statistics.approvedRequests || 0 }} Approved</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4 col-md-6 mb-6">
        <div
          class="nav-card card card-custom h-100"
          @click="navigateTo('/general-store/movements')"
        >
          <div class="card-body text-center p-6">
            <div class="nav-card-icon bg-light-info rounded-circle mx-auto mb-4">
              <i class="flaticon2-arrow text-info icon-4x"></i>
            </div>
            <h4 class="font-weight-bold text-dark mb-3">Stock Movements</h4>
            <p class="text-muted mb-4">
              Track all stock movements, receipts, issues, and adjustments
            </p>
            <div class="nav-card-stats">
              <span class="badge badge-info mr-2"
                >{{ statistics.totalMovements || 0 }} Movements</span
              >
              <span class="badge badge-primary">Today: {{ statistics.todayMovements || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4 col-md-6 mb-6">
        <div class="nav-card card card-custom h-100" @click="navigateTo('/general-store/reports')">
          <div class="card-body text-center p-6">
            <div class="nav-card-icon bg-light-danger rounded-circle mx-auto mb-4">
              <i class="flaticon2-graph text-danger icon-4x"></i>
            </div>
            <h4 class="font-weight-bold text-dark mb-3">Reports & Analytics</h4>
            <p class="text-muted mb-4">
              Generate comprehensive reports on stock levels, usage, and costs
            </p>
            <div class="nav-card-stats">
              <span class="badge badge-danger mr-2">Stock Reports</span>
              <span class="badge badge-info">Cost Analysis</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4 col-md-6 mb-6">
        <div class="nav-card card card-custom h-100" @click="navigateTo('/general-store/settings')">
          <div class="card-body text-center p-6">
            <div class="nav-card-icon bg-light-dark rounded-circle mx-auto mb-4">
              <i class="flaticon2-settings text-dark icon-4x"></i>
            </div>
            <h4 class="font-weight-bold text-dark mb-3">Settings & Configuration</h4>
            <p class="text-muted mb-4">
              Configure system settings, user permissions, and general preferences
            </p>
            <div class="nav-card-stats">
              <span class="badge badge-dark mr-2">System</span>
              <span class="badge badge-secondary">Users</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="row">
      <div class="col-lg-8 mb-6">
        <div class="card card-custom">
          <div class="card-header">
            <h3 class="card-title">
              <i class="flaticon2-clock text-primary mr-2"></i>
              Recent Stock Movements
            </h3>
          </div>
          <div class="card-body">
            <div v-if="recentMovements.length === 0" class="text-center py-8">
              <i class="flaticon2-box text-muted icon-4x mb-3"></i>
              <p class="text-muted">No recent movements</p>
            </div>
            <div v-else>
              <div
                v-for="movement in recentMovements.slice(0, 5)"
                :key="movement.id"
                class="movement-item d-flex align-items-center py-3 border-bottom"
              >
                <div class="movement-icon mr-3">
                  <i :class="getMovementIcon(movement.movement_type)"></i>
                </div>
                <div class="flex-grow-1">
                  <h6 class="font-weight-bold mb-1">{{ movement.item?.name || 'Unknown Item' }}</h6>
                  <p class="text-muted mb-0">
                    {{ movement.movement_type }} - {{ movement.quantity }} units
                  </p>
                </div>
                <div class="text-right">
                  <small class="text-muted">{{ formatDate(movement.created_at) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4 mb-6">
        <div class="card card-custom">
          <div class="card-header">
            <h3 class="card-title">
              <i class="flaticon2-warning text-warning mr-2"></i>
              Low Stock Alerts
            </h3>
          </div>
          <div class="card-body">
            <div v-if="lowStockItems.length === 0" class="text-center py-4">
              <i class="flaticon2-check text-success icon-2x mb-2"></i>
              <p class="text-success mb-0">All items are well stocked</p>
            </div>
            <div v-else>
              <div
                v-for="item in lowStockItems.slice(0, 3)"
                :key="item.id"
                class="alert-item d-flex align-items-center py-2"
              >
                <div class="alert-icon mr-2">
                  <i class="flaticon2-warning text-warning"></i>
                </div>
                <div class="flex-grow-1">
                  <h6 class="font-weight-bold mb-1">{{ item.name }}</h6>
                  <p class="text-muted mb-0">
                    Current: {{ item.current_stock }} | Min: {{ item.minimum_stock }}
                  </p>
                </div>
              </div>
              <div v-if="lowStockItems.length > 3" class="text-center pt-3">
                <button
                  @click="navigateTo('/general-store/items/low-stock')"
                  class="btn btn-sm btn-outline-warning"
                >
                  View All ({{ lowStockItems.length }})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { parseJwt } from '@/common/common';

export default {
  name: 'GeneralStoreHome',
  data() {
    return {
      showQuickActions: false,
      loading: false,
      user: parseJwt(localStorage.getItem('user_token')),
      ALLOWED_ROLES: ['Super Admin', 'General Store Manager', 'General Store Staff'],
      statistics: {
        totalItems: 0,
        lowStockItems: 0,
        pendingRequests: 0,
        totalValue: 0,
        totalCategories: 0,
        totalSubcategories: 0,
        approvedRequests: 0,
        totalMovements: 0,
        todayMovements: 0,
      },
      recentMovements: [],
      lowStockItems: [],
    };
  },
  computed: {
    // Get data from Vuex store
    storeLoading() {
      return this.$store.state.generalStore.loading;
    },
    storeError() {
      return this.$store.state.generalStore.error;
    },
  },
  async created() {
    await this.loadDashboardData();
  },
  methods: {
    async loadDashboardData() {
      this.loading = true;
      try {
        // Load all necessary data in parallel
        await Promise.all([
          this.$store.dispatch('generalStore/fetchItems', { limit: 1 }),
          this.$store.dispatch('generalStore/fetchLowStockItems'),
          this.$store.dispatch('generalStore/fetchRequests', { status: 'PENDING' }),
          this.$store.dispatch('generalStore/fetchMovements', { limit: 5 }),
          this.$store.dispatch('generalStore/fetchCategories', { limit: 1 }),
          this.$store.dispatch('generalStore/fetchSubcategories', { limit: 1 }),
        ]);

        // Update statistics
        this.updateStatistics();

        // Get recent movements and low stock items
        this.recentMovements = this.$store.state.generalStore.movements;
        this.lowStockItems = this.$store.state.generalStore.lowStockItems;
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        this.loading = false;
      }
    },

    updateStatistics() {
      const state = this.$store.state.generalStore;

      this.statistics = {
        totalItems: state.itemsTotal,
        lowStockItems: state.lowStockItems.length,
        pendingRequests: state.requests.filter(r => r.status === 'PENDING').length,
        totalValue: this.calculateTotalValue(state.items),
        totalCategories: state.categoriesTotal,
        totalSubcategories: state.subcategoriesTotal,
        approvedRequests: state.requests.filter(r => r.status === 'APPROVED').length,
        totalMovements: state.movementsTotal,
        todayMovements: this.getTodayMovements(state.movements),
      };
    },

    calculateTotalValue(items) {
      return items.reduce((total, item) => {
        return total + item.current_stock * item.unit_cost;
      }, 0);
    },

    getTodayMovements(movements) {
      const today = new Date().toDateString();
      return movements.filter(movement => {
        return new Date(movement.created_at).toDateString() === today;
      }).length;
    },

    getMovementIcon(type) {
      const icons = {
        IN: 'flaticon2-arrow-down',
        OUT: 'flaticon2-arrow-up',
        TRANSFER: 'flaticon2-arrow-right',
        ADJUSTMENT: 'flaticon2-edit',
      };
      return icons[type] || 'flaticon2-arrow';
    },

    getMovementColor(type) {
      const colors = {
        IN: 'text-success',
        OUT: 'text-danger',
        TRANSFER: 'text-info',
        ADJUSTMENT: 'text-warning',
      };
      return colors[type] || 'text-muted';
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    navigateTo(path) {
      this.$router.push(path);
    },

    async refreshData() {
      await this.loadDashboardData();
    },
  },
};
</script>

<style scoped>
.general-store-home {
  position: relative;
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.header-section h1 {
  color: white !important;
}

.header-section p {
  color: rgba(255, 255, 255, 0.8) !important;
}

.quick-actions-dropdown {
  animation: slideDown 0.3s ease-out;
}

.quick-action-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 0.5rem;
}

.quick-action-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.quick-action-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.nav-card:hover {
  transform: translateY(-5px);
  border-color: #e1f0ff;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.nav-card-icon {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-card-stats {
  margin-top: 1rem;
}

.movement-item {
  transition: background-color 0.2s ease;
}

.movement-item:hover {
  background-color: #f8f9fa;
}

.movement-icon i {
  font-size: 1.5rem;
}

.alert-item {
  transition: background-color 0.2s ease;
}

.alert-item:hover {
  background-color: #fff3cd;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-section {
    padding: 1rem;
    text-align: center;
  }

  .header-section .text-right {
    text-align: center !important;
    margin-top: 1rem;
  }

  .quick-action-item {
    margin-bottom: 1rem;
  }
}
</style>
