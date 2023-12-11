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
              <th style="min-width: 150px" class="pl-7">
                <span class="text-dark-75">Patient ID</span>
              </th>
              <th style="min-width: 200px">Patient Name</th>
              <th style="min-width: 150px">Total Tests</th>
              <th style="min-width: 150px">Status</th>
              <th class="text-right" style="min-width: 130px">Action</th>
              <th style="min-width: 120px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="samples.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="sample in samples" :key="sample.id">
              <td class="pl-7 py-8">
                <div class="d-flex align-items-center">
                  <div>
                    <a
                      href="#"
                      class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                      >{{ sample.patient.hospital_id }}</a
                    >
                  </div>
                </div>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ sample.patient.fullname }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg pl-7">
                  {{ sample.test_count }}
                </span>
              </td>
              <td>
                <span :class="getSampleStatus(sample.status)" class="label label-lg label-inline">{{
                  sample.status
                }}</span>
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
      />
    </div>
    <div v-else>
      <b-progress :value="count" variant="primary" show-progress animated :max="200" />
    </div>
  </div>
</template>

<script>
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import Search from '../../../../utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import dayjs from 'dayjs';

export default {
  components: { Pagination, ArrowRightIcon, Search },
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
    getSampleStatus(status) {
      if (status === 'Pending') return 'label-light-warning ';
      if (status === 'Completed') return 'label-light-success ';
      return 'label-light-primary ';
    },

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
      this.$store.dispatch('laboratory/fetchSamplesToCollect', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        period: this.period,
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
        .dispatch('laboratory/fetchSamplesToCollect', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
          period: this.period,
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
      this.$store
        .dispatch('laboratory/fetchSamplesToCollect', {
          currentPage: this.currentPage,
          itemsPerPage: this.itemsPerPage,
          start: this.$route.query.startDate,
          end: this.$route.query.endDate,
          period: this.period,
        })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    countToHundred() {
      for (let i = 1; i <= 100; i++) {
        this.count = i;
        if (this.samples.length) break;
      }
    },
  },
  created() {
    this.loading = true;
    this.countToHundred();
    this.$store
      .dispatch('laboratory/fetchSamplesToCollect', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
        start: this.$route.query.startDate || null,
        end: this.$route.query.endDate || null,
        period: this.period,
      })
      .then(() => (this.loading = false));
  },
};
</script>

<style scoped>
.card-body {
  padding: 0;
}
</style>
