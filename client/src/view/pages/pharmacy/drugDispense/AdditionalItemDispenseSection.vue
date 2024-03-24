<template>
  <div>
    <div class="accordion accordion-solid accordion-toggle-arrow">
      <div class="card" v-for="(item, i) in items" :key="i">
        <div class="card-header">
          <div class="card-title" v-b-toggle="`collapse-a${i}`">
            <span class="mr-5 text-black-50 lead font-size-h4">Item Name:</span>
            <span class="mr-5 text-dark">{{ item.item_name }}</span>

            <span class="mr-3 text-black-50 lead font-size-h4">Item Type:</span
            ><span class="text-dark mr-5">{{ item.drug_type }}</span>

            <span class="mr-3 text-black-50 lead font-size-h4">Dispense Status:</span>
            <span
              :class="getStatusColor(item.dispense_status)"
              class="label label-pill label-inline mr-2"
              >{{ item.dispense_status }}</span
            >
          </div>
        </div>
        <div>
          <b-collapse :visible="i === 0" :id="`collapse-a${i}`">
            <b-card>
              <div class="form-group row">
                <div class="col-lg-6">
                  <label>Dispense</label>
                  <div class="input-group">
                    <input
                      :disabled="!item.quantity_remaining"
                      type="number"
                      class="form-control"
                      v-model="item.quantity_remaining_to_dispense"
                      aria-label="Quantity to Dispense"
                    />
                    <div class="input-group-append">
                      <span class="input-group-text">of</span>
                      <span class="input-group-text"
                        >{{ item.quantity_to_dispense }} {{ item.unit }}</span
                      >
                      <button
                        :disabled="isDisabled || !item.quantity_remaining_to_dispense"
                        class="btn btn-primary"
                        ref="kt_dispense_submit"
                        @click="dispenseDrug(item, i)"
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
                        type="checkbox"
                        :disabled="!item.quantity_remaining_to_dispense"
                        class="mr-2"
                        v-model="item.disabledReturn"
                        @input="toggleCheck(item, $event, i)"
                      />
                      <span></span>
                    </label>
                    <input
                      :disabled="!item.disabledReturn"
                      type="number"
                      v-model="item.quantity_to_return"
                      class="form-control"
                      aria-label="Quantity to return"
                    />
                    <div class="input-group-append">
                      <span class="input-group-text">of</span>
                      <span class="input-group-text"
                        >{{ item.quantity_to_dispense }} {{ item.unit }}</span
                      >
                      <button
                        ref="kt_return_submit"
                        @click="returnDrug(item, i)"
                        :disabled="isDisabled || !item.disabledReturn"
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
export default {
  name: 'AdditionalItemDispenseSection',
  props: {
    items: {
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

    toggleCheck(item, event, i) {
      this.items[i].disabledReturn = !event.target.checked;
    },

    dispenseDrug(item, i) {
      const obj = {
        additional_item_id: item.id,
        quantity_to_dispense: item.quantity_remaining_to_dispense,
      };

      const submitButton = this.$refs['kt_dispense_submit'][i];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('pharmacy/dispenseDrug', { id: this.$route.params.id, data: obj })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    returnDrug(item, i) {
      const obj = {
        additional_item_id: item.id,
        quantity_to_return: item.quantity_to_return,
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
