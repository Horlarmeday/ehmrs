<template>
  <div class="stock-adjustment-form">
    <!-- Form Header -->
    <div class="form-header mb-4">
      <h3 class="text-dark font-weight-bold mb-2">
        <i class="flaticon2-edit text-warning mr-2"></i>
        Stock Adjustment
      </h3>
      <p class="text-muted mb-0">
        Correct stock levels, resolve discrepancies, and maintain inventory accuracy
      </p>
    </div>

    <!-- Main Form -->
    <form @submit.prevent="handleSubmit" class="adjustment-form">
      <div class="row">
        <!-- Adjustment Details -->
        <div class="col-lg-8">
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-edit text-warning mr-2"></i>
                Adjustment Details
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
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
                      {{ item.name }} ({{ item.item_code }}) - Current: {{ item.current_stock }}
                    </option>
                  </select>
                  <div v-if="errors.item_id" class="invalid-feedback d-block">
                    {{ errors.item_id }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label required">Adjustment Type</label>
                  <select
                    v-model="form.adjustment_type"
                    class="form-control"
                    :class="{ 'is-invalid': errors.adjustment_type }"
                    @change="handleAdjustmentTypeChange"
                    required
                  >
                    <option value="">Select Adjustment Type</option>
                    <option value="COUNT_DIFFERENCE">Count Difference</option>
                    <option value="DAMAGED">Damaged/Lost</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="THEFT">Theft</option>
                    <option value="SYSTEM_ERROR">System Error</option>
                    <option value="PHYSICAL_VERIFICATION">Physical Verification</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <div v-if="errors.adjustment_type" class="invalid-feedback d-block">
                    {{ errors.adjustment_type }}
                  </div>
                  <small class="form-text text-muted">
                    Reason for the stock adjustment
                  </small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label required">Current Stock Level</label>
                  <input
                    v-model="form.current_stock"
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control"
                    :class="{ 'is-invalid': errors.current_stock }"
                    placeholder="0.00"
                    required
                  />
                  <div v-if="errors.current_stock" class="invalid-feedback d-block">
                    {{ errors.current_stock }}
                  </div>
                  <small class="form-text text-muted">
                    Actual physical stock count
                  </small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label required">System Stock Level</label>
                  <input
                    v-model="systemStockLevel"
                    type="number"
                    step="0.01"
                    class="form-control"
                    disabled
                    placeholder="0.00"
                  />
                  <small class="form-text text-muted">
                    Current stock in the system (read-only)
                  </small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label required">Adjustment Quantity</label>
                  <input
                    v-model="adjustmentQuantity"
                    type="number"
                    step="0.01"
                    class="form-control"
                    :class="{ 'is-invalid': errors.adjustment_quantity }"
                    placeholder="0.00"
                    disabled
                  />
                  <div v-if="errors.adjustment_quantity" class="invalid-feedback d-block">
                    {{ errors.adjustment_quantity }}
                  </div>
                  <small class="form-text text-muted">
                    Difference between system and actual (auto-calculated)
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
                    Cost per unit for value calculation
                  </small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Location</label>
                  <input
                    v-model="form.location"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.location }"
                    placeholder="e.g., Warehouse A, Room 101"
                  />
                  <div v-if="errors.location" class="invalid-feedback d-block">
                    {{ errors.location }}
                  </div>
                  <small class="form-text text-muted">
                    Location where adjustment occurred
                  </small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Adjustment Date</label>
                  <input
                    v-model="form.adjustment_date"
                    type="datetime-local"
                    class="form-control"
                    :class="{ 'is-invalid': errors.adjustment_date }"
                    :max="currentDateTime"
                  />
                  <div v-if="errors.adjustment_date" class="invalid-feedback d-block">
                    {{ errors.adjustment_date }}
                  </div>
                  <small class="form-text text-muted">
                    When the adjustment was made (defaults to now)
                  </small>
                </div>

                <div class="col-12 mb-3">
                  <label class="form-label required">Reason for Adjustment</label>
                  <textarea
                    v-model="form.reason"
                    class="form-control"
                    :class="{ 'is-invalid': errors.reason }"
                    rows="3"
                    placeholder="Detailed explanation of why this adjustment is necessary..."
                    required
                  ></textarea>
                  <div v-if="errors.reason" class="invalid-feedback d-block">
                    {{ errors.reason }}
                  </div>
                  <small class="form-text text-muted">
                    Provide a clear explanation for audit purposes
                  </small>
                </div>

                <div class="col-12 mb-3">
                  <label class="form-label">Additional Notes</label>
                  <textarea
                    v-model="form.notes"
                    class="form-control"
                    :class="{ 'is-invalid': errors.notes }"
                    rows="2"
                    placeholder="Any additional information or supporting details..."
                  ></textarea>
                  <div v-if="errors.notes" class="invalid-feedback d-block">
                    {{ errors.notes }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Impact Analysis -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-graph text-info mr-2"></i>
                Impact Analysis
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <div class="impact-item">
                    <label class="form-label text-muted">Financial Impact</label>
                    <div class="impact-value" :class="getFinancialImpactClass()">
                      ${{ formatCurrency(calculateFinancialImpact()) }}
                    </div>
                    <small class="form-text text-muted">
                      Total value change due to adjustment
                    </small>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <div class="impact-item">
                    <label class="form-label text-muted">Stock Status After</label>
                    <div class="impact-value" :class="getStockStatusClass()">
                      {{ getStockStatusLabel() }}
                    </div>
                    <small class="form-text text-muted">
                      Stock level status after adjustment
                    </small>
                  </div>
                </div>

                <div class="col-12">
                  <div class="alert" :class="getImpactAlertClass()">
                    <i class="flaticon2-warning mr-2"></i>
                    <strong>{{ getImpactAlertTitle() }}</strong>
                    <p class="mb-0 mt-2">{{ getImpactAlertMessage() }}</p>
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
                    <span class="text-muted">Maximum Stock:</span>
                    <span class="font-weight-bold text-info">{{
                      selectedItem.maximum_stock || 'Not set'
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
                </div>

                <div class="stock-bar mt-3">
                  <div class="stock-bar-label d-flex justify-content-between mb-1">
                    <small class="text-muted">Current Stock Level</small>
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

          <!-- Adjustment Preview -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-eye text-warning mr-2"></i>
                Adjustment Preview
              </h5>
            </div>
            <div class="card-body">
              <div class="adjustment-preview text-center">
                <div class="preview-icon mb-3">
                  <div class="icon-circle icon-circle-warning">
                    <i class="flaticon2-edit"></i>
                  </div>
                </div>

                <h6 class="font-weight-bold text-dark mb-2">Stock Adjustment</h6>
                <p class="text-muted mb-3">
                  {{ getAdjustmentTypeDescription() }}
                </p>

                <div class="preview-details">
                  <div class="preview-item d-flex justify-content-between mb-2">
                    <span class="text-muted">System Stock:</span>
                    <span class="font-weight-bold text-info">{{ systemStockLevel }}</span>
                  </div>

                  <div class="preview-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Actual Stock:</span>
                    <span class="font-weight-bold text-warning">{{ form.current_stock || 0 }}</span>
                  </div>

                  <div class="preview-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Difference:</span>
                    <span class="font-weight-bold" :class="getDifferenceClass()">
                      {{ adjustmentQuantity }}
                    </span>
                  </div>

                  <div class="preview-item d-flex justify-content-between mb-2">
                    <span class="text-muted">New Stock:</span>
                    <span class="font-weight-bold text-success">{{ form.current_stock || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Approval Requirements -->
          <div class="card card-custom">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-shield text-danger mr-2"></i>
                Approval Requirements
              </h5>
            </div>
            <div class="card-body">
              <div class="approval-requirements">
                <div class="requirement-item mb-2">
                  <i class="flaticon2-check text-success mr-2"></i>
                  <small>Large adjustments may require approval</small>
                </div>
                <div class="requirement-item mb-2">
                  <i class="flaticon2-check text-success mr-2"></i>
                  <small>Documentation must be provided</small>
                </div>
                <div class="requirement-item mb-2">
                  <i class="flaticon2-check text-success mr-2"></i>
                  <small>Audit trail will be maintained</small>
                </div>
                <div class="requirement-item">
                  <i class="flaticon2-check text-success mr-2"></i>
                  <small>Review by supervisor recommended</small>
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
                  Processing adjustment...
                </span>
                <span v-else-if="success" class="text-success">
                  <i class="flaticon2-check mr-1"></i>
                  Stock adjustment completed successfully!
                </span>
              </div>

              <div class="action-buttons">
                <button type="button" @click="$emit('cancel')" class="btn btn-light btn-lg mr-3">
                  <i class="flaticon2-close mr-2"></i>
                  Cancel
                </button>
                <button type="submit" class="btn btn-warning btn-lg" :disabled="loading">
                  <i class="flaticon2-edit mr-2"></i>
                  {{ loading ? 'Processing...' : 'Process Adjustment' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-warning" role="status">
        <span class="sr-only">Processing adjustment...</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StockAdjustmentForm',
  data() {
    return {
      loading: false,
      success: false,
      errors: {},
      form: {
        item_id: '',
        adjustment_type: '',
        current_stock: '',
        unit_cost: '',
        location: '',
        adjustment_date: '',
        reason: '',
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

    systemStockLevel() {
      return this.selectedItem?.current_stock || 0;
    },

    adjustmentQuantity() {
      if (!this.form.current_stock || !this.selectedItem) return 0;
      const current = parseFloat(this.form.current_stock);
      const system = parseFloat(this.systemStockLevel);
      return (current - system).toFixed(2);
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
      this.form.adjustment_date = this.currentDateTime;
    },

    handleItemChange() {
      if (this.form.item_id) {
        this.selectedItem = this.availableItems.find(item => item.id === this.form.item_id);
        if (this.selectedItem) {
          this.form.unit_cost = this.selectedItem.unit_cost || '';
          this.form.location = this.selectedItem.location || '';
          this.form.current_stock = this.selectedItem.current_stock || '';
        }
      } else {
        this.selectedItem = null;
      }
    },

    handleAdjustmentTypeChange() {
      // Reset some fields when adjustment type changes
      if (this.form.adjustment_type === 'PHYSICAL_VERIFICATION') {
        this.form.reason = 'Physical stock count verification revealed discrepancy';
      } else if (this.form.adjustment_type === 'COUNT_DIFFERENCE') {
        this.form.reason = 'Stock count difference identified during inventory check';
      }
    },

    getAdjustmentTypeDescription() {
      const descriptions = {
        COUNT_DIFFERENCE: 'Correcting stock count discrepancies',
        DAMAGED: 'Removing damaged or unusable items',
        EXPIRED: 'Disposing expired items',
        THEFT: 'Recording stolen or missing items',
        SYSTEM_ERROR: 'Correcting system calculation errors',
        PHYSICAL_VERIFICATION: 'Adjusting based on physical count',
        OTHER: 'Other adjustment reason',
      };
      return descriptions[this.form.adjustment_type] || 'Select adjustment type';
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

    getDifferenceClass() {
      const diff = parseFloat(this.adjustmentQuantity);
      if (diff > 0) return 'text-success';
      if (diff < 0) return 'text-danger';
      return 'text-muted';
    },

    calculateFinancialImpact() {
      const diff = Math.abs(parseFloat(this.adjustmentQuantity));
      const unitCost = parseFloat(this.form.unit_cost) || 0;
      return diff * unitCost;
    },

    getFinancialImpactClass() {
      const impact = this.calculateFinancialImpact();
      if (impact === 0) return 'text-muted';
      if (impact <= 100) return 'text-warning';
      if (impact <= 500) return 'text-info';
      return 'text-danger';
    },

    getStockStatusLabel() {
      if (!this.form.current_stock) return 'Not specified';

      const stock = parseFloat(this.form.current_stock);
      const minStock = this.selectedItem?.minimum_stock || 0;

      if (stock === 0) return 'Out of Stock';
      if (stock <= minStock) return 'Low Stock';
      return 'Normal Stock';
    },

    getStockStatusClass() {
      if (!this.form.current_stock) return 'text-muted';

      const stock = parseFloat(this.form.current_stock);
      const minStock = this.selectedItem?.minimum_stock || 0;

      if (stock === 0) return 'text-danger';
      if (stock <= minStock) return 'text-warning';
      return 'text-success';
    },

    getImpactAlertClass() {
      const diff = Math.abs(parseFloat(this.adjustmentQuantity));
      const impact = this.calculateFinancialImpact();

      if (diff === 0) return 'alert-info';
      if (diff <= 10 && impact <= 100) return 'alert-warning';
      if (diff <= 50 && impact <= 500) return 'alert-warning';
      return 'alert-danger';
    },

    getImpactAlertTitle() {
      const diff = Math.abs(parseFloat(this.adjustmentQuantity));
      const impact = this.calculateFinancialImpact();

      if (diff === 0) return 'No Adjustment Needed';
      if (diff <= 10 && impact <= 100) return 'Minor Adjustment';
      if (diff <= 50 && impact <= 500) return 'Moderate Adjustment';
      return 'Major Adjustment - Review Required';
    },

    getImpactAlertMessage() {
      const diff = Math.abs(parseFloat(this.adjustmentQuantity));
      const impact = this.calculateFinancialImpact();

      if (diff === 0) return 'Current stock matches system stock. No adjustment needed.';
      if (diff <= 10 && impact <= 100)
        return 'This is a minor adjustment that can be processed normally.';
      if (diff <= 50 && impact <= 500)
        return 'This is a moderate adjustment. Consider supervisor review.';
      return 'This is a major adjustment. Supervisor approval and detailed documentation required.';
    },

    formatCurrency(amount) {
      return parseFloat(amount || 0).toFixed(2);
    },

    validateForm() {
      this.errors = {};

      if (!this.form.item_id) {
        this.errors.item_id = 'Item is required';
      }

      if (!this.form.adjustment_type) {
        this.errors.adjustment_type = 'Adjustment type is required';
      }

      if (!this.form.current_stock || parseFloat(this.form.current_stock) < 0) {
        this.errors.current_stock = 'Valid current stock level is required';
      }

      if (this.form.unit_cost && parseFloat(this.form.unit_cost) < 0) {
        this.errors.unit_cost = 'Unit cost cannot be negative';
      }

      if (!this.form.reason) {
        this.errors.reason = 'Reason for adjustment is required';
      }

      if (this.form.adjustment_date && new Date(this.form.adjustment_date) > new Date()) {
        this.errors.adjustment_date = 'Adjustment date cannot be in the future';
      }

      // Validate that adjustment makes sense
      const diff = Math.abs(parseFloat(this.adjustmentQuantity));
      if (diff > 1000) {
        this.errors.current_stock =
          'Adjustment quantity is unusually large. Please verify the count.';
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
        const adjustmentData = {
          ...this.form,
          adjustment_quantity: parseFloat(this.adjustmentQuantity),
          financial_impact: this.calculateFinancialImpact(),
        };

        // Convert string numbers to actual numbers
        if (adjustmentData.current_stock)
          adjustmentData.current_stock = parseFloat(adjustmentData.current_stock);
        if (adjustmentData.unit_cost)
          adjustmentData.unit_cost = parseFloat(adjustmentData.unit_cost);

        // Remove empty optional fields
        Object.keys(adjustmentData).forEach(key => {
          if (adjustmentData[key] === '' || adjustmentData[key] === null) {
            delete adjustmentData[key];
          }
        });

        // Create movement record for the adjustment
        const movementData = {
          item_id: this.form.item_id,
          movement_type: 'ADJUSTMENT',
          quantity: parseFloat(this.adjustmentQuantity),
          unit_cost: this.form.unit_cost,
          reference_type: 'ADJUSTMENT',
          reference_id: `ADJ-${Date.now()}`,
          from_location: this.form.location,
          to_location: this.form.location,
          notes: `Stock Adjustment: ${this.form.reason}. ${this.form.notes || ''}`,
          movement_date: this.form.adjustment_date,
        };

        await this.$store.dispatch('generalStore/createMovement', movementData);

        this.success = true;
        this.$emit('adjustment-created');

        // Reset form after successful creation
        setTimeout(() => {
          this.resetForm();
        }, 2000);
      } catch (error) {
        console.error('Error processing adjustment:', error);
        this.$toast.error('Failed to process adjustment. Please try again.');
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.form = {
        item_id: '',
        adjustment_type: '',
        current_stock: '',
        unit_cost: '',
        location: '',
        adjustment_date: this.currentDateTime,
        reason: '',
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
.stock-adjustment-form {
  position: relative;
}

.form-header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
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
  border-color: #ffc107;
  box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.25);
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
  color: #6c757d;
}

.impact-item {
  text-align: center;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
}

.impact-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
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

.adjustment-preview {
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

.icon-circle-warning {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
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

.approval-requirements .requirement-item {
  display: flex;
  align-items: center;
}

.approval-requirements .requirement-item i {
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
