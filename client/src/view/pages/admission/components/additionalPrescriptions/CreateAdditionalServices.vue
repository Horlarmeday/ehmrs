<template>
  <div>
    <div class="card-header p-0">
      <div class="card-title mb-2 mt-3">
        <span class="card-label font-weight-bolder text-dark"></span>
        <span v-if="showSwitch">
          <switch-box
            :switch-position="switchPosition"
            :switch-spot="switchSpot"
            @switchSpot="flipSwitch"
          />
        </span>
      </div>
    </div>
    <div class="">
      <div v-for="(service, i) in additionalServices" :key="i">
        <div class="form-group row">
          <div class="col-lg-6">
            <label>Service</label>
            <v-select
              @search="onSearch"
              v-model="service.service"
              label="name"
              :options="serviceOptions"
              :reduce="
                items => ({
                  name: items.name,
                  id: items.id,
                  price: items.price,
                })
              "
            />
          </div>
          <div class="col-lg-5">
            <label>Quantity:</label>
            <input
              v-model="service.quantity"
              type="number"
              class="form-control form-control-sm"
              placeholder="Quantity"
            />
          </div>
          <div class="col-lg-1">
            <br />
            <a href="#" class="col-lg-1 col-form-label">
              <i
                v-if="i === 0"
                class="far fa-plus-square mr-3 text-primary icon-lg mt-lg-3"
                @click="addNewService"
              />
              <i
                class="far fa-trash-alt icon-md text-danger icon-lg mt-lg-3"
                v-if="i !== 0"
                @click="removeService(i)"
              />
            </a>
          </div>
        </div>
      </div>

      <error-banner v-if="showError" :message="errorMessage" :lists="errorList" />

      <div class="mb-3">
        <button
          class="btn btn-primary float-right  mb-lg-5"
          @click="submitServices"
          :disabled="isDisabled || !additionalServices.length"
          ref="kt_addServices_submit"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import vSelect from 'vue-select';
import { debounce } from '@/common/common';
import SwitchBox from '@/utils/SwitchBox.vue';
import ErrorBanner from '@/view/components/util/ErrorBanner.vue';

export default {
  components: { ErrorBanner, SwitchBox, vSelect },
  props: {
    switchPosition: {
      type: Boolean,
      required: true,
      default: false,
    },
    showSwitch: {
      type: Boolean,
      required: true,
      default: false,
    },
    source: {
      type: String,
      required: true,
    },
    filter: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  data: () => ({
    switchSpot: true,
    isDisabled: false,
    showError: false,
    errorMessage: '',
    errorList: [],
    additionalServices: [
      {
        service: '',
        quantity: 1,
      },
    ],
  }),
  computed: {
    services() {
      return this.$store.state.model.services;
    },
    serviceOptions: {
      get() {
        return this.services.map(service => ({
          name: service?.name,
          id: service?.id,
          price: service.price,
        }));
      },
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

    addNewService() {
      this.additionalServices.push({
        service: '',
        quantity: 1,
      });
    },

    onSearch(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.search(loading, search, this);
      }
    },

    search: debounce((loading, search, vm) => {
      vm.$store
        .dispatch('model/fetchServices', {
          search,
        })
        .then(() => loading(false));
    }, 500),

    removeService(i) {
      this.additionalServices.splice(i, 1);
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

    initValues() {
      this.additionalServices = [
        {
          service: '',
          quantity: 1,
        },
      ];
      this.errorMessage = '';
      this.errorList = '';
    },

    submitServices() {
      this.showError = false;
      if (this.additionalServices.some(({ service }) => !service)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'A service cannot be empty',
          type: 'error',
        });
      }

      const data = this.additionalServices.map(({ service, quantity }) => ({
        service_id: service.id,
        service_type: this.switchPosition && this.switchSpot ? 'NHIS' : 'CASH',
        price: service.price,
        source: this.source,
        quantity,
        ...(this.source === 'Theater' && { surgery_id: this.$route.query.surgery }),
        ...(this.source === 'Antenatal' && { ante_natal_id: this.$route.query.antenatal }),
      }));

      // set spinner to submit button
      const submitButton = this.$refs['kt_addServices_submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('order/orderAdditionalService', { services: data, id: this.filter.visit_id })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    flipSwitch(value) {
      this.switchSpot = value;
    },
  },
};
</script>

<style scoped></style>
