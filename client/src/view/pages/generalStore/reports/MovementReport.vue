<template>
  <div class="movement-report">
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
                <i class="flaticon2-arrow text-success mr-3"></i>
                Movement Report
              </h1>
              <p class="text-muted font-size-lg mb-0">
                Track stock movements, transactions, and activity patterns
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
                <option value="MOVEMENT_SUMMARY">Movement Summary</option>
                <option value="TRANSACTION_DETAILS">Transaction Details</option>
                <option value="ACTIVITY_TIMELINE">Activity Timeline</option>
                <option value="USER_ACTIVITY">User Activity</option>
                <option value="ITEM_MOVEMENTS">Item Movements</option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Movement Type</label>
              <select
                v-model="filters.movementType"
                class="form-control"
                @change="handleFilterChange"
              >
                <option value="">All Types</option>
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
                <option value="TRANSFER">Transfer</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Item</label>
              <select v-model="filters.itemId" class="form-control" @change="handleFilterChange">
                <option value="">All Items</option>
                <option v-for="item in items" :key="item.id" :value="item.id">
                  {{ item.name }} ({{ item.item_code }})
                </option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">User</label>
              <select v-model="filters.userId" class="form-control" @change="handleFilterChange">
                <option value="">All Users</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col-md-3 mb-3">
              <label class="form-label">Start Date</label>
              <input
                v-model="filters.startDate"
                type="date"
                class="form-control"
                @change="handleFilterChange"
              />
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">End Date</label>
              <input
                v-model="filters.endDate"
                type="date"
                class="form-control"
                @change="handleFilterChange"
              />
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Min Quantity</label>
              <input
                v-model="filters.minQuantity"
                type="number"
                min="0"
                class="form-control"
                @input="handleFilterChange"
              />
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Max Quantity</label>
              <input
                v-model="filters.maxQuantity"
                type="number"
                min="0"
                class="form-control"
                @input="handleFilterChange"
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-3 mb-3">
              <label class="form-label">Sort By</label>
              <select v-model="filters.sortBy" class="form-control" @change="handleFilterChange">
                <option value="movement_date">Movement Date</option>
                <option value="quantity">Quantity</option>
                <option value="unit_cost">Unit Cost</option>
                <option value="total_cost">Total Cost</option>
                <option value="created_at">Created Date</option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Sort Order</label>
              <select v-model="filters.sortOrder" class="form-control" @change="handleFilterChange">
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Reference Search</label>
              <input
                v-model="filters.reference"
                type="text"
                class="form-control"
                @input="handleFilterChange"
              />
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
                  <i class="flaticon2-arrow icon-2x"></i>
                </div>
              </div>
              <h3 class="summary-value text-primary mb-2">{{ reportData.totalMovements || 0 }}</h3>
              <p class="summary-label text-muted mb-0">Total Movements</p>
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
              <h3 class="summary-value text-success mb-2">
                {{ reportData.stockInMovements || 0 }}
              </h3>
              <p class="summary-label text-muted mb-0">Stock In</p>
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
              <h3 class="summary-value text-warning mb-2">
                {{ reportData.stockOutMovements || 0 }}
              </h3>
              <p class="summary-label text-muted mb-0">Stock Out</p>
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
              <i class="flaticon2-chart text-success mr-2"></i>
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
          <!-- Movements Table -->
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="thead-light">
                <tr>
                  <th>Movement</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Unit Cost</th>
                  <th>Total Cost</th>
                  <th>Reference</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="movement in reportData.movements"
                  :key="movement.id"
                  class="movement-row"
                >
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="movement-icon-sm mr-3">
                        <i
                          :class="[
                            getMovementIcon(movement.movement_type),
                            getMovementIconClass(movement.movement_type),
                          ]"
                        ></i>
                      </div>
                      <div>
                        <h6 class="font-weight-bold mb-1">{{ movement.movement_number }}</h6>
                        <small class="text-muted">{{ movement.notes || 'No notes' }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <h6 class="font-weight-bold mb-1">
                        {{ movement.item?.name || 'Unknown Item' }}
                      </h6>
                      <small class="text-muted">{{ movement.item?.item_code || 'No code' }}</small>
                    </div>
                  </td>
                  <td>
                    <span :class="getMovementTypeBadgeClass(movement.movement_type)">
                      {{ getMovementTypeLabel(movement.movement_type) }}
                    </span>
                  </td>
                  <td>
                    <span :class="getQuantityClass(movement.movement_type)">
                      {{ movement.quantity }}
                    </span>
                  </td>
                  <td>${{ formatCurrency(movement.unit_cost) }}</td>
                  <td>
                    <span class="font-weight-bold text-success">
                      ${{ formatCurrency(movement.quantity * movement.unit_cost) }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted"
                      >{{ movement.reference_type }}: {{ movement.reference_id }}</small
                    >
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="user-avatar-sm mr-2">
                        <i class="flaticon2-user text-muted"></i>
                      </div>
                      <span>{{ movement.user?.name || 'Unknown' }}</span>
                    </div>
                  </td>
                  <td>
                    <small class="text-muted">{{ formatDate(movement.movement_date) }}</small>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button
                        @click="viewMovement(movement)"
                        class="btn btn-sm btn-outline-primary"
                      >
                        <i class="flaticon2-eye"></i>
                      </button>
                      <button @click="viewItem(movement.item)" class="btn btn-sm btn-outline-info">
                        <i class="flaticon2-box"></i>
                      </button>
                      <button
                        @click="viewUser(movement.user)"
                        class="btn btn-sm btn-outline-warning"
                      >
                        <i class="flaticon2-user"></i>
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
            Configure your report parameters and generate a movement report to see the data
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
      <div class="spinner-border text-success" role="status">
        <span class="sr-only">Generating report...</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MovementReport',
  data() {
    return {
      loading: false,
      filters: {
        reportType: 'MOVEMENT_SUMMARY',
        movementType: '',
        itemId: '',
        userId: '',
        startDate: '',
        endDate: '',
        minQuantity: '',
        maxQuantity: '',
        sortBy: 'movement_date',
        sortOrder: 'DESC',
        reference: '',
      },
    };
  },
  async created() {
    await this.loadFormData();
    this.initializeFilters();
    this.generateReport();
  },
  computed: {
    storeLoading() {
      return this.$store.state.generalStore.loading;
    },
    reportData() {
      return this.$store.state.generalStore.movementReport;
    },
    users() {
      return this.$store.state.employee.employees;
    },
    items() {
      return this.$store.state.generalStore.items;
    },
  },
  methods: {
    async loadFormData() {
      try {
        // Load items
        await this.$store.dispatch('generalStore/fetchItems', { status: 'ACTIVE' });
        // Load users from staff data
        await this.$store.dispatch('employee/fetchEmployees');
      } catch (error) {
        this.$toast.error('Failed to load form data');
      }
    },

    initializeFilters() {
      // Set default date range to last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      this.filters.startDate = startDate.toISOString().split('T')[0];
      this.filters.endDate = endDate.toISOString().split('T')[0];
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
        Object.keys(params).forEach((key) => {
          if (params[key] === '' || params[key] === null) {
            delete params[key];
          }
        });

        await this.$store.dispatch('generalStore/generateMovementReport', params);
        this.$toast.success('Movement report generated successfully');
      } catch (error) {
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
        MOVEMENT_SUMMARY: 'Movement Summary Report',
        TRANSACTION_DETAILS: 'Transaction Details Report',
        ACTIVITY_TIMELINE: 'Activity Timeline Report',
        USER_ACTIVITY: 'User Activity Report',
        ITEM_MOVEMENTS: 'Item Movements Report',
      };
      return titles[this.filters.reportType] || 'Movement Report';
    },

    getMovementIcon(type) {
      const icons = {
        IN: 'flaticon2-arrow-down',
        OUT: 'flaticon2-arrow-up',
        TRANSFER: 'flaticon2-arrow-left',
        ADJUSTMENT: 'flaticon2-gear',
      };
      return icons[type] || 'flaticon2-arrow';
    },

    getMovementIconClass(type) {
      const classes = {
        IN: 'text-success',
        OUT: 'text-danger',
        TRANSFER: 'text-info',
        ADJUSTMENT: 'text-warning',
      };
      return classes[type] || 'text-muted';
    },

    getMovementTypeBadgeClass(type) {
      const classes = {
        IN: 'badge badge-success',
        OUT: 'badge badge-danger',
        TRANSFER: 'badge badge-info',
        ADJUSTMENT: 'badge badge-warning',
      };
      return classes[type] || 'badge badge-light';
    },

    getMovementTypeLabel(type) {
      const labels = {
        IN: 'Stock In',
        OUT: 'Stock Out',
        TRANSFER: 'Transfer',
        ADJUSTMENT: 'Adjustment',
      };
      return labels[type] || type;
    },

    getQuantityClass(type) {
      if (type === 'IN') return 'text-success';
      if (type === 'OUT') return 'text-danger';
      return 'text-muted';
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
    viewMovement(movement) {
      this.$router.push(`/general-store/movements/${movement.id}`);
    },

    viewItem(item) {
      if (item) {
        this.$router.push(`/general-store/items/${item.id}`);
      }
    },

    viewUser(user) {
      if (user) {
        // Navigate to user profile or show user details modal
        this.$router.push(`/staff/${user.id}`);
      }
    },

    async exportReport() {
      if (!this.reportData) return;

      try {
        const reportName = `Movement_Report_${new Date().toISOString().split('T')[0]}`;
        await this.$exportData(this.reportData, reportName, 'xlsx', {
          formatters: {
            quantity: (value) => Number(value || 0),
            unit_price: (value) => Number(value || 0).toFixed(2),
            total_price: (value) => Number(value || 0).toFixed(2),
            created_at: (value) => new Date(value).toLocaleDateString(),
          },
        });
      } catch (error) {
        this.$logError('Failed to export movement report', error);
        this.$toast.error('Failed to export report');
      }
    },

    async printReport() {
      if (!this.reportData) return;

      try {
        const reportConfig = {
          title: 'Movement Report',
          subtitle: `Generated on ${new Date().toLocaleDateString()}`,
          orientation: 'landscape',
          format: 'a4',
        };
        await this.$printReport(this.reportData, reportConfig);
      } catch (error) {
        this.$logError('Failed to print movement report', error);
        this.$toast.error('Failed to print report');
      }
    },

    async shareReport() {
      if (!this.reportData) return;

      try {
        const reportData = {
          title: 'Movement Report',
          data: this.reportData,
          generated_at: new Date().toISOString(),
          filters: this.filters,
        };

        if (navigator.share) {
          const blob = new Blob([JSON.stringify(reportData, null, 2)], {
            type: 'application/json',
          });
          const file = new File(
            [blob],
            `movement_report_${new Date().toISOString().split('T')[0]}.json`,
            {
              type: 'application/json',
            }
          );

          await navigator.share({
            title: 'Movement Report',
            text: 'Movement report data from EHMRS',
            files: [file],
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
          this.$toast.success('Report data copied to clipboard');
        }
      } catch (error) {
        this.$logError('Failed to share movement report', error);
        this.$toast.error('Failed to share report');
      }
    },
  },
};
</script>

<style scoped>
.movement-report {
  position: relative;
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
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

.movement-row {
  transition: background-color 0.2s ease;
}

.movement-row:hover {
  background-color: #f8f9fa;
}

.movement-icon-sm {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar-sm {
  width: 25px;
  height: 25px;
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
