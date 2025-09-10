<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Date</th>
          <th scope="col">Type</th>
          <th scope="col">Priority</th>
          <th scope="col">Content</th>
          <th scope="col">Author</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!notes || notes.length === 0">
          <td colspan="5" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(n, i) in notes" :key="i">
          <td>{{ n.created_at | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td>
            <span class="label label-inline label-light-primary font-weight-bold">{{
              n.type
            }}</span>
          </td>
          <td>
            <span :class="getPriorityClass(n.priority)">{{ n.priority || '-' }}</span>
          </td>
          <td class="text-break">{{ n.content || '-' }}</td>
          <td>{{ n?.staff?.fullname }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'DialysisNotesTable',
  props: {
    notes: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    getPriorityClass(priority) {
      const base = 'label label-inline font-weight-bold ';
      switch (priority) {
        case 'CRITICAL':
          return base + 'label-light-danger';
        case 'HIGH':
          return base + 'label-light-warning';
        case 'MEDIUM':
          return base + 'label-light-info';
        case 'LOW':
        default:
          return base + 'label-light-secondary';
      }
    },
  },
};
</script>
