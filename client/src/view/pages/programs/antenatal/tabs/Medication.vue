<template>
  <div>
    <medication-card
      :show-switch="showSwitch"
      :switch-position="switchPosition"
      source="Antenatal"
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
    antenatal() {
      return this.$store.state.antenatal.antenatal;
    },

    insurance() {
      return this.$store.state.insurance.patientInsurance;
    },

    showSwitch() {
      return (
        (this.insurance && !EXCLUDED_INSURANCE.includes(this.insurance?.insurance?.name)) || false
      );
    },
  },
  methods: {
    defaultSwitchPosition() {
      setTimeout(() => {
        if (this.insurance && !EXCLUDED_INSURANCE.includes(this.insurance?.insurance?.name)) {
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