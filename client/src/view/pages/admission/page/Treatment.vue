<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-header">
      <div class="card-title">
        <div class="card-label">Treatments</div>
      </div>
    </div>
    <div class="card-body">
      <treatment-accordion :filter="filter" />
      <add-treatment source="Admission" :filter="filter" />
    </div>
  </div>
</template>
<script>
import TreatmentAccordion from '@/view/components/accordion/TreatmentAccordion.vue';
import AddTreatment from '@/view/pages/visits/components/tabs/treatments/AddTreatment.vue';

export default {
  components: { AddTreatment, TreatmentAccordion },
  computed: {
    filter() {
      return { admission_id: this.$route.params.id };
    },
  },
  created() {
    this.$store
      .dispatch('admission/fetchAdmission', { admissionId: this.$route.params.id })
      .then(response => {
        const res = response.data.data;
        this.$store.dispatch('patient/setCurrentPatient', { ...res.patient, ...res.insurance });
      });
  },
};
</script>

<style scoped></style>
