<template>
  <!--begin: Search Form-->
  <div class="card-body py-1">
    <div class="row">
      <div class="col-lg-3 mb-lg-0 mb-5">
        <div ref="spin">
<!--          <label class="pr-0">Search:</label>-->
          <input
            type="text"
            class="form-control datatable-input"
            placeholder="Search"
            data-col-index="0"
            v-model="search"
            @keyup="onSearch"
          />
        </div>
      </div>
    </div>
    <br />
  </div>
  <!--begin: Datatable-->
</template>

<script>
import { addSpinner } from '@/common/common';

export default {
  data() {
    return {
      search: '',
    };
  },
  methods: {
    onSearch() {
      const spinDiv = this.$refs['spin'];
      addSpinner(spinDiv);
      this.$emit('search', { search: this.search, spinDiv });
    },
  },
};
</script>

<style scoped></style>
