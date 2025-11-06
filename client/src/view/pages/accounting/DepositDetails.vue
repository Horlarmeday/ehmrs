<template>
  <div class="deposit-details">
    <!-- Header Section -->
    <div class="page-header">
      <div class="d-flex align-items-center">
        <b-button variant="outline-secondary" @click="$router.go(-1)" class="mr-3">
          <i class="fas fa-arrow-left mr-2"></i>Back
        </b-button>
        <h1 class="page-title mb-0">
          <i class="fas fa-piggy-bank text-warning mr-3"></i>
          Deposit Details
        </h1>
      </div>
      <div class="header-actions">
        <b-button
          variant="outline-warning"
          @click="editDeposit"
          v-if="deposit?.status === 'ACTIVE'"
        >
          <i class="fas fa-edit mr-2"></i>Edit
        </b-button>
        <b-button variant="outline-success" @click="useDeposit" v-if="deposit?.status === 'ACTIVE'">
          <i class="fas fa-credit-card mr-2"></i>Use Deposit
        </b-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <b-spinner variant="primary" label="Loading..."></b-spinner>
      <p class="mt-3">Loading deposit details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      {{ error }}
      <b-button variant="outline-danger" size="sm" class="ml-3" @click="loadDeposit">
        <i class="fas fa-redo mr-1"></i>Retry
      </b-button>
    </div>

    <!-- Deposit Details -->
    <div v-else-if="deposit" class="deposit-content">
      <!-- Summary Cards -->
      <div class="summary-section mb-4">
        <div class="row">
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="summary-card bg-primary text-white">
              <div class="summary-icon">
                <i class="fas fa-piggy-bank"></i>
              </div>
              <div class="summary-content">
                <h4 class="summary-value">{{ formatCurrency(deposit.amount) }}</h4>
                <p class="summary-label">Total Amount</p>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <div class="summary-card bg-success text-white">
              <div class="summary-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="summary-content">
                <h4 class="summary-value">
                  {{ formatCurrency(deposit.current_balance) }}
                </h4>
                <p class="summary-label">Available Balance</p>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <div class="summary-card bg-info text-white">
              <div class="summary-icon">
                <i class="fas fa-credit-card"></i>
              </div>
              <div class="summary-content">
                <h4 class="summary-value">{{ formatCurrency(usedAmount || 0) }}</h4>
                <p class="summary-label">Used Amount</p>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <div class="summary-card" :class="getStatusCardClass(deposit.status)">
              <div class="summary-icon">
                <i class="fas fa-info-circle"></i>
              </div>
              <div class="summary-content">
                <h4 class="summary-value">{{ deposit.status }}</h4>
                <p class="summary-label">Status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="card">
        <div class="card-header">
          <b-nav tabs card-header>
            <b-nav-item :active="activeTab === 'overview'" @click="activeTab = 'overview'">
              <i class="fas fa-info-circle mr-2"></i>Overview
            </b-nav-item>
            <b-nav-item :active="activeTab === 'transactions'" @click="activeTab = 'transactions'">
              <i class="fas fa-exchange-alt mr-2"></i>Transaction History
              <b-badge v-if="transactions.length > 0" variant="secondary" class="ml-2">
                {{ transactions.length }}
              </b-badge>
            </b-nav-item>
            <b-nav-item :active="activeTab === 'journal'" @click="activeTab = 'journal'">
              <i class="fas fa-book mr-2"></i>Journal Entries
              <b-badge v-if="journalEntries.length > 0" variant="secondary" class="ml-2">
                {{ journalEntries.length }}
              </b-badge>
            </b-nav-item>
            <b-nav-item :active="activeTab === 'audit'" @click="activeTab = 'audit'">
              <i class="fas fa-history mr-2"></i>Audit Trail
            </b-nav-item>
          </b-nav>
        </div>

        <div class="card-body">
          <!-- Overview Tab -->
          <div v-show="activeTab === 'overview'">
            <div class="row">
              <div class="col-lg-8">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">
                      <i class="fas fa-info-circle mr-2"></i>
                      Deposit Information
                    </h5>
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="detail-item">
                          <label class="detail-label">Reference Number:</label>
                          <span class="detail-value">{{ deposit.reference_number }}</span>
                        </div>
                        <div class="detail-item">
                          <label class="detail-label">Patient:</label>
                          <span class="detail-value">
                            {{ deposit.patient?.firstname }} {{ deposit.patient?.lastname }}
                            <small class="text-muted d-block">
                              {{ deposit.patient?.hospital_id }}
                            </small>
                          </span>
                        </div>
                        <div class="detail-item">
                          <label class="detail-label">Payment Method:</label>
                          <span class="detail-value">
                            <b-badge :variant="getDepositTypeVariant(deposit.deposit_type)">
                              {{ deposit.deposit_type }}
                            </b-badge>
                          </span>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="detail-item">
                          <label class="detail-label">Current Balance:</label>
                          <span class="detail-value text-success font-weight-bold">
                            {{ formatCurrency(deposit.current_balance) }}
                          </span>
                        </div>
                        <div class="detail-item">
                          <label class="detail-label">Created Date:</label>
                          <span class="detail-value">{{ formatDate(deposit.createdAt) }}</span>
                        </div>
                        <div class="detail-item">
                          <label class="detail-label">Status:</label>
                          <span class="detail-value">
                            <b-badge :variant="getDepositStatusVariant(deposit.status)">
                              {{ deposit.status }}
                            </b-badge>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="row mt-3">
                      <div class="col-12">
                        <div class="detail-item">
                          <label class="detail-label">Description:</label>
                          <span class="detail-value">{{
                            deposit.description || 'No description provided'
                          }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Payment Method Specific Details -->
                    <div v-if="deposit.bank_account_id" class="row mt-3">
                      <div class="col-12">
                        <div class="detail-item">
                          <label class="detail-label">Bank Account:</label>
                          <span class="detail-value"
                            >{{ deposit.bank_account?.account_name }} ({{
                              deposit.bank_account?.account_number
                            }})</span
                          >
                        </div>
                      </div>
                    </div>

                    <div v-if="deposit.pos_terminal_id" class="row mt-3">
                      <div class="col-12">
                        <div class="detail-item">
                          <label class="detail-label">POS Terminal:</label>
                          <span class="detail-value"
                            >{{ deposit.pos_terminal?.terminal_id }} ({{
                              deposit.pos_terminal?.terminal_type
                            }})</span
                          >
                        </div>
                      </div>
                    </div>

                    <div v-if="deposit.payment_reference" class="row mt-3">
                      <div class="col-12">
                        <div class="detail-item">
                          <label class="detail-label">Payment Reference:</label>
                          <span class="detail-value">{{ deposit.payment_reference }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-4">
                <!-- Recent Activity -->
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">
                      <i class="fas fa-clock mr-2"></i>
                      Recent Activity
                    </h6>
                  </div>
                  <div class="card-body">
                    <div v-if="recentActivity.length > 0">
                      <div
                        v-for="activity in recentActivity.slice(0, 5)"
                        :key="activity.id"
                        class="activity-item"
                      >
                        <div class="activity-icon">
                          <i :class="getActivityIcon(activity.type)"></i>
                        </div>
                        <div class="activity-content">
                          <div class="activity-text">{{ activity.description }}</div>
                          <small class="activity-time">{{ formatDate(activity.created_at) }}</small>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-center text-muted">
                      <i class="fas fa-info-circle fa-2x mb-2"></i>
                      <p class="mb-0">No recent activity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Transaction History Tab -->
          <div v-show="activeTab === 'transactions'">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-exchange-alt mr-2"></i>
                  Transaction History
                </h5>
              </div>
              <div class="card-body">
                <div v-if="transactions.length > 0">
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead class="thead-light">
                        <tr>
                          <th>Transaction Type</th>
                          <th>Amount</th>
                          <th>Previous Balance</th>
                          <th>New Balance</th>
                          <th>Description</th>
                          <th>Bill Reference</th>
                          <th>Created Date</th>
                          <th>Created By</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="transaction in transactions" :key="transaction.id">
                          <td>
                            <b-badge
                              :variant="
                                getTransactionTypeBadgeVariant(transaction.transaction_type)
                              "
                            >
                              {{ formatTransactionType(transaction.transaction_type) }}
                            </b-badge>
                          </td>
                          <td
                            class="font-weight-bold"
                            :class="getAmountClass(transaction.transaction_type)"
                          >
                            {{ formatCurrency(transaction.amount) }}
                          </td>
                          <td>{{ formatCurrency(transaction.previous_balance) }}</td>
                          <td class="font-weight-bold">
                            {{ formatCurrency(transaction.new_balance) }}
                          </td>
                          <td>{{ transaction.description || '-' }}</td>
                          <td>
                            <b-link
                              v-if="transaction.bill_id"
                              @click="viewBill(transaction.bill_id)"
                              class="text-primary"
                            >
                              {{ transaction.bill?.bill_number || `Bill #${transaction.bill_id}` }}
                            </b-link>
                            <span v-else class="text-muted">-</span>
                          </td>
                          <td>{{ formatDate(transaction.createdAt) }}</td>
                          <td>
                            {{ transaction.createdByStaff?.firstname }}
                            {{ transaction.createdByStaff?.lastname }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div v-else class="text-center text-muted py-5">
                  <i class="fas fa-exchange-alt fa-3x mb-3"></i>
                  <h5>No Transactions Found</h5>
                  <p>This deposit has no transaction history yet.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Journal Entries Tab -->
          <div v-show="activeTab === 'journal'">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-book mr-2"></i>
                  Journal Entries
                </h5>
              </div>
              <div class="card-body">
                <div v-if="journalEntries.length > 0">
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead class="thead-light">
                        <tr>
                          <th>Entry Number</th>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Debit Account</th>
                          <th>Debit Amount</th>
                          <th>Credit Account</th>
                          <th>Credit Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-for="entry in journalEntries">
                          <tr v-for="(line, index) in entry.lines" :key="`${entry.id}-${index}`">
                            <td v-if="index === 0" :rowspan="entry.lines.length">
                              <b-link @click="viewJournalEntry(entry.id)" class="text-primary">
                                {{ formatJournalEntryReference(entry) }}
                              </b-link>
                            </td>
                            <td v-if="index === 0" :rowspan="entry.lines.length">
                              {{ formatDate(entry.transaction_date) }}
                            </td>
                            <td v-if="index === 0" :rowspan="entry.lines.length">
                              {{ entry.description }}
                            </td>
                            <td>
                              <span v-if="line.debit > 0">
                                {{ getAccountDisplay(line.account) }}
                              </span>
                              <span v-else class="text-muted">-</span>
                            </td>
                            <td class="text-right">
                              <span v-if="line.debit > 0" class="text-danger font-weight-bold">
                                {{ formatCurrency(line.debit) }}
                              </span>
                              <span v-else class="text-muted">-</span>
                            </td>
                            <td>
                              <span v-if="line.credit > 0">
                                {{ getAccountDisplay(line.account) }}
                              </span>
                              <span v-else class="text-muted">-</span>
                            </td>
                            <td class="text-right">
                              <span v-if="line.credit > 0" class="text-success font-weight-bold">
                                {{ formatCurrency(line.credit) }}
                              </span>
                              <span v-else class="text-muted">-</span>
                            </td>
                            <td v-if="index === 0" :rowspan="entry.lines.length">
                              <b-badge :variant="getJournalEntryStatusVariant(entry.status)">
                                {{ entry.status }}
                              </b-badge>
                            </td>
                          </tr>
                        </template>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div v-else class="text-center text-muted py-5">
                  <i class="fas fa-book fa-3x mb-3"></i>
                  <h5>No Journal Entries Found</h5>
                  <p>This deposit has no associated journal entries yet.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Audit Trail Tab -->
          <div v-show="activeTab === 'audit'">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-history mr-2"></i>
                  Audit Trail
                </h5>
              </div>
              <div class="card-body">
                <div class="text-center text-muted py-5">
                  <i class="fas fa-history fa-3x mb-3"></i>
                  <h5>Audit Trail Coming Soon</h5>
                  <p>
                    Comprehensive audit trail functionality will be available in a future update.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Use Deposit Modal -->
    <b-modal
      v-model="showUseDepositModal"
      title="Use Deposit for Payment"
      size="lg"
      @ok="processDepositUsage"
      @hidden="resetUsageForm"
    >
      <div v-if="deposit">
        <div class="deposit-summary mb-4">
          <h6>Deposit Summary</h6>
          <p><strong>Reference:</strong> {{ deposit.reference_number }}</p>
          <p>
            <strong>Patient:</strong> {{ deposit.patient?.firstname }}
            {{ deposit.patient?.lastname }}
          </p>
          <p>
            <strong>Available Amount:</strong>
            {{ formatCurrency(deposit.amount - (deposit.used_amount || 0)) }}
          </p>
        </div>

        <b-form @submit.prevent="processDepositUsage">
          <div class="row">
            <div class="col-md-6">
              <b-form-group label="Usage Amount" label-for="usage-amount">
                <b-form-input
                  id="usage-amount"
                  v-model.number="usageForm.amount"
                  type="number"
                  step="0.01"
                  :max="deposit.amount - (deposit.used_amount || 0)"
                  min="0"
                  required
                ></b-form-input>
                <small class="form-text text-muted">
                  Maximum: {{ formatCurrency(deposit.amount - (deposit.used_amount || 0)) }}
                </small>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Purpose" label-for="usage-purpose">
                <b-form-input
                  id="usage-purpose"
                  v-model="usageForm.purpose"
                  placeholder="What is this payment for?"
                  required
                ></b-form-input>
              </b-form-group>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <b-form-group label="Notes" label-for="usage-notes">
                <b-form-textarea
                  id="usage-notes"
                  v-model="usageForm.notes"
                  rows="3"
                  placeholder="Additional notes..."
                ></b-form-textarea>
              </b-form-group>
            </div>
          </div>
        </b-form>
      </div>

      <template #modal-footer>
        <b-button variant="secondary" @click="showUseDepositModal = false"> Cancel </b-button>
        <b-button variant="success" @click="processDepositUsage" :disabled="processingUsage">
          <span v-if="processingUsage">
            <i class="fas fa-spinner fa-spin mr-2"></i>Processing...
          </span>
          <span v-else> Use Deposit </span>
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'DepositDetails',
  data() {
    return {
      loading: true,
      error: null,
      deposit: null,
      recentActivity: [],
      transactions: [],
      journalEntries: [],
      activeTab: 'overview',

      // Usage modal
      showUseDepositModal: false,
      processingUsage: false,
      usedAmount: 0,
      usageForm: {
        amount: 0,
        purpose: '',
        notes: '',
      },
    };
  },
  async mounted() {
    await this.loadDeposit();
  },
  methods: {
    async loadDeposit() {
      try {
        this.loading = true;
        this.error = null;

        const depositId = this.$route.params.id;
        const result = await this.$store.dispatch('accounting/getPatientDepositById', depositId);

        if (result.success) {
          this.deposit = result.data.deposit;
          this.transactions = result.data.transactions || [];
          this.journalEntries = result.data.journalEntries || [];
          this.usedAmount = this.transactions.reduce(
            (acc, transaction) => acc + +transaction.amount,
            0
          );

          // Generate recent activity from transactions
          this.recentActivity = this.transactions.slice(0, 5).map((transaction) => ({
            id: transaction.id,
            type: transaction.transaction_type,
            description: transaction.description || `${transaction.transaction_type} transaction`,
            created_at: transaction.createdAt,
          }));
        } else {
          this.error = result.error || 'Failed to load deposit details';
        }
      } catch (error) {
        console.error('Failed to load deposit:', error);
        this.error = error.message || 'Failed to load deposit details';
      } finally {
        this.loading = false;
      }
    },

    // Modal actions
    useDeposit() {
      this.usageForm.amount = this.deposit.amount - (this.deposit.used_amount || 0);
      this.showUseDepositModal = true;
    },

    async processDepositUsage() {
      try {
        this.processingUsage = true;

        const usageData = {
          deposit_id: this.deposit.id,
          amount: this.usageForm.amount,
          bill_id: 0, // TODO: Implement bill selection
          description: this.usageForm.purpose,
          used_by: this.$store.state.user?.id || 1,
        };

        await this.$store.dispatch('accounting/useDeposit', usageData);

        this.$bvToast.toast('Deposit used successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });

        this.showUseDepositModal = false;
        await this.loadDeposit(); // Refresh the deposit data
      } catch (error) {
        console.error('Failed to use deposit:', error);
        this.$bvToast.toast('Failed to use deposit', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.processingUsage = false;
      }
    },

    editDeposit() {
      this.$router.push({ name: 'patient-deposits', query: { edit: this.deposit.id } });
    },

    printDeposit() {
      window.print();
    },

    // Navigation methods
    viewBill(billId) {
      this.$router.push({ name: 'clinical-bill-details', params: { id: billId } });
    },

    viewJournalEntry(entryId) {
      // Navigate to journal entry details if route exists
      this.$router.push({ name: 'journal-entry-details', params: { id: entryId } });
    },

    // Form resets
    resetUsageForm() {
      this.usageForm = {
        amount: 0,
        purpose: '',
        notes: '',
      };
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

    getStatusCardClass(status) {
      const classes = {
        ACTIVE: 'bg-success text-white',
        USED: 'bg-info text-white',
        REFUNDED: 'bg-warning text-white',
        EXPIRED: 'bg-danger text-white',
      };
      return classes[status] || 'bg-secondary text-white';
    },

    getActivityIcon(type) {
      const icons = {
        CREATED: 'fas fa-plus-circle text-success',
        USED: 'fas fa-credit-card text-info',
        REFUNDED: 'fas fa-undo text-warning',
        EXPIRED: 'fas fa-clock text-danger',
      };
      return icons[type] || 'fas fa-info-circle text-secondary';
    },

    // New utility methods for transaction history
    formatTransactionType(type) {
      const types = {
        CREATED: 'Created',
        USED: 'Used',
        REFUNDED: 'Refunded',
        ADJUSTED: 'Adjusted',
        EXPIRED: 'Expired',
      };
      return types[type] || type;
    },

    getTransactionTypeBadgeVariant(type) {
      const variants = {
        CREATED: 'success',
        USED: 'info',
        REFUNDED: 'warning',
        ADJUSTED: 'secondary',
        EXPIRED: 'danger',
      };
      return variants[type] || 'secondary';
    },

    getAmountClass(type) {
      const classes = {
        CREATED: 'text-success',
        USED: 'text-danger',
        REFUNDED: 'text-warning',
        ADJUSTED: 'text-info',
        EXPIRED: 'text-danger',
      };
      return classes[type] || 'text-dark';
    },

    // New utility methods for journal entries
    formatJournalEntryReference(entry) {
      return entry.reference || `JE-${entry.id}`;
    },

    getAccountDisplay(account) {
      if (!account) return 'Unknown Account';
      return `${account.code} - ${account.name}`;
    },

    getJournalEntryStatusVariant(status) {
      const variants = {
        DRAFT: 'secondary',
        POSTED: 'success',
        CANCELLED: 'danger',
        PENDING: 'warning',
      };
      return variants[status] || 'secondary';
    },
  },
};
</script>

<style scoped>
.deposit-details {
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

.detail-item {
  margin-bottom: 1rem;
}

.detail-label {
  font-weight: 600;
  color: #495057;
  display: block;
  margin-bottom: 0.25rem;
}

.detail-value {
  color: #2c3e50;
  display: block;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  margin-right: 0.75rem;
  margin-top: 0.125rem;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 0.875rem;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.activity-time {
  color: #6c757d;
  font-size: 0.75rem;
}

.deposit-summary {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.deposit-summary h6 {
  margin-bottom: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.deposit-summary p {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .deposit-details {
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
