<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-76'">
            <div class="card-label">Additional Treatments</div>
          </div>
        </div>
        <b-collapse id="accordion-76" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <!--begin::Table-->
            <additional-treatment-table :treatments="treatments" />
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
import AdditionalTreatmentTable from '@/view/components/table/AdditionalTreatmentTable.vue';

export default {
  components: { AdditionalTreatmentTable, Pagination },
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
    treatments() {
      return this.$store.state.order.additionalTreatments;
    },
    queriedItems() {
      return this.$store.state.order.totalAdditionalTreatments || 0;
    },
    pages() {
      return this.$store.state.order.additionalTreatmentsPages;
    },
    perPage() {
      return this.treatments.length;
    },
  },
  methods: {
    handlePageChange() {
      this.$store.dispatch('order/fetchAdditionalTreatments', {
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
      this.$store.dispatch('order/fetchAdditionalTreatments', {
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
