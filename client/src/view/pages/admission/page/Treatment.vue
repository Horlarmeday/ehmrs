<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-header">
      <div class="card-title">
        <div class="card-label">Treatments</div>
      </div>
    </div>
    <div class="card-body">
      <treatment-accordion :filter="filter" />
      <add-treatment
        source="Admission"
        :show-switch="showSwitch"
        :switch-position="switchPosition"
        :filter="filter"
      />
    </div>
  </div>
</template>
<script>
import { EXCLUDED_INSURANCE } from '@/common/common';
import TreatmentAccordion from '@/view/components/accordion/TreatmentAccordion.vue';
import AddTreatment from '@/view/pages/visits/components/tabs/treatments/AddTreatment.vue';

export default {
  components: { AddTreatment, TreatmentAccordion },
  data: () => ({
    switchPosition: false,
  }),
  computed: {
    admission() {
      return this.$store.state.admission.admission;
    },
    filter() {
      return { admission_id: this.$route.params.id };
    },
    showSwitch() {
      return (
        (this.admission?.patient?.has_insurance &&
          !EXCLUDED_INSURANCE.includes(this.admission?.insurance?.insurance?.name)) ||
        false
      );
    },
  },
  methods: {
    defaultSwitchPosition() {
      setTimeout(() => {
        if (
          this.admission?.patient?.has_insurance &&
          !EXCLUDED_INSURANCE.includes(this.admission?.insurance?.insurance?.name)
        ) {
          this.switchPosition = true;
        }
      }, 350);
    },
  },
  created() {
    this.defaultSwitchPosition();
  },
};
</script>

<style scoped></style>
