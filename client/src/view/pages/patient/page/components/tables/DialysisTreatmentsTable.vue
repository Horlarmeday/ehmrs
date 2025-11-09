<template>
  <div>
    <b-alert v-if="serverError" show variant="danger" class="mb-3">
      {{ serverError }}
    </b-alert>
    <b-overlay :show="isLoading" rounded="sm">
      <dialysis-treatment-table :treatments="treatments" />
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
import DialysisTreatmentTable from '@/view/components/table/DialysisTreatmentTable.vue';

export default {
  name: 'PatientDialysisTreatmentsTable',
  components: {
    Pagination,
    DialysisTreatmentTable,
  },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    ...mapGetters('dialysis', ['getPatientDialysisTreatments']),
    ...mapState('dialysis', ['loading', 'error']),
    treatmentsData() {
      return (
        this.getPatientDialysisTreatments || {
          docs: [],
          total: 0,
          pages: 0,
          currentPage: this.currentPage,
          pageLimit: this.itemsPerPage,
        }
      );
    },
    treatments() {
      return this.treatmentsData.docs || [];
    },
    totalItems() {
      return this.treatmentsData.total || 0;
    },
    totalPages() {
      return this.treatmentsData.pages || 0;
    },
    pageLimit() {
      return this.treatmentsData.pageLimit || this.itemsPerPage;
    },
    isLoading() {
      return this.loading;
    },
    serverError() {
      return this.error;
    },
  },
  methods: {
    ...mapActions('dialysis', ['fetchPatientDialysisTreatments']),
    async fetchData({ currentPage, pageLimit }) {
      const data = await this.fetchPatientDialysisTreatments({
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
