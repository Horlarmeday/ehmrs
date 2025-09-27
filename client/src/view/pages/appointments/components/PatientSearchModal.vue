<template>
  <div
    class="modal fade"
    id="patientSearchModal"
    tabindex="-1"
    role="dialog"
    ref="patientSearchModal"
  >
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Search Patient</h5>
          <button
            type="button"
            class="close"
            data-dismiss="modal"
            aria-label="Close"
            @click="closeModal"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <!-- Search Form -->
          <div class="form-group mb-4">
            <label>Search Patient</label>
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                v-model="searchTerm"
                @input="searchPatients"
                @keypress.enter="searchPatients"
                placeholder="Enter patient name, hospital ID, or phone number"
              />
              <div class="input-group-append">
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="searchPatients"
                  :disabled="loading"
                >
                  <i class="fas fa-search" v-if="!loading"></i>
                  <i class="fas fa-spinner fa-spin" v-else></i>
                  Search
                </button>
              </div>
            </div>
            <small class="form-text text-muted">
              Search by name, hospital ID, or phone number
            </small>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Searching patients...</p>
          </div>

          <!-- No Results -->
          <div v-else-if="searchPerformed && patients.length === 0" class="text-center py-4">
            <i class="fas fa-search text-muted fa-3x mb-3"></i>
            <h6 class="text-muted">No patients found</h6>
            <p class="text-muted mb-0">Try adjusting your search terms</p>
          </div>

          <!-- Search Results -->
          <div v-else-if="patients.length > 0">
            <h6 class="mb-3">Search Results ({{ patients.length }})</h6>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th>Hospital ID</th>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>Age</th>
                    <th>Phone</th>
                    <th>Insurance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="patient in patients"
                    :key="patient.id"
                    class="cursor-pointer"
                    @dblclick="selectPatient(patient)"
                  >
                    <td>
                      <span
                        v-b-tooltip.hover
                        :title="patient?.insurances?.[0]?.insurance?.name || 'No Insurance'"
                        class="label label-dot label-sm mr-2"
                        :class="getPatientDotStatus(patient?.insurances?.[0]?.insurance?.name)"
                      ></span>
                      <strong>{{ patient.hospital_id || 'N/A' }}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{{ patient.fullname }}</strong>
                        <br />
                        <small class="text-muted">{{ patient.email || 'No email' }}</small>
                      </div>
                    </td>
                    <td>{{ patient.gender }}</td>
                    <td>
                      <span v-if="patient.date_of_birth">
                        {{ patient.date_of_birth | dayjs('from', 'now', true) }}
                      </span>
                      <span v-else class="text-muted">N/A</span>
                    </td>
                    <td>{{ patient.phone || 'N/A' }}</td>
                    <td>
                      <span
                        v-if="patient?.insurances?.[0]?.insurance?.name"
                        class="badge badge-info badge-sm"
                      >
                        {{ patient.insurances[0].insurance.name }}
                      </span>
                      <span v-else class="text-muted">None</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        class="btn btn-sm btn-primary"
                        @click="selectPatient(patient)"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="d-flex justify-content-center">
              <nav aria-label="Patient search pagination">
                <ul class="pagination pagination-sm">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                      Previous
                    </a>
                  </li>
                  <li
                    v-for="page in visiblePages"
                    :key="page"
                    class="page-item"
                    :class="{ active: page === currentPage }"
                  >
                    <a class="page-link" href="#" @click.prevent="changePage(page)">
                      {{ page }}
                    </a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                      Next
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <!-- Initial State -->
          <div v-else class="text-center py-5">
            <i class="fas fa-user-search text-muted fa-3x mb-3"></i>
            <h6 class="text-muted">Search for a patient</h6>
            <p class="text-muted mb-0">Enter patient details in the search box above</p>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
          <router-link to="/patient/create" class="btn btn-success">
            <i class="fas fa-user-plus mr-1"></i>
            Create New Patient
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'PatientSearchModal',
  data() {
    return {
      searchTerm: '',
      searchPerformed: false,
      patients: [],
      loading: false,
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      searchTimeout: null,
    };
  },
  computed: {
    ...mapState('appointments', ['showPatientModal']),

    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  watch: {
    showPatientModal(show) {
      if (show) {
        this.openModal();
      } else {
        this.closeModal();
      }
    },
  },
  methods: {
    ...mapActions('appointments', ['hidePatientModal']),

    openModal() {
      this.$nextTick(() => {
        this.$refs.patientSearchModal.modal('show');
      });
    },

    closeModal() {
      this.$refs.patientSearchModal.modal('hide');
      this.hidePatientModal();
      this.resetModal();
    },

    resetModal() {
      this.searchTerm = '';
      this.searchPerformed = false;
      this.patients = [];
      this.currentPage = 1;
      this.totalPages = 1;
    },

    searchPatients() {
      if (!this.searchTerm.trim()) return;

      // Clear existing timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Debounce search
      this.searchTimeout = setTimeout(() => {
        this.performSearch();
      }, 300);
    },

    async performSearch() {
      this.loading = true;
      this.searchPerformed = true;

      try {
        const response = await this.$store.dispatch('patient/fetchPatients', {
          currentPage: this.currentPage,
          itemsPerPage: this.itemsPerPage,
          search: this.searchTerm.trim(),
        });

        this.patients = response.data.data.docs;
        this.totalPages = response.data.data.pages;
      } catch (error) {
        console.error('Error searching patients:', error);
        this.$swal({
          icon: 'error',
          title: 'Search Failed',
          text: 'Failed to search patients. Please try again.',
        });
      } finally {
        this.loading = false;
      }
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page;
        this.performSearch();
      }
    },

    selectPatient(patient) {
      this.$emit('patient-selected', patient);
      this.closeModal();
    },

    getPatientDotStatus(insuranceName) {
      if (!insuranceName || insuranceName.toLowerCase().includes('private')) {
        return 'label-warning'; // Orange for private/no insurance
      }
      if (insuranceName.toLowerCase().includes('nhis')) {
        return 'label-success'; // Green for NHIS
      }
      if (insuranceName.toLowerCase().includes('hmo')) {
        return 'label-info'; // Blue for HMO
      }
      return 'label-secondary'; // Gray for others
    },
  },

  // Setup modal events
  mounted() {
    this.$refs.patientSearchModal.on('hidden.bs.modal', () => {
      this.hidePatientModal();
      this.resetModal();
    });
  },

  beforeDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.$refs.patientSearchModal.modal('hide');
  },
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.label-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.modal-lg {
  max-width: 900px;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.badge-sm {
  font-size: 0.75em;
  padding: 0.25em 0.5em;
}

.pagination-sm .page-link {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
