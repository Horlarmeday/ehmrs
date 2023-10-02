<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-91'">
            <div class="card-label">Previous Observations</div>
          </div>
        </div>
        <b-collapse id="accordion-91" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <observations-table :observations="observations" />
            <pagination
              v-if="observations?.length"
              :total-pages="pages"
              :total="queriedItems"
              :per-page="perPage"
              :current-page="currentPage"
              @pagechanged="onPageChange"
            />
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import Pagination from '@/utils/Pagination.vue';
import ObservationsTable from '@/view/pages/programs/antenatal/components/ObservationsTable.vue';

export default {
  name: 'ObservationsAccordion',
  components: { ObservationsTable, Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
  }),
  computed: {
    observations() {
      return this.$store.state.antenatal.observations;
    },
    queriedItems() {
      return this.$store.state.antenatal.totalObservations;
    },
    pages() {
      return this.$store.state.antenatal.totalObservationPages;
    },
    perPage() {
      return this.observations.length;
    },
  },
  methods: {
    handlePageChange() {
      this.$store.dispatch('antenatal/fetchObservations', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        id: this.$route.query.antenatal,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    fetchObservations() {
      this.$store.dispatch('antenatal/fetchObservations', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        id: this.$route.query.antenatal,
      });
    },
  },
  created() {
    this.fetchObservations();
  },
};
</script>

<style scoped></style>
