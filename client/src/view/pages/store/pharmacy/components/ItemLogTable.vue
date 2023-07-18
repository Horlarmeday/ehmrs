<template>
  <div class="card card-custom gutter-b">
    <div class="card-header flex-wrap border-0 pt-6 pb-0">
      <div class="card-title">
        <h3 class="card-label">
          Item Logs
        </h3>
      </div>
    </div>
    <div class="card-body">
      <!--begin: Datatable-->
      <div
        class="datatable datatable-bordered datatable-head-custom datatable-default datatable-primary datatable-loaded"
        id="kt_datatable"
        style=""
      >
        <table class="datatable-table" style="display: block;">
          <thead class="datatable-head">
            <tr class="datatable-row" style="left: 0px;">
              <th class="datatable-cell datatable-cell-sort">
                <span style="width: 108px;">Product Code</span>
              </th>
              <th class="datatable-cell datatable-cell-sort">
                <span style="width: 108px;">Batch</span>
              </th>
              <th class="datatable-cell datatable-cell-sort">
                <span style="width: 108px;">Unit Price (₦)</span>
              </th>
              <th class="datatable-cell datatable-cell-sort">
                <span style="width: 108px;">Selling Price (₦)</span>
              </th>
              <th class="datatable-cell datatable-cell-sort">
                <span style="width: 108px;">Quantity Remaining</span>
              </th>
              <th class="datatable-cell datatable-cell-sort">
                <span style="width: 108px;">Log Type </span>
              </th>
              <th class="datatable-cell datatable-cell-sort">
                <span style="width: 108px;">Voucher</span>
              </th>
              <th class="datatable-cell datatable-cell-sort">
                <span style="width: 108px;">Initiated By</span>
              </th>
            </tr>
          </thead>
          <tbody class="datatable-body" style="">
            <tr v-if="logs.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr
              v-for="log in logs"
              :key="log.id"
              data-row="0"
              class="datatable-row"
              style="left: 0px;"
            >
              <td class="datatable-cell">
                <span style="width: 108px;">{{ log.product_code }}</span>
              </td>
              <td class="datatable-cell">
                <span style="width: 108px;">{{ log.batch }}</span>
              </td>
              <td class="datatable-cell">
                <span style="width: 108px;">{{ log.unit_price }}</span>
              </td>
              <td class="datatable-cell">
                <span style="width: 108px;">{{ log.selling_price }}</span>
              </td>
              <td class="datatable-cell">
                <span style="width: 108px;">{{ log.quantity_remaining }} {{ log?.unit?.name }}</span>
              </td>
              <td class="datatable-cell">
                <span style="width: 108px;"
                  ><span :class="getLogTypeStatus(log.log_type)" class="label label-dot mr-2"></span
                  ><span :class="getLogTypeTextColor(log.log_type)" class="font-weight-bold">{{ log.log_type }}</span></span
                >
              </td>
              <td class="datatable-cell">
                <span style="width: 108px;">
                  {{ log.voucher }}
                </span>
              </td>
              <td class="datatable-cell">
                <span style="width: 108px;">
                  {{ log.staff.firstname }} {{ log.staff.lastname }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--end: Datatable-->
      <pagination
        :total-pages="pages"
        :total="queriedItems"
        :per-page="perPage"
        :current-page="currentPage"
        @pagechanged="onPageChange"
      />
    </div>
  </div>
</template>
<script>
import Pagination from '@/utils/Pagination.vue';

export default {
  components: { Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
  }),

  computed: {
    logs() {
      return this.$store.state.store.itemLogs;
    },
    queriedItems() {
      return this.$store.state.store.totalItemLog;
    },
    pages() {
      return this.$store.state.store.itemLogPages;
    },
    perPage() {
      return this.logs.length;
    },
  },

  methods: {
    handlePageChange() {
      this.$store.dispatch('store/fetchPharmacyItemLog', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        id: this.$route.params.item,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    getLogTypeStatus(logType) {
      if (logType === 'Reorder') return 'label-danger';
      if (logType === 'Update') return 'label-success';
      return 'label-primary';
    },

    getLogTypeTextColor(logType) {
      if (logType === 'Reorder') return 'text-danger';
      if (logType === 'Update') return 'text-success';
      return 'text-primary';
    },
  },

  created() {
    this.$store.dispatch('store/fetchPharmacyItemLog', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      id: this.$route.params.item,
    });
  },
};
</script>
<style></style>
