<template>
  <div>
    <bulk-medication-card
      source="Consultation"
      :show-switch="showSwitch"
      :switch-position="switchPosition"
      :insurance-name="insuranceName"
    />
  </div>
</template>

<script>
import { EXCLUDED_INSURANCE } from '@/common/common';
import BulkMedicationCard from '@/view/pages/consultation/components/medications/BulkMedicationCard.vue';

export default {
  data: () => ({
    switchPosition: false,
  }),
  computed: {
    visit() {
      return this.$store.state.visit.visit;
    },
    insuranceName() {
      return this.visit?.insurance?.insurance?.name;
    },
    showSwitch() {
      return (
        (this.visit?.patient?.has_insurance &&
          !EXCLUDED_INSURANCE.includes(this.visit?.insurance?.insurance?.name)) ||
        false
      );
    },
  },
  components: { BulkMedicationCard },
  methods: {
    defaultSwitchPosition() {
      setTimeout(() => {
        if (
          this.visit?.patient?.has_insurance &&
          !EXCLUDED_INSURANCE.includes(this.visit?.insurance?.insurance?.name)
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
