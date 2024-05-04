<template>
  <div>
    <div v-if="investigations">
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
              <th style="min-width: 150px" class="pl-4">
                <span class="text-dark-75">Patient ID</span>
              </th>
              <th style="min-width: 250px">Patient Name</th>
              <th style="min-width: 100px">Pending Tests</th>
              <th style="min-width: 100px">Scan Tests</th>
              <th style="min-width: 100px">Xray Tests</th>
              <th style="min-width: 100px">Total</th>
              <th style="min-width: 100px">Status</th>
              <th style="min-width: 100px">Date Requested</th>
              <th class="pr-0 text-right" style="min-width: 120px">Action</th>
            </tr>
          </thead>
          <tbody v-if="investigations.length === 0">
            <tr>
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
          </tbody>
          <tbody v-for="investigation in investigations" :key="investigation.id">
            <tr :class="{ disabled: investigation.total === investigation.total_pending_payments }">
              <td class="pl-4 py-8">
                <div class="d-flex align-items-center">
                  <div>
                    <a
                      href="#"
                      class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-md"
                      >{{ investigation.patient.hospital_id }}</a
                    >
                  </div>
                </div>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ investigation.patient.fullname }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ investigation.pending_investigations_count }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  investigation.scan_investigations_count
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  investigation.xray_investigations_count
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  investigation.total
                }}</span>
              </td>
              <td>
                <span
                  :class="getInvestigationStatus(investigation.status)"
                  class="label label-dot mr-2"
                ></span>
                <span
                  :class="getInvestigationTextColor(investigation.status)"
                  class="font-size-sm font-weight-bold"
                  >{{ investigation.status }}</span
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                  investigation.date_requested | dayjs('DD/MM/YYYY, h:mma')
                }}</span>
              </td>
              <td class="text-right pr-0">
                <router-link
                  :class="{ disabled: investigation.pending_investigations_count === 0 }"
                  v-b-tooltip.hover
                  title="Result"
                  :to="`/radiology/add-test-result/${investigation.id}`"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mr-1"
                >
                  <ArrowRightIcon />
                </router-link>
                <router-link
                  :class="{ disabled: investigation.pending_approvals_count === 0 }"
                  v-b-tooltip.hover
                  title="Approve"
                  :to="`/radiology/result-approval/${investigation.id}`"
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
      />
    </div>
    <table-skeleton v-else :columns="7" />
  </div>
</template>
<script>
import ApproveIcon from '@/assets/icons/ApproveIcon.vue';
import Search from '@/utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import dayjs from 'dayjs';
import TableSkeleton from '@/view/pages/nhis/components/TableSkeleton.vue';

export default {
  computed: {
    investigations() {
      return this.$store.state.radiology.reqInvestigations;
    },
    queriedItems() {
      return this.$store.state.radiology.totalReqInvestigation;
    },
    pages() {
      return this.$store.state.radiology.totalReqInvestigationPages;
    },
    perPage() {
      return this.investigations.length;
    },
  },
  components: { TableSkeleton, ArrowRightIcon, Pagination, Search, ApproveIcon },
  props: {
    period: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    start: null,
    end: null,
  }),

  methods: {
    getInvestigationStatus(status) {
      if (status === 'Pending') return 'label-warning ';
      if (status === 'Completed') return 'label-success ';
      return 'label-primary ';
    },

    getInvestigationTextColor(type) {
      if (type === 'Pending') return 'text-warning';
      if (type === 'Completed') return 'text-success';
      return 'text-primary';
    },

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
      this.fetchRequestedInvestigations({
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

    searchByDate(range) {
      const { start, end, dateSpin } = range;
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
      });
      this.fetchRequestedInvestigations({
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
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
      vm.fetchRequestedInvestigations({
        currentPage: 1,
        itemsPerPage: vm.itemsPerPage,
        search,
      })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    fetchRequestedInvestigations({ currentPage, itemsPerPage, search, start, end }) {
      return this.$store.dispatch('radiology/fetchRequestedInvestigations', {
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
        this.fetchRequestedInvestigations({
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
tr.disabled {
  pointer-events: none; /* Disable pointer events to prevent interaction */
  opacity: 0.5; /* Optionally, reduce the opacity to visually indicate the disabled state */
}
</style>
