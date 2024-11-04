<template>
  <div>
    <medication-card
      :show-switch="showSwitch"
      :switch-position="switchPosition"
      source="Antenatal"
      :insurance-name="insuranceName"
    />
  </div>
</template>

<script>
import { EXCLUDED_INSURANCE } from '@/common/common';
import MedicationCard from '@/view/pages/consultation/components/medications/MedicationCard.vue';

export default {
  components: { MedicationCard },
  data: () => ({
    switchPosition: false,
  }),
  computed: {
    insurance() {
      return this.$store.state.insurance.patientInsurance;
    },

    insuranceName() {
      return this.insurance?.insurance?.name;
    },

    showSwitch() {
      return (
        (this.insurance &&
          this.insurance?.insurance?.name &&
          !EXCLUDED_INSURANCE.includes(this.insurance?.insurance?.name)) ||
        false
      );
    },
  },
  methods: {
    defaultSwitchPosition() {
      setTimeout(() => {
        if (
          this.insurance &&
          this.insurance?.insurance?.name &&
          !EXCLUDED_INSURANCE.includes(this.insurance?.insurance?.name)
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
