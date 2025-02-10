<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-header">
      <div class="card-title">
        <div class="card-label">Additional Items</div>
      </div>
    </div>
    <div class="card-body">
      <additional-items-accordion :filter="filter" />
      <create-additional-items
        source="Antenatal"
        :show-switch="showSwitch"
        :switch-position="switchPosition"
        :filter="filter"
        :insurance-name="insuranceName"
      />
    </div>
  </div>
</template>
<script>
import AdditionalItemsAccordion from '@/view/components/accordion/AdditionalItemsAccordion.vue';
import CreateAdditionalItems from '@/view/pages/visits/components/tabs/additionalItems/CreateAdditionalItems.vue';
import { EXCLUDED_INSURANCE } from '@/common/common';

export default {
  components: { CreateAdditionalItems, AdditionalItemsAccordion },
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
