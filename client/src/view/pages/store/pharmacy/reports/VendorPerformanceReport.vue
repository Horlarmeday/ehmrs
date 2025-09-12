<template>
  <div class="d-flex flex-column-fluid">
    <div class="container">
      <!-- Header -->
      <div class="card card-custom mb-8">
        <div class="card-header border-0 pt-5">
          <h3 class="card-title align-items-start flex-column">
            <span class="card-label font-weight-bolder text-dark">Vendor Performance Reports</span>
            <span class="text-muted mt-3 font-weight-bold font-size-sm">Analyze vendor delivery and quality metrics</span>
          </h3>
          <div class="card-toolbar">
            <ExportButton 
              :reports="reportData" 
              :filters="filters"
              report-type="vendor-performance"
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

      <!-- Performance Cards -->
      <div class="row mb-8">
        <div class="col-xl-3 col-lg-6 col-md-6 mb-5">
          <div class="card card-custom bg-light-success">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted font-weight-bold font-size-sm">On-Time Delivery</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">{{ summary.onTimeDelivery }}%</h3>
                  <span class="text-success font-weight-bold font-size-sm">Average Rate</span>
                </div>
                <div class="symbol symbol-50 symbol-light-success">
                  <span class="symbol-label">
                    <i class="fas fa-truck text-success font-size-h4"></i>
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
                  <span class="text-muted font-weight-bold font-size-sm">Quality Score</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">{{ summary.qualityScore }}/10</h3>
                  <span class="text-info font-weight-bold font-size-sm">Average Rating</span>
                </div>
                <div class="symbol symbol-50 symbol-light-info">
                  <span class="symbol-label">
                    <i class="fas fa-star text-info font-size-h4"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6 mb-5">
          <div class="card card-custom bg-light-primary">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted font-weight-bold font-size-sm">Total Orders</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">{{ summary.totalOrders | number }}</h3>
                  <span class="text-primary font-weight-bold font-size-sm">This Period</span>
                </div>
                <div class="symbol symbol-50 symbol-light-primary">
                  <span class="symbol-label">
                    <i class="fas fa-shopping-cart text-primary font-size-h4"></i>
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
                  <span class="text-muted font-weight-bold font-size-sm">Total Value</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">${{ summary.totalValue | currency }}</h3>
                  <span class="text-warning font-weight-bold font-size-sm">Procurement</span>
                </div>
                <div class="symbol symbol-50 symbol-light-warning">
                  <span class="symbol-label">
                    <i class="fas fa-dollar-sign text-warning font-size-h4"></i>
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
                <span class="card-label font-weight-bolder text-dark">Vendor Performance Trends</span>
                <span class="text-muted mt-3 font-weight-bold font-size-sm">Delivery and quality metrics over time</span>
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
                <span class="card-label font-weight-bolder text-dark">Top Vendors</span>
                <span class="text-muted mt-3 font-weight-bold font-size-sm">By order volume</span>
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
                :options="chartOptions.vendors" 
                :series="chartData.vendors"
              ></apexchart>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Comparison -->
      <div class="row mb-8">
        <div class="col-12">
          <div class="card card-custom">
            <div class="card-header border-0 pt-5">
              <h3 class="card-title align-items-start flex-column">
                <span class="card-label font-weight-bolder text-dark">Vendor Performance Comparison</span>
                <span class="text-muted mt-3 font-weight-bold font-size-sm">Delivery time vs Quality score</span>
              </h3>
            </div>
            <div class="card-body">
              <div v-if="loading" class="d-flex justify-content-center py-10">
                <div class="spinner-border text-primary" role="status"></div>
              </div>
              <apexchart 
                v-else
                type="scatter" 
                height="400" 
                :options="chartOptions.comparison" 
                :series="chartData.comparison"
              ></apexchart>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="card card-custom">
        <div class="card-header border-0 pt-5">
          <h3 class="card-title align-items-start flex-column">
            <span class="card-label font-weight-bolder text-dark">Vendor Performance Details</span>
            <span class="text-muted mt-3 font-weight-bold font-size-sm">Complete vendor analysis</span>
          </h3>
          <div class="card-toolbar">
            <div class="input-group input-group-sm" style="width: 250px;">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search vendors..."
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
                  <th class="pl-0 font-weight-bold text-muted text-uppercase">Vendor Name</th>
                  <th class="font-weight-bold text-muted text-uppercase">Total Orders</th>
                  <th class="font-weight-bold text-muted text-uppercase">On-Time %</th>
                  <th class="font-weight-bold text-muted text-uppercase">Avg Delivery Days</th>
                  <th class="font-weight-bold text-muted text-uppercase">Quality Score</th>
                  <th class="font-weight-bold text-muted text-uppercase">Total Value</th>
                  <th class="font-weight-bold text-muted text-uppercase">Last Order</th>
                  <th class="font-weight-bold text-muted text-uppercase">Performance</th>
                  <th class="font-weight-bold text-muted text-uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="vendor in filteredReportData" :key="vendor.id">
                  <td class="pl-0">
                    <div class="d-flex align-items-center">
                      <div class="symbol symbol-40 symbol-light-primary mr-4">
                        <span class="symbol-label font-size-h4 font-weight-bold">{{ vendor.name.charAt(0) }}</span>
                      </div>
                      <div>
                        <span class="text-dark-75 font-weight-bolder font-size-lg d-block">{{ vendor.name }}</span>
                        <span class="text-muted font-weight-bold font-size-sm">{{ vendor.contact }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="text-dark-75 font-weight-bolder">{{ vendor.totalOrders | number }}</span>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <span class="text-dark-75 font-weight-bolder mr-2">{{ vendor.onTimePercentage }}%</span>
                      <div class="progress progress-xs w-50px">
                        <div class="progress-bar" :class="getPerformanceClass(vendor.onTimePercentage)" :style="{width: vendor.onTimePercentage + '%'}"></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="text-muted font-weight-bold">{{ vendor.avgDeliveryDays }} days</span>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <span class="text-dark-75 font-weight-bolder mr-2">{{ vendor.qualityScore }}/10</span>
                      <div class="rating">
                        <i v-for="star in 5" :key="star" class="fas fa-star" :class="star <= (vendor.qualityScore / 2) ? 'text-warning' : 'text-muted'"></i>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="text-dark-75 font-weight-bolder">${{ vendor.totalValue | currency }}</span>
                  </td>
                  <td>
                    <span class="text-muted font-weight-bold">{{ vendor.lastOrderDate | date }}</span>
                  </td>
                  <td>
                    <span class="label label-lg label-inline" :class="getOverallPerformanceClass(vendor.overallScore)">{{ vendor.performance }}</span>
                  </td>
                  <td>
                    <div class="dropdown dropdown-inline">
                      <button class="btn btn-sm btn-clean btn-icon" data-toggle="dropdown">
                        <i class="fas fa-ellipsis-v"></i>
                      </button>
                      <div class="dropdown-menu dropdown-menu-right">
                        <a class="dropdown-item" href="#" @click="viewVendorDetails(vendor)">View Details</a>
                        <a class="dropdown-item" href="#" @click="contactVendor(vendor)">Contact Vendor</a>
                        <a class="dropdown-item" href="#" @click="createOrder(vendor)">Create Order</a>
                      </div>
                    </div>
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
  name: 'VendorPerformanceReport',
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
        vendor: '',
        performanceLevel: ''
      },
      filterOptions: {
        vendors: [
          { value: 'pharma_plus', label: 'Pharma Plus Ltd' },
          { value: 'medico_supply', label: 'Medico Supply Co' },
          { value: 'health_distributors', label: 'Health Distributors Inc' },
          { value: 'global_pharma', label: 'Global Pharma Solutions' }
        ],
        performanceLevels: [
          { value: 'excellent', label: 'Excellent (90%+)' },
          { value: 'good', label: 'Good (75-89%)' },
          { value: 'average', label: 'Average (60-74%)' },
          { value: 'poor', label: 'Poor (<60%)' }
        ],
        allowPresets: true
      },
      summary: {
        onTimeDelivery: 0,
        qualityScore: 0,
        totalOrders: 0,
        totalValue: 0
      },
      reportData: [],
      chartData: {
        trends: [],
        vendors: [],
        comparison: []
      },
      chartOptions: {
        trends: {
          chart: {
            type: 'line',
            toolbar: { show: true }
          },
          stroke: {
            curve: 'smooth',
            width: 3
          },
          colors: ['#3699FF', '#1BC5BD'],
          xaxis: {
            type: 'datetime'
          },
          yaxis: [
            {
              title: { text: 'On-Time Delivery (%)' },
              min: 0,
              max: 100
            },
            {
              opposite: true,
              title: { text: 'Quality Score' },
              min: 0,
              max: 10
            }
          ],
          tooltip: {
            x: { format: 'dd MMM yyyy' }
          },
          markers: {
            size: 4
          }
        },
        vendors: {
          chart: {
            type: 'donut'
          },
          colors: ['#3699FF', '#1BC5BD', '#FFA800', '#F64E60', '#8950FC'],
          labels: ['Pharma Plus', 'Medico Supply', 'Health Distributors', 'Global Pharma', 'Others'],
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
        comparison: {
          chart: {
            type: 'scatter',
            toolbar: { show: true }
          },
          colors: ['#3699FF'],
          xaxis: {
            title: { text: 'Average Delivery Days' },
            min: 0
          },
          yaxis: {
            title: { text: 'Quality Score' },
            min: 0,
            max: 10
          },
          tooltip: {
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
              const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex]
              return `<div class="p-2">
                <strong>${data.vendor}</strong><br/>
                Delivery: ${data.x} days<br/>
                Quality: ${data.y}/10
              </div>`
            }
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      vendorPerformanceReports: 'vendorPerformanceReports',
    }),
    filteredReportData() {
      if (!this.searchQuery) return this.reportData
      return this.reportData.filter(vendor => 
        vendor.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        vendor.contact.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  mounted() {
    this.loadReportData()
  },
  methods: {
    ...mapActions({
      fetchVendorPerformanceReports: 'fetchVendorPerformanceReports',
    }),
    async loadReportData() {
      this.loading = true
      try {
        const params = {
          ...this.filters,
          search: this.searchQuery,
        };
        
        await this.fetchVendorPerformanceReports(params);
        const data = this.vendorPerformanceReports;
        
        if (data) {
          this.updateSummaryData(data.summary);
          this.reportData = data.vendors || [];
          this.updateCharts(data);
        }
      } catch (error) {
        this.$toast.error('Failed to load vendor performance data');
      } finally {
        this.loading = false
      }
    },
    
    updateSummaryData(summary) {
      if (!summary) return;
      
      this.summary = {
        onTimeDelivery: summary.onTimeDelivery || 0,
        qualityScore: summary.qualityScore || 0,
        totalOrders: summary.totalOrders || 0,
        totalValue: summary.totalValue || 0
      };
    },
    updateCharts(data) {
      if (!data) return;
      
      // Update trends chart with real data
      this.chartData.trends = data.trends || [];
      
      // Update vendors donut chart with real data
      this.chartData.vendors = data.vendorDistribution || [];
      
      // Update comparison scatter chart with real data
      this.chartData.comparison = data.comparison || [{
        name: 'Vendors',
        data: this.reportData.map(vendor => ({
          x: vendor.avgDeliveryDays || 0,
          y: vendor.qualityScore || 0,
          vendor: vendor.name || 'Unknown'
        }))
      }];
    },
    
    applyFilters(newFilters) {
      this.filters = { ...newFilters }
      this.loadReportData()
    },
    
    savePreset(preset) {
      try {
        const presetData = {
          name: `Vendor Performance - ${dayjs().format('YYYY-MM-DD')}`,
          filters: { ...this.filters },
          timestamp: dayjs().toISOString()
        };
        
        const savedPresets = JSON.parse(localStorage.getItem('vendorPerformancePresets') || '[]');
        savedPresets.push(presetData);
        localStorage.setItem('vendorPerformancePresets', JSON.stringify(savedPresets));
        
        this.$toast.success('Filter preset saved successfully');
      } catch (error) {
        this.$toast.error('Failed to save preset');
      }
    },
    
    async handleExport(format) {
      this.exportLoading = true
      try {
        const exportData = {
          summary: this.summary,
          vendors: this.reportData,
          filters: this.filters,
          exportDate: dayjs().format('YYYY-MM-DD HH:mm:ss')
        };
        
        switch (format) {
          case 'csv':
            this.exportToCSV(exportData);
            break;
          case 'pdf':
            this.exportToPDF(exportData);
            break;
          case 'excel':
            this.exportToExcel(exportData);
            break;
          default:
            this.$toast.error('Unsupported export format');
        }
        
        this.$toast.success(`Vendor performance report exported as ${format.toUpperCase()}`);
      } catch (error) {
        this.$toast.error('Export failed')
      } finally {
        this.exportLoading = false
      }
    },
    
    exportToCSV(data) {
      const headers = ['Vendor Name', 'Contact', 'Total Orders', 'On-Time %', 'Avg Delivery Days', 'Quality Score', 'Total Value', 'Performance'];
      const rows = data.vendors.map(vendor => [
        vendor.name,
        vendor.contact,
        vendor.totalOrders,
        vendor.onTimePercentage,
        vendor.avgDeliveryDays,
        vendor.qualityScore,
        vendor.totalValue,
        vendor.performance
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendor-performance-${dayjs().format('YYYY-MM-DD')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    
    exportToPDF(data) {
      // Implementation would require a PDF library like jsPDF
      this.$toast.info('PDF export functionality to be implemented');
    },
    
    exportToExcel(data) {
      // Implementation would require a library like xlsx
      this.$toast.info('Excel export functionality to be implemented');
    },
    
    getPerformanceClass(percentage) {
      if (percentage >= 90) return 'bg-success'
      if (percentage >= 75) return 'bg-primary'
      if (percentage >= 60) return 'bg-warning'
      return 'bg-danger'
    },
    
    getOverallPerformanceClass(score) {
      if (score >= 90) return 'label-success'
      if (score >= 75) return 'label-primary'
      if (score >= 60) return 'label-warning'
      return 'label-danger'
    },
    
    viewVendorDetails(vendor) {
      console.log('Viewing vendor details:', vendor)
      // Navigate to vendor details page
    },
    
    contactVendor(vendor) {
      console.log('Contacting vendor:', vendor)
      // Open contact modal or navigate to contact page
    },
    
    createOrder(vendor) {
      console.log('Creating order for vendor:', vendor)
      // Navigate to create order page
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
.rating .fa-star {
  font-size: 12px;
}

.progress-xs {
  height: 4px;
}

.symbol-label {
  font-size: 14px;
}

.table th {
  border-top: none;
  font-size: 12px;
}

.table td {
  vertical-align: middle;
}

.dropdown-toggle::after {
  display: none;
}
</style>