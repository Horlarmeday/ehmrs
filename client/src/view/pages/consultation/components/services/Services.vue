<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card-custom">
      <div class="card-header">
        <services-accordion :filter="filter" />
        <div class="card-title">
          <span class="card-label font-weight-bolder text-dark"></span>
          <span v-if="showSwitch" class="mr-3 mt-3">
            <switch-box
              :switch-position="switchPosition"
              :switch-spot="switchSpot"
              @switchSpot="flipSwitch"
              :insurance-name="insuranceName"
            />
          </span>
          <div>
            <button
              v-if="selectedServices.length"
              ref="kt-orderService-submit"
              class="btn btn-primary btn-sm float-right mr-2"
              @click="submitService"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <hr />
      <div class="card-body">
        <div class="row">
          <div class="col-lg-3" v-for="(service, i) in services" :key="service.id">
            <button
              @click="selectService(service, i)"
              ref="selected"
              class="btn btn-outline-primary btn-block btn-sm mb-4"
            >
              {{ service.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ServicesAccordion from '@/view/components/accordion/ServicesAccordion.vue';
import SwitchBox from '@/utils/SwitchBox.vue';

export default {
  name: 'Services',
  components: { SwitchBox, ServicesAccordion },
  data() {
    return {
      checkmark: 'flaticon2-check-mark',
      isDisabled: false,
      switchSpot: true,
    };
  },
  props: {
    switchPosition: {
      type: Boolean,
      required: true,
    },
    showSwitch: {
      type: Boolean,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    filter: {
      type: Object,
      required: true,
    },
    insuranceName: {
      type: String,
      required: false,
    },
  },
  computed: {
    services() {
      return this.$store.state.model.services;
    },
    selectedServices() {
      return this.$store.state.order.selectedServices;
    },
  },
  methods: {
    selectService(value, i) {
      const button = this.$refs['selected'][i];
      const found = this.selectedServices.find(service => service.service_id === value.id);
      if (found) {
        this.$store.dispatch('order/removeSelectedService', this.mapSelectedService(value));
        this.$store.dispatch('order/removeSelectedServiceButton', value.id);
      } else {
        this.$store.dispatch('order/addSelectedService', this.mapSelectedService(value));
        this.$store.dispatch('order/addSelectedServiceButton', { button, button_id: value.id });
      }
    },

    getServiceType(insuranceName) {
      const types = ['FHSS', 'NHIS'];
      if (types.includes(insuranceName)) return 'NHIS';
      if (insuranceName === 'PHIS') return 'Private';
      return 'NHIS';
    },

    mapSelectedService(service) {
      return {
        service_id: service.id,
        is_urgent: false,
        service_type: this.switchPosition && this.switchSpot ? this.getServiceType(this.insuranceName) : 'CASH',
        price: service.price,
        name: service.name,
        source: this.source,
        ...(this.source === 'Antenatal' && { ante_natal_id: this.$route.query.antenatal }),
        ...(this.source === 'Theater' && { surgery_id: this.$route.query.surgery }),
      };
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
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
      const services = this.selectedServices.map(service => {
        delete service.name;
        return service;
      });
      this.$store
        .dispatch('order/orderAdditionalService', {
          services,
          id: this.filter.visit_id,
        })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    initValues() {
      this.$store.dispatch('order/emptySelectedService');
      this.$store.dispatch('order/emptySelectedServiceButtons');
    },

    flipSwitch(value) {
      this.switchSpot = value;
    },
  },
};
</script>

<style scoped></style>
