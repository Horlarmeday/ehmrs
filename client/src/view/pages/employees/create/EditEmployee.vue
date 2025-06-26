<template>
  <b-modal v-model="activePrompt" hide-footer title="Staff" size="xl">
    <div class="p-3">
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
            v-validate="'required|min:11|max:11'"
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
      </div>
      <div class="form-group row">
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
            <option v-for="role in roles" :key="role.id" :value="{ id: role.id, text: role.role }"
              >{{ role.role }}
            </option>
          </select>
          <span class="text-danger text-sm">{{ errors.first('role') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Sub Roles </label>
          <select class="form-control form-control-sm" v-model="sub_role">
            <option v-for="sub in sub_roles" :key="sub.id" :value="{ id: sub.id, text: sub.sub }"
              >{{ sub.sub }}
            </option>
          </select>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Date of First Appointment <span class="text-danger">*</span></label>
          <datepicker
            name="date_of_first_appointment"
            v-validate="'required'"
            data-vv-validate-on="blur"
            v-model="date_of_first_appointment"
            input-class="form-control form-control-sm"
            placeholder="Date of First Appointment"
          ></datepicker>
          <span class="text-danger text-sm">{{ errors.first('date_of_first_appointment') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Date of Commencement <span class="text-danger">*</span></label>
          <datepicker
            name="date_of_commencement"
            v-validate="'required'"
            data-vv-validate-on="blur"
            v-model="date_of_commencement"
            input-class="form-control form-control-sm"
            placeholder="Date of Commencement"
          ></datepicker>
          <span class="text-danger text-sm">{{ errors.first('date_of_commencement') }}</span>
        </div>
        <div class="col-lg-4">
          <label>DOLP <span class="text-danger">*</span></label>
          <datepicker
            name="dolp"
            v-validate="'required'"
            data-vv-validate-on="blur"
            v-model="dolp"
            input-class="form-control form-control-sm"
            placeholder="DOLP"
          ></datepicker>
          <span class="text-danger text-sm">{{ errors.first('dolp') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Qualification <span class="text-danger">*</span></label>
          <select
            class="form-control form-control-sm"
            v-model="qualification"
            name="qualification"
            v-validate="'required'"
            data-vv-validate-on="blur"
          >
            <option value="">Select Qualification</option>
            <option value="MBBS">MBBS (Bachelor of Medicine, Bachelor of Surgery)</option>
            <option value="MD">MD (Doctor of Medicine)</option>
            <option value="BDS">BDS (Bachelor of Dental Surgery)</option>
            <option value="B.Pharm">B.Pharm (Bachelor of Pharmacy)</option>
            <option value="PharmD">PharmD (Doctor of Pharmacy)</option>
            <option value="B.Sc Nursing">B.Sc Nursing</option>
            <option value="RN">RN (Registered Nurse)</option>
            <option value="B.MLT">B.MLT (Bachelor of Medical Laboratory Technology)</option>
            <option value="B.Sc Radiography">B.Sc Radiography</option>
            <option value="B.Sc Physiotherapy">B.Sc Physiotherapy</option>
            <option value="HND">HND (Higher National Diploma)</option>
            <option value="OND">OND (Ordinary National Diploma)</option>
            <option value="NCE">NCE (Nigeria Certificate in Education)</option>
            <option value="B.Sc">B.Sc (Bachelor of Science)</option>
            <option value="B.A">B.A (Bachelor of Arts)</option>
            <option value="M.Sc">M.Sc (Master of Science)</option>
            <option value="M.A">M.A (Master of Arts)</option>
            <option value="MBA">MBA (Master of Business Administration)</option>
            <option value="SSCE">SSCE (Senior Secondary Certificate Examination)</option>
            <option value="WAEC">WAEC (West African Examinations Council)</option>
            <option value="NECO">NECO (National Examinations Council)</option>
          </select>
          <span class="text-danger text-sm">{{ errors.first('qualification') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Present Rank <span class="text-danger">*</span></label>
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="text"
            class="form-control form-control-sm"
            v-model="present_rank"
            placeholder="Present Rank"
            name="present_rank"
          />
          <span class="text-danger text-sm">{{ errors.first('present_rank') }}</span>
        </div>
        <div class="col-lg-4">
          <label>CHS/CMS <span class="text-danger">*</span></label>
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="text"
            class="form-control form-control-sm"
            v-model="chs_cms"
            placeholder="CHS/CMS"
            name="chs_cms"
          />
          <span class="text-danger text-sm">{{ errors.first('chs_cms') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Step <span class="text-danger">*</span></label>
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="text"
            class="form-control form-control-sm"
            v-model="step"
            placeholder="Step"
            name="step"
          />
          <span class="text-danger text-sm">{{ errors.first('step') }}</span>
        </div>
        <div class="col-lg-4">
          <label>DD for Retirement <span class="text-danger">*</span></label>
          <datepicker
            name="dd_for_retirement"
            v-validate="'required'"
            data-vv-validate-on="blur"
            v-model="dd_for_retirement"
            input-class="form-control form-control-sm"
            placeholder="DD for Retirement"
          ></datepicker>
          <span class="text-danger text-sm">{{ errors.first('dd_for_retirement') }}</span>
        </div>
        <div class="col-lg-4">
          <label>NIN (National Identification Number) <span class="text-danger">*</span></label>
          <input
            v-validate="'required|min:11|max:11'"
            data-vv-validate-on="blur"
            type="text"
            class="form-control form-control-sm"
            v-model="nin"
            placeholder="NIN"
            name="nin"
            maxlength="11"
          />
          <span class="text-danger text-sm">{{ errors.first('nin') }}</span>
        </div>
      </div>
      <div>
        <button
          ref="kt_employee_submit"
          class="btn btn-primary font-weight-bold float-right"
          @click="updateEmployee"
        >
          Save
        </button>
      </div>
    </div>
  </b-modal>
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import { departments, getRolesById, getSubRoleById, roles, sub_roles } from './employeeRoles';
export default {
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    data: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    Datepicker,
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
      username: '',
      role: '',
      sub_role: '',
      relationship: '',
      date_of_first_appointment: '',
      date_of_commencement: '',
      dolp: '',
      qualification: '',
      present_rank: '',
      chs_cms: '',
      step: '',
      dd_for_retirement: '',
      nin: '',
      departments,
      roles,
      sub_roles,
      id: '',
      isDisabled: false,
    };
  },
  computed: {
    validateForm() {
      return !this.errors.any() && this.name !== '';
    },
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },
  },
  watch: {
    displayPrompt(val) {
      if (!val) return;
      if (Object.entries(this.data).length === 0) {
        this.initValues();
        this.$validator.reset();
      } else {
        const {
          id,
          firstname,
          lastname,
          gender,
          date_of_birth,
          email,
          middlename,
          address,
          department,
          role,
          sub_role,
          phone,
          username,
          date_of_first_appointment,
          date_of_commencement,
          dolp,
          qualification,
          present_rank,
          chs_cms,
          step,
          dd_for_retirement,
          nin,
        } = JSON.parse(JSON.stringify(this.data));
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.phone = phone;
        this.date_of_birth = date_of_birth;
        this.address = address;
        this.role = role;
        this.sub_role = sub_role;
        this.middlename = middlename;
        this.department = department;
        this.gender = gender;
        this.username = username;
        this.date_of_first_appointment = date_of_first_appointment;
        this.date_of_commencement = date_of_commencement;
        this.dolp = dolp;
        this.qualification = qualification;
        this.present_rank = present_rank;
        this.chs_cms = chs_cms;
        this.step = step;
        this.dd_for_retirement = dd_for_retirement;
        this.nin = nin;
      }
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

    getRoles() {
      this.roles = getRolesById(this.department.id);
    },

    getSubRoles() {
      this.sub_roles = getSubRoleById(this.role.id);
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
      this.address = '';
      this.department = '';
      this.role = '';
      this.sub_role = '';
      this.date_of_first_appointment = '';
      this.date_of_commencement = '';
      this.dolp = '';
      this.qualification = '';
      this.present_rank = '';
      this.chs_cms = '';
      this.step = '';
      this.dd_for_retirement = '';
      this.nin = '';
    },

    initializeRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.$emit('closeModal', true);
      this.fetchEmployees();
    },

    fetchEmployees() {
      return this.$store.dispatch('employee/fetchEmployees', {
        currentPage: this.$route.query.currentPage || 1,
        itemsPerPage: this.$route.query.itemsPerPage || 10,
        search: this.$route.query.search || null,
      });
    },

    updateEmployee() {
      // set spinner to submit button
      const submitButton = this.$refs['kt_employee_submit'];
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
        department: this.department?.text,
        role: this.role?.text,
        sub_role: this.sub_role?.text,
        address: this.address,
        photo: this.image,
        date_of_first_appointment: this.date_of_first_appointment,
        date_of_commencement: this.date_of_commencement,
        dolp: this.dolp,
        qualification: this.qualification,
        present_rank: this.present_rank,
        chs_cms: this.chs_cms,
        step: this.step,
        dd_for_retirement: this.dd_for_retirement,
        nin: this.nin,
        id: this.id,
      };

      console.log(data);
      this.$store
        .dispatch('employee/updateEmployee', data)
        .then(() => this.initializeRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style></style>
