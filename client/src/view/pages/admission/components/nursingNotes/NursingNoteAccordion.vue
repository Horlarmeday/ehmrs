<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-19'">
            <div class="card-label">Nursing Notes</div>
          </div>
        </div>
        <b-collapse id="accordion-19" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <nursing-notes-table :nursing-notes="nursingNotes" />
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import NursingNotesTable from '@/view/components/table/NursingNoteTable.vue';

export default {
  components: { NursingNotesTable },
  computed: {
    nursingNotes() {
      return this.$store.state.admission.nursingNotes;
    },
  },
  methods: {
    fetchNursingNotes() {
      this.$store.dispatch('admission/fetchNursingNotes', { id: this.$route.params.id });
    },
  },
  created() {
    this.fetchNursingNotes();
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
