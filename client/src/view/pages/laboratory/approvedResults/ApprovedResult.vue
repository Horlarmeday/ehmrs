<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark"
          >{{ $route.query.patient }} Prescribed Tests</span
        >
      </h3>
    </div>
    <div class="card-body">
      <b-button-group v-if="selectedTests?.length" size="sm" class="mt-2 mb-2">
        <b-button variant="outline-secondary">
          <span class="font-weight-boldest">{{ selectedTests?.length }} </span>
          <span>Selected</span>
        </b-button>
        <b-button @click="showChangeResultStatusAlert" variant="outline-secondary"
          >Change Test Status</b-button
        >
      </b-button-group>
      <div class="table-responsive">
        <table class="table table-sm">
          <thead class="thead-light">
            <tr class="text-uppercase">
              <th></th>
              <th scope="col">Test</th>
              <th scope="col">Price (₦)</th>
              <th scope="col">Payment Status</th>
              <th scope="col">Result Status</th>
              <th scope="col">Requested By</th>
              <th scope="col">Date Requested</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!tests?.length">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="(test, i) in tests" :key="i">
              <td class="pl-0">
                <label class="checkbox checkbox-md checkbox-inline">
                  <input
                    :disabled="test.status === PENDING"
                    type="checkbox"
                    :checked="isSelected(test)"
                    @change="toggleItem(test)"
                  />
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
                <span class="font-weight-boldest">
                  {{ test?.price || '-' }}
                </span>
              </td>
              <td>
                <span :class="getPaymentColor(test.payment_status)">{{ test.payment_status }}</span>
              </td>
              <td>
                <span :class="getResultColor(test.status)">{{ test.status }}</span>
              </td>
              <td>{{ test.examiner.fullname }}</td>
              <td>{{ test.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <pagination
        :total-pages="pages"
        :total="queriedItems"
        :per-page="perPage"
        :current-page="currentPage"
        @pagechanged="onPageChange"
        @changepagecount="handlePageCount"
      />
    </div>
  </div>
</template>
<script>
import { getLabelDotStatus } from '@/common/common';
import Pagination from '@/utils/Pagination.vue';
import Swal from 'sweetalert2';

export default {
  name: 'ApprovedResult',
  components: { Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    PENDING: 'Pending',
  }),
  computed: {
    tests() {
      return this.$store.state.order.lab_orders;
    },
    queriedItems() {
      return this.$store.state.order.total || 0;
    },
    pages() {
      return this.$store.state.order.pages;
    },
    perPage() {
      return this.tests.length;
    },
    selectedTests() {
      return this.$store.state.laboratory.selectedTests;
    },
  },
  methods: {
    getLabelDotStatus,
    getResultColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Approved') return 'label label-inline label-light-success font-weight-bold';
      if (status === 'Verified') return 'label label-inline label-light-primary font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },

    getPaymentColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Paid') return 'label label-inline label-light-success font-weight-bold';
      if (status === 'Cleared') return 'label label-inline label-light-info font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },

    handlePageCount(count) {
      this.itemsPerPage = count;
      this.fetchTests({
        itemsPerPage: count,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.fetchTests({ itemsPerPage: this.itemsPerPage });
    },

    fetchTests({ itemsPerPage = 10 }) {
      this.$store.dispatch('order/fetchPrescribedTests', {
        currentPage: this.currentPage,
        itemsPerPage,
        filter: { test_prescription_id: this.$route.params.id },
      });
    },

    endRequest() {
      this.$store.dispatch('laboratory/removeAllSelectedTests');
      this.fetchTests({ itemsPerPage: this.itemsPerPage });
    },

    isSelected(test) {
      return this.selectedTests.includes(test);
    },

    toggleItem(test) {
      if (this.isSelected(test)) {
        // If the item is already selected, remove it from selectedItems
        this.$store.dispatch('laboratory/removeSelectedTest', test);
      } else {
        // If the item is not selected, add it to selectedItems
        this.$store.dispatch('laboratory/addSelectedTest', test);
      }
    },

    updateTestResultsStatus() {
      const selectedTestsIds = this.selectedTests.map(test => test.id);
      this.$store
        .dispatch('laboratory/changeBulkTestResultsStatus', {
          selectedTests: selectedTestsIds,
          id: this.$route.params.id,
        })
        .then(() => {
          this.endRequest();
        });
    },

    showChangeResultStatusAlert() {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text: `You want to change these test results status to ${self.PENDING}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Change!',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-default',
        },
      }).then(function(result) {
        if (result.value) {
          self.updateTestResultsStatus();
        }
      });
    },
  },
  created() {
    this.fetchTests({ itemsPerPage: this.itemsPerPage });
  },
};
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
