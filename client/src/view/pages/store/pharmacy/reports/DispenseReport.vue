<template>
  <div class="d-flex flex-column-fluid">
    <div class="container">
      <!-- Header -->
      <div class="card card-custom mb-8">
        <div class="card-header border-0 pt-5">
          <h3 class="card-title align-items-start flex-column">
            <span class="card-label font-weight-bolder text-dark">Dispense Reports</span>
            <span class="text-muted mt-3 font-weight-bold font-size-sm"
              >Track medication dispensing patterns and trends</span
            >
          </h3>
          <div class="card-toolbar">
            <ExportButton
              :reports="reportData"
              :filters="filters"
              report-type="dispense"
              :loading="exportLoading"
              @export="handleExport"
            />
          </div>
        </div>
      </div>

      <!-- Filters -->
      <FilterPanel
        :filters="filters"
        :filter-options="filterOptions"
        :loading="loading"
        @apply-filters="applyFilters"
        @save-preset="savePreset"
      />

      <!-- Summary Cards -->
      <div class="row mb-8">
        <div class="col-xl-3 col-lg-6 col-md-6 mb-5">
          <div class="card card-custom bg-light-primary">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted font-weight-bold font-size-sm">Total Dispensed</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">
                    {{ summary.totalDispensed | number }}
                  </h3>
                </div>
                <div class="symbol symbol-50 symbol-light-primary">
                  <span class="symbol-label">
                    <i class="fas fa-pills text-primary font-size-h4"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6 mb-5">
          <div class="card card-custom bg-light-success">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted font-weight-bold font-size-sm">Total Value</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">
                    ${{ summary.totalValue | currency }}
                  </h3>
                </div>
                <div class="symbol symbol-50 symbol-light-success">
                  <span class="symbol-label">
                    <i class="fas fa-dollar-sign text-success font-size-h4"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6 mb-5">
          <div class="card card-custom bg-light-warning">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted font-weight-bold font-size-sm">Avg Daily Dispense</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">
                    {{ summary.avgDaily | number }}
                  </h3>
                </div>
                <div class="symbol symbol-50 symbol-light-warning">
                  <span class="symbol-label">
                    <i class="fas fa-chart-line text-warning font-size-h4"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6 mb-5">
          <div class="card card-custom bg-light-info">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted font-weight-bold font-size-sm">Unique Items</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">
                    {{ summary.uniqueItems | number }}
                  </h3>
                </div>
                <div class="symbol symbol-50 symbol-light-info">
                  <span class="symbol-label">
                    <i class="fas fa-list text-info font-size-h4"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="row mb-8">
        <div class="col-xl-8 mb-5">
          <div class="card card-custom">
            <div class="card-header border-0 pt-5">
              <h3 class="card-title align-items-start flex-column">
                <span class="card-label font-weight-bolder text-dark">Dispense Trends</span>
                <span class="text-muted mt-3 font-weight-bold font-size-sm"
                  >Daily dispensing patterns</span
                >
              </h3>
            </div>
            <div class="card-body">
              <div v-if="loading" class="d-flex justify-content-center py-10">
                <div class="spinner-border text-primary" role="status"></div>
              </div>
              <apexchart
                v-else
                type="line"
                height="350"
                :options="chartOptions.trends"
                :series="chartData.trends"
              ></apexchart>
            </div>
          </div>
        </div>
        <div class="col-xl-4 mb-5">
          <div class="card card-custom">
            <div class="card-header border-0 pt-5">
              <h3 class="card-title align-items-start flex-column">
                <span class="card-label font-weight-bolder text-dark">Top Categories</span>
                <span class="text-muted mt-3 font-weight-bold font-size-sm"
                  >By dispense volume</span
                >
              </h3>
            </div>
            <div class="card-body">
              <div v-if="loading" class="d-flex justify-content-center py-10">
                <div class="spinner-border text-primary" role="status"></div>
              </div>
              <apexchart
                v-else
                type="donut"
                height="350"
                :options="chartOptions.categories"
                :series="chartData.categories"
              ></apexchart>
            </div>
          </div>
        </div>
      </div>

      <!-- Department Analysis -->
      <div class="row mb-8">
        <div class="col-12">
          <div class="card card-custom">
            <div class="card-header border-0 pt-5">
              <h3 class="card-title align-items-start flex-column">
                <span class="card-label font-weight-bolder text-dark">Department Analysis</span>
                <span class="text-muted mt-3 font-weight-bold font-size-sm"
                  >Dispensing by department</span
                >
              </h3>
            </div>
            <div class="card-body">
              <div v-if="loading" class="d-flex justify-content-center py-10">
                <div class="spinner-border text-primary" role="status"></div>
              </div>
              <apexchart
                v-else
                type="bar"
                height="400"
                :options="chartOptions.departments"
                :series="chartData.departments"
              ></apexchart>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="card card-custom">
        <div class="card-header border-0 pt-5">
          <h3 class="card-title align-items-start flex-column">
            <span class="card-label font-weight-bolder text-dark">Detailed Dispense Data</span>
            <span class="text-muted mt-3 font-weight-bold font-size-sm"
              >Complete dispensing records</span
            >
          </h3>
          <div class="card-toolbar">
            <div class="input-group input-group-sm" style="width: 250px;">
              <input
                type="text"
                class="form-control"
                placeholder="Search items..."
                v-model="searchQuery"
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
          <div v-if="loading" class="d-flex justify-content-center py-10">
            <div class="spinner-border text-primary" role="status"></div>
          </div>
          <div v-else class="table-responsive">
            <table class="table table-head-custom table-vertical-center">
              <thead>
                <tr class="text-left">
                  <th class="pl-0 font-weight-bold text-muted text-uppercase">Item Name</th>
                  <th class="font-weight-bold text-muted text-uppercase">Category</th>
                  <th class="font-weight-bold text-muted text-uppercase">Department</th>
                  <th class="font-weight-bold text-muted text-uppercase">Quantity</th>
                  <th class="font-weight-bold text-muted text-uppercase">Value</th>
                  <th class="font-weight-bold text-muted text-uppercase">Date</th>
                  <th class="font-weight-bold text-muted text-uppercase">Dispensed By</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredReportData" :key="item.id">
                  <td class="pl-0">
                    <span class="text-dark-75 font-weight-bolder font-size-lg">{{
                      item.itemName
                    }}</span>
                  </td>
                  <td>
                    <span class="text-muted font-weight-bold">{{ item.category }}</span>
                  </td>
                  <td>
                    <span class="text-muted font-weight-bold">{{ item.department }}</span>
                  </td>
                  <td>
                    <span class="text-dark-75 font-weight-bolder">{{
                      item.quantity | number
                    }}</span>
                  </td>
                  <td>
                    <span class="text-dark-75 font-weight-bolder"
                      >${{ item.value | currency }}</span
                    >
                  </td>
                  <td>
                    <span class="text-muted font-weight-bold">{{ item.date | date }}</span>
                  </td>
                  <td>
                    <span class="text-muted font-weight-bold">{{ item.dispensedBy }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FilterPanel from './components/FilterPanel.vue';
import ExportButton from './components/ExportButton.vue';
import VueApexCharts from 'vue-apexcharts';
import { mapActions, mapState } from 'vuex';

export default {
  name: 'DispenseReport',
  components: {
    FilterPanel,
    ExportButton,
    apexchart: VueApexCharts,
  },
  data() {
    return {
      loading: false,
      exportLoading: false,
      searchQuery: '',
      filters: {
        startDate: '',
        endDate: '',
        category: '',
        department: '',
        itemName: '',
      },
      filterOptions: {
        categories: [],
        departments: [],
        showItemSearch: true,
        allowPresets: true,
      },
      summary: {
        totalDispensed: 0,
        totalValue: 0,
        avgDaily: 0,
        uniqueItems: 0,
      },
      reportData: [],
      chartData: {
        trends: [],
        categories: [],
        departments: [],
      },
      chartOptions: {
        trends: {
          chart: {
            type: 'line',
            toolbar: { show: true },
          },
          stroke: {
            curve: 'smooth',
            width: 3,
          },
          colors: ['#3699FF', '#1BC5BD'],
          xaxis: {
            type: 'datetime',
          },
          yaxis: {
            title: { text: 'Quantity Dispensed' },
          },
          tooltip: {
            x: { format: 'dd MMM yyyy' },
          },
        },
        categories: {
          chart: {
            type: 'donut',
          },
          colors: ['#3699FF', '#1BC5BD', '#FFA800', '#F64E60'],
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
        departments: {
          chart: {
            type: 'bar',
            toolbar: { show: true },
          },
          colors: ['#3699FF'],
          plotOptions: {
            bar: {
              horizontal: true,
            },
          },
          xaxis: {
            title: { text: 'Quantity Dispensed' },
          },
        },
      },
    };
  },
  computed: {
    ...mapState('store', ['dispenseReports']),
    filteredReportData() {
      if (!this.searchQuery) return this.reportData;
      return this.reportData.filter(item =>
        item.itemName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  mounted() {
    this.loadReportData();
    this.loadFilterOptions();
  },
  methods: {
    ...mapActions('store', ['fetchDispenseReports']),
    async loadReportData() {
      this.loading = true;
      this.error = null;
      try {
        const filters = {
          startDate: this.filters.startDate,
          endDate: this.filters.endDate,
          category: this.filters.category,
          department: this.filters.department,
          itemName: this.filters.itemName,
        };

        await this.fetchDispenseReports(filters);
        this.reportData = this.dispenseReports || [];

        this.updateChartData();
        this.updateSummary();
        this.loadFilterOptions();
      } catch (error) {
        this.error = 'Failed to load dispense reports. Please try again.';
        this.$toast.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    updateChartData() {
      if (!this.reportData || this.reportData.length === 0) {
        this.chartData.trends = [{ name: 'Daily Dispense', data: [] }];
        this.chartData.categories = [];
        this.chartData.departments = [{ name: 'Quantity', data: [] }];
        return;
      }

      // Process trends chart data (daily dispensed quantities)
      const dailyData = this.reportData.reduce((acc, item) => {
        const date = new Date(item.dispensedDate || item.date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + (item.quantityDispensed || item.quantity || 0);
        return acc;
      }, {});

      const sortedDates = Object.keys(dailyData).sort();
      this.chartData.trends = [
        {
          name: 'Daily Dispense',
          data: sortedDates.map(date => ({ x: date, y: dailyData[date] })),
        },
      ];

      // Process categories chart data (by category or drug type)
      const categoryData = this.reportData.reduce((acc, item) => {
        const category = item.category || item.drugType || 'Other';
        acc[category] = (acc[category] || 0) + (item.quantityDispensed || item.quantity || 0);
        return acc;
      }, {});

      this.chartData.categories = Object.values(categoryData);

      // Process departments chart data (by department or inventory)
      const departmentData = this.reportData.reduce((acc, item) => {
        const dept = item.department || item.inventoryName || 'Unknown';
        acc[dept] = (acc[dept] || 0) + (item.quantityDispensed || item.quantity || 0);
        return acc;
      }, {});

      this.chartData.departments = [
        {
          name: 'Quantity',
          data: Object.entries(departmentData).map(([name, value]) => ({ x: name, y: value })),
        },
      ];
    },

    loadFilterOptions() {
      if (!this.dispenseReports || this.dispenseReports.length === 0) return;

      // Extract unique categories from dispense reports
      const categories = [
        ...new Set(this.dispenseReports.map(item => item.category || item.drugType || 'Other')),
      ]
        .filter(Boolean)
        .map(category => ({
          value: category.toLowerCase().replace(/\s+/g, '_'),
          label: category,
        }));

      // Extract unique departments from dispense reports
      const departments = [
        ...new Set(
          this.dispenseReports.map(item => item.department || item.inventoryName || 'Unknown')
        ),
      ]
        .filter(dept => dept !== 'Unknown')
        .map(department => ({
          value: department.toLowerCase().replace(/\s+/g, '_'),
          label: department,
        }));

      this.filterOptions.categories = categories;
      this.filterOptions.departments = departments;
    },

    updateSummary() {
      if (!this.reportData || this.reportData.length === 0) {
        this.summary = {
          totalDispensed: 0,
          totalValue: 0,
          avgDaily: 0,
          uniqueItems: 0,
        };
        return;
      }

      const totalDispensed = this.reportData.reduce(
        (sum, item) => sum + (item.quantityDispensed || item.quantity || 0),
        0
      );

      const totalValue = this.reportData.reduce(
        (sum, item) =>
          sum +
          (item.quantityDispensed || item.quantity || 0) *
            (item.unitPrice || item.sellingPrice || 0),
        0
      );

      const uniqueItems = new Set(
        this.reportData.map(item => item.drugName || item.itemName || item.id)
      ).size;

      const dateRange = this.getDateRangeDays();
      const avgDaily = dateRange > 0 ? Math.round(totalDispensed / dateRange) : 0;

      this.summary = {
        totalDispensed,
        totalValue: parseFloat(totalValue.toFixed(2)),
        avgDaily,
        uniqueItems,
      };
    },

    getDateRangeDays() {
      if (!this.filters.dateRange.start || !this.filters.dateRange.end) return 0;
      const start = new Date(this.filters.dateRange.start);
      const end = new Date(this.filters.dateRange.end);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    },

    applyFilters(newFilters) {
      this.filters = { ...newFilters };
      this.loadReportData();
    },

    async savePreset(filters) {
      try {
        const presetData = {
          name: `Dispense Report - ${new Date().toLocaleDateString()}`,
          filters: this.filters,
          type: 'dispense_report',
        };

        // Store preset in localStorage for now
        const existingPresets = JSON.parse(localStorage.getItem('reportPresets') || '[]');
        existingPresets.push({ ...presetData, id: Date.now() });
        localStorage.setItem('reportPresets', JSON.stringify(existingPresets));

        this.$toast.success('Preset saved successfully');
      } catch (error) {
        this.$toast.error(`Failed to save preset, ${error.message} ${filters}`);
      }
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

        this.$toast.success(`Report exported as ${format.toUpperCase()}`);
      } catch (error) {
        this.$toast.error('Failed to export report');
      } finally {
        this.loading = false;
      }
    },

    exportToCSV() {
      const headers = [
        'Drug Name',
        'Batch Number',
        'Quantity Dispensed',
        'Unit Price',
        'Total Amount',
        'Dispensed To',
        'Dispensed By',
        'Date',
        'Inventory',
      ];
      const csvContent = [
        headers.join(','),
        ...this.filteredReportData.map(item =>
          [
            item.drugName || item.itemName || '',
            item.batchNumber || '',
            item.quantityDispensed || item.quantity || 0,
            item.unitPrice || item.sellingPrice || 0,
            item.totalAmount ||
              (item.quantityDispensed || item.quantity || 0) *
                (item.unitPrice || item.sellingPrice || 0),
            item.dispensedTo || '',
            item.dispensedBy || '',
            item.dispensedDate || item.date || '',
            item.inventoryName || item.department || '',
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dispense-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },

    exportToPDF() {
      // Basic PDF export implementation
      window.print();
    },

    exportToExcel() {
      // For now, export as CSV with .xlsx extension
      this.exportToCSV();
    },
  },
  filters: {
    number(value) {
      return new Intl.NumberFormat().format(value);
    },
    currency(value) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    },
    date(value) {
      return new Date(value).toLocaleDateString();
    },
  },
};
</script>

<style scoped>
.card-custom {
  box-shadow: 0 0 20px 0 rgba(76, 87, 125, 0.2);
}

.symbol {
  display: flex;
  align-items: center;
  justify-content: center;
}

.table th {
  border-top: none;
  border-bottom: 1px solid #ebedf3;
  padding: 1rem 0.75rem;
}

.table td {
  border-top: 1px solid #ebedf3;
  padding: 1rem 0.75rem;
}

.bg-light-primary {
  background-color: rgba(54, 153, 255, 0.1) !important;
}

.bg-light-success {
  background-color: rgba(27, 197, 189, 0.1) !important;
}

.bg-light-warning {
  background-color: rgba(255, 168, 0, 0.1) !important;
}

.bg-light-info {
  background-color: rgba(24, 180, 255, 0.1) !important;
}
</style>
