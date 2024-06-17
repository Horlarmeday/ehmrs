<template>
  <div class="card-body py-1">
    <div class="input-group">
      <div ref="spinning" class="w-550px">
        <input class="form-control" :placeholder="placeHolder" v-model="search" @keyup="onSearch" />
      </div>
      <div class="input-group-append">
        <select @change="onFilterByDrugType" v-model="drug_type" class="form-control">
          <option :value="type" v-for="(type, i) in drugTypes" :key="i">{{ type }}</option>
        </select>
        <select v-model="drug_form" @change="onFilterByDrugForm" class="form-control">
          <option :value="form" v-for="(form, i) in drugForms" :key="i">{{ form }}</option>
        </select>
        <select @change="onSort" v-model="sort" class="form-control w-400px">
          <option :value="option.value" v-for="(option, i) in options" :key="i">{{
            option.text
          }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { addSpinner } from '@/common/common';

export default {
  name: 'SearchAndFilter',
  data() {
    return {
      search: '',
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
      drug_form: 'Drug',
      drug_type: 'Cash',
    };
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
      console.log(this.drug_type);
      this.$emit('filterByDrugType', { drug_type: this.drug_type });
    },
  },
};
</script>

<style scoped></style>
