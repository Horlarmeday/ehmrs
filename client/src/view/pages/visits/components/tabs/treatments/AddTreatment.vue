<!-- eslint-disable no-unused-vars -->
<template>
  <div>
    <div class="mt-3">
      <div v-if="!loading">
        <div v-if="!treatments?.length">
          <div class="alert alert-custom alert-light-primary fade show mb-5" role="alert">
            <div class="alert-icon"><i class="flaticon-exclamation-1"></i></div>
            <div class="alert-text">No drugs has been prescribed for this patient</div>
          </div>
        </div>
        <div>
          <button
            class="btn btn-primary mb-5"
            @click="submitDrugs"
            :disabled="isDisabled || !treatments.length"
            ref="kt_addTreatment_submit"
          >
            Submit
          </button>
        </div>
        <div v-for="(item, i) in treatments" :key="i">
          <div class="bg-light-primary p-1">
            <label class="mr-3"
              >Drug:
              <span class="font-weight-bolder">{{ item.drug_name }}</span>
              <span v-if="item.drug_type === 'NHIS'" class="font-weight-lighter"
                >({{ item.drug_type }})</span
              >
            </label>
            <span class="vertical-line"></span>
            <label class="mr-3"
              >Quantity:
              <span class="font-weight-bolder">{{ item.quantity }} {{ item.dosage_form }}</span>
              <span
                v-if="item.quantity_administered > 0"
                class="ml-2 text-muted"
                style="font-size: 0.9em"
              >
                (Administered: {{ item.quantity_administered }})
              </span>
            </label>
            <span class="vertical-line"></span>
            <label class="mr-3"
              >Route: <span class="font-weight-bolder">{{ item.route }}</span></label
            >
            <span class="vertical-line"></span>
            <label class=""
              >Strength: <span class="font-weight-bolder">{{ item.strength }}</span></label
            >
          </div>
          <div
            class="d-flex justify-content-between mb-3"
            :class="(item.dosage_completed || item.isInputDisabled) && 'disabled'"
          >
            <div class="d-flex flex-column flex-root">
              <label>
                Dosage Administered:
                <span
                  v-if="item.remaining_quantity !== undefined"
                  :class="{
                    'text-success': item.remaining_quantity > 0,
                    'text-warning':
                      item.remaining_quantity > 0 && item.remaining_quantity <= item.quantity * 0.2,
                    'text-danger': item.remaining_quantity === 0,
                  }"
                  class="ml-2 font-weight-bold"
                >
                  (Remaining: {{ item.remaining_quantity }} {{ item.dosage_form }})
                </span>
              </label>
              <input
                type="text"
                v-model="item.dosage_administered"
                :disabled="item.isInputDisabled"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': treatmentErrors[item.drug_id] }"
                @input="validateDosageInput(item)"
              />
              <div v-if="treatmentErrors[item.drug_id]" class="invalid-feedback d-block">
                {{ treatmentErrors[item.drug_id] }}
              </div>
            </div>
            <div class="d-flex flex-column flex-root">
              <label>Remarks:</label>
              <div class="input-group">
                <input type="text" v-model="item.remarks" class="form-control form-control-sm" />
                <div class="input-group-append">
                  <a
                    v-if="!item.isInputDisabled"
                    v-b-tooltip.hover
                    title="Click to complete dosage"
                    href="#"
                    class="btn btn-success btn-sm"
                    @click="displayPrompt(item.drug_id)"
                  >
                    Complete
                  </a>
                  <span
                    v-else
                    class="btn btn-secondary btn-sm disabled"
                    title="Dosage already completed or no remaining quantity"
                  >
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <DefaultSkeleton />
        <DefaultSkeleton />
      </div>
      <div class="float-right">
        <button
          class="btn btn-primary mt-5"
          @click="submitDrugs"
          :disabled="isDisabled || !treatments.length"
          ref="kt_addTreatment_submit"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
import Swal from 'sweetalert2';
import { extractQuantityFromText } from '@/utils/dosageUtils';

export default {
  components: { DefaultSkeleton },
  props: {
    source: {
      type: String,
      required: true,
    },
    filter: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  data: () => ({
    isDisabled: false,
    attemptMade: false,
    continueRetry: true,
    loading: true,
    currentPage: 1,
    itemsPerPage: 15,
    treatmentErrors: {}, // Track validation errors for each treatment
  }),
  created() {
    if (this.source === 'Admission') this.fetchPrescribedDrugsWithRetry();
    else this.fetchPrescribedDrugs();
  },
  computed: {
    admission() {
      return this.$store.state.admission.admission;
    },

    orders() {
      return this.$store.state.order.drug_orders;
    },

    treatments() {
      return this.orders.map((order) => {
        const quantityAdministered = order.quantity_administered || 0;
        const quantityToDispense = order.quantity_to_dispense || 0;
        const remainingQuantity = Math.max(0, quantityToDispense - quantityAdministered);
        const isDisabled = remainingQuantity <= 0 || order.dosage_completed;

        return {
          drug_name: order.drug.name,
          drug_id: order.id,
          drug_type: order.drug_type,
          dosage_form: order.dosage_form.name,
          route: order.route.name,
          dosage_administered: '',
          remarks: '',
          quantity: quantityToDispense,
          quantity_administered: quantityAdministered,
          remaining_quantity: remainingQuantity,
          strength: order.strength.name,
          dosage_completed: order.dosage_completed,
          isInputDisabled: isDisabled,
          extracted_quantity: null,
        };
      });
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
      this.$store.dispatch('order/fetchTreatments', {
        currentPage: 1,
        itemsPerPage: 10,
        filter: this.filter,
      });
    },

    async fetchPrescribedDrugsWithRetry() {
      while (this.continueRetry) {
        // Check again if admission is available before attempting to fetch
        if (this.admission) {
          this.fetchPrescribedDrugs();
          this.continueRetry = false;
          break;
        }

        // Admission is null, wait for 5 seconds before retrying
        await this.delay(3000);
      }
    },

    initValues() {
      this.treatments.forEach((treatment) => {
        treatment.dosage_administered = '';
        treatment.remarks = '';
        treatment.extracted_quantity = null;
      });
      this.treatmentErrors = {};
    },

    fetchPrescribedDrugs() {
      this.loading = true;
      this.$store
        .dispatch('order/fetchPrescribedDrugs', {
          currentPage: this.currentPage,
          itemsPerPage: this.itemsPerPage,
          filter: {
            visit_id:
              this.source === 'Consultation' ? this.$route.params.id : this.admission.visit_id,
          },
        })
        .then(() => (this.loading = false));
    },

    validateDosageInput(treatment) {
      // Clear previous error
      this.$delete(this.treatmentErrors, treatment.drug_id);

      if (!treatment.dosage_administered || !treatment.dosage_administered.trim()) {
        return; // Allow empty input
      }

      // Extract quantity from text
      const extractedQuantity = extractQuantityFromText(treatment.dosage_administered);

      if (extractedQuantity === null) {
        this.$set(
          this.treatmentErrors,
          treatment.drug_id,
          'No quantity found in input. Please include a number (e.g., "4 tablets")'
        );
        treatment.extracted_quantity = null;
        return;
      }

      // Validate against remaining quantity
      if (extractedQuantity > treatment.remaining_quantity) {
        this.$set(
          this.treatmentErrors,
          treatment.drug_id,
          `Cannot administer ${extractedQuantity} units. Remaining quantity is ${treatment.remaining_quantity} ${treatment.dosage_form}`
        );
        treatment.extracted_quantity = null;
        return;
      }

      // Valid quantity
      treatment.extracted_quantity = extractedQuantity;
    },

    submitDrugs() {
      // Validate all treatments before submission
      this.treatmentErrors = {};
      let hasErrors = false;

      const treatmentsToSubmit = this.treatments.filter((treatment) => {
        if (!treatment.dosage_administered || !treatment.dosage_administered.trim()) {
          return false; // Skip empty inputs
        }

        // Validate each treatment
        this.validateDosageInput(treatment);

        if (this.treatmentErrors[treatment.drug_id]) {
          hasErrors = true;
          return false;
        }

        return true;
      });

      if (hasErrors) {
        this.$bvToast.toast('Please fix validation errors before submitting', {
          title: 'Validation Error',
          variant: 'danger',
          solid: true,
        });
        return;
      }

      if (treatmentsToSubmit.length === 0) {
        this.$bvToast.toast('Please enter at least one dosage administration', {
          title: 'No Data',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      // set spinner to submit button
      const submitButton = this.$refs['kt_addTreatment_submit'];
      this.addSpinner(submitButton);

      const treatments = treatmentsToSubmit.map(
        ({
          // eslint-disable-next-line no-unused-vars
          drug_name,
          // eslint-disable-next-line no-unused-vars
          strength,
          // eslint-disable-next-line no-unused-vars
          dosage_form,
          // eslint-disable-next-line no-unused-vars
          drug_type,
          // eslint-disable-next-line no-unused-vars
          quantity,
          // eslint-disable-next-line no-unused-vars
          route,
          // eslint-disable-next-line no-unused-vars
          dosage_completed,
          // eslint-disable-next-line no-unused-vars
          quantity_administered,
          // eslint-disable-next-line no-unused-vars
          remaining_quantity,
          // eslint-disable-next-line no-unused-vars
          isInputDisabled,
          // eslint-disable-next-line no-unused-vars
          extracted_quantity,
          ...rest
        }) => ({
          ...rest,
          source: this.source,
        })
      );

      this.$store
        .dispatch('order/orderTreatment', { data: treatments, id: this.$route.params.id })
        .then(() => {
          this.endRequest(submitButton);
          // Refresh prescribed drugs to get updated quantity_administered
          this.fetchPrescribedDrugs();
        })
        .catch((error) => {
          this.removeSpinner(submitButton);
          this.$bvToast.toast(error.response?.data?.message || 'Failed to submit treatment data', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        });
    },

    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    displayPrompt(drugId) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Patient has completed dosage, this action cannot be reversed',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Continue!',
        cancelButtonText: 'No, cancel!',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return this.completeDosage(drugId);
        },
      });
    },

    completeDosage(drugId) {
      this.$store.dispatch('order/updatePrescribedDrug', {
        data: {
          id: drugId,
          dosage_completed: true,
        },
      });
      // .then(() => {
      //   const drugIndex = this.treatments.findIndex(p => p.drug_id === drugId);
      //   Object.assign(this.treatments[drugIndex], drug);
      // });
    },
  },
};
</script>

<style>
.disabled {
  pointer-events: none;
  opacity: 0.4;
}

.vertical-line {
  border-left: 1px solid #858992; /* Adjust color and thickness as needed */
  height: 150px; /* Adjust height as needed */
  margin-left: 5px; /* Adjust margin as needed */
  margin-right: 15px; /* Adjust margin as needed */
}
</style>
