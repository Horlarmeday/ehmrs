<template>
  <div>
    <additional-items-table :items="items" />
    <pagination
      v-if="items?.length"
      :total-pages="pages"
      :total="queriedItems"
      :per-page="perPage"
      :current-page="currentPage"
      @pagechanged="onPageChange"
    />
  </div>
</template>
<script>
import AdditionalItemsTable from '@/view/components/table/AdditionalItemsTable.vue';
import Pagination from '@/utils/Pagination.vue';

export default {
  components: { Pagination, AdditionalItemsTable },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 15,
  }),
  computed: {
    items() {
      return this.$store.state.order.additional_items_orders;
    },
    queriedItems() {
      return this.$store.state.order.totalAdditionalItemsOrders;
    },
    pages() {
      return this.$store.state.order.additionalItemsOrdersPages;
    },
    perPage() {
      return this.items.length;
    },
  },
  methods: {
    handlePageChange() {
      this.$store.dispatch('order/fetchPrescribedAdditionalItems', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { ante_natal_id: this.$route.params.id },
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    fetchAdditionalItems() {
      this.$store.dispatch('order/fetchPrescribedAdditionalItems', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { ante_natal_id: this.$route.params.id },
      });
    },
  },
  created() {
    this.fetchAdditionalItems();
  },
};
</script>

<style scoped></style>
