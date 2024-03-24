<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Content</th>
          <th scope="col">Added By</th>
          <th scope="col">Date Added</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!alerts?.length">
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(alert, i) in alerts" :key="i">
          <td>{{ alert.alert }}</td>
          <td>{{ alert.staff.fullname }}</td>
          <td>{{ alert.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td v-if="allowedRoles.includes(currentUser.role)">
            <span>
              <a style="display: inline" @click="editData(alert)" href="#" class="mr-3"
                ><i class="icon-lg text-primary flaticon-edit-1"></i
              ></a>
              <span style="display: inline-block" class="switch switch-sm">
                <label>
                  <input type="checkbox" :checked="isActive(alert)" @change="showAlert(alert)" />
                  <span></span>
                </label>
              </span>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { parseJwt } from '@/core/plugins/parseJwt';
import Swal from 'sweetalert2';

export default {
  name: 'AlertsTable',
  data: () => ({
    currentUser: parseJwt(localStorage.getItem('user_token')),
    allowedRoles: ['Nurse'],
    ACTIVE: 'Active',
  }),
  props: {
    alerts: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    editData(alert) {
      this.$emit('getAlert', alert);
    },

    isActive(alert) {
      return alert.status === this.ACTIVE;
    },

    disableAlert(alert) {
      this.$store
        .dispatch('alert/updateAlert', { id: alert.id, status: 'Inactive' })
        .then(() => this.initValues());
    },

    initValues() {
      this.$store.dispatch('alert/fetchAlerts', { id: this.$route.params.id });
    },

    showAlert(alert) {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to disable this alert',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Disable!',
      }).then(function(result) {
        if (result.value) {
          self.disableAlert(alert);
        }
      });
    },
  },
};
</script>

<style scoped></style>
