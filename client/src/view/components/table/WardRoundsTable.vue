<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Notes</th>
            <th scope="col">Requested By</th>
            <th scope="col">Date Requested</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!wardRounds?.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="(round, i) in wardRounds" :key="i">
            <td>{{ round.content }}</td>
            <td>{{ round.staff.fullname }}</td>
            <td>{{ round.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
            <td>
              <span v-if="allowedRoles.includes(currentUser.role)">
                <a href="#">
                  <i class="flaticon-edit-1 text-success mr-2"></i>
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
    wardRounds: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>

<style scoped></style>
