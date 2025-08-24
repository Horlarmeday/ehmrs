<template>
  <div class="stock-report">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <div class="d-flex align-items-center">
            <button @click="$router.go(-1)" class="btn btn-light btn-sm mr-3">
              <i class="flaticon2-arrow-left"></i>
              Back
            </button>
            <div>
              <h1 class="text-dark font-weight-bold mb-2">
                <i class="flaticon2-box text-primary mr-3"></i>
                Stock Report
              </h1>
              <p class="text-muted font-size-lg mb-0">
                Comprehensive analysis of inventory levels, stock status, and reorder
                recommendations
              </p>
            </div>
          </div>
        </div>
        <div class="col-lg-4 text-right">
          <div class="d-flex justify-content-end">
            <button @click="generateReport" class="btn btn-primary btn-lg mr-3" :disabled="loading">
              <i class="flaticon2-refresh mr-2" :class="{ 'fa-spin': loading }"></i>
              {{ loading ? 'Generating...' : 'Generate Report' }}
            </button>
            <button
              @click="exportReport"
              class="btn btn-success btn-lg"
              :disabled="!reportData || loading"
            >
              <i class="flaticon2-download mr-2"></i>
              Export
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Filters -->
    <div class="filters-section mb-6">
      <div class="card card-custom">
        <div class="card-header">
          <h5 class="card-title mb-0">
            <i class="flaticon2-gear text-primary mr-2"></i>
            Report Parameters
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3 mb-3">
              <label class="form-label">Report Type</label>
              <select
                v-model="filters.reportType"
                class="form-control"
                @change="handleFilterChange"
              >
                <option value="STOCK_LEVELS">Stock Levels</option>
                <option value="LOW_STOCK">Low Stock Alert</option>
                <option value="EXPIRING_ITEMS">Expiring Items</option>
                <option value="OVERSTOCK">Overstock Items</option>
                <option value="STOCK_VALUE">Stock Value Analysis</option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Category</label>
              <select v-model="filters.category" class="form-control" @change="handleFilterChange">
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Stock Status</label>
              <select
                v-model="filters.stockStatus"
                class="form-control"
                @change="handleFilterChange"
              >
                <option value="">All Statuses</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="OVERSTOCK">Overstock</option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Sort By</label>
              <select v-model="filters.sortBy" class="form-control" @change="handleFilterChange">
                <option value="name">Name</option>
                <option value="current_stock">Stock Level</option>
                <option value="unit_cost">Unit Cost</option>
                <option value="total_value">Total Value</option>
                <option value="last_movement">Last Movement</option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col-md-3 mb-3">
              <label class="form-label">Min Stock Level</label>
              <input
                v-model="filters.minStock"
                type="number"
                min="0"
                class="form-control"
                placeholder="0"
                @input="handleFilterChange"
              />
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Max Stock Level</label>
              <input
                v-model="filters.maxStock"
                type="number"
                min="0"
                class="form-control"
                placeholder="1000"
                @input="handleFilterChange"
              />
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Min Unit Cost</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text">$</span>
                </div>
                <input
                  v-model="filters.minCost"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  placeholder="0.00"
                  @input="handleFilterChange"
                />
              </div>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Max Unit Cost</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text">$</span>
                </div>
                <input
                  v-model="filters.maxCost"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  placeholder="1000.00"
                  @input="handleFilterChange"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Summary -->
    <div v-if="reportData" class="report-summary mb-6">
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card card card-custom">
            <div class="card-body text-center">
              <div class="summary-icon mb-3">
                <div class="icon-circle icon-circle-primary">
                  <i class="flaticon2-box icon-2x"></i>
                </div>
              </div>
              <h3 class="summary-value text-primary mb-2">{{ reportData.totalItems || 0 }}</h3>
              <p class="summary-label text-muted mb-0">Total Items</p>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card card card-custom">
            <div class="card-body text-center">
              <div class="summary-icon mb-3">
                <div class="icon-circle icon-circle-success">
                  <i class="flaticon2-check icon-2x"></i>
                </div>
              </div>
              <h3 class="summary-value text-success mb-2">{{ reportData.inStockItems || 0 }}</h3>
              <p class="summary-label text-muted mb-0">In Stock</p>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card card card-custom">
            <div class="card-body text-center">
              <div class="summary-icon mb-3">
                <div class="icon-circle icon-circle-warning">
                  <i class="flaticon2-warning icon-2x"></i>
                </div>
              </div>
              <h3 class="summary-value text-warning mb-2">{{ reportData.lowStockItems || 0 }}</h3>
              <p class="summary-label text-muted mb-0">Low Stock</p>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card card card-custom">
            <div class="card-body text-center">
              <div class="summary-icon mb-3">
                <div class="icon-circle icon-circle-info">
                  <i class="flaticon2-dollar icon-2x"></i>
                </div>
              </div>
              <h3 class="summary-value text-info mb-2">
                ${{ formatCurrency(reportData.totalValue || 0) }}
              </h3>
              <p class="summary-label text-muted mb-0">Total Value</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Content -->
    <div v-if="reportData" class="report-content mb-6">
      <div class="card card-custom">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              <i class="flaticon2-chart text-primary mr-2"></i>
              {{ getReportTitle() }}
            </h5>
            <div class="report-actions">
              <button @click="printReport" class="btn btn-sm btn-outline-secondary mr-2">
                <i class="flaticon2-printer mr-1"></i>
                Print
              </button>
              <button @click="shareReport" class="btn btn-sm btn-outline-info">
                <i class="flaticon2-share mr-1"></i>
                Share
              </button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <!-- Stock Items Table -->
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="thead-light">
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min Stock</th>
                  <th>Unit Cost</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Last Movement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in reportData.items" :key="item.id" class="item-row">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="item-icon-sm mr-3">
                        <i class="flaticon2-box text-primary"></i>
                      </div>
                      <div>
                        <h6 class="font-weight-bold mb-1">{{ item.name }}</h6>
                        <small class="text-muted">{{ item.item_code }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-light-info">{{
                      item.category?.name || 'No Category'
                    }}</span>
                  </td>
                  <td>
                    <span :class="getStockClass(item.current_stock, item.minimum_stock)">
                      {{ item.current_stock }}
                    </span>
                  </td>
                  <td>{{ item.minimum_stock }}</td>
                  <td>${{ formatCurrency(item.unit_cost) }}</td>
                  <td>
                    <span class="font-weight-bold text-success">
                      ${{ formatCurrency(item.current_stock * item.unit_cost) }}
                    </span>
                  </td>
                  <td>
                    <span :class="getStatusBadgeClass(item.current_stock, item.minimum_stock)">
                      {{ getStatusText(item.current_stock, item.minimum_stock) }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted">{{ formatDate(item.last_movement_date) }}</small>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button @click="viewItem(item)" class="btn btn-sm btn-outline-primary">
                        <i class="flaticon2-eye"></i>
                      </button>
                      <button @click="viewMovements(item)" class="btn btn-sm btn-outline-info">
                        <i class="flaticon2-arrow"></i>
                      </button>
                      <button @click="createRequest(item)" class="btn btn-sm btn-outline-warning">
                        <i class="flaticon2-file"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div
            v-if="reportData.pagination && reportData.pagination.total_pages > 1"
            class="pagination-section mt-4"
          >
            <nav>
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: reportData.pagination.page === 1 }">
                  <button @click="changePage(reportData.pagination.page - 1)" class="page-link">
                    <i class="flaticon2-arrow-left"></i>
                  </button>
                </li>
                <li
                  v-for="page in getVisiblePages()"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === reportData.pagination.page }"
                >
                  <button @click="changePage(page)" class="page-link">{{ page }}</button>
                </li>
                <li
                  class="page-item"
                  :class="{
                    disabled: reportData.pagination.page === reportData.pagination.total_pages,
                  }"
                >
                  <button @click="changePage(reportData.pagination.page + 1)" class="page-link">
                    <i class="flaticon2-arrow-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="empty-state mb-6">
      <div class="card card-custom">
        <div class="card-body text-center py-8">
          <i class="flaticon2-chart text-muted icon-3x mb-3"></i>
          <h4 class="text-muted mb-2">No Report Generated</h4>
          <p class="text-muted mb-4">
            Configure your report parameters and generate a stock report to see the data
          </p>
          <button @click="generateReport" class="btn btn-primary btn-lg">
            <i class="flaticon2-chart mr-2"></i>
            Generate First Report
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Generating report...</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StockReport',
  data() {
    return {
      loading: false,
      filters: {
        reportType: 'STOCK_LEVELS',
        category: '',
        stockStatus: '',
        sortBy: 'name',
        minStock: '',
        maxStock: '',
        minCost: '',
        maxCost: '',
      },
      categories: [],
      reportData: null,
    };
  },
  async created() {
    await this.loadFormData();
    this.generateReport();
  },
  methods: {
    async loadFormData() {
      try {
        // Load categories
        await this.$store.dispatch('generalStore/fetchCategories');
        this.categories = this.$store.state.generalStore.categories;
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    },

    async generateReport() {
      this.loading = true;
      try {
        const params = {
          ...this.filters,
          page: 1,
          limit: 50,
        };

        // Remove empty filters
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null) {
            delete params[key];
          }
        });

        await this.$store.dispatch('generalStore/generateStockReport', params);
        this.reportData = this.$store.state.generalStore.stockReport;

        this.$toast.success('Stock report generated successfully');
      } catch (error) {
        console.error('Error generating report:', error);
        this.$toast.error('Failed to generate report. Please try again.');
      } finally {
        this.loading = false;
      }
    },

    handleFilterChange() {
      // Debounce filter changes
      clearTimeout(this.filterTimeout);
      this.filterTimeout = setTimeout(() => {
        this.generateReport();
      }, 500);
    },

    changePage(page) {
      if (this.reportData && this.reportData.pagination) {
        if (page >= 1 && page <= this.reportData.pagination.total_pages) {
          this.filters.page = page;
          this.generateReport();
        }
      }
    },

    getVisiblePages() {
      if (!this.reportData || !this.reportData.pagination) return [];

      const pages = [];
      const current = this.reportData.pagination.page;
      const total = this.reportData.pagination.total_pages;

      let start = Math.max(1, current - 2);
      let end = Math.min(total, current + 2);

      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(total, start + 4);
        } else {
          start = Math.max(1, end - 4);
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },

    getReportTitle() {
      const titles = {
        STOCK_LEVELS: 'Stock Levels Report',
        LOW_STOCK: 'Low Stock Alert Report',
        EXPIRING_ITEMS: 'Expiring Items Report',
        OVERSTOCK: 'Overstock Items Report',
        STOCK_VALUE: 'Stock Value Analysis Report',
      };
      return titles[this.filters.reportType] || 'Stock Report';
    },

    getStockClass(currentStock, minimumStock) {
      if (!currentStock || currentStock === 0) return 'text-danger';
      if (currentStock <= minimumStock) return 'text-warning';
      return 'text-success';
    },

    getStatusBadgeClass(currentStock, minimumStock) {
      if (!currentStock || currentStock === 0) return 'badge badge-danger';
      if (currentStock <= minimumStock) return 'badge badge-warning';
      if (currentStock > minimumStock * 3) return 'badge badge-info';
      return 'badge badge-success';
    },

    getStatusText(currentStock, minimumStock) {
      if (!currentStock || currentStock === 0) return 'Out of Stock';
      if (currentStock <= minimumStock) return 'Low Stock';
      if (currentStock > minimumStock * 3) return 'Overstock';
      return 'In Stock';
    },

    formatCurrency(amount) {
      return parseFloat(amount || 0).toFixed(2);
    },

    formatDate(dateString) {
      if (!dateString) return 'Never';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    // Action Methods
    viewItem(item) {
      this.$router.push(`/general-store/items/${item.id}`);
    },

    viewMovements(item) {
      this.$router.push(`/general-store/movements?item_id=${item.id}`);
    },

    createRequest(item) {
      this.$router.push(`/general-store/requests/create?item_id=${item.id}`);
    },

    exportReport() {
      if (!this.reportData) return;

      // TODO: Implement export functionality
      this.$toast.info('Export functionality coming soon');
    },

    printReport() {
      if (!this.reportData) return;

      // TODO: Implement print functionality
      this.$toast.info('Print functionality coming soon');
    },

    shareReport() {
      if (!this.reportData) return;

      // TODO: Implement share functionality
      this.$toast.info('Share functionality coming soon');
    },
  },
};
</script>

<style scoped>
.stock-report {
  position: relative;
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #007bff 0%, #6610f2 100%);
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

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.summary-card {
  height: 100%;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-icon .icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
}

.icon-circle-primary {
  background: linear-gradient(135deg, #007bff, #6610f2);
}

.icon-circle-success {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.icon-circle-warning {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
}

.icon-circle-info {
  background: linear-gradient(135deg, #17a2b8, #6f42c1);
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
}

.summary-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.item-row {
  transition: background-color 0.2s ease;
}

.item-row:hover {
  background-color: #f8f9fa;
}

.item-icon-sm {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-actions .btn {
  font-size: 0.875rem;
}

.empty-state .icon-3x {
  font-size: 3rem;
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

  .summary-value {
    font-size: 1.5rem;
  }

  .report-actions {
    flex-direction: column;
    width: 100%;
  }

  .report-actions .btn {
    margin-bottom: 0.5rem;
    width: 100%;
  }
}
</style>
