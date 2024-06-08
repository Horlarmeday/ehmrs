<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Drug</th>
            <th scope="col">Dosage Form</th>
            <th scope="col">Route</th>
            <th scope="col">Dose Given</th>
            <th scope="col">Remarks</th>
            <th scope="col">Date</th>
            <th scope="col">Added By</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="drugs.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="item in drugs" :key="item.id">
            <th>
              <span>{{ item?.drug?.drug?.name || '-' }}</span>
            </th>
            <td>
              <span> {{ item?.drug?.dosage_form?.name }} </span>
            </td>
            <td>
              <span> {{ item?.drug.route?.name }} </span>
            </td>
            <td>
              <span> {{ item.dosage_administered }} </span>
            </td>
            <td>
              <span> {{ item.remarks }} </span>
            </td>
            <td>
              <span>{{ item.createdAt | dayjs('MMM Do YYYY, h:mma') }}</span>
            </td>
            <td>
              <span>{{ item?.staff?.fullname }}</span>
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
    drugs: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>

<style scoped></style>
