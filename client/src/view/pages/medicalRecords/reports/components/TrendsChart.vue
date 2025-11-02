<template>
  <div class="trends-chart">
    <b-card>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="flaticon2-graph-1 text-primary mr-2"></i>
            Trend Analysis
          </h5>
          <b-button-group size="sm">
            <b-button
              v-for="granularity in granularities"
              :key="granularity.value"
              :variant="selectedGranularity === granularity.value ? 'primary' : 'outline-primary'"
              @click="selectGranularity(granularity.value)"
            >
              {{ granularity.label }}
            </b-button>
          </b-button-group>
        </div>
      </template>

      <b-card-body>
        <!-- Loading State -->
        <div v-if="loading" class="chart-loading">
          <b-skeleton-wrapper :loading="true">
            <template #loading>
              <div style="height: 350px" class="d-flex align-items-center justify-content-center">
                <b-spinner variant="primary"></b-spinner>
              </div>
            </template>
          </b-skeleton-wrapper>
        </div>

        <!-- Empty State -->
        <div v-else-if="!trendsData || trendsData.length === 0" class="text-center py-5">
          <i class="flaticon2-graph-1 text-muted" style="font-size: 4rem"></i>
          <p class="text-muted mt-3 mb-0">No trend data available</p>
          <small class="text-muted">Adjust your filters to view trend analysis</small>
        </div>

        <!-- Chart Canvas -->
        <div v-else class="chart-container">
          <canvas ref="trendChart"></canvas>
        </div>

        <!-- Chart Summary -->
        <div v-if="chartStats && !loading" class="chart-summary mt-4">
          <div class="row text-center">
            <div class="col-md-3">
              <small class="text-muted d-block">Total Count</small>
              <strong class="text-primary">{{ chartStats.total }}</strong>
            </div>
            <div class="col-md-3">
              <small class="text-muted d-block">Average</small>
              <strong class="text-info">{{ chartStats.average }}</strong>
            </div>
            <div class="col-md-3">
              <small class="text-muted d-block">Peak</small>
              <strong class="text-success">{{ chartStats.peak }}</strong>
            </div>
            <div class="col-md-3">
              <small class="text-muted d-block">Data Points</small>
              <strong class="text-secondary">{{ chartStats.dataPoints }}</strong>
            </div>
          </div>
        </div>
      </b-card-body>
    </b-card>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

export default {
  name: 'TrendsChart',
  props: {
    trendsData: {
      type: Array,
      default: () => [],
    },
    reportType: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      chartInstance: null,
      selectedGranularity: 'daily',
      granularities: [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
      ],
    };
  },
  computed: {
    aggregatedData() {
      if (!this.trendsData || this.trendsData.length === 0) return [];

      switch (this.selectedGranularity) {
        case 'weekly':
          return this.aggregateByWeek();
        case 'monthly':
          return this.aggregateByMonth();
        default:
          return this.trendsData.map((item) => ({
            date: dayjs(item.date).format('MMM DD, YYYY'),
            count: item.count,
            rawDate: item.date,
          }));
      }
    },
    chartStats() {
      if (!this.aggregatedData || this.aggregatedData.length === 0) return null;

      const counts = this.aggregatedData.map((item) => item.count);
      const total = counts.reduce((sum, count) => sum + count, 0);
      const average = (total / counts.length).toFixed(1);
      const peak = Math.max(...counts);

      return {
        total,
        average,
        peak,
        dataPoints: counts.length,
      };
    },
  },
  watch: {
    trendsData: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.$nextTick(() => {
            this.renderChart();
          });
        }
      },
      deep: true,
    },
    aggregatedData: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.$nextTick(() => {
            this.renderChart();
          });
        }
      },
      deep: true,
    },
    selectedGranularity() {
      this.$nextTick(() => {
        this.renderChart();
      });
    },
    loading(newVal) {
      if (!newVal && this.trendsData && this.trendsData.length > 0) {
        this.$nextTick(() => {
          this.renderChart();
        });
      }
    },
  },
  mounted() {
    if (this.trendsData && this.trendsData.length > 0) {
      this.$nextTick(() => {
        this.renderChart();
      });
    }
  },
  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  },
  methods: {
    selectGranularity(granularity) {
      this.selectedGranularity = granularity;
    },
    aggregateByWeek() {
      if (!this.trendsData || this.trendsData.length === 0) return [];

      const weeklyData = {};
      this.trendsData.forEach((item) => {
        const date = dayjs(item.date);
        const weekStart = date.startOf('week').format('YYYY-MM-DD');
        const weekLabel = `Week of ${date.startOf('week').format('MMM DD, YYYY')}`;

        if (!weeklyData[weekStart]) {
          weeklyData[weekStart] = {
            date: weekLabel,
            count: 0,
            rawDate: weekStart,
          };
        }
        weeklyData[weekStart].count += item.count;
      });

      return Object.values(weeklyData).sort((a, b) =>
        dayjs(a.rawDate).isAfter(dayjs(b.rawDate)) ? 1 : -1
      );
    },
    aggregateByMonth() {
      if (!this.trendsData || this.trendsData.length === 0) return [];

      const monthlyData = {};
      this.trendsData.forEach((item) => {
        const date = dayjs(item.date);
        const monthKey = date.format('YYYY-MM');
        const monthLabel = date.format('MMMM YYYY');

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            date: monthLabel,
            count: 0,
            rawDate: monthKey,
          };
        }
        monthlyData[monthKey].count += item.count;
      });

      return Object.values(monthlyData).sort((a, b) =>
        dayjs(a.rawDate).isAfter(dayjs(b.rawDate)) ? 1 : -1
      );
    },
    calculateMovingAverage(data, period = 3) {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - Math.floor(period / 2));
        const end = Math.min(data.length, i + Math.ceil(period / 2));
        const slice = data.slice(start, end);
        const average = slice.reduce((sum, val) => sum + val, 0) / slice.length;
        result.push(Math.round(average * 10) / 10);
      }
      return result;
    },
    getReportLabel() {
      const labels = {
        'patient-registrations': 'Registrations',
        'visit-categories': 'Visits',
        demographics: 'Patients',
        admissions: 'Admissions',
        'deceased-patients': 'Deaths',
      };
      return labels[this.reportType] || 'Count';
    },
    renderChart() {
      if (this.loading || !this.aggregatedData || this.aggregatedData.length === 0) {
        if (this.chartInstance) {
          this.chartInstance.destroy();
          this.chartInstance = null;
        }
        return;
      }

      const ctx = this.$refs.trendChart;
      if (!ctx) return;

      // Destroy existing chart
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const labels = this.aggregatedData.map((item) => item.date);
      const counts = this.aggregatedData.map((item) => item.count);
      const movingAverage = this.calculateMovingAverage(counts);

      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              type: 'bar',
              label: this.getReportLabel(),
              data: counts,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
              order: 2,
            },
            {
              type: 'line',
              label: 'Trend (Moving Avg)',
              data: movingAverage,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              order: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 15,
              },
            },
            tooltip: {
              callbacks: {
                title: (context) => {
                  return context[0].label;
                },
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: ${value}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
              },
              title: {
                display: true,
                text: 'Count',
              },
            },
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45,
              },
            },
          },
        },
      });
    },
  },
};
</script>

<style scoped>
.trends-chart {
  width: 100%;
}

.chart-container {
  position: relative;
  height: 350px;
  width: 100%;
}

.chart-loading {
  height: 350px;
}

.chart-summary {
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.chart-summary strong {
  font-size: 1.25rem;
  display: block;
  margin-top: 0.25rem;
}
</style>
