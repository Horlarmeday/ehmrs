<template>
  <div>
    <div class="card card-custom gutter-b">
      <!--begin::Header-->
      <div class="card-header py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Add Services to Visit</span>
        </h3>
      </div>
      <div class="card-body">
        <services-accordion :filter="filter" />
      </div>
      <div class="card-body">
        <div class="form-group row">
          <label class="col-lg-3 col-form-label">Select Service(s):</label>
          <div class="col-lg-6">
            <v-select
              :multiple="visit?.category === IMMUNIZATION"
              name="service"
              @search="onHandleSearch"
              v-model="service_id"
              label="name"
              :options="services"
              :reduce="
                services => ({
                  id: services.id,
                  price: services.price,
                })
              "
            />
          </div>
        </div>
        <div class="col-lg-9 col-form-label">
          <button
            class="btn btn-primary float-right"
            @click="submitService"
            ref="kt-orderService-submit"
            :disabled="isDisabled"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { debounce } from '@/common/common';
import vSelect from 'vue-select';
import ServicesAccordion from '@/view/components/accordion/ServicesAccordion.vue';
export default {
  data: () => ({
    service_id: '',
    selectedServices: [],
    IMMUNIZATION: 'Immunization',
    isDisabled: false,
  }),
  components: { ServicesAccordion, vSelect },
  computed: {
    services() {
      return this.$store.state.model.services;
    },

    visit() {
      return this.$store.state.visit.visit;
    },

    filter() {
      return { visit_id: this.$route.params.id };
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
      this.$store.dispatch('order/fetchPrescribedServices', {
        currentPage: 1,
        itemsPerPage: 10,
        filter: this.filter,
      });
    },

    submitService() {
      const submitButton = this.$refs['kt-orderService-submit'];
      this.addSpinner(submitButton);
      let services;
      if (Array.isArray(this.service_id)) {
        services = this.service_id.map(service => ({
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
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
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
