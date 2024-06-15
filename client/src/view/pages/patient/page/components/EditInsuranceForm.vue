<template>
  <div class="card-body mt-4">
    <div class="form-group row">
      <div class="col-lg-4">
        <label>Insurance Type <span class="text-danger">*</span></label>
        <select
          :disabled="!insurance?.insurance_id"
          class="form-control"
          v-validate="'required'"
          data-vv-validate-on="blur"
          name="insurance_id"
          v-model="insurance_id"
          @change="getHMOs"
        >
          <option :value="insurance.id" v-for="(insurance, i) in insurances" :key="i">{{
            insurance.name
          }}</option>
        </select>
        <span class="text-danger text-sm">{{ errors.first('insurance_id') }}</span>
      </div>
      <div class="col-lg-4">
        <label>HMO <span class="text-danger">*</span></label>
        <v-select
          :disabled="!insurance?.hmo_id"
          v-validate="'required'"
          data-vv-validate-on="blur"
          name="hmo_id"
          v-model="hmo_id"
          label="name"
          :reduce="hmos => hmos.id"
          :options="hmos"
        ></v-select>
        <span class="text-danger text-sm">{{ errors.first('hmo_id') }}</span>
      </div>
      <div class="col-lg-4">
        <label>Policy Number <span class="text-danger">*</span></label>
        <input
          :disabled="!insurance?.enrollee_code"
          v-validate="'required'"
          data-vv-validate-on="blur"
          type="text"
          class="form-control form-control-sm"
          v-model="enrollee_code"
          placeholder="Policy Number"
          name="enrollee_id"
        />
        <span class="text-danger text-sm">{{ errors.first('enrollee_id') }}</span>
      </div>
      <div class="col-lg-4">
        <label>Organization <span class="text-danger">*</span></label>
        <input
          :disabled="!insurance?.organization"
          v-validate="'required'"
          data-vv-validate-on="blur"
          type="text"
          class="form-control"
          v-model="organization"
          placeholder="Organization"
          name="organization"
        />
        <span class="text-danger text-sm">{{ errors.first('organization') }}</span>
      </div>
      <div class="col-lg-4">
        <label>Plan <span class="text-danger">*</span></label>
        <select
          :disabled="!insurance?.plan"
          class="form-control"
          v-model="plan"
          name="plan"
          v-validate="'required'"
          data-vv-validate-on="blur"
        >
          <option value="Social">Social </option>
          <option value="Gold">Gold</option>
          <option value="Bronze">Bronze</option>
          <option value="Silver">Silver</option>
          <option value="Emerald">Emerald</option>
        </select>
        <span class="text-danger text-sm">{{ errors.first('plan') }}</span>
      </div>
    </div>
    <div>
      <button
        ref="kt-editPatientInsurance-submit"
        class="btn btn-primary float-right"
        @click="editPatientInsurance"
        :disabled="isDisabled"
      >
        Submit
      </button>
    </div>
  </div>
</template>
<script>
import vSelect from 'vue-select';
export default {
  data: () => ({
    isDisabled: false,
    insurance_id: '',
    hmo_id: '',
    plan: '',
    organization: '',
    enrollee_code: '',
    patient_insurance_id: '',
  }),
  computed: {
    hmos() {
      return this.$store.state.insurance.hmos;
    },

    insurances() {
      return this.$store.state.insurance.insurances;
    },
  },
  components: {
    vSelect,
  },
  created() {
    this.getInsurances();
    this.getHMOs();
  },
  props: {
    insurance: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  watch: {
    insurance(val) {
      if (!val) return;
      const { id, insurance_id, hmo_id, plan, organization, enrollee_code } = val;
      this.insurance_id = insurance_id;
      this.hmo_id = hmo_id;
      this.plan = plan;
      this.organization = organization;
      this.enrollee_code = enrollee_code;
      this.patient_insurance_id = id;
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

    initValues() {
      this.hmo_id = '';
      this.enrollee_code = '';
      this.organization = '';
      this.plan = '';
      this.insurance_id = '';
      this.patient_insurance_id = '';
    },

    editPatientInsurance() {
      const submitButton = this.$refs['kt-editPatientInsurance-submit'];
      this.addSpinner(submitButton);

      const data = {
        enrollee_code: this.enrollee_id,
        organization: this.organization,
        hmo_id: this.hmo_id,
        insurance_id: this.insurance_id,
        plan: this.plan,
        patient_insurance_id: this.patient_insurance_id,
      };

      this.$store
        .dispatch('patient/updatePatientInsurance', { data, id: this.$route.params.id })
        .then(() => {
          console.log('here');
          this.removeSpinner(submitButton);
          this.initValues();
          this.$router.push(`/patient/profile/${this.$route.params.id}`);
        })
        .catch(() => this.removeSpinner(submitButton));
    },

    getInsurances() {
      this.$store.dispatch('insurance/fetchInsurances', {
        currentPage: 1,
        itemsPerPage: 25,
      });
    },

    getHMOs() {
      this.$store.dispatch('insurance/fetchHMOs', {
        currentPage: 1,
        itemsPerPage: 200,
        filter: this.insurance_id,
      });
    },
  },
};
</script>

<style scoped></style>
