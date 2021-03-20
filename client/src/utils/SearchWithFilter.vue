<template>
  <!--begin: Search Form-->
  <div class="card-body py-1">
    <div class="row">
      <div class="col-lg-3 mb-lg-0 mb-6">
        <label>Search:</label>
        <input
          type="text"
          class="form-control datatable-input"
          placeholder="Type and press enter to search"
          data-col-index="0"
          v-model="search"
          @keypress.enter="onSearch"
        />
      </div>
      <div class="col-lg-3  mb-lg-0 mb-6">
        <label>{{ label }}:</label>
        <select
          class="form-control datatable-input"
          data-col-index="2"
          v-model="id"
          @change="onFilter"
        >
          <option :value="d.id" v-for="(d, index) in data" :key="index">{{
            d.name
          }}</option>
        </select>
      </div>
    </div>
  </div>
  <!--begin: Datatable-->
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      id: "",
      search: ""
    };
  },
  methods: {
    onSearch() {
      this.$emit("search", this.search);
    },
    onFilter() {
      this.$emit("filter", this.id);
    }
  }
};
</script>

<style scoped></style>
