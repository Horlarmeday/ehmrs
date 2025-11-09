<template>
  <div>
    <b-alert v-if="serverError" show variant="danger" class="mb-3">
      {{ serverError }}
    </b-alert>
    <b-overlay :show="isLoading" rounded="sm">
      <dialysis-vitals-table :vitals="vitals" />
    </b-overlay>
    <pagination
      :total-pages="totalPages"
      :total="totalItems"
      :per-page="pageLimit"
      :current-page="currentPage"
      @pagechanged="onPageChange"
      @changepagecount="handlePageCount"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import Pagination from '@/utils/Pagination.vue';
import DialysisVitalsTable from '@/view/components/table/DialysisVitalsTable.vue';

export default {
  name: 'PatientDialysisVitalsTable',
  components: {
    Pagination,
    DialysisVitalsTable,
  },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    ...mapGetters('dialysis', ['getPatientDialysisVitals']),
    ...mapState('dialysis', ['loading', 'error']),
    vitalsData() {
      return (
        this.getPatientDialysisVitals || {
          docs: [],
          total: 0,
          pages: 0,
          currentPage: this.currentPage,
          pageLimit: this.itemsPerPage,
        }
      );
    },
    vitals() {
      return this.vitalsData.docs || [];
    },
    totalItems() {
      return this.vitalsData.total || 0;
    },
    totalPages() {
      return this.vitalsData.pages || 0;
    },
    pageLimit() {
      return this.vitalsData.pageLimit || this.itemsPerPage;
    },
    isLoading() {
      return this.loading;
    },
    serverError() {
      return this.error;
    },
  },
  methods: {
    ...mapActions('dialysis', ['fetchPatientDialysisVitals']),
    async fetchData({ currentPage, pageLimit }) {
      const data = await this.fetchPatientDialysisVitals({
        patientId: this.$route.params.id,
        currentPage,
        pageLimit,
      });
      this.currentPage = data?.currentPage || currentPage;
      this.itemsPerPage = data?.pageLimit || pageLimit;
    },
    onPageChange(page) {
      this.fetchData({ currentPage: page, pageLimit: this.itemsPerPage });
    },
    handlePageCount(count) {
      this.fetchData({ currentPage: this.currentPage, pageLimit: count });
    },
  },
  created() {
    this.fetchData({ currentPage: this.currentPage, pageLimit: this.itemsPerPage });
  },
};
</script>
