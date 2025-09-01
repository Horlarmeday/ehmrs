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
        <b-button variant="outline-info" @click="viewUsageHistory">
          <i class="fas fa-history mr-2"></i>Usage History
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
                  {{ formatCurrency(deposit.amount - (deposit.used_amount || 0)) }}
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
                <h4 class="summary-value">{{ formatCurrency(deposit.used_amount || 0) }}</h4>
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

      <!-- Main Details -->
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
                      <small class="text-muted d-block">{{ deposit.patient?.hospital_id }}</small>
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
                    <label class="detail-label">Amount:</label>
                    <span class="detail-value text-success font-weight-bold">
                      {{ formatCurrency(deposit.amount) }}
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
          <!-- Quick Actions -->
          <div class="card mb-3">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-bolt mr-2"></i>
                Quick Actions
              </h6>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <b-button
                  variant="success"
                  @click="useDeposit"
                  v-if="deposit.status === 'ACTIVE'"
                  :disabled="deposit.amount - (deposit.used_amount || 0) <= 0"
                >
                  <i class="fas fa-credit-card mr-2"></i>
                  Use Deposit
                </b-button>
                <b-button variant="info" @click="viewUsageHistory">
                  <i class="fas fa-history mr-2"></i>
                  View Usage History
                </b-button>
                <b-button variant="warning" @click="editDeposit" v-if="deposit.status === 'ACTIVE'">
                  <i class="fas fa-edit mr-2"></i>
                  Edit Deposit
                </b-button>
                <b-button variant="outline-secondary" @click="printDeposit">
                  <i class="fas fa-print mr-2"></i>
                  Print Details
                </b-button>
              </div>
            </div>
          </div>

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
        <b-button variant="secondary" @click="showUseDepositModal = false">
          Cancel
        </b-button>
        <b-button variant="success" @click="processDepositUsage" :disabled="processingUsage">
          <span v-if="processingUsage">
            <i class="fas fa-spinner fa-spin mr-2"></i>Processing...
          </span>
          <span v-else>
            Use Deposit
          </span>
        </b-button>
      </template>
    </b-modal>

    <!-- Usage History Modal -->
    <b-modal
      v-model="showUsageHistoryModal"
      title="Deposit Usage History"
      size="lg"
      @hidden="resetUsageHistory"
    >
      <div v-if="usageHistory.length > 0">
        <div class="table-responsive">
          <table class="table table-sm">
            <thead class="thead-light">
              <tr>
                <th>Date</th>
                <th>Amount Used</th>
                <th>Purpose</th>
                <th>Bill #</th>
                <th>Processed By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="usage in usageHistory" :key="usage.id">
                <td>{{ formatDate(usage.created_at) }}</td>
                <td>{{ formatCurrency(usage.amount) }}</td>
                <td>{{ usage.purpose }}</td>
                <td>{{ usage.bill?.bill_number || 'N/A' }}</td>
                <td>{{ usage.processedBy?.firstname }} {{ usage.processedBy?.lastname }}</td>
                <td>{{ usage.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="text-center">
        <p>No usage history found for this deposit.</p>
      </div>
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
      usageHistory: [],

      // Usage modal
      showUseDepositModal: false,
      processingUsage: false,
      usageForm: {
        amount: 0,
        purpose: '',
        notes: '',
      },

      // Usage history modal
      showUsageHistoryModal: false,
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
          this.deposit = result.data;
          await this.loadUsageHistory();
          await this.loadRecentActivity();
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

    async loadUsageHistory() {
      try {
        this.usageHistory = await this.$store.dispatch(
          'accounting/getDepositUsageHistory',
          this.deposit.id
        );
      } catch (error) {
        console.error('Failed to load usage history:', error);
      }
    },

    async loadRecentActivity() {
      // This would typically come from an API endpoint
      // For now, we'll create mock activity based on deposit data
      this.recentActivity = [
        {
          id: 1,
          type: 'CREATED',
          description: 'Deposit created',
          created_at: this.deposit.createdAt,
        },
        ...(this.usageHistory.length > 0
          ? [
              {
                id: 2,
                type: 'USED',
                description: `Deposit used for payment`,
                created_at: this.usageHistory[0]?.created_at,
              },
            ]
          : []),
      ];
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

    viewUsageHistory() {
      this.showUsageHistoryModal = true;
    },

    editDeposit() {
      this.$router.push({ name: 'patient-deposits', query: { edit: this.deposit.id } });
    },

    printDeposit() {
      window.print();
    },

    // Form resets
    resetUsageForm() {
      this.usageForm = {
        amount: 0,
        purpose: '',
        notes: '',
      };
    },

    resetUsageHistory() {
      this.usageHistory = [];
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
