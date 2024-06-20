<template>
  <div class="card card-custom gutter-b">
    <!--begin::Header-->
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Start Visit</span>
      </h3>
    </div>
    <div class="card-body">
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Category:</label>
          <select
            class="form-control"
            v-model="category"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="category"
          >
            <option :value="category" v-for="(category, i) in categories" :key="i">{{
              category
            }}</option>
          </select>
          <span class="text-danger text-sm">{{ errors.first('category') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Department:</label>
          <select
            class="form-control"
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
          <label>Professional:</label>
          <select
            class="form-control"
            v-model="professional"
            name="professional"
            v-validate="'required'"
            data-vv-validate-on="blur"
          >
            <option
              v-for="professional in professionals"
              :key="professional.id"
              :value="{ id: professional.id, text: professional.role }"
              >{{ professional.role }}
            </option>
          </select>
          <span class="text-danger text-sm">{{ errors.first('professional') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Type:</label>
          <select
            class="form-control"
            v-model="type"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="type"
          >
            <option :value="type" v-for="(type, i) in visitTypes" :key="i">{{ type }}</option>
          </select>
          <span class="text-danger text-sm">{{ errors.first('type') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Date of Visit:</label>
          <b-form-datepicker
            v-model="date_of_visit"
            class="form-control"
            name="date_of_visit"
            v-validate="'required'"
            data-vv-validate-on="blur"
            required
          />
          <span class="form-text text-danger">{{ errors.first('date_of_visit') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Priority:</label>
          <select
            class="form-control"
            v-model="priority"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="priority"
          >
            <option :value="prior" v-for="(prior, i) in priorities" :key="i">{{ prior }}</option>
          </select>
          <span class="text-danger text-sm">{{ errors.first('priority') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Associated Service:</label>
          <v-select
            name="service"
            @search="onHandleSearch"
            v-model="service_id"
            label="name"
            :options="services"
            :reduce="services => services.id"
          />
        </div>
      </div>
      <div>
        <button ref="kt_visit_submit" @click="getLastActiveVisit" class="btn btn-primary">
          Submit
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { getRolesById } from '@/view/pages/employees/create/employeeRoles';
import { debounce } from '@/common/common';
import vSelect from 'vue-select';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

export default {
  name: 'CreateVisit',
  components: { vSelect },
  data() {
    return {
      priorities: ['Not Urgent', 'Urgent', 'Emergency'],
      visitTypes: ['New visit'],
      category: '',
      professional: '',
      professionals: null,
      department: '',
      type: '',
      date_of_visit: new Date(),
      time_of_visit: new Date().toLocaleTimeString(),
      service_id: '',
      priority: '',
      gender: '',
      currentPage: 1,
      itemsPerPage: 20,
    };
  },
  computed: {
    services() {
      return this.$store.state.model.services;
    },

    departments() {
      const data = [
        {
          id: 9,
          department: 'Medical Practitioner',
        },
      ];
      if (this.category === 'Antenatal') {
        data.push({
          id: 2,
          department: 'Nursing',
        });
      }
      return data;
    },

    categories() {
      const data = ['Outpatient', 'Emergency', 'Immunization'];
      if (this?.gender === 'Female') {
        data.push('Antenatal');
      }
      return data;
    },
  },
  methods: {
    getRoles() {
      this.professionals = getRolesById(this.department.id);
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    displayPrompt(obj, category) {
      const self = this;
      Swal.fire({
        title: 'Are you sure, you want to override?',
        text: `Patient has an active ${category} visit ongoing, this action cannot be reversed`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Override!',
        cancelButtonText: 'No, cancel!',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return self.createVisit(obj);
        },
      });
    },

    getLastActiveVisit() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const date = `${dayjs(this.date_of_visit).format('YYYY-MM-DD')} ${this.time_of_visit}`;
          const obj = {
            category: this.category,
            type: this.type,
            date_of_visit: new Date(date),
            service_id: this.service_id,
            priority: this.priority,
            department: this.department.text,
            professional: this.professional.text,
            patient_id: this.$route.params.id,
          };
          const submitButton = this.$refs['kt_visit_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('visit/getLastActiveVisit', obj)
            .then(response => {
              if (response.status === 200) {
                const category = response.data.data.category || 'Nil';
                this.removeSpinner(submitButton);
                this.displayPrompt(obj, category);
                return true;
              }
              this.initializeRequest(submitButton);
            })
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    initializeRequest(button) {
      this.removeSpinner(button);
      this.initValues();
    },

    onHandleSearch(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debounceSearch(loading, search, this);
      }
    },

    debounceSearch: debounce((loading, search, vm) => {
      vm.$store
        .dispatch('model/fetchServices', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    createVisit(obj) {
      const submitButton = this.$refs['kt_visit_submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('visit/addVisit', obj)
        .then(() => this.initializeRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    initValues() {
      this.category = '';
      this.professional = '';
      this.time_of_visit = '';
      this.date_of_visit = '';
      this.service_id = '';
      this.type = '';
      this.department = '';
      this.priority = '';
    },
  },
  created() {
    this.$store.dispatch('patient/fetchPatientProfile', this.$route.params.id).then(response => {
      const res = response.data.data;
      this.gender = res.gender;
      this.$store.dispatch('patient/setCurrentPatient', { ...res, ...res.insurance });
    });
  },
};
</script>

<style scoped></style>
