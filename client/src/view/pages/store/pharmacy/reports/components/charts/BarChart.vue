<template>
  <div>
    <div v-if="loading" class="d-flex justify-content-center py-10">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <apexchart 
      v-else
      type="bar" 
      :height="height" 
      :options="chartOptions" 
      :series="series"
    ></apexchart>
  </div>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'

export default {
  name: 'BarChart',
  components: {
    apexchart: VueApexCharts
  },
  props: {
    series: {
      type: Array,
      required: true
    },
    categories: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    height: {
      type: [String, Number],
      default: 350
    },
    loading: {
      type: Boolean,
      default: false
    },
    colors: {
      type: Array,
      default: () => ['#3699FF', '#1BC5BD', '#FFA800', '#F64E60']
    }
  },
  computed: {
    chartOptions() {
      return {
        chart: {
          type: 'bar',
          toolbar: {
            show: true
          }
        },
        colors: this.colors,
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: this.categories
        },
        yaxis: {
          title: {
            text: this.title
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val
            }
          }
        },
        legend: {
          position: 'top'
        }
      }
    }
  }
}
</script>