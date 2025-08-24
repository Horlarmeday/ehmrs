<template>
  <div class="usage-report">
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
                <i class="flaticon2-analytics text-warning mr-3"></i>
                Usage Report
              </h1>
              <p class="text-muted font-size-lg mb-0">
                Analyze item consumption patterns, department usage, and seasonal trends
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
                <option value="ITEM_USAGE">Item Usage Analysis</option>
                <option value="DEPARTMENT_USAGE">Department Consumption</option>
                <option value="SEASONAL_TRENDS">Seasonal Trends</option>
                <option value="USAGE_PATTERNS">Usage Patterns</option>
                <option value="CONSUMPTION_FORECAST">Consumption Forecast</option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Department</label>
              <select
                v-model="filters.departmentId"
                class="form-control"
                @change="handleFilterChange"
              >
                <option value="">All Departments</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
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
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 3 Months</option>
                <option value="180">Last 6 Months</option>
                <option value="365">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          <div v-if="filters.timePeriod === 'custom'" class="row">
            <div class="col-md-3 mb-3">
              <label class="form-label">Start Date</label>
              <input
                type="date"
                v-model="filters.startDate"
                class="form-control"
                @change="handleFilterChange"
              />
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">End Date</label>
              <input
                type="date"
                v-model="filters.endDate"
                class="form-control"
                @change="handleFilterChange"
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-3 mb-3">
              <label class="form-label">Sort By</label>
              <select v-model="filters.sortBy" class="form-control" @change="handleFilterChange">
                <option value="usage_quantity">Usage Quantity</option>
                <option value="usage_value">Usage Value</option>
                <option value="frequency">Frequency</option>
                <option value="last_used">Last Used</option>
                <option value="name">Item Name</option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Sort Order</label>
              <select v-model="filters.sortOrder" class="form-control" @change="handleFilterChange">
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Limit Results</label>
              <select v-model="filters.limit" class="form-control" @change="handleFilterChange">
                <option value="50">Top 50</option>
                <option value="100">Top 100</option>
                <option value="200">Top 200</option>
                <option value="all">All Results</option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label">Include Zero Usage</label>
              <div class="custom-control custom-switch mt-2">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="includeZeroUsage"
                  v-model="filters.includeZeroUsage"
                  @change="handleFilterChange"
                />
                <label class="custom-control-label" for="includeZeroUsage">
                  Show items with no usage
                </label>
              </div>
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
                  {{ reportData.summary.totalItems || 0 }}
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
                    <i class="flaticon2-chart icon-2x"></i>
                  </div>
                </div>
                <h3 class="stat-value text-success mb-2">
                  {{ reportData.summary.totalUsage || 0 }}
                </h3>
                <p class="stat-label text-muted mb-0">Total Usage</p>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-4">
            <div class="stat-card card card-custom">
              <div class="card-body text-center">
                <div class="stat-icon mb-3">
                  <div class="icon-circle icon-circle-warning">
                    <i class="flaticon2-dollar icon-2x"></i>
                  </div>
                </div>
                <h3 class="stat-value text-warning mb-2">
                  ${{ formatCurrency(reportData.summary.totalValue || 0) }}
                </h3>
                <p class="stat-label text-muted mb-0">Total Value</p>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-4">
            <div class="stat-card card card-custom">
              <div class="card-body text-center">
                <div class="stat-icon mb-3">
                  <div class="icon-circle icon-circle-info">
                    <i class="flaticon2-user icon-2x"></i>
                  </div>
                </div>
                <h3 class="stat-value text-info mb-2">
                  {{ reportData.summary.activeDepartments || 0 }}
                </h3>
                <p class="stat-label text-muted mb-0">Active Departments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Chart -->
      <div class="usage-chart mb-6" v-if="reportData.chartData">
        <div class="card card-custom">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="flaticon2-chart text-primary mr-2"></i>
              Usage Trends
            </h5>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 400px;">
              <canvas ref="usageChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Usage Items -->
      <div class="top-usage-items mb-6">
        <div class="card card-custom">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="flaticon2-star text-warning mr-2"></i>
              Top Usage Items
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
                    <th>Usage Quantity</th>
                    <th>Usage Value</th>
                    <th>Frequency</th>
                    <th>Last Used</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in reportData.topItems" :key="item.id">
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
                      <strong>{{ item.usage_quantity }}</strong>
                      <small class="text-muted d-block">{{ item.unit_name }}</small>
                    </td>
                    <td>
                      <strong class="text-success">${{ formatCurrency(item.usage_value) }}</strong>
                    </td>
                    <td>
                      <span class="badge badge-info">{{ item.frequency }}</span>
                    </td>
                    <td>{{ formatDate(item.last_used) }}</td>
                    <td>
                      <span :class="getTrendBadgeClass(item.trend)">
                        <i :class="getTrendIcon(item.trend)"></i>
                        {{ item.trend }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Department Usage Breakdown -->
      <div class="department-usage mb-6" v-if="reportData.departmentUsage">
        <div class="card card-custom">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="flaticon2-user text-info mr-2"></i>
              Department Usage Breakdown
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-lg-8">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="thead-light">
                      <tr>
                        <th>Department</th>
                        <th>Items Used</th>
                        <th>Total Usage</th>
                        <th>Total Value</th>
                        <th>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="dept in reportData.departmentUsage" :key="dept.id">
                        <td>
                          <div class="d-flex align-items-center">
                            <div class="dept-icon mr-3">
                              <i class="flaticon2-user text-info"></i>
                            </div>
                            <div>
                              <h6 class="font-weight-bold mb-1">{{ dept.name }}</h6>
                              <small class="text-muted">{{ dept.code }}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="badge badge-primary">{{ dept.items_used }}</span>
                        </td>
                        <td>
                          <strong>{{ dept.total_usage }}</strong>
                        </td>
                        <td>
                          <strong class="text-success"
                            >${{ formatCurrency(dept.total_value) }}</strong
                          >
                        </td>
                        <td>
                          <div class="progress" style="height: 20px;">
                            <div
                              class="progress-bar bg-success"
                              :style="{ width: dept.percentage + '%' }"
                              role="progressbar"
                            >
                              {{ dept.percentage.toFixed(1) }}%
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="dept-chart-container" style="height: 300px;">
                  <canvas ref="deptChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Seasonal Analysis -->
      <div class="seasonal-analysis mb-6" v-if="reportData.seasonalData">
        <div class="card card-custom">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="flaticon2-calendar text-warning mr-2"></i>
              Seasonal Usage Patterns
            </h5>
          </div>
          <div class="card-body">
            <div class="seasonal-chart-container" style="height: 400px;">
              <canvas ref="seasonalChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Insights -->
      <div class="usage-insights mb-6">
        <div class="card card-custom">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="flaticon2-lightbulb text-primary mr-2"></i>
              Usage Insights & Recommendations
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-lg-6 mb-4">
                <div class="insight-card">
                  <h6 class="text-primary mb-3">
                    <i class="flaticon2-star mr-2"></i>
                    High Usage Items
                  </h6>
                  <ul class="list-unstyled">
                    <li
                      v-for="insight in reportData.insights.highUsage"
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
                    Low Usage Items
                  </h6>
                  <ul class="list-unstyled">
                    <li
                      v-for="insight in reportData.insights.lowUsage"
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
            <div class="row">
              <div class="col-lg-6 mb-4">
                <div class="insight-card">
                  <h6 class="text-info mb-3">
                    <i class="flaticon2-chart mr-2"></i>
                    Seasonal Patterns
                  </h6>
                  <ul class="list-unstyled">
                    <li
                      v-for="insight in reportData.insights.seasonal"
                      :key="insight.id"
                      class="mb-2"
                    >
                      <i class="flaticon2-calendar text-info mr-2"></i>
                      {{ insight.message }}
                    </li>
                  </ul>
                </div>
              </div>
              <div class="col-lg-6 mb-4">
                <div class="insight-card">
                  <h6 class="text-success mb-3">
                    <i class="flaticon2-lightbulb mr-2"></i>
                    Optimization Opportunities
                  </h6>
                  <ul class="list-unstyled">
                    <li
                      v-for="insight in reportData.insights.optimization"
                      :key="insight.id"
                      class="mb-2"
                    >
                      <i class="flaticon2-lightbulb text-success mr-2"></i>
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
        <span class="sr-only">Generating usage report...</span>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'UsageReport',
  data() {
    return {
      loading: false,
      reportData: null,
      filters: {
        reportType: 'ITEM_USAGE',
        departmentId: '',
        categoryId: '',
        timePeriod: '30',
        startDate: '',
        endDate: '',
        sortBy: 'usage_quantity',
        sortOrder: 'desc',
        limit: '100',
        includeZeroUsage: false,
      },
      categories: [],
      departments: [],
      charts: {
        usageChart: null,
        deptChart: null,
        seasonalChart: null,
      },
    };
  },
  async mounted() {
    await this.loadInitialData();
    this.setDefaultDates();
  },
  methods: {
    async loadInitialData() {
      try {
        // Load categories and departments for filters
        const [categoriesResponse, departmentsResponse] = await Promise.all([
          this.$axios.get('/api/general-store/categories'),
          this.$axios.get('/api/staff/departments'),
        ]);

        this.categories = categoriesResponse.data.data || [];
        this.departments = departmentsResponse.data.data || [];
      } catch (error) {
        console.error('Error loading initial data:', error);
        this.$toast.error('Failed to load filter data');
      }
    },

    setDefaultDates() {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      this.filters.endDate = endDate.toISOString().split('T')[0];
      this.filters.startDate = startDate.toISOString().split('T')[0];
    },

    async generateReport() {
      this.loading = true;
      try {
        const params = { ...this.filters };

        // Remove empty values
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key];
          }
        });

        const response = await this.$axios.get('/api/general-store/reports/usage', { params });
        this.reportData = response.data.data;

        // Generate charts after data is loaded
        this.$nextTick(() => {
          this.generateCharts();
        });

        this.$toast.success('Usage report generated successfully');
      } catch (error) {
        console.error('Error generating usage report:', error);
        this.$toast.error('Failed to generate usage report');
      } finally {
        this.loading = false;
      }
    },

    generateCharts() {
      if (this.reportData?.chartData) {
        this.generateUsageChart();
      }
      if (this.reportData?.departmentUsage) {
        this.generateDepartmentChart();
      }
      if (this.reportData?.seasonalData) {
        this.generateSeasonalChart();
      }
    },

    generateUsageChart() {
      const ctx = this.$refs.usageChart;
      if (!ctx) return;

      if (this.charts.usageChart) {
        this.charts.usageChart.destroy();
      }

      const chartData = this.reportData.chartData;
      this.charts.usageChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'Usage Quantity',
              data: chartData.quantities,
              borderColor: '#3699FF',
              backgroundColor: 'rgba(54, 153, 255, 0.1)',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Usage Value',
              data: chartData.values,
              borderColor: '#1BC5BD',
              backgroundColor: 'rgba(27, 197, 189, 0.1)',
              tension: 0.4,
              fill: true,
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Date',
              },
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Quantity',
              },
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Value ($)',
              },
              grid: {
                drawOnChartArea: false,
              },
            },
          },
          plugins: {
            title: {
              display: true,
              text: 'Usage Trends Over Time',
            },
            legend: {
              position: 'top',
            },
          },
        },
      });
    },

    generateDepartmentChart() {
      const ctx = this.$refs.deptChart;
      if (!ctx) return;

      if (this.charts.deptChart) {
        this.charts.deptChart.destroy();
      }

      const deptData = this.reportData.departmentUsage;
      this.charts.deptChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: deptData.map(d => d.name),
          datasets: [
            {
              data: deptData.map(d => d.total_value),
              backgroundColor: [
                '#3699FF',
                '#1BC5BD',
                '#F64E60',
                '#FFA800',
                '#8950FC',
                '#E1F5FE',
                '#F3E5F5',
                '#E8F5E8',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
            title: {
              display: true,
              text: 'Department Usage Distribution',
            },
          },
        },
      });
    },

    generateSeasonalChart() {
      const ctx = this.$refs.seasonalChart;
      if (!ctx) return;

      if (this.charts.seasonalChart) {
        this.charts.seasonalChart.destroy();
      }

      const seasonalData = this.reportData.seasonalData;
      this.charts.seasonalChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: seasonalData.labels,
          datasets: [
            {
              label: 'Usage Quantity',
              data: seasonalData.quantities,
              backgroundColor: 'rgba(54, 153, 255, 0.8)',
              borderColor: '#3699FF',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Usage Quantity',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Month',
              },
            },
          },
          plugins: {
            title: {
              display: true,
              text: 'Seasonal Usage Patterns',
            },
            legend: {
              position: 'top',
            },
          },
        },
      });
    },

    async exportReport() {
      if (!this.reportData) return;

      try {
        const params = { ...this.filters, export: true };
        const response = await this.$axios.get('/api/general-store/reports/usage/export', {
          params,
          responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `usage-report-${new Date().toISOString().split('T')[0]}.xlsx`
        );
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
      // Auto-generate report when filters change
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

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString();
    },

    getTrendBadgeClass(trend) {
      const classes = {
        INCREASING: 'badge badge-success',
        DECREASING: 'badge badge-danger',
        STABLE: 'badge badge-info',
        FLUCTUATING: 'badge badge-warning',
      };
      return classes[trend] || 'badge badge-secondary';
    },

    getTrendIcon(trend) {
      const icons = {
        INCREASING: 'flaticon2-arrow-up',
        DECREASING: 'flaticon2-arrow-down',
        STABLE: 'flaticon2-minus',
        FLUCTUATING: 'flaticon2-refresh',
      };
      return icons[trend] || 'flaticon2-minus';
    },
  },

  beforeDestroy() {
    // Clean up charts
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
  },
};
</script>

<style scoped>
.usage-report {
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
  background-color: rgba(54, 153, 255, 0.1);
  color: #3699ff;
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

.chart-container,
.dept-chart-container,
.seasonal-chart-container {
  position: relative;
}

.item-icon,
.dept-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(54, 153, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3699ff;
}

.report-option {
  padding: 15px;
  border: 1px solid #e4e6ef;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}

.report-option:hover {
  border-color: #3699ff;
  box-shadow: 0 0 20px rgba(54, 153, 255, 0.1);
}

.option-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(54, 153, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3699ff;
  flex-shrink: 0;
}

.option-content h6 {
  font-weight: 600;
  margin-bottom: 5px;
}

.option-content p {
  font-size: 0.9rem;
  line-height: 1.4;
}

.option-actions {
  margin-top: 10px;
}

.option-actions .btn {
  font-size: 0.8rem;
  padding: 5px 12px;
}
</style>
