<template>
  <div class="time-slot-picker">
    <div class="slot-picker-header">
      <h6 class="mb-0">{{ title || 'Select Time Slot' }}</h6>
      <small class="text-muted">{{
        selectedDate ? formatDate(selectedDate) : 'No date selected'
      }}</small>
    </div>

    <div class="slot-picker-body">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <small class="d-block mt-2">Loading available slots...</small>
      </div>

      <div v-else-if="!selectedDate" class="text-center py-4 text-muted">
        <i class="fas fa-calendar-day fa-2x mb-3 opacity-50"></i>
        <p class="mb-0">Please select a date first</p>
      </div>

      <div v-else-if="availableSlots.length === 0" class="text-center py-4 text-muted">
        <i class="fas fa-calendar-times fa-2x mb-3 opacity-50"></i>
        <p class="mb-0">No available time slots for this date</p>
      </div>

      <div v-else>
        <div class="time-slots-container">
          <div class="time-period" v-for="period in groupedSlots" :key="period.name">
            <div class="period-header">
              <small class="font-weight-bold text-primary">{{ period.name }}</small>
              <small class="text-muted">({{ period.slots.length }} slots)</small>
            </div>

            <div class="slots-grid">
              <button
                v-for="slot in period.slots"
                :key="slot.time"
                class="time-slot"
                :class="{
                  selected: selectedSlot && selectedSlot.time === slot.time,
                  unavailable: !slot.available,
                  booked: slot.status === 'booked',
                  blocked: slot.status === 'blocked',
                }"
                :disabled="!slot.available"
                @click="selectSlot(slot)"
              >
                <span class="slot-time">{{ formatTime(slot.time) }}</span>
                <span v-if="slot.doctorName" class="slot-doctor">{{ slot.doctorName }}</span>
                <span class="slot-status" v-if="!slot.available">
                  <i v-if="slot.status === 'booked'" class="fas fa-user-check"></i>
                  <i v-else-if="slot.status === 'blocked'" class="fas fa-ban"></i>
                  <i v-else class="fas fa-times"></i>
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="slot-legend mt-3">
          <div class="legend-items">
            <div class="legend-item">
              <div class="legend-color available"></div>
              <small>Available</small>
            </div>
            <div class="legend-item">
              <div class="legend-color selected"></div>
              <small>Selected</small>
            </div>
            <div class="legend-item">
              <div class="legend-color booked"></div>
              <small>Booked</small>
            </div>
            <div class="legend-item">
              <div class="legend-color blocked"></div>
              <small>Blocked</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slot-picker-footer" v-if="selectedSlot">
      <div class="selected-slot-info">
        <div class="selected-info-flex">
          <div>
            <strong>Selected Time:</strong> {{ formatTime(selectedSlot.time) }}
            <div v-if="selectedSlot.doctorName">
              <strong>Doctor:</strong> {{ selectedSlot.doctorName }}
            </div>
          </div>
          <button class="btn btn-sm btn-outline-secondary" @click="clearSelection">
            <i class="fas fa-times"></i> Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimeSlotPicker',
  props: {
    title: {
      type: String,
      default: 'Select Time Slot',
    },
    selectedDate: {
      type: [String, Date],
      default: null,
    },
    doctorId: {
      type: [String, Number],
      default: null,
    },
    duration: {
      type: Number,
      default: 30,
    },
    value: {
      type: Object,
      default: null,
    },
    excludeSlots: {
      type: Array,
      default: () => [],
    },
    workingHours: {
      type: Object,
      default: () => ({
        start: '08:00',
        end: '17:00',
        lunchStart: '12:00',
        lunchEnd: '13:00',
      }),
    },
  },
  data() {
    return {
      loading: false,
      availableSlots: [],
      selectedSlot: null,
    };
  },
  computed: {
    groupedSlots() {
      if (!this.availableSlots.length) return [];

      const groups = {
        morning: { name: 'Morning', slots: [] },
        afternoon: { name: 'Afternoon', slots: [] },
        evening: { name: 'Evening', slots: [] },
      };

      this.availableSlots.forEach((slot) => {
        const hour = parseInt(slot.time.split(':')[0]);
        if (hour < 12) {
          groups.morning.slots.push(slot);
        } else if (hour < 17) {
          groups.afternoon.slots.push(slot);
        } else {
          groups.evening.slots.push(slot);
        }
      });

      return Object.values(groups).filter((group) => group.slots.length > 0);
    },
  },
  watch: {
    selectedDate: {
      handler: 'loadAvailableSlots',
      immediate: true,
    },
    doctorId: 'loadAvailableSlots',
    value: {
      handler(newVal) {
        this.selectedSlot = newVal;
      },
      immediate: true,
    },
  },
  methods: {
    async loadAvailableSlots() {
      if (!this.selectedDate) {
        this.availableSlots = [];
        return;
      }

      this.loading = true;
      try {
        const slots = await this.generateTimeSlots();
        const availability = await this.checkSlotAvailability(slots);
        this.availableSlots = availability;
      } catch (error) {
        console.error('Error loading time slots:', error);
        this.$bvToast.toast('Failed to load available time slots', {
          title: 'Error',
          variant: 'danger',
          solid: true,
          autoHideDelay: 5000,
        });
      } finally {
        this.loading = false;
      }
    },

    generateTimeSlots() {
      const slots = [];
      const { start, end, lunchStart, lunchEnd } = this.workingHours;

      const startTime = this.parseTime(start);
      const endTime = this.parseTime(end);
      const lunchStartTime = this.parseTime(lunchStart);
      const lunchEndTime = this.parseTime(lunchEnd);

      let currentTime = startTime;

      while (currentTime < endTime) {
        const timeString = this.formatTimeFromMinutes(currentTime);

        const isLunchTime = currentTime >= lunchStartTime && currentTime < lunchEndTime;

        if (!isLunchTime) {
          slots.push({
            time: timeString,
            available: true,
            status: 'available',
          });
        }

        currentTime += this.duration;
      }

      return slots;
    },

    async checkSlotAvailability(slots) {
      const dateStr =
        this.selectedDate instanceof Date
          ? this.selectedDate.toISOString().split('T')[0]
          : this.selectedDate;

      try {
        const appointments = await this.$store.dispatch('appointments/getAppointmentsByDate', {
          date: dateStr,
          doctorId: this.doctorId,
        });

        const bookedSlots = new Set();
        appointments.forEach((appointment) => {
          const startTime = appointment.appointmentTime.substring(0, 5);
          bookedSlots.add(startTime);

          const duration = appointment.duration || this.duration;
          let slotTime = this.parseTime(startTime);
          while (slotTime < this.parseTime(startTime) + duration) {
            slotTime += this.duration;
            if (slotTime < this.parseTime(startTime) + duration) {
              bookedSlots.add(this.formatTimeFromMinutes(slotTime));
            }
          }
        });

        const excludedSlots = new Set(this.excludeSlots);

        return slots.map((slot) => {
          if (bookedSlots.has(slot.time)) {
            return {
              ...slot,
              available: false,
              status: 'booked',
            };
          }

          if (excludedSlots.has(slot.time)) {
            return {
              ...slot,
              available: false,
              status: 'blocked',
            };
          }

          if (this.isPastTimeSlot(slot.time)) {
            return {
              ...slot,
              available: false,
              status: 'past',
            };
          }

          return slot;
        });
      } catch (error) {
        console.error('Error checking slot availability:', error);
        return slots;
      }
    },

    selectSlot(slot) {
      if (!slot.available) return;

      this.selectedSlot = slot;
      this.$emit('input', slot);
      this.$emit('slot-selected', slot);
    },

    clearSelection() {
      this.selectedSlot = null;
      this.$emit('input', null);
      this.$emit('slot-cleared');
    },

    isPastTimeSlot(time) {
      const today = new Date();
      const selectedDate = new Date(this.selectedDate);

      if (selectedDate.toDateString() !== today.toDateString()) {
        return selectedDate < today;
      }

      const now = today.getHours() * 60 + today.getMinutes();
      const slotTime = this.parseTime(time);

      return slotTime <= now;
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

    formatDate(date) {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  },
};
</script>

<style scoped>
.time-slot-picker {
  border: 1px solid #e3e6f0;
  border-radius: 8px;
  background: white;
}

.slot-picker-header {
  padding: 1rem;
  border-bottom: 1px solid #e3e6f0;
  background: #f8f9fc;
  border-radius: 8px 8px 0 0;
}

.slot-picker-body {
  padding: 1rem;
  min-height: 200px;
}

.time-slots-container {
  max-height: 400px;
  overflow-y: auto;
}

.time-period {
  margin-bottom: 1.5rem;
}

.period-header {
  display: table;
  width: 100%;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e3e6f0;
}

.period-header small:first-child {
  display: table-cell;
  text-align: left;
}

.period-header small:last-child {
  display: table-cell;
  text-align: right;
}

.slots-grid {
  display: block;
  margin: -0.25rem;
}

.slots-grid::after {
  content: '';
  display: table;
  clear: both;
}

.time-slot {
  float: left;
  width: calc(25% - 0.5rem);
  margin: 0.25rem;
  padding: 0.75rem;
  border: 1px solid #d1d3e2;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  text-align: center;
  position: relative;
  min-height: 60px;
  box-sizing: border-box;
  display: block;
}

.time-slot:hover:not(:disabled) {
  border-color: #5a5c69;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.time-slot.selected {
  background: #4e73df;
  color: white;
  border-color: #4e73df;
}

.time-slot.unavailable {
  background: #f8f9fc;
  color: #858796;
  cursor: not-allowed;
  opacity: 0.6;
}

.time-slot.booked {
  background: #e74a3b;
  color: white;
  border-color: #e74a3b;
}

.time-slot.blocked {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.slot-time {
  font-weight: 600;
  font-size: 0.9rem;
  display: block;
}

.slot-doctor {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 0.25rem;
  display: block;
}

.slot-status {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 0.7rem;
}

.slot-legend {
  border-top: 1px solid #e3e6f0;
  padding-top: 1rem;
}

.legend-items {
  text-align: center;
}

.legend-item {
  display: inline-block;
  margin: 0 0.5rem 0.5rem 0;
  vertical-align: top;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid #d1d3e2;
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.5rem;
}

.legend-color.available {
  background: white;
}

.legend-color.selected {
  background: #4e73df;
}

.legend-color.booked {
  background: #e74a3b;
}

.legend-color.blocked {
  background: #6c757d;
}

.slot-picker-footer {
  padding: 1rem;
  border-top: 1px solid #e3e6f0;
  background: #f8f9fc;
  border-radius: 0 0 8px 8px;
}

.selected-slot-info {
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #d1d3e2;
}

.selected-info-flex {
  display: table;
  width: 100%;
}

.selected-info-flex > div:first-child {
  display: table-cell;
  vertical-align: middle;
}

.selected-info-flex > button {
  display: table-cell;
  vertical-align: middle;
  width: 1%;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .time-slot {
    width: calc(33.333% - 0.5rem);
  }
}

@media (max-width: 576px) {
  .time-slot {
    width: calc(50% - 0.5rem);
    min-height: 50px;
    padding: 0.5rem;
  }

  .legend-items {
    text-align: center;
  }
}
</style>
