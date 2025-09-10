<template>
  <!--begin::Card-->
  <div class="card card-custom gutter-b">
    <!-- Deceased Patient Banner -->
    <div v-if="patient.patient_status === 'Deceased'" class="alert alert-danger mb-0">
      <div class="alert-icon">
        <i class="fas fa-skull-crossbones"></i>
      </div>
      <div class="alert-text">
        <strong>PATIENT DECEASED</strong> - This patient has been marked as deceased on
        {{ formatDate(patient.date_of_death) }}
        <span v-if="patient.cause_of_death"> due to {{ patient.cause_of_death }}</span>
      </div>
    </div>

    <div class="card-header">
      <div class="card-title">
        <h3 class="card-label">Patient Profile</h3>
      </div>
      <div class="card-title">
        <span
          disabled
          :title="`${switchMessage} ${patient?.has_insurance ? CASH : NHIS}`"
          v-b-tooltip.hover
          class="switch mr-4"
          v-if="patient.patient_type !== DEPENDANT && patient?.insurance"
        >
          <label>
            <input
              disabled
              @change="showAlert($event)"
              :checked="patient?.has_insurance"
              type="checkbox"
            />
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
        <!-- Mark as Deceased Button (only for non-deceased patients) -->
        <span
          v-if="patient.patient_status !== 'Deceased' && allowedRoles.includes(currentUser.role)"
          class="switch mr-4"
        >
          <a
            v-b-tooltip:hover
            title="Mark as Deceased"
            class="btn btn-icon btn-light-danger pulse-danger pulse mr-2"
            @click="showMarkDeceasedAlert"
          >
            <i class="fas fa-skull-crossbones"></i>
            <span class="pulse-ring"></span>
          </a>
        </span>

        <!-- Revive Patient Button (only for deceased patients, admin only) -->
        <span
          v-if="patient.patient_status === 'Deceased' && currentUser.role === 'Super Admin'"
          class="switch mr-4"
        >
          <a
            v-b-tooltip:hover
            title="Revive Patient"
            class="btn btn-icon btn-light-success pulse-success pulse mr-2"
            @click="showRevivePatientAlert"
          >
            <i class="fas fa-heartbeat"></i>
            <span class="pulse-ring"></span>
          </a>
        </span>

        <span class="switch mr-4">
          <a
            v-b-tooltip:hover
            :title="patient.is_difficult_patient ? REMOVE_DIFFICULT : MARK_AS_DIFFICULT"
            class="btn btn-icon btn-light-danger pulse-danger pulse mr-2"
            @click="showConfirmAlert"
          >
            <i class="far fa-thumbs-down"></i>
            <span class="pulse-ring"></span>
          </a>
        </span>
        <!-- <span class="switch mr-4">
          <a
            v-b-tooltip:hover
            title="Print Hospital Card"
            class="btn btn-icon btn-light-secondary pulse-dark pulse"
            @click="showConfirmPrint"
          >
            <i class="fas fa-print text-dark"></i>
            <span class="pulse-ring"></span>
          </a>
        </span> -->
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

          <!-- Death Information Tab (only for deceased patients) -->
          <b-tab v-if="patient.patient_status === 'Deceased'" title="Death Information" lazy>
            <div class="row">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title">Death Details</h5>
                  </div>
                  <div class="card-body">
                    <div class="form-group">
                      <label class="form-label">Date of Death:</label>
                      <p class="form-control-static">{{ formatDate(patient.date_of_death) }}</p>
                    </div>
                    <div class="form-group" v-if="patient.cause_of_death">
                      <label class="form-label">Cause of Death:</label>
                      <p class="form-control-static">{{ patient.cause_of_death }}</p>
                    </div>
                    <div class="form-group" v-if="patient.death_certificate_number">
                      <label class="form-label">Death Certificate Number:</label>
                      <p class="form-control-static">{{ patient.death_certificate_number }}</p>
                    </div>
                    <div class="form-group" v-if="patient.marked_deceased_by">
                      <label class="form-label">Marked as Deceased by:</label>
                      <p class="form-control-static">
                        {{ patient.markedDeceasedBy?.fullname || 'Unknown' }}
                      </p>
                    </div>
                    <div class="form-group" v-if="patient.marked_deceased_at">
                      <label class="form-label">Marked on:</label>
                      <p class="form-control-static">
                        {{ formatDateTime(patient.marked_deceased_at) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6" v-if="patient.revival_reason">
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title">Revival Information</h5>
                  </div>
                  <div class="card-body">
                    <div class="form-group">
                      <label class="form-label">Revival Reason:</label>
                      <p class="form-control-static">{{ patient.revival_reason }}</p>
                    </div>
                    <div class="form-group" v-if="patient.revived_by">
                      <label class="form-label">Revived by:</label>
                      <p class="form-control-static">
                        {{ patient.revivedBy?.fullname || 'Unknown' }}
                      </p>
                    </div>
                    <div class="form-group" v-if="patient.revived_at">
                      <label class="form-label">Revived on:</label>
                      <p class="form-control-static">{{ formatDateTime(patient.revived_at) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </b-tab>
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
    MARK_AS_DIFFICULT: 'Mark as Difficult Patient',
    REMOVE_DIFFICULT: 'Remove as Difficult Patient',
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

    showConfirmAlert() {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        html: `You want to ${
          this.patient.is_difficult_patient ? 'remove' : 'mark'
        } this patient as a difficult patient?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, go ahead!',
        cancelButtonText: 'No, cancel',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return self.markAsDifficultPatient();
        },
      });
    },

    showConfirmPrint() {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        html: `You want to print card for ${this.patient.fullname}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, go ahead!',
        cancelButtonText: 'No, cancel',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return self.printHospitalCard();
        },
      });
    },

    markAsDifficultPatient() {
      const is_difficult_patient = !this.patient.is_difficult_patient;
      const data = {
        patient: { is_difficult_patient },
      };
      this.$store.dispatch('patient/updatePatient', { data, id: this.$route.params.id });
    },

    printHospitalCard() {
      this.$store.dispatch('patient/printHospitalCard', { id: this.$route.params.id });
    },

    showMarkDeceasedAlert() {
      const self = this;
      Swal.fire({
        title: 'Mark Patient as Deceased',
        html: `
          <div class="form-group">
            <label>Date of Death:</label>
            <input type="date" id="date_of_death" class="form-control" required>
          </div>
          <div class="form-group">
            <label>Cause of Death (optional):</label>
            <input type="text" id="cause_of_death" class="form-control" placeholder="Enter cause of death">
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Mark as Deceased',
        cancelButtonText: 'Cancel',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          const dateOfDeath = document.getElementById('date_of_death').value;
          const causeOfDeath = document.getElementById('cause_of_death').value;

          if (!dateOfDeath) {
            Swal.showValidationMessage('Date of death is required');
            return false;
          }

          return {
            date_of_death: dateOfDeath,
            cause_of_death: causeOfDeath,
          };
        },
      }).then(result => {
        if (result.value) {
          self.markPatientAsDeceased(result.value);
        }
      });
    },

    showRevivePatientAlert() {
      const self = this;
      Swal.fire({
        title: 'Revive Patient',
        html: `
          <div class="form-group">
            <label>Reason for Revival:</label>
            <textarea id="revival_reason" class="form-control" rows="3" placeholder="Enter reason for reviving this patient" required></textarea>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Revive Patient',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#28a745',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          const revivalReason = document.getElementById('revival_reason').value;

          if (!revivalReason.trim()) {
            Swal.showValidationMessage('Revival reason is required');
            return false;
          }

          return { revival_reason: revivalReason };
        },
      }).then(result => {
        if (result.value) {
          self.revivePatient(result.value);
        }
      });
    },

    async markPatientAsDeceased(deathData) {
      try {
        await this.$store.dispatch('patient/markPatientAsDeceased', {
          id: this.$route.params.id,
          data: deathData,
        });

        this.$bvToast.toast('Patient marked as deceased successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });

        this.fetchPatientDetails();
      } catch (error) {
        this.$bvToast.toast(error.response?.data?.message || 'Failed to mark patient as deceased', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    async revivePatient(revivalData) {
      try {
        await this.$store.dispatch('patient/revivePatient', {
          id: this.$route.params.id,
          data: revivalData,
        });

        this.$bvToast.toast('Patient revived successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });

        this.fetchPatientDetails();
      } catch (error) {
        this.$bvToast.toast(error.response?.data?.message || 'Failed to revive patient', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString();
    },

    formatDateTime(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString();
    },
  },

  created() {
    this.loading = true;
    this.fetchPatientDetails();
  },
};
</script>
