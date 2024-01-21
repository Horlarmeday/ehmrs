<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Weight</th>
            <th scope="col">Medications</th>
            <th scope="col">Administered By</th>
            <th scope="col">Date Requested</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isEmpty(medication)">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr>
            <td>{{ medication?.weight }}</td>
            <td>
              <span v-for="(drug, i) in medication?.medications" :key="i">
                <span class="mr-3">{{ drug }},</span>
              </span>
            </td>
            <td>{{ medication?.staff?.fullname }}</td>
            <td>{{ medication?.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import { isEmpty } from '@/common/common';

export default {
  methods: { isEmpty },
  props: {
    medication: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
};
</script>

<style scoped></style>
