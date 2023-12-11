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
            <div class="pt-6">
              <img src="/media/users/blank.png" v-if="!videoShowing && !image" width="160" />
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
                <label>Username <span class="text-danger">*</span></label>
                <input
                  v-validate="'required|min:3'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  name="username"
                  placeholder="Enter Username"
                  v-model="username"
                />
                <span class="text-danger text-sm">{{ errors.first('username') }}</span>
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
                ></datepicker>
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
                <label>Password <span class="text-danger">*</span></label>
                <input
                  v-validate="'required|min:6|max:255'"
                  data-vv-validate-on="blur"
                  type="password"
                  class="form-control form-control-sm"
                  name="password"
                  placeholder="Enter Password"
                  v-model="password"
                />
                <span class="text-danger text-sm">{{ errors.first('password') }}</span>
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
                <label>Department <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="department"
                  name="department"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  @change="getRoles"
                >
                  <option
                    v-for="department in departments"
                    :key="department.id"
                    :value="{ id: department.id, text: department.department }"
                    >{{ department.department }}
                  </option>
                </select>
                <span class="text-danger text-sm">{{ errors.first('department') }}</span>
              </div>
              <div class="col-lg-4">
                <label>Roles <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="role"
                  name="role"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  @change="getSubRoles"
                >
                  <option
                    v-for="role in roles"
                    :key="role.id"
                    :value="{ id: role.id, text: role.role }"
                    >{{ role.role }}
                  </option>
                </select>
                <span class="text-danger text-sm">{{ errors.first('role') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Sub Roles </label>
                <select class="form-control form-control-sm" v-model="sub_role">
                  <option
                    v-for="sub in sub_roles"
                    :key="sub.id"
                    :value="{ id: sub.id, text: sub.sub }"
                    >{{ sub.sub }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </b-collapse>
      </div>
      <div>
        <button
          ref="kt-submit"
          class="btn btn-primary font-weight-bold float-right"
          @click="addEmployee"
        >
          Save
        </button>
      </div>
    </div>
    <!--end::Accordion-->
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import { departments, getRolesById, getSubRoleById } from './employeeRoles';
import Swal from 'sweetalert2';
import AccordionIcon from '../../../../assets/icons/AccordionIcon';
export default {
  components: {
    Datepicker,
    AccordionIcon,
  },
  data() {
    return {
      gender: '',
      firstname: '',
      lastname: '',
      middlename: '',
      email: '',
      phone: '',
      date_of_birth: '',
      address: '',
      department: '',
      password: '',
      username: '',
      role: '',
      sub_role: '',
      relationship: '',
      departments: [],
      roles: [],
      sub_roles: [],

      showFinish: false,
      videoShowing: false,
      photoSaved: false,
      photoLoading: false,
      isDisabled: false,
      video: {},
      canvas: {},
      image: '',
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
        this.middlename &&
        this.address &&
        this.phone &&
        this.username &&
        this.password &&
        this.department &&
        this.role &&
        this.image &&
        this.sub_role
      );
    },
  },

  created() {
    this.departments = departments;
    this.phoneValidation();
  },
  methods: {
    getRoles() {
      this.roles = getRolesById(this.department.id);
    },

    getSubRoles() {
      this.sub_roles = getSubRoleById(this.role.id);
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
      this.username = '';
      this.email = '';
      this.phone = '';
      this.date_of_birth = '';
      this.password = '';
      this.address = '';
      this.department = '';
      this.role = '';
      this.sub_role = '';
      this.showFinish = false;
      this.videoShowing = false;
      this.photoSaved = false;
      this.photoLoading = false;
      this.video = {};
      this.canvas = {};
      this.image = '';
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
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

    initializeRequest(button, response) {
      this.removeSpinner(button);
      this.stopStreamedVideo(this.video);
      this.initValues();
      this.handleSuccess(response);
    },

    notifyPhoto() {
      return this.$notify({
        group: 'foo',
        title: 'Error message',
        text: 'Please take photo',
        type: 'error',
      });
    },

    addEmployee() {
      if (!this.image) return this.notifyPhoto();
      this.$validator.validateAll().then(result => {
        if (result) {
          // set spinner to submit button
          const submitButton = this.$refs['kt-submit'];
          this.addSpinner(submitButton);

          const data = {
            gender: this.gender,
            firstname: this.firstname,
            lastname: this.lastname,
            middlename: this.middlename,
            username: this.username,
            email: this.email,
            phone: this.phone,
            date_of_birth: this.date_of_birth,
            password: this.password,
            department: this.department.text,
            role: this.role.text,
            sub_role: this.sub_role.text,
            address: this.address,
            photo: this.image,
          };
          this.$store
            .dispatch('employee/addEmployee', data)
            .then(response => this.initializeRequest(submitButton, response))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    phoneValidation() {
      this.$validator.extend('phone_pattern', {
        getMessage(field) {
          return 'The ' + field + ' field should match the Nigerian phone pattern e.g 07098765321';
        },
        validate(value) {
          return /((^090)([23589]))|((^070)([1-9]))|((^080)([2-9]))|((^081)([0-9]))(\d{7})/.test(
            value
          );
        },
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
