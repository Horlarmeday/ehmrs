<template>
  <div>
    <additional-services
      :filter="filter"
      source="Theater"
      :show-switch="showSwitch"
      :switch-position="switchPosition"
      :is-visible="true"
      :insurance-name="insuranceName"
    />
  </div>
</template>
<script>
import AdditionalServices from '@/view/pages/admission/components/additionalPrescriptions/AdditionalServices.vue';
import { EXCLUDED_INSURANCE } from '@/common/common';

export default {
  components: { AdditionalServices },
  data: () => ({
    switchPosition: false,
  }),
  computed: {
    surgery() {
      return this.$store.state.surgery.surgery;
    },
    insuranceName() {
      return this.surgery?.insurance?.insurance?.name;
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
