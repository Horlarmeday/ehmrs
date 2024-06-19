<template>
  <div>
    <test-card
      :insurance-name="insuranceName"
      :show-switch="showSwitch"
      :switch-position="switchPosition"
      source="Consultation"
    />
  </div>
</template>

<script>
import TestCard from '@/view/pages/consultation/components/tests/TestCard.vue';
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
  components: { TestCard },
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
