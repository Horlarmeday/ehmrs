<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Drug</th>
            <th scope="col">Dosage Form</th>
            <th scope="col">Route</th>
            <th scope="col">Dosage Administered</th>
            <th scope="col">Remarks</th>
            <th scope="col">Date Prescribed.</th>
            <th scope="col">Added By</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="drugs.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="item in drugs" :key="item.id">
            <th>
              <span>{{ item?.drug?.name || '-' }}</span>
            </th>
            <td>
              <span> {{ item?.dosageForm?.name }} </span>
            </td>
            <td>
              <span> {{ item?.route?.name }} </span>
            </td>
            <td>
              <span> {{ item.dosage_administered }} </span>
            </td>
            <td>
              <span> {{ item.remarks }} </span>
            </td>
            <td>
              <span>{{ item.createdAt | dayjs('ddd, MMM Do YYYY, h:mma') }}</span>
            </td>
            <td>
              <span>{{ item?.staff?.firstname }} {{ item?.staff?.lastname?.charAt(0) }}</span>
            </td>
            <td>
              <span>
                <a href="#"><i class="flaticon-delete text-danger"></i></a>
              </span>
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
