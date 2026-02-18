<template>
  <div class="cost-report">
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
                <i class="flaticon2-dollar text-success mr-3"></i>
                Cost Analysis Report
              </h1>
              <p class="text-muted font-size-lg mb-0">
                Comprehensive analysis of item costs, pricing strategies, and financial performance
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
                <option value="COST_ANALYSIS">Cost Analysis</option>
                <option value="PRICING_TRENDS">Pricing Trends</option>
                <option value="PROFIT_MARGINS">Profit Margins</option>
                <option value="BUDGET_VS_ACTUAL">Budget vs Actual</option>
                <option value="ROI_ANALYSIS">ROI Analysis</option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Category</label>
              <select
                v-model="filters.categoryId"
                class="form-control"
                @change="handleFilterChange"
              >
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Time Period</label>
              <select
                v-model="filters.timePeriod"
                class="form-control"
                @change="handleFilterChange"
              >
                <option value="30">Last 30 Days</option>
                <option value="90">Last 3 Months</option>
                <option value="180">Last 6 Months</option>
                <option value="365">Last Year</option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Sort By</label>
              <select v-model="filters.sortBy" class="form-control" @change="handleFilterChange">
                <option value="unit_cost">Unit Cost</option>
                <option value="total_value">Total Value</option>
                <option value="name">Item Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Content -->
    <div v-if="reportData" class="report-content">
      <!-- Summary Statistics -->
      <div class="summary-stats mb-6">
        <div class="row">
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="stat-card card card-custom">
              <div class="card-body text-center">
                <div class="stat-icon mb-3">
                  <div class="icon-circle icon-circle-primary">
                    <i class="flaticon2-box icon-2x"></i>
                  </div>
                </div>
                <h3 class="stat-value text-primary mb-2">
                  {{ reportData.summary?.totalItems || 0 }}
                </h3>
                <p class="stat-label text-muted mb-0">Items Analyzed</p>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-4">
            <div class="stat-card card card-custom">
              <div class="card-body text-center">
                <div class="stat-icon mb-3">
                  <div class="icon-circle icon-circle-success">
                    <i class="flaticon2-dollar icon-2x"></i>
                  </div>
                </div>
                <h3 class="stat-value text-success mb-2">
                  ${{ formatCurrency(reportData.summary?.totalValue || 0) }}
                </h3>
                <p class="stat-label text-muted mb-0">Total Inventory Value</p>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-4">
            <div class="stat-card card card-custom">
              <div class="card-body text-center">
                <div class="stat-icon mb-3">
                  <div class="icon-circle icon-circle-warning">
                    <i class="flaticon2-chart icon-2x"></i>
                  </div>
                </div>
                <h3 class="stat-value text-warning mb-2">
                  ${{ formatCurrency(reportData.summary?.averageCost || 0) }}
                </h3>
                <p class="stat-label text-muted mb-0">Average Unit Cost</p>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-4">
            <div class="stat-card card card-custom">
              <div class="card-body text-center">
                <div class="stat-icon mb-3">
                  <div class="icon-circle icon-circle-info">
                    <i class="flaticon2-percentage icon-2x"></i>
                  </div>
                </div>
                <h3 class="stat-value text-info mb-2">
                  {{ reportData.summary?.averageMargin || 0 }}%
                </h3>
                <p class="stat-label text-muted mb-0">Average Profit Margin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Cost Items -->
      <div class="top-cost-items mb-6">
        <div class="card card-custom">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="flaticon2-star text-warning mr-2"></i>
              Top Cost Items
            </h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th>Rank</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Unit Cost</th>
                    <th>Current Stock</th>
                    <th>Total Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in reportData.topCostItems" :key="item.id">
                    <td>
                      <span class="badge badge-primary badge-pill">{{ index + 1 }}</span>
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="item-icon mr-3">
                          <i class="flaticon2-box text-primary"></i>
                        </div>
                        <div>
                          <h6 class="font-weight-bold mb-1">{{ item.name }}</h6>
                          <small class="text-muted">{{ item.item_code }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-light">{{ item.category_name }}</span>
                    </td>
                    <td>
                      <strong class="text-danger">${{ formatCurrency(item.unit_cost) }}</strong>
                      <small class="text-muted d-block">{{ item.unit_name }}</small>
                    </td>
                    <td>
                      <span class="badge badge-info">{{ item.current_stock }}</span>
                    </td>
                    <td>
                      <strong class="text-success">${{ formatCurrency(item.total_value) }}</strong>
                    </td>
                    <td>
                      <span :class="getStatusBadgeClass(item.status)">
                        {{ item.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Cost Insights -->
      <div class="cost-insights mb-6">
        <div class="card card-custom">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="flaticon2-lightbulb text-primary mr-2"></i>
              Cost Insights & Recommendations
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-lg-6 mb-4">
                <div class="insight-card">
                  <h6 class="text-primary mb-3">
                    <i class="flaticon2-star mr-2"></i>
                    Cost Optimization
                  </h6>
                  <ul class="list-unstyled">
                    <li
                      v-for="insight in reportData.insights?.costOptimization || []"
                      :key="insight.id"
                      class="mb-2"
                    >
                      <i class="flaticon2-check text-success mr-2"></i>
                      {{ insight.message }}
                    </li>
                  </ul>
                </div>
              </div>
              <div class="col-lg-6 mb-4">
                <div class="insight-card">
                  <h6 class="text-warning mb-3">
                    <i class="flaticon2-warning mr-2"></i>
                    Cost Alerts
                  </h6>
                  <ul class="list-unstyled">
                    <li
                      v-for="insight in reportData.insights?.costAlerts || []"
                      :key="insight.id"
                      class="mb-2"
                    >
                      <i class="flaticon2-info text-warning mr-2"></i>
                      {{ insight.message }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Generating cost report...</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CostReport',
  data() {
    return {
      loading: false,
      reportData: null,
      filters: {
        reportType: 'COST_ANALYSIS',
        categoryId: '',
        timePeriod: '30',
        sortBy: 'unit_cost',
        sortOrder: 'desc',
      },
      categories: [],
    };
  },
  async mounted() {
    await this.loadInitialData();
  },
  methods: {
    async loadInitialData() {
      try {
        await this.$store.dispatch('generalStore/fetchCategories');
        this.categories = this.$store.getters['generalStore/categories'] || [];
      } catch (error) {
        this.$toast.error('Failed to load filter data');
      }
    },

    async generateReport() {
      this.loading = true;
      try {
        const params = { ...this.filters };

        Object.keys(params).forEach((key) => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key];
          }
        });

        const response = await this.$store.dispatch('generalStore/generateCostReport', params);
        this.reportData = response.data.data;

        this.$toast.success('Cost report generated successfully');
      } catch (error) {
        this.$toast.error('Failed to generate cost report');
      } finally {
        this.loading = false;
      }
    },

    async exportReport() {
      if (!this.reportData) return;

      try {
        const params = { ...this.filters, export: true };
        const response = await this.$store.dispatch('generalStore/exportCostReport', params);

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cost-report-${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        this.$toast.success('Report exported successfully');
      } catch (error) {
        console.error('Error exporting report:', error);
        this.$toast.error('Failed to export report');
      }
    },

    handleFilterChange() {
      if (this.reportData) {
        this.generateReport();
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value || 0);
    },

    getStatusBadgeClass(status) {
      const classes = {
        ACTIVE: 'badge badge-success',
        INACTIVE: 'badge badge-secondary',
        LOW_STOCK: 'badge badge-warning',
        OUT_OF_STOCK: 'badge badge-danger',
      };
      return classes[status] || 'badge badge-secondary';
    },
  },
};
</script>

<style scoped>
.cost-report {
  padding: 20px;
}

.stat-card {
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon .icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.icon-circle-primary {
  background-color: rgba(0, 172, 193, 0.1);
  color: #00acc1;
}

.icon-circle-success {
  background-color: rgba(27, 197, 189, 0.1);
  color: #1bc5bd;
}

.icon-circle-warning {
  background-color: rgba(255, 168, 0, 0.1);
  color: #ffa800;
}

.icon-circle-info {
  background-color: rgba(137, 80, 252, 0.1);
  color: #8950fc;
}

.insight-card {
  padding: 20px;
  border: 1px solid #e4e6ef;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.insight-card h6 {
  font-weight: 600;
}

.insight-card ul li {
  padding: 5px 0;
  border-bottom: 1px solid #e4e6ef;
}

.insight-card ul li:last-child {
  border-bottom: none;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 172, 193, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00acc1;
}
</style>
