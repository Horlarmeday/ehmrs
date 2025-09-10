<template>
  <div class="request-fulfillment-form">
    <!-- Form Header -->
    <div class="form-header mb-4">
      <h3 class="text-dark font-weight-bold mb-2">
        <i class="flaticon2-box text-info mr-2"></i>
        Fulfill Request
      </h3>
      <p class="text-muted mb-0">
        Process and fulfill the approved request
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

    <!-- Fulfillment Items -->
    <div class="card card-custom mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="flaticon2-box text-primary mr-2"></i>
          Fulfillment Items
          <span class="badge badge-primary ml-2">{{ request?.items?.length || 0 }}</span>
        </h5>
      </div>
      <div class="card-body">
        <div v-if="!request?.items || request.items.length === 0" class="text-center py-4">
          <i class="flaticon2-box text-muted icon-2x mb-2"></i>
          <p class="text-muted mb-0">No items in this request</p>
        </div>
        <div v-else>
          <div v-for="(item, index) in request.items" :key="index" class="fulfillment-item mb-4">
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

    <!-- Fulfillment Form -->
    <div class="card card-custom mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="flaticon2-box text-info mr-2"></i>
          Fulfillment Details
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit" class="fulfillment-form">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label required">Fulfillment Type</label>
              <select
                v-model="form.fulfillment_type"
                class="form-control"
                :class="{ 'is-invalid': errors.fulfillment_type }"
                @change="handleFulfillmentTypeChange"
                required
              >
                <option value="">Select Fulfillment Type</option>
                <option value="FULL">Full Fulfillment</option>
                <option value="PARTIAL">Partial Fulfillment</option>
                <option value="SUBSTITUTE">Substitute Items</option>
                <option value="BACKORDER">Backorder</option>
              </select>
              <div v-if="errors.fulfillment_type" class="invalid-feedback d-block">
                {{ errors.fulfillment_type }}
              </div>
              <small class="form-text text-muted">
                Choose how to fulfill this request
              </small>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Fulfillment Date</label>
              <input
                v-model="form.fulfillment_date"
                type="datetime-local"
                class="form-control"
                :class="{ 'is-invalid': errors.fulfillment_date }"
                :max="currentDateTime"
              />
              <div v-if="errors.fulfillment_date" class="invalid-feedback d-block">
                {{ errors.fulfillment_date }}
              </div>
              <small class="form-text text-muted">
                When the fulfillment was completed (defaults to now)
              </small>
            </div>

            <div class="col-12 mb-3">
              <label class="form-label">Fulfillment Notes</label>
              <textarea
                v-model="form.fulfillment_notes"
                class="form-control"
                :class="{ 'is-invalid': errors.fulfillment_notes }"
                rows="3"
              ></textarea>
              <div v-if="errors.fulfillment_notes" class="invalid-feedback d-block">
                {{ errors.fulfillment_notes }}
              </div>
              <small class="form-text text-muted">
                Any notes about the fulfillment process
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
                Special delivery or pickup instructions
              </small>
            </div>

            <div class="col-12 mb-3">
              <label class="form-label">Delivery Method</label>
              <select
                v-model="form.delivery_method"
                class="form-control"
                :class="{ 'is-invalid': errors.delivery_method }"
              >
                <option value="">Select Delivery Method</option>
                <option value="PICKUP">Department Pickup</option>
                <option value="DELIVERY">Store Delivery</option>
                <option value="COURIER">Courier Service</option>
                <option value="INTERNAL">Internal Transfer</option>
              </select>
              <div v-if="errors.delivery_method" class="invalid-feedback d-block">
                {{ errors.delivery_method }}
              </div>
              <small class="form-text text-muted">
                How the items will be delivered
              </small>
            </div>

            <div class="col-12 mb-3">
              <label class="form-label">Expected Delivery Date</label>
              <input
                v-model="form.expected_delivery_date"
                type="datetime-local"
                class="form-control"
                :class="{ 'is-invalid': errors.expected_delivery_date }"
                :min="currentDateTime"
              />
              <div v-if="errors.expected_delivery_date" class="invalid-feedback d-block">
                {{ errors.expected_delivery_date }}
              </div>
              <small class="form-text text-muted">
                When the items are expected to be delivered
              </small>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Fulfillment Summary -->
    <div class="card card-custom mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="flaticon2-eye text-info mr-2"></i>
          Fulfillment Summary
        </h5>
      </div>
      <div class="card-body">
        <div class="fulfillment-summary text-center">
          <div class="summary-icon mb-3">
            <div class="icon-circle icon-circle-info">
              <i class="flaticon2-box icon-2x"></i>
            </div>
          </div>

          <h6 class="font-weight-bold text-dark mb-2">{{ getFulfillmentTitle() }}</h6>
          <p class="text-muted mb-3">
            {{ getFulfillmentDescription() }}
          </p>

          <div class="summary-details">
            <div class="summary-item d-flex justify-content-between mb-2">
              <span class="text-muted">Type:</span>
              <span class="font-weight-bold text-info">{{
                form.fulfillment_type || 'Not selected'
              }}</span>
            </div>

            <div class="summary-item d-flex justify-content-between mb-2">
              <span class="text-muted">Fulfillment Date:</span>
              <span class="font-weight-bold">{{
                formatDate(form.fulfillment_date) || 'Not set'
              }}</span>
            </div>

            <div class="summary-item d-flex justify-content-between mb-2">
              <span class="text-muted">Delivery Method:</span>
              <span class="font-weight-bold">{{ form.delivery_method || 'Not selected' }}</span>
            </div>

            <div class="summary-item d-flex justify-content-between mb-2">
              <span class="text-muted">Expected Delivery:</span>
              <span class="font-weight-bold">{{
                formatDate(form.expected_delivery_date) || 'Not set'
              }}</span>
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
                Processing fulfillment...
              </span>
              <span v-else-if="success" class="text-success">
                <i class="flaticon2-check mr-1"></i>
                Request fulfilled successfully!
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
                class="btn btn-info btn-lg"
                :disabled="loading"
              >
                <i class="flaticon2-box mr-2"></i>
                {{ loading ? 'Processing...' : 'Fulfill Request' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-info" role="status">
        <span class="sr-only">Processing fulfillment...</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RequestFulfillmentForm',
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
        fulfillment_type: '',
        fulfillment_date: '',
        fulfillment_notes: '',
        special_instructions: '',
        delivery_method: '',
        expected_delivery_date: '',
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
      this.form.fulfillment_date = this.currentDateTime;
      this.form.fulfillment_type = 'FULL'; // Default to full fulfillment
      this.form.delivery_method = 'PICKUP'; // Default to pickup

      // Set expected delivery to current date + 1 day
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      const hours = String(tomorrow.getHours()).padStart(2, '0');
      const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
      this.form.expected_delivery_date = `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    handleFulfillmentTypeChange() {
      // Adjust expected delivery date based on fulfillment type
      if (this.form.fulfillment_type === 'BACKORDER') {
        // Set expected delivery to current date + 7 days for backorders
        const backorderDate = new Date();
        backorderDate.setDate(backorderDate.getDate() + 7);
        const year = backorderDate.getFullYear();
        const month = String(backorderDate.getMonth() + 1).padStart(2, '0');
        const day = String(backorderDate.getDate()).padStart(2, '0');
        const hours = String(backorderDate.getHours()).padStart(2, '0');
        const minutes = String(backorderDate.getMinutes()).padStart(2, '0');
        this.form.expected_delivery_date = `${year}-${month}-${day}T${hours}:${minutes}`;
      } else if (this.form.fulfillment_type === 'FULL') {
        // Set expected delivery to current date + 1 day for full fulfillment
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        const hours = String(tomorrow.getHours()).padStart(2, '0');
        const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
        this.form.expected_delivery_date = `${year}-${month}-${day}T${hours}:${minutes}`;
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

    getFulfillmentTitle() {
      if (!this.form.fulfillment_type) return 'Select Fulfillment Type';

      const titles = {
        FULL: 'Full Fulfillment',
        PARTIAL: 'Partial Fulfillment',
        SUBSTITUTE: 'Substitute Items',
        BACKORDER: 'Backorder',
      };
      return titles[this.form.fulfillment_type];
    },

    getFulfillmentDescription() {
      if (!this.form.fulfillment_type) return 'Choose a fulfillment type to see description';

      const descriptions = {
        FULL: 'All requested items will be provided as requested',
        PARTIAL: 'Some items will be provided, others may be backordered',
        SUBSTITUTE: 'Alternative items will be provided when possible',
        BACKORDER: 'Items will be ordered and delivered when available',
      };
      return descriptions[this.form.fulfillment_type];
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

      if (!this.form.fulfillment_type) {
        this.errors.fulfillment_type = 'Fulfillment type is required';
      }

      if (this.form.fulfillment_date && new Date(this.form.fulfillment_date) > new Date()) {
        this.errors.fulfillment_date = 'Fulfillment date cannot be in the future';
      }

      if (
        this.form.expected_delivery_date &&
        new Date(this.form.expected_delivery_date) < new Date()
      ) {
        this.errors.expected_delivery_date = 'Expected delivery date cannot be in the past';
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
        const fulfillmentData = {
          request_id: this.request.id,
          fulfillment_type: this.form.fulfillment_type,
          fulfillment_notes: this.form.fulfillment_notes,
          special_instructions: this.form.special_instructions,
          delivery_method: this.form.delivery_method,
          expected_delivery_date: this.form.expected_delivery_date,
          fulfillment_date: this.form.fulfillment_date,
        };

        // Remove empty optional fields
        Object.keys(fulfillmentData).forEach(key => {
          if (fulfillmentData[key] === '' || fulfillmentData[key] === null) {
            delete fulfillmentData[key];
          }
        });

        await this.$store.dispatch('generalStore/fulfillRequest', fulfillmentData);

        this.success = true;
        this.$emit('request-fulfilled');

        // Reset form after successful fulfillment
        setTimeout(() => {
          this.resetForm();
        }, 2000);
      } catch (error) {
        console.error('Error fulfilling request:', error);
        this.$toast.error('Failed to fulfill request. Please try again.');
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.form = {
        fulfillment_type: 'FULL',
        fulfillment_date: this.currentDateTime,
        fulfillment_notes: '',
        special_instructions: '',
        delivery_method: 'PICKUP',
        expected_delivery_date: '',
      };
      this.errors = {};
      this.success = false;
      this.initializeForm();
    },
  },
};
</script>

<style scoped>
.request-fulfillment-form {
  position: relative;
}

.form-header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
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
  border-color: #17a2b8;
  box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.25);
}

.form-control-plaintext {
  padding: 0.375rem 0;
  margin-bottom: 0;
  color: #495057;
  background-color: transparent;
  border: solid transparent;
  border-width: 1px 0;
}

.fulfillment-item .card {
  border: 1px solid #e1f0ff;
  transition: all 0.3s ease;
}

.fulfillment-item .card:hover {
  border-color: #17a2b8;
  box-shadow: 0 2px 10px rgba(23, 162, 184, 0.1);
}

.fulfillment-summary {
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

.icon-circle-info {
  background: linear-gradient(135deg, #17a2b8, #6f42c1);
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
