<template>
  <div class="create-subcategory">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col">
                <h3 class="card-title">Create New Subcategory</h3>
                <p class="card-text">Add a new subcategory to organize items better</p>
              </div>
              <div class="col-auto">
                <router-link
                  :to="{ name: 'general-store-subcategories' }"
                  class="btn btn-secondary"
                >
                  <i class="fas fa-arrow-left"></i> Back to List
                </router-link>
              </div>
            </div>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="name">Subcategory Name *</label>
                    <input
                      id="name"
                      v-model="form.name"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': formErrors.name }"
                      required
                    />
                    <div v-if="formErrors.name" class="invalid-feedback">
                      {{ formErrors.name }}
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
                      :class="{ 'is-invalid': formErrors.category_id }"
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
                    <div v-if="formErrors.category_id" class="invalid-feedback">
                      {{ formErrors.category_id }}
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
                      :class="{ 'is-invalid': formErrors.code }"
                    />
                    <div v-if="formErrors.code" class="invalid-feedback">
                      {{ formErrors.code }}
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
                      :class="{ 'is-invalid': formErrors.status }"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div v-if="formErrors.status" class="invalid-feedback">
                      {{ formErrors.status }}
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
                  :class="{ 'is-invalid': formErrors.description }"
                  rows="4"
                ></textarea>
                <div v-if="formErrors.description" class="invalid-feedback">
                  {{ formErrors.description }}
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
                      :class="{ 'is-invalid': formErrors.sort_order }"
                      min="0"
                    />
                    <div v-if="formErrors.sort_order" class="invalid-feedback">
                      {{ formErrors.sort_order }}
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
                      :class="{ 'is-invalid': formErrors.color }"
                      title="Choose a color for this subcategory"
                    />
                    <div v-if="formErrors.color" class="invalid-feedback">
                      {{ formErrors.color }}
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
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm mr-2"></span>
                  <i v-else class="fas fa-save mr-2"></i>
                  {{ loading ? 'Creating...' : 'Create Subcategory' }}
                </button>
                <router-link
                  :to="{ name: 'general-store-subcategories' }"
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
  name: 'CreateSubcategory',
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
      formErrors: {},
      submitting: false,
      loading: false,
    };
  },
  computed: {
    categories() {
      return this.$store.state.generalStore.categories;
    },
    storeLoading() {
      return this.$store.state.generalStore.loading;
    },
  },
  async mounted() {
    await this.loadCategories();
  },
  methods: {
    async loadCategories() {
      this.loading = true;
      try {
        await this.$store.dispatch('generalStore/fetchCategories');
      } catch (error) {
        this.$toast.error('Failed to load categories');
      } finally {
        this.loading = false;
      }
    },
    async handleSubmit() {
      this.submitting = true;
      this.formErrors = {};

      try {
        // Only send fields that are allowed by the backend schema
        const subcategoryData = {
          name: this.form.name,
          category_id: this.form.category_id,
          description: this.form.description,
          is_active: this.form.status === 'active'
        };

        await this.$store.dispatch('generalStore/createSubcategory', subcategoryData);

        this.$toast.success('Subcategory created successfully!');

        // Redirect to the subcategories list
        this.$router.push({ name: 'general-store-subcategories' });
      } catch (error) {
        // The axios interceptor returns error.response.data, so error is already the data object
        if (error.errors) {
          this.formErrors = error.errors;
        } else {
          this.$toast.error('Failed to create subcategory. Please try again.');
        }
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.create-subcategory {
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
</style>
