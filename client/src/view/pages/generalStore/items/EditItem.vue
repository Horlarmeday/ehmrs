<template>
  <div class="edit-item-form">
    <!-- Form Header -->
    <div class="form-header mb-4">
      <h3 class="text-dark font-weight-bold mb-2">
        <i class="flaticon2-edit text-warning mr-2"></i>
        Edit Item: {{ item?.name }}
      </h3>
      <p class="text-muted mb-0">Update item information and settings</p>
    </div>

    <!-- Main Form -->
    <form @submit.prevent="handleSubmit" class="item-form">
      <div class="card card-custom mb-4">
        <div class="card-header">
          <h5 class="card-title mb-0">
            <i class="flaticon2-box text-primary mr-2"></i>
            Item Details
          </h5>
        </div>
        <div class="card-body">
          <h6 class="text-muted mb-3">Basic Information</h6>
          <div class="row">
            <div class="col-md-8 mb-3">
              <label class="form-label required">Item Name</label>
              <input
                v-model="form.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.name }"
                required
              />
              <div v-if="errors.name" class="invalid-feedback d-block">
                {{ errors.name }}
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label required">Category</label>
              <select
                v-model="form.category_id"
                class="form-control"
                :class="{ 'is-invalid': errors.category_id }"
                @change="handleCategoryChange"
                required
              >
                <option value="">Select Category</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
              <div v-if="errors.category_id" class="invalid-feedback d-block">
                {{ errors.category_id }}
              </div>
            </div>

            <div class="col-12 mb-3">
              <label class="form-label">Description</label>
              <textarea
                v-model="form.description"
                class="form-control"
                :class="{ 'is-invalid': errors.description }"
                rows="2"
              ></textarea>
              <div v-if="errors.description" class="invalid-feedback d-block">
                {{ errors.description }}
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label">Subcategory</label>
              <select
                v-model="form.subcategory_id"
                class="form-control"
                :class="{ 'is-invalid': errors.subcategory_id }"
                :disabled="!form.category_id"
              >
                <option value="">Select Subcategory (Optional)</option>
                <option
                  v-for="subcategory in filteredSubcategories"
                  :key="subcategory.id"
                  :value="subcategory.id"
                >
                  {{ subcategory.name }}
                </option>
              </select>
              <div v-if="errors.subcategory_id" class="invalid-feedback d-block">
                {{ errors.subcategory_id }}
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label required">Unit</label>
              <select
                v-model="form.unit_id"
                class="form-control"
                :class="{ 'is-invalid': errors.unit_id }"
                required
              >
                <option value="">Select Unit</option>
                <option v-for="unit in units" :key="unit.id" :value="unit.id">
                  {{ unit.name }}
                </option>
              </select>
              <div v-if="errors.unit_id" class="invalid-feedback d-block">
                {{ errors.unit_id }}
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label required">Supplier</label>
              <select
                v-model="form.supplier_id"
                class="form-control"
                :class="{ 'is-invalid': errors.supplier_id }"
                required
              >
                <option value="">Select Supplier</option>
                <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
              <div v-if="errors.supplier_id" class="invalid-feedback d-block">
                {{ errors.supplier_id }}
              </div>
            </div>
          </div>

          <hr />
          <h6 class="text-muted mb-3">Stock & Cost</h6>
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label required">Initial Stock</label>
              <input
                v-model="form.initial_stock"
                type="number"
                min="0"
                class="form-control"
                :class="{ 'is-invalid': errors.initial_stock }"
                required
              />
              <div v-if="errors.initial_stock" class="invalid-feedback d-block">
                {{ errors.initial_stock }}
              </div>
              <small class="form-text text-muted"> Starting quantity </small>
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label required">Unit Cost</label>
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
                  required
                />
              </div>
              <div v-if="errors.unit_cost" class="invalid-feedback d-block">
                {{ errors.unit_cost }}
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label">Total Value</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text">$</span>
                </div>
                <input :value="calculatedTotalValue" type="text" class="form-control" readonly />
              </div>
              <small class="form-text text-muted"> Calculated: Initial Stock × Unit Cost </small>
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label required">Minimum Stock</label>
              <input
                v-model="form.minimum_stock"
                type="number"
                min="0"
                class="form-control"
                :class="{ 'is-invalid': errors.minimum_stock }"
                required
              />
              <div v-if="errors.minimum_stock" class="invalid-feedback d-block">
                {{ errors.minimum_stock }}
              </div>
              <small class="form-text text-muted"> Reorder level </small>
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label">Maximum Stock</label>
              <input
                v-model="form.maximum_stock"
                type="number"
                min="0"
                class="form-control"
                :class="{ 'is-invalid': errors.maximum_stock }"
              />
              <div v-if="errors.maximum_stock" class="invalid-feedback d-block">
                {{ errors.maximum_stock }}
              </div>
              <small class="form-text text-muted">Optional</small>
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label">Status</label>
              <select
                v-model="form.status"
                class="form-control"
                :class="{ 'is-invalid': errors.status }"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
              <div v-if="errors.status" class="invalid-feedback d-block">
                {{ errors.status }}
              </div>
            </div>
          </div>

          <hr />
          <h6 class="text-muted mb-3">Storage & Tracking</h6>
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Storage Location</label>
              <input
                v-model="form.location"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.location }"
              />
              <div v-if="errors.location" class="invalid-feedback d-block">
                {{ errors.location }}
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label">Shelf Number</label>
              <input
                v-model="form.shelf_number"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.shelf_number }"
              />
              <div v-if="errors.shelf_number" class="invalid-feedback d-block">
                {{ errors.shelf_number }}
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label">Expiry Date</label>
              <input
                v-model="form.expiry_date"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': errors.expiry_date }"
                :min="today"
              />
              <div v-if="errors.expiry_date" class="invalid-feedback d-block">
                {{ errors.expiry_date }}
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <div class="custom-control custom-checkbox">
                <input
                  v-model="form.is_expirable"
                  type="checkbox"
                  class="custom-control-input"
                  id="is_expirable"
                />
                <label class="custom-control-label" for="is_expirable"> Item expires </label>
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <div class="custom-control custom-checkbox">
                <input
                  v-model="form.is_serialized"
                  type="checkbox"
                  class="custom-control-input"
                  id="is_serialized"
                />
                <label class="custom-control-label" for="is_serialized"> Serialized item </label>
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <div class="custom-control custom-checkbox">
                <input
                  v-model="form.is_lot_tracked"
                  type="checkbox"
                  class="custom-control-input"
                  id="is_lot_tracked"
                />
                <label class="custom-control-label" for="is_lot_tracked"> Lot tracked </label>
              </div>
            </div>
          </div>

          <hr />
          <h6 class="text-muted mb-3">Technical Details</h6>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Manufacturer</label>
              <input
                v-model="form.manufacturer"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.manufacturer }"
              />
              <div v-if="errors.manufacturer" class="invalid-feedback d-block">
                {{ errors.manufacturer }}
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Model Number</label>
              <input
                v-model="form.model_number"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.model_number }"
              />
              <div v-if="errors.model_number" class="invalid-feedback d-block">
                {{ errors.model_number }}
              </div>
            </div>

            <div class="col-12 mb-3">
              <label class="form-label">Specifications</label>
              <textarea
                v-model="form.specifications"
                class="form-control"
                :class="{ 'is-invalid': errors.specifications }"
                rows="2"
              ></textarea>
              <div v-if="errors.specifications" class="invalid-feedback d-block">
                {{ errors.specifications }}
              </div>
              <small class="form-text text-muted">
                Technical specifications in JSON format (e.g., {"color": "blue", "size": "large"})
              </small>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="d-flex justify-content-between align-items-center">
            <div class="form-status">
              <span v-if="loading" class="text-info">
                <i class="flaticon2-refresh fa-spin mr-1"></i>
                Updating item...
              </span>
              <span v-else-if="success" class="text-success">
                <i class="flaticon2-check mr-1"></i>
                Item updated successfully!
              </span>
            </div>

            <div class="action-buttons">
              <button type="button" @click="$emit('cancel')" class="btn btn-light btn-lg mr-3">
                <i class="flaticon2-close mr-2"></i>
                Cancel
              </button>
              <button type="submit" class="btn btn-warning btn-lg" :disabled="loading">
                <i class="flaticon2-edit mr-2"></i>
                {{ loading ? 'Updating...' : 'Update Item' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-warning" role="status">
        <span class="sr-only">Updating item...</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditItemForm',
  props: {
    item: {
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
        name: '',
        description: '',
        category_id: '',
        subcategory_id: '',
        unit_id: '',
        supplier_id: '',
        status: 'ACTIVE',
        manufacturer: '',
        model_number: '',
        specifications: '',
        initial_stock: '',
        unit_cost: '',
        minimum_stock: '',
        maximum_stock: '',
        location: '',
        shelf_number: '',
        expiry_date: '',
        is_expirable: false,
        is_serialized: false,
        is_lot_tracked: false,
      },
    };
  },
  computed: {
    today() {
      return new Date().toISOString().split('T')[0];
    },
    calculatedTotalValue() {
      const initialStock = parseFloat(this.form.initial_stock) || 0;
      const unitCost = parseFloat(this.form.unit_cost) || 0;
      return (initialStock * unitCost).toFixed(2);
    },
    filteredSubcategories() {
      if (!this.form.category_id) return [];
      return this.subcategories.filter((sub) => sub.category_id === this.form.category_id);
    },
    categories() {
      return this.$store.state.generalStore.categories;
    },
    subcategories() {
      return this.$store.state.generalStore.subcategories;
    },
    units() {
      return this.$store.state.model.units;
    },
    suppliers() {
      return this.$store.state.store.vendors;
    },
  },
  async created() {
    await this.loadFormData();
    this.populateForm();
  },
  methods: {
    async loadFormData() {
      try {
        // Load categories, units, and suppliers
        await Promise.all([
          this.$store.dispatch('generalStore/fetchCategories'),
          this.$store.dispatch('generalStore/fetchSubcategories'),
          this.loadUnits(),
          this.loadSuppliers(),
        ]);
      } catch (error) {
        this.$toast.error('Failed to load form data');
      }
    },

    async loadUnits() {
      try {
        await this.$store.dispatch('model/fetchUnits', {
          currentPage: 1,
          itemsPerPage: 100,
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to load units',
          type: 'error',
        });
      }
    },

    async loadSuppliers() {
      try {
        await this.$store.dispatch('store/fetchVendors', {
          currentPage: 1,
          itemsPerPage: 100,
        });
      } catch (error) {
        this.$notify({
          message: 'Failed to load suppliers',
          type: 'error',
        });
      }
    },

    populateForm() {
      if (this.item) {
        this.form = {
          name: this.item.name || '',
          description: this.item.description || '',
          category_id: this.item.category_id || '',
          subcategory_id: this.item.subcategory_id || '',
          unit_id: this.item.unit_id || '',
          supplier_id: this.item.supplier_id || '',
          status: this.item.status || 'ACTIVE',
          manufacturer: this.item.manufacturer || '',
          model_number: this.item.model_number || '',
          specifications: this.item.specifications || '',
          initial_stock: this.item.current_stock || '', // Use current_stock as initial_stock for editing
          unit_cost: this.item.unit_cost || '',
          minimum_stock: this.item.minimum_stock || '',
          maximum_stock: this.item.maximum_stock || '',
          location: this.item.location || '',
          shelf_number: this.item.shelf_number || '',
          expiry_date: this.item.expiry_date || '',
          is_expirable: this.item.is_expirable || false,
          is_serialized: this.item.is_serialized || false,
          is_lot_tracked: this.item.is_lot_tracked || false,
        };
      }
    },

    handleCategoryChange() {
      this.form.subcategory_id = '';
    },

    validateForm() {
      this.errors = {};

      // Required field validations
      if (!this.form.name) {
        this.errors.name = 'Item name is required';
      } else if (this.form.name.length < 2) {
        this.errors.name = 'Item name must be at least 2 characters';
      } else if (this.form.name.length > 100) {
        this.errors.name = 'Item name cannot exceed 100 characters';
      }

      if (!this.form.category_id) {
        this.errors.category_id = 'Category is required';
      }

      if (!this.form.unit_id) {
        this.errors.unit_id = 'Unit is required';
      }

      if (!this.form.supplier_id) {
        this.errors.supplier_id = 'Supplier is required';
      }

      // Numeric validations
      if (!this.form.initial_stock && this.form.initial_stock !== 0) {
        this.errors.initial_stock = 'Initial stock is required';
      } else if (isNaN(this.form.initial_stock) || parseInt(this.form.initial_stock) < 0) {
        this.errors.initial_stock = 'Initial stock must be a non-negative number';
      }

      if (!this.form.unit_cost) {
        this.errors.unit_cost = 'Unit cost is required';
      } else if (isNaN(this.form.unit_cost) || parseFloat(this.form.unit_cost) <= 0) {
        this.errors.unit_cost = 'Unit cost must be a positive number';
      } else if (parseFloat(this.form.unit_cost) > 999999.99) {
        this.errors.unit_cost = 'Unit cost cannot exceed $999,999.99';
      }

      if (!this.form.minimum_stock && this.form.minimum_stock !== 0) {
        this.errors.minimum_stock = 'Minimum stock is required';
      } else if (isNaN(this.form.minimum_stock) || parseInt(this.form.minimum_stock) < 0) {
        this.errors.minimum_stock = 'Minimum stock must be a non-negative number';
      }

      if (this.form.maximum_stock) {
        if (isNaN(this.form.maximum_stock) || parseInt(this.form.maximum_stock) < 0) {
          this.errors.maximum_stock = 'Maximum stock must be a non-negative number';
        } else if (parseInt(this.form.maximum_stock) <= parseInt(this.form.minimum_stock)) {
          this.errors.maximum_stock = 'Maximum stock must be greater than minimum stock';
        }
      }

      // Optional field validations
      if (this.form.description && this.form.description.length > 500) {
        this.errors.description = 'Description cannot exceed 500 characters';
      }

      if (this.form.manufacturer && this.form.manufacturer.length > 100) {
        this.errors.manufacturer = 'Manufacturer name cannot exceed 100 characters';
      }

      if (this.form.model_number && this.form.model_number.length > 50) {
        this.errors.model_number = 'Model number cannot exceed 50 characters';
      }

      if (this.form.location && this.form.location.length > 100) {
        this.errors.location = 'Location cannot exceed 100 characters';
      }

      if (this.form.shelf_number && this.form.shelf_number.length > 50) {
        this.errors.shelf_number = 'Shelf number cannot exceed 50 characters';
      }

      // Date validations
      if (this.form.expiry_date && this.form.expiry_date < this.today) {
        this.errors.expiry_date = 'Expiry date cannot be in the past';
      }

      // Specifications validation (if provided, should be valid JSON)
      if (this.form.specifications) {
        try {
          JSON.parse(this.form.specifications);
        } catch (e) {
          this.errors.specifications = 'Specifications must be valid JSON format';
        }
      }

      return Object.keys(this.errors).length === 0;
    },

    hasError(field) {
      return !!this.errors[field];
    },

    getError(field) {
      return this.errors[field];
    },

    async handleSubmit() {
      if (this.loading) return;

      // Validate form
      if (!this.validateForm()) {
        this.$toast.error('Please fix the validation errors before submitting.');
        return;
      }

      this.loading = true;
      this.success = false;

      try {
        const itemData = { ...this.form };

        // Convert string numbers to actual numbers
        if (itemData.initial_stock) itemData.initial_stock = parseInt(itemData.initial_stock);
        if (itemData.unit_cost) itemData.unit_cost = parseFloat(itemData.unit_cost);
        if (itemData.minimum_stock) itemData.minimum_stock = parseInt(itemData.minimum_stock);
        if (itemData.maximum_stock) itemData.maximum_stock = parseInt(itemData.maximum_stock);

        // Remove empty optional fields
        Object.keys(itemData).forEach((key) => {
          if (itemData[key] === '' || itemData[key] === null) {
            delete itemData[key];
          }
        });

        await this.$store.dispatch('generalStore/updateItem', {
          id: this.item.id,
          data: itemData,
        });

        this.success = true;
        this.$emit('item-updated');

        // Reset form after successful update
        setTimeout(() => {
          this.success = false;
        }, 2000);
      } catch (error) {
        console.error('Error updating item:', error);
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
        } else {
          this.$toast.error('Failed to update item. Please try again.');
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.edit-item-form {
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

.custom-control-input:checked ~ .custom-control-label::before {
  background-color: #ffc107;
  border-color: #ffc107;
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
