<template>
  <div class="deposit-reports">
    <!-- Header Section -->
    <div class="page-header">
      <div class="d-flex align-items-center">
        <b-button variant="outline-secondary" @click="$router.go(-1)" class="mr-3">
          <i class="fas fa-arrow-left mr-2"></i>Back
        </b-button>
        <h1 class="page-title mb-0">
          <i class="fas fa-chart-bar text-warning mr-3"></i>
          Deposit Reports & Analytics
        </h1>
      </div>
      <div class="header-actions">
        <b-button variant="outline-primary" @click="exportReport">
          <i class="fas fa-download mr-2"></i>Export Report
        </b-button>
        <b-button variant="outline-success" @click="refreshData">
          <i class="fas fa-sync-alt mr-2"></i>Refresh
        </b-button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section mb-4">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <b-form-group label="Date Range" label-for="date-range">
                <b-form-select
                  id="date-range"
                  v-model="filters.dateRange"
                  :options="dateRangeOptions"
                  @change="loadReport"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Status" label-for="status-filter">
                <b-form-select
                  id="status-filter"
                  v-model="filters.status"
                  :options="statusOptions"
                  @change="loadReport"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Type" label-for="type-filter">
                <b-form-select
                  id="type-filter"
                  v-model="filters.type"
                  :options="typeOptions"
                  @change="loadReport"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <label>&nbsp;</label>
              <div class="d-flex gap-2">
                <b-button variant="outline-secondary" @click="clearFilters">
                  Clear All
                </b-button>
                <b-button variant="primary" @click="loadReport">
                  Generate Report
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <b-spinner variant="primary" label="Loading..."></b-spinner>
      <p class="mt-3">Generating deposit report...</p>
    </div>

    <!-- Report Content -->
    <div v-else-if="reportData" class="report-content">
      <!-- Summary Cards -->
      <div class="summary-section mb-4">
        <div class="row">
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="summary-card bg-primary text-white">
              <div class="summary-icon">
                <i class="fas fa-piggy-bank"></i>
              </div>
              <div class="summary-content">
                <h4 class="summary-value">{{ formatCurrency(reportData.totalDeposits) }}</h4>
                <p class="summary-label">Total Deposits</p>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <div class="summary-card bg-success text-white">
              <div class="summary-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="summary-content">
                <h4 class="summary-value">{{ formatCurrency(reportData.activeDeposits) }}</h4>
                <p class="summary-label">Active Deposits</p>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <div class="summary-card bg-info text-white">
              <div class="summary-icon">
                <i class="fas fa-credit-card"></i>
              </div>
              <div class="summary-content">
                <h4 class="summary-value">{{ formatCurrency(reportData.usedDeposits) }}</h4>
                <p class="summary-label">Used Deposits</p>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <div class="summary-card bg-warning text-white">
              <div class="summary-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="summary-content">
                <h4 class="summary-value">{{ reportData.utilizationRate }}%</h4>
                <p class="summary-label">Utilization Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section mb-4">
        <div class="row">
          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="fas fa-chart-pie mr-2"></i>
                  Deposits by Status
                </h6>
              </div>
              <div class="card-body">
                <div class="chart-placeholder">
                  <i class="fas fa-chart-pie fa-3x text-muted mb-3"></i>
                  <p class="text-muted">Chart visualization coming soon</p>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="fas fa-chart-bar mr-2"></i>
                  Deposits by Type
                </h6>
              </div>
              <div class="card-body">
                <div class="chart-placeholder">
                  <i class="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                  <p class="text-muted">Chart visualization coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Report Table -->
      <div class="report-table-section">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Detailed Report</h6>
            <div class="d-flex align-items-center">
              <span class="text-muted mr-3">
                <i class="fas fa-list mr-1"></i>
                {{ reportData.deposits?.length || 0 }} deposits
              </span>
            </div>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th>Reference #</th>
                    <th>Patient</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!reportData.deposits || reportData.deposits.length === 0">
                    <td colspan="7" class="text-center text-muted py-4">
                      <i class="fas fa-chart-bar fa-2x mb-3"></i>
                      <p class="mb-0">No deposits found for the selected criteria</p>
                    </td>
                  </tr>
                  <tr v-else v-for="deposit in reportData.deposits" :key="deposit.id">
                    <td>
                      <strong>{{ deposit.reference_number }}</strong>
                    </td>
                    <td>
                      <div class="patient-info">
                        <div class="patient-name">
                          {{ deposit.patient?.firstname }} {{ deposit.patient?.lastname }}
                        </div>
                        <small class="patient-number">{{ deposit.patient?.hospital_id }}</small>
                      </div>
                    </td>
                    <td>
                      <span class="amount">{{ formatCurrency(deposit.amount) }}</span>
                    </td>
                    <td>
                      <b-badge :variant="getDepositTypeVariant(deposit.deposit_type)">
                        {{ deposit.deposit_type }}
                      </b-badge>
                    </td>
                    <td>
                      <b-badge :variant="getDepositStatusVariant(deposit.status)">
                        {{ deposit.status }}
                      </b-badge>
                    </td>
                    <td>{{ formatDate(deposit.createdAt) }}</td>
                    <td>
                      <div class="utilization-bar">
                        <div
                          class="utilization-fill"
                          :style="{ width: getUtilizationPercentage(deposit) + '%' }"
                        ></div>
                        <span class="utilization-text"
                          >{{ getUtilizationPercentage(deposit) }}%</span
                        >
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

    <!-- No Data State -->
    <div v-else class="text-center py-5">
      <i class="fas fa-chart-bar fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">No Report Data</h5>
      <p class="text-muted">Select filters and generate a report to view deposit analytics.</p>
      <b-button variant="primary" @click="loadReport">
        <i class="fas fa-chart-bar mr-2"></i>Generate Report
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DepositReports',
  data() {
    return {
      loading: false,
      reportData: null,
      filters: {
        dateRange: 'LAST_30_DAYS',
        status: '',
        type: '',
      },
      dateRangeOptions: [
        { value: 'LAST_7_DAYS', text: 'Last 7 Days' },
        { value: 'LAST_30_DAYS', text: 'Last 30 Days' },
        { value: 'LAST_90_DAYS', text: 'Last 90 Days' },
        { value: 'LAST_YEAR', text: 'Last Year' },
        { value: 'ALL_TIME', text: 'All Time' },
      ],
      statusOptions: [
        { value: '', text: 'All Statuses' },
        { value: 'ACTIVE', text: 'Active' },
        { value: 'USED', text: 'Used' },
        { value: 'REFUNDED', text: 'Refunded' },
      ],
      typeOptions: [
        { value: '', text: 'All Types' },
        { value: 'CASH', text: 'Cash' },
        { value: 'CARD', text: 'Card' },
        { value: 'BANK_TRANSFER', text: 'Bank Transfer' },
        { value: 'MOBILE_MONEY', text: 'Mobile Money' },
        { value: 'INSURANCE', text: 'Insurance' },
        { value: 'OTHER', text: 'Other' },
      ],
    };
  },
  async mounted() {
    await this.loadReport();
  },
  methods: {
    async loadReport() {
      try {
        this.loading = true;

        // For now, we'll use the existing deposits data
        // In production, this would call a dedicated reports API endpoint
        const response = await this.$store.dispatch('accounting/fetchDeposits', {
          limit: 100,
          ...this.filters,
        });

        if (response && response.data) {
          const deposits = response.data.docs || [];

          // Calculate report metrics
          this.reportData = {
            totalDeposits: deposits.reduce((sum, d) => sum + (d.amount || 0), 0),
            activeDeposits: deposits
              .filter(d => d.status === 'ACTIVE')
              .reduce((sum, d) => sum + (d.amount || 0), 0),
            usedDeposits: deposits
              .filter(d => d.status === 'USED')
              .reduce((sum, d) => sum + (d.amount || 0), 0),
            utilizationRate: this.calculateUtilizationRate(deposits),
            deposits: deposits,
          };
        }
      } catch (error) {
        console.error('Failed to load report:', error);
        this.$bvToast.toast('Failed to generate report', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loading = false;
      }
    },

    calculateUtilizationRate(deposits) {
      if (!deposits || deposits.length === 0) return 0;

      const totalAmount = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
      const usedAmount = deposits
        .filter(d => d.status === 'USED')
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      return totalAmount > 0 ? Math.round((usedAmount / totalAmount) * 100) : 0;
    },

    getUtilizationPercentage(deposit) {
      if (deposit.status === 'USED') return 100;
      if (deposit.status === 'ACTIVE') {
        const usedAmount = deposit.used_amount || 0;
        return deposit.amount > 0 ? Math.round((usedAmount / deposit.amount) * 100) : 0;
      }
      return 0;
    },

    clearFilters() {
      this.filters = {
        dateRange: 'LAST_30_DAYS',
        status: '',
        type: '',
      };
      this.loadReport();
    },

    refreshData() {
      this.loadReport();
    },

    exportReport() {
      // TODO: Implement report export functionality
      this.$bvToast.toast('Report export functionality coming soon', {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
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

    getDepositTypeVariant(type) {
      const variants = {
        CASH: 'success',
        BANK_TRANSFER: 'info',
        CARD: 'primary',
        MOBILE_MONEY: 'warning',
        OTHER: 'secondary',
      };
      return variants[type] || 'secondary';
    },

    getDepositStatusVariant(status) {
      const variants = {
        ACTIVE: 'success',
        USED: 'info',
        REFUNDED: 'warning',
        EXPIRED: 'danger',
      };
      return variants[status] || 'secondary';
    },
  },
};
</script>

<style scoped>
.deposit-reports {
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

.summary-section {
  margin-bottom: 2rem;
}

.summary-card {
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-icon {
  font-size: 2rem;
  margin-right: 1rem;
  opacity: 0.8;
}

.summary-content {
  flex: 1;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.summary-label {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.9;
}

.chart-placeholder {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.patient-info {
  display: flex;
  flex-direction: column;
}

.patient-name {
  font-weight: 600;
  color: #2c3e50;
}

.patient-number {
  color: #6c757d;
}

.amount {
  font-weight: 600;
  color: #28a745;
}

.utilization-bar {
  position: relative;
  width: 100%;
  height: 20px;
  background-color: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.utilization-fill {
  height: 100%;
  background-color: #28a745;
  transition: width 0.3s ease;
}

.utilization-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  .deposit-reports {
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
}
</style>
