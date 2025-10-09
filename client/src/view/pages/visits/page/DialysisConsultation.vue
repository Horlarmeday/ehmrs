<template>
  <div class="dialysis-consultation">
    <!-- Header Section -->
    <div class="card card-custom gutter-b mb-8">
      <div class="card-header border-0 py-5">
        <div class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark font-size-h3">
            <i class="fas fa-kidney text-primary mr-3"></i>
            Dialysis Consultation
          </span>
          <span class="text-muted mt-2 font-weight-normal">
            Patient: {{ patientInfo.fullname || 'Loading...' }} | Visit ID: {{ $route.params.id }} |
            Status: {{ visitInfo.status || 'Loading...' }} | Active Tab: {{ activeTab }}
            <span v-if="isLoading" class="text-primary ml-2">
              <i class="fas fa-spinner fa-spin"></i> Loading...
            </span>
          </span>
        </div>
        <div class="card-toolbar">
          <div class="btn-group" role="group">
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeTab === 'overview' }"
              @click="setActiveTab('overview')"
            >
              <i class="fas fa-user-md mr-2"></i>Overview
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeTab === 'treatment' }"
              @click="setActiveTab('treatment')"
            >
              <i class="fas fa-procedures mr-2"></i>Treatment
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeTab === 'assessment' }"
              @click="setActiveTab('assessment')"
            >
              <i class="fas fa-clipboard-list mr-2"></i>Assessment
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeTab === 'vitals' }"
              @click="setActiveTab('vitals')"
            >
              <i class="fas fa-heartbeat mr-2"></i>Vitals
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeTab === 'notes' }"
              @click="setActiveTab('notes')"
            >
              <i class="fas fa-sticky-note mr-2"></i>Notes
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeTab === 'items' }"
              @click="setActiveTab('items')"
            >
              <i class="fas fa-boxes mr-2"></i>Items
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeTab === 'services' }"
              @click="setActiveTab('services')"
            >
              <i class="fas fa-concierge-bell mr-2"></i>Services
            </button>
            <end-visit-button button-class="btn-light-primary" :visit-id="$route.params.id" />
          </div>
        </div>
      </div>
    </div>

    <!-- Content Tabs -->
    <!-- Overview Tab -->
    <div v-show="activeTab === 'overview'">
      <div class="row">
        <!-- Patient Information Card -->
        <div class="col-xl-6 mb-6">
          <div class="card card-custom">
            <div class="card-header border-0 py-4">
              <h4 class="card-title font-weight-bolder text-dark">
                <i class="fas fa-user text-primary mr-2"></i>
                Patient Information
              </h4>
            </div>
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="symbol symbol-60 symbol-light-primary mr-4">
                  <span class="symbol-label">
                    <i class="fas fa-user text-primary"></i>
                  </span>
                </div>
                <div>
                  <h5 class="font-weight-bolder text-dark mb-1">
                    {{ patientInfo.fullname || 'Loading...' }}
                  </h5>
                  <span class="text-muted"
                    >Hospital ID: {{ patientInfo.hospital_id || 'N/A' }}</span
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label font-weight-bold text-muted">Age</label>
                    <p class="form-control-static">
                      {{ dayjs().diff(patientInfo.date_of_birth, 'year') }} years
                    </p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label font-weight-bold text-muted">Gender</label>
                    <p class="form-control-static">{{ patientInfo.gender || 'N/A' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Visit Information Card -->
        <div class="col-xl-6 mb-6">
          <div class="card card-custom">
            <div class="card-header border-0 py-4">
              <h4 class="card-title font-weight-bolder text-dark">
                <i class="fas fa-calendar-check text-success mr-2"></i>
                Visit Information
              </h4>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label font-weight-bold text-muted">Visit Date</label>
                    <p class="form-control-static">
                      {{ formatDate(visitInfo.date_visit_start || visitInfo.scheduled_date) }}
                    </p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label font-weight-bold text-muted">Priority</label>
                    <span :class="getPriorityClass(visitInfo.priority)">
                      {{ visitInfo.priority || 'Routine' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label font-weight-bold text-muted">Department</label>
                    <p class="form-control-static">{{ visitInfo?.visit?.department || 'N/A' }}</p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label font-weight-bold text-muted">Status</label>
                    <span :class="getStatusClass(visitInfo.status)">
                      {{ visitInfo.status || 'N/A' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dialysis Details Card -->
      <div class="card card-custom">
        <div class="card-header border-0 py-4">
          <h4 class="card-title font-weight-bolder text-dark">
            <i class="fas fa-procedures text-info mr-2"></i>
            Dialysis Parameters
          </h4>
          <div class="card-toolbar">
            <button
              class="btn btn-primary btn-sm"
              @click="editDialysisDetails"
              v-if="!isEditingDialysis"
            >
              <i class="fas fa-edit mr-2"></i>Edit Parameters
            </button>
            <button
              class="btn btn-success btn-sm"
              @click="saveDialysisDetails"
              v-if="isEditingDialysis"
            >
              <i class="fas fa-save mr-2"></i>Save
            </button>
            <button
              class="btn btn-light-secondary btn-sm ml-2"
              @click="cancelDialysisEdit"
              v-if="isEditingDialysis"
            >
              Cancel
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <div class="form-group">
                <label class="form-label font-weight-bold">Dialysis Type</label>
                <select
                  v-model="dialysisForm.dialysis_type"
                  class="form-control"
                  :disabled="!isEditingDialysis"
                  required
                >
                  <option value="HEMODIALYSIS">Hemodialysis</option>
                  <option value="PERITONEAL">Peritoneal Dialysis</option>
                  <option value="CONTINUOUS">Continuous (CRRT)</option>
                  <option value="INTERMITTENT">Intermittent</option>
                </select>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label class="form-label font-weight-bold">Planned Duration (min)</label>
                <input
                  type="number"
                  v-model="dialysisForm.planned_duration_minutes"
                  class="form-control"
                  :disabled="!isEditingDialysis"
                  min="60"
                  max="480"
                  required
                />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label class="form-label font-weight-bold">Blood Flow Rate (ml/min)</label>
                <input
                  type="number"
                  v-model="dialysisForm.blood_flow_rate"
                  class="form-control"
                  :disabled="!isEditingDialysis"
                  min="200"
                  max="500"
                  required
                />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">Machine Number</label>
                <input
                  type="text"
                  v-model="dialysisForm.machine_number"
                  class="form-control"
                  :disabled="!isEditingDialysis"
                  placeholder="e.g., HD-001"
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">Bed Number</label>
                <input
                  type="text"
                  v-model="dialysisForm.bed_number"
                  class="form-control"
                  :disabled="!isEditingDialysis"
                  placeholder="e.g., B-05"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label font-weight-bold">Clinical Notes</label>
            <textarea
              v-model="dialysisForm.clinical_notes"
              class="form-control"
              :disabled="!isEditingDialysis"
              rows="3"
              placeholder="Enter clinical notes, treatment plan, or special instructions..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Treatment Tab -->
    <div v-show="activeTab === 'treatment'">
      <div class="card card-custom">
        <div class="card-header border-0 py-4">
          <h4 class="card-title font-weight-bolder text-dark">
            <i class="fas fa-procedures text-info mr-2"></i>
            Treatment Management
          </h4>
          <div class="card-toolbar">
            <button
              class="btn btn-success btn-sm"
              @click="startTreatment"
              v-if="dialysisInfo.status === 'SCHEDULED'"
            >
              <i class="fas fa-play mr-2"></i>Start Treatment
            </button>
            <button
              class="btn btn-warning btn-sm"
              @click="pauseTreatment"
              v-if="dialysisInfo.status === 'IN_PROGRESS'"
            >
              <i class="fas fa-pause mr-2"></i>Pause
            </button>
            <button
              class="btn btn-success btn-sm"
              @click="resumeTreatment"
              v-if="dialysisInfo.status === 'PAUSED'"
            >
              <i class="fas fa-play mr-2"></i>Resume
            </button>
            <button
              class="btn btn-danger btn-sm"
              @click="completeTreatment"
              v-if="dialysisInfo.status === 'IN_PROGRESS'"
            >
              <i class="fas fa-stop mr-2"></i>Complete
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">Treatment Status</label>
                <span :class="getDialysisStatusClass(dialysisInfo.status)">
                  {{ dialysisInfo.status || 'SCHEDULED' }}
                </span>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">Current Duration</label>
                <p class="form-control-static">
                  {{ formatDuration(currentDuration) }}
                </p>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">Start Time</label>
                <p class="form-control-static">
                  {{
                    dialysisInfo.actual_start_date
                      ? formatDateTime(dialysisInfo.actual_start_date)
                      : 'Not started'
                  }}
                </p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">End Time</label>
                <p class="form-control-static">
                  {{
                    dialysisInfo.actual_end_date
                      ? formatDateTime(dialysisInfo.actual_end_date)
                      : 'Not completed'
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- Treatment Progress -->
          <div v-if="dialysisInfo.status === 'IN_PROGRESS'" class="mt-4">
            <h6 class="font-weight-bold mb-3">Treatment Progress</h6>
            <div class="progress mb-3" style="height: 25px">
              <div
                class="progress-bar bg-success"
                :style="{ width: treatmentProgress + '%' }"
                role="progressbar"
              >
                {{ Math.round(treatmentProgress) }}%
              </div>
            </div>
            <small class="text-muted">
              {{ formatDuration(currentDuration) }} /
              {{ formatDuration(dialysisInfo.planned_duration_minutes) }}
            </small>
          </div>

          <!-- Treatment Session Details -->
          <div class="mt-4">
            <h6 class="font-weight-bold mb-3">Session Details</h6>
            <div class="row">
              <div class="col-md-4">
                <div class="form-group">
                  <label class="form-label font-weight-bold text-muted">Dialysis Type</label>
                  <p class="form-control-static">{{ dialysisInfo.dialysis_type || 'Not set' }}</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label class="form-label font-weight-bold text-muted">Planned Duration</label>
                  <p class="form-control-static">
                    {{ formatDuration(dialysisInfo.planned_duration_minutes) }}
                  </p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label class="form-label font-weight-bold text-muted">Blood Flow Rate</label>
                  <p class="form-control-static">
                    {{ dialysisInfo.blood_flow_rate || 'Not set' }} ml/min
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assessment Tab -->
    <div v-show="activeTab === 'assessment'">
      <div class="card card-custom">
        <div class="card-header border-0 py-4">
          <h4 class="card-title font-weight-bolder text-dark">
            <i class="fas fa-clipboard-list text-info mr-2"></i>
            Dialysis Assessment
          </h4>
          <div class="card-toolbar">
            <button
              class="btn btn-primary btn-sm"
              @click="editAssessment"
              v-if="!isEditingAssessment"
            >
              <i class="fas fa-edit mr-2"></i>Edit Assessment
            </button>
            <button
              class="btn btn-success btn-sm"
              @click="saveAssessment"
              v-if="isEditingAssessment"
              :disabled="isSaving"
            >
              <i class="fas fa-spinner fa-spin mr-2" v-if="isSaving"></i>
              <i class="fas fa-save mr-2" v-else></i>
              {{ isSaving ? 'Saving...' : 'Save Assessment' }}
            </button>
            <button
              class="btn btn-light-secondary btn-sm ml-2"
              @click="cancelAssessmentEdit"
              v-if="isEditingAssessment"
            >
              Cancel
            </button>
          </div>
        </div>
        <div class="card-body">
          <!-- Patient Medical Information -->
          <h6 class="font-weight-bold mb-3 text-primary">
            <i class="fas fa-user-md mr-2"></i>Patient Medical Information
          </h6>
          <div class="row">
            <div class="col-md-4">
              <div class="form-group">
                <label class="form-label font-weight-bold">HIV Status</label>
                <select
                  v-model="assessmentForm.hiv_status"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                >
                  <option value="">Select Status</option>
                  <option value="Negative">Negative</option>
                  <option value="Positive">Positive</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label class="form-label font-weight-bold">HBsAG</label>
                <select
                  v-model="assessmentForm.hbsag_status"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                >
                  <option value="">Select Status</option>
                  <option value="Negative">Negative</option>
                  <option value="Positive">Positive</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label class="form-label font-weight-bold">Blood Group</label>
                <select
                  v-model="assessmentForm.blood_group"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Weight Management -->
          <h6 class="font-weight-bold mb-3 text-success mt-4">
            <i class="fas fa-weight mr-2"></i>Weight Management
          </h6>
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label class="form-label font-weight-bold">Current Weight (kg)</label>
                <input
                  type="number"
                  v-model="assessmentForm.current_weight"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                  min="20"
                  max="300"
                  step="0.1"
                />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label class="form-label font-weight-bold">Dry Weight (kg)</label>
                <input
                  type="number"
                  v-model="assessmentForm.dry_weight"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                  min="20"
                  max="300"
                  step="0.1"
                />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label class="form-label font-weight-bold">Previous Post-Dialysis (kg)</label>
                <input
                  type="number"
                  v-model="assessmentForm.previous_post_dialysis_weight"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                  min="20"
                  max="300"
                  step="0.1"
                />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label class="form-label font-weight-bold">Required Weight Loss (kg)</label>
                <input
                  type="number"
                  v-model="assessmentForm.required_weight_loss"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <!-- Machine Parameters -->
          <h6 class="font-weight-bold mb-3 text-info mt-4">
            <i class="fas fa-cogs mr-2"></i>Machine Parameters
          </h6>
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label class="form-label font-weight-bold">Machine Type</label>
                <select
                  :disabled="!isEditingAssessment"
                  class="form-control"
                  v-model="assessmentForm.machine_type"
                >
                  <option v-for="machine in machines" :value="machine" :key="machine">
                    {{ machine }}
                  </option>
                </select>
                <!--                <input-->
                <!--                  type="text"-->
                <!--                  v-model="assessmentForm.machine_type"-->
                <!--                  class="form-control"-->
                <!--                  :disabled="!isEditingAssessment"-->
                <!--                  placeholder="e.g., Fresenius 5008"-->
                <!--                />-->
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label class="form-label font-weight-bold">Dialyser Type</label>
                <input
                  type="text"
                  v-model="assessmentForm.dialyser_type"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                  placeholder="e.g., F8HPS"
                />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label class="form-label font-weight-bold">Concentration Type</label>
                <select
                  v-model="assessmentForm.concentration_type"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                >
                  <option value="">Select Type</option>
                  <option value="Acetate">Acetate</option>
                  <option value="Bicarbonate">Bicarbonate</option>
                  <option value="Citrate">Citrate</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label class="form-label font-weight-bold">Access Route</label>
                <select
                  v-model="assessmentForm.access_route"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                >
                  <option value="">Select Route</option>
                  <option value="AV Fistula">AV Fistula</option>
                  <option value="AV Graft">AV Graft</option>
                  <option value="Femoral">Femoral</option>
                  <option value="Central Line">Central Line</option>
                  <!--                  <option value="Tunneled Catheter">Tunneled Catheter</option>-->
                  <!--                  <option value="Non-tunneled Catheter">Non-tunneled Catheter</option>-->
                </select>
              </div>
            </div>
          </div>

          <!-- Technical Parameters -->
          <h6 class="font-weight-bold mb-3 text-warning mt-4">
            <i class="fas fa-tachometer-alt mr-2"></i>Technical Parameters
          </h6>
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label class="form-label font-weight-bold">Blood Flow Rate (ml/min)</label>
                <input
                  type="number"
                  v-model="assessmentForm.blood_flow_rate"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                  min="200"
                  max="500"
                />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label class="form-label font-weight-bold">Ultrafiltration Rate (ml/hr)</label>
                <input
                  type="number"
                  v-model="assessmentForm.ultrafiltration_rate"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                  min="0"
                  max="2000"
                  step="50"
                />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label class="form-label font-weight-bold">TMP (mmHg)</label>
                <input
                  type="number"
                  v-model="assessmentForm.tmp"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                  min="0"
                  max="300"
                  step="1"
                />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label class="form-label font-weight-bold">Clothing Time (min)</label>
                <input
                  type="number"
                  v-model="assessmentForm.clothing_time"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                  min="0"
                  max="60"
                  step="1"
                />
              </div>
            </div>
          </div>

          <!-- Medications & Treatments -->
          <h6 class="font-weight-bold mb-3 text-danger mt-4">
            <i class="fas fa-pills mr-2"></i>Medications & Treatments
          </h6>
          <div class="row">
            <div class="col-md-4">
              <div class="form-group">
                <label class="form-label font-weight-bold">Heparin (units)</label>
                <input
                  type="number"
                  v-model="assessmentForm.heparin_units"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                  min="0"
                  max="10000"
                  step="100"
                />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label class="form-label font-weight-bold">Infusion/Drugs</label>
                <textarea
                  v-model="assessmentForm.infusion_drugs"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                  rows="2"
                  placeholder="List any infusions or medications..."
                ></textarea>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label class="form-label font-weight-bold">Blood Transfusion</label>
                <select
                  v-model="assessmentForm.blood_transfusion"
                  class="form-control"
                  :disabled="!isEditingAssessment"
                >
                  <option value="">Select</option>
                  <option value="None">None</option>
                  <option value="Packed RBCs">Packed RBCs</option>
                  <option value="Fresh Frozen Plasma">Fresh Frozen Plasma</option>
                  <option value="Platelets">Platelets</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ICD10 Diagnoses -->
          <h6 class="font-weight-bold mb-3 text-dark mt-4">
            <i class="fas fa-stethoscope mr-2"></i>ICD10 Diagnoses
          </h6>
          <div class="form-group">
            <label class="form-label font-weight-bold">Search Diagnosis</label>
            <v-select
              v-model="assessmentForm.selectedDiagnosis"
              :options="icd10Diagnoses"
              label="diagnosis"
              multiple
              placeholder="Search ICD10 diagnosis..."
              :disabled="!isEditingAssessment"
              @search="searchICD10Diagnosis"
              @input="onDiagnosisSelect"
            >
              <template #option="{ diagnosis, code }">
                <strong>{{ code }}</strong> - {{ diagnosis }}
              </template>
            </v-select>
          </div>

          <div
            v-if="assessmentForm.icd10_diagnoses && assessmentForm.icd10_diagnoses.length > 0"
            class="mt-3"
          >
            <h6 class="font-weight-bold mb-2">Selected Diagnoses:</h6>
            <div class="diagnosis-tags">
              <span
                v-for="(diag, index) in assessmentForm.icd10_diagnoses"
                :key="index"
                class="badge badge-primary mr-2 mb-2 p-2"
              >
                {{ diag.icd10_code }} - {{ diag.category }}
                <i
                  class="fas fa-times ml-2 cursor-pointer"
                  @click="removeDiagnosis(index)"
                  v-if="isEditingAssessment"
                ></i>
              </span>
            </div>
          </div>

          <!-- Clinical Assessment -->
          <h6 class="font-weight-bold mb-3 text-secondary mt-4">
            <i class="fas fa-notes-medical mr-2"></i>Clinical Assessment
          </h6>
          <div class="form-group">
            <label class="form-label font-weight-bold">Per Dialysis Assessment</label>
            <textarea
              v-model="assessmentForm.per_dialysis_assessment"
              class="form-control"
              :disabled="!isEditingAssessment"
              rows="4"
              placeholder="Enter comprehensive dialysis assessment including patient condition, complications, and observations..."
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label font-weight-bold">Treatment Plan</label>
            <textarea
              v-model="assessmentForm.treatment_plan"
              class="form-control"
              :disabled="!isEditingAssessment"
              rows="3"
              placeholder="Enter treatment plan and next steps..."
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label font-weight-bold">Clinical Notes</label>
            <textarea
              v-model="assessmentForm.clinical_notes"
              class="form-control"
              :disabled="!isEditingAssessment"
              rows="3"
              placeholder="Additional clinical notes and observations..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Vitals Tab -->
    <div v-show="activeTab === 'vitals'">
      <div class="card card-custom gutter-b">
        <div class="card-header border-0 py-4">
          <h4 class="card-title font-weight-bolder text-dark">
            <i class="fas fa-heartbeat text-danger mr-2"></i>
            Vital Signs Monitoring
          </h4>
          <div class="card-toolbar">
            <button class="btn btn-primary btn-sm" @click="addVitalSigns">
              <i class="fas fa-plus mr-2"></i>Add Vitals
            </button>
          </div>
        </div>
        <div class="card-body">
          <!-- Vital Signs Form -->
          <div v-if="showVitalsForm" class="mb-4">
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label class="form-label font-weight-bold">Time</label>
                  <input type="time" v-model="vitalsForm.time" class="form-control" required />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label class="form-label font-weight-bold">Blood Flow Rate (ml/min)</label>
                  <input
                    type="number"
                    v-model="vitalsForm.blood_flow_rate"
                    class="form-control"
                    min="200"
                    max="500"
                    required
                  />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label class="form-label font-weight-bold">Pulse (bpm)</label>
                  <input
                    type="number"
                    v-model="vitalsForm.pulse"
                    class="form-control"
                    min="40"
                    max="200"
                    required
                  />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label class="form-label font-weight-bold">Ultrafiltration Rate (l/hr)</label>
                  <input
                    type="number"
                    v-model="vitalsForm.ultrafiltration_rate"
                    class="form-control"
                    min="0"
                    max="2000"
                    step="50"
                  />
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label class="form-label font-weight-bold">AP (mmHg)</label>
                  <input
                    type="text"
                    v-model="vitalsForm.ap"
                    class="form-control"
                    placeholder="120/80"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label class="form-label font-weight-bold">Venous Pressure (mmHg)</label>
                  <input
                    type="text"
                    v-model="vitalsForm.venous_pressure"
                    class="form-control"
                    placeholder="120/80"
                    min="0"
                    max="300"
                    step="1"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label class="form-label font-weight-bold">Ultrafiltration Goal (ltr)</label>
                  <input
                    type="number"
                    v-model="vitalsForm.ivf"
                    class="form-control"
                    min="0"
                    max="1000"
                    step="50"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label class="form-label font-weight-bold">HEP/hr (units)</label>
                  <input
                    type="number"
                    v-model="vitalsForm.hep_hr"
                    class="form-control"
                    min="0"
                    max="1000"
                    step="100"
                  />
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-4">
                <div class="form-group">
                  <label class="form-label font-weight-bold">Ultrafiltration Volume (ltr)</label>
                  <input
                    type="text"
                    v-model="vitalsForm.ultrafiltration_volume"
                    class="form-control"
                  />
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label class="form-label font-weight-bold">Blood Pressure (mmHg)</label>
                  <input
                    type="text"
                    v-model="vitalsForm.blood_pressure"
                    class="form-control"
                    placeholder="120/80"
                  />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label font-weight-bold">Temperature (°C)</label>
                  <input
                    type="number"
                    v-model="vitalsForm.temperature"
                    class="form-control"
                    min="35"
                    max="42"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label font-weight-bold">Oxygen Saturation (%)</label>
                  <input
                    type="number"
                    v-model="vitalsForm.oxygen_saturation"
                    class="form-control"
                    min="70"
                    max="100"
                  />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label font-weight-bold">Weight (kg)</label>
                  <input
                    type="number"
                    v-model="vitalsForm.weight"
                    class="form-control"
                    min="20"
                    max="300"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label font-weight-bold">Remarks</label>
              <textarea
                v-model="vitalsForm.remarks"
                class="form-control"
                rows="3"
                placeholder="Any observations, concerns, or additional notes..."
              ></textarea>
            </div>

            <div class="text-right">
              <button class="btn btn-light-secondary btn-sm mr-2" @click="cancelVitalsForm">
                Cancel
              </button>
              <button class="btn btn-primary btn-sm" @click="saveVitalSigns" :disabled="isSaving">
                <i class="fas fa-spinner fa-spin mr-2" v-if="isSaving"></i>
                <i class="fas fa-save mr-2" v-else></i>
                {{ isSaving ? 'Saving...' : 'Save Vitals' }}
              </button>
            </div>
          </div>

          <!-- Vital Signs History -->
          <div v-if="vitalsHistory.length > 0">
            <h6 class="font-weight-bold mb-3">Vital Signs History</h6>

            <!-- Compact Vitals Cards -->
            <div class="vitals-cards">
              <div
                v-for="vital in vitalsHistory"
                :key="vital.id"
                class="vital-card"
                :class="{ expanded: expandedVitals[vital.id] }"
              >
                <!-- Main Vital Info (Always Visible) -->
                <div
                  class="vital-main"
                  @click="toggleVitalExpansion(vital.id)"
                  style="cursor: pointer"
                >
                  <div class="vital-time">
                    <i class="fas fa-clock text-primary mr-2"></i>
                    {{ vital.time || formatTime(vital.timestamp) }}
                  </div>

                  <div class="vital-primary">
                    <div class="vital-item mr-2">
                      <span class="vital-label">BP:</span>
                      <span class="vital-value">{{ vital.blood_pressure || 'N/A' }}</span>
                    </div>
                    <div class="vital-item mr-2">
                      <span class="vital-label">Pulse:</span>
                      <span class="vital-value">{{ vital.pulse || 'N/A' }}</span>
                    </div>
                    <div class="vital-item">
                      <span class="vital-label">Temp:</span>
                      <span class="vital-value">{{
                        vital.temperature ? vital.temperature + '°C' : 'N/A'
                      }}</span>
                    </div>
                  </div>

                  <div class="vital-expand">
                    <i
                      class="fas"
                      :class="expandedVitals[vital.id] ? 'fa-chevron-up' : 'fa-chevron-down'"
                    ></i>
                  </div>
                </div>

                <!-- Expanded Details (Accordion) -->
                <div class="vital-details" v-show="expandedVitals[vital.id]">
                  <div class="vital-details-grid">
                    <!-- Dialysis Parameters -->
                    <div class="vital-section">
                      <h6 class="vital-section-title">
                        <i class="fas fa-procedures text-info mr-2"></i>
                        Dialysis Parameters
                      </h6>
                      <div class="vital-details-row">
                        <div class="vital-detail-item">
                          <span class="detail-label">Blood Flow:</span>
                          <span class="detail-value">{{
                            vital.blood_flow_rate ? vital.blood_flow_rate + ' ml/min' : 'N/A'
                          }}</span>
                        </div>
                        <div class="vital-detail-item">
                          <span class="detail-label">UF Rate:</span>
                          <span class="detail-value">{{
                            vital.ultrafiltration_rate
                              ? vital.ultrafiltration_rate + ' ml/hr'
                              : 'N/A'
                          }}</span>
                        </div>
                      </div>
                      <div class="vital-details-row">
                        <div class="vital-detail-item">
                          <span class="detail-label">AP:</span>
                          <span class="detail-value">{{ vital.ap || 'N/A' }}</span>
                        </div>
                        <div class="vital-detail-item">
                          <span class="detail-label">Venous P:</span>
                          <span class="detail-value">{{
                            vital.venous_pressure ? vital.venous_pressure + ' mmHg' : 'N/A'
                          }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Additional Vitals -->
                    <div class="vital-section">
                      <h6 class="vital-section-title">
                        <i class="fas fa-heartbeat text-danger mr-2"></i>
                        Additional Vitals
                      </h6>
                      <div class="vital-details-row">
                        <div class="vital-detail-item">
                          <span class="detail-label">O2 Sat:</span>
                          <span class="detail-value">{{
                            vital.oxygen_saturation ? vital.oxygen_saturation + '%' : 'N/A'
                          }}</span>
                        </div>
                        <div class="vital-detail-item">
                          <span class="detail-label">Weight:</span>
                          <span class="detail-value">{{
                            vital.weight ? vital.weight + ' kg' : 'N/A'
                          }}</span>
                        </div>
                      </div>
                      <div class="vital-details-row">
                        <div class="vital-detail-item">
                          <span class="detail-label">IVF:</span>
                          <span class="detail-value">{{
                            vital.ivf ? vital.ivf + ' ml' : 'N/A'
                          }}</span>
                        </div>
                        <div class="vital-detail-item">
                          <span class="detail-label">HEP/hr:</span>
                          <span class="detail-value">{{
                            vital.hep_hr ? vital.hep_hr + ' units' : 'N/A'
                          }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Remarks -->
                    <div class="vital-section" v-if="vital.remarks">
                      <h6 class="vital-section-title">
                        <i class="fas fa-sticky-note text-warning mr-2"></i>
                        Remarks
                      </h6>
                      <div class="vital-remarks">
                        {{ vital.remarks }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="!showVitalsForm" class="text-center py-4">
            <p class="text-muted">No vital signs recorded yet.</p>
            <p class="text-muted">Click "Add Vitals" to start monitoring patient vitals.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Notes Tab -->
    <div v-show="activeTab === 'notes'">
      <div class="card card-custom">
        <div class="card-header border-0 py-4">
          <h4 class="card-title font-weight-bolder text-dark">
            <i class="fas fa-sticky-note text-warning mr-2"></i>
            Clinical Notes & Documentation
          </h4>
          <div class="card-toolbar">
            <button class="btn btn-primary btn-sm" @click="addNote">
              <i class="fas fa-plus mr-2"></i>Add Note
            </button>
          </div>
        </div>
        <div class="card-body">
          <!-- Add Note Form -->
          <div v-if="showNoteForm" class="mb-4">
            <div class="form-group">
              <label class="form-label font-weight-bold">Note Type</label>
              <select v-model="noteForm.type" class="form-control">
                <option value="clinical">Clinical Observation</option>
                <option value="treatment">Treatment Note</option>
                <option value="nursing">Nursing Note</option>
                <option value="medication">Medication Note</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label font-weight-bold">Note Content</label>
              <textarea
                v-model="noteForm.content"
                class="form-control"
                rows="4"
                placeholder="Enter your clinical note..."
                required
              ></textarea>
            </div>

            <div class="text-right">
              <button class="btn btn-light-secondary btn-sm mr-2" @click="cancelNoteForm">
                Cancel
              </button>
              <button class="btn btn-primary btn-sm" @click="saveNote" :disabled="isSaving">
                <i class="fas fa-spinner fa-spin mr-2" v-if="isSaving"></i>
                <i class="fas fa-save mr-2" v-else></i>
                {{ isSaving ? 'Saving...' : 'Save Note' }}
              </button>
            </div>
          </div>

          <!-- Notes History -->
          <div v-if="notesHistory.length > 0">
            <div class="notes-timeline">
              <div v-for="note in notesHistory" :key="note.id" class="note-item">
                <div class="note-header">
                  <span class="note-type" :class="getNoteTypeClass(note.type)">
                    {{ note.type }}
                  </span>
                  <span class="note-time">{{ formatDateTime(note.createdAt) }}</span>
                  <div class="note-actions">
                    <button
                      class="btn btn-sm btn-light-primary"
                      @click="editNote(note)"
                      v-if="!note.isEditing"
                    >
                      <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button
                      class="btn btn-sm btn-success"
                      @click="saveNoteEdit(note)"
                      v-if="note.isEditing"
                    >
                      <i class="fas fa-save mr-1"></i>Save
                    </button>
                    <button
                      class="btn btn-sm btn-light-secondary ml-1"
                      @click="cancelNoteEdit(note)"
                      v-if="note.isEditing"
                    >
                      <i class="fas fa-times mr-1"></i>Cancel
                    </button>
                  </div>
                </div>

                <!-- Note Content - Editable when editing -->
                <div v-if="note.isEditing" class="note-content-editable">
                  <div class="form-group">
                    <label class="form-label font-weight-bold">Note Type</label>
                    <select v-model="note.editData.type" class="form-control">
                      <option value="clinical">Clinical Observation</option>
                      <option value="treatment">Treatment Note</option>
                      <option value="nursing">Nursing Note</option>
                      <option value="medication">Medication Note</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label font-weight-bold">Note Content</label>
                    <textarea
                      v-model="note.editData.content"
                      class="form-control"
                      rows="4"
                      placeholder="Enter your clinical note..."
                      required
                    ></textarea>
                  </div>
                </div>

                <!-- Note Content - Read-only when not editing -->
                <div v-else class="note-content">
                  {{ note.content }}
                </div>

                <div class="note-author">By: {{ note.staff.fullname || 'Current User' }}</div>
              </div>
            </div>
          </div>

          <div v-else-if="!showNoteForm" class="text-center py-4">
            <p class="text-muted">No clinical notes recorded yet.</p>
            <p class="text-muted">Click "Add Note" to start documenting patient care.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Items Tab -->
    <div v-show="activeTab === 'items'">
      <div class="card card-custom">
        <div class="card-header border-0 py-4">
          <h4 class="card-title font-weight-bolder text-dark">
            <i class="fas fa-boxes text-info mr-2"></i>
            Dialysis Items & Consumables
          </h4>
          <div class="card-toolbar">
            <button class="btn btn-primary btn-sm" @click="addNewItem">
              <i class="fas fa-plus mr-2"></i>Add Item
            </button>
          </div>
        </div>
        <div class="card-body">
          <!-- Items Form -->
          <div v-if="itemsForm.items.length > 0">
            <div v-for="(item, i) in itemsForm.items" :key="i" class="form-group row">
              <div class="col-lg-6">
                <label class="form-label font-weight-bold">Item</label>
                <v-select
                  @search="onItemSearch"
                  v-model="item.item"
                  label="name"
                  :options="itemsOptions"
                  :reduce="
                    (items) => ({
                      name: items.name,
                      drug_id: items.id,
                      drug_type: items?.drug_type,
                      drug_form: items?.drug_form,
                      price: items.price,
                      unit_id: items.unit_id,
                      quantity_remaining: items?.quantity_remaining,
                    })
                  "
                  placeholder="Search for dialysis items..."
                />
              </div>
              <div class="col-lg-4">
                <label class="form-label font-weight-bold">Quantity</label>
                <input
                  v-model="item.quantity"
                  type="number"
                  class="form-control"
                  placeholder="Quantity"
                  min="1"
                />
              </div>
              <div class="col-lg-2">
                <label class="form-label font-weight-bold">&nbsp;</label>
                <div class="d-flex">
                  <button
                    v-if="i === 0"
                    class="btn btn-light-primary btn-sm mr-2"
                    @click="addNewItem"
                    title="Add Item"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                  <button
                    class="btn btn-light-danger btn-sm"
                    @click="removeItem(i)"
                    title="Remove Item"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <error-banner
              v-if="itemsForm.showError"
              :message="itemsForm.errorMessage"
              :lists="itemsForm.errorList"
            />

            <div class="text-right mt-4">
              <button
                class="btn btn-primary"
                @click="submitItems"
                :disabled="isSaving || !itemsForm.items.length"
                ref="kt_submitItems"
              >
                <i class="fas fa-spinner fa-spin mr-2" v-if="isSaving"></i>
                <i class="fas fa-save mr-2" v-else></i>
                {{ isSaving ? 'Saving...' : 'Submit Items' }}
              </button>
            </div>
          </div>

          <div v-else class="text-center py-4">
            <p class="text-muted">No items added yet.</p>
            <p class="text-muted">Click "Add Item" to start ordering dialysis consumables.</p>
          </div>

          <!-- Ordered Items Display -->
          <div v-if="orderedItems.length > 0" class="mt-5">
            <h5 class="font-weight-bold mb-3">
              <i class="fas fa-list-alt text-info mr-2"></i>
              Ordered Items
            </h5>
            <additional-items-table :items="orderedItems" />
            <pagination
              v-if="orderedItems?.length"
              :total-pages="itemsPages"
              :total="totalOrderedItems"
              :per-page="itemsPerPage"
              :current-page="itemsCurrentPage"
              @pagechanged="onItemsPageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Services Tab -->
    <div v-show="activeTab === 'services'">
      <div class="card card-custom">
        <div class="card-header border-0 py-4">
          <h4 class="card-title font-weight-bolder text-dark">
            <i class="fas fa-concierge-bell text-success mr-2"></i>
            Dialysis Services & Procedures
          </h4>
          <div class="card-toolbar">
            <button class="btn btn-primary btn-sm" @click="addService">
              <i class="fas fa-plus mr-2"></i>Add Service
            </button>
          </div>
        </div>
        <div class="card-body">
          <!-- Services Form -->
          <div class="form-group row">
            <label class="col-lg-3 col-form-label font-weight-bold">Select Service(s):</label>
            <div class="col-lg-6">
              <v-select
                :multiple="true"
                name="service"
                @search="onServiceSearch"
                v-model="servicesForm.selectedServices"
                label="name"
                :options="servicesOptions"
                :reduce="
                  (services) => ({
                    id: services.id,
                    price: services.price,
                    name: services.name,
                  })
                "
                placeholder="Search for dialysis services..."
              >
                <template #option="{ price, name }">
                  <span>{{ name }} - </span>
                  <strong> {{ price || '' }}</strong>
                </template>
              </v-select>
            </div>
          </div>

          <!-- Selected Services Display -->
          <div v-if="servicesForm.selectedServices.length > 0" class="mt-4">
            <h6 class="font-weight-bold mb-3">Selected Services:</h6>
            <div class="selected-services">
              <span
                v-for="(service, index) in servicesForm.selectedServices"
                :key="index"
                class="badge badge-primary mr-2 mb-2 p-2"
              >
                {{ service.name }} - ₦{{ service.price }}
                <i class="fas fa-times ml-2 cursor-pointer" @click="removeService(index)"></i>
              </span>
            </div>
          </div>

          <div class="text-right mt-4">
            <button
              class="btn btn-primary"
              @click="submitServices"
              :disabled="isSaving || !servicesForm.selectedServices.length"
              ref="kt_submitServices"
            >
              <i class="fas fa-spinner fa-spin mr-2" v-if="isSaving"></i>
              <i class="fas fa-save mr-2" v-else></i>
              {{ isSaving ? 'Saving...' : 'Submit Services' }}
            </button>
          </div>

          <!-- Ordered Services Display -->
          <div v-if="orderedServices.length > 0" class="mt-5">
            <h5 class="font-weight-bold mb-3">
              <i class="fas fa-list-alt text-success mr-2"></i>
              Ordered Services
            </h5>
            <services-table :services="orderedServices" />
            <pagination
              v-if="orderedServices?.length"
              :total-pages="servicesPages"
              :total="totalOrderedServices"
              :per-page="servicesPerPage"
              :current-page="servicesCurrentPage"
              @pagechanged="onServicesPageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import vSelect from 'vue-select';
import { debounce, parseJwt } from '@/common/common';
import ErrorBanner from '@/view/components/util/ErrorBanner.vue';
import AdditionalItemsTable from '@/view/components/table/AdditionalItemsTable.vue';
import ServicesTable from '@/view/components/table/ServicesTable.vue';
import Pagination from '@/utils/Pagination.vue';
import EndVisitButton from '@/view/pages/consultation/components/endVisit/EndVisitButton.vue';

export default {
  name: 'DialysisConsultation',
  components: {
    EndVisitButton,
    vSelect,
    ErrorBanner,
    AdditionalItemsTable,
    ServicesTable,
    Pagination,
  },
  data() {
    return {
      activeTab: 'overview',
      currentUser: parseJwt(localStorage.getItem('user_token')),

      // Patient and visit data
      patientInfo: {},
      visitInfo: {},
      dialysisInfo: {
        status: 'SCHEDULED',
        planned_duration_minutes: 240,
        dialysis_type: 'HEMODIALYSIS',
      },

      // Treatment tracking
      currentDuration: 0,
      treatmentStartTime: null,
      treatmentTimer: null,

      // Dialysis details form
      isEditingDialysis: false,
      dialysisForm: {
        dialysis_type: 'HEMODIALYSIS',
        planned_duration_minutes: 240,
        blood_flow_rate: 300,
        machine_number: '',
        bed_number: '',
        clinical_notes: '',
      },

      // Assessment form
      isEditingAssessment: false,
      assessmentInfo: {
        date_assessment: null,
        blood_flow_rate: null,
        pulse: null,
        temperature: null,
        oxygen_saturation: null,
        weight: null,
        blood_pressure: '',
        clinical_notes: '',
        icd10_diagnosis: '',
        treatment_plan: '',
      },
      assessmentForm: {
        // Patient Medical Information
        hiv_status: '',
        hbsag_status: '',
        blood_group: '',

        // Weight Management
        current_weight: null,
        dry_weight: null,
        previous_post_dialysis_weight: null,
        required_weight_loss: null,

        // Machine Parameters
        machine_type: '',
        dialyser_type: '',
        concentration_type: '',
        access_route: '',

        // Technical Parameters
        blood_flow_rate: null,
        ultrafiltration_rate: null,
        tmp: null,
        clothing_time: null,

        // Medications & Treatments
        heparin_units: null,
        infusion_drugs: '',
        blood_transfusion: '',

        // ICD10 Diagnoses
        selectedDiagnosis: null,
        icd10_diagnoses: [],
        diagnoses: [],

        // Clinical Assessment
        per_dialysis_assessment: '',
        treatment_plan: '',
        clinical_notes: '',
      },

      // Vital Signs Form
      showVitalsForm: false,
      vitalsForm: {
        time: '',
        blood_pressure: '',
        pulse: null,
        temperature: null,
        oxygen_saturation: null,
        weight: null,
        blood_flow_rate: null,
        ultrafiltration_rate: null,
        ultrafiltration_volume: null,
        ap: '',
        venous_pressure: null,
        ivf: null,
        hep_hr: null,
        remarks: '',
      },

      // Vital Signs History
      vitalsHistory: [],
      expandedVitals: {},

      // Notes Form
      showNoteForm: false,
      noteForm: {
        type: 'clinical',
        title: '',
        content: '',
        is_urgent: false,
        requires_followup: false,
      },

      // Notes History
      notesHistory: [],

      // Treatments History
      treatmentsHistory: [],

      // Loading states
      isLoading: false,
      isSaving: false,
      machines: ['Fresenius', 'Nipro', 'Nikkiso'],

      // Items form data
      itemsForm: {
        items: [
          {
            item: '',
            quantity: 1,
          },
        ],
        inventory_id: null,
        showError: false,
        errorMessage: '',
        errorList: [],
      },

      // Services form data
      servicesForm: {
        selectedServices: [],
        isMultiple: true,
      },

      // Ordered items and services display
      orderedItems: [],
      orderedServices: [],
      itemsCurrentPage: 1,
      servicesCurrentPage: 1,
      itemsPerPage: 10,
      servicesPerPage: 10,
    };
  },

  computed: {
    treatmentProgress() {
      if (!this.dialysisInfo.planned_duration_minutes) return 0;
      return (this.currentDuration / this.dialysisInfo.planned_duration_minutes) * 100;
    },

    icd10Diagnoses() {
      return this.$store.state.diagnosis.icd10Diseases || [];
    },

    // Items options from store
    itemsOptions() {
      return (
        this.$store.state.inventory.items?.map((item) => ({
          name: item?.drug?.name,
          id: item?.drug?.id,
          price: item.selling_price,
          drug_type: item.drug_type,
          unit_id: item?.unit_id,
          drug_form: item?.drug_form,
          quantity_remaining: item?.quantity_remaining,
        })) || []
      );
    },

    // Services options from store
    servicesOptions() {
      return this.$store.state.model.services || [];
    },

    // Inventories for items
    inventories() {
      return this.$store.state.inventory.inventories || [];
    },

    // Pagination for ordered items
    totalOrderedItems() {
      return this.$store.state.order.totalAdditionalItemsOrders || 0;
    },
    itemsPages() {
      return this.$store.state.order.additionalItemsOrdersPages;
    },

    // Pagination for ordered services
    totalOrderedServices() {
      return this.$store.state.order.totalServices || 0;
    },
    servicesPages() {
      return this.$store.state.order.servicePages;
    },
  },

  watch: {
    vitalsHistory: {
      handler(newVitals) {
        if (newVitals && newVitals.length > 0) {
          // Initialize expandedVitals state for each vital
          this.expandedVitals = {};
          newVitals.forEach((vital) => {
            this.expandedVitals[vital.id] = false;
          });
        }
      },
      immediate: true,
      deep: true,
    },
  },

  methods: {
    dayjs,
    setActiveTab(tab) {
      this.activeTab = tab;

      // Reset expanded vitals when switching to vitals tab
      if (tab === 'vitals' && this.vitalsHistory.length > 0) {
        this.expandedVitals = {};
        this.vitalsHistory.forEach((vital) => {
          this.expandedVitals[vital.id] = false;
        });
      }
    },

    // Data loading methods
    async loadConsultationData() {
      try {
        this.isLoading = true;
        const visitId = this.$route.params.id;

        // Load comprehensive dialysis visit data using new Vuex action
        const comprehensiveData = await this.$store.dispatch(
          'dialysis/getComprehensiveDialysisVisit',
          visitId
        );

        // Extract data from comprehensive response
        this.visitInfo = comprehensiveData.visit || {};
        this.patientInfo = this.visitInfo.patient || {};

        // Load dialysis assessment data
        if (comprehensiveData.assessment) {
          this.assessmentForm = { ...comprehensiveData.assessment };
        }

        // Load dialysis vitals data
        if (comprehensiveData.vitals) {
          this.vitalsHistory = comprehensiveData.vitals;
          // Initialize expandedVitals state for each vital
          this.expandedVitals = {};
          this.vitalsHistory.forEach((vital) => {
            this.expandedVitals[vital.id] = false;
          });
        }

        console.log('vitalsHistory', this.expandedVitals);

        // Load dialysis notes data
        if (comprehensiveData.notes) {
          this.notesHistory = comprehensiveData.notes;
        }

        // Load dialysis treatments data
        if (comprehensiveData.treatments) {
          this.treatmentsHistory = comprehensiveData.treatments;
        }

        this.dialysisForm = {
          dialysis_type: comprehensiveData.visit.dialysis_type,
          planned_duration_minutes: comprehensiveData.visit.planned_duration_minutes || 240,
          blood_flow_rate: comprehensiveData.visit.blood_flow_rate || 300,
          machine_number: comprehensiveData.visit.machine_number || '',
          bed_number: comprehensiveData.visit.bed_number || '',
          clinical_notes: comprehensiveData.visit.clinical_notes || '',
        };

        // Populate dialysis form from comprehensive data
        if (comprehensiveData.treatments && comprehensiveData.treatments.length > 0) {
          const latestTreatment = comprehensiveData.treatments[0];
          this.dialysisInfo = {
            status: latestTreatment.treatment_status || 'SCHEDULED',
            planned_duration_minutes: latestTreatment.planned_duration_minutes || 240,
            dialysis_type: latestTreatment.dialysis_type || 'HEMODIALYSIS',
            actual_start_date: latestTreatment.actual_start_date,
            actual_end_date: latestTreatment.actual_end_date,
          };
        }
      } catch (error) {
        console.error('Failed to load consultation data:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // Treatment management methods
    async startTreatment() {
      try {
        const visitId = this.$route.params.id;
        const staffId = this.currentUser?.sub || 1;

        await this.$store.dispatch('dialysis/startDialysisTreatment', {
          visitId,
          started_by: staffId,
          treatment_data: {
            actual_start_date: new Date(),
            treatment_status: 'IN_PROGRESS',
          },
        });

        this.dialysisInfo.status = 'IN_PROGRESS';
        this.treatmentStartTime = new Date();
        this.startTreatmentTimer();

        this.$notify({
          group: 'foo',
          title: 'Treatment Started',
          text: 'Dialysis treatment session has begun',
          type: 'success',
        });
      } catch (error) {
        console.error('Failed to start treatment:', error);
      }
    },

    async pauseTreatment() {
      try {
        const visitId = this.$route.params.id;

        await this.$store.dispatch('dialysis/updateDialysisTreatment', {
          visitId,
          treatmentId: this.visitInfo.treatment_id,
          updateData: {
            treatment_status: 'PAUSED',
            current_duration: this.currentDuration,
          },
        });

        this.dialysisInfo.status = 'PAUSED';
        this.stopTreatmentTimer();

        this.$notify({
          group: 'foo',
          title: 'Treatment Paused',
          text: 'Dialysis treatment has been paused',
          type: 'warning',
        });
      } catch (error) {
        console.error('Failed to pause treatment:', error);
      }
    },

    async resumeTreatment() {
      try {
        const visitId = this.$route.params.id;

        await this.$store.dispatch('dialysis/updateDialysisTreatment', {
          visitId,
          treatmentId: this.visitInfo.treatment_id,
          updateData: {
            treatment_status: 'IN_PROGRESS',
            current_duration: this.currentDuration,
          },
        });

        this.dialysisInfo.status = 'IN_PROGRESS';
        this.startTreatmentTimer();

        this.$notify({
          group: 'foo',
          title: 'Treatment Resumed',
          text: 'Dialysis treatment has resumed',
          type: 'success',
        });
      } catch (error) {
        console.error('Failed to resume treatment:', error);
      }
    },

    async completeTreatment() {
      try {
        const visitId = this.$route.params.id;
        const staffId = this.currentUser?.sub;

        await this.$store.dispatch('dialysis/completeDialysisTreatment', {
          visitId,
          completed_by: staffId,
          treatment_data: {
            actual_end_date: new Date(),
            treatment_status: 'COMPLETED',
            current_duration: this.currentDuration,
          },
        });

        this.dialysisInfo.status = 'COMPLETED';
        this.dialysisInfo.actual_end_date = new Date();
        this.stopTreatmentTimer();

        this.$notify({
          group: 'foo',
          title: 'Treatment Completed',
          text: 'Dialysis treatment session completed successfully',
          type: 'success',
        });
      } catch (error) {
        console.error('Failed to complete treatment:', error);
      }
    },

    startTreatmentTimer() {
      this.treatmentTimer = setInterval(() => {
        if (this.treatmentStartTime) {
          const now = new Date();
          this.currentDuration = Math.floor((now - this.treatmentStartTime) / 1000 / 60); // minutes
        }
      }, 1000);
    },

    stopTreatmentTimer() {
      if (this.treatmentTimer) {
        clearInterval(this.treatmentTimer);
        this.treatmentTimer = null;
      }
    },

    // Dialysis details management methods
    editDialysisDetails() {
      this.isEditingDialysis = true;
    },

    saveDialysisDetails() {
      this.isEditingDialysis = false;
      this.$store.dispatch('dialysis/updateDialysisVisit', {
        id: this.$route.params.id,
        dialysis_info: this.dialysisForm,
      });
    },

    cancelDialysisEdit() {
      this.isEditingDialysis = false;
      this.loadConsultationData(); // Reload original data
      this.$notify({
        group: 'foo',
        title: 'Edit Cancelled',
        text: 'Dialysis parameters edit has been cancelled.',
        type: 'info',
      });
    },

    // Assessment management methods
    editAssessment() {
      this.isEditingAssessment = true;
    },

    async saveAssessment() {
      try {
        this.isSaving = true;
        const visitId = this.$route.params.id;

        if (this.visitInfo.assessment_id) {
          // Update existing assessment
          await this.$store.dispatch('dialysis/updateDialysisAssessment', {
            visitId,
            assessmentId: this.visitInfo.assessment_id,
            updateData: this.assessmentForm,
          });
        } else {
          // Create new assessment
          await this.$store.dispatch('dialysis/createDialysisAssessment', {
            visitId,
            assessmentData: this.assessmentForm,
          });
        }

        this.isEditingAssessment = false;
        this.$notify({
          group: 'foo',
          title: 'Assessment Saved',
          text: 'Dialysis assessment has been saved successfully.',
          type: 'success',
        });

        // Reload data to get updated assessment
        await this.loadConsultationData();
      } catch (error) {
        console.error('Failed to save assessment:', error);
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Failed to save assessment: ' + error.message,
          type: 'error',
        });
      } finally {
        this.isSaving = false;
      }
    },

    cancelAssessmentEdit() {
      this.isEditingAssessment = false;
      this.loadConsultationData(); // Reload original data
      this.$notify({
        group: 'foo',
        title: 'Edit Cancelled',
        text: 'Dialysis assessment edit has been cancelled.',
        type: 'info',
      });
    },

    // Vital Signs Management
    async saveVitalSigns() {
      try {
        this.isSaving = true;
        const visitId = this.$route.params.id;

        await this.$store.dispatch('dialysis/createDialysisVitals', {
          visitId,
          vitalsData: this.vitalsForm,
        });

        // Reset form and hide
        this.showVitalsForm = false;
        this.vitalsForm = {
          time: '',
          blood_pressure: '',
          pulse: null,
          temperature: null,
          oxygen_saturation: null,
          weight: null,
          blood_flow_rate: null,
          ultrafiltration_rate: null,
          ultrafiltration_volume: null,
          ap: '',
          venous_pressure: null,
          ivf: null,
          hep_hr: null,
          remarks: '',
        };

        this.$notify({
          group: 'foo',
          title: 'Vitals Saved',
          text: 'Vital signs have been recorded successfully.',
          type: 'success',
        });

        // Reload data to get updated vitals
        await this.loadConsultationData();
      } catch (error) {
        console.error('Failed to save vitals:', error);
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Failed to save vitals: ' + error.message,
          type: 'error',
        });
      } finally {
        this.isSaving = false;
      }
    },

    // Notes Management
    async saveNote() {
      try {
        this.isSaving = true;
        const visitId = this.$route.params.id;

        await this.$store.dispatch('dialysis/createDialysisNotes', {
          visitId,
          notesData: this.noteForm,
        });

        // Reset form and hide
        this.showNoteForm = false;
        this.noteForm = {
          type: 'clinical',
          title: '',
          content: '',
          is_urgent: false,
          requires_followup: false,
        };

        this.$notify({
          group: 'foo',
          title: 'Note Saved',
          text: 'Clinical note has been saved successfully.',
          type: 'success',
        });

        // Reload data to get updated notes
        await this.loadConsultationData();
      } catch (error) {
        console.error('Failed to save note:', error);
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Failed to save note: ' + error.message,
          type: 'error',
        });
      } finally {
        this.isSaving = false;
      }
    },

    searchICD10Diagnosis(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.search(loading, search, this);
      }
    },

    search: debounce((loading, search, vm) => {
      vm.$store
        .dispatch('diagnosis/fetchICD10Diagnosis', {
          currentPage: 1,
          itemsPerPage: 50,
          search,
        })
        .then(() => loading(false));
    }, 500),

    // ICD10 Diagnosis Management
    // async searchICD10Diagnosis(search, loading) {
    //   if (search.length > 2) {
    //     loading(true);
    //     try {
    //       await this.$store.dispatch('dialysis/searchICD10Diagnoses', {
    //         searchTerm: search,
    //         limit: 20,
    //       });
    //       loading(false);
    //     } catch (error) {
    //       console.error('Failed to search ICD10 diagnoses:', error);
    //       loading(false);
    //     }
    //   }
    // },

    onDiagnosisSelect(diagnosis) {
      if (diagnosis && !this.assessmentForm.diagnoses?.find((d) => d.id === diagnosis.id)) {
        this.assessmentForm.diagnoses.push({
          id: diagnosis.id,
          code: diagnosis.code,
          diagnosis: diagnosis.diagnosis,
        });
        this.assessmentForm.selectedDiagnosis = null; // Reset selection
      }
    },

    removeDiagnosis(index) {
      this.assessmentForm.icd10_diagnoses.splice(index, 1);
    },

    // Utility methods
    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-NG');
    },

    formatDateTime(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString('en-NG');
    },

    formatDuration(minutes) {
      if (!minutes) return 'N/A';
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    },

    formatTime(timestamp) {
      return dayjs(timestamp).format('HH:mm:ss');
    },

    addNote() {
      this.showNoteForm = true;
      this.noteForm = {
        type: 'clinical',
        title: '',
        content: '',
        is_urgent: false,
        requires_followup: false,
      };
      this.$notify({
        group: 'foo',
        title: 'Note Form Opened',
        text: 'Please enter the clinical note.',
        type: 'info',
      });
    },

    cancelNoteForm() {
      this.showNoteForm = false;
      this.$notify({
        group: 'foo',
        title: 'Note Form Cancelled',
        text: 'Clinical note recording has been cancelled.',
        type: 'info',
      });
    },

    // Note editing methods
    editNote(note) {
      // Create a copy of the note data for editing
      note.editData = {
        type: note.type,
        content: note.content,
      };
      note.isEditing = true;
    },

    async saveNoteEdit(note) {
      try {
        this.isSaving = true;
        const visitId = this.$route.params.id;

        await this.$store.dispatch('dialysis/updateDialysisNotes', {
          visitId,
          noteId: note.id,
          updateData: note.editData,
        });

        // Update the note with new data
        note.type = note.editData.type;
        note.content = note.editData.content;
        note.isEditing = false;
        delete note.editData;

        this.$notify({
          group: 'foo',
          title: 'Note Updated',
          text: 'Clinical note has been updated successfully.',
          type: 'success',
        });
      } catch (error) {
        console.error('Failed to update note:', error);
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Failed to update note: ' + error.message,
          type: 'error',
        });
      } finally {
        this.isSaving = false;
      }
    },

    cancelNoteEdit(note) {
      // Cancel editing and restore original data
      note.isEditing = false;
      delete note.editData;
    },

    getNoteTypeClass(type) {
      const classes = {
        clinical: 'label label-lg label-light-primary label-inline',
        treatment: 'label label-lg label-light-success label-inline',
        nursing: 'label label-lg label-light-info label-inline',
        medication: 'label label-lg label-light-warning label-inline',
        other: 'label label-lg label-light-dark label-inline',
      };
      return classes[type] || 'label label-lg label-light-dark label-inline';
    },

    getPriorityClass(priority) {
      const classes = {
        Routine: 'label label-lg label-light-success label-inline',
        Urgent: 'label label-lg label-light-warning label-inline',
        Emergency: 'label label-lg label-light-danger label-inline',
      };
      return classes[priority] || 'label label-lg label-light-dark label-inline';
    },

    getStatusClass(status) {
      const classes = {
        Ongoing: 'label label-lg label-light-warning label-inline',
        Ended: 'label label-lg label-light-success label-inline',
      };
      return classes[status] || 'label label-lg label-light-dark label-inline';
    },

    getDialysisStatusClass(status) {
      const classes = {
        SCHEDULED: 'label label-lg label-light-primary label-inline',
        IN_PROGRESS: 'label label-lg label-light-warning label-inline',
        PAUSED: 'label label-lg label-light-info label-inline',
        COMPLETED: 'label label-lg label-light-success label-inline',
        CANCELLED: 'label label-lg label-light-danger label-inline',
      };
      return classes[status] || 'label label-lg label-light-dark label-inline';
    },

    addVitalSigns() {
      this.showVitalsForm = true;
      this.vitalsForm = {
        time: new Date().toTimeString().slice(0, 5), // Set current time
        blood_pressure: '',
        pulse: null,
        temperature: null,
        oxygen_saturation: null,
        weight: null,
        blood_flow_rate: null,
        ultrafiltration_rate: null,
        ultrafiltration_volume: null,
        ap: '',
        venous_pressure: null,
        ivf: null,
        hep_hr: null,
        remarks: '',
      };
      this.$notify({
        group: 'foo',
        title: 'Vitals Form Opened',
        text: "Please enter the patient's vital signs.",
        type: 'info',
      });
    },

    cancelVitalsForm() {
      this.showVitalsForm = false;
      this.$notify({
        group: 'foo',
        title: 'Vitals Form Cancelled',
        text: 'Vital signs recording has been cancelled.',
        type: 'info',
      });
    },

    // New methods for expanded vitals
    toggleVitalExpansion(vitalId) {
      // Create a new object to ensure Vue detects the change
      const newExpandedVitals = { ...this.expandedVitals };
      newExpandedVitals[vitalId] = !newExpandedVitals[vitalId];
      this.expandedVitals = newExpandedVitals;

      console.log('expandedVitals updated:', this.expandedVitals);
    },

    // Items management methods
    addNewItem() {
      this.itemsForm.items.push({
        item: '',
        quantity: 1,
      });
    },

    removeItem(index) {
      this.itemsForm.items.splice(index, 1);
    },

    onItemSearch(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.searchItems(loading, search, this);
      }
    },

    searchItems: debounce((loading, search, vm) => {
      const inventory = vm.getInventoryId();
      vm.$store
        .dispatch('inventory/fetchInventoryItems', {
          search,
          inventory,
          //filter: { drug_form: 'Consumable' },
        })
        .then(() => loading(false));
    }, 500),

    getInventoryId() {
      // For dialysis, use general store or create dialysis-specific inventory
      const generalInventory = this.inventories.find((inventory) =>
        inventory.name.toLowerCase().includes('cash')
      );
      return generalInventory?.id || this.inventories[0]?.id;
    },

    async submitItems() {
      this.itemsForm.showError = false;

      // Validate items
      if (this.itemsForm.items.some(({ item }) => !item)) {
        return this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Please select an item for all entries',
          type: 'error',
        });
      }

      // Check quantity validation
      const invalidItems = this.itemsForm.items.filter(
        (item) =>
          item.item.quantity_remaining === 0 || +item.quantity > +item.item.quantity_remaining
      );

      if (invalidItems?.length) {
        this.itemsForm.showError = true;
        this.itemsForm.errorMessage = `The following items are currently low in quantity in the dispensary`;
        this.itemsForm.errorList = invalidItems.map((item) => {
          return `${item.item.name}; Quantity remaining: ${item.item.quantity_remaining}`;
        });
        return;
      }

      try {
        this.isSaving = true;
        const visitId = this.$route.params.id;

        const data = this.itemsForm.items.map(({ item, quantity }) => ({
          ...item,
          quantity_to_dispense: quantity,
          inventory_id: this.getInventoryId(),
          source: 'Consultation',
        }));

        await this.$store.dispatch('order/orderAdditionalItems', { data, id: visitId });

        this.$notify({
          group: 'foo',
          title: 'Items Ordered',
          text: 'Dialysis items have been ordered successfully.',
          type: 'success',
        });

        // Reset form
        this.itemsForm.items = [{ item: '', quantity: 1 }];
        this.itemsForm.showError = false;
        // Refresh ordered items display
        this.fetchOrderedItems();
      } catch (error) {
        console.error('Failed to submit items:', error);
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Failed to submit items: ' + error.message,
          type: 'error',
        });
      } finally {
        this.isSaving = false;
      }
    },

    // Services management methods
    addService() {
      // This method is for UI consistency, actual service selection is handled by v-select
      this.$notify({
        group: 'foo',
        title: 'Add Service',
        text: 'Use the search box above to select services.',
        type: 'info',
      });
    },

    removeService(index) {
      this.servicesForm.selectedServices.splice(index, 1);
    },

    onServiceSearch(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.searchServices(loading, search, this);
      }
    },

    searchServices: debounce((loading, search, vm) => {
      vm.$store
        .dispatch('model/fetchServices', {
          currentPage: 1,
          itemsPerPage: 50,
          search,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    async submitServices() {
      if (!this.servicesForm.selectedServices.length) {
        return this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Please select at least one service',
          type: 'error',
        });
      }

      try {
        this.isSaving = true;
        const visitId = this.$route.params.id;

        const services = this.servicesForm.selectedServices.map((service) => ({
          service_id: service.id,
          service_type: 'Cash',
          is_urgent: false,
          price: service.price,
          source: 'Consultation',
        }));

        await this.$store.dispatch('order/orderAdditionalService', {
          services,
          id: visitId,
        });

        this.$notify({
          group: 'foo',
          title: 'Services Ordered',
          text: 'Dialysis services have been ordered successfully.',
          type: 'success',
        });

        // Reset form
        this.servicesForm.selectedServices = [];
        // Refresh ordered services display
        this.fetchOrderedServices();
      } catch (error) {
        console.error('Failed to submit services:', error);
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Failed to submit services: ' + error.message,
          type: 'error',
        });
      } finally {
        this.isSaving = false;
      }
    },

    // Methods for displaying ordered items and services
    async fetchOrderedItems() {
      try {
        const visitId = this.$route.params.id;
        const filter = { visit_id: visitId };

        await this.$store.dispatch('order/fetchPrescribedAdditionalItems', {
          currentPage: this.itemsCurrentPage,
          itemsPerPage: this.itemsPerPage,
          filter,
        });

        this.orderedItems = this.$store.state.order.additional_items_orders || [];
      } catch (error) {
        console.error('Failed to fetch ordered items:', error);
      }
    },

    async fetchOrderedServices() {
      try {
        const visitId = this.$route.params.id;
        const filter = { visit_id: visitId };

        await this.$store.dispatch('order/fetchPrescribedServicesPerVisit', {
          currentPage: this.servicesCurrentPage,
          itemsPerPage: this.servicesPerPage,
          filter,
        });

        this.orderedServices = this.$store.state.order.service_orders || [];
      } catch (error) {
        console.error('Failed to fetch ordered services:', error);
      }
    },

    onItemsPageChange(page) {
      this.itemsCurrentPage = page;
      this.fetchOrderedItems();
    },

    onServicesPageChange(page) {
      this.servicesCurrentPage = page;
      this.fetchOrderedServices();
    },
  },

  created() {
    this.loadConsultationData();
    // Initialize inventories for items
    this.$store.dispatch('inventory/fetchInventories');
    // Initialize services
    this.$store.dispatch('model/fetchServices', {
      currentPage: 1,
      itemsPerPage: 50,
    });

    this.$store.dispatch('inventory/fetchInventoryItems', {
      currentPage: 1,
      itemsPerPage: 50,
      inventory: 1,
    });
    // Fetch ordered items and services
    this.fetchOrderedItems();
    this.fetchOrderedServices();
  },

  beforeDestroy() {
    this.stopTreatmentTimer();
  },
};
</script>

<style scoped>
.dialysis-consultation {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 1.5rem;
}

.tab-content {
  margin-top: 1rem;
}

.tab-pane {
  animation: fadeIn 0.3s ease-in-out;
}

.btn-group .btn.active {
  background-color: #3699ff;
  border-color: #3699ff;
  color: white;
}

.form-control-static {
  padding: 0.375rem 0;
  margin-bottom: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: transparent;
  border: solid transparent;
  border-width: 1px 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.label {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.375rem;
}

.label-light-primary {
  background-color: #e1f0ff;
  color: #3699ff;
}

.label-light-warning {
  background-color: #fff4de;
  color: #ffc107;
}

.label-light-success {
  background-color: #e8fff3;
  color: #198754;
}

.label-light-danger {
  background-color: #ffe8e8;
  color: #dc3545;
}

.label-light-info {
  background-color: #e1f7ff;
  color: #17a2b8;
}

.label-light-dark {
  background-color: #f1f2f6;
  color: #6c757d;
}

/* New styles for notes timeline */
.notes-timeline {
  position: relative;
  padding-left: 20px; /* Indent for timeline */
}

.note-item {
  position: relative;
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
  border: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.note-item::before {
  content: '';
  position: absolute;
  left: -10px; /* Adjust position to align with timeline */
  top: 10px;
  width: 10px;
  height: 10px;
  background-color: #3699ff; /* Timeline dot color */
  border-radius: 50%;
  border: 2px solid white;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9em;
  color: #555;
}

.note-type {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
}

.note-time {
  font-weight: bold;
  color: #666;
}

.note-content {
  font-size: 1em;
  line-height: 1.6;
  color: #333;
  margin-bottom: 8px;
}

.note-author {
  font-size: 0.8em;
  color: #888;
  text-align: right;
}

/* Note editing styles */
.note-actions {
  display: flex;
  gap: 5px;
}

.note-content-editable {
  margin: 15px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
}

.note-content-editable .form-group {
  margin-bottom: 15px;
}

.note-content-editable .form-group:last-child {
  margin-bottom: 0;
}

.note-content-editable .form-label {
  font-size: 0.9em;
  color: #495057;
  margin-bottom: 5px;
}

.note-content-editable .form-control {
  font-size: 0.9em;
}

/* Vitals table styles */
.vitals-table {
  font-size: 0.85em;
}

.vitals-table th {
  white-space: nowrap;
  padding: 8px 4px;
  font-size: 0.8em;
  background-color: #f8f9fa;
}

.vitals-table td {
  padding: 6px 4px;
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vitals-table .remarks-cell {
  max-width: 200px;
  white-space: normal;
  word-wrap: break-word;
}

/* Assessment tab styles */
.diagnosis-tags .badge {
  font-size: 0.85em;
  padding: 8px 12px;
  border-radius: 20px;
  background-color: #3699ff;
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(54, 153, 255, 0.3);
}

.diagnosis-tags .badge i {
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.diagnosis-tags .badge i:hover {
  opacity: 1;
}

.assessment-section {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.assessment-section h6 {
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

/* New styles for compact vitals cards */
.vitals-cards {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Space between cards */
}

.vital-card {
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.vital-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.vital-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.vital-time {
  font-weight: bold;
  color: #333;
  font-size: 0.9em;
}

.vital-primary {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background-color: #fdfdfd;
  border-bottom: 1px solid #eee;
}

.vital-item {
  display: flex;
  align-items: center;
  font-size: 0.9em;
  color: #555;
}

.vital-label {
  font-weight: bold;
  margin-right: 5px;
  color: #666;
}

.vital-value {
  font-weight: 600;
  color: #333;
}

.vital-expand {
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.vital-expand i {
  color: #666;
  transition: transform 0.3s ease;
}

.vital-card.expanded .vital-expand i {
  transform: rotate(180deg);
}

.vital-details {
  padding: 15px;
  background-color: #fdfdfd;
  border-top: 1px solid #eee;
  transition: all 0.3s ease;
  /* Remove display: none/block since we're using v-show */
}

.vital-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.vital-section {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 10px 15px;
  margin-bottom: 10px;
}

.vital-section-title {
  font-size: 0.9em;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.vital-section-title i {
  margin-right: 8px;
  color: #555;
}

.vital-details-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.vital-detail-item {
  font-size: 0.85em;
  color: #666;
}

.vital-detail-item .detail-label {
  font-weight: bold;
  margin-right: 5px;
  color: #555;
}

.vital-remarks {
  font-size: 0.85em;
  color: #444;
  line-height: 1.4;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}

/* Items and Services tabs styles */
.selected-services {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-services .badge {
  font-size: 0.85em;
  padding: 8px 12px;
  border-radius: 20px;
  background-color: #3699ff;
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(54, 153, 255, 0.3);
}

.selected-services .badge i {
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.selected-services .badge i:hover {
  opacity: 1;
}

/* Items form styling */
.items-form .form-group {
  margin-bottom: 1rem;
}

.items-form .btn {
  margin-left: 0.5rem;
}

/* Services form styling */
.services-form .form-group {
  margin-bottom: 1rem;
}
</style>
