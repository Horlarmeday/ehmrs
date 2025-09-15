<template>
  <div class="sales-report">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-8">
      <div>
        <h1 class="text-dark font-weight-bold mb-3">Sales Performance Report</h1>
        <p class="text-muted">Comprehensive sales analysis and revenue tracking</p>
      </div>
      <div class="d-flex">
        <button class="btn btn-light-primary mr-3" @click="refreshData" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i> Refresh
        </button>
        <ExportButton
          :reports="[{ name: 'Sales Report', type: 'sales' }]"
          :filters="filters"
          @export="handleExport"
        />
      </div>
    </div>

    <!-- Filters Panel -->
    <FilterPanel
      :filters="filters"
      :filter-options="filterOptions"
      @update-filters="updateFilters"
      @apply-filters="applyFilters"
      @reset-filters="resetFilters"
    />

    <!-- Summary Cards -->
    <div class="row mb-8">
      <div
        class="col-xl-3 col-lg-6 col-md-6 mb-6"
        v-for="(summary, index) in summaryData"
        :key="index"
      >
        <ReportCard
          :title="summary.title"
          :value="summary.value"
          :change="summary.change"
          :icon="summary.icon"
          :color="summary.color"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Charts Section -->
    <div class="row mb-8">
      <div class="col-lg-8">
        <div class="card card-custom card-stretch gutter-b">
          <div class="card-header border-0 pt-5">
            <h3 class="card-title align-items-start flex-column">
              <span class="card-label font-weight-bolder text-dark">Revenue Trend</span>
              <span class="text-muted mt-3 font-weight-bold font-size-sm"
                >Daily sales performance</span
              >
            </h3>
            <div class="card-toolbar">
              <div class="dropdown dropdown-inline">
                <button
                  class="btn btn-light-primary btn-sm dropdown-toggle"
                  type="button"
                  data-toggle="dropdown"
                >
                  {{ selectedPeriod }}
                </button>
                <div class="dropdown-menu">
                  <a class="dropdown-item" @click="changePeriod('Last 7 Days')">Last 7 Days</a>
                  <a class="dropdown-item" @click="changePeriod('Last 30 Days')">Last 30 Days</a>
                  <a class="dropdown-item" @click="changePeriod('Last 3 Months')">Last 3 Months</a>
                  <a class="dropdown-item" @click="changePeriod('Last 6 Months')">Last 6 Months</a>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <LineChart
              v-if="!loading && chartData.length > 0"
              :series="chartData"
              :categories="chartCategories"
              :height="300"
              title="Revenue"
            />
            <div
              v-else-if="loading"
              class="d-flex justify-content-center align-items-center"
              style="height: 300px;"
            >
              <div class="spinner-border text-primary" role="status"></div>
            </div>
            <div
              v-else
              class="d-flex justify-content-center align-items-center"
              style="height: 300px;"
            >
              <p class="text-muted">No sales data available for the selected period</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card card-custom card-stretch gutter-b">
          <div class="card-header border-0 pt-5">
            <h3 class="card-title align-items-start flex-column">
              <span class="card-label font-weight-bolder text-dark">Top Products</span>
              <span class="text-muted mt-3 font-weight-bold font-size-sm">By revenue</span>
            </h3>
          </div>
          <div class="card-body">
            <BarChart
              v-if="!loading && topProductsData.length > 0"
              :series="topProductsData"
              :categories="topProductsCategories"
              :height="300"
              title="Top Products"
            />
            <div
              v-else-if="loading"
              class="d-flex justify-content-center align-items-center"
              style="height: 300px;"
            >
              <div class="spinner-border text-primary" role="status"></div>
            </div>
            <div
              v-else
              class="d-flex justify-content-center align-items-center"
              style="height: 300px;"
            >
              <p class="text-muted">No product data available</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card card-custom">
      <div class="card-header border-0 pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Sales Transactions</span>
          <span class="text-muted mt-3 font-weight-bold font-size-sm">Detailed sales listing</span>
        </h3>
        <div class="card-toolbar">
          <div class="input-group input-group-sm" style="width: 250px;">
            <input
              type="text"
              class="form-control"
              placeholder="Search transactions..."
              v-model="searchQuery"
              @input="searchTransactions"
            />
            <div class="input-group-append">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="card-body">
        <DataTable
          :data="salesData"
          :columns="tableColumns"
          :loading="loading"
          :pagination="pagination"
          @page-change="changePage"
          @sort-change="sortData"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ReportCard from './components/ReportCard.vue';
import ExportButton from './components/ExportButton.vue';
import FilterPanel from './components/FilterPanel.vue';
import DataTable from './components/DataTable.vue';
import LineChart from './components/charts/LineChart.vue';
import BarChart from './components/charts/BarChart.vue';
import { mapActions, mapState } from 'vuex';
import dayjs from '@/core/plugins/dayjs';

export default {
  name: 'SalesReport',
  components: {
    ReportCard,
    ExportButton,
    FilterPanel,
    DataTable,
    LineChart,
    BarChart,
  },
  data() {
    return {
      loading: false,
      searchQuery: '',
      selectedPeriod: 'Last 30 Days',
      filters: {
        startDate: dayjs()
          .subtract(30, 'days')
          .format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
        drugId: '',
        vendorId: '',
        groupBy: 'day',
      },
      filterOptions: {
        drugs: [],
        vendors: [],
        groupByOptions: [
          { value: 'day', label: 'Daily' },
          { value: 'week', label: 'Weekly' },
          { value: 'month', label: 'Monthly' },
        ],
      },
      summaryData: [
        {
          title: 'Total Revenue',
          value: '₦0',
          change: '+0%',
          icon: 'fas fa-money-bill-wave',
          color: 'success',
        },
        {
          title: 'Total Transactions',
          value: '0',
          change: '+0%',
          icon: 'fas fa-receipt',
          color: 'primary',
        },
        {
          title: 'Average Sale',
          value: '₦0',
          change: '+0%',
          icon: 'fas fa-chart-line',
          color: 'info',
        },
        {
          title: 'Top Product',
          value: '-',
          change: '0%',
          icon: 'fas fa-star',
          color: 'warning',
        },
      ],
      chartData: [],
      chartCategories: [],
      topProductsData: [],
      topProductsCategories: [],
      salesData: [],
      tableColumns: [
        { key: 'date', label: 'Date', sortable: true, type: 'date' },
        { key: 'drugName', label: 'Product', sortable: true },
        { key: 'quantity', label: 'Quantity', sortable: true },
        { key: 'unitPrice', label: 'Unit Price', sortable: true, type: 'currency' },
        { key: 'totalAmount', label: 'Total Amount', sortable: true, type: 'currency' },
        { key: 'customerType', label: 'Customer Type', sortable: true },
        { key: 'vendorName', label: 'Vendor', sortable: true },
        { key: 'profit', label: 'Profit', sortable: true, type: 'currency' },
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
      },
    };
  },
  computed: {
    ...mapState('store', ['salesReports']),
  },
  mounted() {
    this.loadReportData();
    this.loadFilterOptions();
  },
  methods: {
    ...mapActions('store', ['fetchSalesReports']),
    async loadReportData() {
      this.loading = true;
      try {
        const params = {
          ...this.filters,
          page: this.pagination.currentPage,
          limit: this.pagination.itemsPerPage,
          search: this.searchQuery,
        };

        await this.fetchSalesReports(params);
        const data = this.salesReports;

        if (data) {
          this.updateSummaryData(data.summary);
          this.processChartData(data.trends || []);
          this.processTopProductsData(data.topProducts || []);
          this.salesData = data.transactions || [];
          this.pagination = {
            ...this.pagination,
            totalPages: data.pagination?.totalPages || 1,
            totalItems: data.pagination?.totalItems || 0,
          };
        }
      } catch (error) {
        this.$toast.error('Failed to load sales report');
      } finally {
        this.loading = false;
      }
    },
    async loadFilterOptions() {
      try {
        // Extract unique drugs and vendors from sales reports data
        if (this.salesReports && this.salesReports.transactions) {
          const transactions = this.salesReports.transactions;

          // Get unique drugs
          const uniqueDrugs = [...new Set(transactions.map(t => t.drugName).filter(Boolean))];
          this.filterOptions.drugs = uniqueDrugs.map(drug => ({
            value: drug,
            label: drug,
          }));

          // Get unique vendors
          const uniqueVendors = [...new Set(transactions.map(t => t.vendorName).filter(Boolean))];
          this.filterOptions.vendors = uniqueVendors.map(vendor => ({
            value: vendor,
            label: vendor,
          }));
        }
      } catch (error) {
        this.$toast.error('Failed to load filter options');
      }
    },
    updateSummaryData(summary) {
      if (!summary) return;

      this.summaryData[0].value = `₦${this.formatNumber(summary.totalRevenue || 0)}`;
      this.summaryData[1].value = summary.totalTransactions?.toString() || '0';
      this.summaryData[2].value = `₦${this.formatNumber(summary.averageSale || 0)}`;
      this.summaryData[3].value = summary.topProduct || '-';

      // Update change percentages if available
      if (summary.changes) {
        this.summaryData[0].change = `${summary.changes.revenue > 0 ? '+' : ''}${
          summary.changes.revenue
        }%`;
        this.summaryData[1].change = `${summary.changes.transactions > 0 ? '+' : ''}${
          summary.changes.transactions
        }%`;
        this.summaryData[2].change = `${summary.changes.averageSale > 0 ? '+' : ''}${
          summary.changes.averageSale
        }%`;
      }
    },
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
    },
    applyFilters() {
      this.pagination.currentPage = 1;
      this.loadReportData();
    },
    resetFilters() {
      this.filters = {
        startDate: dayjs()
          .subtract(30, 'days')
          .format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
        drugId: '',
        vendorId: '',
        groupBy: 'day',
      };
      this.pagination.currentPage = 1;
      this.loadReportData();
    },
    changePeriod(period) {
      this.selectedPeriod = period;
      const days =
        {
          'Last 7 Days': 7,
          'Last 30 Days': 30,
          'Last 3 Months': 90,
          'Last 6 Months': 180,
        }[period] || 30;

      this.filters.startDate = dayjs()
        .subtract(days, 'days')
        .format('YYYY-MM-DD');
      this.filters.endDate = dayjs().format('YYYY-MM-DD');
      this.loadReportData();
    },
    searchTransactions() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.pagination.currentPage = 1;
        this.loadReportData();
      }, 500);
    },
    changePage(page) {
      this.pagination.currentPage = page;
      this.loadReportData();
    },
    sortData(column, direction) {
      this.filters.sortBy = column;
      this.filters.sortDirection = direction;
      this.loadReportData();
    },
    async refreshData() {
      await this.loadReportData();
      this.$toast.success('Sales report refreshed');
    },
    async handleExport(format) {
      try {
        this.loading = true;

        if (format === 'csv') {
          this.exportToCSV();
        } else if (format === 'pdf') {
          this.exportToPDF();
        } else if (format === 'excel') {
          this.exportToExcel();
        }

        this.$toast.success(`Sales report exported as ${format.toUpperCase()}`);
      } catch (error) {
        this.$toast.error('Failed to export report');
      } finally {
        this.loading = false;
      }
    },
    exportToCSV() {
      const headers = [
        'Date',
        'Product',
        'Quantity',
        'Unit Price',
        'Total Amount',
        'Customer Type',
        'Vendor',
        'Profit',
      ];
      const csvContent = [
        headers.join(','),
        ...this.salesData.map(item =>
          [
            item.date || '',
            item.drugName || '',
            item.quantity || 0,
            item.unitPrice || 0,
            item.totalAmount || 0,
            item.customerType || '',
            item.vendorName || '',
            item.profit || 0,
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    exportToPDF() {
      window.print();
    },
    exportToExcel() {
      this.exportToCSV();
    },
    formatNumber(value) {
      return new Intl.NumberFormat('en-NG').format(value);
    },
    processChartData(trends) {
      if (!trends || trends.length === 0) {
        this.chartData = [];
        this.chartCategories = [];
        return;
      }

      this.chartCategories = trends.map(item => item.period || item.date);
      this.chartData = [
        {
          name: 'Revenue',
          data: trends.map(item => item.revenue || item.value || 0),
        },
      ];
    },
    processTopProductsData(topProducts) {
      if (!topProducts || topProducts.length === 0) {
        this.topProductsData = [];
        this.topProductsCategories = [];
        return;
      }

      this.topProductsCategories = topProducts.map(item => item.name || item.product);
      this.topProductsData = [
        {
          name: 'Revenue',
          data: topProducts.map(item => item.revenue || item.value || 0),
        },
      ];
    },
  },
};
</script>

<style scoped>
.sales-report {
  padding: 0;
}

.input-group-sm .form-control {
  height: calc(1.5em + 0.5rem + 2px);
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.2rem;
}

.input-group-sm .input-group-text {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.2rem;
}
</style>
