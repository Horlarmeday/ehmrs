<template>
  <div>
    <div class="accordion accordion-solid accordion-toggle-arrow">
      <div v-if="!prescriptions?.length">
        <DefaultSkeleton />
        <DefaultSkeleton />
        <DefaultSkeleton />
      </div>
      <div v-else class="card" v-for="(prescription, i) in prescriptions" :key="i">
        <div class="card-header">
          <div class="card-title" v-b-toggle="`collapse-d${i}`">
            <span class="mr-5 text-black-50 lead font-size-h4">Drug Name:</span>
            <span class="mr-5 text-dark">{{ prescription.drug_name }}</span>

            <span class="mr-3 text-black-50 lead font-size-h4">Drug Type:</span
            ><span class="text-dark mr-5">{{ prescription.drug_type }}</span>

            <span class="mr-3 text-black-50 lead font-size-h4">Dispense Status:</span>
            <span
              :class="getStatusColor(prescription.dispense_status)"
              class="label label-pill label-inline mr-2"
              >{{ prescription.dispense_status }}</span
            >
          </div>
        </div>
        <div>
          <b-collapse :id="`collapse-d${i}`">
            <b-card :class="prescription.payment_status === PENDING && DISABLED">
              <drug-info-banner :prescription="prescription" />
              <div class="form-group row">
                <div class="col-lg-6">
                  <label>Dispense</label>
                  <div class="input-group">
                    <input
                      :disabled="prescription.shouldDisableDispense"
                      type="number"
                      class="form-control"
                      v-model="prescription.quantity_remaining_to_dispense"
                      aria-label="Quantity to Dispense"
                    />
                    <div class="input-group-append">
                      <span class="input-group-text">of</span>
                      <span class="input-group-text"
                        >{{ prescription.quantity_to_dispense }}
                        {{ prescription.dosage_form }}</span
                      >
                      <button
                        :disabled="isDisabled || !prescription.quantity_remaining_to_dispense"
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
                        :disabled="!prescription.quantity_remaining_to_return"
                        type="checkbox"
                        class="mr-2"
                        v-model="prescription.disabledReturn"
                        @input="toggleCheck(prescription, $event, i)"
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
                        >{{ prescription.quantity_to_dispense }}
                        {{ prescription.dosage_form }}</span
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
                  <label>Reason for Return</label>
                  <input
                    :disabled="!prescription.disabledReturn"
                    type="text"
                    class="form-control"
                    v-model="prescription.reason_for_return"
                    aria-label="Reason for return"
                  />
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
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';

export default {
  name: 'DrugDispenseSection',
  components: { DefaultSkeleton, DrugInfoBanner },
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
    APPROVED: 'Approved',
    DISABLED: 'disabledCard',
    PENDING: 'Pending',
    NHIS: 'NHIS',
  }),

  methods: {
    getStatusColor(status) {
      if (status === 'Pending') return 'label-warning';
      if (status === 'Dispensed') return 'label-success';
      if (status === 'Partial Dispense') return 'label-primary';
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
      this.$store.dispatch('pharmacy/fetchOnePrescription', this.$route.params.id);
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
        reason_for_return: prescription.reason_for_return,
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

<style scoped>
.disabledCard {
  pointer-events: none;
  opacity: 0.4;
}
</style>
