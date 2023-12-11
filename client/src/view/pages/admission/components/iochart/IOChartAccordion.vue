<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-14'">
            <div class="card-label">IO Charts</div>
          </div>
        </div>
        <b-collapse id="accordion-14" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <i-o-chart-table :charts="charts" />
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import IOChartTable from '@/view/components/table/IOChartTable.vue';

export default {
  components: { IOChartTable },
  computed: {
    charts() {
      return this.$store.state.admission.iocharts;
    },
  },
  methods: {
    fetchIOCharts() {
      this.$store.dispatch('admission/fetchIOCharts', { id: this.$route.params.id });
    },
  },
  created() {
    this.fetchIOCharts();
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
