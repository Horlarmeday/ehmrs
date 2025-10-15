<template>
  <div class="patient-financial-lookup">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <h2 class="page-title">Patient Financial Lookup</h2>
      <p class="text-muted">Search and view comprehensive financial records for any patient</p>
    </div>

    <!-- Search Section -->
    <b-card class="search-card mb-4">
      <div class="search-section">
        <label class="search-label">Search Patient</label>
        <b-form-input
          v-model="searchQuery"
          placeholder="Enter Hospital ID, Name, or Phone Number..."
          @input="handleSearchInput"
          class="search-input"
          :disabled="loading"
        ></b-form-input>

        <!-- Autocomplete Dropdown -->
        <div v-if="showAutocomplete && searchResults.length > 0" class="autocomplete-dropdown">
          <div
            v-for="patient in searchResults"
            :key="patient.id"
            class="autocomplete-item"
            @click="selectPatient(patient)"
          >
            <div class="patient-info">
              <strong>{{ patient.firstname }} {{ patient.lastname }}</strong>
              <span class="text-muted ml-2">{{ patient.hospital_id }}</span>
            </div>
            <div class="patient-meta">
              <small class="text-muted">{{ patient.phone || 'No phone' }}</small>
            </div>
          </div>
        </div>

        <!-- No Results Message -->
        <div v-if="showAutocomplete && searchResults.length === 0 && searchQuery.length >= 2" class="no-results">
          <small class="text-muted">No patients found</small>
        </div>
      </div>
    </b-card>

    <!-- Selected Patient Section -->
    <div v-if="selectedPatient">
      <!-- Patient Info Card -->
      <b-card class="patient-info-card mb-4">
        <div class="patient-header">
          <div class="patient-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="patient-details">
            <h4 class="patient-name">{{ selectedPatient.firstname }} {{ selectedPatient.lastname }}</h4>
            <div class="patient-meta-info">
              <span class="meta-item">
                <i class="fas fa-id-card"></i>
                {{ selectedPatient.hospital_id }}
              </span>
              <span class="meta-item" v-if="selectedPatient.phone">
                <i class="fas fa-phone"></i>
                {{ selectedPatient.phone }}
              </span>
              <span class="meta-item" v-if="selectedPatient.email">
                <i class="fas fa-envelope"></i>
                {{ selectedPatient.email }}
              </span>
            </div>
          </div>
        </div>
      </b-card>

      <!-- Financial Summary Cards -->
      <div class="summary-cards mb-4">
        <b-row>
          <b-col md="3" sm="6" class="mb-3">
            <div class="stat-card bills-card">
              <div class="stat-icon">
                <i class="fas fa-file-invoice"></i>
              </div>
              <div class="stat-content">
                <h6 class="stat-label">Total Bills</h6>
                <h3 class="stat-value">{{ financialSummary.summary.totalBills }}</h3>
                <p class="stat-amount">₦{{ formatCurrency(financialSummary.summary.totalBillsAmount) }}</p>
              </div>
            </div>
          </b-col>

          <b-col md="3" sm="6" class="mb-3">
            <div class="stat-card payments-card">
              <div class="stat-icon">
                <i class="fas fa-money-bill-wave"></i>
              </div>
              <div class="stat-content">
                <h6 class="stat-label">Total Payments</h6>
                <h3 class="stat-value">{{ financialSummary.summary.totalPayments }}</h3>
                <p class="stat-amount">₦{{ formatCurrency(financialSummary.summary.totalPaymentsAmount) }}</p>
              </div>
            </div>
          </b-col>

          <b-col md="3" sm="6" class="mb-3">
            <div class="stat-card deposits-card">
              <div class="stat-icon">
                <i class="fas fa-piggy-bank"></i>
              </div>
              <div class="stat-content">
                <h6 class="stat-label">Active Deposits</h6>
                <h3 class="stat-value">{{ financialSummary.summary.totalDeposits }}</h3>
                <p class="stat-amount">₦{{ formatCurrency(financialSummary.summary.totalDepositsAmount) }}</p>
              </div>
            </div>
          </b-col>

          <b-col md="3" sm="6" class="mb-3">
            <div class="stat-card balance-card" :class="{'negative-balance': financialSummary.summary.outstandingBalance > 0}">
              <div class="stat-icon">
                <i class="fas fa-balance-scale"></i>
              </div>
              <div class="stat-content">
                <h6 class="stat-label">Outstanding Balance</h6>
                <h3 class="stat-value">
                  {{ financialSummary.summary.outstandingBalance > 0 ? 'Owes' : 'Paid' }}
                </h3>
                <p class="stat-amount">₦{{ formatCurrency(Math.abs(financialSummary.summary.outstandingBalance)) }}</p>
              </div>
            </div>
          </b-col>
        </b-row>
      </div>

      <!-- Tabbed Data Display -->
      <b-card>
        <b-tabs content-class="mt-3" v-model="activeTab">
          <!-- Bills Tab -->
          <b-tab title="Bills" active>
            <div class="tab-header mb-3">
              <h5>Clinical Bills ({{ financialSummary.bills?.length }})</h5>
            </div>
            <div v-if="financialSummary.bills.length > 0" class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Date</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="bill in financialSummary.bills" :key="bill.id">
                    <td><strong>{{ bill.bill_number }}</strong></td>
                    <td>{{ formatDate(bill.createdAt) }}</td>
                    <td>{{ bill.notes || 'Clinical Service' }}</td>
                    <td><strong>₦{{ formatCurrency(bill.final_amount) }}</strong></td>
                    <td>
                      <span class="badge" :class="getBillStatusClass(bill.payment_status)">
                        {{ bill.payment_status }}
                      </span>
                    </td>
                    <td>
                      <b-button size="sm" variant="outline-primary" @click="viewBillDetails(bill)">
                        <i class="fas fa-eye"></i> View
                      </b-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-5">
              <i class="fas fa-file-invoice fa-3x text-muted mb-3"></i>
              <p class="text-muted">No bills found for this patient</p>
            </div>
          </b-tab>

          <!-- Payments Tab -->
          <b-tab title="Payments">
            <div class="tab-header mb-3">
              <h5>Payment History ({{ financialSummary.payments.length }})</h5>
            </div>
            <div v-if="financialSummary.payments.length > 0" class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Date</th>
                    <th>Bill Reference</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="payment in financialSummary.payments" :key="payment.id">
                    <td><strong>{{ payment.payment_reference }}</strong></td>
                    <td>{{ formatDate(payment.processed_at) }}</td>
                    <td>{{ payment?.bill?.bill_number || 'N/A' }}</td>
                    <td><strong>₦{{ formatCurrency(payment.amount) }}</strong></td>
                    <td>{{ payment.payment_method }}</td>
                    <td>
                      <span class="badge badge-success">{{ payment.status || 'COMPLETED' }}</span>
                    </td>
                    <td>
                      <b-button size="sm" variant="outline-primary" @click="viewPaymentDetails(payment)">
                        <i class="fas fa-eye"></i> View
                      </b-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-5">
              <i class="fas fa-money-bill-wave fa-3x text-muted mb-3"></i>
              <p class="text-muted">No payments found for this patient</p>
            </div>
          </b-tab>

          <!-- Deposits Tab -->
          <b-tab title="Deposits">
            <div class="tab-header mb-3">
              <h5>Patient Deposits ({{ financialSummary.deposits.length }})</h5>
            </div>
            <div v-if="financialSummary.deposits.length > 0" class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Deposit ID</th>
                    <th>Date Created</th>
                    <th>Amount</th>
                    <th>Used Amount</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="deposit in financialSummary.deposits" :key="deposit.id">
                    <td><strong>#{{ deposit.id }}</strong></td>
                    <td>{{ formatDate(deposit.createdAt) }}</td>
                    <td><strong>₦{{ formatCurrency(deposit.amount) }}</strong></td>
                    <td>₦{{ formatCurrency(deposit.used_amount || 0) }}</td>
                    <td>
                      <strong class="text-success">
                        ₦{{ formatCurrency((deposit.amount || 0) - (deposit.used_amount || 0)) }}
                      </strong>
                    </td>
                    <td>
                      <span class="badge" :class="deposit.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'">
                        {{ deposit.status }}
                      </span>
                    </td>
                    <td>
                      <b-button size="sm" variant="outline-primary" @click="viewDepositDetails(deposit)">
                        <i class="fas fa-eye"></i> View
                      </b-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-5">
              <i class="fas fa-piggy-bank fa-3x text-muted mb-3"></i>
              <p class="text-muted">No deposits found for this patient</p>
            </div>
          </b-tab>

          <!-- All Transactions Tab -->
          <b-tab title="All Transactions">
            <div class="tab-header mb-3">
              <h5>Complete Transaction History ({{ allTransactions.length }})</h5>
            </div>
            <div v-if="allTransactions.length > 0" class="timeline-container">
              <div
                v-for="transaction in allTransactions"
                :key="`${transaction.type}-${transaction.id}`"
                class="timeline-item"
              >
                <div class="timeline-marker" :class="getTransactionTypeClass(transaction.type)">
                  <i :class="getTransactionIcon(transaction.type)"></i>
                </div>
                <div class="timeline-content">
                  <div class="transaction-header">
                    <strong>{{ transaction.title }}</strong>
                    <span class="transaction-date">{{ formatDate(transaction.date) }}</span>
                  </div>
                  <div class="transaction-details">
                    <p class="mb-1">{{ transaction.description }}</p>
                    <h5 class="transaction-amount" :class="transaction.amountClass">
                      ₦{{ formatCurrency(transaction.amount) }}
                    </h5>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-5">
              <i class="fas fa-history fa-3x text-muted mb-3"></i>
              <p class="text-muted">No transaction history available</p>
            </div>
          </b-tab>
        </b-tabs>
      </b-card>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <p class="mt-3">Loading financial data...</p>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'PatientFinancialLookup',

  data() {
    return {
      searchQuery: '',
      searchResults: [],
      selectedPatient: null,
      showAutocomplete: false,
      loading: false,
      searchTimeout: null,
      activeTab: 0,

      financialSummary: {
        bills: [],
        payments: [],
        deposits: [],
        history: [],
        summary: {
          totalBills: 0,
          totalBillsAmount: 0,
          totalPayments: 0,
          totalPaymentsAmount: 0,
          totalDeposits: 0,
          totalDepositsAmount: 0,
          outstandingBalance: 0,
        },
      },
    };
  },

  computed: {
    allTransactions() {
      const transactions = [];

      // Add bills
      this.financialSummary.bills.forEach(bill => {
        transactions.push({
          id: bill.id,
          type: 'bill',
          date: bill.createdAt,
          title: `Bill ${bill.bill_number}`,
          description: bill.notes || 'Clinical Service',
          amount: bill.final_amount,
          amountClass: 'text-danger',
        });
      });

      // Add payments
      this.financialSummary.payments.forEach(payment => {
        transactions.push({
          id: payment.id,
          type: 'payment',
          date: payment.processed_at,
          title: `Payment ${payment.payment_reference}`,
          description: `${payment.payment_method} payment for Bill ${payment.bill_number || 'N/A'}`,
          amount: payment.amount,
          amountClass: 'text-success',
        });
      });

      // Add deposit history
      this.financialSummary.history.forEach(history => {
        transactions.push({
          id: history.id,
          type: 'deposit',
          date: history.createdAt,
          title: history.transaction_type === 'CREDIT' ? 'Deposit Added' : 'Deposit Used',
          description: history.description || `${history.transaction_type} transaction`,
          amount: history.amount,
          amountClass: history.transaction_type === 'CREDIT' ? 'text-success' : 'text-warning',
        });
      });

      // Sort by date (most recent first)
      return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
  },

  methods: {
    ...mapActions({
      fetchPatients: 'patient/fetchPatients',
      getPatientFinancialSummary: 'accounting/getPatientFinancialSummary',
    }),

    handleSearchInput() {
      clearTimeout(this.searchTimeout);

      if (this.searchQuery.length < 2) {
        this.showAutocomplete = false;
        this.searchResults = [];
        return;
      }

      this.searchTimeout = setTimeout(() => {
        this.performSearch();
      }, 300);
    },

    async performSearch() {
      try {
        const response = await this.fetchPatients({
          search: this.searchQuery,
          currentPage: 1,
          itemsPerPage: 50,
        });

        if (response.data.data) {
          this.searchResults = response.data?.data?.docs || [];
          this.showAutocomplete = true;
        }
      } catch (error) {
        console.error('Search failed:', error);
        this.$bvToast.toast('Failed to search patients', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    async selectPatient(patient) {
      this.selectedPatient = patient;
      this.searchQuery = `${patient.firstname} ${patient.lastname} (${patient.hospital_id})`;
      this.showAutocomplete = false;
      this.searchResults = [];

      await this.loadPatientFinancialData(patient.id);
    },

    async loadPatientFinancialData(patientId) {
      this.loading = true;

      try {
        const response = await this.getPatientFinancialSummary(patientId);

        if (response.success) {
          this.financialSummary = response.data;
        } else {
          throw new Error(response.error || 'Failed to load financial data');
        }
      } catch (error) {
        console.error('Failed to load financial data:', error);
        this.$bvToast.toast('Failed to load patient financial data', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loading = false;
      }
    },

    formatCurrency(value) {
      if (!value && value !== 0) return '0.00';
      return parseFloat(value).toFixed(2);
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },

    getBillStatusClass(status) {
      const statusMap = {
        PAID: 'badge-success',
        PARTIAL: 'badge-warning',
        UNPAID: 'badge-danger',
        PENDING: 'badge-secondary',
      };
      return statusMap[status] || 'badge-secondary';
    },

    getTransactionTypeClass(type) {
      const typeMap = {
        bill: 'marker-bill',
        payment: 'marker-payment',
        deposit: 'marker-deposit',
        withdrawal: 'marker-withdrawal',
      };
      return typeMap[type] || '';
    },

    getTransactionIcon(type) {
      const iconMap = {
        bill: 'fas fa-file-invoice',
        payment: 'fas fa-money-bill-wave',
        deposit: 'fas fa-plus-circle',
        withdrawal: 'fas fa-minus-circle',
      };
      return iconMap[type] || 'fas fa-circle';
    },

    viewBillDetails(bill) {
      this.$router.push(`/accounting/bills/${bill.id}/items`);
    },

    viewPaymentDetails(payment) {
      this.$router.push(`/accounting/payments/${payment.id}`);
    },

    viewDepositDetails(deposit) {
      this.$router.push(`/accounting/deposits/${deposit.id}`);
    },
  },

  mounted() {
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.showAutocomplete = false;
      }
    });
  },
};
</script>

<style scoped>
.patient-financial-lookup {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

/* Search Section */
.search-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-section {
  position: relative;
}

.search-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #495057;
}

.search-input {
  font-size: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Autocomplete Dropdown */
.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 5px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.autocomplete-item {
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.autocomplete-item:hover {
  background-color: #f8f9fa;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.patient-info strong {
  color: #2c3e50;
}

.patient-meta {
  margin-top: 4px;
}

.no-results {
  padding: 15px;
  text-align: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 5px;
}

/* Patient Info Card */
.patient-info-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.patient-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.patient-avatar {
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.9);
}

.patient-details {
  flex: 1;
}

.patient-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.patient-meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.meta-item i {
  opacity: 0.8;
}

/* Summary Cards */
.summary-cards {
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.bills-card .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.payments-card .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.deposits-card .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.balance-card .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.balance-card.negative-balance .stat-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  font-weight: 600;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-amount {
  font-size: 1rem;
  color: #495057;
  font-weight: 600;
  margin: 0;
}

/* Tabs */
.tab-header h5 {
  font-weight: 600;
  color: #2c3e50;
}

/* Table Styling */
.table {
  margin-bottom: 0;
}

.table thead th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.table tbody tr {
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

/* Timeline for All Transactions */
.timeline-container {
  padding: 20px 0;
}

.timeline-item {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 19px;
  top: 45px;
  bottom: -30px;
  width: 2px;
  background: #e0e0e0;
}

.timeline-marker {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  z-index: 1;
  background: white;
}

.marker-bill {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.marker-payment {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.marker-deposit {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.marker-withdrawal {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.timeline-content {
  flex: 1;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.transaction-header strong {
  font-size: 1.1rem;
  color: #2c3e50;
}

.transaction-date {
  font-size: 0.85rem;
  color: #6c757d;
}

.transaction-details p {
  color: #495057;
  margin-bottom: 10px;
}

.transaction-amount {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .patient-financial-lookup {
    padding: 10px;
  }

  .patient-header {
    flex-direction: column;
    text-align: center;
  }

  .patient-meta-info {
    justify-content: center;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .table-responsive {
    font-size: 0.85rem;
  }
}
</style>
