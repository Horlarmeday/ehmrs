<template>
  <div class="edit-dispensary">
    <div class="row">
      <div class="col-12">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-5">
            <h3 class="card-title align-items-start flex-column">
              <span class="card-label font-weight-bolder text-dark">Edit Dispensary</span>
              <span class="text-muted mt-3 font-weight-bold font-size-sm">
                Update dispensary information and settings
              </span>
            </h3>
            <div class="card-toolbar">
              <router-link
                to="/general-store/dispensaries"
                class="btn btn-light font-weight-bolder"
              >
                <i class="ki ki-arrow-left icon-sm"></i>
                Back to Dispensaries
              </router-link>
            </div>
          </div>

          <div class="card-body py-0">
            <div v-if="loading && !formData.name" class="text-center py-10">
              <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>

            <form v-else @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-lg-8">
                  <!-- Basic Information -->
                  <div class="form-group">
                    <label class="form-label">Dispensary Name *</label>
                    <input
                      type="text"
                      v-model="formData.name"
                      class="form-control"
                      :class="{ 'is-invalid': hasError('name') }"
                      required
                    />
                    <div v-if="hasError('name')" class="invalid-feedback">
                      {{ getError('name') }}
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea
                      v-model="formData.description"
                      class="form-control"
                      :class="{ 'is-invalid': hasError('description') }"
                      rows="3"
                    ></textarea>
                    <div v-if="hasError('description')" class="invalid-feedback">
                      {{ getError('description') }}
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label class="form-label">Location *</label>
                        <input
                          type="text"
                          v-model="formData.location"
                          class="form-control"
                          :class="{ 'is-invalid': hasError('location') }"
                          required
                        />
                        <div v-if="hasError('location')" class="invalid-feedback">
                          {{ getError('location') }}
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label class="form-label">Manager/Contact Person</label>
                        <input
                          type="text"
                          v-model="formData.manager_name"
                          class="form-control"
                          :class="{ 'is-invalid': hasError('manager_name') }"
                        />
                        <div v-if="hasError('manager_name')" class="invalid-feedback">
                          {{ getError('manager_name') }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Settings -->
                  <div class="form-group">
                    <div class="checkbox-inline">
                      <label class="checkbox">
                        <input type="checkbox" v-model="formData.is_active" />
                        <span></span>
                        Active (dispensary is operational)
                      </label>
                    </div>
                  </div>

                  <div class="form-group">
                    <div class="checkbox-inline">
                      <label class="checkbox">
                        <input type="checkbox" v-model="formData.auto_replenish_enabled" />
                        <span></span>
                        Enable automatic replenishment
                      </label>
                    </div>
                  </div>

                  <div v-if="formData.auto_replenish_enabled" class="row">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label class="form-label">Replenish Threshold (%)</label>
                        <input
                          type="number"
                          v-model.number="formData.replenish_threshold"
                          class="form-control"
                          :class="{ 'is-invalid': hasError('replenish_threshold') }"
                          min="1"
                          max="100"
                        />
                        <div v-if="hasError('replenish_threshold')" class="invalid-feedback">
                          {{ getError('replenish_threshold') }}
                        </div>
                        <small class="form-text text-muted">
                          Replenish when stock falls below this percentage
                        </small>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label class="form-label">Max Capacity</label>
                        <input
                          type="number"
                          v-model.number="formData.max_capacity"
                          class="form-control"
                          :class="{ 'is-invalid': hasError('max_capacity') }"
                          min="1"
                        />
                        <div v-if="hasError('max_capacity')" class="invalid-feedback">
                          {{ getError('max_capacity') }}
                        </div>
                        <small class="form-text text-muted">
                          Maximum number of items this dispensary can hold
                        </small>
                      </div>
                    </div>
                  </div>

                  <!-- Validation Errors -->
                  <div v-if="validationErrors.length > 0" class="alert alert-danger">
                    <ul class="mb-0">
                      <li v-for="error in validationErrors" :key="error">{{ error }}</li>
                    </ul>
                  </div>

                  <!-- Action Buttons -->
                  <div class="form-group">
                    <button
                      type="submit"
                      class="btn btn-primary font-weight-bolder mr-3"
                      :disabled="loading"
                    >
                      <span v-if="loading" class="spinner-border spinner-border-sm mr-2"></span>
                      Update Dispensary
                    </button>
                    <router-link
                      to="/general-store/dispensaries"
                      class="btn btn-light font-weight-bolder"
                    >
                      Cancel
                    </router-link>
                  </div>
                </div>

                <div class="col-lg-4">
                  <!-- Dispensary Stats -->
                  <div class="card card-custom bg-light-info mb-4">
                    <div class="card-body">
                      <h5 class="text-info font-weight-bolder mb-3">
                        <i class="ki ki-bar-chart text-info mr-2"></i>
                        Dispensary Statistics
                      </h5>
                      <div class="row">
                        <div class="col-6">
                          <div class="text-center">
                            <div class="text-dark font-weight-bolder font-size-h4">
                              {{ dispensary.total_items || 0 }}
                            </div>
                            <div class="text-muted font-size-sm">Total Items</div>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="text-center">
                            <div class="text-dark font-weight-bolder font-size-h4">
                              {{ dispensary.low_stock_items || 0 }}
                            </div>
                            <div class="text-muted font-size-sm">Low Stock</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Help Card -->
                  <div class="card card-custom bg-light-primary">
                    <div class="card-body">
                      <h5 class="text-primary font-weight-bolder mb-3">
                        <i class="ki ki-information text-primary mr-2"></i>
                        Update Guide
                      </h5>
                      <div class="text-dark">
                        <p class="mb-2">
                          <strong>Status:</strong> Deactivating a dispensary will prevent new
                          transfers and dispensing.
                        </p>
                        <p class="mb-2">
                          <strong>Auto-replenishment:</strong> Changes take effect immediately for
                          future stock checks.
                        </p>
                        <p class="mb-0">
                          <strong>Capacity:</strong> Reducing capacity below current stock will be
                          flagged as a warning.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'EditDispensary',
  data() {
    return {
      loading: false,
      formData: {
        name: '',
        description: '',
        location: '',
        manager_name: '',
        is_active: true,
        auto_replenish_enabled: false,
        replenish_threshold: 30,
        max_capacity: 1000,
      },
      validationErrors: [],
      errors: {},
    };
  },
  computed: {
    ...mapState('generalStore', ['currentDispensary']),
    dispensaryId() {
      return this.$route.params.id;
    },
    dispensary() {
      return this.currentDispensary || {};
    },
  },
  async created() {
    await this.loadDispensary();
  },
  methods: {
    async loadDispensary() {
      this.loading = true;
      try {
        await this.$store.dispatch('generalStore/fetchDispensaryById', this.dispensaryId);

        // Populate form with current dispensary data
        const dispensary = this.currentDispensary;
        if (dispensary) {
          this.formData = {
            name: dispensary.name || '',
            description: dispensary.description || '',
            location: dispensary.location || '',
            manager_name: dispensary.manager_name || '',
            is_active: dispensary.is_active !== false,
            auto_replenish_enabled: dispensary.auto_replenish_enabled || false,
            replenish_threshold: dispensary.replenish_threshold || 30,
            max_capacity: dispensary.max_capacity || 1000,
          };
        }
      } catch (error) {
        this.$toast.error('Failed to load dispensary details');
      } finally {
        this.loading = false;
      }
    },

    validateForm() {
      this.errors = {};
      
      // Required fields
      if (!this.formData.name || this.formData.name.trim().length === 0) {
        this.errors.name = 'Dispensary name is required';
      } else if (this.formData.name.length > 100) {
        this.errors.name = 'Dispensary name must be less than 100 characters';
      }
      
      if (!this.formData.location || this.formData.location.trim().length === 0) {
        this.errors.location = 'Location is required';
      } else if (this.formData.location.length > 200) {
        this.errors.location = 'Location must be less than 200 characters';
      }
      
      // Optional fields validation
      if (this.formData.description && this.formData.description.length > 500) {
        this.errors.description = 'Description must be less than 500 characters';
      }
      
      if (this.formData.manager_name && this.formData.manager_name.length > 100) {
        this.errors.manager_name = 'Manager name must be less than 100 characters';
      }
      
      // Auto-replenish validation
      if (this.formData.auto_replenish_enabled) {
        if (!this.formData.replenish_threshold || this.formData.replenish_threshold <= 0) {
          this.errors.replenish_threshold = 'Replenish threshold is required when auto-replenish is enabled';
        } else if (this.formData.replenish_threshold > 100) {
          this.errors.replenish_threshold = 'Replenish threshold cannot exceed 100%';
        }
      }
      
      // Max capacity validation
      if (this.formData.max_capacity && this.formData.max_capacity <= 0) {
        this.errors.max_capacity = 'Maximum capacity must be greater than 0';
      }
      
      return Object.keys(this.errors).length === 0;
    },
    
    hasError(field) {
      return this.errors && this.errors[field];
    },
    
    getError(field) {
      return this.errors && this.errors[field];
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return;
      }

      this.loading = true;

      try {
        await this.$store.dispatch('generalStore/updateDispensary', {
          id: this.dispensaryId,
          data: this.formData,
        });

        this.$toast.success('Dispensary updated successfully');
        this.$router.push('/general-store/dispensaries');
      } catch (error) {
        this.$toast.error(error.response?.data?.message || 'Failed to update dispensary');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.form-label {
  font-weight: 600;
  color: #181c32;
  font-size: 0.9rem;
}

.card-custom {
  box-shadow: 0px 0px 30px 0px rgba(82, 63, 105, 0.05);
}

.checkbox {
  margin: 0;
}
</style>
