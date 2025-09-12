<template>
  <div class="d-flex flex-column-fluid">
    <div class="container">
      <!-- Header -->
      <div class="card card-custom mb-8">
        <div class="card-header border-0 pt-5">
          <h3 class="card-title align-items-start flex-column">
            <span class="card-label font-weight-bolder text-dark">Stock Level Reports</span>
            <span class="text-muted mt-3 font-weight-bold font-size-sm">Monitor inventory levels and reorder points</span>
          </h3>
          <div class="card-toolbar">
            <ExportButton 
              :reports="reportData" 
              :filters="filters"
              report-type="stock-levels"
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
                  <span class="text-muted font-weight-bold font-size-sm">Out of Stock</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">{{ summary.outOfStock | number }}</h3>
                  <span class="text-danger font-weight-bold font-size-sm">Critical</span>
                </div>
                <div class="symbol symbol-50 symbol-light-danger">
                  <span class="symbol-label">
                    <i class="fas fa-exclamation-circle text-danger font-size-h4"></i>
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
                  <span class="text-muted font-weight-bold font-size-sm">Low Stock</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">{{ summary.lowStock | number }}</h3>
                  <span class="text-warning font-weight-bold font-size-sm">Reorder Soon</span>
                </div>
                <div class="symbol symbol-50 symbol-light-warning">
                  <span class="symbol-label">
                    <i class="fas fa-exclamation-triangle text-warning font-size-h4"></i>
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
                  <span class="text-muted font-weight-bold font-size-sm">Reorder Point</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">{{ summary.reorderPoint | number }}</h3>
                  <span class="text-info font-weight-bold font-size-sm">Monitor</span>
                </div>
                <div class="symbol symbol-50 symbol-light-info">
                  <span class="symbol-label">
                    <i class="fas fa-chart-line text-info font-size-h4"></i>
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
                  <span class="text-muted font-weight-bold font-size-sm">Adequate Stock</span>
                  <h3 class="text-dark-75 font-weight-bolder font-size-h2 mt-3">{{ summary.adequateStock | number }}</h3>
                  <span class="text-success font-weight-bold font-size-sm">Good</span>
                </div>
                <div class="symbol symbol-50 symbol-light-success">
                  <span class="symbol-label">
                    <i class="fas fa-check-circle text-success font-size-h4"></i>
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
                <span class="card-label font-weight-bolder text-dark">Stock Level Trends</span>
                <span class="text-muted mt-3 font-weight-bold font-size-sm">Inventory levels over time</span>
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
                <span class="card-label font-weight-bolder text-dark">Stock Distribution</span>
                <span class="text-muted mt-3 font-weight-bold font-size-sm">Current status breakdown</span>
              </h3>
            </div>
            <div class="card-body">
              <div v-if="loading" class="d-flex justify-content-center py-10">
                <div class="spinner-border text-primary" role="status"></div>
              </div>
              <apexchart 
                v-else
                type="pie" 
                height="350" 
                :options="chartOptions.distribution" 
                :series="chartData.distribution"
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
                <span class="card-label font-weight-bolder text-dark">Category Stock Analysis</span>
                <span class="text-muted mt-3 font-weight-bold font-size-sm">Stock levels by medication category</span>
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
            <span class="card-label font-weight-bolder text-dark">Stock Level Details</span>
            <span class="text-muted mt-3 font-weight-bold font-size-sm">Complete inventory tracking</span>
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
                  <th class="font-weight-bold text-muted text-uppercase">Current Stock</th>
                  <th class="font-weight-bold text-muted text-uppercase">Reorder Point</th>
                  <th class="font-weight-bold text-muted text-uppercase">Max Stock</th>
                  <th class="font-weight-bold text-muted text-uppercase">Unit Cost</th>
                  <th class="font-weight-bold text-muted text-uppercase">Total Value</th>
                  <th class="font-weight-bold text-muted text-uppercase">Status</th>
                  <th class="font-weight-bold text-muted text-uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredReportData" :key="item.id">
                  <td class="pl-0">
                    <span class="text-dark-75 font-weight-bolder font-size-lg">{{ item.itemName }}</span>
                  </td>
                  <td>
                    <span class="text-muted font-weight-bold">{{ item.category }}</span>
                  </td>
                  <td>
                    <span class="text-dark-75 font-weight-bolder">{{ item.currentStock | number }}</span>
                  </td>
                  <td>
                    <span class="text-muted font-weight-bold">{{ item.reorderPoint | number }}</span>
                  </td>
                  <td>
                    <span class="text-muted font-weight-bold">{{ item.maxStock | number }}</span>
                  </td>
                  <td>
                    <span class="text-dark-75 font-weight-bolder">${{ item.unitCost | currency }}</span>
                  </td>
                  <td>
                    <span class="text-dark-75 font-weight-bolder">${{ item.totalValue | currency }}</span>
                  </td>
                  <td>
                    <span class="label label-lg label-inline" :class="getStatusClass(item.status)">{{ item.status }}</span>
                  </td>
                  <td>
                    <button 
                      v-if="item.status === 'Out of Stock' || item.status === 'Low Stock'"
                      class="btn btn-sm btn-primary"
                      @click="reorderItem(item)"
                    >
                      Reorder
                    </button>
                    <span v-else class="text-muted">-</span>
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
import { mapActions, mapState } from 'vuex'
import FilterPanel from './components/FilterPanel.vue'
import ExportButton from './components/ExportButton.vue'
import VueApexCharts from 'vue-apexcharts'

export default {
  name: 'StockLevelReport',
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
        startDate: '',
        endDate: '',
        category: '',
        stockStatus: ''
      },
      filterOptions: {
        categories: [
          { value: 'antibiotics', label: 'Antibiotics' },
          { value: 'analgesics', label: 'Analgesics' },
          { value: 'vitamins', label: 'Vitamins' },
          { value: 'cardiovascular', label: 'Cardiovascular' }
        ],
        stockStatuses: [
          { value: 'out_of_stock', label: 'Out of Stock' },
          { value: 'low_stock', label: 'Low Stock' },
          { value: 'reorder_point', label: 'At Reorder Point' },
          { value: 'adequate', label: 'Adequate Stock' }
        ],
        allowPresets: true
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
          colors: ['#F64E60', '#FFA800', '#3699FF', '#1BC5BD'],
          xaxis: {
            type: 'datetime'
          },
          yaxis: {
            title: { text: 'Stock Quantity' }
          },
          tooltip: {
            x: { format: 'dd MMM yyyy' }
          },
          markers: {
            size: 4
          }
        },
        distribution: {
          chart: {
            type: 'pie'
          },
          colors: ['#F64E60', '#FFA800', '#3699FF', '#1BC5BD'],
          labels: ['Out of Stock', 'Low Stock', 'Reorder Point', 'Adequate'],
          legend: {
            position: 'bottom'
          }
        },
        categories: {
          chart: {
            type: 'bar',
            toolbar: { show: true }
          },
          colors: ['#3699FF'],
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '55%'
            }
          },
          xaxis: {
            categories: ['Antibiotics', 'Analgesics', 'Vitamins', 'Cardiovascular', 'Others']
          },
          yaxis: {
            title: { text: 'Average Stock Level (%)' }
          }
        }
      }
    }
  },
  computed: {
    ...mapState('store', ['stockLevelReports']),
    
    reportData() {
      return this.stockLevelReports?.items || []
    },
    
    summary() {
      return this.stockLevelReports?.summary || {
        outOfStock: 0,
        lowStock: 0,
        reorderPoint: 0,
        adequateStock: 0
      }
    },
    
    chartData() {
      const reports = this.stockLevelReports
      if (!reports) {
        return {
          trends: [],
          distribution: [],
          categories: []
        }
      }
      
      return {
        trends: reports.trends || [],
        distribution: reports.distribution || [],
        categories: reports.categories || []
      }
    },
    
    filteredReportData() {
      if (!this.searchQuery) return this.reportData
      return this.reportData.filter(item => 
        item.itemName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  mounted() {
    this.loadReportData()
  },
  methods: {
    ...mapActions('store', ['fetchStockLevelReports']),
    
    async loadReportData() {
      this.loading = true
      try {
        await this.fetchStockLevelReports(this.filters)
      } catch (error) {
        this.$toast.error('Failed to load stock level report data')
      } finally {
        this.loading = false
      }
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'Out of Stock': return 'label-danger'
        case 'Low Stock': return 'label-warning'
        case 'Reorder Point': return 'label-info'
        default: return 'label-success'
      }
    },
    
    reorderItem(item) {
      // Handle reorder action - could open reorder modal or navigate to reorder page
      this.$emit('reorder-item', item)
    },
    
    applyFilters(newFilters) {
      this.filters = { ...newFilters }
      this.loadReportData()
    },
    
    savePreset(filters) {
      // Handle saving filter preset
      this.$emit('save-preset', filters)
    },
    
    handleExport(format) {
      this.exportLoading = true
      setTimeout(() => {
        this.exportLoading = false
      }, 2000)
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
  background-color: rgba(54,