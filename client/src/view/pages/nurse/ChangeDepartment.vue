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
            <div class="card-label">{{ employee?.fullname || '' }} Personal Details</div>
          </div>
        </div>
        <b-collapse id="accordion-1" visible accordion="my-accordion" role="tabpanel">
          <div class="card-body">
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Department <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="employee.department"
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
                  v-model="employee.role"
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
                <select class="form-control form-control-sm" v-model="employee.sub_role">
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
          ref="kt-updateEmployee-submit"
          class="btn btn-primary font-weight-bold float-right"
          @click="updateEmployee"
        >
          Save
        </button>
      </div>
    </div>
    <!--end::Accordion-->
  </div>
</template>

<script>
import { departments, getRolesById, getSubRoleById } from '../employees/create/employeeRoles';
import Swal from 'sweetalert2';
export default {
  data() {
    return {
      employee: '',
      departments: [],
      roles: [],
      sub_roles: [],
    };
  },

  created() {
    this.fetchEmployee();
    this.countToHundred();
    this.departments = departments;
  },
  methods: {
    getRoles() {
      this.roles = getRolesById(this.department.id);
    },

    getSubRoles() {
      this.sub_roles = getSubRoleById(this.role.id);
    },

    fetchEmployee() {
      this.$store.dispatch('employee/fetchEmployee', this.$route.params.id);
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
      this.handleSuccess(response);
    },

    updateEmployee() {
      this.$validator.validateAll().then(result => {
        if (result) {
          // set spinner to submit button
          const submitButton = this.$refs['kt-updateEmployee-submit'];
          this.addSpinner(submitButton);

          const data = {
            employee: this.employee,
          };
          this.$store
            .dispatch('employee/updateEmployee', data)
            .then(response => this.initializeRequest(submitButton, response))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    countToHundred() {
      for (let i = 1; i <= 10000; i++) {
        this.count = i;
        if (this.employee) break;
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
