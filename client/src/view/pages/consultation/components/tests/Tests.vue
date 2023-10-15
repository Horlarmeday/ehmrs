<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card-custom">
      <div class="card-header">
        <tests-accordion />
        <div class="card-title">
          <span class="card-label font-weight-bolder text-dark"></span>
          <span v-if="showSwitch" class="switch switch-sm switch-icon">
            <label>
              <input
                @change="flipSwitch($event)"
                type="checkbox"
                :checked="switchPosition && switchSpot"
              />
              <span />
            </label>
          </span>
          <div class="">
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
      </div>

      <hr />
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
import TestsAccordion from '@/view/components/accordion/TestsAccordion.vue';

export default {
  name: 'Tests',
  components: { TestsAccordion },
  data() {
    return {
      checkmark: 'flaticon2-check-mark',
      isDisabled: false,
      switchSpot: true,
    };
  },
  props: {
    switchPosition: {
      type: Boolean,
      required: true,
    },
    showSwitch: {
      type: Boolean,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
  },
  computed: {
    tests() {
      return this.$store.state.laboratory.tests;
    },
    selectedTests() {
      return this.$store.state.order.selectedTests;
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
        test_type: this.switchPosition && this.switchSpot ? 'NHIS' : 'CASH',
        price: test.price,
        name: test.name,
        sample_id: test.sample_id,
        source: this.source,
        ...(this.source === 'Antenatal' && { ante_natal_id: this.$route.query.antenatal }),
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

    endRequest(button) {
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
          id: this.$route.params.id,
        })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    initValues() {
      this.$store.dispatch('order/emptySelectedTest');
      this.$store.dispatch('order/emptySelectedButtons');
    },

    flipSwitch(event) {
      this.switchSpot = !!event.target.checked;
    },
  },
};
</script>

<style scoped></style>
