<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Type</th>
          <th scope="col">Ward</th>
          <th scope="col">Condition of Patient</th>
          <th v-if="typesToDisplay.includes(discharge?.discharge_type)" scope="col">
            {{ discharge.discharge_type }} Location
          </th>
          <th scope="col">Discharged By</th>
          <th scope="col">Date Discharged</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!discharge">
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
        <tr>
          <td>{{ discharge.discharge_type }}</td>
          <td>{{ discharge?.ward?.name }}</td>
          <td>{{ discharge.conditions_of_patient }}</td>
          <td v-if="typesToDisplay.includes(discharge?.discharge_type)">
            {{ discharge.transfer_location }}
          </td>
          <td>{{ discharge?.staff?.fullname }}</td>
          <td>{{ discharge.date_discharged | dayjs('DD/MM/YYYY, h:mma') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  name: 'DischargeTable',
  data: () => ({
    typesToDisplay: ['Refer', 'Transfer'],
  }),
  props: {
    discharge: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
};
</script>

<style scoped></style>
