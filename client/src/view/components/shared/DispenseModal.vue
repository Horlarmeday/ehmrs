<template>
  <b-modal
    ref="modal"
    id="dispense-modal"
    :title="modalTitle"
    size="md"
    :ok-disabled="!canDispense"
    ok-title="Dispense Item"
    @ok="handleDispense"
    @hidden="resetForm"
  >
    <div v-if="selectedItem">
      <!-- Item Information -->
      <div class="card card-custom bg-light-primary mb-4">
        <div class="card-body py-3">
          <div class="d-flex align-items-center">
            <div class="symbol symbol-40 symbol-light-primary mr-3">
              <div class="symbol-label">
                <i class="ki ki-package text-primary font-size-h5"></i>
              </div>
            </div>
            <div class="flex-grow-1">
              <h5 class="text-dark font-weight-bolder mb-1">{{ selectedItem.name }}</h5>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted font-size-sm">{{
                  selectedItem.item_code || selectedItem.code
                }}</span>
                <div class="text-right">
                  <span class="text-dark font-weight-bold">Available: {{ availableQuantity }}</span>
                  <small class="text-muted d-block">{{
                    selectedItem.unit_of_measurement || 'units'
                  }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dispensary Selection -->
      <div v-if="showDispensarySelection" class="form-group">
        <label class="form-label">Select Dispensary:</label>
        <select v-model="selectedDispensaryId" class="form-control" required>
          <option value="">Choose dispensary...</option>
          <option
            v-for="dispensary in availableDispensaries"
            :key="dispensary.id"
            :value="dispensary.id"
          >
            {{ dispensary.name }}
          </option>
        </select>
      </div>

      <!-- Quantity -->
      <div class="form-group">
        <label class="form-label">Quantity to Dispense:</label>
        <div class="input-group">
          <input
            type="number"
            v-model.number="dispenseQuantity"
            class="form-control"
            :min="1"
            :max="availableQuantity"
            required
            @input="validateQuantity"
          />
          <div class="input-group-append">
            <span class="input-group-text">{{ selectedItem.unit_of_measurement || 'units' }}</span>
          </div>
        </div>
        <small class="form-text text-muted">
          Maximum available: {{ availableQuantity }}
          {{ selectedItem.unit_of_measurement || 'units' }}
        </small>
      </div>

      <!-- Purpose/Department -->
      <div class="form-group">
        <label class="form-label">Purpose/Department:</label>
        <select v-model="dispensePurpose" class="form-control" required>
          <option value="">Select purpose...</option>
          <option value="patient_care">Patient Care</option>
          <option value="emergency">Emergency</option>
          <option value="surgery">Surgery</option>
          <option value="laboratory">Laboratory</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="outpatient">Outpatient</option>
          <option value="inpatient">Inpatient</option>
          <option value="other">Other</option>
        </select>
      </div>

      <!-- Recipient Information -->
      <div class="form-group">
        <label class="form-label">Recipient Name:</label>
        <input
          type="text"
          v-model="recipientName"
          class="form-control"
          placeholder="Enter recipient name"
          required
        />
      </div>

      <!-- Priority -->
      <div class="form-group">
        <label class="form-label">Priority:</label>
        <select v-model="dispensePriority" class="form-control">
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      <!-- Notes -->
      <div class="form-group">
        <label class="form-label">Notes (Optional):</label>
        <textarea
          v-model="dispenseNotes"
          class="form-control"
          rows="3"
          placeholder="Add any notes about this dispensing..."
        ></textarea>
      </div>

      <!-- Cost Information -->
      <div class="card card-custom bg-light-success">
        <div class="card-body py-3">
          <div class="row">
            <div class="col-6">
              <small class="text-muted d-block">Unit Price:</small>
              <span class="font-weight-bold text-success">
                {{ formatCurrency(selectedItem.unit_price || selectedItem.selling_price) }}
              </span>
            </div>
            <div class="col-6">
              <small class="text-muted d-block">Total Cost:</small>
              <span class="font-weight-bold text-success">{{ formatCurrency(totalCost) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation Errors -->
      <div v-if="validationErrors.length > 0" class="alert alert-danger mt-3">
        <ul class="mb-0">
          <li v-for="error in validationErrors" :key="error">{{ error }}</li>
        </ul>
      </div>
    </div>

    <template #modal-footer="{ ok, cancel }">
      <div class="w-100 d-flex justify-content-between">
        <button type="button" class="btn btn-light" @click="cancel()">Cancel</button>
        <button
          type="button"
          class="btn btn-success"
          :disabled="!canDispense || loading"
          @click="ok()"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm mr-2"></span>
          Dispense Item
        </button>
      </div>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'DispenseModal',
  data() {
    return {
      selectedItem: null,
      selectedDispensary: null,
      selectedDispensaryId: '',
      dispenseQuantity: 1,
      dispensePurpose: '',
      recipientName: '',
      dispensePriority: 'normal',
      dispenseNotes: '',
      loading: false,
      validationErrors: [],
      availableDispensaries: [],
    };
  },
  computed: {
    modalTitle() {
      return this.selectedDispensary
        ? `Dispense from ${this.selectedDispensary.name}`
        : 'Dispense Item';
    },

    showDispensarySelection() {
      return !this.selectedDispensary && this.availableDispensaries.length > 0;
    },

    availableQuantity() {
      if (this.selectedDispensary) {
        // If dispensing from a specific dispensary
        const dispensaryItem = this.selectedDispensary.items?.find(
          (item) => item.general_store_item_id === this.selectedItem.id
        );
        return dispensaryItem?.quantity || 0;
      }
      // If dispensing from main store
      return (
        this.selectedItem?.quantity_available ||
        this.selectedItem?.current_stock ||
        this.selectedItem?.stock_quantity ||
        0
      );
    },

    totalCost() {
      const price = this.selectedItem?.unit_price || this.selectedItem?.selling_price || 0;
      return price * (this.dispenseQuantity || 0);
    },

    canDispense() {
      return (
        this.selectedItem &&
        this.dispenseQuantity > 0 &&
        this.dispenseQuantity <= this.availableQuantity &&
        this.dispensePurpose &&
        this.recipientName.trim() &&
        (!this.showDispensarySelection || this.selectedDispensaryId)
      );
    },
  },
  methods: {
    show(item, dispensary = null) {
      this.selectedItem = item;
      this.selectedDispensary = dispensary;
      this.dispenseQuantity = 1;

      if (!dispensary) {
        this.loadAvailableDispensaries();
      }

      this.$refs.modal.show();
    },

    hide() {
      this.$refs.modal.hide();
    },

    resetForm() {
      this.selectedItem = null;
      this.selectedDispensary = null;
      this.selectedDispensaryId = '';
      this.dispenseQuantity = 1;
      this.dispensePurpose = '';
      this.recipientName = '';
      this.dispensePriority = 'normal';
      this.dispenseNotes = '';
      this.loading = false;
      this.validationErrors = [];
      this.availableDispensaries = [];
    },

    async loadAvailableDispensaries() {
      try {
        const response = await this.$store.dispatch('generalStore/fetchDispensaries');
        this.availableDispensaries = response.data.data.filter((d) => d.is_active);
      } catch (error) {
        console.error('Failed to load dispensaries:', error);
      }
    },

    validateQuantity() {
      if (this.dispenseQuantity > this.availableQuantity) {
        this.dispenseQuantity = this.availableQuantity;
      }

      if (this.dispenseQuantity < 1) {
        this.dispenseQuantity = 1;
      }

      this.validateForm();
    },

    validateForm() {
      this.validationErrors = [];

      if (!this.dispenseQuantity || this.dispenseQuantity <= 0) {
        this.validationErrors.push('Please enter a valid quantity');
      }

      if (this.dispenseQuantity > this.availableQuantity) {
        this.validationErrors.push(
          `Quantity cannot exceed available stock (${this.availableQuantity})`
        );
      }

      if (!this.dispensePurpose) {
        this.validationErrors.push('Please select a purpose');
      }

      if (!this.recipientName.trim()) {
        this.validationErrors.push('Please enter recipient name');
      }

      if (this.showDispensarySelection && !this.selectedDispensaryId) {
        this.validationErrors.push('Please select a dispensary');
      }
    },

    async handleDispense() {
      this.validateForm();
      if (this.validationErrors.length > 0) return;

      this.loading = true;

      try {
        const dispenseData = {
          item_id: this.selectedItem.id,
          quantity: this.dispenseQuantity,
          purpose: this.dispensePurpose,
          recipient_name: this.recipientName,
          priority: this.dispensePriority,
          notes: this.dispenseNotes,
          dispensary_id: this.selectedDispensary?.id || this.selectedDispensaryId,
          unit_cost: this.selectedItem.unit_price || this.selectedItem.selling_price || 0,
          total_cost: this.totalCost,
        };

        await this.$store.dispatch('generalStore/dispenseFromDispensary', dispenseData);

        this.$emit('dispense-completed', {
          item: this.selectedItem,
          dispensary:
            this.selectedDispensary ||
            this.availableDispensaries.find((d) => d.id === this.selectedDispensaryId),
          quantity: this.dispenseQuantity,
          recipient: this.recipientName,
          purpose: this.dispensePurpose,
        });

        this.hide();

        this.$toast.success('Item dispensed successfully');
      } catch (error) {
        if (error.response?.status === 422 && error.response?.data?.errors) {
          this.validationErrors = Object.values(error.response.data.errors).flat();
        } else if (error.response?.status === 400) {
          this.validationErrors = [error.response.data?.message || 'Invalid dispense request'];
        } else if (error.response?.status === 409) {
          this.validationErrors = ['Insufficient stock available for dispensing'];
        } else {
          this.$toast.error(error.response?.data?.message || 'Failed to dispense item');
        }
      } finally {
        this.loading = false;
      }
    },

    formatCurrency(amount) {
      if (!amount || amount === 0) return '₦0.00';
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
      }).format(amount);
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
  box-shadow: 0px 0px 20px 0px rgba(82, 63, 105, 0.05);
  border-radius: 0.42rem;
}

.symbol-40 {
  width: 40px;
  height: 40px;
}

.input-group-text {
  background-color: #f3f6f9;
  border-color: #e4e6ef;
  color: #7e8299;
  font-size: 0.9rem;
}

.alert {
  border-radius: 0.42rem;
}
</style>
