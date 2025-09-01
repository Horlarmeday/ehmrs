<template>
  <div class="financial-reports">
    <!-- Header Section -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-chart-bar text-info mr-3"></i>
        Financial Reports & Analytics
      </h1>
      <div class="header-actions">
        <b-button variant="outline-primary" @click="exportReport">
          <i class="fas fa-download mr-2"></i>Export Report
        </b-button>
        <b-button variant="info" @click="refreshData">
          <i class="fas fa-sync-alt mr-2"></i>Refresh
        </b-button>
        <b-button variant="success" @click="navigateToAdvancedDashboard">
          <i class="fas fa-chart-line mr-2"></i>Advanced Analytics
        </b-button>
      </div>
    </div>

    <!-- Date Range Filters -->
    <div class="filters-section">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <b-form-group label="Date Range" label-for="date-range">
                <b-form-select
                  id="date-range"
                  v-model="selectedDateRange"
                  :options="dateRangeOptions"
                  @change="onDateRangeChange"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Start Date" label-for="start-date">
                <b-form-input
                  id="start-date"
                  v-model="filters.startDate"
                  type="date"
                  @change="loadReportData"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="End Date" label-for="end-date">
                <b-form-input
                  id="end-date"
                  v-model="filters.endDate"
                  type="date"
                  @change="loadReportData"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Department" label-for="department">
                <b-form-select
                  id="department"
                  v-model="filters.department"
                  :options="departmentOptions"
                  @change="loadReportData"
                ></b-form-select>
              </b-form-group>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Metrics Summary -->
    <div class="metrics-summary-section">
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="metric-card bg-primary text-white">
            <div class="metric-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="metric-content">
              <h3 class="metric-value">{{ formatCurrency(reportData.totalRevenue) }}</h3>
              <p class="metric-label">Total Revenue</p>
              <small
                class="metric-change"
                :class="reportData.revenueChange >= 0 ? 'text-success' : 'text-danger'"
              >
                <i
                  :class="reportData.revenueChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"
                ></i>
                {{ Math.abs(reportData.revenueChange) }}% from previous period
              </small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="metric-card bg-success text-white">
            <div class="metric-icon">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="metric-content">
              <h3 class="metric-value">{{ formatCurrency(reportData.totalPayments) }}</h3>
              <p class="metric-label">Total Payments</p>
              <small class="metric-change"> {{ reportData.paymentCount }} transactions </small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="metric-card bg-warning text-white">
            <div class="metric-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="metric-content">
              <h3 class="metric-value">{{ formatCurrency(reportData.pendingAmount) }}</h3>
              <p class="metric-label">Pending Amount</p>
              <small class="metric-change"> {{ reportData.pendingBills }} outstanding bills </small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="metric-card bg-info text-white">
            <div class="metric-icon">
              <i class="fas fa-percentage"></i>
            </div>
            <div class="metric-content">
              <h3 class="metric-value">{{ reportData.collectionRate }}%</h3>
              <p class="metric-label">Collection Rate</p>
              <small class="metric-change">
                Payment efficiency
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="row">
        <!-- Revenue Trend Chart -->
        <div class="col-lg-8 mb-4">
          <div class="chart-card">
            <div class="chart-header">
              <h5>Revenue Trend</h5>
              <div class="chart-controls">
                <b-button-group size="sm">
                  <b-button
                    @click="setChartType('daily')"
                    :variant="chartType === 'daily' ? 'primary' : 'outline-primary'"
                    >Daily</b-button
                  >
                  <b-button
                    @click="setChartType('weekly')"
                    :variant="chartType === 'weekly' ? 'primary' : 'outline-primary'"
                    >Weekly</b-button
                  >
                  <b-button
                    @click="setChartType('monthly')"
                    :variant="chartType === 'monthly' ? 'primary' : 'outline-primary'"
                    >Monthly</b-button
                  >
                </b-button-group>
              </div>
            </div>
            <div class="chart-container">
              <canvas ref="revenueTrendChart" height="300"></canvas>
            </div>
          </div>
        </div>

        <!-- Payment Methods Distribution -->
        <div class="col-lg-4 mb-4">
          <div class="chart-card">
            <div class="chart-header">
              <h5>Payment Methods</h5>
            </div>
            <div class="chart-container">
              <canvas ref="paymentMethodsChart" height="300"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Department Revenue -->
        <div class="col-lg-6 mb-4">
          <div class="chart-card">
            <div class="chart-header">
              <h5>Revenue by Department</h5>
            </div>
            <div class="chart-container">
              <canvas ref="departmentRevenueChart" height="300"></canvas>
            </div>
          </div>
        </div>

        <!-- Payment Status Distribution -->
        <div class="col-lg-6 mb-4">
          <div class="chart-card">
            <div class="chart-header">
              <h5>Payment Status Distribution</h5>
            </div>
            <div class="chart-container">
              <canvas ref="paymentStatusChart" height="300"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Reports Tables -->
    <div class="reports-tables-section">
      <div class="row">
        <!-- Top Revenue Items -->
        <div class="col-lg-6 mb-4">
          <div class="report-card">
            <div class="card-header">
              <h5>Top Revenue Items</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead class="thead-light">
                    <tr>
                      <th>Item</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in reportData.topRevenueItems" :key="item.id">
                      <td>{{ item.name }}</td>
                      <td>
                        <b-badge :variant="getItemTypeVariant(item.type)">
                          {{ item.type }}
                        </b-badge>
                      </td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ formatCurrency(item.revenue) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Performance -->
        <div class="col-lg-6 mb-4">
          <div class="report-card">
            <div class="card-header">
              <h5>Payment Performance</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead class="thead-light">
                    <tr>
                      <th>Method</th>
                      <th>Count</th>
                      <th>Amount</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="method in reportData.paymentPerformance" :key="method.method">
                      <td>{{ method.method }}</td>
                      <td>{{ method.count }}</td>
                      <td>{{ formatCurrency(method.amount) }}</td>
                      <td>{{ method.percentage }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Revenue Breakdown -->
    <div class="revenue-breakdown-section">
      <div class="card">
        <div class="card-header">
          <h5>Detailed Revenue Breakdown</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="thead-light">
                <tr>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Bills</th>
                  <th>Revenue</th>
                  <th>Payments</th>
                  <th>Pending</th>
                  <th>Collection Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="breakdown in reportData.revenueBreakdown" :key="breakdown.date">
                  <td>{{ formatDate(breakdown.date) }}</td>
                  <td>{{ breakdown.department }}</td>
                  <td>{{ breakdown.bills }}</td>
                  <td>{{ formatCurrency(breakdown.revenue) }}</td>
                  <td>{{ formatCurrency(breakdown.payments) }}</td>
                  <td>{{ formatCurrency(breakdown.pending) }}</td>
                  <td>
                    <b-badge :variant="getCollectionRateVariant(breakdown.collectionRate)">
                      {{ breakdown.collectionRate }}%
                    </b-badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Options Modal -->
    <b-modal
      v-model="showExportModal"
      title="Export Report"
      size="md"
      @ok="performExport"
      @hidden="resetExportForm"
    >
      <b-form @submit.prevent="performExport">
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Export Format" label-for="export-format">
              <b-form-select
                id="export-format"
                v-model="exportForm.format"
                :options="exportFormatOptions"
                required
              ></b-form-select>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Date Range" label-for="export-date-range">
              <b-form-select
                id="export-date-range"
                v-model="exportForm.dateRange"
                :options="exportDateRangeOptions"
                required
              ></b-form-select>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Include Charts" label-for="include-charts">
              <b-form-checkbox id="include-charts" v-model="exportForm.includeCharts">
                Include charts and graphs
              </b-form-checkbox>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Include Details" label-for="include-details">
              <b-form-checkbox id="include-details" v-model="exportForm.includeDetails">
                Include detailed breakdowns
              </b-form-checkbox>
            </b-form-group>
          </div>
        </div>
      </b-form>

      <template #modal-footer>
        <b-button variant="secondary" @click="showExportModal = false">
          Cancel
        </b-button>
        <b-button variant="primary" @click="performExport" :disabled="exporting">
          <span v-if="exporting"> <i class="fas fa-spinner fa-spin mr-2"></i>Exporting... </span>
          <span v-else>
            Export Report
          </span>
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'FinancialReports',
  data() {
    return {
      // Filters
      selectedDateRange: '30d',
      filters: {
        startDate: '',
        endDate: '',
        department: '',
      },

      // Chart configuration
      chartType: 'daily',
      charts: {
        revenueTrend: null,
        paymentMethods: null,
        departmentRevenue: null,
        paymentStatus: null,
      },

      // Export modal
      showExportModal: false,
      exporting: false,
      exportForm: {
        format: 'PDF',
        dateRange: '30d',
        includeCharts: true,
        includeDetails: true,
      },

      // Options
      dateRangeOptions: [
        { value: '7d', text: 'Last 7 Days' },
        { value: '30d', text: 'Last 30 Days' },
        { value: '90d', text: 'Last 90 Days' },
        { value: '1y', text: 'Last Year' },
        { value: 'custom', text: 'Custom Range' },
      ],
      departmentOptions: [
        { value: '', text: 'All Departments' },
        { value: 'pharmacy', text: 'Pharmacy' },
        { value: 'laboratory', text: 'Laboratory' },
        { value: 'radiology', text: 'Radiology' },
        { value: 'services', text: 'Services' },
        { value: 'consultation', text: 'Consultation' },
      ],
      exportFormatOptions: [
        { value: 'PDF', text: 'PDF Report' },
        { value: 'EXCEL', text: 'Excel Spreadsheet' },
        { value: 'CSV', text: 'CSV Data' },
      ],
      exportDateRangeOptions: [
        { value: '7d', text: 'Last 7 Days' },
        { value: '30d', text: 'Last 30 Days' },
        { value: '90d', text: 'Last 90 Days' },
        { value: '1y', text: 'Last Year' },
        { value: 'custom', text: 'Custom Range' },
      ],
    };
  },
  computed: {
    reportData() {
      return this.$store.getters['accounting/getFinancialReports'] || {};
    },
    isLoading() {
      return this.$store.getters['accounting/loading'];
    },
    error() {
      return this.$store.getters['accounting/error'];
    },
  },
  async mounted() {
    this.setDefaultDates();
    await this.loadReportData();
    this.initializeCharts();
  },
  methods: {
    setDefaultDates() {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      this.filters.endDate = endDate.toISOString().split('T')[0];
      this.filters.startDate = startDate.toISOString().split('T')[0];
    },

    async loadReportData() {
      try {
        const params = {
          start_date: this.filters.startDate,
          end_date: this.filters.endDate,
          department: this.filters.department,
          chart_type: this.chartType,
        };

        await this.$store.dispatch('accounting/fetchFinancialReports', params);
        this.updateCharts();
      } catch (error) {
        console.error('Failed to load report data:', error);
        this.$bvToast.toast('Failed to load report data', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    onDateRangeChange() {
      if (this.selectedDateRange === 'custom') {
        return; // Let user set custom dates
      }

      const endDate = new Date();
      const startDate = new Date();

      switch (this.selectedDateRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      this.filters.startDate = startDate.toISOString().split('T')[0];
      this.filters.endDate = endDate.toISOString().split('T')[0];

      this.loadReportData();
    },

    setChartType(type) {
      this.chartType = type;
      this.loadReportData();
    },

    initializeCharts() {
      this.initializeRevenueTrendChart();
      this.initializePaymentMethodsChart();
      this.initializeDepartmentRevenueChart();
      this.initializePaymentStatusChart();
    },

    initializeRevenueTrendChart() {
      const ctx = this.$refs.revenueTrendChart.getContext('2d');
      this.charts.revenueTrend = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Revenue',
              data: [],
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: value => this.formatCurrency(value),
              },
            },
          },
        },
      });
    },

    initializePaymentMethodsChart() {
      const ctx = this.$refs.paymentMethodsChart.getContext('2d');
      this.charts.paymentMethods = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: ['#28a745', '#007bff', '#6f42c1', '#fd7e14', '#20c997'],
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
          },
        },
      });
    },

    initializeDepartmentRevenueChart() {
      const ctx = this.$refs.departmentRevenueChart.getContext('2d');
      this.charts.departmentRevenue = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Revenue',
              data: [],
              backgroundColor: '#17a2b8',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: value => this.formatCurrency(value),
              },
            },
          },
        },
      });
    },

    initializePaymentStatusChart() {
      const ctx = this.$refs.paymentStatusChart.getContext('2d');
      this.charts.paymentStatus = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d'],
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
          },
        },
      });
    },

    updateCharts() {
      this.updateRevenueTrendChart();
      this.updatePaymentMethodsChart();
      this.updateDepartmentRevenueChart();
      this.updatePaymentStatusChart();
    },

    updateRevenueTrendChart() {
      if (!this.charts.revenueTrend) return;

      const chartData = this.reportData.revenueTrend || [];

      this.charts.revenueTrend.data.labels = chartData.map(item => item.date);
      this.charts.revenueTrend.data.datasets[0].data = chartData.map(item => item.revenue);
      this.charts.revenueTrend.update();
    },

    updatePaymentMethodsChart() {
      if (!this.charts.paymentMethods) return;

      const chartData = this.reportData.paymentMethods || [];

      this.charts.paymentMethods.data.labels = chartData.map(item => item.method);
      this.charts.paymentMethods.data.datasets[0].data = chartData.map(item => item.amount);
      this.charts.paymentMethods.update();
    },

    updateDepartmentRevenueChart() {
      if (!this.charts.departmentRevenue) return;

      const chartData = this.reportData.departmentRevenue || [];

      this.charts.departmentRevenue.data.labels = chartData.map(item => item.department);
      this.charts.departmentRevenue.data.datasets[0].data = chartData.map(item => item.revenue);
      this.charts.departmentRevenue.update();
    },

    updatePaymentStatusChart() {
      if (!this.charts.paymentStatus) return;

      const chartData = this.reportData.paymentStatus || [];

      this.charts.paymentStatus.data.labels = chartData.map(item => item.status);
      this.charts.paymentStatus.data.datasets[0].data = chartData.map(item => item.count);
      this.charts.paymentStatus.update();
    },

    // Export functionality
    exportReport() {
      this.showExportModal = true;
    },

    async performExport() {
      try {
        this.exporting = true;

        const params = {
          format: this.exportForm.format,
          date_range: this.exportForm.dateRange,
          include_charts: this.exportForm.includeCharts,
          include_details: this.exportForm.includeDetails,
          start_date: this.filters.startDate,
          end_date: this.filters.endDate,
        };

        // Use Vuex store action for export
        await this.$store.dispatch('account/exportReport', params);

        this.showExportModal = false;
        this.$bvToast.toast('Report exported successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to export report:', error);
        this.$bvToast.toast('Failed to export report', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.exporting = false;
      }
    },

    resetExportForm() {
      this.exportForm = {
        format: 'PDF',
        dateRange: '30d',
        includeCharts: true,
        includeDetails: true,
      };
    },

    refreshData() {
      this.loadReportData();
    },

    navigateToAdvancedDashboard() {
      this.$router.push('/accounting/advanced-reports');
    },

    // Utility methods
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount || 0);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('en-NG');
    },

    getItemTypeVariant(type) {
      const variants = {
        DRUG: 'primary',
        TEST: 'info',
        INVESTIGATION: 'warning',
        SERVICE: 'success',
        ADDITIONAL_ITEM: 'secondary',
      };
      return variants[type] || 'secondary';
    },

    getCollectionRateVariant(rate) {
      if (rate >= 90) return 'success';
      if (rate >= 70) return 'warning';
      return 'danger';
    },
  },
};
</script>

<style scoped>
.financial-reports {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.filters-section {
  margin-bottom: 2rem;
}

.metrics-summary-section {
  margin-bottom: 2rem;
}

.metric-card {
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.metric-icon {
  font-size: 2.5rem;
  margin-right: 1rem;
  opacity: 0.8;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.metric-label {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  opacity: 0.9;
}

.metric-change {
  font-size: 0.875rem;
  opacity: 0.8;
}

.charts-section {
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h5 {
  margin: 0;
  font-weight: 600;
  color: #2c3e50;
}

.chart-container {
  position: relative;
  height: 300px;
}

.reports-tables-section {
  margin-bottom: 2rem;
}

.report-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.report-card .card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

.report-card .card-header h5 {
  margin: 0;
  font-weight: 600;
  color: #2c3e50;
}

.revenue-breakdown-section {
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .financial-reports {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .chart-container {
    height: 250px;
  }
}
</style>
