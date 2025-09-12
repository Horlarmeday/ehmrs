<template>
  <div>
    <div v-if="loading" class="d-flex justify-content-center py-10">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <apexchart 
      v-else
      type="line" 
      :height="height" 
      :options="chartOptions" 
      :series="series"
    ></apexchart>
  </div>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'

export default {
  name: 'LineChart',
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
          type: 'line',
          zoom: {
            enabled: false
          },
          toolbar: {
            show: true
          }
        },
        colors: this.colors,
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
          width: 3
        },
        title: {
          text: this.title,
          align: 'left'
        },
        grid: {
          borderColor: '#e7e7e7',
          row: {
            colors: ['#f3f3f3', 'transparent'],
            opacity: 0.5
          }
        },
        markers: {
          size: 1
        },
        xaxis: {
          categories: this.categories,
          title: {
            text: 'Time Period'
          }
        },
        yaxis: {
          title: {
            text: 'Value'
          },
          min: 0
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          floating: true,
          offsetY: -25,
          offsetX: -5
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (val) {
              return val
            }
          }
        }
      }
    }
  }
}
</script>