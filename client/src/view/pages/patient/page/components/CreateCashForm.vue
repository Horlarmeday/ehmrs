<template>
  <div class="card-body">
    <div class="pt-6">
      <img
        src="/media/users/blank.png"
        v-if="!videoShowing && !image"
        width="160"
      />
      <video
        ref="video"
        id="video"
        v-show="!image && !photoSaved"
        style="height:1px;width:120px;margin-bottom:20px;"
        autoplay
      ></video>
      <canvas ref="canvas" id="canvas" width="250" height="187" v-show="image">
      </canvas>
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
        <span class="text-danger text-sm">{{ errors.first("firstname") }}</span>
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
        <span class="text-danger text-sm">{{
          errors.first("middlename")
        }}</span>
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
        <span class="text-danger text-sm">{{ errors.first("lastname") }}</span>
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
        <span class="text-danger text-sm">{{ errors.first("email") }}</span>
      </div>
      <div class="col-lg-4">
        <label>Phone Number <span class="text-danger">*</span></label>
        <input
          v-validate="'required|min:11|max:11'"
          data-vv-validate-on="blur"
          maxlength="11"
          type="text"
          class="form-control form-control-sm"
          v-model="phone"
          placeholder="Phone Number"
          name="phone"
        />
        <span class="text-danger text-sm">{{ errors.first("phone") }}</span>
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
        <span class="text-danger text-sm">{{ errors.first("religion") }}</span>
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
        <span class="text-danger text-sm">{{
          errors.first("date_of_birth")
        }}</span>
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
        <span class="text-danger text-sm">{{ errors.first("gender") }}</span>
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
        <span class="text-danger text-sm">{{
          errors.first("marital_status")
        }}</span>
      </div>
    </div>
    <div class="form-group row">
      <div class="col-lg-4">
        <label>Country <span class="text-danger">*</span></label>
        <select
          class="form-control form-control-sm"
          v-model="country"
          name="country"
          v-validate="'required'"
          data-vv-validate-on="blur"
          @change="getStates"
        >
          <option
            v-for="country in countries"
            :key="country.id"
            :value="{ id: country.id, text: country.name }"
            >{{ country.name }}
          </option>
        </select>
        <span class="text-danger text-sm">{{ errors.first("country") }}</span>
      </div>
      <div class="col-lg-4">
        <label>States <span class="text-danger">*</span></label>
        <select
          class="form-control form-control-sm"
          v-model="state"
          name="state"
          v-validate="'required'"
          data-vv-validate-on="blur"
          @change="getCities"
        >
          <option
            v-for="state in states"
            :key="state.id"
            :value="{ id: state.id, text: state.name }"
            >{{ state.name }}
          </option>
        </select>
        <span class="text-danger text-sm">{{ errors.first("state") }}</span>
      </div>
      <div class="col-lg-4">
        <label>Local Government <span class="text-danger">*</span></label>
        <select
          class="form-control form-control-sm"
          v-model="lga"
          name="lga"
          v-validate="'required'"
          data-vv-validate-on="blur"
        >
          <option
            v-for="city in cities"
            :key="city.id"
            :value="{ id: city.id, text: city.name }"
            >{{ city.name }}
          </option>
        </select>
        <span class="text-danger text-sm">{{ errors.first("lga") }}</span>
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
        <span class="text-danger text-sm">{{ errors.first("address") }}</span>
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
        <span class="text-danger text-sm">{{
          errors.first("occupation")
        }}</span>
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
        <span class="text-danger text-sm">{{
          errors.first("next_of_kin_name")
        }}</span>
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
        <span class="text-danger text-sm">{{
          errors.first("next_of_kin_address")
        }}</span>
      </div>
      <div class="col-lg-4">
        <label>Next of Kin Phone <span class="text-danger">*</span></label>
        <input
          v-validate="'required'"
          data-vv-validate-on="blur"
          type="text"
          class="form-control form-control-sm"
          v-model="next_of_kin_phone"
          placeholder="Phone"
          name="next_of_kin_phone"
        />
        <span class="text-danger text-sm">{{
          errors.first("next_of_kin_phone")
        }}</span>
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
        <span class="text-danger text-sm">{{
          errors.first("relationship")
        }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Datepicker from "vuejs-datepicker";
import {
  getCityById,
  getCountries,
  getStateById
} from "../../../../../assets/json";
export default {
  name: "CreateCashForm",
  components: {
    Datepicker
  },
  data() {
    return {
      gender: "",
      firstname: "",
      lastname: "",
      middlename: "",
      religion: "",
      email: "",
      phone: "",
      date_of_birth: "",
      marital_status: "",
      country: "",
      state: "",
      lga: "",
      address: "",
      occupation: "",
      alt_phone: "",
      next_of_kin_name: "",
      next_of_kin_phone: "",
      next_of_kin_address: "",
      relationship: "",
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
      image: ""
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
    }
  },
  methods: {
    getStates() {
      this.states = getStateById(this.country.id);
    },

    getCities() {
      this.cities = getCityById(this.state.id);
    },
    startCamera() {
      this.toggleVideoShowing();
      this.video = this.$refs.video;
      this.video.style = "display:block;width:250px;margin-bottom:20px;";
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
      this.canvas.getContext("2d").drawImage(this.video, 0, 0, 250, 187);
      this.image = this.canvas.toDataURL();
    },

    snapAgain() {
      this.video = this.$refs.video;
      this.video.style = "display:block;width:250px;margin-bottom:20px;";
      this.image = null;
    },

    toggleVideoShowing() {
      this.videoShowing = !this.videoShowing;
    },

    initValues() {
      this.gender = "";
      this.firstname = "";
      this.lastname = "";
      this.middlename = "";
      this.religion = "";
      this.email = "";
      this.phone = "";
      this.date_of_birth = "";
      this.marital_status = "";
      this.country = "";
      this.state = "";
      this.lga = "";
      this.address = "";
      this.occupation = "";
      this.alt_phone = "";
      this.next_of_kin_name = "";
      this.next_of_kin_phone = "";
      this.next_of_kin_address = "";
      this.relationship = "";
      this.showFinish = false;
      this.videoShowing = false;
      this.photoSaved = false;
      this.photoLoading = false;
      this.video = {};
      this.canvas = {};
      this.image = "";
    }
  },
  created() {
    this.countries = getCountries();
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 0.9rem !important;
}
</style>
