<template>
  <div>
    <service-card
      :show-switch="showSwitch"
      :switch-position="switchPosition"
      source="Antenatal"
      :filter="filter"
      :insurance-name="insuranceName"
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
    insurance() {
      return this.$store.state.insurance.patientInsurance;
    },

    insuranceName() {
      return this.insurance?.insurance?.name;
    },

    filter() {
      return { visit_id: this.$route.params.id };
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
  components: { ServiceCard },
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
