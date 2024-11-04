<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Test</th>
            <th scope="col">Price (₦)</th>
            <th scope="col">Payment Status</th>
            <th scope="col">Result Status</th>
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
</template>
<script>
import { getLabelDotStatus } from '@/common/common';
import Pagination from '@/utils/Pagination.vue';

export default {
  name: 'TestsTable',
  components: { Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
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
        filter: { patient_id: this.$route.params.id },
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
