<template>
  <div>
    <!--begin::Card-->
    <div class="card card-custom gutter-b example example-compact">
      <create-department
        :displayPrompt="displayPrompt"
        @closeModal="hideModal"
        :data="departmentToEdit"
      />
      <div class="card-header" style="min-height: 50px !important">
        <h3 class="card-title">
          Departments
        </h3>
      </div>
      <!--begin::Header-->
      <div class="card-header border-0">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark"></span>
        </h3>
        <div class="card-toolbar">
          <a href="#" class="btn btn-primary font-weight-bolder font-size-sm" @click="addNewData">
            <add-icon /> Add New
          </a>
        </div>
      </div>
      <!--end::Header-->

      <!--begin::Body-->
      <div class="card-body pt-0 pb-3">
        <!--begin::Table-->
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center table-head-bg">
            <thead>
              <tr class="text-uppercase">
                <th class="pl-5" style="min-width: 150px">Name</th>
                <th style="min-width: 100px">Description</th>
                <th style="min-width: 160px">Date</th>
                <th class="pr-0 " style="min-width: 150px">action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="department in departments" :key="department.id">
                <td class="pl-5">
                  <router-link to="/patient/profile/1234"
                    ><span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                      {{ department.name }}
                    </span></router-link
                  >
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ department.description || 'None' }}
                  </span>
                </td>
                <td class="">
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                    department.createdAt | dayjs('ddd, MMM Do YYYY')
                  }}</span>
                </td>
                <td class="pr-0">
                  <a
                    href="#"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                    @click.stop="editData(department)"
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
import CreateDepartment from './CreateDepartment.vue';
import EditIcon from '../../../../assets/icons/EditIcon.vue';
import AddIcon from '../../../../assets/icons/AddIcon.vue';
export default {
  data() {
    return {
      search: '',
      currentPage: 1,
      itemsPerPage: 10,
      displayPrompt: false,
      departmentToEdit: {},
    };
  },
  components: {
    Pagination,
    CreateDepartment,
    EditIcon,
    AddIcon,
  },

  computed: {
    departments() {
      return this.$store.state.model.departments;
    },
    queriedItems() {
      return this.$store.state.model.total;
    },
    pages() {
      return this.$store.state.model.pages;
    },
    perPage() {
      return this.departments.length;
    },
  },

  methods: {
    addNewData() {
      this.departmentToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(department) {
      this.departmentToEdit = department;
      this.displayPrompt = true;
    },

    handlePageChange() {
      this.$store.dispatch('model/fetchDepartments', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },
  },
  created() {
    this.$store.dispatch('model/fetchDepartments', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    });
  },
};
</script>

<style></style>
