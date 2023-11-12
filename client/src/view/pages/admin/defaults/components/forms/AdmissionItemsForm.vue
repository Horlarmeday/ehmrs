<template>
  <div>
    <SectionTitle text="Admission Items" />
    <div v-for="(item, i) in items" :key="i">
      <div class="form-group row">
        <div class="col-lg-4">
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
        <div class="col-lg-2">
          <label>Quantity:</label>
          <input type="number" class="form-control form-control-sm" v-model="item.quantity" />
        </div>
        <div class="col-lg-3">
          <label>Ages</label>
          <select class="form-control form-control-sm" v-model="item.age">
            <option :value="age.code" v-for="(age, i) in ages" :key="i">{{ age.name }}</option>
          </select>
        </div>
        <div class="col-lg-2">
          <label>Sex</label>
          <select class="form-control form-control-sm" v-model="item.sex">
            <option :value="sex" v-for="(sex, i) in sexes" :key="i">{{ sex }}</option>
          </select>
        </div>
        <a href="#" class="col-lg-1 col-form-label mt-lg-5">
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
      :disabled="isDisabled"
      @click="submitForm"
      ref="kt-admissionForm"
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
        drug: '',
        quantity: 1,
        sex: '',
        age: '',
      },
    ],
    itemsPerPage: 10,
    isDisabled: false,
    ages: [
      {
        name: 'All ages',
        code: 'ALL_AGES',
      },
      {
        name: 'Less than and equal to 1',
        code: 'LESS_THAN_EQUAL_TO_ONE',
      },
      {
        name: 'Greater than 1 and less than equal to 15',
        code: 'GREATER_THAN_ONE_LESS_THAN_FIFTEEN',
      },
      {
        name: 'Greater than 15',
        code: 'GREATER_THAN_FIFTEEN',
      },
    ],
    sexes: ['Both', 'Female', 'Male'],
    isDefault: false,
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
        id: randomId(),
        drug: '',
        quantity: 1,
        sex: '',
        age: '',
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
          id: randomId(),
          drug: '',
          quantity: 1,
          sex: '',
          age: '',
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
      const submitButton = this.$refs['kt-admissionForm'];
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
