<template>
  <div class="stock-dashboard">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <h1 class="text-dark font-weight-bold mb-2">
            <i class="flaticon2-graph text-info mr-3"></i>
            Stock Management Dashboard
          </h1>
          <p class="text-muted font-size-lg mb-0">
            Monitor stock levels, track movements, and manage inventory efficiently
          </p>
        </div>
        <div class="col-lg-4 text-right">
          <div class="d-flex justify-content-end">
            <button
              v-if="ALLOWED_ROLES.includes(user.role)"
              @click="showMovementModal = true"
              class="btn btn-success btn-lg mr-3"
            >
              <i class="flaticon2-arrow mr-2"></i>
              Record Movement
            </button>
            <button @click="refreshData" class="btn btn-light btn-lg" :disabled="loading">
              <i class="flaticon2-refresh mr-2" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="quick-stats mb-6">
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="stat-card card card-custom h-100">
            <div class="card-body text-center p-4">
              <div class="stat-icon mb-3">
                <div class="icon-circle bg-primary">
                  <i class="flaticon2-box icon-2x"></i>
                </div>
              </div>
              <h3 class="stat-number text-primary mb-2">{{ dashboardStats.totalItems }}</h3>
              <p class="stat-label text-muted mb-0">Total Items</p>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="stat-card card card-custom h-100">
            <div class="card-body text-center p-4">
              <div class="stat-icon mb-3">
                <div class="icon-circle bg-success">
                  <i class="flaticon2-check icon-2x"></i>
                </div>
              </div>
              <h3 class="stat-number text-success mb-2">{{ dashboardStats.activeItems }}</h3>
              <p class="stat-label text-muted mb-0">Active Items</p>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="stat-card card card-custom h-100">
            <div class="card-body text-center p-4">
              <div class="stat-icon mb-3">
                <div class="icon-circle bg-warning">
                  <i class="flaticon2-warning icon-2x"></i>
                </div>
              </div>
              <h3 class="stat-number text-warning mb-2">{{ dashboardStats.lowStockItems }}</h3>
              <p class="stat-label text-muted mb-0">Low Stock Items</p>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="stat-card card card-custom h-100">
            <div class="card-body text-center p-4">
              <div class="stat-icon mb-3">
                <div class="icon-circle bg-info">
                  <i class="flaticon2-dollar icon-2x"></i>
                </div>
              </div>
              <h3 class="stat-number text-info mb-2">
                ${{ formatCurrency(dashboardStats.totalValue) }}
              </h3>
              <p class="stat-label text-muted mb-0">Total Inventory Value</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div class="row">
      <!-- Stock Alerts Section -->
      <div class="col-lg-8">
        <!-- Low Stock Alerts -->
        <div class="card card-custom mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="flaticon2-warning text-warning mr-2"></i>
              Low Stock Alerts
              <span class="badge badge-warning ml-2">{{ lowStockItems.length }}</span>
            </h5>
          </div>
          <div class="card-body">
            <div v-if="lowStockItems.length === 0" class="text-center py-4">
              <i class="flaticon2-check text-success icon-2x mb-2"></i>
              <p class="text-success mb-0">All items are above minimum stock levels!</p>
            </div>
            <div v-else>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="thead-light">
                    <tr>
                      <th>Item</th>
                      <th>Current Stock</th>
                      <th>Minimum Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in lowStockItems.slice(0, 5)" :key="item.id" class="alert-row">
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="item-icon-sm mr-3">
                            <i class="flaticon2-box text-warning"></i>
                          </div>
                          <div>
                            <h6 class="font-weight-bold mb-1">{{ item.name }}</h6>
                            <small class="text-muted">{{ item.item_code }}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="font-weight-bold text-danger">{{ item.current_stock }}</span>
                      </td>
                      <td>
                        <span class="text-muted">{{ item.minimum_stock }}</span>
                      </td>
                      <td>
                        <span class="badge badge-danger">Critical</span>
                      </td>
                      <td>
                        <div class="btn-group">
                          <button @click="viewItem(item)" class="btn btn-sm btn-outline-primary">
                            <i class="flaticon2-eye"></i>
                          </button>
                          <button
                            @click="createMovement(item, 'IN')"
                            class="btn btn-sm btn-outline-success"
                          >
                            <i class="flaticon2-arrow-down"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="text-center pt-3">
                <button @click="viewAllLowStock" class="btn btn-outline-warning mr-2">
                  View All Low Stock Items
                </button>
                <button @click="createRequest" class="btn btn-warning">
                  <i class="flaticon2-file mr-2"></i>
                  Create Purchase Request
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Stock Movements -->
        <div class="card card-custom mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="flaticon2-arrow text-info mr-2"></i>
              Recent Stock Movements
              <span class="badge badge-info ml-2">{{ recentMovements.length }}</span>
            </h5>
          </div>
          <div class="card-body">
            <div v-if="recentMovements.length === 0" class="text-center py-4">
              <i class="flaticon2-arrow text-muted icon-2x mb-2"></i>
              <p class="text-muted mb-0">No recent movements</p>
            </div>
            <div v-else>
              <div class="movements-timeline">
                <div
                  v-for="movement in recentMovements.slice(0, 8)"
                  :key="movement.id"
                  class="movement-item d-flex align-items-center py-3 border-bottom"
                >
                  <div class="movement-icon mr-3">
                    <div
                      class="movement-badge"
                      :class="getMovementBadgeClass(movement.movement_type)"
                    >
                      <i :class="getMovementIcon(movement.movement_type)"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1">
                    <h6 class="font-weight-bold mb-1">
                      {{ movement.item?.name || 'Unknown Item' }}
                    </h6>
                    <p class="text-muted mb-0">
                      {{ movement.movement_type }} - Quantity: {{ movement.quantity }} | Reference:
                      {{ movement.reference_type }} #{{ movement.reference_id }}
                    </p>
                  </div>
                  <div class="text-right">
                    <small class="text-muted">{{ formatDate(movement.movement_date) }}</small>
                    <div class="mt-1">
                      <button
                        @click="viewMovement(movement)"
                        class="btn btn-sm btn-outline-primary"
                      >
                        <i class="flaticon2-eye"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-center pt-3">
                <button @click="viewAllMovements" class="btn btn-outline-info">
                  View All Movements
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Information -->
      <div class="col-lg-4">
        <!-- Stock Summary -->
        <div class="card card-custom mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="flaticon2-graph text-info mr-2"></i>
              Stock Summary
            </h5>
          </div>
          <div class="card-body">
            <div class="stock-summary">
              <div class="summary-item d-flex justify-content-between mb-3">
                <span class="text-muted">Items in Stock:</span>
                <span class="font-weight-bold text-success">{{ dashboardStats.inStockItems }}</span>
              </div>

              <div class="summary-item d-flex justify-content-between mb-3">
                <span class="text-muted">Out of Stock:</span>
                <span class="font-weight-bold text-danger">{{
                  dashboardStats.outOfStockItems
                }}</span>
              </div>

              <div class="summary-item d-flex justify-content-between mb-3">
                <span class="text-muted">Expiring Soon:</span>
                <span class="font-weight-bold text-warning">{{
                  dashboardStats.expiringItems
                }}</span>
              </div>

              <div class="summary-item d-flex justify-content-between mb-3">
                <span class="text-muted">Total Categories:</span>
                <span class="font-weight-bold text-info">{{ dashboardStats.totalCategories }}</span>
              </div>

              <div class="summary-item d-flex justify-content-between mb-3">
                <span class="text-muted">Average Stock Level:</span>
                <span class="font-weight-bold text-primary"
                  >{{ dashboardStats.averageStockLevel }}%</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card card-custom mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="flaticon2-gear text-info mr-2"></i>
              Quick Actions
            </h5>
          </div>
          <div class="card-body">
            <div class="quick-actions">
              <button @click="showMovementModal = true" class="btn btn-success btn-block mb-2">
                <i class="flaticon2-arrow mr-2"></i>
                Record Movement
              </button>

              <button @click="showAdjustmentModal = true" class="btn btn-warning btn-block mb-2">
                <i class="flaticon2-edit mr-2"></i>
                Stock Adjustment
              </button>

              <button @click="createRequest" class="btn btn-info btn-block mb-2">
                <i class="flaticon2-file mr-2"></i>
                Create Request
              </button>

              <button @click="exportStockReport" class="btn btn-secondary btn-block">
                <i class="flaticon2-download mr-2"></i>
                Export Report
              </button>
            </div>
          </div>
        </div>

        <!-- Stock Health Indicator -->
        <div class="card card-custom">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="flaticon2-heart text-danger mr-2"></i>
              Stock Health
            </h5>
          </div>
          <div class="card-body">
            <div class="stock-health text-center">
              <div class="health-circle mb-3" :class="getStockHealthClass()">
                <h2 class="health-number">{{ getStockHealthScore() }}%</h2>
                <small class="health-label">Health Score</small>
              </div>

              <div class="health-indicators">
                <div class="health-indicator d-flex justify-content-between mb-2">
                  <span class="text-muted">Low Stock:</span>
                  <span
                    class="font-weight-bold"
                    :class="getHealthColor(dashboardStats.lowStockItems)"
                  >
                    {{ dashboardStats.lowStockItems }}
                  </span>
                </div>

                <div class="health-indicator d-flex justify-content-between mb-2">
                  <span class="text-muted">Out of Stock:</span>
                  <span
                    class="font-weight-bold"
                    :class="getHealthColor(dashboardStats.outOfStockItems)"
                  >
                    {{ dashboardStats.outOfStockItems }}
                  </span>
                </div>

                <div class="health-indicator d-flex justify-content-between">
                  <span class="text-muted">Expiring:</span>
                  <span
                    class="font-weight-bold"
                    :class="getHealthColor(dashboardStats.expiringItems)"
                  >
                    {{ dashboardStats.expiringItems }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Record Movement Modal -->
    <div v-if="showMovementModal" class="modal-overlay" @click="showMovementModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="flaticon2-arrow text-success mr-2"></i>
            Record Stock Movement
          </h4>
          <button @click="showMovementModal = false" class="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <CreateMovementForm
            @movement-created="handleMovementCreated"
            @cancel="showMovementModal = false"
          />
        </div>
      </div>
    </div>

    <!-- Stock Adjustment Modal -->
    <div v-if="showAdjustmentModal" class="modal-overlay" @click="showAdjustmentModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="flaticon2-edit text-warning mr-2"></i>
            Stock Adjustment
          </h4>
          <button @click="showAdjustmentModal = false" class="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <StockAdjustmentForm
            @adjustment-created="handleAdjustmentCreated"
            @cancel="showAdjustmentModal = false"
          />
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-info" role="status">
        <span class="sr-only">Loading dashboard...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { parseJwt } from '@/common/common';
import CreateMovementForm from './CreateMovement.vue';
import StockAdjustmentForm from './StockAdjustment.vue';

export default {
  name: 'StockDashboard',
  components: {
    CreateMovementForm,
    StockAdjustmentForm,
  },
  data() {
    return {
      loading: false,
      showMovementModal: false,
      showAdjustmentModal: false,
      user: parseJwt(localStorage.getItem('user_token')),
      ALLOWED_ROLES: ['Super Admin', 'General Store Manager', 'General Store Staff'],
      dashboardStats: {
        totalItems: 0,
        activeItems: 0,
        lowStockItems: 0,
        totalValue: 0,
        inStockItems: 0,
        outOfStockItems: 0,
        expiringItems: 0,
        totalCategories: 0,
        averageStockLevel: 0,
      },
      lowStockItems: [],
      recentMovements: [],
    };
  },
  async created() {
    await this.loadDashboardData();
  },
  methods: {
    async loadDashboardData() {
      this.loading = true;
      try {
        await Promise.all([
          this.loadDashboardStats(),
          this.loadLowStockItems(),
          this.loadRecentMovements(),
        ]);
      } catch (error) {
        this.$toast.error('Failed to load dashboard data');
      } finally {
        this.loading = false;
      }
    },

    async loadDashboardStats() {
      try {
        // Load dashboard statistics
        const response = await this.$store.dispatch('generalStore/getDashboardStats');
        this.dashboardStats = response.data || this.dashboardStats;
      } catch (error) {
        this.$toast.error('Failed to load dashboard stats');
      }
    },

    async loadLowStockItems() {
      try {
        await this.$store.dispatch('generalStore/fetchLowStockItems');
        this.lowStockItems = this.$store.state.generalStore.lowStockItems;
      } catch (error) {
        this.$toast.error('Failed to load low stock items');
      }
    },

    async loadRecentMovements() {
      try {
        await this.$store.dispatch('generalStore/fetchMovements', { limit: 8 });
        this.recentMovements = this.$store.state.generalStore.movements;
      } catch (error) {
        this.$toast.error('Failed to load recent movements');
      }
    },

    getMovementBadgeClass(type) {
      const classes = {
        IN: 'bg-success',
        OUT: 'bg-danger',
        TRANSFER: 'bg-info',
        ADJUSTMENT: 'bg-warning',
      };
      return classes[type] || 'bg-secondary';
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

    getStockHealthClass() {
      const score = this.getStockHealthScore();
      if (score >= 80) return 'health-excellent';
      if (score >= 60) return 'health-good';
      if (score >= 40) return 'health-fair';
      return 'health-poor';
    },

    getStockHealthScore() {
      const totalItems = this.dashboardStats.totalItems;
      if (totalItems === 0) return 100;

      const lowStockPenalty = this.dashboardStats.lowStockItems * 5;
      const outOfStockPenalty = this.dashboardStats.outOfStockItems * 10;
      const expiringPenalty = this.dashboardStats.expiringItems * 3;

      const score = Math.max(0, 100 - lowStockPenalty - outOfStockPenalty - expiringPenalty);
      return Math.round(score);
    },

    getHealthColor(value) {
      if (value === 0) return 'text-success';
      if (value <= 2) return 'text-warning';
      return 'text-danger';
    },

    formatCurrency(amount) {
      return parseFloat(amount).toFixed(2);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    viewItem(item) {
      this.$router.push(`/general-store/items/${item.id}`);
    },

    createMovement(item, type) {
      this.selectedItem = item;
      this.selectedMovementType = type;
      this.showMovementModal = true;
      // Pre-populate movement form with item and type data
      if (this.$refs.movementForm) {
        this.$refs.movementForm.prePopulateItem(item, type);
      }
    },

    viewMovement(movement) {
      this.$router.push(`/general-store/movements/${movement.id}`);
    },

    viewAllLowStock() {
      this.$router.push('/general-store/items?stock_level=low');
    },

    viewAllMovements() {
      this.$router.push('/general-store/movements');
    },

    createRequest() {
      this.$router.push('/general-store/requests/create');
    },

    async exportStockReport() {
      try {
        const stockData = this.lowStockItems.map(item => ({
          id: item.id,
          name: item.name,
          item_code: item.item_code,
          current_stock: item.current_stock,
          minimum_stock: item.minimum_stock,
          maximum_stock: item.maximum_stock,
          unit_cost: item.unit_cost,
          total_value: item.current_stock * item.unit_cost,
          category: item.category?.name || 'N/A',
          subcategory: item.subcategory?.name || 'N/A',
          status: item.status,
          location: item.location,
          shelf_number: item.shelf_number,
          last_movement: item.last_movement_date,
        }));

        const reportName = `Stock_Dashboard_${new Date().toISOString().split('T')[0]}`;
        await this.$exportData(stockData, reportName, 'xlsx', {
          formatters: {
            current_stock: (value) => Number(value || 0),
            minimum_stock: (value) => Number(value || 0),
            maximum_stock: (value) => Number(value || 0),
            unit_cost: (value) => Number(value || 0).toFixed(2),
            total_value: (value) => Number(value || 0).toFixed(2),
            last_movement: (value) => value ? new Date(value).toLocaleDateString() : 'Never',
          }
        });
      } catch (error) {
        this.$logError('Failed to export stock report', error);
        this.$toast.error('Failed to export stock report');
      }
    },

    handleMovementCreated() {
      this.showMovementModal = false;
      this.loadDashboardData();
      this.$toast.success('Movement recorded successfully');
    },

    handleAdjustmentCreated() {
      this.showAdjustmentModal = false;
      this.loadDashboardData();
      this.$toast.success('Stock adjustment completed successfully');
    },

    async refreshData() {
      await this.loadDashboardData();
    },
  },
};
</script>

<style scoped>
.stock-dashboard {
  position: relative;
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
}

.header-section h1 {
  color: white !important;
}

.header-section p {
  color: rgba(255, 255, 255, 0.8) !important;
}

.stat-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: #e1f0ff;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.875rem;
}

.card-custom {
  border: 1px solid #e1f0ff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card-custom:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e1f0ff;
}

.card-title {
  color: #495057;
  font-weight: 600;
}

.alert-row {
  transition: background-color 0.2s ease;
}

.alert-row:hover {
  background-color: #fff3cd;
}

.item-icon-sm {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffc107, #fd7e14);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.movements-timeline .movement-item {
  transition: background-color 0.2s ease;
}

.movements-timeline .movement-item:hover {
  background-color: #f8f9fa;
}

.movement-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stock-summary .summary-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.stock-summary .summary-item:last-child {
  border-bottom: none;
}

.quick-actions .btn {
  margin-bottom: 0.5rem;
}

.quick-actions .btn:last-child {
  margin-bottom: 0;
}

.stock-health {
  padding: 1rem 0;
}

.health-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
}

.health-excellent {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.health-good {
  background: linear-gradient(135deg, #17a2b8, #6f42c1);
}

.health-fair {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
}

.health-poor {
  background: linear-gradient(135deg, #dc3545, #e83e8c);
}

.health-number {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.health-label {
  font-size: 0.75rem;
  opacity: 0.9;
}

.health-indicators {
  margin-top: 1rem;
}

.health-indicator {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.health-indicator:last-child {
  border-bottom: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  color: #495057;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.close:hover {
  color: #343a40;
}

.modal-body {
  padding: 1.5rem;
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

  .stat-card {
    margin-bottom: 1rem;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
