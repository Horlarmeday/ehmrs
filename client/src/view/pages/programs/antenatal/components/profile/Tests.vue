<template>
  <div>
    <tests-table :tests="tests" />
    <pagination
      :total-pages="pages"
      :total="queriedItems"
      :per-page="perPage"
      :current-page="currentPage"
      @pagechanged="onPageChange"
    />
  </div>
</template>
<script>
import TestsTable from '@/view/components/table/TestsTable.vue';
import Pagination from '@/utils/Pagination.vue';

export default {
  components: { Pagination, TestsTable },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 15,
  }),
  created() {
    this.fetchTests();
  },
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
        filter: { ante_natal_id: this.$route.params.id },
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
        filter: { ante_natal_id: this.$route.params.id },
      });
    },
  },
};
</script>

<style scoped></style>
