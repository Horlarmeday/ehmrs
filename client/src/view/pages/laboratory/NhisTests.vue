<template>
  <!--begin::Advance Table Widget 1-->
  <div class="card card-custom gutter-b">
    <create-nhis-test :displayPrompt="displayPrompt" @closeModal="hideModal" :data="testToEdit" />
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">NHIS Tests</span>
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
              <th class="pr-0" style="width: 250px">Name</th>
              <th class="pr-0" style="width: 150px">Code</th>
              <th class="pr-0" style="width: 150px">Price</th>
              <th class="pr-0" style="width: 250px">Type</th>
              <th style="min-width: 150px">Date Created</th>
              <th class="pr-0 text-right" style="min-width: 50px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="tests.length == 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="test in tests" :key="test.id">
              <td class="pr-0">
                <a
                  href="#"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ test.name }}</a
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ test.code || 'None' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ test.price }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ test.type }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ test.createdAt | dayjs('ddd, MMM Do YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <a
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                  @click.stop="editData(test)"
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
        @changepagecount="onChangePageCount"
      />
    </div>
    <!--end::Body-->
  </div>
  <!--end::Advance Table Widget 1-->
</template>

<script>
import CreateNhisTest from './create/CreateNhisTest.vue';
import Pagination from '@/utils/Pagination.vue';
import EditIcon from '../../../assets/icons/EditIcon.vue';
import AddIcon from '../../../assets/icons/AddIcon.vue';
import Search from '../../../utils/Search.vue';
export default {
  data() {
    return {
      displayPrompt: false,
      testToEdit: {},
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  components: {
    CreateNhisTest,
    Pagination,
    Search,
    EditIcon,
    AddIcon,
  },
  computed: {
    tests() {
      return this.$store.state.laboratory.nhisTests;
    },
    queriedItems() {
      return this.$store.state.laboratory.totalNhisTest;
    },
    pages() {
      return this.$store.state.laboratory.totalNhisPages;
    },
    perPage() {
      return this.tests.length;
    },
  },
  methods: {
    addNewData() {
      this.testToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(test) {
      this.testToEdit = test;
      this.displayPrompt = true;
    },

    handlePageChange() {
      this.$store.dispatch('laboratory/fetchNhisTests', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
    },

    onHandleSearch(search) {
      this.$store.dispatch('laboratory/fetchNhisTests', {
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onChangePageCount(pagecount) {
      this.$store.dispatch('laboratory/fetchNhisTests', {
        currentPage: this.currentPage,
        itemsPerPage: pagecount,
      });
    },
  },
  created() {
    this.$store.dispatch('laboratory/fetchNhisTests', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    });
  },
};
</script>

<style></style>
