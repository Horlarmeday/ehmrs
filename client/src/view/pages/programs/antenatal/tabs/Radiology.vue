<template>
  <div>
    <investigation-card
      source="Antenatal"
      :show-switch="showSwitch"
      :switch-position="switchPosition"
      :insurance-name="insuranceName"
    />
  </div>
</template>
<script>
import InvestigationCard from '@/view/pages/consultation/components/investigations/InvestigationsCard.vue';
import { EXCLUDED_INSURANCE } from '@/common/common';

export default {
  components: { InvestigationCard },
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
