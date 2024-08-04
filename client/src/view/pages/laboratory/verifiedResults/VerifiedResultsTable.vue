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
        <table class="table table-head-custom table-head-bg table-borderless table-vertical-center">
          <thead>
            <tr class="text-uppercase">
              <th style="min-width: 100px" class="pl-4">
                <span class="text-dark-75">Lab number</span>
              </th>
              <th style="min-width: 100px">Patient ID</th>
              <th style="min-width: 200px">Patient Name</th>
              <th style="min-width: 70px">Verified Tests</th>
              <th style="min-width: 30px">Total</th>
              <th style="min-width: 80px">Status</th>
              <th style="min-width: 100px">Date</th>
              <th class="text-right" style="min-width: 70px">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="samples.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="sample in samples" :key="sample.id">
              <td class="pl-4 py-8">
                <div class="d-flex align-items-center">
                  <div>
                    <a
                      href="#"
                      class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-md"
                      >{{ sample.accession_number }}</a
                    >
                  </div>
                </div>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ sample.patient.hospital_id }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ sample.patient.fullname }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  sample.verified_tests_count
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  sample.total
                }}</span>
              </td>
              <td>
                <span :class="getSampleStatus(sample.status)" class="label label-dot mr-2"></span>
                <span
                  :class="getSampleTextColor(sample.status)"
                  class="font-size-sm font-weight-bold"
                  >{{ sample.status }}</span
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                  sample.date_sample_received | dayjs('DD/MM/YYYY, h:mma')
                }}</span>
              </td>
              <td class="text-right pr-0">
                <router-link
                  :class="{ disabled: sample.verified_tests_count === 0 }"
                  v-b-tooltip.hover
                  title="Approve"
                  :to="`/laboratory/result-approval/${sample.id}`"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm"
                >
                  <ApproveIcon />
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
    <table-skeleton v-else :columns="9" />
  </div>
</template>

<script>
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import Search from '@/utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import ApproveIcon from '@/assets/icons/ApproveIcon.vue';
import dayjs from 'dayjs';
import TableSkeleton from '@/view/pages/nhis/components/TableSkeleton.vue';

export default {
  components: { TableSkeleton, ApproveIcon, Pagination, Search },
  props: {
    period: {
      type: String,
      required: true,
    },
  },
  computed: {
    samples() {
      return this.$store.state.laboratory.verifiedTests;
    },
    queriedItems() {
      return this.$store.state.laboratory.totalVerifiedTest;
    },
    pages() {
      return this.$store.state.laboratory.totalVerifiedTestPages;
    },
    perPage() {
      return this.samples.length;
    },
  },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    TODAY: 'Today',
  }),
  methods: {
    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      });
      this.fetchVerifiedResults({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
        start: this.$route.query.startDate || null,
        end: this.$route.query.endDate || null,
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
      this.fetchVerifiedResults({
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
      vm.fetchVerifiedResults({
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
      this.fetchVerifiedResults({
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

    fetchVerifiedResults({ currentPage, itemsPerPage, search, start, end }) {
      return this.$store.dispatch('laboratory/fetchVerifiedResults', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
        ...(start && end && { start, end }),
        period: this.period,
      });
    },
  },
  watch: {
    period: {
      handler() {
        this.fetchVerifiedResults({
          currentPage: this.$route.query.currentPage || this.currentPage,
          itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
          start: this.$route.query.startDate || null,
          end: this.$route.query.endDate || null,
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

.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
