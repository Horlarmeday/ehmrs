<template>
  <div class="form-group">
    <label>Find {{ label }} By Date</label>
    <div class="input-daterange input-group">
      <datepicker
        v-model="start"
        input-class="form-control"
        placeholder="Start"
      ></datepicker>
      <div class="input-group-append">
        <span class="input-group-text"><i class="la la-ellipsis-h"></i></span>
      </div>
      <datepicker
        v-model="end"
        input-class="form-control"
        placeholder="End"
      ></datepicker>
      <div class="input-group-append">
        <button type="button" class="btn btn-primary" @click="onFilter">
          Filter
        </button>
      </div>
    </div>
    <span class="form-text text-muted">Select Date Range</span>
  </div>
</template>

<script>
import Datepicker from "vuejs-datepicker";
export default {
  props: {
    label: {
      type: String,
      required: true
    }
  },
  components: {
    Datepicker
  },
  data() {
    return {
      start: "",
      end: ""
    };
  },
  methods: {
    notifyEmptyField() {
      return this.$notify({
        group: "foo",
        title: "Error message",
        text: "Date fields cannot be left empty",
        type: "error"
      });
    },

    onFilter() {
      if (!this.start || !this.end) return this.notifyEmptyField();
      this.$emit("filterbydate", this.start, this.end);
    }
  }
};
</script>

<style></style>
