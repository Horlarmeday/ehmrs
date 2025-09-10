<template>
  <div class="accounting-dashboard">
    <!-- Breadcrumb Navigation -->
    <nav aria-label="breadcrumb" class="breadcrumb-nav">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a href="#" @click.prevent="navigateTo('dashboard')">
            <i class="fas fa-home"></i> Dashboard
          </a>
        </li>
        <li class="breadcrumb-item active" aria-current="page">
          <i class="fas fa-chart-line"></i> Accounting & Finance
        </li>
      </ol>
    </nav>

    <!-- Header Section -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">
        <i class="fas fa-chart-line text-primary mr-3"></i>
        Accounting & Finance Dashboard
      </h1>
      <div class="header-actions">
        <!-- <b-button variant="primary" @click="createNewBill">
          <i class="fas fa-plus mr-2"></i>New Bill
        </b-button>
        <b-button variant="success" @click="processPayment">
          <i class="fas fa-credit-card mr-2"></i>Process Payment
        </b-button> -->
        <b-button variant="info" @click="recordDeposit">
          <i class="fas fa-piggy-bank mr-2"></i>Record Deposit
        </b-button>
        <b-button variant="outline-secondary" @click="refreshData" :disabled="loading">
          <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>Refresh
        </b-button>
        <b-button variant="outline-dark" @click="navigateTo('dashboard')">
          <i class="fas fa-arrow-left mr-2"></i>Back to Main
        </b-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="text-center">
        <b-spinner variant="primary" label="Loading..."></b-spinner>
        <p class="mt-2">Loading dashboard data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-danger" role="alert">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      {{ error }}
      <b-button variant="outline-danger" size="sm" class="ml-2" @click="loadDashboardData">
        Retry
      </b-button>
    </div>

    <!-- Key Metrics Cards -->
    <div class="metrics-section" v-if="!loading && !error">
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="metric-card bg-primary text-white">
            <div class="metric-icon">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <div class="metric-content">
              <h3 class="metric-value">{{ dashboardData?.totalBills || 0 }}</h3>
              <p class="metric-label">Total Bills</p>
              <small class="metric-change text-white">
                <i
                  :class="
                    (dashboardData?.billsChange || 0) >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'
                  "
                ></i>
                {{ Math.abs(dashboardData?.billsChange || 0) }}% from last month
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
              <h3 class="metric-value">{{ formatCurrency(+dashboardData?.totalRevenue || 0) }}</h3>
              <p class="metric-label">Total Revenue</p>
              <small class="metric-change">
                <i
                  :class="
                    (dashboardData?.revenueChange || 0) >= 0
                      ? 'fas fa-arrow-up'
                      : 'fas fa-arrow-down'
                  "
                ></i>
                {{ Math.abs(dashboardData?.revenueChange || 0) }}% from last month
              </small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="metric-card bg-warning text-white">
            <div class="metric-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="metric-content">
              <h3 class="metric-value">
                {{ formatCurrency(dashboardData?.pendingPayments || 0) }}
              </h3>
              <p class="metric-label">Pending Payments</p>
              <small class="metric-change">
                {{ dashboardData?.pendingCount || 0 }} bills awaiting payment
              </small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="metric-card bg-info text-white">
            <div class="metric-icon">
              <i class="fas fa-piggy-bank"></i>
            </div>
            <div class="metric-content">
              <h3 class="metric-value">{{ formatCurrency(dashboardData?.totalDeposits || 0) }}</h3>
              <p class="metric-label">Patient Deposits</p>
              <small class="metric-change">
                {{ dashboardData?.activeDeposits || 0 }} active deposits
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Section - Prominently Displayed -->
    <div class="activity-section mb-4">
      <div class="section-header">
        <h4><i class="fas fa-history text-primary mr-2"></i>Recent Activity</h4>
        <p class="text-muted">Latest bills, payments, and financial activities</p>
      </div>

      <div class="row">
        <div class="col-lg-6 mb-4">
          <div class="activity-card">
            <div class="card-header">
              <h5><i class="fas fa-file-invoice-dollar text-primary mr-2"></i>Recent Bills</h5>
              <b-button variant="outline-primary" size="sm" @click="viewAllBills"
                >View All</b-button
              >
            </div>
            <div class="activity-list">
              <div v-for="bill in recentBills" :key="bill.id" class="activity-item">
                <div class="activity-icon" :class="getBillStatusClass(bill.payment_status)">
                  <i class="fas fa-file-invoice-dollar"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-title">
                    Bill #{{ bill.bill_number }} - {{ bill.patient_name }}
                  </div>
                  <div class="activity-details">
                    {{ formatCurrency(bill.final_amount) }} • {{ formatDate(bill.createdAt) }}
                  </div>
                  <div class="activity-status">
                    <b-badge :variant="getPaymentStatusVariant(bill.payment_status)">
                      {{ bill.payment_status }}
                    </b-badge>
                  </div>
                </div>
                <div class="activity-actions">
                  <b-button variant="outline-primary" size="sm" @click="viewBill(bill.id)">
                    View
                  </b-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-6 mb-4">
          <div class="activity-card">
            <div class="card-header">
              <h5><i class="fas fa-credit-card text-success mr-2"></i>Recent Payments</h5>
              <b-button variant="outline-primary" size="sm" @click="viewAllPayments"
                >View All</b-button
              >
            </div>
            <div class="activity-list">
              <div v-for="payment in recentPayments" :key="payment.id" class="activity-item">
                <div class="activity-icon bg-success">
                  <i class="fas fa-credit-card"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-title">
                    {{ payment.payment_method }} - {{ payment.patient.fullname }}
                  </div>
                  <div class="activity-details">
                    {{ formatCurrency(payment.amount) }} • {{ formatDate(payment.processed_at) }}
                  </div>
                  <div class="activity-status">
                    <b-badge variant="success">{{ payment.status }}</b-badge>
                  </div>
                </div>
                <div class="activity-actions">
                  <b-button variant="outline-primary" size="sm" @click="viewPayment(payment.id)">
                    View
                  </b-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation Grid - Moved to Bottom -->
    <div class="main-navigation-grid">
      <div class="section-header">
        <h4><i class="fas fa-compass text-primary mr-2"></i>Quick Navigation</h4>
        <p class="text-muted">Access all accounting modules and functions</p>
      </div>

      <div class="navigation-grid">
        <!-- Daily Operations Row -->
        <div class="nav-row">
          <div class="nav-item-large" @click="navigateToPage('bills')">
            <div class="nav-icon-large bg-primary">
              <i class="fas fa-file-invoice"></i>
            </div>
            <div class="nav-content">
              <h5>Bill Management</h5>
              <p>Create, edit, and track clinical bills</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>

          <div class="nav-item-large" @click="navigateToPage('payments')">
            <div class="nav-icon-large bg-success">
              <i class="fas fa-credit-card"></i>
            </div>
            <div class="nav-content">
              <h5>Payments Management</h5>
              <p>Process and track all payment transactions</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>

          <div class="nav-item-large" @click="navigateToPage('deposits')">
            <div class="nav-icon-large bg-warning">
              <i class="fas fa-piggy-bank"></i>
            </div>
            <div class="nav-content">
              <h5>Patient Deposits</h5>
              <p>Manage upfront patient payments</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>

        <!-- Core Accounting Row -->
        <div class="nav-row">
          <div class="nav-item-large" @click="navigateToPage('chart-of-accounts')">
            <div class="nav-icon-large bg-info">
              <i class="fas fa-book"></i>
            </div>
            <div class="nav-content">
              <h5>Chart of Accounts</h5>
              <p>Manage account categories and classifications</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>

          <div class="nav-item-large" @click="navigateToPage('journal-entries')">
            <div class="nav-icon-large bg-success">
              <i class="fas fa-journal-whills"></i>
            </div>
            <div class="nav-content">
              <h5>Journal Entries</h5>
              <p>Record and manage financial transactions</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>

          <div class="nav-item-large" @click="navigateToPage('cost-centers')">
            <div class="nav-icon-large bg-warning">
              <i class="fas fa-building"></i>
            </div>
            <div class="nav-content">
              <h5>Cost Centers</h5>
              <p>Organize expenses by department or function</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>

        <!-- Financial Infrastructure Row -->
        <div class="nav-row">
          <div class="nav-item-large" @click="navigateToPage('bank-accounts')">
            <div class="nav-icon-large bg-primary">
              <i class="fas fa-university"></i>
            </div>
            <div class="nav-content">
              <h5>Bank Accounts</h5>
              <p>Manage hospital bank accounts and balances</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>

          <div class="nav-item-large" @click="navigateToPage('pos-terminals')">
            <div class="nav-icon-large bg-success">
              <i class="fas fa-credit-card"></i>
            </div>
            <div class="nav-content">
              <h5>POS Terminals</h5>
              <p>Manage payment terminals and merchant accounts</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>

          <div class="nav-item-large" @click="navigateToPage('cash-registers')">
            <div class="nav-icon-large bg-warning">
              <i class="fas fa-cash-register"></i>
            </div>
            <div class="nav-content">
              <h5>Cash Registers</h5>
              <p>Manage cash registers and daily cash operations</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>

        <!-- Financial Analysis Row -->
        <div class="nav-row">
          <div class="nav-item-large" @click="navigateToPage('financial-periods')">
            <div class="nav-icon-large bg-info">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="nav-content">
              <h5>Financial Periods</h5>
              <p>Manage accounting periods and fiscal years</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>

          <div class="nav-item-large" @click="navigateToPage('trial-balance')">
            <div class="nav-icon-large bg-secondary">
              <i class="fas fa-balance-scale"></i>
            </div>
            <div class="nav-content">
              <h5>Trial Balance</h5>
              <p>Verify account balances and prepare statements</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>

          <div class="nav-item-large" @click="navigateToPage('financial-reports')">
            <div class="nav-icon-large bg-info">
              <i class="fas fa-chart-bar"></i>
            </div>
            <div class="nav-content">
              <h5>Financial Reports</h5>
              <p>Generate revenue and payment reports</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>

        <!-- Insurance & HMO Row -->
        <div class="nav-row">
          <div class="nav-item-large" @click="navigateToPage('insurance')">
            <div class="nav-icon-large bg-purple">
              <i class="fas fa-shield-alt"></i>
            </div>
            <div class="nav-content">
              <h5>Insurance Management</h5>
              <p>Manage insurance providers and policies</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>

          <div class="nav-item-large" @click="navigateToPage('hmo-claims')">
            <div class="nav-icon-large bg-purple">
              <i class="fas fa-file-medical"></i>
            </div>
            <div class="nav-content">
              <h5>HMO Claims</h5>
              <p>Manage insurance claims and reimbursements</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>

          <div class="nav-item-large" @click="navigateToPage('advanced-reporting-dashboard')">
            <div class="nav-icon-large bg-info">
              <i class="fas fa-brain"></i>
            </div>
            <div class="nav-content">
              <h5>Advanced Analytics</h5>
              <p>AI-powered financial insights and predictions</p>
            </div>
            <div class="nav-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccountingDashboard',
  data() {
    return {
      loading: false,
      error: null,
    };
  },
  computed: {
    dashboardData() {
      const summary = this.$store.getters['accounting/getAccountingSummary'];
      return (
        summary || {
          totalBills: 0,
          totalRevenue: 0,
          pendingPayments: 0,
          totalDeposits: 0,
          billsChange: 0,
          revenueChange: 0,
          pendingCount: 0,
          activeDeposits: 0,
        }
      );
    },
    recentBills() {
      const summary = this.$store.getters['accounting/getAccountingSummary'];
      const bills = summary.recentBills;
      return Array.isArray(bills) ? bills.slice(0, 10) : [];
    },
    recentPayments() {
      const summary = this.$store.getters['accounting/getAccountingSummary'];
      const payments = summary.recentPayments;
      return Array.isArray(payments) ? payments.slice(0, 10) : [];
    },
    isLoading() {
      return this.$store.getters['accounting/loading'] || false;
    },
  },
  async mounted() {
    await this.loadDashboardData();
  },
  methods: {
    async loadDashboardData() {
      try {
        this.loading = true;
        this.error = null;

        // Load dashboard summary using the new accounting store
        await this.$store.dispatch('accounting/fetchAccountingSummary');

        // // Load recent bills
        // await this.$store.dispatch('accounting/fetchClinicalBills', { limit: 10 });

        // // Load recent payments
        // await this.$store.dispatch('accounting/fetchClinicalPayments', { limit: 10 });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        this.error = error.message || 'Failed to load dashboard data';
        this.$bvToast.toast(this.error, {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loading = false;
      }
    },

    async refreshData() {
      await this.loadDashboardData();
    },

    // Navigation methods
    createNewBill() {
      this.$router.push({ name: 'create-bill' });
    },

    processPayment() {
      this.$router.push({ name: 'process-payment' });
    },

    recordDeposit() {
      this.$router.push({ name: 'record-deposit' });
    },

    viewAllBills() {
      this.$router.push({ name: 'bills-list' });
    },

    viewAllPayments() {
      this.$router.push({ name: 'payments-list' });
    },

    viewBill(billId) {
      this.$router.push({ name: 'bill-items', params: { billId } });
    },

    viewPayment(paymentId) {
      this.$router.push({ name: 'payment-details', params: { id: paymentId } });
    },

    navigateToPage(page) {
      console.log(`🚀 Navigating to page: ${page}`);

      // Try route names first, then fall back to paths
      const routeNames = {
        'bank-accounts': 'bank-accounts',
        'pos-terminals': 'pos-terminals',
        'create-bank-account': 'create-bank-account',
        'create-pos-terminal': 'create-pos-terminal',
        'advanced-reporting-dashboard': 'advanced-reporting-dashboard',
      };

      // Direct navigation using paths as fallback
      const pageRoutes = {
        bills: '/accounting/bills',
        payments: '/accounting/payments',
        deposits: '/accounting/deposits',
        'chart-of-accounts': '/accounting/chart-of-accounts',
        'journal-entries': '/accounting/journal-entries',
        'cost-centers': '/accounting/cost-centers',
        'financial-periods': '/accounting/financial-periods',
        'trial-balance': '/accounting/trial-balance',
        'financial-reports': '/accounting/reports',
        'hmo-claims': '/accounting/hmo-claims',
        'advanced-reporting-dashboard': '/accounting/advanced-reports',

        'bank-accounts': '/accounting/bank-accounts',
        'pos-terminals': '/accounting/pos-terminals',
        'cash-registers': '/accounting/cash-registers',
        'create-bank-account': '/accounting/bank-accounts/new',
        'create-pos-terminal': '/accounting/pos-terminals/new',
      };

      // Try route name first
      if (routeNames[page]) {
        console.log(`📍 Trying route name: ${routeNames[page]}`);
        try {
          this.$router.push({ name: routeNames[page] }).catch(err => {
            console.error('❌ Route name navigation failed:', err);
            // Fall back to path navigation
            this.navigateByPath(page, pageRoutes[page]);
          });
        } catch (error) {
          console.error('❌ Route name navigation error:', error);
          // Fall back to path navigation
          this.navigateByPath(page, pageRoutes[page]);
        }
      } else {
        // Use path navigation directly
        this.navigateByPath(page, pageRoutes[page]);
      }
    },

    navigateByPath(page, path) {
      this.$router.push(path);
    },

    navigateTo(route) {
      // Keep this for backward compatibility with existing buttons
      if (route === 'dashboard') {
        this.$router.push('/dashboard');
      } else {
        console.warn(`Unknown route: ${route}`);
      }
    },

    // Utility methods
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount || 0);
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-NG');
    },

    getBillStatusClass(status) {
      const statusClasses = {
        PAID: 'bg-success',
        PARTIAL: 'bg-warning',
        PENDING: 'bg-danger',
      };
      return statusClasses[status] || 'bg-secondary';
    },

    getPaymentStatusVariant(status) {
      const statusVariants = {
        PAID: 'success',
        PARTIAL: 'warning',
        PENDING: 'danger',
      };
      return statusVariants[status] || 'secondary';
    },
  },
};
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.accounting-dashboard {
  padding: 2rem;
}

/* Breadcrumb Navigation */
.breadcrumb-nav {
  margin-bottom: 1.5rem;
}

.breadcrumb {
  background: transparent;
  padding: 0;
  margin: 0;
}

.breadcrumb-item {
  font-size: 0.9rem;
}

.breadcrumb-item a {
  color: #007bff;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item a:hover {
  color: #0056b3;
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #6c757d;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: '>';
  color: #6c757d;
  margin: 0 0.5rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.metrics-section {
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

/* Recent Activity Section - Enhanced */
.activity-section {
  margin-bottom: 2rem;
}

.activity-section .section-header {
  background: linear-gradient(135deg, #f8f9fa, #e3f2fd);
  border-left: 4px solid #2196f3;
  margin-bottom: 1.5rem;
}

.activity-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  height: 100%;
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #007bff;
}

.activity-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
}

.activity-card .card-header h5 {
  margin: 0;
  font-weight: 700;
  color: #2c3e50;
  font-size: 1.25rem;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.activity-item:hover {
  background: #e3f2fd;
  border-color: #2196f3;
  transform: translateX(4px);
}

.activity-item:last-child {
  margin-bottom: 0;
}

.activity-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: white;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.activity-details {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.activity-status {
  margin-bottom: 0.5rem;
}

.activity-actions {
  margin-left: 1rem;
}

.activity-actions .btn {
  border-radius: 20px;
  padding: 0.375rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.activity-actions .btn:hover {
  transform: scale(1.05);
}

/* Reports Link Section */
.reports-link-section .alert {
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-left: 4px solid #2196f3;
}

.reports-link-section .alert-info {
  color: #1565c0;
}

.reports-link-section .fas {
  color: #1976d2;
}

/* Main Navigation Grid */
.main-navigation-grid {
  margin-bottom: 2rem;
}

.navigation-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.nav-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 1200px) {
  .nav-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .nav-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

.nav-item-large {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  min-height: 100px;
}

.nav-item-large::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-item-large:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.nav-item-large:hover::before {
  opacity: 1;
}

.nav-icon-large {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.nav-item-large:hover .nav-icon-large {
  transform: scale(1.1);
}

.nav-content {
  flex: 1;
  min-width: 0;
}

.nav-content h5 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.nav-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.nav-arrow {
  color: #6c757d;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.nav-item-large:hover .nav-arrow {
  color: #007bff;
  transform: translateX(4px);
}

.section-header {
  margin-bottom: 2rem;
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  border-left: 4px solid #007bff;
}

.section-header h4 {
  color: #2c3e50;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.section-header p {
  color: #6c757d;
  margin: 0;
  font-size: 1rem;
}

/* Additional color variants */
.bg-purple {
  background-color: #6f42c1 !important;
}

.bg-secondary {
  background-color: #6c757d !important;
}

@media (max-width: 768px) {
  .accounting-dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .section-header h4 {
    font-size: 1.25rem;
  }

  .nav-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .nav-item-large {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .nav-icon-large {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }

  .nav-content h5 {
    font-size: 1rem;
  }

  .nav-content p {
    font-size: 0.8rem;
  }

  .nav-arrow {
    display: none;
  }
}
</style>
