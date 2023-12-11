<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-14'">
            <div class="card-label">Care Plans</div>
          </div>
        </div>
        <b-collapse id="accordion-14" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <care-plan-table :plans="plans" />
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import CarePlanTable from '@/view/components/table/CarePlanTable.vue';

export default {
  components: { CarePlanTable },
  computed: {
    plans() {
      return this.$store.state.admission.carePlans;
    },
  },
  methods: {
    fetchCarePlans() {
      this.$store.dispatch('admission/fetchCarePlans', { id: this.$route.params.id });
    },
  },
  created() {
    this.fetchCarePlans();
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
