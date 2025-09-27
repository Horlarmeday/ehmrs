<template>
  <div class="create-movement-form">
    <!-- Form Header -->
    <div class="form-header mb-4">
      <h3 class="text-dark font-weight-bold mb-2">
        <i class="flaticon2-arrow text-success mr-2"></i>
        Record Stock Movement
      </h3>
      <p class="text-muted mb-0">
        Record stock movements for receiving, issuing, transferring, or adjusting inventory
      </p>
    </div>

    <!-- Main Form -->
    <form @submit.prevent="handleSubmit" class="movement-form">
      <div class="row">
        <!-- Movement Details -->
        <div class="col-lg-8">
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-arrow text-success mr-2"></i>
                Movement Details
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label required">Movement Type</label>
                  <select
                    v-model="form.movement_type"
                    class="form-control"
                    :class="{ 'is-invalid': errors.movement_type }"
                    @change="handleMovementTypeChange"
                    required
                  >
                    <option value="">Select Movement Type</option>
                    <option value="IN">Stock In (Receive)</option>
                    <option value="OUT">Stock Out (Issue)</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                  </select>
                  <div v-if="errors.movement_type" class="invalid-feedback d-block">
                    {{ errors.movement_type }}
                  </div>
                  <small class="form-text text-muted">
                    Type of stock movement being recorded
                  </small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label required">Item</label>
                  <select
                    v-model="form.item_id"
                    class="form-control"
                    :class="{ 'is-invalid': errors.item_id }"
                    @change="handleItemChange"
                    required
                  >
                    <option value="">Select Item</option>
                    <option v-for="item in availableItems" :key="item.id" :value="item.id">
                      {{ item.name }} ({{ item.item_code }}) - Stock: {{ item.current_stock }}
                    </option>
                  </select>
                  <div v-if="errors.item_id" class="invalid-feedback d-block">
                    {{ errors.item_id }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label required">Quantity</label>
                  <input
                    v-model="form.quantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    class="form-control"
                    :class="{ 'is-invalid': errors.quantity }"
                    placeholder="0.00"
                    required
                  />
                  <div v-if="errors.quantity" class="invalid-feedback d-block">
                    {{ errors.quantity }}
                  </div>
                  <small class="form-text text-muted">
                    Quantity being moved (use decimals if needed)
                  </small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Unit Cost</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text">$</span>
                    </div>
                    <input
                      v-model="form.unit_cost"
                      type="number"
                      step="0.01"
                      min="0"
                      class="form-control"
                      :class="{ 'is-invalid': errors.unit_cost }"
                      placeholder="0.00"
                    />
                  </div>
                  <div v-if="errors.unit_cost" class="invalid-feedback d-block">
                    {{ errors.unit_cost }}
                  </div>
                  <small class="form-text text-muted">
                    Cost per unit at time of movement (optional)
                  </small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Reference Type</label>
                  <select
                    v-model="form.reference_type"
                    class="form-control"
                    :class="{ 'is-invalid': errors.reference_type }"
                  >
                    <option value="">Select Reference Type</option>
                    <option value="PURCHASE">Purchase Order</option>
                    <option value="REQUEST">Item Request</option>
                    <option value="TRANSFER">Transfer Order</option>
                    <option value="ADJUSTMENT">Stock Adjustment</option>
                    <option value="RETURN">Return</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <div v-if="errors.reference_type" class="invalid-feedback d-block">
                    {{ errors.reference_type }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Reference ID</label>
                  <input
                    v-model="form.reference_id"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.reference_id }"
                    placeholder="e.g., PO-001, REQ-2024-001"
                  />
                  <div v-if="errors.reference_id" class="invalid-feedback d-block">
                    {{ errors.reference_id }}
                  </div>
                  <small class="form-text text-muted"> Reference number or identifier </small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">From Location</label>
                  <input
                    v-model="form.from_location"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.from_location }"
                    placeholder="e.g., Warehouse A, Room 101"
                  />
                  <div v-if="errors.from_location" class="invalid-feedback d-block">
                    {{ errors.from_location }}
                  </div>
                  <small class="form-text text-muted">
                    Source location (required for transfers)
                  </small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">To Location</label>
                  <input
                    v-model="form.to_location"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.to_location }"
                    placeholder="e.g., Warehouse B, Department X"
                  />
                  <div v-if="errors.to_location" class="invalid-feedback d-block">
                    {{ errors.to_location }}
                  </div>
                  <small class="form-text text-muted"> Destination location </small>
                </div>

                <div class="col-12 mb-3">
                  <label class="form-label">Movement Date</label>
                  <input
                    v-model="form.movement_date"
                    type="datetime-local"
                    class="form-control"
                    :class="{ 'is-invalid': errors.movement_date }"
                    :max="currentDateTime"
                  />
                  <div v-if="errors.movement_date" class="invalid-feedback d-block">
                    {{ errors.movement_date }}
                  </div>
                  <small class="form-text text-muted">
                    When the movement occurred (defaults to now)
                  </small>
                </div>

                <div class="col-12 mb-3">
                  <label class="form-label">Notes</label>
                  <textarea
                    v-model="form.notes"
                    class="form-control"
                    :class="{ 'is-invalid': errors.notes }"
                    rows="3"
                    placeholder="Additional notes about this movement..."
                  ></textarea>
                  <div v-if="errors.notes" class="invalid-feedback d-block">
                    {{ errors.notes }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Information -->
        <div class="col-lg-4">
          <!-- Item Information -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-box text-info mr-2"></i>
                Item Information
              </h5>
            </div>
            <div class="card-body">
              <div v-if="selectedItem" class="item-info">
                <div class="item-preview text-center mb-3">
                  <div class="item-icon">
                    <i class="flaticon2-box text-info icon-2x"></i>
                  </div>
                  <h6 class="font-weight-bold mb-1">{{ selectedItem.name }}</h6>
                  <small class="text-muted">{{ selectedItem.item_code }}</small>
                </div>

                <div class="item-details">
                  <div class="detail-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Current Stock:</span>
                    <span class="font-weight-bold">{{ selectedItem.current_stock }}</span>
                  </div>

                  <div class="detail-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Minimum Stock:</span>
                    <span class="font-weight-bold text-warning">{{
                      selectedItem.minimum_stock
                    }}</span>
                  </div>

                  <div class="detail-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Unit Cost:</span>
                    <span class="font-weight-bold text-success"
                      >${{ formatCurrency(selectedItem.unit_cost) }}</span
                    >
                  </div>

                  <div class="detail-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Category:</span>
                    <span class="font-weight-bold">{{ selectedItem.category?.name || 'N/A' }}</span>
                  </div>

                  <div class="detail-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Location:</span>
                    <span class="font-weight-bold">{{
                      selectedItem.location || 'Not specified'
                    }}</span>
                  </div>
                </div>

                <div class="stock-bar mt-3">
                  <div class="stock-bar-label d-flex justify-content-between mb-1">
                    <small class="text-muted">Stock Level</small>
                    <small class="text-muted">{{ getStockPercentage(selectedItem) }}%</small>
                  </div>
                  <div class="stock-bar-bg">
                    <div
                      class="stock-bar-fill"
                      :class="getStockLevelClass(selectedItem)"
                      :style="{ width: getStockPercentage(selectedItem) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-4">
                <i class="flaticon2-box text-muted icon-2x mb-2"></i>
                <p class="text-muted mb-0">Select an item to view details</p>
              </div>
            </div>
          </div>

          <!-- Movement Preview -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-eye text-success mr-2"></i>
                Movement Preview
              </h5>
            </div>
            <div class="card-body">
              <div class="movement-preview text-center">
                <div class="preview-icon mb-3">
                  <div class="icon-circle" :class="getMovementIconClass()">
                    <i :class="getMovementIcon()"></i>
                  </div>
                </div>

                <h6 class="font-weight-bold text-dark mb-2">{{ getMovementTypeLabel() }}</h6>
                <p class="text-muted mb-3">
                  {{ getMovementDescription() }}
                </p>

                <div class="preview-details">
                  <div class="preview-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Quantity:</span>
                    <span class="font-weight-bold">{{ form.quantity || 0 }}</span>
                  </div>

                  <div class="preview-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Total Cost:</span>
                    <span class="font-weight-bold text-success"
                      >${{ formatCurrency(calculateTotalCost()) }}</span
                    >
                  </div>

                  <div class="preview-item d-flex justify-content-between mb-2">
                    <span class="text-muted">New Stock:</span>
                    <span class="font-weight-bold" :class="getNewStockClass()">
                      {{ calculateNewStock() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Tips -->
          <div class="card card-custom">
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
                  <small>Use accurate quantities for precise tracking</small>
                </div>
                <div class="tip-item mb-2">
                  <i class="flaticon2-check text-success mr-2"></i>
                  <small>Include reference numbers for traceability</small>
                </div>
                <div class="tip-item mb-2">
                  <i class="flaticon2-check text-success mr-2"></i>
                  <small>Add notes for future reference</small>
                </div>
                <div class="tip-item">
                  <i class="flaticon2-check text-success mr-2"></i>
                  <small>Verify stock levels before recording</small>
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
                  Recording movement...
                </span>
                <span v-else-if="success" class="text-success">
                  <i class="flaticon2-check mr-1"></i>
                  Movement recorded successfully!
                </span>
              </div>

              <div class="action-buttons">
                <button type="button" @click="$emit('cancel')" class="btn btn-light btn-lg mr-3">
                  <i class="flaticon2-close mr-2"></i>
                  Cancel
                </button>
                <button type="submit" class="btn btn-success btn-lg" :disabled="loading">
                  <i class="flaticon2-arrow mr-2"></i>
                  {{ loading ? 'Recording...' : 'Record Movement' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-success" role="status">
        <span class="sr-only">Recording movement...</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateMovementForm',
  props: {
    item: {
      type: Object,
      default: null,
    },
    movementType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      loading: false,
      success: false,
      errors: {},
      form: {
        movement_type: '',
        item_id: '',
        quantity: '',
        unit_cost: '',
        reference_type: '',
        reference_id: '',
        from_location: '',
        to_location: '',
        movement_date: '',
        notes: '',
      },
      availableItems: [],
      selectedItem: null,
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
        console.error('Error loading form data:', error);
      }
    },

    initializeForm() {
      // Set default values
      this.form.movement_date = this.currentDateTime;

      // Pre-populate if props are provided
      if (this.item) {
        this.form.item_id = this.item.id;
        this.selectedItem = this.item;
      }

      if (this.movementType) {
        this.form.movement_type = this.movementType;
      }
    },

    handleMovementTypeChange() {
      // Reset location fields when movement type changes
      if (this.form.movement_type === 'TRANSFER') {
        // Transfer requires both locations
        this.form.from_location = this.selectedItem?.location || '';
        this.form.to_location = '';
      } else if (this.form.movement_type === 'IN') {
        // Stock in - clear from location, set to location
        this.form.from_location = '';
        this.form.to_location = this.selectedItem?.location || '';
      } else if (this.form.movement_type === 'OUT') {
        // Stock out - set from location, clear to location
        this.form.from_location = this.selectedItem?.location || '';
        this.form.to_location = '';
      } else {
        // Adjustment - clear both locations
        this.form.from_location = '';
        this.form.to_location = '';
      }
    },

    handleItemChange() {
      if (this.form.item_id) {
        this.selectedItem = this.availableItems.find((item) => item.id === this.form.item_id);
        if (this.selectedItem) {
          this.form.unit_cost = this.selectedItem.unit_cost || '';
          this.handleMovementTypeChange();
        }
      } else {
        this.selectedItem = null;
      }
    },

    getMovementTypeLabel() {
      const labels = {
        IN: 'Stock In (Receiving)',
        OUT: 'Stock Out (Issuing)',
        TRANSFER: 'Stock Transfer',
        ADJUSTMENT: 'Stock Adjustment',
      };
      return labels[this.form.movement_type] || 'Select Movement Type';
    },

    getMovementDescription() {
      if (!this.form.movement_type) return 'Select a movement type to see description';

      const descriptions = {
        IN: 'Adding stock to inventory (purchase, return, etc.)',
        OUT: 'Removing stock from inventory (issue, sale, etc.)',
        TRANSFER: 'Moving stock between locations',
        ADJUSTMENT: 'Correcting stock levels (count differences, etc.)',
      };
      return descriptions[this.form.movement_type];
    },

    getMovementIcon() {
      const icons = {
        IN: 'flaticon2-arrow-down',
        OUT: 'flaticon2-arrow-up',
        TRANSFER: 'flaticon2-arrow-right',
        ADJUSTMENT: 'flaticon2-edit',
      };
      return icons[this.form.movement_type] || 'flaticon2-arrow';
    },

    getMovementIconClass() {
      const classes = {
        IN: 'icon-circle-success',
        OUT: 'icon-circle-danger',
        TRANSFER: 'icon-circle-info',
        ADJUSTMENT: 'icon-circle-warning',
      };
      return classes[this.form.movement_type] || 'icon-circle-secondary';
    },

    getStockLevelClass(item) {
      if (!item) return '';
      if (item.current_stock === 0) return 'stock-empty';
      if (item.current_stock <= item.minimum_stock) return 'stock-low';
      return 'stock-normal';
    },

    getStockPercentage(item) {
      if (!item || !item.maximum_stock) return 0;
      return Math.min(100, (item.current_stock / item.maximum_stock) * 100);
    },

    calculateTotalCost() {
      const quantity = parseFloat(this.form.quantity) || 0;
      const unitCost = parseFloat(this.form.unit_cost) || 0;
      return quantity * unitCost;
    },

    calculateNewStock() {
      if (!this.selectedItem) return 0;

      const currentStock = this.selectedItem.current_stock || 0;
      const quantity = parseFloat(this.form.quantity) || 0;

      switch (this.form.movement_type) {
        case 'IN':
          return currentStock + quantity;
        case 'OUT':
          return Math.max(0, currentStock - quantity);
        case 'TRANSFER':
          return currentStock; // Transfer doesn't change total stock
        case 'ADJUSTMENT':
          return quantity; // Adjustment sets the stock level
        default:
          return currentStock;
      }
    },

    getNewStockClass() {
      const newStock = this.calculateNewStock();
      if (newStock === 0) return 'text-danger';
      if (newStock <= (this.selectedItem?.minimum_stock || 0)) return 'text-warning';
      return 'text-success';
    },

    formatCurrency(amount) {
      return parseFloat(amount || 0).toFixed(2);
    },

    validateForm() {
      this.errors = {};

      if (!this.form.movement_type) {
        this.errors.movement_type = 'Movement type is required';
      }

      if (!this.form.item_id) {
        this.errors.item_id = 'Item is required';
      }

      if (!this.form.quantity || parseFloat(this.form.quantity) <= 0) {
        this.errors.quantity = 'Valid quantity is required';
      }

      if (this.form.unit_cost && parseFloat(this.form.unit_cost) < 0) {
        this.errors.unit_cost = 'Unit cost cannot be negative';
      }

      if (this.form.movement_type === 'TRANSFER') {
        if (!this.form.from_location) {
          this.errors.from_location = 'From location is required for transfers';
        }
        if (!this.form.to_location) {
          this.errors.to_location = 'To location is required for transfers';
        }
        if (this.form.from_location === this.form.to_location) {
          this.errors.to_location = 'From and to locations must be different';
        }
      }

      if (this.form.movement_type === 'OUT') {
        const currentStock = this.selectedItem?.current_stock || 0;
        const quantity = parseFloat(this.form.quantity) || 0;
        if (quantity > currentStock) {
          this.errors.quantity = `Cannot issue more than current stock (${currentStock})`;
        }
      }

      if (this.form.movement_date && new Date(this.form.movement_date) > new Date()) {
        this.errors.movement_date = 'Movement date cannot be in the future';
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
        const movementData = { ...this.form };

        // Convert string numbers to actual numbers
        if (movementData.quantity) movementData.quantity = parseFloat(movementData.quantity);
        if (movementData.unit_cost) movementData.unit_cost = parseFloat(movementData.unit_cost);

        // Remove empty optional fields
        Object.keys(movementData).forEach((key) => {
          if (movementData[key] === '' || movementData[key] === null) {
            delete movementData[key];
          }
        });

        await this.$store.dispatch('generalStore/createMovement', movementData);

        this.success = true;
        this.$emit('movement-created');

        // Reset form after successful creation
        setTimeout(() => {
          this.resetForm();
        }, 2000);
      } catch (error) {
        console.error('Error creating movement:', error);
        this.$toast.error('Failed to record movement. Please try again.');
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.form = {
        movement_type: '',
        item_id: '',
        quantity: '',
        unit_cost: '',
        reference_type: '',
        reference_id: '',
        from_location: '',
        to_location: '',
        movement_date: this.currentDateTime,
        notes: '',
      };
      this.selectedItem = null;
      this.errors = {};
      this.success = false;
    },
  },
};
</script>

<style scoped>
.create-movement-form {
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
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
  color: #6c757d;
}

.item-info .item-preview {
  padding: 1rem 0;
}

.item-icon {
  margin-bottom: 1rem;
}

.item-details .detail-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.item-details .detail-item:last-child {
  border-bottom: none;
}

.stock-bar {
  margin-top: 1rem;
}

.stock-bar-bg {
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.stock-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.stock-bar-fill.stock-normal {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.stock-bar-fill.stock-low {
  background: linear-gradient(90deg, #ffc107, #fd7e14);
}

.stock-bar-fill.stock-empty {
  background: linear-gradient(90deg, #dc3545, #e83e8c);
}

.movement-preview {
  padding: 1rem 0;
}

.preview-icon .icon-circle {
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

.icon-circle-danger {
  background: linear-gradient(135deg, #dc3545, #e83e8c);
}

.icon-circle-info {
  background: linear-gradient(135deg, #17a2b8, #6f42c1);
}

.icon-circle-warning {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
}

.icon-circle-secondary {
  background: linear-gradient(135deg, #6c757d, #495057);
}

.preview-icon .icon-circle i {
  font-size: 2rem;
}

.preview-details .preview-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.preview-details .preview-item:last-child {
  border-bottom: none;
}

.quick-tips .tip-item {
  display: flex;
  align-items: center;
}

.quick-tips .tip-item i {
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
