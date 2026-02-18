<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Trend Analysis</span>
      </h3>
      <div class="card-toolbar">
        <div class="d-flex align-items-center">
          <div class="mr-3">
            <date-picker v-model="dateRange" range @change="generateAnalysis" />
          </div>
          <button class="btn btn-primary mr-2" @click="handleExport('PDF')">
            <i class="fas fa-file-pdf mr-2"></i>
            Export PDF
          </button>
          <button class="btn btn-success" @click="handleExport('EXCEL')">
            <i class="fas fa-file-excel mr-2"></i>
            Export Excel
          </button>
        </div>
      </div>
    </div>
    <div class="card-body">
      <div v-if="loading" class="text-center py-10">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div v-else>
        <!-- Revenue vs Expenses Chart -->
        <div class="row mb-5">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Revenue vs Expenses</h3>
              </div>
              <div class="card-body">
                <apexchart
                  type="line"
                  height="350"
                  :options="revenueExpensesOptions"
                  :series="revenueExpensesSeries"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Account Type Distribution -->
        <div class="row mb-5">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Account Type Distribution</h3>
              </div>
              <div class="card-body">
                <apexchart
                  type="donut"
                  height="350"
                  :options="accountTypeOptions"
                  :series="accountTypeSeries"
                />
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Cost Center Distribution</h3>
              </div>
              <div class="card-body">
                <apexchart
                  type="bar"
                  height="350"
                  :options="costCenterOptions"
                  :series="costCenterSeries"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Trends -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Monthly Trends</h3>
              </div>
              <div class="card-body">
                <apexchart
                  type="line"
                  height="350"
                  :options="monthlyTrendsOptions"
                  :series="monthlyTrendsSeries"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import DatePicker from '@/components/DatePicker.vue';
import dayjs from 'dayjs';
import VueApexCharts from 'vue-apexcharts';

export default {
  name: 'TrendAnalysis',
  components: {
    DatePicker,
    apexchart: VueApexCharts,
  },
  data: () => ({
    dateRange: [
      dayjs().subtract(6, 'month').startOf('month').toDate(),
      dayjs().endOf('month').toDate(),
    ],
    revenueExpensesOptions: {
      chart: {
        type: 'line',
        toolbar: {
          show: false,
        },
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      colors: ['#00ACC1', '#F64E60'],
      xaxis: {
        categories: [],
      },
      yaxis: {
        labels: {
          formatter: (value) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'NGN',
            }).format(value),
        },
      },
      tooltip: {
        y: {
          formatter: (value) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'NGN',
            }).format(value),
        },
      },
    },
    revenueExpensesSeries: [
      {
        name: 'Revenue',
        data: [],
      },
      {
        name: 'Expenses',
        data: [],
      },
    ],
    accountTypeOptions: {
      chart: {
        type: 'donut',
        toolbar: {
          show: false,
        },
      },
      labels: [],
      colors: ['#00ACC1', '#1BC5BD', '#F64E60', '#FFA800', '#8950FC'],
      legend: {
        position: 'bottom',
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
          },
        },
      },
    },
    accountTypeSeries: [],
    costCenterOptions: {
      chart: {
        type: 'bar',
        toolbar: {
          show: false,
        },
      },
      colors: ['#00ACC1'],
      xaxis: {
        categories: [],
      },
      yaxis: {
        labels: {
          formatter: (value) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'NGN',
            }).format(value),
        },
      },
      tooltip: {
        y: {
          formatter: (value) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'NGN',
            }).format(value),
        },
      },
    },
    costCenterSeries: [
      {
        name: 'Expenses by Cost Center',
        data: [],
      },
    ],
    monthlyTrendsOptions: {
      chart: {
        type: 'line',
        toolbar: {
          show: false,
        },
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      colors: ['#1BC5BD'],
      xaxis: {
        categories: [],
      },
      yaxis: {
        labels: {
          formatter: (value) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'NGN',
            }).format(value),
        },
      },
      tooltip: {
        y: {
          formatter: (value) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'NGN',
            }).format(value),
        },
      },
    },
    monthlyTrendsSeries: [
      {
        name: 'Net Income',
        data: [],
      },
    ],
  }),
  computed: {
    ...mapGetters('account', ['trendAnalysis', 'loading']),
  },
  methods: {
    ...mapActions('account', ['fetchTrendAnalysis', 'exportReport']),
    async generateAnalysis() {
      try {
        await this.fetchTrendAnalysis({
          startDate: dayjs(this.dateRange[0]).format('YYYY-MM-DD'),
          endDate: dayjs(this.dateRange[1]).format('YYYY-MM-DD'),
        });
        this.updateCharts();
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Failed to generate analysis',
          type: 'error',
        });
      }
    },
    updateCharts() {
      if (!this.trendAnalysis) return;

      // Update Revenue vs Expenses Chart
      this.revenueExpensesOptions.xaxis.categories = this.trendAnalysis.months;
      this.revenueExpensesSeries = [
        {
          name: 'Revenue',
          data: this.trendAnalysis.revenue,
        },
        {
          name: 'Expenses',
          data: this.trendAnalysis.expenses,
        },
      ];

      // Update Account Type Chart
      this.accountTypeOptions.labels = this.trendAnalysis.accountTypes.map((type) => type.name);
      this.accountTypeSeries = this.trendAnalysis.accountTypes.map((type) => type.value);

      // Update Cost Center Chart
      this.costCenterOptions.xaxis.categories = this.trendAnalysis.costCenters.map(
        (center) => center.name
      );
      this.costCenterSeries = [
        {
          name: 'Expenses by Cost Center',
          data: this.trendAnalysis.costCenters.map((center) => center.value),
        },
      ];

      // Update Monthly Trends Chart
      this.monthlyTrendsOptions.xaxis.categories = this.trendAnalysis.months;
      this.monthlyTrendsSeries = [
        {
          name: 'Net Income',
          data: this.trendAnalysis.netIncome,
        },
      ];
    },
    async handleExport(format) {
      try {
        await this.exportReport({
          data: this.trendAnalysis,
          format,
          type: 'trend-analysis',
          startDate: dayjs(this.dateRange[0]).format('YYYY-MM-DD'),
          endDate: dayjs(this.dateRange[1]).format('YYYY-MM-DD'),
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Failed to export report',
          type: 'error',
        });
      }
    },
  },
  created() {
    this.generateAnalysis();
  },
};
</script>
