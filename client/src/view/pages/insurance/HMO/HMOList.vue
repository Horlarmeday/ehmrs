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
                  <span class="svg-icon svg-icon-md svg-icon-primary"
                    ><!--begin::Svg Icon | path:assets/media/svg/icons/Communication/Write.svg--><svg
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      width="24px"
                      height="24px"
                      viewBox="0 0 24 24"
                      version="1.1"
                    >
                      <g
                        stroke="none"
                        stroke-width="1"
                        fill="none"
                        fill-rule="evenodd"
                      >
                        <rect x="0" y="0" width="24" height="24" />
                        <path
                          d="M12.2674799,18.2323597 L12.0084872,5.45852451 C12.0004303,5.06114792 12.1504154,4.6768183 12.4255037,4.38993949 L15.0030167,1.70195304 L17.5910752,4.40093695 C17.8599071,4.6812911 18.0095067,5.05499603 18.0083938,5.44341307 L17.9718262,18.2062508 C17.9694575,19.0329966 17.2985816,19.701953 16.4718324,19.701953 L13.7671717,19.701953 C12.9505952,19.701953 12.2840328,19.0487684 12.2674799,18.2323597 Z"
                          fill="#000000"
                          fill-rule="nonzero"
                          transform="translate(14.701953, 10.701953) rotate(-135.000000) translate(-14.701953, -10.701953) "
                        />
                        <path
                          d="M12.9,2 C13.4522847,2 13.9,2.44771525 13.9,3 C13.9,3.55228475 13.4522847,4 12.9,4 L6,4 C4.8954305,4 4,4.8954305 4,6 L4,18 C4,19.1045695 4.8954305,20 6,20 L18,20 C19.1045695,20 20,19.1045695 20,18 L20,13 C20,12.4477153 20.4477153,12 21,12 C21.5522847,12 22,12.4477153 22,13 L22,18 C22,20.209139 20.209139,22 18,22 L6,22 C3.790861,22 2,20.209139 2,18 L2,6 C2,3.790861 3.790861,2 6,2 L12.9,2 Z"
                          fill="#000000"
                          fill-rule="nonzero"
                          opacity="0.3"
                        />
                      </g></svg
                    ><!--end::Svg Icon--></span
                  >
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

    onHandleSearch(search) {
      this.$store.dispatch("insurance/fetchHMOs", {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search
      });
    },

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
