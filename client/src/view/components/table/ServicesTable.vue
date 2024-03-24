<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Service</th>
            <th scope="col">Billing Status</th>
            <th scope="col">Type</th>
            <th scope="col">Requested By</th>
            <th scope="col">Date Requested</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!services?.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="(service, i) in services" :key="i">
            <td>{{ service?.service?.name }}</td>
            <td>{{ service.billing_status }}</td>
            <td>
              <span :class="getServiceTypeColor(service.service_type)">{{
                service.service_type
              }}</span>
            </td>
            <td>{{ service?.examiner?.fullname }}</td>
            <td>{{ service.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
            <td>
              <span v-if="allowedRoles.includes(currentUser.role)">
                <a
                  href="#"
                  :class="loading && 'disabled'"
                  @click="showDeleteAlert(service)"
                  v-if="service.billing_status === UNBILLED && service.payment_status === PENDING"
                  ><i class="flaticon-delete text-danger"></i
                ></a>
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
import Swal from 'sweetalert2';

export default {
  name: 'ServicesTable',
  data: () => ({
    currentUser: parseJwt(localStorage.getItem('user_token')),
    allowedRoles: ['General Practitioner', 'Super Admin'],
    loading: false,
    UNBILLED: 'Unbilled',
    PENDING: 'Pending',
  }),
  props: {
    services: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    getServiceTypeColor(type) {
      if (type === 'NHIS') return 'label label-inline label-light-warning font-weight-bold';
      if (type === 'Cash') return 'label label-inline label-light-success font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },

    showDeleteAlert(service) {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete this service',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete!',
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-default',
        },
      }).then(function(result) {
        if (result.value) {
          self.deletePrescribedService(service);
        }
      });
    },

    deletePrescribedService(service) {
      this.loading = true;
      this.$store
        .dispatch('order/deletePrescribedService', { serviceId: service.id })
        .then(() => (this.loading = false))
        .catch(() => (this.loading = false));
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
