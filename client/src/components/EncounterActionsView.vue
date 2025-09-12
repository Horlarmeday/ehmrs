<template>
  <div class="encounter-actions-view">
    <div v-if="!actions" class="text-center py-4">
      <p class="text-muted">No actions data available.</p>
    </div>

    <div v-if="actionsData && !isEmptyActions">
      <!-- Drug Prescriptions Section -->
      <div
        v-if="actionsData.drugPrescriptions && actionsData.drugPrescriptions.length > 0"
        class="mb-4"
      >
        <h5 class="text-primary mb-3"><i class="mdi mdi-pill"></i> Drug Prescriptions</h5>
        <b-table
          :items="actionsData.drugPrescriptions"
          :fields="drugFields"
          striped
          hover
          responsive
          class="mb-0"
        >
          <template #cell(drug)="{ item }">
            <strong>{{ item.drug.name }}</strong>
            <br />
            <small class="text-muted">
              {{ item.quantity_prescribed }} {{ item.drug.unit_of_measurement }} -
              {{ item.dosage_form.name }} via {{ item.route.name }}
            </small>
          </template>
        </b-table>
      </div>

      <!-- Test Prescriptions Section -->
      <div
        v-if="actionsData.testPrescriptions && actionsData.testPrescriptions.length > 0"
        class="mb-4"
      >
        <h5 class="text-info mb-3"><i class="mdi mdi-test-tube"></i> Test Prescriptions</h5>
        <b-table
          :items="actionsData.testPrescriptions"
          :fields="testFields"
          striped
          hover
          responsive
          class="mb-0"
        >
          <template #cell(prescribed_tests)="{ item }">
            <strong>{{ item.test.name }}</strong>
          </template>
        </b-table>
      </div>

      <!-- Service Prescriptions Section -->
      <div
        v-if="actionsData.servicePrescriptions && actionsData.servicePrescriptions.length > 0"
        class="mb-4"
      >
        <h5 class="text-success mb-3">
          <i class="mdi mdi-hospital-building"></i> Service Prescriptions
        </h5>
        <b-table
          :items="actionsData.servicePrescriptions"
          :fields="serviceFields"
          striped
          hover
          responsive
          class="mb-0"
        >
          <template #cell(prescribed_services)="{ item }">
            <strong>{{ item.service.name }}</strong>
          </template>
        </b-table>
      </div>

      <!-- Investigation Prescriptions Section -->
      <div
        v-if="
          actionsData.investigationPrescriptions &&
            actionsData.investigationPrescriptions.length > 0
        "
        class="mb-4"
      >
        <h5 class="text-warning mb-3">
          <i class="mdi mdi-magnify"></i> Investigation Prescriptions
        </h5>
        <b-table
          :items="actionsData.investigationPrescriptions"
          :fields="investigationFields"
          striped
          hover
          responsive
          class="mb-0"
        >
          <template #cell(prescribed_investigations)="{ item }">
            <strong>{{ item.investigation.name }}</strong>
          </template>
        </b-table>
      </div>

      <!-- Triages Section -->
      <div v-if="actionsData.triages && actionsData.triages.length > 0" class="mb-4">
        <h5 class="text-info mb-3"><i class="mdi mdi-clipboard-pulse"></i> Triages</h5>
        <b-table
          :items="actionsData.triages"
          :fields="triageFields"
          striped
          hover
          responsive
          class="mb-0"
        >
          <template #cell(vital_signs)="{ item }">
            <div v-if="item.vital_signs">
              <div v-if="item.vital_signs.temperature">
                <strong>Temperature:</strong> {{ item.vital_signs.temperature }}°C
              </div>
              <div v-if="item.vital_signs.blood_pressure">
                <strong>Blood Pressure:</strong> {{ item.vital_signs.blood_pressure }}
              </div>
              <div v-if="item.vital_signs.pulse">
                <strong>Pulse:</strong> {{ item.vital_signs.pulse }} bpm
              </div>
              <div v-if="item.vital_signs.respiratory_rate">
                <strong>Respiratory Rate:</strong> {{ item.vital_signs.respiratory_rate }}
              </div>
            </div>
          </template>
        </b-table>
      </div>

      <!-- Observations Section -->
      <div v-if="actionsData.observations && actionsData.observations.length > 0" class="mb-4">
        <h5 class="text-secondary mb-3"><i class="mdi mdi-eye"></i> Observations</h5>
        <b-table
          :items="actionsData.observations"
          :fields="observationFields"
          striped
          hover
          responsive
          class="mb-0"
        >
          <template #cell(complaint)="{ item }">
            <div class="text-wrap">{{ item.complaint }}</div>
          </template>
        </b-table>
      </div>

      <!-- Diagnoses Section -->
      <div v-if="actionsData.diagnoses && actionsData.diagnoses.length > 0" class="mb-4">
        <h5 class="text-danger mb-3"><i class="mdi mdi-medical-bag"></i> Diagnoses</h5>
        <b-table
          :items="actionsData.diagnoses"
          :fields="diagnosisFields"
          striped
          hover
          responsive
          class="mb-0"
        >
          <template #cell(disease)="{ item }">
            <div v-if="item.diagnosis">
              <strong>{{ item.diagnosis.diagnosis }}</strong>
              <br />
              <small class="text-muted">ICD-10: {{ item.diagnosis.code }}</small>
            </div>
          </template>
        </b-table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5">
      <i class="mdi mdi-information-outline text-muted" style="font-size: 3rem"></i>
      <h5 class="text-muted mt-3">No Actions Found</h5>
      <p class="text-muted">No encounter actions have been recorded for this encounter.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EncounterActionsView',
  props: {
    actions: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      drugFields: [
        { key: 'date_prescribed', label: 'Date Prescribed', formatter: this.formatDate },
        { key: 'drug', label: 'Drugs' },
        { key: 'requester.firstname', label: 'Prescribed By' },
      ],
      testFields: [
        { key: 'date_requested', label: 'Date Requested', formatter: this.formatDate },
        { key: 'prescribed_tests', label: 'Tests' },
        { key: 'examiner.firstname', label: 'Requested By' },
      ],
      serviceFields: [
        { key: 'date_requested', label: 'Date Requested', formatter: this.formatDate },
        { key: 'prescribed_services', label: 'Services' },
        { key: 'examiner.firstname', label: 'Requested By' },
      ],
      investigationFields: [
        { key: 'date_requested', label: 'Date Requested', formatter: this.formatDate },
        { key: 'prescribed_investigations', label: 'Investigations' },
        { key: 'examiner.firstname', label: 'Requested By' },
      ],
      triageFields: [
        { key: 'vital_signs', label: 'Vital Signs' },
        { key: 'priority', label: 'Priority' },
        { key: 'createdAt', label: 'Date', formatter: this.formatDate },
      ],
      observationFields: [
        { key: 'complaint', label: 'Complaint' },
        { key: 'history_of_presenting_complaint', label: 'History' },
        { key: 'createdAt', label: 'Date', formatter: this.formatDate },
      ],
      diagnosisFields: [
        { key: 'disease', label: 'Disease' },
        { key: 'type', label: 'Type' },
        { key: 'createdAt', label: 'Date', formatter: this.formatDate },
      ],
    };
  },
  computed: {
    actionsData() {
      // Handle the nested structure from the API response
      if (!this.actions) return null;

      // If actions is already the correct structure (has drugPrescriptions, etc.)
      if (this.actions.drugPrescriptions !== undefined) {
        return this.actions;
      }

      // If actions has a nested actions property
      if (this.actions.actions) {
        return this.actions.actions;
      }

      return this.actions;
    },

    isEmptyActions() {
      console.log('Actions in computed:', this.actions);
      console.log('Processed actionsData:', this.actionsData);

      if (!this.actionsData) return true;

      const {
        drugPrescriptions = [],
        testPrescriptions = [],
        servicePrescriptions = [],
        investigationPrescriptions = [],
        triages = [],
        observations = [],
        diagnoses = [],
      } = this.actionsData;

      return (
        drugPrescriptions.length === 0 &&
        testPrescriptions.length === 0 &&
        servicePrescriptions.length === 0 &&
        investigationPrescriptions.length === 0 &&
        triages.length === 0 &&
        observations.length === 0 &&
        diagnoses.length === 0
      );
    },
  },
  methods: {
    formatDate(value) {
      if (!value) return '';
      const date = new Date(value);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
};
</script>

<style scoped>
.encounter-actions-view {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
