<template>
  <div>
    <div v-if="!loading">
      <div class="mt-3">
        <search
          @search="onHandleSearch"
          @filterByDateRange="searchByDate"
          :show-date-filter="true"
        />
      </div>
      <div class="table-responsive">
        <table class="table table-head-custom table-head-bg table-borderless table-vertical-center">
          <thead>
            <tr class="text-uppercase">
              <th style="min-width: 100px" class="pl-7">
                <span class="text-dark-75">Patient ID</span>
              </th>
              <th style="min-width: 250px">Patient Name</th>
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
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                  result.date_requested | moment('DD/MM/YYYY, h:mma')
                }}</span>
              </td>
              <td class="text-right">
                <router-link
                  v-b-tooltip.hover
                  title="Approve"
                  :to="`/radiology/investigations-results/${result.id}`"
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
    <div v-else>
      <b-progress :value="count" variant="primary" show-progress animated :max="200" />
    </div>
  </div>
</template>

<script>
import { debounce, removeSpinner } from '@/common/common';
import Search from '@/utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';

export default {
  components: { ArrowRightIcon, Pagination, Search },
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
    loading: false,
    count: 0,
    start: null,
    end: null,
  }),
  methods: {
    handlePageChange() {
      this.$store.dispatch('radiology/fetchInvestigationsResults', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        period: this.period,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('radiology/fetchInvestigationsResults', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          period: this.period,
          search,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    searchByDate(range) {
      const { start, end, dateSpin } = range;
      this.end = end;
      this.start = start;
      this.currentPage = 1;
      this.$store
        .dispatch('radiology/fetchInvestigationsResults', {
          currentPage: this.currentPage,
          itemsPerPage: this.itemsPerPage,
          start: new Date(this.start).toISOString(),
          end: new Date(this.end).toISOString(),
        })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    countToHundred() {
      for (let i = 1; i <= 100; i++) {
        this.count = i;
        if (this.results.length) break;
      }
    },
  },
  created() {
    this.loading = true;
    this.countToHundred();
    this.$store
      .dispatch('radiology/fetchInvestigationsResults', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      })
      .then(() => (this.loading = false));
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