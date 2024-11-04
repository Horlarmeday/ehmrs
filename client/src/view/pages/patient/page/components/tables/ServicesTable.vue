<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Service</th>
            <th scope="col">Billing Status</th>
            <th scope="col">Type</th>
            <th scope="col">Price(₦)</th>
            <th scope="col">Payment Status</th>
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
            <td>
              {{ service.price }}
            </td>
            <td>
              <span :class="getPaymentColor(service.payment_status)">{{
                service.payment_status
              }}</span>
            </td>
            <td>{{ service?.examiner?.fullname }}</td>
            <td>{{ service.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
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
import Pagination from '@/utils/Pagination.vue';

export default {
  name: 'ServicesTable',
  components: { Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
  }),
  computed: {
    services() {
      return this.$store.state.order.service_orders;
    },
    queriedItems() {
      return this.$store.state.order.totalServices || 0;
    },
    pages() {
      return this.$store.state.order.servicePages;
    },
    perPage() {
      return this.services.length;
    },
  },
  methods: {
    fetchPrescribedServices({ itemsPerPage = 10 }) {
      this.$store.dispatch('order/fetchPrescribedServices', {
        currentPage: this.currentPage,
        itemsPerPage,
        filter: { patient_id: this.$route.params.id },
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.fetchPrescribedServices({ itemsPerPage: this.itemsPerPage });
    },

    handlePageCount(count) {
      this.itemsPerPage = count;
      this.fetchPrescribedServices({
        itemsPerPage: count,
      });
    },

    getServiceTypeColor(type) {
      if (type === 'NHIS') return 'label label-inline label-light-warning font-weight-bold';
      if (type === 'Cash') return 'label label-inline label-light-success font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },

    getPaymentColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Paid') return 'label label-inline label-light-success font-weight-bold';
      if (status === 'Cleared') return 'label label-inline label-light-info font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },
  },
  created() {
    this.fetchPrescribedServices({ itemsPerPage: this.itemsPerPage });
  },
};
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
