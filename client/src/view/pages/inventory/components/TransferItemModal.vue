<template>
  <b-modal size="lg" v-model="activePrompt" hide-footer title="Transfer Item Between Inventories">
    <div class="p-2">
      <div v-if="selectedItem" class="mb-4">
        <h5 class="font-weight-bolder mb-3">Source Item</h5>
        <div class="row">
          <div class="col-md-6">
            <label class="font-weight-bolder">Item Name:</label>
            <p class="text-dark">{{ selectedItem.drug?.name }}</p>
          </div>
          <div class="col-md-6">
            <label class="font-weight-bolder">Available Quantity:</label>
            <p class="text-dark">
              {{ selectedItem.quantity_remaining }} {{ selectedItem.unit?.name }}
            </p>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="font-weight-bolder">Destination Inventory:</label>
        <v-select
          v-model="transferData.destination_inventory_id"
          :options="availableInventories"
          label="name"
          :reduce="(inventory) => inventory.id"
          placeholder="Select destination inventory"
          :class="{ 'is-invalid': errors.destination_inventory_id }"
        />
        <span v-if="errors.destination_inventory_id" class="text-danger text-sm">{{
          errors.destination_inventory_id
        }}</span>
      </div>

      <div class="form-group">
        <label class="font-weight-bolder">Quantity to Transfer:</label>
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text">{{ selectedItem?.unit?.name }}</span>
          </div>
          <input
            v-model.number="transferData.quantity"
            type="number"
            class="form-control"
            :class="{ 'is-invalid': errors.quantity }"
            :max="selectedItem?.quantity_remaining"
            :min="1"
            placeholder="Enter quantity"
          />
          <span v-if="errors.quantity" class="invalid-feedback">{{ errors.quantity }}</span>
        </div>
        <small class="text-muted"
          >Maximum: {{ selectedItem?.quantity_remaining }} {{ selectedItem?.unit?.name }}</small
        >
      </div>

      <div class="form-group">
        <label class="font-weight-bolder">Reason (Optional):</label>
        <textarea
          v-model="transferData.reason"
          class="form-control"
          rows="3"
          placeholder="Reason for transfer"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="font-weight-bolder">Notes (Optional):</label>
        <textarea
          v-model="transferData.notes"
          class="form-control"
          rows="2"
          placeholder="Additional notes"
        ></textarea>
      </div>
    </div>
    <div class="d-flex justify-content-end mt-4">
      <button class="btn btn-light mr-3" @click="closeModal">Cancel</button>
      <button
        class="btn btn-primary"
        @click="submitTransfer"
        :disabled="isDisabled || !canSubmit"
        ref="kt_transfer_submit"
      >
        Transfer Item
      </button>
    </div>
  </b-modal>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

export default {
  name: 'TransferItemModal',
  components: {
    vSelect,
  },
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    selectedItem: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      isDisabled: false,
      errors: {},
      transferData: {
        source_inventory_item_id: null,
        destination_inventory_id: null,
        quantity: null,
        reason: '',
        notes: '',
      },
      availableInventories: [],
    };
  },
  computed: {
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },
    canSubmit() {
      return (
        this.transferData.destination_inventory_id &&
        this.transferData.quantity > 0 &&
        this.transferData.quantity <= (this.selectedItem?.quantity_remaining || 0)
      );
    },
  },
  watch: {
    selectedItem: {
      handler(newVal) {
        if (newVal) {
          this.transferData.source_inventory_item_id = newVal.id;
          this.loadAvailableInventories();
        }
      },
      immediate: true,
    },
    displayPrompt(newVal) {
      if (newVal && this.selectedItem) {
        this.resetForm();
      }
    },
  },
  methods: {
    resetForm() {
      this.transferData = {
        source_inventory_item_id: this.selectedItem?.id || null,
        destination_inventory_id: null,
        quantity: null,
        reason: '',
        notes: '',
      };
      this.errors = {};
    },

    closeModal() {
      this.$emit('closeModal');
      this.resetForm();
    },

    async loadAvailableInventories() {
      try {
        const response = await this.$store.dispatch('inventory/fetchInventories');
        const currentInventoryId = this.$route.params.id;
        this.availableInventories = response.data.data.filter(
          (inv) => inv.id !== currentInventoryId
        );
      } catch (error) {
        this.$bvToast.toast('Failed to load inventories', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    validateForm() {
      this.errors = {};

      if (!this.transferData.destination_inventory_id) {
        this.errors.destination_inventory_id = 'Destination inventory is required';
      }

      if (!this.transferData.quantity || this.transferData.quantity <= 0) {
        this.errors.quantity = 'Quantity must be greater than 0';
      } else if (this.transferData.quantity > (this.selectedItem?.quantity_remaining || 0)) {
        this.errors.quantity = 'Quantity cannot exceed available quantity';
      }

      return Object.keys(this.errors).length === 0;
    },

    submitTransfer() {
      if (!this.validateForm()) return;

      const submitButton = this.$refs['kt_transfer_submit'];
      this.addSpinner(submitButton);

      const transferPayload = {
        source_inventory_item_id: this.transferData.source_inventory_item_id,
        destination_inventory_id: this.transferData.destination_inventory_id,
        quantity: this.transferData.quantity,
        reason: this.transferData.reason || undefined,
        notes: this.transferData.notes || undefined,
      };

      this.$store
        .dispatch('inventory/transferItemBetweenInventories', transferPayload)
        .then(() => {
          this.$bvToast.toast('Item transferred successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
          this.closeModal();
          this.$emit('transfer-success');
        })
        .catch((error) => {
          this.removeSpinner(submitButton);
          this.$bvToast.toast(error.response?.data?.message || 'Transfer failed', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        });
    },

    addSpinner(button) {
      this.isDisabled = true;
      if (button) {
        button.classList.add('spinner', 'spinner-light', 'spinner-right');
      }
    },

    removeSpinner(button) {
      this.isDisabled = false;
      if (button) {
        button.classList.remove('spinner', 'spinner-light', 'spinner-right');
      }
    },
  },
};
</script>

<style scoped></style>
