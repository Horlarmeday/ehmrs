<template>
  <b-modal
    v-model="showModal"
    :title="`Bill Details - #${bill?.bill_number}`"
    size="xl"
    @hidden="resetForm"
    :ok-disabled="!canSave"
  >
    <div v-if="bill" class="bill-details">
      <!-- Bill Header -->
      <div class="bill-header mb-4">
        <div class="row">
          <div class="col-md-6">
            <h6 class="text-primary"><i class="fas fa-user mr-2"></i>Patient Information</h6>
            <p><strong>Name:</strong> {{ bill.patient?.firstname }} {{ bill.patient?.lastname }}</p>
            <p><strong>ID:</strong> {{ bill.patient?.hospital_id }}</p>
            <p><strong>Phone:</strong> {{ bill.patient?.phone || 'N/A' }}</p>
          </div>
          <div class="col-md-6">
            <h6 class="text-primary"><i class="fas fa-calendar mr-2"></i>Bill Information</h6>
            <p><strong>Bill Number:</strong> {{ bill.bill_number }}</p>
            <p><strong>Visit Date:</strong> {{ formatDate(bill.visit?.date_visit_start) }}</p>
            <p><strong>Due Date:</strong> {{ formatDate(bill.due_date) }}</p>
          </div>
        </div>
      </div>

      <!-- Bill Status and Actions -->
      <div class="bill-status-section mb-4">
        <div class="row">
          <div class="col-md-4">
            <div class="status-card">
              <label>Bill Status</label>
              <b-form-select
                v-model="editForm.billing_status"
                :options="billingStatusOptions"
                :disabled="!isEditing"
                @change="onStatusChange"
              ></b-form-select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="status-card">
              <label>Payment Status</label>
              <b-badge :variant="getPaymentStatusVariant(bill.payment_status)" class="p-2">
                {{ bill.payment_status }}
              </b-badge>
            </div>
          </div>
          <div class="col-md-4">
            <div class="status-card">
              <label>Total Amount</label>
              <h5 class="text-success mb-0">{{ formatCurrency(bill.final_amount) }}</h5>
            </div>
          </div>
        </div>
      </div>

      <!-- Bill Items -->
      <div class="bill-items-section mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="text-primary"><i class="fas fa-list mr-2"></i>Bill Items</h6>
          <b-button v-if="isEditing" variant="outline-primary" size="sm" @click="addBillItem">
            <i class="fas fa-plus mr-2"></i>Add Item
          </b-button>
        </div>

        <div class="table-responsive">
          <table class="table table-sm">
            <thead class="thead-light">
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th v-if="isEditing">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in editForm.items" :key="index">
                <td>
                  <div v-if="isEditing">
                    <b-form-select
                      v-model="item.item_type"
                      :options="itemTypeOptions"
                      size="sm"
                      @change="onItemTypeChange(index)"
                    ></b-form-select>
                    <b-form-select
                      v-model="item.item_id"
                      :options="getItemOptions(item.item_type)"
                      size="sm"
                      class="mt-1"
                      @change="onItemChange(index)"
                    ></b-form-select>
                  </div>
                  <div v-else>
                    <strong>{{ getItemName(item) }}</strong>
                    <br />
                    <small class="text-muted">{{ item.item_type }}</small>
                  </div>
                </td>
                <td>
                  <span v-if="!isEditing">{{ item.item_type }}</span>
                </td>
                <td>
                  <b-form-input
                    v-if="isEditing"
                    v-model.number="item.quantity"
                    type="number"
                    min="1"
                    size="sm"
                    @input="calculateItemTotal(index)"
                  ></b-form-input>
                  <span v-else>{{ item.quantity }}</span>
                </td>
                <td>
                  <b-form-input
                    v-if="isEditing"
                    v-model.number="item.unit_price"
                    type="number"
                    step="0.01"
                    size="sm"
                    @input="calculateItemTotal(index)"
                  ></b-form-input>
                  <span v-else>{{ formatCurrency(item.unit_price) }}</span>
                </td>
                <td>
                  <strong>{{ formatCurrency(item.total_price) }}</strong>
                </td>
                <td v-if="isEditing">
                  <b-button variant="outline-danger" size="sm" @click="removeBillItem(index)">
                    <i class="fas fa-trash"></i>
                  </b-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bill Summary -->
      <div class="bill-summary-section mb-4">
        <div class="row">
          <div class="col-md-6 offset-md-6">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Bill Summary</h6>
                <table class="table table-borderless">
                  <tr>
                    <td>Subtotal:</td>
                    <td class="text-right">{{ formatCurrency(billSubtotal) }}</td>
                  </tr>
                  <tr>
                    <td>Discount:</td>
                    <td class="text-right">
                      <b-form-input
                        v-if="isEditing"
                        v-model.number="editForm.total_discount"
                        type="number"
                        step="0.01"
                        min="0"
                        size="sm"
                        @input="calculateBillTotal"
                      ></b-form-input>
                      <span v-else>{{ formatCurrency(bill.total_discount || 0) }}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Tax:</td>
                    <td class="text-right">
                      <b-form-input
                        v-if="isEditing"
                        v-model.number="editForm.tax_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        size="sm"
                        @input="calculateBillTotal"
                      ></b-form-input>
                      <span v-else>{{ formatCurrency(bill.tax_amount || 0) }}</span>
                    </td>
                  </tr>
                  <tr class="border-top">
                    <td><strong>Total:</strong></td>
                    <td class="text-right">
                      <strong>{{ formatCurrency(editForm.final_amount) }}</strong>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Fields -->
      <div class="additional-fields mb-4">
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Due Date">
              <b-form-input
                v-if="isEditing"
                v-model="editForm.due_date"
                type="date"
                required
              ></b-form-input>
              <span v-else>{{ formatDate(bill.due_date) }}</span>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Notes">
              <b-form-textarea
                v-if="isEditing"
                v-model="editForm.notes"
                rows="3"
                placeholder="Additional notes for this bill..."
              ></b-form-textarea>
              <span v-else>{{ bill.notes || 'No notes' }}</span>
            </b-form-group>
          </div>
        </div>
      </div>

      <!-- Payment History -->
      <div v-if="bill.payments && bill.payments.length > 0" class="payment-history mb-4">
        <h6 class="text-primary"><i class="fas fa-history mr-2"></i>Payment History</h6>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead class="thead-light">
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in bill.payments" :key="payment.id">
                <td>{{ formatDate(payment.payment_date) }}</td>
                <td>{{ formatCurrency(payment.amount) }}</td>
                <td>{{ payment.payment_method }}</td>
                <td>{{ payment.transaction_reference || 'N/A' }}</td>
                <td>
                  <b-badge :variant="getPaymentStatusVariant(payment.status)">
                    {{ payment.status }}
                  </b-badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template #modal-footer>
      <div class="d-flex justify-content-between w-100">
        <div>
          <b-button
            v-if="!isEditing"
            variant="outline-warning"
            @click="startEditing"
            :disabled="bill?.billing_status !== 'DRAFT'"
          >
            <i class="fas fa-edit mr-2"></i>Edit Bill
          </b-button>
          <b-button v-if="isEditing" variant="outline-secondary" @click="cancelEditing">
            <i class="fas fa-times mr-2"></i>Cancel Edit
          </b-button>
        </div>

        <div>
          <b-button variant="secondary" @click="showModal = false"> Close </b-button>
          <b-button
            v-if="isEditing"
            variant="primary"
            @click="saveBill"
            :disabled="!canSave || saving"
          >
            <span v-if="saving"> <i class="fas fa-spinner fa-spin mr-2"></i>Saving... </span>
            <span v-else> <i class="fas fa-save mr-2"></i>Save Changes </span>
          </b-button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'BillDetailsModal',
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
      isEditing: false,
      saving: false,
      editForm: {
        billing_status: '',
        items: [],
        total_discount: 0,
        tax_amount: 0,
        final_amount: 0,
        due_date: '',
        notes: '',
      },
      billingStatusOptions: [
        { value: 'DRAFT', text: 'Draft' },
        { value: 'PENDING', text: 'Pending' },
        { value: 'APPROVED', text: 'Approved' },
        { value: 'REJECTED', text: 'Rejected' },
      ],
      itemTypeOptions: [
        { value: 'DRUG', text: 'Drug' },
        { value: 'TEST', text: 'Test' },
        { value: 'INVESTIGATION', text: 'Investigation' },
        { value: 'SERVICE', text: 'Service' },
        { value: 'ADDITIONAL_ITEM', text: 'Additional Item' },
      ],
      itemOptions: {
        DRUG: [],
        TEST: [],
        INVESTIGATION: [],
        SERVICE: [],
        ADDITIONAL_ITEM: [],
      },
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
    billSubtotal() {
      return this.editForm.items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    },
    canSave() {
      return this.isEditing && this.editForm.billing_status && this.editForm.items.length > 0;
    },
  },
  watch: {
    show(newVal) {
      if (newVal && this.bill) {
        this.initializeForm();
      }
    },
  },
  async mounted() {
    await this.loadItemOptions();
  },
  methods: {
    initializeForm() {
      this.editForm = {
        billing_status: this.bill.billing_status,
        items: this.bill.billItems?.map((item) => ({ ...item })) || [],
        total_discount: this.bill.total_discount || 0,
        tax_amount: this.bill.tax_amount || 0,
        final_amount: this.bill.final_amount,
        due_date: this.bill.due_date,
        notes: this.bill.notes || '',
      };
      this.isEditing = false;
    },

    startEditing() {
      this.isEditing = true;
    },

    cancelEditing() {
      this.initializeForm();
    },

    onStatusChange() {
      // Handle status change logic if needed
    },

    onItemTypeChange(index) {
      const item = this.editForm.items[index];
      item.item_id = null;
      item.unit_price = 0;
      item.total_price = 0;
    },

    onItemChange(index) {
      const item = this.editForm.items[index];
      const selectedItem = this.itemOptions[item.item_type]?.find((opt) => opt.id === item.item_id);

      if (selectedItem) {
        item.unit_price = selectedItem.price || 0;
        this.calculateItemTotal(index);
      }
    },

    calculateItemTotal(index) {
      const item = this.editForm.items[index];
      item.total_price = (item.quantity || 0) * (item.unit_price || 0);
      this.calculateBillTotal();
    },

    calculateBillTotal() {
      const subtotal = this.billSubtotal;
      const discount = this.editForm.total_discount || 0;
      const tax = this.editForm.tax_amount || 0;
      this.editForm.final_amount = subtotal - discount + tax;
    },

    addBillItem() {
      this.editForm.items.push({
        item_type: 'DRUG',
        item_id: null,
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        notes: '',
      });
    },

    removeBillItem(index) {
      this.editForm.items.splice(index, 1);
      this.calculateBillTotal();
    },

    getItemName(item) {
      // This would need to be implemented based on your data structure
      return `Item ${item.item_id}`;
    },

    getItemOptions(itemType) {
      return this.itemOptions[itemType] || [];
    },

    async loadItemOptions() {
      try {
        // Load items for each type - this would need to be implemented
        // based on your existing data loading logic
      } catch (error) {
        console.error('Failed to load item options:', error);
      }
    },

    async saveBill() {
      try {
        this.saving = true;

        const billData = {
          id: this.bill.id,
          billing_status: this.editForm.billing_status,
          items: this.editForm.items,
          total_discount: this.editForm.total_discount,
          tax_amount: this.editForm.tax_amount,
          final_amount: this.editForm.final_amount,
          due_date: this.editForm.due_date,
          notes: this.editForm.notes,
        };

        const result = await this.$store.dispatch('accounting/updateClinicalBill', billData);

        if (result.success) {
          this.$bvToast.toast('Bill updated successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });

          this.$emit('bill-updated', result.data);
          this.isEditing = false;
        } else {
          throw new Error(result.error || 'Failed to update bill');
        }
      } catch (error) {
        console.error('Failed to update bill:', error);
        this.$bvToast.toast(error.message || 'Failed to update bill', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.saving = false;
      }
    },

    resetForm() {
      this.isEditing = false;
      this.saving = false;
      this.editForm = {
        billing_status: '',
        items: [],
        total_discount: 0,
        tax_amount: 0,
        final_amount: 0,
        due_date: '',
        notes: '',
      };
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
.bill-details {
  max-height: 70vh;
  overflow-y: auto;
}

.bill-header {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.bill-header h6 {
  margin-bottom: 1rem;
  font-weight: 600;
}

.bill-header p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.bill-status-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.status-card {
  text-align: center;
}

.status-card label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.bill-items-section {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
}

.bill-summary-section .card {
  border: 1px solid #e9ecef;
}

.payment-history {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.payment-history h6 {
  margin-bottom: 1rem;
  font-weight: 600;
}

.additional-fields {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
}

@media (max-width: 768px) {
  .bill-details {
    max-height: 60vh;
  }

  .bill-header .row,
  .bill-status-section .row {
    flex-direction: column;
  }

  .col-md-6 {
    margin-bottom: 1rem;
  }
}
</style>
