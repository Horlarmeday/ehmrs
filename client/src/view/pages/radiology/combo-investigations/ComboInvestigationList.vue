<template>
  <div>
    <div class="card card-custom gutter-b">
      <!--begin::Header-->
      <div class="card-header py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">
            <i class="fas fa-layer-group mr-2 text-primary"></i>
            Combo Investigations Management
          </span>
          <span class="text-muted mt-2"
            >Manage radiology investigation combinations for quick ordering</span
          >
        </h3>
        <div class="card-toolbar">
          <button class="btn btn-primary font-weight-bolder" @click="showCreateModal">
            <i class="fas fa-plus mr-2"></i>
            Create Combo Investigation
          </button>
        </div>
      </div>

      <div class="card-body">
        <!-- Search and Filter -->
        <div class="row mb-5">
          <div class="col-lg-6">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text">
                  <i class="fas fa-search"></i>
                </span>
              </div>
              <input
                type="text"
                class="form-control"
                placeholder="Search combo investigations..."
                v-model="searchQuery"
                @input="handleSearch"
              />
            </div>
          </div>
        </div>

        <!-- Combo Investigations Table -->
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center">
            <thead>
              <tr>
                <th class="pl-7">
                  <span class="text-dark-75">Name</span>
                </th>
                <th>Investigations Included</th>
                <th>Total Price</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="comboInvestigation in comboInvestigations" :key="comboInvestigation.id">
                <td class="pl-7">
                  <span class="font-weight-bold text-dark-75">{{ comboInvestigation.name }}</span>
                </td>
                <td>
                  <span
                    class="badge badge-light-primary mr-1"
                    v-for="item in comboInvestigation.comboInvestigationItems"
                    :key="item.id"
                  >
                    {{ item.investigation?.name }}
                  </span>
                </td>
                <td>
                  <span class="font-weight-bold">{{ formatCurrency(calculateTotalPrice(comboInvestigation)) }}</span>
                </td>
                <td>
                  <span v-if="comboInvestigation.staff">
                    {{ comboInvestigation.staff.firstname }} {{ comboInvestigation.staff.lastname }}
                  </span>
                </td>
                <td>
                  <span
                    :class="comboInvestigation.is_active ? 'badge badge-success' : 'badge badge-danger'"
                  >
                    {{ comboInvestigation.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="pr-0 text-right">
                  <button
                    class="btn btn-sm btn-clean btn-icon mr-2"
                    title="View Details"
                    @click="viewComboInvestigation(comboInvestigation)"
                  >
                    <i class="fas fa-eye text-primary"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-clean btn-icon mr-2"
                    title="Edit"
                    @click="editComboInvestigation(comboInvestigation)"
                  >
                    <i class="fas fa-edit text-info"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-clean btn-icon"
                    title="Delete"
                    @click="confirmDelete(comboInvestigation)"
                  >
                    <i class="fas fa-trash text-danger"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="!comboInvestigations || comboInvestigations.length === 0">
                <td colspan="6" class="text-center text-muted py-5">
                  No combo investigations found. Click "Create Combo Investigation" to add one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center mt-5" v-if="totalPages > 1">
          <div class="text-muted">
            Showing {{ comboInvestigations.length }} of {{ totalComboInvestigations }} combo
            investigations
          </div>
          <b-pagination
            v-model="currentPage"
            :total-rows="totalComboInvestigations"
            :per-page="itemsPerPage"
            @change="handlePageChange"
            class="mb-0"
          ></b-pagination>
        </div>
      </div>
    </div>

    <!-- Combo Investigation Form Modal -->
    <combo-investigation-form
      v-if="showModal"
      :combo-investigation="selectedComboInvestigation"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script>
import ComboInvestigationForm from './ComboInvestigationForm.vue';
import Swal from 'sweetalert2';

export default {
  name: 'ComboInvestigationList',
  components: { ComboInvestigationForm },
  data() {
    return {
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 20,
      showModal: false,
      selectedComboInvestigation: null,
      searchTimeout: null,
    };
  },
  computed: {
    comboInvestigations() {
      return this.$store.state.radiology.comboInvestigations;
    },
    totalComboInvestigations() {
      return this.$store.state.radiology.totalComboInvestigations;
    },
    totalPages() {
      return this.$store.state.radiology.totalComboInvestigationsPages;
    },
  },
  methods: {
    fetchComboInvestigations() {
      this.$store.dispatch('radiology/fetchComboInvestigations', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.searchQuery,
      });
    },

    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.fetchComboInvestigations();
      }, 500);
    },

    handlePageChange(page) {
      this.currentPage = page;
      this.fetchComboInvestigations();
    },

    calculateTotalPrice(comboInvestigation) {
      if (!comboInvestigation.comboInvestigationItems || comboInvestigation.comboInvestigationItems.length === 0)
        return 0;
      const total = comboInvestigation.comboInvestigationItems.reduce((sum, item) => {
        return sum + (parseFloat(item.investigation?.price) || 0);
      }, 0);
      return total;
    },

    formatCurrency(price) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(price);
    },

    showCreateModal() {
      this.selectedComboInvestigation = null;
      this.showModal = true;
    },

    viewComboInvestigation(comboInvestigation) {
      this.selectedComboInvestigation = { ...comboInvestigation, viewMode: true };
      this.showModal = true;
    },

    editComboInvestigation(comboInvestigation) {
      this.selectedComboInvestigation = { ...comboInvestigation };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.selectedComboInvestigation = null;
    },

    handleSaved() {
      this.closeModal();
      this.fetchComboInvestigations();
      this.$bvToast.toast('Combo investigation saved successfully', {
        title: 'Success',
        variant: 'success',
        solid: true,
      });
    },

    confirmDelete(comboInvestigation) {
      Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to delete "${comboInvestigation.name}"? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        heightAuto: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteComboInvestigation(comboInvestigation.id);
        }
      });
    },

    deleteComboInvestigation(id) {
      this.$store
        .dispatch('radiology/deleteComboInvestigation', id)
        .then(() => {
          this.$bvToast.toast('Combo investigation deleted successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
          this.fetchComboInvestigations();
        })
        .catch((error) => {
          this.$bvToast.toast(
            error.response?.data?.message || 'Failed to delete combo investigation',
            {
              title: 'Error',
              variant: 'danger',
              solid: true,
            }
          );
        });
    },
  },
  created() {
    this.fetchComboInvestigations();
  },
};
</script>

<style scoped>
.badge-light-primary {
  background-color: #e1f0ff;
  color: #3699ff;
}
</style>
