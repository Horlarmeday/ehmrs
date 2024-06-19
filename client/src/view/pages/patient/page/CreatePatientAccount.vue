<template>
  <div>
    <!--begin::Accordion-->
    <div
      class="accordion accordion-solid accordion-panel accordion-svg-toggle"
      id="accordionExample8"
      role="tablist"
    >
      <div class="card">
        <div class="card-header" header-tag="header" role="tab">
          <div class="card-title" v-b-toggle.accordion-1>
            <div class="card-label">Personal Details</div>
            <accordion-icon />
          </div>
        </div>
        <b-collapse id="accordion-1" visible accordion="my-accordion" role="tabpanel">
          <div class="card-body">
            <div class="center pt-6">
              <img
                src="/media/users/blank.png"
                v-if="!videoShowing && !image"
                width="160"
                alt="Blank"
              />
              <video
                ref="video"
                id="video"
                v-show="!image && !photoSaved"
                style="height:1px;width:120px;margin-bottom:20px;"
                autoplay
              ></video>
              <canvas ref="canvas" id="canvas" width="250" height="187" v-show="image"> </canvas>
              <button
                id="snap"
                v-if="!image && !photoSaved && !videoShowing"
                class="btn btn-success btn-sm mt-4"
                style="display: block;"
                v-on:click="startCamera()"
              >
                Take Photo
              </button>
              <button
                id="snap"
                v-if="!image && !photoSaved && videoShowing"
                class="btn btn-success btn-sm"
                style="display: block;"
                v-on:click="capture()"
              >
                Snap Photo
              </button>
              <div class="row" v-if="!photoLoading" style="padding-top: 15px">
                <div class="ml-5">
                  <button
                    id="snap"
                    v-if="image && !photoSaved"
                    class="btn btn-primary btn-sm"
                    v-on:click="snapAgain()"
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
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="firstname"
                  placeholder="First Name"
                  name="firstname"
                />
                <span class="text-danger text-sm">{{ errors.first('firstname') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Middle Name</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="middlename"
                  placeholder="Middle Name"
                  name="middlename"
                />
                <span class="text-danger text-sm">{{ errors.first('middlename') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Last Name <span class="text-danger">*</span></label>
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="lastname"
                  placeholder="Last Name"
                  name="lastname"
                />
                <span class="text-danger text-sm">{{ errors.first('lastname') }}</span>
              </div>
            </div>
            <!-- Contact -->
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Email</label>
                <input
                  type="email"
                  class="form-control form-control-sm"
                  name="email"
                  placeholder="Enter email"
                  v-model="email"
                />
                <span class="text-danger text-sm">{{ errors.first('email') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Phone Number <span class="text-danger">*</span></label>
                <input
                  v-validate="'required|min:11|max:11|phone_pattern'"
                  data-vv-validate-on="blur"
                  maxlength="11"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="phone"
                  placeholder="Phone Number"
                  name="phone"
                />
                <span class="text-danger text-sm">{{ errors.first('phone') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Religion <span class="text-danger">*</span></label>
                <select
                  v-model="religion"
                  class="form-control form-control-sm"
                  name="religion"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                >
                  <option value="Islam">Islam</option>
                  <option value="Christianity">Christianity</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Other">Other</option>
                </select>
                <span class="text-danger text-sm">{{ errors.first('religion') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Date of Birth <span class="text-danger">*</span></label>
                <datepicker
                  name="date_of_birth"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  v-model="date_of_birth"
                  input-class="form-control form-control-sm"
                  placeholder="Date of Birth"
                  todayHighlight
                />
                <span class="text-danger text-sm">{{ errors.first('date_of_birth') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Gender <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="gender"
                  name="gender"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <span class="text-danger text-sm">{{ errors.first('gender') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Marital Status <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="marital_status"
                  name="marital_status"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                >
                  <option value="Married">Married </option>
                  <option value="Single">Single</option>
                  <option value="Widow">Widow</option>
                  <option value="Widower">Widower</option>
                  <option value="Divorced">Divorced</option>
                </select>
                <span class="text-danger text-sm">{{ errors.first('marital_status') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Country (Residential)<span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="country"
                  name="country"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                >
                  <option v-for="country in countries" :key="country.id" :value="country.name"
                    >{{ country.name }}
                  </option>
                </select>
                <span class="text-danger text-sm">{{ errors.first('country') }}</span>
              </div>
              <div class="col-lg-4">
                <label>States (Residential)<span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="state"
                  name="state"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  @change="getLga"
                >
                  <option
                    v-for="state in states"
                    :key="state.name"
                    :value="{ name: state.name, lga: state.lga }"
                    >{{ state.name }}
                  </option>
                </select>
                <span class="text-danger text-sm">{{ errors.first('state') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Local Government (Residential)<span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="lga"
                  name="lga"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                >
                  <option v-for="city in cities" :key="city.name" :value="city.name"
                    >{{ city.name }}
                  </option>
                </select>
                <span class="text-danger text-sm">{{ errors.first('lga') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Home Address <span class="text-danger">*</span></label>
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="address"
                  placeholder="Home Address"
                  name="address"
                />
                <span class="text-danger text-sm">{{ errors.first('address') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Occupation <span class="text-danger">*</span></label>
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="occupation"
                  placeholder="Occupation"
                  name="occupation"
                />
                <span class="text-danger text-sm">{{ errors.first('occupation') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Alternate Phone Number</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="alt_phone"
                  maxlength="11"
                  placeholder="Alternate Phone"
                />
              </div>
            </div>
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Next of Kin Name <span class="text-danger">*</span></label>
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="next_of_kin_name"
                  placeholder="Name"
                  name="next_of_kin_name"
                />
                <span class="text-danger text-sm">{{ errors.first('next_of_kin_name') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Next of Kin Address <span class="text-danger">*</span></label>
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="next_of_kin_address"
                  placeholder="Address"
                  name="next_of_kin_address"
                />
                <span class="text-danger text-sm">{{ errors.first('next_of_kin_address') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Next of Kin Phone <span class="text-danger">*</span></label>
                <input
                  v-validate="'required|min:11|max:11|phone_pattern'"
                  data-vv-validate-on="blur"
                  type="text"
                  minlength="11"
                  maxlength="11"
                  class="form-control form-control-sm"
                  v-model="next_of_kin_phone"
                  placeholder="Phone"
                  name="next_of_kin_phone"
                />
                <span class="text-danger text-sm">{{ errors.first('next_of_kin_phone') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Relationship <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="relationship"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  name="relationship"
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
                <span class="text-danger text-sm">{{ errors.first('relationship') }}</span>
              </div>
            </div>
          </div>
        </b-collapse>
      </div>
      <div class="card">
        <div class="card-header" header-tag="header" role="tab">
          <div class="card-title" v-b-toggle.accordion-2>
            <div class="card-label">Payment</div>
            <accordion-icon />
          </div>
        </div>
        <b-collapse id="accordion-2" visible accordion="my-accordion" role="tabpanel">
          <div class="card-body">
            <div class="form-group">
              <label>Registration Fee</label>
              <div class="radio-inline">
                <label v-for="(fee, i) in registrationFees" :key="i" class="radio radio-lg">
                  <input type="radio" v-model="registration" :value="fee" />
                  <span></span>
                  {{ fee.name }}
                </label>
              </div>
              <span class="form-text text-muted">Choose appropriate registration fee</span>
            </div>
          </div>
        </b-collapse>
      </div>
      <div>
        <button
          ref="kt-submit"
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
import AccordionIcon from '@/assets/icons/AccordionIcon';
import Datepicker from 'vuejs-datepicker';
import { getCountryStates } from '@/assets/json';
import Swal from 'sweetalert2';
export default {
  components: {
    AccordionIcon,
    Datepicker,
  },
  data() {
    return {
      gender: '',
      firstname: '',
      lastname: '',
      middlename: '',
      religion: '',
      email: '',
      phone: '',
      date_of_birth: '',
      marital_status: '',
      country: '',
      state: '',
      lga: '',
      address: '',
      occupation: '',
      alt_phone: '',
      next_of_kin_name: '',
      next_of_kin_phone: '',
      next_of_kin_address: '',
      relationship: '',
      countries: [{ id: 1, name: 'Nigeria' }],
      states: getCountryStates(),
      cities: [],

      showFinish: false,
      videoShowing: false,
      photoSaved: false,
      photoLoading: false,
      isDisabled: false,
      video: {},
      canvas: {},
      image: '',
      registration: '',
      registrationFees: [],
    };
  },
  computed: {
    isFormValid() {
      return (
        !this.errors.any() &&
        this.lastname &&
        this.firstname &&
        this.date_of_birth &&
        this.gender &&
        this.occupation &&
        this.address &&
        this.phone &&
        this.religion &&
        this.relationship &&
        this.marital_status &&
        this.next_of_kin_name &&
        this.next_of_kin_phone &&
        this.next_of_kin_address &&
        this.country &&
        this.state &&
        this.image &&
        this.lga
      );
    },
  },
  created() {
    this.fetchData('Registration', 'model/fetchServices').then(
      res => (this.registrationFees = res.data.data.docs)
    );
    this.phoneValidation();
  },
  methods: {
    getLga() {
      this.cities = this.state.lga;
    },

    fetchData(search, dispatchType) {
      return this.$store.dispatch(dispatchType, {
        search,
      });
    },

    phoneValidation() {
      this.$validator.extend('phone_pattern', {
        getMessage(field) {
          return 'The ' + field + ' field should match the Nigerian phone pattern e.g 07098765321';
        },
        validate(value) {
          return /((^090)([123589]))|((^091)([0-9]))|((^070)([1-9]))|((^080)([2-9]))|((^081)([0-9]))(\d{7})/.test(
            value
          );
        },
      });
    },

    // Image Capture
    startCamera() {
      this.toggleVideoShowing();
      this.video = this.$refs.video;
      this.video.style = 'display:block;width:250px;margin-bottom:20px;';
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          this.video.srcObject = stream;
          this.video.play();
        });
      }
    },

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

    snapAgain() {
      this.video = this.$refs.video;
      this.video.style = 'display:block;width:250px;margin-bottom:20px;';
      this.image = null;
    },

    toggleVideoShowing() {
      this.videoShowing = !this.videoShowing;
    },

    initValues() {
      this.gender = '';
      this.firstname = '';
      this.lastname = '';
      this.middlename = '';
      this.religion = '';
      this.email = '';
      this.phone = '';
      this.date_of_birth = '';
      this.marital_status = '';
      this.country = '';
      this.state = '';
      this.lga = '';
      this.address = '';
      this.occupation = '';
      this.alt_phone = '';
      this.next_of_kin_name = '';
      this.next_of_kin_phone = '';
      this.next_of_kin_address = '';
      this.relationship = '';
      this.showFinish = false;
      this.videoShowing = false;
      this.photoSaved = false;
      this.photoLoading = false;
      this.video = {};
      this.canvas = {};
      this.image = '';
      this.registration = '';
    },

    addSpinner(submitButton) {
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    notifyPhoto() {
      return this.$notify({
        group: 'foo',
        title: 'Error message',
        text: 'Please take patient photo',
        type: 'error',
      });
    },

    handleResponse(response) {
      Swal.fire({
        title: 'Success!',
        text: 'Do you want to add patient insurance information',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Yes, please',
        cancelButtonText: 'No, go back',
        reverseButtons: true,
      }).then(function(result) {
        if (result.value) {
          window.location.replace(`/patient/health-insurance/${response.data.data.id}`);
        } else {
          window.location.replace('/');
        }
      });
    },

    endRequest(response, submitButton) {
      this.removeSpinner(submitButton);
      this.stopStreamedVideo(this.video);
      this.initValues();
      this.handleResponse(response);
    },

    addPatient() {
      if (!this.image) return this.notifyPhoto();
      this.$validator.validateAll().then(result => {
        if (result) {
          // set spinner to submit button
          const submitButton = this.$refs['kt-submit'];
          this.addSpinner(submitButton);
          this.isDisabled = true;

          const data = {
            gender: this.gender,
            firstname: this.firstname,
            lastname: this.lastname,
            middlename: this.middlename,
            religion: this.religion,
            email: this.email,
            phone: this.phone,
            date_of_birth: this.date_of_birth,
            marital_status: this.marital_status,
            country: this.country,
            state: this.state.name,
            lga: this.lga,
            address: this.address,
            occupation: this.occupation,
            alt_phone: this.alt_phone,
            next_of_kin_name: this.next_of_kin_name,
            next_of_kin_phone: this.next_of_kin_phone,
            next_of_kin_address: this.next_of_kin_address,
            next_of_kin_relationship: this.relationship,
            photo: this.image,
            registration_fee: this.registration.price,
            service_id: this.registration.id,
          };
          this.$store
            .dispatch('patient/createPatientAccount', data)
            .then(response => this.endRequest(response, submitButton))
            .catch(() => {
              this.removeSpinner(submitButton);
            });
        }
      });
    },
  },
};
</script>

<style scoped>
.form-group {
  margin-bottom: 0.9rem !important;
}
</style>
