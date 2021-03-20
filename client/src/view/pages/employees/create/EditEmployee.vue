<template>
  <b-modal v-model="activePrompt" hide-footer title="Staff" size="modal-lg">
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
          <span class="text-danger text-sm">{{
            errors.first("firstname")
          }}</span>
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
          <span class="text-danger text-sm">{{
            errors.first("lastname")
          }}</span>
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
          <span class="text-danger text-sm">{{
            errors.first("username")
          }}</span>
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
          <span class="text-danger text-sm">{{
            errors.first("department")
          }}</span>
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
          <span class="text-danger text-sm">{{ errors.first("role") }}</span>
        </div>
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
import Datepicker from "vuejs-datepicker";
import {
  departments,
  getRolesById,
  getSubRoleById,
  roles,
  sub_roles
} from "./employeeRoles";
export default {
  props: {
    displayPrompt: {
      type: Boolean,
      required: true
    },
    data: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    Datepicker
  },
  data() {
    return {
      gender: "",
      firstname: "",
      lastname: "",
      middlename: "",
      email: "",
      phone: "",
      date_of_birth: "",
      address: "",
      department: "",
      username: "",
      role: "",
      sub_role: "",
      relationship: "",
      departments,
      roles,
      sub_roles,
      staff_id: "",
      isDisabled: false
    };
  },
  computed: {
    validateForm() {
      return !this.errors.any() && this.name !== "";
    },
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit("closeModal", value);
      }
    }
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
          username
        } = JSON.parse(JSON.stringify(this.data));
        this.staff_id = id;
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
      }
    }
  },
  methods: {
    getRoles() {
      this.roles = getRolesById(this.department.id);
    },

    getSubRoles() {
      this.sub_roles = getSubRoleById(this.role.id);
    },
    initValues() {
      this.gender = "";
      this.firstname = "";
      this.lastname = "";
      this.middlename = "";
      this.username = "";
      this.email = "";
      this.phone = "";
      this.date_of_birth = "";
      this.address = "";
      this.department = "";
      this.role = "";
      this.sub_role = "";
    },
    updateEmployee() {
      this.$validator.validateAll().then(result => {
        if (result) {
          // set spinner to submit button
          const submitButton = this.$refs["kt_employee_submit"];
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
            photo: this.image
          };
          this.$store
            .dispatch("employee/addEmployee", data)
            .then(response => this.initializeRequest(submitButton, response))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    }
  }
};
</script>

<style></style>
