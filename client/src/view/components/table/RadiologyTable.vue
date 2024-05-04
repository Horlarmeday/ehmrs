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
            <td>
              <span
                :title="`${test.investigation_type}`"
                v-b-tooltip.hover
                :class="getLabelDotStatus(test.investigation_type)"
                class="label label-dot label-lg mr-2"
              ></span>
              <span>
                {{ test.investigation.name }}
              </span>
            </td>
            <td>{{ test.imaging.name }}</td>
            <td>{{ test.billing_status }}</td>
            <td>
              <span :class="getResultColor(test.status)">{{ test.status }}</span>
            </td>
            <td>{{ test.examiner.fullname }}</td>
            <td>{{ test.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
            <td>
              <span v-if="allowedRoles.includes(currentUser.role)">
                <router-link
                  :to="`/radiology/investigations-results/${test.result_id}`"
                  :class="test.status"
                  v-if="test.result_status === APPROVED"
                >
                  <i class="flaticon-file-2 text-success mr-2"></i>
                </router-link>
                <a
                  href="#"
                  :class="loading && 'disabled'"
                  @click="showDeleteAlert(test)"
                  v-if="test.billing_status === UNBILLED && test.payment_status === PENDING"
                >
                  <i class="flaticon-delete text-danger"></i>
                </a>
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
import { getLabelDotStatus } from '@/common/common';

export default {
  data: () => ({
    currentUser: parseJwt(localStorage.getItem('user_token')),
    allowedRoles: ['General Practitioner', 'Super Admin'],
    loading: false,
    UNBILLED: 'Unbilled',
    PENDING: 'Pending',
    APPROVED: 'Approved',
  }),
  props: {
    investigations: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    getLabelDotStatus,
    getResultColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Approved') return 'label label-inline label-light-success font-weight-bold';
      return 'label label-inline label-light-info font-weight-bold';
    },

    showDeleteAlert(item) {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete this investigation',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete!',
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-default',
        },
      }).then(function(result) {
        if (result.value) {
          self.deletePrescribedInvestigation(item);
        }
      });
    },

    deletePrescribedInvestigation(investigation) {
      this.loading = true;
      this.$store
        .dispatch('order/deletePrescribedInvestigation', { investigationId: investigation.id })
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
