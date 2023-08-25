<template>
  <div>
    <!--begin::Card-->
    <div class="card card-custom gutter-b example example-compact">
      <create-ward :displayPrompt="displayPrompt" @closeModal="hideModal" :data="wardToEdit" />
      <div class="card-header" style="min-height: 50px !important">
        <h3 class="card-title">
          Ward List
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
                <th class="pl-5" style="min-width: 150px">Occupant Type</th>
                <th style="min-width: 160px">Date</th>
                <th class="pr-0 " style="min-width: 150px">action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ward in wards" :key="ward.id">
                <td class="pl-5">
                  <router-link to="#"
                    ><span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                      {{ ward.name }}
                    </span></router-link
                  >
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                    ward.occupant_type
                  }}</span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                    ward.createdAt | moment('ddd, MMM Do YYYY')
                  }}</span>
                </td>
                <td class="pr-0">
                  <a
                    href="#"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                    @click.stop="editData(ward)"
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
import CreateWard from './CreateWard.vue';
export default {
  data() {
    return {
      search: '',
      currentPage: 1,
      itemsPerPage: 20,
      displayPrompt: false,
      wardToEdit: {},
    };
  },
  components: {
    Pagination,
    EditIcon,
    AddIcon,
    CreateWard,
  },

  computed: {
    wards() {
      return this.$store.state.model.wards;
    },
    queriedItems() {
      return this.$store.state.model.totalWard;
    },
    pages() {
      return this.$store.state.model.wardPages;
    },
    perPage() {
      return this.wards.length;
    },
  },

  methods: {
    addNewData() {
      this.wardToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(ward) {
      this.wardToEdit = ward;
      this.displayPrompt = true;
    },

    handlePageChange() {
      this.$store.dispatch('model/fetchWards', {
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
    this.$store.dispatch('model/fetchWards', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    });
  },
};
</script>

<style></style>
