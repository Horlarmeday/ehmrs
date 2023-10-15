<template>
  <div class="card-custom card-stretch card-stretch-fourth">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-90'">
            <div class="card-label">Services</div>
          </div>
        </div>
        <b-collapse id="accordion-90" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <services-table :services="services" />
            <pagination
              v-if="services?.length"
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
import ServicesTable from '@/view/components/table/ServicesTable.vue';

export default {
  components: { ServicesTable, Pagination },
  name: 'ServicesAccordion',
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
  }),
  computed: {
    services() {
      return this.$store.state.order.service_orders;
    },
    queriedItems() {
      return this.$store.state.order.totalServices;
    },
    pages() {
      return this.$store.state.order.servicePages;
    },
    perPage() {
      return this.services.length;
    },
  },
  methods: {
    handlePageChange() {
      this.$store.dispatch('order/fetchPrescribedServices', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { visit_id: this.$route.params.id },
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    fetchServices() {
      this.$store.dispatch('order/fetchPrescribedServices', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { visit_id: this.$route.params.id },
      });
    },
  },
  created() {
    this.fetchServices();
  },
};
</script>
<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
