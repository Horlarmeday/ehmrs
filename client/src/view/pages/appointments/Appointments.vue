<template>
  <div class="appointments-module">
    <div class="row">
      <!-- Sidebar Navigation -->
      <div class="col-lg-3 col-xl-2">
        <div class="card card-custom gutter-b">
          <div class="card-body px-5">
            <h5 class="font-weight-bold text-dark mb-4">
              <i class="fas fa-calendar-alt mr-2 text-primary"></i>
              Appointments
            </h5>

            <!-- Navigation Menu -->
            <div class="nav flex-column nav-pills" role="tablist">
              <router-link
                to="/appointments/home"
                class="nav-link d-flex align-items-center py-3 mb-2"
                active-class="active"
              >
                <i class="fas fa-tachometer-alt mr-3"></i>
                <span>Dashboard</span>
              </router-link>

              <router-link
                to="/appointments/list"
                class="nav-link d-flex align-items-center py-3 mb-2"
                active-class="active"
              >
                <i class="fas fa-list mr-3"></i>
                <span>All Appointments</span>
              </router-link>

              <router-link
                to="/appointments/check-in-queue"
                class="nav-link d-flex align-items-center py-3 mb-2"
                active-class="active"
              >
                <i class="fas fa-sign-in-alt mr-3"></i>
                <span>Check-in Queue</span>
              </router-link>

              <router-link
                to="/appointments/book"
                class="nav-link d-flex align-items-center py-3 mb-2"
                active-class="active"
                v-if="canBookAppointments"
              >
                <i class="fas fa-plus mr-3"></i>
                <span>Book Appointment</span>
              </router-link>

              <router-link
                to="/appointments/calendar"
                class="nav-link d-flex align-items-center py-3 mb-2"
                active-class="active"
              >
                <i class="fas fa-calendar mr-3"></i>
                <span>Calendar View</span>
              </router-link>

              <router-link
                to="/appointments/doctor-schedule"
                class="nav-link d-flex align-items-center py-3 mb-2"
                active-class="active"
              >
                <i class="fas fa-user-md mr-3"></i>
                <span>Doctor Schedules</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="col-lg-9 col-xl-10">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Appointments',
  data() {
    return {};
  },
  computed: {
    ...mapState('auth', ['user']),

    canBookAppointments() {
      // Only Reception and Medical Records can book appointments
      return this.user && ['Reception', 'Medical Records'].includes(this.user.role);
    },
  },
  methods: {},
};
</script>

<style scoped>
.appointments-module {
  min-height: 100vh;
}

.nav-link {
  color: #6c757d;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: #f4f6fa;
  color: #00acc1;
}

.nav-link.active {
  background-color: #00acc1;
  color: white;
}

.nav-link.active i {
  color: white;
}

.nav-link i {
  width: 20px;
  text-align: center;
}

@media (max-width: 992px) {
  .col-lg-3 {
    margin-bottom: 1rem;
  }
}
</style>
