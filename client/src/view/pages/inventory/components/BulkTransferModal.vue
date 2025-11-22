<template>
  <b-modal
    size="xl"
    v-model="activePrompt"
    hide-footer
    title="Bulk Transfer Items Between Inventories"
  >
    <div class="p-2">
      <div v-if="selectedItems.length === 0" class="text-center py-5">
        <i class="flaticon2-warning text-warning icon-4x"></i>
        <p class="text-muted mt-3 mb-0">No items selected for transfer</p>
        <small class="text-muted">Please select items from the table to transfer</small>
      </div>

      <div v-else>
        <div class="form-group mb-4">
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

        <div class="mb-4">
          <h5 class="font-weight-bolder mb-3">Items to Transfer ({{ selectedItems.length }})</h5>
          <div class="table-responsive">
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Available Quantity</th>
                  <th>Quantity to Transfer</th>
                  <th>Unit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in transferItems" :key="item.id">
                  <td>{{ item.drug?.name }}</td>
                  <td>{{ item.quantity_remaining }} {{ item.unit?.name }}</td>
                  <td>
                    <input
                      v-model.number="item.quantity"
                      type="number"
                      class="form-control form-control-sm"
                      :class="{ 'is-invalid': item.isInvalid }"
                      :max="item.quantity_remaining"
                      :min="1"
                      @input="validateItemQuantity(index, $event)"
                    />
                    <span v-if="item.isInvalid" class="text-danger text-sm">Invalid quantity</span>
                  </td>
                  <td>{{ item.unit?.name }}</td>
                  <td>
                    <span v-if="item.isInvalid" class="badge badge-danger">Invalid</span>
                    <span
                      v-else-if="!item.quantity || item.quantity <= 0"
                      class="badge badge-warning"
                      >Not Set</span
                    >
                    <span v-else class="badge badge-success">Ready</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="form-group">
          <label class="font-weight-bolder">Reason (Optional):</label>
          <textarea
            v-model="transferData.reason"
            class="form-control"
            rows="3"
            placeholder="Reason for bulk transfer"
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

        <div v-if="transferResult" class="mt-4">
          <div
            v-if="transferResult.successful && transferResult.successful.length > 0"
            class="alert alert-success"
          >
            <h6>Successfully Transferred ({{ transferResult.successful.length }})</h6>
            <ul class="mb-0">
              <li v-for="(result, idx) in transferResult.successful" :key="idx">
                {{ result.sourceItem.drug?.name }} - {{ result.sourceItem.quantity_remaining }}
                {{ result.sourceItem.unit?.name }}
              </li>
            </ul>
          </div>
          <div
            v-if="transferResult.failed && transferResult.failed.length > 0"
            class="alert alert-danger mt-3"
          >
            <h6>Failed Transfers ({{ transferResult.failed.length }})</h6>
            <ul class="mb-0">
              <li v-for="(failure, idx) in transferResult.failed" :key="idx">
                Item ID {{ failure.item_id }}: {{ failure.error }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-end mt-4">
      <button class="btn btn-light mr-3" @click="closeModal">Cancel</button>
      <button
        class="btn btn-primary"
        @click="submitBulkTransfer"
        :disabled="isDisabled || !canSubmit"
        ref="kt_bulk_transfer_submit"
      >
        Transfer {{ selectedItems.length }} Item(s)
      </button>
    </div>
  </b-modal>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

export default {
  name: 'BulkTransferModal',
  components: {
    vSelect,
  },
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    selectedItems: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isDisabled: false,
      errors: {},
      transferData: {
        destination_inventory_id: null,
        items: [],
        reason: '',
        notes: '',
      },
      transferItems: [],
      availableInventories: [],
      transferResult: null,
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
      if (!this.transferData.destination_inventory_id) return false;
      if (this.transferItems.length === 0) return false;
      return this.transferItems.every(
        (item) => item.quantity > 0 && item.quantity <= item.quantity_remaining && !item.isInvalid
      );
    },
  },
  watch: {
    selectedItems: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.initializeTransferItems();
        }
      },
      immediate: true,
    },
    displayPrompt(newVal) {
      if (newVal && this.selectedItems.length > 0) {
        this.resetForm();
        this.loadAvailableInventories();
      }
    },
  },
  methods: {
    initializeTransferItems() {
      this.transferItems = this.selectedItems.map((item) => ({
        ...item,
        quantity: null,
        isInvalid: false,
      }));
    },

    resetForm() {
      this.transferData = {
        destination_inventory_id: null,
        items: [],
        reason: '',
        notes: '',
      };
      this.errors = {};
      this.transferResult = null;
      this.initializeTransferItems();
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

    validateItemQuantity(index, event) {
      const item = this.transferItems[index];
      const quantity = parseInt(event.target.value);
      item.isInvalid = !quantity || quantity <= 0 || quantity > item.quantity_remaining;
    },

    validateForm() {
      this.errors = {};

      if (!this.transferData.destination_inventory_id) {
        this.errors.destination_inventory_id = 'Destination inventory is required';
      }

      const invalidItems = this.transferItems.filter(
        (item) => !item.quantity || item.quantity <= 0 || item.quantity > item.quantity_remaining
      );

      if (invalidItems.length > 0) {
        this.errors.items = 'Some items have invalid quantities';
      }

      return Object.keys(this.errors).length === 0;
    },

    submitBulkTransfer() {
      if (!this.validateForm()) return;

      const submitButton = this.$refs['kt_bulk_transfer_submit'];
      this.addSpinner(submitButton);

      const transferPayload = {
        destination_inventory_id: this.transferData.destination_inventory_id,
        items: this.transferItems.map((item) => ({
          source_inventory_item_id: item.id,
          quantity: item.quantity,
        })),
        reason: this.transferData.reason || undefined,
        notes: this.transferData.notes || undefined,
      };

      this.$store
        .dispatch('inventory/bulkTransferItemsBetweenInventories', transferPayload)
        .then((response) => {
          this.transferResult = response.data.data;
          const successCount = this.transferResult.successful?.length || 0;
          const failedCount = this.transferResult.failed?.length || 0;

          if (failedCount === 0) {
            this.$bvToast.toast(`Successfully transferred ${successCount} item(s)`, {
              title: 'Success',
              variant: 'success',
              solid: true,
            });
            this.closeModal();
            this.$emit('transfer-success');
          } else if (successCount > 0) {
            this.$bvToast.toast(
              `Transferred ${successCount} item(s), ${failedCount} failed. Check details below.`,
              {
                title: 'Partial Success',
                variant: 'warning',
                solid: true,
              }
            );
            this.removeSpinner(submitButton);
          } else {
            this.$bvToast.toast('All transfers failed. Check details below.', {
              title: 'Error',
              variant: 'danger',
              solid: true,
            });
            this.removeSpinner(submitButton);
          }
        })
        .catch((error) => {
          this.removeSpinner(submitButton);
          this.$bvToast.toast(error.response?.data?.message || 'Bulk transfer failed', {
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
