<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-body card-header-tabs-line">
        <h3 class="card-title align-items-start">
          <span class="card-label font-weight-bolder text-dark">Approved Results</span>
        </h3>
        <div v-if="results">
          <div class="mt-3">
            <search
              @search="onHandleSearch"
              @filterByDateRange="searchByDate"
              :show-date-filter="true"
            />
          </div>
          <div class="table-responsive">
            <table
              class="table table-head-custom table-head-bg table-borderless table-vertical-center"
            >
              <thead>
                <tr class="text-uppercase">
                  <th style="min-width: 100px" class="pl-7">
                    <span class="text-dark-75">Patient ID</span>
                  </th>
                  <th style="min-width: 250px">Patient Name</th>
                  <th style="min-width: 80px">Result Status</th>
                  <th style="min-width: 100px">Date</th>
                  <th class="text-right" style="min-width: 120px">Action</th>
                  <th style="min-width: 20px"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="results.length === 0">
                  <td colspan="9" align="center" class="text-muted">No Data</td>
                </tr>
                <tr v-for="result in results" :key="result.id">
                  <td class="pl-7 py-8">
                    <div class="d-flex align-items-center">
                      <div>
                        <a
                          href="#"
                          class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-md"
                          >{{ result.patient.hospital_id }}</a
                        >
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                      {{ result.patient.fullname }}
                    </span>
                  </td>
                  <td>
                    <span
                      :class="getResultStatus(result.status)"
                      class="label label-dot mr-2"
                    ></span>
                    <span
                      :class="getResultTextColor(result.status)"
                      class="font-size-sm font-weight-bold"
                      >{{ result.status }}</span
                    >
                  </td>
                  <td>
                    <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                      result.date_requested | dayjs('DD/MM/YYYY, h:mma')
                    }}</span>
                  </td>
                  <td class="text-right">
                    <router-link
                      v-b-tooltip.hover
                      title="View"
                      :to="`/radiology/results-update/${result.id}?patient=${result.patient.fullname}`"
                      class="btn btn-icon btn-light btn-hover-primary btn-sm"
                    >
                      <ArrowRightIcon />
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <pagination
            :total-pages="pages"
            :total="queriedItems"
            :per-page="perPage"
            :current-page="currentPage"
            @pagechanged="onPageChange"
          />
        </div>
        <table-skeleton v-else :columns="5" />
      </div>
    </div>
  </div>
</template>

<script>
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import Search from '@/utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import dayjs from 'dayjs';
import TableSkeleton from '@/view/pages/nhis/components/TableSkeleton.vue';

export default {
  components: { TableSkeleton, ArrowRightIcon, Pagination, Search },
  computed: {
    results() {
      return this.$store.state.radiology.results;
    },
    queriedItems() {
      return this.$store.state.radiology.totalInvestigationResults;
    },
    pages() {
      return this.$store.state.radiology.totalInvestigationResultsPages;
    },
    perPage() {
      return this.results.length;
    },
  },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    start: null,
    end: null,
  }),
  methods: {
    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
      this.fetchInvestigationsResults({
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
      vm.fetchInvestigationsResults({
        currentPage: 1,
        itemsPerPage: vm.itemsPerPage,
        search,
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
      this.fetchInvestigationsResults({
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    fetchInvestigationsResults({ currentPage, itemsPerPage, search, start, end }) {
      return this.$store.dispatch('radiology/fetchInvestigationsResults', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
        ...(start && end && { start, end }),
      });
    },

    getResultStatus(status) {
      if (status === 'Pending') return 'label-warning ';
      if (status === 'Completed') return 'label-success ';
      return 'label-primary ';
    },

    getResultTextColor(type) {
      if (type === 'Pending') return 'text-warning';
      if (type === 'Completed') return 'text-success';
      return 'text-primary';
    },
  },
  created() {
    this.fetchInvestigationsResults({
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      search: this.$route.query.search || null,
      start: this.$route.query.startDate || null,
      end: this.$route.query.endDate || null,
    });
  },
};
</script>

<style scoped>
.card-body {
  padding: 0;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
