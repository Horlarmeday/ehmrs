<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-header">
        <h3 class="card-title">
          <span class="card-label font-weight-bolder text-dark">Enrol Immunization Program</span>
        </h3>
      </div>
      <div class="card-body">
        <div class="form-group row">
          <label class="col-lg-2 col-form-label">Patient Name:</label>
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
          <div v-if="patient">
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Birth Weight</label>
                <input type="text" class="form-control form-control-sm" v-model="weight" />
              </div>
              <div class="col-lg-4">
                <label>Place of Birth:</label>
                <input type="text" class="form-control form-control-sm" v-model="place_of_birth" />
              </div>
              <div class="col-lg-4">
                <label>Mother's Name:</label>
                <input type="text" class="form-control form-control-sm" v-model="mother_name" />
              </div>
            </div>
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Father's Name</label>
                <input type="text" class="form-control form-control-sm" v-model="father_name" />
              </div>
              <div class="col-lg-4">
                <label>At Birth:</label>
                <v-select
                  v-model="medications_at_birth"
                  :options="['BCG', 'HBV O', 'Vit A mum', 'OPV O']"
                  multiple
                />
              </div>
            </div>
            <SectionTitle text="Other Children" />
            <div class="form-group row" v-for="(child, i) in children" :key="i">
              <div class="col-lg-3">
                <label>Year</label>
                <select v-model="child.year" class="form-control form-control-sm">
                  <option disabled>Select Year</option>
                  <option v-for="(year, i) in years" :key="i">{{ year }}</option>
                </select>
              </div>
              <div class="col-lg-3">
                <label>Maturity</label>
                <select v-model="child.sex" class="form-control form-control-sm">
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div class="col-lg-3">
                <label>State of Health</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="child.state_of_health"
                />
              </div>
              <div style="margin-top: 30px">
                <div v-if="i !== 0" @click="removeChild(i)">
                  <i class="la la-trash text-danger icon-2x cursor-pointer"></i>
                </div>
                <div v-if="i === 0" @click="addChild">
                  <i class="la la-plus-square text-primary icon-2x cursor-pointer"></i>
                </div>
              </div>
            </div>
            <SectionTitle text="Reasons for Child Care" />
            <div>
              <div class="form-group row">
                <label class="col-2 col-form-label">Was the baby less than 2.5kg at birth?</label>
                <div class="col-2">
                  <span class="switch switch-icon">
                    <label>
                      <input type="checkbox" v-model="is_wt_less_than_2_5kg" />
                      <span></span>
                    </label>
                  </span>
                </div>
                <label class="col-2 col-form-label">Is the baby a twin?</label>
                <div class="col-2">
                  <span class="switch switch-icon">
                    <label>
                      <input type="checkbox" v-model="is_baby_twin" />
                      <span></span>
                    </label>
                  </span>
                </div>
                <label class="col-2 col-form-label">Is the baby bottle fed?</label>
                <div class="col-2">
                  <span class="switch switch-icon">
                    <label>
                      <input type="checkbox" v-model="is_baby_bottle_fed" />
                      <span></span>
                    </label>
                  </span>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-2 col-form-label">Does the mother need family support?</label>
                <div class="col-2">
                  <span class="switch switch-icon">
                    <label>
                      <input type="checkbox" v-model="does_family_need_support" />
                      <span></span>
                    </label>
                  </span>
                </div>
                <label class="col-2 col-form-label"
                  >Are any brothers or sisters under weight?</label
                >
                <div class="col-2">
                  <span class="switch switch-icon">
                    <label>
                      <input type="checkbox" v-model="are_siblings_under_weight" />
                      <span></span>
                    </label>
                  </span>
                </div>
                <label class="col-2 col-form-label"
                  >Are there any other reason for taking extra care?</label
                >
                <div class="col-2">
                  <span class="switch switch-icon">
                    <label>
                      <input type="checkbox" v-model="need_extra_care" />
                      <span></span>
                    </label>
                  </span>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-2 col-form-label"
                  >For example: Tuberculosis, Leprosy or social problem?
                </label>
                <div class="col-3">
                  <input
                    class="form-control form-control-sm"
                    v-model="reason_for_extra_care"
                    type="text"
                  />
                </div>
                <label class="col-2 col-form-label">Associated Service:</label>
                <div class="col-3">
                  <v-select
                    multiple
                    name="service"
                    @search="onHandleSearch"
                    v-model="service_id"
                    label="name"
                    :options="services"
                    :reduce="services => services.id"
                  />
                </div>
              </div>
            </div>
          </div>
        </transition>
        <div class="float-right">
          <button
            @click="enrolImmunization"
            :disabled="isDisabled || isInvalidAge"
            ref="kt_immunization_submit"
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
import { debounce, parseJwt } from '@/common/common';
import PatientBanner from '@/view/pages/programs/components/PatientBanner.vue';
import Swal from 'sweetalert2';
import SectionTitle from '@/utils/SectionTitle.vue';
export default {
  components: {
    SectionTitle,
    PatientBanner,
    vSelect,
  },
  data: () => ({
    patient: '',
    service_id: '',
    isDisabled: false,
    isInvalidAge: false,
    years: [],
    children: [
      {
        sex: '',
        year: '',
        state_of_health: '',
      },
    ],
    place_of_birth: '',
    reason_for_extra_care: '',
    mother_name: '',
    father_name: '',
    weight: '',
    medications_at_birth: '',
    is_wt_less_than_2_5kg: false,
    is_baby_twin: false,
    is_baby_bottle_fed: false,
    does_family_need_support: false,
    are_siblings_under_weight: false,
    need_extra_care: false,
  }),
  computed: {
    patients() {
      return this.$store.state.patient.patients;
    },
    services() {
      return this.$store.state.model.services;
    },
    immunization() {
      return this.$store.state.immunization.immunization;
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
        this.isInvalidAge = false;
        this.debounceSearch(search, this, loading);
      }
    },

    debounceSearch: debounce((search, vm, loading) => {
      vm.$store
        .dispatch('patient/fetchPatients', {
          currentPage: 1,
          itemsPerPage: 10,
          search,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    endRequest(submitButton) {
      this.removeSpinner(submitButton);
      this.handleSuccess();
      this.initValues();
    },

    handleSuccess() {
      Swal.fire({
        title: 'Success!',
        html: `Immunization created successfully, A visit has already been created too`,
        icon: 'success',
        confirmButtonClass: 'btn btn-primary',
        heightAuto: false,
      });
    },

    enrolImmunization() {
      const obj = {
        patient_id: this.patient.id,
        is_wt_less_than_2_5kg: this.is_wt_less_than_2_5kg,
        is_baby_twin: this.is_baby_twin,
        place_of_birth: this.place_of_birth,
        is_baby_bottle_fed: this.is_baby_bottle_fed,
        does_family_need_support: this.does_family_need_support,
        are_siblings_under_weight: this.are_siblings_under_weight,
        need_extra_care: this.need_extra_care,
        reason_for_extra_care: this.reason_for_extra_care,
        mother_name: this.mother_name,
        father_name: this.father_name,
        service_id: this.service_id,
        at_birth: {
          medications: this.medications_at_birth,
          weight: this.weight,
          createdAt: new Date(),
          staff: {
            fullname: parseJwt(localStorage.getItem('user_token'))?.fullname,
          },
        },
        other_children: this.children,
      };
      const submitButton = this.$refs['kt_immunization_submit'];
      this.addSpinner(submitButton);
      this.$store
        .dispatch('immunization/enrolImmunizationPatient', obj)
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    initValues() {
      this.patient = '';
      this.children = [
        {
          sex: '',
          year: '',
          state_of_health: '',
        },
      ];
      this.is_wt_less_than_2_5kg = '';
      this.is_baby_twin = '';
      this.place_of_birth = '';
      this.is_baby_bottle_fed = '';
      this.does_family_need_support = '';
      this.are_siblings_under_weight = '';
      this.need_extra_care = '';
      this.reason_for_extra_care = '';
      this.mother_name = '';
      this.father_name = '';
      this.service_id = '';
    },

    getYears(startYear) {
      const currentYear = new Date().getFullYear();
      while (startYear <= currentYear) {
        this.years.push(startYear++);
      }
    },

    addChild() {
      this.children.push({
        year: '',
        sex: '',
        state_of_health: '',
      });
    },

    removeChild(index) {
      this.children.splice(index, 1);
    },

    onHandleSearch(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debounceSearchServices(loading, search, this);
      }
    },

    debounceSearchServices: debounce((loading, search, vm) => {
      vm.$store
        .dispatch('model/fetchServices', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),
  },
  created() {
    this.getYears(1990);
  },
};
</script>

<style scoped></style>
