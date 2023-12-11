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
        source="Consultation"
        :show-switch="showSwitch"
        :switch-position="switchPosition"
        :filter="filter"
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
    visit() {
      return this.$store.state.visit.visit;
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
