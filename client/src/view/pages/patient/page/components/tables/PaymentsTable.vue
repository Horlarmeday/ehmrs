<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Patient Name</th>
            <th scope="col">Amount Paid</th>
            <th scope="col">Payment For</th>
            <th scope="col">Batch Number</th>
            <th scope="col">Payment Type</th>
            <th scope="col">Transaction Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!payments?.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="(payment, i) in payments" :key="i">
            <td>{{ payment.name }}</td>
            <td>{{ payment.amount }}</td>
            <td>{{ payment.narration || '-' }}</td>
            <td>{{ payment.batch_no || '-' }}</td>
            <td>{{ payment.payment_type || '-' }}</td>
            <td>{{ payment.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
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
  name: 'PaymentsTable',
  components: { Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
  }),
  computed: {
    payments() {
      return this.$store.state.account.payments;
    },
    queriedItems() {
      return this.$store.state.account.total || 0;
    },
    pages() {
      return this.$store.state.account.pages;
    },
    perPage() {
      return this.payments.length;
    },
  },
  methods: {
    onPageChange(page) {
      this.currentPage = page;
      this.fetchPayments({ currentPage: this.currentPage, itemsPerPage: this.itemsPerPage });
    },

    handlePageCount(count) {
      this.itemsPerPage = count;
      this.fetchPayments({
        currentPage: this.currentPage,
        itemsPerPage: count,
      });
    },

    fetchPayments({ currentPage, itemsPerPage }) {
      return this.$store.dispatch('account/fetchPatientPayments', {
        currentPage,
        itemsPerPage,
        id: this.$route.params.id,
      });
    },
  },
  created() {
    this.fetchPayments({
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    });
  },
};
</script>

<style scoped></style>
