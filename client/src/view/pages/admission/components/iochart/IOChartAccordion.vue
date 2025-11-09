<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-14'">
            <div class="card-label">IO Charts</div>
          </div>
        </div>
        <b-collapse visible id="accordion-14" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <div
              class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4"
            >
              <div class="w-100 w-md-25 mb-3 mb-md-0">
                <label class="font-weight-bold text-muted text-uppercase small mb-1"
                  >Timeframe</label
                >
                <b-form-select
                  v-model="selectedHours"
                  :options="hoursOptions"
                  size="sm"
                  @change="onHoursChange"
                />
              </div>
              <div v-if="charts.length" class="text-md-right">
                <div class="font-weight-bold text-uppercase small text-muted">Summed Totals</div>
                <div class="font-weight-bold">
                  <span class="mr-4">Input: {{ totals.input }}</span>
                  <span>Output: {{ totals.output }}</span>
                </div>
              </div>
            </div>
            <i-o-chart-table :charts="charts" :totals="charts.length ? totals : null" />
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
  data() {
    return {
      selectedHours: null,
      hoursOptions: [
        { value: null, text: 'All Records' },
        { value: 24, text: 'Last 24 Hours' },
        { value: 48, text: 'Last 48 Hours' },
        { value: 72, text: 'Last 72 Hours' },
        { value: 96, text: 'Last 96 Hours' },
        { value: 120, text: 'Last 120 Hours' },
      ],
    };
  },
  computed: {
    charts() {
      return this.$store.state.admission.iocharts || [];
    },
    totals() {
      const sums = this.charts.reduce(
        (acc, chart) => {
          const input = Number(chart.input_total) || 0;
          const output = Number(chart.output_total) || 0;
          acc.input += input;
          acc.output += output;
          return acc;
        },
        { input: 0, output: 0 }
      );
      return {
        input: Number(sums.input.toFixed(2)),
        output: Number(sums.output.toFixed(2)),
      };
    },
  },
  methods: {
    fetchIOCharts(hours = this.selectedHours) {
      const payload = {
        id: this.$route.params.id,
      };

      if (hours) {
        payload.hours = hours;
      }

      this.$store.dispatch('admission/fetchIOCharts', payload);
    },
    onHoursChange(value) {
      this.fetchIOCharts(value);
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
