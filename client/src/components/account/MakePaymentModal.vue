<template>
  <b-modal v-model="show" title="Make Payment" size="lg" @hide="handleClose" :busy="loading">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <form v-else @submit.prevent="handleSubmit" class="form">
      <!-- Payment Mode -->
      <div class="form-group">
        <label>Mode of Payment <span class="text-danger">*</span></label>
        <select
          v-model="form.mode_of_payment"
          class="form-control"
          :class="{ 'is-invalid': errors.mode_of_payment }"
          required
        >
          <option value="">Select Payment Mode</option>
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="WALLET">Wallet</option>
          <option value="INSURANCE">Insurance</option>
        </select>
        <div class="invalid-feedback" v-if="errors.mode_of_payment">
          {{ errors.mode_of_payment }}
        </div>
      </div>

      <!-- Payment Type -->
      <div class="form-group">
        <label>Payment Type <span class="text-danger">*</span></label>
        <select
          v-model="form.type"
          class="form-control"
          :class="{ 'is-invalid': errors.type }"
          required
        >
          <option value="">Select Payment Type</option>
          <option value="FULL">Full Payment</option>
          <option value="PARTIAL">Partial Payment</option>
          <option value="ADVANCE">Advance Payment</option>
        </select>
        <div class="invalid-feedback" v-if="errors.type">
          {{ errors.type }}
        </div>
      </div>

      <!-- Total Amount -->
      <div class="form-group">
        <label>Total Amount <span class="text-danger">*</span></label>
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text">₦</span>
          </div>
          <input
            type="number"
            v-model.number="form.totalAmount"
            class="form-control"
            :class="{ 'is-invalid': errors.totalAmount }"
            step="0.01"
            min="0"
            required
          />
        </div>
        <div class="invalid-feedback" v-if="errors.totalAmount">
          {{ errors.totalAmount }}
        </div>
      </div>

      <!-- Selected Items -->
      <div class="form-group">
        <label>Selected Items <span class="text-danger">*</span></label>
        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Item</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in selectedItems" :key="index">
                <td>{{ item.name }}</td>
                <td>{{ formatCurrency(item.amount) }}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-icon btn-light btn-hover-danger btn-sm"
                    @click="removeItem(index)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">
                  <button
                    type="button"
                    class="btn btn-light-primary btn-sm"
                    @click="showItemSelector = true"
                  >
                    <i class="fas fa-plus mr-2"></i>
                    Add Item
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="invalid-feedback" v-if="errors.selectedItems">
          {{ errors.selectedItems }}
        </div>
      </div>

      <!-- Additional Notes -->
      <div class="form-group">
        <label>Notes</label>
        <textarea
          v-model="form.notes"
          class="form-control"
          rows="3"
          placeholder="Add any additional notes here..."
        ></textarea>
      </div>
    </form>

    <!-- Item Selector Modal -->
    <b-modal
      v-model="showItemSelector"
      title="Select Items"
      size="lg"
      @hide="showItemSelector = false"
    >
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Item</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in availableItems" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ formatCurrency(item.amount) }}</td>
              <td>
                <button
                  type="button"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm"
                  @click="addItem(item)"
                >
                  <i class="fas fa-plus"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </b-modal>

    <template #modal-footer>
      <div class="w-100">
        <div class="float-right">
          <button type="button" class="btn btn-light-primary mr-2" @click="handleClose">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="handleSubmit" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm mr-2"></span>
            Process Payment
          </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'MakePaymentModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    visitId: {
      type: [String, Number],
      required: true,
    },
    availableItems: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      loading: false,
      showItemSelector: false,
      selectedItems: [],
      form: {
        mode_of_payment: '',
        type: '',
        totalAmount: 0,
        selectedItems: [],
        notes: '',
      },
      errors: {},
    };
  },
  watch: {
    selectedItems: {
      handler(items) {
        this.form.selectedItems = items.map((item) => item.id);
        this.form.totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions('account', ['createPaymentHistory']),
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
      }).format(value || 0);
    },
    addItem(item) {
      if (!this.selectedItems.find((i) => i.id === item.id)) {
        this.selectedItems.push(item);
      }
      this.showItemSelector = false;
    },
    removeItem(index) {
      this.selectedItems.splice(index, 1);
    },
    validateForm() {
      this.errors = {};
      let isValid = true;

      if (!this.form.mode_of_payment) {
        this.errors.mode_of_payment = 'Payment mode is required';
        isValid = false;
      }

      if (!this.form.type) {
        this.errors.type = 'Payment type is required';
        isValid = false;
      }

      if (!this.form.totalAmount || this.form.totalAmount <= 0) {
        this.errors.totalAmount = 'Total amount must be greater than 0';
        isValid = false;
      }

      if (!this.form.selectedItems.length) {
        this.errors.selectedItems = 'At least one item must be selected';
        isValid = false;
      }

      return isValid;
    },
    async handleSubmit() {
      if (!this.validateForm()) return;

      this.loading = true;
      try {
        await this.createPaymentHistory({
          visitId: this.visitId,
          payment: this.form,
        });

        this.$notify({
          group: 'foo',
          title: 'Success',
          text: 'Payment processed successfully',
          type: 'success',
        });

        this.handleClose();
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to process payment',
          type: 'error',
        });
      } finally {
        this.loading = false;
      }
    },
    handleClose() {
      this.form = {
        mode_of_payment: '',
        type: '',
        totalAmount: 0,
        selectedItems: [],
        notes: '',
      };
      this.selectedItems = [];
      this.errors = {};
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.invalid-feedback {
  display: block;
}

.table {
  margin-bottom: 0;
}
</style>
