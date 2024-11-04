<template>
  <div class="card card-custom gutter-b">
    <!--begin::Header-->
    <div class="card-header">
      <h3 class="card-title">
        <span class="card-label font-weight-bolder text-dark">Requests</span>
      </h3>
      <div class="card-title">
        <router-link class="btn btn-primary btn-sm" to="/request/create"
          >Create Request</router-link
        >
      </div>
    </div>
    <div class="card-header border-0">
      <search @search="onHandleSearch" :show-date-filter="true" />
    </div>

    <div class="card-body py-0">
      <requests-table :requests="requests" :should-select-request="false" />

      <pagination
        :total-pages="pages"
        :total="queriedItems"
        :per-page="perPage"
        :current-page="currentPage"
        @pagechanged="onPageChange"
        @changepagecount="handlePageCount"
      />
    </div>
  </div>
</template>

<script>
import Search from '@/utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import RequestsTable from '@/view/pages/requests/components/RequestsTable.vue';
import dayjs from 'dayjs';
export default {
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      start: null,
      end: null,
    };
  },
  computed: {
    requests() {
      return this.$store.state.request.requests;
    },
    queriedItems() {
      return this.$store.state.request.total || 0;
    },
    pages() {
      return this.$store.state.request.pages;
    },
    perPage() {
      return this.requests.length;
    },
    selectedRequests() {
      return this.$store.state.request.selectedRequests;
    },
  },
  components: { RequestsTable, Pagination, Search },
  methods: {
    searchByDate(range) {
      const { start, end, dateSpin } = range;
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
      });
      this.$store
        .dispatch('request/fetchCurrentUserRequests', {
          currentPage: this.$route.query.currentPage,
          itemsPerPage: this.$route.query.itemsPerPage,
          start: this.$route.query.startDate,
          end: this.$route.query.endDate,
        })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
      });
      this.$store.dispatch('request/fetchCurrentUserRequests', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search,
      });
    },

    handlePageCount(count) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: count,
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
      });
      this.$store.dispatch('request/fetchCurrentUserRequests', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      setUrlQueryParams({
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('request/fetchCurrentUserRequests', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),
  },
  created() {
    this.$store.dispatch('request/fetchCurrentUserRequests', {
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      search: this.$route.query.search || null,
      start: this.$route.query.startDate || null,
      end: this.$route.query.endDate || null,
    });
  },
};
</script>

<style scoped></style>
