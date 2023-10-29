<template>
  <!--begin::Advance Table Widget 1-->
  <div class="card card-custom gutter-b">
    <create-generic-drug
      :displayPrompt="displayPrompt"
      @closeModal="hideModal"
      :data="drugToEdit"
    />
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Generic Drugs</span>
      </h3>
      <div class="card-toolbar">
        <a href="#" class="btn btn-success font-weight-bolder font-size-sm" @click="addNewData">
          <add-icon /> Add New
        </a>
      </div>
    </div>
    <!--end::Header-->

    <search @search="onHandleSearch" />

    <!--begin::Body-->
    <div class="card-body py-0">
      <!--begin::Table-->
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 450px">Name</th>
              <th style="min-width: 150px">Code</th>
              <th style="min-width: 150px">Type</th>
              <th style="min-width: 150px">Date Created</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="drugs.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="drug in drugs" :key="drug.id">
              <td class="pr-0">
                <a
                  href="#"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ drug.name }}</a
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ drug.code }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ drug.type }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ drug.createdAt | dayjs('ddd, MMM Do YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <a
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                  @click.stop="editData(drug)"
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
        :current-page="+$route.query.currentPage || currentPage"
        @pagechanged="onPageChange"
        @changepagecount="onChangePageCount"
      />
    </div>
    <!--end::Body-->
  </div>
  <!--end::Advance Table Widget 1-->
</template>

<script>
import CreateGenericDrug from './create/CreateGenericDrug.vue';
import Pagination from '@/utils/Pagination.vue';
import EditIcon from '@/assets/icons/EditIcon.vue';
import AddIcon from '@/assets/icons/AddIcon.vue';
import Search from '@/utils/Search.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';

export default {
  data() {
    return {
      displayPrompt: false,
      drugToEdit: {},
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  components: {
    CreateGenericDrug,
    Pagination,
    Search,
    EditIcon,
    AddIcon,
  },
  computed: {
    drugs() {
      return this.$store.state.pharmacy.drugs;
    },
    queriedItems() {
      return this.$store.state.pharmacy.total;
    },
    pages() {
      return this.$store.state.pharmacy.pages;
    },
    perPage() {
      return this.drugs.length;
    },
  },
  methods: {
    addNewData() {
      this.drugToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(drug) {
      this.drugToEdit = drug;
      this.displayPrompt = true;
    },

    handlePageChange() {
      setUrlQueryParams({
        pathName: 'generic-drugs',
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
      this.$store.dispatch('pharmacy/fetchGenericDrugs', {
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
      });
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      setUrlQueryParams({
        pathName: 'generic-drugs',
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('pharmacy/fetchGenericDrugs', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onChangePageCount(pagecount) {
      setUrlQueryParams({
        pathName: 'generic-drugs',
        currentPage: this.currentPage,
        itemsPerPage: pagecount,
      });
      this.$store.dispatch('pharmacy/fetchGenericDrugs', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: pagecount,
      });
    },
  },
  created() {
    this.$store.dispatch('pharmacy/fetchGenericDrugs', {
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
    });
  },
};
</script>

<style></style>
