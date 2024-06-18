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
              <span class="font-weight-bolder"
                >{{ item.quantity }} {{ item.dosage_form }}</span
              ></label
            >
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
            :class="item.dosage_completed && 'disabled'"
          >
            <div class="d-flex flex-column flex-root">
              <label>Dosage Administered:</label>
              <input
                type="text"
                v-model="item.dosage_administered"
                class="form-control form-control-sm"
              />
            </div>
            <div class="d-flex flex-column flex-root">
              <label>Remarks:</label>
              <div class="input-group">
                <input type="text" v-model="item.remarks" class="form-control form-control-sm" />
                <div class="input-group-append">
                  <a
                    v-b-tooltip.hover
                    title="Click to complete dosage"
                    href="#"
                    class="btn btn-success btn-sm"
                    @click="displayPrompt(item.drug_id)"
                  >
                    Complete
                  </a>
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
      return this.orders.map(order => ({
        drug_name: order.drug.name,
        drug_id: order.id,
        drug_type: order.drug_type,
        dosage_form: order.dosage_form.name,
        route: order.route.name,
        dosage_administered: '',
        remarks: '',
        quantity: order.quantity_to_dispense,
        strength: order.strength.name,
        dosage_completed: order.dosage_completed,
      }));
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
      this.treatments.forEach(treatment => {
        treatment.dosage_administered = '';
        treatment.remarks = '';
      });
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

    submitDrugs() {
      // set spinner to submit button
      const submitButton = this.$refs['kt_addTreatment_submit'];
      this.addSpinner(submitButton);

      const treatments = this.treatments
        .filter(treatment => treatment.dosage_administered)
        .map(({ // eslint-disable-next-line no-unused-vars
          drug_name, strength, dosage_form, drug_type, quantity, route, dosage_completed, ...rest }) => ({
          ...rest,
          source: this.source,
        }));

      this.$store
        .dispatch('order/orderTreatment', { data: treatments, id: this.$route.params.id })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
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

<style scoped>
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
