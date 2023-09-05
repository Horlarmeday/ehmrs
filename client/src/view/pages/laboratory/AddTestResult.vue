<template>
  <div>
    <div class="card card-custom gutter-b">
      <page-title title="Add Test Result" />
      <div v-if="loading">
        <b-progress :value="count" variant="primary" show-progress animated :max="100" />
      </div>
      <div v-else class="card-body">
        <section-title text="Patient Information" />
        <patient-section :patient="sample.patient" />
        <banner />

        <section-title text="Tests Information" />
        <result-section
          :prescriptions="sample.tests"
          :accession_number="sample.accession_number"
          :patient_id="sample.patient.id"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SectionTitle from '../../../utils/SectionTitle.vue';
import PatientSection from '../../../utils/PatientSection.vue';
import Banner from './results/Banner';
import ResultSection from './results/ResultSection';
import PageTitle from '../../../utils/PageTitle.vue';
export default {
  name: 'AddTestResult',
  data: () => ({
    count: 0,
    loading: false,
  }),

  components: { PageTitle, ResultSection, Banner, PatientSection, SectionTitle },

  created() {
    this.loading = true;
    this.countToHundred();
    this.$store
      .dispatch('laboratory/fetchOneCollectedSample', { id: this.$route.params.id })
      .then(() => (this.loading = false));
  },

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
};
</script>

<style scoped></style>
