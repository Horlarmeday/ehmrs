<template>
  <div>
    <div v-if="patient" class="card card-custom card-stretch gutter-b card-shadowless">
      <div class="card-header border-0 py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">
            Edit
            <span class="bg-light-primary pr-2 pl-2">{{ patient?.fullname || '' }}</span> Profile
          </span>
        </h3>
      </div>
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
            style="height: 1px; width: 120px; margin-bottom: 20px"
            autoplay
          ></video>
          <canvas ref="canvas" id="canvas" width="250" height="187" v-show="image"> </canvas>
          <button
            id="snap"
            v-if="!image && !photoSaved && !videoShowing"
            class="btn btn-success btn-sm mt-4"
            style="display: block"
            @click="startCamera()"
          >
            Take Photo
          </button>
          <button
            id="snap"
            v-if="!image && !photoSaved && videoShowing"
            class="btn btn-success btn-sm"
            style="display: block"
            @click="capture()"
          >
            Snap Photo
          </button>
          <div class="row" v-if="!photoLoading" style="padding-top: 15px">
            <div class="ml-5">
              <button
                id="snap"
                v-if="image && !photoSaved"
                class="btn btn-primary btn-sm"
                @click="snapAgain()"
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
              v-model="patient.firstname"
              placeholder="First Name"
              name="firstname"
            />
          </div>
          <div class="col-lg-4">
            <label>Middle Name</label>
            <input
              type="text"
              class="form-control form-control-sm"
              v-model="patient.middlename"
              placeholder="Middle Name"
              name="middlename"
            />
          </div>
          <div class="col-lg-4">
            <label>Last Name <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control form-control-sm"
              v-model="patient.lastname"
              placeholder="Last Name"
              name="lastname"
            />
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
              v-model="patient.email"
            />
          </div>
          <div class="col-lg-4">
            <label>Phone Number <span class="text-danger">*</span></label>
            <input
              maxlength="11"
              type="text"
              class="form-control form-control-sm"
              v-model="patient.phone"
              placeholder="Phone Number"
              name="phone"
            />
          </div>
          <div class="col-lg-4">
            <label>Religion <span class="text-danger">*</span></label>
            <select v-model="patient.religion" class="form-control form-control-sm" name="religion">
              <option value="Islam">Islam</option>
              <option value="Christianity">Christianity</option>
              <option value="Traditional">Traditional</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div class="form-group row">
          <div class="col-lg-4">
            <label>Date of Birth <span class="text-danger">*</span></label>
            <datepicker
              name="date_of_birth"
              v-model="patient.date_of_birth"
              input-class="form-control form-control-sm"
              placeholder="Date of Birth"
            />
          </div>
          <div class="col-lg-4">
            <label>Gender <span class="text-danger">*</span></label>
            <select class="form-control form-control-sm" v-model="patient.gender" name="gender">
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
              v-model="patient.marital_status"
              name="marital_status"
            >
              <option value="Married">Married</option>
              <option value="Single">Single</option>
              <option value="Widow">Widow</option>
              <option value="Widower">Widower</option>
              <option value="Divorced">Divorced</option>
            </select>
          </div>
        </div>
        <div class="form-group row">
          <div class="col-lg-4">
            <label>Country <span class="text-danger">*</span></label>
            <select
              class="form-control form-control-sm"
              v-model="patient.country"
              name="country"
              @change="getStates"
            >
              <option
                v-for="country in countries"
                :key="country.id"
                :value="{ id: country.id, text: country.name }"
              >
                {{ country.name }}
              </option>
            </select>
          </div>
          <div class="col-lg-4">
            <label>States <span class="text-danger">*</span></label>
            <select
              class="form-control form-control-sm"
              v-model="patient.state"
              name="state"
              @change="getCities"
            >
              <option
                v-for="state in states"
                :key="state.name || state.id"
                :value="
                  state.lga
                    ? { name: state.name, lga: state.lga }
                    : { id: state.id, text: state.name }
                "
              >
                {{ state.name }}
              </option>
            </select>
          </div>
          <div class="col-lg-4">
            <label>Local Government <span class="text-danger">*</span></label>
            <select class="form-control form-control-sm" v-model="patient.lga" name="lga">
              <option
                v-for="city in cities"
                :key="city.name || city.id"
                :value="city.name || city.text"
              >
                {{ city.name || city.text }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-group row">
          <div class="col-lg-4">
            <label>Home Address <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control form-control-sm"
              v-model="patient.address"
              placeholder="Home Address"
              name="address"
            />
          </div>
          <div class="col-lg-4">
            <label>Occupation <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control form-control-sm"
              v-model="patient.occupation"
              placeholder="Occupation"
              name="occupation"
            />
          </div>
          <div class="col-lg-4">
            <label>Alternate Phone Number</label>
            <input
              type="text"
              class="form-control form-control-sm"
              v-model="patient.alt_phone"
              maxlength="11"
              placeholder="Alternate Phone"
            />
          </div>
        </div>
        <div class="form-group row">
          <div class="col-lg-4">
            <label>Next of Kin Name <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control form-control-sm"
              v-model="patient.next_of_kin_name"
              placeholder="Name"
              name="next_of_kin_name"
            />
          </div>
          <div class="col-lg-4">
            <label>Next of Kin Address <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control form-control-sm"
              v-model="patient.next_of_kin_address"
              placeholder="Address"
              name="next_of_kin_address"
            />
          </div>
          <div class="col-lg-4">
            <label>Next of Kin Phone <span class="text-danger">*</span></label>
            <input
              type="text"
              minlength="11"
              maxlength="11"
              class="form-control form-control-sm"
              v-model="patient.next_of_kin_phone"
              placeholder="Phone"
              name="next_of_kin_phone"
            />
          </div>
        </div>
        <div class="form-group row">
          <div class="col-lg-4">
            <label>Next of Kin Relationship <span class="text-danger">*</span></label>
            <select
              class="form-control form-control-sm"
              v-model="patient.next_of_kin_relationship"
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
          </div>
          <div v-if="patient?.patient_type === DEPENDANT" class="col-lg-4">
            <label>Relationship to principal <span class="text-danger">*</span></label>
            <select
              class="form-control form-control-sm"
              v-model="patient.relationship_to_principal"
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
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <b-progress :value="count" variant="primary" show-progress animated :max="200" />
    </div>
    <div>
      <button
        ref="kt-submit"
        class="btn btn-primary font-weight-bold float-right mr-4"
        @click="updatePatient"
      >
        Update Info
      </button>
    </div>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import { getCityById, getCountries, getStateById, getCountryStates } from '@/assets/json';

export default {
  components: {
    Datepicker,
  },
  data() {
    return {
      countries: [],
      states: [],
      cities: [],

      showFinish: false,
      videoShowing: false,
      photoSaved: false,
      photoLoading: false,
      isDisabled: false,
      video: {},
      canvas: {},
      image: '',
      count: 0,
      patient: '',
      DEPENDANT: 'Dependant',
    };
  },
  computed: {
    patientP() {
      return this.$store.state.patient.patient;
    },
  },

  watch: {
    patientP() {
      if (!this.patientP) return;

      this.patient = JSON.parse(JSON.stringify(this.patientP));

      // Set Nigeria (ID: 160) as default country if missing
      if (!this.patient.country) {
        const nigeria = this.countries.find((c) => c.id === 160);
        if (nigeria) {
          this.patient.country = { id: nigeria.id, text: nigeria.name };
        }
      }

      // Normalize country value (convert string to object if needed)
      this.patient.country =
        this.normalizeLocationValue(this.patient.country, this.countries, 'id', 'name') ||
        (this.countries.find((c) => c.id === 160) ? { id: 160, text: 'Nigeria' } : null);

      // Load states if country is available
      if (this.patient.country) {
        const countryId =
          typeof this.patient.country === 'object' ? this.patient.country.id : this.patient.country;

        // If Nigeria (ID: 160), use getCountryStates (nested LGA structure)
        // Otherwise, use getStateById (international structure)
        if (countryId === 160 || countryId === '160') {
          this.states = getCountryStates();
        } else {
          this.states = getStateById(countryId);
        }

        // Normalize state value based on data structure
        if (this.patient.state) {
          // For Nigeria structure, match by name and get the full object with LGA
          if (countryId === 160 || countryId === '160') {
            const stateName =
              typeof this.patient.state === 'object'
                ? this.patient.state.name || this.patient.state.text
                : this.patient.state;
            const matchedState = this.states.find((s) => s.name === stateName);
            if (matchedState) {
              this.patient.state = { name: matchedState.name, lga: matchedState.lga };
              // Load cities from nested LGA
              this.cities = matchedState.lga || [];
              // Set LGA if it exists
              if (this.patient.lga && this.cities.length > 0) {
                // LGA is stored as a string name in database, so just set it
                this.patient.lga =
                  typeof this.patient.lga === 'object'
                    ? this.patient.lga.name || this.patient.lga.text
                    : this.patient.lga;
              }
            }
          } else {
            // For international structure, use normalizeLocationValue
            this.patient.state = this.normalizeLocationValue(
              this.patient.state,
              this.states,
              'id',
              'name'
            );

            // Load cities if state is available
            if (this.patient.state) {
              const stateId =
                typeof this.patient.state === 'object' ? this.patient.state.id : this.patient.state;
              this.cities = getCityById(stateId) || [];

              // Normalize lga value (convert string to object if needed)
              if (this.patient.lga && this.cities.length > 0) {
                this.patient.lga = this.normalizeLocationValue(
                  this.patient.lga,
                  this.cities,
                  'id',
                  'name'
                );
              }
            }
          }
        }
      }
    },
    'patient.state': {
      handler() {
        // Automatically load cities when state changes
        this.$nextTick(() => {
          this.getCities();
        });
      },
      deep: true,
    },
  },

  created() {
    this.countToHundred();
    this.fetchPatient();
    this.countries = getCountries();

    // Load Nigeria states by default (like CreatePatientAccount)
    this.states = getCountryStates();

    this.phoneValidation();
  },
  methods: {
    getStates() {
      if (!this.patient || !this.patient.country) {
        this.states = getCountryStates(); // Default to Nigeria states
        return;
      }

      const countryId =
        typeof this.patient.country === 'object' ? this.patient.country.id : this.patient.country;

      // If Nigeria (ID: 160), use getCountryStates (nested LGA structure)
      // Otherwise, use getStateById (international structure)
      if (countryId === 160 || countryId === '160') {
        this.states = getCountryStates();
      } else {
        this.states = getStateById(countryId);
      }

      // Clear cities and dependent fields when country changes
      this.cities = [];
      if (this.patient.state) {
        this.patient.state = null;
      }
      if (this.patient.lga) {
        this.patient.lga = null;
      }
    },

    getCities() {
      if (!this.patient || !this.patient.state) {
        this.cities = [];
        return;
      }

      // Check if state has nested LGA (Nigeria structure from getCountryStates)
      if (
        typeof this.patient.state === 'object' &&
        this.patient.state !== null &&
        this.patient.state.lga
      ) {
        // Nigeria structure: state has lga array nested inside
        this.cities = this.patient.state.lga || [];
      } else {
        // International structure: need to fetch cities by state ID
        let stateId;
        if (typeof this.patient.state === 'object' && this.patient.state !== null) {
          stateId = this.patient.state.id;
        } else {
          stateId = this.patient.state;
        }

        if (!stateId) {
          this.cities = [];
          return;
        }

        this.cities = getCityById(stateId) || [];
      }

      // Clear lga when state changes
      if (this.patient.lga) {
        this.patient.lga = null;
      }
    },

    normalizeLocationValue(value, sourceArray, idKey = 'id', nameKey = 'name') {
      if (!value) return null;

      // If already an object, return as is
      if (typeof value === 'object' && value !== null && value.id !== undefined) {
        return value;
      }

      // If it's a string/number, find matching item in source array
      const match = sourceArray.find((item) => {
        const itemId = item[idKey];
        return itemId.toString() === value.toString() || item[nameKey] === value;
      });

      if (match) {
        return { id: match[idKey], text: match[nameKey] };
      }

      return null;
    },

    fetchPatient() {
      this.$store.dispatch('patient/fetchPatient', this.$route.params.id);
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
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          this.video.srcObject = stream;
          this.video.play();
        });
      }
    },

    stopStreamedVideo(videoElem) {
      const stream = videoElem.srcObject;
      const tracks = stream.getTracks();

      tracks.forEach(function (track) {
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

    addSpinner(submitButton) {
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    endRequest(response, submitButton) {
      this.removeSpinner(submitButton);
      this.$router.push(`/patient/profile/${response.data.data.id}`);
      if (this.video && this.video.srcObject) {
        this.stopStreamedVideo(this.video);
      }
    },

    updatePatient() {
      this.$validator.validateAll().then((result) => {
        if (result) {
          // set spinner to submit button
          const submitButton = this.$refs['kt-submit'];
          this.addSpinner(submitButton);
          this.isDisabled = true;

          // Prepare patient data with extracted IDs/names from country/state/lga objects
          const patientData = JSON.parse(JSON.stringify(this.patient));

          // Extract country name (text) instead of ID
          if (patientData.country) {
            if (typeof patientData.country === 'object' && patientData.country !== null) {
              // Extract name/text from country object
              patientData.country =
                patientData.country.text ||
                patientData.country.name ||
                patientData.country.id.toString();
            } else {
              // Already a string (name)
              patientData.country = patientData.country.toString();
            }
          }

          // Extract state - handle both Nigeria structure (with nested LGA) and international structure (with ID)
          if (patientData.state) {
            if (typeof patientData.state === 'object' && patientData.state !== null) {
              // Nigeria structure: state has { name, lga }
              if (patientData.state.name && patientData.state.lga) {
                patientData.state = patientData.state.name;
              } else {
                // International structure: state has { id, text }
                patientData.state = patientData.state.id
                  ? patientData.state.id.toString()
                  : patientData.state.text ||
                    patientData.state.name ||
                    patientData.state.toString();
              }
            } else {
              patientData.state = patientData.state.toString();
            }
          }

          // Extract LGA - can be name (Nigeria) or ID (international)
          if (patientData.lga) {
            if (typeof patientData.lga === 'object' && patientData.lga !== null) {
              // If it's an object, extract name or ID
              patientData.lga =
                patientData.lga.name ||
                patientData.lga.text ||
                patientData.lga.id ||
                patientData.lga.toString();
            } else {
              // Already a string (name or ID)
              patientData.lga = patientData.lga.toString();
            }
          }

          const data = {
            patient: patientData,
            ...(this.image && { picture: this.image }),
          };

          this.$store
            .dispatch('patient/updatePatient', { data, id: this.$route.params.id })
            .then((response) => this.endRequest(response, submitButton))
            .catch(() => {
              this.removeSpinner(submitButton);
            });
        }
      });
    },

    countToHundred() {
      for (let i = 1; i <= 1000; i++) {
        this.count = i;
        if (this.patient) break;
      }
    },
  },
};
</script>

<style scoped>
.form-group {
  margin-bottom: 0.9rem !important;
}
</style>
