<template>
  <div class="bed-filters card">
    <div class="card-body">
      <div class="row align-items-end">
        <!-- Search Input -->
        <div class="col-lg-4 col-md-6 mb-3">
          <label class="form-label">Search Beds</label>
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
            </div>
            <input
              v-model="localSearchTerm"
              type="text"
              class="form-control"
              placeholder="Search by bed code or type..."
              @input="onSearchInput"
            />
          </div>
        </div>

        <!-- Ward Filter -->
        <div class="col-lg-2 col-md-6 mb-3">
          <label class="form-label">Ward</label>
          <select v-model="localSelectedWard" class="form-control" @change="onWardChange">
            <option value="">All Wards</option>
            <option v-for="ward in wards" :key="ward.id" :value="ward.id">
              {{ ward.name }}
            </option>
          </select>
        </div>

        <!-- Bed Type Filter -->
        <div class="col-lg-2 col-md-6 mb-3">
          <label class="form-label">Bed Type</label>
          <select v-model="localSelectedType" class="form-control" @change="onTypeChange">
            <option value="">All Types</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Normal">Normal</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="col-lg-2 col-md-6 mb-3">
          <label class="form-label">Status</label>
          <select v-model="localSelectedStatus" class="form-control" @change="onStatusChange">
            <option value="">All Status</option>
            <option value="Untaken">Available</option>
            <option value="Taken">Occupied</option>
          </select>
        </div>

        <!-- Filter Actions -->
        <div class="col-lg-2 col-md-6 mb-3">
          <label class="form-label">&nbsp;</label>
          <div class="d-flex">
            <button
              class="btn btn-outline-secondary mr-2"
              @click="clearFilters"
              title="Clear all filters"
            >
              <i class="fas fa-times"></i>
            </button>
            <button
              class="btn btn-outline-primary"
              @click="toggleFilters"
              :title="showAdvancedFilters ? 'Hide advanced filters' : 'Show advanced filters'"
            >
              <i class="fas" :class="showAdvancedFilters ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Advanced Filters (Collapsible) -->
      <div v-show="showAdvancedFilters" class="advanced-filters mt-3 pt-3 border-top">
        <div class="row">
          <div class="col-lg-3 col-md-6 mb-3">
            <label class="form-label">Sort By</label>
            <select v-model="sortBy" class="form-control">
              <option value="code">Bed Code</option>
              <option value="bed_type">Bed Type</option>
              <option value="status">Status</option>
              <option value="ward">Ward</option>
            </select>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <label class="form-label">Sort Order</label>
            <select v-model="sortOrder" class="form-control">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <label class="form-label">View Mode</label>
            <div class="btn-group w-100" role="group">
              <button
                type="button"
                class="btn"
                :class="viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'"
                @click="setViewMode('grid')"
              >
                <i class="fas fa-th"></i>
              </button>
              <button
                type="button"
                class="btn"
                :class="viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'"
                @click="setViewMode('list')"
              >
                <i class="fas fa-list"></i>
              </button>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-3">
            <label class="form-label">Items Per Page</label>
            <select v-model="itemsPerPage" class="form-control">
              <option value="12">12 per page</option>
              <option value="24">24 per page</option>
              <option value="48">48 per page</option>
              <option value="96">96 per page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BedFilters',
  props: {
    searchTerm: {
      type: String,
      default: '',
    },
    selectedWard: {
      type: [String, Number],
      default: '',
    },
    selectedType: {
      type: String,
      default: '',
    },
    selectedStatus: {
      type: String,
      default: '',
    },
    wards: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      localSearchTerm: this.searchTerm,
      localSelectedWard: this.selectedWard,
      localSelectedType: this.selectedType,
      localSelectedStatus: this.selectedStatus,
      showAdvancedFilters: false,
      sortBy: 'code',
      sortOrder: 'asc',
      viewMode: 'grid',
      itemsPerPage: 12,
      searchTimeout: null,
    };
  },
  watch: {
    searchTerm(newVal) {
      this.localSearchTerm = newVal;
    },
    selectedWard(newVal) {
      this.localSelectedWard = newVal;
    },
    selectedType(newVal) {
      this.localSelectedType = newVal;
    },
    selectedStatus(newVal) {
      this.localSelectedStatus = newVal;
    },
  },
  methods: {
    onSearchInput() {
      // Debounce search input
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.$emit('update:searchTerm', this.localSearchTerm);
      }, 300);
    },

    onWardChange() {
      this.$emit('update:selectedWard', this.localSelectedWard);
    },

    onTypeChange() {
      this.$emit('update:selectedType', this.localSelectedType);
    },

    onStatusChange() {
      this.$emit('update:selectedStatus', this.localSelectedStatus);
    },

    clearFilters() {
      this.localSearchTerm = '';
      this.localSelectedWard = '';
      this.localSelectedType = '';
      this.localSelectedStatus = '';

      this.$emit('update:searchTerm', '');
      this.$emit('update:selectedWard', '');
      this.$emit('update:selectedType', '');
      this.$emit('update:selectedStatus', '');
      this.$emit('clearFilters');
    },

    toggleFilters() {
      this.showAdvancedFilters = !this.showAdvancedFilters;
    },

    setViewMode(mode) {
      this.viewMode = mode;
      this.$emit('view-mode-changed', mode);
    },
  },
  beforeDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
};
</script>

<style scoped>
.bed-filters {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.form-control {
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.advanced-filters {
  background-color: #f8f9fa;
  border-radius: 4px;
}

.btn-group .btn {
  border-radius: 4px;
}

.btn-group .btn:first-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.btn-group .btn:last-child {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
