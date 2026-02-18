<template>
  <div class="prescriptions-page">
    <!-- Statistics Cards -->
    <prescription-stats :stats="prescriptionStatistics" @stat-click="handleStatClick" />

    <!-- Tab Navigation -->
    <div class="card card-custom mb-6">
      <div class="card-header border-0">
        <div class="card-title">
          <ul class="nav nav-tabs nav-tabs-line" role="tablist">
            <li
              class="nav-item"
              v-for="(tab, index) in tabs"
              :key="index"
              @click="setActiveTab(index, tab.period)"
            >
              <a
                class="nav-link"
                :class="{ active: tabIndex === index }"
                href="#"
                @click.prevent
                role="tab"
              >
                {{ tab.name }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Filters and Table -->
    <div class="card card-custom gutter-b">
      <div class="card-header border-0 py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Prescriptions List</span>
          <span class="text-muted mt-1 font-weight-normal font-size-sm">
            {{ queriedItems }} total prescriptions
          </span>
        </h3>
      </div>

      <prescription-filters
        :status="currentStatus"
        :search="currentSearch"
        :start-date="startDate"
        :end-date="endDate"
        @status-change="onStatusChange"
        @search="onHandleSearch"
        @filter-by-date="onFilterByDate"
      />

      <prescriptions-table
        :prescriptions="prescriptions"
        :queried-items="queriedItems"
        :pages="pages"
        :current-page="currentPage"
        :per-page="perPage"
        @page-change="onPageChange"
        @page-count-change="handlePageCount"
      />
    </div>
  </div>
</template>

<script>
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import { mapState, mapActions } from 'vuex';
import PrescriptionFilters from './PrescriptionFilters.vue';
import PrescriptionStats from './PrescriptionStats.vue';
import PrescriptionsTable from './PrescriptionsTable.vue';
import dayjs from 'dayjs';

export default {
  name: 'PrescriptionsPage',
  components: {
    PrescriptionFilters,
    PrescriptionStats,
    PrescriptionsTable,
  },
  data() {
    return {
      tabIndex: 0,
      period: 'Today',
      currentPage: 1,
      itemsPerPage: 30,
      currentStatus: null,
      currentSearch: '',
      startDate: null,
      endDate: null,
      loading: false,
      pendingSpinner: null,
      isInitialLoad: true,
      tabs: [
        {
          name: 'Today',
          period: 'Today',
        },
        {
          name: 'Backlog',
          period: 'Backlog',
        },
      ],
    };
  },
  computed: {
    ...mapState('pharmacy', [
      'prescriptions',
      'totalPrescription',
      'prescriptionPages',
      'prescriptionStatistics',
    ]),
    queriedItems() {
      return this.totalPrescription || 0;
    },
    pages() {
      return this.prescriptionPages || 0;
    },
    perPage() {
      return this.prescriptions.length || this.itemsPerPage;
    },
  },
  methods: {
    ...mapActions('pharmacy', ['fetchPrescriptionStatistics']),
    setActiveTab(index, period) {
      this.tabIndex = index;
      this.period = period;
      this.currentPage = 1;
      this.$router.push({
        query: {
          ...this.$route.query,
          period,
          tabIndex: index,
          currentPage: 1,
        },
      });
    },
    handleStatClick(status) {
      this.currentStatus = status;
      this.currentPage = 1;
      setUrlQueryParams({
        ...this.$route.query,
        status: status || null,
        currentPage: 1,
      });
    },
    onStatusChange(status) {
      this.currentStatus = status;
      this.currentPage = 1;
      setUrlQueryParams({
        ...this.$route.query,
        status: status || null,
        currentPage: 1,
      });
    },
    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      this.currentSearch = search;
      this.currentPage = 1;
      this.debounceSearch(search, this, spinDiv);
    },
    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.pendingSpinner = spinDiv;
      setUrlQueryParams({
        ...vm.$route.query,
        search: search || null,
        currentPage: 1,
      });
    }, 500),
    onFilterByDate(range) {
      const { start, end, dateSpin } = range;
      this.startDate = start;
      this.endDate = end;
      this.currentPage = 1;
      this.pendingSpinner = dateSpin;
      setUrlQueryParams({
        ...this.$route.query,
        startDate: start ? dayjs(start).format('YYYY-MM-DD') : null,
        endDate: end ? dayjs(end).format('YYYY-MM-DD') : null,
        currentPage: 1,
      });
    },
    onPageChange(page) {
      this.currentPage = page;
      setUrlQueryParams({
        ...this.$route.query,
        currentPage: page,
      });
    },
    handlePageCount(count) {
      this.itemsPerPage = count;
      this.currentPage = 1;
      setUrlQueryParams({
        ...this.$route.query,
        itemsPerPage: count,
        currentPage: 1,
      });
    },
    fetchPrescriptions() {
      return this.$store.dispatch('pharmacy/fetchPrescriptions', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        period: this.period,
        status: this.currentStatus,
        search: this.currentSearch || null,
        start: this.startDate || null,
        end: this.endDate || null,
      });
    },
    fetchStatistics() {
      this.fetchPrescriptionStatistics({
        period: this.period,
        start: this.startDate || null,
        end: this.endDate || null,
      });
    },
    refreshData() {
      this.loading = true;
      Promise.all([this.fetchPrescriptions(), this.fetchStatistics()]).finally(() => {
        this.loading = false;
      });
    },
    initializeFromRoute() {
      const query = this.$route.query;
      this.currentPage = parseInt(query.currentPage) || 1;
      this.itemsPerPage = parseInt(query.itemsPerPage) || 30;
      this.currentStatus = query.status || null;
      this.currentSearch = query.search || '';
      this.startDate = query.startDate || null;
      this.endDate = query.endDate || null;
      this.period = query.period || 'Today';
      this.tabIndex = parseInt(query.tabIndex) || 0;
    },
  },
  created() {
    this.initializeFromRoute();
    this.fetchPrescriptions();
    this.fetchStatistics();
    this.isInitialLoad = false;
  },
  watch: {
    '$route.query'() {
      this.initializeFromRoute();
      // Skip fetch on initial load (handled by created hook)
      if (this.isInitialLoad) {
        this.isInitialLoad = false;
        return;
      }
      const spinner = this.pendingSpinner;
      this.pendingSpinner = null;
      Promise.all([this.fetchPrescriptions(), this.fetchStatistics()]).finally(() => {
        if (spinner) {
          removeSpinner(spinner);
        }
      });
    },
  },
};
</script>

<style scoped>
.prescriptions-page {
  padding: 0;
}

.header-section {
  background: #fff;
  padding: 1.5rem 0;
}

.nav-tabs .nav-link {
  color: #5e6278;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 1rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-tabs .nav-link:hover {
  color: #00acc1;
  border-bottom-color: #e4e6ef;
}

.nav-tabs .nav-link.active {
  color: #00acc1;
  border-bottom-color: #00acc1;
  font-weight: 600;
}

.card-custom {
  box-shadow: 0 0 20px 0 rgba(76, 87, 125, 0.02);
  border: none;
}

.card-header {
  background: #fff;
}

.fa-spin {
  animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
