<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-body">
      <immunization-accordion heading="At 2 Years" :medication="at2years" />
      <div class="mt-lg-5">
        <div class="form-group row">
          <label class="col-lg-3 col-form-label">Weight</label>
          <div class="col-lg-8">
            <input
              v-validate="'required'"
              data-vv-validate-on="blur"
              type="text"
              class="form-control form-control-sm"
              placeholder="Weight"
              v-model="weight"
              name="weight"
            />
            <span class="text-danger text-sm">{{ errors.first('weight') }}</span>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-lg-3 col-form-label">Medications:</label>
          <div class="col-lg-8">
            <v-select
              v-model="medications_at_2_years"
              :options="['BCG', 'HBV O', 'Vit A mum', 'OPV O']"
              multiple
            />
          </div>
        </div>
        <div>
          <button
            class="mt-3 btn btn-primary"
            @click="updateAt2Years"
            :disabled="isDisabled || !isEmpty(at2years)"
            ref="kt_at2years_submit"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import vSelect from 'vue-select';
import { isEmpty, parseJwt } from '@/common/common';
import ImmunizationAccordion from '@/view/components/accordion/ImmunizationAccordion.vue';

export default {
  components: { ImmunizationAccordion, vSelect },
  props: {
    at2years: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  data: () => ({
    isDisabled: false,
    weight: '',
    medications_at_2_years: '',
  }),
  methods: {
    isEmpty,
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
      this.$store.dispatch(
        'immunization/fetchOneImmunizationAccount',
        this.$route.query.immunization
      );
    },

    updateAt2Years() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            data: {
              at_two_years: {
                weight: this.weight,
                medications: this.medications_at_2_years,
                createdAt: new Date(),
                staff: {
                  fullname: parseJwt(localStorage.getItem('user_token'))?.fullname,
                },
              },
            },
            id: this.$route.query.immunization,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_at2years_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('immunization/updateImmunizationAccount', obj)
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    initValues() {
      this.weight = '';
      this.medications_at_2_years = '';
      this.isDisabled = false;
    },
  },
};
</script>

<style scoped></style>
