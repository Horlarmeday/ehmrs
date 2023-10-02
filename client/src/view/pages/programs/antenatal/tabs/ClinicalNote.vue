<template>
  <div class="card card-custom gutter-b">
    <div class="card-body">
      <clinical-note-accordion @clinicalNote="getEditedClinicalNote" />
      <create-clinical-note :clinical-note="clinicalNote" />
    </div>
  </div>
</template>
<script>
import ClinicalNoteAccordion from '@/view/pages/programs/antenatal/components/accordion/ClinicalNoteAccordion.vue';
import CreateClinicalNote from '@/view/pages/programs/antenatal/components/CreateClinicalNote.vue';

export default {
  components: { CreateClinicalNote, ClinicalNoteAccordion },
  data() {
    return {
      clinicalNote: {},
    };
  },
  methods: {
    getEditedClinicalNote(data) {
      this.clinicalNote = data;
    },
  },
};
</script>

<style scoped></style>