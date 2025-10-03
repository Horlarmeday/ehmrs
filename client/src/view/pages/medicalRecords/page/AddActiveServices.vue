<template>
  <div>
    <div class="card card-custom gutter-b">
      <!--begin::Header-->
      <div class="card-header py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">
            <i class="fas fa-file-medical mr-2 text-primary"></i>
            Add Services & Tests to Visit
          </span>
          <span class="text-muted mt-2">Order services and laboratory tests for this visit</span>
        </h3>
      </div>
      <div class="card-body">
        <b-tabs content-class="mt-4">
          <!-- Services Tab -->
          <b-tab title="Services" active>
            <template #title>
              <i class="fas fa-concierge-bell mr-2"></i>
              Services
            </template>

            <!-- Services Accordion -->
            <div class="mb-6">
              <services-accordion :filter="filter" />
            </div>

            <!-- Services Selection Form -->
            <div class="form-group row">
              <label class="col-lg-3 col-form-label font-weight-bold text-dark">
                <i class="fas fa-concierge-bell mr-1 text-primary"></i>
                Select Service(s):
              </label>
              <div class="col-lg-9">
                <v-select
                  multiple
                  name="service"
                  @search="onHandleSearch"
                  v-model="service_id"
                  label="name"
                  :options="services"
                  :reduce="
                    (services) => ({
                      id: services.id,
                      price: services.price,
                      name: services.name,
                    })
                  "
                  placeholder="Search and select services..."
                  class="form-control-lg"
                >
                  <template #option="{ price, name }">
                    <span>{{ name }} - </span>
                    <strong> {{ price || '' }}</strong>
                  </template>
                </v-select>
                <small class="form-text text-muted"
                  >Select one or more services for this visit</small
                >
              </div>
            </div>

            <!-- Submit Button -->
            <div class="d-flex justify-content-end pt-4 border-top">
              <button
                class="btn btn-primary btn-lg px-8"
                @click="submitService"
                ref="kt-orderService-submit"
                :disabled="isDisabled"
              >
                <i class="fas fa-save mr-2"></i>
                <span v-if="!isDisabled">Submit Services</span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm mr-2" role="status"></span>
                  Submitting...
                </span>
              </button>
            </div>
          </b-tab>

          <!-- Tests Tab -->
          <b-tab title="Tests">
            <template #title>
              <i class="fas fa-flask mr-2"></i>
              Tests
            </template>

            <!-- Tests Accordion -->
            <div class="mb-6">
              <tests-accordion :filter="filter" />
            </div>

            <!-- Tests Selection Form -->
            <div class="form-group row">
              <label class="col-lg-3 col-form-label font-weight-bold text-dark">
                <i class="fas fa-flask mr-1 text-primary"></i>
                Select Test(s):
              </label>
              <div class="col-lg-9">
                <v-select
                  multiple
                  name="test"
                  @search="searchTests"
                  v-model="test_id"
                  label="name"
                  :options="tests"
                  :reduce="(tests) => tests.id"
                  placeholder="Search and select laboratory tests..."
                  class="form-control-lg"
                >
                  <template #option="{ price, name }">
                    <span>{{ name }} - </span>
                    <strong> {{ price || '' }}</strong>
                  </template>
                </v-select>
                <small class="form-text text-muted"
                  >Select one or more laboratory tests for this visit</small
                >
              </div>
            </div>

            <!-- Submit Button -->
            <div class="d-flex justify-content-end pt-4 border-top">
              <button
                class="btn btn-primary btn-lg px-8"
                @click="submitTests"
                ref="kt-orderTest-submit"
                :disabled="isTestDisabled"
              >
                <i class="fas fa-save mr-2"></i>
                <span v-if="!isTestDisabled">Submit Tests</span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm mr-2" role="status"></span>
                  Submitting...
                </span>
              </button>
            </div>
          </b-tab>
        </b-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import { debounce, getTestTypeToFetch } from '@/common/common';
import vSelect from 'vue-select';
import ServicesAccordion from '@/view/components/accordion/ServicesAccordion.vue';
import TestsAccordion from '@/view/components/accordion/TestsAccordion.vue';

export default {
  name: 'AddActiveServices',
  components: { ServicesAccordion, TestsAccordion, vSelect },
  data() {
    return {
      service_id: '',
      test_id: [],
      selectedServices: [],
      IMMUNIZATION: 'Immunization',
      isDisabled: false,
      isTestDisabled: false,
      itemsPerPage: 20,
    };
  },
  computed: {
    services() {
      return this.$store.state.model.services;
    },

    tests() {
      return this.$store.state.laboratory.tests;
    },

    visit() {
      return this.$store.state.visit.visit;
    },

    filter() {
      return { visit_id: this.$route.params.id };
    },

    insuranceName() {
      return this.$store.state.patient.currentPatient?.insurance_name;
    },

    isSwitchOn() {
      return this.$store.state.patient.currentPatient?.has_insurance;
    },
  },
  methods: {
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
          selectedIds: vm.service_id || [], // Pass selected service IDs
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    initValues() {
      this.service_id = '';
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.$store.dispatch('order/fetchPrescribedServicesPerVisit', {
        currentPage: 1,
        itemsPerPage: 10,
        filter: this.filter,
      });
    },

    submitService() {
      if (!this.service_id || (Array.isArray(this.service_id) && this.service_id.length === 0)) {
        this.$bvToast.toast('Please select at least one service', {
          title: 'Validation Error',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      const submitButton = this.$refs['kt-orderService-submit'];
      this.addSpinner(submitButton);
      let services;
      if (Array.isArray(this.service_id)) {
        services = this.service_id.map((service) => ({
          service_id: service.id,
          service_type: 'Cash',
          is_urgent: false,
          price: service.price,
          source: 'Consultation',
          ...(this.visit?.ante_natal_id && { ante_natal_id: this.visit?.ante_natal_id }),
          ...(this.visit?.surgery_id && { surgery_id: this.visit?.surgery_id }),
        }));
      } else {
        services = [
          {
            service_id: this.service_id.id,
            service_type: 'Cash',
            is_urgent: false,
            price: this.service_id.price,
            source: 'Consultation',
            ...(this.visit?.ante_natal_id && { ante_natal_id: this.visit?.ante_natal_id }),
            ...(this.visit?.surgery_id && { surgery_id: this.visit?.surgery_id }),
          },
        ];
      }
      this.$store
        .dispatch('order/orderAdditionalService', {
          services,
          id: this.$route.params.id,
        })
        .then(() => {
          this.endRequest(submitButton);
        })
        .catch((error) => {
          this.$bvToast.toast(error.response?.data?.message || 'Failed to order services', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
          this.removeSpinner(submitButton);
        });
    },

    searchTests(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debounceTestSearch(loading, search, this);
      }
    },

    debounceTestSearch: debounce((loading, search, vm) => {
      const testType = getTestTypeToFetch(vm.insuranceName, vm.isSwitchOn);
      vm.$store
        .dispatch('laboratory/fetchTests', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
          selectedIds: vm.test_id || [],
          ...(testType && { filter: testType }),
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    mapSelectedTest(test) {
      return {
        test_id: test.id,
        is_urgent: false,
        test_type: this.getTestType(this.insuranceName),
        price: test.price,
        name: test.name,
        sample_id: test.sample_id,
        source: 'Consultation',
        ...(this.visit?.ante_natal_id && { ante_natal_id: this.visit?.ante_natal_id }),
        ...(this.visit?.surgery_id && { surgery_id: this.visit?.surgery_id }),
      };
    },

    getTestType(insuranceName) {
      const insuranceMapping = {
        FHSS: 'NHIS',
        NHIS: 'NHIS',
        PHIS: 'Private',
        Retainership: 'Cash',
      };
      return insuranceMapping[insuranceName] || 'Cash';
    },

    addTestSpinner(submitButton) {
      this.isTestDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeTestSpinner(submitButton) {
      this.isTestDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    initTestValues() {
      this.test_id = [];
    },

    submitTests() {
      if (!this.test_id || this.test_id.length === 0) {
        this.$bvToast.toast('Please select at least one test', {
          title: 'Validation Error',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      const submitButton = this.$refs['kt-orderTest-submit'];
      this.addTestSpinner(submitButton);

      const tests = this.test_id
        .map((testId) => {
          const test = this.tests.find((t) => t.id === testId);
          if (!test) return null;
          const mappedTest = this.mapSelectedTest(test);
          delete mappedTest.name;
          return mappedTest;
        })
        .filter(Boolean);

      this.$store
        .dispatch('order/orderLabTest', {
          tests,
          id: this.$route.params.id,
        })
        .then(() => {
          this.removeTestSpinner(submitButton);
          this.initTestValues();
          this.$store.dispatch('order/fetchPrescribedTests', {
            currentPage: 1,
            itemsPerPage: 10,
            filter: this.filter,
          });
        })
        .catch(() => {
          this.removeTestSpinner(submitButton);
        });
    },

    fetchTests() {
      this.$store.dispatch('laboratory/fetchTests', {
        currentPage: 1,
        itemsPerPage: 100,
      });
    },

    fetchServices() {
      this.$store.dispatch('model/fetchServices', {
        currentPage: 1,
        itemsPerPage: 100,
      });
    },
  },
  created() {
    this.fetchTests();
    this.fetchServices();
    this.$store.dispatch('visit/fetchVisit', this.$route.params.id).then((response) => {
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
