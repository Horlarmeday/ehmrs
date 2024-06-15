<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-header">
        <div class="card-title">
          <h3 class="card-label">{{ $route.query.patient }}</h3>
        </div>
      </div>
      <div class="card-body">
        <div class="form-group m-0">
          <label>Make Insurance Default:</label>
          <div class="row">
            <div class="col-lg-6" v-for="(insurance, i) in insurances" :key="i">
              <label class="option" :class="insurance.is_default ? 'border-success' : ''">
                <span class="option-control">
                  <span class="radio">
                    <input
                      type="radio"
                      name="radio1"
                      @change="getInsuranceId($event)"
                      :value="insurance.id"
                    />
                    <span></span>
                  </span>
                </span>
                <span class="option-label">
                  <span class="option-head">
                    <span class="option-title">
                      {{ insurance.insurance?.name }}
                    </span>
                    <span class="option-focus">
                      <a v-if="insurance.is_default" href="#"
                        ><i class="flaticon2-correct text-success font-size-h5"></i
                      ></a>
                      <a v-else href="#"
                        ><i class="flaticon2-correct text-danger font-size-h5"></i
                      ></a>
                    </span>
                  </span>
                  <span class="option-body font-weight-bolder">
                    {{ insurance.hmo?.name }}
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <button
        ref="kt-setInsurance-default"
        @click="setInsuranceDefault"
        class="btn btn-primary float-right"
      >
        Submit
      </button>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({
    insurance_id: '',
  }),

  computed: {
    insurances() {
      return this.$store.state.insurance.patientInsurances;
    },
  },

  created() {
    this.fetchInsurances();
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

    fetchInsurances() {
      this.$store.dispatch('insurance/fetchPatientInsurances', this.$route.params.id);
    },

    getInsuranceId(event) {
      this.insurance_id = event.target.value;
    },

    endRequest(submitButton) {
      this.removeSpinner(submitButton);
      this.fetchInsurances();
    },

    setInsuranceDefault() {
      const submitButton = this.$refs['kt-setInsurance-default'];
      this.addSpinner(submitButton);
      const data = {
        insurance_id: this.insurance_id,
      };

      this.$store
        .dispatch('insurance/setInsuranceAsDefault', { data, id: this.$route.params.id })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>
