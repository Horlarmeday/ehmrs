<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Start</th>
          <th scope="col">End</th>
          <th scope="col">Type</th>
          <th scope="col">Duration (min)</th>
          <th scope="col">Blood Flow</th>
          <th scope="col">Status</th>
          <th scope="col">Notes</th>
          <th scope="col">Recorded By</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!treatments || treatments.length === 0">
          <td colspan="8" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(t, i) in treatments" :key="i">
          <td>{{ t.actual_start_date | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td>
            {{
              t.actual_end_date
                ? $options.filters.dayjs(t.actual_end_date, 'DD/MM/YYYY, h:mma')
                : '-'
            }}
          </td>
          <td>{{ t?.dialysis_visit?.dialysis_type || '-' }}</td>
          <td>{{ t.current_duration }}</td>
          <td>{{ t.blood_flow_rate }}</td>
          <td>
            <span :class="getStatusClass(t.status)">{{ t.status }}</span>
          </td>
          <td>{{ t.treatment_notes || '-' }}</td>
          <td>{{ t?.nurse?.fullname }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'DialysisTreatmentTable',
  props: {
    treatments: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    getStatusClass(status) {
      const base = 'label label-inline font-weight-bold ';
      switch (status) {
        case 'COMPLETED':
          return base + 'label-light-success';
        case 'IN_PROGRESS':
          return base + 'label-light-primary';
        case 'PAUSED':
          return base + 'label-light-warning';
        case 'INTERRUPTED':
          return base + 'label-light-danger';
        case 'NOT_STARTED':
        default:
          return base + 'label-light-secondary';
      }
    },
  },
};
</script>
