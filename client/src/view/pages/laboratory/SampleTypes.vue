<template>
  <!--begin::Advance Table Widget 1-->
  <div class="card card-custom gutter-b">
    <create-sample-type
      :displayPrompt="displayPrompt"
      @closeModal="hideModal"
      :data="sampleToEdit"
    />
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark"
          >Test Samples</span
        >
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

    <search @search="onHandleSearch" />

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
              <th class="pr-0" style="width: 450px">Type</th>
              <th style="min-width: 250px">Date Created</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="samples.length == 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="sample in samples" :key="sample.id">
              <td class="pr-0">
                <a
                  href="#"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ sample.name }}</a
                >
              </td>
              <td>
                <span
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ sample.createdAt | moment("ddd, MMM Do YYYY, h:mma") }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <a
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                  @click.stop="editData(sample)"
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
import CreateSampleType from "./create/CreateSampleType.vue";
import Pagination from "@/utils/Pagination.vue";
import EditIcon from "../../../assets/icons/EditIcon.vue";
import AddIcon from "../../../assets/icons/AddIcon.vue";
import Search from "../../../utils/Search.vue";
import { debounce, removeSpinner } from "@/common/common";
export default {
  data() {
    return {
      displayPrompt: false,
      sampleToEdit: {},
      currentPage: 1,
      itemsPerPage: 10
    };
  },
  components: {
    CreateSampleType,
    Pagination,
    Search,
    EditIcon,
    AddIcon
  },
  computed: {
    samples() {
      return this.$store.state.laboratory.samples;
    },
    queriedItems() {
      return this.$store.state.laboratory.totalSample;
    },
    pages() {
      return this.$store.state.laboratory.totalPages;
    },
    perPage() {
      return this.samples.length;
    }
  },
  methods: {
    addNewData() {
      this.sampleToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(sample) {
      this.sampleToEdit = sample;
      this.displayPrompt = true;
    },

    handlePageChange() {
      this.$store.dispatch("laboratory/fetchTestSamples", {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage
      });
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('laboratory/fetchTestSamples', {
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
      this.$store.dispatch("laboratory/fetchTestSamples", {
        currentPage: this.currentPage,
        itemsPerPage: pagecount
      });
    }
  },
  created() {
    this.$store.dispatch("laboratory/fetchTestSamples", {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage
    });
  }
};
</script>

<style></style>
