<template>
  <div class="request-approval-form">
    <!-- Form Header -->
    <div class="form-header mb-4">
      <h3 class="text-dark font-weight-bold mb-2">
        <i class="flaticon2-check text-success mr-2"></i>
        Approve Request
      </h3>
      <p class="text-muted mb-0">Review and approve the request for fulfillment</p>
    </div>

    <!-- Request Summary -->
    <div class="card card-custom mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="flaticon2-file text-primary mr-2"></i>
          Request Summary
        </h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label text-muted">Request Number</label>
            <div class="form-control-plaintext font-weight-bold">
              {{ request?.request_number }}
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label text-muted">Department</label>
            <div class="form-control-plaintext">
              {{ request?.requesting_department }}
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label text-muted">Priority</label>
            <div>
              <span :class="getPriorityBadgeClass(request?.priority)">
                {{ request?.priority }}
              </span>
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label text-muted">Total Cost</label>
            <div class="form-control-plaintext font-weight-bold text-success">
              ${{ formatCurrency(request?.total_cost) }}
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label text-muted">Items Count</label>
            <div class="form-control-plaintext">{{ request?.items?.length || 0 }} items</div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label text-muted">Required Date</label>
            <div class="form-control-plaintext">
              {{ formatDate(request?.required_date) }}
            </div>
          </div>

          <div class="col-12 mb-3">
            <label class="form-label text-muted">Request Notes</label>
            <div class="form-control-plaintext">
              {{ request?.notes || 'No additional notes provided' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Items Review -->
    <div class="card card-custom mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="flaticon2-box text-primary mr-2"></i>
          Items Review
          <span class="badge badge-primary ml-2">{{ request?.items?.length || 0 }}</span>
        </h5>
      </div>
      <div class="card-body">
        <div v-if="!request?.items || request.items.length === 0" class="text-center py-4">
          <i class="flaticon2-box text-muted icon-2x mb-2"></i>
          <p class="text-muted mb-0">No items in this request</p>
        </div>
        <div v-else>
          <div v-for="(item, index) in request.items" :key="index" class="item-review mb-4">
            <div class="card card-custom">
              <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">Item {{ index + 1 }}</h6>
                  <div class="item-status">
                    <span class="badge badge-light-info">{{
                      item.item?.category?.name || 'No Category'
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">Item Name</label>
                    <div class="form-control-plaintext font-weight-bold">
                      {{ item.item?.name || 'Unknown Item' }}
                    </div>
                    <small class="text-muted">{{ item.item?.item_code || 'No code' }}</small>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">Quantity Requested</label>
                    <div class="form-control-plaintext">
                      {{ item.quantity_requested }}
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">Current Stock</label>
                    <div class="form-control-plaintext">
                      <span
                        :class="getStockClass(item.item?.current_stock, item.item?.minimum_stock)"
                      >
                        {{ item.item?.current_stock || 0 }}
                      </span>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">Unit Cost</label>
                    <div class="form-control-plaintext">${{ formatCurrency(item.unit_cost) }}</div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">Total Cost</label>
                    <div class="form-control-plaintext font-weight-bold text-success">
                      ${{ formatCurrency(item.total_cost) }}
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">Stock Availability</label>
                    <div class="form-control-plaintext">
                      <span
                        :class="
                          getAvailabilityClass(item.item?.current_stock, item.quantity_requested)
                        "
                      >
                        {{ getAvailabilityText(item.item?.current_stock, item.quantity_requested) }}
                      </span>
                    </div>
                  </div>

                  <div class="col-12 mb-3">
                    <label class="form-label text-muted">Item Notes</label>
                    <div class="form-control-plaintext">
                      {{ item.notes || 'No specific notes for this item' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Approval Form -->
    <div class="card card-custom mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="flaticon2-check text-success mr-2"></i>
          Approval Details
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit" class="approval-form">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label required">Approval Decision</label>
              <select
                v-model="form.approval_decision"
                class="form-control"
                :class="{ 'is-invalid': errors.approval_decision }"
                required
              >
                <option value="">Select Decision</option>
                <option value="APPROVED">Approve Request</option>
                <option value="APPROVED_WITH_CONDITIONS">Approve with Conditions</option>
                <option value="APPROVED_PARTIAL">Approve Partial Items</option>
                <option value="REQUIRES_ADDITIONAL_INFO">Requires Additional Information</option>
              </select>
              <div v-if="errors.approval_decision" class="invalid-feedback d-block">
                {{ errors.approval_decision }}
              </div>
              <small class="form-text text-muted"> Choose the appropriate approval action </small>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Approval Date</label>
              <input
                v-model="form.approval_date"
                type="datetime-local"
                class="form-control"
                :class="{ 'is-invalid': errors.approval_date }"
                :max="currentDateTime"
              />
              <div v-if="errors.approval_date" class="invalid-feedback d-block">
                {{ errors.approval_date }}
              </div>
              <small class="form-text text-muted">
                When the approval was made (defaults to now)
              </small>
            </div>

            <div class="col-12 mb-3">
              <label class="form-label">Approval Notes</label>
              <textarea
                v-model="form.approval_notes"
                class="form-control"
                :class="{ 'is-invalid': errors.approval_notes }"
                rows="3"
              ></textarea>
              <div v-if="errors.approval_notes" class="invalid-feedback d-block">
                {{ errors.approval_notes }}
              </div>
              <small class="form-text text-muted">
                Provide context for the approval decision
              </small>
            </div>

            <div class="col-12 mb-3">
              <label class="form-label">Special Instructions</label>
              <textarea
                v-model="form.special_instructions"
                class="form-control"
                :class="{ 'is-invalid': errors.special_instructions }"
                rows="2"
              ></textarea>
              <div v-if="errors.special_instructions" class="invalid-feedback d-block">
                {{ errors.special_instructions }}
              </div>
              <small class="form-text text-muted">
                Instructions for store staff during fulfillment
              </small>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Approval Summary -->
    <div class="card card-custom mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="flaticon2-eye text-success mr-2"></i>
          Approval Summary
        </h5>
      </div>
      <div class="card-body">
        <div class="approval-summary text-center">
          <div class="summary-icon mb-3">
            <div class="icon-circle icon-circle-success">
              <i class="flaticon2-check icon-2x"></i>
            </div>
          </div>

          <h6 class="font-weight-bold text-dark mb-2">{{ getApprovalTitle() }}</h6>
          <p class="text-muted mb-3">
            {{ getApprovalDescription() }}
          </p>

          <div class="summary-details">
            <div class="summary-item d-flex justify-content-between mb-2">
              <span class="text-muted">Decision:</span>
              <span class="font-weight-bold text-success">{{
                form.approval_decision || 'Not selected'
              }}</span>
            </div>

            <div class="summary-item d-flex justify-content-between mb-2">
              <span class="text-muted">Approval Date:</span>
              <span class="font-weight-bold">{{
                formatDate(form.approval_date) || 'Not set'
              }}</span>
            </div>

            <div class="summary-item d-flex justify-content-between mb-2">
              <span class="text-muted">Total Items:</span>
              <span class="font-weight-bold text-primary">{{ request?.items?.length || 0 }}</span>
            </div>

            <div class="summary-item d-flex justify-content-between mb-3">
              <span class="text-muted">Total Value:</span>
              <span class="font-weight-bold text-success"
                >${{ formatCurrency(request?.total_cost) }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="form-actions">
      <div class="card card-custom">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div class="form-status">
              <span v-if="loading" class="text-info">
                <i class="flaticon2-refresh fa-spin mr-1"></i>
                Processing approval...
              </span>
              <span v-else-if="success" class="text-success">
                <i class="flaticon2-check mr-1"></i>
                Request approved successfully!
              </span>
            </div>

            <div class="action-buttons">
              <button type="button" @click="$emit('cancel')" class="btn btn-light btn-lg mr-3">
                <i class="flaticon2-close mr-2"></i>
                Cancel
              </button>
              <button
                type="submit"
                @click="handleSubmit"
                class="btn btn-success btn-lg"
                :disabled="loading"
              >
                <i class="flaticon2-check mr-2"></i>
                {{ loading ? 'Processing...' : 'Approve Request' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-success" role="status">
        <span class="sr-only">Processing approval...</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RequestApprovalForm',
  props: {
    request: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      success: false,
      errors: {},
      form: {
        approval_decision: '',
        approval_date: '',
        approval_notes: '',
        special_instructions: '',
      },
    };
  },
  computed: {
    currentDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },
  },
  created() {
    this.initializeForm();
  },
  methods: {
    initializeForm() {
      // Set default values
      this.form.approval_date = this.currentDateTime;
      this.form.approval_decision = 'APPROVED'; // Default to approved
    },

    getPriorityBadgeClass(priority) {
      const classes = {
        LOW: 'badge badge-light-secondary',
        MEDIUM: 'badge badge-light-info',
        HIGH: 'badge badge-light-warning',
        URGENT: 'badge badge-light-danger',
      };
      return classes[priority] || 'badge badge-light-secondary';
    },

    getStockClass(currentStock, minimumStock) {
      if (!currentStock || currentStock === 0) return 'text-danger';
      if (currentStock <= minimumStock) return 'text-warning';
      return 'text-success';
    },

    getAvailabilityClass(currentStock, requestedQuantity) {
      if (!currentStock || currentStock === 0) return 'text-danger';
      if (currentStock < requestedQuantity) return 'text-warning';
      return 'text-success';
    },

    getAvailabilityText(currentStock, requestedQuantity) {
      if (!currentStock || currentStock === 0) return 'Out of Stock';
      if (currentStock < requestedQuantity) return 'Partial Stock';
      return 'In Stock';
    },

    getApprovalTitle() {
      if (!this.form.approval_decision) return 'Select Approval Decision';

      const titles = {
        APPROVED: 'Request Approved',
        APPROVED_WITH_CONDITIONS: 'Approved with Conditions',
        APPROVED_PARTIAL: 'Partially Approved',
        REQUIRES_ADDITIONAL_INFO: 'Requires Additional Information',
      };
      return titles[this.form.approval_decision];
    },

    getApprovalDescription() {
      if (!this.form.approval_decision) return 'Choose an approval decision to see description';

      const descriptions = {
        APPROVED: 'Request is fully approved and ready for fulfillment',
        APPROVED_WITH_CONDITIONS: 'Request approved but with specific conditions',
        APPROVED_PARTIAL: 'Some items approved, others require review',
        REQUIRES_ADDITIONAL_INFO: 'Request needs more information before approval',
      };
      return descriptions[this.form.approval_decision];
    },

    formatCurrency(amount) {
      return parseFloat(amount || 0).toFixed(2);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    validateForm() {
      this.errors = {};

      if (!this.form.approval_decision) {
        this.errors.approval_decision = 'Approval decision is required';
      }

      if (this.form.approval_date && new Date(this.form.approval_date) > new Date()) {
        this.errors.approval_date = 'Approval date cannot be in the future';
      }

      return Object.keys(this.errors).length === 0;
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return;
      }

      this.loading = true;
      this.success = false;

      try {
        const approvalData = {
          request_id: this.request.id,
          approval_decision: this.form.approval_decision,
          approval_notes: this.form.approval_notes,
          special_instructions: this.form.special_instructions,
          approval_date: this.form.approval_date,
        };

        // Remove empty optional fields
        Object.keys(approvalData).forEach((key) => {
          if (approvalData[key] === '' || approvalData[key] === null) {
            delete approvalData[key];
          }
        });

        await this.$store.dispatch('generalStore/approveRequest', approvalData);

        this.success = true;
        this.$emit('request-approved');

        // Reset form after successful approval
        setTimeout(() => {
          this.resetForm();
        }, 2000);
      } catch (error) {
        console.error('Error approving request:', error);
        this.$toast.error('Failed to approve request. Please try again.');
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.form = {
        approval_decision: 'APPROVED',
        approval_date: this.currentDateTime,
        approval_notes: '',
        special_instructions: '',
      };
      this.errors = {};
      this.success = false;
    },
  },
};
</script>

<style scoped>
.request-approval-form {
  position: relative;
}

.form-header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border-radius: 0.5rem;
}

.form-label.required::after {
  content: ' *';
  color: #dc3545;
}

.card-custom {
  border: 1px solid #e0f7fa;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card-custom:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e0f7fa;
}

.card-title {
  color: #495057;
  font-weight: 600;
}

.form-control:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.form-control-plaintext {
  padding: 0.375rem 0;
  margin-bottom: 0;
  color: #495057;
  background-color: transparent;
  border: solid transparent;
  border-width: 1px 0;
}

.item-review .card {
  border: 1px solid #e0f7fa;
  transition: all 0.3s ease;
}

.item-review .card:hover {
  border-color: #28a745;
  box-shadow: 0 2px 10px rgba(40, 167, 69, 0.1);
}

.approval-summary {
  padding: 1rem 0;
}

.summary-icon .icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
}

.icon-circle-success {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.summary-icon .icon-circle i {
  font-size: 2rem;
}

.summary-details .summary-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.summary-details .summary-item:last-child {
  border-bottom: none;
}

.form-actions {
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 100;
}

.form-status {
  font-weight: 500;
}

.action-buttons .btn {
  min-width: 120px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-header {
    padding: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .btn {
    margin-bottom: 0.5rem;
    width: 100%;
  }

  .form-actions .card-body {
    padding: 1rem;
  }
}
</style>
