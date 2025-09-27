<template>
  <div class="appointment-calendar">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Appointment Calendar</h2>
        <p class="text-muted mb-0">Visual calendar view of all appointments</p>
      </div>
      <div class="d-flex align-items-center">
        <b-button variant="primary" @click="showNewAppointment" class="mr-2">
          <i class="fas fa-plus mr-2"></i>New Appointment
        </b-button>
        <b-button variant="outline-primary" @click="refreshCalendar" :disabled="loading">
          <i class="fas fa-sync mr-2" :class="{ 'fa-spin': loading }"></i>Refresh
        </b-button>
      </div>
    </div>

    <!-- Calendar Controls -->
    <div class="card card-custom gutter-b">
      <div class="card-body">
        <div class="row align-items-center">
          <!-- View Controls -->
          <div class="col-lg-4">
            <div class="btn-group" role="group">
              <b-button
                variant="outline-primary"
                :class="{ active: currentView === 'month' }"
                @click="setView('month')"
              >
                Month
              </b-button>
              <b-button
                variant="outline-primary"
                :class="{ active: currentView === 'week' }"
                @click="setView('week')"
              >
                Week
              </b-button>
              <b-button
                variant="outline-primary"
                :class="{ active: currentView === 'day' }"
                @click="setView('day')"
              >
                Day
              </b-button>
            </div>
          </div>

          <!-- Navigation Controls -->
          <div class="col-lg-4 text-center">
            <div class="d-flex align-items-center justify-content-center">
              <b-button variant="light" @click="previousPeriod" class="mr-2">
                <i class="fas fa-chevron-left"></i>
              </b-button>
              <h4 class="mb-0 mx-3">{{ currentPeriodTitle }}</h4>
              <b-button variant="light" @click="nextPeriod" class="ml-2">
                <i class="fas fa-chevron-right"></i>
              </b-button>
            </div>
          </div>

          <!-- Filters -->
          <div class="col-lg-4">
            <div class="d-flex align-items-center justify-content-end">
              <b-form-select
                v-model="filterDoctor"
                :options="doctorOptions"
                size="sm"
                class="mr-2"
                @change="applyFilters"
              >
                <template #first>
                  <option value="">All Doctors</option>
                </template>
              </b-form-select>

              <b-form-select
                v-model="filterStatus"
                :options="statusOptions"
                size="sm"
                @change="applyFilters"
              >
                <template #first>
                  <option value="">All Statuses</option>
                </template>
              </b-form-select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar View -->
    <div class="card card-custom">
      <div class="card-body p-0">
        <!-- Month View -->
        <div v-if="currentView === 'month'" class="month-view">
          <div class="calendar-header">
            <div class="row no-gutters">
              <div class="col calendar-day-header" v-for="day in dayHeaders" :key="day">
                {{ day }}
              </div>
            </div>
          </div>

          <div class="calendar-body">
            <div
              class="calendar-week row no-gutters"
              v-for="(week, weekIndex) in calendarWeeks"
              :key="`week-${weekIndex}`"
            >
              <div
                class="calendar-day col"
                v-for="(day, dayIndex) in week"
                :key="`day-${weekIndex}-${dayIndex}`"
                :class="getDayClass(day)"
                @click="selectDay(day)"
              >
                <div class="day-header">
                  <span class="day-number">{{ day.date }}</span>
                  <span v-if="getDayAppointments(day).length > 0" class="appointment-count">
                    {{ getDayAppointments(day).length }}
                  </span>
                </div>

                <div class="day-appointments">
                  <div
                    class="appointment-item"
                    v-for="appointment in getDayAppointments(day).slice(0, 3)"
                    :key="appointment.id"
                    :class="getAppointmentClass(appointment)"
                    @click.stop="viewAppointment(appointment)"
                  >
                    <div class="appointment-time">
                      {{ formatTime(appointment.appointment_time) }}
                    </div>
                    <div class="appointment-patient">
                      {{ appointment.patient?.fullname || 'Unknown' }}
                    </div>
                    <div class="appointment-doctor">
                      {{ appointment.doctor?.fullname || 'Unassigned' }}
                    </div>
                  </div>

                  <div
                    v-if="getDayAppointments(day).length > 3"
                    class="more-appointments"
                    @click.stop="viewDayAppointments(day)"
                  >
                    +{{ getDayAppointments(day).length - 3 }} more
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Week View -->
        <div v-if="currentView === 'week'" class="week-view">
          <div class="week-header">
            <div class="time-column"></div>
            <div class="week-days row no-gutters">
              <div
                class="week-day col"
                v-for="day in weekDays"
                :key="day.fullDate"
                :class="{ today: isToday(day) }"
              >
                <div class="day-label">
                  <div class="day-name">{{ day.dayName }}</div>
                  <div class="day-number">{{ day.date }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="week-body">
            <div class="time-slots">
              <div class="time-slot-row" v-for="hour in workingHours" :key="hour">
                <div class="time-label">{{ formatHour(hour) }}</div>
                <div class="time-slot-columns row no-gutters">
                  <div
                    class="time-slot col"
                    v-for="day in weekDays"
                    :key="`${day.fullDate}-${hour}`"
                    @click="createAppointmentAt(day.fullDate, hour)"
                  >
                    <div
                      class="appointment-slot"
                      v-for="appointment in getHourAppointments(day.fullDate, hour)"
                      :key="appointment.id"
                      :class="getAppointmentClass(appointment)"
                      @click.stop="viewAppointment(appointment)"
                    >
                      <div class="slot-time">{{ formatTime(appointment.appointment_time) }}</div>
                      <div class="slot-patient">
                        {{ appointment.patient?.fullname || 'Unknown' }}
                      </div>
                      <div class="slot-type">{{ getTypeShort(appointment.type) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Day View -->
        <div v-if="currentView === 'day'" class="day-view">
          <div class="day-header-detailed">
            <h4>{{ selectedDay | dayjs('dddd, MMMM DD, YYYY') }}</h4>
            <p class="text-muted">
              {{ getDayAppointments(selectedDayObj).length }} appointment(s) scheduled
            </p>
          </div>

          <div class="day-timeline">
            <div class="timeline-hour" v-for="hour in workingHours" :key="hour">
              <div class="hour-label">{{ formatHour(hour) }}</div>
              <div class="hour-appointments">
                <div
                  class="appointment-block"
                  v-for="appointment in getHourAppointments(selectedDay, hour)"
                  :key="appointment.id"
                  :class="getAppointmentClass(appointment)"
                  @click="viewAppointment(appointment)"
                >
                  <div class="appointment-header">
                    <span class="appointment-time">{{
                      formatTime(appointment.appointment_time)
                    }}</span>
                    <span
                      class="appointment-status badge"
                      :class="getStatusClass(appointment.status)"
                    >
                      {{ appointment.status }}
                    </span>
                  </div>
                  <div class="appointment-details">
                    <div class="patient-name">
                      <i class="fas fa-user mr-2"></i>
                      {{ appointment.patient?.fullname || 'Unknown Patient' }}
                    </div>
                    <div class="doctor-name">
                      <i class="fas fa-user-md mr-2"></i>
                      {{ appointment.doctor?.fullname || 'Unassigned' }}
                    </div>
                    <div class="appointment-reason">
                      <i class="fas fa-notes-medical mr-2"></i>
                      {{ appointment.reason_for_visit || 'No reason specified' }}
                    </div>
                  </div>
                  <div class="appointment-actions">
                    <b-button
                      size="sm"
                      variant="outline-primary"
                      @click.stop="editAppointment(appointment)"
                    >
                      <i class="fas fa-edit"></i>
                    </b-button>
                    <b-button
                      size="sm"
                      variant="outline-success"
                      @click.stop="checkInAppointment(appointment)"
                      v-if="canCheckIn(appointment)"
                    >
                      <i class="fas fa-sign-in-alt"></i>
                    </b-button>
                  </div>
                </div>

                <div
                  class="empty-slot"
                  v-if="getHourAppointments(selectedDay, hour).length === 0"
                  @click="createAppointmentAt(selectedDay, hour)"
                >
                  <i class="fas fa-plus text-muted"></i>
                  <span class="text-muted">Click to schedule</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="card card-custom mt-4">
      <div class="card-body">
        <div class="row">
          <div class="col-12">
            <h6 class="mb-3">Status Legend</h6>
            <div class="d-flex flex-wrap align-items-center">
              <div class="legend-item mr-4 mb-2">
                <span class="legend-color bg-warning"></span>
                <span>Scheduled</span>
              </div>
              <div class="legend-item mr-4 mb-2">
                <span class="legend-color bg-info"></span>
                <span>Confirmed</span>
              </div>
              <div class="legend-item mr-4 mb-2">
                <span class="legend-color bg-success"></span>
                <span>Completed</span>
              </div>
              <div class="legend-item mr-4 mb-2">
                <span class="legend-color bg-danger"></span>
                <span>Cancelled</span>
              </div>
              <div class="legend-item mr-4 mb-2">
                <span class="legend-color bg-secondary"></span>
                <span>No Show</span>
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

    <!-- Appointment Form Modal -->
    <AppointmentForm
      :displayPrompt="showForm"
      :appointment="selectedAppointment"
      @closeModal="hideAppointmentForm"
      @saved="onAppointmentSaved"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import AppointmentDetailsModal from '../components/AppointmentDetailsModal.vue';
import AppointmentForm from '../components/AppointmentForm.vue';

export default {
  name: 'AppointmentCalendar',
  components: {
    AppointmentDetailsModal,
    AppointmentForm,
  },
  data() {
    return {
      loading: false,
      currentView: 'month',
      currentDate: new Date(),
      selectedDay: new Date().toISOString().split('T')[0],
      filterDoctor: '',
      filterStatus: '',
      selectedAppointment: null,
      showDetails: false,
      showForm: false,
      workingHours: Array.from({ length: 10 }, (_, i) => i + 8), // 8 AM to 6 PM
      dayHeaders: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      doctors: [],
    };
  },
  computed: {
    ...mapState('appointments', ['appointments', 'error']),

    currentPeriodTitle() {
      const options = {
        month: { month: 'long', year: 'numeric' },
        week: { month: 'long', day: 'numeric', year: 'numeric' },
        day: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      };

      if (this.currentView === 'week') {
        const startOfWeek = this.getStartOfWeek(this.currentDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);

        return `${startOfWeek.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })} - ${endOfWeek.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`;
      }

      return this.currentDate.toLocaleDateString('en-US', options[this.currentView]);
    },

    calendarWeeks() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();

      // Get first day of month and calculate starting day of calendar
      const firstDay = new Date(year, month, 1);
      const startCalendar = new Date(firstDay);
      startCalendar.setDate(startCalendar.getDate() - firstDay.getDay());

      const weeks = [];
      let currentDate = new Date(startCalendar);

      // Generate 6 weeks to cover all possibilities
      for (let week = 0; week < 6; week++) {
        const days = [];
        for (let day = 0; day < 7; day++) {
          days.push({
            date: currentDate.getDate(),
            fullDate: currentDate.toISOString().split('T')[0],
            isCurrentMonth: currentDate.getMonth() === month,
            isToday: this.isToday({ fullDate: currentDate.toISOString().split('T')[0] }),
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(days);
      }

      return weeks;
    },

    weekDays() {
      const startOfWeek = this.getStartOfWeek(this.currentDate);
      const days = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);

        days.push({
          date: date.getDate(),
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: date.toISOString().split('T')[0],
          monthName: date.toLocaleDateString('en-US', { month: 'short' }),
        });
      }

      return days;
    },

    selectedDayObj() {
      return {
        fullDate: this.selectedDay,
        date: new Date(this.selectedDay).getDate(),
      };
    },

    filteredAppointments() {
      let filtered = [...this.appointments];

      if (this.filterDoctor) {
        filtered = filtered.filter((apt) => apt.doctor_id === this.filterDoctor);
      }

      if (this.filterStatus) {
        filtered = filtered.filter((apt) => apt.status === this.filterStatus);
      }

      return filtered;
    },

    doctorOptions() {
      return this.doctors.map((doctor) => ({
        value: doctor.id,
        text: doctor.fullname,
      }));
    },

    statusOptions() {
      return [
        { value: 'Scheduled', text: 'Scheduled' },
        { value: 'Confirmed', text: 'Confirmed' },
        { value: 'Completed', text: 'Completed' },
        { value: 'Cancelled', text: 'Cancelled' },
        { value: 'No Show', text: 'No Show' },
      ];
    },
  },
  methods: {
    ...mapActions('appointments', ['fetchAppointments', 'checkInAppointment']),

    setView(view) {
      this.currentView = view;
      if (view === 'day' && !this.selectedDay) {
        this.selectedDay = new Date().toISOString().split('T')[0];
      }
    },

    previousPeriod() {
      const newDate = new Date(this.currentDate);

      switch (this.currentView) {
        case 'month':
          newDate.setMonth(newDate.getMonth() - 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() - 7);
          break;
        case 'day':
          newDate.setDate(newDate.getDate() - 1);
          this.selectedDay = newDate.toISOString().split('T')[0];
          break;
      }

      this.currentDate = newDate;
      this.loadAppointmentsForPeriod();
    },

    nextPeriod() {
      const newDate = new Date(this.currentDate);

      switch (this.currentView) {
        case 'month':
          newDate.setMonth(newDate.getMonth() + 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + 7);
          break;
        case 'day':
          newDate.setDate(newDate.getDate() + 1);
          this.selectedDay = newDate.toISOString().split('T')[0];
          break;
      }

      this.currentDate = newDate;
      this.loadAppointmentsForPeriod();
    },

    selectDay(day) {
      this.selectedDay = day.fullDate;
      this.currentDate = new Date(day.fullDate);
      if (this.currentView === 'month') {
        this.setView('day');
      }
    },

    async refreshCalendar() {
      this.loading = true;
      try {
        await this.loadAppointmentsForPeriod();
      } finally {
        this.loading = false;
      }
    },

    async loadAppointmentsForPeriod() {
      let startDate, endDate;

      switch (this.currentView) {
        case 'month':
          startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
          endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
          break;
        case 'week':
          startDate = this.getStartOfWeek(this.currentDate);
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          break;
        case 'day':
          startDate = new Date(this.selectedDay);
          endDate = new Date(this.selectedDay);
          break;
      }

      const params = {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        currentPage: 1,
        pageLimit: 500, // Get all appointments for the period
      };

      try {
        await this.fetchAppointments(params);
      } catch (error) {
        console.error('Failed to load appointments:', error);
      }
    },

    applyFilters() {
      // Filters are applied via computed property
    },

    getDayAppointments(day) {
      return this.filteredAppointments.filter((apt) => apt.appointment_date === day.fullDate);
    },

    getHourAppointments(date, hour) {
      return this.filteredAppointments.filter((apt) => {
        if (apt.appointment_date !== date) return false;

        const appointmentHour = parseInt(apt.appointment_time.split(':')[0]);
        return appointmentHour === hour;
      });
    },

    getDayClass(day) {
      return {
        'current-month': day.isCurrentMonth,
        'other-month': !day.isCurrentMonth,
        today: day.isToday,
        selected: day.fullDate === this.selectedDay,
        'has-appointments': this.getDayAppointments(day).length > 0,
      };
    },

    getAppointmentClass(appointment) {
      return `appointment-${appointment.status.toLowerCase().replace(' ', '-')}`;
    },

    getStatusClass(status) {
      const classes = {
        Scheduled: 'badge-warning',
        Confirmed: 'badge-info',
        Completed: 'badge-success',
        Cancelled: 'badge-danger',
        'No Show': 'badge-secondary',
      };
      return classes[status] || 'badge-secondary';
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

    isToday(day) {
      const today = new Date().toISOString().split('T')[0];
      return day.fullDate === today;
    },

    getStartOfWeek(date) {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      return startOfWeek;
    },

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

    showNewAppointment() {
      this.selectedAppointment = null;
      this.showForm = true;
    },

    viewAppointment(appointment) {
      this.selectedAppointment = appointment;
      this.showDetails = true;
    },

    editAppointment(appointment) {
      this.selectedAppointment = appointment;
      this.showForm = true;
    },

    createAppointmentAt(date, hour) {
      // Pre-populate form with selected date and time
      this.selectedAppointment = {
        appointment_date: date,
        appointment_time: `${hour.toString().padStart(2, '0')}:00`,
      };
      this.showForm = true;
    },

    canCheckIn(appointment) {
      return ['Scheduled', 'Confirmed'].includes(appointment.status);
    },

    async checkInAppointmentAction(appointment) {
      try {
        await this.checkInAppointment({
          appointmentId: appointment.id,
          checkInData: { check_in_time: new Date() },
        });

        this.$bvToast.toast(`${appointment.patient?.fullname} checked in successfully`, {
          title: 'Success',
          variant: 'success',
          solid: true,
        });

        this.refreshCalendar();
      } catch (error) {
        this.$bvToast.toast('Failed to check in patient', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    viewDayAppointments(day) {
      this.selectDay(day);
      this.setView('day');
    },

    hideDetailsModal() {
      this.showDetails = false;
      this.selectedAppointment = null;
    },

    hideAppointmentForm() {
      this.showForm = false;
      this.selectedAppointment = null;
    },

    onEditFromDetails(appointment) {
      this.selectedAppointment = appointment;
      this.showForm = true;
    },

    onAppointmentSaved() {
      this.refreshCalendar();
    },

    async loadDoctors() {
      try {
        const response = await this.$store.dispatch('employee/fetchEmployees', {
          currentPage: 1,
          itemsPerPage: 100,
          filter: 'doctor',
        });
        this.doctors = response.data.data.docs || [];
      } catch (error) {
        console.error('Failed to load doctors:', error);
      }
    },
  },

  async created() {
    await Promise.all([this.loadAppointmentsForPeriod(), this.loadDoctors()]);
  },
};
</script>

<style scoped>
/* Calendar Header */
.calendar-header {
  border-bottom: 1px solid #e9ecef;
}

.calendar-day-header {
  padding: 1rem;
  background-color: #f8f9fa;
  font-weight: bold;
  text-align: center;
  border-right: 1px solid #e9ecef;
}

.calendar-day-header:last-child {
  border-right: none;
}

/* Calendar Body */
.calendar-week {
  border-bottom: 1px solid #e9ecef;
}

.calendar-day {
  min-height: 120px;
  border-right: 1px solid #e9ecef;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.calendar-day:last-child {
  border-right: none;
}

.calendar-day:hover {
  background-color: #f8f9fa;
}

.calendar-day.today {
  background-color: #e3f2fd;
}

.calendar-day.selected {
  background-color: #bbdefb;
}

.calendar-day.other-month {
  opacity: 0.5;
}

.calendar-day.has-appointments {
  background-color: #f0f8ff;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.day-number {
  font-weight: bold;
  color: #495057;
}

.appointment-count {
  background-color: #3699ff;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

/* Appointment Items */
.appointment-item {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  margin-bottom: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.appointment-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.appointment-scheduled {
  border-left: 4px solid #ffc107;
}

.appointment-confirmed {
  border-left: 4px solid #17a2b8;
}

.appointment-completed {
  border-left: 4px solid #28a745;
}

.appointment-cancelled {
  border-left: 4px solid #dc3545;
}

.appointment-no-show {
  border-left: 4px solid #6c757d;
}

.appointment-time {
  font-weight: bold;
  color: #495057;
}

.appointment-patient {
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-doctor {
  color: #6c757d;
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-appointments {
  text-align: center;
  color: #3699ff;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.25rem;
}

.more-appointments:hover {
  text-decoration: underline;
}

/* Week View */
.week-header {
  display: flex;
  border-bottom: 2px solid #e9ecef;
}

.time-column {
  width: 80px;
  flex-shrink: 0;
}

.week-days {
  flex: 1;
}

.week-day {
  text-align: center;
  padding: 1rem;
  border-right: 1px solid #e9ecef;
}

.week-day:last-child {
  border-right: none;
}

.week-day.today {
  background-color: #e3f2fd;
}

.day-label .day-name {
  font-weight: bold;
  color: #6c757d;
}

.day-label .day-number {
  font-size: 1.25rem;
  font-weight: bold;
  color: #495057;
}

/* Week Body */
.time-slot-row {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  min-height: 60px;
}

.time-label {
  width: 80px;
  flex-shrink: 0;
  padding: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
  border-right: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.time-slot-columns {
  flex: 1;
}

.time-slot {
  border-right: 1px solid #e9ecef;
  position: relative;
  cursor: pointer;
}

.time-slot:last-child {
  border-right: none;
}

.time-slot:hover {
  background-color: #f8f9fa;
}

.appointment-slot {
  background-color: #3699ff;
  color: white;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  margin: 2px;
  cursor: pointer;
  font-size: 0.75rem;
}

.slot-time {
  font-weight: bold;
}

.slot-patient {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slot-type {
  font-size: 0.7rem;
  opacity: 0.8;
}

/* Day View */
.day-header-detailed {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
}

.day-timeline {
  padding: 1rem 0;
}

.timeline-hour {
  display: flex;
  min-height: 80px;
  border-bottom: 1px solid #e9ecef;
}

.hour-label {
  width: 100px;
  padding: 1rem;
  background-color: #f8f9fa;
  border-right: 1px solid #e9ecef;
  font-weight: bold;
  color: #6c757d;
}

.hour-appointments {
  flex: 1;
  padding: 1rem;
  position: relative;
}

.appointment-block {
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.appointment-block:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.appointment-time {
  font-weight: bold;
  color: #3699ff;
}

.appointment-details div {
  margin-bottom: 0.25rem;
  color: #6c757d;
}

.appointment-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.empty-slot {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-slot:hover {
  background-color: #f8f9fa;
}

/* Legend */
.legend-item {
  display: flex;
  align-items: center;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  margin-right: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .calendar-day {
    min-height: 80px;
    padding: 0.25rem;
  }

  .appointment-item {
    font-size: 0.7rem;
    padding: 0.125rem 0.25rem;
  }

  .week-day {
    padding: 0.5rem;
  }

  .day-label .day-number {
    font-size: 1rem;
  }

  .time-label {
    width: 60px;
    font-size: 0.75rem;
  }

  .hour-label {
    width: 80px;
    padding: 0.5rem;
  }
}
</style>
