<template>
  <div class="inventory-report">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-8">
      <div>
        <h1 class="text-dark font-weight-bold mb-3">Inventory Analysis Report</h1>
        <p class="text-muted">Comprehensive inventory tracking and stock level analysis</p>
      </div>
      <div class="d-flex">
        <button class="btn btn-light-primary mr-3" @click="refreshData">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
        <ExportButton
          :reports="[{ name: 'Inventory Report', type: 'inventory' }]"
          :filters="filters"
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
              <span class="card-label font-weight-bolder text-dark">Inventory Value Trend</span>
              <span class="text-muted mt-3 font-weight-bold font-size-sm"
                >Monthly inventory value changes</span
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
              title="Inventory Value"
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
              <p class="text-muted">No data available for the selected period</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card card-custom card-stretch gutter-b">
          <div class="card-header border-0 pt-5">
            <h3 class="card-title align-items-start flex-column">
              <span class="card-label font-weight-bolder text-dark">Stock Distribution</span>
              <span class="text-muted mt-3 font-weight-bold font-size-sm">By category</span>
            </h3>
          </div>
          <div class="card-body">
            <BarChart
              v-if="!loading && categoryData.length > 0"
              :series="categoryData"
              :categories="categoryCategories"
              :height="300"
              title="Stock by Category"
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
              <p class="text-muted">No category data available</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card card-custom">
      <div class="card-header border-0 pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Inventory Items</span>
          <span class="text-muted mt-3 font-weight-bold font-size-sm"
            >Detailed inventory listing</span
          >
        </h3>
        <div class="card-toolbar">
          <div class="input-group input-group-sm" style="width: 250px;">
            <input
              type="text"
              class="form-control"
              placeholder="Search items..."
              v-model="searchQuery"
              @input="searchItems"
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
        <DataTable :data="inventoryItems" :columns="tableColumns" />
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
  name: 'InventoryReport',
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
        category: '',
        vendor: '',
        stockStatus: '',
      },
      filterOptions: {
        categories: [],
        vendors: [],
        stockStatuses: [
          { value: 'in_stock', label: 'In Stock' },
          { value: 'low_stock', label: 'Low Stock' },
          { value: 'out_of_stock', label: 'Out of Stock' },
        ],
      },
      summaryData: [
        {
          title: 'Total Items',
          value: '0',
          change: '+0%',
          icon: 'fas fa-boxes',
          color: 'primary',
        },
        {
          title: 'Total Value',
          value: '₦0',
          change: '+0%',
          icon: 'fas fa-money-bill-wave',
          color: 'success',
        },
        {
          title: 'Low Stock Items',
          value: '0',
          change: '0%',
          icon: 'fas fa-exclamation-triangle',
          color: 'warning',
        },
        {
          title: 'Out of Stock',
          value: '0',
          change: '0%',
          icon: 'fas fa-times-circle',
          color: 'danger',
        },
      ],
      chartData: [],
      chartCategories: [],
      categoryData: [],
      categoryCategories: [],
      inventoryItems: [],
      tableColumns: [
        { key: 'name', label: 'Item Name', sortable: true },
        { key: 'category', label: 'Category', sortable: true },
        { key: 'quantity', label: 'Quantity', sortable: true },
        { key: 'unit_price', label: 'Unit Price', sortable: true, type: 'currency' },
        { key: 'total_value', label: 'Total Value', sortable: true, type: 'currency' },
        { key: 'vendor', label: 'Vendor', sortable: true },
        { key: 'expiry_date', label: 'Expiry Date', sortable: true, type: 'date' },
        { key: 'status', label: 'Status', sortable: true },
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
    ...mapState('store', ['inventoryReports']),
  },
  mounted() {
    this.loadReportData();
    this.loadFilterOptions();
  },
  methods: {
    ...mapActions('store', ['fetchInventoryReports']),
    async loadReportData() {
      this.loading = true;
      try {
        const params = {
          ...this.filters,
          page: this.pagination.currentPage,
          limit: this.pagination.itemsPerPage,
          search: this.searchQuery,
        };

        await this.fetchInventoryReports(params);
        const data = this.inventoryReports;

        if (data) {
          this.updateSummaryData(data.summary);
          this.processChartData(data.trends || []);
          this.processCategoryData(data.categoryDistribution || []);
          this.inventoryItems = data.items || [];
          this.pagination = {
            ...this.pagination,
            totalPages: data.pagination?.totalPages || 1,
            totalItems: data.pagination?.totalItems || 0,
          };
        }
      } catch (error) {
        this.$toast.error('Failed to load inventory report');
      } finally {
        this.loading = false;
      }
    },
    async loadFilterOptions() {
      try {
        // Load categories and vendors from the inventory reports data
        const reportData = this.inventoryReports;
        if (reportData && reportData.filterOptions) {
          this.filterOptions.categories = reportData.filterOptions.categories || [];
          this.filterOptions.vendors = reportData.filterOptions.vendors || [];
        }
      } catch (error) {
        this.$toast.error('Failed to load filter options');
      }
    },
    updateSummaryData(summary) {
      if (!summary) return;

      this.summaryData[0].value = summary.totalItems?.toString() || '0';
      this.summaryData[1].value = `₦${this.formatNumber(summary.totalValue || 0)}`;
      this.summaryData[2].value = summary.lowStockItems?.toString() || '0';
      this.summaryData[3].value = summary.outOfStockItems?.toString() || '0';
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
        category: '',
        vendor: '',
        stockStatus: '',
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
    searchItems() {
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
      this.$toast.success('Inventory report refreshed');
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
          name: 'Inventory Value',
          data: trends.map(item => item.value || 0),
        },
      ];
    },
    processCategoryData(categoryDistribution) {
      if (!categoryDistribution || categoryDistribution.length === 0) {
        this.categoryData = [];
        this.categoryCategories = [];
        return;
      }

      this.categoryCategories = categoryDistribution.map(item => item.category || item.name);
      this.categoryData = [
        {
          name: 'Stock Count',
          data: categoryDistribution.map(item => item.count || item.value || 0),
        },
      ];
    },
  },
};
</script>

<style scoped>
.inventory-report {
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
