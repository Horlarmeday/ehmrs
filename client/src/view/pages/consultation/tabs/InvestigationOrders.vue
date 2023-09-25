<template>
  <div>
    <investigation-card
      source="Consultation"
      :show-switch="showSwitch"
      :switch-position="switchPosition"
    />
  </div>
</template>
<script>
import { EXCLUDED_INSURANCE } from '@/common/common';
import InvestigationCard from '../components/investigations/InvestigationsCard.vue';

export default {
  name: 'InvestigationOrders',
  components: {
    InvestigationCard,
  },
  data: () => ({
    switchPosition: false,
  }),
  computed: {
    visit() {
      return this.$store.state.visit.visit;
    },
    showSwitch() {
      return (
        (this.visit?.patient?.has_insurance &&
          !EXCLUDED_INSURANCE.includes(this.visit?.insurance?.insurance?.name)) ||
        false
      );
    },
  },
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