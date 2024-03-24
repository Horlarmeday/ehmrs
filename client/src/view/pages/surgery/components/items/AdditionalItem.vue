<template>
  <div>
    <additional-items
      source="Theater"
      :show-switch="showSwitch"
      :switch-position="switchPosition"
      :filter="filter"
    />
  </div>
</template>
<script>
import AdditionalItems from '@/view/pages/admission/components/additionalPrescriptions/AdditionalItems.vue';
import { EXCLUDED_INSURANCE } from '@/common/common';

export default {
  data: () => ({
    switchPosition: false,
  }),
  computed: {
    surgery() {
      return this.$store.state.surgery.surgery;
    },
    filter() {
      return { visit_id: this.$route.params.id };
    },
    showSwitch() {
      return (
        (this.surgery?.patient?.has_insurance &&
          !EXCLUDED_INSURANCE.includes(this.surgery?.insurance?.insurance?.name)) ||
        false
      );
    },
  },
  components: { AdditionalItems },
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
