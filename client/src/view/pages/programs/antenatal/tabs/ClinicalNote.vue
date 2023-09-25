<template>
  <div class="card card-custom gutter-b">
    <div class="card-body">
      <clinical-notes-table @getClinicalNote="getEditedClinicalNote" />
      <hr />
      <clinical-note-accordion :clinical-note="clinicalNote" />
    </div>
  </div>
</template>
<script>
import ClinicalNotesTable from '@/view/pages/programs/antenatal/components/ClinicalNotesTable.vue';
import ClinicalNoteAccordion from '@/view/pages/programs/antenatal/components/ClinicalNoteAccordion.vue';

export default {
  components: { ClinicalNoteAccordion, ClinicalNotesTable },
  data() {
    return {
      clinicalNote: {},
    };
  },
  methods: {
    getEditedClinicalNote(data) {
      console.log(data);
      this.clinicalNote = data;
    },
  },
};
</script>

<style scoped></style>
