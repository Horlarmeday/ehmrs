<template>
  <div>
    <b-alert v-if="serverError" show variant="danger" class="mb-3">
      {{ serverError }}
    </b-alert>
    <b-overlay :show="isLoading" rounded="sm">
      <dialysis-notes-table :notes="notes" />
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
import DialysisNotesTable from '@/view/components/table/DialysisNotesTable.vue';

export default {
  name: 'PatientDialysisNotesTable',
  components: {
    Pagination,
    DialysisNotesTable,
  },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    ...mapGetters('dialysis', ['getPatientDialysisNotes']),
    ...mapState('dialysis', ['loading', 'error']),
    notesData() {
      return (
        this.getPatientDialysisNotes || {
          docs: [],
          total: 0,
          pages: 0,
          currentPage: this.currentPage,
          pageLimit: this.itemsPerPage,
        }
      );
    },
    notes() {
      return this.notesData.docs || [];
    },
    totalItems() {
      return this.notesData.total || 0;
    },
    totalPages() {
      return this.notesData.pages || 0;
    },
    pageLimit() {
      return this.notesData.pageLimit || this.itemsPerPage;
    },
    isLoading() {
      return this.loading;
    },
    serverError() {
      return this.error;
    },
  },
  methods: {
    ...mapActions('dialysis', ['fetchPatientDialysisNotes']),
    async fetchData({ currentPage, pageLimit }) {
      const data = await this.fetchPatientDialysisNotes({
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
