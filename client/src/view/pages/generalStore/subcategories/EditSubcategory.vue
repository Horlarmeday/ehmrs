<template>
  <div class="edit-subcategory">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col">
                <h3 class="card-title">Edit Subcategory</h3>
                <p class="card-text">Update subcategory information</p>
              </div>
              <div class="col-auto">
                <router-link
                  :to="{
                    name: 'general-store-subcategory-details',
                    params: { id: subcategory.id },
                  }"
                  class="btn btn-secondary"
                >
                  <i class="fas fa-arrow-left"></i> Back to Details
                </router-link>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
              </div>
              <p class="mt-3">Loading subcategory...</p>
            </div>

            <form v-else @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="name">Subcategory Name *</label>
                    <input
                      id="name"
                      v-model="form.name"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.name }"
                      placeholder="Enter subcategory name"
                      required
                    />
                    <div v-if="errors.name" class="invalid-feedback">
                      {{ errors.name }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="category">Parent Category *</label>
                    <select
                      id="category"
                      v-model="form.category_id"
                      class="form-control"
                      :class="{ 'is-invalid': errors.category_id }"
                      required
                    >
                      <option value="">Select a category</option>
                      <option
                        v-for="category in categories"
                        :key="category.id"
                        :value="category.id"
                      >
                        {{ category.name }}
                      </option>
                    </select>
                    <div v-if="errors.category_id" class="invalid-feedback">
                      {{ errors.category_id }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="code">Subcategory Code</label>
                    <input
                      id="code"
                      v-model="form.code"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.code }"
                      placeholder="Enter subcategory code (optional)"
                    />
                    <div v-if="errors.code" class="invalid-feedback">
                      {{ errors.code }}
                    </div>
                    <small class="form-text text-muted">
                      A unique code to identify this subcategory
                    </small>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="status">Status</label>
                    <select
                      id="status"
                      v-model="form.status"
                      class="form-control"
                      :class="{ 'is-invalid': errors.status }"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div v-if="errors.status" class="invalid-feedback">
                      {{ errors.status }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="description">Description</label>
                <textarea
                  id="description"
                  v-model="form.description"
                  class="form-control"
                  :class="{ 'is-invalid': errors.description }"
                  rows="4"
                  placeholder="Enter subcategory description"
                ></textarea>
                <div v-if="errors.description" class="invalid-feedback">
                  {{ errors.description }}
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="sort_order">Sort Order</label>
                    <input
                      id="sort_order"
                      v-model.number="form.sort_order"
                      type="number"
                      class="form-control"
                      :class="{ 'is-invalid': errors.sort_order }"
                      placeholder="0"
                      min="0"
                    />
                    <div v-if="errors.sort_order" class="invalid-feedback">
                      {{ errors.sort_order }}
                    </div>
                    <small class="form-text text-muted">
                      Lower numbers appear first in lists
                    </small>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="color">Color Tag</label>
                    <input
                      id="color"
                      v-model="form.color"
                      type="color"
                      class="form-control form-control-color"
                      :class="{ 'is-invalid': errors.color }"
                      title="Choose a color for this subcategory"
                    />
                    <div v-if="errors.color" class="invalid-feedback">
                      {{ errors.color }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <div class="custom-control custom-checkbox">
                  <input
                    id="is_featured"
                    v-model="form.is_featured"
                    type="checkbox"
                    class="custom-control-input"
                  />
                  <label class="custom-control-label" for="is_featured">
                    Mark as Featured Subcategory
                  </label>
                  <small class="form-text text-muted d-block">
                    Featured subcategories will be highlighted in the interface
                  </small>
                </div>
              </div>

              <div class="form-group">
                <div class="custom-control custom-checkbox">
                  <input
                    id="requires_approval"
                    v-model="form.requires_approval"
                    type="checkbox"
                    class="custom-control-input"
                  />
                  <label class="custom-control-label" for="requires_approval">
                    Require Approval for Items
                  </label>
                  <small class="form-text text-muted d-block">
                    Items in this subcategory will require approval before being available
                  </small>
                </div>
              </div>

              <hr />

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm mr-2"></span>
                  <i v-else class="fas fa-save mr-2"></i>
                  {{ submitting ? 'Updating...' : 'Update Subcategory' }}
                </button>
                <router-link
                  :to="{
                    name: 'general-store-subcategory-details',
                    params: { id: subcategory.id },
                  }"
                  class="btn btn-secondary ml-2"
                >
                  Cancel
                </router-link>
                <button type="button" class="btn btn-danger ml-2" @click="showDeleteConfirmation">
                  <i class="fas fa-trash mr-2"></i>
                  Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Deletion</h5>
            <button type="button" class="close" data-dismiss="modal">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>
              Are you sure you want to delete the subcategory
              <strong>"{{ subcategory.name }}"</strong>?
            </p>
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              <strong>Warning:</strong> This action cannot be undone. All items in this subcategory
              will be affected.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="handleDelete">
              <i class="fas fa-trash mr-2"></i>
              Delete Subcategory
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditSubcategory',
  data() {
    return {
      form: {
        name: '',
        category_id: '',
        code: '',
        description: '',
        status: 'active',
        sort_order: 0,
        color: '#667eea',
        is_featured: false,
        requires_approval: false,
      },
      errors: {},
      submitting: false,
      loading: false,
    };
  },
  computed: {
    subcategory() {
      return this.$store.state.generalStore.currentSubcategory;
    },
    categories() {
      return this.$store.state.generalStore.categories;
    },
    storeLoading() {
      return this.$store.state.generalStore.loading;
    },
    error() {
      return this.$store.state.generalStore.error;
    },
  },
  async mounted() {
    await this.loadCategories();
    await this.loadSubcategory();
  },
  methods: {
    async loadCategories() {
      try {
        await this.$store.dispatch('generalStore/fetchCategories');
      } catch (error) {
        console.error('Error loading categories:', error);
        this.$toast.error('Failed to load categories');
      }
    },
    async loadSubcategory() {
      this.loading = true;
      try {
        await this.$store.dispatch('generalStore/fetchSubcategoryById', this.$route.params.id);

        // Populate form with subcategory data
        const subcategory = this.$store.state.generalStore.currentSubcategory;
        if (subcategory) {
          this.form = {
            name: subcategory.name || '',
            category_id: subcategory.category_id || '',
            code: subcategory.code || '',
            description: subcategory.description || '',
            status: subcategory.status || 'active',
            sort_order: subcategory.sort_order || 0,
            color: subcategory.color || '#667eea',
            is_featured: subcategory.is_featured || false,
            requires_approval: subcategory.requires_approval || false,
          };
        }
      } catch (error) {
        console.error('Error loading subcategory:', error);
        this.$toast.error('Failed to load subcategory');
      } finally {
        this.loading = false;
      }
    },
    async handleSubmit() {
      this.submitting = true;
      this.errors = {};

      try {
        await this.$store.dispatch('generalStore/updateSubcategory', {
          id: this.$route.params.id,
          data: this.form,
        });

        this.$toast.success('Subcategory updated successfully!');

        // Redirect to the subcategory details
        this.$router.push({
          name: 'general-store-subcategory-details',
          params: { id: this.$route.params.id },
        });
      } catch (error) {
        console.error('Error updating subcategory:', error);

        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
        } else {
          this.$toast.error('Failed to update subcategory. Please try again.');
        }
      } finally {
        this.submitting = false;
      }
    },
    showDeleteConfirmation() {
      // Use Bootstrap modal or custom modal
      // $('#deleteModal').modal('show');
    },
    async handleDelete() {
      try {
        await this.$store.dispatch('generalStore/deleteSubcategory', this.$route.params.id);

        this.$toast.success('Subcategory deleted successfully!');

        // Redirect to subcategories list
        this.$router.push({ name: 'general-store-subcategories' });
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        this.$toast.error('Failed to delete subcategory. Please try again.');
      }
    },
  },
};
</script>

<style scoped>
.edit-subcategory {
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

.form-control-color {
  width: 60px;
  height: 38px;
  padding: 0;
  border: 1px solid #ced4da;
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

.modal-content {
  border: none;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
}

.modal-header .close {
  color: white;
  opacity: 0.8;
}

.modal-header .close:hover {
  opacity: 1;
}

.alert {
  border: none;
  border-radius: 8px;
}
</style>
