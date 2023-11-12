<template>
  <div>
    <SectionTitle text="Antenatal Routine Drugs" />
    <div class="mb-5" v-for="(item, i) in items" :key="i">
      <div class="d-flex justify-content-between">
        <div class="d-flex flex-column flex-root">
          <label>Drug:</label>
          <v-select
            v-validate="'required'"
            data-vv-validate-on="blur"
            @input="setDrugInfo(i)"
            name="drug"
            key="i"
            @search="searchDrugs"
            v-model="item.drug"
            label="name"
            :reduce="
              drugs => ({
                name: drugs.name,
                drug_id: drugs.drug_id,
                unit_id: drugs.unit_id,
                strength: drugs?.strength,
                strength_input: drugs.strength_input,
                price: drugs.price,
                quantity_remaining: drugs.quantity_remaining,
                unit_name: drugs?.unit_name,
                dosage_form: drugs?.dosage_form,
                drug_type: drugs?.drug_type,
              })
            "
            :options="drugOptions"
          >
            <template #option="{ drug_type, name }">
              <span>{{ name }} - </span>
              <em> {{ drug_type || '' }}</em>
            </template>
          </v-select>
        </div>
        <div class="d-flex flex-column flex-root">
          <label>Dosage Form:</label>
          <input
            readonly
            type="text"
            class="form-control-sm form-control"
            v-model="item.dosage_form"
          />
        </div>
        <div class="d-flex flex-column flex-root">
          <label>Route:</label>
          <select
            class="form-control form-control-sm"
            name="route"
            v-model="item.route"
            v-validate="'required'"
            data-vv-validate-on="blur"
          >
            <option :value="route.id" v-for="route in routes" :key="route.id">{{
              route.name
            }}</option>
          </select>
        </div>
        <div class="d-flex flex-column flex-root">
          <label>Strength:</label>
          <input
            type="number"
            class="form-control form-control-sm"
            v-model="item.prescribed_strength"
          />
        </div>
        <div class="d-flex flex-column flex-root">
          <label>Frequency:</label>
          <select
            v-validate="'required'"
            data-vv-validate-on="blur"
            v-model="item.frequency"
            class="form-control form-control-sm"
            name="frequency"
          >
            <option :value="freq.label" v-for="(freq, i) in frequencies" :key="i">{{
              freq.label
            }}</option>
          </select>
        </div>
        <div class="d-flex flex-column flex-root">
          <label>Quantity:</label>
          <input
            v-model="item.quantity"
            class="form-control-sm form-control"
            type="number"
            name="quantity_to_dispense"
            v-validate="'required'"
            data-vv-validate-on="blur"
          />
        </div>
        <div class="pt-lg-5">
          <a href="#" class="col-lg-1 col-form-label">
            <i
              v-if="i === 0"
              class="far fa-plus-square mr-3 text-primary icon-lg mt-lg-5"
              @click="addItem"
            />
            <i
              class="far fa-trash-alt icon-md text-danger icon-lg mt-lg-5"
              v-if="i !== 0"
              @click="removeItem(i)"
            />
          </a>
        </div>
      </div>
    </div>
    <button
      :disabled="isDisabled"
      @click="submitForm"
      ref="kt-ancRoutineDrugsSubmit"
      class="btn btn-primary float-right"
    >
      Submit
    </button>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import { debounce, randomId } from '@/common/common';
import SectionTitle from '@/utils/SectionTitle.vue';

export default {
  components: { SectionTitle, vSelect },
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    items: [
      {
        id: randomId(),
        dosage_form: '',
        route: '',
        frequency: '',
        drug: '',
        prescribed_strength: '',
        quantity: '',
        price: '',
      },
    ],
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
    isDisabled: false,
  }),
  computed: {
    drugs() {
      return this.$store.state.store.items;
    },
    drugOptions() {
      return this.drugs.map(item => ({
        name: item?.drug?.name,
        id: item?.id,
        drug_id: item?.drug?.id,
        strength: item?.strength,
        strength_input: item.strength_input,
        price: item.selling_price,
        quantity_remaining: item.quantity_remaining,
        unit_name: item?.unit?.name,
        unit_id: item?.unit?.id,
        dosage_form: item?.dosage_form,
        drug_type: item?.drug_type,
      }));
    },
    routes() {
      return this.$store.state.pharmacy.routes;
    },
  },
  methods: {
    addItem() {
      this.items.push({
        id: randomId(),
        dosage_form: '',
        route: '',
        frequency: '',
        drug: '',
        prescribed_strength: '',
        quantity: '',
        price: '',
      });
    },

    removeItem(index) {
      this.items.splice(index, 1);
    },

    searchDrugs(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debounceSearch(search, this, loading);
      }
    },

    debounceSearch: debounce((search, vm, loading) => {
      vm.$store
        .dispatch('store/fetchPharmacyItems', {
          currentPage: 1,
          itemsPerPage: 10,
          search,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    getRoutes() {
      this.$store.dispatch('pharmacy/fetchRoutesAndMeasurements', {
        dosage_form_id: this.dosage_form.id,
      });
    },

    setDrugInfo(index) {
      this.strength = this.items[index].drug.strength;
      this.dosage_form = this.items[index].drug.dosage_form;
      this.items[index].dosage_form = this.items[index].drug.dosage_form.name;
      this.items[index].prescribed_strength = this.items[index].drug.strength_input;
      this.items[index].price = this.items[index].drug.price;
      this.getRoutes();
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.$router.go(-1);
    },

    initValues() {
      this.items = [
        {
          id: randomId(),
          dosage_form: '',
          route: '',
          frequency: '',
          drug: '',
          prescribed_strength: '',
          quantity: '',
          price: '',
        },
      ];
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    submitForm() {
      const submitButton = this.$refs['kt-ancRoutineDrugsSubmit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('model/addDefault', {
          type: this.type,
          data: this.items,
        })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped></style>
