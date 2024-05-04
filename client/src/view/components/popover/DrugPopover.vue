<template>
  <b-popover :show="activePrompt" :target="target" triggers="click blur">
    <template #title>
      <b-button @click="onClose" class="close" aria-label="Close">
        <span class="d-inline-block" aria-hidden="true">&times;</span>
      </b-button>
      {{ drug?.drug?.name }}
    </template>
    <table class="table table-sm">
      <tbody>
        <tr>
          <th scope="row">Drug Type</th>
          <td>
            <span>
              <span :class="getDrugTypeStatus(drug.drug_type)" class="label label-dot mr-2"></span
              ><span :class="getDrugTypeTextColor(drug.drug_type)" class="font-weight-bold">{{
                drug.drug_type
              }}</span>
            </span>
          </td>
        </tr>
        <tr v-if="drug?.drug_group">
          <th scope="row">Drug Group</th>
          <td>
            <span>{{ drug.drug_group }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Starting Date</th>
          <td>
            <span>{{ drug.start_date | dayjs('DD/MM/YYYY') }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Route</th>
          <td>
            <span>{{ drug.route?.name }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Qty Prescribed</th>
          <td>
            <span>{{ drug.quantity_prescribed }} {{ drug?.dosage_form?.name }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Dispense Status</th>
          <td>
            <span :class="getDispenseStatus(drug.dispense_status)" class="label label-inline">{{
              drug.dispense_status
            }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Total Price</th>
          <td>
            <span>₦{{ drug.total_price }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Payment Status</th>
          <td>
            <span :class="getPaymentStatus(drug.payment_status)" class="label label-inline">{{
              drug.payment_status
            }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Notes</th>
          <td>
            <span>{{ drug.notes }}</span>
          </td>
        </tr>
        <tr>
          <th>Requested By</th>
          <td>
            <a href="#"
              >{{ drug?.requester?.firstname }} {{ drug?.requester?.lastname?.charAt(0) }}</a
            >
          </td>
        </tr>
      </tbody>
    </table>
  </b-popover>
</template>

<script>
export default {
  props: {
    target: {
      type: String,
      required: true,
    },
    drug: {
      type: Object,
      required: true,
      default: () => {},
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    activePrompt: {
      get() {
        return this.show;
      },
      set(value) {
        this.$emit('closePopover', value);
      },
    },
  },
  methods: {
    onClose() {
      this.$emit('closePopover', false);
    },
    getDispenseStatus(status) {
      if (status === 'Pending') return 'label-light-warning';
      if (status === 'Dispensed') return 'label-light-success';
      if (status === 'Returned') return 'label-light-info';
    },
    getPaymentStatus(status) {
      if (status === 'Pending') return 'label-light-warning font-weight-bold';
      if (status === 'Paid') return 'label-light-success font-weight-bold';
      if (status === 'Cleared') return 'label-light-info font-weight-bold';
      if (status === 'Permitted') return 'label-light-danger font-weight-bold';
    },
    getDrugTypeStatus(type) {
      if (type === 'NHIS') return 'label-danger';
      if (type === 'Cash') return 'label-success';
    },
    getDrugTypeTextColor(type) {
      if (type === 'NHIS') return 'text-danger';
      if (type === 'Cash') return 'text-success';
    },
  },
};
</script>

<style scoped></style>
