<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card card-custom gutter-b">
      <div class="card-header pt-5">
        <div class="card-title">
          <span class="card-label font-weight-bolder text-dark">Lab Tests</span>
          <span v-if="showSwitch" class="switch switch-sm switch-icon float-right">
            <label>
              <input @change="flipSwitch($event)" type="checkbox" :checked="switchPosition" />
              <span />
            </label>
          </span>
        </div>
        <div>
          <button
            v-if="selectedTests.length"
            ref="kt-orderTest-submit"
            class="btn btn-primary btn-sm float-right mr-2"
            @click="submitLabTest"
          >
            Submit
          </button>
        </div>
      </div>
      <hr>
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
  name: 'Tests',
  data() {
    return {
      checkmark: 'flaticon2-check-mark',
      isDisabled: false,
      switchPosition: false,
    };
  },
  created() {
    this.defaultSwitchPosition();
  },
  computed: {
    tests() {
      return this.$store.state.laboratory.tests;
    },
    selectedTests() {
      return this.$store.state.order.selectedTests;
    },
    visit() {
      return this.$store.state.visit.visit;
    },
    showSwitch() {
      return this.visit?.patient?.has_insurance && this.visit?.patient?.insurance_id !== 4;
    },
  },
  methods: {
    selectTest(value, i) {
      const button = this.$refs['selected'][i];
      const found = this.selectedTests.find(test => test.test_id === value.id);
      if (found) {
        this.$store.dispatch('order/removeSelectedTest', this.mapSelectedTest(value));
        this.$store.dispatch('order/removeSelectedButton', value.id);
      } else {
        this.$store.dispatch('order/addSelectedTest', this.mapSelectedTest(value));
        this.$store.dispatch('order/addSelectedButton', { button, button_id: value.id });
      }
    },

    mapSelectedTest(test) {
      return {
        test_id: test.id,
        is_urgent: false,
        test_type: this.switchPosition ? 'NHIS' : 'CASH',
        price: test.price,
        name: test.name,
      };
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    initializeRequest(button) {
      this.removeSpinner(button);
      this.initValues();
    },

    submitLabTest() {
      const submitButton = this.$refs['kt-orderTest-submit'];
      this.addSpinner(submitButton);
      const tests = this.selectedTests.map(test => {
        delete test.name;
        return test;
      });
      this.$store
        .dispatch('order/orderLabTest', {
          tests,
          id: this.$route.params.visitId,
        })
        .then(() => this.initializeRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    initValues() {
      this.$store.dispatch('order/emptySelectedTest');
      this.$store.dispatch('order/emptySelectedButtons');
    },

    defaultSwitchPosition() {
      if (this.visit?.patient?.has_insurance && this.visit?.patient?.insurance_id !== 4) {
        this.switchPosition = true;
      }
    },

    flipSwitch(event) {
      this.switchPosition = !!event.target.checked;
    },
  },
};
</script>

<style scoped></style>
