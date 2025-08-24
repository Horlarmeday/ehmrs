<template>
  <div class="request-rejection-form">
    <!-- Form Header -->
    <div class="form-header mb-4">
      <h3 class="text-dark font-weight-bold mb-2">
        <i class="flaticon2-close text-danger mr-2"></i>
        Reject Request
      </h3>
      <p class="text-muted mb-0">
        Review and provide rejection reason for the request
      </p>
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

    <!-- Rejection Form -->
    <div class="card card-custom mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="flaticon2-close text-danger mr-2"></i>
          Rejection Details
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit" class="rejection-form">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label required">Rejection Reason</label>
              <select
                v-model="form.rejection_reason"
                class="form-control"
                :class="{ 'is-invalid': errors.rejection_reason }"
                @change="handleRejectionReasonChange"
                required
              >
                <option value="">Select Rejection Reason</option>
                <option value="INSUFFICIENT_BUDGET">Insufficient Budget</option>
                <option value="ITEM_NOT_AVAILABLE">Item Not Available</option>
                <option value="INVALID_REQUEST">Invalid Request</option>
                <option value="DUPLICATE_REQUEST">Duplicate Request</option>
                <option value="INSUFFICIENT_JUSTIFICATION">Insufficient Justification</option>
                <option value="POLICY_VIOLATION">Policy Violation</option>
                <option value="TIMING_ISSUE">Timing Issue</option>
                <option value="OTHER">Other Reason</option>
              </select>
              <div v-if="errors.rejection_reason" class="invalid-feedback d-block">
                {{ errors.rejection_reason }}
              </div>
              <small class="form-text text-muted">
                Choose the primary reason for rejection
              </small>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Rejection Date</label>
              <input
                v-model="form.rejection_date"
                type="datetime-local"
                class="form-control"
                :class="{ 'is-invalid': errors.rejection_date }"
                :max="currentDateTime"
              />
              <div v-if="errors.rejection_date" class="invalid-feedback d-block">
                {{ errors.rejection_date }}
              </div>
              <small class="form-text text-muted">
                When the rejection was made (defaults to now)
              </small>
            </div>

            <div class="col-12 mb-3">
              <label class="form-label required">Detailed Rejection Reason</label>
              <textarea
                v-model="form.detailed_reason"
                class="form-control"
                :class="{ 'is-invalid': errors.detailed_reason }"
                rows="3"
                placeholder="Provide detailed explanation for the rejection..."
                required
              ></textarea>
              <div v-if="errors.detailed_reason" class="invalid-feedback d-block">
                {{ errors.detailed_reason }}
              </div>
              <small class="form-text text-muted">
                Explain why the request was rejected
              </small>
            </div>

            <div class="col-12 mb-3">
              <label class="form-label">Suggestions for Resubmission</label>
              <textarea
                v-model="form.suggestions"
                class="form-control"
                :class="{ 'is-invalid': errors.suggestions }"
                rows="2"
                placeholder="Suggestions for improving the request..."
              ></textarea>
              <div v-if="errors.suggestions" class="invalid-feedback d-block">
                {{ errors.suggestions }}
              </div>
              <small class="form-text text-muted">
                Helpful suggestions for future requests
              </small>
            </div>

            <div class="col-12 mb-3">
              <label class="form-label">Alternative Solutions</label>
              <textarea
                v-model="form.alternative_solutions"
                class="form-control"
                :class="{ 'is-invalid': errors.alternative_solutions }"
                rows="2"
                placeholder="Alternative solutions or workarounds..."
              ></textarea>
              <div v-if="errors.alternative_solutions" class="invalid-feedback d-block">
                {{ errors.alternative_solutions }}
              </div>
              <small class="form-text text-muted">
                Suggest alternative approaches or solutions
              </small>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Rejection Summary -->
    <div class="card card-custom mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="flaticon2-eye text-danger mr-2"></i>
          Rejection Summary
        </h5>
      </div>
      <div class="card-body">
        <div class="rejection-summary text-center">
          <div class="summary-icon mb-3">
            <div class="icon-circle icon-circle-danger">
              <i class="flaticon2-close icon-2x"></i>
            </div>
          </div>

          <h6 class="font-weight-bold text-dark mb-2">{{ getRejectionTitle() }}</h6>
          <p class="text-muted mb-3">
            {{ getRejectionDescription() }}
          </p>

          <div class="summary-details">
            <div class="summary-item d-flex justify-content-between mb-2">
              <span class="text-muted">Reason:</span>
              <span class="font-weight-bold text-danger">{{
                form.rejection_reason || 'Not selected'
              }}</span>
            </div>

            <div class="summary-item d-flex justify-content-between mb-2">
              <span class="text-muted">Rejection Date:</span>
              <span class="font-weight-bold">{{
                formatDate(form.rejection_date) || 'Not set'
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
                Processing rejection...
              </span>
              <span v-else-if="success" class="text-success">
                <i class="flaticon2-check mr-1"></i>
                Request rejected successfully!
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
                class="btn btn-danger btn-lg"
                :disabled="loading"
              >
                <i class="flaticon2-close mr-2"></i>
                {{ loading ? 'Processing...' : 'Reject Request' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-danger" role="status">
        <span class="sr-only">Processing rejection...</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RequestRejectionForm',
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
        rejection_reason: '',
        rejection_date: '',
        detailed_reason: '',
        suggestions: '',
        alternative_solutions: '',
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
      this.form.rejection_date = this.currentDateTime;
    },

    handleRejectionReasonChange() {
      // Auto-populate detailed reason based on selection
      const reasons = {
        INSUFFICIENT_BUDGET:
          'Request rejected due to insufficient budget allocation. The requested items exceed the available budget for this period.',
        ITEM_NOT_AVAILABLE:
          'One or more requested items are not currently available in stock or have been discontinued.',
        INVALID_REQUEST:
          'Request contains invalid information or does not meet the required format and standards.',
        DUPLICATE_REQUEST:
          'This request duplicates a previous request that is already being processed.',
        INSUFFICIENT_JUSTIFICATION:
          'The request lacks sufficient justification for the items requested. Please provide more detailed reasoning.',
        POLICY_VIOLATION:
          'Request violates established policies or procedures. Please review the guidelines before resubmitting.',
        TIMING_ISSUE:
          'Request timing is not appropriate. Consider submitting at a different time or adjusting the required date.',
        OTHER:
          'Request rejected for other reasons. Please contact the store manager for more information.',
      };

      if (this.form.rejection_reason && reasons[this.form.rejection_reason]) {
        this.form.detailed_reason = reasons[this.form.rejection_reason];
      }
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

    getRejectionTitle() {
      if (!this.form.rejection_reason) return 'Select Rejection Reason';

      const titles = {
        INSUFFICIENT_BUDGET: 'Budget Insufficient',
        ITEM_NOT_AVAILABLE: 'Items Not Available',
        INVALID_REQUEST: 'Invalid Request',
        DUPLICATE_REQUEST: 'Duplicate Request',
        INSUFFICIENT_JUSTIFICATION: 'Insufficient Justification',
        POLICY_VIOLATION: 'Policy Violation',
        TIMING_ISSUE: 'Timing Issue',
        OTHER: 'Other Reason',
      };
      return titles[this.form.rejection_reason];
    },

    getRejectionDescription() {
      if (!this.form.rejection_reason) return 'Choose a rejection reason to see description';

      const descriptions = {
        INSUFFICIENT_BUDGET: 'Request exceeds available budget allocation',
        ITEM_NOT_AVAILABLE: 'Requested items are not in stock or discontinued',
        INVALID_REQUEST: 'Request format or information is invalid',
        DUPLICATE_REQUEST: 'Request duplicates an existing request',
        INSUFFICIENT_JUSTIFICATION: 'Request lacks proper justification',
        POLICY_VIOLATION: 'Request violates established policies',
        TIMING_ISSUE: 'Request timing is inappropriate',
        OTHER: 'Request rejected for other reasons',
      };
      return descriptions[this.form.rejection_reason];
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

      if (!this.form.rejection_reason) {
        this.errors.rejection_reason = 'Rejection reason is required';
      }

      if (!this.form.detailed_reason) {
        this.errors.detailed_reason = 'Detailed rejection reason is required';
      }

      if (this.form.rejection_date && new Date(this.form.rejection_date) > new Date()) {
        this.errors.rejection_date = 'Rejection date cannot be in the future';
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
        const rejectionData = {
          request_id: this.request.id,
          rejection_reason: this.form.rejection_reason,
          detailed_reason: this.form.detailed_reason,
          suggestions: this.form.suggestions,
          alternative_solutions: this.form.alternative_solutions,
          rejection_date: this.form.rejection_date,
        };

        // Remove empty optional fields
        Object.keys(rejectionData).forEach(key => {
          if (rejectionData[key] === '' || rejectionData[key] === null) {
            delete rejectionData[key];
          }
        });

        await this.$store.dispatch('generalStore/rejectRequest', rejectionData);

        this.success = true;
        this.$emit('request-rejected');

        // Reset form after successful rejection
        setTimeout(() => {
          this.resetForm();
        }, 2000);
      } catch (error) {
        console.error('Error rejecting request:', error);
        this.$toast.error('Failed to reject request. Please try again.');
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.form = {
        rejection_reason: '',
        rejection_date: this.currentDateTime,
        detailed_reason: '',
        suggestions: '',
        alternative_solutions: '',
      };
      this.errors = {};
      this.success = false;
    },
  },
};
</script>

<style scoped>
.request-rejection-form {
  position: relative;
}

.form-header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  border-radius: 0.5rem;
}

.form-label.required::after {
  content: ' *';
  color: #dc3545;
}

.card-custom {
  border: 1px solid #e1f0ff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card-custom:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e1f0ff;
}

.card-title {
  color: #495057;
  font-weight: 600;
}

.form-control:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
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
  border: 1px solid #e1f0ff;
  transition: all 0.3s ease;
}

.item-review .card:hover {
  border-color: #dc3545;
  box-shadow: 0 2px 10px rgba(220, 53, 69, 0.1);
}

.rejection-summary {
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

.icon-circle-danger {
  background: linear-gradient(135deg, #dc3545, #e83e8c);
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
