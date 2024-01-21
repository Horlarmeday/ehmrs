<template>
  <div>
    <clinical-notes-table :notes="clinicalNotes" />
    <pagination
      :total-pages="pages"
      :total="queriedItems"
      :per-page="perPage"
      :current-page="currentPage"
      @pagechanged="onPageChange"
    />
  </div>
</template>
<script>
import ClinicalNotesTable from '@/view/components/table/ClinicalNotesTable.vue';
import Pagination from '@/utils/Pagination.vue';

export default {
  components: { Pagination, ClinicalNotesTable },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 15,
  }),
  computed: {
    clinicalNotes() {
      return this.$store.state.antenatal.clinicalNotes;
    },
    queriedItems() {
      return this.$store.state.antenatal.totalClinicalNotes || 0;
    },
    pages() {
      return this.$store.state.antenatal.totalClinicalNotesPages;
    },
    perPage() {
      return this.clinicalNotes.length;
    },
  },
  created() {
    this.fetchClinicalNotes();
  },
  methods: {
    handlePageChange() {
      this.$store.dispatch('antenatal/fetchClinicalNotes', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { ante_natal_id: this.$route.params.id },
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    fetchClinicalNotes() {
      this.$store.dispatch('antenatal/fetchClinicalNotes', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { ante_natal_id: this.$route.params.id },
      });
    },
  },
};
</script>

<style scoped></style>
