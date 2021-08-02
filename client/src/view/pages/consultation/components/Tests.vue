<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card card-custom gutter-b">
      <div class="card-header pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Lab Tests</span>
        </h3>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-lg-3" v-for="(test, i) in tests" :key="test.id">
            <button
              @click="selectTest(test, i)"
              ref="selected"
              class="btn btn-outline-primary btn-block btn-sm mb-4"
            >
              {{ test.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { deleteArrayElement } from "../../../../common/common";

export default {
  name: "Tests",
  data() {
    return {
      selectedTests: [],
      checkmark: "flaticon2-check-mark"
    };
  },
  computed: {
    tests() {
      return this.$store.state.laboratory.tests;
    }
  },
  methods: {
    addSelectedClass(button) {
      button.classList.add("btn-danger");
    },

    removeSelectedClass(button) {
      button.classList.remove("btn-danger");
    },

    selectTest(value, i) {
      const button = this.$refs["selected"][i];
      const found = this.selectedTests.find(element => element === value);
      if (found) {
        this.removeSelectedClass(button);
        this.selectedTests = deleteArrayElement(this.selectedTests, found);
      } else {
        this.addSelectedClass(button);
        this.selectedTests.push(value);
      }
    }
  }
};
</script>

<style scoped></style>
