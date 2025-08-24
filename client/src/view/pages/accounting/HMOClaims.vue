<template>
  <div class="hmo-claims">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-file-medical text-info mr-3"></i>
          HMO Claims
        </h1>
        <p class="page-subtitle">
          Manage HMO claims processing, tracking, and reimbursement workflows
        </p>
      </div>
      <div class="header-actions">
        <b-button variant="outline-primary" @click="exportClaims">
          <i class="fas fa-download mr-2"></i>Export
        </b-button>
        <b-button variant="info" @click="showCreateModal">
          <i class="fas fa-plus mr-2"></i>New Claim
        </b-button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section">
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-info text-white">
            <div class="summary-icon">
              <i class="fas fa-file-medical"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData.totalClaims || 0 }}</h3>
              <p class="summary-label">Total Claims</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-warning text-white">
            <div class="summary-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData.pendingClaims || 0 }}</h3>
              <p class="summary-label">Pending Claims</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-success text-white">
            <div class="summary-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData.approvedClaims || 0 }}</h3>
              <p class="summary-label">Approved Claims</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-primary text-white">
            <div class="summary-icon">
              <i class="fas fa-coins"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ formatCurrency(summaryData.totalAmount || 0) }}</h3>
              <p class="summary-label">Total Amount</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <b-form-group label="HMO" label-for="hmo-select">
                <b-form-select
                  id="hmo-select"
                  v-model="filters.hmo"
                  :options="hmoOptions"
                  @change="loadClaims"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Status" label-for="status-select">
                <b-form-select
                  id="status-select"
                  v-model="filters.status"
                  :options="statusOptions"
                  @change="loadClaims"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Date Range" label-for="date-range">
                <b-form-select
                  id="date-range"
                  v-model="filters.dateRange"
                  :options="dateRangeOptions"
                  @change="loadClaims"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Amount Range" label-for="amount-range">
                <b-form-select
                  id="amount-range"
                  v-model="filters.amountRange"
                  :options="amountRangeOptions"
                  @change="loadClaims"
                ></b-form-select>
              </b-form-group>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-md-6">
              <b-form-group label="Search" label-for="search-input">
                <b-form-input
                  id="search-input"
                  v-model="filters.search"
                  placeholder="Search claims, patients, or HMO numbers..."
                  @input="debounceSearch"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <div class="d-flex gap-2 mt-4">
                <b-button variant="outline-secondary" @click="clearFilters">
                  Clear Filters
                </b-button>
                <b-button variant="primary" @click="loadClaims">
                  <i class="fas fa-search mr-2"></i>Apply Filters
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- HMO Claims Table -->
    <div class="claims-section">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-table mr-2"></i>
            HMO Claims Management
          </h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="thead-light">
                <tr>
                  <th>Claim Number</th>
                  <th>Patient</th>
                  <th>HMO</th>
                  <th>Bill Amount</th>
                  <th>Claim Amount</th>
                  <th>Status</th>
                  <th>Submitted Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="claim in hmoClaims" :key="claim.id" :class="getClaimRowClass(claim)">
                  <td>
                    <strong>{{ claim.claim_number }}</strong>
                    <div v-if="claim.is_urgent" class="urgent-badge">
                      <b-badge variant="danger">Urgent</b-badge>
                    </div>
                  </td>
                  <td>
                    <div class="patient-info">
                      <div class="patient-name">{{ claim.patient?.name || 'N/A' }}</div>
                      <div class="patient-id">ID: {{ claim.patient?.id || 'N/A' }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="hmo-info">
                      <div class="hmo-name">{{ claim.hmo?.name || 'N/A' }}</div>
                      <div class="hmo-number">{{ claim.hmo_number }}</div>
                    </div>
                  </td>
                  <td>{{ formatCurrency(claim.bill_amount) }}</td>
                  <td>{{ formatCurrency(claim.claim_amount) }}</td>
                  <td>
                    <b-badge :variant="getStatusVariant(claim.status)">
                      {{ claim.status }}
                    </b-badge>
                  </td>
                  <td>{{ formatDate(claim.submitted_date) }}</td>
                  <td>
                    <div class="btn-group" role="group">
                      <b-button variant="outline-info" size="sm" @click="viewClaim(claim.id)">
                        <i class="fas fa-eye"></i>
                      </b-button>
                      <b-button
                        v-if="claim.status === 'PENDING'"
                        variant="outline-success"
                        size="sm"
                        @click="approveClaim(claim.id)"
                      >
                        <i class="fas fa-check"></i>
                      </b-button>
                      <b-button
                        v-if="claim.status === 'PENDING'"
                        variant="outline-danger"
                        size="sm"
                        @click="rejectClaim(claim.id)"
                      >
                        <i class="fas fa-times"></i>
                      </b-button>
                      <b-button
                        v-if="claim.status === 'APPROVED'"
                        variant="outline-primary"
                        size="sm"
                        @click="processPayment(claim.id)"
                      >
                        <i class="fas fa-money-bill"></i>
                      </b-button>
                      <b-button
                        v-if="claim.status === 'DRAFT'"
                        variant="outline-warning"
                        size="sm"
                        @click="editClaim(claim.id)"
                      >
                        <i class="fas fa-edit"></i>
                      </b-button>
                      <b-button
                        v-if="claim.status === 'DRAFT'"
                        variant="outline-danger"
                        size="sm"
                        @click="deleteClaim(claim.id)"
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
      :title="isEditing ? 'Edit HMO Claim' : 'Create HMO Claim'"
      size="lg"
      @ok="saveClaim"
      @hidden="resetForm"
    >
      <b-form @submit.prevent="saveClaim">
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Patient" label-for="claim-patient" required>
              <b-form-select
                id="claim-patient"
                v-model="claimForm.patient_id"
                :options="patientOptions"
                required
              ></b-form-select>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="HMO" label-for="claim-hmo" required>
              <b-form-select
                id="claim-hmo"
                v-model="claimForm.hmo_id"
                :options="hmoOptions"
                required
              ></b-form-select>
            </b-form-group>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="HMO Number" label-for="claim-hmo-number" required>
              <b-form-input
                id="claim-hmo-number"
                v-model="claimForm.hmo_number"
                placeholder="Enter HMO number"
                required
              ></b-form-input>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Claim Number" label-for="claim-number">
              <b-form-input
                id="claim-number"
                v-model="claimForm.claim_number"
                placeholder="Auto-generated if empty"
              ></b-form-input>
            </b-form-group>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Bill Amount" label-for="claim-bill-amount" required>
              <b-form-input
                id="claim-bill-amount"
                v-model="claimForm.bill_amount"
                type="number"
                step="0.01"
                placeholder="Enter bill amount"
                required
              ></b-form-input>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Claim Amount" label-for="claim-amount" required>
              <b-form-input
                id="claim-amount"
                v-model="claimForm.claim_amount"
                type="number"
                step="0.01"
                placeholder="Enter claim amount"
                required
              ></b-form-input>
            </b-form-group>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Status" label-for="claim-status">
              <b-form-select
                id="claim-status"
                v-model="claimForm.status"
                :options="statusOptions"
                required
              ></b-form-select>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Urgent" label-for="claim-urgent">
              <b-form-checkbox id="claim-urgent" v-model="claimForm.is_urgent" switch>
                Mark as urgent
              </b-form-checkbox>
            </b-form-group>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <b-form-group label="Notes" label-for="claim-notes">
              <b-form-textarea
                id="claim-notes"
                v-model="claimForm.notes"
                placeholder="Enter claim notes..."
                rows="3"
              ></b-form-textarea>
            </b-form-group>
          </div>
        </div>
      </b-form>
      <template #modal-footer>
        <b-button variant="secondary" @click="showModal = false">
          Cancel
        </b-button>
        <b-button variant="primary" @click="saveClaim" :disabled="saving">
          <span v-if="saving"> <i class="fas fa-spinner fa-spin mr-2"></i>Saving... </span>
          <span v-else>
            {{ isEditing ? 'Update Claim' : 'Create Claim' }}
          </span>
        </b-button>
      </template>
    </b-modal>

    <!-- Action Modal -->
    <b-modal
      v-model="showActionModal"
      :title="actionModalTitle"
      size="md"
      @ok="executeClaimAction"
      @hidden="resetActionModal"
    >
      <div class="action-modal-content">
        <div class="alert alert-info">
          <i class="fas fa-info-circle mr-2"></i>
          {{ actionModalMessage }}
        </div>

        <div v-if="selectedAction === 'approve'" class="approve-claim-form">
          <b-form-group label="Approval Notes" label-for="approval-notes">
            <b-form-textarea
              id="approval-notes"
              v-model="actionNotes"
              placeholder="Enter approval notes..."
              rows="3"
            ></b-form-textarea>
          </b-form-group>
        </div>

        <div v-if="selectedAction === 'reject'" class="reject-claim-form">
          <b-form-group label="Rejection Reason" label-for="rejection-reason" required>
            <b-form-textarea
              id="rejection-reason"
              v-model="actionNotes"
              placeholder="Enter rejection reason..."
              rows="3"
              required
            ></b-form-textarea>
          </b-form-group>
        </div>

        <div v-if="selectedAction === 'payment'" class="payment-form">
          <b-form-group label="Payment Amount" label-for="payment-amount" required>
            <b-form-input
              id="payment-amount"
              v-model="paymentAmount"
              type="number"
              step="0.01"
              placeholder="Enter payment amount"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group label="Payment Notes" label-for="payment-notes">
            <b-form-textarea
              id="payment-notes"
              v-model="actionNotes"
              placeholder="Enter payment notes..."
              rows="3"
            ></b-form-textarea>
          </b-form-group>
        </div>
      </div>

      <template #modal-footer>
        <b-button variant="secondary" @click="showActionModal = false">
          Cancel
        </b-button>
        <b-button :variant="actionModalVariant" @click="executeClaimAction" :disabled="executing">
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
  name: 'HMOClaims',
  data() {
    return {
      // Filters
      filters: {
        hmo: '',
        status: '',
        dateRange: '',
        amountRange: '',
        search: '',
      },

      // Modal
      showModal: false,
      isEditing: false,
      saving: false,

      // Action Modal
      showActionModal: false,
      selectedAction: '',
      selectedClaimId: null,
      executing: false,
      actionNotes: '',
      paymentAmount: '',

      // Form
      claimForm: {
        patient_id: '',
        hmo_id: '',
        hmo_number: '',
        claim_number: '',
        bill_amount: '',
        claim_amount: '',
        status: 'DRAFT',
        is_urgent: false,
        notes: '',
      },

      // Options
      hmoOptions: [
        { value: '', text: 'All HMOs' },
        { value: '1', text: 'NHIS' },
        { value: '2', text: 'Hygeia HMO' },
        { value: '3', text: 'LASHMA' },
        { value: '4', text: 'Eko Health Plan' },
      ],
      statusOptions: [
        { value: '', text: 'All Statuses' },
        { value: 'DRAFT', text: 'Draft' },
        { value: 'PENDING', text: 'Pending' },
        { value: 'APPROVED', text: 'Approved' },
        { value: 'REJECTED', text: 'Rejected' },
        { value: 'PAID', text: 'Paid' },
      ],
      dateRangeOptions: [
        { value: '', text: 'All Dates' },
        { value: 'today', text: 'Today' },
        { value: 'week', text: 'This Week' },
        { value: 'month', text: 'This Month' },
        { value: 'quarter', text: 'This Quarter' },
        { value: 'year', text: 'This Year' },
      ],
      amountRangeOptions: [
        { value: '', text: 'All Amounts' },
        { value: 'low', text: 'Low (< ₦10,000)' },
        { value: 'medium', text: 'Medium (₦10,000 - ₦50,000)' },
        { value: 'high', text: 'High (> ₦50,000)' },
      ],
      patientOptions: [
        { value: '', text: 'Select Patient' },
        { value: '1', text: 'John Doe' },
        { value: '2', text: 'Jane Smith' },
        { value: '3', text: 'Bob Johnson' },
      ],
    };
  },
  computed: {
    hmoClaims() {
      return this.$store.getters['accounting/getHMOClaims'] || [];
    },
    summaryData() {
      return this.$store.getters['accounting/getHMOClaimsSummary'] || {};
    },
    actionModalTitle() {
      const titles = {
        approve: 'Approve HMO Claim',
        reject: 'Reject HMO Claim',
        payment: 'Process Payment',
      };
      return titles[this.selectedAction] || 'Claim Action';
    },
    actionModalMessage() {
      const messages = {
        approve: 'You are about to approve this HMO claim. This will move it to approved status.',
        reject: 'You are about to reject this HMO claim. Please provide a reason for rejection.',
        payment: 'You are about to process payment for this approved claim.',
      };
      return messages[this.selectedAction] || '';
    },
    actionModalVariant() {
      const variants = {
        approve: 'success',
        reject: 'danger',
        payment: 'primary',
      };
      return variants[this.selectedAction] || 'primary';
    },
    actionModalButtonText() {
      const texts = {
        approve: 'Approve Claim',
        reject: 'Reject Claim',
        payment: 'Process Payment',
      };
      return texts[this.selectedAction] || 'Execute';
    },
  },
  async mounted() {
    await this.loadClaims();
  },
  methods: {
    async loadClaims() {
      try {
        const params = {
          hmo: this.filters.hmo,
          status: this.filters.status,
          date_range: this.filters.dateRange,
          amount_range: this.filters.amountRange,
          search: this.filters.search,
        };
        await this.$store.dispatch('accounting/fetchHMOClaims', params);
      } catch (error) {
        console.error('Failed to load HMO claims:', error);
      }
    },

    // Modal actions
    showCreateModal() {
      this.isEditing = false;
      this.showModal = true;
    },

    editClaim(id) {
      const claim = this.hmoClaims.find(c => c.id === id);
      if (claim) {
        this.claimForm = { ...claim };
        this.isEditing = true;
        this.showModal = true;
      }
    },

    async saveClaim() {
      try {
        this.saving = true;
        if (this.isEditing) {
          await this.$store.dispatch('accounting/updateHMOClaim', {
            id: this.claimForm.id,
            data: this.claimForm,
          });
        } else {
          await this.$store.dispatch('accounting/createHMOClaim', this.claimForm);
        }

        this.showModal = false;
        this.resetForm();
        await this.loadClaims();
        this.$bvToast.toast(`HMO claim ${this.isEditing ? 'updated' : 'created'} successfully`, {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to save HMO claim:', error);
        this.$bvToast.toast('Failed to save HMO claim', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.saving = false;
      }
    },

    resetForm() {
      this.claimForm = {
        patient_id: '',
        hmo_id: '',
        hmo_number: '',
        claim_number: '',
        bill_amount: '',
        claim_amount: '',
        status: 'DRAFT',
        is_urgent: false,
        notes: '',
      };
      this.isEditing = false;
    },

    // Claim actions
    approveClaim(id) {
      this.selectedAction = 'approve';
      this.selectedClaimId = id;
      this.actionNotes = '';
      this.showActionModal = true;
    },

    rejectClaim(id) {
      this.selectedAction = 'reject';
      this.selectedClaimId = id;
      this.actionNotes = '';
      this.showActionModal = true;
    },

    processPayment(id) {
      this.selectedAction = 'payment';
      this.selectedClaimId = id;
      this.actionNotes = '';
      this.paymentAmount = '';
      this.showActionModal = true;
    },

    async executeClaimAction() {
      try {
        this.executing = true;

        if (this.selectedAction === 'approve') {
          await this.$store.dispatch('accounting/approveHMOClaim', {
            id: this.selectedClaimId,
            notes: this.actionNotes,
          });
        } else if (this.selectedAction === 'reject') {
          await this.$store.dispatch('accounting/rejectHMOClaim', {
            id: this.selectedClaimId,
            reason: this.actionNotes,
          });
        } else if (this.selectedAction === 'payment') {
          await this.$store.dispatch('accounting/processHMOClaimPayment', {
            id: this.selectedClaimId,
            amount: this.paymentAmount,
            notes: this.actionNotes,
          });
        }

        this.showActionModal = false;
        this.resetActionModal();
        await this.loadClaims();

        this.$bvToast.toast(`Claim ${this.selectedAction}ed successfully`, {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error(`Failed to ${this.selectedAction} claim:`, error);
        this.$bvToast.toast(`Failed to ${this.selectedAction} claim`, {
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
      this.selectedClaimId = null;
      this.actionNotes = '';
      this.paymentAmount = '';
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

    getClaimRowClass(claim) {
      return {
        'claim-urgent': claim.is_urgent,
        'claim-pending': claim.status === 'PENDING',
        'claim-approved': claim.status === 'APPROVED',
        'claim-rejected': claim.status === 'REJECTED',
        'claim-paid': claim.status === 'PAID',
      };
    },

    getStatusVariant(status) {
      const variants = {
        DRAFT: 'secondary',
        PENDING: 'warning',
        APPROVED: 'success',
        REJECTED: 'danger',
        PAID: 'info',
      };
      return variants[status] || 'secondary';
    },

    // Filter methods
    clearFilters() {
      this.filters = {
        hmo: '',
        status: '',
        dateRange: '',
        amountRange: '',
        search: '',
      };
      this.loadClaims();
    },

    debounceSearch: debounce(function() {
      this.loadClaims();
    }, 500),

    // Action methods
    viewClaim(id) {
      this.$bvToast.toast(`View functionality coming soon ${id}`, {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },

    async deleteClaim(id) {
      try {
        await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this HMO claim?', {
          title: 'Confirm Deletion',
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'Delete',
          cancelTitle: 'Cancel',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true,
        });

        await this.$store.dispatch('accounting/deleteHMOClaim', id);
        await this.loadClaims();
        this.$bvToast.toast('HMO claim deleted successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to delete HMO claim:', error);
          this.$bvToast.toast('Failed to delete HMO claim', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        }
      }
    },

    exportClaims() {
      this.$bvToast.toast('Export functionality coming soon', {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },
  },
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
</script>

<style scoped>
.hmo-claims {
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

.filters-section {
  margin-bottom: 2rem;
}

.claims-section {
  margin-bottom: 2rem;
}

.urgent-badge {
  margin-top: 0.25rem;
}

.patient-info,
.hmo-info {
  line-height: 1.2;
}

.patient-name,
.hmo-name {
  font-weight: 600;
  color: #2c3e50;
}

.patient-id,
.hmo-number {
  font-size: 0.875rem;
  color: #6c757d;
}

/* Claim row classes */
.claim-urgent {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
}

.claim-pending {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
}

.claim-approved {
  background-color: #d4edda;
  border-left: 4px solid #28a745;
}

.claim-rejected {
  background-color: #f8d7da;
  border-left: 4px solid #dc3545;
}

.claim-paid {
  background-color: #d1ecf1;
  border-left: 4px solid #17a2b8;
}

.action-modal-content {
  padding: 1rem 0;
}

.approve-claim-form,
.reject-claim-form,
.payment-form {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .hmo-claims {
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
