<template>
  <b-modal
    ref="modal"
    id="dispensary-form-modal"
    :title="modalTitle"
    size="lg"
    :ok-disabled="!canSave"
    :ok-title="isEdit ? 'Update Dispensary' : 'Create Dispensary'"
    @ok="handleSave"
    @hidden="resetForm"
  >
    <form>
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label class="form-label">Dispensary Name *</label>
            <input
              type="text"
              v-model="formData.name"
              class="form-control"
              placeholder="Enter dispensary name"
              required
            />
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label class="form-label">Location *</label>
            <input
              type="text"
              v-model="formData.location"
              class="form-control"
              placeholder="Enter location"
              required
            />
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea
          v-model="formData.description"
          class="form-control"
          rows="3"
          placeholder="Enter dispensary description"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Manager/Contact Person</label>
        <input
          type="text"
          v-model="formData.manager_name"
          class="form-control"
          placeholder="Enter manager name"
        />
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <div class="checkbox-inline">
              <label class="checkbox">
                <input type="checkbox" v-model="formData.is_active" />
                <span></span>
                Active (dispensary is operational)
              </label>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <div class="checkbox-inline">
              <label class="checkbox">
                <input type="checkbox" v-model="formData.auto_replenish_enabled" />
                <span></span>
                Enable automatic replenishment
              </label>
            </div>
          </div>
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
              min="1"
              max="100"
              placeholder="30"
            />
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
              min="1"
              placeholder="1000"
            />
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
    </form>

    <template #modal-footer="{ ok, cancel }">
      <div class="w-100 d-flex justify-content-between">
        <button type="button" class="btn btn-light" @click="cancel()">Cancel</button>
        <button type="button" class="btn btn-primary" :disabled="!canSave || loading" @click="ok()">
          <span v-if="loading" class="spinner-border spinner-border-sm mr-2"></span>
          {{ isEdit ? 'Update Dispensary' : 'Create Dispensary' }}
        </button>
      </div>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'DispensaryFormModal',
  data() {
    return {
      loading: false,
      isEdit: false,
      currentDispensary: null,
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
    };
  },
  computed: {
    modalTitle() {
      return this.isEdit ? 'Edit Dispensary' : 'Create New Dispensary';
    },
    canSave() {
      return (
        this.formData.name.trim() &&
        this.formData.location.trim() &&
        this.validationErrors.length === 0
      );
    },
  },
  methods: {
    show(dispensary = null) {
      this.isEdit = !!dispensary;
      this.currentDispensary = dispensary;

      if (dispensary) {
        // Populate form with existing dispensary data
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

      this.$refs.modal.show();
    },

    hide() {
      this.$refs.modal.hide();
    },

    resetForm() {
      this.isEdit = false;
      this.currentDispensary = null;
      this.formData = {
        name: '',
        description: '',
        location: '',
        manager_name: '',
        is_active: true,
        auto_replenish_enabled: false,
        replenish_threshold: 30,
        max_capacity: 1000,
      };
      this.validationErrors = [];
      this.loading = false;
    },

    validateForm() {
      this.validationErrors = [];

      if (!this.formData.name.trim()) {
        this.validationErrors.push('Dispensary name is required');
      }

      if (!this.formData.location.trim()) {
        this.validationErrors.push('Location is required');
      }

      if (this.formData.auto_replenish_enabled) {
        if (!this.formData.replenish_threshold || this.formData.replenish_threshold < 1) {
          this.validationErrors.push('Replenish threshold must be at least 1%');
        }

        if (!this.formData.max_capacity || this.formData.max_capacity < 1) {
          this.validationErrors.push('Max capacity must be at least 1');
        }
      }
    },

    async handleSave() {
      this.validateForm();

      if (this.validationErrors.length > 0) {
        return;
      }

      this.loading = true;

      try {
        let response;
        if (this.isEdit) {
          response = await this.$store.dispatch('generalStore/updateDispensary', {
            id: this.currentDispensary.id,
            data: this.formData,
          });
        } else {
          response = await this.$store.dispatch('generalStore/createDispensary', this.formData);
        }

        this.$emit('dispensary-saved', response.data.data);
        this.hide();
      } catch (error) {
        const message = this.isEdit ? 'Failed to update dispensary' : 'Failed to create dispensary';

        if (error.response?.status === 422 && error.response?.data?.errors) {
          this.validationErrors = Object.values(error.response.data.errors).flat();
        } else if (error.response?.status === 409) {
          this.validationErrors = ['Dispensary with this name already exists in this location'];
        } else {
          this.$toast.error(error.response?.data?.message || message);
        }
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

.checkbox {
  margin: 0;
}

.alert {
  border-radius: 0.42rem;
}
</style>
