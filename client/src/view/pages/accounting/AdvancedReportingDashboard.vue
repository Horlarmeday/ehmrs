<template>
  <div class="advanced-reporting-dashboard">
    <!-- Header Section -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-chart-line text-primary mr-3"></i>
        Advanced Reporting & Analytics Dashboard
      </h1>
      <div class="header-actions">
        <b-button variant="outline-primary" @click="refreshAllReports">
          <i class="fas fa-sync-alt mr-2"></i>Refresh All
        </b-button>
        <b-button variant="success" @click="exportAllReports">
          <i class="fas fa-download mr-2"></i>Export All
        </b-button>
      </div>
    </div>

    <!-- Date Range Filters -->
    <div class="filters-section mb-4">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <b-form-group label="Start Date" label-for="start-date">
                <b-form-input
                  id="start-date"
                  v-model="filters.startDate"
                  type="date"
                  @change="loadAllReports"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="End Date" label-for="end-date">
                <b-form-input
                  id="end-date"
                  v-model="filters.endDate"
                  type="date"
                  @change="loadAllReports"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Department" label-for="department">
                <b-form-select
                  id="department"
                  v-model="filters.department"
                  :options="departmentOptions"
                  @change="loadAllReports"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Report Type" label-for="report-type">
                <b-form-select
                  id="report-type"
                  v-model="filters.reportType"
                  :options="reportTypeOptions"
                  @change="loadAllReports"
                ></b-form-select>
              </b-form-group>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading reports...</span>
      </div>
      <p class="mt-3">Generating comprehensive reports...</p>
    </div>

    <!-- Reports Grid -->
    <div v-else class="reports-grid">
      <!-- Financial Reporting Section -->
      <div class="report-section mb-4">
        <h3 class="section-title">
          <i class="fas fa-file-invoice-dollar text-success mr-2"></i>
          Financial Reporting
        </h3>
        <div class="row">
          <div class="col-lg-6 mb-3">
            <div class="report-card">
              <div class="card-header">
                <h5>Profit & Loss Statement</h5>
                <b-button variant="outline-primary" size="sm" @click="loadProfitLossStatement">
                  <i class="fas fa-sync-alt"></i>
                </b-button>
              </div>
              <div class="card-body">
                <div v-if="profitLossStatement" class="report-content">
                  <div class="metric-row">
                    <span class="metric-label">Total Revenue:</span>
                    <span class="metric-value text-success">{{ formatCurrency(profitLossStatement.totalRevenue || 0) }}</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Total Expenses:</span>
                    <span class="metric-value text-danger">{{ formatCurrency(profitLossStatement.totalExpenses || 0) }}</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Net Income:</span>
                    <span class="metric-value" :class="getNetIncomeClass(profitLossStatement.netIncome)">
                      {{ formatCurrency(profitLossStatement.netIncome || 0) }}
                    </span>
                  </div>
                </div>
                <div v-else class="text-muted">Click refresh to load data</div>
              </div>
            </div>
          </div>

          <div class="col-lg-6 mb-3">
            <div class="report-card">
              <div class="card-header">
                <h5>Balance Sheet</h5>
                <b-button variant="outline-primary" size="sm" @click="loadBalanceSheet">
                  <i class="fas fa-sync-alt"></i>
                </b-button>
              </div>
              <div class="card-body">
                <div v-if="balanceSheet" class="report-content">
                  <div class="metric-row">
                    <span class="metric-label">Total Assets:</span>
                    <span class="metric-value text-success">{{ formatCurrency(balanceSheet.totalAssets || 0) }}</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Total Liabilities:</span>
                    <span class="metric-value text-danger">{{ formatCurrency(balanceSheet.totalLiabilities || 0) }}</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Total Equity:</span>
                    <span class="metric-value text-info">{{ formatCurrency(balanceSheet.totalEquity || 0) }}</span>
                  </div>
                </div>
                <div v-else class="text-muted">Click refresh to load data</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Operational Reporting Section -->
      <div class="report-section mb-4">
        <h3 class="section-title">
          <i class="fas fa-tachometer-alt text-warning mr-2"></i>
          Operational Reporting
        </h3>
        <div class="row">
          <div class="col-lg-6 mb-3">
            <div class="report-card">
              <div class="card-header">
                <h5>Payment Performance</h5>
                <b-button variant="outline-primary" size="sm" @click="loadOperationalPerformance">
                  <i class="fas fa-sync-alt"></i>
                </b-button>
              </div>
              <div class="card-body">
                <div v-if="operationalPerformance" class="report-content">
                  <div class="metric-row">
                    <span class="metric-label">Success Rate:</span>
                    <span class="metric-value text-success">{{ (operationalPerformance.successRate || 0).toFixed(1) }}%</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Avg Processing Time:</span>
                    <span class="metric-value">{{ operationalPerformance.avgProcessingTime || 0 }}s</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Total Transactions:</span>
                    <span class="metric-value">{{ operationalPerformance.totalTransactions || 0 }}</span>
                  </div>
                </div>
                <div v-else class="text-muted">Click refresh to load data</div>
              </div>
            </div>
          </div>

          <div class="col-lg-6 mb-3">
            <div class="report-card">
              <div class="card-header">
                <h5>Payment Method Utilization</h5>
                <b-button variant="outline-primary" size="sm" @click="loadPaymentMethodUtilization">
                  <i class="fas fa-sync-alt"></i>
                </b-button>
              </div>
              <div class="card-body">
                <div v-if="paymentMethodUtilization" class="report-content">
                  <div v-for="method in paymentMethodUtilization.topMethods" :key="method.method" class="metric-row">
                    <span class="metric-label">{{ method.method }}:</span>
                    <span class="metric-value">{{ (method.percentage || 0).toFixed(1) }}%</span>
                  </div>
                </div>
                <div v-else class="text-muted">Click refresh to load data</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Business Intelligence Section -->
      <div class="report-section mb-4">
        <h3 class="section-title">
          <i class="fas fa-brain text-info mr-2"></i>
          Business Intelligence
        </h3>
        <div class="row">
          <div class="col-lg-6 mb-3">
            <div class="report-card">
              <div class="card-header">
                <h5>Payment Trends</h5>
                <b-button variant="outline-primary" size="sm" @click="loadPaymentTrendAnalysis">
                  <i class="fas fa-sync-alt"></i>
                </b-button>
              </div>
              <div class="card-body">
                <div v-if="paymentTrendAnalysis" class="report-content">
                  <div class="metric-row">
                    <span class="metric-label">Growth Rate:</span>
                    <span class="metric-value" :class="getGrowthClass(paymentTrendAnalysis.growthRate)">
                      {{ (paymentTrendAnalysis.growthRate || 0).toFixed(1) }}%
                    </span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Peak Day:</span>
                    <span class="metric-value">{{ paymentTrendAnalysis.peakDay || 'N/A' }}</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Seasonal Pattern:</span>
                    <span class="metric-value">{{ paymentTrendAnalysis.seasonalPattern || 'N/A' }}</span>
                  </div>
                </div>
                <div v-else class="text-muted">Click refresh to load data</div>
              </div>
            </div>
          </div>

          <div class="col-lg-6 mb-3">
            <div class="report-card">
              <div class="card-header">
                <h5>Predictive Analytics</h5>
                <b-button variant="outline-primary" size="sm" @click="loadPredictiveAnalytics">
                  <i class="fas fa-sync-alt"></i>
                </b-button>
              </div>
              <div class="card-body">
                <div v-if="predictiveAnalytics" class="report-content">
                  <div class="metric-row">
                    <span class="metric-label">Next Month Forecast:</span>
                    <span class="metric-value text-primary">{{ formatCurrency(predictiveAnalytics.nextMonthForecast || 0) }}</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Confidence Level:</span>
                    <span class="metric-value">{{ (predictiveAnalytics.confidenceLevel || 0).toFixed(1) }}%</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Risk Assessment:</span>
                    <span class="metric-value" :class="getRiskClass(predictiveAnalytics.riskLevel)">
                      {{ predictiveAnalytics.riskLevel || 'N/A' }}
                    </span>
                  </div>
                </div>
                <div v-else class="text-muted">Click refresh to load data</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'AdvancedReportingDashboard',
  data() {
    return {
      filters: {
        startDate: '',
        endDate: '',
        department: '',
        reportType: 'comprehensive'
      },
      departmentOptions: [
        { value: '', text: 'All Departments' },
        { value: 'pharmacy', text: 'Pharmacy' },
        { value: 'laboratory', text: 'Laboratory' },
        { value: 'radiology', text: 'Radiology' },
        { value: 'services', text: 'Services' },
        { value: 'consultation', text: 'Consultation' }
      ],
      reportTypeOptions: [
        { value: 'comprehensive', text: 'Comprehensive' },
        { value: 'financial', text: 'Financial Only' },
        { value: 'operational', text: 'Operational Only' },
        { value: 'business-intelligence', text: 'Business Intelligence Only' }
      ]
    };
  },
  computed: {
    ...mapGetters('accounting', [
      'loading',
      'getProfitLossStatement',
      'getBalanceSheet',
      'getOperationalPerformanceReport',
      'getPaymentMethodUtilization',
      'getPaymentTrendAnalysis',
      'getPredictiveAnalytics'
    ]),
    profitLossStatement() {
      return this.getProfitLossStatement;
    },
    balanceSheet() {
      return this.getBalanceSheet;
    },
    operationalPerformance() {
      return this.getOperationalPerformanceReport;
    },
    paymentMethodUtilization() {
      return this.getPaymentMethodUtilization;
    },
    paymentTrendAnalysis() {
      return this.getPaymentTrendAnalysis;
    },
    predictiveAnalytics() {
      return this.getPredictiveAnalytics;
    }
  },
  methods: {
    ...mapActions('accounting', [
      'fetchProfitLossStatement',
      'fetchBalanceSheet',
      'fetchOperationalPerformanceReport',
      'fetchPaymentMethodUtilization',
      'fetchPaymentTrendAnalysis',
      'fetchPredictiveAnalytics'
    ]),
    
    setDefaultDates() {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      this.filters.endDate = endDate.toISOString().split('T')[0];
      this.filters.startDate = startDate.toISOString().split('T')[0];
    },

    async loadAllReports() {
      try {
        await Promise.all([
          this.loadProfitLossStatement(),
          this.loadBalanceSheet(),
          this.loadOperationalPerformance(),
          this.loadPaymentMethodUtilization(),
          this.loadPaymentTrendAnalysis(),
          this.loadPredictiveAnalytics()
        ]);
      } catch (error) {
        console.error('Failed to load reports:', error);
        this.$bvToast.toast('Failed to load some reports', {
          title: 'Warning',
          variant: 'warning',
          solid: true,
        });
      }
    },

    async loadProfitLossStatement() {
      try {
        await this.fetchProfitLossStatement(this.filters);
      } catch (error) {
        console.error('Failed to load P&L statement:', error);
      }
    },

    async loadBalanceSheet() {
      try {
        await this.fetchBalanceSheet(this.filters);
      } catch (error) {
        console.error('Failed to load balance sheet:', error);
      }
    },

    async loadOperationalPerformance() {
      try {
        await this.fetchOperationalPerformanceReport(this.filters);
      } catch (error) {
        console.error('Failed to load operational performance:', error);
      }
    },

    async loadPaymentMethodUtilization() {
      try {
        await this.fetchPaymentMethodUtilization(this.filters);
      } catch (error) {
        console.error('Failed to load payment method utilization:', error);
      }
    },

    async loadPaymentTrendAnalysis() {
      try {
        await this.fetchPaymentTrendAnalysis(this.filters);
      } catch (error) {
        console.error('Failed to load payment trend analysis:', error);
      }
    },

    async loadPredictiveAnalytics() {
      try {
        await this.fetchPredictiveAnalytics(this.filters);
      } catch (error) {
        console.error('Failed to load predictive analytics:', error);
      }
    },

    async refreshAllReports() {
      await this.loadAllReports();
    },

    async exportAllReports() {
      // Implementation for exporting all reports
      this.$bvToast.toast('Export functionality coming soon', {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    },

    getNetIncomeClass(netIncome) {
      return netIncome >= 0 ? 'text-success' : 'text-danger';
    },

    getGrowthClass(growthRate) {
      return growthRate >= 0 ? 'text-success' : 'text-danger';
    },

    getRiskClass(riskLevel) {
      const riskClasses = {
        'LOW': 'text-success',
        'MEDIUM': 'text-warning',
        'HIGH': 'text-danger'
      };
      return riskClasses[riskLevel] || 'text-muted';
    }
  },
  async mounted() {
    this.setDefaultDates();
    await this.loadAllReports();
  }
};
</script>

<style scoped>
.advanced-reporting-dashboard {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filters-section .card {
  border: 1px solid #e3e6f0;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
}

.report-section {
  margin-bottom: 30px;
}

.section-title {
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e3e6f0;
}

.report-card {
  background: white;
  border: 1px solid #e3e6f0;
  border-radius: 8px;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
  height: 100%;
}

.report-card .card-header {
  background: #f8f9fc;
  border-bottom: 1px solid #e3e6f0;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-card .card-header h5 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.report-card .card-body {
  padding: 20px;
}

.report-content {
  min-height: 120px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fc;
}

.metric-row:last-child {
  border-bottom: none;
}

.metric-label {
  font-weight: 500;
  color: #666;
}

.metric-value {
  font-weight: 600;
  font-size: 1.1em;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
</style>
