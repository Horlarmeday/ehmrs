<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Drug</th>
            <th scope="col">Quantity</th>
            <th scope="col">Dosage</th>
            <th scope="col">Remarks</th>
            <th scope="col">Date</th>
            <th scope="col">Added By</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="treatments.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="treatment in treatments" :key="treatment.id">
            <th>
              <span>{{ treatment?.drug || '-' }}</span>
            </th>
            <td>
              <span> {{ treatment?.quantity }} </span>
            </td>
            <td>
              <span> {{ treatment?.dosage_administered }} </span>
            </td>
            <td>
              <span> {{ treatment?.remarks }} </span>
            </td>
            <td>
              <span>{{ treatment.createdAt | dayjs('MMM Do YYYY, h:mma') }}</span>
            </td>
            <td>
              <span>{{ treatment?.staff?.fullname }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    treatments: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>

<style scoped></style>
