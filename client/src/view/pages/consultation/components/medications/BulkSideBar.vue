<template>
  <div class="col-4 offcanvas-mobile w-xl-250px" id="kt_profile_aside">
    <routine-drugs
      :display-prompt="displayPrompt"
      @closeModal="hideModal"
      :show-switch="showSwitch"
      :source="source"
      :switch-position="switchPosition"
      :insurance-name="insuranceName"
    />
    <div class="card card-custom gutter-b">
      <div class="card-header py-2">
        <div class="card-title">
          <span class="card-label font-weight-bolder text-dark">Order Drug</span>
          <span v-if="showSwitch" class="ml-5">
            <switch-box
              :switch-position="switchPosition"
              :switch-spot="switchSpot"
              @switchSpot="flipSwitch"
              :insurance-name="insuranceName"
            />
          </span>
          <a
            v-if="currentUser?.sub_role === ANTENATAL"
            title="Routine Drugs"
            v-b-tooltip.hover
            href="#"
            class="btn btn-icon btn-light-primary ml-lg-5"
            @click="openModal"
          >
            <i class="fas fa-tablets"></i>
          </a>
        </div>
      </div>
      <div class="card-body pt-4 p-0">
        <div class="form">
          <div class="card-body">
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Drug:</label>
              <div class="col-lg-9">
                <v-select
                  name="diagnosis"
                  @search="onSearch"
                  @input="setDrugInfo"
                  v-model="formData.drug"
                  label="name"
                  :options="drugOptions"
                  :reduce="
                    items => ({
                      name: items.name,
                      drug_id: items.id,
                      strength: items?.strength,
                      strength_input: items.strength_input,
                      price: items.price,
                      quantity_remaining: items.quantity_remaining,
                      unit_name: items?.unit_name,
                      dosage_form: items?.dosage_form,
                    })
                  "
                />
                <span class="form-text text-sm text-danger">{{ errors.first('drug') }}</span>
                <span v-if="formData.strength_input" class="form-text text-success"
                  >Available Strength:
                  <span class="font-weight-boldest"
                    >{{ formData.strength_input }} {{ formData.strength?.name }}</span
                  ></span
                >
                <span
                  v-if="formData.quantity_remaining"
                  class="form-text"
                  :class="formData.quantity_remaining < 50 ? 'text-danger' : 'text-success'"
                >
                  Quantity Remaining:
                  <span class="font-weight-boldest"
                    >{{ formData.quantity_remaining }} {{ formData.unit_name }}</span
                  >
                </span>
                <!--                <span v-if="formData.price" class="form-text text-success"-->
                <!--                  >Price: <span class="font-weight-boldest">₦{{ formData.price }}</span></span-->
                <!--                >-->
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Dosage:</label>
              <div class="col-lg-9">
                <input
                  readonly
                  type="text"
                  class="form-control-sm form-control"
                  v-model="formData.dosage_form.name"
                />
                <span class="form-text text-danger">{{ errors.first('dosage_form') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Route:</label>
              <div class="col-lg-9">
                <select
                  class="form-control form-control-sm"
                  name="route"
                  v-model="formData.route"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                >
                  <option :value="route.id" v-for="route in routes" :key="route.id">{{
                    route.name
                  }}</option>
                </select>
                <span class="form-text text-danger">{{ errors.first('route') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Start Date:</label>
              <div class="col-lg-9">
                <datepicker
                  name="start_date"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  v-model="formData.start_date"
                  input-class="form-control form-control-sm"
                  placeholder="Starting Date"
                />
                <span class="form-text text-danger">{{ errors.first('start_date') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Strength:</label>
              <div class="col-lg-9">
                <input
                  type="number"
                  class="form-control form-control-sm"
                  v-model="formData.prescribed_strength"
                  @input="calculateDosageQuantity"
                />
                <span class="form-text text-danger">{{ errors.first('prescribed_strength') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Frequency:</label>
              <div class="col-lg-9">
                <select
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  @change="calculateDosageQuantity"
                  v-model="formData.frequency"
                  class="form-control form-control-sm"
                  name="frequency"
                >
                  <option :value="freq" v-for="(freq, i) in frequencies" :key="i">{{
                    freq.label
                  }}</option>
                </select>
                <span class="form-text text-danger">{{ errors.first('frequency') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Duration:</label>
              <div class="col-lg-9">
                <input
                  v-model="formData.duration"
                  class="form-control-sm form-control"
                  type="number"
                  name="duration"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  @input="calculateDosageQuantity"
                />
                <span class="form-text text-danger">{{ errors.first('duration') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Unit:</label>
              <div class="col-lg-9">
                <select
                  @change="calculateDosageQuantity"
                  v-model="formData.duration_unit"
                  class="form-control form-control-sm"
                  name="unit"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                >
                  <option :value="unit" v-for="(unit, i) in units" :key="i">{{
                    unit.label
                  }}</option>
                </select>
                <span class="form-text text-danger">{{ errors.first('duration_unit') }}</span>
                <span v-if="formData.quantity_prescribed" class="form-text text-success"
                  >Dosage Quantity:
                  <span class="font-weight-boldest"
                    >{{ formData.quantity_prescribed }} {{ formData.unit_name }}</span
                  ></span
                >
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Qty to dispense:</label>
              <div class="col-lg-9">
                <input
                  v-model="formData.quantity_to_dispense"
                  class="form-control-sm form-control"
                  type="number"
                  name="quantity_to_dispense"
                  v-validate="'required|min_value:1'"
                  data-vv-validate-on="blur"
                  @input="getTotalPrice"
                  :disabled="!formData.quantity_prescribed"
                />
                <span class="form-text text-danger">{{
                  errors.first('quantity_to_dispense')
                }}</span>
                <span v-if="formData.total_price" class="form-text text-success">
                  Total price
                  <span class="text-success"
                    ><span class="font-weight-boldest">₦{{ formData.total_price }}</span></span
                  >
                </span>
              </div>
            </div>
            <div v-if="switchPosition && switchSpot" class="form-group row">
              <label class="col-lg-3 col-form-label">Drug Type:</label>
              <div class="col-lg-9">
                <div class="radio-inline mt-2">
                  <label
                    v-for="(type, i) in drugTypes"
                    class="radio radio-md radio-rounded"
                    :key="i"
                  >
                    <input type="radio" v-model="formData.drug_group" :value="type" />
                    <span></span>
                    {{ type }}
                  </label>
                </div>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Notes:</label>
              <div class="col-lg-9">
                <textarea
                  v-model="formData.notes"
                  name="notes"
                  cols="5"
                  class="form-control form-control-sm"
                  rows="2"
                />
              </div>
            </div>
            <div class="mt-3">
              <div
                v-if="formData.quantity_remaining !== null && formData.quantity_remaining <= 0"
                class="alert alert-warning"
                role="alert"
              >
                <span class="font-size-sm font-weight-bold">Quantity is low in the dispensary</span>
              </div>
              <button
                @click="submitDrugOrder"
                :disabled="formData.quantity_remaining <= 0"
                ref="kt-drugOrder-submit"
                class="btn btn-primary btn-md float-right mb-3"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import vSelect from 'vue-select';
import { debounce, parseJwt } from '@/common/common';
import SwitchBox from '@/utils/SwitchBox.vue';
import RoutineDrugs from '@/view/pages/programs/antenatal/components/RoutineDrugs.vue';

export default {
  name: 'BulkMedicationSideBar',
  components: { RoutineDrugs, SwitchBox, vSelect, Datepicker },
  computed: {
    dosageForms() {
      return this.$store.state.pharmacy.dosageForms;
    },
    routes() {
      return this.$store.state.pharmacy.routes;
    },
    items() {
      return this.$store.state.inventory.items;
    },
    inventories() {
      return this.$store.state.inventory.inventories;
    },
    drugOptions: {
      get() {
        return this.items.map(item => ({
          name: item?.drug?.name,
          id: item?.drug?.id,
          strength: item?.strength,
          strength_input: item.strength_input,
          price: item.selling_price,
          quantity_remaining: item.quantity_remaining,
          unit_name: item?.unit?.name,
          dosage_form: item?.dosage_form,
        }));
      },
      set() {
        this.$store.commit('inventory/SET_ITEMS', []);
        this.drug = '';
      },
    },
    // drugOrders() {
    //   return this.$store.state.order.drug_orders;
    // },
    //
    // tempDrugOrders() {
    //   return this.$store.state.order.drug_prescriptions;
    // },
  },

  watch: {
    formData: {
      handler() {
        this.saveToLocalStorage();
      },
      deep: true, // Watch for nested changes
    },
    // check NHIS drugs quota is reached
    // TODO: only get drugs prescribed today and not all drug orders
    // drugOrders(value) {
    //   if (this.switchPosition && this.switchSpot) {
    //     const total = this.getTotalDrugsPrescribedToday(value);
    //     if (total > this.quotaPrice) this.nhisPriceQuotaExceeded = true;
    //   }
    // },
  },

  props: {
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

  data: () => ({
    formData: {
      nhisPriceQuotaExceeded: false,
      quotaPrice: 13500, // todo: select this from settings

      dosage_form: '',
      route: '',
      start_date: new Date(),
      duration_unit: '',
      notes: '',
      quantity_to_dispense: '',
      duration: '',
      frequency: '',
      drug: '',
      prescribed_strength: '',
      drug_id: '',
      drug_group: null,
      inventory_id: '',

      price: null,
      total_price: null,
      quantity_remaining: null,
      strength_input: null,
      strength: null,
      quantity_prescribed: null,
      unit_name: null,
      drug_name: null,
      strength_name: null,
    },
    switchSpot: true,
    ANTENATAL: 'ANC',
    currentUser: parseJwt(localStorage.getItem('user_token')),
    frequencies: [
      { val: 1, label: 'Stat' },
      { val: 1, label: 'OD' },
      { val: 2, label: 'BD' },
      { val: 3, label: 'TDS' },
      { val: 4, label: 'QDS' },
      { val: 6, label: 'Q4H' },
      { val: 12, label: 'Q2H' },
      { val: 24, label: 'Q1H' },
    ],
    units: [
      { val: 1, label: 'Days' },
      { val: 7, label: 'Weeks' },
      { val: 30, label: 'Months' },
    ],
    drugTypes: ['Primary', 'Secondary'],
    displayPrompt: false,
  }),
  methods: {
    saveToLocalStorage() {
      localStorage.setItem('medication', JSON.stringify(this.formData));
    },

    loadFromLocalStorage() {
      const formData = JSON.parse(localStorage.getItem('medication'));
      if (formData) {
        this.formData = formData;
      }
    },

    getInventories() {
      this.$store.dispatch('inventory/fetchInventories');
    },

    getRoutes() {
      this.$store.dispatch('pharmacy/fetchRoutesAndMeasurements', {
        dosage_form_id: this.formData.dosage_form.id,
      });
    },

    flipSwitch(value) {
      this.switchSpot = value;
      this.initValues();
      this.$store.commit('inventory/SET_ITEMS', []);
      this.formData.drug = '';
    },

    removeValues() {
      this.formData.route = '';
      this.formData.start_date = new Date();
      this.formData.duration_unit = '';
      this.formData.notes = '';
      this.formData.quantity_to_dispense = '';
      this.formData.duration = '';
      this.formData.frequency = '';
      this.formData.prescribed_strength = '';
      this.formData.total_price = null;
      this.formData.quantity_prescribed = null;
      this.formData.drug_group = null;
      this.formData.inventory_id = null;
      this.formData.nhisPriceQuotaExceeded = false;
    },

    setDrugInfo() {
      this.formData.strength = this.formData.drug.strength;
      this.formData.drug_id = this.formData.drug.drug_id;
      this.formData.price = this.formData.drug.price;
      this.formData.unit_name = this.formData.drug.unit_name;
      this.formData.drug_name = this.formData.drug.name;
      this.formData.strength_name = this.formData.strength.name;
      this.formData.strength_input = this.formData.drug.strength_input;
      this.formData.quantity_remaining = this.formData.drug.quantity_remaining;
      this.formData.dosage_form = this.formData.drug.dosage_form;
      this.getRoutes();
      this.removeValues();
    },

    getTotalPrice() {
      this.formData.quantity_to_dispense = Math.floor(Math.abs(this.formData.quantity_to_dispense));
      this.formData.total_price = this.formData.price * this.formData.quantity_to_dispense;
      // check NHIS drugs quota is reached
      // if (this.switchPosition && this.switchSpot) {
      //   const totalDrugsPrescribedToday = this.getTotalDrugsPrescribedToday([
      //     ...this.drugOrders,
      //     ...this.tempDrugOrders,
      //   ]);
      //   const total = +this.total_price + +totalDrugsPrescribedToday;
      //   this.nhisPriceQuotaExceeded = total > this.quotaPrice;
      // }
    },

    calculateDosageQuantity() {
      if (this.formData.frequency.label === 'Stat' || this.formData.dosage_form.name === 'Cream') {
        this.formData.quantity_prescribed = 1;
      } else {
        this.formData.quantity_prescribed = Math.ceil(
          (this.formData.prescribed_strength / Number(this.formData.strength_input)) *
            this.formData.frequency.val *
            this.formData.duration *
            this.formData.duration_unit.val
        );
      }
    },

    submitDrugOrder() {
      this.$validator.validateAll().then(result => {
        if (result) {
          if (this.switchPosition && this.switchSpot && !this.formData.drug_group) {
            return this.$notify({
              group: 'foo',
              title: 'Error message',
              text: 'You need to select if drug is either primary or secondary',
              type: 'error',
            });
          }
          const submitButton = this.$refs['kt-drugOrder-submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('order/addTempDrug', this.drugData())
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
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

    drugData() {
      return {
        dosage_form_id: this.formData.dosage_form.id,
        dosage_form_name: this.formData.dosage_form.name,
        strength_name: this.formData.strength.name,
        drug_name: this.formData.drug_name,
        route_id: this.formData.route,
        start_date: this.formData.start_date,
        duration_unit: this.formData.duration_unit.label,
        notes: this.formData.notes,
        quantity_to_dispense: this.formData.quantity_to_dispense,
        quantity_prescribed: this.formData.quantity_prescribed,
        duration: this.formData.duration,

        frequency: this.formData.frequency.label,
        prescribed_strength: this.formData.prescribed_strength,
        strength_id: this.formData.strength.id,
        drug_id: this.formData.drug_id,
        total_price: this.formData.total_price,
        drug_type: this.getDrugType(this.insuranceName),
        inventory_id: this.getInventoryId(),
        source: this.source,
        ...(this.formData.drug_group && { drug_group: this.formData.drug_group }),
        ...(this.source === 'Antenatal' && { ante_natal_id: this.$route.query.antenatal }),
        ...(this.source === 'Immunization' && { immunization_id: this.$route.query.immunization }),
        ...(this.source === 'Theater' && { surgery_id: this.$route.query.surgery }),
      };
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    endRequest(button) {
      localStorage.removeItem('medication');
      this.removeSpinner(button);
      this.initValues();
      // this.$store.dispatch('order/fetchPrescribedDrugs', {
      //   fetchWithItems: true,
      //   filter: { visit_id: this.$route.params.id },
      // });
      // setTimeout(() => {
      //   KTUtil.scrollTop();
      // }, 500);
    },

    initValues() {
      this.formData.dosage_form = '';
      this.formData.route = '';
      this.formData.start_date = new Date();
      this.formData.duration_unit = '';
      this.formData.notes = '';
      this.formData.quantity_to_dispense = '';
      this.formData.duration = '';
      this.formData.frequency = '';
      this.formData.drug = '';
      this.formData.prescribed_strength = '';
      this.formData.drug_id = '';

      this.formData.price = null;
      this.formData.total_price = null;
      this.formData.quantity_remaining = null;
      this.formData.strength_input = null;
      this.formData.strength = null;
      this.formData.quantity_prescribed = null;
      this.formData.unit_name = null;
      this.formData.strength_name = null;
      this.dosage_form_name = null;
      this.formData.drug_name = null;
      this.formData.drug_group = null;
      this.formData.inventory_id = null;
      this.formData.nhisPriceQuotaExceeded = false;
    },

    onSearch(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.search(loading, search, this);
      }
    },

    search: debounce((loading, search, vm) => {
      const inventory = vm.getInventoryId();
      vm.inventory_id = inventory;
      vm.$store
        .dispatch('inventory/fetchInventoryItems', {
          inventory,
          search,
          filter: { drug_form: 'Drug' },
        })
        .then(() => loading(false));
    }, 500),

    getInventoryId() {
      const type = this.getDrugType(this.insuranceName);
      return this.inventories.find(inventory =>
        inventory.name.toLowerCase().includes(type.toLowerCase())
      )?.id;
    },

    sumTotalPrice(arr) {
      return arr.reduce((a, b) => a + +b.total_price, 0);
    },

    // getTotalDrugsPrescribedToday(arr) {
    //   const drugsToday = arr.filter(
    //     ({ date_prescribed, drug_group }) => isToday(date_prescribed) && drug_group === 'Primary'
    //   );
    //   return this.sumTotalPrice(drugsToday);
    // },

    openModal() {
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },
  },

  created() {
    this.loadFromLocalStorage();
    this.getInventories();
  },
};
</script>

<style scoped>
.flex-row-auto {
  -webkit-box-flex: 0;
  -ms-flex: 0 0 auto;
  flex: 1 auto;
}
.form-group {
  margin-bottom: 0.15rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 400;
  color: #3f4254;
}
</style>
