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
            <div class="card-label">{{ patient?.fullname }} Dependants</div>
            <accordion-icon />
          </div>
        </div>
        <b-collapse id="accordion-1" visible accordion="my-accordion" role="tabpanel">
          <div class="">
            <div class="row">
              <div class="col-lg-12">
                <div class="card card-custom card-stretch gutter-b">
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
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="dependant in patient?.dependants" :key="dependant.id">
                              <td class="pl-0 py-8">
                                <div class="d-flex align-items-center">
                                  <div class="symbol symbol-50 symbol-light mr-4">
                                    <span class="symbol-label">
                                      <img
                                        width="70"
                                        v-if="!imageError"
                                        alt="Pic"
                                        :src="imageUrl(patient.photo)"
                                        @load="handleImageLoad"
                                        @error="handleImageError"
                                      />
                                      <span v-else class="symbol-label font-size-h4">
                                        {{ dependant?.firstname?.charAt(0)?.toUpperCase() }}
                                        {{ dependant?.lastname?.charAt(0)?.toUpperCase() }}
                                      </span>
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
                                  {{ dependant.enrollee_code || '-' }}
                                </span>
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
      <!-- Dependants -->
      <div class="card">
        <div class="card-header" header-tag="header" role="tab">
          <div class="card-title" v-b-toggle.accordion-3>
            <div class="card-label">Add Dependant</div>
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
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  name="firstname"
                  class="form-control form-control-sm"
                  v-model="dependant_firstname"
                  placeholder="First Name"
                />
                <span class="text-danger text-sm">{{ errors.first('firstname') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Last Name <span class="text-danger">*</span></label>
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  name="lastname"
                  class="form-control form-control-sm"
                  v-model="dependant_lastname"
                  placeholder="Last Name"
                />
                <span class="text-danger text-sm">{{ errors.first('lastname') }}</span>
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
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  v-model="dependant_date_of_birth"
                  input-class="form-control form-control-sm"
                  placeholder="Date of Birth"
                  name="date_of_birth"
                />
                <span class="text-danger text-sm">{{ errors.first('date_of_birth') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Gender <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="dependant_gender"
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
                  name="relationship"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
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
          </div>
        </b-collapse>
      </div>
      <!-- Button to page -->
      <div>
        <button
          ref="kt-add_dependant_submit"
          class="btn btn-primary font-weight-bold float-right mr-4"
          @click="saveDependant"
        >
          Submit Info
        </button>
      </div>
    </div>
    <!--end::Accordion-->
  </div>
</template>
<script>
import AccordionIcon from '@/assets/icons/AccordionIcon.vue';
import Datepicker from 'vuejs-datepicker';
export default {
  components: { AccordionIcon, Datepicker },
  computed: {
    patient() {
      return this.$store.state.patient.patientProfile;
    },
  },
  data() {
    return {
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
      imageError: false,
    };
  },

  created() {
    this.fetchPatient();
  },

  methods: {
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

    notifyPhoto() {
      return this.$notify({
        group: 'foo',
        title: 'Error message',
        text: 'Please take photo',
        type: 'error',
      });
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    saveDependant() {
      if (!this.dependant_image) return this.notifyPhoto();
      this.$validator.validateAll().then(result => {
        if (result) {
          const submitButton = this.$refs['kt-add_dependant_submit'];
          this.addSpinner(submitButton);

          const data = this.dependantData();
          this.finishAddDependant(data, submitButton);
        }
      });
    },

    endRequest(submitButton) {
      this.removeSpinner(submitButton);
      if (this.dependantvideo) this.stopStreamedVideo(this.dependantvideo);
      this.initDependant();
      this.fetchPatient();
    },

    dependantData() {
      return {
        firstname: this.dependant_firstname,
        lastname: this.dependant_lastname,
        phone: this.dependant_phone || this.patient.phone,
        country: this.patient.country,
        state: this.patient.state,
        lga: this.patient.lga,
        relationship_to_principal: this.dependant_relationship,
        enrollee_code: this.dependant_enrollee_id,
        gender: this.dependant_gender,
        address: this.dependant_address || this.patient.address,
        date_of_birth: this.dependant_date_of_birth,
        photo: this.dependant_image,
      };
    },

    finishAddDependant(data, submitButton) {
      this.$store
        .dispatch('patient/createDependant', { data, patient_id: this.patient.id })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    fetchPatient() {
      this.$store.dispatch('patient/fetchPatientProfile', this.$route.params.id);
    },

    imageUrl(url) {
      return `${window.location.origin}/static/images/${url}`;
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
