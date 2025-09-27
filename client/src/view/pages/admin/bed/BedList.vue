<template>
  <div class="bed-list">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Bed Management</h2>
        <p class="text-muted mb-0">Manage all hospital beds and view statistics</p>
      </div>
      <div class="d-flex align-items-center">
        <button class="btn btn-primary mr-2" @click="addNewBed">
          <i class="fas fa-plus mr-2"></i>
          Add New Bed
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <BedStats :stats="bedStats" class="mb-4" />

    <!-- Search and Filters -->
    <BedFilters
      :searchTerm="searchTerm"
      :selectedWard="selectedWard"
      :selectedType="selectedType"
      :selectedStatus="selectedStatus"
      :wards="wards"
      @update:searchTerm="searchTerm = $event"
      @update:selectedWard="selectedWard = $event"
      @update:selectedType="selectedType = $event"
      @update:selectedStatus="selectedStatus = $event"
      @clearFilters="clearFilters"
      class="mb-4"
    />

    <!-- Main Content -->
    <div class="card card-custom gutter-b">
      <div class="card-header">
        <div class="card-title">
          <h3 class="card-label">
            Beds
            <small v-if="filteredBeds.length !== beds.length">
              ({{ filteredBeds.length }} of {{ beds.length }} beds)
            </small>
          </h3>
        </div>
      </div>
      <div class="card-body">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading beds...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          {{ error }}
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredBeds.length === 0" class="text-center py-5">
          <i class="fas fa-bed text-muted" style="font-size: 3rem"></i>
          <h4 class="mt-3 text-muted">No beds found</h4>
          <p class="text-muted">
            <span v-if="searchTerm || selectedWard || selectedType || selectedStatus">
              Try adjusting your search criteria
            </span>
            <span v-else> No beds have been created yet </span>
          </p>
        </div>

        <!-- Beds Grid -->
        <div v-else class="row">
          <div v-for="bed in paginatedBeds" :key="bed.id" class="col-lg-3 col-md-4 col-sm-6 mb-3">
            <BedCard :bed="bed" :ward="getWardById(bed.ward_id)" @edit="editBed" />
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredBeds.length > pageSize" class="d-flex justify-content-center mt-4">
          <nav>
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="previousPage">
                  <i class="fas fa-chevron-left"></i>
                </a>
              </li>
              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <a class="page-link" href="#" @click.prevent="goToPage(page)">
                  {{ page }}
                </a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="nextPage">
                  <i class="fas fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Create/Edit Bed Modal -->
    <CreateBed
      :displayPrompt="showCreateModal"
      :data="selectedBed"
      :isEdit="isEditMode"
      @closeModal="closeModal"
      @bedSaved="onBedSaved"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import CreateBed from './CreateBed.vue';
import BedStats from './components/BedStats.vue';
import BedFilters from './components/BedFilters.vue';
import BedCard from './components/BedCard.vue';

export default {
  name: 'BedList',
  components: {
    CreateBed,
    BedStats,
    BedFilters,
    BedCard,
  },
  data() {
    return {
      // Search and filter data
      searchTerm: '',
      selectedWard: '',
      selectedType: '',
      selectedStatus: '',

      // Pagination
      currentPage: 1,
      pageSize: 12,

      // Modal state
      showCreateModal: false,
      selectedBed: null,
      isEditMode: false,

      // State
      loading: false,
      error: null,
    };
  },
  computed: {
    ...mapState('model', ['beds', 'wards']),

    // Filter beds based on search criteria
    filteredBeds() {
      let filtered = this.beds || [];

      // Search by bed code
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (bed) =>
            bed.code.toLowerCase().includes(term) || bed.bed_type.toLowerCase().includes(term)
        );
      }

      // Filter by ward
      if (this.selectedWard) {
        filtered = filtered.filter((bed) => bed.ward_id == this.selectedWard);
      }

      // Filter by bed type
      if (this.selectedType) {
        filtered = filtered.filter((bed) => bed.bed_type === this.selectedType);
      }

      // Filter by status
      if (this.selectedStatus) {
        filtered = filtered.filter((bed) => bed.status === this.selectedStatus);
      }

      return filtered;
    },

    // Paginated beds
    paginatedBeds() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredBeds.slice(start, end);
    },

    // Calculate total pages
    totalPages() {
      return Math.ceil(this.filteredBeds.length / this.pageSize);
    },

    // Calculate bed statistics
    bedStats() {
      const total = this.beds.length;
      const available = this.beds.filter((bed) => bed.status === 'Untaken').length;
      const occupied = this.beds.filter((bed) => bed.status === 'Taken').length;

      return {
        total,
        available,
        occupied,
        utilization: total > 0 ? Math.round((occupied / total) * 100) : 0,
      };
    },
  },
  async created() {
    await this.loadData();
  },
  methods: {
    ...mapActions('model', ['fetchWards', 'fetchAllBeds']),

    async loadData() {
      this.loading = true;
      this.error = null;

      try {
        // Load wards and beds in parallel
        await Promise.all([
          this.fetchWards({
            currentPage: 1,
            itemsPerPage: 100,
          }),
          this.fetchAllBeds(),
        ]);
      } catch (error) {
        this.error = 'Failed to load bed data. Please try again.';
        console.error('Error loading bed data:', error);
      } finally {
        this.loading = false;
      }
    },

    getWardById(wardId) {
      return this.wards.find((ward) => ward.id == wardId) || { name: 'Unknown Ward' };
    },

    addNewBed() {
      this.selectedBed = null;
      this.isEditMode = false;
      this.showCreateModal = true;
    },

    editBed(bed) {
      this.selectedBed = bed;
      this.isEditMode = true;
      this.showCreateModal = true;
    },

    closeModal() {
      this.showCreateModal = false;
      this.selectedBed = null;
      this.isEditMode = false;
    },

    onBedSaved() {
      this.closeModal();
      this.loadData(); // Reload data to show updated bed
    },

    clearFilters() {
      this.searchTerm = '';
      this.selectedWard = '';
      this.selectedType = '';
      this.selectedStatus = '';
      this.currentPage = 1;
    },

    // Pagination methods
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
  },
};
</script>

<style scoped>
.bed-list {
  padding: 20px;
}

.card-custom {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination .page-link {
  border-radius: 4px;
  margin: 0 2px;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>
