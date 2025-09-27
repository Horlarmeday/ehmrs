<template>
  <div class="financial-periods">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-calendar-alt text-primary mr-3"></i>
          Financial Periods
        </h1>
        <p class="page-subtitle">
          Manage financial periods with opening/closing workflows and period controls
        </p>
      </div>
      <div class="header-actions">
        <b-button variant="primary" @click="showCreateModal">
          <i class="fas fa-plus mr-2"></i>New Period
        </b-button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section">
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-primary text-white">
            <div class="summary-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData.totalPeriods || 0 }}</h3>
              <p class="summary-label">Total Periods</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-success text-white">
            <div class="summary-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData.openPeriods || 0 }}</h3>
              <p class="summary-label">Open Periods</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-info text-white">
            <div class="summary-icon">
              <i class="fas fa-lock"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData.closedPeriods || 0 }}</h3>
              <p class="summary-label">Closed Periods</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-secondary text-white">
            <div class="summary-icon">
              <i class="fas fa-edit"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData.draftPeriods || 0 }}</h3>
              <p class="summary-label">Draft Periods</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-warning text-white">
            <div class="summary-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ currentPeriod?.name || 'None' }}</h3>
              <p class="summary-label">Current Period</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Financial Periods Table -->
    <div class="periods-section">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-table mr-2"></i>
            Financial Periods Management
          </h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="thead-light">
                <tr>
                  <th>Period Name</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Opening Balance</th>
                  <th>Closing Balance</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="period in financialPeriods"
                  :key="period.id"
                  :class="getPeriodRowClass(period)"
                >
                  <td>
                    <strong>{{ period.name }}</strong>
                    <div v-if="period.is_current" class="current-badge">
                      <b-badge variant="success">Current</b-badge>
                    </div>
                  </td>
                  <td>
                    <b-badge v-if="period.period_type" variant="info">{{
                      period.period_type
                    }}</b-badge>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>{{ formatDate(period.start_date) }}</td>
                  <td>{{ formatDate(period.end_date) }}</td>
                  <td>
                    <b-badge :variant="getStatusVariant(period.status)">
                      {{ period.status }}
                    </b-badge>
                  </td>
                  <td>{{ formatCurrency(period.balance) }}</td>
                  <td>{{ formatCurrency(period.closing_balance) }}</td>
                  <td>{{ period.created_by_staff?.name || 'System' }}</td>
                  <td>
                    <div class="btn-group" role="group">
                      <b-button
                        v-if="period.status === 'OPEN' && !period.is_current"
                        variant="outline-success"
                        size="sm"
                        @click="openPeriod(period.id)"
                      >
                        <i class="fas fa-play"></i>
                      </b-button>
                      <b-button
                        v-if="period.status === 'OPEN' && period.is_current"
                        variant="outline-warning"
                        size="sm"
                        @click="closePeriod(period.id)"
                      >
                        <i class="fas fa-stop"></i>
                      </b-button>
                      <b-button variant="outline-info" size="sm" @click="viewPeriod(period.id)">
                        <i class="fas fa-eye"></i>
                      </b-button>
                      <b-button
                        v-if="period.status === 'DRAFT'"
                        variant="outline-warning"
                        size="sm"
                        @click="editPeriod(period.id)"
                      >
                        <i class="fas fa-edit"></i>
                      </b-button>
                      <b-button
                        v-if="period.status === 'DRAFT'"
                        variant="outline-danger"
                        size="sm"
                        @click="deletePeriod(period.id)"
                      >
                        <i class="fas fa-trash"></i>
                      </b-button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <b-modal
      v-model="showModal"
      :title="isEditing ? 'Edit Financial Period' : 'Create Financial Period'"
      size="xl"
      @hidden="resetForm"
      :no-close-on-backdrop="saving"
      :no-close-on-esc="saving"
    >
      <b-form @submit.prevent="savePeriod">
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Period Name" label-for="period-name" required>
              <b-form-input
                id="period-name"
                v-model="periodForm.name"
                placeholder="Enter period name (e.g., Q1 2024)"
                required
              ></b-form-input>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Period Type" label-for="period-type" required>
              <b-form-select
                id="period-type"
                v-model="periodForm.period_type"
                :options="periodTypeOptions"
                required
              ></b-form-select>
            </b-form-group>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Start Date" label-for="period-start-date" required>
              <b-form-input
                id="period-start-date"
                v-model="periodForm.start_date"
                type="date"
                required
              ></b-form-input>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="End Date" label-for="period-end-date" required>
              <b-form-input
                id="period-end-date"
                v-model="periodForm.end_date"
                type="date"
                required
              ></b-form-input>
            </b-form-group>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Opening Balance" label-for="period-opening-balance">
              <b-form-input
                id="period-opening-balance"
                v-model="periodForm.opening_balance"
                type="number"
                step="0.01"
                placeholder="Enter opening balance"
              ></b-form-input>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Description" label-for="period-description">
              <b-form-textarea
                id="period-description"
                v-model="periodForm.description"
                placeholder="Enter period description"
                rows="3"
              ></b-form-textarea>
            </b-form-group>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Status" label-for="period-status">
              <b-form-select
                id="period-status"
                v-model="periodForm.status"
                :options="statusOptions"
                required
              ></b-form-select>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Auto Close" label-for="period-auto-close">
              <b-form-checkbox id="period-auto-close" v-model="periodForm.auto_close" switch>
                Auto close at end date
              </b-form-checkbox>
            </b-form-group>
          </div>
        </div>
      </b-form>
      <template #modal-footer>
        <b-button variant="secondary" @click="showModal = false"> Cancel </b-button>
        <b-button variant="primary" @click="savePeriod" :disabled="saving">
          <span v-if="saving"> <i class="fas fa-spinner fa-spin mr-2"></i>Saving... </span>
          <span v-else>
            {{ isEditing ? 'Update Period' : 'Create Period' }}
          </span>
        </b-button>
      </template>
    </b-modal>

    <!-- Period Actions Modal -->
    <b-modal
      v-model="showActionModal"
      :title="actionModalTitle"
      size="xl"
      @ok="executePeriodAction"
      @hidden="resetActionModal"
    >
      <div class="action-modal-content">
        <div class="alert alert-info">
          <i class="fas fa-info-circle mr-2"></i>
          {{ actionModalMessage }}
        </div>

        <div v-if="selectedAction === 'close'" class="close-period-form">
          <b-form-group label="Closing Date" label-for="closing-date" required>
            <b-form-input
              id="closing-date"
              v-model="closingDate"
              type="date"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group label="Closing Notes" label-for="closing-notes">
            <b-form-textarea
              id="closing-notes"
              v-model="closingNotes"
              placeholder="Enter closing notes..."
              rows="3"
            ></b-form-textarea>
          </b-form-group>
        </div>

        <div v-if="selectedAction === 'open'" class="open-period-form">
          <b-form-group label="Opening Notes" label-for="opening-notes">
            <b-form-textarea
              id="opening-notes"
              v-model="openingNotes"
              placeholder="Enter opening notes..."
              rows="3"
            ></b-form-textarea>
          </b-form-group>
        </div>
      </div>

      <template #modal-footer>
        <b-button variant="secondary" @click="showActionModal = false"> Cancel </b-button>
        <b-button :variant="actionModalVariant" @click="executePeriodAction" :disabled="executing">
          <span v-if="executing"> <i class="fas fa-spinner fa-spin mr-2"></i>Processing... </span>
          <span v-else>
            {{ actionModalButtonText }}
          </span>
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'FinancialPeriods',
  data() {
    return {
      // Modal
      showModal: false,
      isEditing: false,
      saving: false,

      // Action Modal
      showActionModal: false,
      selectedAction: '',
      selectedPeriodId: null,
      executing: false,
      closingDate: '',
      closingNotes: '',
      openingNotes: '',

      // Form
      periodForm: {
        name: '',
        period_type: '',
        start_date: '',
        end_date: '',
        opening_balance: '',
        description: '',
        status: 'DRAFT',
        auto_close: false,
      },

      // Options
      periodTypeOptions: [
        { value: '', text: 'Select Period Type' },
        { value: 'MONTHLY', text: 'Monthly' },
        { value: 'QUARTERLY', text: 'Quarterly' },
        { value: 'YEARLY', text: 'Yearly' },
        { value: 'CUSTOM', text: 'Custom' },
      ],
      statusOptions: [
        { value: 'DRAFT', text: 'Draft' },
        { value: 'OPEN', text: 'Open' },
        { value: 'CLOSED', text: 'Closed' },
        { value: 'SUSPENDED', text: 'Suspended' },
      ],
    };
  },
  computed: {
    financialPeriods() {
      return this.$store.getters['accounting/getFinancialPeriods'] || [];
    },
    summaryData() {
      return this.$store.getters['accounting/getFinancialPeriodsSummary'] || {};
    },
    currentPeriod() {
      return this.financialPeriods.find((p) => p.is_current);
    },
    actionModalTitle() {
      const titles = {
        open: 'Open Financial Period',
        close: 'Close Financial Period',
      };
      return titles[this.selectedAction] || 'Period Action';
    },
    actionModalMessage() {
      const messages = {
        open: 'You are about to open this financial period. This will make it the current active period.',
        close: 'You are about to close this financial period. This action cannot be undone.',
      };
      return messages[this.selectedAction] || '';
    },
    actionModalVariant() {
      const variants = {
        open: 'success',
        close: 'warning',
      };
      return variants[this.selectedAction] || 'primary';
    },
    actionModalButtonText() {
      const texts = {
        open: 'Open Period',
        close: 'Close Period',
      };
      return texts[this.selectedAction] || 'Execute';
    },
  },
  async mounted() {
    await this.loadFinancialPeriods();
  },
  methods: {
    async loadFinancialPeriods() {
      try {
        await this.$store.dispatch('accounting/fetchFinancialPeriods');
      } catch (error) {
        console.error('Failed to load financial periods:', error);
      }
    },

    // Modal actions
    showCreateModal() {
      this.isEditing = false;
      this.showModal = true;
    },

    editPeriod(id) {
      const period = this.financialPeriods.find((p) => p.id === id);
      if (period) {
        // Map server fields to form fields
        this.periodForm = {
          id: period.id,
          name: period.name,
          period_type: period.period_type || '',
          start_date: period.start_date
            ? new Date(period.start_date).toISOString().split('T')[0]
            : '',
          end_date: period.end_date ? new Date(period.end_date).toISOString().split('T')[0] : '',
          opening_balance: period.balance || '',
          description: period.notes || '',
          status: period.status,
          auto_close: period.auto_close || false,
        };
        this.isEditing = true;
        this.showModal = true;
      }
    },

    async savePeriod() {
      try {
        this.saving = true;
        // Map form fields to server expectations
        const periodData = {
          name: this.periodForm.name,
          period_type: this.periodForm.period_type,
          start_date: this.periodForm.start_date,
          end_date: this.periodForm.end_date,
          opening_balance: parseFloat(this.periodForm.opening_balance) || 0,
          description: this.periodForm.description,
          status: this.periodForm.status,
          auto_close: this.periodForm.auto_close,
        };

        if (this.isEditing) {
          await this.$store.dispatch('accounting/updateFinancialPeriod', {
            id: this.periodForm.id,
            data: periodData,
          });
        } else {
          await this.$store.dispatch('accounting/createFinancialPeriod', periodData);
        }

        // Only close modal on success
        this.showModal = false;
        this.resetForm();
        await this.loadFinancialPeriods();
        this.$bvToast.toast(
          `Financial period ${this.isEditing ? 'updated' : 'created'} successfully`,
          {
            title: 'Success',
            variant: 'success',
            solid: true,
          }
        );
      } catch (error) {
        console.error('Failed to save financial period:', error);
        this.$bvToast.toast('Failed to save financial period', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
        // Modal stays open on error - user can fix and retry
      } finally {
        this.saving = false;
      }
    },

    resetForm() {
      this.periodForm = {
        name: '',
        period_type: '',
        start_date: '',
        end_date: '',
        opening_balance: '',
        description: '',
        status: 'DRAFT',
        auto_close: false,
      };
      this.isEditing = false;
    },

    // Period actions
    openPeriod(id) {
      this.selectedAction = 'open';
      this.selectedPeriodId = id;
      this.openingNotes = '';
      this.showActionModal = true;
    },

    closePeriod(id) {
      this.selectedAction = 'close';
      this.selectedPeriodId = id;
      this.closingDate = new Date().toISOString().split('T')[0];
      this.closingNotes = '';
      this.showActionModal = true;
    },

    async executePeriodAction() {
      try {
        this.executing = true;

        if (this.selectedAction === 'open') {
          await this.$store.dispatch('accounting/openFinancialPeriod', {
            id: this.selectedPeriodId,
            notes: this.openingNotes,
          });
        } else if (this.selectedAction === 'close') {
          await this.$store.dispatch('accounting/closeFinancialPeriod', {
            id: this.selectedPeriodId,
            closing_date: this.closingDate,
            notes: this.closingNotes,
          });
        }

        this.showActionModal = false;
        this.resetActionModal();
        await this.loadFinancialPeriods();

        this.$bvToast.toast(
          `Period ${this.selectedAction === 'open' ? 'opened' : 'closed'} successfully`,
          {
            title: 'Success',
            variant: 'success',
            solid: true,
          }
        );
      } catch (error) {
        console.error(`Failed to ${this.selectedAction} period:`, error);
        this.$bvToast.toast(`Failed to ${this.selectedAction} period`, {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.executing = false;
      }
    },

    resetActionModal() {
      this.selectedAction = '';
      this.selectedPeriodId = null;
      this.closingDate = '';
      this.closingNotes = '';
      this.openingNotes = '';
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

    getPeriodRowClass(period) {
      return {
        'period-current': period.is_current,
        'period-open': period.status === 'OPEN' && !period.is_current,
        'period-closed': period.status === 'CLOSED',
        'period-draft': period.status === 'DRAFT',
      };
    },

    getStatusVariant(status) {
      const variants = {
        DRAFT: 'secondary',
        OPEN: 'success',
        CLOSED: 'danger',
        SUSPENDED: 'warning',
      };
      return variants[status] || 'secondary';
    },

    // Action methods
    viewPeriod(id) {
      this.$bvToast.toast(`View functionality coming soon ${id}`, {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },

    async deletePeriod(id) {
      try {
        await this.$bvModal.msgBoxConfirm(
          'Are you sure you want to delete this financial period?',
          {
            title: 'Confirm Deletion',
            size: 'sm',
            buttonSize: 'sm',
            okVariant: 'danger',
            okTitle: 'Delete',
            cancelTitle: 'Cancel',
            footerClass: 'p-2',
            hideHeaderClose: false,
            centered: true,
          }
        );

        await this.$store.dispatch('accounting/deleteFinancialPeriod', id);
        await this.loadFinancialPeriods();
        this.$bvToast.toast('Financial period deleted successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to delete financial period:', error);
          this.$bvToast.toast('Failed to delete financial period', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        }
      }
    },
  },
};
</script>

<style scoped>
.financial-periods {
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

.periods-section {
  margin-bottom: 2rem;
}

.current-badge {
  margin-top: 0.25rem;
}

/* Period row classes */
.period-current {
  background-color: #d4edda;
  border-left: 4px solid #28a745;
}

.period-open {
  background-color: #d1ecf1;
  border-left: 4px solid #17a2b8;
}

.period-closed {
  background-color: #f8d7da;
  border-left: 4px solid #dc3545;
  opacity: 0.8;
}

.period-draft {
  background-color: #e2e3e5;
  border-left: 4px solid #6c757d;
}

.action-modal-content {
  padding: 1rem 0;
}

.close-period-form,
.open-period-form {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .financial-periods {
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
}
</style>
