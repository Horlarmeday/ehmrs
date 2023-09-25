<template>
  <div class="card card-custom gutter-b">
    <div class="card-header">
      <h3 class="card-title">
        <span class="card-label font-weight-bolder text-dark">Information Update</span>
      </h3>
    </div>
    <div class="card-body">
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Gravida:</label>
          <input
            type="text"
            class="form-control"
            v-model="gravida"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="gravida"
          />
          <span class="text-danger text-sm">{{ errors.first('gravida') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Parity:</label>
          <input
            type="text"
            class="form-control"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="parity"
            v-model="parity"
          />
          <span class="text-danger text-sm">{{ errors.first('parity') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Last Menstrual Period:</label>
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text"><i class="la la-calendar-alt"></i></span>
            </div>
            <input
              type="date"
              name="last_menses_period"
              v-model="last_menses_period"
              @change="pregnancyCalc"
              class="form-control"
              v-validate="'required'"
              data-vv-validate-on="blur"
            />
          </div>
          <span class="text-danger text-sm">{{ errors.first('last_menses_period') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Expected Delivery Date:</label>
          <input
            type="text"
            class="form-control"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="estimated_delivery_date"
            v-model="estimated_delivery_date"
            readonly
          />
          <span class="text-danger text-sm">{{ errors.first('estimated_delivery_date') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Estimated Conception Time:</label>
          <input
            type="text"
            class="form-control"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="estimated_concept_time"
            v-model="estimated_concept_time"
            readonly
          />
          <span class="text-danger text-sm">{{ errors.first('estimated_concept_time') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Fetal Age:</label>
          <input
            type="text"
            name="fetal_age"
            v-model="fetal_age"
            class="form-control"
            v-validate="'required'"
            data-vv-validate-on="blur"
            readonly
          />

          <span class="text-danger text-sm">{{ errors.first('fetal_age') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Medical History:</label>
          <input
            type="text"
            class="form-control"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="medical_history"
            v-model="medical_history"
          />
          <span class="text-danger text-sm">{{ errors.first('medical_history') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Surgical History:</label>
          <input
            type="text"
            class="form-control"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="surgical_history"
            v-model="surgical_history"
          />
          <span class="text-danger text-sm">{{ errors.first('surgical_history') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Obstetric History:</label>
          <input
            type="text"
            v-model="obstetric_history"
            class="form-control"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="obstetric_history"
          />

          <span class="text-danger text-sm">{{ errors.first('obstetric_history') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-4">
          <label>Blood Transfusion History:</label>
          <input
            type="text"
            class="form-control"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="blood_transfusion"
            v-model="blood_transfusion"
          />
          <span class="text-danger text-sm">{{ errors.first('blood_transfusion') }}</span>
        </div>
        <div class="col-lg-4">
          <label>Family History:</label>
          <v-select
            v-model="family_history"
            :options="['Twins', 'Tuberculosis', 'Diabetes', 'Hypertension']"
            multiple
          />
        </div>
        <div class="col-lg-4">
          <label>For Whom:</label>
          <input type="text" v-model="for_whom" class="form-control" />
        </div>
      </div>
      <section-title text="Previous Pregnancies" />
      <div class="form-group row" v-for="(pregnancy, i) in pregnancies" :key="i">
        <div class="col-lg-3">
          <label>Year</label>
          <select v-model="pregnancy.year" class="form-control">
            <option disabled>Select Year</option>
            <option v-for="(year, i) in years" :key="i">{{ year }}</option>
          </select>
        </div>
        <div class="col-lg-3">
          <label>Delivery Place</label>
          <input type="text" class="form-control" v-model="pregnancy.delivery_place" />
        </div>
        <div class="col-lg-3">
          <label>Maturity</label>
          <select v-model="pregnancy.maturity" class="form-control">
            <option>Term</option>
            <option>Preterm</option>
            <option>Post Date</option>
          </select>
        </div>
        <div class="col-lg-3">
          <label>Type of Delivery</label>
          <select v-model="pregnancy.delivery_type" class="form-control">
            <option>CS</option>
            <option>SVD</option>
          </select>
        </div>
        <div class="col-lg-3">
          <label>Labor Duration</label>
          <select
            v-if="pregnancy.delivery_type === 'SVD' || !pregnancy.delivery_type"
            v-model="pregnancy.duration"
            class="form-control"
          >
            <option>Less than 6 Hours</option>
            <option>More than 6 Hours</option>
          </select>
          <select v-else v-model="pregnancy.duration" class="form-control">
            <option>Emergency</option>
            <option>Elective</option>
          </select>
        </div>
        <div class="col-lg-3">
          <label>Weight</label>
          <input type="number" class="form-control" v-model="pregnancy.weight" />
        </div>
        <div class="col-lg-3">
          <label>Gender</label>
          <select v-model="pregnancy.sex" class="form-control">
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div class="col-lg-3">
          <label>Fate</label>
          <select v-model="pregnancy.fate" class="form-control">
            <option>Stillbirth</option>
            <option>Alive</option>
            <option>Dead</option>
            <option>IUFD</option>
          </select>
        </div>
        <div class="col-lg-3">
          <label>Babe Type</label>
          <select v-model="pregnancy.baby_type" class="form-control">
            <option>Singleton</option>
            <option>Multiple</option>
          </select>
        </div>
        <div class="col-lg-3">
          <label>Puerperium</label>
          <input type="text" class="form-control" v-model="pregnancy.puerperium" />
        </div>
        <div class="col-lg-2">
          <button
            v-if="i !== 0"
            @click="removePregnancy(i)"
            style="margin-top: 25px"
            class="btn font-weight-bold btn-danger btn-icon"
          >
            <i class="la la-remove"></i>
          </button>
        </div>
        <div class="col-lg-12">
          <div class="separator separator-solid mt-5" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col">
          <div @click="addPreviousPregnancy" class="btn font-weight-bold btn-light-primary">
            <i class="la la-plus"></i>
            Add
          </div>
        </div>
      </div>
      <div>
        <button
          @click="accountUpdate"
          :disabled="isDisabled"
          ref="kt_antenatal_submit"
          class="btn btn-primary float-right"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import SectionTitle from '@/utils/SectionTitle.vue';
import Swal from 'sweetalert2';
import { isContainEmptyValues } from '@/common/common';

export default {
  data: () => ({
    isDisabled: false,
    gravida: '',
    parity: '',
    last_menses_period: '',
    fetal_age: '',
    estimated_concept_time: '',
    estimated_delivery_date: '',
    obstetric_history: '',
    surgical_history: '',
    medical_history: '',
    family_history: '',
    for_whom: '',
    blood_transfusion: '',
    pregnancies: [
      {
        year: '',
        delivery_place: '',
        maturity: '',
        duration: '',
        delivery_type: '',
        weight: '',
        sex: '',
        fate: '',
        baby_type: '',
        puerperium: '',
      },
    ],
    years: [],
  }),

  components: {
    SectionTitle,
    vSelect,
  },

  created() {
    this.getYears(1990);
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

    isValidDate(dateStr) {
      // Checks for the following valid date formats:
      // yyyy-mm-dd
      const datePat = /^\d{4}-\d{2}-\d{2}$/; // requires 4 digit year
      const matchArray = dateStr.match(datePat); // is the format ok?
      if (matchArray == null) {
        this.$notify({
          group: 'foo',
          type: 'error',
          title: 'Error!',
          text: 'Date is not in a valid format.',
        });
        return false;
      }
      const month = matchArray[1]; // parse date into variables
      const day = matchArray[3];
      const year = matchArray[4];
      if (month < 1 || month > 12) {
        // check month range
        this.$notify({
          group: 'foo',
          type: 'error',
          title: 'Error!',
          text: 'Month must be between 1 and 12.',
        });
        return false;
      }

      if (day < 1 || day > 31) {
        this.$notify({
          group: 'foo',
          type: 'error',
          title: 'Error!',
          text: 'Day must be between 1 and 31.',
        });
        return false;
      }

      if ((month === 4 || month === 6 || month === 9 || month === 11) && day === 31) {
        this.$notify({
          group: 'foo',
          type: 'error',
          title: 'Error!',
          text: 'Month ' + month + " doesn't have 31 days!",
        });
        return false;
      }
      if (month === 2) {
        // check for february 29th
        const isLeap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        if (day > 29 || (day === 29 && !isLeap)) {
          this.$notify({
            group: 'foo',
            type: 'error',
            title: 'Error!',
            text: 'February ' + year + " doesn't have " + day + ' days!',
          });
          return false;
        }
      }
      return true;
    },

    localeDisplayDate(dateObj) {
      let month = dateObj.getMonth() + 1;
      month = month < 10 ? '0' + month : month;

      let day = dateObj.getDate();
      day = day < 10 ? '0' + day : day;

      let year = dateObj.getYear();
      if (year < 2000) year += 1900;
      return `${day}/${month}/${year}`;
    },

    pregnancyCalc() {
      let lmp = this.last_menses_period;
      const menstrual = new Date(); // creates new date objects
      const ovulation = new Date();
      const dueDate = new Date();
      const today = new Date();
      let cycle = 28;
      let luteal = 14;

      if (this.isValidDate(lmp)) {
        // Validates menstrual date
        const menstrualInput = new Date(lmp);
        menstrual.setTime(menstrualInput.getTime());
      } else return false; // otherwise exits

      // sets ovulation date to menstrual date + cycle days - luteal days
      // the '*86400000' is necessary because date objects track time
      // in milliseconds;  86400000 milliseconds equals one day
      ovulation.setTime(menstrual.getTime() + cycle * 86400000 - luteal * 86400000);
      this.estimated_concept_time = this.localeDisplayDate(ovulation);

      // sets due date to ovulation date plus 266 days
      dueDate.setTime(ovulation.getTime() + 266 * 86400000);
      this.estimated_delivery_date = this.localeDisplayDate(dueDate);

      // sets fetal age to 14 + 266 (pregnancy time) - time left
      let fetalAge = 14 + 266 - (dueDate - today) / 86400000;
      const weeks = parseInt(fetalAge / 7); // sets weeks to whole number of weeks
      const days = Math.floor(fetalAge % 7); // sets days to the whole number remainder

      // fetal age message, automatically includes 's' on week and day if necessary
      fetalAge =
        weeks + ' week' + (weeks > 1 ? 's' : '') + ', ' + days + ' day' + (days > 1 ? 's' : '');

      this.fetal_age = fetalAge;

      return false;
    },

    getYears(startYear) {
      const currentYear = new Date().getFullYear();
      while (startYear <= currentYear) {
        this.years.push(startYear++);
      }
    },

    addPreviousPregnancy() {
      this.pregnancies.push({
        year: '',
        delivery_place: '',
        maturity: '',
        duration: '',
        delivery_type: '',
        weight: '',
        sex: '',
        fate: '',
        baby_type: '',
        puerperium: '',
      });
    },

    removePregnancy(index) {
      this.pregnancies.splice(index, 1);
    },

    displayPrompt() {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Patient does not have record of previous pregnancies?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Continue!',
        cancelButtonText: 'No, cancel!',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return this.finishAccountUpdate();
        },
      });
    },

    endRequest(submitButton) {
      this.$emit('accountUpdated');
      this.initValues();
      this.removeSpinner(submitButton);
    },

    initValues() {
      this.gravida = '';
      this.parity = '';
      this.last_menses_period = '';
      this.fetal_age = '';
      this.estimated_concept_time = '';
      this.estimated_delivery_date = '';
      this.obstetric_history = '';
      this.surgical_history = '';
      this.medical_history = '';
      this.family_history = '';
      this.for_whom = '';
      this.blood_transfusion = '';
      this.pregnancies = [
        {
          year: '',
          delivery_place: '',
          maturity: '',
          duration: '',
          delivery_type: '',
          weight: '',
          sex: '',
          fate: '',
          baby_type: '',
          puerperium: '',
        },
      ];
    },

    accountUpdate() {
      this.$validator.validateAll().then(result => {
        if (result) {
          if (isContainEmptyValues(this.pregnancies)) return this.displayPrompt();
          this.finishAccountUpdate();
        }
      });
    },

    convertStringToDate(dateString) {
      const [day, month, year] = dateString.split('/').map(Number);
      // JavaScript's months are 0-indexed, so we subtract 1 from the month
      const jsMonth = month - 1;
      // Create a Date object
      return new Date(year, jsMonth, day);
    },

    finishAccountUpdate() {
      const obj = {
        gravida: this.gravida,
        parity: this.parity,
        last_menses_period: new Date(this.last_menses_period),
        fetal_age: this.fetal_age,
        estimated_concept_time: this.convertStringToDate(this.estimated_concept_time),
        estimated_delivery_date: this.convertStringToDate(this.estimated_delivery_date),
        obstetric_history: this.obstetric_history,
        surgical_history: this.surgical_history,
        medical_history: this.medical_history,
        family_history: this.family_history,
        for_whom: this.for_whom,
        blood_transfusion_history: this.blood_transfusion,
        ...(this.pregnancies.some(preg => preg.year) && { pregnancies: this.pregnancies }),
      };
      // set spinner to submit button
      const submitButton = this.$refs['kt_antenatal_submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('antenatal/updateAccount', { data: obj, id: this.$route.query.antenatal })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped></style>
