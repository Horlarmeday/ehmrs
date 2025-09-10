<template>
  <div class="create-movement">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col">
                <h3 class="card-title">Create New Stock Movement</h3>
                <p class="card-text">Record stock movements and transactions</p>
              </div>
              <div class="col-auto">
                <router-link :to="{ name: 'general-store-movements' }" class="btn btn-secondary">
                  <i class="fas fa-arrow-left"></i> Back to List
                </router-link>
              </div>
            </div>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <!-- Movement Type and Basic Info -->
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="type">Movement Type *</label>
                    <select
                      id="type"
                      v-model="form.type"
                      class="form-control"
                      :class="{ 'is-invalid': errors.type }"
                      required
                      @change="handleTypeChange"
                    >
                      <option value="">Select movement type</option>
                      <option value="in">Stock In</option>
                      <option value="out">Stock Out</option>
                      <option value="transfer">Transfer</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="return">Return</option>
                    </select>
                    <div v-if="errors.type" class="invalid-feedback">
                      {{ errors.type }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="item">Item *</label>
                    <select
                      id="item"
                      v-model="form.item_id"
                      class="form-control"
                      :class="{ 'is-invalid': errors.item_id }"
                      required
                      @change="handleItemChange"
                    >
                      <option value="">Select an item</option>
                      <option v-for="item in items" :key="item.id" :value="item.id">
                        {{ item.name }} ({{ item.code }}) - Stock: {{ item.current_stock }}
                      </option>
                    </select>
                    <div v-if="errors.item_id" class="invalid-feedback">
                      {{ errors.item_id }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quantity and Unit -->
              <div class="row">
                <div class="col-md-4">
                  <div class="form-group">
                    <label for="quantity">Quantity *</label>
                    <input
                      id="quantity"
                      v-model.number="form.quantity"
                      type="number"
                      class="form-control"
                      :class="{ 'is-invalid': errors.quantity }"
                      min="0.01"
                      step="0.01"
                      required
                    />
                    <div v-if="errors.quantity" class="invalid-feedback">
                      {{ errors.quantity }}
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-group">
                    <label for="unit">Unit</label>
                    <input
                      id="unit"
                      v-model="form.unit"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.unit }"
                      readonly
                    />
                    <div v-if="errors.unit" class="invalid-feedback">
                      {{ errors.unit }}
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-group">
                    <label for="unit_price">Unit Price</label>
                    <input
                      id="unit_price"
                      v-model.number="form.unit_price"
                      type="number"
                      class="form-control"
                      :class="{ 'is-invalid': errors.unit_price }"
                      min="0"
                      step="0.01"
                    />
                    <div v-if="errors.unit_price" class="invalid-feedback">
                      {{ errors.unit_price }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reference Information -->
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="reference_type">Reference Type</label>
                    <select
                      id="reference_type"
                      v-model="form.reference_type"
                      class="form-control"
                      :class="{ 'is-invalid': errors.reference_type }"
                      @change="handleReferenceTypeChange"
                    >
                      <option value="">Select reference type</option>
                      <option value="purchase_order">Purchase Order</option>
                      <option value="sales_order">Sales Order</option>
                      <option value="transfer_order">Transfer Order</option>
                      <option value="adjustment">Stock Adjustment</option>
                      <option value="return">Return</option>
                      <option value="other">Other</option>
                    </select>
                    <div v-if="errors.reference_type" class="invalid-feedback">
                      {{ errors.reference_type }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="reference_number">Reference Number</label>
                    <input
                      id="reference_number"
                      v-model="form.reference_number"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.reference_number }"
                    />
                    <div v-if="errors.reference_number" class="invalid-feedback">
                      {{ errors.reference_number }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Source and Destination -->
              <div class="row" v-if="showLocationFields">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="source_location">Source Location</label>
                    <select
                      id="source_location"
                      v-model="form.source_location"
                      class="form-control"
                      :class="{ 'is-invalid': errors.source_location }"
                    >
                      <option value="">Select source location</option>
                      <option value="main_store">Main Store</option>
                      <option value="department_store">Department Store</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="laboratory">Laboratory</option>
                      <option value="external">External Supplier</option>
                    </select>
                    <div v-if="errors.source_location" class="invalid-feedback">
                      {{ errors.source_location }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="destination_location">Destination Location</label>
                    <select
                      id="destination_location"
                      v-model="form.destination_location"
                      class="form-control"
                      :class="{ 'is-invalid': errors.destination_location }"
                    >
                      <option value="">Select destination location</option>
                      <option value="main_store">Main Store</option>
                      <option value="department_store">Department Store</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="laboratory">Laboratory</option>
                      <option value="external">External Customer</option>
                    </select>
                    <div v-if="errors.destination_location" class="invalid-feedback">
                      {{ errors.destination_location }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reason and Notes -->
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="reason">Reason</label>
                    <select
                      id="reason"
                      v-model="form.reason"
                      class="form-control"
                      :class="{ 'is-invalid': errors.reason }"
                    >
                      <option value="">Select reason</option>
                      <option value="purchase">Purchase</option>
                      <option value="sale">Sale</option>
                      <option value="transfer">Transfer</option>
                      <option value="adjustment">Stock Adjustment</option>
                      <option value="damaged">Damaged/Expired</option>
                      <option value="return">Return</option>
                      <option value="other">Other</option>
                    </select>
                    <div v-if="errors.reason" class="invalid-feedback">
                      {{ errors.reason }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="movement_date">Movement Date</label>
                    <input
                      id="movement_date"
                      v-model="form.movement_date"
                      type="datetime-local"
                      class="form-control"
                      :class="{ 'is-invalid': errors.movement_date }"
                    />
                    <div v-if="errors.movement_date" class="invalid-feedback">
                      {{ errors.movement_date }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="notes">Notes</label>
                <textarea
                  id="notes"
                  v-model="form.notes"
                  class="form-control"
                  :class="{ 'is-invalid': errors.notes }"
                  rows="4"
                ></textarea>
                <div v-if="errors.notes" class="invalid-feedback">
                  {{ errors.notes }}
                </div>
              </div>

              <!-- Approval Settings -->
              <div class="form-group" v-if="requiresApproval">
                <div class="custom-control custom-checkbox">
                  <input
                    id="requires_approval"
                    v-model="form.requires_approval"
                    type="checkbox"
                    class="custom-control-input"
                  />
                  <label class="custom-control-label" for="requires_approval">
                    Require Approval for this Movement
                  </label>
                  <small class="form-text text-muted d-block">
                    This movement will require approval before being processed
                  </small>
                </div>
              </div>

              <hr />

              <!-- Summary -->
              <div class="row" v-if="form.item_id && form.quantity">
                <div class="col-12">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title">Movement Summary</h6>
                      <div class="row">
                        <div class="col-md-3">
                          <strong>Current Stock:</strong> {{ selectedItem.current_stock || 0 }}
                        </div>
                        <div class="col-md-3">
                          <strong>Movement:</strong>
                          <span :class="getQuantityClass(form.type, form.quantity)">
                            {{ form.type === 'out' ? '-' : '+' }}{{ form.quantity }}
                          </span>
                        </div>
                        <div class="col-md-3"><strong>New Stock:</strong> {{ newStockLevel }}</div>
                        <div class="col-md-3">
                          <strong>Total Value:</strong> {{ formatCurrency(totalValue) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm mr-2"></span>
                  <i v-else class="fas fa-save mr-2"></i>
                  {{ submitting ? 'Creating...' : 'Create Movement' }}
                </button>
                <router-link
                  :to="{ name: 'general-store-movements' }"
                  class="btn btn-secondary ml-2"
                >
                  Cancel
                </router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateMovement',
  data() {
    return {
      form: {
        type: '',
        item_id: '',
        quantity: '',
        unit: '',
        unit_price: '',
        reference_type: '',
        reference_number: '',
        source_location: '',
        destination_location: '',
        reason: '',
        movement_date: '',
        notes: '',
        requires_approval: false,
      },
      selectedItem: {},
      submitting: false,
      errors: {},
    };
  },
  computed: {
    items() {
      return this.$store.state.generalStore.items;
    },
    storeLoading() {
      return this.$store.state.generalStore.loading;
    },
    showLocationFields() {
      return ['transfer', 'adjustment'].includes(this.form.type);
    },
    requiresApproval() {
      return ['out', 'transfer', 'adjustment'].includes(this.form.type);
    },
    newStockLevel() {
      if (!this.selectedItem.current_stock || !this.form.quantity) return 0;

      const current = parseFloat(this.selectedItem.current_stock);
      const quantity = parseFloat(this.form.quantity);

      if (this.form.type === 'in' || this.form.type === 'return') {
        return current + quantity;
      } else if (this.form.type === 'out') {
        return current - quantity;
      } else {
        return current; // transfer and adjustment don't change total stock
      }
    },
    totalValue() {
      if (!this.form.quantity || !this.form.unit_price) return 0;
      return parseFloat(this.form.quantity) * parseFloat(this.form.unit_price);
    },
  },
  async mounted() {
    await this.loadItems();
    this.setDefaultDate();
  },
  methods: {
    async loadItems() {
      try {
        await this.$store.dispatch('generalStore/fetchItems', { limit: 200 });
      } catch (error) {
        this.$toast.error('Failed to load items');
      }
    },
    setDefaultDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      this.form.movement_date = `${year}-${month}-${day}T${hours}:${minutes}`;
    },
    handleTypeChange() {
      // Reset location fields when type changes
      this.form.source_location = '';
      this.form.destination_location = '';

      // Set default requires_approval based on type
      this.form.requires_approval = this.requiresApproval;
    },
    handleItemChange() {
      if (this.form.item_id) {
        this.selectedItem = this.items.find(item => item.id === this.form.item_id) || {};
        this.form.unit = this.selectedItem.unit || '';
        this.form.unit_price = this.selectedItem.unit_price || '';
      } else {
        this.selectedItem = {};
        this.form.unit = '';
        this.form.unit_price = '';
      }
    },
    handleReferenceTypeChange() {
      // Auto-generate reference number if not provided
      if (this.form.reference_type && !this.form.reference_number) {
        const prefix = this.form.reference_type.toUpperCase().replace('_', '');
        const timestamp = Date.now()
          .toString()
          .slice(-6);
        this.form.reference_number = `${prefix}-${timestamp}`;
      }
    },
    getQuantityClass(type) {
      if (type === 'out') return 'text-danger';
      if (type === 'in') return 'text-success';
      return 'text-info';
    },
    formatCurrency(amount) {
      if (!amount) return '₦0.00';
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount);
    },
    validateForm() {
      this.errors = {};

      // Required fields
      if (!this.form.type) {
        this.errors.type = 'Movement type is required';
      }

      if (!this.form.item_id) {
        this.errors.item_id = 'Item selection is required';
      }

      if (!this.form.quantity) {
        this.errors.quantity = 'Quantity is required';
      } else if (isNaN(this.form.quantity) || parseFloat(this.form.quantity) <= 0) {
        this.errors.quantity = 'Quantity must be a positive number';
      }

      if (!this.form.unit_price) {
        this.errors.unit_price = 'Unit price is required';
      } else if (isNaN(this.form.unit_price) || parseFloat(this.form.unit_price) < 0) {
        this.errors.unit_price = 'Unit price must be a valid number';
      }

      if (!this.form.reason) {
        this.errors.reason = 'Reason is required';
      }

      if (!this.form.movement_date) {
        this.errors.movement_date = 'Movement date is required';
      }

      // Conditional validations
      if (this.showLocationFields) {
        if (!this.form.source_location) {
          this.errors.source_location = 'Source location is required for transfers';
        }
        if (!this.form.destination_location) {
          this.errors.destination_location = 'Destination location is required for transfers';
        }
      }

      // Reference number validation
      if (this.form.reference_number && this.form.reference_number.length > 50) {
        this.errors.reference_number = 'Reference number must be 50 characters or less';
      }

      // Notes validation
      if (this.form.notes && this.form.notes.length > 500) {
        this.errors.notes = 'Notes must be 500 characters or less';
      }

      // Stock level validation for outgoing movements
      if (this.form.type === 'out' && this.selectedItem.current_stock) {
        const currentStock = parseFloat(this.selectedItem.current_stock);
        const quantity = parseFloat(this.form.quantity);
        if (quantity > currentStock) {
          this.errors.quantity = `Insufficient stock. Available: ${currentStock}`;
        }
      }

      return Object.keys(this.errors).length === 0;
    },

    hasError(field) {
      return !!this.errors[field];
    },

    getError(field) {
      return this.errors[field] || '';
    },

    async handleSubmit() {
      this.submitting = true;
      this.errors = {};

      if (!this.validateForm()) {
        this.submitting = false;
        this.$toast.error('Please fix the validation errors before submitting.');
        return;
      }

      try {
        await this.$store.dispatch('generalStore/createMovement', this.form);

        this.$toast.success('Movement created successfully!');

        // Redirect to movements list
        this.$router.push({ name: 'general-store-movements' });
      } catch (error) {
        console.error('Error creating movement:', error);

        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
        } else {
          this.$toast.error('Failed to create movement. Please try again.');
        }
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.create-movement {
  padding: 20px;
}

.card {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
}

.form-actions {
  padding-top: 20px;
}

.custom-control-label {
  font-weight: 500;
}

.form-text {
  font-size: 0.875em;
}

.invalid-feedback {
  display: block;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-info {
  color: #17a2b8 !important;
}
</style>
