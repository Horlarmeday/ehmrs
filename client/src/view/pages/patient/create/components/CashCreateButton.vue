<template>
  <div>
    <b-dropdown
      split
      text="Start OPD Visit"
      class="float-right"
      variant="primary"
    >
      <b-dropdown-item href="#">Start IPD Visit</b-dropdown-item>
      <b-dropdown-item href="#">Start Emergency Visit</b-dropdown-item>
    </b-dropdown>
    <button
      ref="kt-submit"
      class="btn btn-light-primary font-weight-bold float-right mr-4"
      @click="createPatient"
    >
      Save
    </button>
  </div>
</template>

<script>
export default {
  name: "CashCreateButton",
  // props: {
  //   createPatient: {
  //     type: Function,
  //     required: true
  //   }
  // },
  methods: {
    createPatient() {
      this.$emit("createPatient");
    }
  }
};
</script>

<style scoped></style>
