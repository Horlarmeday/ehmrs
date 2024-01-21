<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-body">
      <delivery-accordion />
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Mode of Delivery</label>
          <select
            name="mode_of_delivery"
            v-validate="'required'"
            data-vv-validate-on="blur"
            class="form-control"
            v-model="mode_of_delivery"
          >
            <option>CS</option>
            <option>SVD</option>
          </select>
          <span class="form-text text-danger">{{ errors.first('mode_of_delivery') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Date of Delivery</label>
          <b-form-datepicker
            v-model="date_of_delivery"
            class="form-control"
            name="date_of_delivery"
            v-validate="'required'"
            data-vv-validate-on="blur"
            required
          />
          <span class="form-text text-danger">{{ errors.first('date_of_delivery') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Time of Delivery</label>
          <b-form-timepicker
            name="time_of_delivery"
            v-validate="'required'"
            data-vv-validate-on="blur"
            v-model="time_of_delivery"
            locale="en"
            required
          />
          <span class="form-text text-danger">{{ errors.first('time_of_delivery') }}</span>
        </div>
        <div v-if="mode_of_delivery === 'CS'" class="col-lg-4">
          <label>Time Patient Left Theater</label>
          <b-form-timepicker v-model="time_surgery_ended" locale="en" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Quantity Blood Loss</label>
          <input type="text" class="form-control" v-model="blood_loss_quantity" />
        </div>
        <div class="col-lg-4">
          <label>Duration</label>
          <select class="form-control" v-model="duration">
            <option>Less than 6 Hours</option>
            <option>More than 6 Hours</option>
          </select>
        </div>
        <div class="col-lg-4">
          <label>Condition of Mother</label>
          <input type="text" class="form-control" v-model="condition_of_mother" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Apgar Score at 1min</label>
          <input type="text" class="form-control" v-model="apgar_one_min" />
        </div>
        <div class="col-lg-4">
          <label>Apgar Score at 5min</label>
          <input type="text" class="form-control" v-model="apgar_five_min" />
        </div>
        <div class="col-lg-4">
          <label>Apgar Score at 10min</label>
          <input type="text" class="form-control" v-model="apgar_ten_min" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Birth Weight</label>
          <input type="number" class="form-control" v-model="birth_weight" />
        </div>
        <div class="col-lg-4">
          <label>Sex</label>
          <select class="form-control" v-model="sex">
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div class="col-lg-4">
          <label>Condition of Baby</label>
          <input type="text" class="form-control" v-model="condition_of_baby" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Vitamin A: 200,000 IU to Mother</label>
          <input type="text" class="form-control" v-model="vitaminA_IU" />
        </div>
        <div class="col-lg-4">
          <label>Nevirapine to Baby</label>
          <input type="text" class="form-control" v-model="nevirapine" />
        </div>
        <div class="col-lg-4">
          <label>Nature of Liquor</label>
          <input type="text" class="form-control" v-model="nature_of_liquor" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>BCG</label>
          <input type="text" class="form-control" v-model="bcg" />
        </div>
        <div class="col-lg-4">
          <label>OPVO</label>
          <input type="text" class="form-control" v-model="opvo" />
        </div>
        <div class="col-lg-4">
          <label>HBV</label>
          <input type="text" class="form-control" v-model="hbv" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Baby Immunization Date</label>
          <b-form-datepicker v-model="baby_immunization_date" class="form-control" required />
        </div>
        <div class="col-lg-4">
          <label>Comments</label>
          <textarea class="form-control" v-model="comments" cols="30" rows="5"></textarea>
        </div>
      </div>
      <div>
        <button
          @click="createDelivery"
          :disabled="isDisabled"
          ref="kt-deliveryInfo-submit"
          class="btn btn-primary float-right"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import DeliveryAccordion from '@/view/components/accordion/DeliveryAccordion.vue';
import dayjs from 'dayjs';
export default {
  data: () => ({
    mode_of_delivery: '',
    date_of_delivery: '',
    time_of_delivery: '',
    blood_loss_quantity: '',
    duration: '',
    condition_of_mother: '',
    condition_of_baby: '',
    apgar_one_min: '',
    apgar_five_min: '',
    apgar_ten_min: '',
    baby_immunization_date: '',
    bcg: '',
    opvo: '',
    hbv: '',
    comments: '',
    nature_of_liquor: '',
    nevirapine: '',
    vitaminA_IU: '',
    birth_weight: '',
    sex: '',
    time_surgery_ended: '',
    isDisabled: false,
  }),
  components: {
    DeliveryAccordion,
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
      this.$store.dispatch('antenatal/fetchDeliveryInfo', { id: this.$route.query.antenatal });
    },

    initValues() {
      this.mode_of_delivery = '';
      this.date_of_delivery = '';
      this.time_of_delivery = '';
      this.blood_loss_quantity = '';
      this.duration = '';
      this.condition_of_mother = '';
      this.condition_of_baby = '';
      this.apgar_one_min = '';
      this.apgar_five_min = '';
      this.apgar_ten_min = '';
      this.baby_immunization_date = '';
      this.bcg = '';
      this.opvo = '';
      this.hbv = '';
      this.comments = '';
      this.nature_of_liquor = '';
      this.nevirapine = '';
      this.vitaminA_IU = '';
      this.birth_weight = '';
      this.sex = '';
      this.time_surgery_ended = '';
    },

    createDelivery() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const date = `${dayjs(this.date_of_delivery).format('YYYY-MM-DD')} ${
            this.time_of_delivery
          }`;
          const obj = {
            mode_of_delivery: this.mode_of_delivery,
            date_of_delivery: new Date(date),
            ...(this.time_surgery_ended && {
              time_surgery_ended: new Date(
                `${dayjs().format('YYYY-MM-DD')} ${this.time_surgery_ended}`
              ),
            }),
            blood_loss_quantity: this.blood_loss_quantity,
            duration: this.duration,
            condition_of_mother: this.condition_of_mother,
            condition_of_baby: this.condition_of_baby,
            apgar_one_min: this.apgar_one_min,
            apgar_five_min: this.apgar_five_min,
            apgar_ten_min: this.apgar_ten_min,
            baby_immunization_date: this.baby_immunization_date,
            bcg: this.bcg,
            opvo: this.opvo,
            hbv: this.hbv,
            comments: this.comments,
            nature_of_liquor: this.nature_of_liquor,
            nevirapine: this.nevirapine,
            vitaminA_IU: this.vitaminA_IU,
            birth_weight: this.birth_weight,
            sex: this.sex,
            visit_id: this.$route.params.id,
          };

          const submitButton = this.$refs['kt-deliveryInfo-submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('antenatal/createDeliveryInfo', {
              data: obj,
              id: this.$route.query.antenatal,
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
