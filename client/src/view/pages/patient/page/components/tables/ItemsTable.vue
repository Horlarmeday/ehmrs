<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Item</th>
            <th scope="col">Quantity</th>
            <th scope="col">Price(₦)</th>
            <th scope="col">Date Prescribed.</th>
            <th scope="col">Examiner</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="item in items" :key="item.id">
            <th>
              <span
                :title="`${item.drug_type}`"
                v-b-tooltip.hover
                :class="getLabelDotStatus(item.drug_type)"
                class="label label-dot label-lg mr-2"
              ></span>
              <a href="#">{{ item?.drug?.name || '-' }}</a>
            </th>
            <td>
              <span> {{ item.quantity_prescribed }} {{ item?.unit?.name }} </span>
            </td>
            <td>
              <span>{{ item.total_price }} </span>
            </td>
            <td>
              <span>{{ item.date_prescribed | dayjs('ddd, MMM Do YYYY, h:mma') }}</span>
            </td>
            <td>
              <span>{{ item?.requester?.fullname }}</span>
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
import { getLabelDotStatus } from '@/common/common';
import Pagination from '@/utils/Pagination.vue';

export default {
  components: { Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
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
    getLabelDotStatus,

    handlePageCount(count) {
      this.itemsPerPage = count;
      this.fetchAdditionalItems({
        itemsPerPage: count,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    fetchAdditionalItems({ itemsPerPage = 10 }) {
      this.$store.dispatch('order/fetchPrescribedAdditionalItems', {
        currentPage: this.currentPage,
        itemsPerPage,
        filter: { patient_id: this.$route.params.id },
      });
    },
  },
  created() {
    this.fetchAdditionalItems({});
  },
};
</script>

<style scoped></style>
