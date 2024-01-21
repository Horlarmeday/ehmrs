<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Test</th>
            <th scope="col">Imaging</th>
            <th scope="col">Billing Status</th>
            <th scope="col">Result Status</th>
            <th scope="col">Requested By</th>
            <th scope="col">Date Requested</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!investigations?.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="(test, i) in investigations" :key="i">
            <td>{{ test.investigation.name }}</td>
            <td>{{ test.imaging.name }}</td>
            <td>{{ test.billing_status }}</td>
            <td>
              <span :class="getResultColor(test.status)">{{ test.status }}</span>
            </td>
            <td>{{ test.examiner.fullname }}</td>
            <td>{{ test.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
            <td>
              <span v-if="allowedRoles.includes(currentUser.role)">
                <a href="#" :class="test.status !== 'Approved' ? 'disabled' : ''">
                  <i class="flaticon-file-2 text-success mr-2"></i>
                </a>
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
import { parseJwt } from '@/core/plugins/parseJwt';

export default {
  data: () => ({
    currentUser: parseJwt(localStorage.getItem('user_token')),
    allowedRoles: ['General Practitioner', 'Super Admin'],
  }),
  props: {
    investigations: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    getResultColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Approved') return 'label label-inline label-light-success font-weight-bold';
      return 'label label-inline label-light-info font-weight-bold';
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
