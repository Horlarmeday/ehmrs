<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Complaint Note</th>
          <th scope="col">History Note</th>
          <th scope="col">Examination</th>
          <th scope="col">Has Smoking History</th>
          <th scope="col">Added By</th>
          <th scope="col">Date Added</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!histories?.length">
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(history, i) in histories" :key="i">
          <td>{{ history.complaint_note || '-' }}</td>
          <td>{{ history.history_note || '-' }}</td>
          <td>{{ history.examination_note || '-' }}</td>
          <td>{{ history.has_smoking_history ? 'Yes' : 'No' }}</td>
          <td>{{ history?.staff?.fullname || '-' }}</td>
          <td>{{ history.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  props: {
    histories: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>

<style scoped></style>
