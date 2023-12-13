<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-header py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Nursing Note</span>
        </h3>
      </div>
      <div class="card-body">
        <nursing-note-accordion />
        <create-nursing-note />
      </div>
    </div>
  </div>
</template>
<script>
import NursingNoteAccordion from '@/view/pages/admission/components/nursingNotes/NursingNoteAccordion.vue';
import CreateNursingNote from '@/view/pages/admission/components/nursingNotes/CreateNursingNote.vue';

export default {
  components: { CreateNursingNote, NursingNoteAccordion },
};
</script>

<style scoped></style>
