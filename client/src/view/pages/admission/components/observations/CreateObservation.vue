<template>
  <div class="flex-row-fluid ml-lg-8">
    <div>
      <div class="form-group row">
        <label class="col-lg-2 col-form-label">Height (cm)</label>
        <div class="col-lg-2">
          <input
            v-validate="'required|between:0,2'"
            data-vv-validate-on="blur"
            name="height"
            @keyup="calculateBMI"
            v-model="height"
            type="number"
            class="form-control form-control-sm"
          />
          <span class="text-danger text-sm">{{ errors.first('height') }}</span>
        </div>
        <label class="col-lg-1 col-form-label">Weight (kg)</label>
        <div class="col-lg-2">
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="weight"
            @keyup="calculateBMI"
            v-model="weight"
            type="number"
            class="form-control form-control-sm"
          />
          <span class="text-danger text-sm">{{ errors.first('weight') }}</span>
        </div>
        <label class="col-lg-1 col-form-label">BMI (kg/m²)</label>
        <div class="col-lg-2">
          <input v-model="bmi" type="number" class="form-control form-control-sm" readonly />
        </div>
        <p v-if="bmiCategory" class="text-danger">{{ bmiCategory }}</p>
      </div>
      <div class="form-group row">
        <label class="col-2 col-form-label" v-if="date_of_birth && date_of_birth <= 2"
          >Heart Rate (b/min*)</label
        >
        <label class="col-2 col-form-label" v-else>Pulse (b/min*)</label>
        <div class="col-6">
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            class="form-control form-control-sm"
            type="text"
            v-model="pulse"
            name="pulse"
          />
          <span class="text-danger text-sm">{{ errors.first('pulse') }}</span>
        </div>
        <label class="col-lg-2 col-form-label">(72 - 72)</label>
      </div>
      <hr />
      <h5 class="text-primary">Blood Pressure</h5>
      <div class="form-group row">
        <label class="col-2 col-form-label">Systolic (b/min*)</label>
        <div class="col-6">
          <input
            ref="systolic"
            class="form-control form-control-sm"
            type="text"
            v-model="systolic"
            name="systolic"
          />
          <span class="text-danger text-sm">{{ errors.first('systolic') }}</span>
        </div>
        <label class="col-lg-2 col-form-label">(110 - 140)</label>
      </div>
      <div class="form-group row">
        <label class="col-2 col-form-label">Diastolic (mmHg*)</label>
        <div class="col-6">
          <input
            v-validate="'bp:systolic'"
            data-vv-validate-on="blur"
            name="diastolic"
            class="form-control form-control-sm"
            type="text"
            v-model="diastolic"
          />
          <span class="text-danger text-sm">{{ errors.first('diastolic') }}</span>
        </div>
        <label class="col-lg-2 col-form-label">(70 - 85)</label>
      </div>
      <hr />
      <div class="form-group row">
        <label class="col-2 col-form-label">Temperature (°C*)</label>
        <div class="col-6">
          <input
            class="form-control form-control-sm"
            type="text"
            v-model="temperature"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="temperature"
          />
          <span class="text-danger text-sm">{{ errors.first('temperature') }}</span>
        </div>
        <label class="col-lg-2 col-form-label">(32 - 37)</label>
      </div>
      <div class="form-group row">
        <label class="col-2 col-form-label">Respiration (C/min*)</label>
        <div class="col-6">
          <input class="form-control form-control-sm" type="text" v-model="respiration" />
        </div>
        <label class="col-lg-2 col-form-label">(16 - 20)</label>
      </div>
      <div class="form-group row">
        <label class="col-2 col-form-label">SPO2 (%)</label>
        <div class="col-6">
          <input class="form-control form-control-sm" type="text" v-model="spo2" />
        </div>
        <label class="col-lg-2 col-form-label">(>70)</label>
      </div>
      <div class="form-group row">
        <label class="col-2 col-form-label">RVS</label>
        <div class="col-6">
          <select v-model="rvs" class="form-control form-control-sm">
            <option :value="r" v-for="(r, i) in rvsOptions" :key="i">{{ r }}</option>
          </select>
        </div>
        <label class="col-lg-2 col-form-label">(HIV)</label>
      </div>
      <div class="form-group row">
        <label class="col-2 col-form-label">MUAC</label>
        <div class="col-6">
          <select v-model="muac" class="form-control form-control-sm">
            <option :value="r" v-for="(r, i) in muacOptions" :key="i">{{ r }}</option>
          </select>
        </div>
        <label class="col-lg-2 col-form-label">(Color)</label>
      </div>
      <div class="form-group row">
        <label class="col-2 col-form-label">Comment</label>
        <div class="col-6">
          <textarea
            v-model="comment"
            class="form-control-sm form-control"
            cols="30"
            rows="5"
          ></textarea>
        </div>
      </div>
      <div>
        <button
          @click="createObservation"
          :disabled="isDisabled"
          ref="kt_observation_submit"
          class="btn btn-primary float-right"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'CreateObservation',
  data() {
    return {
      temperature: '',
      systolic: '',
      diastolic: '',
      spo2: '',
      respiration: '',
      pulse: '',
      height: '',
      weight: '',
      bmi: '',
      rvs: '',
      muac: '',
      heart_rate: '',
      isDisabled: false,
      bmiCategory: '',
      comment: '',
      date_of_birth: '',
      rvsOptions: ['-ve', '+ve', 'Not Done', 'Declined'],
      muacOptions: ['Green', 'Blue', 'Red'],
    };
  },
  computed: {
    admission() {
      return this.$store.state.admission.admission;
    },

    patient() {
      return this.$store.state.patient.currentPatient;
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

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.$store.dispatch('admission/fetchObservations', {
        id: this.$route.params.id,
      });
    },

    createObservation() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            temperature: this.temperature,
            systolic: this.systolic,
            diastolic: this.diastolic,
            spo2: this.spo2,
            respiration: this.respiration,
            pulse: this.pulse,
            height: this.height,
            weight: this.weight,
            bmi: this.bmi,
            rvs: this.rvs,
            muac: this.muac,
            heart_rate: this.heart_rate,
            comment: this.comment,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_observation_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('admission/createObservation', {
              id: this.$route.params.id,
              data: obj,
            })
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    calculateBMI() {
      this.bmi = (this.weight / this.height ** 2).toFixed(1);
    },

    initValues() {
      this.temperature = '';
      this.systolic = '';
      this.diastolic = '';
      this.spo2 = '';
      this.respiration = '';
      this.pulse = '';
      this.height = '';
      this.weight = '';
      this.bmi = '';
      this.rvs = '';
      this.muac = '';
      this.heart_rate = '';
      this.comment = '';
      this.bmiCategory = '';
    },

    categorizeBMI(value) {
      if (value < 18.5) return (this.bmiCategory = 'Underweight');
      if (value > 18.5 && value < 25) return (this.bmiCategory = 'Healthy weight');
      if (value > 25 && value < 30) return (this.bmiCategory = 'Over weight');
      if (value > 30 && value < 40) return (this.bmiCategory = 'Obese');
      if (value >= 40) return (this.bmiCategory = 'Severe Obesity');
    },

    BPValidation() {
      this.$validator.extend(
        'bp',
        {
          getMessage(field, params) {
            return `${field} should be less than ${params}`;
          },
          validate(value, [target]) {
            return +value < +target;
          },
        },
        {
          hasTarget: true,
        }
      );
    },

    fetchOneTriage(patientId) {
      this.$store.dispatch('triage/fetchOneTriage', { patientId }).then(response => {
        const res = response.data.data;
        this.height = res?.height;
      });
    },

    fetchAdmission() {
      this.$store
        .dispatch('admission/fetchAdmission', { admissionId: this.$route.params.id })
        .then(response => {
          const res = response.data.data;
          this.date_of_birth = dayjs().diff(res.patient.date_of_birth, 'weeks');
          this.fetchOneTriage(res.patient_id);
        });
    },
  },
  watch: {
    bmi(value) {
      this.categorizeBMI(+value);
    },
  },
  created() {
    this.BPValidation();
    this.fetchAdmission();
  },
};
</script>

<style scoped></style>
