<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card-custom gutter-b">
      <div class="card-header pt-5">
        <div class="card-title">
          <span class="card-label font-weight-bolder text-dark">Investigations</span>
          <span v-if="showSwitch" class="switch switch-sm switch-icon float-right">
            <label>
              <input @change="flipSwitch($event)" type="checkbox" :checked="switchPosition && switchSpot" />
              <span />
            </label>
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
export default {
  name: 'Investigations',
  data() {
    return {
      checkmark: 'flaticon2-check-mark',
      isDisabled: false,
      switchSpot: true,
    };
  },
  created() {
    this.defaultSwitchPosition();
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

    mapSelectedInvestigation(investigation) {
      return {
        investigation_id: investigation.id,
        is_urgent: false,
        investigation_type: this.switchPosition && this.switchSpot ? 'NHIS' : 'CASH',
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

    flipSwitch(event) {
      this.switchSpot = !!event.target.checked;
    },
  },
};
</script>

<style scoped></style>
