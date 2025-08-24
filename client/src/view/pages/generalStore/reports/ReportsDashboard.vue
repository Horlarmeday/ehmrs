<template>
  <div class="reports-dashboard">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <h1 class="text-dark font-weight-bold mb-2">
            <i class="flaticon2-chart text-primary mr-3"></i>
            Reports & Analytics
          </h1>
          <p class="text-muted font-size-lg mb-0">
            Comprehensive insights into store operations, inventory, and financial performance
          </p>
        </div>
        <div class="col-lg-4 text-right">
          <div class="d-flex justify-content-end">
            <button
              @click="exportAllReports"
              class="btn btn-success btn-lg mr-3"
              :disabled="loading"
            >
              <i class="flaticon2-download mr-2"></i>
              Export All
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
          <div class="stat-card card card-custom">
            <div class="card-body text-center">
              <div class="stat-icon mb-3">
                <div class="icon-circle icon-circle-primary">
                  <i class="flaticon2-box icon-2x"></i>
                </div>
              </div>
              <h3 class="stat-value text-primary mb-2">{{ dashboardStats.totalItems || 0 }}</h3>
              <p class="stat-label text-muted mb-0">Total Items</p>
              <small class="text-success">
                <i class="flaticon2-arrow-up mr-1"></i>
                {{ dashboardStats.itemsGrowth || 0 }}% this month
              </small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="stat-card card card-custom">
            <div class="card-body text-center">
              <div class="stat-icon mb-3">
                <div class="icon-circle icon-circle-success">
                  <i class="flaticon2-check icon-2x"></i>
                </div>
              </div>
              <h3 class="stat-value text-success mb-2">{{ dashboardStats.activeItems || 0 }}</h3>
              <p class="stat-label text-muted mb-0">Active Items</p>
              <small class="text-success">
                <i class="flaticon2-arrow-up mr-1"></i>
                {{ dashboardStats.activeGrowth || 0 }}% this month
              </small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="stat-card card card-custom">
            <div class="card-body text-center">
              <div class="stat-icon mb-3">
                <div class="icon-circle icon-circle-warning">
                  <i class="flaticon2-warning icon-2x"></i>
                </div>
              </div>
              <h3 class="stat-value text-warning mb-2">{{ dashboardStats.lowStockItems || 0 }}</h3>
              <p class="stat-label text-muted mb-0">Low Stock Items</p>
              <small class="text-danger">
                <i class="flaticon2-arrow-down mr-1"></i>
                {{ dashboardStats.lowStockGrowth || 0 }}% this month
              </small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="stat-card card card-custom">
            <div class="card-body text-center">
              <div class="stat-icon mb-3">
                <div class="icon-circle icon-circle-info">
                  <i class="flaticon2-dollar icon-2x"></i>
                </div>
              </div>
              <h3 class="stat-value text-info mb-2">
                ${{ formatCurrency(dashboardStats.totalValue || 0) }}
              </h3>
              <p class="stat-label text-muted mb-0">Total Inventory Value</p>
              <small class="text-success">
                <i class="flaticon2-arrow-up mr-1"></i>
                {{ dashboardStats.valueGrowth || 0 }}% this month
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Reports Grid -->
    <div class="reports-grid mb-6">
      <div class="row">
        <!-- Stock Reports -->
        <div class="col-lg-6 mb-4">
          <div class="report-card card card-custom h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-box text-primary mr-2"></i>
                Stock Reports
              </h5>
            </div>
            <div class="card-body">
              <div class="report-options">
                <div class="report-option mb-3">
                  <div class="d-flex align-items-center">
                    <div class="option-icon mr-3">
                      <i class="flaticon2-chart text-success"></i>
                    </div>
                    <div class="option-content flex-grow-1">
                      <h6 class="mb-1">Stock Level Report</h6>
                      <p class="text-muted mb-2">
                        Current stock levels, reorder points, and stock status
                      </p>
                      <div class="option-actions">
                        <button
                          @click="generateStockReport"
                          class="btn btn-sm btn-outline-primary mr-2"
                        >
                          <i class="flaticon2-eye mr-1"></i>
                          View
                        </button>
                        <button @click="exportStockReport" class="btn btn-sm btn-outline-success">
                          <i class="flaticon2-download mr-1"></i>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="report-option mb-3">
                  <div class="d-flex align-items-center">
                    <div class="option-icon mr-3">
                      <i class="flaticon2-warning text-warning"></i>
                    </div>
                    <div class="option-content flex-grow-1">
                      <h6 class="mb-1">Low Stock Alert Report</h6>
                      <p class="text-muted mb-2">
                        Items below minimum stock levels requiring attention
                      </p>
                      <div class="option-actions">
                        <button
                          @click="generateLowStockReport"
                          class="btn btn-sm btn-outline-primary mr-2"
                        >
                          <i class="flaticon2-eye mr-1"></i>
                          View
                        </button>
                        <button
                          @click="exportLowStockReport"
                          class="btn btn-sm btn-outline-success"
                        >
                          <i class="flaticon2-download mr-1"></i>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="report-option">
                  <div class="d-flex align-items-center">
                    <div class="option-icon mr-3">
                      <i class="flaticon2-calendar text-info"></i>
                    </div>
                    <div class="option-content flex-grow-1">
                      <h6 class="mb-1">Expiring Items Report</h6>
                      <p class="text-muted mb-2">Items approaching expiration dates</p>
                      <div class="option-actions">
                        <button
                          @click="generateExpiringReport"
                          class="btn btn-sm btn-outline-primary mr-2"
                        >
                          <i class="flaticon2-eye mr-1"></i>
                          View
                        </button>
                        <button
                          @click="exportExpiringReport"
                          class="btn btn-sm btn-outline-success"
                        >
                          <i class="flaticon2-download mr-1"></i>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Movement Reports -->
        <div class="col-lg-6 mb-4">
          <div class="report-card card card-custom h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-arrow text-success mr-2"></i>
                Movement Reports
              </h5>
            </div>
            <div class="card-body">
              <div class="report-options">
                <div class="report-option mb-3">
                  <div class="d-flex align-items-center">
                    <div class="option-icon mr-3">
                      <i class="flaticon2-chart text-primary"></i>
                    </div>
                    <div class="option-content flex-grow-1">
                      <h6 class="mb-1">Stock Movement Report</h6>
                      <p class="text-muted mb-2">Incoming, outgoing, and transfer transactions</p>
                      <div class="option-actions">
                        <button
                          @click="generateMovementReport"
                          class="btn btn-sm btn-outline-primary mr-2"
                        >
                          <i class="flaticon2-eye mr-1"></i>
                          View
                        </button>
                        <button
                          @click="exportMovementReport"
                          class="btn btn-sm btn-outline-success"
                        >
                          <i class="flaticon2-download mr-1"></i>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="report-option mb-3">
                  <div class="d-flex align-items-center">
                    <div class="option-icon mr-3">
                      <i class="flaticon2-time text-warning"></i>
                    </div>
                    <div class="option-content flex-grow-1">
                      <h6 class="mb-1">Activity Timeline Report</h6>
                      <p class="text-muted mb-2">Chronological view of all stock activities</p>
                      <div class="option-actions">
                        <button
                          @click="generateTimelineReport"
                          class="btn btn-sm btn-outline-primary mr-2"
                        >
                          <i class="flaticon2-eye mr-1"></i>
                          View
                        </button>
                        <button
                          @click="exportTimelineReport"
                          class="btn btn-sm btn-outline-success"
                        >
                          <i class="flaticon2-download mr-1"></i>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="report-option">
                  <div class="d-flex align-items-center">
                    <div class="option-icon mr-3">
                      <i class="flaticon2-user text-info"></i>
                    </div>
                    <div class="option-content flex-grow-1">
                      <h6 class="mb-1">User Activity Report</h6>
                      <p class="text-muted mb-2">Staff activities and transaction history</p>
                      <div class="option-actions">
                        <button
                          @click="generateUserActivityReport"
                          class="btn btn-sm btn-outline-primary mr-2"
                        >
                          <i class="flaticon2-eye mr-1"></i>
                          View
                        </button>
                        <button
                          @click="exportUserActivityReport"
                          class="btn btn-sm btn-outline-success"
                        >
                          <i class="flaticon2-download mr-1"></i>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Reports -->
        <div class="col-lg-6 mb-4">
          <div class="report-card card card-custom h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-dollar text-success mr-2"></i>
                Financial Reports
              </h5>
            </div>
            <div class="card-body">
              <div class="report-options">
                <div class="report-option mb-3">
                  <div class="d-flex align-items-center">
                    <div class="option-icon mr-3">
                      <i class="flaticon2-chart text-primary"></i>
                    </div>
                    <div class="option-content flex-grow-1">
                      <h6 class="mb-1">Cost Analysis Report</h6>
                      <p class="text-muted mb-2">Item costs, pricing, and profit margins</p>
                      <div class="option-actions">
                        <button
                          @click="generateCostReport"
                          class="btn btn-sm btn-outline-primary mr-2"
                        >
                          <i class="flaticon2-eye mr-1"></i>
                          View
                        </button>
                        <button @click="exportCostReport" class="btn btn-sm btn-outline-success">
                          <i class="flaticon2-download mr-1"></i>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="report-option mb-3">
                  <div class="d-flex align-items-center">
                    <div class="option-icon mr-3">
                      <i class="flaticon2-calendar text-warning"></i>
                    </div>
                    <div class="option-content flex-grow-1">
                      <h6 class="mb-1">Budget vs Actual Report</h6>
                      <p class="text-muted mb-2">Budget tracking and variance analysis</p>
                      <div class="option-actions">
                        <button
                          @click="generateBudgetReport"
                          class="btn btn-sm btn-outline-primary mr-2"
                        >
                          <i class="flaticon2-eye mr-1"></i>
                          View
                        </button>
                        <button @click="exportBudgetReport" class="btn btn-sm btn-outline-success">
                          <i class="flaticon2-download mr-1"></i>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="report-option">
                  <div class="d-flex align-items-center">
                    <div class="option-icon mr-3">
                      <i class="flaticon2-chart text-info"></i>
                    </div>
                    <div class="option-content flex-grow-1">
                      <h6 class="mb-1">ROI Analysis Report</h6>
                      <p class="text-muted mb-2">Return on investment for inventory items</p>
                      <div class="option-actions">
                        <button
                          @click="generateROIReport"
                          class="btn btn-sm btn-outline-primary mr-2"
                        >
                          <i class="flaticon2-eye mr-1"></i>
                          View
                        </button>
                        <button @click="exportROIReport" class="btn btn-sm btn-outline-success">
                          <i class="flaticon2-download mr-1"></i>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Reports -->
        <div class="col-lg-6 mb-4">
          <div class="report-card card card-custom h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-analytics text-warning mr-2"></i>
                Usage Reports
              </h5>
            </div>
            <div class="card-body">
              <div class="report-options">
                <div class="report-option mb-3">
                  <div class="d-flex align-items-center">
                    <div class="option-icon mr-3">
                      <i class="flaticon2-chart text-primary"></i>
                    </div>
                    <div class="option-content flex-grow-1">
                      <h6 class="mb-1">Item Usage Report</h6>
                      <p class="text-muted mb-2">Most and least used items analysis</p>
                      <div class="option-actions">
                        <button
                          @click="generateUsageReport"
                          class="btn btn-sm btn-outline-primary mr-2"
                        >
                          <i class="flaticon2-eye mr-1"></i>
                          View
                        </button>
                        <button @click="exportUsageReport" class="btn btn-sm btn-outline-success">
                          <i class="flaticon2-download mr-1"></i>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="report-option mb-3">
                  <div class="d-flex align-items-center">
                    <div class="option-icon mr-3">
                      <i class="flaticon2-time text-warning"></i>
                    </div>
                    <div class="option-content flex-grow-1">
                      <h6 class="mb-1">Seasonal Trends Report</h6>
                      <p class="text-muted mb-2">Usage patterns and seasonal variations</p>
                      <div class="option-actions">
                        <button
                          @click="generateTrendsReport"
                          class="btn btn-sm btn-outline-primary mr-2"
                        >
                          <i class="flaticon2-eye mr-1"></i>
                          View
                        </button>
                        <button @click="exportTrendsReport" class="btn btn-sm btn-outline-success">
                          <i class="flaticon2-download mr-1"></i>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="report-option">
                  <div class="d-flex align-items-center">
                    <div class="option-icon mr-3">
                      <i class="flaticon2-chart text-info"></i>
                    </div>
                    <div class="option-content flex-grow-1">
                      <h6 class="mb-1">Department Usage Report</h6>
                      <p class="text-muted mb-2">Item consumption by department</p>
                      <div class="option-actions">
                        <button
                          @click="generateDepartmentUsageReport"
                          class="btn btn-sm btn-outline-primary mr-2"
                        >
                          <i class="flaticon2-eye mr-1"></i>
                          View
                        </button>
                        <button
                          @click="exportDepartmentUsageReport"
                          class="btn btn-sm btn-outline-success"
                        >
                          <i class="flaticon2-download mr-1"></i>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Reports Section -->
    <div class="recent-reports mb-6">
      <div class="card card-custom">
        <div class="card-header">
          <h5 class="card-title mb-0">
            <i class="flaticon2-clock text-primary mr-2"></i>
            Recently Generated Reports
          </h5>
        </div>
        <div class="card-body">
          <div v-if="recentReports.length === 0" class="text-center py-4">
            <i class="flaticon2-chart text-muted icon-2x mb-2"></i>
            <p class="text-muted mb-0">No reports generated yet</p>
            <small class="text-muted">Generate your first report to see it here</small>
          </div>
          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th>Report Name</th>
                    <th>Type</th>
                    <th>Generated By</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="report in recentReports" :key="report.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="report-icon-sm mr-3">
                          <i :class="getReportIcon(report.type)"></i>
                        </div>
                        <div>
                          <h6 class="font-weight-bold mb-1">{{ report.name }}</h6>
                          <small class="text-muted">{{ report.description }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span :class="getReportTypeBadgeClass(report.type)">
                        {{ report.type }}
                      </span>
                    </td>
                    <td>{{ report.generated_by }}</td>
                    <td>{{ formatDate(report.generated_at) }}</td>
                    <td>
                      <span :class="getReportStatusBadgeClass(report.status)">
                        {{ report.status }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group">
                        <button @click="viewReport(report)" class="btn btn-sm btn-outline-primary">
                          <i class="flaticon2-eye"></i>
                        </button>
                        <button
                          @click="downloadReport(report)"
                          class="btn btn-sm btn-outline-success"
                        >
                          <i class="flaticon2-download"></i>
                        </button>
                        <button @click="deleteReport(report)" class="btn btn-sm btn-outline-danger">
                          <i class="flaticon2-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading reports...</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportsDashboard',
  data() {
    return {
      loading: false,
      dashboardStats: {
        totalItems: 0,
        activeItems: 0,
        lowStockItems: 0,
        totalValue: 0,
        itemsGrowth: 0,
        activeGrowth: 0,
        lowStockGrowth: 0,
        valueGrowth: 0,
      },
      recentReports: [],
    };
  },
  async created() {
    await this.loadDashboardData();
  },
  methods: {
    async loadDashboardData() {
      this.loading = true;
      try {
        // Load dashboard statistics
        await this.$store.dispatch('generalStore/fetchDashboardStats');
        this.dashboardStats = this.$store.state.generalStore.dashboardStats;

        // Load recent reports
        await this.loadRecentReports();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        this.$toast.error('Failed to load dashboard data');
      } finally {
        this.loading = false;
      }
    },

    async loadRecentReports() {
      try {
        // TODO: Implement recent reports loading
        this.recentReports = [
          {
            id: 1,
            name: 'Monthly Stock Report',
            description: 'Comprehensive stock level analysis',
            type: 'STOCK',
            generated_by: 'John Doe',
            generated_at: new Date(),
            status: 'COMPLETED',
          },
          {
            id: 2,
            name: 'Cost Analysis Q1',
            description: 'Financial performance analysis',
            type: 'FINANCIAL',
            generated_by: 'Jane Smith',
            generated_at: new Date(Date.now() - 86400000),
            status: 'COMPLETED',
          },
        ];
      } catch (error) {
        console.error('Error loading recent reports:', error);
      }
    },

    getReportIcon(type) {
      const icons = {
        STOCK: 'flaticon2-box',
        MOVEMENT: 'flaticon2-arrow',
        FINANCIAL: 'flaticon2-dollar',
        USAGE: 'flaticon2-analytics',
      };
      return icons[type] || 'flaticon2-chart';
    },

    getReportIconClass(type) {
      const classes = {
        STOCK: 'text-primary',
        MOVEMENT: 'text-success',
        FINANCIAL: 'text-success',
        USAGE: 'text-warning',
      };
      return classes[type] || 'text-info';
    },

    getReportTypeBadgeClass(type) {
      const classes = {
        STOCK: 'badge badge-light-primary',
        MOVEMENT: 'badge badge-light-success',
        FINANCIAL: 'badge badge-light-success',
        USAGE: 'badge badge-light-warning',
      };
      return classes[type] || 'badge badge-light-info';
    },

    getReportStatusBadgeClass(status) {
      const classes = {
        COMPLETED: 'badge badge-success',
        PROCESSING: 'badge badge-warning',
        FAILED: 'badge badge-danger',
        PENDING: 'badge badge-info',
      };
      return classes[status] || 'badge badge-light';
    },

    formatCurrency(amount) {
      return parseFloat(amount || 0).toFixed(2);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    // Report Generation Methods
    generateStockReport() {
      this.$router.push({ name: 'general-store-stock-report' });
    },

    generateLowStockReport() {
      this.$router.push({ name: 'general-store-stock-report', query: { type: 'low-stock' } });
    },

    generateExpiringReport() {
      this.$router.push({ name: 'general-store-stock-report', query: { type: 'expiring' } });
    },

    generateMovementReport() {
      this.$router.push({ name: 'general-store-movement-report' });
    },

    generateTimelineReport() {
      this.$router.push({ name: 'general-store-movement-report', query: { type: 'timeline' } });
    },

    generateUserActivityReport() {
      this.$router.push({
        name: 'general-store-movement-report',
        query: { type: 'user-activity' },
      });
    },

    generateCostReport() {
      this.$router.push({ name: 'general-store-cost-report' });
    },

    generateBudgetReport() {
      this.$router.push({ name: 'general-store-cost-report', query: { type: 'budget' } });
    },

    generateROIReport() {
      this.$router.push({ name: 'general-store-cost-report', query: { type: 'roi' } });
    },

    generateUsageReport() {
      this.$router.push({ name: 'general-store-usage-report' });
    },

    generateTrendsReport() {
      this.$router.push({ name: 'general-store-usage-report', query: { type: 'trends' } });
    },

    generateDepartmentUsageReport() {
      this.$router.push({ name: 'general-store-usage-report', query: { type: 'department' } });
    },

    // Export Methods
    exportStockReport() {
      this.$toast.info('Stock report export functionality coming soon');
    },

    exportLowStockReport() {
      this.$toast.info('Low stock report export functionality coming soon');
    },

    exportExpiringReport() {
      this.$toast.info('Expiring items report export functionality coming soon');
    },

    exportMovementReport() {
      this.$toast.info('Movement report export functionality coming soon');
    },

    exportTimelineReport() {
      this.$toast.info('Timeline report export functionality coming soon');
    },

    exportUserActivityReport() {
      this.$toast.info('User activity report export functionality coming soon');
    },

    exportCostReport() {
      this.$toast.info('Cost report export functionality coming soon');
    },

    exportBudgetReport() {
      this.$toast.info('Budget report export functionality coming soon');
    },

    exportROIReport() {
      this.$toast.info('ROI report export functionality coming soon');
    },

    exportUsageReport() {
      this.$toast.info('Usage report export functionality coming soon');
    },

    exportTrendsReport() {
      this.$toast.info('Trends report export functionality coming soon');
    },

    exportDepartmentUsageReport() {
      this.$toast.info('Department usage report export functionality coming soon');
    },

    exportAllReports() {
      this.$toast.info('Export all reports functionality coming soon');
    },

    // Report Actions
    viewReport(report) {
      this.$toast.info(`Viewing ${report.name}`);
    },

    downloadReport(report) {
      this.$toast.info(`Downloading ${report.name}`);
    },

    deleteReport(report) {
      this.$toast.info(`Deleting ${report.name}`);
    },

    async refreshData() {
      await this.loadDashboardData();
      this.$toast.success('Dashboard data refreshed successfully');
    },
  },
};
</script>

<style scoped>
.reports-dashboard {
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

.stat-card {
  border: 1px solid #e1f0ff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;
}

.stat-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon .icon-circle {
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

.stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.report-card {
  border: 1px solid #e1f0ff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.report-card:hover {
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

.report-options .report-option {
  padding: 1rem;
  border: 1px solid #f8f9fa;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.report-options .report-option:hover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-content h6 {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
}

.option-content p {
  font-size: 0.875rem;
  line-height: 1.4;
}

.option-actions .btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.recent-reports .report-icon-sm {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
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

  .stat-value {
    font-size: 1.5rem;
  }

  .option-actions {
    flex-direction: column;
  }

  .option-actions .btn {
    margin-bottom: 0.25rem;
    width: 100%;
  }
}
</style>
