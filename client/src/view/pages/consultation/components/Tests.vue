<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card card-custom gutter-b">
      <div class="card-header pt-5">
        <div class="card-title">
          <span class="card-label font-weight-bolder text-dark">Lab Tests</span>
          <button
            v-if="selectedTests.length"
            ref="kt-orderTest-submit"
            class="btn btn-primary btn-sm float-right mr-2"
            @click="submitLabTest"
          >
            Submit
          </button>
          <span
            v-if="showSwitch"
            class="switch switch-sm switch-icon float-right"
          >
            <label>
              <input
                @change="dispatchTests($event)"
                type="checkbox"
                :checked="showSwitch"
              />
              <span />
            </label>
          </span>
        </div>
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
    testType() {
      return this.$store.state.consultation.testType;
    },
    tests() {
      if (this.testType === "CASH") return this.$store.state.laboratory.tests;
      return this.$store.state.laboratory.nhisTests;
    },
    selectedTests() {
      return this.$store.state.order.selectedTests;
    },
    visit() {
      return this.$store.state.visit.visit;
    },
    showSwitch() {
      return (
        this.visit.patient.has_insurance &&
        this.visit.patient.insurance_id !== 4
      );
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
      const found = this.selectedTests.find(
        test => test.test_id === value.id && test.test_type === value.test_type
      );
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
        test_type: test?.type ? "NHIS" : "CASH",
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
    },

    changeTestsType(type) {
      this.$store.dispatch("consultation/changeTestsType", type);
    },

    fetchTests(type) {
      this.$store.dispatch(type, {
        currentPage: 1,
        itemsPerPage: 100,
        filter: this.$store.state.consultation.sampleId
      });
    },

    dispatchTests(event) {
      if (event.target.checked) {
        this.changeTestsType("NHIS");
        this.fetchTests("laboratory/fetchNhisTests");
      } else {
        this.changeTestsType("CASH");
        this.fetchTests("laboratory/fetchTests");
      }
    }
  }
};
</script>

<style scoped></style>
