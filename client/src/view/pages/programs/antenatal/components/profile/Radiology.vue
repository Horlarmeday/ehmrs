<template>
  <div>
    <radiology-table :investigations="investigations" />
    <pagination
      v-if="investigations?.length"
      :total-pages="pages"
      :total="queriedItems"
      :per-page="perPage"
      :current-page="currentPage"
      @pagechanged="onPageChange"
    />
  </div>
</template>
<script>
import RadiologyTable from '@/view/components/table/RadiologyTable.vue';
import Pagination from '@/utils/Pagination.vue';

export default {
  components: { Pagination, RadiologyTable },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 15,
  }),
  computed: {
    investigations() {
      return this.$store.state.order.radiology_orders;
    },
    queriedItems() {
      return this.$store.state.order.totalInvestigations;
    },
    pages() {
      return this.$store.state.order.investigationPages;
    },
    perPage() {
      return this.investigations.length;
    },
  },
  methods: {
    handlePageChange() {
      this.$store.dispatch('order/fetchRadiologyOrders', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { ante_natal_id: this.$route.params.id },
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    fetchInvestigations() {
      this.$store.dispatch('order/fetchRadiologyOrders', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { ante_natal_id: this.$route.params.id },
      });
    },
  },
};
</script>

<style scoped></style>
