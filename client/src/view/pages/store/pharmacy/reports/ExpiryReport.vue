<template>
  <div class="d-flex flex-column-fluid">
    <div class="container">
      <!-- Header -->
      <div class="card card-custom mb-8">
        <div class="card-header border-0 pt-5">
          <h3 class="card-title align-items-start flex-column">
            <span class="card-label font-weight-bolder text-dark">Expiry Reports</span>
            <span class="text-muted mt-3 font-weight-bold font-size-sm">Monitor medication expiry dates and waste management</span>
          </h3>
          <div class="card-toolbar">
            <ExportButton 
              :reports="reportData" 
              :filters="filters"
              report-type="expiry"
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

      <!-- Alert Cards -->
      <div class="row mb-8">
        <div class="col-xl-3 col-lg-6 col-md-6 mb-5">
          <div class="card card-custom bg-light-danger">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted font-weight-bold font-size-sm">Expired Items</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">{{ summary.expiredItems | number }}</h3>
                  <span class="text-danger font-weight-bold font-size-sm">Immediate Action Required</span>
                </div>
                <div class="symbol symbol-50 symbol-light-danger">
                  <span class="symbol-label">
                    <i class="fas fa-exclamation-triangle text-danger font-size-h4"></i>
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
                  <span class="text-muted font-weight-bold font-size-sm">Expiring Soon (30 days)</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">{{ summary.expiringSoon | number }}</h3>
                  <span class="text-warning font-weight-bold font-size-sm">Action Needed</span>
                </div>
                <div class="symbol symbol-50 symbol-light-warning">
                  <span class="symbol-label">
                    <i class="fas fa-clock text-warning font-size-h4"></i>
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
                  <span class="text-muted font-weight-bold font-size-sm">Expiring in 90 days</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">{{ summary.expiring90Days | number }}</h3>
                  <span class="text-info font-weight-bold font-size-sm">Monitor Closely</span>
                </div>
                <div class="symbol symbol-50 symbol-light-info">
                  <span class="symbol-label">
                    <i class="fas fa-calendar-alt text-info font-size-h4"></i>
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
                  <span class="text-muted font-weight-bold font-size-sm">Waste Value</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">${{ summary.wasteValue | currency }}</h3>
                  <span class="text-success font-weight-bold font-size-sm">This Month</span>
                </div>
                <div class="symbol symbol-50 symbol-light-success">
                  <span class="symbol-label">
                    <i class="fas fa-trash-alt text-success font-size-h4"></i>
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
                <span class="card-label font-weight-bolder text-dark">Expiry Timeline</span>
                <span class="text-muted mt-3 font-weight-bold font-size-sm">Items expiring over time</span>
              </h3>
            </div>
            <div class="card-body">
              <div v-if="loading" class="d-flex justify-content-center py-10">
                <div class="spinner-border text-primary" role="status"></div>
              </div>
              <apexchart 
                v-else
                type="area" 
                height="350" 
                :options="chartOptions.timeline" 
                :series="chartData.timeline"
              ></apexchart>
            </div>
          </div>
        </div>
        <div class="col-xl-4 mb-5">
          <div class="card card-custom">
            <div class="card-header border-0 pt-5">
              <h3 class="card-title align-items-start flex-column">
                <span class="card-label font-weight-bolder text-dark">Expiry Status</span>
                <span class="text-muted mt-3 font-weight-bold font-size-sm">Current distribution</span>
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
                :options="chartOptions.status" 
                :series="chartData.status"
              ></apexchart>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Analysis -->
      <div class="row mb-8">
        <div class="col-12">
          <div class="card card-custom">
            <div class="card-header border-0 pt-5">
              <h3 class="card-title align-items-start flex-column">
                <span class="card-label font-weight-bolder text-dark">Category Expiry Analysis</span>
                <span class="text-muted mt-3 font-weight-bold font-size-sm">Expiry patterns by medication category</span>
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
                :options="chartOptions.categories" 
                :series="chartData.categories"
              ></apexchart>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="card card-custom">
        <div class="card-header border-0 pt-5">
          <h3 class="card-title align-items-start flex-column">
            <span class="card-label font-weight-bolder text-dark">Expiry Details</span>
            <span class="text-muted mt-3 font-weight-bold font-size-sm">Complete expiry tracking</span>
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
                  <th class="font-weight-bold text-muted text-uppercase">Batch No</th>
                  <th class="font-weight-bold text-muted text-uppercase">Category</th>
                  <th class="font-weight-bold text-muted text-uppercase">Quantity</th>
                  <th class="font-weight-bold text-muted text-uppercase">Expiry Date</th>
                  <th class="font-weight-bold text-muted text-uppercase">Days Left</th>
                  <th class="font-weight-bold text-muted text-uppercase">Value</th>
                  <th class="font-weight-bold text-muted text-uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredReportData" :key="item.id">
                  <td class="pl-0">
                    <span class="text-dark-75 font-weight-bolder font-size-lg">{{ item.itemName }}</span>
                  </td>
                  <td>
                    <span class="text-muted font-weight-bold">{{ item.batchNo }}</span>
                  </td>
                  <td>
                    <span class="text-muted font-weight-bold">{{ item.category }}</span>
                  </td>
                  <td>
                    <span class="text-dark-75 font-weight-bolder">{{ item.quantity | number }}</span>
                  </td>
                  <td>
                    <span class="text-muted font-weight-bold">{{ item.expiryDate | date }}</span>
                  </td>
                  <td>
                    <span :class="getDaysLeftClass(item.daysLeft)">{{ item.daysLeft }}</span>
                  </td>
                  <td>
                    <span class="text-dark-75 font-weight-bolder">${{ item.value | currency }}</span>
                  </td>
                  <td>
                    <span class="label label-lg label-inline" :class="getStatusClass(item.status)">{{ item.status }}</span>
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
import FilterPanel from './components/FilterPanel.vue'
import ExportButton from './components/ExportButton.vue'
import VueApexCharts from 'vue-apexcharts'
import { mapActions, mapGetters } from 'vuex'
import dayjs from '@/core/plugins/dayjs'

export default {
  name: 'ExpiryReport',
  components: {
    FilterPanel,
    ExportButton,
    apexchart: VueApexCharts
  },
  data() {
    return {
      loading: false,
      exportLoading: false,
      searchQuery: '',
      filters: {
        startDate: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
        category: '',
        expiryStatus: ''
      },
      filterOptions: {
        categories: [
          { value: 'antibiotics', label: 'Antibiotics' },
          { value: 'analgesics', label: 'Analgesics' },
          { value: 'vitamins', label: 'Vitamins' },
          { value: 'cardiovascular', label: 'Cardiovascular' }
        ],
        expiryStatuses: [
          { value: 'expired', label: 'Expired' },
          { value: 'expiring_30', label: 'Expiring in 30 days' },
          { value: 'expiring_90', label: 'Expiring in 90 days' },
          { value: 'good', label: 'Good (>90 days)' }
        ],
        allowPresets: true
      },
      summary: {
        expiredItems: 0,
        expiringSoon: 0,
        expiring90Days: 0,
        wasteValue: 0
      },
      reportData: [],
      chartData: {
        timeline: [],
        status: [],
        categories: []
      },
      chartOptions: {
        timeline: {
          chart: {
            type: 'area',
            toolbar: { show: true }
          },
          stroke: {
            curve: 'smooth',
            width: 2
          },
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.7,
              opacityTo: 0.3
            }
          },
          colors: ['#F64E60', '#FFA800', '#3699FF'],
          xaxis: {
            type: 'datetime'
          },
          yaxis: {
            title: { text: 'Number of Items' }
          },
          tooltip: {
            x: { format: 'dd MMM yyyy' }
          }
        },
        status: {
          chart: {
            type: 'donut'
          },
          colors: ['#F64E60', '#FFA800', '#3699FF', '#1BC5BD'],
          labels: ['Expired', 'Expiring Soon', 'Expiring (90 days)', 'Good'],
          legend: {
            position: 'bottom'
          },
          plotOptions: {
            pie: {
              donut: {
                size: '70%'
              }
            }
          }
        },
        categories: {
          chart: {
            type: 'bar',
            toolbar: { show: true },
            stacked: true
          },
          colors: ['#F64E60', '#FFA800', '#3699FF', '#1BC5BD'],
          plotOptions: {
            bar: {
              horizontal: false
            }
          },
          xaxis: {
            categories: ['Antibiotics', 'Analgesics', 'Vitamins', 'Cardiovascular', 'Others']
          },
          yaxis: {
            title: { text: 'Number of Items' }
          },
          legend: {
            position: 'top'
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      expiryReports: 'getExpiryReports',
    }),
    filteredReportData() {
      const data = this.reportData || [];
      if (!this.searchQuery) return data
      return data.filter(item => 
        item.itemName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.batchNo.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  mounted() {
    this.loadReportData()
  },
  methods: {
    ...mapActions({
      fetchExpiryReports: 'fetchExpiryReports',
    }),
    async loadReportData() {
      this.loading = true
      try {
        const params = {
          ...this.filters,
          search: this.searchQuery,
        };
        
        await this.fetchExpiryReports(params);
        const data = this.expiryReports;
        
        if (data) {
          this.updateSummaryData(data.summary);
          this.reportData = data.items || [];
          this.updateChartData(data);
        }
      } catch (error) {
        this.$toast.error('Failed to load expiry report');
      } finally {
        this.loading = false
      }
    },
    
    updateSummaryData(summary) {
      if (!summary) return;
      
      this.summary = {
        expiredItems: summary.expiredItems || 0,
        expiringSoon: summary.expiringSoon || 0,
        expiring90Days: summary.expiring90Days || 0,
        wasteValue: summary.wasteValue || 0
      };
    },
    updateChartData(data) {
      if (!data) return;
      
      // Update timeline chart with real data
      this.chartData.timeline = data.timeline || [];
      
      // Update status chart with real data
      this.chartData.status = data.statusDistribution || [0, 0, 0, 0];
      
      // Update categories chart with real data
      this.chartData.categories = data.categoryAnalysis || [];
    },
    
    getDaysLeftClass(daysLeft) {
      if (daysLeft < 0) return 'text-danger font-weight-bolder'
      if (daysLeft <= 30) return 'text-warning font-weight-bolder'
      if (daysLeft <= 90) return 'text-info font-weight-bolder'
      return 'text-success font-weight-bolder'
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'Expired': return 'label-danger'
        case 'Expiring Soon': return 'label-warning'
        case 'Expiring (90 days)': return 'label-info'
        default: return 'label-success'
      }
    },
    
    applyFilters(newFilters) {
      this.filters = { ...newFilters }
      this.loadReportData()
    },
    
    savePreset(filters) {
      try {
        const presets = JSON.parse(localStorage.getItem('expiryReportPresets') || '[]');
        const presetName = `Preset ${presets.length + 1}`;
        presets.push({ name: presetName, filters });
        localStorage.setItem('expiryReportPresets', JSON.stringify(presets));
        this.$toast.success('Filter preset saved successfully');
      } catch (error) {
        this.$toast.error('Failed to save preset');
      }
    },
    
    async handleExport(format) {
      try {
        this.exportLoading = true;
        
        if (format === 'csv') {
          this.exportToCSV();
        } else if (format === 'pdf') {
          this.exportToPDF();
        } else if (format === 'excel') {
          this.exportToExcel();
        }
        
        this.$toast.success(`Expiry report exported as ${format.toUpperCase()}`);
      } catch (error) {
        this.$toast.error('Failed to export report');
      } finally {
        this.exportLoading = false;
      }
    },
    exportToCSV() {
      const headers = ['Item Name', 'Batch No', 'Category', 'Quantity', 'Expiry Date', 'Days Left', 'Value', 'Status'];
      const csvContent = [
        headers.join(','),
        ...this.reportData.map(item => [
          item.itemName || '',
          item.batchNo || '',
          item.category || '',
          item.quantity || 0,
          item.expiryDate || '',
          item.daysLeft || 0,
          item.value || 0,
          item.status || ''
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expiry-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    exportToPDF() {
      window.print();
    },
    exportToExcel() {
      this.exportToCSV();
    }
  },
  filters: {
    number(value) {
      return new Intl.NumberFormat().format(value)
    },
    currency(value) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)
    },
    date(value) {
      return new Date(value).toLocaleDateString()
    }
  }
}
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
  border-bottom: 1px solid #EBEDF3;
  padding: 1rem 0.75rem;
}

.table td {
  border-top: 1px solid #EBEDF3;
  padding: 1rem 0.75rem;
}

.bg-light-danger {
  background-color: rgba(246, 78, 96, 0.1) !important;
}

.bg-light-warning {
  background-color: rgba(255, 168, 0, 0.1) !important;
}

.bg-light-info {
  background-color: rgba(54, 153, 255, 0.1) !important;
}

.bg-light-success {
  background-color: rgba(27, 197, 189, 0.1) !important;
}

.label {
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.label-danger {
  background-color: #F64E60;
  color: white;
}

.label-warning {
  background-color: #FFA800;
  color: white;
}

.label-info {
  background-color: #3699FF;
  color: white;
}

.label-success {
  background-color: #1BC5BD;
  color: white;
}
</style>