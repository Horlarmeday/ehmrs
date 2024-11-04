<template>
  <div>
    <div v-if="result" class="card card-custom gutter-b">
      <page-title title="Test Result" />
      <div class="card-body pt-0">
        <section-title text="Patient Information" />
        <patient-section :patient="result.patient" :insurance="result?.insurance" />

        <section-title :text="`Accession Number: ${result.accession_number}`" />
        <test-result-section
          :tests="tests"
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
import TestResultSection from '@/view/pages/laboratory/temp/TestResultSection.vue';
import TestSkeleton from '@/view/pages/laboratory/components/skeleton/TestSkeleton.vue';

export default {
  name: 'TestResult',
  components: { TestSkeleton, TestResultSection, PageTitle, PatientSection, SectionTitle },
  computed: {
    result() {
      return this.$store.state.laboratory.result;
    },
    tests() {
      const lab_test_id = this.$route.query.lab_test;
      if (!lab_test_id) return this.result.tests;
      return this.result.tests.filter(test => test.id === +lab_test_id);
    },
    accessionNumberKey() {
      return this.result.accession_number + Date.now();
    },
  },
  created() {
    this.$store.dispatch('laboratory/fetchTestResult', { id: this.$route.params.id });
  },
};
</script>

<style scoped></style>
