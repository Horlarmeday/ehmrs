<template>
  <b-modal
    v-model="activePrompt"
    size="xl"
    hide-footer
    title="Routine Drugs"
    @show="getInventories"
  >
    <div v-if="defaults">
      <div class="mb-5" v-for="drug in routineDrugs" :key="drug.drug_id">
        <div class="bg-light-primary p-1">
          <label class="mr-3"
            >Drug:
            <span class="font-weight-bolder">{{ drug.drug_name }}</span>
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
          <label class=""
            >Strength:
            <span class="font-weight-bolder"
              >{{ drug.prescribed_strength }} {{ drug.strength_name }}</span
            ></label
          >
        </div>
        <div class="form-group row">
          <div class="col-sm-1">
            <label class="checkbox" style="margin-top: 30px">
              <input type="checkbox" :checked="isSelected(drug)" @change="toggleDrug(drug)" />
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
              @input="calculateDosageQuantity(drug)"
            />
          </div>
          <div class="col-lg-4">
            <label>Unit:</label>
            <select
              @change="calculateDosageQuantity(drug)"
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
      <div class="separator separator-solid separator-border-2"></div>
      <div class="mt-2">
        <button class="btn btn-primary btn-md" ref="kt-routineDrugs-submit" @click="submitDrugs">
          Submit
        </button>
      </div>
    </div>
    <div v-else>
      <DefaultSkeleton />
    </div>
  </b-modal>
</template>

<script>
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
import { randomId } from '@/common/common';

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
  components: { DefaultSkeleton },
  data: () => ({
    defaultData: 'ANC_ROUTINE_DRUGS',
    switchSpot: true,
    units: [
      { val: 1, label: 'Days' },
      { val: 7, label: 'Weeks' },
      { val: 30, label: 'Months' },
    ],
  }),
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    switchPosition: {
      type: Boolean,
      required: true,
    },
    showSwitch: {
      type: Boolean,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    insuranceName: {
      type: String,
      required: false,
    },
  },
  computed: {
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },

    defaults() {
      if (this.$store.state.model.defaults?.length) {
        return this.$store.state.model.defaults;
      }
      return JSON.parse(localStorage.getItem('defaults'));
    },

    routineDrugs: {
      get() {
        const drugs = this.defaults?.find(def => def.type === this.defaultData)?.data;
        if (drugs) {
          return drugs
            .filter(
              drug => drug.drug.drug_type === this.insuranceName || drug.drug.drug_type === 'Cash'
            )
            .map(drug => ({
              id: randomId(),
              drug_name: drug.drug?.name,
              dosage_form_id: drug.drug.dosage_form?.id,
              dosage_form_name: drug.dosage_form,
              strength_name: drug.drug?.strength?.name,
              route_id: drug.drug.route?.id,
              route_name: drug.drug.route?.name,
              start_date: new Date(),
              duration_unit: '',
              quantity_to_dispense: drug.quantity,
              quantity_prescribed: drug.quantity,
              duration: '',
              frequency: drug.frequency,
              price: drug.drug?.price,
              inventory_id: this.getInventoryId(),

              prescribed_strength: drug.prescribed_strength,
              strength_id: drug.drug.strength?.id,
              strength_input: drug.drug.strength_input,
              drug_id: drug.drug.drug_id,
              total_price: '',
              drug_type: this.getDrugType(this.insuranceName),
              source: this.source,
              ...(this.drug_group && { drug_group: this.drug_group }),
              ...(this.source === 'Antenatal' && { ante_natal_id: this.$route.query.antenatal }),
              ...(this.source === 'Immunization' && {
                immunization_id: this.$route.query.immunization,
              }),
              ...(this.source === 'Theater' && { surgery_id: this.$route.query.surgery }),
            }));
        }
        return [];
      },
    },

    inventories() {
      return this.$store.state.inventory.inventories;
    },
  },
  watch: {
    displayPrompt(val) {
      if (!val) return false;
      this.fetchDrugs();
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

    fetchDrugs() {
      if (!localStorage.getItem('defaults')) {
        this.$store
          .dispatch('model/fetchDefaults')
          .then(res => localStorage.setItem('defaults', JSON.stringify(res.data.data)));
      }
    },

    isSelected(drug) {
      return this.routineDrugs.some(t => t.drug_id === drug.drug_id);
    },

    toggleDrug(drug) {
      const index = this.routineDrugs.findIndex(t => t.drug_id === drug.drug_id);
      if (index !== -1) {
        this.routineDrugs.splice(index, 1); // Remove drug
      } else {
        this.routineDrugs.push(drug); // Add drug
      }
    },

    getDrugIndex(drug) {
      return this.routineDrugs.findIndex(routine => routine.id === drug.id);
    },

    calculateDosageQuantity(drug) {
      const index = this.getDrugIndex(drug);
      const foundDrug = this.routineDrugs[index];
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
      const foundDrug = this.routineDrugs[index];
      foundDrug.quantity_to_dispense = Math.floor(Math.abs(foundDrug.quantity_to_dispense));
      foundDrug.total_price = +foundDrug.price * +foundDrug.quantity_to_dispense;
    },

    getInventories() {
      this.$store.dispatch('inventory/fetchInventories');
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
      console.log(this.routineDrugs);
      const emptyQuantity = this.routineDrugs.some(
        drug => !drug.quantity_to_dispense || !drug.duration_unit
      );
      if (emptyQuantity) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'You need to fill all inputs',
          type: 'error',
        });
      }

      const submitButton = this.$refs['kt-routineDrugs-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('order/bulkOrderDrug', {
          drugs: this.routineDrugs,
          id: this.$route.params.id,
        })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
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
