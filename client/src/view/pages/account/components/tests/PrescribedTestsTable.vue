<template>
  <div>
    <div class="table-responsive">
      <table class="table">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col"></th>
            <th scope="col">Test</th>
            <th scope="col">Result</th>
            <th scope="col">Billing Status</th>
            <th scope="col">Payment Status</th>
            <th scope="col">Requested By</th>
            <th scope="col">Date Requested</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!tests?.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="(test, i) in tests" :key="i">
            <td class="pl-0">
              <label class="checkbox checkbox-md checkbox-inline">
                <input type="checkbox" />
                <span></span>
              </label>
            </td>
            <td>
              <span
                :title="`${test.test_type}`"
                v-b-tooltip.hover
                :class="getLabelDotStatus(test.test_type)"
                class="label label-dot label-lg mr-2"
              ></span>
              {{ test.test.name }}
            </td>
            <td>
              <span class="font-weight-boldest" v-if="test.result_status === ACCEPTED">
                {{ test?.result?.result || '-' }}
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <span :class="getPaymentColor(test.payment_status)">{{ test.payment_status }}</span>
            </td>
            <td>{{ test.examiner.fullname }}</td>
            <td>{{ test.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
            <td>
              <span>
                <a
                  v-if="test.billing_status === UNBILLED && test.payment_status === PENDING"
                  @click="showDeleteAlert(test)"
                  href="#"
                  :class="loading && 'disabled'"
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
import Swal from 'sweetalert2';
import { getLabelDotStatus } from '@/common/common';

export default {
  name: 'TestsTable',
  data: () => ({
    ACCEPTED: 'Accepted',
    UNBILLED: 'Unbilled',
    PENDING: 'Pending',
    loading: false,
  }),
  methods: {
    getLabelDotStatus,
    showDeleteAlert(test) {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete this test',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete!',
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-default',
        },
      }).then(function(result) {
        if (result.value) {
          self.deletePrescribedTest(test);
        }
      });
    },

    getResultColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Accepted') return 'label label-inline label-light-success font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },

    getPaymentColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Paid') return 'label label-inline label-light-success font-weight-bold';
      if (status === 'Cleared') return 'label label-inline label-light-info font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    }
  },
};
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
