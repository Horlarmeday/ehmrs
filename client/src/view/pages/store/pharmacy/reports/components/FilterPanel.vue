<template>
  <div class="card card-custom mb-8">
    <div class="card-header border-0 pt-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Filters</span>
        <span class="text-muted mt-3 font-weight-bold font-size-sm">Customize your report data</span>
      </h3>
      <div class="card-toolbar">
        <button 
          class="btn btn-icon btn-sm btn-light-primary" 
          @click="toggleCollapse"
          :class="{ 'collapsed': isCollapsed }"
        >
          <i class="fas fa-chevron-up" v-if="!isCollapsed"></i>
          <i class="fas fa-chevron-down" v-else></i>
        </button>
      </div>
    </div>
    <div class="card-body" v-show="!isCollapsed">
      <form @submit.prevent="applyFilters">
        <div class="row">
          <!-- Date Range -->
          <div class="col-lg-3 col-md-6 mb-5">
            <label class="form-label font-weight-bold">Start Date</label>
            <input
              type="date"
              class="form-control"
              v-model="localFilters.startDate"
              :max="localFilters.endDate"
            />
          </div>
          <div class="col-lg-3 col-md-6 mb-5">
            <label class="form-label font-weight-bold">End Date</label>
            <input
              type="date"
              class="form-control"
              v-model="localFilters.endDate"
              :min="localFilters.startDate"
              :max="maxDate"
            />
          </div>

          <!-- Category Filter -->
          <div class="col-lg-3 col-md-6 mb-5" v-if="filterOptions.categories">
            <label class="form-label font-weight-bold">Category</label>
            <select class="form-control" v-model="localFilters.category">
              <option value="">All Categories</option>
              <option 
                v-for="category in filterOptions.categories" 
                :key="category.value" 
                :value="category.value"
              >
                {{ category.label }}
              </option>
            </select>
          </div>

          <!-- Vendor Filter -->
          <div class="col-lg-3 col-md-6 mb-5" v-if="filterOptions.vendors">
            <label class="form-label font-weight-bold">Vendor</label>
            <select class="form-control" v-model="localFilters.vendor">
              <option value="">All Vendors</option>
              <option 
                v-for="vendor in filterOptions.vendors" 
                :key="vendor.value" 
                :value="vendor.value"
              >
                {{ vendor.label }}
              </option>
            </select>
          </div>

          <!-- Stock Status Filter -->
          <div class="col-lg-3 col-md-6 mb-5" v-if="filterOptions.stockStatuses">
            <label class="form-label font-weight-bold">Stock Status</label>
            <select class="form-control" v-model="localFilters.stockStatus">
              <option value="">All Status</option>
              <option 
                v-for="status in filterOptions.stockStatuses" 
                :key="status.value" 
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

          <!-- Item Name Filter -->
          <div class="col-lg-3 col-md-6 mb-5" v-if="filterOptions.showItemSearch">
            <label class="form-label font-weight-bold">Item Name</label>
            <input
              type="text"
              class="form-control"
              v-model="localFilters.itemName"
              placeholder="Search by item name..."
            />
          </div>

          <!-- Expiry Status Filter -->
          <div class="col-lg-3 col-md-6 mb-5" v-if="filterOptions.expiryStatuses">
            <label class="form-label font-weight-bold">Expiry Status</label>
            <select class="form-control" v-model="localFilters.expiryStatus">
              <option value="">All Items</option>
              <option 
                v-for="status in filterOptions.expiryStatuses" 
                :key="status.value" 
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

          <!-- Department Filter -->
          <div class="col-lg-3 col-md-6 mb-5" v-if="filterOptions.departments">
            <label class="form-label font-weight-bold">Department</label>
            <select class="form-control" v-model="localFilters.department">
              <option value="">All Departments</option>
              <option 
                v-for="dept in filterOptions.departments" 
                :key="dept.value" 
                :value="dept.value"
              >
                {{ dept.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="row mt-5">
          <div class="col-12">
            <div class="d-flex justify-content-between">
              <div>
                <button 
                  type="button" 
                  class="btn btn-light-primary mr-3"
                  @click="resetFilters"
                >
                  <i class="fas fa-undo mr-2"></i>
                  Reset Filters
                </button>
                <button 
                  type="button" 
                  class="btn btn-light-info"
                  @click="saveAsPreset"
                  v-if="filterOptions.allowPresets"
                >
                  <i class="fas fa-save mr-2"></i>
                  Save as Preset
                </button>
              </div>
              <div>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm mr-2"></span>
                  <i v-else class="fas fa-filter mr-2"></i>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterPanel',
  props: {
    filters: {
      type: Object,
      default: () => ({})
    },
    filterOptions: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isCollapsed: false,
      localFilters: { ...this.filters },
      maxDate: new Date().toISOString().split('T')[0]
    }
  },
  watch: {
    filters: {
      handler(newFilters) {
        this.localFilters = { ...newFilters }
      },
      deep: true
    }
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },
    applyFilters() {
      this.$emit('apply-filters', { ...this.localFilters })
    },
    resetFilters() {
      this.localFilters = {
        startDate: '',
        endDate: '',
        category: '',
        vendor: '',
        stockStatus: '',
        itemName: '',
        expiryStatus: '',
        department: ''
      }
      this.$emit('apply-filters', { ...this.localFilters })
    },
    saveAsPreset() {
      this.$emit('save-preset', { ...this.localFilters })
    }
  }
}
</script>

<style scoped>
.card-custom {
  box-shadow: 0 0 20px 0 rgba(76, 87, 125, 0.2);
}

.btn.collapsed {
  transform: rotate(180deg);
}

.form-label {
  color: #3F4254;
  font-size: 0.9rem;
}

.form-control:focus {
  border-color: #3699FF;
  box-shadow: 0 0 0 0.2rem rgba(54, 153, 255, 0.25);
}

.btn-light-primary {
  background-color: rgba(54, 153, 255, 0.1);
  border-color: rgba(54, 153, 255, 0.2);
  color: #3699FF;
}

.btn-light-primary:hover {
  background-color: rgba(54, 153, 255, 0.2);
  border-color: rgba(54, 153, 255, 0.3);
}

.btn-light-info {
  background-color: rgba(24, 180, 255, 0.1);
  border-color: rgba(24, 180, 255, 0.2);
  color: #18B4FF;
}

.btn-light-info:hover {
  background-color: rgba(24, 180, 255, 0.2);
  border-color: rgba(24, 180, 255, 0.3);
}
</style>