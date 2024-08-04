<template>
  <div>
    <div v-if="samples">
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
              <th style="min-width: 150px" class="pl-4">
                <span class="text-dark-75">Patient ID</span>
              </th>
              <th style="min-width: 200px">Patient Name</th>
              <th style="min-width: 150px">Total Tests</th>
              <th style="min-width: 150px">Source</th>
              <th style="min-width: 150px">Status</th>
              <th style="min-width: 150px">Date Requested</th>
              <th class="text-right" style="min-width: 130px">Action</th>
            </tr>
          </thead>
          <tbody v-if="samples.length === 0">
            <tr>
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
          </tbody>
          <tbody v-for="sample in samples" :key="sample.id">
            <tr>
              <td class="pl-4">
                <div class="d-flex align-items-center">
                  <div>
                    <span
                      v-b-tooltip.hover
                      :title="sample?.patient?.insurances?.[0]?.insurance?.name"
                      class="label label-dot label-lg mr-2"
                      :class="
                        getPatientDotStatus(sample?.patient?.insurances?.[0]?.insurance?.name)
                      "
                    ></span>
                    <router-link
                      :to="`/patient/profile/${sample.patient_id}`"
                      class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                      >{{ sample.patient.hospital_id }}</router-link
                    >
                  </div>
                </div>
              </td>
              <td>
                <router-link :to="`/patient/profile/${sample.patient_id}`">
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ sample.patient.fullname }}
                  </span>
                </router-link>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg pl-7">
                  {{ sample.test_count }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ sample.source }}
                </span>
              </td>
              <td>
                <span :class="getSampleStatus(sample.status)" class="label label-lg label-inline">{{
                  sample.status
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ sample.date_requested | dayjs('MMM D, YYYY h:mm A') }}
                </span>
              </td>
              <td class="text-right pr-0">
                <router-link
                  v-b-tooltip.hover
                  title="Collect Sample"
                  :to="`/laboratory/collect-sample/${sample.id}`"
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
        @changepagecount="handlePageCount"
      />
    </div>
    <table-skeleton v-else :columns="7" />
  </div>
</template>

<script>
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import { debounce, getPatientDotStatus, removeSpinner, setUrlQueryParams } from '@/common/common';
import Search from '../../../../utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import dayjs from 'dayjs';
import TableSkeleton from '@/view/pages/nhis/components/TableSkeleton.vue';

export default {
  components: { TableSkeleton, Pagination, ArrowRightIcon, Search },
  props: {
    period: {
      type: String,
      required: true,
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
  computed: {
    samples() {
      return this.$store.state.laboratory.samplesToCollect;
    },
    queriedItems() {
      return this.$store.state.laboratory.totalSamplesToCollect;
    },
    pages() {
      return this.$store.state.laboratory.totalSamplesToCollectPages;
    },
    perPage() {
      return this.samples.length;
    },
  },
  methods: {
    getPatientDotStatus,
    getSampleStatus(status) {
      if (status === 'Pending') return 'label-light-warning ';
      if (status === 'Completed') return 'label-light-success ';
      return 'label-light-primary ';
    },

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        period: this.period,
        tabIndex: this.$route.query.tabIndex,
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
      });
      this.fetchSamplesToCollect({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
        start: this.$route.query.startDate || null,
        end: this.$route.query.endDate || null,
      });
    },

    handlePageCount(count) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: count,
        period: this.period,
        tabIndex: this.$route.query.tabIndex,
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
      });
      this.fetchSamplesToCollect({
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
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
        period: this.period,
        tabIndex: this.$route.query.tabIndex,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.fetchSamplesToCollect({
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
        period: this.period,
        tabIndex: this.$route.query.tabIndex,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
      });
      this.fetchSamplesToCollect({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    fetchSamplesToCollect({ currentPage, itemsPerPage, start, end, search }) {
      return this.$store.dispatch('laboratory/fetchSamplesToCollect', {
        currentPage,
        itemsPerPage,
        ...(start && end && { start, end }),
        ...(search && { search }),
        period: this.period,
      });
    },
  },
  watch: {
    period: {
      handler() {
        this.fetchSamplesToCollect({
          currentPage: this.$route.query.currentPage || this.currentPage,
          itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
          start: this.$route.query.startDate || null,
          end: this.$route.query.endDate || null,
          search: this.$route.query.search || null,
        });
      },
      immediate: true,
    },
  },
};
</script>

<style scoped>
.card-body {
  padding: 0;
}
tr.disabled {
  pointer-events: none; /* Disable pointer events to prevent interaction */
  opacity: 0.5; /* Optionally, reduce the opacity to visually indicate the disabled state */
}
</style>
