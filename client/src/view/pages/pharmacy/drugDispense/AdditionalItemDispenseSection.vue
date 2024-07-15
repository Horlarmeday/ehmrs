<template>
  <div>
    <div class="accordion accordion-solid accordion-toggle-arrow">
      <div v-if="!items?.length">
        <DefaultSkeleton />
        <DefaultSkeleton />
        <DefaultSkeleton />
      </div>
      <div v-else class="card" v-for="(item, i) in items" :key="i">
        <div class="card-header">
          <div class="card-title" v-b-toggle="`collapse-a${i}`">
            <span class="mr-5 text-black-50 lead font-italic font-size-h4">Item Name:</span>
            <span class="mr-5 text-dark">{{ item.item_name }}</span>
            <span class="vertical-line"></span>

            <span class="mr-3 text-black-50 lead font-italic font-size-h4">Item Type:</span
            ><span class="text-dark mr-5">{{ item.drug_type }}</span>
            <span class="vertical-line"></span>

            <span class="mr-3 text-black-50 lead font-italic font-size-h4">Dispense Status:</span>
            <span
              :class="getStatusColor(item.dispense_status)"
              class="label label-pill label-inline mr-2"
              >{{ item.dispense_status }}</span
            >
            <span class="vertical-line"></span>

            <span class="mr-5 text-black-50 lead font-italic font-size-h4 ml-5">Price:</span>
            <span class="mr-5 text-dark">₦{{ item.total_price }}</span>
            <span class="vertical-line"></span>

            <span class="mr-3 text-black-50 lead font-size-h4 font-italic ml-5">Prescribed By:</span
            ><span class="text-dark mr-5">{{ item?.staff?.fullname }}</span>
          </div>
        </div>
        <div>
          <b-collapse :id="`collapse-a${i}`">
            <b-card :class="item.payment_status === PENDING && DISABLED">
              <div class="form-group row">
                <div class="col-lg-6">
                  <label>Dispense</label>
                  <div class="input-group">
                    <input
                      :disabled="item.shouldDisableDispense"
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
                        :disabled="!item.quantity_remaining_to_return"
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
                  <label>Reason for Return</label>
                  <input
                    :disabled="!item.disabledReturn"
                    type="text"
                    class="form-control"
                    v-model="item.reason_for_return"
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
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';

export default {
  name: 'AdditionalItemDispenseSection',
  components: { DefaultSkeleton },
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
    DISABLED: 'disabledCard',
    PENDING: 'Pending',
  }),

  methods: {
    getStatusColor(status) {
      if (status === 'Pending') return 'label-warning';
      if (status === 'Dispensed') return 'label-success';
      if (status === 'Partial Dispense') return 'label-primary';
      if (status === 'Returned') return 'label-danger';
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
      this.removeSpinner(button);
      this.fetchPrescription();
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
      if (!item.reason_for_return) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'Reason for returning item cannot be empty',
          type: 'error',
        });
      }
      const obj = {
        additional_item_id: item.id,
        quantity_to_return: item.quantity_to_return,
        reason_for_return: item.reason_for_return,
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

<style>
.disabledCard {
  pointer-events: none;
  opacity: 0.4;
}

.vertical-line {
  border-left: 1px solid #858992; /* Adjust color and thickness as needed */
  height: 25px; /* Adjust height as needed */
  margin-left: 5px; /* Adjust margin as needed */
  margin-right: 15px; /* Adjust margin as needed */
}
</style>
