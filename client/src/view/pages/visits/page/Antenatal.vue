<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Antenatal Visits</span>
      </h3>
    </div>
    <div class="card-body">
      <div class="mt-3">
        <search
          @search="onHandleSearch"
          @filterByDateRange="searchByDate"
          :show-date-filter="true"
        />
      </div>
      <queue-table
        :pagination-params="{
          queriedItems,
          pages,
          perPage,
          currentPage: +$route.query.currentPage || currentPage,
        }"
        :queues="queues"
        @changePage="onPageChange"
      />
    </div>
  </div>
</template>
<script>
import Search from '@/utils/Search.vue';
import QueueTable from '@/view/pages/visits/components/QueueTable.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';

export default {
  components: { QueueTable, Search },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    loading: false,
    start: null,
    end: null,
    category: 'Antenatal',
  }),
  computed: {
    queues() {
      return this.$store.state.visit.categoryVisits;
    },
    queriedItems() {
      return this.$store.state.visit.totalCategoryVisits;
    },
    pages() {
      return this.$store.state.visit.totalCategoryVisitsPages;
    },
    perPage() {
      return this.queues.length;
    },
  },
  methods: {
    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
      this.fetchQueue({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
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
      vm.$store
        .dispatch('visit/fetchCategoryVisits', {
          currentPage: 1,
          itemsPerPage: vm.$route.query.itemsPerPage || vm.itemsPerPage,
          search,
          category: this.category,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    searchByDate(range) {
      const { start, end, dateSpin } = range;
      this.end = end;
      this.start = start;
      this.currentPage = 1;
      setUrlQueryParams({
        pathName: 'ante-natal-visits',
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        startDate: new Date(this.start).toISOString(),
        endDate: new Date(this.end).toISOString(),
      });
      this.fetchQueue({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        start: new Date(this.start).toISOString(),
        end: new Date(this.end).toISOString(),
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    onChangePageCount(pagecount) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: pagecount,
      });
      this.fetchQueue({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: pagecount,
      });
    },

    fetchQueue({ currentPage = 1, itemsPerPage = 10, search, start = null, end = null }) {
      return this.$store.dispatch('visit/fetchCategoryVisits', {
        currentPage,
        itemsPerPage,
        category: this.category,
        ...(search && { search }),
        ...(start && { startDate: new Date(start).toISOString() }),
        ...(end && { startDate: new Date(end).toISOString() }),
      });
    },
  },
  created() {
    this.fetchQueue({
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