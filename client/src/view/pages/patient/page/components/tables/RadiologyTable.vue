<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Test</th>
            <th scope="col">Imaging</th>
            <th scope="col">Price(₦)</th>
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
            <td>{{ test.price }}</td>
            <td>{{ test.billing_status }}</td>
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
  components: { Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
  }),
  computed: {
    investigations() {
      return this.$store.state.order.radiology_orders;
    },
    queriedItems() {
      return this.$store.state.order.totalInvestigations || 0;
    },
    pages() {
      return this.$store.state.order.investigationPages;
    },
    perPage() {
      return this.investigations.length;
    },
  },
  methods: {
    getLabelDotStatus,
    getResultColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Approved') return 'label label-inline label-light-success font-weight-bold';
      return 'label label-inline label-light-info font-weight-bold';
    },

    handlePageCount(count) {
      this.itemsPerPage = count;
      this.fetchInvestigations({
        itemsPerPage: count,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.fetchInvestigations({ itemsPerPage: this.itemsPerPage });
    },

    fetchInvestigations({ itemsPerPage = 10 }) {
      this.$store.dispatch('order/fetchRadiologyOrders', {
        currentPage: this.currentPage,
        itemsPerPage,
        filter: { patient_id: this.$route.params.id },
      });
    },
  },
  created() {
    this.fetchInvestigations({ itemsPerPage: this.itemsPerPage });
  },
};
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
