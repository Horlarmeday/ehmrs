<template>
  <div>
    <medication-card
      source="Consultation"
      :show-switch="showSwitch"
      :switch-position="switchPosition"
      :insurance-name="insuranceName"
    />
  </div>
</template>

<script>
import MedicationCard from '@/view/pages/consultation/components/medications/MedicationCard.vue';
import { EXCLUDED_INSURANCE } from '@/common/common';

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
          this.visit?.insurance?.insurance?.name &&
          !EXCLUDED_INSURANCE.includes(this.visit?.insurance?.insurance?.name)) ||
        false
      );
    },
  },
  components: { MedicationCard },
  methods: {
    defaultSwitchPosition() {
      setTimeout(() => {
        if (
          this.visit?.patient?.has_insurance &&
          this.visit?.insurance?.insurance?.name &&
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
