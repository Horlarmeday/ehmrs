<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-body">
      <postnatal-accordion />
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Blood Pressure</label>
          <input
            name="blood_pressure"
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="text"
            class="form-control"
            v-model="blood_pressure"
          />
          <span class="form-text text-danger">{{ errors.first('blood_pressure') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Temperature</label>
          <input
            name="temperature"
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="text"
            class="form-control"
            v-model="temperature"
          />
          <span class="form-text text-danger">{{ errors.first('temperature') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Weight</label>
          <input
            name="weight"
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="number"
            class="form-control"
            v-model="weight"
          />
          <span class="form-text text-danger">{{ errors.first('weight') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Pulse</label>
          <input type="text" class="form-control" v-model="pulse" />
        </div>
        <div class="col-lg-4">
          <label>Respiration</label>
          <input type="text" class="form-control" v-model="respiration" />
        </div>
        <div class="col-lg-4">
          <label>General Condtion</label>
          <input type="text" class="form-control" v-model="general_condition" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Involution of Uterus</label>
          <input type="text" class="form-control" v-model="involution_of_uterus" />
        </div>
        <div class="col-lg-4">
          <label>Lochia</label>
          <input type="text" class="form-control" v-model="lochia" />
        </div>
        <div class="col-lg-4">
          <label>Episotomy/Operation Scar</label>
          <input type="text" class="form-control" v-model="episotomy" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Pelvic Examination</label>
          <input type="text" class="form-control" v-model="pelvic_examination" />
        </div>
        <div class="col-lg-4">
          <label>Result</label>
          <input type="text" class="form-control" v-model="result" />
        </div>
        <div class="col-lg-4">
          <label>Pap Smear Date</label>
          <b-form-datepicker v-model="pap_smear_date" locale="en" required />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>PCV</label>
          <input type="text" class="form-control" v-model="pcv" />
        </div>
        <div class="col-lg-4">
          <label>Baby's Condition</label>
          <input type="text" class="form-control" v-model="baby_condition" />
        </div>
        <div class="col-lg-4">
          <label>Reflexes</label>
          <input type="text" class="form-control" v-model="reflexes" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Feeding</label>
          <input type="text" class="form-control" v-model="feeding" />
        </div>
        <div class="col-lg-4">
          <label>Umbilical Cord</label>
          <input type="text" class="form-control" v-model="umbilical_cord" />
        </div>
      </div>
      <div>
        <button
          @click="createPostnatal"
          :disabled="isDisabled"
          ref="kt-postnatal-submit"
          class="btn btn-primary float-right"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import PostnatalAccordion from '@/view/components/accordion/PostnatalAccordion.vue';
export default {
  data: () => ({
    blood_pressure: '',
    temperature: '',
    weight: '',
    umbilical_cord: '',
    result: '',
    pcv: '',
    baby_condition: '',
    feeding: '',
    reflexes: '',
    episotomy: '',
    pap_smear_date: '',
    pelvic_examination: '',
    lochia: '',
    involution_of_uterus: '',
    pulse: '',
    respiration: '',
    general_condition: '',
    isDisabled: false,
  }),
  components: {
    PostnatalAccordion,
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
      this.$store.dispatch('admission/fetchPostNatalInfo', { id: this.$route.params.id });
    },

    initValues() {
      this.blood_pressure = '';
      this.temperature = '';
      this.weight = '';
      this.umbilical_cord = '';
      this.result = '';
      this.pcv = '';
      this.baby_condition = '';
      this.feeding = '';
      this.reflexes = '';
      this.episotomy = '';
      this.pap_smear_date = '';
      this.pelvic_examination = '';
      this.lochia = '';
      this.involution_of_uterus = '';
      this.pulse = '';
      this.respiration = '';
      this.general_condition = '';
    },

    createPostnatal() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            blood_pressure: this.blood_pressure,
            temperature: this.temperature,
            weight: this.weight,
            umbilical_cord: this.umbilical_cord,
            result: this.result,
            pcv: this.pcv,
            baby_condition: this.baby_condition,
            feeding: this.feeding,
            reflexes: this.reflexes,
            episotomy: this.episotomy,
            pap_smear_date: this.pap_smear_date,
            pelvic_examination: this.pelvic_examination,
            lochia: this.lochia,
            involution_of_uterus: this.involution_of_uterus,
            pulse: this.pulse,
            respiration: this.respiration,
            general_condition: this.general_condition,
          };

          const submitButton = this.$refs['kt-postnatal-submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('admission/createPostNatalInfo', {
              data: obj,
              id: this.$route.params.id,
            })
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },
  },
};
</script>

<style scoped></style>
