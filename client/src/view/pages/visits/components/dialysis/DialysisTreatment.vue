<template>
  <div class="dialysis-treatment">
    <div class="card card-custom gutter-b">
      <div class="card-header border-0 py-4">
        <h4 class="card-title font-weight-bolder text-dark">
          <i class="fas fa-procedures text-info mr-2"></i>
          Treatment Records
        </h4>
        <div class="card-toolbar">
          <button class="btn btn-info btn-sm font-weight-bold" @click="openTreatmentModal">
            <i class="fas fa-plus mr-2"></i>Add Treatment
          </button>
        </div>
      </div>
      <div class="card-body py-0">
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center">
            <thead>
              <tr class="text-left">
                <th class="pl-4" style="min-width: 200px">
                  <span class="text-dark-75 font-weight-bolder">Patient</span>
                </th>
                <th style="min-width: 120px">
                  <span class="text-dark-75 font-weight-bolder">Treatment Date</span>
                </th>
                <th style="min-width: 100px">
                  <span class="text-dark-75 font-weight-bolder">Type</span>
                </th>
                <th style="min-width: 120px">
                  <span class="text-dark-75 font-weight-bolder">Parameters</span>
                </th>
                <th style="min-width: 100px">
                  <span class="text-dark-75 font-weight-bolder">Outcome</span>
                </th>
                <th class="pr-0 text-right" style="min-width: 120px">
                  <span class="text-dark-75 font-weight-bolder">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="treatments.length === 0">
                <td colspan="6" class="text-center py-8">
                  <div class="text-muted">
                    <i class="fas fa-procedures fa-3x mb-3"></i>
                    <p class="font-size-lg">No treatment records found</p>
                    <p class="font-size-sm">Click "Add Treatment" to record a new treatment</p>
                  </div>
                </td>
              </tr>
              <tr v-for="treatment in treatments" :key="treatment.id" class="treatment-row">
                <td class="pl-4">
                  <div class="d-flex align-items-center">
                    <div class="symbol symbol-40 symbol-light-primary mr-4">
                      <span class="symbol-label">
                        <i class="fas fa-user text-primary"></i>
                      </span>
                    </div>
                    <div>
                      <span
                        class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                      >
                        {{ treatment.patient_name }}
                      </span>
                      <span class="text-muted d-block font-size-sm">{{
                        treatment.patient_id
                      }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder font-size-lg">
                    {{ formatDate(treatment.treatment_date) }}
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder font-size-lg">
                    {{ treatment.treatment_type }}
                  </span>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <span class="text-dark-75 font-weight-bolder font-size-sm">
                      Duration: {{ treatment.duration }} min
                    </span>
                    <span class="text-muted font-size-sm">
                      Blood Flow: {{ treatment.blood_flow }} ml/min
                    </span>
                  </div>
                </td>
                <td>
                  <span :class="getOutcomeClass(treatment.outcome)">
                    {{ treatment.outcome }}
                  </span>
                </td>
                <td class="pr-0 text-right">
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-icon btn-light btn-hover-primary btn-sm mx-1"
                      @click="viewTreatment(treatment)"
                      title="View Details"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      class="btn btn-icon btn-light btn-hover-success btn-sm mx-1"
                      @click="editTreatment(treatment)"
                      title="Edit"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-icon btn-light btn-hover-info btn-sm mx-1"
                      @click="generateReport(treatment)"
                      title="Generate Report"
                    >
                      <i class="fas fa-file-medical"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Treatment Modal -->
    <b-modal v-model="showModal" :title="modalTitle" size="lg" hide-footer class="treatment-modal">
      <div class="p-4">
        <form @submit.prevent="saveTreatment">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-user text-primary mr-2"></i>
                  Patient
                </label>
                <v-select
                  v-model="formData.patient_id"
                  :options="availablePatients"
                  label="name"
                  :reduce="(patient) => patient.id"
                  placeholder="Select patient..."
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-calendar-alt text-success mr-2"></i>
                  Treatment Date
                </label>
                <input
                  type="date"
                  v-model="formData.treatment_date"
                  class="form-control form-control-lg"
                  required
                />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-procedures text-info mr-2"></i>
                  Treatment Type
                </label>
                <select
                  v-model="formData.treatment_type"
                  class="form-control form-control-lg"
                  required
                >
                  <option value="">Select treatment type</option>
                  <option value="Hemodialysis">Hemodialysis</option>
                  <option value="Peritoneal Dialysis">Peritoneal Dialysis</option>
                  <option value="CRRT">CRRT</option>
                  <option value="Plasmapheresis">Plasmapheresis</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-hourglass-half text-warning mr-2"></i>
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  v-model="formData.duration"
                  class="form-control form-control-lg"
                  placeholder="240"
                  min="30"
                  max="480"
                  required
                />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-tint text-danger mr-2"></i>
                  Blood Flow Rate (ml/min)
                </label>
                <input
                  type="number"
                  v-model="formData.treatment_data.blood_flow"
                  class="form-control form-control-lg"
                  placeholder="300"
                  min="100"
                  max="600"
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-thermometer-half text-warning mr-2"></i>
                  Dialysate Flow (ml/min)
                </label>
                <input
                  type="number"
                  v-model="formData.treatment_data.dialysate_flow"
                  class="form-control form-control-lg"
                  placeholder="500"
                  min="200"
                  max="800"
                  required
                />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-syringe text-info mr-2"></i>
                  Heparin Dose (units)
                </label>
                <input
                  type="number"
                  v-model="formData.treatment_data.heparin_dose"
                  class="form-control form-control-lg"
                  placeholder="0"
                  min="0"
                  step="100"
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-tint text-primary mr-2"></i>
                  Ultrafiltration (ml)
                </label>
                <input
                  type="number"
                  v-model="formData.treatment_data.ultrafiltration"
                  class="form-control form-control-lg"
                  placeholder="0"
                  min="0"
                  step="100"
                />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-heartbeat text-danger mr-2"></i>
                  Pre-Treatment BP
                </label>
                <input
                  type="text"
                  v-model="formData.treatment_data.bp_pre"
                  class="form-control form-control-lg"
                  placeholder="120/80"
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-weight text-warning mr-2"></i>
                  Pre-Treatment Weight (kg)
                </label>
                <input
                  type="number"
                  v-model="formData.treatment_data.weight_pre"
                  class="form-control form-control-lg"
                  placeholder="70.0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-user-md text-success mr-2"></i>
                  Started By (Staff ID)
                </label>
                <v-select
                  v-model="formData.started_by"
                  :options="availableStaff"
                  label="name"
                  :reduce="(staff) => staff.id"
                  placeholder="Select staff..."
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-link text-info mr-2"></i>
                  Access Type
                </label>
                <select
                  v-model="formData.treatment_data.access_type"
                  class="form-control form-control-lg"
                >
                  <option value="">Select access type</option>
                  <option value="AV Fistula">AV Fistula</option>
                  <option value="AV Graft">AV Graft</option>
                  <option value="Central Line">Central Line</option>
                  <option value="Permacath">Permacath</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label font-weight-bold">
              <i class="fas fa-comment text-muted mr-2"></i>
              Treatment Notes
            </label>
            <textarea
              v-model="formData.notes"
              class="form-control"
              rows="3"
              placeholder="Treatment observations, complications, or special notes..."
            ></textarea>
          </div>

          <div class="text-right mt-4">
            <button
              type="button"
              class="btn btn-light-secondary btn-lg mr-3"
              @click="showModal = false"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary btn-lg" :disabled="isSubmitting">
              <i class="fas fa-save mr-2"></i>
              {{ isSubmitting ? 'Saving...' : 'Save Treatment' }}
            </button>
          </div>
        </form>
      </div>
    </b-modal>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

export default {
  name: 'DialysisTreatment',
  components: { vSelect },
  props: {
    treatments: {
      type: Array,
      default: () => [],
    },
    availablePatients: {
      type: Array,
      default: () => [],
    },
    availableStaff: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      showModal: false,
      isSubmitting: false,
      editingTreatment: null,
      formData: {
        started_by: null,
        treatment_data: {
          blood_flow: 300,
          dialysate_flow: 500,
          heparin_dose: 0,
          ultrafiltration: 0,
          bp_pre: '',
          weight_pre: 70.0,
          access_type: '',
          notes: '',
        },
      },
    };
  },
  computed: {
    modalTitle() {
      if (this.editingTreatment) {
        return 'Edit Treatment Record';
      }
      return 'New Treatment Record';
    },
  },
  methods: {
    getOutcomeClass(outcome) {
      const classes = {
        Successful: 'label label-lg label-light-success label-inline',
        Partial: 'label label-lg label-light-warning label-inline',
        Complications: 'label label-lg label-light-danger label-inline',
        Discontinued: 'label label-lg label-light-dark label-inline',
      };
      return classes[outcome] || 'label label-lg label-light-dark label-inline';
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },

    openTreatmentModal() {
      this.editingTreatment = null;
      this.resetForm();
      this.showModal = true;
    },

    editTreatment(treatment) {
      this.editingTreatment = treatment;
      this.formData = { ...treatment };
      this.showModal = true;
    },

    resetForm() {
      this.formData = {
        started_by: null,
        treatment_data: {
          blood_flow: 300,
          dialysate_flow: 500,
          heparin_dose: 0,
          ultrafiltration: 0,
          bp_pre: '',
          weight_pre: 70.0,
          access_type: '',
          notes: '',
        },
      };
    },

    async saveTreatment() {
      this.isSubmitting = true;
      try {
        if (this.editingTreatment) {
          // For editing, we need to update the treatment record
          await this.$store.dispatch('dialysis/updateTreatment', {
            id: this.editingTreatment.id,
            ...this.formData,
          });
        } else {
          // For new treatments, we need to start a treatment on an existing visit
          // This component should be used in conjunction with a visit ID
          const visitId = this.$route.params.id || this.editingTreatment?.visit_id;
          if (!visitId) {
            throw new Error('Visit ID is required to start treatment');
          }

          await this.$store.dispatch('dialysis/startTreatment', {
            visitId,
            ...this.formData,
          });
        }

        this.showModal = false;
        this.$emit('treatment-saved');
        this.$notify({
          group: 'foo',
          title: 'Success',
          text: 'Treatment record saved successfully',
          type: 'success',
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to save treatment record',
          type: 'error',
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    viewTreatment(treatment) {
      this.$emit('view-treatment', treatment);
    },

    generateReport(treatment) {
      this.$emit('generate-report', treatment);
    },
  },
};
</script>

<style scoped>
.treatment-row {
  transition: all 0.2s ease;
}

.treatment-row:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.treatment-modal .modal-content {
  border-radius: 0.75rem;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.form-label {
  color: #3f4254;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 0.5rem;
  border: 1px solid #e1e3ea;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #00acc1;
  box-shadow: 0 0 0 0.2rem rgba(0, 172, 193, 0.25);
}

.v-select {
  border: 1px solid #e1e3ea;
  border-radius: 0.5rem;
}

.v-select:focus-within {
  border-color: #00acc1;
  box-shadow: 0 0 0 0.2rem rgba(0, 172, 193, 0.25);
}

.symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.symbol-40 {
  width: 2.5rem;
  height: 2.5rem;
}

.symbol-light-primary {
  background-color: #e0f7fa;
}

.symbol-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.label {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.375rem;
}

.label-light-success {
  background-color: #e8fff3;
  color: #198754;
}

.label-light-warning {
  background-color: #fff4de;
  color: #ffc107;
}

.label-light-danger {
  background-color: #ffe8e8;
  color: #dc3545;
}

.label-light-dark {
  background-color: #f1f2f6;
  color: #6c757d;
}
</style>
