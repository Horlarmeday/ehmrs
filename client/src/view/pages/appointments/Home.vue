<template>
  <div class="appointments-home">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Appointments Dashboard</h2>
        <p class="text-muted mb-0">Overview of appointment activities and quick actions</p>
      </div>
      <div class="d-flex align-items-center">
        <div class="mr-3">
          <small class="text-muted">Last updated:</small>
          <span class="font-weight-bold ml-1">{{ lastUpdated }}</span>
        </div>
        <b-button variant="outline-primary" size="sm" @click="refreshDashboard" :disabled="loading">
          <i class="fas fa-sync mr-2" :class="{ 'fa-spin': loading }"></i>
          Refresh
        </b-button>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="row mb-4">
      <div class="col-xl-3 col-lg-6 mb-4">
        <div class="card bg-light-primary">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="mr-3">
                <i class="fas fa-calendar-check fa-2x text-primary"></i>
              </div>
              <div>
                <div class="text-dark font-size-h2 font-weight-bolder">{{ stats.todayTotal }}</div>
                <div class="text-muted font-weight-bold">Today's Appointments</div>
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
                <i class="fas fa-check-circle fa-2x text-success"></i>
              </div>
              <div>
                <div class="text-dark font-size-h2 font-weight-bolder">{{ stats.completed }}</div>
                <div class="text-muted font-weight-bold">Completed</div>
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
                <div class="text-dark font-size-h2 font-weight-bolder">{{ stats.pending }}</div>
                <div class="text-muted font-weight-bold">Pending Check-in</div>
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
                <i class="fas fa-percentage fa-2x text-info"></i>
              </div>
              <div>
                <div class="text-dark font-size-h2 font-weight-bolder">{{ completionRate }}%</div>
                <div class="text-muted font-weight-bold">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card card-custom">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-bolt mr-2"></i>
              Quick Actions
            </h3>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-lg-3 col-md-6 mb-3">
                <router-link
                  to="/appointments/book"
                  class="btn btn-light-primary btn-block h-100"
                  v-if="canBookAppointments"
                >
                  <div class="d-flex flex-column align-items-center py-3">
                    <i class="fas fa-plus fa-2x mb-3"></i>
                    <span class="font-weight-bold">Book Appointment</span>
                    <small class="text-muted mt-1">Schedule new appointment</small>
                  </div>
                </router-link>
              </div>

              <div class="col-lg-3 col-md-6 mb-3">
                <router-link
                  to="/appointments/check-in-queue"
                  class="btn btn-light-success btn-block h-100"
                >
                  <div class="d-flex flex-column align-items-center py-3">
                    <i class="fas fa-sign-in-alt fa-2x mb-3"></i>
                    <span class="font-weight-bold">Check-in Queue</span>
                    <small class="text-muted mt-1">{{ stats.pending }} waiting</small>
                  </div>
                </router-link>
              </div>

              <div class="col-lg-3 col-md-6 mb-3">
                <router-link to="/appointments/list" class="btn btn-light-info btn-block h-100">
                  <div class="d-flex flex-column align-items-center py-3">
                    <i class="fas fa-list fa-2x mb-3"></i>
                    <span class="font-weight-bold">View All</span>
                    <small class="text-muted mt-1">Manage appointments</small>
                  </div>
                </router-link>
              </div>

              <div class="col-lg-3 col-md-6 mb-3">
                <router-link
                  to="/appointments/calendar"
                  class="btn btn-light-warning btn-block h-100"
                >
                  <div class="d-flex flex-column align-items-center py-3">
                    <i class="fas fa-calendar fa-2x mb-3"></i>
                    <span class="font-weight-bold">Calendar</span>
                    <small class="text-muted mt-1">Schedule overview</small>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's Appointments and Recent Activity -->
    <div class="row">
      <!-- Today's Appointments -->
      <div class="col-xl-8 mb-4">
        <div class="card card-custom">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-calendar-day mr-2"></i>
              Today's Appointments
            </h3>
            <div class="card-toolbar">
              <router-link to="/appointments/list" class="btn btn-sm btn-light-primary">
                View All
              </router-link>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loadingTodays" class="card-body text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="todaysAppointments.length === 0" class="card-body text-center py-5">
            <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
            <h6 class="text-muted">No appointments scheduled for today</h6>
          </div>

          <!-- Appointments List -->
          <div v-else class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-head-custom table-vertical-center mb-0">
                <thead>
                  <tr class="text-left text-uppercase">
                    <th style="min-width: 180px">Patient</th>
                    <th style="min-width: 120px">Doctor</th>
                    <th style="min-width: 100px">Time</th>
                    <th style="min-width: 100px">Status</th>
                    <th style="min-width: 100px">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="appointment in todaysAppointments.slice(0, 6)" :key="appointment.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="symbol symbol-35 mr-3">
                          <span class="symbol-label font-size-sm font-weight-bold">
                            {{ getPatientInitials(appointment.patient) }}
                          </span>
                        </div>
                        <div>
                          <div class="text-dark-75 font-weight-bolder">
                            {{ appointment.patient?.fullname || 'Unknown' }}
                          </div>
                          <div class="text-muted font-size-sm">
                            {{ appointment.patient?.hospital_id || 'N/A' }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="text-dark-75">
                        {{ appointment.doctor?.fullname || 'Unassigned' }}
                      </div>
                    </td>
                    <td>
                      <div class="text-dark-75">{{ formatTime(appointment.appointment_time) }}</div>
                    </td>
                    <td>
                      <span class="badge badge-pill" :class="getStatusClass(appointment.status)">
                        {{ appointment.status }}
                      </span>
                    </td>
                    <td>
                      <b-button
                        variant="success"
                        size="sm"
                        @click="checkInAppointment(appointment)"
                        v-if="
                          appointment.status === 'Scheduled' || appointment.status === 'Confirmed'
                        "
                      >
                        Check In
                      </b-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="col-xl-4 mb-4">
        <div class="card card-custom">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-chart-pie mr-2"></i>
              Quick Summary
            </h3>
          </div>
          <div class="card-body">
            <!-- This Week -->
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <span class="text-dark-75 font-weight-bold font-size-lg">This Week</span>
                <div class="text-muted">{{ weeklyStats.total }} appointments</div>
              </div>
              <div class="text-right">
                <span class="text-primary font-size-lg font-weight-bold"
                  >{{ weeklyStats.completion }}%</span
                >
              </div>
            </div>

            <!-- This Month -->
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <span class="text-dark-75 font-weight-bold font-size-lg">This Month</span>
                <div class="text-muted">{{ monthlyStats.total }} appointments</div>
              </div>
              <div class="text-right">
                <span class="text-success font-size-lg font-weight-bold"
                  >{{ monthlyStats.completion }}%</span
                >
              </div>
            </div>

            <!-- No-show Rate -->
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <span class="text-dark-75 font-weight-bold font-size-lg">No-show Rate</span>
                <div class="text-muted">Last 30 days</div>
              </div>
              <div class="text-right">
                <span class="text-warning font-size-lg font-weight-bold">{{ noShowRate }}%</span>
              </div>
            </div>

            <!-- Average Wait Time -->
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-dark-75 font-weight-bold font-size-lg">Avg. Wait Time</span>
                <div class="text-muted">Today</div>
              </div>
              <div class="text-right">
                <span class="text-info font-size-lg font-weight-bold">{{ avgWaitTime }} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { parseJwt } from '@/common/common';
import dayjs from 'dayjs';

export default {
  name: 'AppointmentsHome',
  data() {
    return {
      loading: false,
      loadingTodays: false,
      lastUpdated: '',
      refreshInterval: null,
      currentUser: parseJwt(localStorage.getItem('user_token')),
    };
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('appointments', ['todaysAppointments', 'error', 'dashboardStatistics']),
    ...mapGetters('appointments', ['appointmentStats']),

    canBookAppointments() {
      return (
        this.currentUser &&
        ['Reception', 'Receptionist', 'Medical Records', 'Super Admin'].includes(
          this.currentUser.role
        )
      );
    },

    stats() {
      return {
        todayTotal: this.todaysAppointments.length,
        completed: this.todaysAppointments.filter((apt) => apt.status === 'Completed').length,
        pending: this.todaysAppointments.filter((apt) =>
          ['Scheduled', 'Confirmed'].includes(apt.status)
        ).length,
      };
    },

    completionRate() {
      const total = this.stats.todayTotal;
      const completed = this.stats.completed;
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    },

    weeklyStats() {
      return {
        total: this.dashboardStatistics.weekly.total || 0,
        completion: this.dashboardStatistics.weekly.completion_rate || 0,
      };
    },

    monthlyStats() {
      return {
        total: this.dashboardStatistics.monthly.total || 0,
        completion: this.dashboardStatistics.monthly.completion_rate || 0,
      };
    },

    noShowRate() {
      return this.dashboardStatistics.no_show_rate || 0;
    },

    avgWaitTime() {
      return this.dashboardStatistics.avg_wait_time || 0;
    },
  },
  methods: {
    ...mapActions('appointments', [
      'fetchTodaysAppointments',
      'checkInAppointment',
      'fetchDashboardStatistics',
    ]),

    async refreshDashboard() {
      this.loading = true;
      try {
        await Promise.all([this.loadTodaysAppointments(), this.fetchDashboardStatistics()]);
        this.lastUpdated = dayjs().format('h:mm A');
      } catch (error) {
        this.$bvToast.toast('Failed to refresh dashboard', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loading = false;
      }
    },

    async loadTodaysAppointments() {
      this.loadingTodays = true;
      try {
        await this.fetchTodaysAppointments();
      } catch (error) {
        console.error("Failed to load today's appointments:", error);
      } finally {
        this.loadingTodays = false;
      }
    },

    async checkInAppointment(appointment) {
      try {
        await this.$store.dispatch('appointments/checkInAppointment', {
          appointmentId: appointment.id,
          checkInData: { check_in_time: new Date() },
        });

        this.$bvToast.toast(`${appointment.patient?.fullname} checked in successfully`, {
          title: 'Success',
          variant: 'success',
          solid: true,
        });

        this.loadTodaysAppointments();
      } catch (error) {
        this.$bvToast.toast('Failed to check in patient', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    getPatientInitials(patient) {
      if (!patient || !patient.fullname) return 'NA';
      return patient.fullname
        .split(' ')
        .map((name) => name.charAt(0))
        .join('')
        .toUpperCase();
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

    formatTime(timeString) {
      if (!timeString) return 'N/A';
      try {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const minute = minutes || '00';

        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

        return `${displayHour}:${minute} ${period}`;
      } catch (error) {
        return timeString;
      }
    },
  },

  async created() {
    // Load initial data
    await this.refreshDashboard();

    // Set up auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadTodaysAppointments();
      this.fetchDashboardStatistics();
    }, 30000);
  },

  beforeDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
};
</script>

<style scoped>
.symbol-label {
  background: linear-gradient(135deg, #00acc1 0%, #0097a7 100%);
  color: white;
}

.btn-block.h-100 {
  height: 100% !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-custom {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

@media (max-width: 768px) {
  .font-size-h2 {
    font-size: 1.5rem !important;
  }

  .quick-action-card {
    margin-bottom: 1rem;
  }
}
</style>
