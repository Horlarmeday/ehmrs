<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Time</th>
          <th scope="col">Blood Flow</th>
          <th scope="col">BP</th>
          <th scope="col">Pulse</th>
          <th scope="col">Temp</th>
          <th scope="col">SpO2</th>
          <th scope="col">Weight</th>
          <th scope="col">UF Rate</th>
          <th scope="col">AP</th>
          <th scope="col">VP</th>
          <th scope="col">IVF</th>
          <th scope="col">HEP/hr</th>
          <th scope="col">Recorded By</th>
          <th scope="col">Recorded At</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!vitals || vitals.length === 0">
          <td colspan="14" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(v, i) in vitals" :key="i">
          <td>{{ v.time }}</td>
          <td>{{ v.blood_flow_rate }}</td>
          <td>{{ v.blood_pressure }}</td>
          <td>{{ v.pulse }}</td>
          <td>{{ v.temperature }}</td>
          <td>{{ v.oxygen_saturation }}</td>
          <td>{{ v.weight }}</td>
          <td>{{ v.ultrafiltration_rate }}</td>
          <td>{{ v.ap }}</td>
          <td>{{ v.venous_pressure }}</td>
          <td>{{ v.ivf }}</td>
          <td>{{ v.hep_hr }}</td>
          <td>{{ v?.staff?.fullname }}</td>
          <td>{{ v.recorded_at | dayjs('DD/MM/YYYY, h:mma') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'DialysisVitalsTable',
  props: {
    vitals: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>
