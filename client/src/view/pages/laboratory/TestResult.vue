<template>
  <div>
    <div class="card card-custom gutter-b">
      <page-title title="Test Result" />
      <div v-if="!result">
        <b-progress :value="count" variant="primary" show-progress animated :max="100" />
      </div>
      <div v-else class="card-body">
        <section-title text="Patient Information" />
        <patient-section :patient="result.patient" />

        <section-title :text="`Accession Number: ${result.accession_number}`" />
        <test-result-section
          :tests="result.tests"
          :accession_number="result.accession_number"
          :result_notes="result.result_notes"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SectionTitle from './components/SectionTitle.vue';
import PatientSection from './components/PatientSection.vue';
import PageTitle from '@/view/pages/laboratory/components/PageTitle.vue';
import TestResultSection from '@/view/pages/laboratory/results/TestResultSection.vue';
export default {
  name: 'TestResult',
  components: { TestResultSection, PageTitle, PatientSection, SectionTitle },
  data: () => ({
    loading: false,
    count: 0,
  }),
  computed: {
    result() {
      return this.$store.state.laboratory.result;
    },
  },
  methods: {
    countToHundred() {
      for (let i = 1; i <= 100; i++) {
        this.count = i;
        if (this.sample) break;
      }
    },
  },
  created() {
    this.loading = true;
    this.countToHundred();
    this.$store
      .dispatch('laboratory/fetchTestResult', { id: this.$route.params.id })
      .then(() => (this.loading = false));
  },
};
</script>

<style scoped></style>
