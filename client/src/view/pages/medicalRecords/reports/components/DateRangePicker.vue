<template>
  <div class="date-range-picker">
    <div class="input-daterange input-group">
      <datepicker
        v-model="startDate"
        input-class="form-control"
        placeholder="Start Date"
        format="yyyy-MM-dd"
        @input="handleStartDateChange"
      ></datepicker>
      <div class="input-group-append">
        <span class="input-group-text"><i class="la la-ellipsis-h"></i></span>
      </div>
      <datepicker
        v-model="endDate"
        input-class="form-control"
        placeholder="End Date"
        format="yyyy-MM-dd"
        @input="handleEndDateChange"
      ></datepicker>
      <div class="input-group-append">
        <button
          ref="filterBtn"
          type="button"
          class="btn btn-primary"
          @click="onFilter"
          :disabled="!startDate || !endDate"
        >
          Filter
        </button>
      </div>
    </div>
    <div class="quick-ranges mt-2">
      <button
        v-for="range in quickRanges"
        :key="range.key"
        @click="setQuickRange(range)"
        class="btn btn-sm btn-outline-secondary mr-2"
      >
        {{ range.label }}
      </button>
    </div>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import dayjs from 'dayjs';

export default {
  name: 'DateRangePicker',
  components: {
    Datepicker,
  },
  props: {
    value: {
      type: Object,
      default: () => ({
        start: null,
        end: null,
      }),
    },
  },
  data() {
    return {
      startDate: this.value.start ? new Date(this.value.start) : null,
      endDate: this.value.end ? new Date(this.value.end) : null,
      quickRanges: [
        { key: 'today', label: 'Today' },
        { key: 'yesterday', label: 'Yesterday' },
        { key: 'thisWeek', label: 'This Week' },
        { key: 'thisMonth', label: 'This Month' },
        { key: 'lastMonth', label: 'Last Month' },
        { key: 'thisYear', label: 'This Year' },
      ],
    };
  },
  watch: {
    value: {
      handler(newValue) {
        if (newValue.start) {
          this.startDate = new Date(newValue.start);
        }
        if (newValue.end) {
          this.endDate = new Date(newValue.end);
        }
      },
      deep: true,
    },
  },
  methods: {
    handleStartDateChange(value) {
      this.startDate = value;
      this.emitChange();
    },
    handleEndDateChange(value) {
      this.endDate = value;
      this.emitChange();
    },
    emitChange() {
      this.$emit('input', {
        start: this.startDate ? dayjs(this.startDate).format('YYYY-MM-DD') : null,
        end: this.endDate ? dayjs(this.endDate).format('YYYY-MM-DD') : null,
      });
    },
    onFilter() {
      if (!this.startDate || !this.endDate) {
        this.$bvToast.toast('Please select both start and end dates', {
          title: 'Validation Error',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      if (this.startDate > this.endDate) {
        this.$bvToast.toast('Start date must be before end date', {
          title: 'Validation Error',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      this.emitChange();
      this.$emit('filter', {
        start: dayjs(this.startDate).format('YYYY-MM-DD'),
        end: dayjs(this.endDate).format('YYYY-MM-DD'),
      });
    },
    setQuickRange(range) {
      const today = dayjs();
      let start, end;

      switch (range.key) {
        case 'today':
          start = today.startOf('day').toDate();
          end = today.endOf('day').toDate();
          break;
        case 'yesterday':
          start = today.subtract(1, 'day').startOf('day').toDate();
          end = today.subtract(1, 'day').endOf('day').toDate();
          break;
        case 'thisWeek':
          start = today.startOf('week').toDate();
          end = today.endOf('week').toDate();
          break;
        case 'thisMonth':
          start = today.startOf('month').toDate();
          end = today.endOf('month').toDate();
          break;
        case 'lastMonth':
          start = today.subtract(1, 'month').startOf('month').toDate();
          end = today.subtract(1, 'month').endOf('month').toDate();
          break;
        case 'thisYear':
          start = today.startOf('year').toDate();
          end = today.endOf('year').toDate();
          break;
        default:
          return;
      }

      this.startDate = start;
      this.endDate = end;
      this.emitChange();
      this.$emit('filter', {
        start: dayjs(start).format('YYYY-MM-DD'),
        end: dayjs(end).format('YYYY-MM-DD'),
      });
    },
  },
};
</script>

<style scoped>
.date-range-picker {
  width: 100%;
}

.quick-ranges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quick-ranges .btn {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
}
</style>
