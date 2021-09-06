<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card card-custom gutter-b">
      <div class="card-header pt-5">
        <h3 class="card-title">
          <span class="card-label font-weight-bolder text-dark">Lab Tests</span>
          <button
            v-if="selectedTests.length"
            ref="kt-orderTest-submit"
            class="btn btn-primary btn-sm"
            @click="submitLabTest"
          >
            Submit
          </button>
          <!--          <span class="switch switch-sm switch-icon float-right">-->
          <!--            <label>-->
          <!--              <input type="checkbox" checked="checked" name="select" />-->
          <!--              <span></span>-->
          <!--            </label>-->
          <!--          </span>-->
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
export default {
  name: "Tests",
  data() {
    return {
      checkmark: "flaticon2-check-mark",
      isDisabled: false
    };
  },
  computed: {
    tests() {
      return this.$store.state.laboratory.tests;
    },
    selectedTests() {
      return this.$store.state.order.selectedTests;
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
      const found = this.selectedTests.find(test => test.test_id === value.id);
      if (found) {
        this.removeSelectedClass(button);
        this.$store.dispatch(
          "order/removeSelectedTest",
          this.mapSelectedTest(value)
        );
      } else {
        this.addSelectedClass(button);
        this.$store.dispatch(
          "order/addSelectedTest",
          this.mapSelectedTest(value)
        );
      }
    },

    mapSelectedTest(test) {
      return {
        test_id: test.id,
        test_type: "CASH",
        price: test.price,
        name: test.name
      };
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add("spinner", "spinner-light", "spinner-right");
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove(
        "spinner",
        "spinner-light",
        "spinner-right"
      );
    },

    initializeRequest(button) {
      this.removeSpinner(button);
      this.removeAllSelectedButton();
      this.initValues();
    },

    removeAllSelectedButton() {
      const buttons = this.$refs["selected"];
      for (let i = 0; i < buttons; i++) {
        buttons[i].classList.remove("btn-danger");
      }
    },

    submitLabTest() {
      const submitButton = this.$refs["kt-orderTest-submit"];
      this.addSpinner(submitButton);
      const tests = this.selectedTests.map(test => {
        delete test.name;
        return test;
      });
      this.$store
        .dispatch("order/orderLabTest", {
          tests,
          id: this.$route.params.visitId
        })
        .then(() => this.initializeRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    initValues() {
      this.$store.dispatch("order/emptySelectedTest");
    }
  }
};
</script>

<style scoped></style>
