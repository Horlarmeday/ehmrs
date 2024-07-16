<template>
  <div class="card card-custom gutter-b">
    <!--begin::Header-->
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Update Visit</span>
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
          >
            <option v-for="department in departments" :key="department" :value="department"
              >{{ department }}
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
            <option v-for="professional in professionals" :key="professional" :value="professional"
              >{{ professional }}
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
            disabled
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
            :multiple="category === IMMUNIZATION"
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
        <button ref="kt_visit_submit" @click="updateVisit" class="btn btn-primary">
          Update
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { debounce } from '@/common/common';
import vSelect from 'vue-select';
import dayjs from 'dayjs';

export default {
  name: 'CreateVisit',
  components: { vSelect },
  data() {
    return {
      priorities: ['Not Urgent', 'Urgent', 'Emergency'],
      visitTypes: ['New visit'],
      id: '',
      categories: [
        'Outpatient',
        'Emergency',
        'Immunization',
        'Antenatal',
        'Maternity',
        'Inpatient',
      ],
      category: '',
      professional: '',
      department: null,
      departments: ['Medical Practitioner', 'Nursing'],
      type: '',
      date_of_visit: new Date(),
      time_of_visit: new Date().toLocaleTimeString(),
      service_id: '',
      priority: '',
      gender: '',
      currentPage: 1,
      itemsPerPage: 20,
      IMMUNIZATION: 'Immunization',
      professionals: [
        'Nurse',
        'General Practitioner',
        'Obstetrics and gynaecologist',
        'Pediatrician',
        'Oncologist',
        'Cardiologist',
        'Ophthalmologist',
        'Neurologist',
        'Dermatologist',
        'Psychiatrist',
        'Orthopaedist',
        'Urologist',
        'Endocrinologist',
        'Gastroenterologist',
        'Optician',
      ],
    };
  },
  computed: {
    services() {
      return this.$store.state.model.services;
    },

    visit() {
      return this.$store.state.visit.visit;
    },
  },
  watch: {
    visit(val) {
      if (!val) return;
      if (Object.entries(val)?.length) {
        const {
          id,
          professional,
          category,
          department,
          type,
          date_visit_start,
          priority,
        } = JSON.parse(JSON.stringify(val));
        this.id = id;
        this.professional = professional;
        this.category = category;
        this.department = department;
        this.type = type;
        this.date_of_visit = date_visit_start;
        this.priority = priority;
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

    updateVisit() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const date = `${dayjs(this.date_of_visit).format('YYYY-MM-DD')} ${this.time_of_visit}`;
          const obj = {
            category: this.category,
            type: this.type,
            date_of_visit: new Date(date),
            service_id: this.service_id,
            priority: this.priority,
            department: this.department,
            professional: this.professional,
          };

          const submitButton = this.$refs['kt_visit_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('visit/updateVisit', { id: this.id, data: obj })
            .then(() => {
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

    initValues() {
      this.category = '';
      this.professional = '';
      this.time_of_visit = '';
      this.date_of_visit = '';
      this.service_id = '';
      this.type = '';
      this.department = '';
      this.priority = '';
      this.id = '';
    },
  },
  created() {
    this.$store.dispatch('visit/fetchVisit', this.$route.params.id).then(response => {
      const res = response.data.data;
      this.$store.dispatch('patient/setCurrentPatient', {
        ...res.insurance,
        ...res.patient,
      });
    });
  },
};
</script>

<style scoped></style>
