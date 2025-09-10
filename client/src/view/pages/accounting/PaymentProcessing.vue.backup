<template>
  <div class="payment-processing">
    <!-- Header Section -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-credit-card text-success mr-3"></i>
        Payment Processing
      </h1>
      <div class="header-actions">
        <b-button variant="success" @click="showRecordDepositModal">
          <i class="fas fa-piggy-bank mr-2"></i>Record Deposit
        </b-button>
        <b-button variant="info" @click="showPaymentHistory">
          <i class="fas fa-history mr-2"></i>Payment History
        </b-button>
      </div>
    </div>

    <!-- Payment Methods Section -->
    <div class="payment-methods-section">
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="payment-method-card" @click="selectPaymentMethod('CASH')">
            <div class="method-icon bg-success">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <h6>Cash Payment</h6>
            <p>Process cash payments at billing points</p>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="payment-method-card" @click="selectPaymentMethod('CARD')">
            <div class="method-icon bg-primary">
              <i class="fas fa-credit-card"></i>
            </div>
            <h6>Card Payment</h6>
            <p>Process debit/credit card payments</p>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="payment-method-card" @click="selectPaymentMethod('BANK_TRANSFER')">
            <div class="method-icon bg-info">
              <i class="fas fa-university"></i>
            </div>
            <h6>Bank Transfer</h6>
            <p>Process bank transfer payments</p>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="payment-method-card" @click="selectPaymentMethod('MOBILE_MONEY')">
            <div class="method-icon bg-warning">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <h6>Mobile Money</h6>
            <p>Process mobile money payments</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bill Selection Section -->
    <div v-if="selectedPaymentMethod" class="bill-selection-section">
      <div class="card">
        <div class="card-header">
          <h5>Select Bill for Payment</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <b-form-group label="Patient Search" label-for="patient-search">
                <b-form-input
                  id="patient-search"
                  v-model="patientSearch"
                  placeholder="Search by patient name or number..."
                  @input="searchPatients"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Bill Number" label-for="bill-number">
                <b-form-input
                  id="bill-number"
                  v-model="billNumberSearch"
                  placeholder="Enter bill number..."
                  @input="searchByBillNumber"
                ></b-form-input>
              </b-form-group>
            </div>
          </div>

          <!-- Patient Bills Table -->
          <div v-if="patientBills.length > 0" class="bills-table mt-4">
            <h6>
              Outstanding Bills for {{ selectedPatient?.first_name }}
              {{ selectedPatient?.last_name }}
            </h6>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th>Bill #</th>
                    <th>Visit Date</th>
                    <th>Total Amount</th>
                    <th>Paid Amount</th>
                    <th>Balance</th>
                    <th>Due Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="bill in patientBills" :key="bill.id">
                    <td>
                      <strong>{{ bill.bill_number }}</strong>
                    </td>
                    <td>{{ formatDate(bill.visit?.date_visit_start) }}</td>
                    <td>{{ formatCurrency(bill.final_amount) }}</td>
                    <td>{{ formatCurrency(bill.paid_amount || 0) }}</td>
                    <td>
                      <span class="balance-amount">{{ formatCurrency(bill.balance) }}</span>
                    </td>
                    <td>{{ formatDate(bill.due_date) }}</td>
                    <td>
                      <b-button
                        variant="primary"
                        size="sm"
                        @click="selectBillForPayment(bill)"
                        :disabled="bill.balance <= 0"
                      >
                        Pay {{ formatCurrency(bill.balance) }}
                      </b-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Processing Modal -->
    <b-modal
      v-model="showPaymentModal"
      title="Process Payment"
      size="lg"
      @ok="processPayment"
      @hidden="resetPaymentForm"
    >
      <div v-if="selectedBill">
        <!-- Bill Summary -->
        <div class="bill-summary mb-4">
          <h6>Bill Summary</h6>
          <div class="row">
            <div class="col-md-6">
              <p><strong>Bill #:</strong> {{ selectedBill.bill_number }}</p>
              <p>
                <strong>Patient:</strong> {{ selectedPatient?.first_name }}
                {{ selectedPatient?.last_name }}
              </p>
              <p><strong>Total Amount:</strong> {{ formatCurrency(selectedBill.final_amount) }}</p>
            </div>
            <div class="col-md-6">
              <p>
                <strong>Paid Amount:</strong> {{ formatCurrency(selectedBill.paid_amount || 0) }}
              </p>
              <p>
                <strong>Balance:</strong>
                <span class="text-danger">{{ formatCurrency(selectedBill.balance) }}</span>
              </p>
              <p><strong>Due Date:</strong> {{ formatDate(selectedBill.due_date) }}</p>
            </div>
          </div>
        </div>

        <!-- Payment Details Form -->
        <b-form @submit.prevent="processPayment">
          <div class="row">
            <div class="col-md-6">
              <b-form-group label="Payment Amount" label-for="payment-amount">
                <b-form-input
                  id="payment-amount"
                  v-model.number="paymentForm.amount"
                  type="number"
                  step="0.01"
                  :max="selectedBill.balance"
                  required
                  @input="calculateChange"
                ></b-form-input>
                <small class="form-text text-muted">
                  Maximum: {{ formatCurrency(selectedBill.balance) }}
                </small>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Payment Method" label-for="payment-method">
                <b-form-select
                  id="payment-method"
                  v-model="paymentForm.payment_method"
                  :options="paymentMethodOptions"
                  required
                ></b-form-select>
              </b-form-group>
            </div>
          </div>

          <!-- Payment Method Specific Fields -->
          <div v-if="paymentForm.payment_method === 'CARD'" class="row">
            <div class="col-md-6">
              <b-form-group label="Card Type" label-for="card-type">
                <b-form-select
                  id="card-type"
                  v-model="paymentForm.card_type"
                  :options="cardTypeOptions"
                  required
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Transaction ID" label-for="transaction-id">
                <b-form-input
                  id="transaction-id"
                  v-model="paymentForm.transaction_id"
                  placeholder="POS transaction ID"
                  required
                ></b-form-input>
              </b-form-group>
            </div>
          </div>

          <div v-if="paymentForm.payment_method === 'BANK_TRANSFER'" class="row">
            <div class="col-md-6">
              <b-form-group label="Bank Reference" label-for="bank-reference">
                <b-form-input
                  id="bank-reference"
                  v-model="paymentForm.bank_reference"
                  placeholder="Bank transfer reference"
                  required
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Bank Name" label-for="bank-name">
                <b-form-input
                  id="bank-name"
                  v-model="paymentForm.bank_name"
                  placeholder="Bank name"
                  required
                ></b-form-input>
              </b-form-group>
            </div>
          </div>

          <div v-if="paymentForm.payment_method === 'MOBILE_MONEY'" class="row">
            <div class="col-md-6">
              <b-form-group label="Provider" label-for="mobile-provider">
                <b-form-select
                  id="mobile-provider"
                  v-model="paymentForm.mobile_money_provider"
                  :options="mobileMoneyProviders"
                  required
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Transaction ID" label-for="mobile-transaction">
                <b-form-input
                  id="mobile-transaction"
                  v-model="paymentForm.transaction_id"
                  placeholder="Mobile money transaction ID"
                  required
                ></b-form-input>
              </b-form-group>
            </div>
          </div>

          <!-- Collection Point -->
          <div class="row">
            <div class="col-md-6">
              <b-form-group label="Collection Point" label-for="collection-point">
                <b-form-select
                  id="collection-point"
                  v-model="paymentForm.collection_point"
                  :options="billingPointOptions"
                  required
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Notes" label-for="payment-notes">
                <b-form-input
                  id="payment-notes"
                  v-model="paymentForm.notes"
                  placeholder="Additional payment notes..."
                ></b-form-input>
              </b-form-group>
            </div>
          </div>

          <!-- Change Calculation -->
          <div v-if="paymentForm.amount > selectedBill.balance" class="change-calculation">
            <div class="alert alert-info">
              <strong>Change Due:</strong> {{ formatCurrency(changeAmount) }}
            </div>
          </div>
        </b-form>
      </div>

      <template #modal-footer>
        <b-button variant="secondary" @click="showPaymentModal = false">
          Cancel
        </b-button>
        <b-button variant="success" @click="processPayment" :disabled="processing">
          <span v-if="processing"> <i class="fas fa-spinner fa-spin mr-2"></i>Processing... </span>
          <span v-else>
            Process Payment
          </span>
        </b-button>
      </template>
    </b-modal>

    <!-- Record Deposit Modal -->
    <b-modal
      v-model="showDepositModal"
      title="Record Patient Deposit"
      size="lg"
      @ok="recordDeposit"
      @hidden="resetDepositForm"
    >
      <b-form @submit.prevent="recordDeposit">
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Patient" label-for="deposit-patient">
              <b-form-select
                id="deposit-patient"
                v-model="depositForm.patient_id"
                :options="patientOptions"
                required
                @change="onDepositPatientChange"
              ></b-form-select>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Deposit Type" label-for="deposit-type">
              <b-form-select
                id="deposit-type"
                v-model="depositForm.deposit_type"
                :options="depositTypeOptions"
                required
              ></b-form-select>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Amount" label-for="deposit-amount">
              <b-form-input
                id="deposit-amount"
                v-model.number="depositForm.amount"
                type="number"
                step="0.01"
                min="0"
                required
              ></b-form-input>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Reference Number" label-for="deposit-reference">
              <b-form-input
                id="deposit-reference"
                v-model="depositForm.reference_number"
                placeholder="Payment reference number"
                required
              ></b-form-input>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Expiry Date" label-for="deposit-expiry">
              <b-form-input
                id="deposit-expiry"
                v-model="depositForm.expiry_date"
                type="date"
                required
              ></b-form-input>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Description" label-for="deposit-description">
              <b-form-textarea
                id="deposit-description"
                v-model="depositForm.description"
                rows="3"
                placeholder="Deposit description..."
              ></b-form-textarea>
            </b-form-group>
          </div>
        </div>
      </b-form>

      <template #modal-footer>
        <b-button variant="secondary" @click="showDepositModal = false">
          Cancel
        </b-button>
        <b-button variant="success" @click="recordDeposit" :disabled="recordingDeposit">
          <span v-if="recordingDeposit">
            <i class="fas fa-spinner fa-spin mr-2"></i>Recording...
          </span>
          <span v-else>
            Record Deposit
          </span>
        </b-button>
      </template>
    </b-modal>

    <!-- Payment Success Modal -->
    <b-modal
      v-model="showSuccessModal"
      title="Payment Successful!"
      size="md"
      @ok="closeSuccessModal"
      @hidden="closeSuccessModal"
    >
      <div class="text-center">
        <div class="success-icon mb-3">
          <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
        </div>
        <h5>Payment Processed Successfully</h5>
        <p>
          Payment Reference: <strong>{{ paymentReference }}</strong>
        </p>
        <p>
          Amount: <strong>{{ formatCurrency(paymentAmount) }}</strong>
        </p>
        <p>
          Method: <strong>{{ paymentMethod }}</strong>
        </p>

        <div class="mt-4">
          <b-button variant="primary" @click="printReceipt">
            <i class="fas fa-print mr-2"></i>Print Receipt
          </b-button>
          <b-button variant="outline-primary" @click="sendReceipt">
            <i class="fas fa-envelope mr-2"></i>Send Receipt
          </b-button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'PaymentProcessing',
  data() {
    return {
      // Payment method selection
      selectedPaymentMethod: null,

      // Patient search
      patientSearch: '',
      billNumberSearch: '',
      selectedPatient: null,
      patientBills: [],

      // Payment processing
      showPaymentModal: false,
      selectedBill: null,
      processing: false,
      paymentForm: {
        amount: 0,
        payment_method: 'CASH',
        card_type: '',
        transaction_id: '',
        bank_reference: '',
        bank_name: '',
        mobile_money_provider: '',
        collection_point: 'main-cashier',
        notes: '',
      },

      // Deposit recording
      showDepositModal: false,
      recordingDeposit: false,
      depositForm: {
        patient_id: null,
        deposit_type: 'CASH',
        amount: 0,
        reference_number: '',
        expiry_date: '',
        description: '',
      },

      // Success modal
      showSuccessModal: false,
      paymentReference: '',
      paymentAmount: 0,
      paymentMethod: '',

      // Options
      paymentMethodOptions: [
        { value: 'CASH', text: 'Cash' },
        { value: 'CARD', text: 'Card' },
        { value: 'BANK_TRANSFER', text: 'Bank Transfer' },
        { value: 'MOBILE_MONEY', text: 'Mobile Money' },
        { value: 'DEPOSIT', text: 'Deposit' },
      ],
      cardTypeOptions: [
        { value: 'VISA', text: 'Visa' },
        { value: 'MASTERCARD', text: 'Mastercard' },
        { value: 'VERVE', text: 'Verve' },
        { value: 'OTHER', text: 'Other' },
      ],
      mobileMoneyProviders: [
        { value: 'MTN_MOMO', text: 'MTN Mobile Money' },
        { value: 'AIRTEL_MONEY', text: 'Airtel Money' },
        { value: 'GLO_MONEY', text: 'Glo Money' },
        { value: 'OPAY', text: 'OPay' },
        { value: 'PAYSTACK', text: 'Paystack' },
      ],
      depositTypeOptions: [
        { value: 'CASH', text: 'Cash' },
        { value: 'BANK_TRANSFER', text: 'Bank Transfer' },
        { value: 'CARD', text: 'Card' },
        { value: 'MOBILE_MONEY', text: 'Mobile Money' },
        { value: 'OTHER', text: 'Other' },
      ],
      billingPointOptions: [
        { value: 'main-cashier', text: 'Main Cashier' },
        { value: 'accounting-office', text: 'Accounting Office' },
        { value: 'emergency-cashier', text: 'Emergency Cashier' },
      ],
      patientOptions: [],
    };
  },
  computed: {
    changeAmount() {
      if (!this.selectedBill || this.paymentForm.amount <= this.selectedBill.balance) {
        return 0;
      }
      return this.paymentForm.amount - this.selectedBill.balance;
    },
  },
  async mounted() {
    await this.loadOptions();
  },
  methods: {
    async loadOptions() {
      try {
        // Load patients using Vuex store
        const patients = await this.$store.dispatch('patient/searchPatients', '');
        this.patientOptions = patients.map(patient => ({
          value: patient.id,
          text: `${patient.first_name} ${patient.last_name} (${patient.patient_number})`,
        }));

        // Load billing points using Vuex store
        const billingPoints = await this.$store.dispatch('accounting/fetchBillingPoints');
        this.billingPointOptions = billingPoints.map(point => ({
          value: point.id,
          text: point.name,
        }));
      } catch (error) {
        console.error('Failed to load options:', error);
      }
    },

    // Payment method selection
    selectPaymentMethod(method) {
      this.selectedPaymentMethod = method;
      this.paymentForm.payment_method = method;
      this.resetSearch();
    },

    resetSearch() {
      this.patientSearch = '';
      this.billNumberSearch = '';
      this.selectedPatient = null;
      this.patientBills = [];
    },

    // Patient search
    async searchPatients() {
      if (this.patientSearch.length < 3) return;

      try {
        const patients = await this.$store.dispatch('patient/searchPatients', this.patientSearch);

        if (patients.length > 0) {
          this.selectedPatient = patients[0];
          await this.loadPatientBills();
        }
      } catch (error) {
        console.error('Failed to search patients:', error);
      }
    },

    async searchByBillNumber() {
      if (!this.billNumberSearch) return;

      try {
        // Use Vuex store action to get bill by number
        const bill = await this.$store.dispatch(
          'accounting/getClinicalBillByNumber',
          this.billNumberSearch
        );

        if (bill) {
          this.selectedPatient = bill.patient;
          await this.loadPatientBills();
        }
      } catch (error) {
        console.error('Failed to search by bill number:', error);
      }
    },

    async loadPatientBills() {
      if (!this.selectedPatient) return;

      try {
        const bills = await this.$store.dispatch(
          'accounting/getPatientClinicalBills',
          this.selectedPatient.id
        );
        this.patientBills = bills;
      } catch (error) {
        console.error('Failed to load patient bills:', error);
      }
    },

    // Bill selection
    selectBillForPayment(bill) {
      this.selectedBill = bill;
      this.paymentForm.amount = bill.balance;
      this.showPaymentModal = true;
    },

    // Payment processing
    async processPayment() {
      try {
        this.processing = true;

        const paymentData = {
          bill_id: this.selectedBill.id,
          patient_id: this.selectedPatient.id,
          amount: this.paymentForm.amount,
          payment_method: this.paymentForm.payment_method,
          payment_type: this.paymentForm.amount >= this.selectedBill.balance ? 'FULL' : 'PARTIAL',
          collection_point: this.paymentForm.collection_point,
          transaction_id: this.paymentForm.transaction_id,
          bank_reference: this.paymentForm.bank_reference,
          card_type: this.paymentForm.card_type,
          mobile_money_provider: this.paymentForm.mobile_money_provider,
          notes: this.paymentForm.notes,
          processed_by: this.$store.state.user.id,
        };

        const result = await this.$store.dispatch('account/createPayment', paymentData);

        if (result.success) {
          // Show success modal
          this.paymentReference = result.data.payment_reference;
          this.paymentAmount = this.paymentForm.amount;
          this.paymentMethod = this.paymentForm.payment_method;

          this.showPaymentModal = false;
          this.showSuccessModal = true;

          // Refresh bills
          await this.loadPatientBills();
        } else {
          this.$bvToast.toast(result.error || 'Failed to process payment', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Failed to process payment:', error);
        this.$bvToast.toast('Failed to process payment', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.processing = false;
      }
    },

    // Deposit recording
    showRecordDepositModal() {
      this.showDepositModal = true;
    },

    onDepositPatientChange() {
      // Could load patient-specific deposit information here
    },

    async recordDeposit() {
      try {
        this.recordingDeposit = true;

        const depositData = {
          patient_id: this.depositForm.patient_id,
          amount: this.depositForm.amount,
          deposit_type: this.depositForm.deposit_type,
          reference_number: this.depositForm.reference_number,
          expiry_date: this.depositForm.expiry_date,
          description: this.depositForm.description,
          created_by: this.$store.state.user.id,
        };

        const result = await this.$store.dispatch('account/createDeposit', depositData);

        if (result.success) {
          this.$bvToast.toast('Deposit recorded successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });

          this.showDepositModal = false;
          this.resetDepositForm();
        } else {
          this.$bvToast.toast(result.error || 'Failed to record deposit', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Failed to record deposit:', error);
        this.$bvToast.toast('Failed to record deposit', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.recordingDeposit = false;
      }
    },

    // Form resets
    resetPaymentForm() {
      this.paymentForm = {
        amount: 0,
        payment_method: 'CASH',
        card_type: '',
        transaction_id: '',
        bank_reference: '',
        bank_name: '',
        mobile_money_provider: '',
        collection_point: 'main-cashier',
        notes: '',
      };
      this.selectedBill = null;
    },

    resetDepositForm() {
      this.depositForm = {
        patient_id: null,
        deposit_type: 'CASH',
        amount: 0,
        reference_number: '',
        expiry_date: '',
        description: '',
      };
    },

    // Success modal actions
    closeSuccessModal() {
      this.showSuccessModal = false;
      this.resetPaymentForm();
    },

    printReceipt() {
      // Implement receipt printing
      this.$bvToast.toast('Receipt printing coming soon', {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },

    sendReceipt() {
      // Implement receipt sending
      this.$bvToast.toast('Receipt sending coming soon', {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },

    // Utility methods
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount || 0);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('en-NG');
    },

    calculateChange() {
      // This is handled by the computed property
    },

    showPaymentHistory() {
      this.$router.push({ name: 'payment-history' });
    },
  },
};
</script>

<style scoped>
.payment-processing {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.payment-methods-section {
  margin-bottom: 2rem;
}

.payment-method-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.payment-method-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.method-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  color: white;
}

.payment-method-card h6 {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.payment-method-card p {
  color: #6c757d;
  margin: 0;
  font-size: 0.875rem;
}

.bill-selection-section {
  margin-bottom: 2rem;
}

.bills-table {
  margin-top: 1rem;
}

.balance-amount {
  font-weight: 600;
  color: #dc3545;
}

.change-calculation {
  margin-top: 1rem;
}

.success-icon {
  text-align: center;
}

@media (max-width: 768px) {
  .payment-processing {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
