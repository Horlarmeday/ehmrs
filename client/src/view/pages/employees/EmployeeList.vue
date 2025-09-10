<template>
  <div>
    <!--begin::Card-->
    <div class="card card-custom gutter-b example example-compact">
      <edit-employee :displayPrompt="displayPrompt" @closeModal="hideModal" :data="staffToEdit" />
      <div class="card-header" style="min-height: 50px !important">
        <h3 class="card-title">
          Find Employee Record
        </h3>
      </div>
      <!--begin::Form-->
      <div class="card-body" style="padding: 1rem 2.25rem">
        <div class="row">
          <div class="col-lg-6">
            <div class="form-group">
              <label>Enter Employee Name</label>
              <div class="input-group input-group-solid">
                <input
                  type="text"
                  class="form-control"
                  v-model="search"
                  @keypress.enter="searchByName"
                />
                <div class="input-group-append">
                  <button type="button" class="btn btn-primary" @click="searchByName">
                    Search
                  </button>
                </div>
              </div>
              <span class="form-text text-muted">Find Employee by name</span>
            </div>
          </div>
        </div>
      </div>

      <!--begin::Body-->
      <div v-if="employees.length" class="card-body pt-0 pb-3">
        <!--begin::Table-->
        <div class="table-responsive employee-table-container">
          <table class="table table-head-custom table-vertical-center table-head-bg">
            <thead>
              <tr class="text-uppercase">
                <th class="pl-5" style="min-width: 200px">Name</th>
                <th style="min-width: 100px">Username</th>
                <th style="min-width: 100px">Phone</th>
                <th style="min-width: 100px">Role</th>
                <th style="min-width: 100px">Sub Role</th>
                <th style="min-width: 100px">status</th>
                <th style="min-width: 160px">Date</th>
                <th class="pr-0" style="min-width: 120px">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="staff in employees" :key="staff.id">
                <td class="pl-5">
                  <router-link :to="`/employee/profile/${staff.id}`"
                    ><span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                      {{ staff.fullname }}
                    </span></router-link
                  >
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ staff.username }}
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ staff.phone }}
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ staff.role }}
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ staff.sub_role || 'None' }}
                  </span>
                </td>
                <td>
                  <span
                    v-if="staff.status === 'Active'"
                    class="label label-lg label-light-primary label-inline"
                    >Active</span
                  >
                  <span v-else class="label label-lg label-light-danger label-inline"
                    >Inactive</span
                  >
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                    staff.createdAt | dayjs('MMM Do YYYY, h:mma')
                  }}</span>
                </td>
                <td class="pr-0">
                  <!-- Primary Action: View Details -->
                  <router-link
                    v-b-tooltip.hover
                    title="View Employee Details"
                    :to="`/employee/profile/${staff.id}`"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                  >
                    <i class="flaticon-eye text-primary"></i>
                  </router-link>

                  <!-- Secondary Actions Dropdown -->
                  <b-dropdown
                    size="sm"
                    variant="link"
                    toggle-class="btn btn-icon btn-light btn-hover-primary btn-sm"
                    no-caret
                    right
                    boundary="viewport"
                    offset="0"
                  >
                    <template v-slot:button-content>
                      <i class="ki ki-bold-more-hor"></i>
                    </template>

                    <!-- Edit Employee -->
                    <b-dropdown-item @click="editData(staff)">
                      <i class="flaticon2-contract text-primary mr-2"></i>
                      Edit Employee
                    </b-dropdown-item>

                    <!-- Reset Password -->
                    <b-dropdown-item @click="showResetAlert(staff.id)">
                      <i class="flaticon-refresh text-warning mr-2"></i>
                      Reset Password
                    </b-dropdown-item>

                    <b-dropdown-divider></b-dropdown-divider>

                    <!-- Activate/Deactivate -->
                    <b-dropdown-item
                      @click="showActivateAlert(staff)"
                      :class="staff.status === ACTIVE ? 'text-danger' : 'text-success'"
                    >
                      <i
                        :class="
                          staff.status === ACTIVE
                            ? 'flaticon-delete text-danger'
                            : 'flaticon2-checkmark text-success'
                        "
                        class="mr-2"
                      ></i>
                      {{ staff.status === ACTIVE ? DEACTIVATE_EMPLOYEE : REACTIVATE_EMPLOYEE }}
                    </b-dropdown-item>
                  </b-dropdown>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!--end::Table-->
        <pagination
          :total-pages="pages"
          :total="queriedItems"
          :per-page="perPage"
          :current-page="currentPage"
          @pagechanged="onPageChange"
          @changepagecount="handlePageCount"
        />
      </div>
      <!--end::Body-->
    </div>
    <!--end::Card-->
  </div>
</template>

<script>
import Pagination from '@/utils/Pagination.vue';
import EditEmployee from './create/EditEmployee';
import { setUrlQueryParams } from '@/common/common';
import Swal from 'sweetalert2';
export default {
  data() {
    return {
      search: '',
      currentPage: 1,
      itemsPerPage: 30,
      displayPrompt: false,
      staffToEdit: {},
      ACTIVE: 'Active',
      DEACTIVATE_EMPLOYEE: 'Deactivate Employee',
      REACTIVATE_EMPLOYEE: 'Reactivate Employee',
    };
  },
  components: {
    Pagination,
    EditEmployee,
  },

  computed: {
    employees() {
      return this.$store.state.employee.employees;
    },
    queriedItems() {
      return this.$store.state.employee.total;
    },
    pages() {
      return this.$store.state.employee.pages;
    },
    perPage() {
      return this.employees.length;
    },
  },

  methods: {
    notifyEmptyField() {
      return this.$notify({
        group: 'foo',
        title: 'Error message',
        text: 'Field cannot be left empty',
        type: 'error',
      });
    },

    showResetAlert(employeeId) {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to reset this employee password!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Continue!',
        cancelButtonText: 'No, cancel!',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return self.resetEmployeePassword(employeeId);
        },
      });
    },

    showActivateAlert(employee) {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        html: `You want to ${employee.status === this.ACTIVE ? 'Deactivate' : 'Reactivate'} ${
          employee.firstname
        } account`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Continue!',
        cancelButtonText: 'No, cancel!',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return self.updateEmployee(employee);
        },
      });
    },

    updateEmployee(employee) {
      const data = {
        id: employee.id,
        status: `${employee.status === this.ACTIVE ? 'Inactive' : 'Active'}`,
      };
      this.$store.dispatch('employee/updateEmployee', data).then(() => {
        this.fetchEmployees({
          currentPage: this.$route.query.currentPage || 1,
          itemsPerPage: this.$route.query.itemsPerPage || 10,
          search: this.$route.query.search || null,
        });
      });
    },

    resetEmployeePassword(employeeId) {
      this.$store.dispatch('employee/resetEmployeePassword', employeeId);
    },

    searchByName() {
      if (!this.search) return this.notifyEmptyField();
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.search,
      });
      this.fetchEmployees({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
      });
    },

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search || this.search,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      });
      this.$store.dispatch('employee/fetchEmployees', {
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search,
      });
    },

    handlePageCount(count) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: count,
        search: this.$route.query.search,
      });
      this.$store.dispatch('employee/fetchEmployees', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    editData(staff) {
      this.staffToEdit = staff;
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    fetchEmployees({ currentPage, itemsPerPage, search, start, end }) {
      return this.$store.dispatch('employee/fetchEmployees', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
        ...(start && end && { start, end }),
      });
    },
  },
  created() {
    this.fetchEmployees({
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      search: this.$route.query.search || this.search,
      start: this.$route.query.startDate,
      end: this.$route.query.endDate,
    });
  },
};
</script>

<style scoped>
.employee-table-container {
  position: relative;
  overflow: visible;
}

/* Ensure dropdown doesn't cause layout shifts */
.employee-table-container .dropdown-menu {
  position: absolute !important;
  z-index: 1050;
  min-width: 160px;
}

/* Fix for single record dropdown positioning */
.employee-table-container .table tbody tr:last-child .dropdown-menu {
  right: 0;
  left: auto;
  transform: translateX(0);
}

/* Ensure table doesn't expand when dropdown opens */
.employee-table-container .table {
  table-layout: fixed;
}

/* Actions column should have fixed width */
.employee-table-container .table th:last-child,
.employee-table-container .table td:last-child {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
}

/* Ensure dropdown button doesn't cause overflow */
.employee-table-container .btn-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
