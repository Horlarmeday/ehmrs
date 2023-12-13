<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Type of Duty</th>
            <th scope="col">Notes</th>
            <th scope="col">Added By</th>
            <th scope="col">Date Requested</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!nursingNotes?.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="(note, i) in nursingNotes" :key="i">
            <td>{{ note?.type_of_duty }}</td>
            <td>{{ note.notes }}</td>
            <td>{{ note?.staff?.fullname }}</td>
            <td>{{ note.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
            <td>
              <a href="#"><i class="flaticon-edit-1 text-primary"></i></a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
export default {
  name: 'NursingNotesTable',
  props: {
    nursingNotes: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
