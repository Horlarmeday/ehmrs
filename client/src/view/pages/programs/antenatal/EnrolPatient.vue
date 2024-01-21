<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-header">
        <h3 class="card-title">
          <span class="card-label font-weight-bolder text-dark">Enrol Ante-Natal Program</span>
        </h3>
      </div>
      <div class="card-body">
        <div class="form-group row">
          <label class="col-lg-2 col-form-label">Name:</label>
          <div class="col-lg-6">
            <v-select
              @search="searchPatients"
              label="fullname"
              v-model="patient"
              :options="patients"
              :reduce="
                patients => ({
                  fullname: patients.fullname,
                  firstname: patients.firstname,
                  lastname: patients.lastname,
                  id: patients.id,
                  phone: patients?.phone,
                  address: patients.address,
                  photo: patients.photo,
                  hospital_id: patients.hospital_id,
                  gender: patients?.gender,
                  date_of_birth: patients?.date_of_birth,
                })
              "
            />
          </div>
        </div>
        <transition name="fade-in-up">
          <patient-banner v-if="patient" :patient="patient" />
        </transition>
        <transition name="fade-in-up">
          <div v-if="patient && !patient.has_insurance" class="form-group mt-2">
            <label>Choose Payment Option:</label>
            <div class="row">
              <div class="col-lg-4 cursor-pointer" v-for="(service, i) in services" :key="i">
                <label class="option">
                  <span class="option-control">
                    <span class="radio">
                      <input type="radio" v-model="service_id" :value="service.id" />
                      <span></span>
                    </span>
                  </span>
                  <span class="option-label">
                    <span class="option-head">
                      <span class="option-title">
                        {{ service.name }}
                      </span>
                    </span>
                    <span class="font-weight-bolder option-body font-size-lg">
                      ₦{{ service.price }}
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </transition>
        <div class="float-right">
          <button
            @click="enrolAntenatal"
            :disabled="isDisabled"
            ref="kt_antenatal_submit"
            class="btn btn-primary"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import { debounce } from '@/common/common';
import PatientBanner from '@/view/pages/programs/components/PatientBanner.vue';
import Swal from 'sweetalert2';
export default {
  components: {
    PatientBanner,
    vSelect,
  },
  data: () => ({
    service_id: '',
    patient: '',
    antenatal: '',
    isDisabled: false,
    ancRegistration: 'ANC Registration',
    genderFilter: { gender: 'Female' },
  }),
  computed: {
    patients() {
      return this.$store.state.patient.patients;
    },
    services() {
      return this.$store.state.model.services;
    },
    antenatal() {
      return this.$store.state.antenatal.antenatal;
    },
  },
  methods: {
    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    searchPatients(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debounceSearch(search, this, loading);
      }
    },

    debounceSearch: debounce((search, vm, loading) => {
      vm.$store
        .dispatch('patient/fetchPatients', {
          currentPage: 1,
          itemsPerPage: 10,
          search,
          filter: vm.genderFilter,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    fetchServices() {
      this.$store.dispatch('model/fetchServices', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search: this.ancRegistration,
      });
    },

    endRequest(submitButton) {
      this.removeSpinner(submitButton);
      this.displayPrompt();
    },

    displayPrompt() {
      Swal.fire({
        title: 'Important! A visit is required',
        text: 'Would you like to create a visit for this patient?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Yes, Continue!',
        cancelButtonText: 'No, cancel!',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return this.createVisit();
        },
      });
    },

    handleSuccess(response) {
      Swal.fire({
        title: 'Success!',
        html: `${response.data.message}`,
        icon: 'success',
        confirmButtonClass: 'btn btn-primary',
        heightAuto: false,
      });
    },

    createVisit() {
      const obj = {
        patient_id: this.patient.id,
        category: 'Antenatal',
        ante_natal_id: this.antenatal.id,
        type: 'New visit',
        date_of_visit: new Date(),
        department: 'Nursing',
        professional: 'Nurse',
      };
      this.$store.dispatch('visit/addVisit', obj).then(response => {
        this.initValues();
        this.handleSuccess(response);
      });
    },

    enrolAntenatal() {
      const obj = {
        ...(this.service_id && { service_id: this.service_id }),
        patient_id: this.patient.id,
      };
      const submitButton = this.$refs['kt_antenatal_submit'];
      this.addSpinner(submitButton);
      this.$store
        .dispatch('antenatal/enrolAntenatalPatient', obj)
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    initValues() {
      this.patient = '';
      this.service_id = '';
    },
  },
  created() {
    this.fetchServices();
  },
};
</script>

<style scoped></style>
