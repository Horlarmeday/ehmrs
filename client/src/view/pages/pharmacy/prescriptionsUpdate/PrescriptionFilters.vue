<template>
  <div class="prescription-filters">
    <!-- Filter Controls -->
    <div class="card-body py-4">
      <div class="row align-items-center">
        <!-- Status Filter -->
        <div class="col-lg-2 col-md-6 mb-3 mb-md-0">
          <label class="font-weight-bold text-dark mb-2">Status</label>
          <b-form-select
            v-model="localStatus"
            :options="statusOptions"
            class="form-control"
            @change="onStatusChange"
          >
          </b-form-select>
        </div>

        <!-- Search Input -->
        <div class="col-lg-3 col-md-6 mb-3 mb-md-0">
          <label class="font-weight-bold text-dark mb-2">Search</label>
          <div ref="spin">
            <input
              type="text"
              class="form-control"
              placeholder="Search by patient name or ID"
              v-model="localSearch"
              @keyup="onSearch"
            />
          </div>
        </div>

        <!-- Date Range -->
        <div class="col-lg-6 col-md-6 mb-3 mb-md-0">
          <label class="font-weight-bold text-dark mb-2">Date Range</label>
          <DateRange @searchByDate="onSearchByDate" />
        </div>

        <!-- Clear Filters Button -->
        <div class="col-lg-1 col-md-6 mb-3 mb-md-0">
          <button
            v-if="hasActiveFilters"
            @click="clearAllFilters"
            class="btn btn-light-danger btn-sm"
          >
            <i class="flaticon2-delete"></i>
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Active Filter Badges -->
    <div v-if="hasActiveFilters" class="card-body pt-0 pb-4">
      <div class="d-flex align-items-center flex-wrap">
        <span class="text-muted mr-2 font-weight-bold">Active Filters:</span>
        <span
          v-if="localStatus && localStatus !== 'all'"
          class="badge badge-light-primary mr-2 mb-2"
        >
          Status: {{ getStatusLabel(localStatus) }}
          <i class="ki ki-close ml-1 cursor-pointer" @click="clearStatus"></i>
        </span>
        <span v-if="localSearch" class="badge badge-light-info mr-2 mb-2">
          Search: "{{ localSearch }}"
          <i class="ki ki-close ml-1 cursor-pointer" @click="clearSearch"></i>
        </span>
        <span v-if="dateRange.start || dateRange.end" class="badge badge-light-success mr-2 mb-2">
          Date: {{ formatDateRange() }}
          <i class="ki ki-close ml-1 cursor-pointer" @click="clearDateFilter"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { addSpinner } from '@/common/common';
import DateRange from '@/utils/DateRange.vue';
import dayjs from 'dayjs';

export default {
  name: 'PrescriptionFilters',
  components: { DateRange },
  props: {
    status: {
      type: String,
      default: null,
    },
    search: {
      type: String,
      default: '',
    },
    startDate: {
      type: String,
      default: null,
    },
    endDate: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      localStatus: this.status || 'all',
      localSearch: this.search || '',
      dateRange: {
        start: this.startDate || null,
        end: this.endDate || null,
      },
      statusOptions: [
        { value: 'all', text: 'All Statuses' },
        { value: 'Pending', text: 'Pending' },
        { value: 'Partial Dispense', text: 'Partial Dispense' },
        { value: 'Complete Dispense', text: 'Complete Dispense' },
      ],
    };
  },
  computed: {
    hasActiveFilters() {
      return (
        (this.localStatus && this.localStatus !== 'all') ||
        this.localSearch ||
        this.dateRange.start ||
        this.dateRange.end
      );
    },
  },
  watch: {
    status(newVal) {
      this.localStatus = newVal || 'all';
    },
    search(newVal) {
      this.localSearch = newVal || '';
    },
    startDate(newVal) {
      this.dateRange.start = newVal || null;
    },
    endDate(newVal) {
      this.dateRange.end = newVal || null;
    },
  },
  methods: {
    getStatusLabel(status) {
      const option = this.statusOptions.find((opt) => opt.value === status);
      return option ? option.text : status;
    },
    onStatusChange() {
      this.$emit('status-change', this.localStatus === 'all' ? null : this.localStatus);
    },
    onSearch() {
      const spinDiv = this.$refs['spin'];
      addSpinner(spinDiv);
      this.$emit('search', { search: this.localSearch, spinDiv });
    },
    onSearchByDate(range) {
      const { start, end, dateSpin } = range;
      this.dateRange = { start, end };
      this.$emit('filter-by-date', { start, end, dateSpin });
    },
    clearStatus() {
      this.localStatus = 'all';
      this.onStatusChange();
    },
    clearSearch() {
      this.localSearch = '';
      const spinDiv = this.$refs['spin'];
      addSpinner(spinDiv);
      this.$emit('search', { search: '', spinDiv });
    },
    clearDateFilter() {
      this.dateRange = { start: null, end: null };
      this.$emit('filter-by-date', { start: null, end: null, dateSpin: null });
    },
    clearAllFilters() {
      this.clearStatus();
      this.clearSearch();
      this.clearDateFilter();
    },
    formatDateRange() {
      if (!this.dateRange.start && !this.dateRange.end) return '';
      if (this.dateRange.start && this.dateRange.end) {
        return `${dayjs(this.dateRange.start).format('MMM DD, YYYY')} - ${dayjs(
          this.dateRange.end
        ).format('MMM DD, YYYY')}`;
      }
      if (this.dateRange.start) {
        return `From ${dayjs(this.dateRange.start).format('MMM DD, YYYY')}`;
      }
      if (this.dateRange.end) {
        return `Until ${dayjs(this.dateRange.end).format('MMM DD, YYYY')}`;
      }
      return '';
    },
  },
};
</script>

<style scoped>
.prescription-filters {
  background: #fff;
}

.cursor-pointer {
  cursor: pointer;
}

.badge {
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
}

.badge .ki-close {
  font-size: 0.8rem;
  margin-left: 0.25rem;
}

.badge .ki-close:hover {
  opacity: 0.8;
}
</style>
