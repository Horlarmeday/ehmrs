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
        Viewing combo test details
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Name Field -->
        <div class="form-group row">
          <label class="col-lg-3 col-form-label font-weight-bold text-dark">
            <i class="fas fa-tag mr-1 text-primary"></i>
            Combo Test Name:
            <span v-if="!viewMode" class="text-danger">*</span>
          </label>
          <div class="col-lg-9">
            <input
              type="text"
              class="form-control form-control-lg"
              v-model="formData.name"
              :readonly="viewMode"
              placeholder="Enter combo test name..."
              :class="{ 'is-invalid': errors.name }"
            />
            <div v-if="errors.name" class="invalid-feedback d-block">
              {{ errors.name }}
            </div>
            <small v-if="!viewMode" class="form-text text-muted">
              Enter a descriptive name for this test combination
            </small>
          </div>
        </div>

        <!-- Tests Selection -->
        <div class="form-group row">
          <label class="col-lg-3 col-form-label font-weight-bold text-dark">
            <i class="fas fa-flask mr-1 text-primary"></i>
            Select Tests:
            <span v-if="!viewMode" class="text-danger">*</span>
          </label>
          <div class="col-lg-9">
            <v-select
              v-if="!viewMode"
              multiple
              name="tests"
              @search="searchTests"
              v-model="formData.test_ids"
              label="name"
              :options="tests"
              :reduce="(test) => test.id"
              placeholder="Search and select tests to include..."
              class="form-control-lg"
              :class="{ 'is-invalid': errors.test_ids }"
            >
              <template #option="{ price, name }">
                <span>{{ name }} - </span>
                <strong>{{ price ? `₦${price}` : 'N/A' }}</strong>
              </template>
            </v-select>

            <!-- View Mode: Show selected tests -->
            <div v-else>
              <span
                v-for="item in comboTest.comboTestItems"
                :key="item.id"
                class="badge badge-light-primary mr-2 mb-2 p-3"
              >
                {{ item.test?.name }} - <strong>₦{{ item.test?.price || '0.00' }}</strong>
              </span>
            </div>

            <div v-if="errors.test_ids" class="invalid-feedback d-block">
              {{ errors.test_ids }}
            </div>
            <small v-if="!viewMode" class="form-text text-muted">
              Select multiple tests to include in this combo
            </small>
          </div>
        </div>

        <div class="form-group row">
          <!-- Total Price Display -->
          <div v-if="totalPrice > 0" class="form-group row">
            <label class="col-lg-3 col-form-label font-weight-bold text-dark">
              <i class="fas fa-calculator mr-1 text-primary"></i>
              Total Price:
            </label>
            <div class="col-lg-9">
              <div class="alert alert-light-success d-flex align-items-center">
                <div class="alert-text font-weight-bold" style="font-size: 1.2rem">
                  ₦{{ totalPrice }}
                </div>
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
            {{ editMode ? 'Update Combo Test' : 'Create Combo Test' }}
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
  name: 'ComboTestForm',
  components: { vSelect },
  props: {
    comboTest: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      formData: {
        name: '',
        test_ids: [],
        is_active: true,
      },
      errors: {},
      isSubmitting: false,
      itemsPerPage: 20,
    };
  },
  computed: {
    modalTitle() {
      if (this.viewMode) return 'View Combo Test';
      if (this.editMode) return 'Edit Combo Test';
      return 'Create New Combo Test';
    },

    viewMode() {
      return this.comboTest?.viewMode === true;
    },

    editMode() {
      return this.comboTest && !this.viewMode;
    },

    tests() {
      return this.$store.state.laboratory.tests;
    },

    totalPrice() {
      if (this.viewMode && this.comboTest?.comboTestItems) {
        return this.comboTest.comboTestItems
          .reduce((sum, item) => sum + (parseFloat(item.test?.price) || 0), 0)
          .toFixed(2);
      }

      if (!this.formData.test_ids || this.formData.test_ids.length === 0) return 0;

      const total = this.formData.test_ids.reduce((sum, testId) => {
        const test = this.tests.find((t) => t.id === testId);
        return sum + (parseFloat(test?.price) || 0);
      }, 0);

      return total.toFixed(2);
    },
  },
  methods: {
    searchTests(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debounceTestSearch(loading, search, this);
      }
    },

    debounceTestSearch: debounce((loading, search, vm) => {
      vm.$store
        .dispatch('laboratory/fetchTests', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
          selectedIds: vm.formData.test_ids || [],
          vSelect: true,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    validateForm() {
      this.errors = {};

      if (!this.formData.name || this.formData.name.trim() === '') {
        this.errors.name = 'Combo test name is required';
      }

      if (!this.formData.test_ids || this.formData.test_ids.length === 0) {
        this.errors.test_ids = 'Please select at least one test';
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
          await this.$store.dispatch('laboratory/updateComboTest', {
            id: this.comboTest.id,
            name: this.formData.name,
            test_ids: this.formData.test_ids,
            is_active: this.formData.is_active,
          });
        } else {
          await this.$store.dispatch('laboratory/createComboTest', {
            name: this.formData.name,
            test_ids: this.formData.test_ids,
          });
        }

        this.$emit('saved');
      } catch (error) {
        this.$bvToast.toast(
          error.response?.data?.message ||
            `Failed to ${this.editMode ? 'update' : 'create'} combo test`,
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
        this.formData.name = this.comboTest.name;
        this.formData.is_active = this.comboTest.is_active;
        this.formData.test_ids = this.comboTest.comboTestItems?.map((item) => item.test_id) || [];
      } else {
        this.formData = {
          name: '',
          test_ids: [],
          is_active: true,
        };
      }
    },

    fetchTests() {
      this.$store.dispatch('laboratory/fetchTests', {
        currentPage: 1,
        itemsPerPage: 100,
        selectedIds: this.formData.test_ids || [],
      });
    },
  },
  created() {
    this.initializeForm();
    this.fetchTests();
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
