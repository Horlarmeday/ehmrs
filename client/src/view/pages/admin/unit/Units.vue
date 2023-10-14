<template>
  <div>
    <!--begin::Card-->
    <div class="card card-custom gutter-b example example-compact">
      <create-unit :displayPrompt="displayPrompt" @closeModal="hideModal" :data="unitToEdit" />
      <div class="card-header" style="min-height: 50px !important">
        <h3 class="card-title">
          Unit List
        </h3>
      </div>
      <!--begin::Header-->
      <div class="card-header border-0">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Units</span>
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
                <th style="min-width: 160px">Date</th>
                <th class="pr-0 " style="min-width: 150px">action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="unit in units" :key="unit.id">
                <td class="pl-5">
                  <router-link to="/patient/profile/1234"
                    ><span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                      {{ unit.name }}
                    </span></router-link
                  >
                </td>
                <td class="">
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                    unit.createdAt | dayjs('ddd, MMM Do YYYY')
                  }}</span>
                </td>
                <td class="pr-0">
                  <a
                    href="#"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                    @click.stop="editData(unit)"
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
import EditIcon from '../../../../assets/icons/EditIcon.vue';
import AddIcon from '../../../../assets/icons/AddIcon.vue';
import CreateUnit from './CreateUnit.vue';
export default {
  data() {
    return {
      search: '',
      currentPage: 1,
      itemsPerPage: 10,
      displayPrompt: false,
      unitToEdit: {},
    };
  },
  components: {
    Pagination,
    EditIcon,
    AddIcon,
    CreateUnit,
  },

  computed: {
    units() {
      return this.$store.state.model.units;
    },
    queriedItems() {
      return this.$store.state.model.totalUnit;
    },
    pages() {
      return this.$store.state.model.unitPages;
    },
    perPage() {
      return this.units.length;
    },
  },

  methods: {
    addNewData() {
      this.unitToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(unit) {
      this.unitToEdit = unit;
      this.displayPrompt = true;
    },

    handlePageChange() {
      this.$store.dispatch('model/fetchUnits', {
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
    this.$store.dispatch('model/fetchUnits', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    });
  },
};
</script>

<style></style>
