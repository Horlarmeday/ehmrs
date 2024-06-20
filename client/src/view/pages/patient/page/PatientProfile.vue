<template>
  <!--begin::Card-->
  <div class="card card-custom gutter-b">
    <div class="card-header">
      <div class="card-title">
        <h3 class="card-label">Patient Profile</h3>
      </div>
      <div class="card-title">
        <span
          :title="`${switchMessage} ${patient?.has_insurance ? CASH : NHIS}`"
          v-b-tooltip.hover
          class="switch mr-4"
          v-if="patient.patient_type !== DEPENDANT && patient?.insurance"
        >
          <label>
            <input @change="showAlert($event)" :checked="patient?.has_insurance" type="checkbox" />
            <span></span>
          </label>
        </span>
        <div v-for="(route, i) in routes" :key="i">
          <router-link
            v-b-tooltip:hover
            :title="route.desc"
            :to="
              `${route.link}${$route.params.id}${route.query ? `?patient=${patient.fullname}` : ''}`
            "
            class="btn btn-icon pulse mr-5"
            :class="`btn-light-${route.status} pulse-${route.status}`"
          >
            <i :class="route.icon"></i>
            <span class="pulse-ring"></span>
          </router-link>
        </div>
      </div>
    </div>
    <div class="card-body">
      <!--begin::Example-->
      <div class="example">
        <b-tabs content-class="mt-3">
          <b-tab title="Personal">
            <personal-information :patient="patient" :loading="loading" />
          </b-tab>
          <b-tab title="History" lazy>
            <History />
          </b-tab>
          <b-tab title="Diagnosis" lazy><b-alert show>I'm lazy mounted!</b-alert></b-tab>

          <b-tab title="Visits" lazy><b-alert show>I'm lazy mounted!</b-alert></b-tab>

          <b-tab title="Treatments" lazy><b-alert show>I'm lazy mounted!</b-alert></b-tab>

          <b-tab title="Lab Orders" lazy><b-alert show>I'm lazy mounted!</b-alert></b-tab>

          <b-tab title="Radiology"><b-alert show>I'm always mounted</b-alert></b-tab>

          <b-tab title="Vitals" lazy><b-alert show>I'm lazy mounted!</b-alert></b-tab>

          <b-tab title="Admission Details" lazy><b-alert show>I'm lazy mounted!</b-alert></b-tab>

          <b-tab title="Programs" lazy><b-alert show>I'm lazy mounted!</b-alert></b-tab>

          <b-tab title="Payments" lazy><b-alert show>I'm lazy mounted!</b-alert></b-tab>
        </b-tabs>
      </div>
      <!--end::Example-->
    </div>
  </div>
  <!--end::Card-->
</template>

<script>
import History from '../components/History.vue';
import PersonalInformation from '@/view/pages/patient/components/PersonalInformation.vue';
import Swal from 'sweetalert2';
export default {
  components: {
    PersonalInformation,
    History,
  },
  data: () => ({
    routes: [
      {
        icon: 'flaticon2-contract',
        desc: 'Edit Patient Information',
        link: '/patient/edit/',
        status: 'primary',
      },
    ],
    loading: false,
    DEPENDANT: 'Dependant',
    CASH: 'Cash',
    NHIS: 'NHIS',
    switchMessage: 'Switch patient account to',
  }),

  computed: {
    patient() {
      return this.$store.state.patient.patientProfile || {};
    },
  },

  watch: {
    patient: function(val) {
      if (val && val.patient_type !== this.DEPENDANT) {
        this.routes.push({
          icon: 'flaticon-security',
          desc: 'Add Insurance',
          link: '/patient/health-insurance/',
          status: 'danger',
        });
      }

      if (val && val.has_insurance && val.patient_type !== this.DEPENDANT) {
        this.routes.push(
          {
            icon: 'flaticon2-avatar',
            desc: 'Dependants',
            link: '/patient/dependants/',
            status: 'warning',
          },
          {
            icon: 'flaticon2-setup',
            desc: 'Change Insurance',
            link: '/patient/health-insurance/default/',
            status: 'success',
            query: true,
          },
          {
            icon: 'far fa-edit',
            desc: 'Edit Insurance',
            link: '/patient/edit-health-insurance/',
            status: 'info',
            query: true,
          }
        );
      }
    },
  },

  methods: {
    showAlert(event) {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to switch this patient to a Cash Patient!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Change!',
        cancelButtonText: 'No, cancel!',
        showLoaderOnConfirm: true,
      }).then(function(result) {
        if (result.value) {
          self.flipSwitch(event);
        } else {
          event.target.checked = !event.target.checked;
        }
      });
    },

    flipSwitch(event) {
      const hasInsurance = !!event.target.checked;
      const data = {
        has_insurance: hasInsurance,
      };
      this.$store
        .dispatch('patient/togglePatientInsurance', { data, id: this.$route.params.id })
        .then(() => this.fetchPatientDetails());
    },

    fetchPatientDetails() {
      this.$store
        .dispatch('patient/fetchPatientProfile', this.$route.params.id)
        .then(() => (this.loading = false));
    },
  },

  created() {
    this.loading = true;
    this.fetchPatientDetails();
  },
};
</script>
