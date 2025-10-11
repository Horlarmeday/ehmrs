<template>
  <div>
    <div class="card card-custom gutter-b">
      <!--begin::Header-->
      <div class="card-header py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">
            <i class="fas fa-layer-group mr-2 text-primary"></i>
            Combo Tests Management
          </span>
          <span class="text-muted mt-2"
            >Manage laboratory test combinations for quick ordering</span
          >
        </h3>
        <div class="card-toolbar">
          <button class="btn btn-primary font-weight-bolder" @click="showCreateModal">
            <i class="fas fa-plus mr-2"></i>
            Create Combo Test
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
                placeholder="Search combo tests..."
                v-model="searchQuery"
                @input="handleSearch"
              />
            </div>
          </div>
        </div>

        <!-- Combo Tests Table -->
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center">
            <thead>
              <tr>
                <th class="pl-7">
                  <span class="text-dark-75">Name</span>
                </th>
                <th>Tests Included</th>
                <th>Total Price</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="comboTest in comboTests" :key="comboTest.id">
                <td class="pl-7">
                  <span class="font-weight-bold text-dark-75">{{ comboTest.name }}</span>
                </td>
                <td>
                  <span
                    class="badge badge-light-primary mr-1"
                    v-for="item in comboTest.comboTestItems"
                    :key="item.id"
                  >
                    {{ item.test?.name }}
                  </span>
                </td>
                <td>
                  <span class="font-weight-bold">{{ calculateTotalPrice(comboTest) }}</span>
                </td>
                <td>
                  <span v-if="comboTest.staff">
                    {{ comboTest.staff.firstname }} {{ comboTest.staff.lastname }}
                  </span>
                </td>
                <td>
                  <span :class="comboTest.is_active ? 'badge badge-success' : 'badge badge-danger'">
                    {{ comboTest.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="pr-0 text-right">
                  <button
                    class="btn btn-sm btn-clean btn-icon mr-2"
                    title="View Details"
                    @click="viewComboTest(comboTest)"
                  >
                    <i class="fas fa-eye text-primary"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-clean btn-icon mr-2"
                    title="Edit"
                    @click="editComboTest(comboTest)"
                  >
                    <i class="fas fa-edit text-info"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-clean btn-icon"
                    title="Delete"
                    @click="confirmDelete(comboTest)"
                  >
                    <i class="fas fa-trash text-danger"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="!comboTests || comboTests.length === 0">
                <td colspan="6" class="text-center text-muted py-5">
                  No combo tests found. Click "Create Combo Test" to add one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center mt-5" v-if="totalPages > 1">
          <div class="text-muted">
            Showing {{ comboTests.length }} of {{ totalComboTests }} combo tests
          </div>
          <b-pagination
            v-model="currentPage"
            :total-rows="totalComboTests"
            :per-page="itemsPerPage"
            @change="handlePageChange"
            class="mb-0"
          ></b-pagination>
        </div>
      </div>
    </div>

    <!-- Combo Test Form Modal -->
    <combo-test-form
      v-if="showModal"
      :combo-test="selectedComboTest"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script>
import ComboTestForm from './ComboTestForm.vue';
import Swal from 'sweetalert2';

export default {
  name: 'ComboTestList',
  components: { ComboTestForm },
  data() {
    return {
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 20,
      showModal: false,
      selectedComboTest: null,
      searchTimeout: null,
    };
  },
  computed: {
    comboTests() {
      return this.$store.state.laboratory.comboTests;
    },
    totalComboTests() {
      return this.$store.state.laboratory.totalComboTests;
    },
    totalPages() {
      return this.$store.state.laboratory.totalComboTestsPages;
    },
  },
  methods: {
    fetchComboTests() {
      this.$store.dispatch('laboratory/fetchComboTests', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.searchQuery,
      });
    },

    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.fetchComboTests();
      }, 500);
    },

    handlePageChange(page) {
      this.currentPage = page;
      this.fetchComboTests();
    },

    calculateTotalPrice(comboTest) {
      if (!comboTest.comboTestItems || comboTest.comboTestItems.length === 0) return '0.00';
      const total = comboTest.comboTestItems.reduce((sum, item) => {
        return sum + (parseFloat(item.test?.price) || 0);
      }, 0);
      return total.toFixed(2);
    },

    showCreateModal() {
      this.selectedComboTest = null;
      this.showModal = true;
    },

    viewComboTest(comboTest) {
      this.selectedComboTest = { ...comboTest, viewMode: true };
      this.showModal = true;
    },

    editComboTest(comboTest) {
      this.selectedComboTest = { ...comboTest };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.selectedComboTest = null;
    },

    handleSaved() {
      this.closeModal();
      this.fetchComboTests();
      this.$bvToast.toast('Combo test saved successfully', {
        title: 'Success',
        variant: 'success',
        solid: true,
      });
    },

    confirmDelete(comboTest) {
      Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to delete "${comboTest.name}"? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        heightAuto: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteComboTest(comboTest.id);
        }
      });
    },

    deleteComboTest(id) {
      this.$store
        .dispatch('laboratory/deleteComboTest', id)
        .then(() => {
          this.$bvToast.toast('Combo test deleted successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
          this.fetchComboTests();
        })
        .catch((error) => {
          this.$bvToast.toast(error.response?.data?.message || 'Failed to delete combo test', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        });
    },
  },
  created() {
    this.fetchComboTests();
  },
};
</script>

<style scoped>
.badge-light-primary {
  background-color: #e1f0ff;
  color: #3699ff;
}
</style>
