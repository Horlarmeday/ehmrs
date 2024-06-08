<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-header">
      <div class="card-title">
        <div class="card-label">Additional Services</div>
      </div>
    </div>
    <div class="card-body">
      <services-accordion :filter="filter" />
      <create-additional-services
        source="Consultation"
        :show-switch="showSwitch"
        :switch-position="switchPosition"
        :filter="filter"
        :insurance-name="insuranceName"
      />
    </div>
  </div>
</template>
<script>
import CreateAdditionalServices from '@/view/pages/admission/components/additionalPrescriptions/CreateAdditionalServices.vue';
import ServicesAccordion from '@/view/components/accordion/ServicesAccordion.vue';
import { EXCLUDED_INSURANCE } from '@/common/common';

export default {
  components: {
    ServicesAccordion,
    CreateAdditionalServices,
  },
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
    filter() {
      return { visit_id: this.$route.params.id };
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
