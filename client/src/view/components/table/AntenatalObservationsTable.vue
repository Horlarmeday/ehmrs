<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Mother Condition</th>
          <th scope="col">Foetal Condition</th>
          <th scope="col">Doctor Comments</th>
          <th scope="col">Continuation Sheet</th>
          <th scope="col">Added By</th>
          <th scope="col">Date Added</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody v-if="!observations?.length || !observations?.[0]?.mother_condition">
        <tr>
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-for="(observation, i) in observations" :key="i">
          <td>{{ observation.mother_condition }}</td>
          <td>{{ observation.foetal_condition }}</td>
          <td>{{ observation.doctor_comments }}</td>
          <td>{{ observation.continuation_sheet }}</td>
          <td>{{ observation?.staff?.fullname }}</td>
          <td>{{ observation.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  name: 'ObservationsTable',
  props: {
    observations: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>

<style scoped></style>
