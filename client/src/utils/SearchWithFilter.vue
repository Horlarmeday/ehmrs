<template>
  <!--begin: Search Form-->
  <div class="card-body py-1">
    <div class="row">
      <div class="col-lg-3 mb-lg-0 mb-6">
        <label>Search:</label>
        <div ref="spin">
          <input
            type="text"
            class="form-control datatable-input"
            placeholder="Search..."
            v-model="search"
            @keyup="onSearch"
          />
        </div>
      </div>
      <div class="col-lg-3  mb-lg-0 mb-6">
        <label>{{ label }}:</label>
        <select
          class="form-control datatable-input"
          data-col-index="2"
          v-model="id"
          @change="onFilter"
        >
          <option :selected="selected" :value="d.id" v-for="(d, index) in data" :key="index">{{
            d.name
          }}</option>
        </select>
      </div>
    </div>
  </div>
  <!--begin: Datatable-->
</template>

<script>
import { addSpinner } from '@/common/common';

export default {
  props: {
    label: {
      type: String,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
    selected: {
      type: Number,
      required: false,
    },
  },
  data() {
    return {
      id: '',
      search: '',
    };
  },
  methods: {
    onSearch() {
      const spinDiv = this.$refs['spin'];
      addSpinner(spinDiv);
      this.$emit('search', { search: this.search, spinDiv });
    },

    onFilter() {
      this.$emit('filter', this.id);
    },
  },
};
</script>

<style scoped></style>
