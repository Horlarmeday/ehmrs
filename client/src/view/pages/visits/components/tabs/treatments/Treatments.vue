<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-header">
      <div class="card-title">
        <div class="card-label">Treatment</div>
      </div>
    </div>
    <div class="card-body">
      <treatment-accordion :filter="filter" />
      <add-treatment source="Consultation" :filter="filter" />
    </div>
  </div>
</template>
<script>
import TreatmentAccordion from '@/view/components/accordion/TreatmentAccordion.vue';
import AddTreatment from '@/view/pages/visits/components/tabs/treatments/AddTreatment.vue';

export default {
  components: { AddTreatment, TreatmentAccordion },
  data: () => ({
    switchPosition: false,
  }),
  computed: {
    filter() {
      return { visit_id: this.$route.params.id };
    },
  },
};
</script>

<style scoped></style>
