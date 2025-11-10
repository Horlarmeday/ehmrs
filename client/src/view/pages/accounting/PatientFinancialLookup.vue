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
        <div
          v-if="showAutocomplete && searchResults.length === 0 && searchQuery.length >= 2"
          class="no-results"
        >
          <small class="text-muted">No patients found</small>
        </div>
      </div>
    </b-card>

    <!-- Selected Patient Section -->
    <div v-if="selectedPatient">
      <!-- Action Buttons Bar -->
      <div class="action-buttons-bar mb-3">
        <b-button variant="primary" @click="openStatementModal" class="btn-generate-statement">
          <i class="fas fa-file-invoice mr-2"></i>
          Generate Financial Statement
        </b-button>
      </div>

      <!-- Patient Info Card -->
      <b-card class="patient-info-card mb-4">
        <div class="patient-header">
          <div class="patient-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="patient-details">
            <h4 class="patient-name">
              {{ selectedPatient.firstname }} {{ selectedPatient.lastname }}
            </h4>
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
                <p class="stat-amount">
                  ₦{{ formatCurrency(financialSummary.summary.totalBillsAmount) }}
                </p>
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
                <p class="stat-amount">
                  ₦{{ formatCurrency(financialSummary.summary.totalPaymentsAmount) }}
                </p>
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
                <p class="stat-amount">
                  ₦{{ formatCurrency(financialSummary.summary.totalDepositsAmount) }}
                </p>
              </div>
            </div>
          </b-col>

          <b-col md="3" sm="6" class="mb-3">
            <div
              class="stat-card balance-card"
              :class="{ 'negative-balance': financialSummary.summary.outstandingBalance > 0 }"
            >
              <div class="stat-icon">
                <i class="fas fa-balance-scale"></i>
              </div>
              <div class="stat-content">
                <h6 class="stat-label">Outstanding Balance</h6>
                <h3 class="stat-value">
                  {{ financialSummary.summary.outstandingBalance > 0 ? 'Owes' : 'Paid' }}
                </h3>
                <p class="stat-amount">
                  ₦{{ formatCurrency(Math.abs(financialSummary.summary.outstandingBalance)) }}
                </p>
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
            <div class="tab-header mb-3 d-flex justify-content-between align-items-start flex-wrap">
              <div>
                <h5>Clinical Bills ({{ filteredBills.length }})</h5>
                <small v-if="dateFilters.bills.active" class="text-muted">
                  Filtered: {{ formatDate(dateFilters.bills.start) }} -
                  {{ formatDate(dateFilters.bills.end) }}
                  <b-button size="sm" variant="link" @click="clearBillsDateFilter" class="p-0 ml-2">
                    <i class="fas fa-times"></i> Clear
                  </b-button>
                </small>
              </div>
              <div class="d-flex gap-2">
                <b-dropdown
                  text="Export"
                  variant="outline-success"
                  size="sm"
                  :disabled="exporting || filteredBills.length === 0"
                  class="mr-2"
                >
                  <b-dropdown-item @click="exportBills('xlsx')">
                    <i class="fas fa-file-excel mr-2"></i>Excel (.xlsx)
                  </b-dropdown-item>
                  <b-dropdown-item @click="exportBills('csv')">
                    <i class="fas fa-file-csv mr-2"></i>CSV (.csv)
                  </b-dropdown-item>
                </b-dropdown>
              </div>
            </div>

            <DateFilter label="Bills" @filterbydate="handleBillsDateFilter" class="mb-3" />

            <div v-if="filteredBills.length > 0" class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th style="width: 50px"></th>
                    <th>Bill ID</th>
                    <th>Date</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <!-- eslint-disable -->
                <tbody>
                  <template v-for="bill in filteredBills">
                    <tr
                      :key="`bill-row-${bill.id}`"
                      class="expandable-row"
                      @click="toggleBillExpansion(bill.id)"
                    >
                      <td class="expansion-cell">
                        <i
                          class="fas expansion-icon"
                          :class="isBillExpanded(bill.id) ? 'fa-chevron-down' : 'fa-chevron-right'"
                        ></i>
                      </td>
                      <td>
                        <strong>{{ bill.bill_number }}</strong>
                      </td>
                      <td>{{ formatDate(bill.createdAt) }}</td>
                      <td>{{ bill.notes || 'Clinical Service' }}</td>
                      <td>
                        <strong>₦{{ formatCurrency(bill.final_amount) }}</strong>
                      </td>
                      <td>
                        <span class="badge" :class="getBillStatusClass(bill.payment_status)">
                          {{ bill.payment_status }}
                        </span>
                      </td>
                      <td @click.stop>
                        <b-button
                          size="sm"
                          variant="outline-primary"
                          @click="viewBillDetails(bill)"
                        >
                          <i class="fas fa-eye"></i> View
                        </b-button>
                      </td>
                    </tr>
                    <tr
                      v-if="isBillExpanded(bill.id)"
                      :key="`bill-expanded-${bill.id}`"
                      class="expanded-row"
                    >
                      <td colspan="7" class="expanded-content">
                        <div class="bill-items-container">
                          <h6 class="bill-items-title">
                            <i class="fas fa-list mr-2"></i>Bill Items
                          </h6>
                          <div
                            v-if="bill.billItems && bill.billItems.length > 0"
                            class="bill-items-table-wrapper"
                          >
                            <table class="bill-items-table">
                              <thead>
                                <tr>
                                  <th>Item Name</th>
                                  <th>Type</th>
                                  <th>Status</th>
                                  <th>Quantity</th>
                                  <th>Unit Price</th>
                                  <th>Total Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="item in bill.billItems" :key="item.id">
                                  <td>{{ item.item_name }}</td>
                                  <td>
                                    <b-badge :variant="getBillItemTypeVariant(item.item_type)">{{
                                      item.item_type
                                    }}</b-badge>
                                  </td>
                                  <td>
                                    <div class="status-badges">
                                      <b-badge
                                        v-if="item.prescription_status"
                                        :variant="getPrescriptionStatusVariant(item.prescription_status)"
                                        class="mr-1"
                                      >
                                        {{ formatPrescriptionStatus(item.prescription_status) }}
                                      </b-badge>
                                      <b-badge
                                        v-if="item.result_status"
                                        :variant="getPrescriptionStatusVariant(item.result_status)"
                                        class="result-status-badge"
                                      >
                                        Test Result: {{ formatPrescriptionStatus(item.result_status) }}
                                      </b-badge>
                                      <span v-if="!item.prescription_status && !item.result_status" class="text-muted">
                                        N/A
                                      </span>
                                    </div>
                                  </td>
                                  <td>{{ item.quantity }}</td>
                                  <td>₦{{ formatCurrency(item.unit_price) }}</td>
                                  <td>
                                    <strong>₦{{ formatCurrency(item.total_price) }}</strong>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div v-else class="no-items-message">
                            <i class="fas fa-inbox text-muted mr-2"></i>
                            <span class="text-muted">No items found for this bill</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
                <!-- eslint-enable -->
              </table>
            </div>
            <div v-else class="text-center py-5">
              <i class="fas fa-file-invoice fa-3x text-muted mb-3"></i>
              <p class="text-muted">
                No bills found{{
                  dateFilters.bills.active ? ' for selected date range' : ' for this patient'
                }}
              </p>
            </div>
          </b-tab>

          <!-- Payments Tab -->
          <b-tab title="Payments">
            <div class="tab-header mb-3 d-flex justify-content-between align-items-start flex-wrap">
              <div>
                <h5>Payment History ({{ filteredPayments.length }})</h5>
                <small v-if="dateFilters.payments.active" class="text-muted">
                  Filtered: {{ formatDate(dateFilters.payments.start) }} -
                  {{ formatDate(dateFilters.payments.end) }}
                  <b-button
                    size="sm"
                    variant="link"
                    @click="clearPaymentsDateFilter"
                    class="p-0 ml-2"
                  >
                    <i class="fas fa-times"></i> Clear
                  </b-button>
                </small>
              </div>
              <div class="d-flex gap-2">
                <b-dropdown
                  text="Export"
                  variant="outline-success"
                  size="sm"
                  :disabled="exporting || filteredPayments.length === 0"
                  class="mr-2"
                >
                  <b-dropdown-item @click="exportPayments('xlsx')">
                    <i class="fas fa-file-excel mr-2"></i>Excel (.xlsx)
                  </b-dropdown-item>
                  <b-dropdown-item @click="exportPayments('csv')">
                    <i class="fas fa-file-csv mr-2"></i>CSV (.csv)
                  </b-dropdown-item>
                </b-dropdown>
              </div>
            </div>

            <DateFilter label="Payments" @filterbydate="handlePaymentsDateFilter" class="mb-3" />

            <div v-if="filteredPayments.length > 0" class="table-responsive">
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
                  <tr v-for="payment in filteredPayments" :key="payment.id">
                    <td>
                      <strong>{{ payment.payment_reference }}</strong>
                    </td>
                    <td>{{ formatDate(payment.processed_at) }}</td>
                    <td>{{ payment?.bill?.bill_number || 'N/A' }}</td>
                    <td>
                      <strong>₦{{ formatCurrency(payment.amount) }}</strong>
                    </td>
                    <td>{{ payment.payment_method }}</td>
                    <td>
                      <span class="badge badge-success">{{ payment.status || 'COMPLETED' }}</span>
                    </td>
                    <td>
                      <b-button
                        size="sm"
                        variant="outline-primary"
                        @click="viewPaymentDetails(payment)"
                      >
                        <i class="fas fa-eye"></i> View
                      </b-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-5">
              <i class="fas fa-money-bill-wave fa-3x text-muted mb-3"></i>
              <p class="text-muted">
                No payments found{{
                  dateFilters.payments.active ? ' for selected date range' : ' for this patient'
                }}
              </p>
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
                    <td>
                      <strong>#{{ deposit.id }}</strong>
                    </td>
                    <td>{{ formatDate(deposit.createdAt) }}</td>
                    <td>
                      <strong>₦{{ formatCurrency(deposit.amount) }}</strong>
                    </td>
                    <td>₦{{ formatCurrency(deposit.amount - deposit.current_balance) }}</td>
                    <td>₦{{ formatCurrency(deposit.current_balance) }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="deposit.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'"
                      >
                        {{ deposit.status }}
                      </span>
                    </td>
                    <td>
                      <b-button
                        size="sm"
                        variant="outline-primary"
                        @click="viewDepositDetails(deposit)"
                      >
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

    <!-- Financial Statement Generation Modal -->
    <b-modal
      id="statement-modal"
      v-model="showStatementModal"
      title="Generate Financial Statement"
      size="lg"
      hide-footer
    >
      <div class="statement-options">
        <!-- Date Range -->
        <div class="form-section mb-4">
          <h6 class="section-title">Statement Period</h6>
          <b-row>
            <b-col md="6">
              <b-form-group label="Start Date" label-for="start-date">
                <b-form-input
                  id="start-date"
                  v-model="statementOptions.startDate"
                  type="date"
                  :max="statementOptions.endDate || today"
                ></b-form-input>
              </b-form-group>
            </b-col>
            <b-col md="6">
              <b-form-group label="End Date" label-for="end-date">
                <b-form-input
                  id="end-date"
                  v-model="statementOptions.endDate"
                  type="date"
                  :min="statementOptions.startDate"
                  :max="today"
                ></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
          <small class="text-muted">
            <i class="fas fa-info-circle mr-1"></i>
            Default: Last 3 months (if dates not selected)
          </small>
        </div>

        <!-- Export Format -->
        <div class="form-section mb-4">
          <h6 class="section-title">Export Format</h6>
          <b-form-group>
            <b-form-radio-group
              v-model="statementOptions.format"
              :options="formatOptions"
              button-variant="outline-primary"
              buttons
              size="lg"
              class="format-buttons"
            ></b-form-radio-group>
          </b-form-group>
        </div>

        <!-- Options -->
        <div class="form-section mb-4">
          <h6 class="section-title">Statement Options</h6>
          <b-form-checkbox v-model="statementOptions.includeDetails" class="mb-2">
            <strong>Include Detailed Bill Items</strong>
            <br />
            <small class="text-muted">Show individual items for each bill with quantities and prices</small>
          </b-form-checkbox>
          <b-form-checkbox v-model="statementOptions.includeDeposits">
            <strong>Include Patient Deposits</strong>
            <br />
            <small class="text-muted">Show deposit transactions and history</small>
          </b-form-checkbox>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <b-button variant="secondary" @click="closeStatementModal" :disabled="generatingStatement">
            Cancel
          </b-button>
          <b-button
            variant="primary"
            @click="generateStatement"
            :disabled="generatingStatement || !canGenerateStatement"
          >
            <span v-if="generatingStatement">
              <b-spinner small></b-spinner>
              Generating...
            </span>
            <span v-else>
              <i class="fas fa-download mr-2"></i>
              Generate Statement
            </span>
          </b-button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import DateFilter from '@/utils/DateFilter.vue';
import exportService from '@/core/services/export.service';

export default {
  name: 'PatientFinancialLookup',

  components: {
    DateFilter,
  },

  data() {
    return {
      searchQuery: '',
      searchResults: [],
      selectedPatient: null,
      showAutocomplete: false,
      loading: false,
      searchTimeout: null,
      activeTab: 0,
      expandedBills: new Set(), // Track expanded bill IDs
      dateFilters: {
        bills: {
          start: null,
          end: null,
          active: false,
        },
        payments: {
          start: null,
          end: null,
          active: false,
        },
      },
      exporting: false,

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

      // Statement generation
      showStatementModal: false,
      generatingStatement: false,
      statementOptions: {
        startDate: null,
        endDate: null,
        format: 'pdf',
        includeDeposits: false,
        includeDetails: true,
      },
      formatOptions: [
        { text: 'PDF', value: 'pdf' },
        { text: 'Excel', value: 'xlsx' },
        { text: 'CSV', value: 'csv' },
      ],
    };
  },

  computed: {
    today() {
      return new Date().toISOString().split('T')[0];
    },

    canGenerateStatement() {
      return this.selectedPatient && this.statementOptions.format;
    },

    allTransactions() {
      const transactions = [];

      // Add bills
      this.financialSummary.bills.forEach((bill) => {
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
      this.financialSummary.payments.forEach((payment) => {
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
      this.financialSummary.history.forEach((history) => {
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

    filteredBills() {
      if (!this.dateFilters.bills.active) {
        return this.financialSummary.bills;
      }

      const start = new Date(this.dateFilters.bills.start);
      const end = new Date(this.dateFilters.bills.end);
      end.setHours(23, 59, 59, 999); // Include full end date

      return this.financialSummary.bills.filter((bill) => {
        const billDate = new Date(bill.createdAt);
        return billDate >= start && billDate <= end;
      });
    },

    filteredPayments() {
      if (!this.dateFilters.payments.active) {
        return this.financialSummary.payments;
      }

      const start = new Date(this.dateFilters.payments.start);
      const end = new Date(this.dateFilters.payments.end);
      end.setHours(23, 59, 59, 999);

      return this.financialSummary.payments.filter((payment) => {
        const paymentDate = new Date(payment.processed_at || payment.createdAt);
        return paymentDate >= start && paymentDate <= end;
      });
    },
  },

  methods: {
    ...mapActions({
      fetchPatients: 'patient/fetchPatients',
      getPatientFinancialSummary: 'accounting/getPatientFinancialSummary',
      generatePatientFinancialStatement: 'accounting/generatePatientFinancialStatement',
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

    async loadPatientById(patientId) {
      try {
        this.loading = true;

        const response = await this.$store.dispatch('patient/fetchPatient', patientId);

        if (response.data.data) {
          const patient = response.data.data;
          await this.selectPatient(patient);
        } else {
          throw new Error('Patient not found');
        }
      } catch (error) {
        this.$bvToast.toast('Failed to load patient information', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loading = false;
      }
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

    getBillItemTypeVariant(type) {
      const variants = {
        DRUG: 'primary',
        TEST: 'info',
        INVESTIGATION: 'warning',
        SERVICE: 'success',
        ADDITIONAL_ITEM: 'secondary',
      };
      return variants[type] || 'secondary';
    },

    getPrescriptionStatusVariant(status) {
      if (!status) return 'secondary';

      const statusUpper = status.toString().toUpperCase();

      // Completed/Success statuses
      if (
        statusUpper.includes('DISPENSED') ||
        statusUpper.includes('COMPLETED') ||
        statusUpper.includes('APPROVED') ||
        statusUpper.includes('VERIFIED') ||
        statusUpper.includes('ACCEPTED') ||
        statusUpper.includes('PAID') ||
        statusUpper.includes('CLEARED')
      ) {
        return 'success';
      }

      // Warning/In-progress statuses
      if (
        statusUpper.includes('PARTIAL') ||
        statusUpper.includes('RESULT_ADDED') ||
        statusUpper.includes('SAMPLE_COLLECTED')
      ) {
        return 'warning';
      }

      // Danger/Problem statuses
      if (
        statusUpper.includes('RETURNED') ||
        statusUpper.includes('REJECTED') ||
        statusUpper.includes('DECLINED') ||
        statusUpper.includes('CANCELLED')
      ) {
        return 'danger';
      }

      // Pending/Default statuses
      return 'info';
    },

    formatPrescriptionStatus(status) {
      if (!status) return 'N/A';

      // Convert status to readable format
      return status
        .toString()
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
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

    toggleBillExpansion(billId) {
      if (this.expandedBills.has(billId)) {
        this.expandedBills.delete(billId);
      } else {
        this.expandedBills.add(billId);
      }
      // Force reactivity update
      this.expandedBills = new Set(this.expandedBills);
    },

    isBillExpanded(billId) {
      return this.expandedBills.has(billId);
    },

    handleBillsDateFilter(start, end) {
      this.dateFilters.bills = {
        start,
        end,
        active: true,
      };
    },

    handlePaymentsDateFilter(start, end) {
      this.dateFilters.payments = {
        start,
        end,
        active: true,
      };
    },

    clearBillsDateFilter() {
      this.dateFilters.bills = {
        start: null,
        end: null,
        active: false,
      };
    },

    clearPaymentsDateFilter() {
      this.dateFilters.payments = {
        start: null,
        end: null,
        active: false,
      };
    },

    async exportBills(format) {
      try {
        this.exporting = true;

        // Prepare bills data with items as separate rows
        const exportData = [];

        this.filteredBills.forEach((bill) => {
          if (bill.billItems && bill.billItems.length > 0) {
            // Add each bill item as a separate row
            bill.billItems.forEach((item) => {
              exportData.push({
                'Bill Number': bill.bill_number,
                'Bill Date': this.formatDate(bill.createdAt),
                'Patient Name': `${this.selectedPatient.firstname} ${this.selectedPatient.lastname}`,
                'Hospital ID': this.selectedPatient.hospital_id,
                'Item Name': item.item_name,
                Quantity: item.quantity,
                'Unit Price': item.unit_price,
                'Item Total': item.total_price,
                'Bill Total': bill.final_amount,
                'Payment Status': bill.payment_status,
                Notes: bill.notes || '',
              });
            });
          } else {
            // Bill without items
            exportData.push({
              'Bill Number': bill.bill_number,
              'Bill Date': this.formatDate(bill.createdAt),
              'Patient Name': `${this.selectedPatient.firstname} ${this.selectedPatient.lastname}`,
              'Hospital ID': this.selectedPatient.hospital_id,
              'Item Name': 'N/A',
              Quantity: 0,
              'Unit Price': 0,
              'Item Total': 0,
              'Bill Total': bill.final_amount,
              'Payment Status': bill.payment_status,
              Notes: bill.notes || '',
            });
          }
        });

        if (exportData.length === 0) {
          this.$bvToast.toast('No bills data to export', {
            title: 'Export Failed',
            variant: 'warning',
            solid: true,
          });
          return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `bills_${this.selectedPatient.hospital_id}_${timestamp}.${format}`;

        if (format === 'csv') {
          exportService.exportToCSV(exportData, filename);
        } else {
          exportService.exportToExcel(exportData, filename);
        }

        this.$bvToast.toast(`Bills exported successfully as ${format.toUpperCase()}`, {
          title: 'Export Successful',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Export failed:', error);
        this.$bvToast.toast('Failed to export bills data', {
          title: 'Export Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.exporting = false;
      }
    },

    async exportPayments(format) {
      try {
        this.exporting = true;

        const exportData = this.filteredPayments.map((payment) => ({
          'Receipt Number': payment.payment_reference,
          'Payment Date': this.formatDate(payment.processed_at),
          'Patient Name': `${this.selectedPatient.firstname} ${this.selectedPatient.lastname}`,
          'Hospital ID': this.selectedPatient.hospital_id,
          'Bill Number': payment.bill?.bill_number || 'N/A',
          Amount: payment.amount,
          'Payment Method': payment.payment_method,
          Status: payment.status || 'COMPLETED',
          'Processed By': payment.processed_by || '',
        }));

        if (exportData.length === 0) {
          this.$bvToast.toast('No payments data to export', {
            title: 'Export Failed',
            variant: 'warning',
            solid: true,
          });
          return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `payments_${this.selectedPatient.hospital_id}_${timestamp}.${format}`;

        if (format === 'csv') {
          exportService.exportToCSV(exportData, filename);
        } else {
          exportService.exportToExcel(exportData, filename);
        }

        this.$bvToast.toast(`Payments exported successfully as ${format.toUpperCase()}`, {
          title: 'Export Successful',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Export failed:', error);
        this.$bvToast.toast('Failed to export payments data', {
          title: 'Export Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.exporting = false;
      }
    },

    // Financial Statement Methods
    openStatementModal() {
      // Set default dates (last 3 months)
      const today = new Date();
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);

      this.statementOptions = {
        startDate: threeMonthsAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        format: 'pdf',
        includeDeposits: false,
        includeDetails: true,
      };

      this.showStatementModal = true;
    },

    closeStatementModal() {
      this.showStatementModal = false;
      this.generatingStatement = false;
    },

    async generateStatement() {
      if (!this.canGenerateStatement) {
        return;
      }

      this.generatingStatement = true;

      try {
        await this.generatePatientFinancialStatement({
          patientId: this.selectedPatient.id,
          startDate: this.statementOptions.startDate,
          endDate: this.statementOptions.endDate,
          format: this.statementOptions.format,
          includeDeposits: this.statementOptions.includeDeposits,
          includeDetails: this.statementOptions.includeDetails,
        });

        this.$bvToast.toast(
          `Financial statement generated successfully as ${this.statementOptions.format.toUpperCase()}`,
          {
            title: 'Success',
            variant: 'success',
            solid: true,
          }
        );

        this.closeStatementModal();
      } catch (error) {
        console.error('Statement generation failed:', error);
        this.$bvToast.toast(error.message || 'Failed to generate financial statement', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.generatingStatement = false;
      }
    },
  },

  watch: {
    '$route.query.patientId': {
      handler(newPatientId) {
        if (newPatientId && newPatientId !== this.selectedPatient?.id) {
          this.loadPatientById(newPatientId);
        }
      },
      immediate: false,
    },
  },

  mounted() {
    const patientId = this.$route.query.patientId;

    if (patientId) {
      this.loadPatientById(patientId);
    }

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

/* Expandable Bill Rows */
.expandable-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.expandable-row:hover {
  background-color: #f1f3f5 !important;
}

.expansion-cell {
  text-align: center;
  vertical-align: middle;
  padding: 12px 8px !important;
}

.expansion-icon {
  color: #6c757d;
  transition: transform 0.2s ease, color 0.2s ease;
  font-size: 0.9rem;
}

.expandable-row:hover .expansion-icon {
  color: #007bff;
}

.expanded-row {
  background-color: #f8f9fa;
}

.expanded-row:hover {
  background-color: #f8f9fa !important;
}

.expanded-content {
  padding: 0 !important;
}

.bill-items-container {
  padding: 20px 30px 20px 60px;
  background: linear-gradient(to right, #f8f9fa 0%, #ffffff 100%);
  border-left: 4px solid #007bff;
}

.bill-items-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.bill-items-table-wrapper {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.bill-items-table {
  width: 100%;
  margin: 0;
  border-collapse: collapse;
}

.bill-items-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bill-items-table thead th {
  color: rgb(58, 58, 58);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 12px 15px;
  border: none;
  letter-spacing: 0.5px;
}

.bill-items-table tbody tr {
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.15s ease;
}

.bill-items-table tbody tr:last-child {
  border-bottom: none;
}

.bill-items-table tbody tr:hover {
  background-color: #f8f9fa;
}

.bill-items-table tbody td {
  padding: 12px 15px;
  color: #495057;
  font-size: 0.9rem;
}

.bill-items-table tbody td:first-child {
  font-weight: 500;
  color: #2c3e50;
}

.bill-items-table tbody td:last-child {
  color: #007bff;
  font-weight: 600;
}

/* Status Badges Styling */
.status-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.status-badges .badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  font-weight: 600;
  white-space: nowrap;
}

.result-status-badge {
  margin-left: 4px;
}

.status-badges .text-muted {
  font-size: 0.85rem;
  font-style: italic;
}

.no-items-message {
  padding: 30px;
  text-align: center;
  background: white;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.no-items-message i {
  font-size: 2rem;
  margin-bottom: 8px;
  display: block;
}

/* Export and Filter Section */
.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tab-header.flex-wrap {
  gap: 0.75rem;
}

.gap-2 {
  gap: 0.5rem;
}

/* Date filter active indicator */
.tab-header small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.85rem;
}

.tab-header small .btn-link {
  font-size: 0.8rem;
  color: #dc3545;
  text-decoration: none;
}

.tab-header small .btn-link:hover {
  color: #c82333;
  text-decoration: underline;
}

/* Dropdown export button */
.dropdown-toggle::after {
  margin-left: 0.5rem;
}

/* Action Buttons Bar */
.action-buttons-bar {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-generate-statement {
  font-weight: 600;
  padding: 0.5rem 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.btn-generate-statement:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Statement Modal Styles */
.statement-options {
  padding: 1rem 0;
}

.form-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e0e0e0;
}

.format-buttons {
  display: flex;
  gap: 0.5rem;
}

.format-buttons .btn {
  flex: 1;
  font-weight: 600;
  padding: 1rem;
  transition: all 0.2s ease;
}

.format-buttons .btn:hover {
  transform: translateY(-2px);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  margin-top: 1rem;
}

.modal-actions .btn {
  min-width: 120px;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .patient-financial-lookup {
    padding: 10px;
  }

  .action-buttons-bar {
    justify-content: center;
  }

  .tab-header {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .tab-header .d-flex {
    margin-top: 0.5rem;
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

  .bill-items-container {
    padding: 15px 20px 15px 40px;
  }

  .bill-items-table thead th,
  .bill-items-table tbody td {
    padding: 8px 10px;
    font-size: 0.8rem;
  }

  .format-buttons {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions .btn {
    width: 100%;
  }
}
</style>
