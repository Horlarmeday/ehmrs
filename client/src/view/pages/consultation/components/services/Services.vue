<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card card-custom gutter-b">
      <div class="card-header pt-5">
        <div class="card-title">
          <span class="card-label font-weight-bolder text-dark">Additional Services</span>
          <span v-if="showSwitch" class="switch switch-sm switch-icon float-right">
            <label>
              <input @change="flipSwitch($event)" type="checkbox" :checked="switchPosition" />
              <span />
            </label>
          </span>
        </div>
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
      <hr>
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
export default {
  name: 'Services',
  data() {
    return {
      checkmark: 'flaticon2-check-mark',
      isDisabled: false,
      switchPosition: false,
    };
  },
  created() {
    this.defaultSwitchPosition();
  },
  computed: {
    services() {
      return this.$store.state.model.services;
    },
    selectedServices() {
      return this.$store.state.order.selectedServices;
    },
    visit() {
      return this.$store.state.visit.visit;
    },
    showSwitch() {
      return this.visit?.patient?.has_insurance && this.visit?.patient?.insurance_id !== 4;
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

    mapSelectedService(service) {
      return {
        service_id: service.id,
        is_urgent: false,
        service_type: this.switchPosition ? 'NHIS' : 'CASH',
        price: service.price,
        name: service.name,
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

    initializeRequest(button) {
      this.removeSpinner(button);
      this.initValues();
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
          id: this.$route.params.visitId,
        })
        .then(() => this.initializeRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    initValues() {
      this.$store.dispatch('order/emptySelectedService');
      this.$store.dispatch('order/emptySelectedServiceButtons');
    },

    defaultSwitchPosition() {
      setTimeout(() => {
        if (this.visit?.patient?.has_insurance && this.visit?.patient?.insurance_id !== 4) {
          this.switchPosition = true;
        }
      }, 350);
    },

    flipSwitch(event) {
      this.switchPosition = !!event.target.checked;
    },
  },
};
</script>


<style scoped>

</style>