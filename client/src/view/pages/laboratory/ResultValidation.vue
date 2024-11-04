<template>
  <div>
    <div v-if="sample" class="card card-custom gutter-b">
      <page-title title="Validate Result" />
      <div class="card-body pt-0">
        <section-title text="Patient Information" />
        <patient-section :patient="sample.patient" :insurance="sample?.insurance" />

        <section-title text="Validate Result" />
        <result-validation-section
          :tests="sample.tests"
          :accession_number="sample.accession_number"
          :patient_id="sample.patient.id"
          :key="accessionNumberKey"
        />
      </div>
    </div>
    <test-skeleton v-else title="Validate Result" />
  </div>
</template>

<script>
import SectionTitle from '../../../utils/SectionTitle.vue';
import PatientSection from '../../../utils/PatientSection.vue';
import ResultValidationSection from './temp/ResultValidationSection';
import PageTitle from '@/utils/PageTitle.vue';
import TestSkeleton from '@/view/pages/laboratory/components/skeleton/TestSkeleton.vue';
export default {
  name: 'ValidateResult',
  components: { TestSkeleton, PageTitle, PatientSection, ResultValidationSection, SectionTitle },
  computed: {
    sample() {
      return this.$store.state.laboratory.sampleCollected;
    },
    accessionNumberKey() {
      return this.sample.accession_number + Date.now();
    },
  },
  created() {
    this.$store.dispatch('laboratory/fetchOneCollectedSample', { id: this.$route.params.id });
  },
};
</script>

<style scoped></style>
