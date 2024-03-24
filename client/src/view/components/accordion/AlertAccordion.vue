<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b mt-3">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-39'">
            <div class="card-label">Alerts</div>
          </div>
        </div>
        <b-collapse id="accordion-39" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <alerts-table @getAlert="editData" :alerts="alerts" />
            <pagination
              v-if="alerts?.length"
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
import AlertsTable from '@/view/components/table/AlertsTable.vue';

export default {
  components: { AlertsTable, Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
  }),
  computed: {
    alerts() {
      return this.$store.state.alert.alerts;
    },
    queriedItems() {
      return this.$store.state.alert.total;
    },
    pages() {
      return this.$store.state.alert.pages;
    },
    perPage() {
      return this.alerts.length;
    },
  },
  methods: {
    handlePageChange() {
      this.fetchAlerts();
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    fetchAlerts() {
      this.$store.dispatch('alert/fetchAlerts', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        id: this.$route.params.id,
      });
    },

    editData(alert) {
      this.$emit('alert', alert);
    },
  },
  created() {
    this.fetchAlerts();
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
