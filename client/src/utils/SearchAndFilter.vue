<template>
  <div class="card-body py-1">
    <div class="form-group row mb-2">
      <div class="col-lg-6">
        <label>Search:</label>
        <div ref="spinning">
          <input
            class="form-control"
            :placeholder="placeHolder"
            v-model="search"
            @keyup="onSearch"
          />
        </div>
      </div>
      <div class="col-lg-3">
        <label>Drug Type:</label>
        <select @change="onFilterByDrugType" v-model="drug_type" class="form-control">
          <option disabled>Select</option>
          <option :value="type" v-for="(type, i) in drugTypes" :key="i">{{ type }}</option>
        </select>
      </div>
      <div class="col-lg-3">
        <label>Drug Form:</label>
        <select v-model="drug_form" @change="onFilterByDrugForm" class="form-control">
          <option disabled>Select</option>
          <option :value="form" v-for="(form, i) in drugForms" :key="i">{{ form }}</option>
        </select>
      </div>
    </div>
    <div class="form-group row">
      <div class="col-lg-4">
        <label>Dosage Forms</label>
        <select @change="onFilterByDrugDosageForm" v-model="dosage_form" class="form-control">
          <option disabled>Select</option>
          <option :value="dosageForm.id" v-for="(dosageForm, i) in dosageForms" :key="i">{{
            dosageForm.name
          }}</option>
        </select>
      </div>
      <div class="col-lg-4">
        <label>Sort</label>
        <select @change="onSort" v-model="sort" class="form-control w-400px">
          <option :value="option.value" v-for="(option, i) in options" :key="i">{{
            option.text
          }}</option>
        </select>
      </div>
    </div>

    <!--    <div class="input-group">-->
    <!--      <div ref="spinning" class="w-550px">-->
    <!--        <input class="form-control" :placeholder="placeHolder" v-model="search" @keyup="onSearch" />-->
    <!--      </div>-->
    <!--      <div class="input-group-append">-->
    <!--        <select @change="onFilterByDrugType" v-model="drug_type" class="form-control">-->
    <!--          <option disabled>Select</option>-->
    <!--          <option :value="type" v-for="(type, i) in drugTypes" :key="i">{{ type }}</option>-->
    <!--        </select>-->
    <!--        <select v-model="drug_form" @change="onFilterByDrugForm" class="form-control">-->
    <!--          <option disabled>Select</option>-->
    <!--          <option :value="form" v-for="(form, i) in drugForms" :key="i">{{ form }}</option>-->
    <!--        </select>-->
    <!--        <select @change="onSort" v-model="sort" class="form-control w-400px">-->
    <!--          <option :value="option.value" v-for="(option, i) in options" :key="i">{{-->
    <!--            option.text-->
    <!--          }}</option>-->
    <!--        </select>-->
    <!--      </div>-->
    <!--    </div>-->
  </div>
</template>

<script>
import { addSpinner } from '@/common/common';

export default {
  name: 'SearchAndFilter',
  data() {
    return {
      search: this.$route.query.search || '',
      sort: 'createdAt_desc',
      options: [
        { value: 'createdAt_asc', text: 'Date Created (Ascending)' },
        { value: 'createdAt_desc', text: 'Date Created (Descending)' },
        { value: 'date_received_asc', text: 'Date Received (Ascending)' },
        { value: 'date_received_desc', text: 'Date Received (Ascending)' },
        { value: 'drug_name_asc', text: 'Drug Name (A-Z)' },
        { value: 'drug_name_desc', text: 'Drug Name (Z-A)' },
      ],
      drugForms: ['Drug', 'Consumable'],
      drugTypes: ['Cash', 'NHIS', 'Private', 'Retainership'],
      drug_form: '',
      drug_type: '',
      dosage_form: '',
    };
  },
  computed: {
    dosageForms() {
      return this.$store.state.pharmacy.dosageForms;
    },
  },
  props: {
    placeHolder: {
      type: String,
      required: true,
    },
  },
  methods: {
    onSearch() {
      const spinDiv = this.$refs['spinning'];
      addSpinner(spinDiv);
      this.$emit('search', { search: this.search, spinDiv });
    },
    onSort() {
      this.$emit('sort', this.sort);
    },
    onFilterByDrugForm() {
      this.$emit('filterByDrugForm', { drug_form: this.drug_form });
    },
    onFilterByDrugType() {
      this.$emit('filterByDrugType', { drug_type: this.drug_type });
    },
    onFilterByDrugDosageForm() {
      this.$emit('filterByDosageForm', { dosage_form_id: this.dosage_form });
    },
    getDosageForms() {
      this.$store.dispatch('pharmacy/fetchDosageForms');
    },
  },
  created() {
    this.getDosageForms();
  },
};
</script>

<style scoped></style>
