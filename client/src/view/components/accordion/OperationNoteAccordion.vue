<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-30'">
            <div class="card-label">Operation Notes</div>
          </div>
        </div>
        <b-collapse id="accordion-30" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <operation-note-table :operation-notes="notes" />
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import OperationNoteTable from '@/view/components/table/OperationNotesTable.vue';

export default {
  components: { OperationNoteTable },
  computed: {
    notes() {
      return this.$store.state.surgery.operationNotes;
    },
  },
  methods: {
    fetchOperationNotes() {
      this.$store.dispatch('surgery/fetchOperationNotes', { id: this.$route.params.id });
    },
  },

  created() {
    this.fetchOperationNotes();
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
