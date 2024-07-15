<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Patient Name</th>
          <th scope="col">Amount Paid</th>
          <th scope="col">Payment For</th>
          <th scope="col">Batch Number</th>
          <th scope="col">Payment Type</th>
          <th scope="col">Transaction Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!payments?.length">
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(payment, i) in payments" :key="i">
          <td>{{ payment.name }}</td>
          <td>{{ payment.amount }}</td>
          <td>{{ payment.narration || '-' }}</td>
          <td>{{ payment.batch_no || '-' }}</td>
          <td>{{ payment.payment_type || '-' }}</td>
          <td>{{ payment.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  name: 'PaymentTable',
  data: () => ({
    showPopover: false,
    popOverId: 'popover-reactive-9',
    payment: {},
  }),
  props: {
    payments: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {},
};
</script>

<style scoped></style>
