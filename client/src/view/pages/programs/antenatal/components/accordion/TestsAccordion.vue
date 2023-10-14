<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-9'">
            <div class="card-label">Tests</div>
          </div>
        </div>
        <b-collapse id="accordion-9" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <tests-table :tests="tests" />
            <pagination
              v-if="tests?.length"
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
import TestsTable from '@/view/pages/programs/antenatal/components/TestsTable.vue';
import Pagination from '@/utils/Pagination.vue';

export default {
  components: { Pagination, TestsTable },
  name: 'TestsAccordion',
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
  }),
  computed: {
    tests() {
      return this.$store.state.order.lab_orders;
    },
    queriedItems() {
      return this.$store.state.order.total;
    },
    pages() {
      return this.$store.state.order.pages;
    },
    perPage() {
      return this.tests.length;
    },
  },
  methods: {
    handlePageChange() {
      this.$store.dispatch('order/fetchPrescribedTests', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { visit_id: this.$route.params.id },
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    fetchTests() {
      this.$store.dispatch('order/fetchPrescribedTests', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { visit_id: this.$route.params.id },
      });
    },
  },
  created() {
    this.fetchTests();
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
