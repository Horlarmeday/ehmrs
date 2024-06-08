<template>
  <!--begin::Card-->
  <div class="card card-custom gutter-b">
    <div class="card-header">
      <div class="card-title">
        <h3 class="card-label">Patient Profile</h3>
      </div>
      <div class="card-title">
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
  }),

  computed: {
    patient() {
      return this.$store.state.patient.patientProfile || {};
    },
  },

  watch: {
    patient: function(val) {
      if (val && val.patient_type !== 'Dependant') {
        this.routes.push({
          icon: 'flaticon-security',
          desc: 'Add Insurance',
          link: '/patient/health-insurance/',
          status: 'danger',
        });
      }

      if (val && val.has_insurance && val.patient_type !== 'Dependant') {
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
          }
        );
      }
    },
  },

  created() {
    this.loading = true;
    this.$store.dispatch('patient/fetchPatientProfile', this.$route.params.id).then(() => this.loading = false);
  },
};
</script>
