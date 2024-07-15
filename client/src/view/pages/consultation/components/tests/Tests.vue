<template>
  <div class="flex-row-fluid ml-lg-8">
    <RoutineTests
      :display-prompt="displayPrompt"
      @closeModal="hideModal"
      :show-switch="showSwitch"
      :source="source"
      :switch-position="switchPosition"
    />
    <div class="card-custom">
      <div class="card-header">
        <tests-accordion />
        <div class="card-title mt-2">
          <span class="card-label font-weight-bolder text-dark"></span>
          <span v-if="showSwitch">
            <switch-box
              :switch-position="switchPosition"
              :switch-spot="switchSpot"
              @switchSpot="flipSwitch"
              :insurance-name="insuranceName"
            />
          </span>
          <div class="mr-2">
            <button
              v-if="selectedTests.length"
              ref="kt-orderTest-submit"
              class="btn btn-primary btn-sm float-right ml-2 mb-3"
              @click="submitLabTest"
            >
              Submit
            </button>
          </div>
          <div v-if="currentUser?.sub_role === ANTENATAL" class="">
            <a
              title="Routine Tests"
              v-b-tooltip.hover
              href="#"
              @click="openModal"
              class="btn btn-icon btn-light-primary mr-3"
            >
              <i class="fas fa-syringe"></i>
            </a>
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
import SwitchBox from '@/utils/SwitchBox.vue';
import { parseJwt } from '@/common/common';
import RoutineTests from '@/view/pages/programs/antenatal/components/RoutineTests.vue';

export default {
  name: 'Tests',
  components: { RoutineTests, SwitchBox, TestsAccordion },
  data() {
    return {
      checkmark: 'flaticon2-check-mark',
      isDisabled: false,
      displayPrompt: false,
      switchSpot: true,
      currentUser: parseJwt(localStorage.getItem('user_token')),
      ANTENATAL: 'ANC',
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
    insuranceName: {
      type: String,
      required: false,
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
        test_type: this.getTestType(this.insuranceName),
        price: test.price,
        name: test.name,
        sample_id: test.sample_id,
        source: this.source,
        ...(this.source === 'Antenatal' && { ante_natal_id: this.$route.query.antenatal }),
      };
    },

    getTestType(insuranceName) {
      const isSwitchOn = this.switchSpot && this.switchPosition;
      if (isSwitchOn) return 'NHIS';
      const insuranceMapping = {
        FHSS: 'NHIS',
        NHIS: 'NHIS',
        PHIS: 'Private',
        Retainership: 'Cash',
      };
      const selectedInsurance = insuranceMapping[insuranceName];
      if (selectedInsurance === 'NHIS' && !isSwitchOn) return 'Cash';
      return insuranceMapping[insuranceName] || 'Cash';
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

    flipSwitch(value) {
      this.switchSpot = value;
      this.$emit('switchFlipped', value);
    },

    openModal() {
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },
  },
};
</script>

<style scoped></style>
