<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">{{ category }}s</span>
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
      <div class="mt-3 mb-3">
        <div class="row">
          <div class="col-md-4">
            <label class="form-label font-weight-bold">Filter by Category</label>
            <v-select
              v-model="selectedCategory"
              :options="visitCategories"
              :clearable="false"
              @input="onCategoryChange"
              placeholder="Select category"
            />
          </div>
        </div>
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
        @changePageCount="onChangePageCount"
        :url="url"
      />
    </div>
  </div>
</template>
<script>
import Search from '@/utils/Search.vue';
import QueueTable from '@/view/pages/visits/components/table/VisitsTable.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import dayjs from 'dayjs';
import vSelect from 'vue-select';

export default {
  components: { QueueTable, Search, vSelect },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    loading: false,
    start: null,
    end: null,
    selectedCategory: 'All',
    visitCategories: [
      'All',
      'Inpatient',
      'Outpatient',
      'Emergency',
      'Antenatal',
      'Immunization',
      'Maternity',
      'Dialysis',
    ],
  }),
  props: {
    url: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    filter: {
      type: Object,
      required: false,
    },
  },
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
        search: this.$route.query.search,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      });
      this.fetchQueue({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onCategoryChange() {
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      });
      this.fetchQueue({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search || null,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      });
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search,
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.fetchQueue({
        currentPage: 1,
        itemsPerPage: vm.$route.query.itemsPerPage || vm.itemsPerPage,
        search,
        category: vm.selectedCategory !== 'All' ? vm.selectedCategory : null,
      })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    searchByDate(range) {
      const { start, end, dateSpin } = range;
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      });
      this.fetchQueue({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    onChangePageCount(count) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: count,
        search: this.$route.query.search,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      });
      this.fetchQueue({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: count,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search,
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      });
    },

    fetchQueue({
      currentPage = 1,
      itemsPerPage = 10,
      search,
      start = null,
      end = null,
      category = null,
    }) {
      return this.$store.dispatch('visit/fetchCategoryVisits', {
        currentPage,
        itemsPerPage,
        // category: this.category,
        ...(search && { search }),
        ...(start && end && { start, end }),
        ...(category && category !== 'All' && { category }),
        // ...(this.filter && { filter: this.filter }),
      });
    },
  },
  created() {
    if (this.$route.query.category) {
      this.selectedCategory = this.$route.query.category;
    }
    this.fetchQueue({
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      search: this.$route.query.search || null,
      start: this.$route.query.startDate || null,
      end: this.$route.query.endDate || null,
      category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
    });
  },
};
</script>

<style scoped></style>
