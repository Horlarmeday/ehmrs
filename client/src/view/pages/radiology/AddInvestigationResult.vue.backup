<template>
  <div>
    <div v-if="investigation" class="card card-custom gutter-b">
      <page-title title="Add Test Result" />
      <div class="card-body pt-0">
        <section-title text="Patient Information" />
        <patient-section :patient="investigation.patient" :insurance="investigation.insurance" />
        <investigation-result-section
          :tests="investigation.investigations"
          :patient_id="investigation.patient.id"
          :key="uniqueKey"
        />
      </div>
    </div>
    <result-skeleton v-else title="Add Test Result" />
  </div>
</template>

<script>
import SectionTitle from '@/utils/SectionTitle.vue';
import PatientSection from '@/utils/PatientSection.vue';
import PageTitle from '@/utils/PageTitle.vue';
import InvestigationResultSection from './result/InputResultSection.vue';
import ResultSkeleton from '@/view/pages/radiology/components/skeleton/ResultSkeleton.vue';
export default {
  name: 'AddInvestigationTestResult',

  components: {
    ResultSkeleton,
    InvestigationResultSection,
    PageTitle,
    PatientSection,
    SectionTitle,
  },

  created() {
    this.$store.dispatch('radiology/fetchOneRequestedInvestigation', {
      id: this.$route.params.id,
    });
  },

  computed: {
    investigation() {
      return this.$store.state.radiology.reqInvestigation;
    },
    uniqueKey() {
      return this.investigation.patient.id + Date.now();
    },
  },
};
</script>

<style scoped></style>
