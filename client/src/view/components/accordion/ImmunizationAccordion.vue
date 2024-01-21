<template>
  <div class="card-custom card-stretch card-stretch-fourth">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-84'">
            <div class="card-label">{{ heading }}</div>
          </div>
        </div>
        <b-collapse id="accordion-84" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <immunization-table :medication="medication" />
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import ImmunizationTable from '@/view/components/table/ImmunizationTable.vue';

export default {
  components: { ImmunizationTable },
  props: {
    medication: {
      type: Object,
      required: true,
      default: () => {},
    },
    heading: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
