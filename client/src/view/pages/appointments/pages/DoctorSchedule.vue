<template>
  <div class="doctor-schedule">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Doctor Schedules</h2>
        <p class="text-muted mb-0">Manage individual doctor schedules and availability</p>
      </div>
      <div class="d-flex align-items-center">
        <b-button variant="success" @click="showScheduleTemplate" class="mr-2">
          <i class="fas fa-calendar-plus mr-2"></i>Schedule Template
        </b-button>
        <b-button variant="outline-primary" @click="refreshSchedules" :disabled="loading">
          <i class="fas fa-sync mr-2" :class="{ 'fa-spin': loading }"></i>Refresh
        </b-button>
      </div>
    </div>

    <!-- Doctor Selection and Filters -->
    <div class="card card-custom gutter-b">
      <div class="card-body">
        <div class="row align-items-center">
          <!-- Doctor Selection -->
          <div class="col-lg-4">
            <div class="form-group mb-0">
              <label class="font-weight-bold">Select Doctor</label>
              <v-select
                v-model="selectedDoctorId"
                :options="doctors"
                label="fullname"
                :reduce="doctor => doctor.id"
                placeholder="Choose a doctor to view schedule"
                :loading="loadingDoctors"
                @search="searchDoctors"
                @input="onDoctorChange"
              >
                <template #option="option">
                  <div>
                    <div class="font-weight-bold">{{ option.fullname }}</div>
                    <small class="text-muted">{{ option.department }} - {{ option.role }}</small>
                  </div>
                </template>
                <template #no-options>
                  <div class="text-muted">Type to search for doctors...</div>
                </template>
              </v-select>
            </div>
          </div>

          <!-- Date Range -->
          <div class="col-lg-4">
            <div class="form-group mb-0">
              <label class="font-weight-bold">Date Range</label>
              <div class="d-flex">
                <b-form-input
                  type="date"
                  v-model="startDate"
                  @change="loadScheduleData"
                  class="mr-2"
                />
                <b-form-input type="date" v-model="endDate" @change="loadScheduleData" />
              </div>
            </div>
          </div>

          <!-- View Options -->
          <div class="col-lg-4">
            <div class="form-group mb-0">
              <label class="font-weight-bold">View Options</label>
              <div class="btn-group btn-group-toggle d-block" data-toggle="buttons">
                <label
                  class="btn btn-outline-primary"
                  :class="{ active: viewMode === 'appointments' }"
                >
                  <input
                    type="radio"
                    v-model="viewMode"
                    value="appointments"
                    @change="loadScheduleData"
                  />
                  <i class="fas fa-calendar-check mr-1"></i>Appointments
                </label>
                <label
                  class="btn btn-outline-primary"
                  :class="{ active: viewMode === 'availability' }"
                >
                  <input
                    type="radio"
                    v-model="viewMode"
                    value="availability"
                    @change="loadScheduleData"
                  />
                  <i class="fas fa-clock mr-1"></i>Availability
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Content -->
    <div v-if="!selectedDoctorId" class="card card-custom">
      <div class="card-body text-center py-5">
        <i class="fas fa-user-md fa-4x text-muted mb-4"></i>
        <h5 class="text-muted">Select a Doctor</h5>
        <p class="text-muted">Choose a doctor from the dropdown above to view their schedule</p>
      </div>
    </div>

    <div v-else>
      <!-- Schedule Overview Cards -->
      <div class="row mb-4">
        <div class="col-xl-3 col-lg-6 mb-4">
          <div class="card bg-light-primary">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="mr-3">
                  <i class="fas fa-calendar-check fa-2x text-primary"></i>
                </div>
                <div>
                  <div class="text-dark font-size-h3 font-weight-bolder">
                    {{ scheduleStats.totalAppointments }}
                  </div>
                  <div class="text-muted font-weight-bold">Total Appointments</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-lg-6 mb-4">
          <div class="card bg-light-success">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="mr-3">
                  <i class="fas fa-percentage fa-2x text-success"></i>
                </div>
                <div>
                  <div class="text-dark font-size-h3 font-weight-bolder">
                    {{ scheduleStats.utilizationRate }}%
                  </div>
                  <div class="text-muted font-weight-bold">Utilization Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-lg-6 mb-4">
          <div class="card bg-light-warning">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="mr-3">
                  <i class="fas fa-clock fa-2x text-warning"></i>
                </div>
                <div>
                  <div class="text-dark font-size-h3 font-weight-bolder">
                    {{ scheduleStats.availableSlots }}
                  </div>
                  <div class="text-muted font-weight-bold">Available Slots</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-lg-6 mb-4">
          <div class="card bg-light-info">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="mr-3">
                  <i class="fas fa-hourglass-half fa-2x text-info"></i>
                </div>
                <div>
                  <div class="text-dark font-size-h3 font-weight-bolder">
                    {{ scheduleStats.avgAppointmentTime }}
                  </div>
                  <div class="text-muted font-weight-bold">Avg Duration (min)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Grid -->
      <div class="card card-custom">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fas fa-calendar-week mr-2"></i>
            {{ selectedDoctor?.fullname }} - Schedule Grid
          </h3>
          <div class="card-toolbar">
            <b-dropdown variant="outline-primary" size="sm" text="Actions" right>
              <b-dropdown-item @click="blockTimeSlot">
                <i class="fas fa-ban mr-2"></i>Block Time Slot
              </b-dropdown-item>
              <b-dropdown-item @click="setWorkingHours">
                <i class="fas fa-business-time mr-2"></i>Set Working Hours
              </b-dropdown-item>
              <b-dropdown-item @click="exportSchedule">
                <i class="fas fa-download mr-2"></i>Export Schedule
              </b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item @click="viewScheduleOverview">
                <i class="fas fa-chart-line mr-2"></i>Schedule Analytics
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>

        <div class="card-body p-0">
          <!-- Loading State -->
          <div v-if="loadingSchedule" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
            <p class="text-muted mt-3">Loading schedule data...</p>
          </div>

          <!-- Schedule Grid -->
          <div v-else class="schedule-grid">
            <!-- Grid Header -->
            <div class="schedule-header">
              <div class="time-column-header">Time</div>
              <div class="date-columns">
                <div
                  class="date-column-header"
                  v-for="date in scheduleDates"
                  :key="date.dateStr"
                  :class="{ today: date.isToday }"
                >
                  <div class="date-day">{{ date.dayName }}</div>
                  <div class="date-number">{{ date.day }}</div>
                  <div class="date-month">{{ date.monthName }}</div>
                </div>
              </div>
            </div>

            <!-- Grid Body -->
            <div class="schedule-body">
              <div class="time-row" v-for="timeSlot in timeSlots" :key="timeSlot.hour">
                <div class="time-cell">
                  <span class="time-label">{{ formatHour(timeSlot.hour) }}</span>
                </div>

                <div class="date-cells">
                  <div
                    class="date-cell"
                    v-for="date in scheduleDates"
                    :key="`${date.dateStr}-${timeSlot.hour}`"
                    :class="getCellClass(date.dateStr, timeSlot.hour)"
                    @click="handleCellClick(date.dateStr, timeSlot.hour)"
                  >
                    <!-- Appointments in this slot -->
                    <div
                      class="appointment-in-slot"
                      v-for="appointment in getAppointmentsForSlot(date.dateStr, timeSlot.hour)"
                      :key="appointment.id"
                      :class="getAppointmentStatusClass(appointment.status)"
                      @click.stop="viewAppointment(appointment)"
                    >
                      <div class="appointment-time">
                        {{ formatTime(appointment.appointment_time) }}
                      </div>
                      <div class="appointment-patient">
                        {{ appointment.patient?.fullname || 'Unknown' }}
                      </div>
                      <div class="appointment-type">
                        {{ getTypeShort(appointment.appointment_type) }}
                      </div>
                    </div>

                    <!-- Available slot indicator -->
                    <div
                      v-if="
                        viewMode === 'availability' && isSlotAvailable(date.dateStr, timeSlot.hour)
                      "
                      class="available-slot"
                    >
                      <i class="fas fa-plus text-success"></i>
                      <span class="available-text">Available</span>
                    </div>

                    <!-- Blocked slot indicator -->
                    <div v-if="isSlotBlocked(date.dateStr, timeSlot.hour)" class="blocked-slot">
                      <i class="fas fa-ban text-danger"></i>
                      <span class="blocked-text">Blocked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Working Hours Summary -->
      <div class="row mt-4">
        <div class="col-lg-8">
          <div class="card card-custom">
            <div class="card-header">
              <h3 class="card-title">
                <i class="fas fa-business-time mr-2"></i>Working Hours Summary
              </h3>
            </div>
            <div class="card-body">
              <div class="working-hours-grid">
                <div class="working-day" v-for="day in workingHoursSummary" :key="day.dayName">
                  <div class="day-name">{{ day.dayName }}</div>
                  <div class="day-hours" :class="{ 'off-day': !day.isWorkingDay }">
                    {{ day.isWorkingDay ? `${day.startTime} - ${day.endTime}` : 'Off' }}
                  </div>
                  <div class="day-appointments">{{ day.appointmentCount }} appointments</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card card-custom">
            <div class="card-header">
              <h3 class="card-title"><i class="fas fa-chart-pie mr-2"></i>Quick Stats</h3>
            </div>
            <div class="card-body">
              <div class="stat-item mb-3">
                <div class="d-flex justify-content-between">
                  <span>Peak Hours:</span>
                  <strong>{{ peakHours }}</strong>
                </div>
              </div>
              <div class="stat-item mb-3">
                <div class="d-flex justify-content-between">
                  <span>Busiest Day:</span>
                  <strong>{{ busiestDay }}</strong>
                </div>
              </div>
              <div class="stat-item mb-3">
                <div class="d-flex justify-content-between">
                  <span>Most Common Type:</span>
                  <strong>{{ mostCommonType }}</strong>
                </div>
              </div>
              <div class="stat-item mb-3">
                <div class="d-flex justify-content-between">
                  <span>No-show Rate:</span>
                  <strong class="text-warning">{{ noShowRate }}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Details Modal -->
    <AppointmentDetailsModal
      :appointment="selectedAppointment"
      :show="showDetails"
      @close="hideDetailsModal"
      @edit="onEditFromDetails"
    />

    <!-- Schedule Management Modals -->
    <ScheduleTemplateModal
      :show="showTemplateModal"
      :doctor="selectedDoctor"
      @close="hideTemplateModal"
      @saved="onTemplateApplied"
    />

    <TimeBlockModal
      :show="showTimeBlockModal"
      :doctor="selectedDoctor"
      :selectedDate="selectedDate"
      :selectedHour="selectedHour"
      @close="hideTimeBlockModal"
      @saved="onTimeBlocked"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import vSelect from 'vue-select';
import AppointmentDetailsModal from '../components/AppointmentDetailsModal.vue';

// Mock components for schedule management - these would be implemented separately
const ScheduleTemplateModal = {
  template: '<div></div>',
  props: ['show', 'doctor'],
};

const TimeBlockModal = {
  template: '<div></div>',
  props: ['show', 'doctor', 'selectedDate', 'selectedHour'],
};

export default {
  name: 'DoctorSchedule',
  components: {
    vSelect,
    AppointmentDetailsModal,
    ScheduleTemplateModal,
    TimeBlockModal,
  },
  data() {
    return {
      loading: false,
      loadingSchedule: false,
      loadingDoctors: false,
      selectedDoctorId: '',
      startDate: '',
      endDate: '',
      viewMode: 'appointments', // 'appointments' or 'availability'
      doctors: [],
      scheduleAppointments: [],
      blockedSlots: [],
      selectedAppointment: null,
      showDetails: false,
      showTemplateModal: false,
      showTimeBlockModal: false,
      selectedDate: '',
      selectedHour: null,
      searchTimeout: null,
      timeSlots: Array.from({ length: 10 }, (_, i) => ({ hour: i + 8 })), // 8 AM to 6 PM
    };
  },
  computed: {
    ...mapState('appointments', ['error']),

    selectedDoctor() {
      return this.doctors.find(d => d.id === this.selectedDoctorId);
    },

    scheduleDates() {
      const dates = [];
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const today = new Date().toDateString();
        dates.push({
          dateStr: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          day: date.getDate(),
          monthName: date.toLocaleDateString('en-US', { month: 'short' }),
          isToday: date.toDateString() === today,
        });
      }

      return dates;
    },

    scheduleStats() {
      const total = this.scheduleAppointments.length;
      const totalSlots = this.scheduleDates.length * this.timeSlots.length;
      const utilizationRate = totalSlots > 0 ? Math.round((total / totalSlots) * 100) : 0;
      const availableSlots = totalSlots - total;

      const avgDuration =
        total > 0
          ? Math.round(
              this.scheduleAppointments.reduce(
                (sum, apt) => sum + (apt.duration_minutes || 30),
                0
              ) / total
            )
          : 30;

      return {
        totalAppointments: total,
        utilizationRate,
        availableSlots,
        avgAppointmentTime: avgDuration,
      };
    },

    workingHoursSummary() {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      return days.map(dayName => {
        // Mock working hours - this would come from API
        const isWorkingDay = !['Saturday', 'Sunday'].includes(dayName);
        const appointmentCount = this.scheduleAppointments.filter(apt => {
          const appointmentDay = new Date(apt.appointment_date).toLocaleDateString('en-US', {
            weekday: 'long',
          });
          return appointmentDay === dayName;
        }).length;

        return {
          dayName,
          isWorkingDay,
          startTime: isWorkingDay ? '8:00 AM' : '',
          endTime: isWorkingDay ? '6:00 PM' : '',
          appointmentCount,
        };
      });
    },

    peakHours() {
      // Calculate peak hours from appointments
      const hourCounts = {};
      this.scheduleAppointments.forEach(apt => {
        const hour = parseInt(apt.appointment_time.split(':')[0]);
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const maxCount = Math.max(...Object.values(hourCounts), 0);
      const peakHour = Object.keys(hourCounts).find(hour => hourCounts[hour] === maxCount);

      return peakHour ? this.formatHour(parseInt(peakHour)) : 'N/A';
    },

    busiestDay() {
      const dayCounts = {};
      this.scheduleAppointments.forEach(apt => {
        const day = new Date(apt.appointment_date).toLocaleDateString('en-US', { weekday: 'long' });
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });

      const maxCount = Math.max(...Object.values(dayCounts), 0);
      return Object.keys(dayCounts).find(day => dayCounts[day] === maxCount) || 'N/A';
    },

    mostCommonType() {
      const typeCounts = {};
      this.scheduleAppointments.forEach(apt => {
        typeCounts[apt.appointment_type] = (typeCounts[apt.appointment_type] || 0) + 1;
      });

      const maxCount = Math.max(...Object.values(typeCounts), 0);
      const mostCommon = Object.keys(typeCounts).find(type => typeCounts[type] === maxCount);

      return mostCommon ? this.getTypeText(mostCommon) : 'N/A';
    },

    noShowRate() {
      const noShows = this.scheduleAppointments.filter(apt => apt.status === 'No Show').length;
      const total = this.scheduleAppointments.length;
      return total > 0 ? Math.round((noShows / total) * 100) : 0;
    },
  },
  methods: {
    async onDoctorChange() {
      if (this.selectedDoctorId) {
        await this.loadScheduleData();
      } else {
        this.scheduleAppointments = [];
      }
    },

    async loadScheduleData() {
      if (!this.selectedDoctorId) return;

      this.loadingSchedule = true;
      try {
        // Load appointments for the selected doctor and date range
        const params = {
          doctor_id: this.selectedDoctorId,
          start: this.startDate,
          end: this.endDate,
          currentPage: 1,
          pageLimit: 500,
        };

        const response = await this.$store.dispatch('appointments/fetchAppointments', params);
        this.scheduleAppointments = response.data.data.rows || [];

        // Load blocked slots if in availability mode
        if (this.viewMode === 'availability') {
          await this.loadBlockedSlots();
        }
      } catch (error) {
        console.error('Failed to load schedule data:', error);
        this.$bvToast.toast('Failed to load schedule data', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loadingSchedule = false;
      }
    },

    async loadBlockedSlots() {
      // This would load blocked time slots from the API
      // Mock implementation for now
      this.blockedSlots = [];
    },

    async refreshSchedules() {
      this.loading = true;
      try {
        await Promise.all([this.loadDoctors(), this.loadScheduleData()]);
      } finally {
        this.loading = false;
      }
    },

    async loadDoctors() {
      this.loadingDoctors = true;
      try {
        const response = await this.$store.dispatch('employee/fetchEmployees', {
          currentPage: 1,
          itemsPerPage: 100,
          filter: 'doctor',
        });
        this.doctors = response.data.data.docs || [];
      } catch (error) {
        console.error('Failed to load doctors:', error);
      } finally {
        this.loadingDoctors = false;
      }
    },

    searchDoctors(search, loading) {
      if (search.length > 2) {
        loading(true);
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(async () => {
          try {
            const response = await this.$store.dispatch('employee/fetchEmployees', {
              currentPage: 1,
              itemsPerPage: 50,
              filter: 'doctor',
              search,
            });
            this.doctors = response.data.data.docs || [];
          } catch (error) {
            console.error('Failed to search doctors:', error);
          } finally {
            loading(false);
          }
        }, 300);
      }
    },

    getAppointmentsForSlot(date, hour) {
      return this.scheduleAppointments.filter(apt => {
        if (apt.appointment_date !== date) return false;
        const appointmentHour = parseInt(apt.appointment_time.split(':')[0]);
        return appointmentHour === hour;
      });
    },

    isSlotAvailable(date, hour) {
      if (this.viewMode !== 'availability') return false;

      const hasAppointments = this.getAppointmentsForSlot(date, hour).length > 0;
      const isBlocked = this.isSlotBlocked(date, hour);
      const isWorkingHour = this.isWorkingHour(date, hour);

      return !hasAppointments && !isBlocked && isWorkingHour;
    },

    isSlotBlocked(date, hour) {
      return this.blockedSlots.some(block => block.date === date && block.hour === hour);
    },

    isWorkingHour(date, hour) {
      // Simple implementation - assumes working hours are 8 AM to 6 PM on weekdays
      const dayOfWeek = new Date(date).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isWorkingTime = hour >= 8 && hour <= 18;

      return !isWeekend && isWorkingTime;
    },

    getCellClass(date, hour) {
      const classes = [];

      if (this.isSlotAvailable(date, hour)) {
        classes.push('available-cell');
      }

      if (this.isSlotBlocked(date, hour)) {
        classes.push('blocked-cell');
      }

      if (this.getAppointmentsForSlot(date, hour).length > 0) {
        classes.push('has-appointments');
      }

      const today = new Date().toISOString().split('T')[0];
      if (date === today) {
        classes.push('today-cell');
      }

      return classes.join(' ');
    },

    getAppointmentStatusClass(status) {
      return `appointment-status-${status.toLowerCase().replace(' ', '-')}`;
    },

    handleCellClick(date, hour) {
      this.selectedDate = date;
      this.selectedHour = hour;

      if (this.viewMode === 'availability' && this.isSlotAvailable(date, hour)) {
        // Create new appointment at this slot
        this.createAppointmentAt(date, hour);
      }
    },

    createAppointmentAt(date, hour) {
      this.$router.push({
        path: '/appointments/book',
        query: {
          doctor_id: this.selectedDoctorId,
          date: date,
          time: `${hour.toString().padStart(2, '0')}:00`,
        },
      });
    },

    viewAppointment(appointment) {
      this.selectedAppointment = appointment;
      this.showDetails = true;
    },

    hideDetailsModal() {
      this.showDetails = false;
      this.selectedAppointment = null;
    },

    onEditFromDetails(appointment) {
      this.hideDetailsModal();
      this.$router.push({
        path: '/appointments/book',
        query: { edit: appointment.id },
      });
    },

    // Schedule Management Actions
    showScheduleTemplate() {
      this.showTemplateModal = true;
    },

    hideTemplateModal() {
      this.showTemplateModal = false;
    },

    onTemplateApplied() {
      this.hideTemplateModal();
      this.loadScheduleData();
    },

    blockTimeSlot() {
      this.showTimeBlockModal = true;
    },

    hideTimeBlockModal() {
      this.showTimeBlockModal = false;
    },

    onTimeBlocked() {
      this.hideTimeBlockModal();
      this.loadScheduleData();
    },

    setWorkingHours() {
      this.$bvToast.toast('Working hours management coming soon', {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },

    exportSchedule() {
      this.$bvToast.toast('Schedule export functionality coming soon', {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },

    viewScheduleOverview() {
      this.$bvToast.toast('Schedule analytics coming soon', {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },

    // Utility methods
    formatTime(timeString) {
      if (!timeString) return '';
      try {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes || '00'} ${period}`;
      } catch (error) {
        return timeString;
      }
    },

    formatHour(hour) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:00 ${period}`;
    },

    getTypeShort(type) {
      const shorts = {
        CONSULTATION: 'CONS',
        FOLLOW_UP: 'F/UP',
        PROCEDURE: 'PROC',
        VACCINATION: 'VACC',
        DIALYSIS: 'DIAL',
        ANTENATAL: 'ANC',
        SURGERY: 'SURG',
        EMERGENCY: 'EMER',
      };
      return shorts[type] || type.substr(0, 4);
    },

    getTypeText(type) {
      const texts = {
        CONSULTATION: 'Consultation',
        FOLLOW_UP: 'Follow-up',
        PROCEDURE: 'Procedure',
        VACCINATION: 'Vaccination',
        DIALYSIS: 'Dialysis',
        ANTENATAL: 'Antenatal',
        SURGERY: 'Surgery',
        EMERGENCY: 'Emergency',
      };
      return texts[type] || type;
    },

    initializeDates() {
      const today = new Date();
      this.startDate = today.toISOString().split('T')[0];

      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 6);
      this.endDate = weekFromNow.toISOString().split('T')[0];
    },
  },

  async created() {
    this.initializeDates();
    await this.loadDoctors();
  },

  beforeDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
};
</script>

<style scoped>
/* Schedule Grid */
.schedule-grid {
  overflow-x: auto;
}

.schedule-header {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.time-column-header {
  width: 100px;
  flex-shrink: 0;
  padding: 1rem;
  font-weight: bold;
  border-right: 1px solid #dee2e6;
}

.date-columns {
  display: flex;
  flex: 1;
}

.date-column-header {
  flex: 1;
  min-width: 140px;
  padding: 1rem;
  text-align: center;
  border-right: 1px solid #dee2e6;
  transition: background-color 0.2s ease;
}

.date-column-header:last-child {
  border-right: none;
}

.date-column-header.today {
  background-color: #e3f2fd;
}

.date-day {
  font-weight: bold;
  color: #6c757d;
  font-size: 0.875rem;
}

.date-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #495057;
  margin: 0.25rem 0;
}

.date-month {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
}

/* Schedule Body */
.time-row {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  min-height: 80px;
}

.time-cell {
  width: 100px;
  flex-shrink: 0;
  padding: 1rem;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  display: flex;
  align-items: center;
}

.time-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.date-cells {
  display: flex;
  flex: 1;
}

.date-cell {
  flex: 1;
  min-width: 140px;
  border-right: 1px solid #e9ecef;
  padding: 0.5rem;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s ease;
}

.date-cell:last-child {
  border-right: none;
}

.date-cell:hover {
  background-color: #f8f9fa;
}

.date-cell.available-cell {
  background-color: #f0fff0;
}

.date-cell.blocked-cell {
  background-color: #fff0f0;
}

.date-cell.has-appointments {
  background-color: #f0f8ff;
}

.date-cell.today-cell {
  border-left: 3px solid #3699ff;
}

/* Appointments in slots */
.appointment-in-slot {
  background-color: #3699ff;
  color: white;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.appointment-in-slot:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.appointment-status-scheduled {
  background-color: #ffc107;
  color: #212529;
}

.appointment-status-confirmed {
  background-color: #17a2b8;
}

.appointment-status-completed {
  background-color: #28a745;
}

.appointment-status-cancelled {
  background-color: #dc3545;
}

.appointment-status-no-show {
  background-color: #6c757d;
}

.appointment-time {
  font-weight: bold;
  margin-bottom: 0.125rem;
}

.appointment-patient {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.125rem;
}

.appointment-type {
  font-size: 0.7rem;
  opacity: 0.9;
}

/* Available/Blocked slot indicators */
.available-slot,
.blocked-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 0.75rem;
  opacity: 0.6;
}

.available-slot:hover,
.blocked-slot:hover {
  opacity: 1;
}

.available-text,
.blocked-text {
  margin-top: 0.25rem;
}

/* Working Hours Summary */
.working-hours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.working-day {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.day-name {
  font-weight: bold;
  color: #495057;
  margin-bottom: 0.5rem;
}

.day-hours {
  color: #28a745;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.day-hours.off-day {
  color: #dc3545;
}

.day-appointments {
  font-size: 0.875rem;
  color: #6c757d;
}

/* Stats */
.stat-item {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

/* Responsive Design */
@media (max-width: 768px) {
  .schedule-grid {
    font-size: 0.75rem;
  }

  .time-column-header,
  .time-cell {
    width: 80px;
  }

  .date-column-header,
  .date-cell {
    min-width: 100px;
  }

  .date-number {
    font-size: 1.25rem;
  }

  .appointment-in-slot {
    font-size: 0.7rem;
    padding: 0.125rem 0.25rem;
  }

  .working-hours-grid {
    grid-template-columns: 1fr;
  }
}

/* Button group styles */
.btn-group-toggle .btn {
  border-radius: 0.375rem;
  margin-right: 0.25rem;
}

.btn-group-toggle .btn:last-child {
  margin-right: 0;
}

.btn-group-toggle .btn.active {
  background-color: #3699ff;
  border-color: #3699ff;
  color: white;
}
</style>
