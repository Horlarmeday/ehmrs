<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card card-custom gutter-b">
      <div class="card-header pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Vitals</span>
        </h3>
      </div>
      <div class="card-body">
        <div class="form-group row">
          <label class="col-lg-2 col-form-label">Height</label>
          <div class="col-lg-2">
            <input @keyup="calculateBMI" v-model="height" type="number" class="form-control form-control-sm" />
          </div>
          <label class="col-lg-1 col-form-label">Weight</label>
          <div class="col-lg-2">
            <input @keyup="calculateBMI" v-model="weight" type="number" class="form-control form-control-sm" />
          </div>
          <label class="col-lg-1 col-form-label">BMI</label>
          <div class="col-lg-2">
            <input v-model="bmi" type="number" class="form-control form-control-sm" readonly />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-2 col-form-label">Pulse (b/min*)</label>
          <div class="col-6">
            <input
              v-validate="'required'"
              data-vv-validate-on="blur"
              class="form-control form-control-sm"
              type="text"
              v-model="pulse"
              name="pulse"
            />
            <span class="text-danger text-sm">{{ errors.first("pulse") }}</span>
          </div>
          <label class="col-lg-2 col-form-label">(72 - 72)</label>
        </div>
        <hr />
        <h5 class="text-primary">Blood Pressure</h5>
        <div class="form-group row">
          <label class="col-2 col-form-label">Systolic (b/min*)</label>
          <div class="col-6">
            <input
              class="form-control form-control-sm"
              type="text"
              v-model="systolic"
              name="systolic"
            />
          </div>
          <label class="col-lg-2 col-form-label">(110 - 140)</label>
        </div>
        <div class="form-group row">
          <label class="col-2 col-form-label">Diastolic (mmHg*)</label>
          <div class="col-6">
            <input
              class="form-control form-control-sm"
              type="text"
              v-model="diastolic"
            />
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
            <span class="text-danger text-sm">{{
              errors.first("temperature")
            }}</span>
          </div>
          <label class="col-lg-2 col-form-label">(32 - 37)</label>
        </div>
        <div class="form-group row">
          <label class="col-2 col-form-label">Respiration (C/min*)</label>
          <div class="col-6">
            <input
              class="form-control form-control-sm"
              type="text"
              v-model="respiration"
            />
          </div>
          <label class="col-lg-2 col-form-label">(16 - 20)</label>
        </div>
        <div class="form-group row">
          <label class="col-2 col-form-label">SPO2 (%)</label>
          <div class="col-6">
            <input
              class="form-control form-control-sm"
              type="text"
              v-model="spo2"
            />
          </div>
          <label class="col-lg-2 col-form-label">(>70)</label>
        </div>
        <div>
          <button
            @click="createVitals"
            :disabled="isDisabled"
            ref="kt_triage_submit"
            class="btn btn-primary float-right"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Vitals",
  data() {
    return {
      temperature: "",
      systolic: "",
      diastolic: "",
      spo2: "",
      respiration: "",
      pulse: "",
      height: "",
      weight: "",
      bmi: "",
      isDisabled: false
    };
  },
  methods: {
    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add("spinner", "spinner-light", "spinner-right");
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove(
        "spinner",
        "spinner-light",
        "spinner-right"
      );
    },

    initializeRequest(button) {
      this.removeSpinner(button);
      this.initValues();
    },

    createVitals() {
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
            bmi: this.bmi
          };
          // set spinner to submit button
          const submitButton = this.$refs["kt_triage_submit"];
          this.addSpinner(submitButton);

          this.$store
            .dispatch("triage/addTriage", {
              visit_id: this.$route.params.id,
              triage: obj
            })
            .then(() => this.initializeRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    calculateBMI() {
      this.bmi = this.weight / this.height ** 2;
    },

    initValues() {
      this.temperature = "";
      this.systolic = "";
      this.diastolic = "";
      this.spo2 = "";
      this.respiration = "";
      this.pulse = "";
      this.height = "";
      this.weight = "";
      this.bmi = "";
      this.isDisabled = false;
    }
  }
};
</script>

<style scoped></style>
