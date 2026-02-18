<template>
  <div class="date-picker-wrapper">
    <datepicker
      v-model="dateValue"
      :range="range"
      :format="format"
      :input-class="inputClass"
      :placeholder="placeholder"
      :disabled-dates="disabledDates"
      :calendar-class="calendarClass"
      :wrapper-class="wrapperClass"
      @input="handleInput"
      @closed="handleClosed"
    />
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';

export default {
  name: 'DatePicker',
  components: {
    Datepicker,
  },
  props: {
    value: {
      type: [Date, Array],
      default: () => new Date(),
    },
    range: {
      type: Boolean,
      default: false,
    },
    format: {
      type: String,
      default: 'yyyy-MM-dd',
    },
    placeholder: {
      type: String,
      default: 'Select date',
    },
    disabledDates: {
      type: Object,
      default: () => ({}),
    },
    inputClass: {
      type: String,
      default: 'form-control',
    },
    calendarClass: {
      type: String,
      default: 'datepicker-calendar',
    },
    wrapperClass: {
      type: String,
      default: 'datepicker-wrapper',
    },
  },
  data() {
    return {
      dateValue: this.value,
    };
  },
  watch: {
    value: {
      handler(newValue) {
        this.dateValue = newValue;
      },
      deep: true,
    },
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value);
      this.$emit('change', value);
    },
    handleClosed() {
      this.$emit('closed');
    },
  },
};
</script>

<style lang="scss" scoped>
.date-picker-wrapper {
  position: relative;
  display: inline-block;

  :deep(.datepicker-wrapper) {
    width: 100%;
  }

  :deep(.datepicker-calendar) {
    border: 1px solid #e4e6ef;
    border-radius: 0.42rem;
    box-shadow: 0 0 50px 0 rgba(82, 63, 105, 0.15);
    background-color: #ffffff;
    padding: 0.5rem;
    margin-top: 0.5rem;
    z-index: 1000;

    .cell {
      &:hover {
        background-color: #f3f6f9;
      }

      &.selected {
        background-color: #00acc1;
        color: #ffffff;
      }

      &.in-range {
        background-color: #e0f7fa;
      }
    }

    .day-header {
      color: #3f4254;
      font-weight: 500;
    }

    .month-picker {
      select {
        border: 1px solid #e4e6ef;
        border-radius: 0.42rem;
        padding: 0.5rem;
        background-color: #ffffff;
        color: #3f4254;
        font-weight: 500;
      }
    }

    .year-picker {
      select {
        border: 1px solid #e4e6ef;
        border-radius: 0.42rem;
        padding: 0.5rem;
        background-color: #ffffff;
        color: #3f4254;
        font-weight: 500;
      }
    }
  }
}
</style>
