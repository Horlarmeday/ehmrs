<template>
  <div>
    <div class="card card-custom gutter-b">
      <page-title title="Approve Result" />
      <div v-if="loading">
        <b-progress :value="count" variant="primary" show-progress animated :max="100" />
      </div>
      <div v-else class="card-body">
        <section-title text="Patient Information" />
        <patient-section :patient="investigation.patient" />
        <investigation-result-section
          :tests="investigation.investigations"
          :patient_id="investigation.patient.id"
          :show-approve-button="true"
          :investigation-status="investigation.status"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SectionTitle from '../laboratory/components/SectionTitle.vue';
import PatientSection from '../laboratory/components/PatientSection.vue';
import PageTitle from '../laboratory/components/PageTitle.vue';
import InvestigationResultSection from '@/view/pages/radiology/result/InputResultSection.vue';
export default {
  name: 'RadiologyResultApproval',
  components: { InvestigationResultSection, PageTitle, PatientSection, SectionTitle },
  data: () => ({
    loading: false,
    count: 0,
  }),
  computed: {
    investigation() {
      return this.$store.state.radiology.reqInvestigation;
    },
  },
  methods: {
    countToHundred() {
      for (let i = 1; i <= 100; i++) {
        this.count = i;
        if (this.investigation) break;
      }
    },
  },
  created() {
    this.loading = true;
    this.countToHundred();
    this.$store
      .dispatch('radiology/fetchOneRequestedInvestigation', { id: this.$route.params.id })
      .then(() => (this.loading = false));
  },
};
</script>

<style scoped></style>
