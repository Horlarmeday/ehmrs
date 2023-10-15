<template>
  <div>
    <service-card
      :show-switch="showSwitch"
      :switch-position="switchPosition"
      source="Consultation"
    />
  </div>
</template>

<script>
import { EXCLUDED_INSURANCE } from '@/common/common';
import ServiceCard from '@/view/pages/consultation/components/services/ServiceCard.vue';

export default {
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
  components: { ServiceCard },
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
