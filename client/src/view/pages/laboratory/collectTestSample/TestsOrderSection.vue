<template>
  <table class="table table-striped mb-8">
    <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Sample Type</th>
        <th scope="col">Tests</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(order, index) in tests" :key="order.id">
        <td scope="row">{{ index + 1 }}</td>
        <th scope="row">{{ order.sample }}</th>
        <td>
          <div v-for="(t, i) in order.data" class="mr-2" :key="i">
            {{ t?.test?.name }}
            <span
              :class="getPaymentStatus(t?.payment_status)"
              class="label label-sm label-inline ml-2 pl-1 pr-1"
              >{{ t?.payment_status }}
            </span>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'TestsOrderSection',
  props: {
    tests: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    getPaymentStatus(status) {
      if (status === 'Pending') return 'label-warning ';
      if (status === 'Paid') return 'label-success ';
      if (status === 'Cleared') return 'label-info ';
      return 'label-primary ';
    },
  },
};
</script>

<style scoped></style>
