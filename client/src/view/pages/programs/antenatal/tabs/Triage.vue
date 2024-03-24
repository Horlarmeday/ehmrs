<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-body">
      <triage-accordion />
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Height (cm):</label>
          <input
            v-validate="'required|between:0,2'"
            data-vv-validate-on="blur"
            name="height"
            @input="calculateBMI"
            type="number"
            class="form-control"
            v-model="height"
          />
          <span class="text-danger text-sm">{{ errors.first('height') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Weight (kg):</label>
          <input @input="calculateBMI" type="number" class="form-control" v-model="weight" />
        </div>
        <div class="col-lg-4">
          <label>BMI (kg/m²):</label>
          <input readonly type="number" class="form-control" v-model="body_mass_index" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Urinalysis (Protein):</label>
          <select class="form-control" v-model="urinalysis_protein">
            <option>+ve</option>
            <option>-ve</option>
            <option>++</option>
            <option>+++</option>
            <option>Trace</option>
          </select>
        </div>
        <div class="col-lg-4">
          <label>Urinalysis (Glucose):</label>
          <select class="form-control" v-model="urinalysis_glucose">
            <option>+ve</option>
            <option>-ve</option>
            <option>++</option>
            <option>+++</option>
            <option>Trace</option>
          </select>
        </div>
        <div class="col-lg-4">
          <label>BP (mmHg):</label>
          <input type="text" class="form-control" v-model="blood_pressure" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>RVST (rvs):</label>
          <select class="form-control" v-model="rvst">
            <option>+ve</option>
            <option>-ve</option>
            <option>Not Done</option>
            <option>Declined</option>
            <option>Trace</option>
          </select>
        </div>
        <div class="col-lg-4">
          <label>Pallor:</label>
          <input type="text" class="form-control" v-model="pallor" />
        </div>
        <div class="col-lg-4">
          <label>Maturity (wks):</label>
          <input type="text" class="form-control" v-model="maturity" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Fundal Height (cm):</label>
          <input type="number" class="form-control" v-model="fundal_height" />
        </div>
        <div class="col-lg-4">
          <label>Presentation:</label>
          <input type="text" class="form-control" v-model="presentation" />
        </div>
        <div class="col-lg-4">
          <label>Foetal Heart Rate (b/min):</label>
          <input type="text" class="form-control" v-model="foetal_heart_rate" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Oedema:</label>
          <input type="text" class="form-control" v-model="oedema" />
        </div>
        <div class="col-lg-4">
          <label>Comments:</label>
          <input type="text" class="form-control" v-model="comments" />
        </div>
        <div class="col-lg-4">
          <label>Next Appointment Date:</label>
          <datepicker input-class="form-control" v-model="next_appointment_date" />
        </div>
      </div>
      <div>
        <button
          @click="submitTriage"
          :disabled="isDisabled"
          ref="kt-antenatalTriage-submit"
          class="btn btn-primary float-right"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import TriageAccordion from '@/view/components/accordion/AntenatalTriageAccordion.vue';
export default {
  data: () => ({
    height: '',
    weight: '',
    body_mass_index: '',
    urinalysis_glucose: '',
    urinalysis_protein: '',
    pallor: '',
    blood_pressure: '',
    maturity: '',
    oedema: '',
    presentation: '',
    comments: '',
    next_appointment_date: '',
    foetal_heart_rate: '',
    fundal_height: '',
    rvst: '',
    isDisabled: false,
  }),
  components: {
    TriageAccordion,
    Datepicker,
  },
  computed: {
    triage() {
      return this.$store.state.antenatal.antenatal.triage;
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

    endRequest(submitButton) {
      this.initValues();
      this.removeSpinner(submitButton);
    },

    calculateBMI() {
      this.body_mass_index = (this.weight / this.height ** 2).toFixed(1);
    },

    initValues() {
      this.height = '';
      this.weight = '';
      this.body_mass_index = '';
      this.urinalysis_glucose = '';
      this.urinalysis_protein = '';
      this.pallor = '';
      this.blood_pressure = '';
      this.maturity = '';
      this.oedema = '';
      this.presentation = '';
      this.comments = '';
      this.next_appointment_date = '';
      this.foetal_heart_rate = '';
      this.fundal_height = '';
      this.rvst = '';
    },

    submitTriage() {
      const obj = {
        height: this.height,
        weight: this.weight,
        body_mass_index: this.body_mass_index,
        urinalysis_glucose: this.urinalysis_glucose,
        urinalysis_protein: this.urinalysis_protein,
        pallor: this.pallor,
        blood_pressure: this.blood_pressure,
        maturity: this.maturity,
        oedema: this.oedema,
        presentation: this.presentation,
        comments: this.comments,
        next_appointment_date: this.next_appointment_date,
        foetal_heart_rate: this.foetal_heart_rate,
        fundal_height: this.fundal_height,
        rvst: this.rvst,
        visit_id: this.$route.params.id,
      };
      const emptyValues = Object.values(obj).every(
        value => value === null || value === undefined || value === ''
      );
      if (emptyValues) {
        return this.$notify({
          group: 'foo',
          text: 'At least one field should be filled',
          type: 'error',
          title: 'Error Message',
        });
      }

      const submitButton = this.$refs['kt-antenatalTriage-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('antenatal/createTriage', { data: obj, id: this.$route.query.antenatal })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped></style>
