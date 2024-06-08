<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card-custom">
      <div class="card-header">
        <investigation-accordion />
        <div class="card-title">
          <span class="card-label font-weight-bolder text-dark"></span>
          <span v-if="showSwitch">
            <switch-box
              :switch-position="switchPosition"
              :switch-spot="switchSpot"
              @switchSpot="flipSwitch"
              :insurance-name="insuranceName"
            />
          </span>
          <div>
            <button
              v-if="selectedInvestigations.length"
              ref="kt-orderInvestigation-submit"
              class="btn btn-primary btn-sm float-right mr-2"
              @click="submitRadiologyTest"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <hr />
      <div class="card-body">
        <div class="row">
          <div
            class="col-lg-3"
            v-for="(investigation, i) in investigations"
            :key="investigation.id"
          >
            <button
              @click="selectInvestigation(investigation, i)"
              ref="selectedRadiology"
              class="btn btn-outline-primary btn-block btn-sm mb-4"
            >
              {{ investigation.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InvestigationAccordion from '@/view/components/accordion/InvestigationAccordion.vue';
import SwitchBox from '@/utils/SwitchBox.vue';

export default {
  name: 'Investigations',
  components: { SwitchBox, InvestigationAccordion },
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
    insuranceName: {
      type: String,
      required: false,
    },
  },
  computed: {
    investigations() {
      return this.$store.state.radiology.investigations;
    },
    selectedInvestigations() {
      return this.$store.state.order.selectedInvestigations;
    },
  },
  methods: {
    selectInvestigation(value, i) {
      const button = this.$refs['selectedRadiology'][i];
      const found = this.selectedInvestigations.find(
        investigation => investigation.investigation_id === value.id
      );
      if (found) {
        this.$store.dispatch(
          'order/removeSelectedInvestigation',
          this.mapSelectedInvestigation(value)
        );
        this.$store.dispatch('order/removeSelectedInvestigationButton', value.id);
      } else {
        this.$store.dispatch(
          'order/addSelectedInvestigation',
          this.mapSelectedInvestigation(value)
        );
        this.$store.dispatch('order/addSelectedInvestigationButton', {
          button,
          button_id: value.id,
        });
      }
    },

    getInvestigationType(insuranceName) {
      const types = ['FHSS', 'NHIS'];
      if (types.includes(insuranceName)) return 'NHIS';
      if (insuranceName === 'PHIS') return 'Private';
      return 'NHIS';
    },

    mapSelectedInvestigation(investigation) {
      return {
        investigation_id: investigation.id,
        imaging_id: investigation.imaging_id,
        is_urgent: false,
        investigation_type:
          this.switchPosition && this.switchSpot
            ? this.getInvestigationType(this.insuranceName)
            : 'CASH',
        price: investigation.price,
        name: investigation.name,
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

    initializeRequest(button) {
      this.removeSpinner(button);
      this.initValues();
    },

    submitRadiologyTest() {
      const submitButton = this.$refs['kt-orderInvestigation-submit'];
      this.addSpinner(submitButton);
      const investigations = this.selectedInvestigations.map(investigation => {
        delete investigation.name;
        return investigation;
      });
      this.$store
        .dispatch('order/orderInvestigationTest', {
          investigations,
          id: this.$route.params.id,
        })
        .then(() => this.initializeRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    initValues() {
      this.$store.dispatch('order/emptySelectedInvestigations');
      this.$store.dispatch('order/emptySelectedInvestigationButtons');
    },

    flipSwitch(value) {
      this.switchSpot = value;
    },
  },
};
</script>

<style scoped></style>
