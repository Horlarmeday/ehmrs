<template>
  <div>
    <div v-if="result" class="card card-custom gutter-b">
      <page-title title="Result" />
      <div class="card-body pt-0">
        <section-title text="Patient Information" />
        <patient-section :patient="result.patient" :insurance="result.insurance" />
        <result-section :results="result.results" />
      </div>
    </div>
    <result-skeleton v-else title="Result" />
  </div>
</template>

<script>
import SectionTitle from '../../../utils/SectionTitle.vue';
import PatientSection from '../../../utils/PatientSection.vue';
import PageTitle from '../../../utils/PageTitle.vue';
import ResultSection from './result/ResultSection.vue';
import ResultSkeleton from '@/view/pages/radiology/components/skeleton/ResultSkeleton.vue';
export default {
  name: 'RadiologyResult',
  components: { ResultSkeleton, ResultSection, PageTitle, PatientSection, SectionTitle },
  computed: {
    result() {
      return this.$store.state.radiology.result;
    },
  },
  created() {
    this.$store.dispatch('radiology/fetchOneInvestigationResult', { id: this.$route.params.id });
  },
};
</script>

<style scoped></style>
