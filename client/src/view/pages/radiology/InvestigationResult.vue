<template>
  <div>
    <div class="card card-custom gutter-b">
      <page-title title="Result" />
      <div v-if="loading">
        <b-progress :value="count" variant="primary" show-progress animated :max="100" />
      </div>
      <div v-else class="card-body">
        <section-title text="Patient Information" />
        <patient-section :patient="result.patient" />
        <result-section :results="result.results" />
      </div>
    </div>
  </div>
</template>

<script>
import SectionTitle from '../../../utils/SectionTitle.vue';
import PatientSection from '../../../utils/PatientSection.vue';
import PageTitle from '../../../utils/PageTitle.vue';
import ResultSection from './result/ResultSection.vue';
export default {
  name: 'RadiologyResult',
  components: { ResultSection, PageTitle, PatientSection, SectionTitle },
  data: () => ({
    loading: false,
    count: 0,
  }),
  computed: {
    result() {
      return this.$store.state.radiology.result;
    },
  },
  methods: {
    countToHundred() {
      for (let i = 1; i <= 100; i++) {
        this.count = i;
        if (this.result) break;
      }
    },
  },
  created() {
    this.loading = true;
    this.countToHundred();
    this.$store
      .dispatch('radiology/fetchOneInvestigationResult', { id: this.$route.params.id })
      .then(() => (this.loading = false));
  },
};
</script>

<style scoped></style>
