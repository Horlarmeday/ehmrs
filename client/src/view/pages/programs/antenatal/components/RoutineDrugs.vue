<template>
  <b-modal
    v-model="activePrompt"
    size="xl"
    hide-footer
    title="Routine Drugs"
    @show="getInventoriesAndANCDrugs"
    scrollable
  >
    <div v-if="defaults">
      <b-tabs content-class="mt-5">
        <b-tab title="1 Week" active>
          <routine-drug-input @closeModal="hideModal" :routine-drugs="oneWeekDrugs" />
        </b-tab>
        <b-tab title="2 Weeks">
          <routine-drug-input @closeModal="hideModal" :routine-drugs="twoWeeksDrugs" />
        </b-tab>
        <b-tab title="3 Weeks">
          <routine-drug-input @closeModal="hideModal" :routine-drugs="threeWeeksDrugs" />
        </b-tab>
        <b-tab title="4 Weeks">
          <routine-drug-input @closeModal="hideModal" :routine-drugs="fourWeeksDrugs" />
        </b-tab>
      </b-tabs>
    </div>
    <div v-else>
      <DefaultSkeleton />
    </div>
  </b-modal>
</template>

<script>
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
import { randomId } from '@/common/common';
import RoutineDrugInput from '@/view/pages/programs/antenatal/components/RoutineDrugInput.vue';

export default {
  components: { RoutineDrugInput, DefaultSkeleton },
  data: () => ({
    defaultData: 'ANC_ROUTINE_DRUGS',
    switchSpot: true,
    error: null,
    units: [
      { val: 1, label: 'Days' },
      { val: 7, label: 'Weeks' },
      { val: 30, label: 'Months' },
    ],
    ONE_WEEK: '1 week',
    TWO_WEEKS: '2 weeks',
    THREE_WEEKS: '3 weeks',
    FOUR_WEEKS: '4 weeks',
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
      required: false,
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
      return this.$store.state.model.defaults;
    },

    inventories() {
      return this.$store.state.inventory.inventories;
    },

    routineDrugs() {
      const drugs = this.defaults?.find(def => def.type === this.defaultData)?.data;
      if (drugs) {
        const insurance = this.getInsuranceName() || 'Cash';
        return drugs
          .filter(drug => drug.drug.drug_type === insurance)
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
            group: drug.group,
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

    oneWeekDrugs() {
      return this.routineDrugs?.filter(drug => drug?.group === this.ONE_WEEK) || [];
    },

    twoWeeksDrugs() {
      return this.routineDrugs?.filter(drug => drug?.group === this.TWO_WEEKS) || [];
    },

    threeWeeksDrugs() {
      return this.routineDrugs?.filter(drug => drug?.group === this.THREE_WEEKS) || [];
    },

    fourWeeksDrugs() {
      return this.routineDrugs?.filter(drug => drug?.group === this.FOUR_WEEKS) || [];
    },
  },
  watch: {
    displayPrompt(val) {
      if (!val) return false;
      this.fetchDrugs();
    },
  },
  methods: {
    fetchDrugs() {
      if (!localStorage.getItem('defaults')) {
        this.$store
          .dispatch('model/fetchDefaults')
          .then(res => localStorage.setItem('defaults', JSON.stringify(res.data.data)));
      }
    },

    getInventoriesAndANCDrugs() {
      this.getDefaults();
      this.getInventories();
    },

    getInsuranceName() {
      if (this.insuranceName === 'PHIS') return 'Private';
      if (this.insuranceName === 'FHSS') return 'NHIS';
      if (this.insuranceName === 'NHIS') return 'NHIS';
      return 'Cash';
    },

    getInventories() {
      this.$store.dispatch('inventory/fetchInventories');
    },

    getDefaults() {
      this.$store.dispatch('model/fetchDefaults');
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

    hideModal() {
      this.$emit('closeModal');
    },
  },
};
</script>

<style scoped></style>
