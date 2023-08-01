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
          <span v-for="(t, i) in order.data" class="mr-2" :key="i">{{ t.test.name }},</span>
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
      default: () => []
    },
  },
};
</script>

<style scoped></style>
