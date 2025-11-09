<template>
  <div class="p-2 border-bottom border-left border-right">
    <b-tabs content-class="mt-5">
      <!--      <b-tab title="Vitals" active>-->
      <!--        <triage-table :triages="summary?.triages" />-->
      <!--      </b-tab>-->
      <b-tab title="Diagnoses" active>
        <diagnoses-table :diagnoses="summary?.diagnoses" />
      </b-tab>
      <b-tab title="Observations">
        <observations-table :observations="summary?.observations" />
      </b-tab>
      <!-- <b-tab title="ANC History" v-if="summary?.admission?.patient.gender === FEMALE">
        <antenatal-observations-table :observations="summary?.observations" />
      </b-tab> -->
      <b-tab title="Tests">
        <tests-table :tests="summary?.tests" />
      </b-tab>
      <b-tab title="Medications">
        <medications-table :drugs="summary?.drugs" />
      </b-tab>
      <b-tab title="Items">
        <additional-items-table :items="summary?.items" />
      </b-tab>
      <b-tab title="Radiology">
        <radiology-table :investigations="summary?.investigations" />
      </b-tab>
      <b-tab title="Services">
        <services-table :services="summary?.services" />
      </b-tab>
      <b-tab title="Dialysis Vitals">
        <dialysis-vitals-table :vitals="summary?.dialysisVitals" />
      </b-tab>
      <b-tab title="Dialysis Treatments">
        <dialysis-treatment-table :treatments="summary?.dialysisTreatments" />
      </b-tab>
      <b-tab title="Dialysis Assessment">
        <dialysis-assessment-table :assessments="summary?.dialysisAssessments" />
      </b-tab>
      <b-tab title="Dialysis Notes">
        <dialysis-notes-table :notes="summary?.dialysisNotes" />
      </b-tab>
      <b-tab title="Doctor Reports">
        <doctor-reports-table :reports="summary?.doctorReports" />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import DiagnosesTable from '@/view/components/table/DiagnosesTable.vue';
import TestsTable from '@/view/components/table/TestsTable.vue';
import DialysisVitalsTable from '@/view/components/table/DialysisVitalsTable.vue';
import DialysisTreatmentTable from '@/view/components/table/DialysisTreatmentTable.vue';
import DialysisAssessmentTable from '@/view/components/table/DialysisAssessmentTable.vue';
import DialysisNotesTable from '@/view/components/table/DialysisNotesTable.vue';
import DoctorReportsTable from '@/view/components/table/DoctorReportsTable.vue';
import RadiologyTable from '@/view/components/table/RadiologyTable.vue';
import ServicesTable from '@/view/components/table/ServicesTable.vue';
import MedicationsTable from '@/view/components/table/MedicationsTable.vue';
import ObservationsTable from '@/view/components/table/ObservationsTable.vue';
import AdditionalItemsTable from '@/view/components/table/AdditionalItemsTable.vue';
// import AntenatalObservationsTable from '@/view/components/table/AntenatalObservationsTable.vue';

export default {
  components: {
    // AntenatalObservationsTable,
    AdditionalItemsTable,
    ObservationsTable,
    MedicationsTable,
    ServicesTable,
    RadiologyTable,
    TestsTable,
    DiagnosesTable,
    DialysisVitalsTable,
    DialysisTreatmentTable,
    DialysisAssessmentTable,
    DialysisNotesTable,
    DoctorReportsTable,
  },
  computed: {
    summary() {
      return this.$store.state.admission.summary;
    },
  },
  methods: {
    fetchDoctorPrescriptions() {
      this.$store.dispatch('admission/fetchDoctorPrescriptions', {
        id: this.$route.params.id,
      });
    },
  },
  created() {
    this.fetchDoctorPrescriptions();
  },
  data() {
    return {
      FEMALE: 'Female',
    };
  },
};
</script>
<style scoped></style>
