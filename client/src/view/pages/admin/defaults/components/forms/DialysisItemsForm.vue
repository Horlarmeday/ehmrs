<template>
  <div>
    <SectionTitle text="Dialysis Items" />

    <!-- Drugs Section -->
    <div class="card card-custom gutter-b mb-5">
      <div class="card-header">
        <h3 class="card-title">
          <span class="card-label font-weight-bolder text-dark">Drugs</span>
        </h3>
      </div>
      <div class="card-body">
        <div v-for="(item, i) in drugs" :key="`drug-${i}`">
          <div class="form-group row">
            <div class="col-lg-4">
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
                    route: drugs?.route,
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
            <div class="col-lg-2">
              <label>Dosage Form:</label>
              <input
                readonly
                type="text"
                class="form-control-sm form-control"
                v-model="item.dosage_form"
              />
            </div>
            <div class="col-lg-2">
              <label>Route:</label>
              <input
                readonly
                type="text"
                class="form-control-sm form-control"
                v-model="item.route"
              />
            </div>
            <div class="col-lg-2">
              <label>Strength:</label>
              <input
                type="number"
                class="form-control form-control-sm"
                v-model="item.prescribed_strength"
              />
            </div>
            <div class="col-lg-1">
              <label>Quantity:</label>
              <input
                v-model="item.quantity"
                class="form-control-sm form-control"
                type="number"
                name="quantity"
                v-validate="'required'"
                data-vv-validate-on="blur"
              />
            </div>
            <div class="col-lg-1 pt-lg-5">
              <a href="#" class="col-form-label">
                <i
                  v-if="i === 0"
                  class="far fa-plus-square mr-3 text-primary icon-lg"
                  @click="addDrug"
                />
                <i
                  class="far fa-trash-alt icon-md text-danger icon-lg"
                  v-if="i !== 0"
                  @click="removeDrug(i)"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Consumables Section -->
    <div class="card card-custom gutter-b mb-5">
      <div class="card-header">
        <h3 class="card-title">
          <span class="card-label font-weight-bolder text-dark">Consumables</span>
        </h3>
      </div>
      <div class="card-body">
        <div v-for="(item, i) in consumables" :key="`consumable-${i}`">
          <div class="form-group row">
            <div class="col-lg-6">
              <label>Item:</label>
              <v-select
                v-validate="'required'"
                data-vv-validate-on="blur"
                name="drug"
                @search="searchGenericDrugs"
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
                :options="consumableOptions"
              >
                <template #option="{ drug_type, name }">
                  <span>{{ name }} - </span>
                  <em> {{ drug_type || '' }}</em>
                </template>
              </v-select>
            </div>
            <div class="col-lg-4">
              <label>Quantity:</label>
              <input type="number" class="form-control form-control-sm" v-model="item.quantity" />
            </div>
            <div class="col-lg-2 pt-lg-5">
              <a href="#" class="col-form-label">
                <i
                  v-if="i === 0"
                  class="far fa-plus-square mr-3 text-primary icon-lg"
                  @click="addConsumable"
                />
                <i
                  class="far fa-trash-alt icon-md text-danger icon-lg"
                  v-if="i !== 0"
                  @click="removeConsumable(i)"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button
      @click="submitForm"
      :disabled="isDisabled"
      ref="kt-dialysisForm"
      class="btn btn-primary float-right"
    >
      Submit
    </button>
  </div>
</template>

<script>
import SectionTitle from '@/utils/SectionTitle.vue';
import vSelect from 'vue-select';
import { debounce, randomId } from '@/common/common';

export default {
  components: { SectionTitle, vSelect },
  data: () => ({
    drugs: [
      {
        id: randomId(),
        dosage_form: '',
        route: '',
        drug: '',
        prescribed_strength: '',
        quantity: '',
        price: '',
        type: 'drug',
      },
    ],
    consumables: [
      {
        id: randomId(),
        drug: '',
        quantity: 1,
        type: 'consumable',
      },
    ],
    isDisabled: false,
    itemsPerPage: 20,
  }),
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  computed: {
    storeItems() {
      return this.$store.state.store.items;
    },
    drugOptions() {
      return this.storeItems
        .filter(item => item?.drug_form === 'Drug')
        .map(item => ({
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
          route: item?.route,
        }));
    },
    consumableOptions() {
      return this.storeItems
        .filter(item => item?.drug_form === 'Consumable')
        .map(item => ({
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
          route: item?.route,
        }));
    },
  },
  methods: {
    searchGenericDrugs(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debounceSearch(search, this, loading);
      }
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
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    addDrug() {
      this.drugs.push({
        id: randomId(),
        dosage_form: '',
        route: '',
        drug: '',
        prescribed_strength: '',
        quantity: '',
        price: '',
        type: 'drug',
      });
    },

    removeDrug(index) {
      this.drugs.splice(index, 1);
    },

    addConsumable() {
      this.consumables.push({
        id: randomId(),
        drug: '',
        quantity: 1,
        type: 'consumable',
      });
    },

    removeConsumable(index) {
      this.consumables.splice(index, 1);
    },

    setDrugInfo(index) {
      this.drugs[index].dosage_form = this.drugs[index].drug.dosage_form?.name || '';
      this.drugs[index].route = this.drugs[index].drug.route?.name || '';
      this.drugs[index].prescribed_strength = this.drugs[index].drug.strength_input || '';
      this.drugs[index].price = this.drugs[index].drug.price || '';
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.$router.go(-1);
    },

    initValues() {
      this.drugs = [
        {
          id: randomId(),
          dosage_form: '',
          route: '',
          drug: '',
          prescribed_strength: '',
          quantity: '',
          price: '',
          type: 'drug',
        },
      ];
      this.consumables = [
        {
          id: randomId(),
          drug: '',
          quantity: 1,
          type: 'consumable',
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
      const submitButton = this.$refs['kt-dialysisForm'];
      this.addSpinner(submitButton);

      // Combine drugs and consumables into a single array
      const allItems = [...this.drugs, ...this.consumables];

      this.$store
        .dispatch('model/addDefault', {
          type: this.type,
          data: allItems,
        })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped></style>
