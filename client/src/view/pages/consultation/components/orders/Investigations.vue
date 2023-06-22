<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card card-custom gutter-b">
      <div class="card-header pt-5">
        <div class="card-title">
          <span class="card-label font-weight-bolder text-dark">Investigations</span>
          <span v-if="showSwitch" class="switch switch-sm switch-icon float-right">
            <label>
              <input @change="flipSwitch($event)" type="checkbox" :checked="switchPosition" />
              <span />
            </label>
          </span>
        </div>
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
      switchPosition: false,
    };
  },
  created() {
    this.defaultSwitchPosition();
  },
  computed: {
    investigations() {
      return this.$store.state.radiology.investigations;
    },
    selectedInvestigations() {
      return this.$store.state.order.selectedInvestigations;
    },
    visit() {
      return this.$store.state.visit.visit;
    },
    showSwitch() {
      return this.visit?.patient?.has_insurance && this.visit?.patient?.insurance_id !== 4;
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
        investigation_type: this.switchPosition ? 'NHIS' : 'CASH',
        price: investigation.price,
        name: investigation.name,
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
          id: this.$route.params.visitId,
        })
        .then(() => this.initializeRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    initValues() {
      this.$store.dispatch('order/emptySelectedInvestigations');
      this.$store.dispatch('order/emptySelectedInvestigationButtons');
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
