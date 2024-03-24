<template>
  <div>
    <div v-if="investigation" class="card card-custom gutter-b">
      <page-title title="Approve Result" />
      <div class="card-body pt-0">
        <section-title text="Patient Information" />
        <patient-section :patient="investigation.patient" :insurance="investigation.insurance" />
        <investigation-result-section
          :tests="investigation.investigations"
          :patient_id="investigation.patient.id"
          :show-approve-button="true"
          :investigation-status="investigation.status"
        />
      </div>
    </div>
    <result-skeleton v-else title="Approve Result" />
  </div>
</template>

<script>
import SectionTitle from '@/utils/SectionTitle.vue';
import PatientSection from '@/utils/PatientSection.vue';
import PageTitle from '@/utils/PageTitle.vue';
import InvestigationResultSection from '@/view/pages/radiology/result/InputResultSection.vue';
import ResultSkeleton from '@/view/pages/radiology/components/skeleton/ResultSkeleton.vue';
export default {
  name: 'RadiologyResultApproval',
  components: {
    ResultSkeleton,
    InvestigationResultSection,
    PageTitle,
    PatientSection,
    SectionTitle,
  },
  computed: {
    investigation() {
      return this.$store.state.radiology.reqInvestigation;
    },
  },
  created() {
    this.$store.dispatch('radiology/fetchOneRequestedInvestigation', { id: this.$route.params.id });
  },
};
</script>

<style scoped></style>
