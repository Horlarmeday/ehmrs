<template>
  <b-modal v-model="activePrompt" hide-footer :title="modalTitle">
    <div class="mb-15">
      <!-- Ward Selection (only for new beds) -->
      <div v-if="!isEditMode" class="form-group row">
        <label class="col-lg-3 col-form-label">Ward</label>
        <div class="col-lg-8">
          <select
            v-model="ward_id"
            class="form-control form-control-sm"
            name="ward_id"
            v-validate="'required'"
            data-vv-validate-on="blur"
          >
            <option value="">Select Ward</option>
            <option v-for="ward in wards" :key="ward.id" :value="ward.id">
              {{ ward.name }}
            </option>
          </select>
          <span class="text-danger text-sm">{{ errors.first('ward_id') }}</span>
        </div>
      </div>

      <!-- Bed Code -->
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Code</label>
        <div class="col-lg-8">
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="text"
            class="form-control form-control-sm"
            placeholder="Bed Number"
            v-model="code"
            name="code"
          />
          <span class="text-danger text-sm">{{ errors.first('code') }}</span>
        </div>
      </div>

      <!-- Bed Type -->
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Bed Type:</label>
        <div class="col-lg-8">
          <select
            v-model="bed_type"
            class="form-control form-control-sm"
            name="bed_type"
            v-validate="'required'"
            data-vv-validate-on="blur"
          >
            <option value="">Select Bed Type</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Normal">Normal</option>
            <option value="Luxury">Luxury</option>
          </select>
          <span class="text-danger text-sm">{{ errors.first('bed_type') }}</span>
        </div>
      </div>

      <!-- Bed Status (only for editing) -->
      <div v-if="isEditMode" class="form-group row">
        <label class="col-lg-3 col-form-label">Status:</label>
        <div class="col-lg-8">
          <select v-model="status" class="form-control form-control-sm" name="status">
            <option value="Untaken">Available</option>
            <option value="Taken">Occupied</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="d-flex justify-content-end">
      <button class="btn btn-secondary mr-2" @click="closeModal" :disabled="isDisabled">
        Cancel
      </button>
      <button
        class="btn btn-primary"
        @click="saveBed"
        :disabled="isDisabled || !canSave"
        ref="kt_bed_submit"
      >
        <i v-if="isDisabled" class="fas fa-spinner fa-spin mr-1"></i>
        {{ isEditMode ? 'Update' : 'Create' }} Bed
      </button>
    </div>
  </b-modal>
</template>

<script>
import { mapState } from 'vuex';

export default {
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      code: '',
      bed_type: '',
      ward_id: '',
      status: 'Untaken',
      bed_id: '',
      isDisabled: false,
    };
  },
  computed: {
    ...mapState('model', ['wards']),

    isEditMode() {
      return this.isEdit && this.data && this.data.id;
    },

    modalTitle() {
      if (this.isEditMode) {
        return `Edit Bed - ${this.code || this.data.code || ''}`;
      }
      return 'Create New Bed';
    },

    canSave() {
      return !this.errors.any() && this.code && this.bed_type && (this.isEditMode || this.ward_id);
    },

    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },
  },
  watch: {
    displayPrompt(val) {
      if (!val) return;

      if (this.isEditMode) {
        // Load bed data for editing
        this.loadBedData();
      } else {
        // Initialize for new bed creation
        this.initValues();
      }

      this.$validator.reset();
    },
  },
  methods: {
    loadBedData() {
      if (this.data) {
        this.code = this.data.code || '';
        this.bed_type = this.data.bed_type || '';
        this.ward_id = this.data.ward_id || '';
        this.status = this.data.status || 'Untaken';
        this.bed_id = this.data.id || '';
      }
    },

    initValues() {
      this.code = '';
      this.bed_type = '';
      this.ward_id = '';
      this.status = 'Untaken';
      this.bed_id = '';
    },

    closeModal() {
      this.$emit('closeModal');
      this.initValues();
    },

    async saveBed() {
      const isValid = await this.$validator.validateAll();

      if (!isValid || !this.canSave) {
        return;
      }

      this.isDisabled = true;

      try {
        const bedData = {
          code: this.code,
          bed_type: this.bed_type,
        };

        if (this.isEditMode) {
          // Update existing bed
          bedData.bed_id = this.bed_id;
          await this.$store.dispatch('model/updateBed', bedData);
        } else {
          // Create new bed
          bedData.ward_id = this.ward_id;
          await this.$store.dispatch('model/addBed', bedData);
        }

        this.$bvToast.toast(`Bed ${this.isEditMode ? 'updated' : 'created'} successfully`, {
          title: 'Success',
          variant: 'success',
          solid: true,
        });

        this.$emit('bedSaved');
        this.closeModal();
      } catch (error) {
        console.error('Error saving bed:', error);
        this.$bvToast.toast(`Failed to ${this.isEditMode ? 'update' : 'create'} bed`, {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isDisabled = false;
      }
    },
  },
};
</script>

<style>
.pointer {
  cursor: pointer;
}
</style>
