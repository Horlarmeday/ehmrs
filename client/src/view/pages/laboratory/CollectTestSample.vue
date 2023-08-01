<template>
  <div>
    <div class="card card-custom gutter-b">
      <page-title title="Add Test Sample" />
      <div v-if="loading">
        <b-progress :value="count" variant="primary" show-progress animated :max="100" />
      </div>
      <div v-else class="card-body">
        <section-title text="Patient Information" />
        <patient-section :patient="sample.patient" />

        <section-title text="Test Information" />
        <tests-order-section :tests="sample.tests" />

        <section-title text="Order" />
        <order-section />
      </div>
    </div>
  </div>
</template>

<script>
import SectionTitle from './components/SectionTitle';
import TestsOrderSection from './collectTestSample/TestsOrderSection';
import PatientSection from './components/PatientSection';
import OrderSection from './collectTestSample/OrderSection';
import PageTitle from './components/PageTitle.vue';
export default {
  name: 'CollectTestSample',
  data: () => ({
    loading: false,
    count: 0,
  }),
  components: {
    PageTitle,
    OrderSection,
    PatientSection,
    TestsOrderSection,
    SectionTitle,
  },
  created() {
    this.loading = true;
    this.countToHundred()
    this.$store
      .dispatch('laboratory/fetchOneSampleToCollect', { id: this.$route.params.id })
      .then(() => (this.loading = false));
  },
  computed: {
    sample() {
      return this.$store.state.laboratory.sampleToCollect;
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
