<template>
  <div class="card card-custom gutter-b">
    <!--begin::Header-->
    <div class="card-header">
      <h3 class="card-title">
        <span class="card-label font-weight-bolder text-dark">Requests</span>
      </h3>
      <div class="card-title">
        <router-link class="btn btn-primary btn-sm" to="/request/create">Create Request</router-link>
      </div>
    </div>
    <search @search="onHandleSearch" :show-date-filter="true" />

    <div class="card-body py-0">
      <requests-table :requests="requests" :should-select-request="false" />

      <pagination
        :total-pages="pages"
        :total="queriedItems"
        :per-page="perPage"
        :current-page="currentPage"
        @pagechanged="onPageChange"
      />
    </div>
  </div>
</template>

<script>
import Search from '@/utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import RequestsTable from '@/view/pages/requests/components/RequestsTable.vue';
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
    searchByDate(start, end) {
      (this.start = start), (this.end = end);
      this.currentPage = 1;
      setUrlQueryParams({
        pathName: 'request-list',
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        startDate: new Date(this.start).toISOString(),
        endDate: new Date(this.end).toISOString(),
      });
      this.$store.dispatch('request/fetchCurrentUserRequests', {
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      });
    },

    handlePageChange() {
      setUrlQueryParams({
        pathName: 'request-list',
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
      this.$store.dispatch('request/fetchCurrentUserRequests', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
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
    });
  },
};
</script>

<style scoped></style>
