<template>
  <div>
    <ErrorBanner v-if="error" :message="error" />
    <div v-if="routineDrugs?.length">
      <div class="mb-5 border" v-for="drug in weeksDrugs" :key="drug.id">
        <div class="bg-light-primary p-1">
          <label class="mr-3"
            >Drug:
            <span class="font-weight-bolder font-size-lg">{{ drug.drug_name }}</span>
          </label>
          <span class="vertical-line"></span>
          <label class="mr-3"
            >Dosage Form: <span class="font-weight-bolder">{{ drug.dosage_form_name }}</span></label
          >
          <span class="vertical-line"></span>
          <label class="mr-3"
            >Route: <span class="font-weight-bolder">{{ drug.route_name }}</span></label
          >
          <span class="vertical-line"></span>
          <label class="mr-3"
            >Strength:
            <span class="font-weight-bolder"
              >{{ drug.prescribed_strength }} {{ drug.strength_name }}</span
            ></label
          >
          <span class="vertical-line"></span>
          <label class="mr-3"
            >Drug Type:
            <span class="font-weight-bolder">{{ drug.drug_type }}</span>
          </label>
        </div>
        <div class="form-group row">
          <div class="col-sm-1">
            <label class="checkbox" style="margin-top: 30px">
              <input
                type="checkbox"
                :checked="isSelected(drug)"
                @change="toggleDrug(drug, $event)"
              />
              <span></span>
            </label>
          </div>
          <div class="col-lg-4">
            <label>Duration:</label>
            <input
              v-model="drug.duration"
              class="form-control-sm form-control"
              type="number"
              name="duration"
              v-validate="'required'"
              data-vv-validate-on="blur"
            />
          </div>
          <div class="col-lg-4">
            <label>Unit:</label>
            <select
              v-model="drug.duration_unit"
              class="form-control form-control-sm"
              name="unit"
              v-validate="'required'"
              data-vv-validate-on="blur"
            >
              <option :value="unit" v-for="(unit, i) in units" :key="i">{{ unit.label }}</option>
            </select>
          </div>
          <div class="col-lg-3">
            <label>Quantity:</label>
            <input
              v-model="drug.quantity_to_dispense"
              class="form-control-sm form-control"
              type="number"
              @input="getTotalPrice(drug)"
              :disabled="!drug.quantity_prescribed"
            />
          </div>
        </div>
      </div>
      <div class="mt-2">
        <button
          v-if="routineDrugs?.length"
          class="btn btn-primary btn-md float-right"
          ref="kt-routineDrugs-submit"
          @click="submitDrugs"
        >
          Submit
        </button>
      </div>
    </div>
    <div v-else class="text-center">There are no drugs for this week</div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import ErrorBanner from '@/view/pages/programs/immunization/ErrorBanner.vue';
const Frequency = {
  OD: 1,
  Stat: 1,
  BD: 2,
  TDS: 3,
  QDS: 4,
  Q4H: 6,
  Q2H: 12,
  Q1H: 24,
};
export default {
  components: { ErrorBanner },
  props: {
    routineDrugs: {
      type: Array,
      required: true,
      default: () => [],
    },
    insuranceName: {
      type: String,
      required: false,
    },
  },
  data: () => ({
    switchSpot: true,
    error: null,
    units: [
      { val: 1, label: 'Days' },
      { val: 7, label: 'Weeks' },
      { val: 30, label: 'Months' },
    ],
    weeksDrugs: [],
    selectedDrugs: [],
  }),
  watch: {
    routineDrugs: {
      handler(val) {
        const drugs = JSON.parse(JSON.stringify(val));
        this.weeksDrugs = drugs.map(drug => ({ ...drug, is_selected: true }));
      },
    },
  },
  computed: {
    inventories() {
      return this.$store.state.inventory.inventories;
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
      this.$emit('closeModal');
      this.$store.dispatch('order/fetchPrescribedDrugs', {
        fetchWithItems: true,
        filter: { visit_id: this.$route.params.id },
      });
    },

    isSelected(drug) {
      return this.weeksDrugs.some(t => t.id === drug.id);
    },

    toggleDrug(drug, event) {
      const index = this.weeksDrugs.findIndex(t => t.id === drug.id);
      this.weeksDrugs[index].is_selected = !!event.target.checked;
    },

    getDrugIndex(drug) {
      return this.weeksDrugs.findIndex(routineDrug => routineDrug.id === drug.id);
    },

    calculateDosageQuantity(drug) {
      const index = this.getDrugIndex(drug);
      const foundDrug = this.weeksDrugs[index];
      if (foundDrug.frequency === 'Stat' || foundDrug.dosage_form_name === 'Cream') {
        foundDrug.quantity_prescribed = 1;
        foundDrug.quantity_to_dispense = 1;
        foundDrug.duration_unit = foundDrug.duration_unit?.label;
        foundDrug.quantity_to_dispense = Math.floor(Math.abs(foundDrug.quantity_to_dispense));
        foundDrug.total_price = +foundDrug.price * +foundDrug.quantity_to_dispense;
      } else {
        const calculatedQuantity = Math.ceil(
          (foundDrug.prescribed_strength / Number(foundDrug.strength_input)) *
            Frequency[foundDrug.frequency] *
            foundDrug.duration *
            foundDrug.duration_unit?.val
        );
        foundDrug.quantity_prescribed = calculatedQuantity;
        foundDrug.quantity_to_dispense = calculatedQuantity;
        foundDrug.duration_unit = foundDrug.duration_unit?.label;
        foundDrug.quantity_to_dispense = Math.floor(Math.abs(foundDrug.quantity_to_dispense));
        foundDrug.total_price = +foundDrug.price * +foundDrug.quantity_to_dispense;
      }
    },

    getTotalPrice(drug) {
      const index = this.getDrugIndex(drug);
      const foundDrug = this.weeksDrugs[index];
      foundDrug.quantity_to_dispense = Math.floor(Math.abs(foundDrug.quantity_to_dispense));
      foundDrug.total_price = +foundDrug.price * +foundDrug.quantity_to_dispense;
    },

    getDrugType(insuranceName) {
      const isSwitchOn = this.switchSpot && this.switchPosition;
      if (isSwitchOn) return 'NHIS';
      const insuranceMapping = {
        FHSS: 'NHIS',
        NHIS: 'NHIS',
        PHIS: 'Private',
        Retainership: 'Cash',
      };
      const selectedInsurance = insuranceMapping[insuranceName];
      if (selectedInsurance === 'NHIS' && !isSwitchOn) return 'Cash';
      return insuranceMapping[insuranceName] || 'Cash';
    },

    getInventoryId() {
      const type = this.getDrugType(this.insuranceName);
      return this.inventories.find(inventory =>
        inventory.name.toLowerCase().includes(type.toLowerCase())
      )?.id;
    },

    submitDrugs() {
      this.error = null;
      const selectedDrugs = this.weeksDrugs
        .filter(drug => drug.is_selected)
        .map(({ group, is_selected, duration_unit, ...rest }) => ({
          ...rest,
          duration_unit: duration_unit?.label,
        }));
      const emptyQuantity = selectedDrugs.some(
        drug => !drug.quantity_to_dispense || !drug.duration_unit || !drug.duration
      );
      if (emptyQuantity) {
        this.error = 'You need to fill all selected inputs';
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'You need to fill all selected inputs',
          type: 'error',
        });
      }

      const submitButton = this.$refs['kt-routineDrugs-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('order/bulkOrderDrug', {
          drugs: selectedDrugs,
          id: this.$route.params.id,
        })
        .then(() => this.endRequest(submitButton))
        .catch(err => {
          this.removeSpinner(submitButton);
          this.error = err?.message;
        });
    },
  },
};
</script>

<style scoped>
.vertical-line {
  border-left: 1px solid #858992; /* Adjust color and thickness as needed */
  height: 150px; /* Adjust height as needed */
  margin-left: 5px; /* Adjust margin as needed */
  margin-right: 15px; /* Adjust margin as needed */
}
</style>
