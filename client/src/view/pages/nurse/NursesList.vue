<template>
  <div>
    <!--begin::Card-->
    <div class="card card-custom gutter-b example example-compact">
      <div class="card-header" style="min-height: 50px !important">
        <h3 class="card-title">
          Nurses
        </h3>
      </div>
      <!--begin::Form-->
      <search @search="onHandleSearch" />

      <!--begin::Body-->
      <div v-if="employees.length" class="card-body pt-0 pb-3">
        <!--begin::Table-->
        <div class="table-responsive">
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
                    staff.createdAt | dayjs('MMM Do YYYY, h:mma')
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
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import Search from '@/utils/Search.vue';
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
    Search,
    Pagination,
    EditIcon,
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
    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      setUrlQueryParams({
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('antenatal/fetchAntenatalAccounts', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search,
      });
      this.$store.dispatch('employee/fetchEmployees', {
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    fetchEmployees({ currentPage, itemsPerPage, search }) {
      return this.$store.dispatch('employee/fetchEmployees', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
      });
    },
  },
  created() {
    this.fetchEmployees({
      currentPage: this.$route.query.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage,
      search: this.$route.query.search,
    });
  },
};
</script>

<style></style>
