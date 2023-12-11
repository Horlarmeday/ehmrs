<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Complaints</th>
          <th scope="col">Frequency</th>
          <th scope="col">Notes</th>
          <th scope="col">Added By</th>
          <th scope="col">Date Added</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!complaints?.length">
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(complaint, i) in complaints" :key="i">
          <td>{{ complaint.complaint || '-' }}</td>
          <td>{{ complaint.frequency_number }} {{ complaint.frequency }}</td>
          <td>{{ complaint.notes || '-' }}</td>
          <td>{{ complaint?.staff?.fullname || '-' }}</td>
          <td>{{ complaint.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  props: {
    complaints: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>

<style scoped></style>
