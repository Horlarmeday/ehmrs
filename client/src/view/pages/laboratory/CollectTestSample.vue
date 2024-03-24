<template>
  <div>
    <div v-if="sample" class="card card-custom gutter-b">
      <page-title title="Add Test Sample" />
      <div class="card-body pt-0">
        <section-title text="Patient Information" />
        <patient-section :patient="sample.patient" :insurance="sample?.insurance" />

        <section-title text="Test Information" />
        <tests-order-section :tests="sample.tests" />

        <section-title text="Order" />
        <order-section />
      </div>
    </div>
    <test-skeleton v-else title="Add Test Sample" section-title="Order" />
  </div>
</template>

<script>
import SectionTitle from '../../../utils/SectionTitle.vue';
import TestsOrderSection from './collectTestSample/TestsOrderSection';
import PatientSection from '../../../utils/PatientSection.vue';
import OrderSection from './collectTestSample/OrderSection';
import PageTitle from '../../../utils/PageTitle.vue';
import TestSkeleton from '@/view/pages/laboratory/components/skeleton/TestSkeleton.vue';
export default {
  name: 'CollectTestSample',
  components: {
    TestSkeleton,
    PageTitle,
    OrderSection,
    PatientSection,
    TestsOrderSection,
    SectionTitle,
  },
  created() {
    this.$store.dispatch('laboratory/fetchOneSampleToCollect', { id: this.$route.params.id });
  },
  computed: {
    sample() {
      return this.$store.state.laboratory.sampleToCollect;
    },
  },
};
</script>

<style scoped></style>
