<template>
  <div>
    <b-alert v-if="serverError" show variant="danger" class="mb-3">
      {{ serverError }}
    </b-alert>
    <b-overlay :show="isLoading" rounded="sm">
      <dialysis-assessment-table :assessments="assessments" />
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
import DialysisAssessmentTable from '@/view/components/table/DialysisAssessmentTable.vue';

export default {
  name: 'PatientDialysisAssessmentsTable',
  components: {
    Pagination,
    DialysisAssessmentTable,
  },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    ...mapGetters('dialysis', ['getPatientDialysisAssessments']),
    ...mapState('dialysis', ['loading', 'error']),
    assessmentsData() {
      return (
        this.getPatientDialysisAssessments || {
          docs: [],
          total: 0,
          pages: 0,
          currentPage: this.currentPage,
          pageLimit: this.itemsPerPage,
        }
      );
    },
    assessments() {
      return this.assessmentsData.docs || [];
    },
    totalItems() {
      return this.assessmentsData.total || 0;
    },
    totalPages() {
      return this.assessmentsData.pages || 0;
    },
    pageLimit() {
      return this.assessmentsData.pageLimit || this.itemsPerPage;
    },
    isLoading() {
      return this.loading;
    },
    serverError() {
      return this.error;
    },
  },
  methods: {
    ...mapActions('dialysis', ['fetchPatientDialysisAssessments']),
    async fetchData({ currentPage, pageLimit }) {
      const data = await this.fetchPatientDialysisAssessments({
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
