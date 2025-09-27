<template>
  <div class="create-request-form">
    <!-- Form Header -->
    <div class="form-header mb-4">
      <h3 class="text-dark font-weight-bold mb-2">
        <i class="flaticon2-plus text-primary mr-2"></i>
        Create New Request
      </h3>
      <p class="text-muted mb-0">Submit a request for items needed by your department</p>
    </div>

    <!-- Main Form -->
    <form @submit.prevent="handleSubmit" class="request-form">
      <div class="row">
        <!-- Request Details -->
        <div class="col-lg-8">
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-file text-primary mr-2"></i>
                Request Information
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label required">Department</label>
                  <select
                    v-model="form.requesting_department"
                    class="form-control"
                    :class="{ 'is-invalid': errors.requesting_department }"
                    required
                  >
                    <option value="">Select Department</option>
                    <option v-for="dept in departments" :key="dept" :value="dept">
                      {{ dept }}
                    </option>
                  </select>
                  <div v-if="errors.requesting_department" class="invalid-feedback d-block">
                    {{ errors.requesting_department }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label required">Priority</label>
                  <select
                    v-model="form.priority"
                    class="form-control"
                    :class="{ 'is-invalid': errors.priority }"
                    required
                  >
                    <option value="">Select Priority</option>
                    <option value="LOW">Low - Normal priority</option>
                    <option value="MEDIUM">Medium - Standard priority</option>
                    <option value="HIGH">High - Important priority</option>
                    <option value="URGENT">Urgent - Critical priority</option>
                  </select>
                  <div v-if="errors.priority" class="invalid-feedback d-block">
                    {{ errors.priority }}
                  </div>
                  <small class="form-text text-muted">
                    Choose appropriate priority level for your request
                  </small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label required">Required Date</label>
                  <input
                    v-model="form.required_date"
                    type="date"
                    class="form-control"
                    :class="{ 'is-invalid': errors.required_date }"
                    :min="currentDate"
                    required
                  />
                  <div v-if="errors.required_date" class="invalid-feedback d-block">
                    {{ errors.required_date }}
                  </div>
                  <small class="form-text text-muted"> When do you need these items? </small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Request Number</label>
                  <input
                    v-model="form.request_number"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.request_number }"
                    disabled
                  />
                  <small class="form-text text-muted">
                    Request number will be auto-generated
                  </small>
                </div>

                <div class="col-12 mb-3">
                  <label class="form-label">General Notes</label>
                  <textarea
                    v-model="form.notes"
                    class="form-control"
                    :class="{ 'is-invalid': errors.notes }"
                    rows="3"
                  ></textarea>
                  <div v-if="errors.notes" class="invalid-feedback d-block">
                    {{ errors.notes }}
                  </div>
                  <small class="form-text text-muted">
                    Additional context or special requirements
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Items Section -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                  <i class="flaticon2-box text-primary mr-2"></i>
                  Requested Items
                  <span class="badge badge-primary ml-2">{{ form.items.length }}</span>
                </h5>
                <button type="button" @click="addItem" class="btn btn-primary btn-sm">
                  <i class="flaticon2-plus mr-1"></i>
                  Add Item
                </button>
              </div>
            </div>
            <div class="card-body">
              <div v-if="form.items.length === 0" class="text-center py-4">
                <i class="flaticon2-box text-muted icon-2x mb-2"></i>
                <p class="text-muted mb-0">No items added yet</p>
                <button type="button" @click="addItem" class="btn btn-primary btn-sm mt-2">
                  <i class="flaticon2-plus mr-1"></i>
                  Add First Item
                </button>
              </div>
              <div v-else>
                <div v-for="(item, index) in form.items" :key="index" class="item-row mb-4">
                  <div class="card card-custom">
                    <div class="card-header">
                      <div class="d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">Item {{ index + 1 }}</h6>
                        <button
                          type="button"
                          @click="removeItem(index)"
                          class="btn btn-danger btn-sm"
                          :disabled="form.items.length === 1"
                        >
                          <i class="flaticon2-close"></i>
                        </button>
                      </div>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label required">Item</label>
                          <select
                            v-model="item.item_id"
                            class="form-control"
                            :class="{ 'is-invalid': getItemError(index, 'item_id') }"
                            @change="handleItemChange(index)"
                            required
                          >
                            <option value="">Select Item</option>
                            <option
                              v-for="availableItem in availableItems"
                              :key="availableItem.id"
                              :value="availableItem.id"
                            >
                              {{ availableItem.name }} ({{ availableItem.item_code }}) - Stock:
                              {{ availableItem.current_stock }}
                            </option>
                          </select>
                          <div
                            v-if="getItemError(index, 'item_id')"
                            class="invalid-feedback d-block"
                          >
                            {{ getItemError(index, 'item_id') }}
                          </div>
                        </div>

                        <div class="col-md-6 mb-3">
                          <label class="form-label required">Quantity</label>
                          <input
                            v-model="item.quantity_requested"
                            type="number"
                            min="1"
                            step="1"
                            class="form-control"
                            :class="{ 'is-invalid': getItemError(index, 'quantity_requested') }"
                            @input="calculateItemCost(index)"
                            required
                          />
                          <div
                            v-if="getItemError(index, 'quantity_requested')"
                            class="invalid-feedback d-block"
                          >
                            {{ getItemError(index, 'quantity_requested') }}
                          </div>
                        </div>

                        <div class="col-md-6 mb-3">
                          <label class="form-label">Unit Cost</label>
                          <div class="input-group">
                            <div class="input-group-prepend">
                              <span class="input-group-text">$</span>
                            </div>
                            <input
                              v-model="item.unit_cost"
                              type="number"
                              step="0.01"
                              min="0"
                              class="form-control"
                              :class="{ 'is-invalid': getItemError(index, 'unit_cost') }"
                              disabled
                            />
                          </div>
                          <div
                            v-if="getItemError(index, 'unit_cost')"
                            class="invalid-feedback d-block"
                          >
                            {{ getItemError(index, 'unit_cost') }}
                          </div>
                        </div>

                        <div class="col-md-6 mb-3">
                          <label class="form-label">Total Cost</label>
                          <div class="input-group">
                            <div class="input-group-prepend">
                              <span class="input-group-text">$</span>
                            </div>
                            <input
                              v-model="item.total_cost"
                              type="number"
                              step="0.01"
                              class="form-control"
                              disabled
                            />
                          </div>
                        </div>

                        <div class="col-12 mb-3">
                          <label class="form-label">Item Notes</label>
                          <textarea
                            v-model="item.notes"
                            class="form-control"
                            :class="{ 'is-invalid': getItemError(index, 'notes') }"
                            rows="2"
                          ></textarea>
                          <div v-if="getItemError(index, 'notes')" class="invalid-feedback d-block">
                            {{ getItemError(index, 'notes') }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Information -->
        <div class="col-lg-4">
          <!-- Request Summary -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-eye text-primary mr-2"></i>
                Request Summary
              </h5>
            </div>
            <div class="card-body">
              <div class="request-summary text-center">
                <div class="summary-icon mb-3">
                  <div class="icon-circle icon-circle-primary">
                    <i class="flaticon2-file icon-2x"></i>
                  </div>
                </div>

                <h6 class="font-weight-bold text-dark mb-2">{{ getRequestTitle() }}</h6>
                <p class="text-muted mb-3">
                  {{ getRequestDescription() }}
                </p>

                <div class="summary-stats">
                  <div class="stat-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Department:</span>
                    <span class="font-weight-bold">{{
                      form.requesting_department || 'Not selected'
                    }}</span>
                  </div>

                  <div class="stat-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Priority:</span>
                    <span class="font-weight-bold" :class="getPriorityClass()">
                      {{ form.priority || 'Not selected' }}
                    </span>
                  </div>

                  <div class="stat-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Required Date:</span>
                    <span class="font-weight-bold">{{
                      formatDate(form.required_date) || 'Not set'
                    }}</span>
                  </div>

                  <div class="stat-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Total Items:</span>
                    <span class="font-weight-bold text-primary">{{ form.items.length }}</span>
                  </div>

                  <div class="stat-item d-flex justify-content-between mb-3">
                    <span class="text-muted">Total Cost:</span>
                    <span class="font-weight-bold text-success"
                      >${{ formatCurrency(calculateTotalCost()) }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Tips -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-lightbulb text-warning mr-2"></i>
                Quick Tips
              </h5>
            </div>
            <div class="card-body">
              <div class="quick-tips">
                <div class="tip-item mb-2">
                  <i class="flaticon2-check text-success mr-2"></i>
                  <small>Be specific about quantities needed</small>
                </div>
                <div class="tip-item mb-2">
                  <i class="flaticon2-check text-success mr-2"></i>
                  <small>Set realistic required dates</small>
                </div>
                <div class="tip-item mb-2">
                  <i class="flaticon2-check text-success mr-2"></i>
                  <small>Provide clear item descriptions</small>
                </div>
                <div class="tip-item">
                  <i class="flaticon2-check text-success mr-2"></i>
                  <small>Use appropriate priority levels</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Department Guidelines -->
          <div class="card card-custom">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-info text-info mr-2"></i>
                Department Guidelines
              </h5>
            </div>
            <div class="card-body">
              <div class="department-guidelines">
                <div class="guideline-item mb-2">
                  <i class="flaticon2-check text-info mr-2"></i>
                  <small>Requests are reviewed within 24 hours</small>
                </div>
                <div class="guideline-item mb-2">
                  <i class="flaticon2-check text-info mr-2"></i>
                  <small>High priority items get expedited processing</small>
                </div>
                <div class="guideline-item mb-2">
                  <i class="flaticon2-check text-info mr-2"></i>
                  <small>Budget approval may be required for large requests</small>
                </div>
                <div class="guideline-item">
                  <i class="flaticon2-check text-info mr-2"></i>
                  <small>You'll be notified of approval/rejection status</small>
                </div>
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
                  Creating request...
                </span>
                <span v-else-if="success" class="text-success">
                  <i class="flaticon2-check mr-1"></i>
                  Request created successfully!
                </span>
              </div>

              <div class="action-buttons">
                <button type="button" @click="$emit('cancel')" class="btn btn-light btn-lg mr-3">
                  <i class="flaticon2-close mr-2"></i>
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
                  <i class="flaticon2-plus mr-2"></i>
                  {{ loading ? 'Creating...' : 'Create Request' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Creating request...</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateRequestForm',
  data() {
    return {
      loading: false,
      success: false,
      errors: {},
      form: {
        requesting_department: '',
        priority: '',
        required_date: '',
        request_number: '',
        notes: '',
        items: [],
      },
      availableItems: [],
      departments: [
        'Emergency',
        'Surgery',
        'ICU',
        'Pediatrics',
        'Maternity',
        'Laboratory',
        'Radiology',
        'Pharmacy',
        'Administration',
        'IT',
        'Maintenance',
        'Other',
      ],
    };
  },
  computed: {
    currentDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
  },
  async created() {
    await this.loadFormData();
    this.initializeForm();
  },
  methods: {
    async loadFormData() {
      try {
        // Load available items
        await this.$store.dispatch('generalStore/fetchItems', { status: 'ACTIVE' });
        this.availableItems = this.$store.state.generalStore.items;
      } catch (error) {
        this.$toast.error('Failed to load form data');
      }
    },

    initializeForm() {
      // Set default values
      this.form.required_date = this.currentDate;
      this.form.request_number = this.generateRequestNumber();
      this.addItem(); // Add first item by default
    },

    generateRequestNumber() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const timestamp = Date.now().toString().slice(-4);
      return `REQ-${year}${month}${day}-${timestamp}`;
    },

    addItem() {
      this.form.items.push({
        item_id: '',
        quantity_requested: 1,
        unit_cost: 0,
        total_cost: 0,
        notes: '',
      });
    },

    removeItem(index) {
      if (this.form.items.length > 1) {
        this.form.items.splice(index, 1);
        this.calculateTotalCost();
      }
    },

    handleItemChange(index) {
      const item = this.form.items[index];
      if (item.item_id) {
        const selectedItem = this.availableItems.find((avail) => avail.id === item.item_id);
        if (selectedItem) {
          item.unit_cost = selectedItem.unit_cost || 0;
          this.calculateItemCost(index);
        }
      }
    },

    calculateItemCost(index) {
      const item = this.form.items[index];
      const quantity = parseFloat(item.quantity_requested) || 0;
      const unitCost = parseFloat(item.unit_cost) || 0;
      item.total_cost = (quantity * unitCost).toFixed(2);
      this.calculateTotalCost();
    },

    calculateTotalCost() {
      const total = this.form.items.reduce((sum, item) => {
        return sum + (parseFloat(item.total_cost) || 0);
      }, 0);
      return total;
    },

    getRequestTitle() {
      if (!this.form.requesting_department) return 'New Request';
      return `${this.form.requesting_department} Request`;
    },

    getRequestDescription() {
      if (this.form.items.length === 0) return 'Add items to your request';
      if (this.form.items.length === 1) return 'Requesting 1 item';
      return `Requesting ${this.form.items.length} items`;
    },

    getPriorityClass() {
      const classes = {
        LOW: 'text-secondary',
        MEDIUM: 'text-info',
        HIGH: 'text-warning',
        URGENT: 'text-danger',
      };
      return classes[this.form.priority] || 'text-muted';
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    formatCurrency(amount) {
      return parseFloat(amount || 0).toFixed(2);
    },

    getItemError(index, field) {
      const itemErrors = this.errors[`items.${index}.${field}`];
      return itemErrors || '';
    },

    validateForm() {
      this.errors = {};

      if (!this.form.requesting_department) {
        this.errors.requesting_department = 'Department is required';
      }

      if (!this.form.priority) {
        this.errors.priority = 'Priority is required';
      }

      if (!this.form.required_date) {
        this.errors.required_date = 'Required date is required';
      }

      if (new Date(this.form.required_date) < new Date()) {
        this.errors.required_date = 'Required date cannot be in the past';
      }

      if (this.form.items.length === 0) {
        this.errors.items = 'At least one item is required';
      }

      // Validate each item
      this.form.items.forEach((item, index) => {
        if (!item.item_id) {
          this.errors[`items.${index}.item_id`] = 'Item selection is required';
        }

        if (!item.quantity_requested || item.quantity_requested < 1) {
          this.errors[`items.${index}.quantity_requested`] = 'Valid quantity is required';
        }

        if (item.quantity_requested > 1000) {
          this.errors[`items.${index}.quantity_requested`] = 'Quantity cannot exceed 1000';
        }
      });

      return Object.keys(this.errors).length === 0;
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return;
      }

      this.loading = true;
      this.success = false;

      try {
        const requestData = {
          ...this.form,
          total_cost: this.calculateTotalCost(),
        };

        // Convert string numbers to actual numbers
        requestData.items.forEach((item) => {
          item.quantity_requested = parseInt(item.quantity_requested);
          item.unit_cost = parseFloat(item.unit_cost);
          item.total_cost = parseFloat(item.total_cost);
        });

        await this.$store.dispatch('generalStore/createRequest', requestData);

        this.success = true;
        this.$emit('request-created');

        // Reset form after successful creation
        setTimeout(() => {
          this.resetForm();
        }, 2000);
      } catch (error) {
        this.$toast.error('Failed to create request. Please try again.');
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.form = {
        requesting_department: '',
        priority: '',
        required_date: this.currentDate,
        request_number: this.generateRequestNumber(),
        notes: '',
        items: [],
      };
      this.errors = {};
      this.success = false;
      this.addItem();
    },
  },
};
</script>

<style scoped>
.create-request-form {
  position: relative;
}

.form-header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
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
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
  color: #6c757d;
}

.item-row .card {
  border: 1px solid #e1f0ff;
  transition: all 0.3s ease;
}

.item-row .card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 10px rgba(0, 123, 255, 0.1);
}

.request-summary {
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

.icon-circle-primary {
  background: linear-gradient(135deg, #007bff, #6610f2);
}

.summary-icon .icon-circle i {
  font-size: 2rem;
}

.summary-stats .stat-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.summary-stats .stat-item:last-child {
  border-bottom: none;
}

.quick-tips .tip-item {
  display: flex;
  align-items: center;
}

.quick-tips .tip-item i {
  font-size: 0.875rem;
}

.department-guidelines .guideline-item {
  display: flex;
  align-items: center;
}

.department-guidelines .guideline-item i {
  font-size: 0.875rem;
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
