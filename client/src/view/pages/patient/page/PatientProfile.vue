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

        <!-- CONVERT DEPENDANT TO PATIENT ACCOUNT -->
        <span
          v-if="patient.patient_type === this.DEPENDANT && allowedRoles.includes(currentUser.role)"
        >
          <a
            v-b-tooltip:hover
            title="Convert to Patient Account"
            class="btn btn-icon btn-light-danger pulse-danger pulse mr-5"
            @click="showConvertAccountAlert"
          >
            <i class="fas fa-compress-arrows-alt"></i>
            <span class="pulse-ring"></span>
          </a>
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

          <b-tab title="Consultations" lazy>
            <histories-table />
          </b-tab>

          <b-tab title="Diagnoses" lazy>
            <diagnoses-table />
          </b-tab>

          <b-tab title="Services" lazy>
            <services-table />
          </b-tab>

          <b-tab title="Payments" lazy>
            <payments-table />
          </b-tab>

          <b-tab title="Medications" lazy>
            <drugs-table />
          </b-tab>

          <b-tab title="Tests" lazy>
            <tests-table />
          </b-tab>

          <b-tab title="Radiology" lazy>
            <radiology-table investigations="" />
          </b-tab>

          <b-tab title="Items" lazy>
            <items-table />
          </b-tab>

          <b-tab title="Treatments" lazy>
            <treatments-table />
          </b-tab>

          <b-tab title="Vitals" lazy>
            <triages-table />
          </b-tab>

          <b-tab title="Programs" lazy><b-alert show>I'm lazy mounted!</b-alert></b-tab>
        </b-tabs>
      </div>
      <!--end::Example-->
    </div>
  </div>
  <!--end::Card-->
</template>

<script>
import PersonalInformation from '@/view/pages/patient/components/PersonalInformation.vue';
import Swal from 'sweetalert2';
import PaymentsTable from './components/tables/PaymentsTable.vue';
import ServicesTable from './components/tables/ServicesTable.vue';
import DrugsTable from './components/tables/DrugsTable.vue';
import TestsTable from './components/tables/TestsTable.vue';
import RadiologyTable from './components/tables/RadiologyTable.vue';
import ItemsTable from './components/tables/ItemsTable.vue';
import TreatmentsTable from './components/tables/TreatmentsTable.vue';
import TriagesTable from './components/tables/TriagesTable.vue';
import HistoriesTable from './components/tables/HistoriesTable.vue';
import DiagnosesTable from './components/tables/DiagnosesTable.vue';
import { parseJwt } from '@/common/common';
export default {
  components: {
    DiagnosesTable,
    HistoriesTable,
    TriagesTable,
    TreatmentsTable,
    ItemsTable,
    RadiologyTable,
    DrugsTable,
    ServicesTable,
    PaymentsTable,
    PersonalInformation,
    TestsTable,
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
    currentUser: parseJwt(localStorage.getItem('user_token')),
    allowedRoles: ['Super Admin'],
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

      // if (val && val.patient_type === this.DEPENDANT) {
      //   this.routes.push({
      //     icon: 'fas fa-compress-arrows-alt',
      //     desc: 'Convert to Patient Account',
      //     link: '/patient/edit/',
      //     status: 'danger',
      //   });
      // }

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

    convertDependantAccount() {
      this.$store
        .dispatch('patient/convertDependantAccount', this.$route.params.id)
        .then(() => this.fetchPatientDetails());
    },

    showConvertAccountAlert() {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        html: 'You want to switch this <b>Dependant</b> account to a <b>Patient</b> account!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Convert!',
        cancelButtonText: 'No, cancel',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return self.convertDependantAccount();
        },
      });
    },
  },

  created() {
    this.loading = true;
    this.fetchPatientDetails();
  },
};
</script>
