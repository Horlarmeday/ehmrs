<template>
  <div class="card-custom card-stretch card-stretch-fourth">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-99'">
            <div class="card-label">Items</div>
          </div>
        </div>
        <b-collapse id="accordion-99" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <!--begin::Table-->
            <additional-items-table :items="items" />
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
import AdditionalItemsTable from '@/view/components/table/AdditionalItemsTable.vue';

export default {
  components: { AdditionalItemsTable, Pagination },
  props: {
    filter: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
  }),
  computed: {
    items() {
      return this.$store.state.order.additional_items_orders;
    },
    queriedItems() {
      return this.$store.state.order.totalAdditionalItemsOrders || 0;
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
      this.fetchAdditionalItems();
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    fetchAdditionalItems() {
      setTimeout(() => {
        this.$store.dispatch('order/fetchPrescribedAdditionalItems', {
          currentPage: this.currentPage,
          itemsPerPage: this.itemsPerPage,
          filter: this.filter,
        });
      }, 500);
    },
  },
  created() {
    this.fetchAdditionalItems();
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
