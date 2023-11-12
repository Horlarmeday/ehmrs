<template>
  <div>
    <SectionTitle text="Theater Operation Items" />
    <div v-for="(item, i) in items" :key="i">
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
            :options="drugOptions"
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
        <a href="#" class="col-lg-2 col-form-label mt-lg-5">
          <i v-if="i === 0" class="far fa-plus-square mr-3 text-primary icon-lg" @click="addItem" />
          <i
            class="far fa-trash-alt icon-md text-danger icon-lg mt-lg-3"
            v-if="i !== 0"
            @click="removeItem(i)"
          />
        </a>
      </div>
    </div>
    <button
      @click="submitForm"
      :disabled="isDisabled"
      ref="kt-operationForm"
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
    items: [
      {
        drug: '',
        quantity: 1,
        id: randomId(),
      },
    ],
    isDisabled: false,
  }),
  props: {
    type: {
      type: String,
      required: true,
    },
  },
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
  },
  methods: {
    searchGenericDrugs(search, loading) {
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

    addItem() {
      this.items.push({
        drug: '',
        quantity: 1,
        id: randomId(),
      });
    },

    removeItem(index) {
      this.items.splice(index, 1);
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.$router.go(-1);
    },

    initValues() {
      this.items = [
        {
          drug: '',
          quantity: 1,
          id: randomId(),
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
      const submitButton = this.$refs['kt-operationForm'];
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
