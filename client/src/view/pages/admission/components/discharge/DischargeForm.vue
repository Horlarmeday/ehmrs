<template>
  <div>
    <div class="form-group row">
      <div class="col-lg-6">
        <label>Type</label>
        <select
          name="ward"
          v-validate="'required'"
          data-vv-validate-on="blur"
          v-model="discharge_type"
          class="form-control form-control-sm"
        >
          <option :value="type" v-for="(type, i) in dischargeTypes" :key="i">
            {{ type }}
          </option>
        </select>
        <span class="text-danger text-sm">{{ errors.first('discharge_type') }}</span>
      </div>
      <div class="col-lg-6">
        <label>Date Discharged</label>
        <b-form-datepicker
          v-model="date_discharged"
          class="form-control form-control-sm"
          name="date_of_visit"
          v-validate="'required'"
          data-vv-validate-on="blur"
          required
        />
        <span class="text-danger text-sm">{{ errors.first('date_discharged') }}</span>
      </div>
    </div>
    <div class="form-group row">
      <div class="col-lg-6">
        <label>Time Discharged </label>
        <b-form-timepicker
          name="time_discharged"
          v-validate="'required'"
          data-vv-validate-on="blur"
          v-model="time_discharged"
          locale="en"
          required
        />
        <span class="form-text text-danger">{{ errors.first('time_discharged') }}</span>
      </div>
      <div class="col-lg-6">
        <label>Conditions of Patient</label>
        <textarea
          name="conditions_of_patient"
          v-validate="'required'"
          data-vv-validate-on="blur"
          v-model="conditions_of_patient"
          class="form-control form-control-sm"
          cols="30"
          rows="2"
        />
        <span class="form-text text-danger">{{ errors.first('conditions_of_patient') }}</span>
      </div>
    </div>
    <div class="form-group row">
      <div v-if="typesToDisplay.includes(discharge_type)" class="col-lg-6">
        <label>{{ discharge_type }} Location</label>
        <input type="text" class="form-control-sm form-control" v-model="transfer_location" />
      </div>
    </div>
    <div>
      <button
        @click="dischargePatient"
        ref="kt_dischargePatient_submit"
        :disabled="isDisabled || emptyFields"
        class="btn btn-primary"
      >
        Submit
      </button>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({
    discharge_type: '',
    date_discharged: '',
    time_discharged: '',
    conditions_of_patient: '',
    transfer_location: '',
    dischargeTypes: ['', 'Absconded', 'Death', 'Discharge', 'Lama', 'Refer', 'Transfer'],
    isDisabled: false,
    typesToDisplay: ['Refer', 'Transfer'],
  }),
  computed: {
    emptyFields() {
      return (
        !this.discharge_type ||
        !this.date_discharged ||
        !this.time_discharged ||
        !this.conditions_of_patient
      );
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
      this.$store.dispatch('admission/fetchDischargeRecord', {
        id: this.$route.params.id,
      });
    },

    dischargePatient() {
      const date = `${this.date_discharged} ${this.time_discharged}`;
      const obj = {
        discharge_type: this.discharge_type,
        date_discharged: new Date(date),
        conditions_of_patient: this.conditions_of_patient,
        transfer_location: this.transfer_location,
      };
      // set spinner to submit button
      const submitButton = this.$refs['kt_dischargePatient_submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('admission/dischargePatient', {
          id: this.$route.params.id,
          data: obj,
        })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    initValues() {
      this.discharge_type = '';
      this.date_discharged = '';
      this.time_discharged = '';
      this.transfer_location = '';
      this.conditions_of_patient = '';
      this.isDisabled = false;
    },
  },
};
</script>

<style scoped></style>
