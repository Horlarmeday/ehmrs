<template>
  <b-modal
    :visible="true"
    :title="modalTitle"
    size="lg"
    @hidden="$emit('close')"
    :no-close-on-backdrop="!viewMode"
    :no-close-on-esc="!viewMode"
    :hide-header-close="isSubmitting"
    body-class="p-0"
  >
    <div class="modal-body p-6">
      <!-- View Mode Info -->
      <div v-if="viewMode" class="alert alert-info mb-5">
        <i class="fas fa-info-circle mr-2"></i>
        Viewing combo investigation details
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Name Field -->
        <div class="form-group row">
          <label class="col-lg-3 col-form-label font-weight-bold text-dark">
            <i class="fas fa-tag mr-1 text-primary"></i>
            Combo Investigation Name:
            <span v-if="!viewMode" class="text-danger">*</span>
          </label>
          <div class="col-lg-9">
            <input
              type="text"
              class="form-control form-control-lg"
              v-model="formData.name"
              :readonly="viewMode"
              placeholder="Enter combo investigation name..."
              :class="{ 'is-invalid': errors.name }"
            />
            <div v-if="errors.name" class="invalid-feedback d-block">
              {{ errors.name }}
            </div>
            <small v-if="!viewMode" class="form-text text-muted">
              Enter a descriptive name for this investigation combination
            </small>
          </div>
        </div>

        <!-- Investigations Selection -->
        <div class="form-group row">
          <label class="col-lg-3 col-form-label font-weight-bold text-dark">
            <i class="fas fa-x-ray mr-1 text-primary"></i>
            Select Investigations:
            <span v-if="!viewMode" class="text-danger">*</span>
          </label>
          <div class="col-lg-9">
            <v-select
              v-if="!viewMode"
              multiple
              name="investigations"
              @search="searchInvestigations"
              v-model="formData.investigation_ids"
              label="name"
              :options="investigations"
              :reduce="(investigation) => investigation.id"
              placeholder="Search and select investigations to include..."
              :class="{ 'is-invalid': errors.investigation_ids }"
            >
              <template #option="{ price, name }">
                <span>{{ name }} - </span>
                <strong>{{ price ? `₦${price}` : 'N/A' }}</strong>
              </template>
            </v-select>

            <!-- View Mode: Show selected investigations -->
            <div v-else>
              <span
                v-for="item in comboInvestigation.comboInvestigationItems"
                :key="item.id"
                class="badge badge-light-primary mr-2 mb-2 p-3"
              >
                {{ item.investigation?.name }} -
                <strong>₦{{ item.investigation?.price || '0.00' }}</strong>
              </span>
            </div>

            <div v-if="errors.investigation_ids" class="invalid-feedback d-block">
              {{ errors.investigation_ids }}
            </div>
            <small v-if="!viewMode" class="form-text text-muted">
              Select multiple investigations to include in this combo
            </small>
          </div>
        </div>

        <div class="form-group row" v-if="totalPrice > 0">
          <!-- Total Price Display -->

          <label class="col-lg-3 col-form-label font-weight-bold text-dark">
            <i class="fas fa-calculator mr-1 text-primary"></i>
            Total Price:
          </label>
          <div class="col-lg-9">
            <div class="alert alert-light-success d-flex align-items-center">
              <div class="alert-text font-weight-bold" style="font-size: 1.2rem">
                {{ formatCurrency(totalPrice) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Status Toggle (Edit Mode Only) -->
        <div v-if="editMode" class="form-group row">
          <label class="col-lg-3 col-form-label font-weight-bold text-dark">
            <i class="fas fa-toggle-on mr-1 text-primary"></i>
            Status:
          </label>
          <div class="col-lg-9">
            <div class="custom-control custom-switch custom-switch-lg">
              <input
                type="checkbox"
                class="custom-control-input"
                id="statusSwitch"
                v-model="formData.is_active"
              />
              <label class="custom-control-label" for="statusSwitch">
                <span :class="formData.is_active ? 'text-success' : 'text-danger'" class="ml-2">
                  {{ formData.is_active ? 'Active' : 'Inactive' }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- Modal Footer -->
    <template #modal-footer>
      <div class="d-flex justify-content-between w-100">
        <button
          type="button"
          class="btn btn-light-primary font-weight-bold"
          @click="$emit('close')"
          :disabled="isSubmitting"
        >
          <i class="fas fa-times mr-2"></i>
          {{ viewMode ? 'Close' : 'Cancel' }}
        </button>

        <button
          v-if="!viewMode"
          type="button"
          class="btn btn-primary font-weight-bold"
          @click="handleSubmit"
          :disabled="isSubmitting"
        >
          <span v-if="!isSubmitting">
            <i class="fas fa-save mr-2"></i>
            {{ editMode ? 'Update Combo Investigation' : 'Create Combo Investigation' }}
          </span>
          <span v-else>
            <span class="spinner-border spinner-border-sm mr-2" role="status"></span>
            {{ editMode ? 'Updating...' : 'Creating...' }}
          </span>
        </button>
      </div>
    </template>
  </b-modal>
</template>

<script>
import vSelect from 'vue-select';
import { debounce } from '@/common/common';

export default {
  name: 'ComboInvestigationForm',
  components: { vSelect },
  props: {
    comboInvestigation: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      formData: {
        name: '',
        investigation_ids: [],
        is_active: true,
      },
      errors: {},
      isSubmitting: false,
      itemsPerPage: 20,
    };
  },
  computed: {
    modalTitle() {
      if (this.viewMode) return 'View Combo Investigation';
      if (this.editMode) return 'Edit Combo Investigation';
      return 'Create New Combo Investigation';
    },

    viewMode() {
      return this.comboInvestigation?.viewMode === true;
    },

    editMode() {
      return this.comboInvestigation && !this.viewMode;
    },

    investigations() {
      return this.$store.state.radiology.investigations;
    },

    totalPrice() {
      if (this.viewMode && this.comboInvestigation?.comboInvestigationItems) {
        return this.comboInvestigation.comboInvestigationItems
          .reduce((sum, item) => sum + (parseFloat(item.investigation?.price) || 0), 0)
          .toFixed(2);
      }

      if (!this.formData.investigation_ids || this.formData.investigation_ids.length === 0)
        return 0;

      const total = this.formData.investigation_ids.reduce((sum, investigationId) => {
        const investigation = this.investigations.find((i) => i.id === investigationId);
        return sum + (parseFloat(investigation?.price) || 0);
      }, 0);

      return total.toFixed(2);
    },
  },
  methods: {
    formatCurrency(price) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(price);
    },

    searchInvestigations(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debounceInvestigationSearch(loading, search, this);
      }
    },

    debounceInvestigationSearch: debounce((loading, search, vm) => {
      vm.$store
        .dispatch('radiology/fetchInvestigations', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
          selectedIds: vm.formData.investigation_ids || [],
          vSelect: true,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    validateForm() {
      this.errors = {};

      if (!this.formData.name || this.formData.name.trim() === '') {
        this.errors.name = 'Combo investigation name is required';
      }

      if (!this.formData.investigation_ids || this.formData.investigation_ids.length === 0) {
        this.errors.investigation_ids = 'Please select at least one investigation';
      }

      return Object.keys(this.errors).length === 0;
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        this.$bvToast.toast('Please fix the validation errors', {
          title: 'Validation Error',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      this.isSubmitting = true;

      try {
        if (this.editMode) {
          await this.$store.dispatch('radiology/updateComboInvestigation', {
            id: this.comboInvestigation.id,
            name: this.formData.name,
            investigation_ids: this.formData.investigation_ids,
            is_active: this.formData.is_active,
          });
        } else {
          await this.$store.dispatch('radiology/createComboInvestigation', {
            name: this.formData.name,
            investigation_ids: this.formData.investigation_ids,
          });
        }

        this.$emit('saved');
      } catch (error) {
        this.$bvToast.toast(
          error.response?.data?.message ||
            `Failed to ${this.editMode ? 'update' : 'create'} combo investigation`,
          {
            title: 'Error',
            variant: 'danger',
            solid: true,
          }
        );
      } finally {
        this.isSubmitting = false;
      }
    },

    initializeForm() {
      if (this.editMode) {
        this.formData.name = this.comboInvestigation.name;
        this.formData.is_active = this.comboInvestigation.is_active;
        this.formData.investigation_ids =
          this.comboInvestigation.comboInvestigationItems?.map((item) => item.investigation_id) ||
          [];
      } else {
        this.formData = {
          name: '',
          investigation_ids: [],
          is_active: true,
        };
      }
    },

    fetchInvestigations() {
      this.$store.dispatch('radiology/fetchInvestigations', {
        currentPage: 1,
        itemsPerPage: 100,
        selectedIds: this.formData.investigation_ids || [],
      });
    },
  },
  created() {
    this.initializeForm();
    this.fetchInvestigations();
  },
};
</script>

<style scoped>
.badge-light-primary {
  background-color: #e1f0ff;
  color: #3699ff;
  font-size: 0.95rem;
}

.alert-light-success {
  background-color: #c9f7f5;
  border-color: #1bc5bd;
  color: #0bb7af;
}

.custom-switch-lg .custom-control-label::before {
  height: 1.5rem;
  width: 3rem;
  border-radius: 3rem;
}

.custom-switch-lg .custom-control-label::after {
  width: calc(1.5rem - 4px);
  height: calc(1.5rem - 4px);
  border-radius: calc(3rem - 4px);
}

.custom-switch-lg .custom-control-input:checked ~ .custom-control-label::after {
  transform: translateX(1.5rem);
}
</style>
