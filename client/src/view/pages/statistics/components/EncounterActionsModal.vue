<template>
  <b-modal
    v-model="activePrompt"
    ref="encounterActionsModal"
    id="encounterActionsModal"
    title="Encounter Actions"
    size="xl"
    hide-footer
  >
    <div v-if="encounterActions">
      <!-- Encounter Info -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">
              <h6 class="card-title mb-0">Encounter Information</h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <p>
                    <strong>Doctor:</strong> {{ encounterActions.encounter?.examiner?.firstname }}
                    {{ encounterActions.encounter?.examiner?.lastname }}
                  </p>
                  <p>
                    <strong>Patient:</strong> {{ encounterActions.encounter?.patient?.firstname }}
                    {{ encounterActions.encounter?.patient?.lastname }}
                  </p>
                </div>
                <div class="col-md-6">
                  <p><strong>Visit:</strong> {{ encounterActions.encounter?.visit?.id }}</p>
                  <p>
                    <strong>Date:</strong>
                    {{ formatDate(encounterActions.encounter?.time_of_encounter) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions Tabs -->
      <div class="row">
        <div class="col-md-12">
          <b-tabs content-class="mt-3">
            <!-- Prescriptions Tab -->
            <b-tab title="Prescriptions" :title-link-class="getTabClass('prescriptions')">
              <div class="table-responsive">
                <table
                  class="table table-sm"
                  v-if="encounterActions.actions?.drugPrescriptions?.length"
                >
                  <thead>
                    <tr>
                      <th>Drug</th>
                      <th>Dosage</th>
                      <th>Route</th>
                      <th>Duration</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="prescription in encounterActions.actions.drugPrescriptions"
                      :key="prescription.id"
                    >
                      <td>{{ prescription.prescribed_drugs?.[0]?.drug?.name || 'N/A' }}</td>
                      <td>{{ prescription.prescribed_drugs?.[0]?.dosage || 'N/A' }}</td>
                      <td>
                        {{
                          prescription.prescribed_drugs?.[0]?.routes_of_administration?.name ||
                          'N/A'
                        }}
                      </td>
                      <td>{{ prescription.prescribed_drugs?.[0]?.duration || 'N/A' }}</td>
                      <td>{{ formatDate(prescription.date_prescribed) }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="text-muted text-center mt-3">No prescriptions found</p>
              </div>
            </b-tab>

            <!-- Tests Tab -->
            <b-tab title="Lab Tests" :title-link-class="getTabClass('tests')">
              <div class="table-responsive">
                <table
                  class="table table-sm"
                  v-if="encounterActions.actions?.testPrescriptions?.length"
                >
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Date Requested</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="prescription in encounterActions.actions.testPrescriptions"
                      :key="prescription.id"
                    >
                      <td>{{ prescription.prescribed_tests?.[0]?.test?.name || 'N/A' }}</td>
                      <td>{{ formatDate(prescription.date_requested) }}</td>
                      <td>{{ prescription.status || 'Pending' }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="text-muted text-center mt-3">No lab tests found</p>
              </div>
            </b-tab>

            <!-- Investigations Tab -->
            <b-tab title="Investigations" :title-link-class="getTabClass('investigations')">
              <div class="table-responsive">
                <table
                  class="table table-sm"
                  v-if="encounterActions.actions?.investigationPrescriptions?.length"
                >
                  <thead>
                    <tr>
                      <th>Investigation</th>
                      <th>Date Requested</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="prescription in encounterActions.actions.investigationPrescriptions"
                      :key="prescription.id"
                    >
                      <td>
                        {{
                          prescription.prescribed_investigations?.[0]?.investigation?.name || 'N/A'
                        }}
                      </td>
                      <td>{{ formatDate(prescription.date_requested) }}</td>
                      <td>{{ prescription.status || 'Pending' }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="text-muted text-center mt-3">No investigations found</p>
              </div>
            </b-tab>

            <!-- Services Tab -->
            <b-tab title="Services" :title-link-class="getTabClass('services')">
              <div class="table-responsive">
                <table
                  class="table table-sm"
                  v-if="encounterActions.actions?.servicePrescriptions?.length"
                >
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Date Requested</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="prescription in encounterActions.actions.servicePrescriptions"
                      :key="prescription.id"
                    >
                      <td>{{ prescription.service?.name || 'N/A' }}</td>
                      <td>{{ formatDate(prescription.date_requested) }}</td>
                      <td>{{ prescription.status || 'Pending' }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="text-muted text-center mt-3">No services found</p>
              </div>
            </b-tab>

            <!-- Observations Tab -->
            <b-tab title="Observations" :title-link-class="getTabClass('observations')">
              <div class="table-responsive">
                <table class="table table-sm" v-if="encounterActions.actions?.observations?.length">
                  <thead>
                    <tr>
                      <th>Observation</th>
                      <th>Value</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="observation in encounterActions.actions.observations"
                      :key="observation.id"
                    >
                      <td>{{ observation.observation || 'N/A' }}</td>
                      <td>{{ observation.value || 'N/A' }}</td>
                      <td>{{ formatDate(observation.createdAt) }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="text-muted text-center mt-3">No observations found</p>
              </div>
            </b-tab>

            <!-- Diagnoses Tab -->
            <b-tab title="Diagnoses" :title-link-class="getTabClass('diagnoses')">
              <div class="table-responsive">
                <table class="table table-sm" v-if="encounterActions.actions?.diagnoses?.length">
                  <thead>
                    <tr>
                      <th>Diagnosis</th>
                      <th>Type</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="diagnosis in encounterActions.actions.diagnoses" :key="diagnosis.id">
                      <td>
                        {{
                          diagnosis.icd10_disease?.name || diagnosis.icpc2_disease?.name || 'N/A'
                        }}
                      </td>
                      <td>{{ diagnosis.icd10_disease ? 'ICD-10' : 'ICPC-2' }}</td>
                      <td>{{ formatDate(diagnosis.createdAt) }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="text-muted text-center mt-3">No diagnoses found</p>
              </div>
            </b-tab>
          </b-tabs>
        </div>
      </div>
    </div>

    <template #modal-footer>
      <b-button variant="secondary" @click="$emit('close')"> Close </b-button>
    </template>
  </b-modal>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'EncounterActionsModal',
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    encounterActions: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },
  },
  watch: {
    visible(newVal) {
      console.log('Modal visible prop changed to:', newVal);
      if (newVal) {
        this.$nextTick(() => {
          this.$refs.encounterActionsModal.show();
        });
      } else {
        this.$refs.encounterActionsModal.hide();
      }
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return 'N/A';
      return dayjs(date).format('DD/MM/YYYY HH:mm');
    },

    getTabClass(tabType) {
      const count = this.getTabCount(tabType);
      return count > 0 ? 'text-primary' : 'text-muted';
    },

    getTabCount(tabType) {
      const counts = {
        prescriptions: this.encounterActions.actions?.drugPrescriptions?.length || 0,
        tests: this.encounterActions.actions?.testPrescriptions?.length || 0,
        investigations: this.encounterActions.actions?.investigationPrescriptions?.length || 0,
        services: this.encounterActions.actions?.servicePrescriptions?.length || 0,
        observations: this.encounterActions.actions?.observations?.length || 0,
        diagnoses: this.encounterActions.actions?.diagnoses?.length || 0,
      };
      return counts[tabType] || 0;
    },
  },
};
</script>

<style scoped>
.card {
  border: 1px solid #e4e6ea;
  border-radius: 0.42rem;
}

.card-header {
  background-color: #f3f6f9;
  border-bottom: 1px solid #e4e6ea;
}

/* Custom tab styling */
::v-deep .nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  border-bottom: 2px solid transparent;
}

::v-deep .nav-tabs .nav-link.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
  background: none;
}

::v-deep .nav-tabs .nav-link:hover {
  border-color: transparent;
  color: #007bff;
}
</style>
