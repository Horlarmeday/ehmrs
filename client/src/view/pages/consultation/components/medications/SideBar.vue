<template>
  <div class="col-4 offcanvas-mobile w-xl-250px" id="kt_profile_aside">
    <RoutineDrugs
      :display-prompt="displayPrompt"
      @closeModal="hideModal"
      :show-switch="showSwitch"
      :source="source"
      :switch-position="switchPosition"
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
                  v-model="drug"
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
                <span v-if="strength_input" class="form-text text-success"
                  >Available Strength:
                  <span class="font-weight-boldest"
                    >{{ strength_input }} {{ strength?.name }}</span
                  ></span
                >
                <span
                  v-if="quantity_remaining"
                  class="form-text"
                  :class="quantity_remaining < 50 ? 'text-danger' : 'text-success'"
                >
                  Quantity Remaining:
                  <span class="font-weight-boldest">{{ quantity_remaining }} {{ unit_name }}</span>
                </span>
                <span v-if="price" class="form-text text-success"
                  >Price: <span class="font-weight-boldest">₦{{ price }}</span></span
                >
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Dosage:</label>
              <div class="col-lg-9">
                <input
                  readonly
                  type="text"
                  class="form-control-sm form-control"
                  v-model="dosage_form.name"
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
                  v-model="route"
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
                  v-model="start_date"
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
                  v-model="prescribed_strength"
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
                  v-model="frequency"
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
                  v-model="duration"
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
                  v-model="duration_unit"
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
                <span v-if="quantity_prescribed" class="form-text text-success"
                  >Dosage Quantity:
                  <span class="font-weight-boldest"
                    >{{ quantity_prescribed }} {{ unit_name }}</span
                  ></span
                >
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Qty to dispense:</label>
              <div class="col-lg-9">
                <input
                  v-model="quantity_to_dispense"
                  class="form-control-sm form-control"
                  type="number"
                  name="quantity_to_dispense"
                  v-validate="'required|min:1'"
                  data-vv-validate-on="blur"
                  @input="getTotalPrice"
                  :disabled="!quantity_prescribed"
                />
                <span class="form-text text-danger">{{
                  errors.first('quantity_to_dispense')
                }}</span>
                <span v-if="total_price" class="form-text text-success">
                  Total price
                  <span class="text-success"
                    ><span class="font-weight-boldest">₦{{ total_price }}</span></span
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
                    <input type="radio" v-model="drug_group" :value="type" />
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
                  v-model="notes"
                  name="notes"
                  cols="5"
                  class="form-control form-control-sm"
                  rows="2"
                />
              </div>
            </div>
            <div class="mt-3">
              <div v-if="nhisPriceQuotaExceeded" class="alert alert-warning" role="alert">
                <span class="font-size-sm font-weight-bold">NHIS drugs limit is reached</span>
              </div>
              <button
                @click="submitDrugOrder"
                :disabled="quantity_remaining <= 0 || nhisPriceQuotaExceeded"
                ref="kt-drugOrder-submit"
                class="btn btn-primary btn-md float-right mb-3"
              >
                Save
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
import { debounce, isToday, parseJwt } from '@/common/common';
import KTUtil from '@/assets/js/components/util';
import SwitchBox from '@/utils/SwitchBox.vue';
import RoutineDrugs from '@/view/pages/programs/antenatal/components/RoutineDrugs.vue';

export default {
  name: 'MedicationSideBar',
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
    drugOrders() {
      return this.$store.state.order.drug_orders;
    },
  },

  watch: {
    // check NHIS drugs quota is reached
    // TODO: only get drugs prescribed today and not all drug orders
    drugOrders(value) {
      if (this.switchPosition && this.switchSpot) {
        const total = this.getTotalDrugsPrescribedToday(value);
        if (total > this.quotaPrice) this.nhisPriceQuotaExceeded = true;
      }
    },
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
  },

  data: () => ({
    nhisPriceQuotaExceeded: false,
    quotaPrice: 13500, // todo: select this from settings
    switchSpot: true,
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
    currentUser: parseJwt(localStorage.getItem('user_token')),
    ANTENATAL: 'ANC',

    price: null,
    total_price: null,
    quantity_remaining: null,
    strength_input: null,
    strength: null,
    quantity_prescribed: null,
    unit_name: null,
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
    getInventories() {
      this.$store.dispatch('inventory/fetchInventories');
    },

    getRoutes() {
      this.$store.dispatch('pharmacy/fetchRoutesAndMeasurements', {
        dosage_form_id: this.dosage_form.id,
      });
    },

    flipSwitch(value) {
      this.switchSpot = value;
      this.initValues();
    },

    removeValues() {
      this.route = '';
      this.start_date = new Date();
      this.duration_unit = '';
      this.notes = '';
      this.quantity_to_dispense = '';
      this.duration = '';
      this.frequency = '';
      this.prescribed_strength = '';
      this.total_price = null;
      this.quantity_prescribed = null;
      this.drug_group = null;
      this.inventory_id = null;
      this.nhisPriceQuotaExceeded = false;
    },

    setDrugInfo() {
      this.strength = this.drug.strength;
      this.drug_id = this.drug.drug_id;
      this.price = this.drug.price;
      this.unit_name = this.drug.unit_name;
      this.strength_input = this.drug.strength_input;
      this.quantity_remaining = this.drug.quantity_remaining;
      this.dosage_form = this.drug.dosage_form;
      this.getRoutes();
      this.removeValues();
    },

    getTotalPrice() {
      this.quantity_to_dispense = Math.floor(Math.abs(this.quantity_to_dispense));
      this.total_price = this.price * this.quantity_to_dispense;
      // check NHIS drugs quota is reached
      if (this.switchPosition && this.switchSpot) {
        const totalDrugsPrescribedToday = this.getTotalDrugsPrescribedToday(this.drugOrders);
        const total = +this.total_price + +totalDrugsPrescribedToday;
        this.nhisPriceQuotaExceeded = total > this.quotaPrice;
      }
    },

    calculateDosageQuantity() {
      if (this.frequency.label === 'Stat' || this.dosage_form.name === 'Cream') {
        this.quantity_prescribed = 1;
      } else {
        this.quantity_prescribed = Math.ceil(
          (this.prescribed_strength / Number(this.strength_input)) *
            this.frequency.val *
            this.duration *
            this.duration_unit.val
        );
      }
    },

    submitDrugOrder() {
      this.$validator.validateAll().then(result => {
        if (result) {
          if (this.switchPosition && this.switchSpot && !this.drug_group) {
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
            .dispatch('order/orderDrug', {
              drug: this.drugData(),
              id: this.$route.params.id,
            })
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    drugData() {
      return {
        dosage_form_id: this.dosage_form.id,
        dosage_form_name: this.dosage_form.name,
        route_id: this.route,
        start_date: this.start_date,
        duration_unit: this.duration_unit.label,
        notes: this.notes,
        quantity_to_dispense: this.quantity_to_dispense,
        quantity_prescribed: this.quantity_prescribed,
        duration: this.duration,
        frequency: this.frequency.label,

        prescribed_strength: this.prescribed_strength,
        strength_id: this.strength.id,
        drug_id: this.drug_id,
        total_price: this.total_price,
        drug_type: this.switchPosition && this.switchSpot ? 'NHIS' : 'Cash',
        inventory_id: this.getInventoryId(),
        source: this.source,
        ...(this.drug_group && { drug_group: this.drug_group }),
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
      this.removeSpinner(button);
      this.initValues();
      this.$store.dispatch('order/fetchPrescribedDrugs', {
        fetchWithItems: true,
        filter: { visit_id: this.$route.params.id },
      });
      setTimeout(() => {
        KTUtil.scrollTop();
      }, 500);
    },

    initValues() {
      this.dosage_form = '';
      this.route = '';
      this.start_date = new Date();
      this.duration_unit = '';
      this.notes = '';
      this.quantity_to_dispense = '';
      this.duration = '';
      this.frequency = '';
      this.drug = '';
      this.prescribed_strength = '';
      this.drug_id = '';

      this.price = null;
      this.total_price = null;
      this.quantity_remaining = null;
      this.strength_input = null;
      this.strength = null;
      this.quantity_prescribed = null;
      this.unit_name = null;
      this.drug_group = null;
      this.inventory_id = null;
      this.nhisPriceQuotaExceeded = false;
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
        })
        .then(() => loading(false));
    }, 500),

    getInventoryId() {
      const type = this.switchPosition && this.switchSpot ? 'NHIS' : 'Cash';
      return this.inventories.find(inventory =>
        inventory.name.toLowerCase().includes(type.toLowerCase())
      )?.id;
    },

    sumTotalPrice(arr) {
      return arr.reduce((a, b) => a + +b.total_price, 0);
    },

    getTotalDrugsPrescribedToday(arr) {
      const drugsToday = arr.filter(({ date_prescribed }) => isToday(date_prescribed));
      return this.sumTotalPrice(drugsToday);
    },

    openModal() {
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },
  },

  created() {
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
