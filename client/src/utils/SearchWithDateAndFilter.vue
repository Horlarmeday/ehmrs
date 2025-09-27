<template>
  <!--begin: Search Form-->
  <div class="card-body py-1 px-0">
    <div class="d-flex align-items-center justify-content-between flex-wrap mt-2">
      <div class="col-lg-3">
        <div ref="spin">
          <input
            type="text"
            class="form-control"
            placeholder="Search"
            data-col-index="0"
            v-model="search"
            @keyup="onSearch"
          />
        </div>
      </div>
      <div class="col-lg-3 mb-lg-0 mb-6">
        <label>{{ label }}:</label>
        <select
          class="form-control datatable-input"
          data-col-index="2"
          v-model="id"
          @change="onFilter"
        >
          <option :selected="selected" :value="d.id" v-for="(d, index) in data" :key="index">
            {{ d.name }}
          </option>
        </select>
      </div>
      <div v-if="showDateFilter">
        <div>
          <date-range @searchByDate="onSearchByDate" />
        </div>
      </div>
    </div>
    <br />
  </div>
  <!--begin: Datatable-->
</template>

<script>
import { addSpinner } from '@/common/common';
import DateRange from '@/utils/DateRange.vue';

export default {
  components: { DateRange },
  props: {
    showDateFilter: {
      type: Boolean,
      required: false,
      default: false,
    },
    label: {
      type: String,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
    selected: {
      type: String,
      required: false,
    },
  },

  data() {
    return {
      search: this.$route.query.search || '',
    };
  },
  methods: {
    onSearch() {
      const spinDiv = this.$refs['spin'];
      addSpinner(spinDiv);
      this.$emit('search', { search: this.search, spinDiv });
    },

    onSearchByDate(range) {
      const { start, end, dateSpin } = range;
      this.$emit('filterByDateRange', { start, end, dateSpin });
    },
  },
};
</script>

<style scoped></style>
