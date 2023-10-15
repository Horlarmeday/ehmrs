<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-94'">
            <div class="card-label">Clinical Notes</div>
          </div>
        </div>
        <b-collapse id="accordion-94" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <!--begin::Table-->
            <clinical-notes-table @getClinicalNote="editData" :notes="clinicalNotes" />
            <!--end::Table-->
            <pagination
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
import ClinicalNotesTable from '@/view/components/table/ClinicalNotesTable.vue';

export default {
  components: { ClinicalNotesTable, Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
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
  methods: {
    handlePageChange() {
      this.$store.dispatch('antenatal/fetchClinicalNotes', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { visit_id: this.$route.params.id },
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
        filter: { visit_id: this.$route.params.id },
      });
    },

    editData(note) {
      this.$emit('clinicalNote', note);
    },
  },
  created() {
    this.fetchClinicalNotes();
  },
};
</script>

<style scoped></style>
