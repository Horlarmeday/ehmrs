<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-header">
      <div class="card-title">
        <div class="card-label">Treatments</div>
      </div>
    </div>
    <div class="card-body">
      <b-tabs content-class="mt-3">
        <b-tab title="Treatments" active>
          <treatment-accordion :filter="filter" />
          <add-treatment source="Admission" :filter="filter" />
        </b-tab>
        <b-tab title="Additional Treatments">
          <additional-treatments-accordion :filter="filter" />
          <add-additional-treatment :filter="filter" source="Admission" />
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>
<script>
import TreatmentAccordion from '@/view/components/accordion/TreatmentAccordion.vue';
import AddTreatment from '@/view/pages/visits/components/tabs/treatments/AddTreatment.vue';
import AddAdditionalTreatment from '@/view/pages/visits/components/tabs/treatments/AddAdditionalTreatment.vue';
import AdditionalTreatmentsAccordion from '@/view/components/accordion/AdditionalTreatmentsAccordion.vue';

export default {
  components: {
    AdditionalTreatmentsAccordion,
    AddAdditionalTreatment,
    AddTreatment,
    TreatmentAccordion,
  },
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
        this.$store.dispatch('patient/setCurrentPatient', { ...res.insurance, ...res.patient });
      });
  },
};
</script>

<style scoped></style>
