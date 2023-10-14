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
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center table-head-bg">
            <thead>
              <tr class="text-uppercase">
                <th class="pl-5" style="min-width: 150px">Name</th>
                <th style="min-width: 100px">Username</th>
                <th style="min-width: 100px">Phone</th>
                <th style="min-width: 100px">Role</th>
                <th style="min-width: 100px">Sub Role</th>
                <th style="min-width: 100px">status</th>
                <th style="min-width: 160px">Date</th>
                <th class="pr-0" style="min-width: 160px">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="staff in employees" :key="staff.id">
                <td class="pl-5">
                  <router-link to="/patient/profile/1234"
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
                  <span v-else class="label label-lg label-light-warning label-inline"
                    >Inactive</span
                  >
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                    staff.createdAt | dayjs('ddd, MMM Do YYYY, h:mma')
                  }}</span>
                </td>
                <td class="pr-0">
                  <a
                    href="#"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                    @click.stop="editData(staff)"
                  >
                    <edit-icon />
                  </a>
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
        />
      </div>
      <!--end::Body-->
    </div>
    <!--end::Card-->
  </div>
</template>

<script>
import Pagination from '@/utils/Pagination.vue';
import EditIcon from '../../../assets/icons/EditIcon.vue';
import EditEmployee from './create/EditEmployee';
export default {
  data() {
    return {
      search: '',
      currentPage: 1,
      itemsPerPage: 10,
      displayPrompt: false,
      staffToEdit: {},
    };
  },
  components: {
    Pagination,
    EditIcon,
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

    searchByName() {
      if (!this.search) return this.notifyEmptyField();
      this.currentPage = 1;
      this.$store.dispatch('employee/fetchEmployees', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.search,
      });
    },

    handlePageChange() {
      this.$store.dispatch('employee/fetchEmployees', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
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
  },
};
</script>

<style></style>
