<template>
  <div class="trial-balance">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-balance-scale text-info mr-3"></i>
          Trial Balance
        </h1>
        <p class="page-subtitle">
          View real-time account balances with comprehensive period filtering and financial analysis
        </p>
      </div>
      <div class="header-actions">
        <b-button variant="outline-primary" @click="exportTrialBalance">
          <i class="fas fa-download mr-2"></i>Export
        </b-button>
        <b-button variant="info" @click="refreshData">
          <i class="fas fa-sync-alt mr-2"></i>Refresh
        </b-button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section">
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-primary text-white">
            <div class="summary-icon">
              <i class="fas fa-balance-scale"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ formatCurrency(summaryData.totalDebits) }}</h3>
              <p class="summary-label">Total Debits</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-success text-white">
            <div class="summary-icon">
              <i class="fas fa-balance-scale"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ formatCurrency(summaryData.totalCredits) }}</h3>
              <p class="summary-label">Total Credits</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-info text-white">
            <div class="summary-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData.balancedAccounts }}</h3>
              <p class="summary-label">Balanced Accounts</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card" :class="getBalanceClass()">
            <div class="summary-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ formatCurrency(summaryData.difference) }}</h3>
              <p class="summary-label">Difference</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <b-form-group label="Financial Period" label-for="period-select">
                <b-form-select
                  id="period-select"
                  v-model="filters.period"
                  :options="periodOptions"
                  @change="loadTrialBalance"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Start Date" label-for="start-date">
                <b-form-input
                  id="start-date"
                  v-model="filters.startDate"
                  type="date"
                  @change="loadTrialBalance"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="End Date" label-for="end-date">
                <b-form-input
                  id="end-date"
                  v-model="filters.endDate"
                  type="date"
                  @change="loadTrialBalance"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Account Type" label-for="account-type">
                <b-form-select
                  id="account-type"
                  v-model="filters.accountType"
                  :options="accountTypeOptions"
                  @change="loadTrialBalance"
                ></b-form-select>
              </b-form-group>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-md-6">
              <b-form-group label="Search" label-for="search-input">
                <b-form-input
                  id="search-input"
                  v-model="filters.search"
                  placeholder="Search accounts..."
                  @input="debounceSearch"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <div class="d-flex gap-2 mt-4">
                <b-button variant="outline-secondary" @click="clearFilters">
                  Clear Filters
                </b-button>
                <b-button variant="primary" @click="loadTrialBalance">
                  <i class="fas fa-search mr-2"></i>Generate Report
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trial Balance Table -->
    <div class="trial-balance-section">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="fas fa-table mr-2"></i>
            Trial Balance Report
          </h5>
          <div class="header-actions">
            <b-button-group size="sm">
              <b-button
                @click="setViewMode('detailed')"
                :variant="viewMode === 'detailed' ? 'primary' : 'outline-primary'"
              >
                <i class="fas fa-list mr-1"></i>Detailed
              </b-button>
              <b-button
                @click="setViewMode('summary')"
                :variant="viewMode === 'summary' ? 'primary' : 'outline-primary'"
              >
                <i class="fas fa-chart-pie mr-1"></i>Summary
              </b-button>
            </b-button-group>
          </div>
        </div>
        <div class="card-body">
          <!-- Detailed View -->
          <div v-if="viewMode === 'detailed'" class="detailed-view">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th>Account Code</th>
                    <th>Account Name</th>
                    <th>Type</th>
                    <th>Opening Balance</th>
                    <th class="text-right">Debits</th>
                    <th class="text-right">Credits</th>
                    <th class="text-right">Closing Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="account in trialBalance"
                    :key="account.id"
                    :class="getAccountRowClass(account)"
                  >
                    <td>
                      <strong>{{ account.code }}</strong>
                    </td>
                    <td>{{ account.name }}</td>
                    <td>
                      <b-badge :variant="getTypeVariant(account.type)">
                        {{ account.type }}
                      </b-badge>
                    </td>
                    <td>{{ formatCurrency(account.opening_balance) }}</td>
                    <td class="text-right">
                      <span class="debit-amount">{{ formatCurrency(account.debits) }}</span>
                    </td>
                    <td class="text-right">
                      <span class="credit-amount">{{ formatCurrency(account.credits) }}</span>
                    </td>
                    <td class="text-right">
                      <span :class="getBalanceClass(account.closing_balance)">
                        {{ formatCurrency(account.closing_balance) }}
                      </span>
                    </td>
                    <td>
                      <b-badge :variant="getStatusVariant(account.status)">
                        {{ account.status }}
                      </b-badge>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="table-dark">
                  <tr>
                    <td colspan="4" class="text-right"><strong>Totals:</strong></td>
                    <td class="text-right">
                      <strong class="debit-amount">{{ formatCurrency(totalDebits) }}</strong>
                    </td>
                    <td class="text-right">
                      <strong class="credit-amount">{{ formatCurrency(totalCredits) }}</strong>
                    </td>
                    <td class="text-right">
                      <strong>{{ formatCurrency(totalClosingBalance) }}</strong>
                    </td>
                    <td>
                      <b-badge :variant="getBalanceStatusVariant()">
                        {{ getBalanceStatus() }}
                      </b-badge>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Summary View -->
          <div v-else class="summary-view">
            <div class="row">
              <div class="col-md-6">
                <div class="summary-chart">
                  <h6>Account Type Distribution</h6>
                  <canvas ref="accountTypeChart" height="300"></canvas>
                </div>
              </div>
              <div class="col-md-6">
                <div class="summary-chart">
                  <h6>Balance Trend</h6>
                  <canvas ref="balanceTrendChart" height="300"></canvas>
                </div>
              </div>
            </div>
            <div class="row mt-4">
              <div class="col-12">
                <div class="summary-table">
                  <h6>Summary by Account Type</h6>
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead class="thead-light">
                        <tr>
                          <th>Account Type</th>
                          <th>Count</th>
                          <th>Total Debits</th>
                          <th>Total Credits</th>
                          <th>Net Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="summary in accountTypeSummary" :key="summary.type">
                          <td>
                            <b-badge :variant="getTypeVariant(summary.type)">
                              {{ summary.type }}
                            </b-badge>
                          </td>
                          <td>{{ summary.count }}</td>
                          <td>{{ formatCurrency(summary.totalDebits) }}</td>
                          <td>{{ formatCurrency(summary.totalCredits) }}</td>
                          <td>
                            <span :class="getBalanceClass(summary.netBalance)">
                              {{ formatCurrency(summary.netBalance) }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analysis Section -->
    <div class="analysis-section">
      <div class="row">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h6>Balance Analysis</h6>
            </div>
            <div class="card-body">
              <div class="analysis-item">
                <span class="analysis-label">Debit/Credit Ratio:</span>
                <span class="analysis-value">{{ debitCreditRatio }}%</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">Balanced Accounts:</span>
                <span class="analysis-value">{{ balancedAccountsPercentage }}%</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">Variance:</span>
                <span class="analysis-value" :class="getVarianceClass()">
                  {{ formatCurrency(variance) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h6>Period Information</h6>
            </div>
            <div class="card-body">
              <div class="analysis-item">
                <span class="analysis-label">Period:</span>
                <span class="analysis-value">{{ selectedPeriod?.name || 'Custom Range' }}</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">Date Range:</span>
                <span class="analysis-value">
                  {{ formatDate(filters.startDate) }} - {{ formatDate(filters.endDate) }}
                </span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">Generated:</span>
                <span class="analysis-value">{{ formatDateTime(new Date()) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'TrialBalance',
  data() {
    return {
      // View mode
      viewMode: 'detailed',

      // Filters
      filters: {
        period: '',
        startDate: '',
        endDate: '',
        accountType: '',
        search: '',
      },

      // Charts
      charts: {
        accountType: null,
        balanceTrend: null,
      },

      // Options
      periodOptions: [
        { value: '', text: 'Select Period' },
        { value: 'current', text: 'Current Period' },
        { value: 'previous', text: 'Previous Period' },
        { value: 'custom', text: 'Custom Range' },
      ],
      accountTypeOptions: [
        { value: '', text: 'All Types' },
        { value: 'ASSET', text: 'Asset' },
        { value: 'LIABILITY', text: 'Liability' },
        { value: 'EQUITY', text: 'Equity' },
        { value: 'INCOME', text: 'Income' },
        { value: 'EXPENSE', text: 'Expense' },
      ],
    };
  },
  computed: {
    trialBalance() {
      return this.$store.getters['accounting/getTrialBalance'] || [];
    },
    summaryData() {
      return this.$store.getters['accounting/getTrialBalanceSummary'] || {};
    },
    selectedPeriod() {
      return this.periodOptions.find(p => p.value === this.filters.period);
    },
    totalDebits() {
      return this.trialBalance.reduce((sum, account) => sum + (account.debits || 0), 0);
    },
    totalCredits() {
      return this.trialBalance.reduce((sum, account) => sum + (account.credits || 0), 0);
    },
    totalClosingBalance() {
      return this.trialBalance.reduce((sum, account) => sum + (account.closing_balance || 0), 0);
    },
    debitCreditRatio() {
      if (this.totalCredits === 0) return 0;
      return ((this.totalDebits / this.totalCredits) * 100).toFixed(2);
    },
    balancedAccountsPercentage() {
      const balanced = this.trialBalance.filter(account => Math.abs(account.closing_balance) < 0.01)
        .length;
      return this.trialBalance.length > 0
        ? ((balanced / this.trialBalance.length) * 100).toFixed(2)
        : 0;
    },
    variance() {
      return Math.abs(this.totalDebits - this.totalCredits);
    },
    accountTypeSummary() {
      const summary = {};
      this.trialBalance.forEach(account => {
        if (!summary[account.type]) {
          summary[account.type] = {
            type: account.type,
            count: 0,
            totalDebits: 0,
            totalCredits: 0,
            netBalance: 0,
          };
        }
        summary[account.type].count++;
        summary[account.type].totalDebits += account.debits || 0;
        summary[account.type].totalCredits += account.credits || 0;
        summary[account.type].netBalance += account.closing_balance || 0;
      });
      return Object.values(summary);
    },
  },
  async mounted() {
    this.setDefaultDates();
    await this.loadTrialBalance();
    this.initializeCharts();
  },
  methods: {
    setDefaultDates() {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      this.filters.endDate = endDate.toISOString().split('T')[0];
      this.filters.startDate = startDate.toISOString().split('T')[0];
    },

    async loadTrialBalance() {
      try {
        const params = {
          period: this.filters.period,
          start_date: this.filters.startDate,
          end_date: this.filters.endDate,
          account_type: this.filters.accountType,
          search: this.filters.search,
        };
        await this.$store.dispatch('accounting/fetchTrialBalance', params);
        this.updateCharts();
      } catch (error) {
        console.error('Failed to load trial balance:', error);
      }
    },

    setViewMode(mode) {
      this.viewMode = mode;
      if (mode === 'summary') {
        this.$nextTick(() => {
          this.updateCharts();
        });
      }
    },

    initializeCharts() {
      this.initializeAccountTypeChart();
      this.initializeBalanceTrendChart();
    },

    initializeAccountTypeChart() {
      const ctx = this.$refs.accountTypeChart?.getContext('2d');
      if (!ctx) return;

      this.charts.accountType = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d'],
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

    initializeBalanceTrendChart() {
      const ctx = this.$refs.balanceTrendChart?.getContext('2d');
      if (!ctx) return;

      this.charts.balanceTrend = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Net Balance',
              data: [],
              borderColor: '#17a2b8',
              backgroundColor: 'rgba(23, 162, 184, 0.1)',
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

    updateCharts() {
      this.updateAccountTypeChart();
      this.updateBalanceTrendChart();
    },

    updateAccountTypeChart() {
      if (!this.charts.accountType) return;

      const summary = this.accountTypeSummary;
      this.charts.accountType.data.labels = summary.map(item => item.type);
      this.charts.accountType.data.datasets[0].data = summary.map(item => item.count);
      this.charts.accountType.update();
    },

    updateBalanceTrendChart() {
      if (!this.charts.balanceTrend) return;

      // Generate sample trend data (in real app, this would come from API)
      const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const data = [0, 1000, -500, 2000, -1000, 1500];

      this.charts.balanceTrend.data.labels = labels;
      this.charts.balanceTrend.data.datasets[0].data = data;
      this.charts.balanceTrend.update();
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

    formatDateTime(date) {
      return date.toLocaleString('en-NG');
    },

    getAccountRowClass(account) {
      return {
        'account-active': account.status === 'ACTIVE',
        'account-inactive': account.status === 'INACTIVE',
        'account-zero-balance': Math.abs(account.closing_balance) < 0.01,
      };
    },

    getTypeVariant(type) {
      const variants = {
        ASSET: 'success',
        LIABILITY: 'danger',
        EQUITY: 'primary',
        INCOME: 'info',
        EXPENSE: 'warning',
      };
      return variants[type] || 'secondary';
    },

    getStatusVariant(status) {
      return status === 'ACTIVE' ? 'success' : 'danger';
    },

    getBalanceClass(balance) {
      if (balance === 0) return 'text-muted';
      return balance > 0 ? 'text-success' : 'text-danger';
    },

    getBalanceStatusVariant() {
      if (this.variance < 0.01) return 'success';
      return 'danger';
    },

    getBalanceStatus() {
      if (this.variance < 0.01) return 'BALANCED';
      return 'UNBALANCED';
    },

    getVarianceClass() {
      if (this.variance < 0.01) return 'text-success';
      return 'text-danger';
    },

    // Filter methods
    clearFilters() {
      this.filters = {
        period: '',
        startDate: '',
        endDate: '',
        accountType: '',
        search: '',
      };
      this.setDefaultDates();
      this.loadTrialBalance();
    },

    debounceSearch: debounce(function() {
      this.loadTrialBalance();
    }, 500),

    refreshData() {
      this.loadTrialBalance();
    },

    exportTrialBalance() {
      // Implement export functionality
      this.$bvToast.toast('Export functionality coming soon', {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },
  },
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
</script>

<style scoped>
.trial-balance {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1rem;
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
  font-size: 2.5rem;
  margin-right: 1rem;
  opacity: 0.8;
}

.summary-content {
  flex: 1;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.summary-label {
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
}

.filters-section {
  margin-bottom: 2rem;
}

.trial-balance-section {
  margin-bottom: 2rem;
}

.detailed-view,
.summary-view {
  min-height: 400px;
}

.debit-amount {
  font-weight: 600;
  color: #dc3545;
}

.credit-amount {
  font-weight: 600;
  color: #28a745;
}

.summary-chart {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.summary-chart h6 {
  margin-bottom: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.summary-table {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.summary-table h6 {
  margin-bottom: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.analysis-section {
  margin-bottom: 2rem;
}

.analysis-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.analysis-item:last-child {
  border-bottom: none;
}

.analysis-label {
  font-weight: 500;
  color: #6c757d;
}

.analysis-value {
  font-weight: 600;
  color: #2c3e50;
}

/* Account row classes */
.account-active {
  background-color: #f8f9fa;
}

.account-inactive {
  background-color: #f8d7da;
  opacity: 0.7;
}

.account-zero-balance {
  background-color: #e2e3e5;
}

@media (max-width: 768px) {
  .trial-balance {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .summary-chart,
  .summary-table {
    margin-bottom: 1rem;
  }
}
</style>
