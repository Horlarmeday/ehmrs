<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Queue</span>
      </h3>
    </div>
    <div class="card-body">
      <div class="mt-3">
        <search
          @search="onHandleSearch"
          @filterByDateRange="searchByDate"
          :show-date-filter="currentUser.department !== MEDICAL_PRACTITIONER"
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

export default {
  name: 'AssignedVisits',
  components: { QueueTable, Search },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    loading: false,
    start: null,
    end: null,
    MEDICAL_PRACTITIONER: 'Medical Practitioners',
    currentUser: parseJwt(localStorage.getItem('user_token')),
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
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
      });
      this.fetchQueue({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
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
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search,
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
      });
      this.fetchQueue({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    onChangePageCount(pagecount) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: pagecount,
        search: this.$route.query.search,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
      });
      this.fetchQueue({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: pagecount,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search || null,
      });
    },

    fetchQueue({ currentPage = 1, itemsPerPage = 10, search, start = null, end = null }) {
      return this.$store.dispatch('visit/fetchProfessionalVisits', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
        ...(start && end && { start, end }),
        ...(this.filter && { filter: this.filter }),
      });
    },

    todayDate() {
      if (this.currentUser.department === this.MEDICAL_PRACTITIONER) {
        return {
          startDate: dayjs()
            .startOf('day')
            .format('YYYY-MM-DD'),
          endDate: dayjs()
            .endOf('day')
            .format('YYYY-MM-DD'),
        };
      }
      return null;
    },
  },
  created() {
    this.fetchQueue({
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      search: this.$route.query.search || null,
      start: this.todayDate().startDate || this.$route.query.startDate,
      end: this.todayDate().endDate || this.$route.query.endDate,
    });
  },
};
</script>

<style scoped></style>
