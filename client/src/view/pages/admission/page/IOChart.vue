<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-header py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">IO Charts</span>
        </h3>
      </div>
      <div class="card-body">
        <i-o-chart-accordion />
        <create-i-o-chart />
      </div>
    </div>
  </div>
</template>
<script>
import IOChartAccordion from '@/view/pages/admission/components/iochart/IOChartAccordion.vue';
import CreateIOChart from '@/view/pages/admission/components/iochart/CreateIOChart.vue';

export default {
  components: { CreateIOChart, IOChartAccordion },
};
</script>

<style scoped></style>
