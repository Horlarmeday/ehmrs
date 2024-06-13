<template>
  <div>
    <!--begin::Accordion-->
    <div
      class="accordion accordion-solid accordion-panel accordion-svg-toggle"
      id="accordionExample8"
      role="tablist"
    >
      <!-- Personal Info -->
      <div class="card">
        <div class="card-header" header-tag="header" role="tab">
          <div class="card-title" v-b-toggle.accordion-1>
            <div class="card-label">{{ patient?.fullname }}</div>
            <accordion-icon />
          </div>
        </div>
        <b-collapse id="accordion-1" visible accordion="my-accordion" role="tabpanel">
          <div class="card-body">
            <h6 class=" mt-4 text-primary">Health insurance</h6>
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Insurance Type <span class="text-danger">*</span></label>
                <select
                  class="form-control"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  name="insurance_id"
                  v-model="insurance_id"
                  @change="getHMOs"
                >
                  <option :value="insurance.id" v-for="(insurance, i) in insurances" :key="i">{{
                    insurance.name
                  }}</option>
                </select>
                <span class="text-danger text-sm">{{ errors.first('insurance_id') }}</span>
              </div>
              <div class="col-lg-4">
                <label>HMO <span class="text-danger">*</span></label>
                <v-select
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  name="hmo_id"
                  v-model="hmo_id"
                  label="name"
                  :reduce="hmos => hmos.id"
                  :options="hmos"
                ></v-select>
                <span class="text-danger text-sm">{{ errors.first('hmo_id') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Policy Number <span class="text-danger">*</span></label>
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="enrollee_id"
                  placeholder="Policy Number"
                  name="enrollee_id"
                />
                <span class="text-danger text-sm">{{ errors.first('enrollee_id') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Organization <span class="text-danger">*</span></label>
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control"
                  v-model="organization"
                  placeholder="Organization"
                  name="organization"
                />
                <span class="text-danger text-sm">{{ errors.first('organization') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Plan <span class="text-danger">*</span></label>
                <select
                  class="form-control"
                  v-model="plan"
                  name="plan"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                >
                  <option value="Social">Social </option>
                  <option value="Gold">Gold</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Emerald">Emerald</option>
                </select>
                <span class="text-danger text-sm">{{ errors.first('plan') }}</span>
              </div>
            </div>
          </div>
        </b-collapse>
      </div>
      <!-- Dependants -->
      <div class="card">
        <div class="card-header" header-tag="header" role="tab">
          <div class="card-title" v-b-toggle.accordion-3>
            <div class="card-label">Dependant Details</div>
            <accordion-icon />
          </div>
        </div>
        <b-collapse id="accordion-3" visible accordion="my-accordion" role="tabpanel">
          <div class="card-body">
            <div class="pt-6">
              <img
                src="/media/users/blank.png"
                v-if="!dvideoShowing && !dependant_image"
                width="160"
              />
              <video
                ref="dependant_video"
                id="dependant_video"
                v-show="!dependant_image"
                style="height:1px;width:120px;margin-bottom:20px;"
                autoplay
              ></video>
              <canvas
                ref="dependant_canvas"
                id="dependant_canvas"
                width="250"
                height="187"
                v-show="dependant_image"
              >
              </canvas>
              <button
                id="snap"
                v-if="!dependant_image && !dphotoSaved && !dvideoShowing"
                class="btn btn-success btn-sm mt-4"
                style="display: block;"
                v-on:click="startDependantCamera()"
              >
                Take Photo
              </button>
              <button
                id="snap"
                v-if="!dependant_image && !dphotoSaved && dvideoShowing"
                class="btn btn-success btn-sm"
                style="display: block;"
                v-on:click="captureDependant()"
              >
                Snap Photo
              </button>
              <div class="row" v-if="!dphotoLoading" style="padding-top: 15px">
                <div class="ml-5">
                  <button
                    id="snap"
                    v-if="dependant_image && !dphotoSaved"
                    class="btn btn-primary btn-sm"
                    v-on:click="snapDependantAgain()"
                  >
                    Snap Again
                  </button>
                </div>
              </div>
            </div>

            <hr />
            <!-- NAME -->
            <div class="form-group row">
              <div class="col-lg-4">
                <label>First Name <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="dependant_firstname"
                  placeholder="First Name"
                />
              </div>
              <div class="col-lg-4">
                <label>Last Name <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="dependant_lastname"
                  placeholder="Last Name"
                  name="dependant_lastname"
                />
              </div>
              <div class="col-lg-4">
                <label>Phone Number</label>
                <input
                  maxlength="11"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="dependant_phone"
                  placeholder="Phone Number (Optional)"
                  name="dependant_phone"
                />
              </div>
            </div>
            <!-- Contact -->
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Date of Birth <span class="text-danger">*</span></label>
                <datepicker
                  data-vv-validate-on="blur"
                  v-model="dependant_date_of_birth"
                  input-class="form-control form-control-sm"
                  placeholder="Date of Birth"
                ></datepicker>
              </div>
              <div class="col-lg-4">
                <label>Gender <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="dependant_gender"
                  name="dependant_gender"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="col-lg-4">
                <label>Home Address <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="dependant_address"
                  placeholder="Home Address"
                  name="dependant_address"
                />
              </div>
            </div>
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Relationship with Principal <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="dependant_relationship"
                  name="dependant_relationship"
                >
                  <option disabled selected>Select</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Wife">Wife</option>
                  <option value="Husband">Husband</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                </select>
              </div>
              <div class="col-lg-4">
                <label>Policy Number <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="dependant_enrollee_id"
                  placeholder="Policy Number"
                  name="dependant_enrollee_id"
                />
              </div>
            </div>
            <div>
              <button class="btn btn-light-primary float-right mb-2" @click="saveDependant">
                Add
              </button>
            </div>
            <div v-if="dependants.length" class="row">
              <div class="col-lg-12">
                <div class="card card-custom card-stretch gutter-b">
                  <!--begin::Header-->
                  <div class="card-header border-0 py-5">
                    <h3 class="card-title align-items-start flex-column">
                      <span class="card-label font-weight-bolder text-dark">Dependants</span>
                    </h3>
                  </div>
                  <!--end::Header-->

                  <!--begin::Body-->
                  <div class="card-body pt-0 pb-3">
                    <div class="tab-content">
                      <!--begin::Table-->
                      <div class="table-responsive">
                        <table
                          class="table table-head-custom table-head-bg table-borderless table-vertical-center"
                        >
                          <thead>
                            <tr class="text-left text-uppercase">
                              <th style="min-width: 250px" class="pl-7">
                                <span class="text-dark-75">Name</span>
                              </th>
                              <th style="min-width: 100px">Phone</th>
                              <th style="min-width: 100px">Gender</th>
                              <th style="min-width: 100px">Date of Birth</th>
                              <th style="min-width: 130px">Policy Number</th>
                              <th style="min-width: 80px"></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(dependant, index) in dependants" :key="index">
                              <td class="pl-0 py-8">
                                <div class="d-flex align-items-center">
                                  <div class="symbol symbol-50 symbol-light mr-4">
                                    <span class="symbol-label">
                                      <img
                                        :src="dependant.photo"
                                        class="h-75 align-self-end"
                                        alt=""
                                      />
                                    </span>
                                  </div>
                                  <div>
                                    <a
                                      href="#"
                                      class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                                      >{{ dependant.firstname }} {{ dependant.lastname }}</a
                                    >
                                    <span class="text-muted font-weight-bold d-block">{{
                                      dependant.address
                                    }}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                                  {{ dependant.phone }}
                                </span>
                              </td>
                              <td>
                                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                                  {{ dependant.gender }}
                                </span>
                              </td>
                              <td>
                                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                                  {{ dependant.date_of_birth | dayjs('DD/MM/YYYY') }}
                                </span>
                              </td>
                              <td>
                                <span class="text-muted font-weight-bold d-block font-size-sm">
                                  {{ dependant.enrollee_code }}
                                </span>
                              </td>
                              <td class="">
                                <a href="#" @click="editDependant(dependant, index)"
                                  ><i class="flaticon2-contract text-primary mr-2"></i
                                ></a>
                                <a href="#" @click="removeDependant(index)"
                                  ><i class="flaticon2-trash text-danger"></i
                                ></a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <!--end::Table-->
                    </div>
                  </div>
                  <!--end::Body-->
                </div>
              </div>
            </div>
          </div>
        </b-collapse>
      </div>
      <!-- Button to page -->
      <div>
        <button
          ref="kt-sign_up_submit"
          class="btn btn-primary font-weight-bold float-right mr-4"
          @click="addPatient"
        >
          Submit Info
        </button>
      </div>
    </div>
    <!--end::Accordion-->
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import vSelect from 'vue-select';
import AccordionIcon from '@/assets/icons/AccordionIcon';
import Swal from 'sweetalert2';
export default {
  components: {
    Datepicker,
    vSelect,
    AccordionIcon,
  },
  data() {
    return {
      hmo_id: '',
      organization: '',
      enrollee_id: '',
      relationship: '',
      plan: '',
      insurance_id: '',
      states: [],
      cities: [],

      dependant_firstname: '',
      dependant_lastname: '',
      dependant_phone: '',
      dependant_relationship: '',
      dependant_enrollee_id: '',
      dependant_gender: '',
      dependant_address: '',
      dependant_date_of_birth: '',
      dependant_image: '',
      isDisabled: false,

      dependants: [],
      // dependant video
      dshowFinish: false,
      dvideoShowing: false,
      dphotoSaved: false,
      dphotoLoading: false,
      dependantvideo: {},
      dependantcanvas: {},
    };
  },
  created() {
    this.getPatient();
    this.getInsurances();
  },
  computed: {
    hmos() {
      return this.$store.state.insurance.hmos;
    },

    insurances() {
      return this.$store.state.insurance.insurances;
    },

    patient() {
      return this.$store.state.patient.patient;
    },
  },

  methods: {
    getInsurances() {
      this.$store.dispatch('insurance/fetchInsurances', {
        currentPage: 1,
        itemsPerPage: 25,
      });
    },

    getPatient() {
      this.$store.dispatch('patient/fetchPatient', this.$route.params.id);
    },

    getHMOs() {
      this.$store.dispatch('insurance/fetchHMOs', {
        currentPage: 1,
        itemsPerPage: 200,
        filter: this.insurance_id,
      });
    },

    // Image Capture
    stopStreamedVideo(videoElem) {
      const stream = videoElem.srcObject;
      const tracks = stream.getTracks();

      tracks.forEach(function(track) {
        track.stop();
      });

      videoElem.srcObject = null;
    },

    capture() {
      this.canvas = this.$refs.canvas;
      this.canvas.getContext('2d').drawImage(this.video, 0, 0, 250, 187);
      this.image = this.canvas.toDataURL();
    },

    toggleDependantVideoShowing() {
      this.dvideoShowing = !this.dvideoShowing;
    },

    startDependantCamera() {
      this.toggleDependantVideoShowing();
      this.dependantvideo = this.$refs.dependant_video;
      this.dependantvideo.style = 'display:block;width:250px;margin-bottom:20px;';
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          this.dependantvideo.srcObject = stream;
          this.dependantvideo.play();
        });
      }
    },

    captureDependant() {
      this.dependantcanvas = this.$refs.dependant_canvas;
      this.dependantcanvas.getContext('2d').drawImage(this.dependantvideo, 0, 0, 250, 187);
      this.dependant_image = this.dependantcanvas.toDataURL();
    },

    snapDependantAgain() {
      this.dependantvideo = this.$refs.dependant_video;
      this.dependantvideo.style = 'display:block;width:250px;margin-bottom:20px;';
      this.dependant_image = null;
    },

    initPatientValues() {
      this.hmo_id = '';
      this.enrollee_id = '';
      this.organization = '';
      this.plan = '';
      this.insurance_id = '';
      this.dependants = [];
    },

    initDependant() {
      this.dependant_firstname = '';
      this.dependant_lastname = '';
      this.dependant_phone = '';
      this.dependant_relationship = '';
      this.dependant_enrollee_id = '';
      this.dependant_gender = '';
      this.dependant_address = '';
      this.dependant_date_of_birth = '';
      this.dependant_image = null;
      this.dshowFinish = false;
      this.dvideoShowing = false;
      this.dphotoSaved = false;
      this.dphotoLoading = false;
      this.dependantvideo = {};
      this.dependantcanvas = {};
    },

    saveDependant() {
      if (!this.dependant_image) return this.notifyPhoto();
      this.dependants.push({
        firstname: this.dependant_firstname,
        lastname: this.dependant_lastname,
        phone: this.dependant_phone || this.patient.phone,
        country: this.patient.country,
        state: this.patient.state,
        lga: this.patient.lga,
        relationship_to_principal: this.dependant_relationship,
        enrollee_code: this.dependant_enrollee_id,
        insurance_id: this.insurance_id,
        hmo_id: this.hmo_id,
        gender: this.dependant_gender,
        address: this.dependant_address,
        plan: this.plan,
        date_of_birth: this.dependant_date_of_birth,
        photo: this.dependant_image,
      });
      if (this.dependantvideo) this.stopStreamedVideo(this.dependantvideo);
      this.initDependant();
    },

    removeDependant(index) {
      this.dependants.splice(index, 1);
    },

    editDependant(dependant, index) {
      this.dependant_firstname = dependant.firstname;
      this.dependant_lastname = dependant.lastname;
      this.dependant_phone = this.patient.phone;
      this.dependant_relationship = dependant.relationship;
      this.dependant_enrollee_id = dependant.enrollee_code;
      this.dependant_gender = dependant.gender;
      this.dependant_address = dependant.address;
      this.dependant_date_of_birth = dependant.date_of_birth;
      this.dependant_image = dependant.photo;
      this.removeDependant(index);
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    displayErrorPrompt() {
      Swal.fire({
        title: 'Error!',
        html: `Click the add button to add the dependant, before clicking the submit button`,
        icon: 'error',
        timerProgressBar: '10s',
        heightAuto: false,
      });
    },

    displayPrompt() {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Patient does not have any dependant',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Continue!',
        cancelButtonText: 'No, cancel!',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return this.finishAddPatient();
        },
      });
    },

    notifyPhoto() {
      return this.$notify({
        group: 'foo',
        title: 'Error message',
        text: 'Please take photo',
        type: 'error',
      });
    },

    addPatient() {
      this.$validator.validateAll().then(result => {
        if (result) {
          if (this.dependant_firstname) return this.displayErrorPrompt();
          if (this.dependants.length === 0) return this.displayPrompt();
          this.finishAddPatient();
        }
      });
    },

    finishAddPatient() {
      const submitButton = this.$refs['kt-sign_up_submit'];
      this.addSpinner(submitButton);

      const data = {
        enrollee_code: this.enrollee_id,
        organization: this.organization,
        hmo_id: this.hmo_id,
        insurance_id: this.insurance_id,
        plan: this.plan,
        dependants: this.dependants,
      };

      this.$store
        .dispatch('patient/addPatientHealthInsurance', { data, patient_id: this.patient.id })
        .then(() => {
          this.removeSpinner(submitButton);
          this.initPatientValues();
          if (this.dependantvideo) this.stopStreamedVideo(this.dependantvideo);
        })
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped>
.form-group {
  margin-bottom: 0.9rem !important;
}
</style>
