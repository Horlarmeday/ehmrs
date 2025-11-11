<template>
  <div class="finance-officer-dashboard">
    <!-- Breadcrumb Navigation -->
    <nav aria-label="breadcrumb" class="breadcrumb-nav">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a href="#" @click.prevent="navigateTo('dashboard')">
            <i class="fas fa-home"></i> Dashboard
          </a>
        </li>
        <li class="breadcrumb-item active" aria-current="page">
          <i class="fas fa-cash-register"></i> Cashier Operations
        </li>
      </ol>
    </nav>

    <!-- Header Section -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">
        <i class="fas fa-cash-register text-success mr-3"></i>
        Cashier Dashboard
      </h1>
      <div class="header-actions">
        <b-button variant="success" @click="processPayment" size="lg">
          <i class="fas fa-credit-card mr-2"></i>Process Payment
        </b-button>
        <b-button variant="info" @click="recordDeposit" size="lg">
          <i class="fas fa-piggy-bank mr-2"></i>Record Deposit
        </b-button>
        <b-button variant="outline-secondary" @click="refreshData" :disabled="loading">
          <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>Refresh
        </b-button>
      </div>
    </div>

    <QuickbooksIntegrationCard class="mb-4" />

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
          <div class="metric-card bg-success text-white">
            <div class="metric-icon">
              <i class="fas fa-calendar-day"></i>
            </div>
            <div class="metric-content">
              <h3 class="metric-value">
                {{ formatCurrency(dashboardData?.todayCollections || 0) }}
              </h3>
              <p class="metric-label">Today's Collections</p>
              <small class="metric-change text-white">
                <i
                  :class="
                    (dashboardData?.todayChange || 0) >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'
                  "
                ></i>
                {{ Math.abs(dashboardData?.todayChange || 0) }}% from yesterday
              </small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="metric-card bg-primary text-white">
            <div class="metric-icon">
              <i class="fas fa-calendar-week"></i>
            </div>
            <div class="metric-content">
              <h3 class="metric-value">
                {{ formatCurrency(dashboardData?.weeklyCollections || 0) }}
              </h3>
              <p class="metric-label">This Week</p>
              <small class="metric-change text-white">
                <i
                  :class="
                    (dashboardData?.weeklyChange || 0) >= 0
                      ? 'fas fa-arrow-up'
                      : 'fas fa-arrow-down'
                  "
                ></i>
                {{ Math.abs(dashboardData?.weeklyChange || 0) }}% from last week
              </small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="metric-card bg-info text-white">
            <div class="metric-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="metric-content">
              <h3 class="metric-value">
                {{ formatCurrency(dashboardData?.monthlyCollections || 0) }}
              </h3>
              <p class="metric-label">This Month</p>
              <small class="metric-change text-white">
                <i
                  :class="
                    (dashboardData?.monthlyChange || 0) >= 0
                      ? 'fas fa-arrow-up'
                      : 'fas fa-arrow-down'
                  "
                ></i>
                {{ Math.abs(dashboardData?.monthlyChange || 0) }}% from last month
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
              <h3 class="metric-value">{{ dashboardData?.pendingCount || 0 }}</h3>
              <p class="metric-label">Pending Bills</p>
              <small class="metric-change text-white">
                {{ formatCurrency(dashboardData?.pendingPayments || 0) }} awaiting payment
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="activity-section mb-4">
      <div class="section-header">
        <h4><i class="fas fa-history text-success mr-2"></i>Recent Activity</h4>
        <p class="text-muted">Latest bills and payments processed</p>
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
                    {{ bill.patient.fullname }}
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
              <div v-if="recentBills.length === 0" class="text-center text-muted py-4">
                <i class="fas fa-inbox fa-3x mb-2"></i>
                <p>No recent bills</p>
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
              <div v-if="recentPayments.length === 0" class="text-center text-muted py-4">
                <i class="fas fa-inbox fa-3x mb-2"></i>
                <p>No recent payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Operations Grid -->
    <div class="daily-operations-section">
      <div class="section-header">
        <h4><i class="fas fa-tasks text-success mr-2"></i>Daily Operations</h4>
        <p class="text-muted">Quick access to your daily cashier tasks</p>
      </div>

      <div class="operations-grid">
        <div class="operation-card" @click="navigateToPage('bills')">
          <div class="operation-icon bg-primary">
            <i class="fas fa-file-invoice"></i>
          </div>
          <div class="operation-content">
            <h5>Bill Management</h5>
            <p>View and manage patient bills</p>
          </div>
          <div class="operation-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="operation-card" @click="navigateToPage('payments')">
          <div class="operation-icon bg-success">
            <i class="fas fa-credit-card"></i>
          </div>
          <div class="operation-content">
            <h5>Payment History</h5>
            <p>View all patient payments</p>
          </div>
          <div class="operation-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="operation-card" @click="navigateToPage('deposits')">
          <div class="operation-icon bg-info">
            <i class="fas fa-piggy-bank"></i>
          </div>
          <div class="operation-content">
            <h5>Patient Deposits</h5>
            <p>Manage patient deposits and prepayments</p>
          </div>
          <div class="operation-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="operation-card" @click="navigateToPage('patient-financial-lookup')">
          <div class="operation-icon bg-warning">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="operation-content">
            <h5>Patient Lookup</h5>
            <p>View patient financial records</p>
          </div>
          <div class="operation-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="operation-card" @click="navigateToPage('cash-registers')">
          <div class="operation-icon bg-danger">
            <i class="fas fa-cash-register"></i>
          </div>
          <div class="operation-content">
            <h5>Cash Registers</h5>
            <p>Manage cash register operations</p>
          </div>
          <div class="operation-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="operation-card" @click="navigateToPage('pos-terminals')">
          <div class="operation-icon bg-purple">
            <i class="fas fa-credit-card"></i>
          </div>
          <div class="operation-content">
            <h5>POS Terminals</h5>
            <p>Manage POS terminal transactions</p>
          </div>
          <div class="operation-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Billing Configuration Section -->
    <div class="billing-configuration-section">
      <div class="section-header">
        <h4><i class="fas fa-cog text-primary mr-2"></i>Billing Configuration</h4>
        <p class="text-muted">View pricing information for services, tests, and inventory</p>
      </div>

      <div class="operations-grid">
        <div class="operation-card" @click="navigateToPage('services')">
          <div class="operation-icon bg-info">
            <i class="fas fa-concierge-bell"></i>
          </div>
          <div class="operation-content">
            <h5>Services</h5>
            <p>View service pricing and billing</p>
          </div>
          <div class="operation-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="operation-card" @click="navigateToPage('tests')">
          <div class="operation-icon bg-success">
            <i class="fas fa-flask"></i>
          </div>
          <div class="operation-content">
            <h5>Laboratory Tests</h5>
            <p>View test pricing and billing</p>
          </div>
          <div class="operation-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="operation-card" @click="navigateToPage('inventory-items')">
          <div class="operation-icon bg-primary">
            <i class="fas fa-pills"></i>
          </div>
          <div class="operation-content">
            <h5>Inventory Items (Drugs)</h5>
            <p>View drug inventory and pricing</p>
          </div>
          <div class="operation-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
        <div class="operation-card" @click="navigateToPage('admitted-patients')">
          <div class="operation-icon bg-primary">
            <i class="fas fa-hospital-user"></i>
          </div>
          <div class="operation-content">
            <h5>Admitted Patients</h5>
            <p>View financial records for currently admitted patients</p>
          </div>
          <div class="operation-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Basic Reports Section -->
    <div class="reports-section mt-4">
      <div class="section-header">
        <h4><i class="fas fa-chart-bar text-primary mr-2"></i>Quick Reports</h4>
        <p class="text-muted">Generate and view basic financial reports</p>
      </div>

      <div class="reports-grid">
        <div class="report-card" @click="navigateToPage('financial-reports')">
          <div class="report-icon bg-primary">
            <i class="fas fa-file-invoice-dollar"></i>
          </div>
          <div class="report-content">
            <h5>Collections Report</h5>
            <p>View today's collections summary</p>
          </div>
        </div>

        <div class="report-card" @click="navigateToPage('financial-reports')">
          <div class="report-icon bg-success">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="report-content">
            <h5>Payment Summary</h5>
            <p>Summary of payment methods used</p>
          </div>
        </div>

        <div class="report-card" @click="navigateToPage('financial-reports')">
          <div class="report-icon bg-info">
            <i class="fas fa-clock"></i>
          </div>
          <div class="report-content">
            <h5>Shift Report</h5>
            <p>Generate your shift summary</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QuickbooksIntegrationCard from '@/view/components/accounting/QuickbooksIntegrationCard.vue';

export default {
  name: 'FinanceOfficerDashboard',
  components: {
    QuickbooksIntegrationCard,
  },
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
          todayCollections: 0,
          weeklyCollections: 0,
          monthlyCollections: 0,
          pendingPayments: 0,
          pendingCount: 0,
          todayChange: 0,
          weeklyChange: 0,
          monthlyChange: 0,
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
  },
  async mounted() {
    await this.loadDashboardData();
  },
  methods: {
    async loadDashboardData() {
      try {
        this.loading = true;
        this.error = null;

        await this.$store.dispatch('accounting/fetchAccountingSummary');
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
      const pageRoutes = {
        bills: '/accounting/bills',
        payments: '/accounting/payments',
        deposits: '/accounting/deposits',
        'patient-financial-lookup': '/accounting/patient-financial-lookup',
        'cash-registers': '/accounting/cash-registers',
        'pos-terminals': '/accounting/pos-terminals',
        'financial-reports': '/accounting/reports',

        // Billing configuration routes
        services: '/accounting/services',
        tests: '/accounting/tests',
        'inventory-items': '/accounting/inventory-items',
        'admitted-patients': '/accounting/admitted-patients',
      };

      if (pageRoutes[page]) {
        this.$router.push(pageRoutes[page]);
      }
    },

    navigateTo(route) {
      if (route === 'dashboard') {
        this.$router.push('/dashboard');
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

.finance-officer-dashboard {
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

/* Header */
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

/* Metrics Section */
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
  height: 100%;
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
  font-size: 1.75rem;
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

/* Activity Section */
.activity-section {
  margin-bottom: 2rem;
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

/* Section Headers */
.section-header {
  margin-bottom: 2rem;
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  border-left: 4px solid #28a745;
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

/* Daily Operations Grid */
.daily-operations-section {
  margin-bottom: 2rem;
}

/* Billing Configuration Section */
.billing-configuration-section {
  margin-bottom: 2rem;
}

.operations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 992px) {
  .operations-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.operation-card {
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
}

.operation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #28a745;
}

.operation-icon {
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

.operation-card:hover .operation-icon {
  transform: scale(1.1);
}

.operation-content {
  flex: 1;
  min-width: 0;
}

.operation-content h5 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.operation-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.operation-arrow {
  color: #6c757d;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.operation-card:hover .operation-arrow {
  color: #28a745;
  transform: translateX(4px);
}

/* Reports Section */
.reports-section {
  margin-bottom: 2rem;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.report-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid transparent;
}

.report-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.report-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
}

.report-content {
  flex: 1;
}

.report-content h5 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.report-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
}

/* Color Utilities */
.bg-purple {
  background-color: #6f42c1 !important;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .finance-officer-dashboard {
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

  .operations-grid {
    grid-template-columns: 1fr;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .operation-card,
  .report-card {
    padding: 1rem;
  }

  .operation-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
}
</style>
