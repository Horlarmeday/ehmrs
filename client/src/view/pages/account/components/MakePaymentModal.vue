<template>
  <b-modal v-model="activePrompt" title="Make Payment" size="lg" @hide="handleClose">
    <form @submit.prevent="handleSubmit" class="form">
      <!-- Payment Mode -->
      <div class="form-group">
        <label>Mode of Payment <span class="text-danger">*</span></label>
        <select
          v-validate="'required'"
          data-vv-validate-on="blur"
          v-model="form.mode_of_payment"
          name="mode_of_payment"
          class="form-control"
        >
          <option value="">Select Payment Mode</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Wallet">Wallet</option>
          <option value="Insurance">Insurance</option>
        </select>
        <span class="text-danger text-sm">{{ errors.first('mode_of_payment') }}</span>
      </div>

      <!-- Payment Type -->
      <div class="form-group">
        <label>Payment Type <span class="text-danger">*</span></label>
        <select
          v-model="form.type"
          class="form-control"
          v-validate="'required'"
          data-vv-validate-on="blur"
          name="payment_type"
        >
          <option value="">Select Payment Type</option>
          <option value="Full Payment">Full Payment</option>
          <option value="Partial Payment">Partial Payment</option>
          <option value="Advance Payment">Advance Payment</option>
        </select>
        <span class="text-danger text-sm">{{ errors.first('payment_type') }}</span>
      </div>

      <!-- Total Amount -->
      <div class="form-group">
        <label>Total Amount <span class="text-danger">*</span></label>
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text">₦</span>
          </div>
          <input
            readonly
            type="number"
            v-model="form.totalAmount"
            class="form-control"
            step="0.01"
            min="0"
          />
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
                <th>Date Requested</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in availableItems" :key="index">
                <td>{{ item.name }}</td>
                <td>{{ formatCurrency(item.price) }}</td>
                <td>
                  {{ item.date | dayjs('YYYY-MM-DD, h:mma') }}
                </td>
              </tr>
            </tbody>
          </table>
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
    <template #modal-footer>
      <div class="w-100">
        <div class="float-right">
          <button
            ref="kt_payment_submit"
            class="btn btn-primary"
            @click="handleSubmit"
            :disabled="isDisabled"
          >
            Process Payment
          </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'MakePaymentModal',
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    availableItems: {
      type: Array,
      default: () => [],
    },
    serviceType: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      showItemSelector: false,
      selectedItems: [],
      isDisabled: false,
      form: {
        mode_of_payment: '',
        type: '',
        selectedItems: [],
        totalAmount: 0,
        notes: '',
      },
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
  },
  watch: {
    availableItems: {
      immediate: true,
      handler(items) {
        this.form.selectedItems = items.map((item) => ({ id: item.id, price: item.price }));
        this.form.totalAmount = items.reduce((sum, item) => sum + +item.price, 0);
      },
      deep: true,
    },
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(value || 0);
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.$emit('closeModal');
      this.initValues();
    },

    async handleSubmit() {
      this.$validator.validateAll().then((result) => {
        if (result) {
          const obj = {
            id: this.$route.params.id,
            mode_of_payment: this.form.mode_of_payment,
            type: this.form.type,
            selectedItems: this.form.selectedItems,
            notes: this.form.notes,
            serviceType: this.serviceType,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_payment_submit'];
          this.addSpinner(submitButton);
          this.$store
            .dispatch('account/addPayment', obj)
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    initValues() {
      this.form = {
        mode_of_payment: '',
        type: '',
        totalAmount: 0,
        selectedItems: [],
        notes: '',
      };
      this.selectedItems = [];
    },

    handleClose() {
      this.$emit('closeModal');
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
