<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-header">
      <div class="card-title">
        <div class="card-label">Treatment</div>
      </div>
    </div>
    <div class="card-body">
      <b-tabs content-class="mt-3">
        <b-tab title="Treatment" active>
          <treatment-accordion :filter="filter" />
          <add-treatment source="Consultation" :filter="filter" />
        </b-tab>
        <b-tab title="Additional Treatments">
          <additional-treatments-accordion :filter="filter" />
          <add-additional-treatment :filter="filter" source="Consultation" />
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>
<script>
import TreatmentAccordion from '@/view/components/accordion/TreatmentAccordion.vue';
import AddTreatment from '@/view/pages/visits/components/tabs/treatments/AddTreatment.vue';
import AdditionalTreatmentsAccordion from '@/view/components/accordion/AdditionalTreatmentsAccordion.vue';
import AddAdditionalTreatment from '@/view/pages/visits/components/tabs/treatments/AddAdditionalTreatment.vue';

export default {
  components: {
    AddAdditionalTreatment,
    AdditionalTreatmentsAccordion,
    AddTreatment,
    TreatmentAccordion,
  },
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
