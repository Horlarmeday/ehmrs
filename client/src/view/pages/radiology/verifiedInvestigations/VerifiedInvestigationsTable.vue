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
                <span :class="getSampleStatus(investigation.status)" class="label label-dot mr-2"></span>
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
    <div v-else>
      <b-progress :value="count" variant="primary" show-progress animated :max="200" />
    </div>
  </div>
</template>

<script>
import { debounce, removeSpinner } from '@/common/common';
import Search from '@/utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import ApproveIcon from '@/assets/icons/ApproveIcon.vue';

export default {
  components: { ApproveIcon, Pagination, Search },
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
    loading: false,
    count: 0,
    start: null,
    end: null,
  }),
  methods: {
    handlePageChange() {
      this.$store.dispatch('radiology/fetchInvestigationsApproval', {
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
        .dispatch('radiology/fetchInvestigationsApproval', {
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
        .dispatch('radiology/fetchInvestigationsApproval', {
          currentPage: this.currentPage,
          itemsPerPage: this.itemsPerPage,
          start: new Date(this.start).toISOString(),
          end: new Date(this.end).toISOString(),
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

    countToHundred() {
      for (let i = 1; i <= 100; i++) {
        this.count = i;
        if (this.investigations.length) break;
      }
    },
  },
  created() {
    this.loading = true;
    this.countToHundred();
    this.$store
      .dispatch('radiology/fetchInvestigationsApproval', {
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
