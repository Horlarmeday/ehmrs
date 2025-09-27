<template>
  <div class="edit-category-form">
    <!-- Form Header -->
    <div class="form-header mb-4">
      <h3 class="text-dark font-weight-bold mb-2">
        <i class="flaticon2-edit text-warning mr-2"></i>
        Edit Category: {{ category?.name }}
      </h3>
      <p class="text-muted mb-0">Update category information and settings</p>
    </div>

    <!-- Main Form -->
    <form @submit.prevent="handleSubmit" class="category-form">
      <div class="row">
        <!-- Basic Information -->
        <div class="col-lg-8">
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-folder text-success mr-2"></i>
                Basic Information
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label required">Category Name</label>
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

                <div class="col-md-6 mb-3">
                  <label class="form-label">Category Code</label>
                  <input
                    v-model="form.code"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.code }"
                  />
                  <div v-if="errors.code" class="invalid-feedback d-block">
                    {{ errors.code }}
                  </div>
                  <small class="form-text text-muted">
                    Optional unique identifier for the category
                  </small>
                </div>

                <div class="col-12 mb-3">
                  <label class="form-label">Description</label>
                  <textarea
                    v-model="form.description"
                    class="form-control"
                    :class="{ 'is-invalid': errors.description }"
                    rows="3"
                  ></textarea>
                  <div v-if="errors.description" class="invalid-feedback d-block">
                    {{ errors.description }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Parent Category</label>
                  <select
                    v-model="form.parent_id"
                    class="form-control"
                    :class="{ 'is-invalid': errors.parent_id }"
                    @change="handleParentChange"
                  >
                    <option value="">No Parent (Root Category)</option>
                    <option
                      v-for="category in parentCategories"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.name }}
                    </option>
                  </select>
                  <div v-if="errors.parent_id" class="invalid-feedback d-block">
                    {{ errors.parent_id }}
                  </div>
                  <small class="form-text text-muted">
                    Leave empty to make this a root category, or select a parent to make it a
                    subcategory
                  </small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Sort Order</label>
                  <input
                    v-model="form.sort_order"
                    type="number"
                    min="0"
                    class="form-control"
                    :class="{ 'is-invalid': errors.sort_order }"
                  />
                  <div v-if="errors.sort_order" class="invalid-feedback d-block">
                    {{ errors.sort_order }}
                  </div>
                  <small class="form-text text-muted">
                    Order in which categories appear (lower numbers first)
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Settings -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-settings text-success mr-2"></i>
                Category Settings
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Icon Class</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text">
                        <i class="flaticon2-folder"></i>
                      </span>
                    </div>
                    <input
                      v-model="form.icon_class"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.icon_class }"
                    />
                  </div>
                  <div v-if="errors.icon_class" class="invalid-feedback d-block">
                    {{ errors.icon_class }}
                  </div>
                  <small class="form-text text-muted">
                    CSS class for the category icon (e.g., flaticon2-folder, flaticon2-box)
                  </small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Color Theme</label>
                  <select
                    v-model="form.color_theme"
                    class="form-control"
                    :class="{ 'is-invalid': errors.color_theme }"
                  >
                    <option value="">Default</option>
                    <option value="primary">Primary (Blue)</option>
                    <option value="success">Success (Green)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="danger">Danger (Red)</option>
                    <option value="info">Info (Cyan)</option>
                    <option value="secondary">Secondary (Gray)</option>
                    <option value="dark">Dark (Black)</option>
                  </select>
                  <div v-if="errors.color_theme" class="invalid-feedback d-block">
                    {{ errors.color_theme }}
                  </div>
                  <small class="form-text text-muted">
                    Color theme for the category in the interface
                  </small>
                </div>

                <div class="col-12 mb-3">
                  <label class="form-label">Additional Metadata</label>
                  <textarea
                    v-model="form.metadata"
                    class="form-control"
                    :class="{ 'is-invalid': errors.metadata }"
                    rows="3"
                  ></textarea>
                  <div v-if="errors.metadata" class="invalid-feedback d-block">
                    {{ errors.metadata }}
                  </div>
                  <small class="form-text text-muted">
                    Additional metadata in JSON format (e.g., {"department": "IT", "location":
                    "Building A"})
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Information -->
        <div class="col-lg-4">
          <!-- Category Preview -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-eye text-success mr-2"></i>
                Category Preview
              </h5>
            </div>
            <div class="card-body">
              <div class="category-preview text-center">
                <div class="preview-icon mb-3">
                  <div class="icon-circle" :class="getPreviewIconClass()">
                    <i :class="form.icon_class || 'flaticon2-folder'"></i>
                  </div>
                </div>

                <h5 class="font-weight-bold text-dark mb-2">{{ form.name || 'Category Name' }}</h5>
                <p class="text-muted mb-3">
                  {{ form.description || 'Category description will appear here' }}
                </p>

                <div class="preview-meta">
                  <span v-if="form.parent_id" class="badge badge-light-info mr-2">
                    Subcategory of {{ getParentCategoryName(form.parent_id) }}
                  </span>
                  <span v-else class="badge badge-success"> Root Category </span>
                </div>

                <div class="preview-stats mt-3">
                  <div class="row text-center">
                    <div class="col-6">
                      <div class="stat-item">
                        <span class="stat-number">{{ category?.subcategories_count || 0 }}</span>
                        <small class="stat-label d-block">Subcategories</small>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="stat-item">
                        <span class="stat-number">{{ category?.items_count || 0 }}</span>
                        <small class="stat-label d-block">Items</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Options -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-gear text-success mr-2"></i>
                Category Options
              </h5>
            </div>
            <div class="card-body">
              <div class="category-options">
                <div class="mb-3">
                  <div class="custom-control custom-checkbox">
                    <input
                      v-model="form.is_active"
                      type="checkbox"
                      class="custom-control-input"
                      id="is_active"
                    />
                    <label class="custom-control-label" for="is_active"> Category is active </label>
                  </div>
                  <small class="form-text text-muted">
                    Inactive categories won't be visible to users
                  </small>
                </div>

                <div class="mb-3">
                  <div class="custom-control custom-checkbox">
                    <input
                      v-model="form.is_featured"
                      type="checkbox"
                      class="custom-control-input"
                      id="is_featured"
                    />
                    <label class="custom-control-label" for="is_featured">
                      Featured category
                    </label>
                  </div>
                  <small class="form-text text-muted">
                    Featured categories appear prominently in the interface
                  </small>
                </div>

                <div class="mb-3">
                  <div class="custom-control custom-checkbox">
                    <input
                      v-model="form.requires_approval"
                      type="checkbox"
                      class="custom-control-input"
                      id="requires_approval"
                    />
                    <label class="custom-control-label" for="requires_approval">
                      Requires approval
                    </label>
                  </div>
                  <small class="form-text text-muted">
                    Items in this category require approval before use
                  </small>
                </div>

                <div class="mb-3">
                  <div class="custom-control custom-checkbox">
                    <input
                      v-model="form.is_restricted"
                      type="checkbox"
                      class="custom-control-input"
                      id="is_restricted"
                    />
                    <label class="custom-control-label" for="is_restricted">
                      Restricted access
                    </label>
                  </div>
                  <small class="form-text text-muted">
                    Only authorized users can access this category
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Warning Card -->
          <div class="card card-custom border-warning">
            <div class="card-header bg-warning text-white">
              <h5 class="card-title mb-0">
                <i class="flaticon2-warning mr-2"></i>
                Important Notes
              </h5>
            </div>
            <div class="card-body">
              <div class="warning-notes">
                <div class="warning-item mb-2">
                  <i class="flaticon2-check text-warning mr-2"></i>
                  <small>Changes will affect all subcategories and items</small>
                </div>
                <div class="warning-item mb-2">
                  <i class="flaticon2-check text-warning mr-2"></i>
                  <small>Deactivating will hide the category from users</small>
                </div>
                <div class="warning-item">
                  <i class="flaticon2-check text-warning mr-2"></i>
                  <small>Parent changes may affect item organization</small>
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
                  Updating category...
                </span>
                <span v-else-if="success" class="text-success">
                  <i class="flaticon2-check mr-1"></i>
                  Category updated successfully!
                </span>
              </div>

              <div class="action-buttons">
                <button type="button" @click="$emit('cancel')" class="btn btn-light btn-lg mr-3">
                  <i class="flaticon2-close mr-2"></i>
                  Cancel
                </button>
                <button type="submit" class="btn btn-warning btn-lg" :disabled="loading">
                  <i class="flaticon2-edit mr-2"></i>
                  {{ loading ? 'Updating...' : 'Update Category' }}
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
        <span class="sr-only">Updating category...</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditCategoryForm',
  props: {
    category: {
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
        code: '',
        description: '',
        parent_id: '',
        sort_order: 0,
        icon_class: 'flaticon2-folder',
        color_theme: '',
        metadata: '',
        is_active: true,
        is_featured: false,
        requires_approval: false,
        is_restricted: false,
      },
      parentCategories: [],
    };
  },
  async created() {
    await this.loadFormData();
    this.populateForm();
  },
  methods: {
    async loadFormData() {
      try {
        // Load parent categories (excluding current category and its descendants)
        await this.$store.dispatch('generalStore/fetchCategories', { parent_id: null });
        this.parentCategories = this.$store.state.generalStore.categories.filter(
          (cat) => cat.id !== this.category.id && !this.isDescendant(cat.id)
        );
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    },

    isDescendant(categoryId) {
      console.log('categoryId', categoryId);
      // Simple check to prevent circular references
      // In a real implementation, you'd want a more sophisticated check
      return false;
    },

    populateForm() {
      if (this.category) {
        this.form = {
          name: this.category.name || '',
          code: this.category.code || '',
          description: this.category.description || '',
          parent_id: this.category.parent_id || '',
          sort_order: this.category.sort_order || 0,
          icon_class: this.category.icon_class || 'flaticon2-folder',
          color_theme: this.category.color_theme || '',
          metadata: this.category.metadata || '',
          is_active: this.category.is_active !== undefined ? this.category.is_active : true,
          is_featured: this.category.is_featured || false,
          requires_approval: this.category.requires_approval || false,
          is_restricted: this.category.is_restricted || false,
        };
      }
    },

    handleParentChange() {
      // Reset some fields when parent changes
      if (this.form.parent_id) {
        this.form.icon_class = 'flaticon2-folder';
        this.form.color_theme = '';
      }
    },

    getParentCategoryName(parentId) {
      const category = this.parentCategories.find((c) => c.id === parentId);
      return category ? category.name : 'Unknown';
    },

    getPreviewIconClass() {
      if (this.form.parent_id) {
        return 'icon-circle-subcategory';
      }
      return 'icon-circle-parent';
    },

    validateForm() {
      this.errors = {};

      if (!this.form.name) {
        this.errors.name = 'Category name is required';
      }

      if (this.form.name && this.form.name.length < 2) {
        this.errors.name = 'Category name must be at least 2 characters long';
      }

      if (this.form.name && this.form.name.length > 100) {
        this.errors.name = 'Category name must be less than 100 characters';
      }

      if (this.form.code && this.form.code.length > 20) {
        this.errors.code = 'Category code must be less than 20 characters';
      }

      if (this.form.description && this.form.description.length > 500) {
        this.errors.description = 'Description must be less than 500 characters';
      }

      if (this.form.sort_order && (this.form.sort_order < 0 || this.form.sort_order > 9999)) {
        this.errors.sort_order = 'Sort order must be between 0 and 9999';
      }

      if (this.form.metadata) {
        try {
          JSON.parse(this.form.metadata);
        } catch {
          this.errors.metadata = 'Metadata must be valid JSON format';
        }
      }

      // Prevent circular reference
      if (this.form.parent_id && this.form.parent_id === this.category.id) {
        this.errors.parent_id = 'Category cannot be its own parent';
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
        const categoryData = { ...this.form };

        // Convert string numbers to actual numbers
        if (categoryData.sort_order) categoryData.sort_order = parseInt(categoryData.sort_order);

        // Remove empty optional fields
        Object.keys(categoryData).forEach((key) => {
          if (categoryData[key] === '' || categoryData[key] === null) {
            delete categoryData[key];
          }
        });

        await this.$store.dispatch('generalStore/updateCategory', {
          id: this.category.id,
          data: categoryData,
        });

        this.success = true;
        this.$emit('category-updated');

        // Reset form after successful update
        setTimeout(() => {
          this.success = false;
        }, 2000);
      } catch (error) {
        console.error('Error updating category:', error);
        this.$toast.error('Failed to update category. Please try again.');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.edit-category-form {
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

.category-preview {
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

.icon-circle-parent {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.icon-circle-subcategory {
  background: linear-gradient(135deg, #17a2b8, #6f42c1);
}

.preview-icon .icon-circle i {
  font-size: 2rem;
}

.preview-stats .stat-item {
  padding: 0.5rem;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: bold;
  color: #495057;
}

.stat-label {
  color: #6c757d;
  font-size: 0.75rem;
}

.category-options .custom-control {
  margin-bottom: 1rem;
}

.warning-notes .warning-item {
  display: flex;
  align-items: center;
}

.warning-notes .warning-item i {
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
