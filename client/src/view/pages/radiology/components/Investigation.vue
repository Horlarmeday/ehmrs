<template>
  <!--begin::Advance Table Widget 1-->
  <div class="card card-custom gutter-b">
    <create-investigation
      :displayPrompt="displayPrompt"
      @closeModal="hideModal"
      :data="investigationToEdit"
    />
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Investigations</span>
      </h3>
      <div class="card-toolbar">
        <a href="#" class="btn btn-success font-weight-bolder font-size-sm" @click="addNewData">
          <add-icon /> Add New
        </a>
      </div>
    </div>
    <!--end::Header-->

    <search-with-filter
      label="Imaging"
      :data="this.$store.state.radiology.imagings"
      @search="onHandleSearch"
      @filter="onHandleFilter"
    />

    <!--begin::Body-->
    <div class="card-body py-0">
      <!--begin::Table-->
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 250px">Name</th>
              <th style="min-width: 250px">Price (₦)</th>
              <th style="min-width: 150px">Imaging Type</th>
              <th style="min-width: 150px">Date Created</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="investigations.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="investigation in investigations" :key="investigation.id">
              <td class="pr-0">
                <a
                  href="#"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ investigation.name }}</a
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ investigation.price }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ investigation.imaging.name }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ investigation.createdAt | dayjs('ddd, MMM Do YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <a
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                  @click.stop="editData(investigation)"
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
  <!--end::Advance Table Widget 1-->
</template>

<script>
import CreateInvestigation from './CreateInvestigation.vue';
import Pagination from '@/utils/Pagination.vue';
import SearchWithFilter from '../../../../utils/SearchWithFilter.vue';
import AddIcon from '../../../../assets/icons/AddIcon.vue';
import EditIcon from '@/assets/icons/EditIcon.vue';
import investigation from '@/view/pages/radiology/components/Investigation.vue';
import { debounce, removeSpinner } from "@/common/common";
export default {
  name: 'Investigation',
  data() {
    return {
      displayPrompt: false,
      investigationToEdit: {},
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  components: {
    EditIcon,
    CreateInvestigation,
    Pagination,
    SearchWithFilter,
    AddIcon,
  },
  computed: {
    investigations() {
      return this.$store.state.radiology.investigations;
    },
    queriedItems() {
      return this.$store.state.radiology.totalInvestigation;
    },
    pages() {
      return this.$store.state.radiology.investigationPages;
    },
    perPage() {
      return this.investigations.length;
    },
  },
  methods: {
    investigation() {
      return investigation;
    },
    addNewData() {
      this.investigationToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(investigation) {
      this.investigationToEdit = investigation;
      this.displayPrompt = true;
    },

    handlePageChange() {
      this.$store.dispatch('radiology/fetchInvestigations', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('radiology/fetchInvestigations', {
          currentPage: vm.currentPage,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    onHandleFilter(filter) {
      this.$store.dispatch('radiology/fetchInvestigations', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter,
      });
    },
  },
  created() {
    this.$store.dispatch('radiology/fetchImagings', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    });
    this.$store.dispatch('radiology/fetchInvestigations', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    });
  },
};
</script>

<style></style>
