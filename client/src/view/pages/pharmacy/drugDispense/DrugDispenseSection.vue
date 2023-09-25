<template>
  <div>
    <div class="accordion accordion-toggle-arrow" id="accordionExample1">
      <div class="card" v-for="(prescription, i) in prescriptions" :key="i">
        <div class="card-header">
          <div class="card-title" v-b-toggle="`collapse-${i}`">
            <span class="mr-5 text-black-50">Drug Name.:</span>
            <span class="mr-5 text-dark">{{ prescription.drug_name }}</span>

            <span class="mr-3 text-black-50">Drug Type.:</span
            ><span class="text-dark mr-5">{{ prescription.drug_type }}</span>

            <span class="mr-3 text-black-50">Status.:</span>
            <span :class="getStatusColor(status)" class="label label-pill label-inline mr-2">{{
              status
            }}</span>
          </div>
        </div>
        <div>
          <b-collapse visible :id="`collapse-${i}`">
            <b-card>
              <drug-info-banner :prescription="prescription" />
              <div class="form-group row">
                <div class="col-lg-6">
                  <label>Dispense</label>
                  <div class="input-group">
                    <input
                      :disabled="!prescription.quantity_remaining"
                      type="number"
                      class="form-control"
                      v-model="prescription.quantity_remaining_to_dispense"
                      aria-label="Quantity to Dispense"
                    />
                    <div class="input-group-append">
                      <span class="input-group-text">of</span>
                      <span class="input-group-text"
                        >{{ prescription.quantity_remaining }}
                        {{ prescription.dosage_form.name }}</span
                      >
                      <button
                        :disabled="isDisabled || !prescription.quantity_remaining"
                        class="btn btn-primary"
                        ref="kt_dispense_submit"
                        @click="dispenseDrug(prescription, i)"
                      >
                        Dispense
                      </button>
                    </div>
                  </div>
                </div>
                <div class="col-lg-6">
                  <label>Return to Dispensary</label>
                  <div class="input-group">
                    <label class="checkbox mr-3 checkbox-lg">
                      <input
                        v-b-tooltip.hover
                        title="Enable if result is referred"
                        type="checkbox"
                        class="mr-2"
                        :checked="prescription.disabledReturn"
                        @change="toggleCheck(prescription, $event, i)"
                      />
                      <span></span>
                    </label>
                    <input
                      :disabled="!prescription.disabledReturn"
                      type="number"
                      v-model="prescription.quantity_to_return"
                      class="form-control"
                      aria-label="Quantity to return"
                    />
                    <div class="input-group-append">
                      <span class="input-group-text">of</span>
                      <span class="input-group-text"
                        >{{ prescription.quantity_prescribed }}
                        {{ prescription.strength.name }}</span
                      >
                      <button
                        ref="kt_return_submit"
                        @click="returnDrug(prescription, i)"
                        :disabled="isDisabled || !prescription.disabledReturn"
                        class="btn btn-primary"
                      >
                        Return
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </b-card>
          </b-collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DrugInfoBanner from '@/view/pages/pharmacy/drugDispense/DrugInfoBanner.vue';

export default {
  name: 'DrugDispenseSection',
  components: { DrugInfoBanner },
  props: {
    prescriptions: {
      type: Array,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    isDisabled: false,
  }),

  methods: {
    getStatusColor(status) {
      if (status === 'Pending') return 'label-warning';
      if (status === 'Complete Dispense') return 'label-success';
      if (status === 'Partial Dispense') return 'label-danger';
      return 'label-info';
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    fetchPrescription() {
      this.$store.dispatch('pharmacy/fetchOnePrescription', this.$route.params.id)
    },

    endRequest(button) {
      this.fetchPrescription();
      this.removeSpinner(button);
    },

    toggleCheck(prescription, event, i) {
      this.prescriptions[i].disabledReturn = !event.target.checked;
    },

    dispenseDrug(prescription, i) {
      const obj = {
        prescription_id: prescription.id,
        quantity_to_dispense: prescription.quantity_remaining_to_dispense,
      };

      const submitButton = this.$refs['kt_dispense_submit'][i];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('pharmacy/dispenseDrug', { id: this.$route.params.id, data: obj })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    returnDrug(prescription, i) {
      const obj = {
        prescription_id: prescription.id,
        quantity_to_return: prescription.quantity_to_return,
      };

      const submitButton = this.$refs['kt_return_submit'][i];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('pharmacy/returnDrug', { id: this.$route.params.id, data: obj })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style></style>
