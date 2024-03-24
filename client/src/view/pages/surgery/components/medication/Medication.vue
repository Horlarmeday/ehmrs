<template>
  <div>
    <medication-card source="Theater" :show-switch="showSwitch" :switch-position="switchPosition" />
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
    surgery() {
      return this.$store.state.surgery.surgery;
    },
    showSwitch() {
      return (
        (this.surgery?.patient?.has_insurance &&
          !EXCLUDED_INSURANCE.includes(this.surgery?.insurance?.insurance?.name)) ||
        false
      );
    },
  },
  components: { MedicationCard },
  methods: {
    defaultSwitchPosition() {
      setTimeout(() => {
        if (
          this.surgery?.patient?.has_insurance &&
          !EXCLUDED_INSURANCE.includes(this.surgery?.insurance?.insurance?.name)
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
