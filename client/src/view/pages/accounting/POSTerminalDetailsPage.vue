<template>
  <div class="pos-terminal-details-page">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="sr-only">Loading POS terminal details...</span>
      </div>
      <p class="mt-3 text-muted">Loading POS terminal details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      <strong>Error:</strong> {{ error }}
      <b-button variant="outline-danger" size="sm" class="ml-3" @click="loadPOSTerminal">
        Try Again
      </b-button>
    </div>

    <!-- Terminal Details -->
    <div v-else-if="posTerminal" class="terminal-details">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <div class="header-content">
          <div class="header-title">
            <div class="d-flex align-items-center">
              <div class="header-icon mr-3">
                <i class="fas fa-credit-card fa-2x text-success"></i>
              </div>
              <div>
                <h1 class="page-title mb-1">
                  {{ posTerminal.terminal_id }}
                </h1>
                <p class="page-subtitle text-muted mb-0">Location: {{ posTerminal.location }}</p>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <b-button variant="outline-success" @click="editTerminal" class="mr-2">
              <i class="fas fa-edit mr-2"></i>Edit Terminal
            </b-button>
            <b-button variant="outline-warning" @click="toggleStatus" class="mr-2">
              <i :class="posTerminal.is_active ? 'fas fa-pause' : 'fas fa-play'" class="mr-2"></i>
              {{ posTerminal.is_active ? 'Deactivate' : 'Activate' }}
            </b-button>
            <b-button variant="outline-danger" @click="deleteTerminal">
              <i class="fas fa-trash mr-2"></i>Delete
            </b-button>
          </div>
        </div>
      </div>

      <!-- Terminal Information Cards -->
      <div class="row">
        <!-- Main Terminal Info -->
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-info-circle text-success mr-2"></i>
                Terminal Information
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Terminal ID</label>
                    <div class="info-value">
                      <code class="text-success">{{ posTerminal.terminal_id }}</code>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Location</label>
                    <div class="info-value">{{ posTerminal.location }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Terminal Type</label>
                    <div class="info-value">
                      <b-badge :variant="getTerminalTypeVariant(posTerminal.terminal_type)">
                        {{ getTerminalTypeDisplay(posTerminal.terminal_type) }}
                      </b-badge>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Status</label>
                    <div class="info-value">
                      <b-badge :variant="posTerminal.is_active ? 'success' : 'secondary'">
                        {{ posTerminal.is_active ? 'Active' : 'Inactive' }}
                      </b-badge>
                    </div>
                  </div>
                </div>
                <div class="col-md-6" v-if="posTerminal.merchant_name">
                  <div class="info-item mb-3">
                    <label class="info-label">Merchant Name</label>
                    <div class="info-value">{{ posTerminal.merchant_name }}</div>
                  </div>
                </div>
                <div class="col-md-6" v-if="posTerminal.merchant_id">
                  <div class="info-item mb-3">
                    <label class="info-label">Merchant ID</label>
                    <div class="info-value">
                      <code class="text-muted">{{ posTerminal.merchant_id }}</code>
                    </div>
                  </div>
                </div>
                <div class="col-12" v-if="posTerminal.description">
                  <div class="info-item mb-3">
                    <label class="info-label">Description</label>
                    <div class="info-value">{{ posTerminal.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bank Account Information -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-university text-success mr-2"></i>
                Bank Account Information
              </h5>
            </div>
            <div class="card-body">
              <div v-if="posTerminal.bankAccount" class="row">
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Bank Name</label>
                    <div class="info-value">{{ posTerminal.bankAccount.bank_name }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Account Number</label>
                    <div class="info-value">
                      <code class="text-primary">{{ posTerminal.bankAccount.account_number }}</code>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Account Name</label>
                    <div class="info-value">{{ posTerminal.bankAccount.account_name }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Account Type</label>
                    <div class="info-value">
                      <b-badge
                        :variant="getAccountTypeVariant(posTerminal.bankAccount.account_type)"
                      >
                        {{ getAccountTypeDisplay(posTerminal.bankAccount.account_type) }}
                      </b-badge>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-3">
                <i class="fas fa-exclamation-triangle text-warning fa-2x mb-2"></i>
                <p class="text-muted mb-0">No bank account information available</p>
              </div>
            </div>
          </div>

          <!-- Daily Limits -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-chart-line text-success mr-2"></i>
                Daily Limits & Usage
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Daily Transaction Limit</label>
                    <div class="info-value">
                      <span
                        v-if="posTerminal.daily_transaction_limit"
                        class="font-weight-bold text-info"
                      >
                        {{ posTerminal.daily_transaction_limit }} transactions
                      </span>
                      <span v-else class="text-muted">No limit set</span>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Daily Amount Limit</label>
                    <div class="info-value">
                      <span
                        v-if="posTerminal.daily_amount_limit"
                        class="font-weight-bold text-success"
                      >
                        {{ formatCurrency(posTerminal.daily_amount_limit) }}
                      </span>
                      <span v-else class="text-muted">No limit set</span>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Last Used</label>
                    <div class="info-value">
                      <span class="text-muted">
                        {{ formatDate(posTerminal.last_used_at) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item mb-3">
                    <label class="info-label">Usage Status</label>
                    <div class="info-value">
                      <b-badge :variant="getUsageStatusVariant(posTerminal.last_used_at)">
                        {{ getUsageStatusDisplay(posTerminal.last_used_at) }}
                      </b-badge>
                    </div>
                  </div>
                </div>
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
                <i class="fas fa-user text-success mr-2"></i>
                Staff Information
              </h5>
            </div>
            <div class="card-body">
              <div class="info-item mb-3">
                <label class="info-label">Created By</label>
                <div class="info-value">
                  {{ getStaffName(posTerminal.createdByStaff) }}
                </div>
              </div>
              <div class="info-item mb-3">
                <label class="info-label">Created Date</label>
                <div class="info-value">
                  {{ formatDate(posTerminal.createdAt) }}
                </div>
              </div>
              <div class="info-item mb-3" v-if="posTerminal.updatedByStaff">
                <label class="info-label">Last Updated By</label>
                <div class="info-value">
                  {{ getStaffName(posTerminal.updatedByStaff) }}
                </div>
              </div>
              <div class="info-item mb-3" v-if="posTerminal.updatedAt">
                <label class="info-label">Last Updated</label>
                <div class="info-value">
                  {{ formatDate(posTerminal.updatedAt) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-bolt text-success mr-2"></i>
                Quick Actions
              </h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <b-button variant="outline-success" @click="updateLastUsed" block>
                  <i class="fas fa-clock mr-2"></i>
                  Update Last Used
                </b-button>
                <b-button variant="outline-info" @click="viewTransactions" block>
                  <i class="fas fa-list mr-2"></i>
                  View Transactions
                </b-button>
                <b-button variant="outline-warning" @click="exportData" block>
                  <i class="fas fa-download mr-2"></i>
                  Export Data
                </b-button>
              </div>
            </div>
          </div>

          <!-- Terminal Statistics -->
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-chart-pie text-success mr-2"></i>
                Terminal Statistics
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
            <i class="fas fa-history text-success mr-2"></i>
            Recent Transactions
          </h5>
        </div>
        <div class="card-body">
          <div class="text-center py-4">
            <i class="fas fa-history fa-3x text-muted mb-3"></i>
            <h6 class="text-muted">No Recent Transactions</h6>
            <p class="text-muted">
              Transaction history will be displayed here when available
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <POSTerminalForm
      v-if="showEditModal"
      :terminal="posTerminal"
      :show="showEditModal"
      @close="closeEditModal"
      @saved="onTerminalUpdated"
    />

    <!-- Update Last Used Modal -->
    <b-modal
      v-model="showLastUsedModal"
      title="Update Last Used"
      header-bg-variant="info"
      header-text-variant="white"
      @ok="confirmLastUsedUpdate"
      @cancel="cancelLastUsedUpdate"
    >
      <div class="last-used-update-form">
        <div class="current-last-used mb-3">
          <label class="form-label">Current Last Used</label>
          <div class="current-last-used-display">
            <span class="text-muted">
              {{ formatDate(posTerminal?.last_used_at) }}
            </span>
          </div>
        </div>
        <div class="new-last-used mb-3">
          <label class="form-label">New Last Used</label>
          <b-form-input v-model="newLastUsed" type="datetime-local" required></b-form-input>
        </div>
        <div class="reason mb-3">
          <label class="form-label">Reason for Update</label>
          <b-form-textarea
            v-model="lastUsedUpdateReason"
            rows="3"
            placeholder="Enter reason for updating last used (e.g., maintenance, testing)"
            required
          ></b-form-textarea>
        </div>
      </div>
    </b-modal>

    <!-- Delete Confirmation Modal -->
    <b-modal
      v-model="showDeleteModal"
      title="Delete POS Terminal"
      header-bg-variant="danger"
      header-text-variant="white"
      @ok="confirmDelete"
      @cancel="cancelDelete"
    >
      <div class="text-center">
        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        <h5>Are you sure you want to delete this POS terminal?</h5>
        <p class="text-muted">
          <strong>{{ posTerminal?.terminal_id }} - {{ posTerminal?.location }}</strong>
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
import POSTerminalForm from './POSTerminalForm.vue';

export default {
  name: 'POSTerminalDetailsPage',
  components: {
    POSTerminalForm,
  },
  data() {
    return {
      loading: false,
      error: null,
      posTerminal: null,
      showEditModal: false,
      showLastUsedModal: false,
      showDeleteModal: false,
      newLastUsed: '',
      lastUsedUpdateReason: '',
    };
  },
  computed: {
    // Computed properties for display logic
  },
  mounted() {
    this.loadPOSTerminal();
  },
  methods: {
    // Data Loading
    async loadPOSTerminal() {
      try {
        this.loading = true;
        this.error = null;

        const terminalId = this.$route.params.id;
        const response = await this.$store.dispatch('accounting/getPOSTerminalById', terminalId);

        if (response && response.data) {
          this.posTerminal = response.data;
        } else {
          throw new Error('POS terminal not found');
        }
      } catch (error) {
        console.error('Failed to load POS terminal:', error);
        this.error = error.message || 'Failed to load POS terminal';
      } finally {
        this.loading = false;
      }
    },

    // Terminal Actions
    editTerminal() {
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
    },

    onTerminalUpdated() {
      this.closeEditModal();
      this.loadPOSTerminal();
      this.$bvToast.toast('POS terminal updated successfully', {
        title: 'Success',
        variant: 'success',
        solid: true,
      });
    },

    async toggleStatus() {
      try {
        await this.$store.dispatch('accounting/togglePOSTerminalStatus', this.posTerminal.id);
        this.loadPOSTerminal();
        this.$bvToast.toast(
          `POS terminal ${this.posTerminal.is_active ? 'deactivated' : 'activated'} successfully`,
          {
            title: 'Success',
            variant: 'success',
            solid: true,
          }
        );
      } catch (error) {
        console.error('Failed to toggle status:', error);
        this.$bvToast.toast('Failed to update terminal status', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    deleteTerminal() {
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      try {
        await this.$store.dispatch('accounting/deletePOSTerminal', this.posTerminal.id);
        this.showDeleteModal = false;
        this.$router.push('/accounting/pos-terminals');
        this.$bvToast.toast('POS terminal deleted successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to delete terminal:', error);
        this.$bvToast.toast('Failed to delete POS terminal', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    cancelDelete() {
      this.showDeleteModal = false;
    },

    // Last Used Update
    updateLastUsed() {
      this.newLastUsed = new Date().toISOString().slice(0, 16);
      this.lastUsedUpdateReason = '';
      this.showLastUsedModal = true;
    },

    async confirmLastUsedUpdate() {
      if (!this.lastUsedUpdateReason.trim()) {
        this.$bvToast.toast('Please provide a reason for the update', {
          title: 'Validation Error',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      try {
        await this.$store.dispatch('accounting/updatePOSTerminalLastUsed', {
          id: this.posTerminal.id,
          lastUsedAt: this.newLastUsed,
          reason: this.lastUsedUpdateReason,
        });

        this.showLastUsedModal = false;
        this.loadPOSTerminal();
        this.$bvToast.toast('Last used updated successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to update last used:', error);
        this.$bvToast.toast('Failed to update last used', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    cancelLastUsedUpdate() {
      this.showLastUsedModal = false;
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
    getTerminalTypeVariant(type) {
      const variants = {
        MOBILE: 'info',
        FIXED: 'primary',
        KIOSK: 'warning',
      };
      return variants[type] || 'secondary';
    },

    getTerminalTypeDisplay(type) {
      const displays = {
        MOBILE: 'Mobile Terminal',
        FIXED: 'Fixed Terminal',
        KIOSK: 'Self-Service Kiosk',
      };
      return displays[type] || type;
    },

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

    getUsageStatusVariant(lastUsed) {
      if (!lastUsed) return 'secondary';
      const daysSinceLastUse = Math.floor(
        (new Date() - new Date(lastUsed)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastUse <= 1) return 'success';
      if (daysSinceLastUse <= 7) return 'warning';
      return 'danger';
    },

    getUsageStatusDisplay(lastUsed) {
      if (!lastUsed) return 'Never Used';
      const daysSinceLastUse = Math.floor(
        (new Date() - new Date(lastUsed)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastUse === 0) return 'Used Today';
      if (daysSinceLastUse === 1) return 'Used Yesterday';
      if (daysSinceLastUse <= 7) return `Used ${daysSinceLastUse} days ago`;
      return `Used ${daysSinceLastUse} days ago`;
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
      if (!date) return 'Never';
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
.pos-terminal-details-page {
  padding: 1rem;
}

.page-header {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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

.last-used-update-form .current-last-used-display {
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
  .pos-terminal-details-page {
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
