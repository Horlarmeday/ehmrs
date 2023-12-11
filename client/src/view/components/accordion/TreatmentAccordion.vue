<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-76'">
            <div class="card-label">Treatments</div>
          </div>
        </div>
        <b-collapse id="accordion-76" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <!--begin::Table-->
            <treatment-table :drugs="drugs" />
            <!--end::Table-->
            <pagination
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
import TreatmentTable from '@/view/components/table/TreatmentTable.vue';

export default {
  components: { TreatmentTable, Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
  }),
  props: {
    filter: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
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
    handlePageChange() {
      this.$store.dispatch('order/fetchTreatments', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: this.filter,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    fetchTreatments() {
      this.$store.dispatch('order/fetchTreatments', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: this.filter,
      });
    },
  },
  created() {
    this.fetchTreatments();
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
