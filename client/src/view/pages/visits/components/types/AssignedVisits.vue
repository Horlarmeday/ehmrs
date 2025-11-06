<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark"
          >Queue <span v-if="label">({{ label }})</span></span
        >
      </h3>
    </div>
    <div class="card-body">
      <div class="mt-2">
        <search
          @search="onHandleSearch"
          @filterByDateRange="searchByDate"
          :show-date-filter="currentUser.department !== MEDICAL_PRACTITIONER"
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
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import QueueTable from '@/view/pages/visits/components/table/VisitsTable.vue';
import dayjs from 'dayjs';
import { parseJwt } from '@/core/plugins/parseJwt';
import vSelect from 'vue-select';

export default {
  name: 'AssignedVisits',
  components: { QueueTable, Search, vSelect },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    loading: false,
    start: null,
    end: null,
    MEDICAL_PRACTITIONER: 'Medical Practitioners',
    currentUser: parseJwt(localStorage.getItem('user_token')),
    selectedCategory: 'Outpatient',
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
    filter: {
      type: Object,
      required: false,
    },
    label: {
      type: String,
      required: false,
    },
    dispatchType: {
      type: String,
      required: false,
    },
  },
  computed: {
    queues() {
      return this.$store.state.visit.assignedVisits;
    },
    queriedItems() {
      return this.$store.state.visit.totalAssignedVisits;
    },
    pages() {
      return this.$store.state.visit.totalAssignedVisitsPages;
    },
    perPage() {
      return this.queues.length;
    },
  },
  methods: {
    handlePageChange() {
      const dateRange = this.todayDate();
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search || null,
        startDate: dateRange?.startDate || this.$route.query.startDate,
        endDate: dateRange?.endDate || this.$route.query.endDate,
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      });
      this.fetchQueue({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
        start: dateRange?.startDate || this.$route.query.startDate,
        end: dateRange?.endDate || this.$route.query.endDate,
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onCategoryChange() {
      this.currentPage = 1;
      const dateRange = this.todayDate();
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search || null,
        startDate: dateRange?.startDate || this.$route.query.startDate,
        endDate: dateRange?.endDate || this.$route.query.endDate,
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      });
      this.fetchQueue({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search || null,
        start: dateRange?.startDate || this.$route.query.startDate,
        end: dateRange?.endDate || this.$route.query.endDate,
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      });
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      const dateRange = this.todayDate();
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search,
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('visit/fetchProfessionalVisits', {
          currentPage: 1,
          itemsPerPage: vm.$route.query.itemsPerPage || vm.itemsPerPage,
          search,
          start: vm.todayDate().startDate,
          end: vm.todayDate().endDate,
          ...(vm.filter && { filter: vm.filter }),
          ...(vm.selectedCategory !== 'All' && { category: vm.selectedCategory }),
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

    onChangePageCount(pagecount) {
      const dateRange = this.todayDate();
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: pagecount,
        search: this.$route.query.search,
        startDate: dateRange?.startDate || this.$route.query.startDate,
        endDate: dateRange?.endDate || this.$route.query.endDate,
        category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
      });
      this.fetchQueue({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: pagecount,
        start: dateRange?.startDate || this.$route.query.startDate,
        end: dateRange?.endDate || this.$route.query.endDate,
        search: this.$route.query.search || null,
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
      return this.$store.dispatch(this.dispatchType || 'visit/fetchProfessionalVisits', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
        ...(start && end && { start, end }),
        ...(this.filter && { filter: this.filter }),
        ...(category && category !== 'All' && { category }),
      });
    },

    todayDate() {
      if (this.label === 'New' && this.currentUser.department === this.MEDICAL_PRACTITIONER) {
        return {
          startDate: dayjs().startOf('day').format('YYYY-MM-DD'),
          endDate: dayjs().endOf('day').format('YYYY-MM-DD'),
        };
      }
      return null;
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
      start: this.todayDate()?.startDate || this.$route.query.startDate,
      end: this.todayDate()?.endDate || this.$route.query.endDate,
      category: this.selectedCategory !== 'All' ? this.selectedCategory : null,
    });
  },
};
</script>

<style scoped></style>
