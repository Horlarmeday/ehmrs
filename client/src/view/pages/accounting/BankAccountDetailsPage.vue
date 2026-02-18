<template>
  <div class="bank-account-details-page">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading bank account details...</span>
      </div>
      <p class="mt-3 text-muted">Loading bank account details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      <strong>Error:</strong> {{ error }}
      <b-button variant="outline-danger" size="sm" class="ml-3" @click="loadBankAccount">
        Try Again
      </b-button>
    </div>

    <!-- Account Details -->
    <div v-else-if="bankAccount" class="account-details">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <div class="header-content">
          <div class="header-title">
            <div class="d-flex align-items-center">
              <div class="header-icon mr-3">
                <i class="fas fa-university fa-2x text-primary"></i>
              </div>
              <div>
                <h1 class="page-title mb-1">
                  {{ bankAccount.bank_name }}
                </h1>
                <p class="page-subtitle text-muted mb-0">
                  Account: {{ bankAccount.account_number }}
                </p>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <b-button variant="outline-primary" @click="editAccount" class="mr-2">
              <i class="fas fa-edit mr-2"></i>Edit Account
            </b-button>
            <b-button variant="outline-warning" @click="toggleStatus" class="mr-2">
              <i :class="bankAccount.is_active ? 'fas fa-pause' : 'fas fa-play'" class="mr-2"></i>
              {{ bankAccount.is_active ? 'Deactivate' : 'Activate' }}
            </b-button>
            <b-button variant="outline-danger" @click="deleteAccount">
              <i class="fas fa-trash mr-2"></i>Delete
            </b-button>
          </div>
        </div>
      </div>

      <!-- Account Information Cards -->
      <div class="row">
        <!-- Main Account Info -->
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-info-circle text-primary mr-2"></i>
                Account Information
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Bank Name</label>
                    <div class="info-value">{{ bankAccount.bank_name }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Account Number</label>
                    <div class="info-value">
                      <code class="text-primary">{{ bankAccount.account_number }}</code>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Account Name</label>
                    <div class="info-value">{{ bankAccount.account_name }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Account Type</label>
                    <div class="info-value">
                      <b-badge :variant="getAccountTypeVariant(bankAccount.account_type)">
                        {{ getAccountTypeDisplay(bankAccount.account_type) }}
                      </b-badge>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Current Balance</label>
                    <div class="info-value">
                      <span class="font-weight-bold text-success fs-5">
                        {{ formatCurrency(bankAccount.current_balance) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Status</label>
                    <div class="info-value">
                      <b-badge :variant="bankAccount.is_active ? 'success' : 'secondary'">
                        {{ bankAccount.is_active ? 'Active' : 'Inactive' }}
                      </b-badge>
                    </div>
                  </div>
                </div>
                <div class="col-12" v-if="bankAccount.description">
                  <div class="info-item mb-3">
                    <label class="info-label">Description</label>
                    <div class="info-value">{{ bankAccount.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Balance History Chart -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-chart-line text-primary mr-2"></i>
                Balance History
              </h5>
            </div>
            <div class="card-body">
              <div class="text-center py-4">
                <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                <h6 class="text-muted">Balance History Chart</h6>
                <p class="text-muted">
                  Balance tracking and visualization will be implemented in future updates
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Information -->
        <div class="col-lg-4">
          <!-- Staff Information -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-user text-primary mr-2"></i>
                Staff Information
              </h5>
            </div>
            <div class="card-body">
              <div class="info-item mb-3">
                <label class="info-label">Created By</label>
                <div class="info-value">
                  {{ getStaffName(bankAccount.createdByStaff) }}
                </div>
              </div>
              <div class="info-item mb-3">
                <label class="info-label">Created Date</label>
                <div class="info-value">
                  {{ formatDate(bankAccount.createdAt) }}
                </div>
              </div>
              <div class="info-item mb-3" v-if="bankAccount.updatedByStaff">
                <label class="info-label">Last Updated By</label>
                <div class="info-value">
                  {{ getStaffName(bankAccount.updatedByStaff) }}
                </div>
              </div>
              <div class="info-item mb-3" v-if="bankAccount.updatedAt">
                <label class="info-label">Last Updated</label>
                <div class="info-value">
                  {{ formatDate(bankAccount.updatedAt) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-bolt text-primary mr-2"></i>
                Quick Actions
              </h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <b-button variant="outline-primary" @click="updateBalance" block>
                  <i class="fas fa-money-bill-wave mr-2"></i>
                  Update Balance
                </b-button>
                <b-button variant="outline-info" @click="viewTransactions" block>
                  <i class="fas fa-list mr-2"></i>
                  View Transactions
                </b-button>
                <b-button variant="outline-success" @click="exportData" block>
                  <i class="fas fa-download mr-2"></i>
                  Export Data
                </b-button>
              </div>
            </div>
          </div>

          <!-- Account Statistics -->
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-chart-pie text-primary mr-2"></i>
                Account Statistics
              </h5>
            </div>
            <div class="card-body">
              <div class="stat-item mb-3">
                <div class="stat-label">Total Transactions</div>
                <div class="stat-value">0</div>
              </div>
              <div class="stat-item mb-3">
                <div class="stat-label">This Month</div>
                <div class="stat-value">0</div>
              </div>
              <div class="stat-item mb-3">
                <div class="stat-label">Last Transaction</div>
                <div class="stat-value text-muted">Never</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="card">
        <div class="card-header">
          <h5 class="card-title mb-0">
            <i class="fas fa-history text-primary mr-2"></i>
            Recent Transactions
          </h5>
        </div>
        <div class="card-body">
          <div class="text-center py-4">
            <i class="fas fa-history fa-3x text-muted mb-3"></i>
            <h6 class="text-muted">No Recent Transactions</h6>
            <p class="text-muted">Transaction history will be displayed here when available</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <BankAccountForm
      v-if="showEditModal"
      :account="bankAccount"
      :show="showEditModal"
      @close="closeEditModal"
      @saved="onAccountUpdated"
    />

    <!-- Update Balance Modal -->
    <b-modal
      v-model="showBalanceModal"
      title="Update Account Balance"
      header-bg-variant="info"
      header-text-variant="white"
      @ok="confirmBalanceUpdate"
      @cancel="cancelBalanceUpdate"
    >
      <div class="balance-update-form">
        <div class="current-balance mb-3">
          <label class="form-label">Current Balance</label>
          <div class="current-balance-display">
            <span class="font-weight-bold text-success fs-4">
              {{ formatCurrency(bankAccount?.current_balance || 0) }}
            </span>
          </div>
        </div>
        <div class="new-balance mb-3">
          <label class="form-label">New Balance</label>
          <b-input-group>
            <b-input-group-prepend>
              <span class="input-group-text">₦</span>
            </b-input-group-prepend>
            <b-form-input
              v-model.number="newBalance"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter new balance"
              required
            ></b-form-input>
          </b-input-group>
        </div>
        <div class="balance-change mb-3">
          <label class="form-label">Balance Change</label>
          <div class="balance-change-display">
            <span :class="balanceChangeClass">
              {{ formatCurrency(balanceChange) }}
            </span>
          </div>
        </div>
        <div class="reason mb-3">
          <label class="form-label">Reason for Update</label>
          <b-form-textarea
            v-model="balanceUpdateReason"
            rows="3"
            placeholder="Enter reason for balance update (e.g., reconciliation, correction)"
            required
          ></b-form-textarea>
        </div>
      </div>
    </b-modal>

    <!-- Delete Confirmation Modal -->
    <b-modal
      v-model="showDeleteModal"
      title="Delete Bank Account"
      header-bg-variant="danger"
      header-text-variant="white"
      @ok="confirmDelete"
      @cancel="cancelDelete"
    >
      <div class="text-center">
        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        <h5>Are you sure you want to delete this bank account?</h5>
        <p class="text-muted">
          <strong>{{ bankAccount?.bank_name }} - {{ bankAccount?.account_number }}</strong>
        </p>
        <p class="text-danger">
          <small>
            <i class="fas fa-info-circle mr-1"></i>
            This action cannot be undone. All associated data will be permanently removed.
          </small>
        </p>
      </div>
    </b-modal>
  </div>
</template>

<script>
import BankAccountForm from './BankAccountForm.vue';

export default {
  name: 'BankAccountDetailsPage',
  components: {
    BankAccountForm,
  },
  data() {
    return {
      loading: false,
      error: null,
      bankAccount: null,
      showEditModal: false,
      showBalanceModal: false,
      showDeleteModal: false,
      newBalance: 0,
      balanceUpdateReason: '',
    };
  },
  computed: {
    balanceChange() {
      if (!this.bankAccount || !this.newBalance) return 0;
      return this.newBalance - this.bankAccount.current_balance;
    },
    balanceChangeClass() {
      if (this.balanceChange > 0) return 'text-success font-weight-bold';
      if (this.balanceChange < 0) return 'text-danger font-weight-bold';
      return 'text-muted';
    },
  },
  mounted() {
    this.loadBankAccount();
  },
  methods: {
    // Data Loading
    async loadBankAccount() {
      try {
        this.loading = true;
        this.error = null;

        const accountId = this.$route.params.id;
        const response = await this.$store.dispatch('accounting/getBankAccountById', accountId);

        if (response && response.data) {
          this.bankAccount = response.data;
        } else {
          throw new Error('Bank account not found');
        }
      } catch (error) {
        console.error('Failed to load bank account:', error);
        this.error = error.message || 'Failed to load bank account';
      } finally {
        this.loading = false;
      }
    },

    // Account Actions
    editAccount() {
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
    },

    onAccountUpdated() {
      this.closeEditModal();
      this.loadBankAccount();
      this.$bvToast.toast('Bank account updated successfully', {
        title: 'Success',
        variant: 'success',
        solid: true,
      });
    },

    async toggleStatus() {
      try {
        await this.$store.dispatch('accounting/toggleBankAccountStatus', this.bankAccount.id);
        this.loadBankAccount();
        this.$bvToast.toast(
          `Bank account ${this.bankAccount.is_active ? 'deactivated' : 'activated'} successfully`,
          {
            title: 'Success',
            variant: 'success',
            solid: true,
          }
        );
      } catch (error) {
        console.error('Failed to toggle status:', error);
        this.$bvToast.toast('Failed to update account status', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    deleteAccount() {
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      try {
        await this.$store.dispatch('accounting/deleteBankAccount', this.bankAccount.id);
        this.showDeleteModal = false;
        this.$router.push('/accounting/bank-accounts');
        this.$bvToast.toast('Bank account deleted successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to delete account:', error);
        this.$bvToast.toast('Failed to delete bank account', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    cancelDelete() {
      this.showDeleteModal = false;
    },

    // Balance Update
    updateBalance() {
      this.newBalance = this.bankAccount.current_balance;
      this.balanceUpdateReason = '';
      this.showBalanceModal = true;
    },

    async confirmBalanceUpdate() {
      if (!this.balanceUpdateReason.trim()) {
        this.$bvToast.toast('Please provide a reason for the balance update', {
          title: 'Validation Error',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      try {
        await this.$store.dispatch('accounting/updateBankAccountBalance', {
          id: this.bankAccount.id,
          newBalance: this.newBalance,
          currentBalance: this.bankAccount.current_balance,
          reason: this.balanceUpdateReason,
        });

        this.showBalanceModal = false;
        this.loadBankAccount();
        this.$bvToast.toast('Account balance updated successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to update balance:', error);
        const errorMessage =
          error.response?.data?.message || error.message || 'Failed to update account balance';
        this.$bvToast.toast(errorMessage, {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    cancelBalanceUpdate() {
      this.showBalanceModal = false;
    },

    // Other Actions
    viewTransactions() {
      this.$bvToast.toast('Transaction history will be implemented in future updates', {
        title: 'Coming Soon',
        variant: 'info',
        solid: true,
      });
    },

    exportData() {
      this.$bvToast.toast('Data export will be implemented in future updates', {
        title: 'Coming Soon',
        variant: 'info',
        solid: true,
      });
    },

    // Utility Methods
    getAccountTypeVariant(type) {
      const variants = {
        CURRENT: 'primary',
        SAVINGS: 'success',
        FIXED_DEPOSIT: 'warning',
        DOMICILIARY: 'info',
      };
      return variants[type] || 'secondary';
    },

    getAccountTypeDisplay(type) {
      const displays = {
        CURRENT: 'Current Account',
        SAVINGS: 'Savings Account',
        FIXED_DEPOSIT: 'Fixed Deposit',
        DOMICILIARY: 'Domiciliary Account',
      };
      return displays[type] || type;
    },

    getStaffName(staff) {
      if (!staff) return 'Unknown';
      return `${staff.firstname || ''} ${staff.lastname || ''}`.trim() || 'Unknown';
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
      }).format(amount || 0);
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
};
</script>

<style scoped>
.bank-account-details-page {
  padding: 1rem;
}

.page-header {
  background: linear-gradient(135deg, #00acc1 0%, #0097a7 100%);
  color: white;
  border-radius: 12px;
  padding: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.header-title .page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}

.header-title .page-subtitle {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.header-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  border-radius: 12px 12px 0 0 !important;
}

.info-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 1rem;
  color: #212529;
}

.stat-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
}

.balance-update-form .current-balance-display,
.balance-update-form .balance-change-display {
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .header-actions .btn {
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 576px) {
  .bank-account-details-page {
    padding: 0.5rem;
  }

  .page-header {
    padding: 1rem;
  }

  .header-title .page-title {
    font-size: 1.5rem;
  }

  .header-title .page-subtitle {
    font-size: 1rem;
  }
}
</style>
