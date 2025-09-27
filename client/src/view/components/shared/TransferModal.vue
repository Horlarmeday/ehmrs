<template>
  <b-modal
    ref="modal"
    id="transfer-modal"
    title="Transfer Items to Dispensary"
    size="lg"
    :ok-disabled="!canTransfer"
    ok-title="Transfer Items"
    @ok="handleTransfer"
    @hidden="resetForm"
  >
    <div v-if="targetDispensary">
      <div class="alert alert-custom alert-light-primary">
        <div class="alert-icon">
          <i class="ki ki-shop text-primary"></i>
        </div>
        <div class="alert-text">
          <strong>Transfer to:</strong> {{ targetDispensary.name }}
          <br />
          <small class="text-muted">{{ targetDispensary.description }}</small>
        </div>
      </div>

      <div class="form-group">
        <label>Select Items to Transfer:</label>
        <div class="table-responsive" style="max-height: 400px; overflow-y: auto">
          <table class="table table-bordered">
            <thead class="thead-light">
              <tr>
                <th width="50">Select</th>
                <th>Item</th>
                <th>Available</th>
                <th>Transfer Qty</th>
                <th>Unit Price</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in availableItems" :key="item.id">
                <td>
                  <div class="checkbox-inline">
                    <label class="checkbox">
                      <input
                        type="checkbox"
                        :value="item.id"
                        v-model="selectedItems"
                        @change="toggleItemSelection(item)"
                      />
                      <span></span>
                    </label>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="symbol symbol-30 symbol-light-primary mr-2">
                      <div class="symbol-label">
                        <i class="ki ki-package text-primary font-size-h6"></i>
                      </div>
                    </div>
                    <div>
                      <span class="text-dark font-weight-bolder">{{ item.name }}</span>
                      <br />
                      <small class="text-muted">{{ item.item_code || item.code }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="font-weight-bold">
                    {{ getAvailableQuantity(item) }} {{ item.unit_of_measurement || 'units' }}
                  </span>
                </td>
                <td width="120">
                  <input
                    type="number"
                    class="form-control form-control-sm"
                    :min="0"
                    :max="getAvailableQuantity(item)"
                    v-model.number="transferQuantities[item.id]"
                    :disabled="!selectedItems.includes(item.id)"
                    @input="validateQuantity(item)"
                  />
                </td>
                <td>
                  <span class="font-weight-bold">
                    {{ formatCurrency(item.unit_price || item.selling_price) }}
                  </span>
                </td>
              </tr>

              <tr v-if="availableItems.length === 0">
                <td colspan="5" class="text-center text-muted py-4">
                  No items available for transfer
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Transfer Summary -->
      <div v-if="selectedItems.length > 0" class="card card-custom bg-light-success mb-3">
        <div class="card-body py-3">
          <div class="row">
            <div class="col-md-6">
              <small class="text-muted d-block">Total Items Selected:</small>
              <span class="font-weight-bold text-success">{{ selectedItems.length }}</span>
            </div>
            <div class="col-md-6">
              <small class="text-muted d-block">Total Transfer Value:</small>
              <span class="font-weight-bold text-success">{{
                formatCurrency(totalTransferValue)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Transfer Notes -->
      <div class="form-group">
        <label>Transfer Notes (Optional):</label>
        <textarea
          v-model="transferNotes"
          class="form-control"
          rows="3"
          placeholder="Add any notes about this transfer..."
        ></textarea>
      </div>

      <!-- Validation Errors -->
      <div v-if="validationErrors.length > 0" class="alert alert-danger">
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
          class="btn btn-primary"
          :disabled="!canTransfer || loading"
          @click="ok()"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm mr-2"></span>
          Transfer Items
        </button>
      </div>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'TransferModal',
  data() {
    return {
      targetDispensary: null,
      availableItems: [],
      selectedItems: [],
      transferQuantities: {},
      transferNotes: '',
      loading: false,
      validationErrors: [],
    };
  },
  computed: {
    canTransfer() {
      return (
        this.selectedItems.length > 0 &&
        this.selectedItems.every(
          (itemId) =>
            this.transferQuantities[itemId] > 0 &&
            this.transferQuantities[itemId] <= this.getAvailableQuantity(this.getItemById(itemId))
        )
      );
    },
    totalTransferValue() {
      return this.selectedItems.reduce((total, itemId) => {
        const item = this.getItemById(itemId);
        const quantity = this.transferQuantities[itemId] || 0;
        const price = item?.unit_price || item?.selling_price || 0;
        return total + quantity * price;
      }, 0);
    },
  },
  methods: {
    show(dispensary, items) {
      this.targetDispensary = dispensary;
      this.availableItems = items.filter(
        (item) => (item.quantity_available || item.current_stock || item.stock_quantity || 0) > 0
      );
      this.$refs.modal.show();
    },

    hide() {
      this.$refs.modal.hide();
    },

    resetForm() {
      this.targetDispensary = null;
      this.availableItems = [];
      this.selectedItems = [];
      this.transferQuantities = {};
      this.transferNotes = '';
      this.loading = false;
      this.validationErrors = [];
    },

    toggleItemSelection(item) {
      if (this.selectedItems.includes(item.id)) {
        this.$set(this.transferQuantities, item.id, 1);
      } else {
        this.$delete(this.transferQuantities, item.id);
      }
      this.validateForm();
    },

    validateQuantity(item) {
      const quantity = this.transferQuantities[item.id];
      const available = this.getAvailableQuantity(item);

      if (quantity > available) {
        this.$set(this.transferQuantities, item.id, available);
      }

      if (quantity <= 0) {
        this.$set(this.transferQuantities, item.id, 1);
      }

      this.validateForm();
    },

    validateForm() {
      this.validationErrors = [];

      if (this.selectedItems.length === 0) {
        this.validationErrors.push('Please select at least one item to transfer');
        return;
      }

      for (const itemId of this.selectedItems) {
        const item = this.getItemById(itemId);
        const quantity = this.transferQuantities[itemId];
        const available = this.getAvailableQuantity(item);

        if (!quantity || quantity <= 0) {
          this.validationErrors.push(`Please enter a valid quantity for ${item.name}`);
        } else if (quantity > available) {
          this.validationErrors.push(
            `Transfer quantity for ${item.name} cannot exceed available stock (${available})`
          );
        }
      }
    },

    async handleTransfer() {
      this.validateForm();
      if (this.validationErrors.length > 0) return;

      this.loading = true;

      try {
        const transferData = {
          dispensary_id: this.targetDispensary.id,
          items: this.selectedItems.map((itemId) => ({
            item_id: itemId,
            quantity: this.transferQuantities[itemId],
          })),
          notes: this.transferNotes,
          transfer_type: 'main_to_dispensary',
        };

        await this.$store.dispatch('generalStore/transferToDispensary', transferData);

        this.$emit('transfer-completed', {
          dispensary: this.targetDispensary,
          items: transferData.items,
          notes: this.transferNotes,
        });

        this.hide();

        this.$toast.success('Items transferred successfully');
      } catch (error) {
        if (error.response?.status === 422 && error.response?.data?.errors) {
          this.validationErrors = Object.values(error.response.data.errors).flat();
        } else if (error.response?.status === 400) {
          this.validationErrors = [error.response.data?.message || 'Invalid transfer request'];
        } else if (error.response?.status === 409) {
          this.validationErrors = ['Insufficient stock available for transfer'];
        } else {
          this.$toast.error(error.response?.data?.message || 'Failed to transfer items');
        }
      } finally {
        this.loading = false;
      }
    },

    getItemById(itemId) {
      return this.availableItems.find((item) => item.id === itemId);
    },

    getAvailableQuantity(item) {
      return item?.quantity_available || item?.current_stock || item?.stock_quantity || 0;
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
.table th {
  font-size: 0.9rem;
  font-weight: 600;
  color: #5e6278;
  border-top: none;
}

.table td {
  font-size: 0.9rem;
  vertical-align: middle;
}

.checkbox {
  margin: 0;
}

.symbol-30 {
  width: 30px;
  height: 30px;
}

.form-control-sm {
  font-size: 0.85rem;
}

.alert-custom {
  border: 1px solid transparent;
  border-radius: 0.42rem;
}

.card-custom {
  box-shadow: 0px 0px 20px 0px rgba(82, 63, 105, 0.05);
  border-radius: 0.42rem;
}
</style>
