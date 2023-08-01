<template>
  <!--begin::Advance Table Widget 1-->
  <div class="card card-custom gutter-b">
    <create-hmo
      :displayPrompt="displayPrompt"
      @closeModal="hideModal"
      :data="hmoToEdit"
    />
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">HMOs</span>
      </h3>
      <div class="card-toolbar">
        <a
          href="#"
          class="btn btn-success font-weight-bolder font-size-sm"
          @click="addNewData"
        >
          <add-icon /> Add New
        </a>
      </div>
    </div>
    <!--end::Header-->

    <search-with-filter
      label="Insurance"
      :data="this.$store.state.insurance.insurances"
      @search="onHandleSearch"
      @filter="onHandleFilter"
    />

    <!--begin::Body-->
    <div class="card-body py-0">
      <!--begin::Table-->
      <div class="table-responsive">
        <table
          class="table table-head-custom table-vertical-center"
          id="kt_advance_table_widget_1"
        >
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 250px">Name</th>
              <th style="min-width: 250px">HMO Number</th>
              <th style="min-width: 150px">Insurance Type</th>
              <th style="min-width: 150px">Date Created</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="hmos.length == 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="hmo in hmos" :key="hmo.id">
              <td class="pr-0">
                <a
                  href="#"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ hmo.name }}</a
                >
              </td>
              <td>
                <span
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ hmo.hmo_num }}
                </span>
              </td>
              <td>
                <span :class="getLabelStatus(hmo.insurance.name)">
                  {{ hmo.insurance.name }}
                </span>
              </td>
              <td>
                <span
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ hmo.createdAt | moment("ddd, MMM Do YYYY, h:mma") }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <a
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                  @click.stop="editData(hmo)"
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
import CreateHmo from "./CreateHMO.vue";
import Pagination from "@/utils/Pagination.vue";
import SearchWithFilter from "../../../../utils/SearchWithFilter.vue";
import AddIcon from "../../../../assets/icons/AddIcon.vue";
import EditIcon from "@/assets/icons/EditIcon.vue";
import { debounce, removeSpinner } from "@/common/common";
export default {
  data() {
    return {
      displayPrompt: false,
      hmoToEdit: {},
      currentPage: 1,
      itemsPerPage: 10
    };
  },
  components: {
    EditIcon,
    CreateHmo,
    Pagination,
    SearchWithFilter,
    AddIcon
  },
  computed: {
    hmos() {
      return this.$store.state.insurance.hmos;
    },
    queriedItems() {
      return this.$store.state.insurance.totalHmo;
    },
    pages() {
      return this.$store.state.insurance.hmopages;
    },
    perPage() {
      return this.hmos.length;
    }
  },
  methods: {
    addNewData() {
      this.hmoToEdit = {};
      this.displayPrompt = true;
    },

    getLabelStatus(type) {
      if (type == "NHIS")
        return "label label-lg label-light-primary label-inline";

      if (type == "PHIS")
        return "label label-lg label-light-warning label-inline";

      if (type == "FHSS") return "label label-lg label-light-info label-inline";

      return "label label-lg label-light-success label-inline";
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(hmo) {
      this.hmoToEdit = hmo;
      this.displayPrompt = true;
    },

    handlePageChange() {
      this.$store.dispatch("insurance/fetchHMOs", {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage
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
        .dispatch('insurance/fetchHMOs', {
          currentPage: vm.currentPage,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    onHandleFilter(filter) {
      this.$store.dispatch("insurance/fetchHMOs", {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter
      });
    },

    handleError(error) {
      this.$notify({
        group: "foo",
        title: "Error message",
        text: error.response.data,
        type: "error"
      });
    }
  },
  created() {
    this.$store
      .dispatch("insurance/fetchHMOs", {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage
      })
      .catch(err => this.handleError(err));
  }
};
</script>

<style></style>
