<template>
  <!--begin::Advance Table Widget 1-->
  <div class="card card-custom gutter-b">
    <!--begin::Header-->
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Encounters</span>
      </h3>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body">
      <div class="mt-3">
        <encounter-search-filter @search="onHandleSearch" @searchByDate="searchByDate" />
      </div>
      <!--begin::Table-->
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 450px">Name</th>
              <th style="width: 250px">Number of Encounters</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="encounters.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="encounter in encounters" :key="encounter.id">
              <td class="pr-0">
                <a
                  href="#"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ encounter.doctorName }}</a
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ encounter.totalEncounters }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <a href="#" class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3">
                  <view-icon />
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
import Pagination from '@/utils/Pagination.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import ViewIcon from '@/assets/icons/ViewIcon.vue';
import dayjs from 'dayjs';
import EncounterSearchFilter from '@/utils/EncounterSearchFilter.vue';

export default {
  data() {
    return {
      displayPrompt: false,
      encounterToEdit: {},
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  components: {
    EncounterSearchFilter,
    ViewIcon,
    Pagination,
  },
  computed: {
    encounters() {
      return this.$store.state.model.encounters;
    },
    queriedItems() {
      return this.$store.state.model.total;
    },
    pages() {
      return this.$store.state.model.pages;
    },
    perPage() {
      return this.encounters.length;
    },
  },
  methods: {
    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
      });
      this.fetchEncounters({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      });
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.fetchEncounters({
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
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
        itemsPerPage: pagecount,
      });
      this.fetchEncounters({
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search || null,
      });
    },

    searchByDate(range) {
      const { start, end, dateSpin } = range;
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
      });
      this.fetchEncounters({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    fetchEncounters({ currentPage, itemsPerPage, search, start, end }) {
      return this.$store.dispatch('model/fetchEncounters', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
        ...(start && end && { start, end }),
      });
    },
  },
  created() {
    this.fetchEncounters({
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      start: this.$route.query.startDate || null,
      end: this.$route.query.endDate || null,
      search: this.$route.query.search || null,
    });
  },
};
</script>

<style></style>
