<template>
  <div>
    <div v-if="sample" class="card card-custom gutter-b">
      <page-title title="Add Test Result" />
      <div class="card-body pt-0">
        <section-title text="Patient Information" />
        <patient-section :patient="sample.patient" :insurance="sample.insurance" />
        <banner :visit-id="sample.visit_id" />

        <section-title text="Tests Information" />
        <result-section
          :prescriptions="sample.tests"
          :accession_number="sample.accession_number"
          :patient_id="sample.patient.id"
          :key="accessionNumberKey"
        />
      </div>
    </div>
    <test-skeleton v-else title="Add Test Result" />
  </div>
</template>

<script>
import SectionTitle from '../../../utils/SectionTitle.vue';
import PatientSection from '../../../utils/PatientSection.vue';
import Banner from './results/Banner';
import ResultSection from './temp/ResultSection';
import PageTitle from '../../../utils/PageTitle.vue';
import TestSkeleton from '@/view/pages/laboratory/components/skeleton/TestSkeleton.vue';
export default {
  name: 'AddTestResult',
  components: {
    TestSkeleton,
    PageTitle,
    ResultSection,
    Banner,
    PatientSection,
    SectionTitle,
  },

  created() {
    this.$store.dispatch('laboratory/fetchOneCollectedSample', { id: this.$route.params.id });
  },

  computed: {
    sample() {
      return this.$store.state.laboratory.sampleCollected;
    },
    accessionNumberKey() {
      return this.sample.accession_number + Date.now();
    },
  },
};
</script>

<style scoped></style>
