<template>
  <div class="card card-custom gutter-b">
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Approved Results</span>
      </h3>
    </div>
    <div class="card-body">
      <div>
        <div class="mt-3">
          <search
            @search="onHandleSearch"
            @filterByDateRange="searchByDate"
            :show-date-filter="true"
          />
        </div>
        <div class="table-responsive">
          <table class="table table-head-custom table-head-bg table-vertical-center">
            <thead>
              <tr class="text-uppercase">
                <th style="min-width: 80px" class="pl-2">
                  <span class="text-dark-75">Lab number</span>
                </th>
                <th style="min-width: 100px">Patient ID</th>
                <th style="min-width: 200px">Patient Name</th>
                <th style="min-width: 80px">Result Status</th>
                <th style="min-width: 100px">Date Collected</th>
                <th class="text-right" style="min-width: 120px">Action</th>
              </tr>
            </thead>
            <tbody v-if="results.length === 0">
              <tr>
                <td colspan="9" align="center" class="text-muted">No Data</td>
              </tr>
            </tbody>
            <tbody v-for="result in results" :key="result.id">
              <tr>
                <td class="pl-2 py-8">
                  <div class="d-flex align-items-center">
                    <div>
                      <span
                        v-b-tooltip.hover
                        :title="result?.patient?.insurances?.[0]?.insurance?.name"
                        class="label label-dot label-lg mr-2"
                        :class="
                          getPatientDotStatus(result?.patient?.insurances?.[0]?.insurance?.name)
                        "
                      ></span>
                      <a
                        href="#"
                        class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-md"
                        >{{ result.accession_number }}</a
                      >
                    </div>
                  </div>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                    {{ result.patient.hospital_id }}
                  </span>
                </td>
                <td>
                  <router-link :to="`/patient/profile/${result.patient_id}`">
                    <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                      {{ result.patient.fullname }}
                    </span>
                  </router-link>
                </td>
                <td>
                  <span :class="getSampleStatus(result.status)" class="label label-dot mr-2"></span>
                  <span
                    :class="getSampleTextColor(result.status)"
                    class="font-size-sm font-weight-bold"
                    >{{ result.status }}</span
                  >
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                    result.createdAt | dayjs('DD/MM/YYYY, h:mma')
                  }}</span>
                </td>
                <td class="text-right pr-0">
                  <router-link
                    v-b-tooltip.hover
                    title="Change Result Status"
                    :to="
                      `/laboratory/results-update/${result.id}?patient=${result.patient.fullname}`
                    "
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mr-1"
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
          @changepagecount="handlePageCount"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import { debounce, getPatientDotStatus, removeSpinner, setUrlQueryParams } from '@/common/common';
import Search from '@/utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import dayjs from 'dayjs';

export default {
  components: { Pagination, ArrowRightIcon, Search },
  computed: {
    results() {
      return this.$store.state.laboratory.results;
    },
    queriedItems() {
      return this.$store.state.laboratory.totalTestResults || 0;
    },
    pages() {
      return this.$store.state.laboratory.totalTestResultsPages;
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
    getPatientDotStatus,
    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
      });
      this.fetchApprovedResults({
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

    handlePageCount(count) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: count,
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
      });
      this.fetchApprovedResults({
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search || null,
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
      vm.fetchApprovedResults({
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
      this.fetchApprovedResults({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    getSampleStatus(status) {
      if (status === 'Pending') return 'label-warning ';
      if (status === 'Completed') return 'label-success ';
      return 'label-primary ';
    },

    getSampleTextColor(type) {
      if (type === 'Pending') return 'text-warning';
      if (type === 'Completed') return 'text-success';
      return 'text-primary';
    },

    fetchApprovedResults({ currentPage, itemsPerPage, search, start, end }) {
      return this.$store.dispatch('laboratory/fetchTestResults', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
        ...(start && end && { start, end }),
      });
    },
  },
  created() {
    this.fetchApprovedResults({
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      start: this.$route.query.startDate,
      end: this.$route.query.endDate,
      search: this.$route.query.search || null,
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

tr.disabled {
  pointer-events: none; /* Disable pointer events to prevent interaction */
  opacity: 0.5; /* Optionally, reduce the opacity to visually indicate the disabled state */
}
</style>
