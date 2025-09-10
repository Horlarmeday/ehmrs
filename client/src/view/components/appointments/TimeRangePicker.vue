<template>
  <div class="time-range-picker">
    <div class="row">
      <div class="col-md-6">
        <label class="form-label">{{ startLabel || 'Start Time' }}</label>
        <select class="form-control" v-model="internalStartTime" @change="updateRange">
          <option value="">Select start time</option>
          <option
            v-for="time in timeOptions"
            :key="'start-' + time.value"
            :value="time.value"
            :disabled="endTime && time.value >= endTime"
          >
            {{ time.label }}
          </option>
        </select>
      </div>

      <div class="col-md-6">
        <label class="form-label">{{ endLabel || 'End Time' }}</label>
        <select class="form-control" v-model="internalEndTime" @change="updateRange">
          <option value="">Select end time</option>
          <option
            v-for="time in timeOptions"
            :key="'end-' + time.value"
            :value="time.value"
            :disabled="startTime && time.value <= startTime"
          >
            {{ time.label }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="showDuration && startTime && endTime" class="mt-2">
      <small class="text-muted">
        <i class="fas fa-clock"></i> Duration: {{ calculateDuration() }}
      </small>
    </div>

    <div v-if="error" class="mt-2">
      <small class="text-danger">{{ error }}</small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimeRangePicker',
  props: {
    startTime: {
      type: String,
      default: '',
    },
    endTime: {
      type: String,
      default: '',
    },
    startLabel: {
      type: String,
      default: 'Start Time',
    },
    endLabel: {
      type: String,
      default: 'End Time',
    },
    interval: {
      type: Number,
      default: 15,
    },
    minTime: {
      type: String,
      default: '00:00',
    },
    maxTime: {
      type: String,
      default: '23:59',
    },
    showDuration: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      internalStartTime: this.startTime,
      internalEndTime: this.endTime,
      error: null,
    };
  },
  computed: {
    timeOptions() {
      const options = [];
      const start = this.parseTime(this.minTime);
      const end = this.parseTime(this.maxTime);

      for (let minutes = start; minutes <= end; minutes += this.interval) {
        const timeString = this.formatTimeFromMinutes(minutes);
        const displayTime = this.formatTime(timeString);

        options.push({
          value: timeString,
          label: displayTime,
        });
      }

      return options;
    },
  },
  watch: {
    startTime(newVal) {
      this.internalStartTime = newVal;
    },
    endTime(newVal) {
      this.internalEndTime = newVal;
    },
  },
  methods: {
    updateRange() {
      this.error = null;

      if (this.internalStartTime && this.internalEndTime) {
        const startMinutes = this.parseTime(this.internalStartTime);
        const endMinutes = this.parseTime(this.internalEndTime);

        if (startMinutes >= endMinutes) {
          this.error = 'End time must be after start time';
          return;
        }
      }

      this.$emit('update:startTime', this.internalStartTime);
      this.$emit('update:endTime', this.internalEndTime);
      this.$emit('change', {
        startTime: this.internalStartTime,
        endTime: this.internalEndTime,
      });
    },

    calculateDuration() {
      if (!this.internalStartTime || !this.internalEndTime) return '';

      const startMinutes = this.parseTime(this.internalStartTime);
      const endMinutes = this.parseTime(this.internalEndTime);
      const duration = endMinutes - startMinutes;

      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;

      let result = '';
      if (hours > 0) {
        result += `${hours}h`;
      }
      if (minutes > 0) {
        result += `${minutes}m`;
      }

      return result || '0m';
    },

    parseTime(timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    },

    formatTimeFromMinutes(minutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    },

    formatTime(time) {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    },
  },
};
</script>

<style scoped>
.time-range-picker .form-control {
  border-radius: 6px;
}

.time-range-picker .form-label {
  font-weight: 600;
  color: #5a5c69;
  margin-bottom: 0.5rem;
}
</style>
