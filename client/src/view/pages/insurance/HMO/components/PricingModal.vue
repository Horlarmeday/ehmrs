<template>
  <!-- Bootstrap Vue Modal -->
  <b-modal
    v-model="modalVisible"
    :title="modalTitle"
    size="xl"
    hide-footer
    no-fade
    @hidden="handleModalHidden"
  >
    <div class="p-4">
      <form @submit.prevent="savePricing">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label font-weight-bold">
                <i class="fas fa-tag text-primary mr-2"></i>
                {{ getItemLabel() }} Name
              </label>
              <v-select
                v-validate="'required'"
                data-vv-validate-on="blur"
                name="item_select"
                @search="searchAvailableItems"
                v-model="formData[getItemIdField()]"
                label="name"
                :reduce="(items) => items.id"
                :options="availableItems"
                :placeholder="`Search ${getItemLabel().toLowerCase()}...`"
                :loading="isSearchingItems"
                :clearable="false"
              >
                <template #option="{ name, code, id }">
                  <span>{{ name }} ({{ code || id }}) </span>
                </template>
              </v-select>
              <!-- Debug display -->
              <small class="text-muted mt-1">
                Selected: {{ formData[getItemIdField()] }} | Field: {{ getItemIdField() }}
              </small>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label font-weight-bold">
                <i class="fas fa-shield-alt text-success mr-2"></i>
                Insurance Provider
              </label>
              <v-select
                v-validate="'required'"
                data-vv-validate-on="blur"
                name="hmo_select"
                @search="searchHMOs"
                v-model="formData.hmo_id"
                label="name"
                :reduce="(hmos) => hmos.id"
                :options="hmoProviders"
                placeholder="Search insurance provider..."
                :loading="isSearchingHMOs"
                :clearable="false"
              >
                <template #option="{ name, insurance }">
                  <span>{{ name }} {{ `(${insurance?.name})` }} </span>
                </template>
              </v-select>
              <!-- Debug display -->
              <small class="text-muted mt-1"> Selected HMO: {{ formData.hmo_id }} </small>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label font-weight-bold">
                <i class="fas fa-money-bill-wave text-warning mr-2"></i>
                HMO Price (₦)
              </label>
              <input
                v-validate="'required'"
                data-vv-validate-on="blur"
                name="hmo_price"
                type="number"
                v-model="formData.hmo_price"
                class="form-control form-control-lg"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
              <span class="text-danger text-sm">{{ errors.first('hmo_price') }}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label font-weight-bold">
                <i class="fas fa-percentage text-info mr-2"></i>
                Patient Percentage (%)
              </label>
              <input
                v-validate="'required'"
                data-vv-validate-on="blur"
                name="patient_percentage"
                type="number"
                v-model="formData.patient_percentage"
                class="form-control form-control-lg"
                placeholder="0"
                min="0"
                max="100"
              />
              <span class="text-danger text-sm">{{ errors.first('patient_percentage') }}</span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label font-weight-bold">
                <i class="fas fa-percentage text-success mr-2"></i>
                HMO Percentage (%)
              </label>
              <input
                type="number"
                v-model="formData.hmo_percentage"
                class="form-control form-control-lg"
                placeholder="100"
                min="0"
                max="100"
                required
              />
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label font-weight-bold">
                <i class="fas fa-toggle-on text-primary mr-2"></i>
                Status
              </label>
              <select v-model="formData.status" class="form-control form-control-lg" required>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label font-weight-bold">
                <i class="fas fa-calendar-alt text-primary mr-2"></i>
                Effective From
              </label>
              <datepicker
                v-model="formData.effective_from"
                input-class="form-control form-control-lg"
                placeholder="Start"
              ></datepicker>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label font-weight-bold">
                <i class="fas fa-calendar-times text-danger mr-2"></i>
                Effective To
              </label>
              <datepicker
                v-model="formData.effective_to"
                input-class="form-control form-control-lg"
                placeholder="End"
              ></datepicker>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label font-weight-bold">
            <i class="fas fa-comment text-muted mr-2"></i>
            Notes
          </label>
          <textarea
            v-model="formData.notes"
            class="form-control"
            rows="3"
            placeholder="Additional notes..."
          ></textarea>
        </div>

        <div class="text-right mt-4">
          <button type="button" class="btn btn-light-secondary btn-lg mr-3" @click="closeModal">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary btn-lg" :disabled="isSubmitting">
            <i class="fas fa-save mr-2"></i>
            {{ isSubmitting ? 'Saving...' : 'Save Pricing' }}
          </button>
        </div>
      </form>
    </div>
  </b-modal>
</template>

<script>
import vSelect from 'vue-select';
import Datepicker from 'vuejs-datepicker';
export default {
  name: 'PricingModal',
  components: { vSelect, Datepicker },
  props: {
    showModal: {
      type: Boolean,
      default: false,
    },
    activeTab: {
      type: String,
      required: true,
    },
    editingPricing: {
      type: Object,
      default: null,
    },
    availableItems: {
      type: Array,
      default: () => [],
    },
    hmoProviders: {
      type: Array,
      default: () => [],
    },
    isSubmitting: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isSearchingItems: false,
      isSearchingHMOs: false,
      localFormData: {
        drug_id: null,
        test_id: null,
        service_id: null,
        investigation_id: null,
        hmo_id: null,
        hmo_price: null,
        patient_percentage: 0,
        hmo_percentage: 100,
        effective_from: null,
        effective_to: null,
        status: 'Active',
        notes: '',
      },
    };
  },
  computed: {
    modalVisible: {
      get() {
        return this.showModal;
      },
      set(value) {
        // Always emit the close event when modal value changes to false
        if (!value) {
          this.$emit('closeModal');
        }
      },
    },
    modalTitle() {
      if (this.editingPricing) {
        return `Edit ${this.getTabLabel()} Pricing`;
      }
      return `Add New ${this.getTabLabel()} Pricing`;
    },
    formData: {
      get() {
        return this.localFormData;
      },
      set(value) {
        this.localFormData = { ...value };
      },
    },
  },
  watch: {
    editingPricing: {
      handler(newVal) {
        if (newVal) {
          this.localFormData = { ...newVal };
        } else {
          this.localFormData = {
            drug_id: null,
            test_id: null,
            service_id: null,
            investigation_id: null,
            hmo_id: null,
            hmo_price: null,
            patient_percentage: 0,
            hmo_percentage: 100,
            effective_from: null,
            effective_to: null,
            status: 'Active',
            notes: '',
          };
        }
      },
      immediate: true,
    },
    showModal(newVal) {
      if (!newVal) {
        // Reset form when modal is closed
        this.localFormData = {
          drug_id: null,
          test_id: null,
          service_id: null,
          investigation_id: null,
          hmo_id: null,
          hmo_price: null,
          patient_percentage: 0,
          hmo_percentage: 100,
          effective_from: null,
          effective_to: null,
          status: 'Active',
          notes: '',
        };
      }
    },
  },
  methods: {
    getTabLabel() {
      const labels = {
        drugs: 'Drug',
        tests: 'Test',
        services: 'Service',
        investigations: 'Investigation',
      };
      return labels[this.activeTab] || 'Item';
    },

    getItemLabel() {
      const labels = {
        drugs: 'Drug',
        tests: 'Test',
        services: 'Service',
        investigations: 'Investigation',
      };
      return labels[this.activeTab] || 'Item';
    },

    getItemIdField() {
      const fields = {
        drugs: 'drug_id',
        tests: 'test_id',
        services: 'service_id',
        investigations: 'investigation_id',
      };
      return fields[this.activeTab] || 'item_id';
    },

    closeModal() {
      // Force the modal to close by setting the v-model to false
      this.$emit('closeModal');
    },

    handleModalHidden() {
      // This is called when the modal is completely hidden
      // Ensure we emit the close event to reset parent state
      this.$emit('closeModal');
    },

    savePricing() {
      // Validate required fields
      const itemIdField = this.getItemIdField();
      if (!this.formData[itemIdField]) {
        alert(`Please select a ${this.getItemLabel().toLowerCase()}`);
        return;
      }
      if (!this.formData.hmo_id) {
        alert('Please select an insurance provider');
        return;
      }
      if (!this.formData.hmo_price) {
        alert('Please enter HMO price');
        return;
      }

      // Prepare the payload based on active tab
      const payload = { ...this.formData };

      // Clear all item ID fields except the one for current tab
      const allItemIds = ['drug_id', 'test_id', 'service_id', 'investigation_id'];
      allItemIds.forEach((id) => {
        if (id !== payload[itemIdField]) {
          delete payload[id];
        }
      });
      // Set the correct item ID field
      payload[itemIdField] = this.formData[itemIdField];
      this.$emit('save-pricing', payload);
    },

    searchHMOs(query, loading) {
      this.isSearchingHMOs = true;
      this.$emit('searchHMOs', query, (isLoading) => {
        this.isSearchingHMOs = isLoading;
        if (loading) loading(isLoading);
      });
    },

    onItemSelect(value) {
      console.log('Item selected:', value);
      console.log('Current formData:', this.formData);
      console.log('Field being updated:', this.getItemIdField());
    },

    onHMOSelect(value) {
      console.log('HMO selected:', value);
      console.log('Current formData:', this.formData);
    },

    searchAvailableItems(query, loading) {
      this.isSearchingItems = true;
      this.$emit('searchAvailableItems', query, (isLoading) => {
        this.isSearchingItems = isLoading;
        if (loading) loading(isLoading);
      });
    },
  },
};
</script>

<style scoped>
.form-label {
  color: #3f4254;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 0.5rem;
  border: 1px solid #e1e3ea;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #00acc1;
  box-shadow: 0 0 0 0.2rem rgba(0, 172, 193, 0.25);
}
</style>
