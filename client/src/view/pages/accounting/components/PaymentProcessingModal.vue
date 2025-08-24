<template>
  <b-modal
    v-model="showModal"
    :title="`Process Payment - Bill #${bill?.bill_number}`"
    size="lg"
    @ok="processPayment"
    @hidden="resetForm"
    :ok-disabled="!canProcessPayment"
  >
    <div v-if="bill" class="payment-processing">
      <!-- Bill Summary -->
      <div class="bill-summary mb-4">
        <div class="card">
          <div class="card-body">
            <h6 class="card-title">
              <i class="fas fa-file-invoice text-primary mr-2"></i>
              Bill Summary
            </h6>
            <div class="row">
              <div class="col-md-6">
                <p>
                  <strong>Patient:</strong> {{ bill.patient?.firstname }}
                  {{ bill.patient?.lastname }}
                </p>
                <p>
                  <strong>Total Amount:</strong>
                  <span class="text-success font-weight-bold">{{
                    formatCurrency(bill.final_amount)
                  }}</span>
                </p>
                <p>
                  <strong>Outstanding:</strong>
                  <span class="text-warning font-weight-bold">{{
                    formatCurrency(outstandingAmount)
                  }}</span>
                </p>
              </div>
              <div class="col-md-6">
                <p>
                  <strong>Bill Status:</strong>
                  <b-badge :variant="getBillingStatusVariant(bill.billing_status)">{{
                    bill.billing_status
                  }}</b-badge>
                </p>
                <p>
                  <strong>Payment Status:</strong>
                  <b-badge :variant="getPaymentStatusVariant(bill.payment_status)">{{
                    bill.payment_status
                  }}</b-badge>
                </p>
                <p><strong>Due Date:</strong> {{ formatDate(bill.due_date) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Details Form -->
      <b-form @submit.prevent="processPayment">
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Payment Method" label-for="payment-method" required>
              <b-form-select
                id="payment-method"
                v-model="paymentForm.payment_method"
                :options="paymentMethodOptions"
                required
                @change="onPaymentMethodChange"
              ></b-form-select>
            </b-form-group>
          </div>

          <div class="col-md-6">
            <b-form-group label="Payment Type" label-for="payment-type" required>
              <b-form-select
                id="payment-type"
                v-model="paymentForm.payment_type"
                :options="paymentTypeOptions"
                required
              ></b-form-select>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Amount to Pay" label-for="amount" required>
              <b-form-input
                id="amount"
                v-model.number="paymentForm.amount"
                type="number"
                step="0.01"
                :min="0.01"
                :max="outstandingAmount"
                required
                @input="validateAmount"
              ></b-form-input>
              <small class="form-text text-muted">
                Outstanding: {{ formatCurrency(outstandingAmount) }}
              </small>
            </b-form-group>
          </div>

          <div class="col-md-6">
            <b-form-group label="Payment Date" label-for="payment-date" required>
              <b-form-input
                id="payment-date"
                v-model="paymentForm.payment_date"
                type="date"
                required
              ></b-form-input>
            </b-form-group>
          </div>
        </div>

        <!-- Payment Method Specific Fields -->
        <div v-if="paymentForm.payment_method === 'CASH'" class="cash-payment-fields">
          <div class="row">
            <div class="col-md-6">
              <b-form-group label="Cash Received" label-for="cash-received">
                <b-form-input
                  id="cash-received"
                  v-model.number="paymentForm.cash_received"
                  type="number"
                  step="0.01"
                  min="0.01"
                  @input="calculateChange"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Change Given" label-for="change-given">
                <b-form-input
                  id="change-given"
                  v-model="paymentForm.change_given"
                  readonly
                  class="bg-light"
                ></b-form-input>
              </b-form-group>
            </div>
          </div>
        </div>

        <div v-if="paymentForm.payment_method === 'CARD'" class="card-payment-fields">
          <div class="row">
            <div class="col-md-6">
              <b-form-group label="Card Type" label-for="card-type">
                <b-form-select
                  id="card-type"
                  v-model="paymentForm.card_type"
                  :options="cardTypeOptions"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Transaction Reference" label-for="transaction-ref">
                <b-form-input
                  id="transaction-ref"
                  v-model="paymentForm.transaction_reference"
                  placeholder="Card transaction reference"
                ></b-form-input>
              </b-form-group>
            </div>
          </div>
        </div>

        <div v-if="paymentForm.payment_method === 'BANK_TRANSFER'" class="bank-payment-fields">
          <div class="row">
            <div class="col-md-6">
              <b-form-group label="Bank Name" label-for="bank-name">
                <b-form-input
                  id="bank-name"
                  v-model="paymentForm.bank_name"
                  placeholder="Bank name"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Transaction Reference" label-for="bank-transaction-ref">
                <b-form-input
                  id="bank-transaction-ref"
                  v-model="paymentForm.transaction_reference"
                  placeholder="Bank transaction reference"
                ></b-form-input>
              </b-form-group>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <b-form-group label="Payment Notes" label-for="payment-notes">
          <b-form-textarea
            id="payment-notes"
            v-model="paymentForm.notes"
            rows="3"
            placeholder="Additional notes about this payment..."
          ></b-form-textarea>
        </b-form-group>
      </b-form>
    </div>

    <!-- Loading State -->
    <div v-if="processing" class="text-center py-3">
      <b-spinner variant="primary"></b-spinner>
      <p class="mt-2 text-muted">Processing payment...</p>
    </div>

    <template #modal-footer>
      <b-button variant="secondary" @click="showModal = false" :disabled="processing">
        Cancel
      </b-button>
      <b-button
        variant="primary"
        @click="processPayment"
        :disabled="!canProcessPayment || processing"
      >
        <span v-if="processing"> <i class="fas fa-spinner fa-spin mr-2"></i>Processing... </span>
        <span v-else> <i class="fas fa-credit-card mr-2"></i>Process Payment </span>
      </b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'PaymentProcessingModal',
  props: {
    bill: {
      type: Object,
      default: null,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      processing: false,
      paymentForm: {
        payment_method: 'CASH',
        payment_type: 'POINT_OF_SERVICE',
        amount: 0,
        payment_date: new Date().toISOString().split('T')[0],
        cash_received: 0,
        change_given: 0,
        card_type: '',
        bank_name: '',
        transaction_reference: '',
        notes: '',
      },
      paymentMethodOptions: [
        { value: 'CASH', text: 'Cash' },
        { value: 'CARD', text: 'Card' },
        { value: 'BANK_TRANSFER', text: 'Bank Transfer' },
        { value: 'MOBILE_MONEY', text: 'Mobile Money' },
        { value: 'CHECK', text: 'Check' },
      ],
      paymentTypeOptions: [
        { value: 'POINT_OF_SERVICE', text: 'Point of Service' },
        { value: 'DEPOSIT', text: 'Deposit' },
        { value: 'INSURANCE_CLAIM', text: 'Insurance Claim' },
        { value: 'REFUND', text: 'Refund' },
      ],
      cardTypeOptions: [
        { value: 'VISA', text: 'Visa' },
        { value: 'MASTERCARD', text: 'Mastercard' },
        { value: 'VERVE', text: 'Verve' },
        { value: 'OTHER', text: 'Other' },
      ],
    };
  },
  computed: {
    showModal: {
      get() {
        return this.show;
      },
      set(value) {
        this.$emit('update:show', value);
      },
    },
    outstandingAmount() {
      if (!this.bill) return 0;
      return this.bill.final_amount - (this.bill.paid_amount || 0);
    },
    canProcessPayment() {
      return (
        this.paymentForm.amount > 0 &&
        this.paymentForm.amount <= this.outstandingAmount &&
        this.paymentForm.payment_method &&
        this.paymentForm.payment_type &&
        this.paymentForm.payment_date
      );
    },
  },
  watch: {
    show(newVal) {
      if (newVal && this.bill) {
        this.initializeForm();
      }
    },
  },
  methods: {
    initializeForm() {
      this.paymentForm.amount = this.outstandingAmount;
      this.paymentForm.payment_date = new Date().toISOString().split('T')[0];
      this.paymentForm.cash_received = this.outstandingAmount;
      this.calculateChange();
    },

    onPaymentMethodChange() {
      // Reset method-specific fields
      this.paymentForm.cash_received = 0;
      this.paymentForm.change_given = 0;
      this.paymentForm.card_type = '';
      this.paymentForm.bank_name = '';
      this.paymentForm.transaction_reference = '';
    },

    calculateChange() {
      if (this.paymentForm.payment_method === 'CASH') {
        this.paymentForm.change_given =
          (this.paymentForm.cash_received || 0) - (this.paymentForm.amount || 0);
      }
    },

    validateAmount() {
      if (this.paymentForm.amount > this.outstandingAmount) {
        this.paymentForm.amount = this.outstandingAmount;
      }
      if (this.paymentForm.amount < 0) {
        this.paymentForm.amount = 0;
      }
      this.calculateChange();
    },

    async processPayment() {
      try {
        this.processing = true;

        const paymentData = {
          bill_id: this.bill.id,
          patient_id: this.bill.patient_id,
          amount: this.paymentForm.amount,
          payment_method: this.paymentForm.payment_method,
          payment_type: this.paymentForm.payment_type,
          payment_date: this.paymentForm.payment_date,
          notes: this.paymentForm.notes,
          // Method-specific data
          cash_received:
            this.paymentForm.payment_method === 'CASH' ? this.paymentForm.cash_received : null,
          change_given:
            this.paymentForm.payment_method === 'CASH' ? this.paymentForm.change_given : null,
          card_type: this.paymentForm.payment_method === 'CARD' ? this.paymentForm.card_type : null,
          bank_name:
            this.paymentForm.payment_method === 'BANK_TRANSFER' ? this.paymentForm.bank_name : null,
          transaction_reference: this.paymentForm.transaction_reference || null,
        };

        const result = await this.$store.dispatch('accounting/createClinicalPayment', paymentData);

        if (result.success) {
          this.$bvToast.toast('Payment processed successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });

          this.$emit('payment-processed', result.data);
          this.showModal = false;
        } else {
          throw new Error(result.error || 'Failed to process payment');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        this.$bvToast.toast(error.message || 'Failed to process payment', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.processing = false;
      }
    },

    resetForm() {
      this.paymentForm = {
        payment_method: 'CASH',
        payment_type: 'POINT_OF_SERVICE',
        amount: 0,
        payment_date: new Date().toISOString().split('T')[0],
        cash_received: 0,
        change_given: 0,
        card_type: '',
        bank_name: '',
        transaction_reference: '',
        notes: '',
      };
      this.processing = false;
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount || 0);
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-NG');
    },

    getBillingStatusVariant(status) {
      const variants = {
        DRAFT: 'secondary',
        PENDING: 'warning',
        APPROVED: 'success',
        REJECTED: 'danger',
      };
      return variants[status] || 'secondary';
    },

    getPaymentStatusVariant(status) {
      const variants = {
        PENDING: 'warning',
        PARTIAL: 'info',
        PAID: 'success',
        CANCELLED: 'danger',
      };
      return variants[status] || 'secondary';
    },
  },
};
</script>

<style scoped>
.payment-processing {
  max-height: 70vh;
  overflow-y: auto;
}

.bill-summary {
  background: #f8f9fa;
  border-radius: 8px;
}

.bill-summary .card {
  border: none;
  background: transparent;
}

.bill-summary .card-body {
  padding: 1rem;
}

.bill-summary p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.cash-payment-fields,
.card-payment-fields,
.bank-payment-fields {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin: 1rem 0;
}

.form-text {
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .payment-processing {
    max-height: 60vh;
  }
}
</style>
