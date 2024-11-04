<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Drug</th>
            <th scope="col">Dosage Form</th>
            <th scope="col">Route</th>
            <th scope="col">Dose Given</th>
            <th scope="col">Remarks</th>
            <th scope="col">Date</th>
            <th scope="col">Added By</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="drugs.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="item in drugs" :key="item.id">
            <th>
              <span>{{ item?.drug?.drug?.name || '-' }}</span>
            </th>
            <td>
              <span> {{ item?.drug?.dosage_form?.name }} </span>
            </td>
            <td>
              <span> {{ item?.drug.route?.name }} </span>
            </td>
            <td>
              <span> {{ item.dosage_administered }} </span>
            </td>
            <td>
              <span> {{ item.remarks }} </span>
            </td>
            <td>
              <span>{{ item.createdAt | dayjs('MMM Do YYYY, h:mma') }}</span>
            </td>
            <td>
              <span>{{ item?.staff?.fullname }}</span>
            </td>
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
  components: { Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
  }),
  computed: {
    drugs() {
      return this.$store.state.order.treatments;
    },
    queriedItems() {
      return this.$store.state.order.totalTreatments || 0;
    },
    pages() {
      return this.$store.state.order.treatmentPages;
    },
    perPage() {
      return this.drugs.length;
    },
  },
  methods: {
    handlePageCount(count) {
      this.itemsPerPage = count;
      this.fetchTreatments({
        itemsPerPage: count,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.fetchTreatments({ itemsPerPage: this.itemsPerPage });
    },

    fetchTreatments({ itemsPerPage = 10 }) {
      this.$store.dispatch('order/fetchTreatments', {
        currentPage: this.currentPage,
        itemsPerPage,
        filter: { patient_id: this.$route.params.id },
      });
    },
  },
  created() {
    this.fetchTreatments({ itemsPerPage: this.itemsPerPage });
  },
};
</script>

<style scoped></style>
