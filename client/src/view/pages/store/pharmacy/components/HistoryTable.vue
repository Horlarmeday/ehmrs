<template>
  <div class="card card-custom gutter-b">
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark"> {{ table_name }} History</span>
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
              <th class="pr-0" style="width: 150px">Quantity {{ table_type }}</th>
              <th style="min-width: 150px">Quantity Remaining</th>
              <th style="min-width: 150px">Inventory</th>
              <th style="min-width: 150px">Receiver</th>
              <th style="min-width: 150px">{{ table_type }} By</th>
              <th style="min-width: 150px">Date {{ table_type }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="histories.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="history in histories" :key="history.id">
              <td class="pr-0">
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
                  {{ history?.inventory?.name || '-' }}
                </span>
              </td>
              <td>
                <span v-if="history.receiver" class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ history?.receiver?.firstname }} {{ history?.receiver?.lastname }}
                </span>
                <span v-else class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  -
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ history?.dispenser?.firstname }} {{ history?.dispenser?.lastname }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ history.history_date | dayjs('ddd, MMM Do YYYY, h:mma') }}
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
      />
    </div>
    <!--end::Body-->
  </div>
</template>

<script>
import Pagination from '@/utils/Pagination.vue';
export default {
  data: () => ({
    itemsPerPage: 10,
    currentPage: 1,
  }),

  props: {
    table_name: {
      type: String,
      required: true,
    },

    table_type: {
      type: String,
      required: true,
    },

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
    handlePageChange() {
      this.$store.dispatch('store/fetchPharmacyItemHistory', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        id: this.$route.params.item,
        ...(this.history_type && { filter: { history_type: this.history_type } }),
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    getQuantityToDisplay(history) {
      if (this.table_type === 'Dispensed') return history.quantity_dispensed;
      if (this.table_type === 'Returned') return history.quantity_returned;
      if (this.table_type === 'Supplied') return history.quantity_supplied;
      return history.quantity_dispensed;
    },
  },
  created() {
    this.$store.dispatch('store/fetchPharmacyItemHistory', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      id: this.$route.params.item,
      ...(this.history_type && { filter: { history_type: this.history_type } }),
    });
  },
};
</script>

<style scoped></style>
