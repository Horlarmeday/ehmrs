<template>
  <!--begin::Card-->
  <div class="card card-custom gutter-b">
    <div class="card-header">
      <div class="card-title">
        <h3 class="card-label">Employee Profile</h3>
      </div>
      <div class="card-title">
        <router-link
          v-b-tooltip:hover
          title="Back to Employee List"
          to="/employee/find-employee"
          class="btn btn-icon pulse mr-5 btn-light-primary pulse-primary"
        >
          <i class="flaticon2-left-arrow-1"></i>
          <span class="pulse-ring"></span>
        </router-link>
      </div>
    </div>
    <div class="card-body">
      <div v-if="loading">
        <EmployeeProfileSkeleton />
      </div>
      <div v-else-if="employee" class="row">
        <!-- Personal Information -->
        <div class="col-5">
          <b-list-group>
            <b-list-group-item href="#" variant="dark">Personal Information</b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Employee Name
              <div class="font-weight-boldest text-dark">{{ employee.fullname }}</div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Employee ID
              <div class="font-weight-boldest text-dark">{{ employee.id }}</div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Username
              <div class="font-weight-boldest text-dark">{{ employee.username }}</div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Gender
              <div class="font-weight-boldest text-dark">{{ employee.gender || '-' }}</div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Date of Birth
              <div class="font-weight-boldest text-dark">
                {{ employee.date_of_birth | dayjs('Do MMM YYYY') }}
              </div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Status
              <div class="font-weight-boldest text-dark">
                <span
                  v-if="employee.status === 'Active'"
                  class="label label-lg label-light-primary label-inline"
                  >Active</span
                >
                <span v-else class="label label-lg label-light-danger label-inline">Inactive</span>
              </div>
            </b-list-group-item>
          </b-list-group>
        </div>

        <!-- Contact Information -->
        <div class="col-5">
          <b-list-group>
            <b-list-group-item href="#" variant="dark">Contact Information</b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Email
              <div class="font-weight-boldest text-dark">{{ employee.email || '-' }}</div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Phone Number
              <div class="font-weight-boldest text-dark">{{ employee.phone || '-' }}</div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Address
              <div class="font-weight-boldest text-dark">{{ employee.address }}</div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Date Created
              <div class="font-weight-boldest text-dark">
                {{ employee.createdAt | dayjs('DD/MM/YYYY, h:mma') }}
              </div>
            </b-list-group-item>
          </b-list-group>
        </div>

        <!-- Employee Photo -->
        <div class="col-2">
          <div class="symbol symbol-150 mr-3">
            <img
              v-if="!imageError"
              alt="Employee Photo"
              :src="imageUrl()"
              @load="handleImageLoad"
              @error="handleImageError"
            />
            <span v-else class="symbol-label font-size-h1">
              {{ employee?.firstname?.charAt(0)?.toUpperCase() }}
              {{ employee?.lastname?.charAt(0)?.toUpperCase() }}
            </span>
          </div>
        </div>

        <!-- Department & Role Information -->
        <div class="col-6 pt-3">
          <b-list-group>
            <b-list-group-item href="#" variant="dark"
              >Department & Role Information</b-list-group-item
            >
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Department
              <div class="font-weight-boldest text-dark">{{ employee.department }}</div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Role
              <div class="font-weight-boldest text-dark">{{ employee.role }}</div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Sub Role
              <div class="font-weight-boldest text-dark">{{ employee.sub_role || '-' }}</div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Present Rank
              <div class="font-weight-boldest text-dark">{{ employee.present_rank || '-' }}</div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Qualification
              <div class="font-weight-boldest text-dark">{{ employee.qualification || '-' }}</div>
            </b-list-group-item>
          </b-list-group>
        </div>

        <!-- Employment Information -->
        <div class="col-6 pt-3">
          <b-list-group>
            <b-list-group-item href="#" variant="dark">Employment Information</b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Date of First Appointment
              <div class="font-weight-boldest text-dark">
                {{ employee.date_of_first_appointment | dayjs('Do MMM YYYY') }}
              </div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Date of Commencement
              <div class="font-weight-boldest text-dark">
                {{ employee.date_of_commencement | dayjs('Do MMM YYYY') }}
              </div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              DOLP
              <div class="font-weight-boldest text-dark">
                {{ employee.dolp | dayjs('Do MMM YYYY') }}
              </div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              CHS/CMS
              <div class="font-weight-boldest text-dark">{{ employee.chs_cms || '-' }}</div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              Step
              <div class="font-weight-boldest text-dark">{{ employee.step || '-' }}</div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              DD for Retirement
              <div class="font-weight-boldest text-dark">
                {{ employee.dd_for_retirement | dayjs('Do MMM YYYY') }}
              </div>
            </b-list-group-item>
            <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
              NIN
              <div class="font-weight-boldest text-dark">{{ employee.nin || '-' }}</div>
            </b-list-group-item>
          </b-list-group>
        </div>
      </div>
      <div v-else class="text-center py-5">
        <h5 class="text-muted">Employee not found</h5>
      </div>
    </div>
  </div>
  <!--end::Card-->
</template>

<script>
import EmployeeProfileSkeleton from './components/EmployeeProfileSkeleton.vue';

export default {
  components: { EmployeeProfileSkeleton },
  data: () => ({
    loading: false,
    imageError: false,
  }),

  computed: {
    employee() {
      return this.$store.state.employee.employee || null;
    },
  },

  mounted() {
    this.fetchEmployee();
  },

  methods: {
    fetchEmployee() {
      this.loading = true;
      const employeeId = this.$route.params.id;

      this.$store
        .dispatch('employee/fetchEmployee', employeeId)
        .then(() => {
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },

    imageUrl() {
      return `${window.location.origin}/static/images/${this.employee.photo}`;
    },

    handleImageLoad() {
      this.imageError = false;
    },

    handleImageError() {
      this.imageError = true;
    },
  },
};
</script>

<style scoped>
.symbol.symbol-150 > img {
  max-width: 250px;
}
</style>
