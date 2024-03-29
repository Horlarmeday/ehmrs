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
        <table class="table table-head-custom table-head-bg table-vertical-center">
          <thead>
            <tr class="text-uppercase">
              <th style="min-width: 100px" class="pl-7">
                <span class="text-dark-75">Patient ID</span>
              </th>
              <th style="min-width: 250px">Patient Name</th>
              <th style="min-width: 100px">Pending Approval</th>
              <th style="min-width: 100px">Total</th>
              <th style="min-width: 100px">Status</th>
              <th style="min-width: 100px">Date</th>
              <th class="text-right" style="min-width: 120px">Action</th>
              <th style="min-width: 20px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="investigations.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="investigation in investigations" :key="investigation.id">
              <td class="pl-7 py-8">
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
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  investigation.pending_approvals_count
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  investigation.total
                }}</span>
              </td>
              <td>
                <span
                  :class="getSampleStatus(investigation.status)"
                  class="label label-dot mr-2"
                ></span>
                <span
                  :class="getSampleTextColor(investigation.status)"
                  class="font-size-sm font-weight-bold"
                  >{{ investigation.status }}</span
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                  investigation.date_requested | dayjs('DD/MM/YYYY, h:mma')
                }}</span>
              </td>
              <td class="text-right">
                <router-link
                  :class="{ disabled: !investigation.pending_approvals_count }"
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
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import Search from '@/utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import ApproveIcon from '@/assets/icons/ApproveIcon.vue';
import dayjs from 'dayjs';
import TableSkeleton from '@/view/pages/nhis/components/TableSkeleton.vue';

export default {
  components: { TableSkeleton, ApproveIcon, Pagination, Search },
  computed: {
    investigations() {
      return this.$store.state.radiology.investigationsApprovals;
    },
    queriedItems() {
      return this.$store.state.radiology.totalInvestigationsApproval;
    },
    pages() {
      return this.$store.state.radiology.totalInvestigationsApprovalPages;
    },
    perPage() {
      return this.investigations.length;
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
      this.fetchInvestigationsApproval({
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
      vm.fetchInvestigationsApproval({
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
      this.fetchInvestigationsApproval({
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
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

    fetchInvestigationsApproval({ currentPage, itemsPerPage, search, start, end }) {
      return this.$store.dispatch('radiology/fetchInvestigationsApproval', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
        ...(start && end && { start, end }),
      });
    },
  },
  created() {
    this.fetchInvestigationsApproval({
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
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
