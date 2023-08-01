<template>
  <div>
    <div class="card card-custom gutter-b">
      <page-title title="Validate Result" />
      <div v-if="loading">
        <b-progress :value="count" variant="primary" show-progress animated :max="100" />
      </div>
      <div v-else class="card-body">
        <section-title text="Patient Information" />
        <patient-section :patient="sample.patient" />

        <section-title text="Validate Result" />
        <result-validation-section
          :tests="sample.tests"
          :accession_number="sample.accession_number"
          :patient_id="sample.patient.id"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SectionTitle from './components/SectionTitle.vue';
import PatientSection from './components/PatientSection.vue';
import ResultValidationSection from './results/ResultValidationSection';
import PageTitle from '@/view/pages/laboratory/components/PageTitle.vue';
export default {
  name: 'ValidateResult',
  components: { PageTitle, PatientSection, ResultValidationSection, SectionTitle },
  data: () => ({
    loading: false,
    count: 0,
  }),
  computed: {
    sample() {
      return this.$store.state.laboratory.sampleCollected;
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
      .dispatch('laboratory/fetchOneCollectedSample', { id: this.$route.params.id })
      .then(() => (this.loading = false));
  },
};
</script>

<style scoped></style>
