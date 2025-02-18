<template>
  <div class="card card-custom gutter-b">
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">History</span>
      </h3>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body py-0">
      <!--begin::Table-->
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
          <thead>
            <tr class="text-left">
              <th style="width: 170px">Quantity</th>
              <th style="min-width: 170px">Qty Remaining</th>
              <th style="min-width: 170px">Current Qty</th>
              <th style="min-width: 120px">Inventory</th>
              <th style="min-width: 100px">Price(₦)</th>
              <th style="min-width: 100px">Status</th>
              <th style="min-width: 150px">Receiver</th>
              <th style="min-width: 150px">Action By</th>
              <th style="min-width: 150px">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="histories.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="history in histories" :key="history.id">
              <td>
                <a
                  href="#"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ getQuantityToDisplay(history) }} {{ history?.unit?.name }}</a
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ history.quantity_remaining }} {{ history?.unit?.name }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ getCurrentQuantity(history) }} {{ history?.unit?.name }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ history?.inventory?.name || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ history.selling_price || '0.00' }}
                </span>
              </td>
              <td>
                <span :class="getHistoryStatus(history)" class="label label-dot mr-1"> </span>
                <span :class="getHistoryTextColor(history)" class="font-size-sm font-weight-bold">{{
                  history.history_type
                }}</span>
              </td>
              <td>
                <span
                  v-if="history.receiver"
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ history?.receiver?.firstname }} {{ history?.receiver?.lastname }}
                </span>
                <span v-else class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  -
                </span>
              </td>
              <td>
                <span
                  v-if="history.history_type === 'Supplied'"
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ history?.vendor?.name || history?.dispenser?.fullname }}
                </span>
                <span
                  v-if="history.history_type === 'Dispensed'"
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ history?.dispenser?.fullname }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ history.history_date | dayjs('MMM Do YYYY, h:mma') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--end::Table-->
      <pagination
        :total-pages="pages"
        :total="queriedItems"
        :per-page="perPage"
        :current-page="currentPage"
        @pagechanged="onPageChange"
        @changepagecount="onChangePageCount"
      />
    </div>
    <!--end::Body-->
  </div>
</template>

<script>
import Pagination from '@/utils/Pagination.vue';
import { setUrlQueryParams } from '@/common/common';
export default {
  data: () => ({
    itemsPerPage: 20,
    currentPage: 1,
  }),

  props: {
    history_type: {
      type: String,
      required: false,
    },
  },

  components: {
    Pagination,
  },

  computed: {
    histories() {
      return this.$store.state.store.itemHistories;
    },
    queriedItems() {
      return this.$store.state.store.totalItemHistory;
    },
    pages() {
      return this.$store.state.store.itemHistoryPages;
    },
    perPage() {
      return this.histories.length;
    },
  },

  methods: {
    queryParams({ itemsPerPage = null }) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: itemsPerPage || this.itemsPerPage,
      });
    },

    handlePageChange() {
      this.queryParams({
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      });
      this.$store.dispatch('store/fetchPharmacyItemHistory', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        id: this.$route.params.item,
      });
    },

    onChangePageCount(pagecount) {
      this.queryParams({
        currentPage: this.currentPage,
        itemsPerPage: pagecount,
      });
      this.$store.dispatch('store/fetchPharmacyItemHistory', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: pagecount,
        id: this.$route.params.item,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    getQuantityToDisplay(history) {
      if (history.history_type === 'Dispensed') return history.quantity_dispensed;
      if (history.history_type === 'Returned') return history.quantity_returned;
      if (history.history_type === 'Supplied') return history.quantity_supplied;
      return history.quantity_dispensed;
    },

    getHistoryStatus(history) {
      if (history.history_type === 'Dispensed') return 'label-success';
      if (history.history_type === 'Returned') return 'label-primary';
      if (history.history_type === 'Supplied') return 'label-warning';
      return 'label-success';
    },

    getHistoryTextColor(history) {
      if (history.history_type === 'Dispensed') return 'text-success';
      if (history.history_type === 'Returned') return 'text-primary';
      if (history.history_type === 'Supplied') return 'text-warning';
      return 'text-danger';
    },

    getCurrentQuantity(history) {
      if (history.history_type === 'Supplied') {
        return history.quantity_remaining + history.quantity_supplied;
      }

      if (history.history_type === 'Dispensed') {
        return Math.max(history.quantity_remaining - history.quantity_dispensed, 0);
      }

      if (history.history_type === 'Returned') {
        return history.quantity_remaining + history.quantity_returned;
      }

      return history.quantity_remaining;
    },
  },
  created() {
    this.$store.dispatch('store/fetchPharmacyItemHistory', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      id: this.$route.params.item,
    });
  },
};
</script>

<style scoped></style>
