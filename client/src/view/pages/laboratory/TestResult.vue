<template>
  <div>
    <div v-if="result" class="card card-custom gutter-b">
      <page-title title="Test Result" />
      <div class="card-body pt-0">
        <section-title text="Patient Information" />
        <patient-section :patient="result.patient" :insurance="result?.insurance" />

        <section-title :text="`Accession Number: ${result.accession_number}`" />
        <test-result-section
          :tests="result.tests"
          :accession_number="result.accession_number"
          :result_notes="result.result_notes"
          :key="accessionNumberKey"
        />
      </div>
    </div>
    <test-skeleton v-else title="Test Result" />
  </div>
</template>

<script>
import SectionTitle from '../../../utils/SectionTitle.vue';
import PatientSection from '../../../utils/PatientSection.vue';
import PageTitle from '@/utils/PageTitle.vue';
import TestResultSection from '@/view/pages/laboratory/results/TestResultSection.vue';
import TestSkeleton from '@/view/pages/laboratory/components/skeleton/TestSkeleton.vue';
export default {
  name: 'TestResult',
  components: { TestSkeleton, TestResultSection, PageTitle, PatientSection, SectionTitle },
  computed: {
    result() {
      return this.$store.state.laboratory.result;
    },
    accessionNumberKey() {
      return this.result.accession_number;
    },
  },
  created() {
    this.$store.dispatch('laboratory/fetchTestResult', { id: this.$route.params.id });
  },
};
</script>

<style scoped></style>
